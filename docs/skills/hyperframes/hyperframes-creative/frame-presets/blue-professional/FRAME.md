---
version: alpha
name: Blue Professional — Frame (video / frame layer)
description: >
  Video-first companion to Blue Professional's design.md. The unit is the frame (1920×1080). Atoms
  are identical and sacred — the warm cream canvas, a single saturated cobalt (#1e2bfa) as the only
  accent, the three-step gray text ladder, Space Grotesk (display/numerals/chrome) + Inter (body),
  soft cobalt-tinted cards (4% fill / 20% border / 10–14px radius) with NO shadows, pill chrome, and
  the cobalt progress bar. Composition + frame scale rewritten. Motion out of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  bg: "#fdfae7"
  primary: "#1e2bfa"
  text: "#111111"
  text-muted: "#6b6b6b"
  text-light: "#9a9a9a"
  accent-light: "rgba(30,43,250,0.08)"
  accent-medium: "rgba(30,43,250,0.15)"
  border: "rgba(30,43,250,0.2)"
  card-bg: "rgba(30,43,250,0.04)"
  positive: "#059669"
  negative: "#dc2626"

radii:
  pill: "100px"
  card-lg: "14px"
  card-md: "12px"
  card-sm: "10px"
  bar: "6px"
  circle: "50%"

typography:
  # — reading ramp (Inter body + Space Grotesk chrome) —
  body:    { fontFamily: "Inter", cqw: 0.85, weight: 400, lineHeight: 1.6, color: "text-muted" }
  h4-eyebrow: { fontFamily: "Space Grotesk", cqw: 0.8, weight: 600, tracking: "0.08em", upper: true, color: "primary" }
  tag:     { fontFamily: "Space Grotesk", px: 12, weight: 500, color: "primary" }
  counter: { fontFamily: "Space Grotesk", px: 13, weight: 500, tracking: "0.05em", color: "text-muted" }
  # — display / numerical ramp (Space Grotesk, near-black headings / cobalt numerals) —
  h3:      { fontFamily: "Space Grotesk", cqw: 1.25, weight: 500, lineHeight: 1.3, tracking: "-0.02em", color: "text" }
  stat-num: { fontFamily: "Space Grotesk", cqw: 1.9, weight: 700, lineHeight: 1.0, color: "primary" }
  blockquote: { fontFamily: "Space Grotesk", cqw: 2.4, weight: 500, lineHeight: 1.35, color: "text" }
  h2:      { fontFamily: "Space Grotesk", cqw: 2.6, weight: 600, lineHeight: 1.1, tracking: "-0.02em", color: "text" }
  metric-value: { fontFamily: "Space Grotesk", cqw: 3.0, weight: 700, lineHeight: 1.0, color: "primary" }
  h1:      { fontFamily: "Space Grotesk", cqw: 4.2, weight: 700, lineHeight: 1.08, tracking: "-0.02em", color: "text" }
  quote-mark: { fontFamily: "Space Grotesk", cqw: 8.0, weight: 700, lineHeight: 0.5, color: "primary", opacity: 0.15 }

spacing:
  pad-x: "5cqw"
  pad-y-top: "5cqw"
  gap-cards: "1.4cqw"
  accent-line: "60px × 4px"

components:
  card-tinted:
    backgroundColor: "{colors.card-bg}"
    border: "1.5px solid {colors.border}"
    rounded: "{radii.card-lg}"
    shadow: "none"
    description: "Universal content card. Never solid-colored, never opaque-bordered, NO shadow."
  metric-card:
    backgroundColor: "{colors.card-bg}"
    border: "1.5px solid {colors.border}"
    rounded: "{radii.card-lg}"
    typography: "{typography.metric-value} ({colors.primary}) + {typography.metric-label} + {typography.metric-desc}"
    description: "+ optional inline ↑/↓ change chip ({colors.positive}/{colors.negative} text, no fill)."
  tag-pill:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.primary}"
    rounded: "{radii.pill}"
    typography: "{typography.tag}"
    description: "Top-right of the slide-header."
  cta-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "{radii.pill}"
    typography: "Space Grotesk 600"
    shadow: "soft cobalt on hover only — the system's only shadow"
    description: "The one solid element."
  accent-line:
    backgroundColor: "{colors.primary}"
    size: "60×4, 2px radius"
    description: "Above cover titles / eyebrow separators."
  bar-track:
    backgroundColor: "{colors.accent-light}"
    fill: "{colors.primary} (display:block so width resolves)"
    rounded: "{radii.bar}"
    description: "28px track; fill carries the value."
  step-circle:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "50%"
    size: "56px"
    description: "Sequential steps fade opacity 1.0→0.85→0.7→0.55."
  split-highlight:
    backgroundColor: "{colors.accent-light}"
    borderLeft: "4px solid {colors.primary}"
    rounded: "{radii.card-md}"
    description: "Inline pull-quote callout."
  slide-header:
    typography: "{typography.h4-eyebrow} (cobalt) left, tag-pill right; {typography.h2} below"
    description: "Top band of every content frame."
  atmosphere:
    elements: "clipped diagonal cobalt-tint panel, 3×3 cobalt dot grid, concentric closing rings"
    description: "Cover/closing only. Never on content frames."
  progress-bar:
    backgroundColor: "{colors.primary}"
    size: "3px tall, bottom edge, width grows with index"
    description: "Persistent progress strip."
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/frame-presets/blue-professional/FRAME.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Blue Professional — Frame (video / frame layer)

