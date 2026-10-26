---
version: alpha
name: BlockFrame — Frame (video / frame layer)
description: >
  Video-first companion to BlockFrame's design.md. The unit is the frame (1920×1080). Atoms are
  identical and sacred — 4px black borders + 8px hard offset shadows, the five-pastel candy palette
  (pink/blue/green/yellow/cream) plus black/white/off-white, Inter 800–900 uppercase display +
  Space Grotesk label chrome, square corners, label-pills, tilted decorations, star bursts, stripe
  blocks, dot grids. Composition + frame scale rewritten. Motion out of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  black: "#000000"
  white: "#FFFFFF"
  offwhite: "#FFFDF5"
  pink: "#FE90E8"
  blue: "#C0F7FE"
  green: "#99E885"
  yellow: "#F7CB46"
  cream: "#FFDC8B"

borders: { primary: "4px solid black", thin: "3px solid black" }
shadows: { default: "8px 8px 0 black", small: "4px 4px 0 black", hover: "6px 6px 0 black", close-yellow: "12px 12px 0 yellow", close-white: "6px 6px 0 white" }

typography:
  # — reading + chrome ramp —
  body:    { fontFamily: "Inter", cqw: 0.95, weight: 500, lineHeight: 1.6 }
  card-title: { fontFamily: "Inter", cqw: 1.15, weight: 700, upper: true, lineHeight: 1.2 }
  label:   { fontFamily: "Space Grotesk", px: 13, weight: 600, tracking: "0.08em", upper: true }
  counter: { fontFamily: "Space Grotesk", px: 14, weight: 700, tracking: "0.1em", upper: true }
  # — display ramp (Inter 800–900, uppercase, negative tracking) —
  heading-md: { fontFamily: "Inter", cqw: 2.1, weight: 700, lineHeight: 1.1, tracking: "-0.01em", upper: true }
  quote-text: { fontFamily: "Inter", cqw: 2.7, weight: 900, lineHeight: 1.15, tracking: "-0.02em", upper: true }
  stat-number: { fontFamily: "Inter", cqw: 3.3, weight: 900, lineHeight: 1.0 }
  heading-lg: { fontFamily: "Inter", cqw: 3.3, weight: 800, lineHeight: 1.0, tracking: "-0.02em", upper: true }
  close-title: { fontFamily: "Inter", cqw: 4.2, weight: 900, lineHeight: 0.95, tracking: "-0.03em", upper: true }
  heading-xl: { fontFamily: "Inter", cqw: 5.0, weight: 900, lineHeight: 0.95, tracking: "-0.03em", upper: true }

spacing:
  slide-pad: "3.1cqw"   # 60px @1920
  gap-md: "1.7cqw"

components:
  card-elevated:
    backgroundColor: "{colors.white}"
    border: "0.4cqw solid {colors.black}"
    rounded: "0"
    shadow: "0.8cqw 0.8cqw 0 {colors.black}"
    description: "Primary card. Border/shadow coupled: 4px↔8px, 3px↔4px."
  card-small:
    backgroundColor: "{colors.white}"
    border: "0.3cqw solid {colors.black}"
    rounded: "0"
    shadow: "0.4cqw 0.4cqw 0 {colors.black}"
    description: "Stat cards, team cards, timeline steps."
  label-pill:
    border: "0.3cqw solid {colors.black}"
    backgroundColor: "any pastel / {colors.white}"
    rounded: "9999px"
    shadow: "0.4cqw 0.4cqw 0 {colors.black}"
    typography: "{typography.label}"
    description: "The universal eyebrow — never plain text."
  button-primary:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.black}"
    border: "0.3cqw solid {colors.black}"
    rounded: "0"
    shadow: "0.4cqw 0.4cqw 0 {colors.black}"
    typography: "Inter 700"
    description: "The CTA."
  star-burst:
    backgroundColor: "any pastel"
    border: "0.3cqw solid {colors.black}"
    clip: "10-point clip-path star"
    description: "Corner attention-grabber."
  stripe-block:
    backgroundImage: "45° {colors.black} + pastel diagonal stripes"
    border: "0.3cqw solid {colors.black}"
    description: "Poster decoration."
  bg-dot-grid:
    backgroundImage: "radial-dot ~1.2px dots, 24px grid, {colors.black}"
    description: "Faint corner/ground overlay."
  tilt-deco:
    transform: "rotate(±2°–12°)"
    description: "Rotated rectangle/badge/star. Stat cards alternate −2/+2°. The grid-puncture signature."
  stat-deco-dot:
    backgroundColor: "any pastel"
    border: "2px solid {colors.black}"
    rounded: "50%"
    size: "12px"
    description: "The ONLY round shape, pinned to stat cards."
  close-frame:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
    border: "0.4cqw solid {colors.white}"
    rounded: "0"
    shadow: "1.2cqw 1.2cqw 0 {colors.yellow}"
    description: "Inverted closer — the only colored shadow."
