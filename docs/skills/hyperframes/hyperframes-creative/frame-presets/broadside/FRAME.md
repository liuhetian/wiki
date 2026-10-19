---
version: alpha
name: Broadside — Frame (video / frame layer)
description: >
  Video-first companion to Broadside's design.md. The unit is the frame (1920×1080). Atoms are
  identical and sacred — the two-register surface system (dark ink-black / fire-orange), massive
  Barlow in lowercase weight 900 treated as graphic primitive, IBM Plex Mono chrome (uppercase,
  0.14em), the single fire-orange accent, the flat plane, and 1px hairline dividers. Composition +
  frame scale rewritten for the frame. Motion out of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  ink-black: "#111111"
  ink-black-alt: "#1A1A18"
  fire-orange: "#E85D26"
  cream: "#F0ECE5"
  cream-muted: "#888880"
  cream-hint: "#505048"
  border-dark: "#282826"
  ink-on-orange-muted: "rgba(17,17,17,0.75)"
  ink-on-orange-hint: "rgba(17,17,17,0.55)"
  ink-on-orange-faint: "rgba(17,17,17,0.40)"
  ink-on-orange-border: "rgba(17,17,17,0.20)"

typography:
  # — reading ramp —
  body:    { fontFamily: "Barlow", cqw: 1.2, weight: 400, lineHeight: 1.6 }
  lead:    { fontFamily: "Barlow", cqw: 1.6, weight: 400, lineHeight: 1.5 }
  caption: { fontFamily: "Barlow", cqw: 0.9, weight: 400, lineHeight: 1.5 }
  label:   { fontFamily: "IBM Plex Mono", cqw: 0.72, weight: 500, tracking: "0.14em", upper: true }
  # — display / hero ramp (Barlow, lowercase, negative tracking) —
  h3:      { fontFamily: "Barlow", cqw: 2.8, weight: 600, lineHeight: 1.2, lower: true }
  quote-text: { fontFamily: "Barlow", cqw: 3.8, weight: 700, lineHeight: 1.15, tracking: "-0.02em", lower: true }
  h2:      { fontFamily: "Barlow", cqw: 4.5, weight: 700, lineHeight: 1.1, tracking: "-0.02em", lower: true }
  stat-value: { fontFamily: "Barlow", cqw: 5.5, weight: 900, lineHeight: 1.0, tracking: "-0.04em" }
  h1:      { fontFamily: "Barlow", cqw: 7.5, weight: 800, lineHeight: 0.9, tracking: "-0.03em", lower: true }
  fadelist-item: { fontFamily: "Barlow", cqw: 7.5, weight: 900, lineHeight: 1.0, tracking: "-0.03em", lower: true }
  quote-mark: { fontFamily: "Barlow", cqw: 10.0, weight: 900, lineHeight: 0.6 }
  fadelist-title: { fontFamily: "Barlow", cqw: 10.5, weight: 900, lineHeight: 0.9, tracking: "-0.04em", lower: true }
  display: { fontFamily: "Barlow", cqw: 13.0, weight: 900, lineHeight: 0.88, tracking: "-0.04em", lower: true }

spacing:
  pad-x: "5.5cqw"
  pad-y: "5.5cqw"
  gap-lg: "3.5cqw"
  gap-md: "2cqw"
  gap-sm: "1cqw"

components:
  registers:
    dark: "ground {colors.ink-black}, text {colors.cream}, accent {colors.fire-orange}"
    orange: "ground {colors.fire-orange}, text {colors.ink-black}"
    description: "Two surfaces only — no cream/paper register. One register per frame."
  slide-chrome:
    rule: "1px solid {colors.border-dark} (dark) / 20% ink (orange)"
    placement: "top + bottom bars (label left, number right)"
    description: "SUPPRESSED on cover/chapter/statement/quote/end — declarative frames let type fill the field."
  kicker:
    typography: "{typography.label}"
    color: "{colors.fire-orange} (dark) / 55% ink (orange)"
    description: "Uppercase mono eyebrow."
  rule:
    backgroundColor: "{colors.fire-orange} (dark) / {colors.ink-black} (orange)"
    size: "36×2px"
    description: "Stub accent bar — the system's only ornament."
  broadside-num:
    typography: "{typography.label}"
    placement: "top-left of orange cover/chapter, low opacity"
    description: "Mono catalogue numeral."
  stat-card:
    borderTop: "1px solid {colors.border-dark}"
    typography: "{typography.stat-value} (orange on dark / ink on orange) + {typography.body} + {typography.label}"
    description: "Top-border-only block, no other borders."
  bullet:
    marker: "orange `/` mono via ::before"
    typography: "{typography.lead}"
    description: "Capped at THREE items."
  bar-track:
    borderLeft: "1px solid {colors.border-dark}"
    bars: "{colors.cream-hint}, one .accent {colors.fire-orange}"
    typography: "{typography.label} axis"
    description: "Vertical bar chart, left axis only."
  compare-panel:
    layout: "two equal panels split by a 1px vertical rule"
    payoff: "right panel may fill {colors.fire-orange}"
    description: "Before/after."
  fadelist:
    typography: "{typography.fadelist-item} ×3 at opacity 1.0/0.5/0.22 + {typography.fadelist-title}"
    description: "Three stacked words + one oversized title opposite."
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/frame-presets/broadside/FRAME.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Broadside — Frame (video / frame layer)

