---
name: hyperframes-typegpu
description: >
  HyperFrames 的 TypeGPU 与原生 WebGPU adapter 模式。在用 TypeGPU、原生 WebGPU、WGSL fragment shader、compute 管线、液态玻璃效果、粒子系统创建 GPU 渲染的 composition，或任何由 navigator.gpu 驱动并响应 HyperFrames hf-seek 事件的 canvas 图层时使用。
---

# HyperFrames 中的 TypeGPU / WebGPU

HyperFrames 通过它的 `typegpu` runtime adapter 支持 TypeGPU 和原生 WebGPU。这个 adapter 并不接管你的管线。它发布 HyperFrames 时间并派发一个 seek 事件，让你的 composition 能渲染出精确的那一个 GPU 帧。

## 渲染环境前提（WebGPU + html-in-canvas）

渲染引擎会自动把 `--enable-unsafe-webgpu` 和 `--enable-features=CanvasDrawElement` 加进它的 Chrome 启动参数。原版 Chromium 和自带的 headless-shell **不**支持同时使用 WebGPU + `drawElementImage` —— 而这正是液态玻璃 block（`ios26-liquid-glass`、`macos-tahoe-liquid-glass`、`liquid-glass-*`、`vfx-liquid-glass`）所需要的组合。对于这些 block，在运行 `npx hyperframes render` / `preview` 之前，把 `PRODUCER_HEADLESS_SHELL_PATH` 设为浏览器可执行文件的路径，让引擎改用 Brave（或 Chrome canary）。不带 HTML 纹理的普通 TypeGPU 图层在 headless-shell 里就能工作 —— 只有 html-in-canvas + WebGPU 的组合才需要这个覆盖设置。

## 契约

- 异步初始化 WebGPU（`await navigator.gpu.requestAdapter()`），但所有 GSAP tween 都要**同步**注册 —— 在任何 `await` 之前。HyperFrames 播放器在页面加载时会立即读取 timeline。
- 依据 HyperFrames 时间来渲染，而不是 `performance.now()`。
- 监听 `hf-seek` 事件，并精确地在那个时间点重新渲染。
- 要防范 WebGPU 不可用的环境 —— adapter 不会替你检查。
- 如果 composition 没有 WebGPU 就无法渲染，就在它的 composition 根节点上加 `data-requires-webgpu`。这样当自动检测选择了软件渲染时，本地抓取命令会报告一个可操作的错误，而不是抓取一个无 GPU 的兜底画面。要在没有 GPU 的主机上渲染它，设置 `PRODUCER_ALLOW_SOFTWARE_WEBGPU=true`：它会在 SwiftShader 上渲染，慢好几倍。
- 提交 GPU 工作之后，用 `e.detail.waitUntil(device.queue.onSubmittedWorkDone())` 同步注册队列完成。HyperFrames 会在截图和帧抓取之前等待已注册的工作完成。

adapter 在每次 seek 时设置 `window.__hfTypegpuTime`，并派发一个带 `{ time, waitUntil }` 的 `hf-seek` 事件。在 Studio 暂停期间，HyperFrames 可能会再次派发同一个时间，以保持 WebGPU swapchain 的呈现。请重新渲染那个精确的时间；不要推进模拟状态。

## 基本模式

```html
<canvas id="gpu-layer"></canvas>
<script>
  (async () => {
    if (!navigator.gpu) return;
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return;
    const device = await adapter.requestDevice();
    const canvas = document.getElementById("gpu-layer");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("webgpu");
    const fmt = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format: fmt, alphaMode: "opaque" });

    // Build your pipeline, buffers, bind groups...
    const timeUniform = new Float32Array([0]);
    const timeBuf = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    function render(t) {
      timeUniform[0] = t;
      device.queue.writeBuffer(timeBuf, 0, timeUniform);
      const enc = device.createCommandEncoder();
      const pass = enc.beginRenderPass({
        colorAttachments: [
          {
            view: ctx.getCurrentTexture().createView(),
            loadOp: "clear",
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            storeOp: "store",
          },
        ],
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
      device.queue.submit([enc.finish()]);
    }

    render(0);
    window.addEventListener("hf-seek", (e) => {
      render(e.detail.time);
      e.detail.waitUntil(device.queue.onSubmittedWorkDone());
    });
  })();
</script>
```

## Timeline 注册

驱动文字、字幕或 HTML 元素的 GSAP tween 必须**同步**注册 —— 在任何 `await` 之前：

