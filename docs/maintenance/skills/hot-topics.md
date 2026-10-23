---
description: "获取热点（hot-topics）的维护记录：2026-10-21 用户提议单开成标准 skill，一个信息源一篇；AIHOT 读的是接口 2.0.0，官方 Agent 使用说明存档，没装它的 Skill、没接 MCP 和 RSS，实测条件请求、links.story 还指旧域名；linux.do 日报只取小宇宙上的音频，为什么不走 linux.do 和汇总站"
---

# 获取热点（hot-topics）

[获取热点](../../skills/hot-topics/index.md)的维护记录。没有外部 skill 当上游，每个源各一节。

## 为什么单开一个 skill { #why }

- 2026-10-21 用户要接 AIHOT 热点榜，给的是一行 `curl … /api/v1/hot-topics | jq …`。先提议放进 Agent 基础能力的「网络」一行，用户说「感觉这个已经是更高级的封装了。已经不是底层了能力了」，又说「不是mini skill，是一个标准skill，以后可能不光aihot 这一个源头」，要求「看一下aihot提供的能力……整合到我的skill里面」
- 分界：[Agent 基础能力](../../skills/agent-io/index.md)是给什么都能处理的通用能力，任意 URL、任意关键词；这里是别人已经聚合、去重、排好序的成品，回答「AI 圈此刻在热什么」
- 要记已读、看增量的订阅（RSS、仓库 release）不放这里，那是收集通道，要落盘记状态

## AIHOT { #aihot }

### 上游 { #aihot-upstream }

- 站点 aihot.news，数字生命卡兹克出品，运营方 Virxact。接口版本 2.0.0，llms.txt[^llms]、Agent 接入页[^agent-page]、给 Agent 的使用说明、OpenAPI[^openapi] 都是 2026-10-21 读的
- 它自己的 Skill[^skill]（MIT）只把问题转给 `/api/v1/agent/*`，查什么、怎么整理都在服务端。所以没照搬，按使用说明重写成 reference：Agent 接口的问题表照收，补了 JSON 接口、字段说明和下面实测出的坑
- 使用规则[^terms]：个人非商业、组织内部使用免费；对外商业产品、代理接口、批量公开再分发要书面授权。reference 里那条「别整批转载」由此来

??? abstract "给 Agent 的使用说明原文（https://aihot.news/api/v1/agent，2026-10-21 抓取，原样）"

    ````markdown
    --8<-- "maintenance/assets/aihot-agent-guide.md"
    ````

### 跳过了什么 { #aihot-skipped }

- **Skill 安装包**：`install.sh`、本地生成的 `.aihot-actor-id` 匿名标识。本站的 skill 远程读，不往客户端装东西
- **MCP**：8 个工具，和 Agent 接口同源；本站不提供侵入客户端的能力
- **RSS 和精选同步**：精选、全部动态、日报周报月报、按分类的 RSS，`selected/snapshot` 加 `selected/changes` 的增量同步。都是定时收集用的，要记状态，不在这个 skill
- **旧接口迁移**：`/api/public/*` 2026-10-31 停用，本站没用过
- **模型榜**：只有网页，没有接口

### 实测 { #aihot-tests }

2026-10-21 本机直连：

- Agent 接口的 hot、latest、带分类的 latest、search、stories、daily、weekly、monthly 都是 200，0.08 到 0.3 秒，返回 1.7 到 6.3 KB 的 Markdown；JSON 的 hot-topics 0.09 秒
- hot-topics 的 `links.story` 是 `https://aihot.virxact.com/story/<id>`，请求它 301 到 `aihot.news/moved/story/<id>`；Agent 接口 Markdown 里的「来龙去脉」已经是 `aihot.news/api/v1/agent/stories/<id>`。llms.txt 说事件 ID 只能从 `links.story` 取，所以 reference 写成取末段 ID 自己请求 `/api/v1/stories/<id>`
- 那一刻的 Top 10：`sourceCount` 是 12 的两条，`sourceNames` 都只列了 8 个。`signalCount` 在 OpenAPI 里没写口径，`participantCount` 写的是编辑信源和信号源里观测到的不同账号的并集
- 条件请求：响应带弱 ETag 和 `max-age=60`。紧接着带 `If-None-Match` 再请求，`curl --compressed` 回 304，只带 `Accept-Encoding: gzip` 回 200 —— 以后做定时拉取要省流量，每次带同样的压缩头

## linux.do 日报 { #linuxdo-daily }

- **来源**：2026-10-21 用户贴来一份 linux.do 日报的获取文档（Discourse JSON、RSS、汇总站 wudaolu.com），说「目前只需要获取音频即可」「我觉得两句话就可以讲完，我觉得这个太长了，费token」；随后给了小宇宙节目页和取法。所以 [reference](../../skills/hot-topics/reference/linuxdo-daily.md) 只写音频、只写两句
- **为什么不走 linux.do**：本机直连，`.json` 全被 Cloudflare 人机验证挡住（403）；`.rss` 能过，单帖 RSS 带正文，但用户给的日报帖 `3051854` 匿名 404，DeepSeek Fetch 也是 404，要登录才能看。匿名连发二十来次就 429
- **为什么不收 wudaolu.com**：它不是镜像，是第三方汇总站，机器人账号抓 linux.do 的 Telegram 频道写 AI 摘要，同站还发 A 股、币圈；只有文字，没有音频
- **实测**（2026-10-21 本机）：节目页 200、0.3 秒，`episodes` 15 集，`episodeCount` 206；最新一集「AI早知道-26-10-21」，`enclosure.url` 直接 200（用户那次是 302 到 CDN，所以 reference 写 `curl -L`），13.6 MB、2.2 秒下完，ffprobe 是 AAC 单声道 32 kHz、845.7 秒，和 `duration` 对得上；`payType` 是 FREE

[^llms]: [AIHOT llms.txt](https://aihot.news/llms.txt)，2026-10-21 读。
[^agent-page]: [AIHOT Agent 接入页](https://aihot.news/agent?tab=api)，2026-10-21 读。
[^openapi]: [AIHOT OpenAPI 2.0.0](https://aihot.news/openapi-v1.json)，2026-10-21 读。
[^skill]: [AIHOT Agent Skill](https://aihot.news/aihot-skill/README.md)，GitHub 镜像在 KKKKhazix/khazix-skills 的 `aihot` 目录，2026-10-21 读。
[^terms]: [AIHOT 公开使用规则](https://aihot.news/terms)，2026-10-21 读。
