---
description: "Agent 用首帧和尾帧两张图生成中间的过渡视频：AutoDL 的 minimax_h3_lightx2v，first_frame、last_frame、prompt 必填，1–15 秒、480p 或 768p，每秒 0.03–0.04 元；调用方式同文字 + 图生成视频；两帧先补成输出的宽高比；5 秒 768p 从提交到下载完 170 秒"
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
- **两帧先补成输出的宽高比**：每档的像素在 `input_rules` 里，`768p竖` 是 768×1344、`480p竖` 是 480×864，两档比例不一样。图的比例对不上就先补边，用图里同样的底纹铺满，别让工作流自己处理
- **背景不变就给同一种底**：首帧用跟尾帧同一种底纹的空白图，镜头和背景从头到尾都不会动，模型只补中间长出来的东西 —— 活例：[花卉动态生长海报](../../../video-production/flower-growth-poster/index.md)
- **结果**：5 秒 `768p竖` 从提交到下载完 170 秒。尾帧里的文字最后完整还原，最后约 1 秒停在尾帧上；prompt 里写的先后顺序只是大致遵守，要求「最后浮现」的文字跟开花同时出来了。详情见[维护记录](../../../../maintenance/video.md#test-first-last)
