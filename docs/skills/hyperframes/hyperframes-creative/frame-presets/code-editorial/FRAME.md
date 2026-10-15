---
version: alpha
name: Code editorial — Frame (video / frame layer)
description: >
  Video-first companion to Code editorial's design.md. The unit is the frame (1920×1080). Atoms are
  identical and sacred — warm cream paper (never pure white, never cool), a single terracotta coral
  as scarce "voltage", hairline ink elevation (no heavy shadow), EB Garamond for all
  display + Inter body + JetBrains Mono for the index/code voice on a warm-navy code surface,
  sentence-case display, and the ✱ coral spike mark. Composition + frame scale rewritten. Motion out
  of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  ink: "#141413"
  cream: "#FAF9F5"
  tile: "#EFE9DE"
  tile-strong: "#ECE3D4"
  coral: "#CC785C"
  navy: "#181715"
  navy-soft: "#1F1E1B"
  navy-elev: "#252320"

borders: { hairline: "1px solid ink@12%", hairline-strong: "1px solid ink@20%", dark: "1px solid cream@14% (on navy)" }
shadows: { card: "0 1px 3px ink@8%, 0 4px 16px ink@4%", none: "none" }

typography:
  # — reading + chrome ramp —
  body:    { fontFamily: "Inter", cqw: 1.5, weight: 400, lineHeight: 1.5 }
  lead:    { fontFamily: "Inter", cqw: 2.08, weight: 400, lineHeight: 1.5 }
  card-title: { fontFamily: "Inter", cqw: 2.3, weight: 500, lineHeight: 1.25, tracking: "-0.005em" }
  button:  { fontFamily: "Inter", cqw: 1.46, weight: 500, lineHeight: 1.0 }
  tag-upper: { fontFamily: "Inter", cqw: 1.35, weight: 500, tracking: "0.18em", upper: true }
  kicker:  { fontFamily: "JetBrains Mono", px: 28, cqw: 1.46, weight: 500, tracking: "0.16em", upper: true }
  mono-label: { fontFamily: "JetBrains Mono", px: 26, cqw: 1.35, weight: 500, tracking: "0.02em" }
  code:    { fontFamily: "JetBrains Mono", cqw: 1.67, weight: 400, lineHeight: 1.6 }
  # — display ramp (EB Garamond 400, sentence case, negative tracking. Renderer embeds only 400/700 — author at 400; italic is the synthesized slant) —
  headline: { fontFamily: "EB Garamond", cqw: 4.6, weight: 400, lineHeight: 1.06, tracking: "-0.018em" }
  quote-pull: { fontFamily: "EB Garamond", cqw: 5.0, weight: 400, lineHeight: 1.12, tracking: "-0.012em", italic: true }
  display-italic: { fontFamily: "EB Garamond", cqw: 6.7, weight: 400, lineHeight: 1.05, tracking: "-0.012em", italic: true }
  display: { fontFamily: "EB Garamond", cqw: 7.3, weight: 400, lineHeight: 1.02, tracking: "-0.022em" }
  number-hero: { fontFamily: "EB Garamond", cqw: 9.4, weight: 400, lineHeight: 0.95, tracking: "-0.025em" }
  display-cover: { fontFamily: "EB Garamond", cqw: 9.9, weight: 400, lineHeight: 0.98, tracking: "-0.028em" }
  number-unit: { fontFamily: "JetBrains Mono", cqw: 2.08, weight: 500, lineHeight: 1.0 }

spacing:
  slide-pad: "4.2cqw"   # ~80px @1920
  gap-md: "1.7cqw"
  hairline: "1px"
  radius-sm: "6px"
  radius-md: "8px"
  radius-lg: "12px"
  radius-pill: "9999px"