---

# BlockFrame — Frame (video / frame layer)

## 概述

帧尺度下的 BlockFrame 是一套**极繁主义的新粗野主义**系统，建立在五条法则之上：每个区域都有 4px 黑色边框，每个被托起的元素都有 8px 硬偏移阴影，每个角都是直角，每个强调色都是饱和的粉彩色，每个布局都允许有点歪。它的乐趣在于有意为之的碰撞 —— 带边框的卡片撞上带边框的卡片，阴影层层叠起，倾斜的装饰刺穿网格。

它的字体声音是 **Inter**：展示字用字重 800–900、紧凑全大写、负字距，正文用字重 500 的句首大写；**Space Grotesk** 用字重 600、全大写、字距 0.08em，作为标签 / 辅助元素的声音。五种糖果粉彩色（粉 / 蓝 / 绿 / 黄 / 奶油）作为铺满出血的底色在各帧之间轮换 —— 颜色轮换就是主要节奏。深度是**硬偏移阴影**（8px/4px，纯黑，零模糊，偏向右下）；收尾帧（close-frame）的 12px 黄色阴影是唯一带颜色的例外。

**帧尺度下的关键特征：**

- 主卡片用 **4px 黑色边框 + 8px 硬阴影**；辅助元素用 3px + 4px（两者的粗细是绑定的）。
- **五色粉彩色板**作为铺满出血的底色轮换；黑 / 白 / 米白用于结构。
- **Inter 800–900 全大写**、负字距的展示字；**Space Grotesk** 标签辅助元素。
- 处处**直角**（只有 stat-deco 圆点是圆的）；**倾斜的装饰**刺穿网格。
- **Label-pill** 开启每个区域；星爆、条纹块、点阵是可复用的吸睛单元。
- **舒适的密集** —— 塞满显得权威；空着的角落看起来像坏了。

## 帧

### 帧工艺门槛

每一帧在做任何结构检查之前，先要过三项目测闸门：

- **眯眼** —— 一个 Inter 展示字时刻占主导，体量是相邻元素的 3–6 倍；卡片读起来是一个系统，而不是互相竞争。
- **留白** —— cover / quote / close 保留透气空间（放装饰，而不是内容）；**feature-card 和数据网格是密集例外**。
- **克制** —— 4px→08px / 3px→4px 的绑定关系保持不变；只用黑色边框（close 帧用白色）；粉彩底色每帧**轮换**一种；不要第六种粉彩色。
- **参照** —— 瞄准 **zine 小志 / 1990 年代贴纸本 / 玩具包装跨页**（带边框的色块、倾斜的装饰）；失败的样子是**扁平、无边框、模糊阴影的网页卡片网格**。

- **主尺寸：** 1920×1080（16:9）。展示字用 **`cqw`** 编写（`px ÷ 1920 × 100 = cqw`）。
- **竖屏：** 1080×1920（9:16）。**方屏：** 1080×1080（1:1）。
- **安全区：** `slide-pad` 约 3.1cqw；装饰可以出血到边缘之外。

**容器法则（承重规则）。** 每一帧的底层元素都设置 `container-type: size`；所有相对于帧的单位都是基于它的 `cqw`/`cqh` —— 绝不用 `vw`。边框 / 阴影按 `cqw` 缩放，这样 4px↔8px 的绑定关系能按比例保持；角保持直角。

## 色彩

token 与源设计完全一致。`{colors.offwhite}` 是默认底色，但各帧会在 `{colors.cream}`/`blue`/`pink`/`green`/`yellow` 这些底色之间**轮换** —— 轮换就是节奏。`{colors.black}` 用于每一条边框 + 结构性文字；`{colors.white}` 用于卡片填充。五种粉彩色可以互换，**没有语义含义** —— 靠并置来搭配（粉 + 蓝 + 绿三色组，奶油 + 黄的暖色对）。`{colors.yellow}` 用于 CTA + 唯一带颜色的（close 帧）阴影；`{colors.black}` 底色是收尾帧的表面。**不要第六种粉彩色。**

## 字体排印

两套字号阶梯。**阅读 / 辅助元素阶梯**（Inter 正文 0.95cqw 字重 500、以 px 计的 Space Grotesk 标签）承载文案和辅助元素（chrome）；**展示阶梯**（Inter `heading-md` 2.1cqw → `heading-xl` 5cqw，字重 800–900 全大写）承载每一个标题 + 数据。

