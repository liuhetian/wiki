# 转写稿指南

关于 `transcribe` CLI 的调用方式、`.en` 模型会翻译非英语内容这条规则，以及 whisper 模型的选择，见 [`../transcribe.md`](../transcribe.md)。本文件讲的是编写字幕时如何处理得到的转写稿：输入格式、必做的质量检查、清理代码、外部 API 兜底。

## 支持的输入格式

CLI 会自动识别并规范化以下格式：

| 格式 | 扩展名 | 来源 | 是否逐词？ |
| --------------------- | --------- | --------------------------------------------------------------------------- | ----------------- |
| whisper.cpp JSON      | `.json`   | `hyperframes init --video`、`hyperframes transcribe` | 是 |
| OpenAI Whisper API    | `.json`   | `openai.audio.transcriptions.create({ timestamp_granularities: ["word"] })` | 是 |
| SRT 字幕 | `.srt`    | 视频剪辑软件、字幕工具、YouTube | 否（短语级） |
| VTT 字幕 | `.vtt`    | 网页播放器、YouTube、转写服务 | 否（短语级） |
| 规范化的词数组 | `.json`   | 由任意工具预处理 | 是 |

**逐词时间戳能做出更好的字幕。** SRT/VTT 给出的是短语级时间，能用，但做不了逐词的动画效果。

## 转写稿质量检查（必做）

每次转写之后，**在继续之前先读转写稿，检查质量问题。** 糟糕的转写稿会产出莫名其妙的字幕。绝不跳过这一步。

### 要看什么

| 信号 | 示例 | 原因 |
| ---------------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| 音符 token（`♪`、`�`） | `{ "text": "♪" }` 或 `{ "text": "�" }` | Whisper 识别到的是音乐，而不是语音 |
| 乱码 / 无意义的词 | "Do a chin"、"Get so gay"、"huh" | 模型听错了歌词或背景噪声 |
| 长时间没有词 | 20 秒以上只有 `♪` token | 纯器乐段落——这是正常的，但比例高说明漏掉了语音 |
| 重复的填充词 | 大量 "huh"、"uh"、"oh" 条目 | 模型在音乐上产生了幻觉 |
| 词的时长极短 | `end - start < 0.05` 的词 | 时间戳对齐不可靠 |

### 自动重试规则

**如果超过 20% 的条目是 `♪`/`�` token，或者转写稿里有明显无意义的词，就说明转写失败了。** 不要拿着糟糕的转写稿继续。而是：

1. 如果原来用的是 `small.en` 或更小的模型，**改用 `medium.en` 重试**：
   ```bash
   npx hyperframes transcribe audio.mp3 --model medium.en
   ```
2. **如果 `medium.en` 也失败了**（音乐 token 仍然 >20%，或仍是乱码），告诉用户音频噪声太大，本地转写处理不了，并建议：
   - 以 SRT/VTT 文件的形式手动提供歌词
   - 使用外部 API（OpenAI 或 Groq Whisper——见下文）
3. 构建字幕之前**一定要清理转写稿**——过滤掉 `♪`/`�` token，以及 `text` 只是单个非文字字符的条目。只有真正的词才能进入字幕 composition。

### 清理转写稿

转写之后（即使用的是好模型），去掉非文字条目：

```js
var raw = JSON.parse(transcriptJson);
var words = raw.filter(function (w) {
  if (!w.text || w.text.trim().length === 0) return false;
  if (/^[♪�\u266a\u266b\u266c\u266d\u266e\u266f]+$/.test(w.text)) return false;
  if (/^(huh|uh|um|ah|oh)$/i.test(w.text) && w.end - w.start < 0.1) return false;
  return true;
});
```

按内容类型选择模型的指引，见 [`../transcribe.md`](../transcribe.md) → "按内容类型挑选模型"。

## 使用外部转写 API

要获得最佳准确率，用外部 API 转写，再导入结果：

**OpenAI Whisper API**（质量优先时推荐）：

```bash
# Generate with word timestamps, then import
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F file=@audio.mp3 -F model=whisper-1 \
  -F response_format=verbose_json \
  -F "timestamp_granularities[]=word" \
  -o transcript-openai.json

npx hyperframes transcribe transcript-openai.json
```

**Groq Whisper API**（速度快，有免费额度）：

```bash
curl https://api.groq.com/openai/v1/audio/transcriptions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -F file=@audio.mp3 -F model=whisper-large-v3 \
  -F response_format=verbose_json \
  -F "timestamp_granularities[]=word" \
  -o transcript-groq.json

npx hyperframes transcribe transcript-groq.json
```

## 如果还没有转写稿

1. 检查项目根目录下有没有 `transcript.json`、`.srt` 或 `.vtt` 文件。
2. 如果都没有，按 [`../transcribe.md`](../transcribe.md) 运行转写——起步模型按那里的"按内容类型挑选模型"来选。
3. 运行上面的质量检查。如果不通过，换更大的模型重试，或者回退到手动提供歌词 / 外部 API。
