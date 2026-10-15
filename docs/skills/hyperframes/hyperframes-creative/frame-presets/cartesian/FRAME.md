---
version: alpha
name: Cartesian — Frame (video / frame layer)
description: >
  Video-first companion to Cartesian's design.md. The unit is the frame (1920×1080). Atoms are
  identical and sacred — the five-tone warm-stone palette, Playfair Display 400 + Inter, the
  universal 1px taupe hairline as the only structural device, compass-drafted geometric rings,
  and zero shadow / zero fill. Composition, frame scale, and aspect-ratio behavior are rewritten
  for the frame. Restraint is the rule; motion is out of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  bg-primary: "#EDE8E0"
  bg-secondary: "#E2DBD1"
  text-primary: "#1A1A1A"
  text-secondary: "#5A5A5A"
  accent: "#8A8178"
  line: "#B8B0A4"
  white-overlay: "rgba(255,255,255,0.3)"

typography:
  # — reading ramp (Inter) —
  body:        { fontFamily: "Inter", cqw: 1.0,  weight: 400, lineHeight: 1.6, color: "text-secondary" }
  body-sm:     { fontFamily: "Inter", cqw: 0.85, weight: 400, lineHeight: 1.6 }
  subtitle:    { fontFamily: "Inter", cqw: 1.3,  weight: 400, lineHeight: 1.5 }
  label:       { fontFamily: "Inter", px: 14, weight: 500, tracking: "3px", upper: true, color: "accent" }
  attribution: { fontFamily: "Inter", px: 15, weight: 400, tracking: "2px", upper: true, color: "accent" }
  micro:       { fontFamily: "Inter", px: 12, weight: 400, tracking: "2px", upper: true, color: "accent" }
  # — display / hero ramp (Playfair Display 400, sentence case) —
  h3:          { fontFamily: "Playfair Display", cqw: 1.8, weight: 400, lineHeight: 1.1 }
  timeline-headline: { fontFamily: "Playfair Display", cqw: 1.9, weight: 400, lineHeight: 1.1 }
  card-headline: { fontFamily: "Playfair Display", cqw: 2.0, weight: 400, lineHeight: 1.15 }
  stat-figure: { fontFamily: "Playfair Display", cqw: 3.0, weight: 400, lineHeight: 1.0 }
  quote-mark:  { fontFamily: "Playfair Display", cqw: 9.0, weight: 400, lineHeight: 0.5, color: "line" }
  h2:          { fontFamily: "Playfair Display", cqw: 4.0, weight: 400, lineHeight: 1.1 }
  h1:          { fontFamily: "Playfair Display", cqw: 6.2, weight: 400, lineHeight: 1.06 }
  display:     { fontFamily: "Playfair Display", cqw: 8.0, weight: 400, lineHeight: 1.04 }

spacing:
  pad-x: "7cqw"
  pad-y: "5cqw"
  gap-xl: "6cqw"
  gap-lg: "5cqw"

