<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/adapters/html-in-canvas-patterns.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# HTML-in-Canvas 模式

HyperFrames 最强大的视觉能力。把**任意**实时 HTML/CSS 抓取为 GPU 纹理，然后通过 WebGL shader、Three.js 3D 场景或后期处理效果渲染出来 —— 60fps、像素级精确，支持每一项 CSS 特性。

**当某个段落节拍值得超越平面 GSAP 动画的电影化处理时，读这个文件。** 每支视频用在 1-3 个 hero 段落节拍上，而不是每个段落节拍都用。其余的可以用标准 GSAP —— 平面段落节拍与 HTML-in-Canvas 段落节拍之间的反差，**本身就是**视觉叙事的一部分。

---

## 核心样板代码（每个 HTML-in-Canvas composition 都一样）

每个 HTML-in-Canvas 效果都共享这个结构。学一次，就能改造成任何效果。

```html
<!-- 1. Source HTML — your content goes inside a layoutsubtree canvas -->
<canvas
  id="hic-source"
  layoutsubtree
  width="1920"
  height="1080"
  style="position:absolute;inset:0;opacity:0;"
>
  <div id="hic-content" style="width:1920px;height:1080px;">
    <!-- YOUR HTML CONTENT HERE — text, images, cards, dashboards, anything -->
  </div>
</canvas>

<!-- 2. Render target — the visible canvas that shows the effect -->
<canvas id="hic-output" width="1920" height="1080" style="position:absolute;inset:0;"></canvas>
```

```js
// 3. Feature detection — always check, always provide fallback
function isHiCSupported() {
  var tc = document.createElement("canvas");
  if (!("layoutSubtree" in tc)) return false;
  tc.setAttribute("layoutsubtree", "");
  var ctx = tc.getContext("2d");
  return ctx && typeof ctx.drawElementImage === "function";
}
var apiOk = isHiCSupported();

// 4. Capture function — call this every frame in onUpdate
var capCanvas = document.getElementById("hic-source");
var capCtx = capCanvas.getContext("2d");
function captureContent() {
  if (apiOk) {
    capCtx.drawElementImage(document.getElementById("hic-content"), 0, 0, 1920, 1080);
  }
}

// 5. Drive from GSAP timeline — capture + render every frame
tl.to(
  proxy,
  {
    /* your animation properties */
    duration: BEAT_DURATION,
    ease: "sine.inOut",
    onUpdate: function () {
      captureContent();
      // render your effect here (Three.js or WebGL2)
    },
  },
  0,
);
```

**兜底：** 当 `drawElementImage` 不可用时（不带 Chrome flag 的 preview），画一个纯色占位，或者用 Canvas 2D 文字。HyperFrames 渲染器会自动开启这个 flag —— 效果在最终视频里**一定**会生效。完整的兜底示例见 liquid-glass block。

---

## 效果目录

### 1. 带 Bloom 的 3D 旋转（Three.js）

**看起来像什么：** 内容漂浮在 3D 空间里，缓慢旋转，明亮的边缘周围带着电影感的辉光。就像一张产品截图陈列在一间黑暗的放映厅里。

**何时使用：** hero 产品展示、功能揭示、带高级感的 CTA。

**关键 Three.js 组件：** `PlaneGeometry` + `CanvasTexture` + `EffectComposer` + `UnrealBloomPass`

```js
// After the boilerplate above, add:
var scene3d = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, 1920 / 1080, 0.1, 100);
camera.position.set(0, 0, 4);

var renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("hic-output"),
  antialias: true,
  alpha: true,
});
renderer.setSize(1920, 1080);

var texture = new THREE.CanvasTexture(capCanvas);
var mesh = new THREE.Mesh(
  new THREE.PlaneGeometry(3.6, 2.2),
  new THREE.MeshBasicMaterial({ map: texture }),
);
scene3d.add(mesh);

// Post-processing: bloom for cinematic glow.
// EffectComposer / RenderPass / UnrealBloomPass are ES-module named imports
// (see the import block below) — they're NOT properties of THREE in modern
// versions. Three.js r150+ removed the UMD `examples/js/` globals.
var composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene3d, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(1920, 1080), 0.3, 0.4, 0.85));

var proxy = { rotY: -0.12, zoom: 4.2 };
tl.to(
  proxy,
  {
    rotY: 0.12,
    zoom: 3.6,
    duration: BEAT_DURATION,
    ease: "sine.inOut",
    onUpdate: function () {
      captureContent();
      texture.needsUpdate = true;
      mesh.rotation.y = proxy.rotY;
      camera.position.z = proxy.zoom;
      composer.render();
    },
  },
  0,
);
```

