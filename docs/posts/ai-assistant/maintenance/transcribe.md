---
description: "音频转录的维护记录：OpenRouter 上 microsoft/mai-transcribe-2 的接口从哪来，2026-10-02 经海外中转实测 JSON 和 multipart 两种传法、wav 和 mp3、时间戳、说话人分离和计费；用接口不用看，出问题再看"
---

# 音频转录的维护记录：OpenRouter 的 MAI-Transcribe-2

这是[转录音频](../../../skills/agent-io/reference/transcribe.md)背后的维护记录。用接口时不用看，接口出问题或者要换模型时再看。

## 接口从哪来 { #upstream }

- 示例是用户从 OpenRouter 模型页（[openrouter.ai/microsoft/mai-transcribe-2](https://openrouter.ai/microsoft/mai-transcribe-2)）的 API 标签贴过来的：`POST /api/v1/audio/transcriptions`，JSON 里的 `input_audio` 放 base64 和格式；时间戳用 `response_format` 和 `timestamp_granularities`；说话人分离、专有名词、转录风格是 Azure 的参数，放在 `provider.options.azure` 里透传；生成 ID 在响应头 `X-Generation-Id` 里。
- 能用 multipart 上传，是从 OpenRouter 文档仓库里 2026-05-01 那篇音频 API 公告看到的（经 Context7 查）：转录端点也收 OpenAI 风格的 `multipart/form-data`，支持 WAV、MP3、FLAC 等格式。
- `GET /api/v1/models` 返回的 463 个模型里没有转录模型，查不到它的元数据。

## 实测 { #tests }

2026-10-02 经海外中转实测。音频是大米那段 14 秒的 wav（48 kHz 立体声，2.7 MB，前 2.25 秒静音），转出来是「欢迎回来，今天想聊一个很烦人的事儿，记密码。所有的软件都要。」，录音在这里截断了。

| 请求 | 耗时 | 结果 |
|---|---|---|
| JSON，只带 `model` 和 `input_audio` | 4.2 秒 | 200，`text` 和 `usage` |
| JSON，`verbose_json` + 词级时间戳 | — | `segments` 只有一条，0 到 14.016 秒；`words` 30 条 |
| JSON，`verbose_json` + `diarization` | — | `segments` 变成 2.32 到 14.04 秒，带 `speaker: 0` |
| JSON，用户贴的官方 curl 写法：词级时间戳 + `diarization` + `phraseList` + `clean`，base64 经 stdin 传 | 4.7 秒 | `segments` 2.32 到 13.92 秒；`words` 29 条 |
| JSON，填 `language: "zh"` | 3.5 秒 | 文字一样 |
| multipart 上传 wav | 4.1 秒 | 文字一样 |
| 用 ffmpeg 转成 16 kHz 单声道 32 kbps mp3（57 KB），multipart 或 JSON 都试了 | 2.1 秒 | 文字一样 |
| OpenAI Python SDK 3.22.1，`base_url` 填 `…/api/v1`，`audio.transcriptions.create` | — | 文字一样，`words` 30 条 |
| 错的 token | — | 401，被中转拦下 |

- 每次的 `usage` 都是 `seconds: 15`、`cost: 0.000417`：14 秒按 15 秒计费，折合每小时 0.1 美元。
- 自动识别返回 `language: "zh"`、`duration: 14.02`。
- 词级时间戳是准的：第一个字「欢」从 2.32 秒开始，音频能量正好在 2.25 秒到 2.5 秒之间跳起来。
- 段落起止只跟 `diarization` 有关，跟词级时间戳无关：不开就是 0 到音频结尾。
- 这段话没有口头禅，`clean` 和默认结果只差句末一个句号。
- 响应头里有 `X-Generation-Id`，形如 `gen-stt-…`。

## 没做的 { #not-done }

- 多人对话的说话人分离没测，只测了一个人说话。
- `phraseList` 没在有生僻词的音频上看出效果；中英夹杂的自动识别没测。
- 用 URL 传音频、FLAC 和别的格式、几十分钟的长音频、大小上限都没测。
- multipart 上传时能不能带 `provider.options.azure`，没测。
- 没跟 Whisper、GPT-4o Transcribe 这些别的转录模型比过。
- 海外机的 SSH 公钥还没装回去，OpenRouter 的中转配置没同步进 `assets/gateway/`。
