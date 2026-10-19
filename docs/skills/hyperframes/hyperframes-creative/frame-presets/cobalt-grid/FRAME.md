---
version: alpha
name: Cobalt Grid — Frame (video / frame layer)
description: >
  Video-first companion to Cobalt Grid's design.md. The unit is the frame (1920×1080). Atoms
  are identical and sacred — warm cream paper, electric cobalt ink (the only ink), the permanent
  graph-paper grid, Newsreader serif 400 + Hanken Grotesk + DM Mono, the top/bottom cobalt
  hairlines, and the pixel-glitch + QR-block signatures. Composition, frame scale, and
  aspect-ratio behavior are rewritten for the frame. Motion is out of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  paper: "#F0EBDE"
  paper-2: "#E6E0CE"
  ink: "#1F2BE0"
  ink-soft: "#5560E5"
  grid: "rgba(31,43,224,0.10)"
  ink-faint: "rgba(31,43,224,0.18)"

typography:
  # — reading ramp —
  body:        { fontFamily: "Hanken Grotesk", cqw: 0.83, weight: 400, lineHeight: 1.5 }
  body-lede:   { fontFamily: "Hanken Grotesk", cqw: 0.95, weight: 400, lineHeight: 1.5 }
  micro:       { fontFamily: "Hanken Grotesk", px: 13, weight: 600, tracking: "0.16em", upper: true }
  micro-strong: { fontFamily: "Hanken Grotesk", px: 16, weight: 600, tracking: "0.18em", upper: true }
  mono-tag:    { fontFamily: "DM Mono", cqw: 0.78, weight: 400, tracking: "0.05em" }
  mono-chrome: { fontFamily: "DM Mono", px: 13, weight: 400, tracking: "0.06em" }
  # — display / hero ramp (Newsreader 400, negative tracking) —
  table-name:  { fontFamily: "Newsreader", cqw: 1.5, weight: 400, lineHeight: 1.15 }
  row-headline: { fontFamily: "Newsreader", cqw: 2.1, weight: 400, lineHeight: 1.05 }
  ed-callout:  { fontFamily: "Newsreader", cqw: 2.6, weight: 400, lineHeight: 1.1, italic: true }
  headline:    { fontFamily: "Newsreader", cqw: 4.6, weight: 400, lineHeight: 0.95 }
  headline-index: { fontFamily: "Newsreader", cqw: 5.0, weight: 400, lineHeight: 0.95 }
  display-quote: { fontFamily: "Newsreader", cqw: 5.7, weight: 400, lineHeight: 1.05, tracking: "-0.005em" }
  display-chapter: { fontFamily: "Newsreader", cqw: 6.8, weight: 400, lineHeight: 1.0, tracking: "-0.005em" }
  display-closing: { fontFamily: "Newsreader", cqw: 9.4, weight: 400, lineHeight: 0.96, tracking: "-0.005em" }
  display-hero: { fontFamily: "Newsreader", cqw: 10.4, weight: 400, lineHeight: 0.9, tracking: "-0.008em" }
  vbig-numeral: { fontFamily: "Newsreader", cqw: 12.5, weight: 400, lineHeight: 0.9, tracking: "-0.015em" }

spacing:
  edge: "4cqw"          # standard frame edge inset (~80px@1920)
  pad-top: "7cqw"
  pad-bottom: "6cqw"
  gap-md: "2cqw"

