---
description: "给 AI 挂载执行的成套资产：我自己在长期使用中沉淀下来的实践集合，按 Claude skill 的标准目录组织、作为给 Claude Code 的 skill 维护，同时整理成人可读的页面发到这里。每套讲的都是「怎么做、为什么这么做」，不是教程；URL 保持稳定，整棵树可以直接当远程 skill 用"
copy_source: true
---

# Skills

给 AI 挂载执行的成套资产：我自己在长期使用中沉淀下来的实践集合，按 Claude skill 的标准目录组织、作为给 Claude Code 的 skill 维护，同时整理成人可读的页面发到这里。每套讲的都是「怎么做、为什么这么做」，不是教程；URL 保持稳定，整棵树可以直接当远程 skill 用。

## 基础

- [本 wiki 写作规范](wiki-guide/index.md) —— 往这个 wiki 写东西前先读：写作流程、放哪个板块、硬规矩、什么场景用什么语法、文风；课程页怎么写、收纳 skill、精简检查是三个子 skill
- [Agent 基础能力](agent-io/index.md) —— 给新 Agent 装上读 PDF、音视频、生成媒体、网络搜索等能力：每个能力一篇接入说明，需要时配一个 `uv run` 脚本；已接入：阅读 PDF、转录音频、阅读视频、网络搜索、解析分享链接、读取邮箱、生成语音、生成音乐、生成编辑图片、生成视频、调用 DeepSeek、结构化判断（默认 Jev，另接三家）

## 调研与收集

- [调研项目](project-research/index.md) —— 要弄懂、拆解或复刻别人的项目时用：只想知道它是什么，用粗讲项目讲三四段大白话；要学它的设计，用细讲项目照论文骨架写一组文档；要从零复刻、对比同领域几个项目或做实验，用写书写成一本书。都先读源码，文档只当线索
- [整理视频为笔记](video-note/index.md) —— 要把视频或图文帖整理成学习笔记时用：分下载、分析、输出三段，前两段跑 agent-io 的平台下载脚本和 video_read，取下内容、出关键帧和转写；输出段出证据索引和篇幅预算，Agent 按预算写学习型笔记，写完打分验收（吸纳自 Rimagination/bili-note）
- [获取热点](hot-topics/index.md) —— 想知道 AI 圈此刻在热什么、最近发生了什么时用：当前热点榜和事件来龙去脉、过去 24 小时或一周的精选、按公司模型人物搜最近动态、日报周报月报；一个信息源一篇，现在接了 AIHOT 和 linux.do 日报（音频）

## 写作与协作 { #collab }

- [写作口味](writing/index.md) —— 报纸版 HTML、滚动 deck、去 AI 味、檄文，互相独立的写作 skill
- [初始化项目（init-project）](init-project.md) —— 新项目初始化时用：让 AI 把四条编码守则写进项目根的 `CLAUDE.md` 或 `AGENTS.md`，之后每次会话都生效（吸纳自 multica-ai/andrej-karpathy-skills，MIT，中译；[维护记录](../maintenance/skills/init-project.md)）
- [盘问我（grilling）](grilling.md) —— 给方案、决定或想法做压力测试时用，说 grill（盘问）类触发词也算：AI 按设计树一轮一轮编号提问、每题附推荐答案，事实自己查、决策等用户答，达成一致前不动手（吸纳自 mattpocock/skills，中译；[维护记录](../maintenance/skills/grilling.md)）
- [带文档盘问（grill-with-docs）](grill-with-docs/index.md) —— 想把方案或设计盘问清楚、同时留下文档时用：按盘问我一轮轮拷问，边问边把术语写进 `GLOSSARY.md`、把难以回退的决策写成 ADR；依赖的[领域建模](grill-with-docs/domain-modeling/index.md)聊术语、写 ADR 时也能单独用（吸纳自 mattpocock/skills，中译；[维护记录](../maintenance/skills/grill-with-docs.md)）
- [对话提示词](chat-prompts/index.md) —— 按场景挑一段对话 prompt 照做：理清问题、查证研究、学概念、写作与方案、职业与人生五类共 18 个，每个是独立的 skill，整页能直接粘进对话框（17 个取自 prompt-cards.cyanfish.site，去掉卡牌包装重组；说人话取自小红书 Krypto说AI 的《让AI说人话》；[维护记录](../maintenance/skills/chat-prompts.md)）

