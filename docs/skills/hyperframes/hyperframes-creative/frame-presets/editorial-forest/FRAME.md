---
version: alpha
name: Editorial Forest — Frame (video / frame layer)
description: >
  Video-first companion to Editorial Forest's design.md. The unit is the frame (1920×1080). Atoms
  are identical and sacred — the green/pink/cream editorial triad, Source Serif 4 at weight 500
  (optical-size axis) for all display + JetBrains Mono 500 uppercase chrome, flat paper depth (no
  shadows), 2px hairline rules, 6/8px card radii, and the monogram circle stamp. Composition + frame
  scale rewritten. Motion out of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  green: "#2e4a2a"
  green-deep: "#243a21"
  green-lite: "#3a5a36"
  pink: "#e89cb1"
  pink-deep: "#d27e96"
  cream: "#efe7d4"
  cream-2: "#e6dcc4"
  ink: "#1a1a17"

typography:
  # — reading + chrome ramp —
  body:    { fontFamily: "Source Serif 4", cqw: 1.56, weight: 400, lineHeight: 1.38 }
  body-card: { fontFamily: "Source Serif 4", cqw: 1.35, weight: 400, lineHeight: 1.34 }
  label:   { fontFamily: "JetBrains Mono", px: 26, cqw: 1.35, weight: 500, tracking: "0.18em", upper: true }
  caption-mono: { fontFamily: "JetBrains Mono", px: 24, cqw: 1.25, weight: 500, tracking: "0.14em", upper: true }
  # — display ramp (Source Serif 4 weight 500, opsz, negative tracking) —
  title-card-sm: { fontFamily: "Source Serif 4", cqw: 2.9, weight: 500, lineHeight: 0.98, tracking: "-0.01em" }
  title-card: { fontFamily: "Source Serif 4", cqw: 3.5, weight: 500, lineHeight: 0.96, tracking: "-0.01em" }
  headline: { fontFamily: "Source Serif 4", cqw: 4.4, weight: 500, lineHeight: 1.0, tracking: "-0.02em" }
  headline-xl: { fontFamily: "Source Serif 4", cqw: 5.0, weight: 500, lineHeight: 0.96, tracking: "-0.02em" }
  display: { fontFamily: "Source Serif 4", cqw: 7.3, weight: 500, lineHeight: 1.02, tracking: "-0.02em" }
  display-hero: { fontFamily: "Source Serif 4", cqw: 11.5, weight: 500, lineHeight: 0.92, tracking: "-0.02em" }
  stat-figure: { fontFamily: "Source Serif 4", cqw: 11.5, weight: 500, lineHeight: 0.92, tracking: "-0.03em" }
  stat-figure-unit: { fontFamily: "Source Serif 4", cqw: 5.7, weight: 500, lineHeight: 0.92 }
  name:    { fontFamily: "Source Serif 4", cqw: 2.3, weight: 600, lineHeight: 1.0 }

spacing:
  slide-pad: "5cqw"
  rule: "2px"
  rule-card: "2.5px"
  radius-card: "6px"
  radius-step: "8px"

