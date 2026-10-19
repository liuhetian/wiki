<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-creative/references/visual-styles.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 视觉风格库

为 HyperFrames 视频准备的、有名字的视觉身份。每种风格都植根于一个真实的平面设计传统，并以一个兼容 DESIGN.md 的 token 块来表达。把它们当作起点 —— 把 YAML 复制进你项目的 `design.md` frontmatter，再加以定制。

**如何挑选：** 先匹配情绪，其次才是内容。问自己：*「观众应该感受到什么？」*

**如何使用：** 把该风格的 YAML token 块复制进 `design.md` 的 frontmatter。再补上 `## Overview`、`## Colors`、`## Typography`、`## Elevation`、`## Components`、`## Do's and Don'ts` 这几个散文段落，文件就完整了。

## 目录

- 速查表
- Swiss Pulse
- Velvet Standard
- Deconstructed
- Maximalist Type
- Data Drift
- Soft Signal
- Folk Frequency
- Shadow Cut
- 情绪到风格对照
- 创建自定义风格

## 速查表

| 风格           | 情绪                  | 最适合                           | 转场 shader                 |
| --------------- | --------------------- | ---------------------------------- | --------------------------------- |
| Swiss Pulse     | 冷静、精确     | SaaS、数据、开发者工具、指标     | Cinematic Zoom 或 SDF Iris        |
| Velvet Standard | 高级、永恒     | 奢侈品、企业、主题演讲       | Cross-Warp Morph                  |
| Deconstructed   | 工业感、粗粝       | 科技发布、安全、朋克      | Glitch 或 Whip Pan                |
| Maximalist Type | 响亮、动感         | 重大公告、发布        | Ridged Burn                       |
| Data Drift      | 未来感、沉浸 | AI、ML、前沿科技          | Gravitational Lens 或 Domain Warp |
| Soft Signal     | 亲密、温暖        | 健康养生、个人故事、品牌  | Thermal Distortion                |
| Folk Frequency  | 文化感、鲜明       | 消费类应用、美食、社区   | Swirl Vortex 或 Ripple Waves      |
| Shadow Cut      | 暗黑、电影感       | 戏剧性揭示、安全、揭露 | Domain Warp                       |

---

## 1. Swiss Pulse — Josef Müller-Brockmann

**情绪：** 冷静、精确 | **最适合：** SaaS 仪表盘、开发者工具、API、指标

```yaml
name: Swiss Pulse
colors:
  primary: "#1a1a1a"
  on-primary: "#ffffff"
  accent: "#0066FF"
typography:
  headline:
    fontFamily: Helvetica Neue
    fontSize: 5rem
    fontWeight: 700
  label:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
  stat:
    fontFamily: Helvetica Neue
    fontSize: 7rem
    fontWeight: 700
rounded:
  none: 0px
  sm: 2px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
motion:
  energy: high
  easing:
    entry: "expo.out"
    exit: "power4.in"
    ambient: "none"
  duration:
    entrance: 0.4
    hold: 1.5
    transition: 0.6
  atmosphere:
    - grid-lines
    - registration-marks
  transition: cinematic-zoom
```

锁定在网格上的构图。每个元素都吸附到一个看不见的 12 栏网格上。数字以 80–120px 主导画面。动画计数器从 0 开始往上数。硬切，没有装饰性转场。没有任何东西是漂浮的。

---

## 2. Velvet Standard — Massimo Vignelli

**情绪：** 高级、永恒 | **最适合：** 奢侈品、企业软件、主题演讲、投资人路演 deck

```yaml
name: Velvet Standard
colors:
  primary: "#0a0a0a"
  on-primary: "#ffffff"
  accent: "#1a237e"
typography:
  headline:
    fontFamily: Inter
    fontSize: 3rem
    fontWeight: 300
    letterSpacing: 0.15em
    textTransform: uppercase
  body:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 300
    lineHeight: 1.6
rounded:
  sm: 0px
  md: 2px
spacing:
  sm: 16px
  md: 32px
  lg: 64px
motion:
  energy: calm
  easing:
    entry: "sine.inOut"
    exit: "power1.in"
    ambient: "sine.inOut"
  duration:
    entrance: 1.2
    hold: 3.0
    transition: 1.5
  atmosphere:
    - subtle-grain
    - hairline-rules
  transition: cross-warp-morph
```

大量留白。对称、居中、建筑般的精确。细的无衬线体，全大写（ALL CAPS），宽字距。依次揭示，长时间停留。没有任何东西是「吸附」的 —— 一切都带着意图滑行。奢华从不着急。

---

## 3. Deconstructed — Neville Brody

