---
version: alpha
name: Biennale Yellow — Frame (video / frame layer)
description: >
  Video-first companion to Biennale Yellow's design.md. The unit is the frame (1920×1080). Atoms
  are identical and sacred — warm parchment grounds, a single deep indigo ink, solar yellow deployed
  as bloom / panel / tile underprint, Instrument Serif display + Archivo sans + JetBrains Mono data,
  1px hairline rules as the only border, atmospheric depth (no shadows), and the bottom-right
  pagenum. Composition + frame scale rewritten. Restraint is the rule; motion out of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  paper: "#E9E5DB"
  paper-deep: "#DCD6C4"
  sun: "#F1EE2E"
  sun-soft: "#F8F39B"
  haze: "#F0DA7C"
  ink: "#1B2566"
  ember: "#E26B4A"

typography:
  # — reading + data ramp —
  body:    { fontFamily: "Archivo", cqw: 0.85, weight: 400, lineHeight: 1.5, color: "ink" }
  body-lede: { fontFamily: "Archivo", cqw: 0.95, weight: 400, lineHeight: 1.55 }
  micro-label: { fontFamily: "Archivo", px: 13, weight: 600, tracking: "0.18em", upper: true }
  rail-label: { fontFamily: "Archivo", px: 13, weight: 600, tracking: "0.32em", upper: true }
  mono-data: { fontFamily: "JetBrains Mono", cqw: 0.73, weight: 400, tracking: "0.04em" }
  pagenum: { fontFamily: "JetBrains Mono", px: 13, weight: 400, tracking: "0.08em", opacity: 0.75 }
  # — display ramp (Instrument Serif 400, tight, negative tracking) —
  ledger-title: { fontFamily: "Instrument Serif", cqw: 1.55, weight: 400, lineHeight: 1.15 }
  strand-title: { fontFamily: "Instrument Serif", cqw: 1.7, weight: 400, lineHeight: 1.1 }
  headline-sm: { fontFamily: "Instrument Serif", cqw: 2.9, weight: 400, lineHeight: 1.0 }
  headline: { fontFamily: "Instrument Serif", cqw: 4.6, weight: 400, lineHeight: 1.06, tracking: "-0.005em" }
  date-rail: { fontFamily: "Instrument Serif", cqw: 5.0, weight: 400, lineHeight: 0.96, tracking: "-0.005em" }
  display-it: { fontFamily: "Instrument Serif", cqw: 7.0, weight: 400, italic: true, lineHeight: 1.04, tracking: "-0.005em" }
  numeral-md: { fontFamily: "Instrument Serif", cqw: 7.5, weight: 400, lineHeight: 0.92, tracking: "-0.01em" }
  display: { fontFamily: "Instrument Serif", cqw: 14.6, weight: 400, lineHeight: 0.86, tracking: "-0.018em" }
  numeral-jumbo: { fontFamily: "Instrument Serif", cqw: 28.0, weight: 400, lineHeight: 0.84, tracking: "-0.04em" }

spacing:
  pad-edge: "4cqw"
  pad-region: "4.2cqw"
  gap-region: "2.5cqw"