## 概述

帧尺度下的 Blue Professional 是一套**咨询级的系统：克制，外加一个坚定的承诺。** 温暖的奶油色画布，加上单一一种饱和的钴蓝，承担每一个强调 —— 眉标、指标、CTA、图表填充、进度条。没有第二种品牌色，没有粉彩色，只有奶油色、钴蓝和一组紧凑的灰阶。调性是投资研究 / 麦肯锡简报：分寸得当，数据密集却不拥挤，远看也能让高管读清楚。

它的字体声音是两款字体，各自扮演固定的角色：**Space Grotesk**（展示字、每一个数字、所有辅助元素 —— 眉标全大写、字距 0.08em）和 **Inter**（正文，柔和的灰色，行高 1.6）。标题用近黑色；钴蓝留给强调的时刻。深度是**柔和且带色调的** —— 4% 钴蓝的卡片填充，配 20% 钴蓝的边框和 10–14px 的圆角 —— 绝不用阴影。没有生硬的阴影，正是高级感的信号。

**帧尺度下的关键特征：**

- 每一帧都用**温暖的奶油色底**；**单一钴蓝**是唯一的强调色。
- **Space Grotesk**（展示字 / 数字 / 辅助元素）+ **Inter**（正文）—— 近黑色标题，钴蓝数字。
- **带色调的卡片** —— 钴蓝 4% 填充、钴蓝 20% 的 1.5px 边框、10–14px 圆角、**无阴影**。
- **胶囊形辅助元素**（100px）—— 标签胶囊 + 唯一一个实心钴蓝 CTA；钴蓝**进度条**。
- **处处柔和的圆角**（除进度条外没有直角）。
- **氛围元素**（斜向面板、点阵、同心圆环）只用在 cover / closing 上。

## 帧

### 帧工艺门槛

每一帧在做任何结构检查之前，先要过三项目测闸门：

- **眯眼** —— 一个**近黑色标题或钴蓝数字**占主导，体量是相邻元素的 3–6 倍。
- **留白** —— 内容帧看起来**均衡，而不拥挤**；**dashboard 是唯一的密集例外**。
- **克制** —— **单一钴蓝强调色**承担一切；标题保持近黑色（绝不用钴蓝）；不用阴影（由带色调的卡片负责托起感）；涨 / 跌色只用于行内文字。
- **参照** —— 瞄准**投资研究 / 麦肯锡季度简报**；失败的样子是**粗描边、多色的仪表盘**。

- **主尺寸：** 1920×1080（16:9）。展示字用 **`cqw`** 编写（`px ÷ 1920 × 100 = cqw`）。
- **竖屏：** 1080×1920（9:16）。**方屏：** 1080×1080（1:1）。
- **安全区：** `pad-x` 5cqw；底部为计数器 + 进度条预留空间。

