---
version: alpha
name: Daisy Days — Frame (video / frame layer)
description: >
  Video-first companion to Daisy Days' design.md. The unit is the frame (1920×1080). Atoms are
  identical and sacred — the sunny-garden pastel palette (cream + turquoise/pink/butter/mint/
  lavender/peach/sky + coral accent), charcoal 3px outlines, hard offset shadows (6/4px, no blur),
  the Fredoka + Quicksand pairing, generous radii, headline text-shadow on color, dot bullets, and
  the hand-drawn SVG ornament layer. Composition + frame scale rewritten. Motion out of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  cream: "#F5F0E6"
  turquoise: "#7ECDC0"
  soft-pink: "#F7C8D4"
  butter: "#FDE68A"
  mint: "#A8E6CF"
  lavender: "#D4A5E8"
  peach: "#FFCBA4"
  sky: "#A8D8F0"
  coral: "#F8635F"
  text-dark: "#2D2D2D"
  text-muted: "#6B6B6B"
  white: "#FFFFFF"

borders: { primary: "3px solid text-dark", thin: "2px solid text-dark" }
shadows: { default: "6px 6px 0 text-dark", small: "4px 4px 0 text-dark", text-headline: "3px 3px 0 text-dark", text-headline-soft: "3px 3px 0 rgba(0,0,0,0.2)" }

typography:
  # — reading ramp (Quicksand) —
  body:    { fontFamily: "Quicksand", cqw: 0.95, weight: 500, lineHeight: 1.6 }
  body-strong: { fontFamily: "Quicksand", cqw: 0.95, weight: 600, lineHeight: 1.5 }
  meta:    { fontFamily: "Quicksand", cqw: 0.78, weight: 600, lineHeight: 1.45 }
  # — display ramp (Fredoka One / Fredoka 600 — single weight, never italic) —
  badge:   { fontFamily: "Fredoka One", cqw: 0.9, tracking: "0.02em" }
  label-display: { fontFamily: "Fredoka One", cqw: 1.3, lineHeight: 1.3, tracking: "0.02em" }
  subtitle: { fontFamily: "Fredoka One", cqw: 1.8, lineHeight: 1.2, tracking: "0.02em" }
  quote:   { fontFamily: "Fredoka One", cqw: 2.6, lineHeight: 1.35 }
  title:   { fontFamily: "Fredoka One", cqw: 3.0, lineHeight: 1.15, tracking: "0.02em" }
  headline: { fontFamily: "Fredoka One", cqw: 4.5, lineHeight: 1.1, tracking: "0.02em" }
  display: { fontFamily: "Fredoka One", cqw: 6.5, lineHeight: 1.1, tracking: "0.02em" }

spacing:
  pad-slide: "3cqw"
  radius: "20px"
  radius-lg: "28px"
  radius-pill: "50px"
  radius-round: "50%"

components:
  card:
    backgroundColor: "{colors.white}"
    border: "3px solid {colors.text-dark}"
    rounded: "{spacing.radius} (28px featured)"
    shadow: "6px 6px 0 {colors.text-dark}"
    description: "The universal container; white-on-pastel is standard."
  framed-header:
    backgroundColor: "pastel cap + {colors.white} body"
    border: "3px solid {colors.text-dark} (one continuous)"
    rounded: "{spacing.radius-lg}"
    shadow: "6px 6px 0 {colors.text-dark}"
    description: "Pastel header strip flush above a white body — one unit, one shadow."
  badge-pill:
    backgroundColor: "{colors.butter}"
    border: "3px solid {colors.text-dark}"
    rounded: "{spacing.radius-pill}"
    typography: "{typography.badge}"
    shadow: "4px 4px 0 {colors.text-dark}"
    description: "Section tag. white-space:nowrap."
  circle-marker:
    backgroundColor: "any pastel"
    textColor: "{colors.white} (dark on butter)"
    border: "3px solid {colors.text-dark}"
    rounded: "50%"
    size: "bullet 20 / icon 44 / dot 48 / step 90"
    typography: "Fredoka numeral"
    description: "Steps carry a small shadow."
  bullet-dot:
    backgroundColor: "{colors.butter}"
    border: "2px solid {colors.text-dark}"
    rounded: "50%"
    size: "20px (::before, 4px from line top)"
    description: "Lists never use glyph bullets."
  ornament:
    type: "hand-drawn SVG (daisy, star, sun, cloud, rainbow)"
    stroke: "2.1px {colors.text-dark}"
    placement: "z-index:1 behind content (z-index:2), cropping past the frame edge"
    description: "3–7 per frame, clustered at corners/edges."
  quote-mark:
    typography: "oversized Fredoka quote glyph"
    color: "{colors.soft-pink} (charcoal stroke)"
    description: "Above a quote body."
  text-headline-shadow:
    shadow: "3px 3px 0 {colors.text-dark} (soft 20% variant on pink/mint)"
    appliesTo: "Fredoka headlines on saturated surfaces (cream headlines sit flat)"
    description: "Makes the headline read 'outlined' like the shapes."