## 概述

帧尺度下的 Broadside 是一套**抗议海报系统，字大到不再被当作文字阅读，而成了图形基元。** 13cqw 的 Barlow `display` 让一个小写单词几乎横贯整个画面。这套系统运行在**两种语域**中：墨黑底配奶油色文字用于记录，火焰橙底配深墨色文字用于宣告。火焰橙是*唯一*的颜色——在深色上是强调色，在橙色上就是整个环境。画面是平的；层级靠字重、字号和 1px 细线。

**Barlow** 承担从展示到正文的每一种文字角色——表现力的跨度来自字重（400–900）和字号，而不是字体之间的对比。**IBM Plex Mono** 只用于辅助元素（chrome，包括数字、眉题、标签、坐标轴标签、`/` 项目符号），一律全大写并加字距。展示字是**小写**的——这是这套系统最有辨识度的单项决定，刻意反转了粗野主义的惯例。

**帧尺度下的关键特征：**

- **两种语域**——深色（奶油色文字）/ 橙色（墨色文字）。没有奶油色 / 纸色语域。
- **巨大的小写 Barlow 900**，负字距，作为图形基元（display 13cqw）。
- **火焰橙是唯一的颜色**——在深色上是强调色，在橙色上是整个环境。
- **IBM Plex Mono 辅助元素**——全大写，0.14em；`/` 项目符号；等宽的目录编号。
- **平面**——无阴影、无圆角（导航圆点除外）、无渐变；结构由 1px 细线承担。
- **低密度**——每帧一句陈述，项目符号最多三个，宣告帧上压掉辅助元素。

## 帧

### 帧工艺门槛

每一帧在做任何结构检查之前，先要过三项目测闸门：

- **眯眼**——恰好**一个展示时刻占主导**，体量是其他一切的 3–6 倍；没有任何东西与之争夺。
- **留白**——宣告帧看起来 **45–55% 是空的**；**数据网格是唯一的密集例外**。
- **克制**——**每帧一种语域**；**火焰橙是唯一的颜色**（在深色上是强调色，在橙色上是环境）；一个展示时刻；项目符号最多三个。
- **参照**——瞄准**大幅单面印刷品 / SPACE10 报告 / 只带一种响亮颜色的 Wim Crouwel 网格**；失败的样子是**多强调色的企业幻灯片**。

- **主尺寸：** 1920×1080（16:9）。字体用 **`cqw`** 编写（`px ÷ 1920 × 100 = cqw`；或者把源设计的 `vw` 按 1:1 沿用）。
- **竖屏：** 1080×1920（9:16）。**方屏：** 1080×1080（1:1）。
- **安全区：** `pad-x`/`pad-y` 5.5cqw——故意收得很紧，让巨型字挤到画面边缘。

**容器法则（承重规则）。** 每一帧的底层元素都设置 `container-type: size`；所有相对于帧的单位都是基于它的 `cqw`/`cqh`——绝不用 `vw`（按 `vw` 定尺寸的帧在非全屏时会被放大）。1px 细线保持 1px。

## 色彩

token 与源设计完全一致，分两种语域。**深色：** `{colors.ink-black}` 底，`{colors.cream}` 文字，`{colors.fire-orange}` 强调（眉题、强调数据、项目符号 `/`、引导条、引号、短线头）。**橙色：** `{colors.fire-orange}` 底，`{colors.ink-black}` 标题 + 正文，深墨色叠加层（75/55/40/20%）作为弱化色调。每帧选定一种语域并坚持到底。**没有第二种强调色**——在橙色上，强调靠墨色的字重 / 不透明度，绝不靠新的色相。橙色上不存在奶油色文字（火焰底配墨色字是绝对的）。

## 字体排印

两套字号阶梯。**阅读阶梯**（Barlow 正文 1.2cqw，等宽标签 0.72cqw）承载文案和辅助元素；**展示阶梯**（Barlow `h2` 4.5cqw → `display` 13cqw，字重 700–900）承载每一句陈述。

