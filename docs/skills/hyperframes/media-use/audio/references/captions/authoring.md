<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/audio/references/captions/authoring.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 字幕

<!-- registry-items: allow=max-width,data-composition-src,hyperframes-registry,blend-mode,caption-style,font-family -->

**registry 里有什么，以实时搜索为准。** 下面的表格是人工维护的样本，按设计就覆盖不全：在得出 registry 缺少某样东西的结论之前，先运行 `npx hyperframes catalog --query "<what you want>" --json`——它不需要安装任何东西。这里的条目名称会由 `bun run lint:skills` 对照 `registry/registry.json` 进行检查。

编写之前：确认转写稿来自正确的 Whisper 模型。CLI 默认的 `small.en` 会悄悄把非英语音频翻译成英语——见 [`../transcribe.md`](../transcribe.md) → "语言规则"，以及 [`transcript-handling.md`](transcript-handling.md) 中必做的质量检查。

分析口播内容来决定字幕样式。如果用户指定了样式，就用那个。否则，从转写稿中判断语气。

## 转写稿来源

```json
[
  { "id": "w0", "text": "Hello", "start": 0.0, "end": 0.5 },
  { "id": "w1", "text": "world.", "start": 0.6, "end": 1.2 }
]
```

`id`（`w0`、`w1`、…）是逐词覆盖时使用的稳定引用，由 `hyperframes transcribe` 添加。为了向后兼容手写的转写稿，它是可选的。它是如何产生的，见 [`../transcribe.md`](../transcribe.md) → "输出结构"；使用前的清理见 [`transcript-handling.md`](transcript-handling.md)。

## 样式判断（未指定样式时）

选择之前先读完整份转写稿。四个维度：

**1. 视觉感受** —— 企业→简洁；有活力→大胆；讲故事→优雅；技术→精确；社交→俏皮。

**2. 色板** —— 深色底 + 亮色表现活力；低饱和表现专业；高对比追求清晰；只用一种强调色。

**3. 字体情绪** —— 粗重 / 窄体追求冲击力；干净的无衬线体显得现代；圆体显得友好；衬线体显得优雅。

**4. 动画性格** —— scale-pop 表现有力；柔和淡入表现平静；逐词出现表现强调；打字机表现技术感。

## 逐词样式

扫一遍，找出值得单独处理的词：

- **品牌 / 产品名** —— 更大的字号，独特的颜色
- **全大写的词** —— 放大、闪烁、强调色
- **数字 / 统计数据** —— 粗字重、强调色
- **情绪关键词** —— 夸张的动画（过冲、弹跳）
- **行动号召** —— 高亮、下划线、颜色跳出
- **马克笔高亮** —— 用于颜色之外的强调（高亮扫过、圈出、迸发、潦草涂画、划掉），见 `hyperframes-animation/rules/css-marker-patterns.md`。

## 脚本语气到样式的映射

| 语气 | 字体情绪 | 动画 | 颜色 | 字号 |
| ------------ | ------------------------ | ---------------------------------- | --------------------------- | ------- |
| 造势 / 发布 | 粗重窄体，800-900 | Scale-pop，back.out(1.7)，0.1-0.2s | 深色底上的亮色 | 72-96px |
| 企业 | 干净的无衬线体，600-700 | 淡入 + 滑动，power3.out，0.3s | 白色 / 中性色，低饱和强调色 | 56-72px |
| 教程 | 等宽 / 干净的无衬线体，500-600 | 打字机 / 淡入，0.4-0.5s | 高对比，极简 | 48-64px |
| 讲故事 | 衬线 / 优雅字体，400-500 | 慢速淡入，power2.out，0.5-0.6s | 温暖的低饱和色调 | 44-56px |
| 社交 | 圆体无衬线，700-800 | 弹跳，elastic.out，逐词 | 俏皮，彩色药丸底 | 56-80px |

## 分词成组

- **高能量：** 2-3 个词。快速切换。
- **对话式：** 3-5 个词。自然的短语。
- **沉稳 / 平静：** 4-6 个词。更长的组。

在句子边界、150ms 以上的停顿处或达到最大词数时断开。

## 定位

- **横屏（1920x1080）：** 距底部 80-120px，水平居中
- **竖屏（1080x1920）：** 中下部，距底部约 600-700px，水平居中
- 绝不遮挡人物的脸
- `position: absolute`——绝不用 relative
- 同一时间只显示一个字幕组

## 防止文字溢出

使用 `window.__hyperframes.fitTextFontSize()`：

```js
var result = window.__hyperframes.fitTextFontSize(group.text.toUpperCase(), {
  fontFamily: "Outfit",
  fontWeight: 900,
  maxWidth: 1600,
});
el.style.fontSize = result.fontSize + "px";
```

选项：`maxWidth`（横屏 1600，竖屏 900）、`baseFontSize`（78）、`minFontSize`（42）、`fontWeight`、`fontFamily`、`step`（2）。

CSS 安全网：容器上的 `max-width`、`overflow: visible`（**不要**用 `hidden`——hidden 会裁掉被放大的强调词和辉光效果）、`position: absolute`、显式的 `height`。当逐词样式用到 `scale > 1.0` 时，计算 `maxWidth = safeWidth / maxScale`，留出余量。

