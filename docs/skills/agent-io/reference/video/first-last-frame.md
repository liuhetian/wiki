---
description: "Agent 用首帧和尾帧两张图生成中间的过渡视频：AutoDL 的 minimax_h3_lightx2v，first_frame、last_frame、prompt 必填，1–15 秒、480p 或 768p，每秒 0.03–0.04 元；调用方式同文字 + 图生成视频；没实测"
---

# 首尾帧生成视频

给开头和结尾两张图，生成从第一张过渡到第二张的视频。中转、提交、轮询和取结果都跟[文字 + 图生成视频](index.md)一样，只换工作流 ID 和参数：

```bash
curl -sS https://autodl-proxy.liuhetian.work/api/v1/comfyui/comfyui_workflow/minimax_h3_lightx2v \
  -H "Authorization: Bearer $MY_API_KEY" -H "content-type: application/json" \
  -d '{"first_frame": "<URL 或 data URI>", "last_frame": "<URL 或 data URI>",
       "prompt": "<两帧之间发生了什么>", "duration": 5, "resolution": "480p横"}'
```

- **必填**：`first_frame`、`last_frame`、`prompt`。图片收 JPG、PNG、WebP
- **分辨率**：跟文生视频的默认档一样，480p、768p 各有横、竖、1:1 三种，默认 `768p竖`。480p 每秒 0.03 元，768p 0.04 元
- **没实测**：参数取自 2026-10-02 的元数据。第一次用完，把耗时和结果补进[维护记录](../../../../posts/ai-assistant/maintenance/video.md)
