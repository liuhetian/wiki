---
version: alpha
name: Capsule — Frame (video / frame layer)
description: >
  Video-first companion to Capsule's design.md. The unit is the frame (1920×1080). Atoms are
  identical and sacred — the pill geometry (9999px small / 2rem cards) with a 2px ink outline on
  everything, the sun-bleached cream canvas, the nine-color candy palette, Bodoni Moda + Space
  Grotesk, soft hard-offset shadows (4/6/8/12px in 8% ink), floating decorative-pill wallpaper,
  radial accent glows, and the grain overlay. Composition + frame scale rewritten. Motion out of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  cream: "#F5F5F0"
  ink: "#1A1A1A"
  outline: "#1E1E1E"
  white: "#FFFFFF"
  coral: "#E85D4E"
  lime: "#C4D94E"
  lavender: "#C5B5E0"
  sky: "#8BB4F7"
  violet: "#A06CE8"
  yellow: "#F2D160"
  peach: "#F5B895"
  mint: "#A8E6CF"
  shadow: "rgba(26,26,26,0.08)"

typography:
  # — reading ramp (Space Grotesk) —
  body:      { fontFamily: "Space Grotesk", cqw: 0.85, weight: 400, lineHeight: 1.6 }
  subtitle:  { fontFamily: "Space Grotesk", cqw: 0.95, weight: 400, tracking: "0.18em", upper: true }
  pill-text: { fontFamily: "Space Grotesk", cqw: 0.75, weight: 600, tracking: "0.12em", upper: true }
  label:     { fontFamily: "Space Grotesk", px: 14, weight: 500, tracking: "0.1em", upper: true }
  # — display / hero ramp (Bodoni Moda, ink, sentence case) —
  card-headline: { fontFamily: "Bodoni Moda", cqw: 1.9, weight: 700, lineHeight: 1.1 }
  orbit-numeral: { fontFamily: "Bodoni Moda", cqw: 2.6, weight: 700, lineHeight: 1.0 }
  quote-display: { fontFamily: "Bodoni Moda", cqw: 4.2, weight: 600, lineHeight: 1.3, tracking: "-0.01em" }
  stat-number: { fontFamily: "Bodoni Moda", cqw: 3.6, weight: 800, lineHeight: 1.0, tracking: "-0.03em" }
  section-headline: { fontFamily: "Bodoni Moda", cqw: 4.0, weight: 700, lineHeight: 1.05, tracking: "-0.01em" }
  headline:    { fontFamily: "Bodoni Moda", cqw: 5.0, weight: 700, lineHeight: 1.05, tracking: "-0.02em" }
  closing-display: { fontFamily: "Bodoni Moda", cqw: 8.5, weight: 800, lineHeight: 0.95, tracking: "-0.03em" }
  display:     { fontFamily: "Bodoni Moda", cqw: 12.0, weight: 800, lineHeight: 0.88, tracking: "-0.03em" }

spacing:
  pad: "5cqw"
  gap-md: "2cqw"
  card-pad: "2cqw 1.6cqw"