```js
const tl = gsap.timeline({ paused: true });

// Caption tweens: synchronous, added before WebGPU init
gsap.set(".cap", { opacity: 0 });
tl.to("#cap-1", { opacity: 1, duration: 0.3 }, 1.0);
tl.to("#cap-1", { opacity: 0, duration: 0.2 }, 3.5);

window.__timelines["my-comp"] = tl;

// GPU-dependent tweens can go inside the async IIFE
(async () => {
  // ... WebGPU init ...
  const proxy = { value: 0 };
  tl.to(proxy, { value: 1, duration: 2, onUpdate: render }, 0.5);
})();
```

## 基于视频的效果（液态玻璃、扭曲）

把一个 `<video>` 用作 GPU 输入纹理：

```js
const videoEl = document.getElementById("aroll");

// Wait for video metadata before creating the texture
await new Promise((r) => {
  if (videoEl.readyState >= 1) r();
  else videoEl.addEventListener("loadedmetadata", r, { once: true });
});

// Create texture at the video's NATIVE resolution
const vw = videoEl.videoWidth,
  vh = videoEl.videoHeight;
const bgTex = device.createTexture({
  size: [vw, vh],
  format: "rgba8unorm",
  usage:
    GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
});

function render(t) {
  try {
    device.queue.copyExternalImageToTexture({ source: videoEl }, { texture: bgTex }, [vw, vh]);
  } catch (_) {
    /* frame not decoded yet */
  }
  // ... draw ...
}
```

**渲染模式注意事项：** headless Chrome 对 video 元素执行 `copyExternalImageToTexture` 可能会失败。生产渲染时，改为通过 FFmpeg 预先把关键帧提取为 PNG，再作为图像纹理加载。

## 通过降采样 pass 实现磨砂模糊

单 pass 的高斯核太弱，做不出玻璃般的磨砂模糊。使用两个 pass 的方案：

1. **Pass 1 —— 降采样：** 把全分辨率纹理渲染到一个小纹理上（1/6 分辨率）。降采样时的双线性过滤会自然地对像素取平均。
2. **Pass 2 —— 玻璃合成：** 磨砂内部从小纹理采样（双线性放大 = 重度的平滑模糊），清晰区域和色散折射则从全分辨率纹理采样。

这与 TypeGPU 的 `textureSampleBias` mip 层级方案效果一致，而无需生成 mipmap。

## 透明 Canvas 与不透明 Canvas

- **`alphaMode: 'opaque'`** —— GPU canvas 渲染整帧（视频 + 效果）。当 GPU 管线负责全部视觉内容时使用。
- **`alphaMode: 'premultiplied'`** —— GPU canvas 在 alpha = 0 处透明，让下方的 HTML 元素透出来。用于叠在普通 `<video>` 元素之上的 overlay（粒子、路径动画）。

## WGSL 全屏三角形

全屏效果的标准 vertex shader（不需要顶点缓冲）：

```wgsl
struct Vo { @builtin(position) pos: vec4f, @location(0) uv: vec2f }

@vertex fn vs(@builtin(vertex_index) vi: u32) -> Vo {
  let ps = array<vec2f, 3>(vec2f(-1., -1.), vec2f(3., -1.), vec2f(-1., 3.));
  let ts = array<vec2f, 3>(vec2f(0., 1.), vec2f(2., 1.), vec2f(0., -1.));
  return Vo(vec4f(ps[vi], 0., 1.), ts[vi]);
}
```

用 `pass.draw(3)` 绘制 —— 一个覆盖整个 viewport 的三角形。

## 圆角矩形 SDF（液态玻璃胶囊）

```wgsl
fn sdf_box(p: vec2f, half_size: vec2f, corner_radius: f32) -> f32 {
  let d = abs(p) - half_size + vec2f(corner_radius);
  return length(max(d, vec2f(0.))) + min(max(d.x, d.y), 0.) - corner_radius;
}
```

用它来为玻璃效果划分内部/环带/外部区域。负值表示在形状内部。

## 确定性渲染

- 不用 `Math.random()` —— 用带种子的 PRNG。
- 不要用自主运行的 `requestAnimationFrame` 模拟循环。响应 `hf-seek` 来渲染；暂停时的呈现心跳归 HyperFrames 管，它可能会重新呈现同一个时间。
- 不用 `performance.now()` 作为动画时间 —— 读取 `window.__hfTypegpuTime` 或 `e.detail.time`。
- 在事件监听器返回之前，用 `e.detail.waitUntil(device.queue.onSubmittedWorkDone())` 注册 GPU 完成。