components:
  graph-grid:
    backgroundImage: "linear-gradient grid, ~2cqw cells, 10% {colors.ink} ({colors.grid})"
    placement: "behind EVERY frame on the ground"
    description: "Permanent graph-paper grid — never disabled; the canvas tone."
  hairlines:
    rule: "0.12cqw solid {colors.ink}"
    placement: "≈3cqw from top + bottom, inset {spacing.edge}"
    description: "Two persistent cobalt rules framing every composition."
  page-chrome:
    typography: "{typography.pagenum}"
    color: "{colors.ink}"
    placement: "page number bottom-right, nav/meta hint bottom-left, above the bottom hairline"
    description: "The only persistent chrome."
  pixel-glitch:
    backgroundColor: "{colors.paper}"
    fill: "repeating-linear-gradient(90deg, {colors.ink} 0 2px, transparent 2px 8px)"
    size: "14–30cqw wide, full height, stair-stepped"
    placement: "right on cover/data, left on chapter/colophon; z above grid, below headline"
    description: "Stair-stepped scanline column. Decorative."
  qr-block:
    backgroundColor: "{colors.paper}"
    cells: "8×8, {colors.ink} on / {colors.grid} off"
    size: "3–9cqw square"
    shadow: "0 0 0 0.12cqw {colors.paper} (anti-shadow for readability, not elevation)"
    description: "QR mosaic patch — corner punctuation."
  topbar-rule:
    typography: "{typography.headline-index} + {typography.mono-tag}"
    borderBottom: "0.12cqw solid {colors.ink}"
    description: "Section header on index/data/table frames."
  ledger-row:
    layout: "grid: mono num · Newsreader name · Hanken desc · mono delta"
    borderBottom: "0.06cqw solid {colors.ink-faint} (header 0.12cqw solid {colors.ink})"
    typography: "{typography.mono-tag} + {typography.table-name} + {typography.body}"
    description: "Dense matrix row with ↑/↓/— delta."
  pixel-stack-bar:
    cells: "column-reverse, {colors.grid} off / {colors.ink} on"
    baseline: "0.12cqw solid {colors.ink} + {typography.mono-tick} ticks"
    description: "Data as grid-unit cells; echoes the glitch."
  vstack-label:
    typography: "{typography.mono-tick}"
    transform: "writing-mode: vertical-rl"
    description: "Catalogue chrome along a frame edge."
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/frame-presets/cobalt-grid/FRAME.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Cobalt Grid — Frame (video / frame layer)

## 概述

帧尺度下的 Cobalt Grid 是一份**双色孔版印刷（risograph）的趋势报告**——温暖的奶油色纸、电光钴蓝油墨，每一帧背后都有一张**常驻的坐标纸网格**。钴蓝是*唯一*的油墨：标题、正文、线条、网格、像素故障装饰、二维码色块。没有强调色，也没有第二种表面。

它的字体声音是三款字体的对话：400 字重的 **Newsreader** 衬线体（层级靠字号而不是字重）承担每一个展示字和标题；**Hanken Grotesk** 承担正文和全大写加字距的标签；**DM Mono** 承担所有辅助元素（chrome）——页码、标签、刻度、竖排堆叠。每一帧都由顶部 + 底部的钴蓝细线框住；宣告帧带有**像素故障竖栏**和一块 **QR-block** 色块。

**帧尺度下的关键特征：**

- **严格双色**——奶油色纸 + 钴蓝油墨；没有强调色，没有第二种表面。
- 每一帧背后都有**常驻的约 2cqw 坐标纸网格**（10% 钴蓝）；不能关掉。
- **顶部 + 底部 1.5px 钴蓝细线**框住每一个构图，按 `edge` 内缩。
- 所有展示字用 **Newsreader 400**（负字距）；标签用 **Hanken 600** 全大写 0.16em；辅助元素用 **DM Mono**。
- **像素故障竖栏 + QR-block** 是宣告帧上标志性的装饰色块。
- **像素堆叠条**把数据渲染成以网格单位为格的单元（钴蓝为开 / 10% 为关）。

## 帧

### 帧工艺门槛

每一帧在做任何结构检查之前，先要过三项目测闸门：

- **眯眼**——一个 Newsreader 元素占主导，体量是**离它最近的元素的 3–6 倍**（`display-hero`/`vbig-numeral`）；层级靠字号，绝不靠字重。
- **留白**——宣告帧（cover、chapter、quote、colophon）看起来 **45–60% 是空的**，露出网格；**索引账目帧和数据帧是唯一的密集例外**（密度来自安静的重复，而不是丰富）。
- **克制**——**只有两种颜色**（奶油色 + 钴蓝，绝不用第二种色相）；每个宣告帧一条像素故障竖栏，最多一块 QR-block。
- **参照**——瞄准 **WIRED Japan / Shift 那种双色孔版印刷的专著**；失败的样子是**带第二种强调色相的彩色仪表盘**。