components:
  topbar:
    typography: "{typography.label} (JetBrains Mono) + monogram-circle or counter"
    placement: "top edge, label left, mark right"
    description: "On EVERY frame — the system's spine; a frame without it reads untreated."
  footline:
    typography: "{typography.caption-mono} ×2, space-between"
    placement: "absolute bottom edge"
    description: "On cover/data/summary frames."
  monogram-circle:
    border: "2px solid {colors.pink}"
    rounded: "50%"
    size: "130px"
    typography: "mono monogram"
    description: "The identity stamp. Cover/summary only."
  topic-tile:
    backgroundColor: "{colors.green} (pink text) / {colors.pink} (green-deep) / {colors.green-lite} (pink) / {colors.cream-2} + 2px {colors.green} border (green)"
    rounded: "{spacing.radius-card}"
    shadow: "none"
    typography: "{typography.caption-mono} ordinal + {typography.title-card-sm} + mono foot"
    description: "Fills rotate; never repeat one across a grid."
  step-tile:
    backgroundColor: "{colors.cream} + green border / {colors.green} / {colors.pink}"
    border: "2.5px solid"
    rounded: "{spacing.radius-step}"
    typography: "mono ordinal + {typography.title-card} + {typography.body-card} + mono marker over a top rule"
    description: "Framework/process card."
  kpi-block:
    typography: "{typography.caption-mono} tag → {typography.stat-figure} (+{typography.stat-figure-unit}) → {typography.body}"
    rule: "2px accent rule above"
    description: "Oversized serif figure."
  meta-dl:
    borderTop: "2px solid {colors.green}"
    typography: "{typography.caption-mono} dt + {typography.meta-value} dd"
    description: "3-column dt/dd grid."
  bar:
    backgroundColor: "{colors.pink} / {colors.cream} / {colors.green}"
    rounded: "3px 3px 0 0"
    size: "56px wide"
    typography: "mono value above"
    description: "Vertical chart bar."
  rule-thin:
    rule: "2px solid (green on cream / pink on green / green-deep on pink)"
    description: "The only separator. Never 1px, never 3px+."
---

# Editorial Forest — Frame (video / frame layer)

## 概述

放到 frame 尺度上，Editorial Forest 是一套**以衬线体为主导的文学编辑式系统** —— 调性像一本企鹅经典（Penguin classic）或一份安静的年报。一个笃定的声音 ——**Source Serif 4 字重 500**（启用光学尺寸轴）—— 承载所有标题和数据，最大到约 12cqw；字重 500 全大写的 **JetBrains Mono** 是编辑式的装饰框架（chrome）（标签、说明文字、坐标轴刻度、底栏）。三种底面 —— 森林绿、灰玫粉、燕麦奶油色 —— 此外别无其他。纵深是**扁平的、纸质的**：没有阴影，没有渐变；层次靠色块对比 + 2px 细线 + 描边对比填充来表达。

最不会认错的标志是**字重 500**（display 绝不用 400，也绝不用 700）以及 **mono / 衬线的角色倒置**（mono 用于装饰框架，衬线用于正文和 display）。正文降到衬线字重 400 —— 这一步 500→400 就是阅读的节奏。每一帧都带一条 mono 顶栏；字母组合圆章（monogram circle）是身份印记。

**frame 尺度下的关键特征：**

- **绿 / 粉 / 奶油三色组** —— 每帧通常两种底面色调，三种就嫌吵了。
- 所有 display 用 **Source Serif 4 字重 500**（opsz，负字距）；正文用**衬线 400**；装饰框架用 **JetBrains Mono 500** 全大写。
- **扁平 —— 没有阴影，没有渐变**；层次靠色块 + 2px 细线 + 描边对比填充。
- **2px 细线**是唯一的分隔物（step 卡片上用 2.5px）；卡片圆角 6/8px；字母组合圆章是唯一的正圆。
- **每一帧都有顶栏**（mono 标签 + 字母组合章 / 计数器）；数据帧 / 封面帧加底栏。
- **疏朗而果断** —— 每帧一个主体，置于大片留白中；元素更少、尺寸更大。

## 帧

### 帧工艺标准

在任何结构检查之前，每一帧都要先过三项目测闸门：

- **眯眼** —— 有一处 Source Serif 4 的时刻占主导，是相邻元素的 3–6 倍；底面色块把视线集中过去。
- **静默** —— 每帧一个主体，置于大片留白中；**topic-tile 和 step 网格是唯一的密集例外**。
- **克制** —— 每帧**最多两种底面色调**（三种就吵了）；衬线 display 用**字重 500**、正文用 **400**；绿色底只留给分量重的时刻。
- **参照** —— 目标是**企鹅经典 / 安静的年报 / 艺术画册跨页**；失败的样子是**带阴影的多色网页仪表盘**。

