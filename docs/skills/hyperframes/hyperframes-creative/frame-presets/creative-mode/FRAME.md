---
version: alpha
name: Creative Mode — Frame (video / frame layer)
description: >
  Video-first companion to Creative Mode's design.md. The unit is the frame (1920×1080),
  not the slide-in-a-deck. Atoms are identical and sacred — warm cream canvas, 4px ink
  borders, hard offset shadows (no blur), Archivo Black uppercase at 0.92 line-height,
  JetBrains Mono taxonomy, Space Grotesk body, the four-accent palette. Composition,
  frame scale, and aspect-ratio behavior are rewritten for the frame. Motion is out of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  cream: "#EFE9D9"
  cream-2: "#E4DCC4"
  ink: "#0F0F0F"
  ink-2: "#2A2A2A"
  green: "#1F8A4C"
  green-dark: "#136636"
  pink: "#F06CA8"
  pink-dark: "#D14E8B"
  orange: "#E85A1F"
  yellow: "#F5C518"

typography:
  # — reading ramp (px @ 1920, with cqw) —
  body-lg:    { fontFamily: "Space Grotesk", px: 28, cqw: 1.46, weight: 400, lineHeight: 1.4 }
  body-md:    { fontFamily: "Space Grotesk", px: 24, cqw: 1.25, weight: 400, lineHeight: 1.3 }
  mono-label: { fontFamily: "JetBrains Mono", px: 24, cqw: 1.25, weight: 400, tracking: "0.06em", upper: true }
  mono-kicker: { fontFamily: "JetBrains Mono", px: 24, cqw: 1.25, weight: 400, tracking: "0.14em", upper: true }
  table-head: { fontFamily: "Archivo Black", px: 28, cqw: 1.46, weight: 400, upper: true }
  # — display / hero ramp (frame-native, cqw-first) —
  step-title: { fontFamily: "Archivo Black", px: 34,  cqw: 1.77, weight: 400, lineHeight: 1.0, upper: true }
  badge-label: { fontFamily: "Archivo Black", px: 28,  cqw: 1.46, weight: 400, upper: true }
  marker:     { fontFamily: "Archivo Black", cqw: 2.4, weight: 400, lineHeight: 1.0, upper: true }
  stamp-num:  { fontFamily: "Archivo Black", cqw: 2.2, weight: 400, lineHeight: 0.9 }
  stat-num:   { fontFamily: "Archivo Black", cqw: 6.4, weight: 400, lineHeight: 0.88 }
  step-num:   { fontFamily: "Archivo Black", cqw: 7.0, weight: 400, lineHeight: 0.85 }
  display-head: { fontFamily: "Archivo Black", cqw: 4.2, weight: 400, lineHeight: 0.92, tracking: "-0.01em", upper: true }
  display-lg: { fontFamily: "Archivo Black", cqw: 8.0,  weight: 400, lineHeight: 0.9,  tracking: "-0.01em", upper: true }
  display-xl: { fontFamily: "Archivo Black", cqw: 11.0, weight: 400, lineHeight: 0.9,  tracking: "-0.01em", upper: true }
  display-hero: { fontFamily: "Archivo Black", cqw: 15.5,weight: 400, lineHeight: 0.84, tracking: "-0.02em", upper: true }

spacing:
  frame-pad: "3.3cqw"        # 64px chrome gutter @1920
  content-gutter: "5cqw"     # 96px content gutter @1920
  grid-gap: "1.5cqw"         # 28px
  cell-pad: "1.7cqw"         # 32px

