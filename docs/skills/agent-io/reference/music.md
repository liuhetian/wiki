---
description: "Agent 生成音乐：OpenRouter 上 Google 的 Lyria 3，google/lyria-3-clip-preview 出 30 秒片段、每段 0.04 美元，google/lyria-3-pro-preview 出整首歌、每首 0.08 美元；走海外中转 https://openrouter.reverse-pro.xyz，MY_API_KEY 写成 Authorization: Bearer；chat completions 加 modalities [text, audio] 和 stream: true，音频是 SSE 里分块的 base64；歌词用 [Verse]、[Chorus] 分段；没实测，请求格式是按文档推的"
---

# 生成音乐

!!! warning "没实测"
    下面的请求格式是按 OpenRouter 音频输出的通用文档和 Google Lyria 3 的文档推出来的，一次都没跑过。第一次用时如果对不上，以实际返回为准，跑通后回来改这一页，把结果记进[维护记录](../../../posts/ai-assistant/maintenance/music.md)。

用 OpenRouter 上 Google 的 Lyria 3，走[中转](../../../posts/ai-assistant/api-gateway.md)的海外机：

| 模型 | 生成什么 | 价格 |
|---|---|---|
| `google/lyria-3-clip-preview` | 30 秒的片段 | 每段 0.04 美元 |
| `google/lyria-3-pro-preview` | 完整的歌 | 每首 0.08 美元 |

照 OpenRouter 文档调，只改两处：

- **base URL**：`https://openrouter.ai` 换成 `https://openrouter.reverse-pro.xyz`
- **API key**：用 `.env` 里的 `MY_API_KEY`，写成 `Authorization: Bearer $MY_API_KEY`，别打印出来

```bash
curl -sSN https://openrouter.reverse-pro.xyz/api/v1/chat/completions \
  -H "Authorization: Bearer $MY_API_KEY" -H "Content-Type: application/json" \
  -d '{"model": "google/lyria-3-clip-preview",
       "messages": [{"role": "user", "content": "<风格、乐器、情绪、速度；要唱歌词就把歌词写在后面>"}],
       "modalities": ["text", "audio"], "stream": true}'
```

- **取结果**：OpenRouter 的音频输出只走流式。逐行读 `data: ` 开头的 SSE，把每块的 `choices[0].delta.audio.data` 拼起来，再做 base64 解码。Google 原生接口出的是 MP3，解出来先用 `file` 看一眼再定扩展名。文字部分大概是生成的歌词
- **`audio` 参数**：OpenRouter 通用示例里还带 `"audio": {"voice": …, "format": …}`，那是给语音模型的；Lyria 要不要带没确认，报错了再补
- **歌词**：在 prompt 里用 `[Verse 1]`、`[Chorus]` 这样的标记分段写歌词；要纯音乐就写明「纯音乐、不要人声」
- **图片**：两个模型都收图片，可以给一张图让它照着画面配乐
- **先用 clip 版**试风格，满意了再用 pro 版出整首

维护记录：[为什么选 Lyria、请求格式从哪推的](../../../posts/ai-assistant/maintenance/music.md)。正常使用不用看，出问题再看。
