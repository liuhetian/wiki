# TTS → 字幕

没有录制好的旁白时，生成一段，并获取逐词的字幕时间。根据所用的 TTS 服务商，有两条路径：

## 路径 A —— HeyGen（单次调用，不需要 Whisper）

HeyGen 会在返回音频的同一个响应里返回逐词时间戳。使用自带的 REST 辅助脚本（`hyperframes tts` 命令只支持 Kokoro）：

```bash
node skills/media-use/audio/scripts/heygen-tts.mjs \
  script.txt --output narration.wav --words narration.words.json
```

`narration.words.json` 已经是字幕流水线所使用的 `[{ id, text, start, end }]` 结构——不需要再单独跑一次转写。

## 路径 B —— Gemini / ElevenLabs / Kokoro（TTS → 转写）

这些 adapter 只提供音频，不带逐词数据。缺少时间信息时，共享的音频引擎会自动运行转写。对于 Gemini，使用[文字转语音](tts.md#gemini-narration)中的请求，然后读取 `audio_meta.json` → `voices[].words`。

如果是单独在本地用 Kokoro 生成，先生成音频，再转写：

```bash
npx hyperframes tts script.txt --voice af_heart --output narration.wav
npx hyperframes transcribe narration.wav --model small.en   # voice af_heart is American English
```

Whisper 会从生成的音频中提取精确的词边界，因此字幕时间与实际念白吻合，无需手工微调。让 `--model` 与声音的语言相匹配（`a`/`b` 前缀的声音用 `small.en`，其他情况用 `small --language <code>`）。然后通过 `captions/` 中的字幕参考文档来使用 `transcript.json`。

对于 Gemini，要核实转写保留了脚本原文，尤其是名称、数字和念白中的停顿。如果 `words` 为空，先解决转写失败的问题，再做字幕。改动念法之后，重新生成并重新对齐。