components:
  frame-chrome:
    typography: "{typography.mono-label}"
    placement: "topbar 2.5cqw from top, meta 2.5cqw from bottom, both inset {spacing.frame-pad}"
    rounded: "0"
    shadow: "none"
    description: "Mono topbar (section label left + 999px ink-stroked pill right) + meta footer (descriptor left + NN • NN counter right, 0.5cqw ink dot divider). Present on most frames."
  stat-cell:
    backgroundColor: "{colors.green} · {colors.pink} · {colors.orange} · {colors.cream}"
    textColor: "{colors.cream} on accent · {colors.ink} on cream"
    border: "0.4cqw solid {colors.ink}"
    rounded: "0"
    padding: "{spacing.cell-pad}"
    typography: "{typography.stat-num} + {typography.mono-label}"
    shadow: "none"
    description: "Flat accent/cream stat tile, square corners, no shadow."
  step-card:
    backgroundColor: "{colors.cream} · {colors.pink} · {colors.yellow} · {colors.green}"
    border: "0.4cqw solid {colors.ink}"
    rounded: "0"
    padding: "{spacing.cell-pad}"
    typography: "{typography.step-num} + {typography.step-title} + {typography.body-md}"
    shadow: "none"
    description: "Ink-bordered card; giant step-num top. Sequence alternates cream with accents and ENDS on green."
  marker-block:
    backgroundColor: "{colors.pink}"
    textColor: "{colors.ink}"
    border: "0.4cqw solid {colors.ink}"
    rounded: "0"
    typography: "{typography.marker}"
    shadow: "1.25cqw 1.25cqw 0 {colors.orange}, 1.25cqw 1.25cqw 0 0.2cqw {colors.ink}"
    description: "The one hard-offset featured callout per frame."
  kicker-block:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    typography: "{typography.mono-kicker}"
    padding: "0.5cqw 1cqw"
    rounded: "0"
    description: "Inverted eyebrow chip."
  badge-rotated:
    backgroundColor: "{colors.yellow}"
    border: "0.4cqw solid {colors.ink}"
    typography: "{typography.badge-label}"
    rounded: "0"
    transform: "rotate(-4deg)"
    description: "Deliberate-imperfection annotation."
  pill-badge:
    backgroundColor: "{colors.cream}"
    border: "0.2cqw solid {colors.ink}"
    rounded: "999px"
    typography: "{typography.mono-label}"
    description: "The ONLY rounded element; reads as a chip, not a card."
  stamp:
    backgroundColor: "{colors.pink}"
    border: "0.4cqw solid {colors.cream}"
    size: "~18cqw square"
    rounded: "0"
    transform: "rotate(-6deg)"
    typography: "{typography.stamp-num}"
    description: "Closing seal with a cream circular inner ring."
  comparison-table:
    backgroundColor: "{colors.cream-2}"
    border: "0.4cqw solid {colors.ink}"
    rule: "0.3cqw solid {colors.ink}"
    rounded: "0"
    typography: "{typography.table-head} + {typography.body-md}"
    shadow: "none"
    description: "Ink head row with cream Archivo labels; pink/green column-fill variants."
  decorative-circle:
    backgroundColor: "{colors.yellow}"
    border: "0.4cqw solid {colors.ink}"
    rounded: "50%"
    description: "Decorative figure; pairs with a green panel for shape contrast."
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/frame-presets/creative-mode/FRAME.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Creative Mode — Frame (video / frame layer)

## 概述

帧尺度下的 Creative Mode 是一张**披着动态外衣的新粗野主义编辑风海报**——温暖的奶油色纸、近黑的墨色，以及四种以满饱和度相互碰撞的强调色。每一帧都是一个平面的色块构图：没有渐变，没有模糊阴影，没有圆角卡片（那一个胶囊标签片除外）。深度来自**硬偏移阴影**（一个同方向的实心复制体）或**色块对比**，绝不来自光。

展示字的声音是**严格全大写、行高 0.92 的 Archivo Black**——字母会压到自己的大写字高之上；这种紧凑就是品牌。**JetBrains Mono** 以一种"技术制品"的语域承担每一个标签、眉题、计数器和坐标轴。**Space Grotesk** 承担为数不多的几行正文。画面因构造而响亮，因克制而平静：每帧两到三种强调色，绿色底只留给唯一的收尾版面，硬阴影只花在一个特写元素上。

**帧尺度下的关键特征：**

- 几乎每一帧都是**奶油色底**（`{colors.cream}`）；`{colors.green}` 留给收尾版面。
- 每个结构元素都有 **0.4cqw（1920 下为 4px）的墨色边框**；内部分隔线 0.3cqw。
- 每帧一个特写色块上有**硬偏移阴影**（约 1.25cqw，橙色 + 墨色）——绝不模糊。
- **Archivo Black 全大写**，行高 0.92，永远如此；不存在句首大写的 Archivo Black。
- **每帧两到三种强调色**，绝不四种全用；碰撞本身就是设计。
- 每帧**一个胶囊标签片**（999px），是唯一的圆角元素。

### 帧工艺门槛

每一帧在做任何结构检查之前，先要过三项目测闸门：

