---
description: "给 AI 挂载执行的成套资产：我自己在长期使用中沉淀下来的实践集合，按 Claude skill 的标准目录组织、作为给 Claude Code 的 skill 维护，同时整理成人可读的页面发到这里。每套讲的都是「怎么做、为什么这么做」，不是教程；URL 保持稳定，整棵树可以直接当远程 skill 用"
---

# Skills

给 AI 挂载执行的成套资产：我自己在长期使用中沉淀下来的实践集合，按 Claude skill 的标准目录组织、作为给 Claude Code 的 skill 维护，同时整理成人可读的页面发到这里。每套讲的都是「怎么做、为什么这么做」，不是教程；URL 保持稳定，整棵树可以直接当远程 skill 用。

- [本 wiki 写作规范](wiki-guide/index.md) —— 往这个 wiki 写东西前先读：MkDocs 语法与站点规矩、课程伴读怎么写、外部 skill 怎么收成远程 skill、不想公开的东西怎么打码
- [Agent 基础能力](agent-io/index.md) —— 给新 Agent 装上读 PDF、音视频、生成媒体、网络搜索等能力：每个能力一篇接入说明加一个 `uv run` 脚本，Agent 自带同等工具时优先用自带的；已接入：阅读 PDF、调用 DeepSeek
- [FastAPI 后端](fastapi/index.md) —— 依赖注入、SQLModel 分层建模、按需参考的一整套后端约定
- [Dashboard 后台](dashboard/index.md) —— 形状目录 + 每形状一个可玩的活 demo
- [数据可视化](data-visualization/index.md) —— 可视化 skill 的大目录；每套方法独立维护规则、模板与可运行 demo
- [前端画布](canvas/index.md) —— 无限画布/白板/节点图的 L1–L4 四级选型，比较成本与实用性，每级一个可玩的活 demo
- [写作口味](writing/index.md) —— 报纸版 HTML、滚动 deck、去 AI 味、檄文，互相独立的写作 skill
- [和 AI 协作](collab/index.md) —— 新项目初始化配 `CLAUDE.md` 的通用模板 + 盘问我 + 两个图片提示词反推 skill（吸收自 [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)、[mattpocock/skills](https://github.com/mattpocock/skills)、linux.do 帖子、[wuyoscar/GPT-Image2-Skill](https://github.com/wuyoscar/GPT-Image2-Skill) 和自己踩的三个坑）
- [AI 调研写手册](book-writer/index.md) —— 让 AI 先探索一个仓库再动笔写文档手册：为什么不能指望 AI 写得比官方文档好、调研范围怎么收窄、以 SillyTavern prompt 工程调研计划为例
- [B站视频笔记](bili-note/index.md) —— 把 B站视频和图文动态整理成学习笔记：先拿字幕，拿不到再转写音频，按需抽关键帧；带 12 个 Python 脚本，要本地执行（吸收自 [Rimagination/bili-note](https://github.com/Rimagination/bili-note)，来源见 [MIRROR](bili-note/MIRROR.md)）
