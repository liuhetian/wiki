---
version: alpha
name: Bold Poster — Frame (video / frame layer)
description: >
  Video-first companion to Bold Poster's design.md. The unit is the frame (1920×1080). Atoms are
  identical and sacred — the four-color palette (white / brown-black ink / tomato red / off-white),
  the three-face stack (Shrikhand display tilted at poster scale, Libre Baskerville serif body,
  Space Grotesk mono chrome), the stacked text-shadow on red display, the 3px+1.5px double-border
  grid, red leftbar cards, red em-dash bullets, and the red progress bar. Composition + frame scale
  rewritten. Motion out of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  bg: "#FFFFFF"
  dark: "#1C1410"
  red: "#D8000F"
  light: "#F5F2EF"

typography:
  # — reading + chrome ramp —
  body:    { fontFamily: "Libre Baskerville", cqw: 0.85, weight: 400, lineHeight: 1.75, color: "dark" }
  body-cell: { fontFamily: "Libre Baskerville", cqw: 0.7, weight: 400, lineHeight: 1.55 }
  label:   { fontFamily: "Space Grotesk", px: 10, weight: 600, tracking: "2px", upper: true, color: "red" }
  bullet-body: { fontFamily: "Space Grotesk", cqw: 0.62, weight: 400, lineHeight: 1.45 }
  # — display / hero ramp (Shrikhand 400, tilted) —
  card-title: { fontFamily: "Shrikhand", cqw: 1.9, weight: 400, lineHeight: 1.1, color: "dark" }
  cell-number: { fontFamily: "Shrikhand", cqw: 2.7, weight: 400, lineHeight: 1.0, color: "red" }
  section-header: { fontFamily: "Shrikhand", cqw: 3.3, weight: 400, lineHeight: 1.0, color: "dark" }
  red-quote: { fontFamily: "Shrikhand", cqw: 4.7, weight: 400, lineHeight: 1.15, color: "bg", shadow: "stacked" }
  hero-title-bottom: { fontFamily: "Shrikhand", cqw: 10.4, weight: 400, lineHeight: 0.9, color: "dark", rotate: "2deg" }
  hero-title: { fontFamily: "Shrikhand", cqw: 11.5, weight: 400, lineHeight: 0.88, color: "dark" }
  hero-title-red: { fontFamily: "Shrikhand", cqw: 13.5, weight: 400, lineHeight: 0.85, color: "red", rotate: "-4deg" }
  close-big: { fontFamily: "Shrikhand", cqw: 13.5, weight: 400, lineHeight: 0.88, color: "red", rotate: "-5deg" }
  stat-big: { fontFamily: "Shrikhand", cqw: 22.0, weight: 400, lineHeight: 0.82, color: "red", rotate: "-6deg" }

spacing:
  pad-slide: "3cqw 3.6cqw"
  gap-grid: "1.5cqw 2cqw"

components:
  progress-bar:
    backgroundColor: "{colors.red}"
    size: "0.5cqw tall, bottom edge, width grows with index"
    description: "The most prominent chrome."
  hero-title-stack:
    typography: "{typography.hero-title} + {typography.hero-title-red} + {typography.hero-title-bottom}"
    transform: "≥4 tilt (−4°/+2°), ≥1 line in {colors.red}"
    description: "A 3-line Shrikhand composition — the signature opener."
  stat-big:
    typography: "{typography.stat-big}"
    color: "{colors.red} (or {colors.bg} on red with stacked shadow)"
    transform: "rotate(-6deg)"
    description: "Hero numeral at poster scale."
  fin-grid:
    border: "0.3cqw solid {colors.dark} outer"
    rule: "0.15cqw solid {colors.dark} inner (touching at intersections)"
    rounded: "0"
    typography: "{typography.cell-number} ({colors.red}) + {typography.label} + {typography.body-cell}"
    description: "The double-border tabular signature."
  red-leftbar-card:
    borderLeft: "4px solid {colors.red}"
    padding: "0 0 0 ~1cqw"
    rounded: "0"
    shadow: "none"
    typography: "{typography.card-title} + {typography.body} + red em-dash bullets"
    description: "Editorial card cantilevered off a red left rule — no outline."
  red-panel:
    backgroundColor: "{colors.red}"
    textColor: "{colors.bg}"
    description: "Full-bleed statement surface; display carries the stacked text-shadow."
  dark-panel:
    backgroundColor: "{colors.dark}"
    textColor: "{colors.bg}"
    description: "Full-bleed dark statement surface; red accents."
  stacked-text-shadow:
    shadow: "2px 2px 0 rgba(28,20,16,.25), 4px 4px 0 rgba(28,20,16,.2), 6px 6px 0 rgba(28,20,16,.15)"
    appliesTo: "red display text on red panels only"
    description: "The ONLY shadow in the system — text-shadow, not box-shadow."
  bullet:
    marker: "red em-dash (—) or round (•) glyph at absolute-left"
    color: "{colors.red}"
    description: "No default disc bullets; capped at three."
