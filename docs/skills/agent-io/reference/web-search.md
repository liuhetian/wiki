---
description: "Agent 网络搜索：默认用 OpenRouter 的 perplexity/sonar-pro-search，走海外中转 https://openrouter.reverse-pro.xyz/api/v1/chat/completions，MY_API_KEY 写成 Authorization: Bearer，回答带 [n] 角标，来源在 message.annotations 里，一次约 0.02 美元；要结果列表自己读就用 DeepSeek 官方 Search 接口，走国内中转 https://deepseek-proxy.liuhetian.work/v1/tools/search，0.5 秒，一次 0.005 元"
---

# 网络搜索

有两条路，**默认用 Sonar Pro Search**，搜完直接给一段带引用的回答。要一批来源自己读、要快要便宜，或者海外中转出问题时，用 DeepSeek Search。

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

- **结果**：`choices[0].message.content` 是写好的回答，句末带 `[1]`、`[2]` 这样的角标。来源在 `message.annotations` 里，每条 `url_citation` 有 `url` 和 `title`，第 n 条就是角标 `[n]`。不带原文摘录，`start_index`、`end_index` 都是 0，要核实就按 URL [读取网页](web-fetch.md)。同一篇文章可能带着不同的追踪参数出现好几次
- **OpenAI SDK** 能直接用：`base_url` 填 `https://openrouter.reverse-pro.xyz/api/v1`，`api_key` 填 `MY_API_KEY`
- **耗时**：简单问题 5 秒左右，回答长的要 20 秒，超时设一分钟以上
- **价钱**：一次 0.02 到 0.03 美元，其中搜索约 0.018 美元，其余是输出 token。`web_search_options.search_context_size` 写 `"low"` 能省到 0.016 美元左右，实测回答差不多

## 结果列表：DeepSeek Search { #deepseek }

DeepSeek 官方的搜索接口，只返回一串结果，不写回答。走中转的国内机，照 [DeepSeek 官方 API 文档](https://api-docs.deepseek.com/zh-cn/api/search)调，只改两处：

- **base URL**：`https://api.deepseek.com` 换成 `https://deepseek-proxy.liuhetian.work`
- **API key**：用 `.env` 里的 `MY_API_KEY`，写成 `Authorization: Bearer $MY_API_KEY`，别打印出来

```bash
curl -sS https://deepseek-proxy.liuhetian.work/v1/tools/search \
  -H "Authorization: Bearer $MY_API_KEY" -H "Content-Type: application/json" \
  -d '{"query": "<查询词>", "count": 10}'
```

- **参数**：`query` 最多 128 个字，认 `site:`、`-site:`、`"精确短语"`、`lang:zh,en`、`after:2026-01-01`、`before:`；`count` 1 到 50，默认 10；加 `"need_content": true` 另返回正文，不加钱
- **结果**：`results` 按 `rerank_score`（0 到 3）从高到低排，每条有 `title`、`url`、`summary`、`snippet`、`date`、`site_name`、`authority`（0 到 4，-1 是未知）。给模型读就用 `summary`：英文网页多是两三千字符，中文网页一两百到七百字。开了 `need_content`，`content` 是正文
- **去重**：很多 URL 末尾带 `#1`、`#2` 这类片段，同一篇常常带和不带各出现一次，标题也会重复成「标题 - 标题」。去重前先去掉片段
- **日期**：`date` 大多是 UTC 16:00，也就是北京时间零点，只当日期看
- **搜不到**：公众号文章，`site:mp.weixin.qq.com` 返回空；要搜公众号文章用 TikHub 的微信搜索，见[微信公众号 · 底层](share-link/wechat-mp.md#tikhub)
- **耗时**：0.5 秒左右
- **价钱**：有结果的一次 0.005 元，没结果、报错不收钱。账号限速每秒 5 次，超了返回 429，等一会儿再重试

维护记录：[接口从哪来、实测结果](../../../maintenance/web-search.md)。正常使用不用看，搜索出问题再看。
