---
description: "项目：为了交付同一个东西，把互相牵连的问题收在一起，自己做的、拆别人的都算；一个项目一个目录，按领域分组。拆别人的项目先读源码和 git 历史，从这个领域最简单的做法出发讲遇到什么问题引入什么功能"
copy_source: true
---

# 项目

为了交付同一个东西，把互相牵连的问题收在一起：一个怎么解会牵制另一个，读者拿走的是整个东西怎么拼起来。自己做的、拆别人的都算，一个项目一个目录，按领域分组；只为这个项目写的操作手册、截图跟着项目放。

拆别人的项目：它属于什么领域，从这个领域最简单的做法出发，一步步遇到了什么问题、所以引入了什么功能。怎么读、怎么写照[细讲项目](../skills/project-research/dissect.md)：先定领域和 baseline，照[盘问我](../skills/grilling.md)一轮轮定下功能线，再按论文的骨架写。

- **一个项目一个目录**：`index.md` 先说领域，再按功能线写「问题 → 功能」，每一步的问题要具体到一个案例，只写现状、不写作者的心路历程；每条功能线一页细讲，同样只写现状。小 bug 不记，说不定哪天就修了，只写主线
- **以代码为准**：README 只当线索，结论落到文件路径上；读的是哪个 commit、许可、素材从哪来，写进[维护](../maintenance/index.md#projects)一篇，正文不逐处标版本
- **能跑就实跑**：拼 prompt 这类事，每一步贴两样——源码里的模版（存档一份同版源码，snippet 按行引用）和用这段代码真跑出来的效果；实验设置和脚本写进维护记录
- **只粗讲的项目只有一页**：目录里只放 `index.md`，正文就是照[粗讲项目](../skills/project-research/gist.md)讲的三四段话，不套论文骨架；读的 commit 写进脚注，不另开维护记录。讲完的追问在正文后开「追问」一节按问答补，一问一个三级标题，问题照提问的原话，答案不限字数 —— 活例 [Teable](teable/index.md#qa)。要细讲时整页按上面重写

## 按领域 { #projects }

### AI 角色扮演

- [梨园 Liyuan](liyuan/index.md) —— 领域是 AI 角色扮演，它把角色扮演从一次生成改成 agent 循环；以网页版 ChatGPT 为 baseline，按设定、状态、长对话、分支、正文、定制、数据七条功能线讲问题和功能，每步配源码模版和实跑效果，结论是能搬走的设计
- [酒馆 SillyTavern](sillytavern/index.md) —— 领域是 AI 角色扮演，它把网页版 ChatGPT 的一段 system prompt 换成每轮重拼的上下文；按角色卡、世界书、现拼 prompt、喂各种模型、重来分叉、聊久了、群聊、自加规则八条功能线讲问题和功能，每步配源码模版和实跑效果，结论是能搬走的设计
- [PawzoChat](pawzochat/index.md) —— 粗讲：和梨园、酒馆不是一类，不是角色扮演前端，是把角色接进微信、QQ 当联系人的 AI 伙伴引擎；只借酒馆的卡格式，主路径是连发停 7 秒才合成一轮、回复按反斜线切成几条气泡

### Agent 与评测

- [DeepSeek Harness](deepseek-harness/index.md) —— DeepSeek Harness 拆解：领域是 agent harness，以 pi 为 baseline，按插件、会话日志、拼 prompt、压缩、工具与沙箱、多 agent 六条线讲问题和功能，配源码模版和实跑；重心是请求从会话日志现算
- [OpenAI Evals](openai-evals/index.md) —— OpenAI Evals 拆解：领域是大模型评测框架，以 for 循环评测脚本为 baseline，按登记、判分、被测对象、多轮、跑和记五条线讲问题和功能，配源码模版；重心是一个 eval 等于数据加 YAML 里选一个模板类
- [DeepSeek 视频问答](deepseek-video-rag/index.md) —— 粗讲：给 agent 挂的 skill，模型不收视频，就把录像拆成带时间标签的帧逐帧做卡片、拼成 30 秒一段；提问时 TF-IDF 粗筛、模型挑段、开推理深读，答案带时刻，准不准由人回放片段核对
- [搭建 AI 助手](ai-assistant/index.md) —— 给常驻 Agent 接输入输出通道；已落地的第一条是[不装邮件服务、自己在 25 端口说 SMTP](ai-assistant/mail-intake.md)，第二条是 [Caddy 换 key 的 API 中转](ai-assistant/api-gateway.md)（已接 DeepSeek）

### 开发工具

- [Teable](teable/index.md) —— 粗讲：不是又一个在线表格，是套了表格外壳的 Postgres；程序管结构和联动计算，模型只填 AI 字段；重心是改一格后跨表连锁重算；追问两条：更像 Airtable，计算字段不靠触发器、在应用层算
- [Coolify](coolify/index.md) —— 粗讲：和 Podman 不在一层，它不是容器引擎，是坐在 Docker 之上的自托管 Heroku；主路径是 SSH 进目标机起 helper 容器构建镜像，用带 Traefik label 的 compose 拉起
- [Pyodide](pyodide/index.md) —— 粗讲：不是把 Python 翻译成 JS，是把 CPython 解释器编译成 WebAssembly；Python 的 import 是同步的、下载只能异步，所以包要先 loadPackage 解进内存文件系统，.so 提前 dlopen
- [Frappe Gantt](frappe-gantt/index.md) —— 粗讲：给网页用的甘特图组件，只画图、改内存里的任务，不存也不排期；主路径是日期和像素按列宽互换，拖一条任务时依赖它的下游跟着平移，存回后端靠 on_date_change 交给用的人

### 知识库

- [wiki 介绍](wiki/index.md) —— 这个 wiki 自己的事：[目标与计划](wiki/roadmap.md)、[怎么当远程 skill 用](wiki/everything-skill.md)、[板块怎么分](wiki/sections.md)、用到的技术一项一页（[对象存储部署](wiki/cos-deploy/index.md)、[自建 git-lfs 后端](wiki/git-lfs.md)、[打码](wiki/age-mosaic.md)），文末能力时间线按日期列出在 Zensical 之上加过的每项功能，附当时的需求原话和改了哪里
- [Docmost](docmost/index.md) —— 粗讲：不是一个人用的在线记事本，是自托管的团队 wiki；主路径是每页一份 Yjs 文档，经 Hocuspocus 实时合并多人改动，停笔 10 秒连同 JSON 和纯文本一起落库；开源版模型不参与，AI 在闭源 ee 子模块；追问两条：不是 Office 套件，Bases 要付费、ppt 只有演示模式；和 git 仓库加 Zensical 比，差在谁来写、谁来读

### 硬件

- [让 Kindle 常显一块 Token 看板](kindle-dashboard/index.md) —— 墨水屏的两条硬约束（刷新有代价、只有 16 级灰）反推出的整套设计；附[越狱与显示通道实操](kindle-dashboard/reference/jailbreak.md)、[上报接口交接](kindle-dashboard/reference/report-api.md)与[决策日志](kindle-dashboard/reference/decision-log.md)

### 演示

- [会动的网页 PPT 是怎么做出来的](animated-ppt/index.md) —— 关键帧图 + 首尾帧视频 + 滚动叙事引擎，附最深的坑（all-intra 重编码）和可复用的[工程手册](../skills/writing/deck.md)