**容器模式：** 全宽的绝对定位容器，内容居中。**不要**用 `left: 50%; transform: translateX(-50%)`——会导致在 composition 边缘被裁切。

## 字幕退场保证

每个字幕组在退场动画之后都**必须**有一次硬性清除：

```js
tl.to(groupEl, { opacity: 0, scale: 0.95, duration: 0.12, ease: "power2.in" }, group.end - 0.12);
// `tl.set` is an instant flip, not a tween — safe to set `visibility` here (core's "no animating
// visibility" rule applies to tweens, which can't smoothly interpolate non-numeric values anyway).
tl.set(groupEl, { opacity: 0, visibility: "hidden" }, group.end);
```

构建好 timeline 之后做自检——放在 `window.__timelines[id] = tl` **之前**，这样它会在 composition 初始化时运行：

```js
GROUPS.forEach(function (group, gi) {
  var el = document.getElementById("cg-" + gi);
  if (!el) return;
  tl.seek(group.end + 0.01);
  var computed = window.getComputedStyle(el);
  if (computed.opacity !== "0" && computed.visibility !== "hidden") {
    console.warn(
      "[caption-lint] group " + gi + " still visible at t=" + (group.end + 0.01).toFixed(2) + "s",
    );
  }
});
tl.seek(0);
```

## 预置的字幕 component

在从零开始构建字幕样式之前，先查一下 registry——15 个开箱即用的字幕 component 覆盖了最常见的样式。用 `npx hyperframes add <name>` 安装，并通过 `data-composition-src` 作为 sub-composition 接入（见 `hyperframes-registry`）。

```bash
npx hyperframes catalog --tag caption-style   # list all caption components
npx hyperframes add caption-highlight         # install a specific one
```

| 样式 | Component | 最适合 |
| ------------------------- | ---------------------------- | ---------------------------- |
| TikTok 风格高亮 | `caption-highlight`          | 社交、高能量 |
| 卡拉 OK 药丸 | `caption-pill-karaoke`       | 音乐、歌词视频 |
| 电影感编辑风 | `caption-editorial-emphasis` | 纪录片、讲故事 |
| Glitch / 赛博 | `caption-glitch-rgb`         | 科技、游戏 |
| 全屏重砸 | `caption-kinetic-slam`       | 造势、公告 |
| 霓虹辉光 | `caption-neon-glow`          | 夜晚、夜店、霓虹美学 |
| 霓虹点缀（多色） | `caption-neon-accent`        | 多彩、俏皮 |
| 擦除揭示 | `caption-clip-wipe`          | 简洁、现代 |
| 渐变填充 | `caption-gradient-fill`      | 鲜艳、吸睛 |
| Matrix 解码 | `caption-matrix-decode`      | 科幻、科技揭示 |
| Emoji 弹出 | `caption-emoji-pop`          | 社交、随性 |
| 视差图层 | `caption-parallax-layers`    | 纵深感、电影感 |
| 粒子迸发 | `caption-particle-burst`     | 庆祝、冲击力关键词 |
| 熔岩纹理 | `caption-texture`            | 大胆、戏剧化 |
| 字重变化 | `caption-weight-shift`       | 优雅、字体排印感 |

相关：`caption-blend-difference`（tag 是 `text` / `blend-mode`，不是 `caption-style`，所以不会出现在上面的筛选结果里）通过 `mix-blend-mode: difference` 让文字相对任意背景自动反色——在背景杂乱或不可预测时很有用。

带预览浏览全部：hyperframes.heygen.com/catalog[^catalog]

字幕 component 自带透明背景——它们是纯粹的 overlay。如果底下的视频很亮或很杂，就在宿主 composition 中、字幕 sub-composition 的下方加一个对比层（例如一个半透明的深色 div），而不是加在 component 内部。

## 延伸参考

- [`motion.md`](motion.md) —— 卡拉 OK、马克笔效果、音频响应式调制、散开式退场。
- [`transcript-handling.md`](transcript-handling.md) —— 输入格式、质量检查、清理、外部 API 兜底。
- `hyperframes-animation/rules/css-marker-patterns.md` —— 马克笔高亮（确定性的、完全可 seek）。

## 约束

- 确定性。不用 `Math.random()`，不用 `Date.now()`。
- 与转写稿时间戳同步。
- 同一时间只显示一个字幕组。
- 每个字幕组都必须在 `group.end` 处有一次硬性的 `tl.set` 清除。
- 字体：编译器只会自动嵌入它**内置映射集合**中的字体（Inter、Roboto、Montserrat、…）——对这些字体，只需在 CSS 里声明 `font-family`。任何**其他**字体（像 `TT Norms Pro` 这样的品牌 / 自定义字体，或者非拉丁的 CJK/天城文字体家族）**不会**被自动提供：它需要一个指向随项目附带的真实 `.woff2` 的 `@font-face`，否则渲染时文字会悄悄回退到一个通用字体。不要以为你在本地能看到的 `font-family` 就能渲染出来——渲染机器是一个干净的无头 Chrome，没有安装任何字体。

[^catalog]: [hyperframes.heygen.com/catalog](https://hyperframes.heygen.com/catalog)，2026-10-15 读。