- **眯眼**——恰好一个元素占主导，体量是**离它最近的元素的 3–6 倍**（是断崖，不是斜坡）：`display-hero`/`display-xl` 主张，或者 `stat-num` 数字，绝不出现两个互相争夺的标题。
- **留白**——稀疏帧（cover、claim、closer）看起来 **45–60% 是空的**；**数据网格和对比账目帧是唯一的密集例外**。绝不为了显得完整而把稀疏帧填满。
- **克制**——稀缺的手势**每帧只出现一次**：最多一个硬偏移阴影，两到三种强调色（绝不四种全用），绿色底只留给唯一的收尾版面。
- **参照**——瞄准**孔版印刷（Risograph）的编辑风海报 / 朋克小志跨页**（带墨色边框的平面色块、一个大主张、大片奶油色）；失败的样子是**圆角、柔和阴影的 SaaS 功能网格**。

## 帧

- **主尺寸：** 1920×1080（16:9）。所有展示字号都用 **`cqw`** 编写（`px ÷ 1920 × 100 = cqw`）。
- **竖屏：** 1080×1920（9:16）。**方屏：** 1080×1080（1:1）。
- **安全区：** 辅助元素（chrome）内缩 `3.3cqw`（64px）；内容边距 `5cqw`（96px）。任何承重元素都不越过 `3.3cqw` 这条线。

**容器法则（承重规则）。** 每一帧的底层元素都设置 `container-type: size`。所有相对于帧的单位都是 `cqw`/`cqh`（1cqw = 帧宽的 1%），基于这个底层元素解析——**绝不用 `vw`。** `vw` 量的是页面 viewport，所以只要帧不是全屏渲染，它就会被放大；`cqw` 则无论按什么尺寸渲染都基于帧来解析。这就是展示阶梯里每个尺寸都用 `cqw` 的原因。

## 色彩

token 与源设计完全一致。在帧尺度上：`{colors.cream}` 是**底**，`{colors.ink}` 用于边框 + 文字，四种强调色（`green` / `pink` / `orange` / `yellow`）是**平面填充，每帧配给两到三种。** `{colors.orange}` 同时也是硬阴影的颜色。`{colors.green}` 兼作唯一那一个收尾版面的底色——它的稀少就是冲击力。绝不引入第五种强调色；绝不用纯白；绝不用渐变。

## 字体排印

两套字号阶梯。**阅读阶梯**（正文、等宽标签、表头）用 px+cqw 承载辅助元素和文案。**展示 / hero 阶梯**是为帧原生设计的，用 `cqw` 编写——从 `display-head`（4.2cqw）一直到用于字标封面的 `display-hero`（15.5cqw）。

- **可读性下限：** 任何承重的文字行 ≥ **1.4cqw（1920 下约 27px）**。1.15cqw 的等宽辅助元素只用于版权页式信息。
- **按长度定字号：** 标题的字号跟随它的行长。标题块宽度上限 **≤ 78cqw**，绝不碰到安全边距。≤3 个词 → `display-hero`/`display-xl`；4–6 个词 → `display-lg`；7 个词以上 → `display-head`。短行放大；长行降档。
- **所有 Archivo Black 都全大写 + 行高 0.92**，永远如此。等宽字体用 0.06–0.14em 字距。Archivo Black 的字距绝不超出编码好的 −0.01em；正文绝不居中排。

## 深度与表面

零模糊。只有两种深度手段：

- **硬偏移阴影**——一个在 X 和 Y 方向各偏移约 1.25cqw 的实心复制体（`box-shadow: 1.25cqw 1.25cqw 0 {colors.orange}, 1.25cqw 1.25cqw 0 0.2cqw {colors.ink}`）。**每帧一个特写色块**（marker、stamp）。图示堆叠可以用 0.95cqw 的纯墨色偏移。
- **色块对比**——cream-2 上的奶油色、奶油色上的墨色、奶油色上的强调色。对比足够时不需要阴影。

**上限：** 任何地方都不用模糊阴影、渐变、发光。

## 形状

- 每个结构元素都是 **0 圆角**——数据单元格、步骤卡片、表格单元格、marker、面板。
- **50%** 用于装饰性圆形、stamp 内圈、元信息圆点。
- **999px** 只用于顶栏的胶囊标签片——唯一的圆角例外。
- **旋转**只用固定的品牌角度：徽章 −4deg，印章 −6deg。

## 组件

- **frame-chrome**——等宽顶栏 + 元信息页脚。大多数帧上都有；只有在纯满版字标那一拍里、它会抢戏时才去掉。
- **stat-cell / step-card**——带墨色边框的平面填充色块；步骤序列以绿色收尾。
- **marker-block**——每帧唯一那个带硬阴影的特写标注。
- **kicker-block**——反色的墨色眉题标签片；**badge-rotated**——−4deg 的黄色批注；**pill-badge**——唯一的圆角标签片。
- **stamp**——−6deg 的收尾印章。**comparison-table**——cream-2 色的账目表，带墨色表头行。
- **decorative-circle**——黄色圆盘，用来和绿色面板形成形状对比。

