<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/audio/references/transcribe.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 转写

生成规范化的逐词时间戳。**始终显式指定 `--model`**——CLI 默认的是 `small.en`，它会悄悄把非英语音频翻译成英语。

```bash
npx hyperframes transcribe audio.mp3  --model small.en             # known English
npx hyperframes transcribe video.mp4  --model small --language es  # known Spanish
npx hyperframes transcribe audio.mp3  --model small                # unknown language (auto-detect)
npx hyperframes transcribe subtitles.srt                           # import existing
npx hyperframes transcribe subtitles.vtt
npx hyperframes transcribe openai-response.json
```

## 语言规则（不容商量）

`.en` 模型（`tiny.en` / `base.en` / `small.en` / `medium.en`）会把非英语音频**翻译**成英语。这会悄无声息地毁掉原始语言。

1. **已知是英语** → `--model small.en`（音乐 / 嘈杂音频用 `medium.en`）
2. **已知不是英语** → `--model small --language <iso-code>`（不带 `.en` 后缀）
3. **语言未知** → `--model small`（whisper 自动识别）

**CLI 默认是 `small.en`**——不要依赖它；始终传 `--model`，把选择明确下来。`--language` 还会从混合语言的音频中过滤掉非目标语言的片段。

## 模型大小

| 模型 | 大小 | 速度 | 何时用 |
| ---------- | ------ | -------- | ------------------------------------- |
| `tiny`     | 75 MB  | 最快 | 快速预览、冒烟测试 |
| `base`     | 142 MB | 快 | 短片段、清晰的音频 |
| `small`    | 466 MB | 中等 | 大多数多语言内容的默认选择 |
| `medium`   | 1.5 GB | 慢 | 带人声的音乐、嘈杂的音频 |
| `large-v3` | 3.1 GB | 最慢 | 生产级质量 |

### 按内容类型挑选模型

1. 安静环境 / 轻微背景音下的语音 → `small.en`
2. 音乐上的语音，或带人声的音乐 → 从 `medium.en` 开始
3. 制作完成的音乐曲目（人声 + 完整编曲） → 从 `medium.en` 开始；预计需要手动提供歌词或使用外部 API（[`captions/transcript-handling.md`](captions/transcript-handling.md) → "使用外部转写 API"）
4. 多语言 → `medium` 或 `large-v3`（不带 `.en` 后缀），配合 `--language`

## 输出结构

composition 使用的是一个扁平的词对象数组。`id`（`w0`、`w1`、…）是在规范化过程中添加的，用于在字幕覆盖中做稳定引用；为了向后兼容，它是可选的。

```json
[
  { "id": "w0", "text": "Hello", "start": 0.0, "end": 0.5 },
  { "id": "w1", "text": "world.", "start": 0.6, "end": 1.2 }
]
```

必做的字幕质量检查、重试规则，以及 OpenAI/Groq Whisper API 的导入路径，见 `captions/transcript-handling.md`。
