---
name: hyperframes-creative
description: >
  HyperFrames 视频中动画之外的创意指导。用于设计规范（frame.md / design.md）的处理、色板、字体排印、旁白、段落节拍规划、音频响应式视觉、composition 模式，以及品牌 / 风格决策。原子级运动模式和场景蓝图请使用 `hyperframes-animation`。
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/SKILL.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

**插件安装：** 当本 skill 位于 HyperFrames 插件内时，在执行安装或更新类命令之前，先遵循 [插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装的则沿用下面的更新说明。

# HyperFrames Creative

品牌、节奏、风格、旁白和 composition 方面的指导。在 `hyperframes-core` 的技术契约就位之后使用。

运动模式、场景蓝图、转场以及 CSS 标记效果，请使用 `hyperframes-animation` —— 本 skill 有意不涉及动画。

> **对于任何不简单的 composition，先读这两份 —— 它们会推翻你做网页的本能：**
>
> - `references/house-style.md` —— 「解读 prompt，生成真实内容」、偷懒默认值清单，以及背景 / 前景分层配方。正是它把字面上的换个样式变成一个*概念*。
> - `references/video-composition.md` —— 视频媒介的尺度、纵深和前景细节。它讲解如何避免空洞的网页式布局，同时又不强加一个通用的元素数量。
>
> 跳过这两份，是产出千篇一律、看起来像网页的结果的头号原因。它们不是下面路由表里可有可无的行 —— 只要不是改一行的小修改，在选颜色或写 HTML 之前就把两份都打开读。

## 工作流

1. 如果项目有设计规范，**先读它**，并把它 frontmatter 里的 token 当作品牌的事实依据（颜色、字体、间距、语气、约束）。读哪个文件（优先级 `frame.md` → `design.md` → `DESIGN.md`）以及如何解析它（frontmatter = 规范性内容，正文 = 背景信息）统一定义在 [`references/design-spec.md`](references/design-spec.md) 里 —— 按那份文档解析并加载。
2. 如果没有设计规范，而用户要求给出视觉方向，就选一条路由：
   - 现成的 frame-preset（可选）→ `frame-presets/`（把某个 `FRAME.md` 采纳为 `frame.md`；见 `references/design-spec.md`）
   - 具名的风格或情绪 → `references/visual-styles.md`
   - 快速默认值 → `references/house-style.md`
   - 交互式挑选 → `references/design-picker.md`
3. 对于多场景的工作，在写 HTML 之前先规划段落节拍和节奏 → `references/beat-direction.md`。场景转场直接去看 `hyperframes-animation/transitions/`。
4. 对于运动很重的工作，先读 `references/motion-principles.md`（高层护栏），然后去 `hyperframes-animation` 看原子级规则。

## 路由

| 主题 | 阅读 |
| --- | --- |
| 把现成的 frame-preset 采纳为 `frame.md`（可选） | `frame-presets/` · `references/design-spec.md` |
| 默认色板、运动、字体排印，以及需要质疑的偷懒默认值 | `references/house-style.md` |
| 具名风格 preset、从情绪到风格的路由 | `references/visual-styles.md` |
| 各色板专属的颜色 token | `palettes/*.md` |
| Composition 模式 —— 画中画（PiP）、文字在主体背后、标题卡、幻灯片放映 | `references/composition-patterns.md` |
| 数据 / 信息图的呈现 | `references/data-in-motion.md` |
| 对开放式 prompt 做结构化扩写 | `references/prompt-expansion.md` |
| 视频媒介的密度、尺度、颜色、画面构图 | `references/video-composition.md` |
| 逐段落节拍的指导、节奏规划、转场时机 | `references/beat-direction.md` |
| 编写完成后的规范核查（颜色、字体、圆角、间距、纵深） | `references/design-adherence.md` |
| 高层运动护栏和 GSAP 质量规则 | `references/motion-principles.md` |
| 字体选择、搭配，以及渲染视频里的字体护栏 | `references/typography.md` |
| 故事准则 —— 钩子语言、先讲价值再给证据、分镜即提案、可追溯到来源的视觉 | `references/story-spine.md` |
| 脚本节奏、语气、开场、数字读法 | `references/narration.md` |
| 映射到运动上的预计算音频频段 | `references/audio-reactive.md` |

## 脚本

- `scripts/contrast-report.mjs` —— 检查渲染帧中的对比度警告。
- `scripts/extract-audio-data.py` —— 为音频响应式 composition 预先提取音频频段。
- `scripts/package-loader.mjs` —— 为随附的创意工具提供支持的脚本。

`contrast-report.mjs` 会先从当前项目里解析辅助包，然后可以引导安装随附的 HyperFrames 包版本。只有在随附的 CLI/skill 安装之外运行本 skill、并且需要显式锁定那个引导版本时，才设置 `HYPERFRAMES_SKILL_PKG_VERSION=<version>`。

使用显式路径运行，例如：

```bash
python <SKILL_DIR>/scripts/extract-audio-data.py <audio-file>
```

动画分析（`animation-map.mjs`）放在 `hyperframes-animation/scripts/` 里。

## 边界

- 不要推翻 `hyperframes-core` 的技术规则。
- 对于最小的技术性 composition，不要要求设计系统。
- 不要额外添加场景、旁白、音乐、字幕或转场，除非请求要求这些，或者你先提出了扩展方案。
- 让配方类参考文档的阅读与任务对应；简单的编辑不要把每份参考文档都读一遍。

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [frame-presets/biennale-yellow/FRAME.md](frame-presets/biennale-yellow/FRAME.md) —— Biennale Yellow — Frame (video / frame layer)
- [frame-presets/blockframe/FRAME.md](frame-presets/blockframe/FRAME.md) —— BlockFrame — Frame (video / frame layer)
- [frame-presets/blue-professional/FRAME.md](frame-presets/blue-professional/FRAME.md) —— Blue Professional — Frame (video / frame layer)
- [frame-presets/bold-poster/FRAME.md](frame-presets/bold-poster/FRAME.md) —— Bold Poster — Frame (video / frame layer)
- [frame-presets/broadside/FRAME.md](frame-presets/broadside/FRAME.md) —— Broadside — Frame (video / frame layer)
- [frame-presets/capsule/FRAME.md](frame-presets/capsule/FRAME.md) —— Capsule — Frame (video / frame layer)
- [frame-presets/cartesian/FRAME.md](frame-presets/cartesian/FRAME.md) —— Cartesian — Frame (video / frame layer)
- [frame-presets/cobalt-grid/FRAME.md](frame-presets/cobalt-grid/FRAME.md) —— Cobalt Grid — Frame (video / frame layer)
- [frame-presets/code-editorial/FRAME.md](frame-presets/code-editorial/FRAME.md) —— Code editorial — Frame (video / frame layer)
- [frame-presets/coral/FRAME.md](frame-presets/coral/FRAME.md) —— Coral — Frame (video / frame layer)
- [frame-presets/creative-mode/FRAME.md](frame-presets/creative-mode/FRAME.md) —— Creative Mode — Frame (video / frame layer)
- [frame-presets/daisy-days/FRAME.md](frame-presets/daisy-days/FRAME.md) —— Daisy Days — Frame (video / frame layer)
- [frame-presets/editorial-forest/FRAME.md](frame-presets/editorial-forest/FRAME.md) —— Editorial Forest — Frame (video / frame layer)
- [palettes/bold-energetic.md](palettes/bold-energetic.md) —— 大胆 / 活力（Bold / Energetic）
- [palettes/clean-corporate.md](palettes/clean-corporate.md) —— 简洁 / 企业（Clean / Corporate）
- [palettes/dark-premium.md](palettes/dark-premium.md) —— 暗色 / 高级（Dark / Premium）
- [palettes/jewel-rich.md](palettes/jewel-rich.md) —— 宝石 / 浓郁（Jewel / Rich）
- [palettes/monochrome.md](palettes/monochrome.md) —— 单色（Monochrome）
- [palettes/nature-earth.md](palettes/nature-earth.md) —— 自然 / 大地（Nature / Earth）
- [palettes/neon-electric.md](palettes/neon-electric.md) —— 霓虹 / 电光（Neon / Electric）
- [palettes/pastel-soft.md](palettes/pastel-soft.md) —— 粉彩 / 柔和（Pastel / Soft）
- [palettes/warm-editorial.md](palettes/warm-editorial.md) —— 暖调 / 编辑感（Warm / Editorial）
- [references/audio-reactive.md](references/audio-reactive.md) —— 音频响应动画
- [references/beat-direction.md](references/beat-direction.md) —— 段落节拍导演
- [references/composition-patterns.md](references/composition-patterns.md) —— Composition 图式
- [references/data-in-motion.md](references/data-in-motion.md) —— 运动中的数据
- [references/design-adherence.md](references/design-adherence.md) —— 设计遵循度
- [references/design-picker.md](references/design-picker.md) —— 设计选择器
- [references/design-spec.md](references/design-spec.md) —— 设计规范 —— frame.md / design.md
- [references/house-style.md](references/house-style.md) —— 内部风格（House Style）
- [references/motion-principles.md](references/motion-principles.md) —— 运动原则
- [references/narration.md](references/narration.md) —— 旁白与脚本
- [references/prompt-expansion.md](references/prompt-expansion.md) —— Prompt 扩写
- [references/story-spine.md](references/story-spine.md) —— 故事主干 —— 价值优先的叙事准则
- [references/storyboard-recipe.md](references/storyboard-recipe.md) —— 分镜配方 —— 像发布影片那样规划一支视频
- [references/typography.md](references/typography.md) —— 字体排印
- [references/video-composition.md](references/video-composition.md) —— 视频构图
- [references/visual-styles.md](references/visual-styles.md) —— 视觉风格库
