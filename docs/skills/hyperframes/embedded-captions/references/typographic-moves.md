<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/embedded-captions/references/typographic-moves.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 字体排印手法 —— 是色板，不是牢笼

`cinematic-cream` 模板只锁定 DNA（font-family、动效、色板默认值）。它**不**强制规定槽位结构。agent 通过 plan.json 的 `css` 字段，从零开始为每个字幕分组编写字体排印。

这份文档是一个经过尝试的组合的**色板** —— 挑适合场景的，发明新的，如果内容需要也可以全部跳过。这些是推荐，不是规则。

## 字号 vs 文字长度 —— 挑字号之前先做这一步

如果这个词放不进画面宽度，更大**不**意味着更好。每次挑字号时，都要对照词的长度做一遍合理性检查：

**Inter 900 全大写、-0.03em 字距下的粗略规则：** `max_font_px ≈ frame_width / (longest_word_chars × 0.72)`

0.72 这个乘数是故意保守的 —— 它的目标是让文字填满画面宽度的约 90%，两侧留一点边距。如果你想要从边到边铺满，就降到 0.65，但会损失一点安全余量。

720px 竖屏：

- 3 字符的词（15%）：最大约 330px（像 "15%" 这样的单个大数字）
- 5 字符的词（TAKE）：最大约 200px
- 7 字符的词（AUGMENT / QUANTUM / MATTERS）：最大约 143px
- 10 字符的词（CREATIVITY）：最大约 100px
- 13 字符的词（UNPRECEDENTED）：最大约 77px

1920px 横屏：

- 7 字符的词：最大约 380px
- 10 字符的词：最大约 267px

对于 500–700 字重的斜体 / 正体，字会稍窄一些 —— 把最大值提高约 10%。

**如果你想让这个词比放得下的更大：**

- 每个分组拆成多个词（自然换行），**或者**
- 在音节之间显式加 `<br>`，**或者**
- 把 letter-spacing 降到 -0.05em，**或者**
- 接受 matte 会切掉它的一部分（Vogue 封面式的嵌入效果 —— 只有在被切掉的区域恰好是主体所在位置时才有效）

绝不让文字**溢出**画面边缘 —— 那不是电影感，那只是坏了。用上面的启发式规则。

## 字号纪律（相对画面高度）

竖屏 9:16（720×1290）和横屏 16:9（1920×1080）的舒适区间差别很大。用 `calc(<pct> * var(--h))` 来实现响应式：

| 感觉                   | 占画面高度的 % | 示例 calc            |
| ---------------------- | ----------------- | ----------------------- |
| 耳语 / 标签        | 4–6%              | `calc(0.05 * var(--h))` |
| 轻柔开场            | 6–9%              | `calc(0.07 * var(--h))` |
| 叙事正文         | 9–14%             | `calc(0.11 * var(--h))` |
| 强调               | 14–22%            | `calc(0.18 * var(--h))` |
| 高潮 / 纪念碑式    | 22–35%            | `calc(0.28 * var(--h))` |
| 比脸还大的标题 | 40% 以上              | `calc(0.48 * var(--h))` |

只有当某个特定比例需要在不同画面尺寸下看起来完全一样时（很少见），才用绝对 px。优先用 `calc` + `var(--h)`。

## 有名字的手法 —— 按分组挑选

**斜体沉思式开场**（memory-wall cap-1 一脉）：

```css
font-weight: 600;
font-style: italic;
letter-spacing: -0.01em;
font-size: calc(0.075 * var(--h));
```

**斜体延续 / 更梦幻的延续**（cap-2 一脉）：

```css
font-weight: 500;
font-style: italic;
letter-spacing: -0.005em;
font-size: calc(0.065 * var(--h));
```

**正体支点 / 陈述**（cap-3 一脉 —— "but suddenly"）：

```css
font-weight: 700;
letter-spacing: -0.015em;
font-size: calc(0.07 * var(--h));
```

**全大写高潮 / 纪念碑式**（cap-4 一脉 —— "EVERYTHING IS SHARP AGAIN"）：

```css
font-weight: 900;
text-transform: uppercase;
letter-spacing: -0.03em;
line-height: 0.95;
font-size: calc(0.18 * var(--h));
```

**章节卡 / 全画面的 Adam Curtis 式宣言**：

```css
font-weight: 700;
text-transform: uppercase;
letter-spacing: -0.015em;
line-height: 0.9;
font-size: calc(0.14 * var(--h));
```

**新闻字幕条 / 广播标签**（小号，锁定）：

```css
font-weight: 500;
letter-spacing: 0.02em;
font-size: calc(0.038 * var(--h));
```

**小号旁注 / 表面上的说明文字**：

```css
font-weight: 400;
font-style: italic;
font-size: calc(0.045 * var(--h));
```

**Vogue 刊头式纪念碑**：

```css
font-weight: 900;
text-transform: uppercase;
letter-spacing: -0.04em;
line-height: 0.85;
font-size: calc(0.32 * var(--h));
```

## 叙事弧线（建议，非必需）

**诗式弧线** —— memory-wall 标准范例：斜体开场 → 斜体延续 → 正体支点 → 全大写高潮。四步。