**通过 ESM 加载 Three.js 和后期处理（使用 `type="module"` 的 script）：**

```html
<script type="module">
  import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.2/+esm";
  import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/postprocessing/EffectComposer.js";
  import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/postprocessing/RenderPass.js";
  import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/postprocessing/ShaderPass.js";
  import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/postprocessing/UnrealBloomPass.js";
  // ... rest of composition code using these imports
</script>
```

`examples/js/` 路径在 Three.js r152 中被移除了。请配合 `three@0.181.2`（HyperFrames Three.js adapter 使用的版本）使用 `examples/jsm/`（ES 模块）。

---

### 2. 磁性光标扭曲（原生 WebGL2）

**看起来像什么：** 内容朝着一个移动的点扭曲、弯折，就像磁铁在拉扯像素。色差在扭曲处把 RGB 通道分离开。

**何时使用：** 需要交互感、带光标的产品演示、"看**这个**功能"的时刻。

**关键技术：** 带高斯扭曲 + 色彩分离的自定义 fragment shader。不需要 Three.js —— 只用原生 WebGL2。

```js
// WebGL2 setup
var gl = document.getElementById("hic-output").getContext("webgl2", {
  alpha: false,
  preserveDrawingBuffer: true,
});

// Vertex shader — full-screen quad
var VS = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Fragment shader — magnetic warp + chromatic aberration
var FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_tex;
uniform vec2 u_cursor;   // cursor position (0-1)
uniform float u_strength; // warp strength (0-1)

void main() {
  vec2 uv = v_uv;
  vec2 delta = uv - u_cursor;
  float dist = length(delta);
  float warp = u_strength * exp(-dist * dist * 8.0);
  vec2 warped = uv - delta * warp * 0.3;

  // Chromatic aberration at distortion site
  float aberration = warp * 0.008;
  float r = texture(u_tex, warped + vec2(aberration, 0.0)).r;
  float g = texture(u_tex, warped).g;
  float b = texture(u_tex, warped - vec2(aberration, 0.0)).b;
  fragColor = vec4(r, g, b, 1.0);
}`;

// Compile, link, setup quad geometry, upload texture...
// (See registry/blocks/vfx-magnetic/vfx-magnetic.html for complete implementation)

// Drive cursor position from GSAP
var proxy = { cx: 0.2, cy: 0.5, strength: 0.0 };
tl.to(
  proxy,
  {
    cx: 0.8,
    cy: 0.4,
    strength: 1.0,
    duration: BEAT_DURATION,
    ease: "power2.inOut",
    onUpdate: function () {
      captureContent();
      // Upload texture, set uniforms, draw
      gl.uniform2f(cursorLoc, proxy.cx, proxy.cy);
      gl.uniform1f(strengthLoc, proxy.strength);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  },
  0,
);
```

---

### 3. 碎裂 / 碎片爆炸（Three.js）

**看起来像什么：** 内容碎成几何碎片四散飞开，露出背后的东西。

**何时使用：** 戏剧性的转场、"挣脱束缚"的时刻、张力释放。

**关键技术：** 用 BufferGeometry 把源纹理细分成三角形网格碎片，然后用 GSAP 给每个碎片的位置/旋转做动画。

完整的 1156 行实现请研究 `registry/blocks/vfx-shatter/vfx-shatter.html`。核心思路：

```js
// 1. Capture content to texture (same boilerplate)
// Seeded PRNG for determinism — Math.random() is banned
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
var rng = mulberry32(42);

// 2. Create N triangle fragments from the texture
var fragments = [];
for (var i = 0; i < NUM_FRAGMENTS; i++) {
  var geom = new THREE.BufferGeometry();
  var mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ map: texture }));
  scene3d.add(mesh);
  fragments.push({ mesh: mesh, targetPos: randomExplosionVector(rng), delay: rng() * 0.5 });
}