components:
  card-hairline:
    backgroundColor: "{colors.cream} or {colors.tile}"
    border: "1px solid {colors.ink}@12%"
    rounded: "{spacing.radius-lg}"
    shadow: "{shadows.card}"
    typography: "{typography.card-title} + {typography.body}"
    description: "The editorial content card. Elevation is the hairline + ONE soft warm shadow — never a heavy drop, glow, or gradient."
  kicker-spike:
    typography: "{typography.kicker}"
    mark: "✱ coral spike prefix"
    description: "The eyebrow — JetBrains Mono uppercase, indexical (2–5 words), prefixed with the coral ✱. Never plain text, never a sentence."
  coral-callout:
    backgroundColor: "{colors.coral} (full-bleed) or {colors.cream} with a coral edge"
    textColor: "{colors.cream} on coral"
    rounded: "{spacing.radius-md}"
    typography: "{typography.button} / {typography.h2}"
    description: "The ONE voltage moment per frame — the CTA, the single inline link, OR the full-bleed band. Never two corals in one frame."
  number-lockup:
    typography: "{typography.number-hero} figure + {typography.number-unit} unit"
    description: "Hero stat — a EB Garamond figure paired with a JetBrains Mono unit (200K, +1,204, −318, 17 files). Figure is serif; the unit is ALWAYS mono, never the serif."
  pull-quote:
    typography: "{typography.quote-pull} (EB Garamond italic) + {typography.tag-upper} cite"
    description: "A commit message, a reviewer line, or the thesis. EB Garamond italic, small Inter uppercase cite beneath."
  section-rule:
    rule: "1px solid {colors.ink}@12% (or {colors.cream}@14% on navy)"
    description: "The only separator. A coral 1px rule may draw on to introduce a section. Never 2px+, never a heavy divider."
  code-surface:
    backgroundColor: "{colors.navy} body / {colors.navy-elev} title bar + status strip"
    textColor: "{colors.cream} (JetBrains Mono); syntax in coral (keywords) / teal #5DB8A6 (strings) / amber #E8A55A (numbers)"
    border: "1px solid {colors.cream}@14%"
    rounded: "{spacing.radius-md}"
    description: "The warm-navy code / terminal surface. The CODE ITSELF is rendered by the code-* registry blocks (code-diff / code-typing / code-snippet-*); this preset owns the surrounding surface, title bar, status strip, and mono chrome — not the code rendering."
  spike-mark:
    glyph: "✱ (U+2731), always {colors.coral}"
    description: "The brand mark. Fades + scales 0.92→1 on a single emphasis beat; never spins."
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/frame-presets/code-editorial/FRAME.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Code editorial — Frame (video / frame layer)

## 概述

帧尺度下的 Code editorial 是一本**活过来的暖调编辑风品牌手册**——带着文学出版社或研究札记的语域。它的主旨是三种颜色：**奶油色是底，墨色是声音，珊瑚色是电压**——还有第四种（暖海军蓝），只在代码露面的地方出现。每一个表面都是**暖奶油色**（绝不是纯白，绝不是冷灰）；内容聚集在深半档的 **tile** 表面上——分界只差半档，绝不是强烈的对比。抬升感来自一条低透明度的 **1px 细线**墨色边框，偶尔再加一道柔和的暖色阴影。没有厚重的投影，没有发光，内容上没有渐变。

三种编辑风的声音，各用各的字体：**EB Garamond** 承担每一个展示时刻——封面、标题、引语、大号数据数字——以大号展示字号配轻微的负字距；它的**斜体**是富有表现力的语域。**Inter** 承担正文、导语、卡片标题、按钮和 UI 辅助元素（chrome）。**JetBrains Mono** 承担索引层——眉题、技术标签、代码窗口、状态条。给某个声音换了字体，语域就垮了：无衬线的标题或衬线的标签读起来就像另一个品牌。

**帧尺度下的关键特征：**

- **奶油色 / 墨色 / 珊瑚色三位一体** + 一个暖海军蓝的代码表面；奶油色是默认的底，墨色是声音，珊瑚色是稀缺的电压。
- 所有展示字用 **EB Garamond**（句首大写，负字距）；**Inter** 用于正文 / 辅助元素；**JetBrains Mono** 用于索引 + 代码。
- **细线抬升**——一条 1px 低透明度墨色边框 + 最多一道柔和的暖色阴影。不用厚重投影、发光或渐变。
- **珊瑚色是配给的**——每帧最多一个珊瑚色时刻（CTA、行内链接或满版色带）；珊瑚色绝不用来排标题或一段正文。
- **密度自由**——内容需要多满就填多满；一帧可以只立一个焦点，也可以承载密集、分层的构图。
- **✱ 珊瑚色尖刺**开启眉题；暖海军蓝留给代码 / 终端表面。