- **主尺寸：** 1920×1080（16:9）。display 用 **`cqw`** 编写（`px ÷ 1920 × 100 = cqw`）。
- **竖屏：** 1080×1920（9:16）。**方形：** 1080×1080（1:1）。
- **安全区：** `slide-pad` 5cqw（即源设计里宽裕的 96–140px）；顶栏 / 底栏都在它里面。

**容器法则（承重规则）。** 每个帧底都设置 `container-type: size`；所有相对帧的单位都是相对它的 `cqw`/`cqh` —— 绝不用 `vw`（源设计是固定的 1920 画布，所以它的 px 可以干净地换算：`px ÷ 1920 × 100`）。细线保持 2px；卡片圆角保持 6/8px。

## 颜色

token 与源设计完全一致。内容帧默认底色 `{colors.cream}`；封面 / 声明 / 总结这类有分量的帧用 `{colors.green}`。**标题：** 奶油底上用绿，绿底上用奶油色（hero 尺度时可用粉），粉底上用 green-deep。**正文：** 奶油底上用 ink，绿底上用奶油色，粉底上用 green-deep。标签 / 分隔线取所在区域的强调色（绿底上用粉，奶油底上用绿，粉底上用 green-deep）。卡片填充按 绿 / 粉 / green-lite / 带绿描边的 cream-2 轮换。**没有第四个色系** —— 三色组加上它们的近似色就是全部色板；底面上绝不用 `rgba` 透明。

## 字体排印

两条字号阶梯。**阅读 / 装饰框架阶梯**（Source Serif 4 **400** 正文 1.56cqw；JetBrains Mono 标签用 px）承载文案和装饰框架；**display 阶梯**（Source Serif 4 **500**，从 `title-card-sm` 2.9cqw → `display-hero`/`stat-figure` 11.5cqw，opsz，负字距）承载每一个标题和数字。

- **可读性下限：** 任何承载信息的文字行 ≥ **1.4cqw**；mono 的 px 标签只用作装饰框架。
- **按长度定尺寸：** 根据标题长短确定字号。文字块上限 **≤ 78cqw**；≤3 个词 → `display-hero`；4–6 个 → `headline-xl`；7 个以上 → `headline`。7.3–11.5cqw 这一档留给声明 / 数据 / 封面。
- **衬线 display 用字重 500，正文用 400**（这就是节奏），600 只用于署名人名。负字距（−0.01..−0.03em），紧凑行高（0.92–1.02）。**mono 全大写，0.08–0.18em。** 不用斜体，不用下划线，不用第三种字体，正文衬线不用 500。

## 纵深与底面

扁平、纸质。层次来自：

- **色块对比** —— 奶油底上的一块绿色卡片，靠墨色色块的分离显得抬起。
- **2px 细线** —— 用所在区域强调色画的分区分隔线。
- **描边对比填充** —— cream-2 卡片 + 2px 绿描边，和实色卡片读起来是不同的层级。

**上限：** 零阴影（完全没有 —— 加上 `box-shadow` 就会打碎纸质感），没有渐变，没有辉光；底面都是纸上实墨。

## 形状

- topic 卡片 **6px**，step 卡片 **8px**，图例色块 **2px**，柱顶 **3px 3px 0 0**，字母组合圆章 **50%**。不用直角，不用大圆角。

## 组件

- **topbar**（脊柱）+ **footline** + **monogram-circle**（身份印记）—— 装饰框架这一套。
- **topic-tile**（6px，轮换填充）/ **step-tile**（8px，2.5px 描边）—— 目录与框架类图式。
- **kpi-block**（超大衬线数字）/ **meta-dl**（3 列，2px 分隔线）/ **bar** / **rule-thin** —— 数据与结构。

## 帧处理方式

> 配方：底 · 容器 · 组成 · 焦点 · 装饰框架 · 强调 · 静默 · 固定/自由 · 密度。
> 每一帧都有顶栏；每帧一个主体，置于大片留白中。

### 1 · 封面（身份 · 手法：超大衬线 · 绿 · 居左）