---

# Daisy Days — Frame (video / frame layer)

## 概述

帧尺度下的 Daisy Days 是一套**欢快、童趣的系统**——绘本插画遇上贴纸页式的卡哇伊风。每个形状都带一圈 **3px 炭灰色描边**，每个抬升的元素都带一道**实心硬偏移阴影**（不模糊），每个表面都是阳光花园般的粉彩色。它的字体声音只有一组搭配：**Fredoka One**（粗壮的圆体，单一字重）用于每一个标题，**Quicksand** 用于每一行正文和元信息。标志性的元素是**手绘 SVG 装饰层**——雏菊、星星、太阳、云朵、彩虹聚在角落，并越过边缘被裁切。

色板是**多种粉彩色加一个暖色亮点**：奶油色画布、七种粉彩表面，以及只留给小型高关注度标记的 `{colors.coral}`。饱和表面上的标题加一道 3px 炭灰色 text-shadow（让它像形状一样读起来是"描了边的"），并改成白色；奶油色上的标题用平的炭灰色。深度是二维、图形化的——粗描边 + 硬偏移 = 纸上的贴纸。

**帧尺度下的关键特征：**

- **默认奶油色 + 轮换的粉彩表面**；`{colors.coral}` 是标记用的强调色，绝不是表面。
- **Fredoka One** 标题 + **Quicksand 500/600** 正文——严格按角色分工，绝不交叉。
- 每个抬升的形状都有 **3px 炭灰色描边 + 硬偏移阴影**（6/4px，零模糊）。
- **大圆角**——卡片 20px、特写 28px、胶囊徽章、正圆标记；没有直角。
- **饱和表面上的标题加 text-shadow**（白色文字）；奶油色上用平的炭灰色。
- **圆点项目符号**（带描边的奶油黄圆盘，绝不用字形）+ 每帧一圈 **3–7 个装饰**组成的花环。

## 帧

### 帧工艺门槛

每一帧在做任何结构检查之前，先要过三项目测闸门：

- **眯眼**——一个 Fredoka 标题或一张内容卡片占主导，体量是相邻元素的 3–6 倍。
- **留白**——**每帧一个内容容器**，被一圈装饰花环环绕；**信息卡片网格是唯一的密集例外**。空着的角落看起来就像坏了。
- **克制**——奶油色或**一种**粉彩表面；珊瑚色是小标记用的强调色（绝不是表面）；只用炭灰色边框 + 硬偏移阴影；没有第九种颜色。
- **参照**——瞄准**儿童绘本 / 贴纸页式的卡哇伊小志**；失败的样子是**扁平、直角、模糊阴影的企业幻灯片**。

- **主尺寸：** 1920×1080（16:9）。展示字用 **`cqw`** 编写（`px ÷ 1920 × 100 = cqw`）。
- **竖屏：** 1080×1920（9:16）。**方屏：** 1080×1080（1:1）。
- **安全区：** `pad-slide` 约 3cqw；装饰故意出血到边缘之外。

**容器法则（承重规则）。** 每一帧的底层元素都设置 `container-type: size`；所有相对于帧的单位都是基于它的 `cqw`/`cqh`——绝不用 `vw`。边框保持 3px/2px；圆角保持 20/28/50px；阴影偏移按 `cqw` 缩放，让贴纸的偏移按比例保持不变。

