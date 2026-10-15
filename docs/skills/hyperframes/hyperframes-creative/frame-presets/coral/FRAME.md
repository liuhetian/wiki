---
version: alpha
name: Coral — Frame (video / frame layer)
description: >
  Video-first companion to Coral's design.md. The unit is the frame (1920×1080), not the
  slide-in-a-deck. Atoms are identical and sacred — the three-surface system (coral fire /
  ink black / warm cream), Bebas Neue uppercase tracked + Inter body, the 45° diagonal hatch,
  decorative wallpaper numerals, hard color-region splits, zero shadow, zero radius (save
  circles). Composition, frame scale, and aspect-ratio behavior are rewritten for the frame.
  Motion is out of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  coral: "#E85D5D"
  coral-dark: "#D44A4A"
  cream: "#F5F0E8"
  cream-dark: "#E8E0D4"
  black: "#1A1A1A"
  gray: "#6B6B6B"
  light-gray: "#B0B0B0"
  white: "#FFFFFF"

typography:
  # — reading ramp (Inter) —
  body:          { fontFamily: "Inter", cqw: 1.0,  weight: 400, lineHeight: 1.7 }
  body-light:    { fontFamily: "Inter", cqw: 1.5,  weight: 300, lineHeight: 1.5, note: "pull-quote voice" }
  section-label: { fontFamily: "Inter", px: 12, weight: 700, tracking: "4px", upper: true }
  item-label:    { fontFamily: "Inter", px: 11, weight: 700, tracking: "3px", upper: true }
  quote-attribution: { fontFamily: "Inter", px: 14, weight: 600, tracking: "3px", upper: true }
  quote-role:    { fontFamily: "Inter", px: 12, weight: 400, tracking: "1px" }
  # — display / hero ramp (Bebas Neue, uppercase, tracked) —
  card-title:    { fontFamily: "Bebas Neue", cqw: 1.9, weight: 400, lineHeight: 1.1, tracking: "1px", upper: true }
  sidebar-value: { fontFamily: "Bebas Neue", cqw: 2.3, weight: 400, lineHeight: 1.0, upper: true }
  bar-title:     { fontFamily: "Bebas Neue", cqw: 2.3, weight: 400, lineHeight: 1.0, tracking: "2px", upper: true }
  card-stat:     { fontFamily: "Bebas Neue", cqw: 2.5, weight: 400, lineHeight: 1.0, upper: true }
  column-title:  { fontFamily: "Bebas Neue", cqw: 3.7, weight: 400, lineHeight: 1.0, tracking: "2px", upper: true }
  section-headline: { fontFamily: "Bebas Neue", cqw: 4.2, weight: 400, lineHeight: 1.0, tracking: "2px", upper: true }
  stat-numeral:  { fontFamily: "Bebas Neue", cqw: 5.0, weight: 400, lineHeight: 1.0, upper: true }
  hero-title:    { fontFamily: "Bebas Neue", cqw: 6.5, weight: 400, lineHeight: 0.9, tracking: "4px", upper: true }
  jumbo-feature: { fontFamily: "Bebas Neue", cqw: 9.0, weight: 400, lineHeight: 1.0, tracking: "12px", upper: true }
  # — decorative —
  background-numeral: { fontFamily: "Bebas Neue", cqw: 10.0, weight: 400, color: "rgba(0,0,0,0.12)", note: "wallpaper numeral inside a coral region" }
  giant-mark:    { fontFamily: "Bebas Neue", cqw: 14.0, weight: 400, color: "rgba(0,0,0,0.35)", note: "decorative quote mark inside a coral region" }

spacing:
  pad-x: "5cqw"       # standard horizontal frame padding
  pad-y: "4cqw"
  pad-col: "3cqw"
  gap-grid: "1.7cqw"
  card-pad: "2cqw"

