---
description: "给 AI 挂载执行的成套资产：我自己在长期使用中沉淀下来的实践集合，按 Claude skill 的标准目录组织、作为给 Claude Code 的 skill 维护，同时整理成人可读的页面发到这里。每套讲的都是「怎么做、为什么这么做」，不是教程；URL 保持稳定，整棵树可以直接当远程 skill 用"
---

# Skills

给 AI 挂载执行的成套资产：我自己在长期使用中沉淀下来的实践集合，按 Claude skill 的标准目录组织、作为给 Claude Code 的 skill 维护，同时整理成人可读的页面发到这里。每套讲的都是「怎么做、为什么这么做」，不是教程；URL 保持稳定，整棵树可以直接当远程 skill 用。

- [本 wiki 写作规范](wiki-guide/index.md) —— 往这个 wiki 写东西前先读：写作流程、放哪个板块、硬规矩、什么场景用什么语法、文风；课程页怎么写、收纳 skill、精简检查是三个子 skill
- [Agent 基础能力](agent-io/index.md) —— 给新 Agent 装上读 PDF、音视频、生成媒体、网络搜索等能力：每个能力一篇接入说明，需要时配一个 `uv run` 脚本；已接入：阅读 PDF、转录音频、阅读视频、网络搜索、解析分享链接、生成语音、生成音乐、生成编辑图片、生成视频、调用 DeepSeek、结构化判断（默认 Jev，另接三家）
- [FastAPI 后端](fastapi/index.md) —— 依赖注入、SQLModel 分层建模、按需参考的一整套后端约定
- [Dashboard 后台](dashboard/index.md) —— 形状目录 + 每形状一个可玩的活 demo
- [数据可视化](data-visualization/index.md) —— 可视化 skill 的大目录；每套方法独立维护规则、模板与可运行 demo
- [前端画布](canvas/index.md) —— 无限画布/白板/节点图的 L1–L4 四级选型，比较成本与实用性，每级一个可玩的活 demo
- [写作口味](writing/index.md) —— 报纸版 HTML、滚动 deck、去 AI 味、檄文，互相独立的写作 skill
- [和 AI 协作](collab/index.md) —— 初始化项目（Karpathy 四条编码守则）+ 盘问我 + 对话提示词 + 图片提示词反推（简化、完整两版；吸收自 andrej-karpathy-skills、mattpocock/skills、prompt-cards.cyanfish.site、小红书 Krypto说AI、linux.do 帖子、wuyoscar/GPT-Image2-Skill）
- [AI 调研写手册](book-writer/index.md) —— 让 AI 先探索一个仓库再动笔写文档手册：为什么不能指望 AI 写得比官方文档好、调研范围怎么收窄、以 SillyTavern prompt 工程调研计划为例
- [整理视频为笔记](video-note/index.md) —— 要把视频或图文帖整理成学习笔记时用：分下载、分析、输出三段，前两段跑 agent-io 的平台下载脚本和 video_read，取下内容、出关键帧和转写；输出段出证据索引和篇幅预算，Agent 按预算写学习型笔记，写完打分验收（吸纳自 Rimagination/bili-note）
- [HyperFrames 视频](hyperframes/index.md) —— 用 HTML 做视频：HeyGen 开源的 21 个视频 skill 全套中译，从一个路由 skill 读起，访谈确认 brief 后分派给发布片、讲解视频、PR 讲解、口播字幕、卡点视频、deck 等 10 个创作工作流，按需加载 composition 契约、动效配方、媒体等领域 skill；带 142 个本地执行脚本（吸收自 heygen-com/hyperframes，Apache-2.0）
- [anidoodle 代码手绘](anidoodle/index.md) —— 要用代码画画、做动画时用：32 种画风的静帧、自己画出来的延时、任意长度的影片、讲解片、发布片和响应页面操作的网页动画，配乐也用代码作曲；能仿用户给的图的画风、跨镜头保持角色一致、教人画画。同一份源码到哪都出同样的像素和声音，不用任何生成素材；带 Node 引擎和 30 篇画风配方（吸纳自 alexgreensh/anidoodle，Apache-2.0）
- [手绘风格出图](handdraw/index.md) —— 从 365 种画风、167 种版式、36 种主题色里挑组合拼成生图 prompt：单张图、海报、文章或视频封面、长文配图、两种画风融合、IP 形象全套卡片；数据在 Gallery 的手绘风格库，吸纳自 yang0/handraw-style
- [写真拍摄企划](photo-shoot/index.md) —— 要策划人像拍摄、出写真样片时用：个人写真、情侣、婚纱、亲子、全家福、古风、Cosplay 等任意题材和人数；首轮出三张时空方向卡，选定后逐人定服装发型妆容、编 8 张 Shot，出一张 8 宫格预览和分享文案；出图走 agent-io，保存工程时带 9 个脚本（吸纳自 yang0/handraw-style 的 couple-photo-orchestrator，MIT）