**问答弧线**：小号斜体提问 → 大号全大写回答。两步。

**三段列举弧线**：三段同等分量的叙述，一个高潮式全大写。四步。

**单一陈述弧线**：一个纪念碑式全大写，长时间停留。一步。

**耳语钩子弧线**（短视频）：小号斜体钩子 → 巨大的全大写揭晓。两步。

分组的**数量**来自**内容**。一段 25 秒的 Pausch 演讲大约有 8 个段落节拍。一个 7 秒的 TikTok 钩子有 2–3 个段落节拍。不要硬凑 4 个、5 个或 7 个 —— 读转写稿，标出按换气划分的分组。

## 位置 + 图层词汇

**位置**是字幕在画面中所处的地方。使用：

- `top / left / right / bottom`（百分比或 px）作为锚点
- `transform: translateX/Y` 做精细偏移
- `text-align: center / left / right` 做对齐

每个分组的**图层**：

- `bg`（默认）—— 在主体身后。matte 遮挡。电影感嵌入。适用于干净区域（天空、墙面），**或者**为了 Vogue 刊头效果而刻意横穿主体。
- `fg` —— 在主体上方。宣告式。用于高潮的突破性时刻，或者 bg 会被身体 100% 遮挡时。

每个分组的**语气**：

- `soft` —— 轻柔的逐词 opacity+y 漂移（0.45s power2.out）。用于内省、梦幻或叙事性的内容。
- `present` —— 利落的逐词 opacity+y+scale 弹出（0.22s power3.out）。用于强调性或宣告性的段落节拍。

## DNA 防范的反模式

DNA 的默认值能防止大多数难看的结果。但在按分组的 CSS 里仍要避免：

- 一个视频里用多种不同的 `font-family`（DNA 只有一个字体家族）
- 多种饱和色（最多一个强调色；DNA 默认是奶油色或深暖色）
- `letter-spacing` 超过 ±0.05em，除非有具体理由
- `font-weight` 300 或更低 —— 在屏幕上太细
- 在强调上用 `font-style: italic` —— 斜体是用来抒情的，不是用来加重的

## cinematic-cream 什么时候是错的

这套 DNA 假设背景是中等到偏暗（亮度 60–180）。对于：

- 明亮的白色影棚 → cinematic-cream 的奶油色 + `screen` 会被冲淡，而 DNA 是**锁定**的（你不能给它重新上色）→ 改用 **Standard 模式**（不透明 rail）
- 正式的纪录片 → Standard 模式（documentary-dignified 方向；见 references/direction-catalog.md §1）
- 高能量的 vlog 钩子 → 未来的 `kinetic-vlog` DNA（尚未交付）

## 示例：memory-wall 原版，用自由形式表达

和标准范例 memory-wall.html 输出相同，但使用无槽位的 plan：

```json
{
  "template": "cinematic-cream",
  "caption_layer": "bg",
  "groups": [
    {
      "id": "cg-0",
      "tone": "soft",
      "in": 0.2,
      "out": 4.85,
      "css": "top: 14%; right: 6%; left: auto; text-align: right; font-size: calc(0.09 * var(--h)); font-weight: 600; font-style: italic; letter-spacing: -0.01em;",
      "words": [
        { "text": "Some", "start": 0.24, "end": 0.44 },
        { "text": "memories", "start": 0.48, "end": 0.82 },
        { "text": "feel", "start": 0.92, "end": 1.14 },
        { "text": "soft", "start": 1.2, "end": 1.64 }
      ]
    },
    {
      "id": "cg-1",
      "tone": "soft",
      "in": 2.55,
      "out": 4.85,
      "css": "top: 26%; right: 10%; left: auto; text-align: right; font-size: calc(0.075 * var(--h)); font-weight: 500; font-style: italic;",
      "words": [
        { "text": "like", "start": 2.66, "end": 2.78 },
        { "text": "old", "start": 2.88, "end": 3.02 },
        { "text": "film", "start": 3.16, "end": 3.46 }
      ]
    },
    {
      "id": "cg-2",
      "tone": "present",
      "in": 4.9,
      "out": 8.04,
      "css": "top: 18%; right: 6%; left: auto; text-align: right; font-size: calc(0.085 * var(--h)); font-weight: 700;",
      "words": [
        { "text": "but", "start": 5.04, "end": 5.18 },
        { "text": "suddenly", "start": 5.24, "end": 5.76 }
      ]
    },
    {
      "id": "cg-3",
      "tone": "present",
      "in": 6.7,
      "out": 8.04,
      "css": "top: 32%; right: 6%; left: auto; text-align: right; font-size: calc(0.11 * var(--h)); font-weight: 900; text-transform: uppercase; letter-spacing: -0.03em; line-height: 0.95;",
      "words": [
        { "text": "everything", "start": 6.82, "end": 7.14 },
        { "text": "is", "start": 7.18, "end": 7.28 },
        { "text": "sharp", "start": 7.32, "end": 7.52 },
        { "text": "again", "start": 7.58, "end": 7.92 }
      ]
    }
  ]
}
```

视觉效果相同，没有槽位约束。每个分组掌管自己的字体排印。
