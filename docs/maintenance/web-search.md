---
description: "网络搜索和读取网页的维护记录：2026-10-02 起默认用 OpenRouter 的 Perplexity Sonar Pro Search，记模型元数据、价格和经海外中转实测的耗时、引用格式、search_context_size；2026-10-18 接入 DeepSeek 官方 Search、Fetch 接口，官方指南存档，实测耗时、摘要长度、搜索语法和抓取会丢什么；用的时候不用看，出问题再看"
---

# 网络搜索和读取网页的维护记录：Sonar Pro Search 和 DeepSeek Search、Fetch

这是[网络搜索](../skills/agent-io/reference/web-search.md)和[读取网页](../skills/agent-io/reference/web-fetch.md)背后的维护记录。用的时候不用看，出问题或者要改做法时再看。

2026-10-01 先接的是 DeepSeek 原生搜索。2026-10-02 用户指定 Perplexity 的 Sonar Pro Search 为默认，DeepSeek 改作备选。2026-10-18 DeepSeek 开放官方接口，备选换成官方 Search，另接 Fetch 读网页。

## Sonar Pro Search { #sonar }

### 接口从哪来 { #sonar-upstream }

- 模型是用户指定的，页面是 openrouter.ai/perplexity/sonar-pro-search[^sonar-pro-search]。它就是 OpenRouter 上的普通 chat 模型，用 `/api/v1/chat/completions`，没有特殊端点。
- 元数据从中转的 `GET /api/v1/models/perplexity/sonar-pro-search/endpoints` 查：
    - 模型说明写的是「只在 OpenRouter API 上提供」的 Pro Search 模式，Perplexity 最强的 agentic 搜索。
    - 上下文 200k，最多输出 8000 token。
    - 输入每百万 token 3 美元，输出 15 美元，另有一项 `web_search` 0.018。
    - 支持 `web_search_options`、`structured_outputs`、`reasoning`。
    - 上游延迟近 30 分钟 p50 是 8.1 秒，p90 是 19 秒，p99 是 29 秒。
- OpenRouter 上 Perplexity 还有 `sonar`、`sonar-pro`、`sonar-reasoning-pro`、`sonar-deep-research`，`web_search` 一项都是 0.005。
- 返回格式和 `search_context_size` 是经 Context7 查 OpenRouter 文档仓库（`openrouterteam/docs`）的 web search 指南看到的：来源以 `url_citation` 注解返回；`web_search_options.search_context_size` 决定原生搜索模型取多少上下文。

### 实测 { #sonar-tests }

2026-10-02 经海外中转实测，查询词沿用 2026-10-01 测 DeepSeek 原生搜索时的两个，直接写在用户消息里，不加前缀：

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

## DeepSeek Search 和 Fetch { #deepseek }

### 接口从哪来 { #upstream }

DeepSeek 2026-10-17 开放了官方的 Search 和 Fetch 接口[^ds-guide]，2026-10-18 接进来：Search 换掉网络搜索里原来的备选，Fetch 单开一篇[读取网页](../skills/agent-io/reference/web-fetch.md)。

- 原来的备选取自 DeepSeek Harness 的 `web-search-deepseek` 插件[^dsh-plugin]：往 Anthropic 兼容端点发一次挂 `web_search_20250305` 工具的 Messages 调用，每搜一次就是一次完整的模型调用，2026-10-01 实测 4.7 秒、输入 token 两千到八千多。官方接口不过模型，0.5 秒出结果
- 两个接口都是 `/v1/tools/` 下的普通 JSON POST，鉴权跟模型接口一样用 Bearer。中转对所有路径原样转发，Caddy 没改
- 指南说 `snippet` 通常 100 到 200 字符、`summary` 600 到 800 字符，实测对不上，见下面的表
- 指南还提到 DeepSeek Harness、Claude Code、Codex 调 DeepSeek API 时，服务端工具调用会用到这两个接口，2026-11-01 起按次收费。原来那条挂 `web_search` 工具的路应该就是这个，我们已经不走

计费、限速、错误码以下面存档的指南为准。只有拿到结果才收钱：

> 只有返回 HTTP 200 且产生结果的请求才会计费（Search 的 `results` 必须非空，Fetch 必须返回网页正文）。请求失败、搜索无结果或超时不计费。