components:
  sun-bloom:
    background: "radial gradient {colors.sun} core → {colors.sun-soft} → {colors.haze} → transparent on {colors.paper}"
    size: "42–70% of the frame, off-center or behind the focal element"
    description: "The primary depth layer. One per frame; a flat parchment frame reads as broken."
  ember-bloom:
    background: "radial {colors.ember} at 15–22% opacity"
    placement: "corner opposite the sun-bloom"
    description: "Subordinate counter-temperature balance; never dominant."
  block-tile:
    backgroundColor: "{colors.sun} at 40–70% opacity"
    layout: "rectangles on an 8×4 grid behind cover/colophon"
    description: "A layered poster underprint."
  yellow-panel:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.ink}"
    rounded: "0"
    border: "none (meets paper directly)"
    description: "Full-bleed column/third — the strongest color statement, ink on top."
  hairline-rule:
    rule: "1px solid {colors.ink} (soft variant: {colors.ink} at 18–20%)"
    description: "The ONLY border — header underlines, footer tops, ledger separators. No thicker rule exists."
  strand-row:
    borderBottom: "1px {colors.ink} 18–20%"
    typography: "{typography.strand-title} + {typography.body}"
    description: "Serif numeral + serif title + sans body. Numbered editorial lists."
  ledger-row:
    borderBottom: "1px {colors.ink} 18–20%"
    typography: "{typography.mono-date} · {typography.ledger-title} · {typography.body} · {typography.mono-data}"
    description: "4-col tabular — mono date · serif title · sans venue · mono duration (right)."
  footer-band:
    borderTop: "1px solid {colors.ink} per cell"
    typography: "{typography.micro-label} + {typography.body-sm}"
    description: "4-column metadata strip at the foot of cover/colophon."
  vertical-rail:
    typography: "{typography.rail-label}"
    transform: "rotated up the left edge"
    description: "Section marker on chapter/divider frames."
  pagenum:
    typography: "{typography.pagenum}"
    color: "{colors.ink} at 75%"
    placement: "bottom-right"
    description: "The only persistent chrome."
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/frame-presets/biennale-yellow/FRAME.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Biennale Yellow — Frame (video / frame layer)

## 概述

帧尺度下的 Biennale Yellow 是一套**文学编辑风系统**，调性属于艺术双年展的图录：温暖的羊皮纸色、单一的深靛蓝墨色，以及作为氛围的太阳黄。不用卡片、不用按钮、不用阴影、不用圆角 —— 结构词汇只有**纸、墨和黄。** 深度由柔和的径向**太阳光晕（sun bloom）** 提供，而不是靠抬升。

它的字体声音是三款字体，各自扮演严格固定的角色：**Instrument Serif**（字重 400、紧凑行高、负字距）承担从 40px 到 720px+ 的每一个展示字、数字和引语；**Archivo** 承担正文和加宽字距的全大写 micro-label；**JetBrains Mono** 承担每一个日期、数据和 pagenum。文字**永远是墨色** —— 对比来自字号和字重，绝不来自颜色。整体情绪介于一份折页式博物馆宣传册和一本需要慢读的文学季刊之间：自信、有氛围、极度克制。

**帧尺度下的关键特征：**

- 每一帧都用**温暖的羊皮纸底色**；绝不用白色，绝不用灰色。
- 所有文字和所有线条都用**单一墨色**（`{colors.ink}`）；**太阳黄**用作光晕 / 面板 / 色块。
- **Instrument Serif 400** 展示字（紧凑、负字距）；**Archivo** 正文 + micro-label；**JetBrains Mono** 数据。
- **1px 发丝细线**是唯一的边框 —— 不存在更粗的线重；**不用阴影，不用圆角**。
- **太阳光晕**是每一帧上的主要深度层；一个余烬色的反向光晕增添冷暖张力。
- **编辑式克制** —— 稀疏显得优雅；拥挤会破坏图录感。

## 帧

### 帧工艺门槛

每一帧在做任何结构检查之前，先要过三项目测闸门：

- **眯眼** —— 一个 Instrument Serif 时刻占主导，体量是相邻元素的 3–6 倍；太阳光晕把视线聚到中心。
- **留白** —— 画面看起来有 **55–60% 是空的**；**ledger 是唯一的密集例外**（密度来自安静的发丝细线重复，而不是丰富的内容）。
- **克制** —— 所有文字和线条用**一种墨色**；每帧**一个太阳光晕**（+ 可选的、处于从属地位的余烬色光晕）；绝不反相（不在墨色上放黄色文字）。
- **参照** —— 瞄准**艺术双年展图录 / 慢节奏的展览海报 / 文学季刊**；失败的样子是**扁平的 CMS 模板**（没有光晕）或者**带边框卡片的演示文稿**。

- **主尺寸：** 1920×1080（16:9）。展示字用 **`cqw`** 编写（`px ÷ 1920 × 100 = cqw`）。
- **竖屏：** 1080×1920（9:16）。**方屏：** 1080×1080（1:1）。
- **安全区：** `pad-edge` 4cqw（约合 40–76px）—— 优雅感依赖于边缘的负空间；只有光晕、色块和面板可以出血。

