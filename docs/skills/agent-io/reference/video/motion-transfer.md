---
description: "Agent 做动作迁移：AutoDL 的 wan2.2animate-v4-motion_retargeting，一张人物照片加一段动作视频，让照片里的人做出视频里的动作；输出 464×832 或 832×464，按输出视频时长计费，每秒 0.04 元；没实测"
---

# 动作迁移

给一张人物照片和一段跳舞或做动作的视频，生成照片里的人做同样动作的视频。用的是 Wan2.2 Animate，不是 MiniMax H3。中转、提交、轮询和取结果都跟[文字 + 图生成视频](index.md)一样，只换工作流 ID 和参数：

```bash
curl -sS https://autodl-proxy.liuhetian.work/api/v1/comfyui/comfyui_workflow/wan2.2animate-v4-motion_retargeting \
  -H "Authorization: Bearer $MY_API_KEY" -H "content-type: application/json" \
  -d '{"ref_image": "<人物照片 URL 或 data URI>", "ref_video": "<动作视频 URL>",
       "resolution": "464*832px(竖版)"}'
```

- **必填**：`ref_image`（JPG、PNG、WebP，正面、清晰的人物照片）和 `ref_video`（MP4 或 WebM）。没有 `prompt`，也没有时长参数
- **分辨率**：只有 `464*832px(竖版)` 和 `832*464px(横版)` 两种
- **价钱**：按生成视频的实际时长算，高峰每秒 0.04 元，闲时 0.03 元。生成多长应该跟着动作视频走，所以动作视频先剪到要的长度再传
- **没实测**：参数取自 2026-10-02 的元数据。第一次用完，把耗时和结果补进[维护记录](../../../../posts/ai-assistant/maintenance/video.md)