components:
  diagonal-hatch:
    backgroundImage: "repeating-linear-gradient(45deg, transparent 0 20px, rgba(0,0,0,.06) 20px 40px)"
    placement: "::before overlay on {colors.coral} regions"
    description: "Signature 45° hatch (6% ink). Variants −45° 30/60px, 90° vertical 60/62px 10% ink. Texture, never depth."
  region-split:
    layout: "two/three solid surfaces meeting at a hard edge; ratios 38/62 rows, 40/60 cols, 50/50"
    rounded: "0"
    description: "The primary layout device — no gradient, no rounded junction; the boundary is the layout."
  card:
    backgroundColor: "{colors.white}"
    borderTop: "0.26cqw solid {colors.coral}"
    rounded: "0"
    shadow: "none"
    typography: "{typography.card-title} + {typography.body}"
    description: "5px coral TOP border is the only chrome; holds a card-icon, title, body, coral card-stat."
  sidebar-item:
    backgroundColor: "{colors.white}"
    borderLeft: "0.2cqw solid {colors.coral}"
    rounded: "0"
    typography: "{typography.sidebar-value} + {typography.section-label}"
    description: "4px coral LEFT border is the only chrome."
  card-icon:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.white}"
    size: "2.5cqw square"
    rounded: "0"
    description: "The card mark — one white Bebas glyph centered."
  accent-line:
    backgroundColor: "{colors.coral}"
    size: "4cqw × 0.25cqw (60×4 closing variant)"
    rounded: "0"
    description: "Sub-headline accent rule."
  background-numeral:
    typography: "{typography.background-numeral}"
    color: "rgba(0,0,0,0.12)"
    placement: "behind a {colors.coral} region's title"
    description: "The wallpaper-numeral signature (12% ink)."
  giant-mark:
    typography: "{typography.giant-mark}"
    color: "rgba(0,0,0,0.35)"
    placement: "inside a {colors.coral} region"
    description: "Oversized quote mark / character, half-decorative."
  timeline:
    line: "0.2cqw solid {colors.black} (gradient-dashed ::after)"
    node: "{colors.coral} circle, {colors.cream} halo, 50% radius"
    description: "Ink line with coral nodes + cream halos."
  info-bar:
    backgroundColor: "{colors.cream-dark}"
    typography: "{typography.bar-title} + uppercase {typography.section-label}"
    rounded: "0"
    shadow: "none"
    description: "Footer band beneath a feature region — Bebas title left, Inter meta right."
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/frame-presets/coral/FRAME.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Coral — Frame (video / frame layer)

## 概述

帧尺度下的 Coral 是一张**大胆的杂志海报**，由三种纯色表面构成——珊瑚火焰色、墨黑、暖奶油色——它们在**硬色边**处相接。区域边界本身就是版式：一帧被分成一块珊瑚色平面 + 一块奶油色平面，或者一块珊瑚色面板 + 一块墨色面板，每一块都承载一个自成一体的构图。没有渐变过渡，没有圆角衔接，没有投影。

它的字体声音是两款字体的层级：**Bebas Neue**——高挑的窄体大写，永远全大写，永远加字距（1–12px）——承担每一个标题、数据、题名和元信息数字；**Inter** 以 300–700 的字重承担每一行正文、标签和署名。Bebas 宣告；Inter 解释。标志性的氛围元素是珊瑚色区域上的 **45° 斜线排线**（6% 墨色），以及区域标题背后的**超大壁纸数字**（12% 墨色）。

**帧尺度下的关键特征：**

- **三种表面，硬边**——`{colors.coral}` / `{colors.black}` / `{colors.cream}` 作为纯色区域。
- 每个展示元素都用 **Bebas 全大写 + 字距**；每个正文 / 标签都用 **Inter**。
- 珊瑚色区域上有 **45° 排线**（6% 墨色）；内容背后有**壁纸数字**（12%）和**巨型符号**（35%）。
- **火焰底配墨色字**——珊瑚色上的 Bebas 永远是墨色，绝不是白色。眉题在奶油色 / 墨色上用珊瑚色，在珊瑚色上用墨色。
- **平面**——没有阴影，没有抬升；圆角只用于圆形（导航圆点、时间线节点）。
- **珊瑚色既是强调色也是环境**——4–5px 珊瑚色边框、48px 珊瑚色图标方块，以及整块珊瑚色区域。

### 帧工艺门槛

每一帧在做任何结构检查之前，先要过三项目测闸门：

- **眯眼**——一个元素占主导，体量是**离它最近的元素的 3–6 倍**：`hero-title`/`jumbo-feature`，或者区域标题背后的壁纸数字，绝不出现两个互相争夺的标题。
- **留白**——珊瑚色 / 奶油色 / 墨色区域看起来 **40–55% 是空的**；**三栏目录帧是唯一的密集例外**。珊瑚色区域填得不够满时，加一个壁纸数字，绝不加更多内容。
- **克制**——珊瑚色每帧**要么作为强调色，要么作为一整块区域**出现（不能两者都满强度）；每段引语一个巨型符号；火焰底配墨色字（珊瑚色上绝不用白色）。
- **参照**——瞄准**体育杂志封面 / Saul Bass 的旅行海报**（硬边相接的纯色平面，窄体大写当作建筑结构）；失败的样子是**带柔和投影的卡片式演示文稿**。