**情绪：** 工业感、粗粝 | **最适合：** 科技新闻、开发者产品发布、安全产品、朋克能量的揭示

```yaml
name: Deconstructed
colors:
  primary: "#1a1a1a"
  on-primary: "#f0f0f0"
  accent: "#D4501E"
typography:
  headline:
    fontFamily: Space Grotesk
    fontSize: 4rem
    fontWeight: 700
  label:
    fontFamily: Space Mono
    fontSize: 0.75rem
    fontWeight: 700
    textTransform: uppercase
rounded:
  none: 0px
spacing:
  sm: 4px
  md: 12px
  lg: 24px
motion:
  energy: high
  easing:
    entry: "back.out(2.5)"
    exit: "steps(8)"
    ambient: "elastic.out(1.2, 0.4)"
  duration:
    entrance: 0.3
    hold: 1.0
    transition: 0.5
  atmosphere:
    - scan-lines
    - glitch-artifacts
    - grain-overlay
  transition: glitch
```

文字倾斜摆放、边缘相互重叠、冲出画框。粗重的工业感字重。粗砺的质感：扫描线效果、故障瑕疵直接融进设计里。文字 SLAMS（砸入）、SHATTERS（碎裂）。字母先乱码再吸附到最终位置。刻意的不规则 —— 没有任何东西应该显得精致打磨过。

---

## 4. Maximalist Type — Paula Scher

**情绪：** 响亮、动感 | **最适合：** 重大产品发布、里程碑公告、高能量的造势视频

```yaml
name: Maximalist Type
colors:
  primary: "#0a0a0a"
  on-primary: "#ffffff"
  accent-red: "#E63946"
  accent-yellow: "#FFD60A"
typography:
  headline:
    fontFamily: Anton
    fontSize: 8rem
    fontWeight: 400
    textTransform: uppercase
  subhead:
    fontFamily: Space Grotesk
    fontSize: 3rem
    fontWeight: 700
rounded:
  none: 0px
spacing:
  sm: 0px
  md: 8px
motion:
  energy: high
  easing:
    entry: "expo.out"
    exit: "back.out(1.8)"
    ambient: "power3.out"
  duration:
    entrance: 0.3
    hold: 0.8
    transition: 0.4
  atmosphere:
    - type-layers
    - color-blocks
  transition: ridged-burn
```

文字**就是**（IS）画面。不同尺寸、不同角度的文字层相互重叠，填满画面的 50–80%。大胆的高饱和色 —— 最大对比度。一切都在动：砸入、滑动、缩放。2–3 秒一个的快速连发场景。没有静止的时刻。快速到达，硬性停住。

---

## 5. Data Drift — Refik Anadol

**情绪：** 未来感、沉浸 | **最适合：** AI 产品、ML 平台、数据公司、前瞻性科技

```yaml
name: Data Drift
colors:
  primary: "#0a0a0a"
  on-primary: "#e0e0e0"
  accent-purple: "#7c3aed"
  accent-cyan: "#06b6d4"
typography:
  headline:
    fontFamily: Inter
    fontSize: 2.5rem
    fontWeight: 200
    letterSpacing: 0.05em
  body:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 300
rounded:
  sm: 4px
  md: 12px
  full: 9999px
spacing:
  sm: 16px
  md: 32px
  lg: 64px
motion:
  energy: moderate
  easing:
    entry: "sine.inOut"
    exit: "power2.out"
    ambient: "sine.inOut"
  duration:
    entrance: 1.0
    hold: 2.5
    transition: 1.5
  atmosphere:
    - particle-field
    - light-traces
    - radial-glow
  transition: gravitational-lens
```

细的未来感无衬线体 —— 漂浮、失重、极简。流动变形的构图。极端的尺度变化（微观 → 宏观）。粒子凝聚成数字。光线描绘出穿过画面的数据路径。平滑、连续、有机。没有任何生硬的东西。

---

## 6. Soft Signal — Stefan Sagmeister

**情绪：** 亲密、温暖 | **最适合：** 健康养生品牌、个人故事、生活方式产品、以人为本的应用

```yaml
name: Soft Signal
colors:
  primary: "#FFF8EC"
  on-primary: "#2a2a2a"
  accent-amber: "#F5A623"
  accent-rose: "#C4A3A3"
  accent-sage: "#8FAF8C"
typography:
  headline:
    fontFamily: Playfair Display
    fontSize: 3rem
    fontWeight: 400
    fontStyle: italic
  body:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 300
    lineHeight: 1.7
rounded:
  sm: 8px
  md: 16px
  lg: 24px
  full: 9999px
spacing:
  sm: 12px
  md: 24px
  lg: 48px
motion:
  energy: calm
  easing:
    entry: "sine.inOut"
    exit: "power1.inOut"
    ambient: "sine.inOut"
  duration:
    entrance: 1.0
    hold: 3.0
    transition: 1.5
  atmosphere:
    - soft-gradient
    - warm-grain
  transition: thermal-distortion
```