**容器法则（承重规则）。** 每一帧的底层元素都设置 `container-type: size`；所有相对于帧的单位都是基于它的 `cqw`/`cqh` —— 绝不用 `vw`。发丝细线保持 1px；光晕尺寸按帧的 `%` 缩放。

## 色彩

token 与源设计完全一致。`{colors.paper}` 是通用的底色；`{colors.ink}`（深靛藏青）用于**每一行文字和每一条线** —— 没有第二种文字颜色。`{colors.sun}` 有三种用法：**光晕（bloom）**（径向氛围）、**yellow-panel**（铺满出血的海报式填充，墨色在上），以及 **block-tile** 底印。`{colors.sun-soft}`/`haze` 是光晕的中间 / 外圈色标。`{colors.ember}` **只**作为 15–22% 的反向光晕出现 —— 绝不用作填充，绝不用作文字。**这套系统绝不反相** —— 墨色放在太阳黄上是对的；墨色上的黄色文字不存在。

## 字体排印

两套字号阶梯。**阅读 / 数据阶梯**（Archivo 正文 0.85cqw 墨色、以 px 计的 micro-label、JetBrains Mono 数据）承载文案和辅助元素（chrome）；**展示阶梯**（Instrument Serif `ledger-title` 1.55cqw → `numeral-jumbo` 28cqw）承载每一个标题、数字和引语。

- **可读性下限：** 任何承重的文字行 ≥ **1.4cqw**；用 px 的 mono / 标签只是辅助元素（chrome）。
- **按长度定字号：** 根据标题的长度决定字号。整块宽度上限 **≤ 78cqw**；≤3 个词 → `display`；4–6 个 → `headline`；7 个以上 → `headline-sm`。超大数字是分隔帧的全部意义所在 —— 不要缩小它。
- **Instrument Serif 只用字重 400**（它的笔画对比就是字重信号），紧凑行高（0.84–1.06），负字距；**micro-label 用全大写 Archivo 600，字距 ≥0.16em**；**所有数字 / 日期用 mono**。不用粗体衬线，不用第二种文字颜色，正文 / 展示字里不用 mono。

## 深度与表面

靠氛围，而不是靠结构。深度来自：

- **太阳光晕** —— 主要层：一个分层的径向渐变（sun 70–95% 的核心 → sun-soft → haze 18–22% → paper 0%），占画面的 42–70%。每帧一个。
- **余烬色光晕** —— 对角位置一个 15–22% 的桃色反向光晕；永远处于从属地位。
- **Block-tile 底印** —— 排在 8×4 网格上的半透明黄色矩形（cover / 版权页）。
- **黄色面板** —— 唯一一处「硬」的色彩表态：一整栏 / 三分之一画面铺满黄色，墨色在上。
- **发丝细线** —— 1px 墨色，用于结构分隔（密集行用 18–20% 的柔和变体）。

**上限：** 零 box-shadow，零 text-shadow，零圆角，没有比 1px 更粗的边框。

## 形状

- **一切都是 0 圆角** —— 严格的矩形。光晕没有边缘（它们渐隐到纸色里）。

## 组件

- **sun-bloom / ember-bloom / block-tile** —— 氛围深度组合。**yellow-panel** —— 海报式填充的色彩表态。
- **hairline-rule** —— 唯一的边框（1px 墨色；密集行用柔和变体）。
- **strand-row / ledger-row / footer-band** —— 编辑式列表、表格式日历和元信息条。
- **vertical-rail** —— 旋转的章节标记。**pagenum** —— 右下角的 mono 辅助元素。

## 帧处理方式

> 配方：底（ground）· 容器（container）· 组成（composes）· 焦点（focal）· 辅助元素（chrome）· 强调（accent）· 留白（silence）· 固定/可变（Fixed/Free）· 密度（density）。
> 每一帧都有一个太阳光晕 + 右下角的 pagenum；默认就是稀疏。

### 1 · Cover（身份 · 手法：展示字 + 太阳光晕 · 居左）