components:
  hairline:
    rule: "0.07cqw solid {colors.line}"
    description: "The universal structural device — every separator (agenda rule, timeline connector, card border, stats top) is this 1px taupe line. No thick borders exist."
  card:
    backgroundColor: "{colors.white-overlay}"
    border: "0.07cqw solid {colors.line}"
    rounded: "0"
    shadow: "none"
    description: "Faint white-overlay fill (canvas bleeds through) is what makes a card distinct from a bare region."
  card-icon:
    border: "0.07cqw solid {colors.line}"
    rounded: "50%"
    size: "40px circle"
    textColor: "{colors.accent}"
    typography: "Playfair numeral/letter"
    description: "Ringed circle mark."
  agenda-row:
    borderBottom: "0.07cqw solid {colors.line}"
    typography: "{typography.h3} (numeral {colors.accent}, label {colors.text-primary})"
    description: "Numeral left, label right over a taupe rule."
  timeline:
    borderTop: "0.07cqw solid {colors.line}"
    typography: "{typography.timeline-headline} + {typography.body-sm}"
    description: "A single taupe top rule across items — no nodes, no dots."
  stats-cluster:
    borderTop: "0.07cqw solid {colors.line}"
    typography: "{typography.stat-figure} + uppercase {colors.accent} labels"
    description: "Inline modest stat figures (no hero numeral)."
  geo-ring:
    border: "1px solid {colors.line} (inner dashed ::before ~70–80%)"
    rounded: "50%"
    size: "10–50cqw"
    opacity: "0.2–0.5"
    description: "Compass-construction rings behind content. 1–2 per frame, never more."
  horizontal-accent:
    backgroundColor: "{colors.text-primary}"
    size: "~18cqw × 1px"
    description: "The system's only INK-BLACK rule — a strong terminal accent on cover/closing, sparingly."
  vertical-line:
    backgroundColor: "{colors.line}"
    size: "1px × full height, ~5cqw from edge"
    opacity: "0.3–0.4"
    description: "Drafting-paper alignment guide. Optional."
  image-placeholder:
    backgroundColor: "{colors.bg-secondary}"
    mark: "crossed +30°/−30° 1px taupe diagonals (an X)"
    typography: "small uppercase {typography.micro}"
    description: "The signature image-not-wired mark."
  team-photo:
    backgroundColor: "{colors.bg-secondary}"
    border: "0.07cqw solid {colors.line}"
    rounded: "50%"
    typography: "Playfair initial in {colors.accent}"
    description: "Circular portrait frame."
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/frame-presets/cartesian/FRAME.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Cartesian — Frame (video / frame layer)

## 概述

帧尺度下的 Cartesian 是一套**安静的博物馆图录式编辑风系统**——用 1px 线条实现克制。每一个结构性分隔都是一条 1px 的灰褐色细线；没有粗边框，没有填充（那张淡淡的白色叠加卡片除外），没有阴影，没有圆角矩形。层级来自**字体对比和负空间**，氛围来自在内容背后漂浮的**圆规绘制的几何圆环**。

它的字体声音是一组文学气质的搭配：400 字重的 **Playfair Display**（细笔画的 didone 字体，绝不加粗，永远用句首大写）以墨色承担每一个标题、数字和引号；**Inter** 承担暖灰色的正文，以及灰褐色、全大写、字距 2–3px 的标签。色板是五种暖石色加墨色——不存在大众化的强调色。正确的密度是**稀疏、有呼吸感**：一个清晰的想法，框得恰到好处，放在石色的纸面上。

**帧尺度下的关键特征：**

- **1px 灰褐色细线**是通用的结构手段——每一个分隔都是这同一条线。
- 展示字用 **Playfair Display 400**（墨色，句首大写）；**Inter** 用于正文（灰色）+ 标签（灰褐色，加字距）。
- **五种暖石色 + 墨色**——没有红 / 蓝 / 绿；唯一的"颜色"是字体对比。
- 内容背后的**圆规绘制几何圆环**（实线 + 虚线，20–50% 不透明度）营造情绪。
- **平面**——零阴影，零圆角矩形（只有圆形）；唯一的墨色线条是 `horizontal-accent`。
- **稀疏、有呼吸感**——大方的负空间；拥挤看起来就像坏了。

## 帧

### 帧工艺门槛

每一帧在做任何结构检查之前，先要过三项目测闸门：

- **眯眼**——一个 Playfair 元素占主导，体量是**离它最近的元素的 3–6 倍**；层级靠衬线 / 无衬线 + 字号的对比，而不是字重。
- **留白**——宣告帧看起来 **55–60% 是空的**；Cartesian **没有密集帧**——连议程 / 索引帧都要有呼吸感（一拥挤这套系统就崩了）。
- **克制**——每帧**最多两个几何圆环**；唯一的墨黑色 `horizontal-accent` 线要省着用；永远不用大众化的强调色。
- **参照**——瞄准 **Vignelli 的编辑设计 / Cooper Hewitt 的图录 / 铅笔加描图纸画出的平面图**；失败的样子是**带阴影、圆角卡片的 SaaS 演示文稿**。

