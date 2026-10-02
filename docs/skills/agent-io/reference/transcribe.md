---
description: "Agent 转录音频（语音转文本）：OpenRouter 的 microsoft/mai-transcribe-2，走海外中转 https://openrouter.reverse-pro.xyz，MY_API_KEY 写成 Authorization: Bearer；只转文字就 curl -F 上传文件，要时间戳和说话人就 JSON 提交 base64；段落起止要准必须开 diarization"
---

# 转录音频

用 OpenRouter 上的 `microsoft/mai-transcribe-2`，走[中转](../../../posts/ai-assistant/api-gateway.md)的海外机。照 [OpenRouter 模型页](https://openrouter.ai/microsoft/mai-transcribe-2)的示例调，只改两处：

- **base URL**：`https://openrouter.ai` 换成 `https://openrouter.reverse-pro.xyz`
- **API key**：用 `.env` 里的 `MY_API_KEY`，写成 `Authorization: Bearer $MY_API_KEY`，别打印出来

```bash
# 只要文字：直接上传文件，wav、mp3 都行
curl -sS https://openrouter.reverse-pro.xyz/api/v1/audio/transcriptions \
  -H "Authorization: Bearer $MY_API_KEY" \
  -F model=microsoft/mai-transcribe-2 -F file=@audio.mp3

# 要时间戳和说话人：JSON 提交，base64 从 stdin 传进去，长录音不会撑爆命令行参数
AUDIO_BASE64=$(base64 < audio.wav | tr -d '\n')
curl -sS https://openrouter.reverse-pro.xyz/api/v1/audio/transcriptions \
  -H "Authorization: Bearer $MY_API_KEY" -H "Content-Type: application/json" \
  --data-binary @- <<EOF
{"model": "microsoft/mai-transcribe-2",
 "input_audio": {"data": "$AUDIO_BASE64", "format": "wav"},
 "response_format": "verbose_json", "timestamp_granularities": ["word"],
 "provider": {"options": {"azure": {"diarization": {"enabled": true}}}}}
EOF
```

- **结果**：同步返回，`text` 是全文，十几秒的音频几秒就出来。测试音频用 [`assets/大米_14s.wav`](../assets/大米_14s.wav)
- **语言**：不填 `language` 就自动识别，返回里带 `language`；确定是哪种语言再填，比如 `"zh"`
- **时间戳**：`verbose_json` 返回 `segments`，再加 `timestamp_granularities: ["word"]` 返回 `words`，中文一个字一条。**段落起止要准，就得开 `diarization`**：不开的话 `segments` 只有一条，从 0 到音频结尾；开了以后起止才对上真正说话的位置，每段、每个字都带 `speaker`
- **Azure 选项**都放在 `provider.options.azure` 里：`phraseList.phrases` 填专有名词，提高识别率；`enhancedMode.modelOptions.transcribeStyle` 写 `"clean"` 去掉口头禅和说错重来，默认的 `"verbatim"` 照录
- **大文件**：有 ffmpeg 就先转成 16 kHz 单声道 mp3（`ffmpeg -i in.wav -ac 1 -ar 16000 -b:a 32k out.mp3`）。大米这段 2.7 MB 转完只剩 57 KB，转出来的文字一样

维护记录：[接口从哪来、实测结果](../../../posts/ai-assistant/maintenance/transcribe.md)。正常使用不用看，出问题再看。
