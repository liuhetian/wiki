---
description: "给新 Agent 装上的基础能力：读 PDF、音频、视频，生成音频、图片、视频，网络搜索，调用其他大模型；每个能力一篇接入说明加一个脚本，Agent 自带同等工具时优先用自带的；已接入：阅读 PDF、调用 DeepSeek"
---

# Agent 基础能力

给新建的 Agent 装上的基础能力：每个能力对应一篇接入说明和一个能直接运行的脚本，用到哪个能力就读哪一篇。这个 skill 是 [搭建 AI 助手](../../posts/ai-assistant/index.md) 的执行部分。

## 用法

- **Agent 自带同等工具就先用自带的**：Claude Code 的 Read 能直接读 PDF，DSH 自带 `web_search`。自带工具不够用时才换脚本。
- 脚本要在本地运行：有 shell 的 Agent 按 URL 下载脚本后，用 `uv run` 执行，依赖写在脚本头部，由 uv 自动安装。执行前告诉用户会从 PyPI 装哪些包。
- 要调厂商 API 的能力统一走 [API 中转](../../posts/ai-assistant/api-gateway.md)（已接 DeepSeek）：网关 token 由用户手动写在 `.env` 的 `MY_API_KEY` 里，脚本自己读，AI 直接调用，不用问；中转地址脚本里有默认值。Agent 不配厂商 key，本站也不存明文密钥。

## 能力表

| 能力 | 读取 | 生成 |
|---|---|---|
| PDF | [阅读 PDF](reference/pdf.md) | — |
| 音频 | 转录（语音转文本）：还没接入 | 特定音色语音、音乐：还没接入 |
| 图片 | — | 生成、编辑图片：还没接入 |
| 视频 | 阅读视频：还没接入 | 生成视频：还没接入 |
| 网络 | 网络搜索：还没接入 | — |
| 调用大模型 | — | [调用 DeepSeek](reference/deepseek.md)：经中转流式问答，可附文件、开思考、要 JSON |

还没接入的能力，接好一个再补一篇，不写占位页。