## 帧

- **主尺寸：** 1920×1080（16:9）。展示字号用 **`cqw`** 编写（`px ÷ 1920 × 100 = cqw`）。
- **竖屏：** 1080×1920（9:16）。**方屏：** 1080×1080（1:1）。
- **安全区：** `5cqw`（pad-x）是标准的帧内边距；区域边缘可以满版出血。

**容器法则（承重规则）。** 每一帧的底层元素都设置 `container-type: size`；所有相对于帧的单位都是基于它解析的 `cqw`/`cqh`——**绝不用 `vw`。** 按 `vw` 定尺寸的帧只要不是全屏就会被放大；`cqw` 则无论按什么尺寸渲染都基于帧来解析。

## 色彩

token 与源设计完全一致。在帧尺度上，三种表面通过构图相互混搭——珊瑚色 / 奶油色、珊瑚色 / 墨色、墨色 / 奶油色，或者单一表面。`{colors.coral}` 既是强调色（边框、图标方块、时间线节点、奶油色 / 墨色上的眉题），也是环境（整块区域）。标题：奶油色 / 珊瑚色上用墨色，墨色上用奶油色——**绝不用灰色，绝不在珊瑚色上用白色。** 眉题：奶油色 / 墨色上用珊瑚色，珊瑚色上用墨色——不存在珊瑚色配珊瑚色。唯一被允许的渐变是少见的 135° 深珊瑚→珊瑚特写区域；其余一切都是平的。

## 字体排印

两套字号阶梯。**阅读阶梯**（Inter 正文 1.0cqw，body-light 1.5cqw，标签用 px）承载文案和眉题；**展示 / hero 阶梯**（Bebas，`card-title` 1.9cqw → `jumbo-feature` 9.0cqw，外加装饰性的 `background-numeral` 10cqw 和 `giant-mark` 14cqw）承载每一个标题和数据。

- **可读性下限：** 任何承重的文字行 ≥ **1.4cqw**；用 px 的标签只是辅助元素（chrome）。
- **按长度定字号：** 根据标题的行长决定字号。整块宽度上限 **≤ 78cqw**；≤3 个词 → `hero-title`/`jumbo-feature`；4–6 个词 → `section-headline`；7 个词以上 → `column-title`。
- **每个 Bebas 元素都全大写，字距 ≥1px**（标准 2px，hero 4px，jumbo 12px）。**每个 Inter 标签都全大写，字距 1–4px。** 不用斜体，不用下划线，Bebas 不用句首大写。

## 深度与表面

平面，硬色边。深度信号只有：

- **硬区域边界**——主要的结构手段。
- **强调边框**——5px 珊瑚色顶边（卡片）、4px 珊瑚色左边（侧栏块）、4px 墨色（时间线）。
- **45° 排线**——珊瑚色区域上 6% 墨色的纹理（不产生深度）。
- **壁纸字体**——12% 的数字、35% 的巨型符号，叠在内容背后。

**上限：** 不用 box-shadow，不用抬升的卡片，不用柔和渐变（那一个 135° 珊瑚色特写除外），不用圆角矩形。

## 形状

- 每个矩形都是 **0 圆角**——区域、卡片、侧栏块、图标方块、信息栏、强调线。
- **50%** 只用于圆形——导航圆点（10px）、导航箭头（44px）、时间线节点（20px）。

## 组件

- **region-split**——版式手段；表面在硬边处相接。
- **card**（5px 珊瑚色顶边）/ **sidebar-item**（4px 珊瑚色左边）/ **card-icon**（48px 珊瑚色方块）——它们各自唯一的辅助元素就是那一条珊瑚色边框。
- **diagonal-hatch** / **background-numeral** / **giant-mark**——珊瑚色区域上标志性的氛围 + 壁纸元素。
- **accent-line**——珊瑚色的副标题线。**timeline**——墨色线、珊瑚色节点、奶油色光晕。**info-bar**——深奶油色的页脚色带。

## 帧处理方式

> 每个版面的配方：底（ground）· 容器（container）· 组成（composes）· 焦点（focal）· 辅助元素（chrome）· 强调（accent）· 留白（silence）· 固定/可变（Fixed/Free）· 密度（density）。
> 手法允许时偏向居中；变换锚定方式；每个区域一个想法。

### 1 · Region-Split Cover（身份 · 手法：硬区域边 · 居左）

