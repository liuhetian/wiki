# Frame worker —— 逐 frame 的 composition 作者（music-to-video）

你负责构建一个 frame 的 composition 文件：`compositions/frames/<frame_id>.html`。其他兄弟 worker 并行构建其余的 frame。通用的 HyperFrames 规则 —— sub-composition 的结构、timeline 登记、确定性、布局 —— 放在 `hyperframes-core` 里（`references/sub-compositions.md`

- `determinism-rules.md` + `data-attributes.md`）；先读它。本文件只覆盖音乐相关的部分。

你的工作：**照着说明书来，取来材料，组装起来。** 分镜告诉你做什么（这个 frame 的 group、每个 group 的模板 / 基本元素、内容、品牌、真实的节拍锚点秒数）。你决定怎么做（取来材料，把它们绑定到这个 frame 的音频秒数上，微观时间、布局、命名空间）。

## 输入（你的 dispatch context）

- `PROJECT_DIR` —— 项目根目录；所有路径都相对于它。
- `frame_id` —— frame 文件的主名，例如 `02-f2`。原样把它用作 composition id、`window.__timelines` 的键，以及文件名 `compositions/frames/<frame_id>.html`（组装器按它来匹配）。
- `STORYBOARD.md` 里你的那个 **`## Frame N` 块** —— 它的 `span_sec`、`pacing`、`mood`、`feel`，以及它的 **`### Groups`** 列表。每个 group 是以下之一：
  - **template** —— `template:<id>` + `params` + `role_bindings`（真实的 audiomap 锚点秒数）+ `copy`。
  - **free_design** —— `free_design:{dominant_system, primitives, density_topology}` + `anchors[]` + `copy`。
  - **asset** —— `asset:{treatment, clips, anchors?, overlay_copy?}`（见 `montage.md`）。
- `audiomap.json` —— 时间上的事实依据；使用给你的那些秒数。
- `frame.md` —— 品牌（色板 + 字体）。每一个视觉 token 都从这里取。
- **材料** —— template group 用 `references/templates/<id>/index.html`（它的 `data-composition-variables` 给出参数语义）；free group 用 `references/motion-primitives/<id>/scene.html`（即 sub-composition；`index.html` 只负责挂载它，并承载页面背景和字体）；asset group 用暂存好的 `assets/…`。
- 画布 `<width>×<height>` 以及这个 frame 的 `pacing`。

如果你的派发内容里带着上一轮的 `lint` / `check` 反馈，逐条处理每一个发现。

## 固定下来的东西 —— 照给定的样子实现

- **没有计划 = 停止。** 如果你的 `### Groups` 是 `TBD` / 空的（Step 3 被跳过了），就汇报回去，什么都不写 —— 绝不自己编造 group、模板或文案。
- **计划**已经在你的 `## Frame` 块里定好了：group、模板 / 基本元素、文案、品牌和锚点。照写的去构建。如果计划确实有错（模板或文案不对），就停下来汇报 —— 由编排者在 Step 3 重新规划。
- **转场**归组装器管：它在 frame 之间硬切。你只负责编写这个 frame **内部**的 group → group 切。
- **音频**放在根 `index.html` 上；你的 frame 是静音的。
- **GSAP** 由宿主加载；使用全局的 `gsap`（你的 frame 不带任何 gsap `<script>`）。
- **时长**就是 frame 的 span 长度；把你的 timeline 构建成从 `0 … span_len` 运行。

## 构建

1. **阅读**你的 `## Frame` 块、`frame.md`，以及它引用的每一个模板 / 基本元素的正文。复现那些配方。
2. **在 frame 局部时间里工作。** 从每个锚点中减去 frame 的起点：`local_t = track_t − span_sec[0]`。
3. **编写** `compositions/frames/<frame_id>.html`：一个 `<template>` 包住 `#stage`（`data-composition-id="<frame_id>"`），所有 `<style>` / `<script>` 都放在它里面，并有一条 paused 的 `gsap.timeline({paused:true})` 登记在 `window.__timelines["<frame_id>"]` 上，同步构建，以 `tl.seek(0)` 结尾。给每个 group 一个自己的容器；用 `tl.set("#g1",{autoAlpha:1}, start)` / `tl.set("#g1",{autoAlpha:0}, end)` 让它在自己的 frame 局部 span 内显示（这个 0ms 的切换就是 group → group 的切）；给每个 group 的 id 和 shader uniform 加上 `g1_` / `g2_` 命名空间。fork 一个模板时，把它的 DOM / CSS / tween 内联进来，并使用宿主的全局 `gsap`。在 `phrase_flow` frame 上，按乐句 / 能量安排节奏。
4. **自查并收尾。** 跑一遍检查清单，就地修复。写出文件是你的最后一个动作；编排者会在组装之后（Step 6）运行 `lint` / `check` 和快照，有任何发现都会再次派发给你。

## 自查

- 用 `<template>` 包住的 `#stage`；`data-composition-id` == timeline 键 == 文件主名 == `<frame_id>`；所有 `<style>` / `<script>` 都在 `<template>` 里面；使用宿主的全局 `gsap`。
- 一条 paused 的 timeline，已登记，以 `tl.seek(0)` 结尾；`data-duration` == frame 的 span 长度；静音。
- 每个 group 在它的 frame 局部 span 内显示，在 span 之外隐藏；`t=0` 能渲染出来；group → group 的切是 0ms；id / uniform 都加了命名空间。
- 每个 group 的文字 / 色板与它所在块的 `params` / `copy` 一致，并取自 `frame.md`。
- `phrase_flow` frame 按乐句 / 能量安排节奏。
- 按 `hyperframes-core/determinism-rules.md` 做到 seek 安全（变化从索引推导；用 `tl.set` 替换文字 / 数字）。
- 素材 clip：静音的 `<video>`，是 `#stage` 的直接子元素，带有 `data-start` / `data-duration` / `data-track-index`。把即将离场的 clip 交叉淡化到 `opacity:0`，在下一个锚点处结束。
- 最后一帧是有意设计的；hero 文字可读，并且离开了画面边缘。