- **主尺寸：** 1920×1080（16:9）。展示字用 **`cqw`** 编写（`px ÷ 1920 × 100 = cqw`）。
- **竖屏：** 1080×1920（9:16）。**方屏：** 1080×1080（1:1）。
- **安全区：** 按 `edge`（4cqw）内缩；细线 + 页面辅助元素都落在安全线上。

**容器法则（承重规则）。** 每一帧的底层元素都设置 `container-type: size`，并且带上坐标纸 `background-image`；所有相对于帧的单位都是基于它的 `cqw`/`cqh`——绝不用 `vw`。网格的 `background-size` 是 `~2cqw 2cqw`，这样无论按什么尺寸渲染，格子密度都保持不变。

## 色彩

token 与源设计完全一致。`{colors.paper}` 是底色；`{colors.ink}` 钴蓝是唯一的油墨（文字、线条、网格线、故障装饰、二维码）。`{colors.ink-soft}` 是次级钴蓝，只用于编辑风副标题；`{colors.grid}`（10%）是常驻网格 + 图表的"关"格；`{colors.ink-faint}`（18%）是淡淡的行分隔线。**绝不用第二种色相**——强调来自字号、从 Hanken 换成 Newsreader、一个等宽的变化箭头，或者不透明度，绝不来自颜色。

## 字体排印

两套字号阶梯。**阅读阶梯**（Hanken 正文 0.83cqw，等宽辅助元素用 px）承载文案和标签；**展示 / hero 阶梯**（Newsreader `headline` 4.6cqw → `vbig-numeral` 12.5cqw）承载每一句陈述和每一个数字。

- **可读性下限：** 任何承重的文字行 ≥ **1.4cqw**；等宽辅助元素（px）只用于版权页式信息。
- **按长度定字号：** 根据标题的行长决定字号。整块宽度上限 **≤ 78cqw**；≤3 个词 → `display-hero`/`vbig-numeral`；4–6 个词 → `display-chapter`；7 个词以上 → `headline`。
- **Newsreader 只用 400 字重**，钴蓝色，负字距（hero −0.008em，数字 −0.015em）。**Hanken 标签全大写，0.16–0.18em。** **DM Mono 0.04–0.08em。** 衬线字不加粗。

## 深度与表面

平面。深度只来自结构：

- **1.5px 钴蓝线**——幻灯片细线、顶栏线、图表基线。
- **1px ink-faint 分隔线**——密集列表 / 账目行。
- **坐标纸网格**——一切背后带刻度的平面色调。
- **像素故障 + 二维码**——纹理和图形化的标点，没有 z 轴。

**上限：** 不用投影（二维码那 1.5px 的纸色外扩是为了可读性的反阴影，不是抬升），不用渐变，不用圆角，不用第二种颜色。

## 形状

- **所有地方圆角都是 0**——画框、账目行、二维码格子、故障方块、图表。零圆形元素；这种方正就是身份标识的一部分。

## 组件

- **graph-grid / hairlines / page-chrome**——常驻的画面陈设，每一个构图都会继承。
- **pixel-glitch**（边缘竖栏）+ **qr-block**（角落色块）——宣告帧上的标志性装饰。
- **topbar-rule**——索引 / 数据 / 表格的分节头。**ledger-row**——带变化箭头的密集矩阵行。
- **pixel-stack-bar**——以网格单位为格的数据。**vstack-label**——竖排的等宽目录辅助元素。

## 帧处理方式

> 配方：底（ground）· 容器（container）· 组成（composes）· 焦点（focal）· 辅助元素（chrome）· 强调（accent）· 留白（silence）· 固定/可变（Fixed/Free）· 密度（density）。
> 每一帧都有网格 + 细线。按类型选择密度：宣告帧 = 稀疏，索引 / 数据帧 = 密集。

### 1 · Hero Cover（身份 · 手法：衬线字 + 故障装饰 · 居左）

