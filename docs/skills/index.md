---
description: "给 AI 挂载执行的成套资产：我自己在长期使用中沉淀下来的实践集合，按 Claude skill 的标准目录组织、作为给 Claude Code 的 skill 维护，同时整理成人可读的页面发到这里。每套讲的都是「怎么做、为什么这么做」，不是教程；URL 保持稳定，整棵树可以直接当远程 skill 用"
---

# Skills

给 AI 挂载执行的成套资产：我自己在长期使用中沉淀下来的实践集合，按 Claude skill 的标准目录组织、作为给 Claude Code 的 skill 维护，同时整理成人可读的页面发到这里。每套讲的都是「怎么做、为什么这么做」，不是教程；URL 保持稳定，整棵树可以直接当远程 skill 用。

- [本 wiki 写作规范](wiki-guide/index.md) —— 往这个 wiki 写东西前先读：写作流程、放哪个板块、硬规矩、什么场景用什么语法、文风；课程页怎么写、收纳 skill、精简检查是三个子 skill
- [Agent 基础能力](agent-io/index.md) —— 给新 Agent 装上读 PDF、音视频、生成媒体、网络搜索等能力：每个能力一篇接入说明，需要时配一个 `uv run` 脚本；已接入：阅读 PDF、转录音频、网络搜索、生成语音、生成音乐、生成编辑图片、生成视频、调用 DeepSeek、结构化判断（默认 Jev，另接三家）
- [FastAPI 后端](fastapi/index.md) —— 依赖注入、SQLModel 分层建模、按需参考的一整套后端约定
- [Dashboard 后台](dashboard/index.md) —— 形状目录 + 每形状一个可玩的活 demo
- [数据可视化](data-visualization/index.md) —— 可视化 skill 的大目录；每套方法独立维护规则、模板与可运行 demo
- [前端画布](canvas/index.md) —— 无限画布/白板/节点图的 L1–L4 四级选型，比较成本与实用性，每级一个可玩的活 demo
- [写作口味](writing/index.md) —— 报纸版 HTML、滚动 deck、去 AI 味、檄文，互相独立的写作 skill
- [和 AI 协作](collab/index.md) —— 初始化项目（Karpathy 四条编码守则）+ 盘问我 + 对话提示词 + 图片提示词反推（简化、完整两版；吸收自 andrej-karpathy-skills、mattpocock/skills、prompt-cards.cyanfish.site、linux.do 帖子、wuyoscar/GPT-Image2-Skill）
- [AI 调研写手册](book-writer/index.md) —— 让 AI 先探索一个仓库再动笔写文档手册：为什么不能指望 AI 写得比官方文档好、调研范围怎么收窄、以 SillyTavern prompt 工程调研计划为例
- [B站视频笔记](bili-note/index.md) —— 要把 B站视频或图文动态整理成学习笔记时用：脚本抓元数据、公开字幕、评论和图文，没字幕就经 agent-io 下载视频、转写音频，按需抽关键帧，全部归档成证据索引；Agent 按预算写学习型笔记，写完打分验收；8 个脚本要下载到本地执行（吸纳自 Rimagination/bili-note）
- [HyperFrames 视频](hyperframes/index.md) —— 用 HTML 做视频：HeyGen 开源的 21 个视频 skill 全套中译，从一个路由 skill 读起，访谈确认 brief 后分派给发布片、讲解视频、PR 讲解、口播字幕、卡点视频、deck 等 10 个创作工作流，按需加载 composition 契约、动效配方、媒体等领域 skill；带 142 个本地执行脚本（吸收自 [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)，Apache-2.0；来源与改动见 [MIRROR](hyperframes/MIRROR.md)）