- **主尺寸：** 1920×1080（16:9）。展示字用 **`cqw`** 编写（`px ÷ 1920 × 100 = cqw`）。
- **竖屏：** 1080×1920（9:16）。**方屏：** 1080×1080（1:1）。
- **安全区：** `pad-x`（7cqw），留出大方的边距；几何图形可以出血到某条边之外。

**容器法则（承重规则）。** 每一帧的底层元素都设置 `container-type: size`；所有相对于帧的单位都是基于它的 `cqw`/`cqh`——绝不用 `vw`。无论按什么尺寸渲染，1px 细线和几何圆环相对于帧的比例都保持不变。

## 色彩

token 与源设计完全一致。`{colors.bg-primary}` 是底色；`{colors.text-primary}` 墨色用于标题和唯一的那条黑色强调线；`{colors.text-secondary}` 灰色用于正文；`{colors.accent}` 灰褐色用于标签、数字、小字；`{colors.line}` 灰褐色用于每一条 1px 结构边框。`{colors.bg-secondary}` 是唯一的次级填充色（占位符、照片框）。**没有大众化的强调色**——需要强调时，就把字放大、从无衬线换成衬线，或者加一条 `horizontal-accent` 墨色线。标题绝不用灰褐色；小字绝不用墨色。

## 字体排印

两套字号阶梯。**阅读阶梯**（Inter 正文 1.0cqw 灰色，标签用 px、灰褐色）承载文案和辅助元素（chrome）；**展示阶梯**（Playfair `h3` 1.8cqw → `display` 8.0cqw，全部 400 字重）承载每一个标题。

- **可读性下限：** 任何承重的文字行 ≥ **1.4cqw**；用 px 的标签只是辅助元素。
- **按长度定字号：** 根据标题的长度决定字号。整块宽度上限 **≤ 78cqw**；≤3 个词 → `display`/`h1`；4–6 个词 → `h2`；7 个词以上 → `h3`。Cartesian 没有 hero 级数据数字——数据保持克制（`stat-figure` 3cqw）。
- **Playfair 用 400 字重、墨色、句首大写**——绝不加粗，绝不全大写，绝不用灰褐色。**Inter 标签全大写，字距 2–3px，灰褐色。** 斜体用 Playfair 的斜体，只用于强调。

## 深度与表面

平面是唯一的手法。层级来自：

- **字体对比**——Playfair 衬线 vs Inter 无衬线；8cqw→0.7cqw 的字号跨度。
- **1px 灰褐色细线**——每一条分隔线、卡片描边、时间线、照片圆环。
- **色调**——墨色 vs 灰色 vs 灰褐色。
- **负空间**——大方的内边距。
- **几何氛围**——圆规圆环暗示深度，但并不制造深度。

**上限：** 不用 box-shadow，不用抬升的卡片，不用渐变，不用圆角矩形。那条唯一的墨色线（`horizontal-accent`）是唯一不是灰褐色的线。

## 形状

- **50%（圆形）**——card-icon、team-photo、nav-dot、每一个几何圆环。
- **0**——其余一切；不存在柔和的圆角。

## 组件

- **hairline**——通用的 1px 灰褐色分隔线（这就是它的身份标识）。
- **card**（1px 灰褐色 + 白色叠加层）/ **card-icon**（带圆环的圆形）/ **agenda-row** / **timeline**（只有线，没有节点）/ **stats-cluster**——全都建立在细线之上。
- **geo-ring**——圆规装饰（实线 + 虚线），每帧 1–2 个。**horizontal-accent**——唯一的墨色线，省着用。**vertical-line**——绘图辅助线。
- **image-placeholder**（交叉 X）/ **team-photo**（带圆环的首字母）——石色填充的占位符。

## 帧处理方式

> 配方：底（ground）· 容器（container）· 组成（composes）· 焦点（focal）· 辅助元素（chrome）· 强调（accent）· 留白（silence）· 固定/可变（Fixed/Free）· 密度（density）。
> 每一帧都稀疏、有呼吸感；几何装饰最多 1–2 个。

