<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/techniques.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 视觉技法参考

来自 HyperFrames 线上视频、经过验证的 13 种技法。在你的分镜和 composition 里用上它们，做出视觉丰富、专业的成片。每种技法都附有一个可以改造的最小代码模式。

这些**不是**高级技法——它们是标准的动态设计模式，每个 composition 都应该至少用上 2–3 种。

## 目录

- SVG 路径描绘
- Canvas 2D 程序化艺术
- CSS 3D 变换
- 逐词动态文字排版
- Lottie 动画
- 视频合成
- 逐字符打字
- 可变字体轴动画
- GSAP MotionPathPlugin
- 速度匹配转场
- 音频响应动画
- Clip-path 揭示遮罩
- WebGL 片元着色器艺术
- 什么时候用什么

> **把实时 HTML/CSS 抓取成 GPU 纹理**（3D 旋转 + 辉光、磁力扭曲、碎裂、液面、传送门，外加 GLSL 后期处理）是另一项更重的能力——见 `adapters/html-in-canvas-patterns.md`。每支视频只在 1–3 个 hero 段落节拍上使用，不要每一拍都用。
>
> **缓动词汇**——完整的缓动族色板（性格 + 情绪对照）在 `adapters/gsap-easing-and-stagger.md`。每个 composition 都应该至少用 3 种不同的缓动。
>
> **具名文字动画效果**（24 个 ID，如 `typewriter`、`kinetic-center-build`、`soft-blur-in`）来自外部的 `animate-text` skill——词汇表和加载方式见 `adapters/animate-text.md`。

---

## 1. SVG 路径描绘

一条路径实时把自己画出来，就像有人拿笔在描。用于揭示示意图、箭头、连接线或品牌标志。

```html
<svg viewBox="0 0 400 200">
  <path
    class="draw-path"
    d="M 50 100 L 200 50 L 350 100"
    stroke="#c84f1c"
    stroke-width="4"
    fill="none"
    stroke-linecap="round"
  />
</svg>
<style>
  .draw-path {
    stroke-dasharray: 280;
    stroke-dashoffset: 280;
  }
</style>
<script>
  tl.to(".draw-path", { strokeDashoffset: 0, duration: 0.7, ease: "power2.out" }, 0.5);
</script>
```

用 `path.getTotalLength()` 动态计算 dasharray 的值。

---

## 2. Canvas 2D 程序化艺术

动画噪声、粒子场、数据可视化——任何逐帧演化的东西。用一个 GSAP 代理对象来驱动。

```html
<canvas id="proc-canvas" width="1920" height="1080"></canvas>
<script>
  var canvas = document.getElementById("proc-canvas");
  var ctx = canvas.getContext("2d");

  function hash(x, y) {
    var n = x * 374761393 + y * 668265263;
    n = (n ^ (n >> 13)) * 1274126177;
    return ((n ^ (n >> 16)) & 0x7fffffff) / 0x7fffffff;
  }

  function drawFrame(t) {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, 1920, 1080);
    for (var i = 0; i < 200; i++) {
      var x = hash(i, 0) * 1920;
      var y = hash(i, 1) * 1080;
      var brightness = hash(i, Math.floor(t * 10)) * 255;
      ctx.fillStyle = "rgba(255, 255, 255, " + brightness / 255 + ")";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  var proxy = { time: 0 };
  tl.to(
    proxy,
    {
      time: 5,
      duration: 5,
      ease: "none",
      onUpdate: function () {
        drawFrame(proxy.time);
      },
    },
    0,
  );
</script>
```

`hash()` 函数是确定性的——同一帧每次渲染结果都完全一样。

---

## 3. CSS 3D 变换

透视旋转营造纵深。用于产品展示、卡片翻转、建筑式揭示。

```html
<div class="stage" style="perspective: 900px;">
  <div class="card-3d" style="transform-style: preserve-3d;">
    <div class="face front">Product</div>
    <div class="face back" style="transform: rotateY(180deg);">Details</div>
  </div>
</div>
<script>
  tl.to(".card-3d", { rotationY: 360, rotationX: 15, duration: 1.2, ease: "sine.inOut" }, 0);
</script>
```

始终在父元素上设置 `perspective`，在被动画的元素上设置 `transform-style: preserve-3d`。

---

## 4. 逐词动态文字排版

单词一个接一个出现，与 transcript.json 的时间戳同步。这是旁白驱动视频的核心技法。