**底** `{colors.green}`，`slide-pad`。**组成** topbar（mono 标签 + monogram-circle）、display-hero、正文引语、footline。**焦点** 一段两行的 Source Serif 4 `display-hero`，粉色（其中一个词用奶油色），居左。**装饰框架** mono 顶栏；mono 底栏。**强调** 粉色 display + 字母组合圆章。**静默** 约 50%。**固定** 衬线 500，扁平，字母组合章 2px 粉色。**自由** 标题文字，哪个词用奶油色。**密度** 低。

### 2 · 主题卡片（目录 · 手法：轮换填充网格 · 奶油 · 那个密集帧）

**底** `{colors.cream}`，`slide-pad`。**组成** topbar、headline-xl、3–4 个 topic-tile。**焦点** 一排 6px 卡片，填充按 绿 / 粉 / 带描边的 cream-2 轮换，每张是一个 mono 序号 + 衬线标题。**装饰框架** mono 顶栏。**强调** 卡片填充（4 种里混用 3 种，绝不重复同一种）。**静默** 紧凑 —— 这是密度例外。**固定** 6px 圆角，轮换填充，无阴影。**自由** 卡片标题，用哪几种填充。**密度** 密集例外。

### 3 · KPI 数据（数据 · 手法：超大数字 · 绿）

**底** `{colors.green}`，`slide-pad`。**组成** topbar、kpi-block（mono 标签 + 220px stat-figure + 衬线描述）、footline。**焦点** 一个 Source Serif 4 `stat-figure`（约 11.5cqw，带单位），粉色，压在一条 2px 粉色分隔线上方。**装饰框架** mono 顶栏 + 底栏。**强调** 粉色数字。**静默** 约 55%。**固定** 衬线 500 数字，2px 强调色分隔线，扁平。**自由** 数字（来自脚本）、标签、描述。**密度** 低。

### 4 · 声明（引语 · 手法：display 衬线 · 奶油 · 居左）

**底** `{colors.cream}`，宽裕的内边距。**组成** topbar、display、name（600）、caption-mono 职务。**焦点** 一段两行的 Source Serif 4 `display`（约 7.3cqw），绿色；下方是字重 600 的署名人名 + mono 职务。**装饰框架** mono 顶栏。**强调** 无 —— 由衬线体撑起。**静默** 约 55%。**固定** 只用衬线 500 display + 600 人名，不用斜体。**自由** 引语、人名、职务。**密度** 低。

### 5 · 步骤框架（流程 · 手法：8px step 卡片 · 奶油/绿）

**底** `{colors.cream}`（或绿），`slide-pad`。**组成** topbar、headline、3–4 个 step-tile。**焦点** 一排 8px step 卡片（2.5px 描边）—— mono 序号 + 衬线 68px 标题 + 正文 + 顶部分隔线上方的 mono 标记；填充按 带绿描边的奶油 / 绿 / 粉 轮换。**强调** 卡片填充。**静默** 适中。**固定** 8px 圆角，2.5px 描边，mono 标记。**自由** 步骤内容，填充。**密度** 标准。

### 6 · 图表（数据 · 手法：柱 + 元信息 · 绿）

**底** `{colors.green}`，`slide-pad`。**组成** topbar、headline、柱 + 2px 坐标轴线、meta-dl。**焦点** 56px 的粉 / 奶油 / 绿色柱，立在内侧边缘的 2px 线上，配 mono 刻度；下方可选一个 3 列 meta-dl。**装饰框架** mono 顶栏。**强调** 柱的填充。**静默** 适中。**固定** 56px 柱，3px 柱顶圆角，2px 坐标轴，mono 刻度。**自由** 数值（来自脚本），标签。**密度** 标准。

## 构图规则

### 要做

- 所有 display 都用 **Source Serif 4 字重 500**，opsz，负字距，紧凑行高；**正文用 400**。
- 所有标签 / 说明文字 / 坐标轴 / 底栏都用 **JetBrains Mono 500 全大写，0.08–0.18em**。
- 每一帧都给一条 **topbar**（mono 标签 + 字母组合章或计数器）；数据帧 / 封面帧加 footline。
- **每帧选一个主导底面**（最多两种色调）；**卡片填充要轮换**，同一网格里绝不重复同一种。
- 用所在区域强调色的 **2px 细线**分隔各区；字母组合圆章只留给封面 / 总结。
- 声明 / 数据 / 封面帧大胆放大 display（7.3–11.5cqw）；偏左、编辑式排布，每帧一个主体。