## 帧处理方式

> 每个版面的配方：底（ground）· 容器（container）· 组成（composes）· 焦点（focal）· 辅助元素（chrome）· 强调（accent）· 留白（silence）· 固定/可变（Fixed/Free）· 密度（density）。
> 按 1920×1080 编写。偏向居中；变换锚定方式；每帧一个想法。

### 1 · Wordmark Cover（身份 · 手法：满画面字标组合 · 居中）

**底** `{colors.cream}`，`frame-pad`。**容器** 网格，辅助元素在上 / 下，焦点居中。**组成** frame-chrome、字标。**焦点** 两行字标，用 `display-hero`（15.5cqw），居中，第二行用一种强调色（`{colors.pink}`/`orange`）。**辅助元素** 等宽顶栏（分节标签 + 胶囊）和元信息页脚（描述语 + 01•NN）。**强调** 只有第二行的颜色；可选一个出血到边外的角落 decorative-circle。**留白** 约 55% 是空的奶油色。**固定** Archivo Black 全大写、行高 0.84、字标上一种强调色、直角。**可变** 用哪种强调色、换行位置、是否让一个圆形从角落出血。**密度** 稀疏。

### 2 · Big Claim（超大陈述 · 手法：尺度 · 居左）

**底** 一种满版强调色（`{colors.pink}`/`green`/`orange`），`content-gutter`。**容器** flex，主张左侧锚定、垂直居中。**组成** kicker-block、主张。**焦点** 一个 2–3 行的主张，用 `display-xl`/`display-lg`，强调色上的墨色字（火焰底配墨色字——绝不用白色）。**辅助元素** 主张上方一个小号墨色 kicker-block；等宽元信息页脚。**强调** 底色本身就是强调色；没有第二种强调色与之争夺。**留白** 彩色区域约 45% 是空的。**固定** 强调色上的墨色字、按长度定字号、文字上不加阴影。**可变** 主张内容、用哪种强调色做底、在哪个词处换行。**密度** 稀疏——一个想法。

### 3 · Stat Grid（列举 · 手法：密度——唯一的密集帧 · 居中）

**底** `{colors.cream}`，`content-gutter`。**容器** 网格：一个居中的 `display-head` 在一排三联 stat-cell 之上。**组成** frame-chrome、3 个 stat-cell。**焦点** 一排三个带墨色边框的单元格（green / pink / orange），每个是一个 `stat-num` + 等宽标签。**辅助元素** 等宽顶栏 + 元信息。**强调** 三个单元格的填充色（这是点名的密度例外——这里允许三种强调色）。**留白** 约 25%——刻意很紧。**固定** 0.4cqw 边框、直角、单元格不加阴影、等宽标签。**可变** 三个数字 + 标签、标题文案、用哪三种强调色。**密度** 密集例外。

### 4 · Closing Plate（收尾 · 手法：换底色 · 居中）

**底** `{colors.green}`（整支视频里唯一的绿色帧），`frame-pad`。**焦点** 一句两行的收尾语，用 `display-lg`，`{colors.cream}` 色，居中。**组成** frame-chrome（奶油色变体）、stamp。**辅助元素** 奶油色的等宽顶栏 + 元信息。**强调** 角落里一个旋转 −6deg 的 `{colors.pink}` 印章，奶油色圆环 + stamp-num。**留白** 约 55% 是空的绿色。**固定** 绿色底只留给这一拍、绿底上的奶油色字、一个印章。**可变** 收尾语文案、印章文字、印章放在哪个角。**密度** 稀疏。

### 5 · Featured Marker（标注 · 手法：硬阴影焦点 · 居左 / 不对称）

**底** `{colors.cream}`。**组成** frame-chrome、marker-block、可选的一行 body-md 辅助文字。**焦点** 粉色的 marker-block，带标志性的橙色 + 墨色硬偏移阴影，不对称摆放。**强调** 粉色色块 + 橙色阴影（两种强调色）。**留白** 约 50%。**固定** 整帧恰好一个硬阴影、0.4cqw 边框。**可变** 标注文案、色块位置、可选的辅助文字行。**密度** 稀疏。

### 6 · Comparison Ledger（数据 · 手法：矩阵 · 居左）

