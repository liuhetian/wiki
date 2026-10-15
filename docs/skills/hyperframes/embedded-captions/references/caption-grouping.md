<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/embedded-captions/references/caption-grouping.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 字幕分组

如何把 Whisper 的词级转写稿变成 plan.json 里的 `groups[]` 数组。

## 目标

**每个分组是一个视觉短语**：入场、逐词显现、退场。经验法则：1 个分组 ≈ 1 个逗号到逗号的分句，或者说话时的 1 口气。

## 输入

来自 `transcribe.cjs` 的 `transcript.json`：

```json
{
  "words": [
    { "text": "Some", "start": 0.24, "end": 0.44, "type": "word" },
    { "text": " ", "start": 0.44, "end": 0.48, "type": "spacing" },
    { "text": "memories", "start": 0.48, "end": 0.82, "type": "word" }
  ]
}
```

丢掉 `type: "spacing"` 的条目；你只需要词。

## 断开边界

遇到以下**任意**一种情况就切出一个新分组：

1. **停顿 ≥ 500ms**（word.end[i] 和 word.start[i+1] 之间的间隔）—— 说话人换了口气。
2. **句子结束符** —— 词以 `.`、`?`、`!` 结尾，或者是类似破折号的停顿。
3. **强逗号** —— `,` 后面跟着 ≥ 250ms 的停顿。
4. **话语重启** —— 像 "but"、"so"、"and then"、"you know" 这样开启一个分句的词，常常值得单独成组或另起新组。
5. **分组达到 6 个词或 2.5 秒** —— 以先到者为准。过长的分组感觉像普通字幕，而不是嵌入式字体排印。

硬性约束：

- 每个分组至少 2 个词（单词的例外：像 "Wait." 这样的感叹词，或 crown 那一行）。
- 在屏幕上至少停留 0.5 秒。如果某个分组不够，就并入相邻分组。
- 分组不能重叠 —— 同一时刻最多只显示一个。

## 分组的时间点

对于词为 `w[0]..w[n-1]` 的分组：

- `in` = `w[0].start - 0.08`（在第一个词之前稍早入场）
- `out` = `min(next_group.in - 0.05, w[n-1].end + 0.6)`（在最后一个词之后停留约 0.6 秒，但不要和下一组冲突）

必要时，最后一个分组延续到视频结束。

## 样式与语气（交叉参考）

如何按分组挑选 `style` 和 `tone`，见 `typography-presets.md`。从左到右依次处理各分组，并且：

1. 第一个分组：默认 `intro` + `soft`。
2. 留意强调信号（转写稿里出现全大写很少见但有可能；更常见的是语义上的 —— 最高级、专有名词）。
3. 一旦独白从铺垫转向陈述，就把语气升到 `present`。
4. `crown` 最多留给**一个**分组，通常是最后一行。

## 允许做编辑上的删改

你**不必**给每个词都上字幕。下面这些都可以：

- **删掉填充词**，比如多余的 "you know"、"um"、"I mean"，如果它们拖慢了视觉节奏。
- **压缩**：通过删掉虚词，把一串 6 个词压成 4 个，只要意思和时间点仍然忠实。
- 在明显的静默或非语音段落（笑声、音乐间奏）期间**整段跳过**。

编辑原则：你是在写辅助语音的字体排印，不是在写法庭笔录。保留意思，修掉噪音。

## 示例（champion）

转写稿："You know, for me I've had this kind of upbringing, had the great foundation and, you know, I've achieved incredible things. I was dreaming of becoming number one in the world and becoming a Wimbledon champion"

编辑处理后的分组：

```json
[
  {
    "id": "cg-0",
    "style": "intro",
    "tone": "soft",
    "words": ["You", "know", "for", "me"],
    "in": 0.1,
    "out": 1.45
  },
  {
    "id": "cg-1",
    "style": "phrase",
    "tone": "soft",
    "words": ["I've", "had", "this", "kind", "of", "upbringing"],
    "in": 1.4,
    "out": 3.35
  },
  {
    "id": "cg-2",
    "style": "phrase",
    "tone": "soft",
    "words": ["the", "great", "foundation"],
    "in": 3.5,
    "out": 5.35
  },
  {
    "id": "cg-3",
    "style": "emph",
    "tone": "present",
    "words": ["I've", "achieved", "incredible", "things"],
    "in": 6.05,
    "out": 8.3
  },
  {
    "id": "cg-4",
    "style": "dream",
    "tone": "present",
    "words": ["dreaming", "of", "becoming", "number", "one"],
    "in": 8.5,
    "out": 10.4
  }
]
```

再加上 crown：

```json
{ "id": "cg-crown", "style": "crown", "words": ["Wimbledon", "Champion"], "in": 10.8, "out": 12.08 }
```

注意 cg-2 里删掉了 "had"（"had the great foundation" → "the great foundation"），cg-4 里删掉了 "I was"，crown 里删掉了 "a" —— 都是为了视觉节奏。

## 分组内部的 word.start/end

直接沿用转写稿里的原始时间戳。不要给单个词重新定时 —— 只调整分组的 `in`/`out`。每个分组内部的词级卡拉 OK 式显现使用原始的 w.start。
