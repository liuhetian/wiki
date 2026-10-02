---
description: "网络搜索的维护记录：2026-10-02 起默认用 OpenRouter 的 Perplexity Sonar Pro Search，记模型元数据、价格和经海外中转实测的耗时、引用格式、search_context_size；备选 DeepSeek 原生搜索，做法取自 DeepSeek Harness 的搜索插件，2026-10-01 实测鉴权头、耗时、token 和返回结构；用搜索不用看，出问题再看"
---

# 网络搜索的维护记录：Sonar Pro Search 和 DeepSeek 原生搜索

这是[网络搜索](../../../skills/agent-io/reference/web-search.md)背后的维护记录。用搜索时不用看，搜索出问题或者要改做法时再看。

2026-10-01 先接的是 DeepSeek 原生搜索。2026-10-02 用户指定 Perplexity 的 Sonar Pro Search 为默认，DeepSeek 改作备选。

## Sonar Pro Search { #sonar }

### 接口从哪来 { #sonar-upstream }

- 模型是用户指定的，页面是 [openrouter.ai/perplexity/sonar-pro-search](https://openrouter.ai/perplexity/sonar-pro-search)。它就是 OpenRouter 上的普通 chat 模型，用 `/api/v1/chat/completions`，没有特殊端点。
- 元数据从中转的 `GET /api/v1/models/perplexity/sonar-pro-search/endpoints` 查：
    - 模型说明写的是「只在 OpenRouter API 上提供」的 Pro Search 模式，Perplexity 最强的 agentic 搜索。
    - 上下文 200k，最多输出 8000 token。
    - 输入每百万 token 3 美元，输出 15 美元，另有一项 `web_search` 0.018。
    - 支持 `web_search_options`、`structured_outputs`、`reasoning`。
    - 上游延迟近 30 分钟 p50 是 8.1 秒，p90 是 19 秒，p99 是 29 秒。
- OpenRouter 上 Perplexity 还有 `sonar`、`sonar-pro`、`sonar-reasoning-pro`、`sonar-deep-research`，`web_search` 一项都是 0.005。
- 返回格式和 `search_context_size` 是经 Context7 查 OpenRouter 文档仓库（`openrouterteam/docs`）的 web search 指南看到的：来源以 `url_citation` 注解返回；`web_search_options.search_context_size` 决定原生搜索模型取多少上下文。

### 实测 { #sonar-tests }

2026-10-02 经海外中转实测，查询词沿用 DeepSeek 那次的两个，直接写在用户消息里，不加前缀：

| 请求 | 耗时 | 结果 |
|---|---|---|
| 「Caddy 2.11 release notes」 | 19.8 秒 | 200，693 个输出 token，0.0281 美元；15 条来源，回答分 2.11.1 的改动、安全修复、2.11.2 三节，带 CVE 编号 |
| 「2026 国庆 高速免费 时间」 | 6.0 秒 | 200，146 个输出 token，0.0200 美元；15 条来源，第一条是新华社；回答是 10 月 1 日到 7 日，还提到中秋不免费 |
| 中文那条再跑一次 | 4.9 秒 | 0.0205 美元，回答一样 |
| 中文那条加 `search_context_size: "low"` | 7.5 秒 | 0.0163 美元，回答一样 |
| 中文那条加 `search_context_size: "high"` | 4.9 秒 | 0.0249 美元，回答一样 |
| OpenAI Python SDK 3.22.1，`base_url` 填 `…/api/v1`，英文那条 | 20.6 秒 | 15 条来源，`message.annotations` 直接能读 |

- 回答里的角标 `[n]` 对应 `annotations` 里的第 n 条：核对了中文那次的 `[1]`、`[5]`、`[13]`，指向的文章都对得上。
- `url_citation` 只有 `url`、`title`、`start_index`、`end_index` 四个字段，两个 index 都是 0。OpenRouter 文档 Responses API 的例子里注解带 `content` 摘录，这里没有。
- 两次都是 15 条来源。中文那次有好几条是同一篇新浪文章带不同的追踪参数。
- 响应里 `reasoning` 是空的，`reasoning_tokens` 是 0；顶层没有 Perplexity 官方 API 的 `citations`、`search_results` 字段。
- 输入 token 只算用户消息本身，8 个。扣掉输出 token 的钱，每次搜索的费用：`low` 约 0.014 美元，默认约 0.018，`high` 约 0.022。
- 响应头里有 `X-Generation-Id`。

## DeepSeek 原生搜索 { #deepseek }

### 做法从哪来 { #upstream }

DeepSeek 没有专门的搜索接口，[官方 Anthropic 兼容文档](https://api-docs.deepseek.com/zh-cn/guides/anthropic_api)也没写 `web_search` 工具。做法取自 DeepSeek Harness 的 [`web-search-deepseek` 插件](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/web/web-search-deepseek/src/provider.ts)（钉 `639ed01`，0.2.0-rc.2）：

- **请求**：发到 `/anthropic/v1/messages`，模型 `deepseek-v4-flash`，`max_tokens` 4096，工具 `web_search_20250305`、`max_uses` 5，用户消息写成 `Perform a web search for the query: <查询词>`。这几项都照搬了。
- **只信结构化块**：来源只从 `web_search_tool_result` 里取，不从模型回复的文字里抠 URL；响应里没有这种块就报错，不降级。
- **摘要靠引用拼**：把 `text` 块 `citations` 里的 `cited_text` 按 URL 拼成每条来源的摘要。我们实测时 `citations` 是空的，所以拿不到摘要。
- **鉴权头两个都带**：`x-api-key` 和 `Authorization: Bearer` 一起发，官方和代理认哪个都行。

### 实测 { #tests }

2026-10-01 经中转实测，英文查询「Caddy 2.11 release notes」和中文查询「2026 国庆 高速免费 时间」各跑一次：

| 鉴权方式 | 结果 |
|---|---|
| curl，只带 `Authorization: Bearer` | 200 |
| curl，`x-api-key` 和 Bearer 一起带 | 200 |
| Anthropic SDK，传 `api_key=` | 401，被中转拦下 |
| Anthropic SDK，传 `auth_token=` | 200 |

- 两次查询都只搜了 1 轮。英文那次用时 4.7 秒。输入 token 一次 8639、一次 1992，差别很大。
- 英文那次返回 10 条，`page_age` 都是空的，每条另带 `encrypted_content`，部分 URL 末尾带 `#1`。
- 两次的 `text` 块 `citations` 都是空的。
- 响应里还有 `thinking` 块，以及记录模型实际查询词的 `server_tool_use` 块。

## 没做的 { #not-done }

- 两条路没拿同一批问题比过准确率，只各跑了两个查询。
- Sonar 的 `web_search_options` 里只试了 `search_context_size`，别的选项（比如限定域名、地区）没试。`sonar`、`sonar-pro` 这些更便宜的 Perplexity 模型没试。
- 海外机的 SSH 公钥还没装回去，OpenRouter 的中转配置没同步进 `assets/gateway/`。
- 中转不认 `x-api-key`。要让 Anthropic SDK 默认的 `api_key=` 也能用，得在 Caddy 里多匹配这个头。没改。
- DeepSeek 每搜一次就是一次完整的模型调用。DeepSeek 开放专门的搜索接口之前只能这样。
- DeepSeek 能不能关掉 thinking 来省 token，没测。