components:
  pill:
    rounded: "9999px (small) / 2rem (cards)"
    border: "0.2cqw solid {colors.outline}"
    backgroundColor: "any candy or {colors.white}"
    description: "The universal container — every chip/button/label/stat tile/node/bar. No unstroked pill exists."
  pill-card:
    backgroundColor: "{colors.white}"
    border: "0.2cqw solid {colors.outline}"
    rounded: "2rem"
    shadow: "0.4cqw 0.4cqw 0 {colors.shadow}"
    typography: "{typography.card-headline} + {typography.body}"
    description: "Holds a circular card-icon, Bodoni headline, Space Grotesk body."
  stat-pill:
    backgroundColor: "{colors.white}"
    border: "0.2cqw solid {colors.outline}"
    rounded: "2rem"
    shadow: "0.3cqw 0.3cqw 0 {colors.shadow}"
    typography: "{typography.stat-number} (COLORED) + {typography.pill-text}"
    description: "The one place color touches a numeral; + a 40px accent bar."
  title-pill:
    backgroundColor: "{colors.yellow}"
    border: "0.2cqw solid {colors.outline}"
    rounded: "9999px"
    shadow: "0.3cqw 0.3cqw 0 {colors.shadow}"
    typography: "{typography.pill-text}"
    description: "Sits above the display headline on cover/closing."
  card-icon:
    backgroundColor: "any candy"
    border: "0.2cqw solid {colors.outline}"
    rounded: "50%"
    size: "60px"
    typography: "Bodoni numeral/letter in {colors.ink}"
    description: "Card mark."
  floating-pill:
    backgroundColor: "any candy"
    border: "0.2cqw solid {colors.outline}"
    rounded: "9999px / 50%"
    transform: "rotate(−20°..+25°)"
    shadow: "none"
    typography: "{typography.pill-text}"
    description: "Decorative wallpaper confetti, 5–8 per declarative frame. Flat — no shadow."
  quote-highlight:
    backgroundColor: "{colors.lime} / {colors.sky}"
    border: "0.2cqw solid {colors.outline}"
    rounded: "9999px"
    description: "Inline candy pill wrapping a phrase inside a Bodoni quote — the emphasis mechanism, replacing bold/italic."
  bar-track:
    backgroundColor: "{colors.cream}"
    border: "0.2cqw solid {colors.outline}"
    rounded: "9999px"
    fill: "child candy pill, value at right edge"
    description: "36px pill chart track."
  accent-line:
    backgroundColor: "{colors.coral}"
    rounded: "9999px"
    size: "60×4 (80×4 closing)"
    description: "Coral pill rule."
  atmosphere:
    background: "1–3 radial candy glows (6–15% opacity) over {colors.cream} + 4% grain overlay"
    description: "Baseline canvas layers on every frame. Never absent."
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/frame-presets/capsule/FRAME.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Capsule — Frame (video / frame layer)

## 概述

帧尺度下的 Capsule 是一套**俏皮的编辑风系统，每个容器都是胶囊（pill）。** `border-radius: 9999px`（小元素）/ `2rem`（卡片）的规则加上 2px 墨色描边，包裹住每一个标签片、卡片、图标、条形和节点——鼓鼓的、友好的、图形上辨识度很高。画布是被阳光晒褪色的奶油色，被柔和的径向糖果色光晕烘暖，并常驻一层 4% 的颗粒叠加层。

它的字体声音是两款字体的对话：**Bodoni Moda**（didone 衬线体，字重 700–800，永远是墨色，永远用句首大写）承担每一个标题、数据和引语；**Space Grotesk** 承担正文以及所有全大写加字距的胶囊 / 标签文字。九种糖果色强调色可以互换地填充胶囊，不带任何语义。深度来自**柔和的硬偏移阴影**（4/6/8/12px，8% 墨色）——是托起来的，不是盖上去的——只留给承载内容的容器；装饰性的漂浮胶囊是平的。

**帧尺度下的关键特征：**

- **处处是胶囊几何**——小元素 9999px，卡片 2rem——每个都包一圈 2px 的 `{colors.outline}` 描边。
- **Bodoni Moda** 展示字（墨色，句首大写）+ **Space Grotesk** 正文 / 胶囊（全大写，加字距）。
- **九种糖果色强调色**，可互换；颜色只碰数据数字 + 胶囊填充，绝不碰标题。
- **柔和偏移阴影**（4/6/8/12px，8% 墨色）只用于内容容器；漂浮胶囊是平的。
- 宣告帧上铺**漂浮装饰胶囊壁纸**（5–8 个，倾斜）+ 径向光晕 + 4% 颗粒。
- **奶油色画布**被氛围烘暖——光秃秃的角落看起来就像坏了。

## 帧

### 帧工艺门槛

每一帧在做任何结构检查之前，先要过三项目测闸门：

- **眯眼**——一个 Bodoni 标题或数据占主导，体量是**离它最近的元素的 3–6 倍**。
- **留白**——宣告帧承载的是**氛围，而不是杂乱**（胶囊是壁纸，不是内容）；**pillar-card 和数据网格是密集例外**。
- **克制**——每个胶囊都带 2px 描边；颜色**只碰填充 + 数据数字**（绝不碰标题）；柔和阴影只用于承载内容的胶囊（漂浮胶囊是平的）；不要第十种强调色。
- **参照**——瞄准**孟菲斯风格 / 冰淇淋店风格的杂志跨页**；失败的样子是**扁平、没有贴纸感的 SaaS 卡片网格**。

