---
description: "基础调用：直接调大模型 API 碰到的边界情况，一个问题一篇实测报告；已有 DeepSeek 插话拼接"
---

# 基础调用

直接调大模型 API 碰到的边界情况，一个问题一篇实测报告。怎么接入见 [Agent 基础能力](../../skills/agent-io/index.md)。

- [DeepSeek 插话拼接](deepseek-interrupt.md) —— 玩家在 AI 出正文、思考、等工具时插话，消息怎么拼 API 才收；只有工具调用没收尾、prefix 没走 /beta、思考加 tools 时当前轮缺 reasoning_content 三种会 400；历史里有 tool_calls 时关工具会把 DSML 标记吐进正文；附 dsh-purge 插件在哪些时刻改消息的案例