## 帧

### 帧工艺门槛

每一帧在做任何结构检查之前，先要过这几项目测闸门：

- **眯眼**——一个 EB Garamond 展示时刻占主导，体量是相邻元素的 3–6 倍。
- **三位一体**——奶油色 / tile 底，墨色文字，珊瑚色恰好出现**一次**；暖海军蓝只用在代码表面上；没有冷灰 / 纯白 / 第四种色相。
- **字体**——EB Garamond 句首大写的展示字（负字距）；Inter 400 正文；JetBrains Mono 眉题（全大写 0.16em，珊瑚色 ✱）+ 代码。

- **主尺寸：** 1920×1080（16:9）。展示字用 **`cqw`** 编写（`px ÷ 1920 × 100 = cqw`）。
- **竖屏：** 1080×1920（9:16）。**方屏：** 1080×1080（1:1）。
- **安全区：** `slide-pad` 约 4.2cqw；眉题 / 等宽辅助元素都落在它里面。

**容器法则（承重规则）。** 每一帧的底层元素都设置 `container-type: size`；所有相对于帧的单位都是基于它的 `cqw`/`cqh`——绝不用 `vw`。细线保持 1px；卡片圆角保持 6/8/12px；暖纸面的观感在每一种比例下都必须保住。

## 色彩

token 与源设计完全一致。默认底色是 `{colors.cream}`；内容聚集在 `{colors.tile}` / `{colors.tile-strong}` 上（半档的暖色台阶，绝不是强烈对比）。**标题和正文：** 奶油色 / tile 上用 `{colors.ink}`；海军蓝上用 `{colors.cream}`。**珊瑚色**（`{colors.coral}`）是稀缺的电压——每帧一个时刻（CTA、行内链接或满版色带），绝不用于正文，绝不用作卡片填充。**暖海军蓝**（`{colors.navy}` / `navy-soft` / `navy-elev`）是代码 / 终端 / 深色卡片的表面——是结构锚点，不是第四种品牌色相。**不用冷灰，不用纯白，不用纯黑。**

**固定的语法高亮颜色（装饰，不是可重混的品牌色相）。** 当一行代码是手工排版、而不是由 `code-*` block 渲染时，关键字用珊瑚色，字符串用**青绿 `#5DB8A6`**，数字用**琥珀色 `#E8A55A`**；状态色为成功 `#5DB872` / 警告 `#C64545`。这些颜色跟随代码表面，而不是品牌三色——不要把它们放进品牌色板。

## 字体排印

两套字号阶梯。**阅读 / 辅助阶梯**（Inter `body` 1.5cqw / `lead` 2.08cqw，字重 400；JetBrains Mono `kicker`/`mono-label` 用 px）承载文案和辅助元素；**展示阶梯**（EB Garamond `headline` 4.6cqw → `display-cover` 9.9cqw，字重 400，负字距）承载每一个标题和数据。

- **可读性下限：** 任何承重的文字行 ≥ **1.4cqw**；用 px 的等宽标签只是辅助元素。
- **按长度定字号：** 根据标题的长度决定字号。整块宽度上限 **≤ 78cqw**；≤3 个词 → `display-cover`；4–6 个词 → `display`；7 个词以上 → `headline`。7.3–9.9cqw 这一档留给 cover / statement / stat。
- **EB Garamond 展示字用句首大写**（不是标题式大写，也不是全大写），字重 400，负字距（−0.012..−0.028em）；当这一行是一种立场或一个定义时，用**斜体**。**Inter 正文**句首大写，字重 400。**JetBrains Mono** 眉题全大写 0.16em，带珊瑚色 ✱。不用全大写的衬线字，不用无衬线标题，不用衬线标签。

