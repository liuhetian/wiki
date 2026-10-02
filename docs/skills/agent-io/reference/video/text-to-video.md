---
description: "Agent 文生视频：AutoDL 的 minimax_h3_lightx2v_no_pic，只给 prompt，1–15 秒、480p 或 768p，每秒 0.03–0.04 元；要 1088p、1440p 换 minimax_h3_z0901；调用方式同文字 + 图生成视频；没实测"
---

# 文生视频

不给参考图，只用文字生成视频。中转、提交、轮询和取结果都跟[文字 + 图生成视频](index.md)一样，只换工作流 ID 和参数：

```bash
curl -sS https://autodl-proxy.liuhetian.work/api/v1/comfyui/comfyui_workflow/minimax_h3_lightx2v_no_pic \
  -H "Authorization: Bearer $MY_API_KEY" -H "content-type: application/json" \
  -d '{"prompt": "<画面、动作、镜头>", "duration": 5, "resolution": "480p横"}'
```

| 档 | 工作流 ID | 分辨率 `resolution` | 高峰价（元/秒） |
|---|---|---|---|
| 默认 | `minimax_h3_lightx2v_no_pic` | `480p横`、`480p竖`、`480p(1:1)`、`768p横`、`768p竖`、`768p(1:1)`，默认 `768p竖` | 480p 0.03，768p 0.04 |
| 高清 | `minimax_h3_z0901` | 标签带像素，比如 `768p横(1344*768)`、`1440p横(2560*1440)`，要照 `input_rules` 原样写 | 480p 0.04，768p 和 1088p 0.07，1440p 0.08 |

- 必填只有 `prompt`。`duration` 是 1–15 秒，默认 5 秒。默认档没有 `seed`，高清档有
- **没实测**：参数取自 2026-10-02 的元数据。第一次用完，把耗时和结果补进[维护记录](../../../../posts/ai-assistant/maintenance/video.md)