// 3. Animate: first hold still, then EXPLODE
tl.to({}, { duration: holdTime }, 0);
fragments.forEach(function (frag) {
  tl.to(
    frag.mesh.position,
    {
      x: frag.targetPos.x,
      y: frag.targetPos.y,
      z: frag.targetPos.z,
      duration: 0.8,
      ease: "power3.in",
    },
    holdTime + frag.delay,
  );
  tl.to(
    frag.mesh.rotation,
    { x: rng() * 4, y: rng() * 4, duration: 0.8, ease: "power2.in" },
    holdTime + frag.delay,
  );
});
```

---

### 4. 液体 / 流体表面（Three.js）

**看起来像什么：** 内容漂浮在一个泛着涟漪的液体表面上方，带有实时的波浪动态。或者内容**本身就是**那个表面，像水一样起伏。

**何时使用：** 有机/高级的感觉、环境背景、"有生命的"产品展示。

**关键技术：** 细分的 PlaneGeometry，在 vertex shader 里用噪声函数驱动顶点位移。

1244 行的实现请研究 `registry/blocks/vfx-liquid-background/vfx-liquid-background.html`。核心思路：

```js
// Custom vertex shader with wave displacement
var vertexShader = `
  varying vec2 vUv;
  uniform float u_time;
  void main() {
    vUv = uv;
    vec3 pos = position;
    // Sine wave displacement
    pos.z += sin(pos.x * 3.0 + u_time * 2.0) * 0.15;
    pos.z += cos(pos.y * 2.5 + u_time * 1.5) * 0.1;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

var mesh = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 3, 64, 64), // heavily subdivided for smooth waves
  new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: `varying vec2 vUv; uniform sampler2D u_tex;
      void main() { gl_FragColor = texture2D(u_tex, vUv); }`,
    uniforms: {
      u_tex: { value: texture },
      u_time: { value: 0 },
    },
  }),
);
```

---

### 5. 传送门 / 维度揭示（Three.js）

**看起来像什么：** 一个发光的圆形传送门打开，内容从另一个维度穿过它浮现出来。

**何时使用：** 产品揭示、"进入应用"的时刻、hero 功能介绍。

完整的 863 行实现请研究 `registry/blocks/vfx-portal/vfx-portal.html`。

---

## 何时用 HTML-in-Canvas，何时用标准 GSAP

| 场景 | 使用 | 原因 |
| --- | --- | --- |
| hero 产品截图展示 | HTML-in-Canvas（3D 旋转 + bloom） | 让平面 UI 显得有电影感 |
| 功能列表 / 数据 | 标准 GSAP | 以内容为中心，不需要 3D |
| CTA / 品牌揭示 | HTML-in-Canvas（传送门或磁性） | 让这一刻令人难忘 |
| 社会认同 / logo | 标准 GSAP | 有序的级联，信任感是平稳的 |
| 幕与幕之间的转场 | HTML-in-Canvas（碎裂） | 戏剧性的分幕 |
| 背景氛围 | HTML-in-Canvas（液体表面） | 高级的环境感 |
| 快速的功能卡片 | 标准 GSAP | 速度要紧，3D 会拖慢节奏 |

---

## 你还能做出更多效果

这些不在 VFX block 里 —— 用核心样板代码 + 一个自定义 fragment shader 自己做。每个效果就是一个作用于抓取纹理的 GLSL 函数。

### 6. 噪声溶解

内容溶解成噪声颗粒，露出背后的东西。非常适合转场。

```glsl
// Fragment shader — noise-based dissolve
uniform float u_progress; // 0.0 = fully visible, 1.0 = fully dissolved
uniform sampler2D u_tex;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = v_uv;
  float noise = hash(uv * 50.0);
  float threshold = u_progress;
  if (noise < threshold) {
    // Edge glow at the dissolve boundary
    float edge = smoothstep(threshold - 0.05, threshold, noise);
    fragColor = vec4(1.0, 0.6, 0.2, 1.0) * (1.0 - edge); // orange edge glow
  } else {
    fragColor = texture(u_tex, uv);
  }
}
```

### 7. 全息 / 虹彩

内容带上一层随时间流动、彩虹般变换的全息光泽。高级、未来感。

```glsl
uniform float u_time;
uniform sampler2D u_tex;

void main() {
  vec4 color = texture(u_tex, v_uv);
  // Iridescent color shift based on position + time
  float angle = v_uv.x * 6.28 + v_uv.y * 3.14 + u_time * 0.5;
  vec3 holo = vec3(
    sin(angle) * 0.5 + 0.5,
    sin(angle + 2.094) * 0.5 + 0.5,
    sin(angle + 4.189) * 0.5 + 0.5
  );
  // Blend holographic over content (subtle overlay)
  fragColor = vec4(mix(color.rgb, holo, 0.15 + 0.1 * sin(u_time)), color.a);
}
```

### 8. 扫描线 + CRT

复古 CRT 显示器的观感 —— 扫描线、轻微的曲面、荧光辉光。非常适合"代码"或"终端"段落节拍。