## 色彩

token 与源设计完全一致。默认底色是 `{colors.cream}`；轮换饱和的粉彩色（turquoise / soft-pink / butter / mint / lavender / peach / sky）来营造色调情绪。**卡片在任何表面上都是白色。** **边框 + 阴影永远是 `{colors.text-dark}` 炭灰色**——绝不着色，绝不模糊，绝不用 `rgba`（柔和的 text-shadow 变体除外）。`{colors.coral}` 是唯一的高饱和强调色——**只**用于小标记（步骤圆圈、圆点、标题头），绝不用作表面。正文用炭灰色 / 弱化色；粉彩色**不带任何语义**。没有第九种颜色。

## 字体排印

两套字号阶梯。**阅读阶梯**（Quicksand 500 正文 0.95cqw，600 强调，元信息）承载文案；**展示阶梯**（Fredoka One `label-display` 1.3cqw → `display` 6.5cqw，单一字重）承载每一个标题、题名、引语和标记数字。

- **可读性下限：** 任何承重的文字行 ≥ **1.4cqw**；元信息只是辅助元素（chrome）。
- **按长度定字号：** 根据标题的长度决定字号。整块宽度上限 **≤ 78cqw**；≤3 个词 → `display`；4–6 个词 → `headline`；7 个词以上 → `title`。
- **所有展示字用 Fredoka One，所有正文用 Quicksand——绝不交叉。** Fredoka 是单一字重（没有斜体、没有下划线、没有其他字重）；Quicksand 保持 500/600/700。Fredoka 字距 0.02em；Quicksand 正文绝不全大写。

## 深度与表面

二维图形化的深度——硬偏移阴影，实心炭灰色，零模糊，偏向右下：

- **`shadows.default` 6px** 用于卡片、画框、徽章、图表容器。
- **`shadows.small` 4px** 用于小卡片、步骤圆圈、头像。
- **标题文字阴影**——饱和表面上的 Fredoka 标题加 3px 炭灰色阴影（粉色 / 薄荷色上用 20% 的柔和变体）；奶油色上的标题是平的。
- **描边 + 偏移**合在一起，就是纸上贴纸的标志。

**上限：** 不用模糊阴影，不用 `rgba`（柔和的 text-shadow 除外），不用渐变，不用发光；一个元素要么投下炭灰色硬偏移，要么什么都不投。

## 形状

- **20px** 用于卡片，**28px** 用于特写，**50px** 用于胶囊（徽章、计数器），**50%** 用于所有圆形，**4px** 用于图例色块。零直角——每个区域都是圆角的。

## 组件

- **card / framed-header**——白色填充、带边框的容器（一道阴影）。**badge-pill**——奶油黄色的分节标签。
- **circle-marker** 系列（bullet 20 / icon 44 / dot 48 / step 90）+ **bullet-dot**——带描边的粉彩圆盘，Fredoka 数字。
- **ornament**——手绘 SVG 贴纸层（每帧 3–7 个）。**quote-mark**——柔粉色的 Fredoka 锚点。**text-headline-shadow**——彩色表面上的标题处理方式。

## 帧处理方式

> 配方：底（ground）· 容器（container）· 组成（composes）· 焦点（focal）· 辅助元素（chrome）· 强调（accent）· 留白（silence）· 固定/可变（Fixed/Free）· 密度（density）。
> 每帧一个内容容器 + 一圈 3–7 个装饰组成的花环；空着的角落看起来就像坏了。

### 1 · Cover（身份 · 手法：装饰花环 · 饱和色 · 居中）

**底** 一种饱和的粉彩色（例如 `{colors.turquoise}`）。**组成** badge-pill、display、正文副标、3–7 个装饰、计数器。**焦点** 一个 1–2 行的 Fredoka `display`，**白色、带 3px 炭灰色 text-shadow**，居中，位于一个奶油黄 badge-pill 下方。**辅助元素** 计数器胶囊。**强调** 装饰花环（角落里的雏菊 + 星星，越过边缘被裁切）。**留白** 内容居中；装饰填满边缘。**固定** 彩色上的 text-shadow、3px 描边、炭灰色阴影。**可变** 表面颜色、装饰的组合 / 位置、文案。**密度** 满而不挤。