- **主尺寸：** 1920×1080（16:9）。展示字用 **`cqw`** 编写（`px ÷ 1920 × 100 = cqw`）。
- **竖屏：** 1080×1920（9:16）。**方屏：** 1080×1080（1:1）。
- **安全区：** `pad`（5cqw）；漂浮胶囊可以作为壁纸出血到边缘之外。

**容器法则（承重规则）。** 每一帧的底层元素都设置 `container-type: size`，并且带上径向光晕 + 颗粒的氛围；所有相对于帧的单位都是基于它的 `cqw`/`cqh`——绝不用 `vw`。胶囊圆角保持 `9999px`/`2rem`（这是形状，不是尺度）；阴影偏移按 `cqw` 缩放。

## 色彩

token 与源设计完全一致。`{colors.cream}` 是底色；`{colors.ink}`/`{colors.outline}` 用于文字 + 通用的 2px 描边；九种糖果色强调色填充胶囊，**没有语义映射**——一个暖色（coral/yellow/peach）配一个冷色（sky/lavender/violet/mint）再配一个中性亮色（lime）；绝不让同色系的两个相邻。颜色**只出现在数据数字和胶囊填充上**——绝不出现在 Bodoni 标题上。阴影永远是 `{colors.shadow}`（8% 墨色）。没有第十种颜色。

## 字体排印

两套字号阶梯。**阅读阶梯**（Space Grotesk 正文 0.85cqw，全大写加字距的胶囊 / 标签文字）承载文案和标签片；**展示阶梯**（Bodoni `card-headline` 1.9cqw → `display` 12cqw，全部 700–800）承载每一个标题、数据和引语。

- **可读性下限：** 任何承重的文字行 ≥ **1.4cqw**；用 px 的标签只是辅助元素（chrome）。
- **按长度定字号：** 根据标题的长度决定字号。整块宽度上限 **≤ 78cqw**；≤3 个词 → `display`/`closing-display`；4–6 个词 → `headline`；7 个词以上 → `section-headline`。
- **Bodoni 700 以上、墨色、句首大写**（斜体只能通过 `<em>`，斜体关键词可以用一种糖果色着色）；**Space Grotesk 胶囊 / 标签全大写，字距 0.08em 以上**；Bodoni 展示字用负字距。

## 深度与表面

柔和的硬偏移阴影是唯一的深度手段，颜色为 `{colors.shadow}`（8% 墨色），偏向右下：

- **0.2cqw（4px）** 用于小节点；**0.3cqw（6px）** 用于 stat-pill、环绕胶囊、图示节点；**0.4cqw（8px）** 用于 pillar-card；**0.6cqw（12px）** 用于视觉画框。
- 在奶油色上，大部分的托起感来自 **2px 描边**；阴影再加上漂浮感。
- **装饰性漂浮胶囊不投阴影**——这样一眼就能把内容和氛围区分开。

**上限：** 不用模糊阴影，不给阴影换颜色，不用渐变制造深度。

## 形状

- **9999px**——所有小胶囊（标签片、按钮、条形、节点、漂浮胶囊、引语高亮、强调线）。
- **2rem**——较大的卡片（pillar-card、stat-pill、图表容器、视觉画框）。
- **50%**——圆形胶囊（card-icon 60px、step-node 56px、orbit-center 160px、导航圆点）。
- **0**——只有颗粒叠加层和视觉画框内部的渐变区域。不存在直角的文字容器。

## 组件

- **pill**——通用的 2px 描边容器。**pill-card / stat-pill / title-pill**——带柔和阴影的白色 / 黄色内容胶囊。
- **card-icon**——圆形糖果色标记；**floating-pill**——平的、倾斜的壁纸彩屑；**quote-highlight**——行内的糖果色强调胶囊。
- **bar-track**——胶囊形的图表条；**accent-line**——珊瑚色的胶囊线；**atmosphere**——每一帧上作为基线的光晕 + 颗粒。