手写风格或人文主义衬线字体。私人、小写、细腻。特写式取景：单个元素填满画面。缓慢地游移和漂浮，从不吸附。柔和的有机运动。没有任何东西应该显得仓促或精致打磨过。亲密，绝不企业化。

---

## 7. Folk Frequency — Eduardo Terrazas

**情绪：** 文化感、鲜明 | **最适合：** 消费类应用、美食平台、社区产品、节庆式发布

```yaml
name: Folk Frequency
colors:
  primary: "#ffffff"
  on-primary: "#1a1a1a"
  accent-pink: "#FF1493"
  accent-blue: "#0047AB"
  accent-yellow: "#FFE000"
  accent-green: "#009B77"
typography:
  headline:
    fontFamily: Fredoka One
    fontSize: 4rem
    fontWeight: 400
  body:
    fontFamily: Nunito
    fontSize: 1rem
    fontWeight: 600
rounded:
  sm: 8px
  md: 16px
  lg: 32px
  full: 9999px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
motion:
  energy: high
  easing:
    entry: "back.out(1.6)"
    exit: "elastic.out(1, 0.5)"
    ambient: "sine.inOut"
  duration:
    entrance: 0.5
    hold: 1.5
    transition: 0.8
  atmosphere:
    - pattern-tiles
    - confetti-burst
    - color-blocks
  transition: swirl-vortex
```

粗壮、温暖的圆润字体。图案与重复 —— 民间艺术的节奏和密度。层次丰富、视觉质感浓厚的构图。每一帧都有手工制作的感觉。多彩的运动：元素欢快地弹跳、蹦出、旋转着就位。过冲显得是有意为之。欢庆的能量。

---

## 8. Shadow Cut — Hans Hillmann

**情绪：** 暗黑、电影感 | **最适合：** 安全产品、戏剧性揭示、调查类内容、强烈的发布

```yaml
name: Shadow Cut
colors:
  primary: "#0a0a0a"
  on-primary: "#f0f0f0"
  surface: "#3a3a3a"
  accent: "#C1121F"
typography:
  headline:
    fontFamily: Oswald
    fontSize: 4rem
    fontWeight: 700
    textTransform: uppercase
  body:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
rounded:
  none: 0px
  sm: 2px
spacing:
  sm: 8px
  md: 16px
  lg: 48px
motion:
  energy: moderate
  easing:
    entry: "power3.out"
    exit: "power4.in"
    ambient: "sine.inOut"
  duration:
    entrance: 0.8
    hold: 2.5
    transition: 1.2
  atmosphere:
    - deep-shadow
    - vignette
    - grain-overlay
  transition: domain-warp
```

近乎单色：深黑、冷灰、刺眼的白 + 一抹血红强调色。像黑色电影片名卡那样锐利、棱角分明的文字。强烈的对比，没有柔和。元素从黑暗中浮现 —— 揭示本身就是叙事。缓慢逼近的推镜，戏剧性的尺度揭示。重击之前的停顿很重要。Domain Warp 在下一个场景之前把现实溶解掉。

---

## 情绪 → 风格对照

| 如果内容给人的感觉是……            | 就用……          |
| ---------------------------------- | --------------- |
| 数据驱动、分析性、技术性 | Swiss Pulse     |
| 高级、企业、奢侈        | Velvet Standard |
| 粗粝、朋克、激进、叛逆  | Deconstructed   |
| 造势、响亮、高能量的发布     | Maximalist Type |
| AI、ML、前瞻性、未来感    | Data Drift      |
| 人性、温暖、私人、健康养生    | Soft Signal     |
| 文化感、有趣、消费类、节庆   | Folk Frequency  |
| 暗黑、戏剧性、强烈、电影感 | Shadow Cut      |

---

## 创建自定义风格

这 8 种风格只是起点 —— 不是约束。创建你自己的：

1. **给它起名**，以一位设计师、一个艺术运动或一个文化参照命名
2. **写 YAML token** —— `colors`（2–5 个 token）、`typography`（2–3 个层级）、`rounded`、`spacing`、`motion`（energy + easing + duration + atmosphere + transition）
3. **加上散文** —— 一段话，描述感觉、要做什么、要避免什么
4. **token 引用** —— 在组件定义里使用 `{colors.accent}`、`{typography.headline}`

模式是：**YAML token（是什么）→ 散文理由（为什么）→ 组件（它们如何组合）。**