## 深度与表面

细线抬升：

- 约 12% 透明度的 **1px 细线**墨色边框是主要的抬升手段（海军蓝上用 cream@14%）。
- **一道柔和的暖色阴影**（`0 1px 3px ink@8%, 0 4px 16px ink@4%`）——很少用，绝不厚重。
- **半档表面**——奶油色上的 `{colors.tile}` 色块靠暖色的半档台阶显得被抬起，而不是靠投下的阴影。

**上限：** 不用厚重投影，不用发光，内容上不用渐变，不倾斜。这套系统没有要发出的光；它靠温暖和细线来被阅读。

## 形状

- **6px** 用于小型辅助元素，**8px** 用于卡片 / 代码表面，**12px** 用于大卡片 / 引语框，**9999px** 只用于真正的胶囊。没有直角，也没有大圆角；编辑风的语域是轻微圆润的，绝不生硬。

## 组件

- **card-hairline**——编辑风内容卡片（细线 + 一道柔和阴影）。**section-rule**——唯一的分隔线（1px，可以用珊瑚色描出）。
- **kicker-spike**——带 ✱ 的珊瑚色眉题。**coral-callout**——唯一的电压时刻（CTA / 行内链接 / 满版色带）。
- **number-lockup**——EB Garamond 数字 + 等宽单位（PR 的 `+N / −M`、`200K`、文件数）。**pull-quote**——EB Garamond 斜体 + 出处（一条 commit message / 一句评审意见）。
- **code-surface**——暖海军蓝的代码 / 终端表面；代码本身来自 **`code-*` registry block**，这个组件只负责表面 + 等宽辅助元素。
- **spike-mark**——✱ 品牌字形，永远是珊瑚色。

## 帧处理方式

> 配方：底（ground）· 容器（container）· 组成（composes）· 焦点（focal）· 辅助元素（chrome）· 强调（accent）· 固定/可变（Fixed/Free）· 密度（density）。
> 每帧一个珊瑚色时刻；以 kicker-spike 开场。

### 1 · Cover（身份 · 手法：超大 EB Garamond · 奶油色）

**底** `{colors.cream}`，`slide-pad`。**组成** kicker-spike、display-cover、lead、mono-label 索引。**焦点** 一个 2–3 行的 EB Garamond `display-cover`（句首大写，墨色），位于一个珊瑚色 ✱ 眉题下方。**辅助元素** 等宽索引条（仓库 · 分支）。**强调** 唯一的珊瑚色 ✱。**固定** EB Garamond 400 句首大写、细线、奶油色底。**可变** 标题、等宽索引、版式 + 画面填多满。**密度** 自由。

### 2 · Statement（陈述 · 手法：一行 EB Garamond · 奶油色或海军蓝）

**底** `{colors.cream}`（需要分量时用 `{colors.navy}`）。**组成** kicker-spike、display、可选的 lead。**焦点** 一个两行的 EB Garamond `display`，用一句话讲清这次变更——如果是一种立场，就用**斜体**。**辅助元素** 等宽眉题。**强调** 无——由衬线字承担（或一个珊瑚色单词）。**固定** 句首大写的衬线字。**可变** 这一行文字、底色、版式 + 密度。**密度** 自由。

### 3 · Code Surface（代码 · 手法：暖海军蓝代码窗口 · 对 PR 至关重要的那一帧）

**底** `{colors.cream}`，框住一个 `{colors.navy}` 的 **code-surface**（8px，cream@14% 细线，`navy-elev` 标题栏 + 等宽文件名）。**组成** mono-label 文件名、**`code-*` block**（code-diff / code-typing / code-snippet-_）、可选的 `section-rule`。**焦点** 代码面板——diff / 之前→之后 / 逐字打出的代码片段。**辅助元素** 等宽文件名 + 状态条。**强调** 面板内的语法色 珊瑚 / 青绿 / 琥珀；面板外一个珊瑚色标记（例如一个 `+`/`−` 行槽提示）。**固定** 暖海军蓝表面、等宽代码、细线。**可变** 用哪个 code-_ block、代码内容（来自 diff）、面板占多大。**密度** 密集。

