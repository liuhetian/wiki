<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-core/references/composition-patterns.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Composition 模式

如何为项目搭架构：规模化时的 `index.html` 编排者，以及常见的 sub-composition 原型。与 `minimal-composition.md`（单文件形态）和 `sub-compositions.md`（sub-comp 文件的机制）搭配阅读。

## 两种架构

|  | 单体式（单文件） | 模块化（sub-composition） |
| --- | --- | --- |
| 项目布局 | 只有 `index.html` | `index.html` + 每个场景一个 `compositions/<scene>.html` |
| 场景放在哪里 | 根元素下内联的同级 `<section class="clip">` | 每个场景是一个单独的文件，用 `<template>` 包裹 |
| Timeline 注册 | 一条 timeline，键为根元素的 `data-composition-id` | 根 timeline（通常近乎为空）+ 每个 sub-comp 一条 timeline，各自以其 `id` 为键 |
| 路由入口 | `references/minimal-composition.md` | `references/sub-compositions.md` |

两种架构使用同一套 runtime 契约 —— `data-*` 属性 + `window.__timelines[id]`。这是结构上的选择，不是行为上的选择。

## 模块化编排者模式

使用 sub-composition 时，`index.html` 应该保持**轻薄**。它的工作是声明槽位、在时间上排布它们、挂载音频 track，并注册一条（通常为空的）根 timeline。所有场景动画都放在 sub-comp 里。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      body {
        margin: 0;
        background: #000;
      }
      #root {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      /* Sub-comp slots stretch to fill the root. */
      [data-composition-id="root"] > div[data-composition-src] {
        position: absolute;
        inset: 0;
      }
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="root"
      data-width="1920"
      data-height="1080"
      data-duration="30"
    >
      <!-- Sequential scenes — each one a sub-composition slot. -->
      <div
        id="el-intro"
        data-composition-id="intro"
        data-composition-src="compositions/intro.html"
        data-start="0"
        data-duration="6"
        data-track-index="1"
      ></div>

      <div
        id="el-body"
        data-composition-id="body"
        data-composition-src="compositions/body.html"
        data-start="6"
        data-duration="18"
        data-track-index="1"
      ></div>

      <div
        id="el-outro"
        data-composition-id="outro"
        data-composition-src="compositions/outro.html"
        data-start="24"
        data-duration="6"
        data-track-index="1"
      ></div>

      <!-- Continuous audio at the root — survives scene cuts. -->
      <audio
        id="el-bgm"
        src="assets/bgm.mp3"
        data-start="0"
        data-duration="30"
        data-track-index="10"
        data-volume="0.6"
      ></audio>
    </div>

    <script>
      window.__timelines["root"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
```

这种布局的关键特性：

- **视觉场景放在同一个 `data-track-index` 上**（例如 `1`），按顺序编写。要做交叉淡化，就让它们的时间重叠一个淡化时长；给进场的场景单独一个 track 能让 Studio 的 timeline 更易读，但渲染两种方式下都接受重叠。
- **音频放在一个单独的、更高的 track index 上**（例如 `10`）。这样 linter 的重叠规则就不会与任何视觉元素冲突。
- **根 timeline 近乎为空。** 所有动画都放在 sub-comp 里。在最末尾做一个根级的淡出到黑场没问题；不要从根元素上编排一条并行的动画轨。
- **宿主槽位的 id** 使用 `el-<name>` 或 `<scene-id>`。槽位的 `data-composition-id` 仍必须等于 sub-comp 内部的 id（见 `sub-compositions.md`）。

## Sub-Composition 原型

### A. 内容场景（默认）

sub-comp 包含该场景完整的 DOM、作用域内的 CSS 和 timeline。这是 `sub-compositions.md` 里的标准模式 —— 大多数场景都是这一种。

### B. 宿主媒体 + 主 timeline 驱动（`<video>`/`<audio>` 的一种模式）

`<video>`/`<audio>` 在任意嵌套深度都能 seek 和解码，所以一个场景专属的 clip 可以放在其场景的 sub-comp 里，使用场景局部的 `data-start`，并由该 sub-comp 自己的 timeline 驱动。当你希望在**主** timeline 上编写媒体的运动时，改用这种宿主媒体模式：把 `<video>`/`<audio>` 作为宿主根元素的同级子元素，定位到场景画框的上方。

采用它的原因：sub-comp 的 timeline **无法**驱动宿主元素（全局选择器或 `document.querySelector` 都无法跨越边界解析）。所以如果媒体位于宿主根元素下，就在 `index.html` 的**主 timeline** 上编写它在每个场景中的运动（缩放 / 透明度 / 变形 / 倾斜 / 呼吸），时间用**全局时间** = 场景局部时间 + 场景槽位的 `data-start`。

```html
<!-- index.html (host) -->
<div
  id="el-final"
  data-composition-id="final-anim"
  data-composition-src="compositions/final-anim.html"
  data-start="20"
  data-duration="6"
  data-track-index="1"
></div>

<!-- media is a DIRECT root child; sits over the sub-comp's frame -->
<video
  id="final-video"
  class="clip"
  src="assets/final.mp4"
  data-start="20"
  data-duration="6"
  data-track-index="2"
  muted
  playsinline
  style="position:absolute; left:360px; top:100px; width:1200px; height:680px; object-fit:cover; border-radius:24px;"
></video>

<script>
  // MAIN timeline drives the host video. Global time: scene starts at 20.
  const main = window.__timelines["main"];
  main.fromTo(
    "#final-video",
    { scale: 1.4, filter: "blur(14px)" },
    { scale: 1.0, filter: "blur(0px)", duration: 0.9, ease: "power3.out" },
    20,
  ); // = slot data-start (+ any scene-local offset)
</script>

<!-- compositions/final-anim.html — frame/shell only, no <video>, no host-element animation -->
<template>
  <div
    data-composition-id="final-anim"
    data-width="1920"
    data-height="1080"
    data-duration="6"
    style="position:absolute; inset:0; pointer-events:none;"
  >
    <script>
      const tl = gsap.timeline({ paused: true });
      // animate ONLY this sub-comp's own elements here (labels, frame, overlays)
      window.__timelines["final-anim"] = tl;
    </script>
  </div>
</template>
```

注意事项：

- 在这种模式下，媒体是宿主根元素的子元素，静态地写在 `index.html` 里，所以主 timeline 的选择器能解析到它。（嵌套在 sub-comp 里的媒体同样能被正常驱动；只是主 timeline 的选择器够不到它 —— 要从 sub-comp 自己的 timeline 驱动它。）
- clip 生命周期掌管媒体元素在其 `[data-start, data-start+data-duration]` 窗口内的可见性。主 timeline 上的透明度 / 缩放 tween 能与之正常叠加；做透明度渐显 / 交叉淡化时，优先用一个宿主**包裹层**，这样你就不会在媒体元素本身上跟生命周期打架。
- 两个共享同一 `src` + `data-start` 的媒体元素会触发 `duplicate_media_discovery_risk`（无害 —— 两者仍会渲染）。

### C. 多场景合并

当几个段落节拍级的场景共享连续状态时 —— 一条不断增长的聊天记录、一个跨越切点持续存在的标题词、一块内部有阶段变化的画布 —— 把它们合并成一个 sub-comp，用**内部阶段 div**，而不是多个 sub-comp 槽位。

```html
<!-- compositions/act2-merged.html -->
<template>
  <div data-composition-id="act2-merged" data-width="1920" data-height="1080" data-duration="9">
    <style>
      [data-composition-id="act2-merged"] .phase {
        position: absolute;
        inset: 0;
        opacity: 0;
      }
    </style>
    <div class="phase" id="phase-a">…</div>
    <div class="phase" id="phase-b">…</div>
    <div class="phase" id="phase-c">…</div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.set("#phase-a", { opacity: 1 }, 0);
      tl.to("#phase-a", { opacity: 0, duration: 0.4 }, 3.0);
      tl.set("#phase-b", { opacity: 1 }, 3.0);
      // …
      window.__timelines["act2-merged"] = tl;
    </script>
  </div>
</template>
```

当场景共享 DOM、共享画布，或者需要与持续存在的元素一起交叉淡化（一个在阶段之间的切点上存活下来的标题）时，选择这种方式，而不是多个顺序槽位。每个阶段只是同一个 sub-comp 里的一个 div —— 父 timeline 永远不需要知道内部的阶段边界。

### D. 音频在根元素，响应式视觉在内部

音频始终作为根级 `<audio>` 放在宿主（`index.html`）上，这样播放能跨越场景切点持续下去。一个可视化音频的 sub-comp 应该在初始化时读取一条**预先烘焙好的**频率曲线，然后从它的 timeline 上对烘焙曲线采样 —— 视觉效果仍必须是 `tl.time()` 的确定性函数，而不是 `audio.currentTime` 的函数。编写模式见 `determinism-rules.md` 和 `hyperframes-creative`。

## 命名约定

| 对象 | 约定 | 示例 |
| --- | --- | --- |
| Sub-comp 文件 | `compositions/<scene-id>.html` | `compositions/act0-intro-bell.html` |
| Sub-comp 的 `<template>` id（可选） | `<scene-id>-template` | `<template id="act0-intro-bell-template">` |
| Sub-comp 根元素的 `data-composition-id` | `<scene-id>`（必须与宿主槽位一致） | `data-composition-id="act0-intro-bell"` |
| Timeline 注册表的键 | 与 `data-composition-id` 一致 | `window.__timelines["act0-intro-bell"]` |
| 宿主槽位的 `id` | `el-<short>` 或 `<scene-id>` | `id="el-intro"`、`id="act0"` |
| sub-comp 内部的元素 id | 用场景 id 作前缀 | `#act0-bell`、`#b1-tape` |
| 根元素上的音频 | `data-track-index` 远高于视觉 track | 视觉用 `1` 时取 `10` |

`<template>` 上的 `-template` 后缀是惯例，但不是必需的 —— 无论 id 是什么，runtime 都会从 `<body>` 里的那个 `<template>` 提取内容。当多个 sub-comp 同时挂载到同一个宿主页面时，内部元素 id 上的前缀是防止 id 冲突的唯一保障。
