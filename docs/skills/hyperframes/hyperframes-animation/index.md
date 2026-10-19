---
name: hyperframes-animation
description: "HyperFrames 的全部动画知识 —— 原子动效规则、多阶段场景蓝图、场景转场、更广泛的动效设计技巧，以及七个 runtime adapter（默认 GSAP，另有 Lottie、Three.js、Anime.js、CSS keyframes、Web Animations API、TypeGPU）。用于任何动效或动画任务：挑 2-4 条规则组合起来，或加载一个蓝图，或查阅特定 runtime 的 API（例如 GSAP 的 ease / Lottie 播放器 / Three.js mixer）。也涵盖审查已有 composition 的编排（动画地图），以及 24 种具名的文字动画效果。HyperFrames 原生：单条暂停的 timeline、seek 安全、确定性。"
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/SKILL.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

**插件安装：** 当本 skill 位于某个 HyperFrames 插件之内时，在执行安装设置或版本刷新类命令之前，先遵循[插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装的情况仍按下文的更新说明执行。

# HyperFrames Animation

所有动效知识集中在一个 skill 里：**规则**（rules，原子配方）、**蓝图**（blueprints，多阶段场景模板）、**转场**（transitions，场景到场景）、**技巧**（techniques，更广泛的动效设计模式），以及 **adapter**（各 runtime 的 API）。

composition 契约（data 属性、sub-composition、确定性）见 `hyperframes-core`。

## 默认做法：组合原子规则

从 `rules-index.md` 里挑 2-4 条规则，用一条暂停的 GSAP timeline 把它们粘在一起，就完成了。这比从蓝图开始更快，产出的代码也更少。

## 以下情况才加载蓝图

- 场景与某个已有的、预先设计好的多阶段模板（brand-reveal、social-proof 等）相符，复用它的阶段流水线能实实在在地节省编写时间
- 你需要一份针对复杂的 4-5 阶段编排、可直接运行的基准代码

蓝图列在 `blueprints-index.md` 里。每个条目都指向 `blueprints/<id>.md`（配方）。不要抱着试试看的心态去读它；只有在你已经确定需要场景级编排时才加载。

## 路由

| 想要…… | 读 |
| --- | --- |
| 按触发条件 / 标签挑一个原子动效模式 | `rules-index.md` |
| 读某条规则完整的 HTML / CSS / GSAP 配方 | `rules/<name>.md` |
| 挑一个多阶段场景模板 | `blueprints-index.md` |
| 读某个蓝图的完整配方 | `blueprints/<id>.md` |
| 编写一个场景转场（CSS 驱动，在两个 clip 之间） | `transitions/overview.md`、`transitions/catalog.md` |
| 查一项更广泛的动效设计技巧 | `techniques.md` |
| 运动模糊 —— 元素上的快门拖影，以及何时不该用 | `references/motion-blur.md` |
| 分析已有 composition 的动画地图 | `scripts/animation-map.mjs` |
| GSAP API —— timeline / tween / 位置参数 | `adapters/gsap.md` |
| GSAP —— 即插即用的效果配方 | `rules/gsap-effects.md` |
| GSAP —— transform / 性能 | `adapters/gsap-transforms-and-perf.md` |
| GSAP —— ease / stagger | `adapters/gsap-easing-and-stagger.md` |
| GSAP —— timeline / label | `adapters/gsap-timeline-and-labels.md` |
| Lottie / dotLottie（After Effects 导出，`window.__hfLottie`） | `adapters/lottie.md` |
| 角色动画（走路循环、吉祥物、关节木偶、手势） | `adapters/lottie.md` → Characters 一节 |
| Three.js / WebGL（3D 场景、`AnimationMixer`、`hf-seek`） | `adapters/three.md` |
| Anime.js（`window.__hfAnime`） | `adapters/animejs.md` |
| CSS keyframes（`animation-delay` / `play-state` / `fill-mode`） | `adapters/css-animations.md` |
| Web Animations API（`element.animate()`、`currentTime` seek） | `adapters/waapi.md` |
| TypeGPU / WebGPU（`navigator.gpu`、WGSL、计算管线） | `adapters/typegpu.md` |
| 把 HTML 当纹理 + WebGL/GLSL 后期效果（通过 `drawElementImage` 抓取实时 DOM） | `adapters/html-in-canvas-patterns.md` |
| 具名的文字动画效果（通过外部 `animate-text` skill 提供的 24 个 ID） | `adapters/animate-text.md` |

## 选择 runtime

- **GSAP** 是 95% 动效工作的默认选择 —— 涵盖 timeline 编排、transform、easing、stagger。本 skill 里的所有原子规则都基于 GSAP。
- **Lottie** 用于素材自带预先烘焙好的 timeline 的情况（通常是 After Effects 导出），包括会走路、做手势或有反应的角色。
- **Three.js** 用于 3D 场景、镜头运动、shader 驱动的视觉。
- **Anime.js** 用于 GSAP 显得杀鸡用牛刀时的轻量 tween。
- **CSS** 用于简单的重复图案、装饰、微光效果 —— 没有 JavaScript 动画开销。
- **WAAPI** 用于不依赖 GSAP 的浏览器原生关键帧。
- **TypeGPU / WebGPU** 用于 GPU 渲染的画布（粒子、液态玻璃、自定义 shader）。

一个 composition 里可以同时存在多个 runtime。每个 runtime 都把自己的实例注册到该 runtime 专属的全局变量上，这样 HyperFrames 就能一次性 seek 所有实例。

## 关键约束

**前置条件：`hyperframes-core` → One paused timeline + Non-negotiable rules 两节**（单条暂停的 timeline，由 `data-duration` 决定时长，不用 `Math.random` / `Date.now` / `performance.now`，没有有限的根 `data-duration` 时不用 `repeat: -1`，不在页面加载时对后面场景的 clip 做 `gsap.set`，不对 `display` 或原始 `visibility` 做 tween，并且只在 timeline 完全构建好之后才注册它，包括构建过程运行在 `document.fonts.ready` 这类异步回调里的情况）。core 仍然允许 GSAP 的 `autoAlpha`，以及在明确的 timeline 边界上设置零时长的可见性。这些例外只能用在非 clip 元素或 clip 内部的 wrapper 上；`.clip` 的生命周期由框架负责。不要在这里重述完整的契约。

在 core 契约之上，动画手艺方面的补充：

- **预先计算好的布局常量** —— 绝不在 tween 运行时通过 `getBoundingClientRect()` 推导位置。tween 运行时的 DOM 测量会失去同步，因为渲染器是并行采样的；在 composition 初始化时一次性算好坐标，然后复用。
- **空间运动只用 GSAP 的 transform 别名**（`x`、`y`、`scale`、`rotation`）。core 的允许列表也允许对 `opacity` / `color` / `backgroundColor` / `borderRadius` 做非空间属性的 tween —— 但布局变化绝不用 `width` / `height` / `top` / `left`。

## 脚本

```bash
node <SKILL_DIR>/scripts/animation-map.mjs <composition-dir> \
  --out <composition-dir>/.hyperframes/anim-map
```

读取注册在 `window.__timelines` 上的每一条 GSAP timeline，枚举 tween，采样包围盒，计算标记，输出 `animation-map.json`。编写完成后用它来审查编排（死区、stagger 一致性、生命周期警告）。

`animation-map.mjs` 会先从当前项目解析辅助包，然后可以引导捆绑的 HyperFrames 包版本。只有在捆绑的 CLI / skill 安装之外运行本 skill、并且需要显式锁定那个引导版本时，才设置 `HYPERFRAMES_SKILL_PKG_VERSION=<version>`。

## 另见

- `hyperframes-core` —— composition 结构、data 属性、sub-composition、确定性渲染契约
- `hyperframes-creative` —— 色板、字体排印、旁白、段落节拍规划（动画之外的创意方向）
- `hyperframes-cli` —— `npx hyperframes lint / check / snapshot / preview / render`

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [adapters/animate-text.md](adapters/animate-text.md) —— 文字效果 —— 参考
- [adapters/animejs.md](adapters/animejs.md) —— 用于 HyperFrames 的 Anime.js
- [adapters/css-animations.md](adapters/css-animations.md) —— 用于 HyperFrames 的 CSS 动画
- [adapters/gsap-easing-and-stagger.md](adapters/gsap-easing-and-stagger.md) —— Easing、Stagger 与基于函数的值
- [adapters/gsap-timeline-and-labels.md](adapters/gsap-timeline-and-labels.md) —— Timeline 与 Label
- [adapters/gsap-transforms-and-perf.md](adapters/gsap-transforms-and-perf.md) —— Transform 与性能
- [adapters/gsap.md](adapters/gsap.md) —— HyperFrames GSAP
- [adapters/html-in-canvas-patterns.md](adapters/html-in-canvas-patterns.md) —— HTML-in-Canvas 模式
- [adapters/lottie.md](adapters/lottie.md) —— HyperFrames 中的 Lottie
- [adapters/three.md](adapters/three.md) —— HyperFrames 中的 Three.js
- [adapters/typegpu.md](adapters/typegpu.md) —— HyperFrames 中的 TypeGPU / WebGPU
- [adapters/waapi.md](adapters/waapi.md) —— HyperFrames 中的 Web Animations API
- [blueprints-index.md](blueprints-index.md) —— Blueprint（经过验证的形状）
- [blueprints/agent-progress-theater.md](blueprints/agent-progress-theater.md) —— agent-progress-theater —— Agent 进度剧场
- [blueprints/camera-journey.md](blueprints/camera-journey.md) —— camera-journey —— 摄像机旅程
- [blueprints/comparison-split.md](blueprints/comparison-split.md) —— comparison-split —— 对比分屏卡片
- [blueprints/constellation-hub.md](blueprints/constellation-hub.md) —— constellation-hub —— 星座 / 中枢 + 卫星
- [blueprints/cta-morph-press.md](blueprints/cta-morph-press.md) —— cta-morph-press —— CTA 变形与按压
- [blueprints/cursor-ui-demo.md](blueprints/cursor-ui-demo.md) —— cursor-ui-demo — 光标驱动的 UI 演示
- [blueprints/dataviz-countup.md](blueprints/dataviz-countup.md) —— dataviz-countup — 数据可视化 / 数字滚动计数
- [blueprints/device-surface-showcase.md](blueprints/device-surface-showcase.md) —— device-surface-showcase — 设备 / 界面展示
- [blueprints/fixed-anchor-cycle.md](blueprints/fixed-anchor-cycle.md) —— fixed-anchor-cycle — 固定锚点，轮换世界
- [blueprints/grid-card-assemble.md](blueprints/grid-card-assemble.md) —— grid-card-assemble — 网格 / 卡片组装
- [blueprints/kinetic-type-beats.md](blueprints/kinetic-type-beats.md) —— kinetic-type-beats — 动态文字段落节拍
- [blueprints/logo-assemble-lockup.md](blueprints/logo-assemble-lockup.md) —— logo-assemble-lockup — Logo 组装 → Lockup
- [blueprints/overwhelm-surround.md](blueprints/overwhelm-surround.md) —— overwhelm-surround — 压迫 / 围拢
- [blueprints/panel-edit-live-sync.md](blueprints/panel-edit-live-sync.md) —— panel-edit-live-sync —— 面板编辑，实时同步
- [blueprints/prompt-type-submit-generate.md](blueprints/prompt-type-submit-generate.md) —— prompt-type-submit-generate —— 输入提示词、提交、生成
- [blueprints/spatial-pan-stations.md](blueprints/spatial-pan-stations.md) —— spatial-pan-stations —— 空间平移 / 站点
- [blueprints/ticker-takeover.md](blueprints/ticker-takeover.md) —— ticker-takeover —— 滚字被挤开 / 接管
- [blueprints/titlecard-reveal.md](blueprints/titlecard-reveal.md) —— titlecard-reveal —— 标题卡 / 单卡揭示
- [blueprints/transcript-scroll-artifact-reveal.md](blueprints/transcript-scroll-artifact-reveal.md) —— transcript-scroll-artifact-reveal —— 对话记录滚动 + 产物揭示
- [blueprints/typewriter-reveal.md](blueprints/typewriter-reveal.md) —— typewriter-reveal —— 打字机揭示
- [blueprints/video-text-pivot.md](blueprints/video-text-pivot.md) —— video-text-pivot —— 视频 → 文字转向
- [blueprints/zoom-out-workspace-reveal.md](blueprints/zoom-out-workspace-reveal.md) —— zoom-out-workspace-reveal —— 拉远揭示工作区
- [references/motion-blur.md](references/motion-blur.md) —— 运动模糊 —— 任何动画元素上的快门拖影
- [rules-index.md](rules-index.md) —— 规则索引
- [rules/3d-camera-flight.md](rules/3d-camera-flight.md) —— 3D Camera Flight（3D 镜头飞行）
- [rules/3d-page-scroll.md](rules/3d-page-scroll.md) —— 3D Page Scroll（3D 页面滚动）
- [rules/3d-text-depth-layers.md](rules/3d-text-depth-layers.md) —— 3D Text Depth Layers（3D 文字纵深图层）
- [rules/ai-tracking-box.md](rules/ai-tracking-box.md) —— AI Tracking Box（AI 跟踪框）
- [rules/ambient-glow-bloom.md](rules/ambient-glow-bloom.md) —— Ambient Glow Bloom（环境辉光绽放）
- [rules/anchored-layout-expand.md](rules/anchored-layout-expand.md) —— 锚定布局展开
- [rules/asr-keyword-glow.md](rules/asr-keyword-glow.md) —— ASR 关键词发光
- [rules/avatar-cloud-network.md](rules/avatar-cloud-network.md) —— 头像云网络
- [rules/camera-cursor-tracking.md](rules/camera-cursor-tracking.md) —— 两阶段摄像机光标跟踪
- [rules/card-morph-anchor.md](rules/card-morph-anchor.md) —— 卡片形变锚点
- [rules/center-outward-expansion.md](rules/center-outward-expansion.md) —— 中心向外扩散
- [rules/chart-scrub-readout.md](rules/chart-scrub-readout.md) —— 图表拖动读数
- [rules/chromatic-glitch.md](rules/chromatic-glitch.md) —— 色差故障
- [rules/context-sensitive-cursor.md](rules/context-sensitive-cursor.md) —— 上下文感知光标
- [rules/control-target-sync.md](rules/control-target-sync.md) —— 控件-目标同步
- [rules/coordinate-target-zoom.md](rules/coordinate-target-zoom.md) —— 坐标目标缩放
- [rules/counting-dynamic-scale.md](rules/counting-dynamic-scale.md) —— 动态缩放计数
- [rules/css-marker-patterns.md](rules/css-marker-patterns.md) —— 记号笔高亮的 CSS 模式
- [rules/cursor-click-ripple.md](rules/cursor-click-ripple.md) —— 光标点击涟漪
- [rules/cursor-drag.md](rules/cursor-drag.md) —— 光标拖动
- [rules/depth-of-field-blur.md](rules/depth-of-field-blur.md) —— 景深模糊（选择性对焦 / 移焦）
- [rules/depth-scatter-assemble.md](rules/depth-scatter-assemble.md) —— 纵深散开 ↔ 组装
- [rules/discrete-text-sequence.md](rules/discrete-text-sequence.md) —— 离散文字序列
- [rules/dynamic-content-sequencing.md](rules/dynamic-content-sequencing.md) —— 动态内容排程
- [rules/gradient-text-sweep.md](rules/gradient-text-sweep.md) —— 渐变文字扫光
- [rules/gsap-effects.md](rules/gsap-effects.md) —— HyperFrames 的 GSAP 效果
- [rules/hacker-flip-3d.md](rules/hacker-flip-3d.md) —— Hacker Flip 3D 揭示
- [rules/kinetic-beat-slam.md](rules/kinetic-beat-slam.md) —— Kinetic Beat Slam
- [rules/motion-blur-streak.md](rules/motion-blur-streak.md) —— Motion-Blur Streak
- [rules/multi-cursor-choreography.md](rules/multi-cursor-choreography.md) —— Multi-Cursor Choreography
- [rules/multi-phase-camera.md](rules/multi-phase-camera.md) —— Multi-Phase Camera
- [rules/nudge-curve.md](rules/nudge-curve.md) —— Nudge Curve
- [rules/orbit-3d-entry.md](rules/orbit-3d-entry.md) —— 带 3D 入场的轨道运动（Orbit with 3D Entry）
- [rules/particle-burst.md](rules/particle-burst.md) —— Particle Burst
- [rules/physics-press-reaction.md](rules/physics-press-reaction.md) —— Physics Press Reaction（光标 + 元素同步）
- [rules/press-release-spring.md](rules/press-release-spring.md) —— Press-Release Spring Chain
- [rules/reactive-displacement.md](rules/reactive-displacement.md) —— Reactive Displacement
- [rules/scale-swap-transition.md](rules/scale-swap-transition.md) —— Scale-Swap Transition
- [rules/sine-wave-loop.md](rules/sine-wave-loop.md) —— Sine Wave Loop（含蓄抖动 / 有界环境运动）
- [rules/split-tilt-cards.md](rules/split-tilt-cards.md) —— Split Tilt Cards
- [rules/spring-pop-entrance.md](rules/spring-pop-entrance.md) —— Spring-Pop Entrance
- [rules/stat-bars-and-fills.md](rules/stat-bars-and-fills.md) —— Stat Bars & Fills
- [rules/svg-icon-enrichment.md](rules/svg-icon-enrichment.md) —— SVG Icon Enrichment
- [rules/svg-path-draw.md](rules/svg-path-draw.md) —— SVG Path Draw
- [rules/theme-crossfade-morph.md](rules/theme-crossfade-morph.md) —— Theme Crossfade Morph
- [rules/vertical-spring-ticker.md](rules/vertical-spring-ticker.md) —— Vertical Spring Ticker（老虎机）
- [rules/viewport-change.md](rules/viewport-change.md) —— Viewport Change（虚拟镜头）
- [rules/waterfall-entry.md](rules/waterfall-entry.md) —— 瀑布入场（Waterfall Entry）
- [techniques.md](techniques.md) —— 视觉技法参考
- [transitions/TRANSITION-REGISTRY.md](transitions/TRANSITION-REGISTRY.md) —— 转场 registry——机器用的唯一事实来源
- [transitions/catalog.md](transitions/catalog.md) —— 转场目录
- [transitions/css-3d.md](transitions/css-3d.md) —— css-3d
- [transitions/css-blur.md](transitions/css-blur.md) —— css-blur
- [transitions/css-cover.md](transitions/css-cover.md) —— css-cover
- [transitions/css-destruction.md](transitions/css-destruction.md) —— css-destruction
- [transitions/css-dissolve.md](transitions/css-dissolve.md) —— css-dissolve
- [transitions/css-distortion.md](transitions/css-distortion.md) —— css-distortion
- [transitions/css-grid.md](transitions/css-grid.md) —— css-grid
- [transitions/css-light.md](transitions/css-light.md) —— css-light
- [transitions/css-mechanical.md](transitions/css-mechanical.md) —— css-mechanical
- [transitions/css-other.md](transitions/css-other.md) —— css-other
- [transitions/css-push.md](transitions/css-push.md) —— css-push
- [transitions/css-radial.md](transitions/css-radial.md) —— css-radial
- [transitions/css-scale.md](transitions/css-scale.md) —— css-scale
- [transitions/overview.md](transitions/overview.md) —— 场景转场