## 帧处理方式

> 配方：底（ground）· 容器（container）· 组成（composes）· 焦点（focal）· 辅助元素（chrome）· 强调（accent）· 留白（silence）· 固定/可变（Fixed/Free）· 密度（density）。
> 每一帧都有氛围（光晕 + 颗粒）；宣告帧铺漂浮胶囊壁纸。

### 1 · Cover（身份 · 手法：标题胶囊 + 展示字 · 居中）

**底** 奶油色 + 氛围，漂浮胶囊壁纸。**组成** title-pill、display、accent-line、floating-pills（5–8 个）。**焦点** 一个 1–2 行的墨色 Bodoni `display` 标题（斜体关键词用一种糖果色），居中，位于一个黄色 title-pill 下方；下方一条珊瑚色 accent-line。**辅助元素** 全大写的 Space Grotesk 副标。**强调** 斜体词 + 糖果色漂浮胶囊。**留白** 内容居中；胶囊填满边缘。**固定** 胶囊描边、墨色 Bodoni、平的漂浮胶囊。**可变** 标题、用哪些糖果色、胶囊上的词 / 位置。**密度** 中等，偏氛围。

### 2 · Pillar Cards（列举 · 手法：三联网格 · 居左——那个密集帧）

**底** 奶油色 + 氛围。**组成** title-pill（lavender）、section-headline、3 张 pill-card。**焦点** 三张白色 2rem 的 pill-card（圆形糖果色 card-icon、Bodoni card-headline、Space Grotesk 正文），带 0.4cqw 阴影，位于一个 Bodoni section-headline 下方。**辅助元素** 一个 lavender 色的标题标签胶囊。**强调** 三个 card-icon 的填充色（coral/sky/lime 的顺序）。**留白** 很紧——这是密度例外（这里不放漂浮胶囊）。**固定** 2px 描边、柔和阴影、墨色标题。**可变** 卡片内容、图标色相。**密度** 密集例外。

### 3 · Stat Grid（数据 · 手法：数据胶囊 · 标题居中）

**底** 奶油色 + 氛围。**组成** section-headline、3–4 个 stat-pill。**焦点** 一排白色 stat-pill，每个都有一个着色的 Bodoni stat-number + 全大写标签 + 强调条。**强调** 着色的数字 + 条形（这是颜色与文字相遇的唯一地方）。**留白** 适中。**固定** 2rem 胶囊、只有数字着色、柔和阴影。**可变** 数字（来自脚本）、色相。**密度** 标准。

### 4 · Pull Quote（引语 · 手法：高亮胶囊 · 居左）

**底** 奶油色 + 氛围，少量漂浮胶囊。**组成** quote-display、quote-highlight、accent-line。**焦点** 一段墨色 Bodoni 引语，其中一个短语包在 lime/sky 色的 `quote-highlight` 胶囊里（这是强调机制——绝不用粗体）。**辅助元素** 全大写署名。**强调** 高亮胶囊。**留白** 约 50%。**固定** Bodoni 600、用高亮胶囊做强调。**可变** 引语、高亮的颜色 / 短语。**密度** 稀疏。

### 5 · Orbit（概念 · 手法：引力环绕的胶囊 · 居中）

**底** 奶油色 + 氛围。**组成** orbit-center（160px 的 lime 色圆形，Bodoni 序数）、4–6 个 orbit-pill 卫星（糖果色、倾斜、柔和阴影）。**焦点** lime 色的中心，由环绕的糖果色胶囊锚定。**强调** 卫星的色相。**留白** 适中。**固定** 圆形中心、带描边和阴影的卫星。**可变** 序数、卫星上的词 / 位置。**密度** 中等。

### 6 · Closing Plate（收尾 · 手法：标题胶囊 + 展示字 · 居中）

**底** 奶油色 + 氛围，漂浮胶囊壁纸。**组成** title-pill（yellow）、closing-display、accent-line、floating-pills。**焦点** 一个墨色 Bodoni `closing-display` 收尾语（斜体词用 violet / 糖果色），居中。**强调** 斜体词 + 胶囊。**留白** 内容居中。**固定** 墨色 Bodoni、平的胶囊。**可变** 收尾语、胶囊上的词。**密度** 中等，偏氛围。

