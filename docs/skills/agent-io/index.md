---
description: "给新 Agent 装上的基础能力：读 PDF、音频、视频，生成音频、图片、视频，网络搜索，调用其他大模型；每个能力一篇接入说明，需要时配一个脚本；已接入：阅读 PDF、转录音频、网络搜索、特定音色语音、生成音乐、生成编辑图片、生成视频、调用 DeepSeek、Jev 结构化判断"
---

# Agent 基础能力

给新建的 Agent 装上的基础能力：每个能力对应一篇接入说明，需要时再配一个能直接运行的脚本，用到哪个能力就读哪一篇。这个 skill 是 [搭建 AI 助手](../../posts/ai-assistant/index.md) 的执行部分。

## 用法

- 脚本要在本地运行：有 shell 的 Agent 按 URL 下载脚本后，用 `uv run` 执行，依赖写在脚本头部，由 uv 自动安装。执行前告诉用户会从 PyPI 装哪些包。
- 要调厂商 API 的能力统一走 [API 中转](../../posts/ai-assistant/api-gateway.md)（已接 DeepSeek、AutoDL、CodeProxy、OpenRouter）：中转原样转发，只换 base URL 和 key；网关 token 由用户写在 `.env` 的 `MY_API_KEY` 里，AI 直接用。Agent 不配厂商 key，本站也不存明文密钥。

## 能力表

| 能力 | 读取 | 生成 |
|---|---|---|
| PDF | [阅读 PDF](reference/pdf.md) | — |
| 音频 | [转录音频](reference/transcribe.md) | [特定音色语音](reference/tts.md)、[生成音乐](reference/music.md) |
| 图片 | — | [生成、编辑图片](reference/image.md) |
| 视频 | 阅读视频：还没接入 | [生成视频](reference/video/index.md)：默认文字加参考图生成；文生、首尾帧、对口型、动作迁移各有一篇 |
| 网络 | [网络搜索](reference/web-search.md) | — |
| 调用大模型 | — | [调用 DeepSeek](reference/deepseek.md)、[结构化判断](reference/jev.md)：返回概率和选项，不返回文字 |

还没接入的能力，接好一个再补一篇，不写占位页。