- **可读性下限：** 任何承重的文字行 ≥ **1.4cqw**；等宽标签只是辅助元素。
- **按长度定字号：** 根据标题的长度决定字号。整块宽度上限 **≤ 78cqw**；≤2 个词 → `display`；3–4 个词 → `h1`；5 个词以上 → `h2`。Broadside 每帧只放一个展示时刻。
- **Barlow 展示字小写、字重 700–900、负字距**（最大号 −0.04em，h2 −0.02em）。**等宽辅助元素全大写，字距 0.1em 以上。** 不用斜体，不用下划线，展示字不用全大写。

## 深度与表面

平面，这是唯一的手法。层级来自：

- **字重 + 字号对比**——主导信号（900 字重的小写展示字）。
- **1px 细线**——辅助元素条、数据卡片顶边、对比分隔线、条形轨道左边、图表基线。
- **颜色变化**——墨色上的橙色、奶油色上的墨色、奶油色上的弱化奶油色。
- **负空间**——大方、有意为之的空白区域。

**上限：** 不用 box-shadow，不做层级抬升，不用圆角表面（导航圆点除外），不用渐变底。

## 形状

- **所有地方圆角都是 0**，导航圆点（50%）除外。卡片、面板、标签、数据块、条形——全是锐利的矩形。

## 组件

- **registers**——双表面系统。**slide-chrome**——可选的细线条，在宣告帧上压掉。
- **kicker**（等宽眉题）/ **rule**（36×2 短线头）/ **broadside-num**（目录编号）——辅助元素的装饰组。
- **stat-card**（只有顶边）/ **bullet**（橙色 `/`，最多 3 个）/ **bar-track**（一根强调条）/ **compare-panel**（橙色的收益面板）/ **fadelist**（1.0/0.5/0.22 的堆叠）。

## 帧处理方式

> 配方：底（ground）· 语域（register）· 组成（composes）· 焦点（focal）· 辅助元素（chrome）· 强调（accent）· 留白（silence）· 固定/可变（Fixed/Free）· 密度（density）。
> 每帧一句陈述；宣告帧上压掉辅助元素。

### 1 · Cover（身份 · 手法：巨型字 · 橙色语域 · 居左）

**底** 火焰橙。**组成** broadside-num、rule、kicker、display、lead。**焦点** 一个 1–2 个词的小写墨色 Barlow `display`（13cqw），左侧锚定，位于一小段墨色短线头 + 等宽眉题之上；下方一行 75% 墨色的 Barlow 引导语。**辅助元素** 左上角等宽目录编号，右上角等宽元信息（不要辅助元素条）。**强调** 墨色本身就是橙色上的亮点。**留白** 约 45%。**固定** 火焰底配墨色字、小写 900、平面。**可变** 单词、眉题、引导语。**密度** 低。

### 2 · Statement（宣告 · 手法：字本身就是构图 · 深色语域 · 居左）

**底** 墨黑。**组成** kicker、display。**焦点** 一个 2–4 个词的奶油色小写 Barlow `display`/`h1`，其中只有一个分句用 `{colors.fire-orange}` 着色。**辅助元素** 等宽眉题；不要条。**强调** 橙色分句。**留白** 约 55%。**固定** 小写 900、一个橙色分句、平面。**可变** 陈述内容、哪个分句用橙色。**密度** 低。

### 3 · Stat Grid（数据 · 手法：顶边卡片 · 深色 · 那个密集帧）

**底** 墨黑，带辅助元素条。**组成** slide-chrome、kicker、3 张 stat-card。**焦点** 一排三张只有顶边的 stat-card——`{colors.fire-orange}` 色的大号 Barlow-900 数字、Barlow 标签、等宽注释。**辅助元素** 顶部 + 底部细线条（标签 + 编号）。**强调** 橙色数字。**留白** 适中——这是密度例外。**固定** 只有顶边的卡片、橙色数字、1px 细线。**可变** 数字（来自脚本）、标签。**密度** 密集例外。

### 4 · Fadelist（叙事 · 手法：不透明度堆叠 · 深色）

**底** 墨黑。**组成** fadelist（3 个堆叠的 Barlow-900 单词，不透明度 1.0/0.5/0.22）、fadelist-title。**焦点** 三级单词堆叠，对面是一个 `{colors.fire-orange}` 色的超大展示标题（之前 / 之中 / 之后）。**强调** 橙色标题。**留白** 适中。**固定** 不透明度阶梯、小写 900。**可变** 三个单词、标题。**密度** 低到适中。

### 5 · Pull Quote（引语 · 手法：超大引号 · 深色 · 居左）

**底** 墨黑，压掉辅助元素。**组成** quote-mark、quote-text、attribution。**焦点** 一段 ≤78cqw 的 Barlow `quote-text`（700，小写），上方是一个超大的火焰橙 `quote-mark`（10cqw，行高 0.6）。**辅助元素** 等宽署名（姓名 + 身份）。**强调** 橙色引号。**留白** 约 50%。**固定** 橙色引号、小写引语。**可变** 引语、署名。**密度** 低。