实测 Fetch 取不到的页面都返回 404，照这句不收钱；没去对账单。

??? abstract "DeepSeek《网页搜索与抓取》指南原文（2026-10-18 抓取，HTML 转成 Markdown，只把站内链接补成绝对地址）"

    ````markdown
    --8<-- "maintenance/assets/deepseek-web-tools-guide.md"
    ````

### 实测 { #tests }

2026-10-18 经国内中转实测，前两个查询沿用 Sonar 那次的：

| 请求 | 耗时 | 结果 |
|---|---|---|
| Search「Caddy 2.11 release notes」 | 0.70 秒 | 10 条，`rerank_score` 1.93 到 2.15，`authority` 都是 3；`summary` 1043 到 3813 字符，有一条 `snippet` 3137 字符 |
| Search「2026 国庆 高速免费 时间」 | 0.50 秒 | 10 条，前两条是光明网同一篇，一条 URL 带 `#1`；`summary` 96 到 714 字；第一条答案对：10 月 1 日 0 时到 7 日 24 时 |
| 中文那条加 `count: 5`、`need_content: true` | 0.50 秒 | `content` 406 到 2450 字 |
| Search「caddy release site:github.com after:2026-01-01」 | 0.54 秒 | 5 条全是 github.com，日期都在 2026 年 |
| Search「高速免费」`count: 3`，加和不加 `ori_question` | 0.57 秒 | 两次返回的 3 条一模一样 |
| Search「国庆 高速免费 site:mp.weixin.qq.com」 | 0.39 秒 | 0 条；另一个查询要 20 条，也没有一条公众号 |
| Search `query` 全是空格 | 0.22 秒 | 400，`'query' must not be empty` |
| Fetch 光明网新闻 | 6.3 秒 | 2049 字，正文全，末尾混进一行统计代码 |
| 同一个 URL 再取 | 0.25 秒 | 有缓存 |
| Fetch GitHub 的 release 页 | 10.9 秒 | 4131 字符，开头带「Skip to content」和导航菜单的标题 |
| Fetch uv 文档的 Running scripts | 8.1 秒 | 6329 字符，链接 0 个，代码块大多整块丢掉，行内代码前后的空格被吃掉 |
| Fetch DeepSeek 这篇指南 | 0.26 秒 | 6402 字，表格和代码块都压成了纯文本；这么快大概是别人取过 |
| Fetch 知乎问题页、arXiv 的 PDF | 0.2 到 0.3 秒 | 404，`not_found_error` |
| Fetch 不存在的页面 | 3.8 秒 | 404，`not_found_error` |

- Search 的 URL 片段不止 `#1`，还见过 `#2`、`#none`、`#comment#1`。标题常常重复成「标题 - 标题」
- `date` 几乎都是 `T16:00:00+00:00`，即北京时间零点，只有日期精度
- Fetch 的 `content` 标点全带反斜杠转义，去掉之后是普通 Markdown

## 没做的 { #not-done }

- Sonar 和 DeepSeek Search 没拿同一批问题比过准确率。
- Sonar 的 `web_search_options` 里只试了 `search_context_size`，别的选项（比如限定域名、地区）没试。`sonar`、`sonar-pro` 这些更便宜的 Perplexity 模型没试。
- 海外机的 SSH 公钥还没装回去，OpenRouter 的中转配置没同步进 `assets/gateway/`。
- DeepSeek Search 的 `localization` 没试。
- Fetch 没拿真实的公众号文章试，也没试要跑 JS 才出内容的页面。
- 两个接口的 429 没撞到过，限速只照指南写。

[^ds-guide]: DeepSeek [网页搜索与抓取](https://api-docs.deepseek.com/zh-cn/guides/search)指南，以及 [Search](https://api-docs.deepseek.com/zh-cn/api/search)、[Fetch](https://api-docs.deepseek.com/zh-cn/api/fetch) 的 API Reference，2026-10-18 读。
[^dsh-plugin]: [deepseek-harness `web-search-deepseek` 插件](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/web/web-search-deepseek/src/provider.ts)，钉 `639ed01`（0.2.0-rc.2），2026-10-01 读。
[^sonar-pro-search]: [openrouter.ai/perplexity/sonar-pro-search](https://openrouter.ai/perplexity/sonar-pro-search)，2026-10-02 读。
