---
description: "Agent 生成语音：默认用我们自己的音色——AutoDL 上的 IndexTTS2 加大米参考音频，走中转 https://autodl-proxy.liuhetian.work，提交后轮询，wav 链接 24 小时内下载，冷启动会排十几分钟；用户说不用自己的音色，就用 OpenRouter 的 microsoft/mai-voice-2.1-flash，音色 zh-CN-Mei:MAI-Voice-2.1-Flash，走海外中转 https://openrouter.reverse-pro.xyz，同步直接返回 mp3，不用转格式；MY_API_KEY 都写成 Authorization: Bearer"
---

# 生成语音

两个方案，按用户的话选：

- **默认用我们自己的音色**——IndexTTS2 加大米的参考音频，见[方案一](#own-voice)
- **用户说不用自己的音色**——微软 MAI-Voice 的预置音色 Mei，见[方案二](#preset-voice)

两个都走中转，API key 都用 `.env` 里的 `MY_API_KEY`，写成 `Authorization: Bearer $MY_API_KEY`，别打印出来。

## 方案一：我们自己的音色（默认） { #own-voice }

给一段参考人声和一段文字，生成同一个音色说这段话的语音，用的是 AutoDL 上的 IndexTTS2 工作流。照 AutoDL ComfyUI API 文档[^comfyui-api]调，只改两处：

- **base URL**：`https://autodl.art` 换成 `https://autodl-proxy.liuhetian.work`
- **API key**：官方文档里令牌前面不带 `Bearer`，经中转要带

```bash
# 提交，返回 data.task_id
curl -sS https://autodl-proxy.liuhetian.work/api/v1/comfyui/comfyui_workflow/indextts2-v1 \
  -H "Authorization: Bearer $MY_API_KEY" -H "content-type: application/json" \
  -d '{"prompt_text": "要说的话", "emo_control_method": "与音色参考音频相同",
       "prompt_simple": "https://wiki.liuhetian.work/skills/agent-io/assets/%E5%A4%A7%E7%B1%B3_14s.wav"}'

# 轮询：data.status 是 QUEUED 或 RUNNING，就隔 5 秒再查一次
curl -sS https://autodl-proxy.liuhetian.work/api/v1/comfyui/comfyui_workflow/result/<task_id> \
  -H "Authorization: Bearer $MY_API_KEY"
```

- **参考音频** `prompt_simple`：用户没指定音色，就用上面例子里的大米音色（[`assets/大米_14s.wav`](../assets/大米_14s.wav)，14 秒）。要换音色，就给几秒钟的人声，wav 或 mp3，填 URL；本地文件写成 `data:audio/wav;base64,…`
- **结果**：状态是 `SUCCESS` 时，`data.results[0].url` 就是 wav 链接，24 小时后失效，拿到马上下载。状态是 `FAILED` 时看 `msg`
- **可能排很久**：一段时间没人用，后端要冷启动，第一次排了十几分钟；热起来以后一次十来秒。轮询的超时别设太短
- **其余参数**：比如情绪控制，以 `GET https://autodl-proxy.liuhetian.work/api/v1/comfyui/workflows/indextts2-v1` 返回的 `data.input_rules` 为准

## 方案二：微软 MAI-Voice 的 Mei（用户说不用自己的音色时） { #preset-voice }

用 OpenRouter 上微软的 `microsoft/mai-voice-2.1-flash`，同步返回 mp3，几秒出结果，拿到就能播。照 OpenRouter TTS 文档[^tts]调，只改 base URL：`https://openrouter.ai` 换成 `https://openrouter.reverse-pro.xyz`。

```bash
curl -sS -o out.mp3 -w '%{http_code}\n' https://openrouter.reverse-pro.xyz/api/v1/audio/speech \
  -H "Authorization: Bearer $MY_API_KEY" -H "Content-Type: application/json" \
  -d '{"model": "microsoft/mai-voice-2.1-flash", "voice": "zh-CN-Mei:MAI-Voice-2.1-Flash",
       "response_format": "mp3", "input": "要说的话"}'
```

- **`response_format` 必须写 `mp3`**：不写默认是 pcm，裸数据，播放器打不开
- **结果**：打印出来的状态码是 200，`out.mp3` 就是音频；不是 200，`out.mp3` 里装的是 JSON 报错，读出来看
- **换音色**：用户点名才换。中文音色有 `zh-CN-Bo`、`zh-CN-Grant`、`zh-CN-Harper`、`zh-CN-Lan`、`zh-CN-Mei`、`zh-CN-Wei` 六个，后面都要带 `:MAI-Voice-2.1-Flash`
- **语速**：Mei 读得偏慢，用户嫌慢就加 `"speed": 1.2`；实测 1.3 能把 7–9 秒的一句缩到 6 秒左右
- **语气控制不了**：`instructions` 不起作用，写进 `input` 会被念出来
- **价格**：按字数算，每百万字 15 美元，168 字的播报读了 43 秒，花 0.0025 美元
- **长稿子**：一次能读多长没测过，几千字的稿子按段落拆开分别生成
- **不能克隆、不能多人对话**：要特定人声用方案一

维护记录：[接口从哪来、实测结果、为什么从 Gemini 换成 MAI-Voice](../../../maintenance/tts.md)。正常使用不用看，出问题再看。

[^comfyui-api]: [AutoDL ComfyUI API 文档](https://autodl.art/docs/comfyui_api/)，2026-10-15 读。
[^tts]: [OpenRouter TTS 文档](https://openrouter.ai/docs/guides/overview/multimodal/tts)，2026-10-15 读。