```html
<div class="headline">
  <span class="word w-0">Anything</span>
  <span class="word w-1">a</span>
  <span class="word w-2">browser</span>
  <span class="word w-3">can</span>
  <span class="word w-4">render</span>
</div>
<style>
  .word {
    display: inline-block;
    opacity: 0;
    margin: 0 0.12em;
  }
</style>
<script>
  // Word onset times from transcript.json (seconds relative to beat start)
  var timings = [0.0, 0.23, 0.28, 0.63, 0.78];
  var slides = [80, 60, 50, 25, 12]; // horizontal slide decay (px)

  document.querySelectorAll(".word").forEach(function (word, i) {
    tl.from(
      word,
      {
        x: slides[i],
        y: 14,
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
      },
      timings[i],
    );
  });
</script>
```

滑动距离逐词**递减**（80→12px）——模仿镜头逐渐稳住的感觉。

---

## 5. Lottie 动画

在 composition 里播放的矢量动画。用于 logo、角色动画、图标。

```html
<div id="logo-anim" class="lottie" style="width:500px;height:500px;"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
<script>
  window.__hfLottie = window.__hfLottie || [];

  const anim = lottie.loadAnimation({
    container: document.getElementById("logo-anim"),
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "../capture/assets/lottie/animation-0.json",
  });
  window.__hfLottie.push(anim); // REQUIRED — adapter seeks every registered instance

  gsap.set("#logo-anim", { scale: 0.3, opacity: 0 });
  tl.to("#logo-anim", { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.6)" }, 0.2);
</script>
```

`autoplay: false` + `window.__hfLottie.push()` 是强制要求——HyperFrames 会把每个已注册的播放器 seek 到 composition 时间，所以一个留着 `autoplay` 的播放器会按真实时钟运行，渲染结果是非确定性的。`loop: true` 是 seek 安全的：adapter 会把 composition 时间折算到动画自身的时长里，所以一个短循环会在整个场景里重复。没有播放速率缩放：非默认的速度要直接烘焙进 Lottie 素材里。角色（行走循环、吉祥物、手势）以及完整的 `.lottie`/dotLottie 约定：见 `adapters/lottie.md`。

---

## 6. 视频合成

在 composition 里嵌入真实的视频素材画面。视频都是 `playsinline`；无声素材或 b-roll 加 `muted`，需要播放片段自带声音时加 `data-has-audio="true"`。

```html
<div class="video-frame" style="width:680px;height:840px;border-radius:16px;overflow:hidden;">
  <video
    id="footage"
    src="../capture/assets/videos/clip.mp4"
    muted
    playsinline
    style="width:100%;height:100%;object-fit:cover;"
  ></video>
</div>
<script>
  // Video playback is controlled by the framework — don't call play() manually
  tl.from(".video-frame", { scale: 0.9, opacity: 0, duration: 0.3, ease: "power2.out" }, 0);
</script>
```

HyperFrames runtime 负责视频的 seek 和播放。

---

## 7. 逐字符打字

终端打字效果，用 `tl.call()` 一个字符一个字符地更新文本内容。

```html
<div class="terminal-line">
  <span class="prompt">❯</span>
  <span class="typed" id="typed-text"></span>
  <span class="cursor" style="width:11px;height:22px;background:#333;display:inline-block;"></span>
</div>
<script>
  var CMD = "npx hyperframes init";
  var typed = document.getElementById("typed-text");

  // Cursor blinks
  tl.to(".cursor", { opacity: 0, duration: 0.12, yoyo: true, repeat: 20, ease: "steps(1)" }, 0);

  // Type each character
  for (var i = 0; i < CMD.length; i++) {
    (function (idx) {
      tl.call(
        function () {
          typed.textContent = CMD.substring(0, idx + 1);
        },
        null,
        (idx / CMD.length) * 0.9,
      );
    })(i);
  }
</script>
```

光标闪烁用 `ease: "steps(1)"`——产生离散的亮/灭。

---

## 8. 可变字体轴动画

对 font-variation-settings 做动画，实时重塑字形。适用于带有光学尺寸（opsz）、字重（wght）、柔和度（SOFT）等轴的可变字体。

```html
<style>
  /* Load the captured local variable font — do NOT use Google Fonts @import.
     Replace this placeholder with an @font-face pointing to ../capture/assets/fonts/. */
  @font-face {
    font-family: "Fraunces";
    src: url("../capture/assets/fonts/Fraunces-Variable.woff2") format("woff2");
    font-weight: 100 900;
    font-style: normal;
    font-display: block;
  }
  .wordmark {
    --opsz: 144;
    --wght: 440;
    font-family: "Fraunces", serif;
    font-variation-settings:
      "opsz" var(--opsz),
      "wght" var(--wght);
    font-size: 200px;
  }
</style>
<script>
  tl.to(".wordmark", { "--opsz": 72, "--wght": 300, duration: 0.45, ease: "power2.out" }, 0);
</script>
```