**底** 38/62 分割——`{colors.coral}` 顶部色带（排线 + 壁纸数字）在 `{colors.cream}` 之上。**容器** 网格行；品牌 + 元信息在珊瑚色带里，hero 标题在奶油色区域里。**组成** region-split、diagonal-hatch、background-numeral、hero-title。**焦点** 一个两行的墨色 `hero-title`，第二行用 `{colors.coral}`，在奶油色区域里左侧锚定。**辅助元素** 珊瑚色带里左边是 Bebas 品牌名

- 右边是 Bebas 元信息。**强调** 珊瑚色带 + 珊瑚色的第二行。**留白** 奶油色区域约 45% 是空的。**固定** 色带里火焰底配墨色字、珊瑚色上有排线、硬边。**可变** 标题文案、哪一行用珊瑚色、元信息。**密度** 稀疏。

### 2 · Feature Stat（锚点 · 手法：尺度 · 珊瑚色环境 · 居左）

**底** 满版 `{colors.coral}`，带排线。**组成** diagonal-hatch、background-numeral、section-label、数据标题、body-light。**焦点** 一个墨色的 `stat-numeral`/`jumbo-feature` 数字或两行标题，背后有一个 `background-numeral`（12% 墨色）作为壁纸。**辅助元素** 一个墨色的 `section-label` 眉题；一行可选的 Inter-300 辅助文字，≤44cqw。**强调** 珊瑚色的底本身就是环境；墨色文字，不用白色。**留白** 珊瑚色区域约 40% 是空的。**固定** 珊瑚底配墨色字、有排线、背后有壁纸数字。**可变** 数字、标题、辅助文案。**密度** 稀疏。

### 3 · Quote Layout（引语 · 手法：面板分割 · 巨型符号）

**底** 40/60 分割——`{colors.coral}` 左面板（排线 + giant-mark）+ `{colors.black}` 右面板。**组成** region-split、giant-mark、body-light、accent-line、quote-attribution。**焦点** 墨色面板上一段 2–3 行的 `{colors.cream}` 色 Inter **字重 300** 引语。**辅助元素** 珊瑚色面板上一个 `giant-mark`（35% 墨色）；署名上方一条 `60×4` 的珊瑚色 accent-line。**强调** 珊瑚色面板 + 珊瑚色 accent-line。**留白** 珊瑚色面板上基本只有那个符号。**固定** Inter-300 引语、墨色面板、珊瑚底上的墨色符号。**可变** 引语、署名、符号字形。**密度** 稀疏。

### 4 · Closing Plate（收尾 · 手法：奶油色区域 + 珊瑚色带 · 居中）

**底** `{colors.cream}` 区域，底部一条 `{colors.coral}` 色带（排线）。**组成** section-label、section-headline/hero-title、accent-line、info-bar。**焦点** 一句两行的墨色收尾语，居中，下方一条珊瑚色 `accent-line`。**辅助元素** 上方一个墨色眉题；珊瑚色带页脚承载一个 Bebas 收尾语 + 年份。**强调** 珊瑚色带 + 珊瑚色 accent-line。**留白** 约 55% 是空的奶油色。**固定** 居中、墨色文字、一条珊瑚色带。**可变** 收尾语文案、色带内容。**密度** 稀疏。

### 5 · Three-Column Catalog（列举 · 手法：密度——那个密集帧 · 标题居中）

**底** `{colors.cream}`（或 `{colors.black}`），`pad-x`。**组成** section-headline、3 张 card。**焦点** 一个居中的 `section-headline`，下面是三张白色 `card`（5px 珊瑚色顶边、48px 图标方块、Bebas 题名、Inter 正文、珊瑚色数据）。**强调** 三条珊瑚色顶边 + 图标方块。**留白** 很紧——这是密度例外。**固定** 5px 珊瑚色顶边作为唯一的辅助元素，无阴影 / 圆角。**可变** 三张卡片的内容。**密度** 密集例外。

### 6 · Timeline（流程 · 手法：水平轨道 · 居左）

**底** `{colors.cream}`，`pad-x`。**组成** section-headline、timeline。**焦点** 墨色时间线，带 4–5 个珊瑚色节点（奶油色光晕）和 Bebas 标签。**强调** 珊瑚色节点。**留白** 适中。**固定** 墨色线、珊瑚色节点、奶油色光晕。**可变** 节点数量、标签。**密度** 标准。

## 构图规则

### 要做