**底** `{colors.cream}`，`content-gutter`。**组成** frame-chrome、comparison-table。**焦点** cream-2 色的表格，带墨色表头行；一列填充色（粉色或绿色）标出胜出者。**强调** 那唯一一列的填充色。**留白** 很紧——第二个密度例外。**固定** cream-2 填充、0.3cqw 内部分隔线、带奶油色 Archivo 标签的墨色表头行。**可变** 各行、填充哪一列、文案。**密度** 密集例外。

## 构图规则

### 要做

- 围绕**每帧一个想法**来构图，焦点元素是**相邻元素的 3–5 倍**（眯眼测试）。
- **偏向居中**——cover、claim、数据网格和 closer 都把焦点元素居中；居左 / 不对称留给 marker 和账目帧。
- 稀疏帧保持 **45–60% 是空的**；只有数据网格和账目帧是密集的。
- **每帧用两到三种强调色**；`{colors.green}` 底留给收尾版面。
- 硬偏移阴影只花在**每帧一个特写色块**上。
- 标题**按长度定字号**；Archivo Black 全大写、行高 0.92。

### 不要做

- 不要圆角（胶囊标签片除外）；不要渐变、模糊或发光。
- 不要把 Archivo Black 设成句首大写，字距不要超出 −0.01em。
- 不要在一帧里四种强调色全用，不要第五种强调色，不要纯白。
- 不要把正文居中，标签不要用 JetBrains Mono 以外的任何字体。
- 不要让标题从边到边撑满——长行就把字号阶梯降一档。
- 不要在一帧里放两个硬阴影。

## 宽高比适配

| 处理方式 | 16:9 | 9:16 | 1:1 |
| --- | --- | --- | --- |
| Wordmark Cover | 两行居中 | 竖向堆叠、更高，圆形在上 | 居中，更紧凑 |
| Big Claim | 主张居左，满版强调色 | 主张在上，强调色满版 | 主张居中 |
| Stat Grid | 标题在三联一排之上 | 标题在上，3 个竖向堆叠 | 标题在上，2×2（第 4 格） |
| Closing Plate | 收尾语居中，印章在角落 | 竖向堆叠，印章在下 | 居中，印章在角落 |
| Featured Marker | marker 不对称 | marker 居中，阴影朝下 | marker 居中 |
| Comparison Ledger | 全宽表格 | 表格滚动到更少的列 | 两列表格 |

每种比例下，安全区在短边上都保持 `3.3cqw` 的辅助元素内缩；按每种比例重新选择展示字的字号档位，确保没有任何承重的文字行低于 1.4cqw 的下限。

## 已批准实体

源文件里没有定义任何真实客户、logo 或供应商——任何此类标记都渲染成占位符。产品 / 分节与内容无关；这套系统提供的是几何，不是品牌。

## 数字与声明（硬规则）

绝不在帧尺度上编造数字、百分比、计数或日期。把数据槽位渲染成 `— figure —`、`{metric}`、`N×`。只有脚本提供了真实数字时才出现真实数字——数据网格和账目帧尤其要用占位符，而不是编造的数值。

## 渲染前自查

- **眯眼**——一个元素占主导，体量是相邻元素的 3–5 倍，否则重新调整比例。
- **留白**——稀疏帧 45–60% 是空的；只有数据网格 / 账目帧是密集的。
- **强调色**——每帧两到三种，绝不四种全用；绿色底只用在收尾帧上。
- **深度**——0 模糊；最多一个硬偏移阴影；其余靠色块对比。
- **几何**——除胶囊外都是直角；旋转只用 −4/−6deg。
- **字体**——Archivo Black 全大写、行高 0.92、按长度定字号，承重文字行 ≥1.4cqw。
- **锚定**——默认居中；只有 marker + 账目帧居左 / 不对称；不要连续 3 帧用同一种锚定。
- **编造**——每个数字都能追溯到脚本，否则用占位符。

## 已知缺口

- **动效有意不在范围内。** frame.md 只规定构图；时间和转场是后面的阶段。收尾的绿色被描述为一个*版面*（plate），而不是一个转场。
- **Archivo Black 需要 Google Fonts**；兜底字体是 `sans-serif`。CJK 搭配（Noto Serif SC 900 / NSC 400）沿用源设计的 CJK 部分。
- **9:16 / 1:1 只是指导**，不是锁死到像素的；按每种比例检查可读性下限。
- 装饰性几何（圆形、印章、堆叠色块）都是纯 CSS 实现；不需要外部图片。
