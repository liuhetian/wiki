---
description: "Agent 网络搜索：默认用 OpenRouter 的 perplexity/sonar-pro-search，走海外中转 https://openrouter.reverse-pro.xyz/api/v1/chat/completions，MY_API_KEY 写成 Authorization: Bearer，回答带 [n] 角标，来源在 message.annotations 里，一次约 0.02 美元；备选 DeepSeek 原生搜索，走国内中转的 Anthropic 兼容端点挂 web_search_20250305 工具"
---

# 网络搜索

有两条路，**默认用 Sonar Pro Search**。DeepSeek 原生搜索是备选，海外中转出问题时用。

## 默认：Perplexity Sonar Pro Search { #sonar }

用 OpenRouter 上的 `perplexity/sonar-pro-search`，走[中转](../../../posts/ai-assistant/api-gateway.md)的海外机。就是一次普通的 chat completions 调用，模型自己去搜，再写一段带引用的回答。照 [OpenRouter 模型页](https://openrouter.ai/perplexity/sonar-pro-search)的示例调，只改两处：

- **base URL**：`https://openrouter.ai` 换成 `https://openrouter.reverse-pro.xyz`
- **API key**：用 `.env` 里的 `MY_API_KEY`，写成 `Authorization: Bearer $MY_API_KEY`，别打印出来

```bash
curl -sS https://openrouter.reverse-pro.xyz/api/v1/chat/completions \
  -H "Authorization: Bearer $MY_API_KEY" -H "Content-Type: application/json" \
  -d '{"model": "perplexity/sonar-pro-search",
       "messages": [{"role": "user", "content": "<查询词或问题>"}]}'
```

- **结果**：`choices[0].message.content` 是写好的回答，句末带 `[1]`、`[2]` 这样的角标。来源在 `message.annotations` 里，每条 `url_citation` 有 `url` 和 `title`，第 n 条就是角标 `[n]`。不带原文摘录，`start_index`、`end_index` 都是 0，要核实就按 URL 去读原文。同一篇文章可能带着不同的追踪参数出现好几次
- **OpenAI SDK** 能直接用：`base_url` 填 `https://openrouter.reverse-pro.xyz/api/v1`，`api_key` 填 `MY_API_KEY`
- **耗时**：简单问题 5 秒左右，回答长的要 20 秒，超时设一分钟以上
- **价钱**：一次 0.02 到 0.03 美元，其中搜索约 0.018 美元，其余是输出 token。`web_search_options.search_context_size` 写 `"low"` 能省到 0.016 美元左右，实测回答差不多

## 备选：DeepSeek 原生搜索 { #deepseek }

DeepSeek 没有专门的搜索接口。搜索就是一次带原生 `web_search` 工具的 Messages 调用，走国内中转的 Anthropic 兼容端点：

```bash
curl -sS https://deepseek-proxy.liuhetian.work/anthropic/v1/messages \
  -H "Authorization: Bearer $MY_API_KEY" -H "content-type: application/json" \
  -d '{"model": "deepseek-v4-flash", "max_tokens": 4096,
       "messages": [{"role": "user", "content": "Perform a web search for the query: <查询词>"}],
       "tools": [{"type": "web_search_20250305", "name": "web_search", "max_uses": 5}]}'
```

- **base URL**：`https://deepseek-proxy.liuhetian.work/anthropic`，不要直连 `api.deepseek.com`
- **API key**：用 `.env` 里的 `MY_API_KEY`，放在 `Authorization: Bearer` 里，别打印出来。中转只认这个头：Anthropic SDK 要传 `auth_token=`，传 `api_key=` 会 401
- **结果**：来源从 `web_search_tool_result` 块里取 `url`、`title`。`text` 块是模型写的总结，不带逐条引用，要核实就按 URL 去读原文。有的 URL 末尾带 `#1`，去重前先去掉

维护记录：[做法从哪来、实测结果](../../../posts/ai-assistant/maintenance/web-search.md)。正常使用不用看，搜索出问题再看。