### 不要做

- 不用 box-shadow、渐变或辉光 —— 只用扁平的纸质纵深。
- 不用第三种字体；不用斜体 / 下划线；正文衬线不用 500；mono 不用到标题尺寸。
- 不用第四个色系；底面不用 `rgba`；不用 1px 或 4px 以上的分隔线（只用 2px / 2.5px）。
- 不要放两个互相竞争的内容块；不要省掉顶栏。
- 不要让标题顶满左右两边 —— 往下降一档字号。

## 画幅比例下的表现

| 处理方式       | 16:9                             | 9:16                        | 1:1                      |
| -------------- | -------------------------------- | --------------------------- | ------------------------ |
| 封面           | display 居左，字母组合章在右上 | display 在上，字母组合章在下 | display，字母组合章在角落 |
| 主题卡片       | 横排 3–4 个                      | 竖向堆叠                    | 2×2                      |
| KPI 数据       | 数字居左                         | 数字居中，更高              | 居中                     |
| 声明           | 引语居左                         | 引语堆叠                    | 居中                     |
| 步骤框架       | 横排 3–4 个                      | 竖向堆叠                    | 2×2                      |
| 图表           | 柱 + 元信息                      | 柱更高，元信息堆叠          | 方形图表                 |

`slide-pad` 按短边保持；重新调整 display 的字号档位，保持在 1.4cqw 下限之上。顶栏在每种比例下都横跨顶部；字母组合章可以挪到一个角落。

## 获准使用的真实实体

源设计里没有定义任何真实客户、logo 或供应商 —— 任何这类标记都渲染成占位符。字母组合章、底栏文字和卡片计数器承载每套 deck 自己的身份；数字属于内容。

## 数字与声明（硬规则）

在 frame 尺度上绝不编造数字、KPI、日期或计数。占位写成 `— figure —`、`{metric}`、`— %`。KPI 块、柱和元信息的值尤其要保持占位，直到脚本提供真实数值。期号 / 计数器只是装饰性的框架元素。

## 渲染前自检

- **眯眼** —— 有一处衬线时刻占主导；底面色块把视线集中过去。
- **静默** —— 每帧一个主体，置于大片留白中；只有 topic-tile / step 网格是密集的。
- **三色组** —— 最多两种底面色调；标题 / 正文 / 标签按各底面使用正确的颜色；没有第四个色系。
- **字体** —— Source Serif 4 **500** display（opsz，负字距）/ **400** 正文；mono 全大写 0.08–0.18em；≥1.4cqw 下限。
- **纵深** —— 0 阴影，0 渐变；2px 细线；6/8px 圆角；字母组合章是唯一的正圆。
- **装饰框架** —— 每一帧都有顶栏；数据帧 / 封面帧有底栏。
- **编造** —— 每个数字都能追溯到脚本，否则用占位符。

## 已知缺口

- **动效有意不在范围内。** frame.md 只规定构图；源设计靠 `deck-stage.js` 做缩放 / 导航，没有转场规范。
- **Source Serif 4（opsz 8..60）+ JetBrains Mono 通过 Google Fonts 引入** —— 光学尺寸轴很关键；不支持 opsz 的回退字体会把随尺寸变化的字形压平。CJK：LXGW WenKai（display）/ Noto Serif SC（正文）/ Noto Sans Mono CJK（装饰框架）。
- **9:16 / 1:1 只是指导**；要核实每种比例下下限仍然满足、两色调纪律仍然成立。
- 柱、细线、卡片和字母组合圆章都是纯 CSS；不需要任何外部图片。
- **对比度：** 粉底绿字 / 绿底粉字只在 display 尺度（84px 以上）使用；小字保持绿底奶油字或奶油底墨色字。
