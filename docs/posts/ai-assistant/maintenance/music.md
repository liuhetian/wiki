---
description: "音乐生成的维护记录：2026-10-02 选 OpenRouter 上的 Google Lyria 3，不选 Suno（没有公开的官方 API）；模型元数据和价格，请求格式从 OpenRouter 音频输出文档和 Google Lyria 3 文档推出来；用户决定不实测；用接口不用看，出问题再看"
---

# 音乐生成的维护记录：OpenRouter 上的 Lyria 3

这是[生成音乐](../../../skills/agent-io/reference/music.md)背后的维护记录。用接口时不用看，接口出问题或者要换模型时再看。

## 为什么是 Lyria { #why }

2026-10-02 比较了两家：

- **Google Lyria 3**：2026-03-31 上了 OpenRouter，能直接走现有的海外中转。
- **Suno**：没有公开的官方 API，只能在网页上用。2026 年 7 月 Suno 说在探索开发者 API，用申请表收意向，先给挑过的合作方，没给上线时间和价格（见 [Music Business Worldwide 的报道](https://www.musicbusinessworldwide.com/suno-explores-developer-api-seeking-apps-that-unlock-experiences-generative-music-makes-possible-for-the-first-time/)）。网上叫「Suno API」的都是第三方包装的，可能违反 Suno 的服务条款，不接。

## 接口从哪来 { #upstream }

- **元数据**：从中转的 `GET /api/v1/models` 和 `/api/v1/models/<id>/endpoints` 查到。
    - 两个模型都是输入文字和图片、输出文字和音频，提供方只有 Google AI Studio 一家。
    - 价格写在模型说明里：clip 每段 30 秒 0.04 美元，pro 每首完整歌曲 0.08 美元；`pricing` 里的 token 单价都是 0。
    - 支持的参数只有 `max_tokens`、`response_format`、`seed`、`temperature`、`top_p`。
    - 上游近 30 分钟的延迟 p50：clip 3.2 秒，pro 4.7 秒。
- **请求格式**：经 Context7 查到两处，拼起来用。
    - OpenRouter 文档仓库的音频输出指南：chat completions 里写 `modalities: ["text", "audio"]`，音频输出必须 `stream: true`，SSE 每块的 `delta.audio.data` 是 base64。示例还带 `audio: {voice, format}`，那是给语音模型的。
    - Google Gemini API 的 Lyria 3 文档：原生接口是 `POST /v1beta/interactions`，返回的音频是 MP3，`output_text` 是歌词；clip 版固定 30 秒；歌词用 `[Verse 1]`、`[Chorus]` 这样的标记分段。
- OpenRouter 文档里没有 Lyria 专门的示例，所以经 OpenRouter 调时要不要带 `audio` 参数、文字部分是不是歌词、音频是不是 MP3，都没确认。

## 实测 { #tests }

没测。用户决定先接入、不测。第一次真用时，把请求和返回补进这里。

## 没做的 { #not-done }

- 一次都没跑过，上面没确认的几点要第一次用时验证。
- 没比较过 Lyria 和别的音乐模型的效果。
- 海外机的 SSH 公钥还没装回去，OpenRouter 的中转配置没同步进 `assets/gateway/`。