**容器法则（承重规则）。** 每一帧的底层元素都设置 `container-type: size`；所有相对于帧的单位都是基于它的 `cqw`/`cqh` —— 绝不用 `vw`。卡片圆角保持用 px（10–14px）；胶囊圆角保持 100px；边框保持 1–1.5px。

## 色彩

token 与源设计完全一致。`{colors.bg}` 奶油色是通用的底色；`{colors.primary}` 钴蓝是**唯一**的强调色 —— 每一个眉标、数字、CTA、图表填充、进度条，以及 4px 的高亮左侧竖线。标题用 `{colors.text}` 近黑色（绝不用钴蓝）；正文用 `{colors.text-muted}`；第三级文字用 `{colors.text-light}`。卡片用 `{colors.card-bg}`（4%）填充，配 `{colors.border}`（20%）边框。`{colors.positive}`/`{colors.negative}` **只在行内**出现在表示方向变化的 chip 上 —— 绝不用作填充。**不要第二种强调色。**

## 字体排印

两套字号阶梯。**阅读阶梯**（Inter 正文 0.85cqw 柔和色；Space Grotesk 眉标全大写、字距 0.08em、钴蓝）承载文案和辅助元素（chrome）；**展示 / 数字阶梯**（Space Grotesk `h3` 1.25cqw → `h1` 4.2cqw 近黑色；数字 `stat-num`/`metric-value` 用钴蓝）承载标题和数据。

- **可读性下限：** 任何承重的文字行 ≥ **1.4cqw**；用 px 的辅助元素（标签 / 计数器）只是版权页式的附注。
- **按长度定字号：** 根据标题的长度决定字号。整块宽度上限 **≤ 78cqw**；≤3 个词 → `h1`；4–6 个 → `h2`；7 个以上 → `h3`。钴蓝数字按卡片大小在 `metric-value`→`stat-num` 之间缩放。
- **标题近黑色、字距 −0.02em**；**眉标钴蓝、全大写、字距 0.08em**；**数字钴蓝 600–700**；**正文 Inter 400 柔和色、行高 1.6**。不用斜体，不用全大写正文，不用钴蓝标题。

## 深度与表面

柔和且带色调 —— 绝不用偏移阴影。深度来自：

- **带色调的卡片** —— 4% 钴蓝填充 + 20% 钴蓝 1.5px 边框 + 10–14px 圆角，不靠偏移也显得被托起。
- **左边框强调** —— split-highlight 块上 4px 的钴蓝竖线把一段标注拉到前面。
- **圆角** —— 10–14px 的圆角是柔和感的一部分；直角会破坏它。

**上限：** 内容上零 box-shadow（唯一的阴影是钴蓝 CTA 柔和的 _hover_ 态）；不用不透明的钴蓝边框；不用生硬的描边。

## 形状

- **100px** —— 标签胶囊、CTA、导航按钮（胶囊形辅助元素）。
- **14/12/10px** —— 按尺寸区分的卡片（大指标卡 / 标准数据卡 / 详情卡 + 迷你卡）。
- **6px** —— 条形的轨道 + 填充。**50%** —— 步骤圆圈、导航圆圈、圆点、收尾圆环。
- **0** —— 只有进度条。不存在直角的内容元素。

## 组件

- **card-tinted / metric-card** —— 通用的柔和色调内容卡片（无阴影）。
- **tag-pill / cta-button / accent-line** —— 钴蓝胶囊辅助元素 + 唯一的实心 CTA + 60×4 的线条。
- **bar-track / step-circle / split-highlight** —— 钴蓝的数据 + 序列 + 标注模式。
- **slide-header**（眉标 + 标签胶囊）—— 结构上的节奏；**atmosphere**（斜向面板 / 圆点 / 圆环）只用在 cover / closing 上；每一帧都有 **progress-bar**。

## 帧处理方式

