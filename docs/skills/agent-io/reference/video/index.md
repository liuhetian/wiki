---
description: "Agent 生成视频：默认用文字加参考图生成，AutoDL 的 minimax_h3_zm_u24 工作流，走中转 https://autodl-proxy.liuhetian.work，MY_API_KEY 写成 Authorization: Bearer；先提交拿 task_id，再轮询到 SUCCESS，mp4 链接 24 小时内下载；1–9 张图，可带 0–3 段音频，1–15 秒，480p 或 768p，每秒 0.03–0.04 元；文生视频、首尾帧、对口型、动作迁移各一篇，需要再打开"
---

# 生成视频

最常用的是给一张或几张参考图，再写一段文字，生成视频。用的是 AutoDL 上的 MiniMax H3 工作流 `minimax_h3_zm_u24`。走[中转](../../../../posts/ai-assistant/api-gateway.md)，照 [AutoDL ComfyUI API 文档](https://autodl.art/docs/comfyui_api/)调，只改两处：

- **base URL**：`https://autodl.art` 换成 `https://autodl-proxy.liuhetian.work`
- **API key**：用 `.env` 里的 `MY_API_KEY`，写成 `Authorization: Bearer $MY_API_KEY`，别打印出来。官方文档里令牌前面不带 `Bearer`，经中转要带

```bash
# 提交，返回 data.task_id
curl -sS https://autodl-proxy.liuhetian.work/api/v1/comfyui/comfyui_workflow/minimax_h3_zm_u24 \
  -H "Authorization: Bearer $MY_API_KEY" -H "content-type: application/json" \
  -d '{"prompt": "<画面里发生什么、镜头怎么动>", "ref_image_0": "<图片 URL 或 data URI>",
       "duration": 5, "resolution": "480p横"}'

# 轮询：data.status 是 QUEUED 或 RUNNING，就隔 10 秒再查一次
curl -sS https://autodl-proxy.liuhetian.work/api/v1/comfyui/comfyui_workflow/result/<task_id> \
  -H "Authorization: Bearer $MY_API_KEY"
```

- **参考图**：`ref_image_0` 必填，最多到 `ref_image_8`，一共 9 张，收 JPG、PNG、WebP。填 URL；本地文件写成 `data:image/jpeg;base64,…`
- **参考音频**：`ref_audio_0` 到 `ref_audio_2` 选填，收 MP3、WAV、FLAC。不给音频，生成的视频也自带声音，不是静音
- **时长和分辨率**：`duration` 是 1–15 秒，默认 5 秒。`resolution` 可选 `480p横`、`480p竖`、`480p(1:1)`、`768p横`、`768p竖`、`768p(1:1)`，默认 `768p竖`。其余参数以 `GET https://autodl-proxy.liuhetian.work/api/v1/comfyui/workflows/minimax_h3_zm_u24` 返回的 `data.input_rules` 为准
- **结果**：状态是 `SUCCESS` 时，`data.results[0].url` 就是 mp4 链接，24 小时后失效，拿到马上下载。状态是 `FAILED` 时看 `msg`。3 秒 480p 的视频跑了 81 秒
- **价钱**：按秒计费。08:00–24:00 是高峰，480p 每秒 0.03 元，768p 每秒 0.04 元；00:00–08:00 每秒便宜 0.01 元。5 秒 480p 大约 0.15 元
- **可能排很久**：这个工作流用的人多，实测没排队。冷门的工作流可能要冷启动，IndexTTS2 就排过十几分钟。轮询的超时别设太短
- **要更清楚**：换高清档，最高 1440p，每秒 0.04–0.08 元。不带音频用 `minimax_h3_z0902`，带音频用 `minimax_h3_z0903`，后者至少要给 1 段音频。两个都只收 1–6 张图；分辨率标签带像素，比如 `1440p横(2560*1440)`，要照 `input_rules` 原样写。没实测

## 其他用途

各写了一篇，需要再打开。四篇都没实测，参数取自元数据。

| 用途 | 工作流 | 什么时候用 |
|---|---|---|
| [文生视频](text-to-video.md) | `minimax_h3_lightx2v_no_pic` | 没有参考图，只有文字 |
| [首尾帧](first-last-frame.md) | `minimax_h3_lightx2v` | 有开头和结尾两张图，要中间的过渡 |
| [对口型](lip-sync.md) | `minimax_h3_image_audio_to_video` | 一张人物图加一段语音，做口播 |
| [动作迁移](motion-transfer.md) | `wan2.2animate-v4-motion_retargeting` | 让照片里的人照着一段视频做动作 |

维护记录：[工作流从哪找、价格怎么算、为什么只收这几个、实测结果](../../../../posts/ai-assistant/maintenance/video.md)。正常使用不用看，出问题或者想换工作流时再看。