- 以**多表面的区域分割**来构图——珊瑚色 / 墨色 / 奶油色在硬边处相接；边界就是版式。
- 每个 Bebas 元素都**全大写 + 加字距**（标准 2px，hero 4px，jumbo 12px）；每个 Inter 标签都全大写，1–4px。
- 眉题**在奶油色 / 墨色上用珊瑚色，在珊瑚色上用墨色**；标题在奶油色 / 珊瑚色上用墨色，在墨色上用奶油色。
- 在珊瑚色区域上加 **45° 排线**（6% 墨色）；分量不够的珊瑚色区域用一个 **12% 的壁纸数字**填充。
- 把 **5px 珊瑚色顶边**（卡片）/ **4px 珊瑚色左边**（侧栏块）作为这些元素上唯一的辅助元素。
- cover 的收尾语和目录标题偏向居中；特写和引语偏向居左 / 面板分割。

### 不要做

- 不要把 Bebas 设成句首大写或不加字距；不要给它搭配 Inter 以外的无衬线正文字体。
- 不要加第四种表面、投影、抬升或圆角矩形。
- 不要在珊瑚色上放白色标题（永远是墨色），也不要在任何地方用灰色标题（灰色用于正文 / 元信息）。
- 不要用渐变柔化区域边界（少见的 135° 珊瑚色特写除外）。
- 不要用零散的碎片去填珊瑚色区域——要么填满，要么加一个壁纸数字 / 巨型符号。
- 不要让标题从边到边撑满——长行就把字号阶梯降一档。

## 宽高比适配

| 处理方式 | 16:9 | 9:16 | 1:1 |
| --- | --- | --- | --- |
| Region-Split Cover | 38/62 分行，标题居左 | 珊瑚色带更高，标题在下 | 40/60，标题偏下 |
| Feature Stat | 数字居左，壁纸数字居右 | 数字在上，壁纸数字在后 | 数字居中 |
| Quote Layout | 40/60 珊瑚色 + 墨色 | 竖向堆叠：珊瑚色符号在上，引语在下 | 竖向堆叠 |
| Closing Plate | 奶油色 + 底部珊瑚色带 | 奶油色 + 更高的色带 | 居中，色带在下 |
| Three-Column Catalog | 标题在三联之上 | 标题在上，3 张竖向堆叠 | 标题在上，2+1 |
| Timeline | 水平轨道 | 竖向轨道 | 紧凑的水平轨道 |

安全区在短边上保持 `5cqw` 的内边距；按每种比例重新选择展示字的字号档位，确保没有任何承重的文字行低于 1.4cqw 的下限。在 CJK 下 Bebas 会宽约 20%——按每种比例调整换行。

## 已批准实体

源文件里没有定义任何真实客户、logo 或供应商——任何此类标记都渲染成占位符。这套系统提供的是表面和几何，不是品牌。

## 数字与声明（硬规则）

绝不在帧尺度上编造数字、数据、日期或计数。把槽位渲染成 `— figure —`、`{metric}`、`N×`。只有脚本提供了真实数字时才出现真实数字——特写数据、目录和时间线尤其要用占位符，而不是编造的数值。壁纸数字（01、02……）是装饰性的，可以是序数。

## 渲染前自查

- **眯眼**——每个区域里一个焦点元素占主导，体量是相邻元素的 3–5 倍。
- **留白**——稀疏帧 40–55% 是空的；只有目录帧是密集的。
- **表面**——珊瑚色 / 墨色 / 奶油色中的两种或三种，在硬边处相接；没有第四种表面。
- **字体**——Bebas 全大写 + 字距、按长度定字号；珊瑚底配墨色字；眉题颜色与表面相符；下限 ≥1.4cqw。
- **深度**——0 阴影，0 圆角矩形；纹理由排线 + 壁纸承担。
- **锚定**——收尾语 / 标题居中，特写 / 引语用面板 / 居左；不要连续 3 帧用同一种锚定。
- **编造**——每个数字都能追溯到脚本，否则用占位符。

## 已知缺口

- **动效有意不在范围内。** frame.md 只规定构图；时间和转场是后面的阶段。源设计中 0.6s 的不透明度淡入淡出属于演示文稿的机制，不是帧规范。
- **Bebas Neue + Inter 通过 Google Fonts 加载。** CJK 搭配（ZCOOL XiaoWei / Yozai）沿用源设计的 CJK 部分；在 CJK 下 Bebas 会宽约 20%。
- **9:16 / 1:1 只是指导**，不是锁死到像素的；按每种比例检查可读性下限。
- 45° 排线、壁纸数字、巨型符号和时间线虚线都是纯 CSS 实现；不需要外部图片。