随着轴的动画，字形会微妙地变形——光学尺寸调整细节，字重改变笔画粗细。

---

## 9. GSAP MotionPathPlugin

让元素沿任意 SVG 路径运动。用于沿曲线移动的滑块、沿轨迹运动的粒子、引导式揭示。

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/MotionPathPlugin.min.js"></script>
<div class="dot" style="width:20px;height:20px;background:#2a8a7c;border-radius:50%;"></div>
<script>
  gsap.registerPlugin(MotionPathPlugin);
  tl.to(
    ".dot",
    {
      motionPath: { path: "M 12 300 C 280 280 520 80 820 50 S 1200 48 1308 38" },
      duration: 1.5,
      ease: "power2.out",
    },
    0,
  );
</script>
```

---

## 10. 速度匹配转场

以匹配的速度离开一拍、进入下一拍——营造出连续运动的观感。

```javascript
// EXIT (in outgoing composition): accelerating with blur
tl.to(
  ".content",
  {
    y: -150,
    filter: "blur(30px)",
    opacity: 0,
    duration: 0.33,
    ease: "power2.in", // accelerates
  },
  beatDuration - 0.33,
);

// ENTRY (in incoming composition): decelerating from blur
gsap.set(".content", { y: 150, filter: "blur(30px)" });
tl.to(
  ".content",
  {
    y: 0,
    filter: "blur(0px)",
    duration: 1.0,
    ease: "power2.out", // decelerates
  },
  0,
);
```

两条曲线的最快点在切点处相遇——观众感知到的是一段流畅的镜头运动。缓动族要匹配：离场用 `.in`，入场用 `.out`。

---

## 11. 音频响应动画

用正在播放的音频驱动任何 GSAP 可做 tween 的属性。低音在底鼓上让 logo 脉动。高音在镲片上让 CTA 发光。振幅在安静的乐句里让背景呼吸。效果是：运动给人一种紧扣音轨的感觉，这是预先写好的 tween 永远做不到的。

**什么时候用：** 任何带音乐或戏剧性旁白的视频——品牌短片、产品发布、燃向剪辑。节奏平缓/教程类的视频跳过。

**工作原理：** 先把音频的频段预先提取到一个 JSON 文件里，再通过 `tl.call()` 逐帧采样：

```js
// audio-data.json: { fps: 30, totalFrames: 900, frames: [{ bands: [0.82, 0.45, 0.31, ...] }, ...] }
for (var f = 0; f < AUDIO_DATA.totalFrames; f++) {
  tl.call(
    (function (frame) {
      return function () {
        var bass = frame.bands[0]; // 0–1
        var treble = frame.bands[13];
        gsap.set(".logo", { scale: 1 + bass * 0.04 }); // 3–4% pulse on bass
        gsap.set(".cta", { filter: `drop-shadow(0 0 ${treble * 24}px #00C3FF)` });
      };
    })(AUDIO_DATA.frames[f]),
    [],
    f / AUDIO_DATA.fps,
  );
}
```

必须逐帧采样——单个 tween 不会产生响应。使用提取脚本：

```bash
python3 skills/hyperframes-creative/scripts/extract-audio-data.py narration.wav --fps 30 --bands 16 -o audio-data.json
```

文字/logo 上的强度要保持克制（缩放 ≤5%，辉光 ≤30%）——小元素上的音频响应运动看起来像抖动。更大的背景可以推到 10–30%。

**绝不要做：** 均衡器柱、频谱分析仪、波形显示、频闪、彩虹色循环。音频提供的是*时机和强度*；视觉词汇仍然来自品牌。完整 API 和反模式见 `skills/hyperframes-creative/references/audio-reactive.md`。

---

## 12. Clip-path 揭示遮罩 { #12-clip-path-reveal-masks }

一个固定的窗口，内容从中滑过——文字或图片从一侧进入，被一条看不见的边界裁切。与 SVG 路径描绘不同：遮罩是静止的，动的是内容。

```html
<div id="reveal-mask">
  <div id="reveal-content">Your headline text here</div>
</div>
<style>
  #reveal-mask {
    position: absolute;
    inset: 0;
    clip-path: inset(0 200px 0 0); /* clips 200px from right */
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #reveal-content {
    font-size: 108px;
    white-space: nowrap;
  }
</style>
<script>
  // Content starts offscreen right, slides left through the mask window
  gsap.set("#reveal-content", { x: 400, opacity: 0 });
  tl.to("#reveal-content", { x: 0, opacity: 1, duration: 1, ease: "power2.out" }, 0);