- **可读性下限：** 任何承重的文字行 ≥ **1.4cqw**；用 px 的标签只是辅助元素（chrome）。
- **按长度定字号：** 根据标题的长度决定字号。整块宽度上限 **≤ 78cqw**；≤3 个词 → `heading-xl`；4–6 个 → `heading-lg`；7 个以上 → `heading-md`。
- **Inter 展示字用全大写、字重 800–900、负字距**（−0.01..−0.03em）；正文字重 500，句首大写；**Space Grotesk 标签全大写，字距 0.08em**。不要句首大写的展示字，不要不调字距的展示字。

## 深度与表面

硬偏移阴影，纯黑，零模糊，偏向右下：

- 主卡片用 **0.8cqw（8px）**；辅助元素用 **0.4cqw（4px）**；悬停态用 **0.6cqw（6px）**。
- **靠边框营造深度** —— 4px/3px 的边框承担了大部分的托起感；阴影让它显得「被托起」。
- **倾斜** —— ±2°–12° 的旋转打破网格，营造立体感。
- **反相的收尾帧** —— 12px 黄色阴影（close-btn 上是 6px 白色）—— 唯一带颜色的阴影。

**上限：** 不用模糊阴影，不用圆角（stat-deco 圆点除外），不用渐变制造深度。

## 形状

- **处处 0 圆角**，只有 12px 的 stat-deco 圆点（50%）例外。直角是结构上的身份标识。

## 组件

- **card-elevated / card-small** —— 带边框 + 阴影的内容卡片（粗细绑定）。
- **label-pill** —— 通用的眉标（边框 + 阴影 + 粉彩色）。**button-primary** —— 黄色 CTA。
- **star-burst / stripe-block / bg-dot-grid / tilt-deco** —— 可复用的装饰单元（每帧至少一个）。
- **stat-deco-dot** —— 唯一的圆形。**close-frame** —— 反相的黑 + 白 + 黄色阴影收尾帧。

## 帧处理方式

> 配方：底（ground）· 容器（container）· 组成（composes）· 焦点（focal）· 辅助元素（chrome）· 强调（accent）· 留白（silence）· 固定/可变（Fixed/Free）· 密度（density）。
> 轮换底色；每帧添加 ≥1 个装饰；用一个 label-pill 开场。

### 1 · Cover（身份 · 手法：装饰刺穿 · 居左）

**底** `{colors.cream}`（或 offwhite）+ 淡淡的点阵。**组成** label-pill、heading-xl、tilt-deco 矩形、star-burst、计数器。**焦点** 一个 2–3 行的全大写 Inter `heading-xl`，居左，位于一个 label-pill 下方；倾斜的粉彩色矩形 + 一个星爆刺穿右侧。**辅助元素** 计数器胶囊。**强调** 装饰的粉彩色。**留白** 右侧三分之一放装饰。**固定** 4px/8px 绑定、全大写展示字、直角。**可变** 标题、装饰的位置 / 颜色。**密度** 舒适。

### 2 · Feature Cards（目录 · 手法：三联带边框网格 · 蓝色底）

**底** `{colors.blue}`，`slide-pad`。**组成** label-pill、heading-lg、3 张 card-elevated（icon-square + card-title + 正文）。**焦点** 三张带边框 + 阴影的白色卡片。**辅助元素** label-pill 眉标。**强调** 粉彩色的 icon-square（粉 / 绿 / 黄）。**留白** 很紧 —— 设计上就是密集的。**固定** 4px 边框 + 8px 阴影、直角、全大写的 card-title。**可变** 卡片内容、图标色相。**密度** 密集例外。

### 3 · Stat Grid（数据 · 手法：倾斜的数据卡片 · 绿色底）

**底** `{colors.green}`，`slide-pad`。**组成** label-pill、heading-lg、3 张 card-small（倾斜 −2/+2°、stat-deco 圆点、stat-number + 标签）。**焦点** 三张倾斜的带边框数据卡片。**强调** deco 圆点的粉彩色 + 黑色的数据数字。**留白** 适中。**固定** 交替的倾斜方向、3px+4px、只有 deco 圆点是圆的。**可变** 数字（来自脚本）、圆点色相。**密度** 密集例外。

### 4 · Closing Plate（收尾 · 手法：反相黑底 · 居中）

**底** `{colors.black}`。**组成** close-frame（4px 白色边框、12px 黄色阴影）、label-pill（反相）、close-title、star-burst。**焦点** 一个白色的 `close-title`，位于带黄色偏移阴影的白边框画框内；一个粉色星形刺穿一角。**强调** 黄色阴影 + 粉色星形。**留白** 约 50%。**固定** 黑底白字、12px 黄色阴影（只在这里）、直角。**可变** 收尾语、星形的位置。**密度** 低。

### 5 · Quote（引语 · 手法：带边框的引语画框 · 粉色底）