---

# Bold Poster — Frame (video / frame layer)

## 概述

帧尺度下的 Bold Poster 是一张**平民化的编辑风海报**——复古意大利体育杂志式的展示字体、古典衬线正文、一种饱和的番茄红、用墨色线条划分的网格。每一帧都应该有*印刷*感：海报尺度的粗重展示字体，锁定唯一的红色强调色，放在白色 / 米白色的纸面上（或一整块红色 / 深色的陈述面板上），装饰压到严格的最低限度。

它的字体声音是三款字体的组合：**Shrikhand**（粗重的 slab-script 字体，只用 400 字重，常规倾斜 −6°..+2°）承担所有 hero 标题、分节标题、数据和卡片标题；**Libre Baskerville**（文学气质的衬线体）承担所有正文段落——正是它让这套系统有印刷感；**Space Grotesk**（全大写，字距 2–3px）只做辅助元素（chrome）——标签、眉题、计数器、项目符号正文。画面是平的；*唯一*的阴影是红底展示字上的叠层 text-shadow。

**帧尺度下的关键特征：**

- **只有四种颜色**——白 / 棕黑墨色 / 番茄红 / 米白。红色是唯一的强调色。
- **Shrikhand 展示字，倾斜**（数据 −6°、收尾 −5°、hero 红行 −4°、hero 底行 +2°）——标志性的动势。
- **Libre Baskerville 衬线正文**（行高 1.75）；**Space Grotesk** 辅助元素（全大写、加字距）。
- **双线网格**（3px 外框 + 1.5px 内线，墨色）；**红色左竖条卡片**；**红色 em-dash 项目符号**（最多 3 个）。
- 红底展示字上的**叠层 text-shadow**——唯一的阴影；其余一律平面；直角。
- 每一帧底边都有一条**红色进度条**。

## 帧

### 帧工艺门槛

每一帧在做任何结构检查之前，先要过三项目测闸门：

- **眯眼**——**一个展示时刻占主导**，体量是其他一切的 3–6 倍（hero 堆叠、`stat-big` 或 `close-big`）；没有任何东西与之争夺。
- **留白**——陈述帧保留**约 50–60% 的负空间**；**财务网格是唯一的密集例外**。
- **克制**——**只有四种颜色**，红色是唯一的强调色；每帧一个展示时刻；红底上的叠层 text-shadow 是唯一的阴影；项目符号最多三个。
- **参照**——瞄准**复古意大利体育杂志封面 / 二十世纪中叶的欧洲年报**；失败的样子是**圆角、柔和阴影、多强调色的幻灯片**。

- **主尺寸：** 1920×1080（16:9）。展示字用 **`cqw`** 编写（`px ÷ 1920 × 100 = cqw`）。
- **竖屏：** 1080×1920（9:16）。**方屏：** 1080×1080（1:1）。
- **安全区：** `pad-slide` 约 3cqw——故意收得很紧，让海报字挤满画面。

**容器法则（承重规则）。** 每一帧的底层元素都设置 `container-type: size`；所有相对于帧的单位都是基于它的 `cqw`/`cqh`——绝不用 `vw`。边框仍用 px；旋转变换照旧保留。

## 色彩

token 与源设计完全一致。`{colors.bg}` 白色是默认底色；`{colors.dark}` 用于正文、边框、标题；`{colors.red}` 是唯一的强调色——每个数字、分节线、眉题、左竖条、项目符号、进度条，以及整块陈述面板的底色。`{colors.light}` 米白色用于交替面板的条纹。**没有第五种颜色**（没有绿 / 蓝 / 黄）；类别差异靠位置、标签和倾斜来体现。红色绝不用于正文，绝不做淡色调，绝不做不带文字的填充。

## 字体排印

两套字号阶梯。**阅读 / 辅助阶梯**（Baskerville 正文 0.85cqw，Space Grotesk 标签用 px）承载文案和辅助元素；**展示阶梯**（Shrikhand `section-header` 3.3cqw → `stat-big` 22cqw）承载每一句陈述和每一个数字。