### 1 · Cover（身份 · 手法：衬线字 + 圆规圆环 · 居左）

**底** `{colors.bg-primary}`，`pad-x`。**组成** geo-ring（右侧，约 34cqw，实线 + 虚线）、vertical-line（左侧）、label、display/h1。**焦点** 一个 2–3 行的墨色 Playfair `display`/`h1` 标题（关键词用斜体），左侧锚定，上方一个灰褐色 `label`，下方一行 Inter 副标题。**辅助元素** 可选的底部元信息行（Playfair 数值 + 灰褐色标签）。**强调** 几何圆环；可以再加一条 `horizontal-accent` 墨色线（前提是不压到元信息）。**留白** 约 55% 是空的。**固定** Playfair 400 墨色句首大写、≤2 个几何元素、1px 线条。**可变** 标题、圆环位置、元信息。**密度** 稀疏。

### 2 · Agenda / Index（索引 · 手法：细线列表 · 居左）

**底** `{colors.bg-primary}`，`pad-x`。**组成** label、h2、agenda-rows。**焦点** 一个 Playfair `h2`，下面是 4–6 行议程（灰褐色 Playfair 编号 + 墨色 Playfair 标签），每行落在一条 1px 灰褐色线上。**辅助元素** 灰褐色 `label` 眉题。**强调** 无——由灰褐色编号承担。**留白** 适中；行距大方。**固定** 1px 灰褐色线、Playfair 400。**可变** 条目、数量。**密度** 标准（行稀疏）。

### 3 · Pull Quote（引语 · 手法：居中陈述 · 圆规圆环）

**底** `{colors.bg-primary}`，居中。**组成** geo-ring（居中的虚线圆环，约 26cqw）、quote-mark、h2/display-quote、attribution。**焦点** 一段两行的墨色 Playfair 引语，居中，上方是一个 50% 灰褐色的 Playfair 引号；下方一行灰褐色全大写署名。**强调** 淡淡的居中圆环。**留白** 约 60%——刻意留空。**固定** Playfair 400、一个圆环、居中。**可变** 引语、署名。**密度** 稀疏。

### 4 · Closing Plate（收尾 · 手法：居中圆环 · 居中）

**底** `{colors.bg-primary}`，居中。**组成** geo-ring（居中，约 40cqw，实线 + 虚线）、label、h1/display、horizontal-accent。**焦点** 一个 1–2 行的墨色 Playfair 收尾语（关键词用斜体），居中放在最大的圆规圆环内；下方一条短的墨色 `horizontal-accent`。**强调** 圆环 + 那一条墨色线。**留白** 约 60%。**固定** Playfair 400、居中、≤2 个几何元素。**可变** 收尾语、圆环尺寸。**密度** 稀疏。

### 5 · Two-Column Editorial（内容 · 手法：不对称分栏 · 居左）

**底** `{colors.bg-primary}`，`pad-x`，两栏，间距 `gap-xl`。**组成** label、h2、body、image-placeholder（交叉 X）或 card。**焦点** 文字栏里是 Playfair `h2` + Inter 正文；另一栏是一个 image-placeholder 或 card。**强调** 无。**留白** 大方的栏间距。**固定** 1px 灰褐色卡片 / 占位符边框、白色叠加层填充。**可变** 文字放哪一边、正文文案。**密度** 标准。

### 6 · Stats / Timeline（数据 · 手法：细线轨道 · 居左）

**底** `{colors.bg-primary}`，`pad-x`。**组成** label、h3、stats-cluster 或 timeline。**焦点** 一排克制的 Playfair 数据（或一条 1px 线的时间线，带年份 + 标题 + 正文，没有节点），上方由一条 1px 灰褐色线框住。**强调** 无。**留白** 适中。**固定** 克制的数据字号、细线、没有节点。**可变** 数字、阶段。**密度** 标准。

## 构图规则

### 要做