### 6 · Compare（论证 · 手法：分屏 + 橙色收益 · 深色→橙色）

**底** 左侧墨黑面板 + 右侧火焰橙（收益）面板，1px 分隔线。**组成** 一对 compare-panel、kicker、h3。**焦点** 两块面板——左边记录（深色上的奶油色），右边宣告（橙色上的墨色）。**辅助元素** 等宽面板标签。**强调** 橙色收益面板。**留白** 适中。**固定** 右侧火焰底配墨色字的面板、1px 分隔线、平面。**可变** 之前 / 之后的内容。**密度** 标准。

## 构图规则

### 要做

- 每个 Barlow 展示字都用**小写、字重 900**，负字距——这是这套系统的标志。
- 在宣告帧上把**火焰橙用作整个环境**，在深色上把它用作**唯一的强调色**。
- 辅助元素一律用 **IBM Plex Mono 全大写，0.14em**；使用 `/` 等宽项目符号。
- **项目符号最多三个；每帧一句陈述**；用字重、字号、1px 细线建立层级。
- 在 cover / chapter / statement / quote / end 帧上压掉辅助元素条；让字填满画面。
- 大多数帧靠左；字本身就是构图。

### 不要做

- 绝不把 Barlow 展示字设成全大写；绝不加第二种强调色。
- 绝不在橙色上放奶油色文字（火焰底配墨色字是绝对的）；绝不用奶油色 / 纸色语域。
- 不要投影，不要圆角表面（导航圆点除外），不要渐变底。
- 不要搭配衬线字体；辅助元素绝不用 Barlow。
- 不要在一帧里塞两个展示时刻；不要让一长行从边到边撑满——降一档字号。

## 宽高比适配

| 处理方式 | 16:9 | 9:16 | 1:1 |
| --- | --- | --- | --- |
| Cover | 单词居左，引导语在下 | 单词在上，引导语在下 | 单词居中 |
| Statement | 展示字居左 | 展示字竖向堆叠、更高 | 展示字居中 |
| Stat Grid | 横排 3 个 | 竖排 3 个 | 2+1 |
| Fadelist | 堆叠 + 标题左右并排 | 堆叠在标题上方 | 堆叠在标题上方 |
| Pull Quote | 引号 + 引语居左 | 引号在上，引语在下 | 居中 |
| Compare | 面板左右并排 | 竖向堆叠（深色在橙色上方） | 竖向堆叠 |

`pad-x` 在短边上保持紧凑；重新选择展示字的字号档位，让那一大行保持 ≤78cqw，同时不低于 1.4cqw 的下限。等宽辅助元素只用拉丁字母和数字。

## 已批准实体

源文件里没有定义任何真实客户、logo 或供应商——任何此类标记都渲染成占位符（55cqh 的虚线 `img-placeholder`）。这套系统提供的是字体和一种颜色，不是品牌。

## 数字与声明（硬规则）

绝不在帧尺度上编造数字、百分比、日期或计数。把槽位渲染成 `— figure —`、`{metric}`、`NN%`。stat-card 的数字和条形高度一直用占位符，直到脚本提供数值为止。目录编号（No. 01）是装饰性的辅助元素，可以按顺序编号。

## 渲染前自查

- **眯眼**——恰好一个展示时刻占主导；没有任何东西与之争夺。
- **留白**——宣告帧约 45–55% 是空的；只有数据网格是密集的。
- **语域**——每帧一种语域；橙色上用火焰底配墨色字，深色上用奶油色；没有第二种色相。
- **字体**——Barlow 小写 900、负字距、按长度定字号；等宽辅助元素全大写 0.14em；下限 ≥1.4cqw。
- **深度**——0 阴影，0 圆角（导航圆点除外）；只用 1px 细线。
- **项目符号**——最多三个，橙色 `/` 符号。
- **编造**——每个数字都能追溯到脚本，否则用占位符。

## 已知缺口

- **动效有意不在范围内。** frame.md 只规定构图；源设计中 0.8s 的幻灯片切换 + 逐元素入场动画属于演示文稿的机制。
- **Barlow + IBM Plex Mono 通过 Google Fonts 加载**；Noto Sans SC 是 CJK 兜底字体（小写展示字这个信号没有 CJK 对等物——按源设计的说法，由双语域配色系统来承载识别度）。
- **9:16 / 1:1 只是指导**；按每种比例检查那一大行是否保持 ≤78cqw 且不低于下限。
- 条形、对比面板和虚线图片占位符都是纯 CSS 实现；不需要外部图片。
