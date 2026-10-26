---
name: hyperframes-core
description: >
  HyperFrames 的 composition 契约 —— 构建一个可渲染的项目。用于 composition 结构、`data-*` 计时属性、`class="clip"`、track、sub-composition、变量、由框架掌管的媒体播放、确定性渲染规则以及校验。编写 composition HTML 之前先读它。
---

**插件安装：** 当本 skill 位于 HyperFrames 插件内时，在执行安装或更新类命令之前，先遵循 [插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装的则沿用下面的更新说明。

# HyperFrames Core

**Agent 常见陷阱（先读）：**

- 居中用 flex/`inset`，不要在一个随后还要用 GSAP 动 `x`/`y` 的节点上写 CSS `transform: translate(-50%,-50%)`。Lint：`gsap_css_transform_conflict`。改用 `fromTo` 或 `xPercent`/`yPercent`。
- 不要加场景退出用的 `tl.set(..., {visibility:"hidden"})`。runtime 已经会隐藏有时间窗口的 clip。对内部节点做透明度淡出（或对 `.clip` 用 `opacity`）就够了。字幕的强制清除是另一条规则。
- `window.__timelines["id"]` 必须与根元素的 `data-composition-id` 一致。
- `render` 之后，读摘要的第二行：`beginframe` 还是 `screenshot`、GPU 模式、各阶段耗时。Linux 上 `screenshot` + `software gpu` 是慢路径。

HyperFrames 用 HTML 渲染视频。一个 composition 就是一个 HTML 文件：它的 DOM 用 `data-*` 属性声明计时，它的动画 runtime 可以 seek，它的媒体播放由框架掌管。

本 skill 是**技术契约** —— 讲如何构建一个 hyperframes 项目。下面的正文是构建指南；各主题的细节放在 `references/`（索引见下），按需阅读。流程类文档（brief、分镜、评审、制作、派发、frame-worker）放在 `/hyperframes` → `references/`。其他关注点放在同级的领域 skill 里 —— `hyperframes-animation`、`hyperframes-creative`、`media-use`、`hyperframes-cli`、`hyperframes-registry`。`/hyperframes` 里的能力地图说明了每个 skill 各管什么。

## 参考文档

| 文件 | 读它来…… |
| --- | --- |
| `references/minimal-composition.md` | 从最小的可渲染 composition 骨架起步 |
| `references/composition-patterns.md` | 在单体式和模块化之间做选择；组织模块化的 `index.html`；挑选 sub-comp 原型 |
| `references/data-attributes.md` | 查任意 `data-*`（根元素 / clip / sub-comp 宿主 / 旧版别名）；使用 `class="clip"` |
| `references/tracks-and-clips.md` | 弄清 `data-track-index` 控制什么（以及不控制什么）、z-index、如何相对另一个 clip 计时；用 `npx hyperframes timeline` 列出每个 track 和 clip |
| `references/creator-editing-recipes.md` | 照抄如实可行的剪切 / 修剪 / 重排 / 重新计时 / 定格 / 镜头 / 遮罩 / 交叉淡化 / 音频编辑配方，以及它们的局限 |
| `references/sub-compositions.md` | 接线一个 sub-composition（宿主属性、`<template>`、每个实例的变量）并在其内部做动画 |
| `references/variables-and-media.md` | 声明变量；放置 `<video>`/`<audio>`、设置音量、修剪 |
| `references/determinism-rules.md` | 构建可 seek 的 timeline；确定性禁令；布局 / 文字适配 |
| `references/full-screen-motion.md` | 编写带共享背景的全画幅运动 |
| `references/tailwind.md` | 在 Tailwind v4 项目里工作（`init --tailwind`；runtime 契约与 Studio 的 v3 不同） |

动画 runtime 的具体细节（GSAP API、Lottie、Three.js 等）去看 `hyperframes-animation` → `adapters/<runtime>.md`。

## 构建 composition

### 两种根形态（不可互换）

- **独立式**（顶层 `index.html`）：根 `<div data-composition-id="…">` 直接放在 `<body>` 里，**不要用 `<template>` 包裹**。包裹独立式根元素会隐藏所有内容，`lint` 会拒绝它（`standalone_composition_wrapped_in_template`，error）。
- **Sub-composition**（通过 `data-composition-src` 加载）：用 `<template>` 包裹根元素。应该写的就是这种形态：加载器也接受一个普通的完整文档并回退到它的 `<body>`，但示例和工具链默认的都是 template 形态。

> ⚠ 传输规则：对于 **template 形态**的 sub-composition，组装器会丢掉该文件自己 `<head>` 里的 `<style>`/`<script>`（`packages/core/src/compiler/compositionAssembly.ts`，即 `hasTemplate` 闸门），所以要把 `<style>`/`<script>` 放在 template **内部**。`<link>` 无论哪种都会被提升。
> ⚠ 宿主 id 约定：给宿主槽位、内部 template 以及 `window.__timelines["<id>"]` 的键使用**同一个** id。使用不同的本地 id 也受支持（组装器会回退到文件里的第一个根元素），但这种不一致是静默的，所以除非有理由，否则让它们保持一致。

文件形态、宿主接线以及渲染前检查清单 → `references/sub-compositions.md`。

### 根元素必须有尺寸（静默的布局 bug）

独立式根元素写 `width`/`height: 100%`。画布尺寸由 `data-width`/`data-height` 决定。runtime 会把这些像素值盖到 composition 根元素上。不要在 `#root` 上硬编码 `1920px`/`1080px`。骨架 → `references/minimal-composition.md`。

### 一条暂停的 timeline

每个 composition 在 `window.__timelines["<id>"]`（键 = 根元素的 `data-composition-id`）上注册**恰好一条** `gsap.timeline({ paused: true })`。在异步回调（`document.fonts.ready`）里构建它是受支持的；关键在于**只在构建完成后才注册**。渲染时长取根元素的 `data-duration`，**而不是** timeline 的长度：超出它的 timeline 会被截断，提前结束的则会停留在最后一帧。省略根元素的 `data-duration` 时，时长改为推断得出（来自 timeline、媒体窗口或 adapter）。你不需要写 `window.__timelines = window.__timelines || {}`：runtime 会在你的内联脚本运行前创建好这个注册表，`lint` 也不再要求它。不要手动把子 timeline 嵌套进宿主；runtime 会自动嵌套已注册的子 timeline。完整契约（含非 GSAP 的 runtime）→ `references/determinism-rules.md` + `hyperframes-animation/adapters/`。

### 首轮 lint 易错点（第一次构建必定失败的地方）

这些规则 `lint` **确实**能抓到，但只是事后才抓到。第一次就写对：

- 绝不要让 CSS 初始 `transform` 和 GSAP tween 作用于**同一个**属性 —— CSS 值和 tween 的起始值会打架，`lint` 会以 `gsap_css_transform_conflict` 拒绝它。用 `gsap.fromTo(el, { x: -40 }, { x: 0 })` 在 tween 内设定初始状态，而不是用 CSS `transform: translateX(-40px)`。
- 绝不要在 `<video>`/`<audio>` 上加 `crossorigin`。`lint` 会无条件以 `media_crossorigin_breaks_preview`（error）拒绝它，即使是为了 canvas/WebGL/WebAudio 回读也一样。没有办法抑制。
- 绝不要让 `<video data-start>` 的祖先元素也带有 `data-start`。`lint` 会以 `video_nested_in_timed_element`（error）拒绝它。给包裹层**或**视频计时，不要两者都给。
- 每个 `<audio>` 都需要一个 `id`。`lint` 会以 `media_missing_id` 拒绝它，而且没有 id 的 `<audio>` 永远不会被混音器接收，于是渲染结果是**无声的**。
- 绝不要用 `autoAlpha` 或 `visibility` 对 `.clip` 做 tween —— `lint` 会以 `gsap_animates_clip_element` 拒绝它。改为对子元素做动画。
- 具名的 CSS `font-family` 需要文件内有一条指向随项目附带的本地文件的 `@font-face`，否则 `lint` 会触发 `font_family_without_font_face`。
- Sub-composition 的 `#root` 使用 `width`/`height: 100%`（或 `inset: 0`），不要硬编码 `1920px`/`1080px`。画布尺寸由 `data-width`/`data-height` 决定。

lint 的 **error** 还会关掉布局和对比度审查：此时 `check` 报告 `0 sample(s)` 和 `0/0 text checks`，看起来像文件很干净，实际上什么都没跑。先清掉 lint error，再相信这些数字。

### 不可妥协的规则（自动闸门可能漏掉的静默 bug）

这里只列出要点；完整理由见所链接的参考文档。不得违反：

- 不要使用渲染时的时钟 / 未设种子的 `Math.random` / 网络 / 输入状态；`repeat: -1` 只能在有限的根 `data-duration` 下使用（导出会被截断到这个时长 —— 否则请使用有限的次数）。→ `determinism-rules.md`
- 绝不要对 `.clip` 元素的 `display`、`visibility` 或 `autoAlpha` 做 tween。clip 的可见性由框架掌管，`lint` 会拒绝它（`gsap_animates_clip_element`）。改为对子元素做动画。→ `determinism-rules.md`
- 正文文字里不要用 `<br>`；被变换的元素必须是块级元素并且有尺寸；做脉冲动画的绝对定位装饰元素需要为峰值留出余量。→ `determinism-rules.md`
- `<video>`/`<audio>` 是通过扁平的文档查询找到的，所以框架能在**任意嵌套深度**（包括 sub-comp 的 `<template>` 或包裹层内部）seek 并解码它们。有一条硬限制：如果 `<video data-start>` 位于另一个同样带有 `data-start` 的**普通**元素内部，`lint` 会报 error，而且这个故障是真实存在的（源帧取错，然后 clip 在其时间槽中途消失），所以把计时放在包裹层上或视频上，绝不要两者都放。Sub-composition 宿主不受此限：sub-composition 内的媒体能正确渲染。另一个需要注意的地方在于 timeline 而不在于放置位置：sub-comp 的 timeline 无法为宿主根元素上的元素做动画。→ `variables-and-media.md`
- 让每个 `id` 在**组装后**的页面中保持唯一（用 composition id 给 sub-comp 的 id 加前缀，`#<id>-hero`），这样你自己的 `#id` CSS 和 `getElementById` 调用才能正确解析。帧注入已不再依赖于此：编译器会在每个 `video[src]`/`audio[src]`/`img[src]` 上盖一个文档内唯一的 `data-hf-render-id`。使用 `<source>` 子元素而不是 `src` 属性的媒体**不会**被盖上这个标记，所以在那种情况下唯一 id 仍然重要。→ `composition-patterns.md`
- 在 composition **根元素**上铺满全屏的填充，在普通渲染中没问题。只有在分层合成路径上（HDR 内容，或使用了 shader 转场的 composition）它才会被丢掉，因为引擎会强制每个 composition 根元素透明，好让下面的图层透出来。如果你的 composition 使用了 shader 转场或 HDR 媒体，就把填充放在一个铺满出血的**子元素**上（`position:absolute; inset:0`）。→ `composition-patterns.md`

## 编辑已有的 composition

- 先读文件。保留无关的计时、track、ID、变量、媒体路径。
- 想知道一个项目的 timeline 上有什么（track、clip、起点、终点、播放什么），运行 `npx hyperframes timeline [--json]`，而不是去读 `index.html` 和每一个 sub-composition 文件。
- 沿用已有的 composition ID 和 timeline 键。
- 添加 clip：参照它周围的 clip，有意识地设置它的 `data-start`/`data-duration`。`data-track-index` 是 Studio 的显示泳道，不是计时约束，所以它不需要是空闲的。
- 结束时间超过根元素 `data-duration` 的 clip 会被截断：在同一次编辑里把根元素的 `data-duration` 延长到该 clip 的结束时间（`lint` 会警告 `clip_ends_past_root_duration`）。
- 任意 composition 元素上的 `data-hidden` 会在预览和渲染中**都**隐藏它，并覆盖它的时间窗口；它是非破坏性的 / 可撤销的，由 Studio timeline 上的眼睛图标切换。
- 添加 sub-composition：在接线宿主之前，先核实它内部的 `data-composition-id`。

## 校验

命令细节用 `hyperframes-cli`

- [ ] `npx hyperframes check` 通过（lint、runtime、布局、运动和对比度检查共 0 条发现）
- [ ] 含 sub-composition 的项目：`npx hyperframes snapshot --at <midpoints>`，并逐帧目测
- [ ] 用 `npx hyperframes preview --background` 做评审（用户可以在 Studio 的 timeline 里编辑任何东西，而且服务器在调用它的命令结束后仍会继续运行）
- [ ] 只有在用户批准后才 `npx hyperframes render`

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [references/composition-patterns.md](references/composition-patterns.md) —— Composition 模式
- [references/creator-editing-recipes.md](references/creator-editing-recipes.md) —— 创作者剪辑配方
- [references/data-attributes.md](references/data-attributes.md) —— Data 属性参考
- [references/determinism-rules.md](references/determinism-rules.md) —— 确定性、动画 Runtime 与布局
- [references/full-screen-motion.md](references/full-screen-motion.md) —— 全屏运动模式
- [references/minimal-composition.md](references/minimal-composition.md) —— 最小 Composition
- [references/sub-compositions.md](references/sub-compositions.md) —— Sub-Composition
- [references/tailwind.md](references/tailwind.md) —— HyperFrames Tailwind
- [references/tracks-and-clips.md](references/tracks-and-clips.md) —— Track 与 Clip
- [references/variables-and-media.md](references/variables-and-media.md) —— 变量与媒体
