---
description: "Agent 调 DeepSeek：中转原样转发，照官方用法调，只改两处——base URL 换成 https://deepseek-proxy.liuhetian.work，API key 用 .env 里的 MY_API_KEY"
---

# 调用 DeepSeek

[中转](../../../posts/ai-assistant/api-gateway.md)只换 key、其余原样转发，照 DeepSeek 官方用法调，只改两处：

- **base URL**：`https://api.deepseek.com` 换成 `https://deepseek-proxy.liuhetian.work`
- **API key**：用 `.env` 里的 `MY_API_KEY`，用户已经配好，直接用，别打印出来
- 有特殊需求再看 [DeepSeek 官方 API 文档](https://api-docs.deepseek.com/zh-cn/)