**底** 纸 + 网格，细线。**组成** pixel-glitch（右侧，约 26cqw）、qr-block（右上角）、display-hero、ed-callout。**焦点** 一个 1–2 行的钴蓝 `display-hero` Newsreader 标题，左侧锚定，带一行 `{colors.ink-soft}` 色的斜体 `ed-callout` 副标题。**辅助元素** Hanken 眉题；顶部等宽元信息 + 页码。**强调** 无（钴蓝是唯一的油墨）。**留白** 约 45% 是纸面。**固定** Newsreader 400、有故障装饰 + 二维码、网格 + 细线。**可变** 标题、故障装饰的阶梯图案、二维码位置。**密度** 稀疏。

### 2 · Index Ledger（列举 · 手法：密集矩阵 · 居左——那个密集帧）

**底** 纸 + 网格，细线，`pad-top`/`pad-bottom`。**组成** topbar-rule、ledger-rows。**焦点** 一条顶栏（`headline-index` + 等宽 lab-tag，1.5px 线），下面是 4–6 行账目行（等宽编号 · Newsreader 名称 · Hanken 描述），用 ink-faint 分隔线隔开。**辅助元素** 页码。**强调** 等宽变化箭头。**留白** 很紧——这是密度例外（网格就是要被填满的）。**固定** 1.5px 顶栏线、1px ink-faint 分隔线、Newsreader 名称。**可变** 各行、lab-tag、变化值。**密度** 密集例外。

### 3 · Chapter Opener（分节 · 手法：尺度 · 稀疏 · 居左）

**底** 纸 + 网格，细线。**组成** pixel-glitch（左侧，约 14cqw，低不透明度）、等宽索引、display-chapter、body-lede。**焦点** 一个 `display-chapter` Newsreader 标题，上方是一个小号等宽 `CHAPTER NN` 索引，可选一段 ≤42cqw 的 Hanken 导语。**强调** 无。**留白** 约 60%——让网格呼吸。**固定** Newsreader 400、低不透明度的故障装饰、露出网格。**可变** 标题、导语、故障装饰放在哪一侧。**密度** 稀疏。

### 4 · Data Frame（图表 · 手法：像素堆叠 · 居左）

**底** 纸 + 网格，细线，`pad-top`。**组成** topbar-rule、一排 pixel-stack-bar。**焦点** 一排 6–8 根像素堆叠条（钴蓝为开 / 10% 为关），下面是一条带等宽刻度的 1.5px 钴蓝基线。**辅助元素** 顶栏标题 + 等宽 fig-tag；页码。**强调** 无——数据就是钴蓝格子。**留白** 适中。**固定** 网格单位格子、钴蓝基线、等宽刻度。**可变** 条形数值（来自脚本）、刻度标签。**密度** 标准 / 密集。

### 5 · Manifesto / Quote（引语 · 手法：居中陈述 · 稀疏）

**底** 纸 + 网格，细线。**组成** display-quote（或 display-manifesto）、署名线、可选的紧凑故障装饰。**焦点** 一段 2–3 行的钴蓝 Newsreader 引文，上方一个 Hanken 眉题，下方一条 1px 钴蓝署名线 + 等宽署名。**强调** 无。**留白** 约 55%——刻意留空。**固定** Newsreader 400、署名线、露出网格。**可变** 引语、署名。**密度** 稀疏。

### 6 · Colophon（收尾 · 手法：右对齐收尾 · 稀疏）

**底** 纸 + 网格，细线。**组成** pixel-glitch（左边缘，与 cover 镜像）、display-closing、等宽的致谢栏。**焦点** 一个右对齐的 `display-closing` Newsreader 标题，上方一个 Hanken 眉题。**辅助元素** 底部 3–4 栏的等宽致谢网格；页码。**强调** 无。**留白** 约 50%。**固定** 故障装饰在左、Newsreader 400。**可变** 收尾语、致谢名单。**密度** 稀疏。

## 构图规则

### 要做