```glsl
uniform sampler2D u_tex;
uniform float u_time;

void main() {
  vec2 uv = v_uv;
  // Barrel distortion (CRT curvature)
  vec2 centered = uv - 0.5;
  float dist = dot(centered, centered);
  uv = uv + centered * dist * 0.15;

  vec4 color = texture(u_tex, uv);
  // Scan lines
  float scanline = sin(uv.y * 800.0) * 0.04;
  color.rgb -= scanline;
  // Slight RGB offset (phosphor)
  color.r = texture(u_tex, uv + vec2(0.001, 0.0)).r;
  color.b = texture(u_tex, uv - vec2(0.001, 0.0)).b;
  // Vignette
  float vignette = 1.0 - dist * 2.0;
  fragColor = vec4(color.rgb * vignette, 1.0);
}
```

### 9. 磨砂玻璃模糊

磨砂玻璃后面的内容 —— 看得见但被柔化，带有细微的光线折射。适合"幕后"或"即将推出"的时刻。

```glsl
uniform sampler2D u_tex;
uniform float u_blur; // 0.0 = clear, 1.0 = full frost

void main() {
  vec2 uv = v_uv;
  vec4 color = vec4(0.0);
  // Box blur with offset
  float radius = u_blur * 0.015;
  for (float x = -2.0; x <= 2.0; x += 1.0) {
    for (float y = -2.0; y <= 2.0; y += 1.0) {
      color += texture(u_tex, uv + vec2(x, y) * radius);
    }
  }
  color /= 25.0;
  // Add frost noise texture
  float frost = fract(sin(dot(uv * 200.0, vec2(12.9898, 78.233))) * 43758.5453);
  color.rgb += frost * 0.03 * u_blur;
  fragColor = color;
}
```

### 10. 像素排序 / 故障艺术

像素按竖条或横条重新排列 —— 数字艺术美学。非常适合科技/创意品牌。

```glsl
uniform sampler2D u_tex;
uniform float u_intensity; // 0-1

void main() {
  vec2 uv = v_uv;
  // Random horizontal displacement per row
  float row = floor(uv.y * 80.0);
  float noise = fract(sin(row * 127.1) * 43758.5);
  float displace = step(0.7, noise) * u_intensity * 0.1;
  // Shift UV with RGB split
  float r = texture(u_tex, uv + vec2(displace, 0.0)).r;
  float g = texture(u_tex, uv).g;
  float b = texture(u_tex, uv - vec2(displace * 0.5, 0.0)).b;
  fragColor = vec4(r, g, b, 1.0);
}
```

---

## 创建**任意**自定义效果

上面的 fragment shader 都是模板。模式永远是：

1. 用 `drawElementImage` **抓取你的 HTML 内容**（顶部的样板代码）
2. **把抓取的 canvas 作为 WebGL 纹理上传**
3. **写一个 fragment shader**，从纹理读取并输出修改后的颜色
4. 通过 `onUpdate` **用 GSAP 驱动 shader uniform**

来自 ShaderToy、The Book of Shaders、CodePen 或任何其他地方的 GLSL 效果都可以改造：

1. 找一个你喜欢的效果（搜索 "GLSL [效果名]" 或浏览 shadertoy.com）
2. 复制它的 fragment shader
3. 把 `iResolution` 替换为 `vec2(1920.0, 1080.0)`，把 `iTime` 替换为你的 `u_time` uniform
4. 为抓取到的内容纹理添加 `uniform sampler2D u_tex;`
5. 把 uniform 接到 GSAP 代理值上

**平面之外的几何体思路：**

- `SphereGeometry` —— 内容映射到一个球体上（世界地图、全球覆盖）
- `CylinderGeometry` —— 内容放在旋转的圆柱上（轮播/滚动感）
- `TorusGeometry` —— 内容环绕在一个圆环上（无限、循环）
- `BoxGeometry` —— 内容放在一个 3D 盒子上（产品包装、骰子）
- GLTF 模型 —— 内容作为屏幕纹理映射到手机、笔记本、显示器上（见 `vfx-iphone-device`）

**后期处理叠加**（Three.js EffectComposer）：

- Bloom + 胶片颗粒 = 电影感
- Bloom + 色差 = 镜头效果
- 景深 + 暗角 = 聚焦注意力
- 胶片颗粒 + 扫描线 = 复古
- 多个 pass 可以叠加 —— 想加多少加多少

**你并不局限于这里列出的效果。** 只要你能想象出一种视觉处理，就能把它做出来。HTML-in-Canvas API 给你原材料（任何渲染成纹理的 HTML），而 WebGL/Three.js 让你对这份材料的呈现方式拥有无限的创作掌控。