- 每个分隔都用**一条 1px 灰褐色线**——细线就是它的身份标识。
- 每个 **Playfair 标题都用 400 字重、墨色、句首大写**；标签用灰褐色、全大写、字距 2–3px。
- 在内容背后叠**一到两个圆规圆环**（实线 + 虚线，20–50% 不透明度）营造氛围。
- 让帧**有呼吸感**——稀疏、大方的负空间；宣告帧 55–60% 是空的。
- 引语 / 收尾帧偏向居中；cover / 议程 / 编辑帧偏向不对称 / 居左。占位符填充用 `bg-secondary`。

### 不要做

- 不要引入大众化的强调色——只用石色和墨色。
- 不要把 Playfair 加粗，不要把标题设成灰褐色，不要用粗（2px 以上）边框。
- 不要加阴影、抬升的卡片或圆角矩形（只用圆形）。
- 不要把画面塞满——挤满的版式看起来就像坏了。
- 每帧绝不超过两个几何装饰；不要让标题从边到边撑满。

## 宽高比适配

| 处理方式 | 16:9 | 9:16 | 1:1 |
| --- | --- | --- | --- |
| Cover | 标题居左，圆环居右 | 标题在上，圆环在下 | 标题偏上，圆环在后 |
| Agenda / Index | h2 + 各行 | h2 + 各行（更紧凑） | h2 + 各行 |
| Pull Quote | 居中，圆环在后 | 居中，更高 | 居中 |
| Closing Plate | 居中放在圆环内 | 居中，圆环缩放 | 居中 |
| Two-Column Editorial | 文字 + 视觉左右并排 | 竖向堆叠（合并为一栏） | 竖向堆叠 |
| Stats / Timeline | 水平轨道 | 竖向堆叠（去掉时间线） | 紧凑 |

大方的 `pad-x` 在短边上保持不变；按每种比例重新选择展示字的字号档位，不低于 1.4cqw 的下限。在 9:16 上，时间线竖向堆叠后就失去了意义——改成竖向列表（按源设计的做法）。

## 已批准实体

源文件里没有定义任何真实客户、logo 或供应商——任何此类标记都渲染成占位符（交叉 X 的 image-placeholder，人像则用带圆环的首字母）。

## 数字与声明（硬规则）

绝不在帧尺度上编造数字、日期或计数。把槽位渲染成 `— figure —`、`{metric}`。数据和时间线年份一直用占位符，直到脚本提供为止。议程序号（01、02……）是装饰性的，可以按顺序编号。

## 渲染前自查

- **眯眼**——一个 Playfair 元素占主导；层级靠衬线 / 无衬线的对比。
- **留白**——宣告帧 55–60% 是空的；没有任何地方拥挤。
- **色板**——只有五种石色 + 墨色；没有大众化的强调色；标题用墨色，标签用灰褐色。
- **线条**——每一个分隔都是 1px 灰褐色细线；唯一的墨色线是 `horizontal-accent`。
- **字体**——Playfair 400 句首大写、按长度定字号；标签全大写、字距 2–3px；下限 ≥1.4cqw。
- **深度**——0 阴影，0 圆角矩形；每帧 ≤2 个几何圆环。
- **锚定**——引语 / 收尾帧居中，cover / 议程 / 编辑帧居左 / 不对称；不要连续 3 帧一样。
- **编造**——每个数字都能追溯到脚本，否则用占位符。

## 已知缺口

- **动效有意不在范围内。** frame.md 只规定构图；源设计中 0.6s 的淡入淡出属于演示文稿的机制。
- **Playfair Display + Inter 通过 Google Fonts 加载。** CJK 搭配（Noto Serif SC 700/400）沿用源设计；Playfair 没有汉字斜体——改用字重 / 灰褐色来强调。
- **9:16 / 1:1 只是指导**；检查可读性下限，并确认时间线会合并成竖向列表。
- 几何圆环、交叉 X 占位符和内圈虚线圆环都是纯 CSS 实现；不需要外部图片。
