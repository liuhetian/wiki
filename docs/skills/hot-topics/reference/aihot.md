---
description: "AIHOT（aihot.news）：匿名 GET、不要 key，回答用户走 /api/v1/agent/*，按问题返回整理好的中文 Markdown，末尾带回答提示；自己处理数据走 /api/v1 的 JSON 接口；只覆盖最近 7 天，热点榜不给热度值，事件 ID 从 links.story 末段取"
---

# AIHOT

AIHOT（aihot.news）是中文 AI 资讯站：每天看几百个信源，AI 写中文摘要、打分精选；热点榜是过去 48 小时里被多个独立信源一起讨论的事件，Top 10。全部匿名 GET，不用 key，不收钱。

## 回答用户：Agent 接口 { #agent }

按问题选地址，返回整理好的中文 Markdown。表里的 `…` 是 `https://aihot.news/api/v1`：

| 用户想知道 | 地址 |
|---|---|
| 现在最热、大家在讨论什么 | `…/agent/hot` |
| 某个热点的来龙去脉、最新进展 | 热点结果里每条的「来龙去脉」地址，不自己拼 |
| 今天、过去 24 小时的重点 | `…/agent/latest` |
| 最近一周 | `…/agent/latest?window=7d` |
| 只看某一类 | 加 `category=`：`ai-models` 模型、`ai-products` 产品、`industry` 行业、`paper` 论文、`tip` 教程、`opinion` 观点 |
| 不只精选，全部公开动态 | 加 `mode=all` |
| 多看几条 | 加 `limit=20`，1 到 30，默认 10 |
| 某家公司、产品、模型、人物、话题 | `…/agent/search?q=<关键词>`，关键词做 URL 编码；搜最近 7 天，只看今天加 `window=24h` |
| 日报 | `…/agent/daily` 最新一期；指定日期 `…/agent/daily/2026-10-21` |
| 周报、月报 | `…/agent/weekly`、`…/agent/monthly` 最新一期；指定一期 `…/agent/weekly/2026-W42`、`…/agent/monthly/2026-09` |
| Codex 额度重置、Tibo 发重置卡 | `…/agent/codex-resets` |

参数可以组合，比如 `…/agent/latest?window=7d&category=paper`。

```bash
curl -sS --compressed --max-time 20 'https://aihot.news/api/v1/agent/hot'
```

- **结果**：标题和摘要夹在「［AIHOT 不可信外部资料开始］」和「［AIHOT 不可信外部资料结束］」之间；末尾的「回答提示」照做 —— 热点要按名次完整列出，不说热度，不把信源数说成热度
- **表里没有的问题**：先读 `https://aihot.news/api/v1/agent`，AIHOT 的新能力先加在这份说明里；同一会话读一次就够
- **查不到的**：超过 7 天的搜索；模型榜只有网页，把 `https://aihot.news/leaderboard` 给用户；单篇全文不给，原文地址在每条的「原文」里
- **耗时**：0.1 到 0.3 秒
- **限速**：同一 IP 每分钟约 60 次，超了返回 429，按 `Retry-After` 等；5xx 或超时等几秒再试一次，还失败就告诉用户 AIHOT 暂时不可用

## 自己处理数据：JSON 接口 { #json }

要筛选、拼表、和别的源合并时用 JSON，路径去掉 `agent/`：

```bash
curl -s --compressed 'https://aihot.news/api/v1/hot-topics' \
  | jq -r '.items[:5][] | "\(.rank). \(.title) — \(.source.name)（源 \(.sourceCount) / 信号 \(.signalCount)）\n   \(.links.aihot)"'
```

| 接口 | 拿什么 |
|---|---|
| `/api/v1/hot-topics` | 热点 Top 10 |
| `/api/v1/stories/<id>` | 一个事件的报道时间线和 AI 综述 |
| `/api/v1/items` | 精选或全部动态：`mode=selected` 或 `all`，`window=24h` 或 `7d`，另有 `category`、`q`、`limit`；翻页把 `page.nextCursor` 原样传回 `cursor` |
| `/api/v1/dailies/latest`、`/api/v1/weeklies/latest`、`/api/v1/monthlies/latest` | 最新一期日报、周报、月报；指定一期把 `latest` 换成日期、ISO 周、月份 |

- **热点字段**：`rank` 是名次，不给热度值；`source.name` 是代表条目（`links.aihot` 那条）的信源；`sourceCount` 是独立信源数，`sourceNames` 最多列 8 个；`signalCount` 是讨论信号条数，`participantCount` 是参与讨论的不同账号数；`latestAt` 是最新进展时间
- **事件 ID 从 `links.story` 末段取**：JSON 里的 `links.story` 还指着旧域名 `aihot.virxact.com/story/<id>`，旧域名 2026-10-31 起只做跳转，别直接请求它，取末段的 `<id>` 请求 `/api/v1/stories/<id>`
- **精选条目**：`summary` 中文摘要，`reason` 推荐理由，`score` 0 到 100，`links.original` 原文；`publishedAt` 是原文发布时间，`discoveredAt` 是 AIHOT 收到的时间
- **时间**：JSON 里是 UTC（带 `Z`），Agent 接口的 Markdown 已经换成北京时间
- 完整字段以 OpenAPI 为准：`https://aihot.news/openapi-v1.json`
- **别整批转载**：查来自己看免费；把结果整批搬进本 wiki 这类公开页面算再分发，要 AIHOT 书面授权