## 构图规则

### 要做

- 让每个文字容器都是带 **2px 墨色描边**的**胶囊**（9999px / 2rem）。
- **Bodoni 标题用墨色、句首大写**；颜色留给数据数字 + 胶囊填充。
- 内容容器上用**柔和偏移阴影**（4/6/8/12px，8% 墨色）；漂浮胶囊保持平面。
- 宣告帧上漂浮 **5–8 个糖果色胶囊** + 径向光晕 + 颗粒；光秃秃的角落看起来就像坏了。
- 行内强调要包进**糖果色 quote-highlight 胶囊**，绝不单靠粗体 / 斜体。
- 强调色按暖色 + 冷色 + 中性亮色搭配；cover / closer 偏向居中，卡片 / 引语偏向居左。

### 不要做

- 不要直角的文字容器；不要没有描边的胶囊。
- 不要着色的 Bodoni 标题；不要全大写的 Bodoni。
- 不要模糊或换了颜色的阴影；不要第十种强调色。
- 装饰性漂浮胶囊上不要阴影。
- 不要让标题从边到边撑满——按长度定字号。

## 宽高比适配

| 处理方式 | 16:9 | 9:16 | 1:1 |
| --- | --- | --- | --- |
| Cover | 展示字居中，胶囊环绕 | 展示字在上，胶囊成带状 | 居中，胶囊更少 |
| Pillar Cards | 标题 + 三联 | 标题 + 3 张竖向堆叠 | 标题 + 2+1 |
| Stat Grid | 横排 3–4 个 | 2×2 | 2×2 |
| Pull Quote | 引语居左 | 引语在上，高亮在行内 | 居中 |
| Orbit | 中心 + 4–6 个卫星 | 中心 + 3 个卫星 | 中心 + 4 个 |
| Closing | 居中 + 胶囊 | 居中，胶囊成带状 | 居中 |

`pad` 在短边上保持不变；重新选择展示字的字号档位，不低于 1.4cqw 的下限。比例越紧，漂浮胶囊的数量越少，让它们仍然是壁纸，而不是杂乱。

## 已批准实体

源文件里没有定义任何真实客户、logo 或供应商——任何此类标记都渲染成占位符。漂浮胶囊上的词是中性的氛围词（"VISION"、"FUTURE"、"NEXT"），绝不与具体内容相关。

## 数字与声明（硬规则）

绝不在帧尺度上编造数字、数据或计数。把槽位渲染成 `— figure —`、`{metric}`、`N%`。stat-pill 的数字和 bar-track 的宽度一直用占位符，直到脚本提供数值为止。

## 渲染前自查

- **眯眼**——一个 Bodoni 元素占主导，体量是相邻元素的 3–5 倍。
- **留白**——宣告帧承载的是氛围而不是杂乱；只有 pillar / 数据网格是密集的。
- **胶囊**——每个容器都是带 2px 描边的胶囊；没有直角的文字容器。
- **色彩**——糖果色只用于填充 + 数据数字；标题用墨色；没有第十种色相。
- **深度**——柔和偏移阴影只用于内容；漂浮胶囊是平的；不用模糊。
- **字体**——Bodoni 墨色、句首大写、按长度定字号；胶囊全大写加字距；下限 ≥1.4cqw。
- **锚定**——cover / closer / orbit 居中，卡片 / 引语居左；不要连续 3 帧一样。
- **编造**——每个数字都能追溯到脚本，否则用占位符。

## 已知缺口

- **动效有意不在范围内。** frame.md 只规定构图；源设计中 0.6s 的淡入淡出属于演示文稿的机制。
- **Bodoni Moda + Space Grotesk 通过 Google Fonts 加载。** CJK 搭配（ZCOOL XiaoWei / Yozai）沿用源设计。
- **9:16 / 1:1 只是指导**；检查字号下限，并确认漂浮胶囊的数量随之减少。
- 颗粒叠加层、径向光晕、漂浮胶囊和条形填充都是纯 CSS 实现；不需要外部图片。