- **可读性下限：** 任何承重的文字行 ≥ **1.4cqw**；等宽标签只是辅助元素。
- **按长度定字号：** 根据标题的长度决定字号。整块宽度上限 **≤ 78cqw**；≤2 个词 → `stat-big`/`hero-title-red`；3–4 个词 → `hero-title`；5 个词以上 → `section-header`。hero 是三行堆叠的构图。
- **Shrikhand 用 400 字重，在陈述 / hero 元素上倾斜，数字用红色**；**Baskerville 正文行高 ≥1.5**；**Space Grotesk 辅助元素全大写，字距 2–3px**。行内 `<strong>` 把字体切换为 Space Grotesk 600。展示字不用斜体，红色 hero 不能不倾斜。

## 深度与表面

平面。深度来自：

- **粗边框**——3px+1.5px 双线网格、2px 全局卡片描边、4px 红色左竖线。
- **表面反转**——满版的红色或深色陈述面板。
- **倾斜**——旋转的 Shrikhand 打破基线，营造出可感知的立体感。
- **唯一的阴影**——只在红底展示字上用叠层 text-shadow（是 text-shadow，三级）。

**上限：** 不用 box-shadow，不用圆角表面（直角；只有提示胶囊是 4px），不用渐变。

## 形状

- **所有地方圆角都是 0**，提示胶囊（4px）除外。卡片、单元格、面板、标注——全是锐利的矩形。

## 组件

- **hero-title-stack**——三行倾斜的开场。**stat-big**——海报级数字。
- **fin-grid**——标志性的双线表格。**red-leftbar-card**——悬挑式编辑卡片。
- **red-panel / dark-panel**——陈述面板。**stacked-text-shadow**——唯一的阴影。
- **bullet**——红色 em-dash（最多 3 个）。**progress-bar**——底部的红色长条。

## 帧处理方式

> 配方：底（ground）· 语域（register）· 组成（composes）· 焦点（focal）· 辅助元素（chrome）· 强调（accent）· 留白（silence）· 固定/可变（Fixed/Free）· 密度（density）。
> 每帧一个展示时刻；陈述帧保留大量负空间。

### 1 · Hero Stack（身份 · 手法：三行倾斜堆叠 · 居左）

**底** 白色。**组成** hero-title-stack、label、正文标语、progress-bar。**焦点** 一个三行 Shrikhand 堆叠（例如 墨色 / 红色倾斜 / 纸色）——一行红色，一行或以上倾斜。**辅助元素** 等宽眉题 + Baskerville 标语；底部进度条 + 计数器。**强调** 红色那一行。**留白** 右半边留空。**固定** Shrikhand 400、≥1 处倾斜 + ≥1 行红色、直角。**可变** 文字内容、各行字号。**密度** 低。

### 2 · Hero Stat（陈述 · 手法：海报级数字 · 红色面板 · 居中）

**底** 满版 `{colors.red}`。**组成** stat-big、label、正文副标。**焦点** 一个旋转 −6° 的白色 `stat-big` 数字，带叠层阴影，居中，上方一个等宽标签，下方一行 Baskerville 副标。**强调** 白字上的墨色叠层阴影。**留白** 约 60%。**固定** 红底白字 + 叠层阴影、−6° 倾斜。**可变** 数字本身（来自脚本）、标签。**密度** 低。

### 3 · Financial Grid（数据 · 手法：双线矩阵 · 那个密集帧）

**底** 白色，`pad-slide`。**组成** label、section-header、fin-grid。**焦点** 一个外框 3px / 内线 1.5px 的墨色单元格网格（红色 Shrikhand 数字 + 等宽标签 + Baskerville 正文）。**辅助元素** 等宽眉题；进度条。**强调** 红色数字。**留白** 很紧——这是密度例外。**固定** 双线边框、红色数字、衬线正文。**可变** 数字（来自脚本）、标签。**密度** 密集例外。

### 4 · Pull Quote（引语 · 手法：倾斜 / 叠层展示字 · 红色面板 · 居左）

**底** 满版 `{colors.red}`。**组成** red-quote、Baskerville 出处。**焦点** 两行白色 Shrikhand 引语，带叠层阴影；下方一行 Baskerville 出处。**强调** 叠层阴影。**留白** 约 50%。**固定** 红底白字 + 叠层阴影。**可变** 引语、出处。**密度** 低。

### 5 · Editorial Cards（内容 · 手法：红色左竖条卡片 · 居左）

**底** 白色（或交替的米白条纹）。**组成** label、section-header、2–3 张 red-leftbar-card。**焦点** 从 4px 红色竖线上悬挑出来的卡片——Shrikhand 标题 + Baskerville 正文

- 红色 em-dash 项目符号（最多 3 个）。**强调** 红色左竖线 + 项目符号。**留白** 适中。**固定** 4px 红色左竖条、em-dash 项目符号、无描边。**可变** 卡片内容。**密度** 标准。