**底** `{colors.pink}`（或 offwhite）。**组成** label-pill、放在 card-elevated 里的 quote-text、署名。**焦点** 一段 Inter `quote-text`（900 全大写），位于带边框 + 阴影的白色画框内。**强调** 底色 + 一个装饰。**留白** 适中。**固定** 全大写引语、4px/8px。**可变** 引语、底色。**密度** 舒适。

### 6 · Timeline（流程 · 手法：阶梯式带边框卡片 · offwhite）

**底** `{colors.offwhite}`。**组成** label-pill、heading-lg、3–4 张 card-small 步骤卡 + step-connector。**焦点** 一排带边框的步骤卡片，由黑色连接条相连，每张一种粉彩色 + step-num。**强调** 步骤的粉彩色。**留白** 适中。**固定** 3px+4px 的步骤卡、直角、连接条。**可变** 步骤、色相。**密度** 标准。

## 构图规则

### 要做

- **4px 边框配 8px 阴影**，**3px 配 4px** —— 这个绑定关系不可妥协。
- 在各帧之间**轮换粉彩底色**；让整套画面保持视觉上的节奏感。
- Inter 展示字用**全大写、800–900、负字距**；用一个 **label-pill** 开启每个区域。
- 阴影渲染成**纯黑、零模糊、偏向右下**；每帧添加 **≥1 个装饰**（倾斜 / 星形 / 条纹 / 圆点）。
- CTA 用**黄色**；收尾帧用**反相黑底 + 12px 黄色阴影**的 close-frame。
- 装饰倾斜 ±2°–12°；大多数帧偏向居左。

### 不要做

- 不要圆角（stat-deco 圆点除外）；不要模糊阴影。
- 不要带颜色的边框（只用黑色，close-frame 的白色除外）；不要第六种粉彩色。
- 不要句首大写的 Inter 展示字；不要不调字距的展示字；不要把标签写成纯文本。
- 不要让一切都完美对齐（倾斜就是招牌）；不要让角落空着。
- 不要让标题从边到边撑满 —— 按长度定字号。

## 宽高比适配

| 处理方式 | 16:9 | 9:16 | 1:1 |
| --- | --- | --- | --- |
| Cover | 标题居左，装饰在右 | 标题在上，装饰在下 | 标题，装饰更少 |
| Feature Cards | 横排 3 张 | 竖向堆叠 3 张 | 2+1 |
| Stat Grid | 横排 3 张倾斜卡片 | 竖向堆叠 3 张倾斜卡片 | 2×2 |
| Closing | close-frame 居中 | 居中，更高 | 居中 |
| Quote | 引语画框 | 引语堆叠 | 居中 |
| Timeline | 水平排列的步骤 | 竖向排列（隐藏连接条） | 2×2 |

`slide-pad` 在短边上保持不变；重新选择展示字的字号档位，不低于 1.4cqw 的下限。比例越紧，装饰数量越少，让画面保持「带边框」，而不是杂乱。

## 已批准实体

源文件里没有定义任何真实客户、logo 或供应商 —— 任何此类标记都渲染成占位符。粉彩色填充、装饰和倾斜都与内容无关。

## 数字与声明（硬规则）

绝不在帧尺度上编造数字、数据或计数。把槽位渲染成 `— figure —`、`{metric}`、`N×`。数据卡片和图表一直用占位符，直到脚本提供数值为止。幻灯片计数器和列表编号是装饰性的。

## 渲染前自查

- **眯眼** —— 一个 Inter 展示字时刻占主导；卡片读起来是一个系统。
- **留白** —— 只有 feature / 数据网格是密集的；cover / quote / close 用装饰保留透气空间。
- **边框 / 阴影** —— 4px↔8px / 3px↔4px 的绑定关系保持不变；纯黑，零模糊。
- **色彩** —— 粉彩底色轮换；只用黑色边框（close 帧用白色）；没有第六种粉彩色。
- **字体** —— Inter 全大写 800–900、负字距、按长度定字号；Space Grotesk 标签字距 0.08em；下限 ≥1.4cqw。
- **形状** —— 直角（只有 stat-deco 圆点是圆的）；每帧 ≥1 个倾斜 / 装饰。
- **编造** —— 每个数字都能追溯到脚本，否则用占位符。

## 已知缺口

- **动效有意不在范围内。** frame.md 只规定构图；源设计通过 display 切换幻灯片，没有转场。
- **Inter + Space Grotesk 通过 Google Fonts 加载。** CJK：Noto Sans SC 900（句首大写 —— 全大写这一信号丢失了）；更多地依靠边框 / 阴影 / 装饰来承载粗野主义的身份标识。
- **9:16 / 1:1 只是指导**；检查字号下限，并确认装饰数量随之减少。
- 星爆（clip-path）、条纹块、点阵和倾斜都是纯 CSS 实现；不需要外部图片。