**底** 纸色 + 一个大的 sun-bloom（中心偏左）+ 一个余烬色反向光晕（对角）。**组成** micro-label、display、date-rail、footer-band、pagenum。**焦点** 一个 2 行的墨色 Instrument Serif `display`（关键词用斜体），居左，位于一个 micro-label 下方。**辅助元素** 右上角一个衬线体的 date-rail；底部一条 4 栏的 footer-band。**强调** 太阳光晕 + 黄色。**留白** 由光晕撑住空旷的区域。**固定** 墨色文字、一个光晕、1px 的 footer 线、无阴影。**可变** 标题、日期、footer 单元格。**密度** 低。

### 2 · Chapter Divider（章节 · 手法：超大数字 · 竖向标签栏）

**底** 纸色 + 一个锚定在角落的 sun-bloom。**组成** vertical-rail、numeral-jumbo、headline-sm。**焦点** 单独一个巨大的 Instrument Serif `numeral-jumbo`（≈28cqw）占据主导，下方是一个衬线标题。**辅助元素** 沿左边缘向上旋转的 vertical-rail 标签；pagenum。**强调** 数字背后的光晕。**留白** 约 60%。**固定** 衬线 400、超大数字、rail 标签。**可变** 序数、标题、rail 文字。**密度** 低。

### 3 · Ledger（目录 · 手法：发丝细线表格行 · 那个密集帧）

**底** 纸色（光晕可选，要含蓄）。**组成** headline-sm + micro-label 顶栏、ledger-rows。**焦点** 一个 4 栏的表格式日历 —— mono 日期 · 衬线标题 · 无衬线场地 · mono 时长 —— 位于一条 1px 墨色表头线之下，由 hairline-soft 线分隔。**辅助元素** pagenum。**强调** 无 —— 密度来自安静的重复，而不是颜色。**留白** 很紧 —— 这是密度例外（靠重复实现，而不是靠丰富的内容）。**固定** 发丝细线、mono 日期、衬线标题。**可变** 行、场地。**密度** 密集例外。

### 4 · Manifesto / Quote（引语 · 手法：斜体衬线 · 居中光晕）

**底** 纸色 + 一个居中的 sun-bloom。**组成** numeral-lg 引号、display-it、署名。**焦点** 一段 2 行的墨色 Instrument Serif **斜体** `display-it` 引语，居中，位于一个超大的衬线引号下方。**辅助元素** 一个 micro-label 署名。**强调** 居中的光晕。**留白** 约 60% —— 有意留空。**固定** 斜体衬线、一个光晕、墨色。**可变** 引语、署名。**密度** 低。

### 5 · Poster Panel（表态 · 手法：黄色面板 · 分屏）

**底** 纸色，加一块铺满出血的 `{colors.sun}` `yellow-panel`（一栏或三分之一画面）。**组成** yellow-panel、micro-label、headline。**焦点** 一个墨色的 Instrument Serif `headline`，放在**太阳黄面板上**（黄底墨字 —— 招牌做法）。**辅助元素** micro-label；pagenum。**强调** 面板本身。**留白** 纸色那一侧保持空旷。**固定** 太阳黄上的墨色、面板直接与纸色相接（无边框）、无阴影。**可变** 标题、面板所在的一侧 / 宽度。**密度** 低。

### 6 · Strand List（节目单 · 手法：编号的编辑式行 · 居左）

**底** 纸色 + 一个含蓄的 sun-bloom。**组成** micro-label、headline-sm、strand-rows。**焦点** 一个编号列表 —— 衬线数字 + 衬线标题 + 无衬线正文，用 hairline-soft 分隔线。**辅助元素** micro-label；pagenum。**强调** 光晕。**留白** 适中；行与行之间有呼吸感。**固定** 衬线数字、hairline-soft 线。**可变** 条目、文案。**密度** 标准。

## 构图规则

### 要做