</script>
```

变体：`clip-path: circle(0% at 50% 50%)` → `circle(100%)` 做光圈式揭示。`clip-path: polygon(...)` 做自定义形状。

### 文字遮罩要给字形留出空间

行盒并不是其文字实际绘制的完整范围。在排得很紧的展示型排版里（`line-height: 1` 或更小），一个 `overflow: hidden` 的行遮罩可能会裁掉下伸部（`g`、`p`、`y`、`j`）以及重音符号或变音符号，即使入场已经结束也一样。

给遮罩加上块方向的 padding，再加一个抵消它的负 margin。把排版设置放在遮罩上，在行元素上继承，这样 padding 的 `em` 单位用的就是文字的字号：

```html
<div class="line-mask">
  <div class="line">Betreuung</div>
</div>
<style>
  .line-mask {
    font-size: 200px;
    line-height: 1;
    overflow: hidden;
    padding-block: 0.2em;
    margin-block: -0.2em;
  }
  .line-mask > .line {
    margin: 0;
    font: inherit;
    white-space: nowrap;
  }
</style>
```

把 `0.2em` 当作起点：在一个已落定的帧上核实实际的字体、字重和文字，包括下伸部和带重音的大写字母。让初始被位移的那一行留在放大后的遮罩之外，这样它在揭示之前保持隐藏。如果入场之后不再需要遮罩，另一个选择是在落定时间点用 `tl.set(...)` 解除它的裁切属性（`overflow: visible` / `clip-path: none`）。

`data-layout-allow-overflow` 会在整条 timeline 上（包括静止状态）对被标记的元素及其后代屏蔽溢出检查。`hyperframes check` 通过并不能证明字形完好无损；在认定揭示完成之前，要查看遮罩落定后的 snapshot。

---

## 13. WebGL 片元着色器艺术

完全在 GPU 上生成的背景——域扭曲的 FBM 噪声、余弦色板着色、虹彩般的有机图案。比 Canvas 2D 丰富得多。

```html
<canvas id="shader-bg" width="1920" height="1080"></canvas>
<script>
  var canvas = document.getElementById("shader-bg");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    /* fallback to gradient */
  }

  var fsrc = `
    precision mediump float;
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2 u_res;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      mat2 R = mat2(0.8, 0.6, -0.6, 0.8);
      for (int i = 0; i < 5; i++) { v += a*noise(p); p = R*p*2.02; a *= 0.5; }
      return v;
    }
    vec3 palette(float t) {
      return vec3(0.5)+vec3(0.5)*cos(6.28318*(vec3(1)*t+vec3(0.0,0.33,0.67)));
    }
    void main() {
      vec2 uv = v_uv; uv.x *= u_res.x/u_res.y;
      float t = u_time * 0.4;
      vec2 q = vec2(fbm(uv*3.0+t*0.3), fbm(uv*3.0+vec2(5.2,1.3)+t*0.2));
      vec2 r = vec2(fbm(uv*3.0+q*4.0+vec2(1.7,9.2)+t*0.15), fbm(uv*3.0+q*4.0+vec2(8.3,2.8)+t*0.1));
      float n = fbm(uv*3.0+r*2.0);
      vec3 col = palette(n*2.0+t*0.2);
      col = mix(col, palette(length(q)*3.0+t*0.1), 0.4);
      col *= 0.7+0.3*n;
      float vig = 1.0-0.4*length(v_uv-0.5);
      gl_FragColor = vec4(col*vig, 1.0);
    }
  `;

  // Compile, link, set up fullscreen quad, then render via GSAP proxy:
  var proxy = { time: 0.5 };
  tl.to(
    proxy,
    {
      time: 5,
      duration: BEAT_DUR,
      ease: "none",
      onUpdate: function () {
        gl.uniform1f(uTime, proxy.time);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
    },
    0,
  );
</script>
```

始终为没有 WebGL 的环境准备一个 Canvas 2D 渐变兜底。

---

## 什么时候用什么

| 视频能量                   | 要组合的技法                                           |
| ------------------------------ | --------------------------------------------------------------- |
| 高冲击（发布、宣传片） | 逐词排版 + 速度转场 + 计数器动画 |
| 电影感（导览、故事）     | SVG 路径描绘 + 视频合成 + 3D 变换            |
| 技术向（开发工具、API）    | 逐字符打字 + Canvas 2D 程序化 + MotionPath            |
| 高端（奢侈品、企业）   | 可变字体动画 + Lottie + 慢速的速度转场    |
| 数据驱动（统计、指标）   | Canvas 2D 程序化 + 计数器动画 + SVG 路径描绘    |