### 6 · Closing Statement（收尾 · 手法：倾斜的 close-big · 居中 / 居左）

**底** 白色或 `{colors.dark}`。**组成** close-big、label、正文副标、progress-bar。**焦点** 一个 Shrikhand `close-big`（旋转 −5°，红色）收尾语；等宽眉题 + Baskerville 联系方式行。**强调** 红色倾斜标题。**留白** 约 60%。**固定** −5° 倾斜、红色 close-big。**可变** 收尾语、联系方式。**密度** 低。

## 构图规则

### 要做

- hero 标题用三行 Shrikhand 堆叠——至少一行倾斜，至少一行红色。
- 每个数字都用**红色 Shrikhand**；陈述性展示字倾斜 **−5° 到 −6°**。
- 眉题用 **Space Grotesk 600 全大写，字距 2–3px**，红色；正文用 **Baskerville，行高 1.75**。
- 数据网格用 **3px 外框 + 1.5px 内线的双线边框**搭建；其他地方用红色左竖条卡片。
- 用**红色 em-dash 项目符号，最多三个**；在红底展示字上加叠层 text-shadow。
- 每帧一个展示时刻；陈述帧保留负空间。

### 不要做

- 不要第二种强调色；不要圆角（只用直角，提示胶囊除外）。
- 不要投影——红底上的叠层 text-shadow 是唯一的阴影。
- 不要替换字体；不要用 Shrikhand 排正文，不要用 Baskerville 做标签，不要用 Space Grotesk 做标题。
- 不要默认的圆点项目符号；红色陈述展示字不能不倾斜。
- 不要把陈述帧塞满；不要让一长行从边到边撑满（降一档字号）。

## 宽高比适配

| 处理方式 | 16:9 | 9:16 | 1:1 |
| --- | --- | --- | --- |
| Hero Stack | 堆叠居左，标语在下 | 堆叠居中，更高 | 堆叠，标语在下 |
| Hero Stat | 数字居中 | 数字居中，更高 | 居中 |
| Financial Grid | 横排 3 格 | 横排 2 格 / 竖向堆叠 | 2×2 |
| Pull Quote | 引语居左 | 引语竖向堆叠 | 居中 |
| Editorial Cards | 横排 2–3 张 | 竖向堆叠 | 竖向堆叠 |
| Closing | close-big 居中 | close-big 竖向堆叠 | 居中 |

`pad-slide` 在短边上保持紧凑；重新选择展示字的字号档位，让那一行保持 ≤78cqw，同时不低于下限。倾斜保持不变；每种比例下进度条都横跨底边。

## 已批准实体

源文件里没有定义任何真实客户、logo 或供应商——任何此类标记都渲染成占位符。这套系统提供的是字体、一种红色和墨色线条，不是品牌。

## 数字与声明（硬规则）

绝不在帧尺度上编造数字、财务数据、百分比或日期。把槽位渲染成 `— figure —`、`{metric}`、`+NN%`。fin-grid 单元格和 stat-big 尤其要一直用占位符，直到脚本提供数值为止。目录编号 / 进度只是装饰。

## 渲染前自查

- **眯眼**——一个展示时刻占主导；没有任何东西与之争夺。
- **留白**——陈述帧保留约 50–60% 的负空间；只有 fin-grid 是密集的。
- **色彩**——只有四种颜色；红色是唯一的强调色；正文不用红色。
- **字体**——陈述上用倾斜的 Shrikhand 400，数字用红色，按长度定字号；Baskerville 正文行高 1.75；等宽辅助元素全大写、字距 2–3px；下限 ≥1.4cqw。
- **深度**——平面；红底展示字上的叠层 text-shadow 是唯一的阴影；直角。
- **项目符号**——红色 em-dash，最多三个。
- **编造**——每个数字都能追溯到脚本，否则用占位符。

## 已知缺口

- **动效有意不在范围内。** frame.md 只规定构图；源设计中 550ms 的幻灯片转场属于演示文稿的机制。
- **Shrikhand + Libre Baskerville + Space Grotesk 通过 Google Fonts 加载。** CJK：Noto Serif SC 900/400 + Noto Sans SC；Shrikhand 的 slab-script 没有对等的汉字字体——靠倾斜 + 红色 + 双线边框来承载识别度。
- **9:16 / 1:1 只是指导**；按每种比例检查那一大行是否 ≤78cqw，倾斜是否被裁切。
- 网格、左竖条卡片和叠层阴影都是纯 CSS 实现；不需要外部图片。
