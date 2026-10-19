---
name: remotion-to-hyperframes
description: >
  把一个现有 Remotion（React）composition 的源码移植成 HyperFrames HTML。仅在用户明确要求移植 / 转换 / 迁移 / 翻译某份 Remotion 源码时使用 —— 单向，仅限 Remotion。顺带提到 Remotion、只作参考的代码，或者「做一个像我那个 Remotion 视频一样的东西」，都属于全新构建（/general-video）。拿不准 → /hyperframes。
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/remotion-to-hyperframes/SKILL.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

**插件安装：** 当本 skill 位于 HyperFrames 插件内时，在执行安装或更新命令之前，先遵循 [插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装则沿用下面的更新说明。

> **首先，保持本 skill 为最新 —— 运行前先征得用户确认：** `npx hyperframes skills update remotion-to-hyperframes`。一切都是最新时它会快速空跑；否则它会刷新本 skill 以及它所依赖的核心领域 skill，然后你再依赖它们。

# Remotion to HyperFrames

> **入口是 `/hyperframes`。** 本 skill **仅**用于把一个现有 **Remotion**（React）composition 的源码单向移植到 HyperFrames。编写一个**新的** composition、从非 Remotion 的来源重新创作（After Effects、Framer Motion、纯 React / CSS —— 这些都没有 Remotion 源码可供翻译）、顺带提到 Remotion，或者任何拿不准的情况 → 先读 `/hyperframes`：意图层掌管每一个路由决策。

## 概览

把基于 React 的 Remotion 视频 composition 翻译成 HyperFrames（HTML + GSAP）composition。大多数 Remotion 惯用写法都有直接对应的 HyperFrames 等价物 —— 对约 80% 的典型 composition 来说，翻译是机械性的。本 skill 把这套映射编码下来，并防范那有损的 20%：对不适合 HF 的 seek 驱动模型的模式拒绝翻译，转而推荐 PR #214[^pull-214] 中的 runtime 互操作模式。

本 skill 附带一套**分级测试语料库**（T1–T4，共 4 个 fixture），按实测得出的 SSIM 阈值给翻译打分。不跑 eval 就不要翻译 —— 一个"看起来没问题"、但渲染结果比经过验证的基线低 0.05 SSIM 的翻译，是在悄无声息地出错。

## 何时使用

**仅当用户明确要求从 Remotion 迁移时才使用本 skill。** 示例触发语句：

- "把我的 Remotion 项目移植到 HyperFrames"
- "把这段 Remotion 代码转换成 HyperFrames"
- "从 Remotion 迁移过来"
- "翻译这个 Remotion comp"
- "把它重写成 HyperFrames HTML"

**以下情况不要使用本 skill：**

- (a) 用户在编写一个**新的** HyperFrames composition，即使他们手上有一个类似的 Remotion 视频，或者正在拿它做 A/B 测试。
- (b) 用户只是顺带提到 Remotion，并没有要求迁移。
- (c) 用户分享 Remotion 代码是把它当作参考资料，而不是要求翻译。
- (d) 用户要"和我那个 Remotion 视频一样的视频"，但没有明确要求迁移源码 —— 把它当作一次全新的 HyperFrames 构建。

**不支持（婉拒 —— 这不是本 skill 做的事）：**

- **反方向。** 把 HyperFrames composition 反向导出*到* Remotion（或任何其他框架）不是一个工作流 —— 翻译只有 Remotion → HyperFrames 这一个方向。直截了当地说明这一点。
- **非 Remotion 来源。** After Effects 项目（`.aep`）、Framer Motion / 纯 React / CSS 动画，或任何其他工具的源码都不是 Remotion composition —— 没有 Remotion 源码可供翻译。通过 `/general-video` 原生地重新创作；如果 HyperFrames 无法表现它，就婉拒。

拿不准时，回到 `/hyperframes`；由它的意图层来挑选路由。

## 工作流

### Step 1：对源码做 lint

对 Remotion 源码目录运行 [`scripts/lint_source.py`](scripts/lint_source.py)。这个 lint 会检测出无法干净翻译的模式：

- **阻断项（blocker）**（拒绝翻译 + 推荐互操作）：`useState`、`useReducer`、依赖数组非空的 `useEffect`/`useLayoutEffect`、异步的 `calculateMetadata`、第三方 React UI 库（MUI、Chakra、Mantine、antd、shadcn、Radix、NextUI）。
- **警告（warning）**（去掉该结构后再翻译）：`@remotion/lambda` 配置、`delayRender`、`useCallback`、`useMemo`、自定义 hook。
- **信息（info）**（翻译时附上说明）：`staticFile`、`interpolateColors`。

只要有任何一个阻断项触发，就**停下**。阅读 [`references/escape-hatch.md`](references/escape-hatch.md)，并把其中的推荐消息呈现给用户。警告不会阻止翻译 —— 在 step 3 中去掉出问题的结构，并在 `TRANSLATION_NOTES.md` 里记下这个缺口。`@remotion/lambda` 配置是典型的警告案例：本 skill 会去掉 import 和 `renderMediaOnLambda(...)` 调用，但照常翻译 composition 的其余部分。

### Step 2：规划翻译

阅读 [`references/api-map.md`](references/api-map.md) —— 它是每一个 Remotion API 及其 HF 等价物或分主题参考文档的索引。根据源码用到了什么，确定你需要哪些主题参考文档：

| 源码包含 | 加载参考文档 |
| --- | --- |
| `Composition`、`defaultProps`、`schema`、`calculateMetadata` | [`parameters.md`](references/parameters.md) |
| `Sequence`、`Series`、`Loop`、`AbsoluteFill`、`Freeze` | [`sequencing.md`](references/sequencing.md) |
| `useCurrentFrame`、`interpolate`、`spring`、`Easing`、`interpolateColors` | [`timing.md`](references/timing.md) |
| `Audio`、`Video`、`Img`、`IFrame`、`staticFile`、`delayRender` | [`media.md`](references/media.md) |
| `TransitionSeries`、`@remotion/transitions` | [`transitions.md`](references/transitions.md) |
| `@remotion/lottie` | [`lottie.md`](references/lottie.md) |
| `@remotion/google-fonts/<Family>`、`Font.loadFont`、`@font-face` | [`fonts.md`](references/fonts.md) |

不要全部加载 —— 只加载这份源码具体需要的那些。

**表格没有映射到的任何视觉效果，都去在线目录里搜索。** 当源码画出的某种外观没有对应的 HF API 时 —— 扫描线 / CRT overlay、故障或色差处理、shader 擦除、胶片颗粒处理 —— 在用 GSAP 手写之前，先运行 `npx hyperframes catalog --query "<the effect, in plain English>" --json`。这个搜索**不需要安装任何东西**：不需要项目，不需要事先 `add`，也不需要账号。它可以在任意目录下对整个托管 registry（约 400 个 block 和 component）做排序，而 `transitions.md` 已经对 `clockWipe()` / `iris()` 走了这条路，用的是 `npx hyperframes add sdf-iris`。真实的 component 比手工近似更接近源码，所以它通常会提升 SSIM 而不是拉低它 —— 但最终仍以 Step 4 中的渲染 diff 为准。只有搜索返回的结果都不合适时才手写这个效果；无论哪种情况，都要在 `TRANSLATION_NOTES.md` 中记录这次替代。

### Step 3：生成 HF composition

输出 `index.html`，其中包含：

- 根 `<div id="stage">`，带上 composition 的 `data-composition-id`、`data-start="0"`、`data-duration`（单位为秒）、`data-fps`、`data-width`、`data-height`，外加每个标量 prop 各一个 `data-*`。
- 每个场景一个宿主 `<div>`，带 `data-composition-src="compositions/<scene>.html"` 以及 `data-start` / `data-duration` / `data-track-index`。根元素里不放嵌套布局。
- 每个场景一个 `compositions/<scene>.html`（一个 `<template>` sub-composition）：其中有负责布局的内联 `<style>`（由 CSS 设定每个被动画属性的 `from` 状态）、它的标记，以及一条按场景本地时间计时的暂停 `gsap.timeline({paused: true})`。Remotion 里每一个由 `useCurrentFrame()` 推导出的值，都变成该 timeline 上位于场景内对应偏移处的一个 tween。
- 在每个场景文件中写 `window.__timelines["<scene-id>"] = tl;`，另外为根元素自己的（可能为空的）timeline 写 `window.__timelines["<composition-id>"]`。

自定义 React 子组件内联为重复的 HTML，以 prop 接口作为模板（每个实例使用 `data-*` 的模式见 [`parameters.md`](references/parameters.md)）。

### Step 4：校验

运行 eval 工具 —— 完整指南见 [`references/eval.md`](references/eval.md)。快速路径：

```bash
# Render Remotion baseline (after npm install in the fixture)
cd remotion-src && npx remotion render <CompositionId> out/baseline.mp4

# Render HF translation
cd ../hf-src && npx hyperframes render --skill=remotion-to-hyperframes --output ../hf.mp4

# SSIM diff
../../scripts/render_diff.sh ./remotion-src/out/baseline.mp4 ./hf.mp4 ./diff
```

阈值：比源码所属复杂度层级的 `p05` 低约 0.02（见 `eval.md` 中经过验证的阈值表）。如果 diff 不通过，运行 [`scripts/frame_strip.sh`](scripts/frame_strip.sh) 查看是*哪些*帧出现了偏差，然后重读相关的 timing / sequencing / media 参考文档。

**关键**：两次渲染必须使用一致的像素格式。在 Remotion 源码的 `remotion.config.ts` 中设置 `Config.setVideoImageFormat("png")` + `Config.setColorSpace("bt709")` —— 否则 diff 测出来的是编码器差异（约 0.05 的 SSIM 损失），而不是翻译保真度。

### Step 5：记录缺口

任何没能干净翻译的内容（去掉的音量渐变、近似实现的自定义 presentation、替换掉的字体），都要在 HF 输出旁边写一份 `TRANSLATION_NOTES.md`。格式见 [`references/limitations.md`](references/limitations.md)。

## 本 skill 明确不做的事

- **翻译 React 状态机。** 通过 `useState` + `useEffect` 驱动动画的 composition，在 HyperFrames 的 seek 驱动模型下不是确定性的逐帧捕获目标。推荐 runtime 互操作模式。
- **在 HyperFrames 旁边同时运行 Remotion 的渲染流水线。** 那是 PR #214[^pull-214] 中的 runtime 互操作模式 —— 一个独立的方案，面向没能通过本 skill lint 的 composition。

（`@remotion/lambda` *不是*阻断项 —— Lambda 配置属于部署，不属于动画。本 skill 把它当作警告去掉，然后翻译其余部分。见 [`references/escape-hatch.md`](references/escape-hatch.md)。）

## 如何给你自己的翻译打分

运行测试语料库的编排脚本：

```bash
./assets/test-corpus/run.sh
```

它会运行 T1、T2、T3（渲染 + diff）和 T4（lint 校验），打印一张按层级列出的通过 / 失败表，并输出一份汇总 JSON 报告。用它在一份干净的 checkout 上验证本 skill 端到端正常工作 —— 也可以在编辑任何参考文档之后拿它做回归检查。

经过验证的基线（截至 2026-04-27）：

| 层级 | Composition 形态 | 平均 SSIM | 阈值 |
| --- | --- | --- | --- |
| T1 | 单元素淡入 | 0.974 | 0.95 |
| T2 | 多场景 + spring + 音频 + 图片 | 0.985 | 0.95 |
| T3 | 数据驱动、自定义子组件、数字递增 | 0.953 | 0.90 |
| T4 | escape-hatch（8 个 lint 案例） | 8/8 通过 | n/a |

## 本 skill 的文件 { #files }

本站加的一节：本 skill 目录下的全部文档，链接文字是相对本页的路径，后面是标题。上游正文多用行内代码写路径，这里逐个挂上链接，AI 顺链接才走得到。脚本、模板和素材不逐个列出。

- [assets/test-corpus/tier-1-title-card/README.md](assets/test-corpus/tier-1-title-card/README.md) —— Tier 1 — title-card-fade
- [assets/test-corpus/tier-2-multi-scene/README.md](assets/test-corpus/tier-2-multi-scene/README.md) —— Tier 2 — title-image-outro
- [assets/test-corpus/tier-3-data-driven/README.md](assets/test-corpus/tier-3-data-driven/README.md) —— Tier 3 — stargazed-data-driven
- [assets/test-corpus/tier-4-escape-hatch/README.md](assets/test-corpus/tier-4-escape-hatch/README.md) —— Tier 4 — escape-hatch
- [references/api-map.md](references/api-map.md) —— Remotion → HyperFrames API 映射
- [references/escape-hatch.md](references/escape-hatch.md) —— 何时退出：runtime 互操作模式
- [references/eval.md](references/eval.md) —— Eval：如何端到端地校验一次翻译
- [references/fonts.md](references/fonts.md) —— 字体翻译
- [references/limitations.md](references/limitations.md) —— 翻译的局限
- [references/lottie.md](references/lottie.md) —— Lottie 翻译：@remotion/lottie → HF lottie adapter
- [references/media.md](references/media.md) —— 媒体翻译：Audio、Video、Img、IFrame、staticFile
- [references/parameters.md](references/parameters.md) —— 参数翻译：Zod schema、defaultProps、calculateMetadata
- [references/sequencing.md](references/sequencing.md) —— Sequencing 翻译：Sequence、Series、Composition 根
- [references/timing.md](references/timing.md) —— Timing 翻译：interpolate、spring、easing
- [references/transitions.md](references/transitions.md) —— 转场翻译：@remotion/transitions → HF 交叉淡化 / shader-transitions

[^pull-214]: [PR #214](https://github.com/heygen-com/hyperframes/pull/214)，2026-10-15 读。