### 2 · Info Cards（列举 · 手法：三联白色卡片 · 奶油色 · 那个密集帧）

**底** `{colors.cream}`，`pad-slide`。**组成** 标题（平的炭灰色）、3 张 card（圆形图标 + Fredoka 题名 + Quicksand 正文）、几个装饰。**焦点** 三张带 3px 边框、6px 阴影的白色卡片。**辅助元素** 平的标题。**强调** 粉彩色的圆形图标（轮换 turquoise/coral/lavender）。**留白** 很紧——这是密度例外（这里装饰更少）。**固定** 白色卡片、3px + 6px、20px 圆角。**可变** 卡片内容、图标色相。**密度** 密集例外。

### 3 · Process Steps（序列 · 手法：轮换的圆形标记 · 桃色 · 居中）

**底** `{colors.peach}`（或另一种粉彩色）。**组成** 标题（白色 + text-shadow）、3–4 个步骤圆圈 + `→` 箭头、装饰。**焦点** 一排 90px 带描边的步骤圆圈，填充色**按 coral → mint → sky → lavender 轮换**，Fredoka 白色数字，由 Fredoka 箭头连接。**辅助元素** 带 text-shadow 的白色标题。**强调** 轮换的圆圈填充色。**留白** 适中。**固定** 3px 圆圈 + 小阴影、轮换的填充色、箭头字形。**可变** 步骤数量、标签。**密度** 标准。

### 4 · Quote（引语 · 手法：引号锚点 · 柔粉色 · 居中）

**底** `{colors.soft-pink}`。**组成** 一张白色引语卡片（28px 圆角，6px 阴影）、quote-mark、Fredoka 引语、Quicksand 署名、装饰。**焦点** 白色卡片里的一段炭灰色 Fredoka `quote`，上方是一个超大的柔粉色 quote-mark。**辅助元素** Quicksand 700 署名。**强调** quote-mark + 一两颗星星。**留白** 卡片居中，装饰在角落。**固定** quote-mark 锚点、白色卡片。**可变** 引语、署名。**密度** 适中。

### 5 · Framed Section（特写 · 手法：顶条 + 主体卡片 · 奶油色）

**底** `{colors.cream}`。**组成** framed-header（粉彩色顶条 + 白色主体）、bullet-dot 列表、装饰。**焦点** 一个 framed-header——粉彩色的顶条（Fredoka 题名，可选 text-shadow），下面是一个带奶油黄圆点项目符号列表的白色主体。**强调** 顶条颜色 + 项目圆点。**留白** 适中。**固定** 一条连续的 3px 边框 + 一道阴影、奶油黄圆点项目符号。**可变** 顶条颜色、列表。**密度** 标准。

### 6 · Closing（收尾 · 手法：装饰花环 · 饱和色 · 居中）

**底** 一种饱和的粉彩色（例如 `{colors.lavender}`）。**组成** badge-pill、display（白色 + text-shadow）、3–7 个装饰。**焦点** 一个白色、带炭灰色 text-shadow 的 Fredoka `display` 收尾语，居中。**强调** 装饰花环。**留白** 内容居中。**固定** 彩色上的 text-shadow、装饰填满角落。**可变** 收尾语、表面、装饰。**密度** 满。

## 构图规则

### 要做

- **Fredoka One 标题 + Quicksand 正文**严格按角色搭配。
- 每个形状都描上 **3px 炭灰色描边 + 一道硬偏移阴影**（6/4px，不模糊）；在任何表面上卡片都用白色填充。
- **饱和表面**上的 Fredoka 标题**加 3px 炭灰色 text-shadow + 白色文字**；奶油色上用平的炭灰色。
- 用**带描边的奶油黄圆盘项目符号**（绝不用字形）；每帧聚集 **3–7 个手绘装饰**（在角落，越过边缘被裁切）。
- 保持**每帧一个内容容器**；轮换标记颜色（coral → mint → sky → lavender → butter）；珊瑚色留给小标记。
- 大多数帧居中；内容密集的帧偏向奶油色，cover / closer / quote 偏向饱和色。

