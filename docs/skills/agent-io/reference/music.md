---
description: "Agent 生成音乐：OpenRouter 上 Google 的 Lyria 3，google/lyria-3-clip-preview 出 30 秒片段、每段 0.04 美元，google/lyria-3-pro-preview 出整首歌、每首 0.08 美元；走海外中转 https://openrouter.reverse-pro.xyz，MY_API_KEY 写成 Authorization: Bearer；chat completions 加 modalities [text, audio] 和 stream: true，音频是 SSE 里分块的 base64；歌词用 [Verse]、[Chorus] 分段；clip 版 2026-10-17 跑通过一次纯音乐，pro 版和带歌词的没测"
---

# 生成音乐

!!! warning "只实测过 clip 版纯音乐"
    下面的请求格式是按 OpenRouter 音频输出的通用文档和 Google Lyria 3 的文档推出来的。2026-10-17 用 clip 版出过一段纯音乐，照这一页的写法一次跑通；pro 版、带歌词、传图片都还没跑过，对不上时以实际返回为准，跑通后回来改这一页，把结果记进[维护记录](../../../maintenance/music.md)。

用 OpenRouter 上 Google 的 Lyria 3，走中转的海外机：

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

- **取结果**：OpenRouter 的音频输出只走流式。逐行读 `data: ` 开头的 SSE，把每块的 `choices[0].delta.audio.data` 拼起来，再做 base64 解码。clip 版实测出的是 MP3（192 kbps、44.1 kHz、30.8 秒），整段音频在一块里给完；纯音乐时文字部分只有 `<instrumental>`。15 秒返回，最后一块的 `usage.cost` 是 0.0396 美元
- **`audio` 参数**：OpenRouter 通用示例里还带 `"audio": {"voice": …, "format": …}`，那是给语音模型的；Lyria 不用带，不带就能出
- **歌词**：在 prompt 里用 `[Verse 1]`、`[Chorus]` 这样的标记分段写歌词；要纯音乐就写明「纯音乐、不要人声」
- **图片**：两个模型都收图片，可以给一张图让它照着画面配乐
- **先用 clip 版**试风格，满意了再用 pro 版出整首

维护记录：[为什么选 Lyria、请求格式从哪推的](../../../maintenance/music.md)。正常使用不用看，出问题再看。