> 配方：底（ground）· 容器（container）· 组成（composes）· 焦点（focal）· 辅助元素（chrome）· 强调（accent）· 留白（silence）· 固定/可变（Fixed/Free）· 密度（density）。
> 氛围元素只用在 cover / closing 上；内容帧承载 slide-header 的节奏。

### 1 · Cover（身份 · 手法：斜向强调 · 居左）

**底** 奶油色 + 被裁切的斜向钴蓝色调面板（右侧约 36%）+ 一个 3×3 的钴蓝点阵。**组成** accent-line、元信息、h1、正文副标。**焦点** 一个 2 行的近黑色 Space Grotesk `h1`，居左，位于一条钴蓝 accent-line + 元信息下方。**辅助元素** 计数器 + 进度条。**强调** 钴蓝线条 + 斜向面板。**留白** 斜向面板占住右侧三分之一。**固定** 近黑色 h1、钴蓝强调、氛围元素只在这里出现。**可变** 标题、元信息。**密度** 低。

### 2 · Dashboard（数据 · 手法：三联指标网格 · 那个密集帧）

**底** 奶油色，`pad-x`。**组成** slide-header（眉标 + tag-pill）、h2、3 张 metric / tinted 卡片。**焦点** 一排带色调的卡片 —— 钴蓝 `metric-value` + Inter 标签 + 柔和色描述 + 可选的绿 / 红变化 chip。**辅助元素** 眉标在左，tag-pill 在右；进度条。**强调** 钴蓝数字。**留白** 很紧 —— 这是密度例外。**固定** 4% 色调卡片、20% 边框、无阴影、钴蓝数字。**可变** 数字（来自脚本）、标签。**密度** 密集例外。

### 3 · Bar Ranking（数据 · 手法：钴蓝条形 · 居左）

**底** 奶油色，`pad-x`。**组成** 眉标、h2、bar-track 行。**焦点** 3–5 根带标签的钴蓝填充条形，放在钴蓝 8% 的轨道上，配钴蓝百分比。**辅助元素** 眉标；进度条。**强调** 钴蓝填充 + 数字。**留白** 适中。**固定** 6px 轨道、钴蓝填充。**可变** 行、数值（来自脚本）。**密度** 标准。

### 4 · Pull Quote（引语 · 手法：同心圆环 · 居中）

**底** 奶油色，居中，背后有淡淡的同心收尾圆环。**组成** 引号、blockquote、出处。**焦点** 一段近黑色的 Space Grotesk `blockquote`，位于一个 15% 不透明度的钴蓝引号下方；下方是一个全大写、柔和钴蓝色的出处。**强调** 淡淡的圆环 + 引号。**留白** 约 55%。**固定** 近黑色引语、柔和的圆环。**可变** 引语、出处。**密度** 低。

### 5 · Split + Highlight（内容 · 手法：不对称分栏 · 居左）

**底** 奶油色，两栏。**组成** 眉标、h2、正文、split-highlight 块。**焦点** 一栏 Inter 正文，旁边是一个钴蓝 8% 的高亮块（4px 钴蓝左侧竖线），里面放一段行内引语。**强调** 高亮块的左侧竖线。**留白** 宽裕的栏间距。**固定** 带色调的高亮块、4px 钴蓝竖线。**可变** 正文、标注。**密度** 标准。

### 6 · Closing / CTA（收尾 · 手法：居中圆环 + CTA）

**底** 奶油色 + 同心收尾圆环。**组成** accent-line、h1、正文、cta-button。**焦点** 一个近黑色的 Space Grotesk `h1`，居中，下方是唯一一个实心钴蓝 `cta-button` 胶囊。**强调** CTA + 圆环。**留白** 约 60%。**固定** 一个 CTA、近黑色 h1、柔和的圆环。**可变** 收尾语、CTA 文字。**密度** 低。

## 构图规则

### 要做