### 不要做

- 不要直角；不要模糊或 `rgba` 阴影（柔和的 text-shadow 除外）。
- 不要彩色边框（只用炭灰色）；不要珊瑚色表面；不要第九种颜色。
- 不要第三种字体；不要 Quicksand 标题或 Fredoka 正文；不要斜体 / 下划线的 Fredoka；不要全大写的 Quicksand 正文。
- 不要字形项目符号；不要空着的角落（用装饰填满）；不要两个互相争夺的内容面板。
- 不要让标题从边到边撑满——按长度定字号。

## 宽高比适配

| 处理方式 | 16:9 | 9:16 | 1:1 |
| --- | --- | --- | --- |
| Cover | 居中，角落装饰 | 居中，更高，装饰更多 | 居中 |
| Info Cards | 横排 3 张 | 竖向堆叠 | 2+1 |
| Process Steps | 水平 + 箭头 | 竖向，箭头转为朝下 | 2×2 |
| Quote | 卡片居中 | 居中，更高 | 居中 |
| Framed Section | 顶条 + 主体 | 顶条 + 主体，更高 | 顶条 + 主体 |
| Closing | 居中，花环 | 居中，花环 | 居中 |

`pad-slide` 在短边上保持不变；重新选择展示字的字号档位，不低于 1.4cqw 的下限。比例越紧，装饰数量越要靠近上限（5–7 个），让角落永远不显得空。

## 已批准的真实实体

源文件里没有定义任何真实客户、logo 或供应商——任何此类标记都渲染成占位符。装饰和粉彩色与内容无关；计数器 / 徽章承载每套演示文稿各自的文字。

## 数字与声明（硬规则）

绝不在帧尺度上编造数字、日期或计数。把槽位渲染成 `— figure —`、`{metric}`、`N`。步骤编号和任何图表数值一直用占位符，直到脚本提供为止；幻灯片计数器是装饰性的辅助元素。

## 渲染前自查

- **眯眼**——每帧一个 Fredoka 标题或一张内容卡片占主导。
- **留白**——每帧一个容器，被一圈装饰花环环绕；只有信息卡片网格是密集的。
- **色彩**——奶油色或一种粉彩表面；珊瑚色只用于标记；炭灰色边框 / 阴影；没有第九种色相。
- **字体**——Fredoka 标题（饱和色上用 text-shadow + 白色，奶油色上用平的炭灰色），Quicksand 正文；下限 ≥1.4cqw。
- **深度**——3px 描边 + 硬偏移（不模糊，除柔和 text-shadow 外不用 rgba）；只用圆角。
- **装饰**——每帧 3–7 个，越过边缘被裁切；没有空着的角落。**项目符号**——带描边的圆盘，绝不用字形。
- **编造**——每个数字都能追溯到脚本，否则用占位符。

## 已知缺口

- **动效有意不在范围内。** frame.md 只规定构图；源设计用的是滚动吸附导航，没有转场规范。
- **字体：** 源设计用的名字是 *Fredoka One*；Google 现在提供的是 **Fredoka** 可变字体家族——请求 `Fredoka:wght@500;600;700`，展示字设为字重 600（视觉上与 Fredoka One 一致），并在字体栈里把 `Fredoka One` 放在第一位，供仍然提供它的环境使用。Quicksand 正常加载。CJK：ZCOOL XiaoWei（展示）/ Yozai（正文）。
- **9:16 / 1:1 只是指导**；在每种比例下都保持较多的装饰数量，让角落保持填满。
- 装饰（雏菊 / 星星 / 太阳 / 云朵 / 彩虹）、标记和带框标题都是纯 CSS/SVG 实现；给 SVG 装饰重新上色需要修改它们的 stroke 值。
- **对比度：** 不要在粉彩表面上用 `{colors.text-muted}`（只用于奶油色 / 白色卡片）；饱和底色上的小字应该用炭灰色或白色。