### 4 · Number / Impact（数据 · 手法：超大数字 · 奶油色）

**底** `{colors.cream}`，`slide-pad`。**组成** kicker-spike、number-lockup、lead/caption、可选的 `section-rule`。**焦点** 一个带等宽单位的 EB Garamond `number-hero` 数字，下面一条 1px 线——PR 的影响（`+1,204 / −318`、`17 files`、`2.1× faster`）。**辅助元素** 等宽标签。**强调** 数字用墨色；最多一个珊瑚色单位。**固定** 衬线数字 + 等宽单位、细线。**可变** 数字（来自脚本）、标签、版式 + 密度。**密度** 自由。

### 5 · Pull-quote（引语 · 手法：EB Garamond 斜体 · 奶油色）

**底** `{colors.cream}`。**组成** kicker-spike、pull-quote、tag-upper 出处。**焦点** 一段 EB Garamond **斜体** `quote-pull`——一条 commit message、一句评审意见，或者核心论点——下方一行小号的 Inter 全大写出处（作者 · 身份）。**辅助元素** 等宽眉题。**强调** 无，或一个珊瑚色标记。**固定** EB Garamond 斜体引语 + 全大写出处。**可变** 引语、署名、版式 + 密度。**密度** 自由。

### 6 · Closing / CTA（收尾 · 手法：珊瑚色电压 · 奶油色或海军蓝）

**底** `{colors.cream}`（或 `{colors.navy}`）。**组成** display 收尾语、coral-callout、可选的贡献者行（`assets/<login>.png` 头像 + 等宽名字）。**焦点** 一句简短的 EB Garamond 收尾语，配上唯一的 **coral-callout**（CTA 或满版色带）；如果是"由谁发布"式的收尾，再加一排带细线圆环的头像片。**辅助元素** 等宽索引。**强调** 唯一的珊瑚色电压。**固定** 一个珊瑚色时刻、细线头像圆环、句首大写的衬线字。**可变** 收尾语、发布者是谁、版式 + 密度。**密度** 自由。

## 构图规则

### 要做

- 每一帧都立在**暖奶油色的地面**上；内容聚集在**深半档的 tile** 表面上。
- 所有展示字用 **EB Garamond、句首大写**、负字距；正文用 **Inter 400**；眉题（全大写、0.16em、珊瑚色 ✱）+ 代码用 **JetBrains Mono**。
- **珊瑚色按每帧一个时刻配给**——CTA、行内链接或满版色带，三者选一。
- 用 **1px 细线** + 最多一道柔和暖色阴影来抬升；**暖海军蓝**留给代码 / 终端表面。
- 以**一个清晰的焦点**领衔；用 **kicker-spike** 开启各个区域。内容需要多满就填多满。
- 每个数据都让 EB Garamond 数字配一个**等宽单位**；代码通过海军蓝表面上的 **`code-*` block** 渲染。

### 不要做

- 不用纯白，不用冷灰，不用纯黑；不要第四种品牌色相（海军蓝是结构性的，语法高亮色是装饰）。
- 不用厚重投影、发光、内容上的渐变或倾斜——只用细线抬升。
- EB Garamond 展示字不用全大写或标题式大写；不用无衬线标题；不用衬线标签；数字单位不用衬线字排。
- 一帧里不要出现两个珊瑚色时刻；珊瑚色绝不用来排标题或一段正文。
- 不要让标题超出版心宽度——把字号阶梯降一档。

## 宽高比适配

| 处理方式 | 16:9 | 9:16 | 1:1 |
| --- | --- | --- | --- |
| Cover | 展示字居左，索引在上 | 展示字在上，索引在下 | 展示字，索引在角落 |
| Statement | 一行居左 / 居中 | 竖向堆叠 | 居中 |
| Code Surface | 面板框在奶油色里 | 面板更高，行数更少 | 面板居中，方形 |
| Number/Impact | 数字居左 | 数字居中，更高 | 居中 |
| Pull-quote | 引语居左 | 引语竖向堆叠 | 居中 |
| Closing/CTA | 收尾语 + 头像行 | 收尾语在上，头像在下 | 居中，头像换行 |