## 演示文稿

- [PPT Master](ppt-master/index.md) —— 做 PPT、幻灯片、课件时用：要生成可编辑的原生 PPTX，装上游 ppt-master 跑；先规划、定讲法、写配图 prompt，用规划 deck、沟通模式、生成配图三个子 skill，视觉风格、画风、版型在 Gallery 挑（吸纳自 hugohe3/ppt-master，MIT，中译；[维护记录](../maintenance/skills/ppt-master.md)）

## 出图与视频

- [手绘风格出图](handdraw/index.md) —— 从 365 种画风、167 种版式、36 种主题色里挑组合拼成生图 prompt：单张图、海报、文章或视频封面、长文配图、两种画风融合、IP 形象全套卡片；数据在 Gallery 的手绘风格库，吸纳自 yang0/handraw-style
- [写真拍摄企划](photo-shoot/index.md) —— 要策划人像拍摄、出写真样片时用：个人写真、情侣、婚纱、亲子、全家福、古风、Cosplay 等任意题材和人数；首轮出三张时空方向卡，选定后逐人定服装发型妆容、编 8 张 Shot，出一张 8 宫格预览和分享文案；出图走 agent-io，保存工程时带 9 个脚本（吸纳自 yang0/handraw-style 的 couple-photo-orchestrator，MIT）
- [图片提示词反推](image-prompt-reverse/index.md) —— 从参考图反推生图 prompt：简化版[七维拆解](image-prompt-reverse/seven-dimensions/index.md)，人弄懂拆法、自己跟看图模型分两轮问（整理自 linux.do 帖子；[维护记录](../maintenance/skills/seven-dimensions.md)）；完整版[从图反推 prompt](image-prompt-reverse/get-prompt-from-image/index.md)，AI 直接产出中英正向 prompt 和负向词（吸纳自 wuyoscar/GPT-Image2-Skill，原作者 LunarXuan，MIT，中译；[维护记录](../maintenance/skills/get-prompt-from-image.md)）
- [anidoodle 代码手绘](anidoodle/index.md) —— 要用代码画画、做动画时用：32 种画风的静帧、自己画出来的延时、任意长度的影片、讲解片、发布片和响应页面操作的网页动画，配乐也用代码作曲；能仿用户给的图的画风、跨镜头保持角色一致、教人画画。同一份源码到哪都出同样的像素和声音，不用任何生成素材；带 Node 引擎和 30 篇画风配方（吸纳自 alexgreensh/anidoodle，Apache-2.0）
- [视频生成](video-gen/index.md) —— 用生图、生视频模型做 AI 视频时用：按题材和环节挑子 skill；已收东方仙侠视觉导演，给仙侠场景写单张画面和视频关键帧的生图提示词（吸纳自 liyue-aigc/xianxia-visual-director）
- [HyperFrames 视频](hyperframes/index.md) —— 用 HTML 做视频：HeyGen 开源的 21 个视频 skill 全套中译，从一个路由 skill 读起，访谈确认 brief 后分派给发布片、讲解视频、PR 讲解、口播字幕、卡点视频、deck 等 10 个创作工作流，按需加载 composition 契约、动效配方、媒体等领域 skill；带 142 个本地执行脚本（吸收自 heygen-com/hyperframes，Apache-2.0）

## 写代码

- [FastAPI 后端](fastapi/index.md) —— 依赖注入、SQLModel 分层建模、按需参考的一整套后端约定
- [Dashboard 后台](dashboard/index.md) —— 形状目录 + 每形状一个可玩的活 demo
- [数据可视化](data-visualization/index.md) —— 可视化 skill 的大目录；每套方法独立维护规则、模板与可运行 demo
- [前端画布](canvas/index.md) —— 无限画布/白板/节点图的 L1–L4 四级选型，比较成本与实用性，每级一个可玩的活 demo
- [让布局说话（ui-no-labels）](ui-no-labels.md) —— 要让 AI 做界面的项目用：让 AI 把一条界面守则写进项目根的 `CLAUDE.md` 或 `AGENTS.md` —— 不加多余的次级标签和说明文字，让布局自己说明，免得界面堆满标签、像说明书（取自 @Ainward 的一张截图；[维护记录](../maintenance/skills/ui-no-labels.md)）