- 从**温暖的羊皮纸色**开始；加上**一个太阳光晕**（可选再加一个余烬色反向光晕）—— 氛围就是深度。
- 每一行都用**墨色**排；展示字用 **Instrument Serif 400**（紧凑、负字距），正文用 **Archivo**，所有数字 / 日期用 **JetBrains Mono**。
- 每条分隔线都做成 **1px 墨色发丝细线**（密集行用柔和变体）；海报式时刻铺满一块**黄色面板**（墨色在上）。
- micro-label 保持**全大写 Archivo 600，字距 0.16–0.32em**；把 **pagenum** 固定在右下角。
- 偏向稀疏；cover / chapter / list 居左 / 不对称，manifesto 居中。

### 不要做

- 不要投影，不要圆角，不要带边框的卡片，不要比 1px 更粗的边框。
- 不要第二种文字颜色；不要粗体 Instrument Serif；不要反相的墨色底。
- 正文 / 展示字不要用 mono；不要替换字体。
- 不要把画布塞满 —— 稀疏显得优雅；不要省掉光晕（扁平的羊皮纸色看起来像 CMS 模板）。
- 不要让标题从边到边撑满 —— 在阶梯上降一档。

## 宽高比适配

| 处理方式 | 16:9 | 9:16 | 1:1 |
| --- | --- | --- | --- |
| Cover | display 居左，date-rail 在右上，footer 在底部 | display 在上，footer 堆叠 | display 偏上，footer 在底部 |
| Chapter Divider | 超大数字，rail 在左 | 数字居中，rail 在上 | 数字居中 |
| Ledger | 4 栏行 | 去掉场地栏 → 3 栏 | 3 栏 |
| Manifesto | 居中斜体 | 居中，更高 | 居中 |
| Poster Panel | 侧边面板 + 纸色 | 上 / 下的面板带 | 面板占三分之一 |
| Strand List | 编号行 | 行（更紧凑） | 行 |

`pad-edge` 在短边上保持不变；展示字的 clamp 使用较短的轴，这样竖屏时标题不会撑爆。承重的文字行保持 ≥ 1.4cqw。在 9:16 下，ledger / strand 固定宽度的第一栏可以收紧。

## 已批准实体

源文件里没有定义任何真实客户、logo 或供应商 —— 任何此类标记都渲染成占位符。节目标题、场地和日期都属于内容；这套系统提供的是纸、墨、黄。

## 数字与声明（硬规则）

绝不在帧尺度上编造数字、日期、时长或计数。把槽位渲染成 `— figure —`、`{metric}`、`NN JUN`、`N m`。尤其是 ledger 的日期 / 时长和图表数值，要一直用占位符，直到脚本提供数值为止。章节序数（01、02……）是装饰性的。

## 渲染前自查

- **眯眼** —— 一个衬线展示字时刻占主导；光晕把视线聚到中心。
- **留白** —— 稀疏帧有 55–60% 是空的；只有 ledger 是密集的（靠重复，而不是靠丰富的内容）。
- **一种颜色** —— 所有文字 + 线条用墨色；光晕 / 面板 / 色块用太阳黄；余烬色只用于反向光晕；不反相。
- **字体** —— Instrument Serif 400、紧凑、负字距、按长度定字号；micro-label 全大写、字距 0.16em 以上；数字用 mono；下限 ≥1.4cqw。
- **深度** —— 0 阴影、0 圆角、只有 1px 发丝细线；有一个太阳光晕。
- **锚定** —— cover / chapter / list 居左，manifesto 居中；pagenum 在右下角。
- **编造** —— 每个数字 / 日期都能追溯到脚本，否则用占位符。

## 已知缺口

- **动效有意不在范围内。** frame.md 只规定构图；源设计中 280ms 的交叉淡化属于演示文稿的机制。
- **Instrument Serif + Archivo + JetBrains Mono 通过 Google Fonts 加载。** CJK：Smiley Sans（展示字）/ Noto Serif SC（正文）/ Noto Sans SC（标签）；斜体衬线和 mono 等宽表格数字没有完全对应的汉字字体 —— ledger 日期保持拉丁字符。
- **9:16 / 1:1 只是指导**；`min(vw,vh)` 的 clamp 模式能防止展示字撑爆 —— 每种比例都要验证。
- 太阳 / 余烬色光晕、block tile、黄色面板和发丝细线都是纯 CSS 实现；不需要外部图片。