`slide-pad` 在短边上保持不变；重新选择展示字的字号档位，不低于 1.4cqw 的下限。每种比例下，代码表面都保留细线 + 等宽辅助元素；头像行宁可换行，也不要缩到看不清。

## 已批准的真实实体

源文件里没有定义任何真实客户、logo 或供应商——任何此类标记都渲染成占位符。贡献者头像来自项目的 `assets/<login>.png`（从 PR 的人员关系图中暂存过来）；✱ 尖刺、细线和代码表面都是纯 CSS 实现，不需要外部图片。

## 数字与声明（硬规则）

绝不在帧尺度上编造数字、数据、diff 或计数。把槽位渲染成 `— figure —`、`{metric}`、`+N / −M`。number-lockup、代码面板和影响数据一直用占位符，直到脚本（来自 PR 的导入）提供真实数值为止。分支名、文件数和 `+/−` 总数都要能追溯到 diff；commit / issue 编号属于辅助元素。

## 渲染前自查

- **眯眼**——一个 EB Garamond 展示时刻占主导。
- **三位一体**——奶油色地面 + tile 台阶 + 墨色声音；珊瑚色恰好出现一次；暖海军蓝只用在代码表面上；没有冷灰 / 纯白 / 第四种色相。
- **字体**——EB Garamond 句首大写展示字（负字距）；Inter 400 正文；JetBrains Mono 眉题（全大写 0.16em，珊瑚色 ✱）+ 代码；下限 ≥1.4cqw。
- **深度**——1px 细线 + 最多一道柔和暖色阴影；没有厚重投影 / 发光 / 渐变 / 倾斜；圆角 6/8/12px。
- **代码**——代码由暖海军蓝表面上的 `code-*` block 渲染；语法色为珊瑚 / 青绿 / 琥珀；数字配等宽单位。
- **编造**——每个数字 / diff 都能追溯到 PR，否则用占位符。

## 已知缺口

- **动效有意不在范围内。** frame.md 只规定构图。Code editorial 的动效语域——短促的交叉溶解，没有过冲 / 回弹 / 弹性，珊瑚色是唯一的"描出"动画，数字逐步累加，代码逐行打出——写在工作流的 `motion-language.md` + `hyperframes-animation` 里，不在这里。
- **EB Garamond + Inter + JetBrains Mono 作为有授权的本地 WOFF2 素材随这个 preset 一起提供。** `build-frame.mjs` 会把 400 + 700 两个字重暂存到 `assets/fonts/`，并把精确的 `@font-face` 块追加到生成的 `frame.md` 里，这样 Studio、snapshot 和渲染都能离线解析这些字体，不需要首次运行时去拉 Google Fonts。展示字按**字重 400** 编写（700 读起来是厚重的粗体，偏离了语域），斜体就当作浏览器合成的倾斜（对引语的语域来说可以接受；只有当项目非常依赖斜体时，才加一个真正的斜体字面）。EB Garamond 是一款温暖的旧式衬线体（低对比、人文主义）；如果它加载失败，回退到 Georgia 或其他旧式衬线体——绝不回退到无衬线体。CJK：Noto Serif SC（展示）/ Noto Sans SC（正文）/ Noto Sans Mono CJK（代码）；衬线字掉了之后，句首大写的温暖感依然能撑住。
- **语法高亮色（青绿 `#5DB8A6` / 琥珀 `#E8A55A` / 状态色）是固定装饰**，在 §Colors（即「色彩」一节）中声明——它们不在可重混的 `colors:` 块里，所以品牌重混绝不会给它们重新上色。
- **代码本身是 `code-*` registry block**，不是这个 preset——这个 preset 只负责周围的暖海军蓝表面 + 等宽辅助元素。
- **9:16 / 1:1 只是指导**；按每种比例检查可读性下限，以及奶油色 / tile 的温暖感 + 只用一个珊瑚色的纪律是否守住。