- 每一帧都从**温暖的奶油色**开始；让**钴蓝承担每一个强调**（眉标、数字、CTA、条形、进度）。
- 标题用**近黑色、字距 −0.02em**；眉标用**钴蓝全大写、字距 0.08em**；数字用**钴蓝 600–700**。
- 使用**带色调的卡片**（4% 填充、20% 边框、10–14px 圆角、无阴影）；正文用 Inter 400 柔和色、行高 1.6。
- 所有辅助元素保持**胶囊形（100px）**；每个收尾帧一个实心钴蓝 CTA。
- 把**氛围元素**（斜向面板、圆点、圆环）留给 cover / closing；内容帧保持 slide-header 的节奏。
- cover / dashboard / split 偏向居左，quote / closer 居中。

### 不要做

- 不要第二种强调色；不要钴蓝标题。
- 内容上不要投影（只有钴蓝 CTA 柔和的悬停态例外）；不要不透明的钴蓝边框。
- 不要直角（进度条除外）；不要替换字体；不要全大写正文。
- 不要把绿 / 红变化 chip 当作一般的强调色 —— 只用于方向性的对比。
- 不要用更粗的边框去填充空间 —— 去增加实质内容；不要让标题从边到边撑满。

## 宽高比适配

| 处理方式 | 16:9 | 9:16 | 1:1 |
| --- | --- | --- | --- |
| Cover | 标题居左，斜向面板在右 | 标题在上，斜向色带在下 | 标题偏上，点阵在角落 |
| Dashboard | 横排 3 张卡片 | 竖向堆叠 3 张 | 2×2 |
| Bar Ranking | 3–5 根条形 | 3–5 根条形（更紧凑） | 3 根条形 |
| Pull Quote | 居中，圆环在背后 | 居中，更高 | 居中 |
| Split + Highlight | 左右并排 | 上下堆叠 | 上下堆叠 |
| Closing / CTA | 居中 + CTA | 居中 + CTA | 居中 + CTA |

`pad-x` 在短边上保持不变；重新选择展示字的字号档位，不低于 1.4cqw 的下限。在 9:16 下，cover 的斜向面板变成一条上 / 下的色带。在 CJK 版本中，数字仍然使用拉丁阿拉伯数字。

## 已批准实体

源文件里没有定义任何真实客户、logo 或供应商 —— 任何此类标记都渲染成占位符。数字、指标和引语都属于内容；这套系统提供的是奶油色 + 钴蓝 + 灰阶。

## 数字与声明（硬规则）

绝不在帧尺度上编造数字、财务数据、百分比或日期。把槽位渲染成 `— figure —`、`{metric}`、`+NN%`、`↑ —`。尤其是指标卡片、条形数值和数据单元格，要一直用占位符，直到脚本提供数值为止。方向性的 chip 需要脚本给出真实的对比。

## 渲染前自查

- **眯眼** —— 每帧由一个近黑色标题或钴蓝数字占主导。
- **留白** —— 内容帧均衡而不拥挤；只有 dashboard 是密集的。
- **单一强调色** —— 只用钴蓝；标题近黑色；涨 / 跌色只用于行内。
- **字体** —— Space Grotesk 标题字距 −0.02em、近黑色，钴蓝眉标字距 0.08em + 钴蓝数字；Inter 正文柔和色、行高 1.6；下限 ≥1.4cqw。
- **深度** —— 带色调的卡片（无阴影）、柔和的圆角、20% 钴蓝边框；内容元素没有直角。
- **锚定** —— cover / dashboard / split 居左，quote / closer 居中；氛围元素只用在 cover / closing 上。
- **编造** —— 每个数字都能追溯到脚本，否则用占位符。

## 已知缺口

- **动效有意不在范围内。** frame.md 只规定构图；源设计中 500ms 的 translateX 转场 + 条形填充动画属于演示文稿的机制。
- **Space Grotesk + Inter 通过 Google Fonts 加载。** CJK 搭配（Noto Sans SC 700 展示字 / Noto Serif SC 400 正文）沿用源设计；眉标的全大写 + 字距信号在 CJK 中会减弱 —— 把它和 accent-line 搭配使用。
- **9:16 / 1:1 只是指导**；检查字号下限，并确认斜向面板会重排成一条色带。
- 斜向面板（clip-path）、点阵、同心圆环和条形都是纯 CSS 实现；不需要外部图片。
