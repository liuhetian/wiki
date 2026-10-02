---
description: "Agent 生成特定音色语音：AutoDL 上的 IndexTTS2 工作流，走中转 https://autodl-proxy.liuhetian.work，MY_API_KEY 写成 Authorization: Bearer；先提交拿 task_id，再轮询到 SUCCESS，wav 链接 24 小时内下载；参考音频用几秒人声，本地文件写成 data URI；冷启动会排十几分钟"
---

# 生成特定音色语音

给一段参考人声和一段文字，生成同一个音色说这段话的语音，用的是 AutoDL 上的 IndexTTS2 工作流。走[中转](../../../posts/ai-assistant/api-gateway.md)，照 [AutoDL ComfyUI API 文档](https://autodl.art/docs/comfyui_api/)调，只改两处：

- **base URL**：`https://autodl.art` 换成 `https://autodl-proxy.liuhetian.work`
- **API key**：用 `.env` 里的 `MY_API_KEY`，写成 `Authorization: Bearer $MY_API_KEY`，别打印出来。官方文档里令牌前面不带 `Bearer`，经中转要带

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

维护记录：[接口从哪来、实测结果](../../../posts/ai-assistant/maintenance/tts.md)。正常使用不用看，出问题再看。
