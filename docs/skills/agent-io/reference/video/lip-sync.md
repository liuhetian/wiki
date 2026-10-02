---
description: "Agent 做对口型视频：AutoDL 的 minimax_h3_image_audio_to_video，一张人物图加一段语音，生成口型、表情跟着语音动的视频，没有 prompt 字段；可以先用 IndexTTS2 生成语音再串进来做口播；1–15 秒、最高 1080p，每秒 0.03–0.09 元；没实测"
---

# 对口型视频

给一张人物图和一段语音，生成这个人说这段话的视频，口型、表情跟着语音动。中转、提交、轮询和取结果都跟[文字 + 图生成视频](index.md)一样，只换工作流 ID 和参数：

```bash
curl -sS https://autodl-proxy.liuhetian.work/api/v1/comfyui/comfyui_workflow/minimax_h3_image_audio_to_video \
  -H "Authorization: Bearer $MY_API_KEY" -H "content-type: application/json" \
  -d '{"ref_image_0": "<人物图 URL 或 data URI>", "ref_audio_0": "<语音 URL 或 data URI>",
       "audio_duration": 10, "resolution": "480p竖"}'
```

- **必填**：`ref_image_0`、`ref_audio_0`。这个工作流**没有 `prompt`**，画面全靠图和语音
- **时长**：`audio_duration` 是从语音开头截取几秒，1–15 秒，默认 5 秒。语音比这个长的部分会被截掉
- **分辨率**：`480p`、`768p`、`1080p` 各有横、竖两种，没有 1:1，默认 `768p竖`。每秒 480p 0.03 元，768p 0.04 元，1080p 0.09 元
- **做口播**：先用[生成特定音色语音](../tts.md)生成 wav，把它的结果链接填进 `ref_audio_0`。那个链接 24 小时内有效，按理能直接用，没测过
- **没实测**：参数取自 2026-10-02 的元数据。第一次用完，把耗时和结果补进[维护记录](../../../../posts/ai-assistant/maintenance/video.md)