- 每一帧都保留**坐标纸网格 + 顶部 / 底部细线**——它们就是这套系统本身。
- **Newsreader 用 400 字重、钴蓝色**；用字号而不是字重建立层级；展示字用负字距。
- **Hanken 标签全大写，字距 0.16em**；**DM Mono 辅助元素 0.04–0.08em**。
- 把数据渲染成**像素堆叠格子**（钴蓝为开 / 10% 为关）；呼应故障装饰的语言。
- 在宣告帧（cover、chapter、quote、colophon）上用**像素故障竖栏 + 二维码色块**。
- 倾向：宣告帧稀疏、有呼吸感；索引 / 数据帧密集。变换锚定方式（索引 / chapter 居左，引语 / 收尾居中）。

### 不要做

- 不要引入第二种油墨颜色——只用奶油色 + 钴蓝。
- 不要把 Newsreader 加粗，不要给任何角加圆角，不要加投影（二维码的外扩只是反阴影）。
- 不要关掉网格，不要压掉细线。
- 不要把 chapter / quote / colophon 帧塞满——这些帧要露出网格。
- 不要让衬线标题从边到边撑满——按长度定字号。

## 宽高比适配

| 处理方式 | 16:9 | 9:16 | 1:1 |
| --- | --- | --- | --- |
| Hero Cover | 标题居左，故障装饰居右 | 标题在上，故障装饰成全宽带状 | 标题偏上，故障装饰偏下 |
| Index Ledger | 顶栏 + 各行 | 顶栏 + 更少的行 | 两栏压缩成一栏 |
| Chapter Opener | 标题居左，故障装饰在左 | 标题在上，故障装饰在侧边 | 标题居中 |
| Data Frame | 6–8 根条 | 4–5 根条，更高 | 方形图表 |
| Manifesto / Quote | 引文居中 | 居中，更高 | 居中 |
| Colophon | 右对齐，故障装饰在左 | 竖向堆叠，故障装饰在上 | 居中收尾 |

每种比例下，网格 + 细线在短边上都保持不变；重新选择展示字的字号档位，确保没有任何承重的文字行低于 1.4cqw。等宽辅助元素只用拉丁字母和数字。

## 已批准实体

源文件里没有定义任何真实客户、logo 或供应商——任何此类标记都渲染成占位符。趋势名称、信号和数字都是内容；这套系统提供的是网格和辅助元素。

## 数字与声明（硬规则）

绝不在帧尺度上编造数字、变化值、日期或信号计数。把槽位渲染成 `— figure —`、`{metric}`、`↑ —`。像素堆叠条的高度和账目行的变化值尤其要一直用占位符，直到脚本提供数值为止。等宽目录序号（001、002……）是装饰性的，可以按顺序编号。

## 渲染前自查

- **眯眼**——一个 Newsreader 元素占主导，体量是相邻元素的 3–5 倍。
- **留白**——宣告帧 45–60% 是空的；只有索引 / 数据帧是密集的。
- **双色**——只有奶油色 + 钴蓝；任何地方都没有第二种色相。
- **陈设**——有网格，有顶部 / 底部细线，页面辅助元素在细线上方。
- **字体**——Newsreader 400、负字距、按长度定字号；Hanken 标签 0.16em；下限 ≥1.4cqw。
- **深度**——0 阴影（二维码外扩除外），0 圆角。
- **锚定**——索引 / chapter / cover 居左，引语 / 收尾居中；不要连续 3 帧用同一种锚定。
- **编造**——每个数字 / 变化值都能追溯到脚本，否则用占位符。

## 已知缺口

- **动效有意不在范围内。** frame.md 只规定构图；源设计中 280ms 的交叉淡化属于演示文稿的机制。
- **这里的像素故障用 CSS 渲染**（堆叠的扫描线方块），而不是源设计中的内联 SVG，以保持 showcase 不含 SVG；保真度不受影响。
- **三款 Google Fonts**（Newsreader、Hanken Grotesk、DM Mono）；CJK 搭配（Noto Serif SC 700/400）沿用源设计。
- **9:16 / 1:1 只是指导**；按每种比例检查可读性下限和网格密度。
- 二维码马赛克和故障装饰的阶梯图案都是手工编写的；没有生成层。
