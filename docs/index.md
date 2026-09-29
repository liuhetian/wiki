---
template: home.html
hide:
  - navigation
  - toc
description: "AI 友好的个人知识库：每个页面在同域提供 .md 源，把 URL 结尾的 / 换成 .md 即可，LLM 可顺相对链接一层层读进去。收录项目复盘、学科笔记、教材伴读课程、可挂载的 AI skills 与图配 prompt 的图库。"
---

<!-- 浏览器里首页由 overrides/home.html（SaaS 开屏）渲染，下面的正文不上屏，
     但会原样发布为同域 index.md 源给 LLM 读。改开屏内容时记得两边同步。 -->

# 牛合天's wiki

> AI 友好的个人知识库：每个页面在同域提供 `.md` 源（把 URL 结尾的 `/` 换成 `.md` 即可），LLM 可顺相对链接一层层读进去 —— 整份 wiki 可当远程 skill 用。设计与落地详见 [用对象存储部署 AI 友好的个人知识库](posts/cos-wiki-deploy/index.md)。

## 文章

完整可独立阅读的复盘、观点与方法整理，全部在[文章索引](posts/index.md)。几篇代表：

- [工作方法](posts/methods/index.md) —— 精力管理、推进执行和做出决策
- [用对象存储部署 AI 友好的个人知识库](posts/cos-wiki-deploy/index.md) —— 讲这个站点本身的定位设计与部署过程
- [预测项目闭环](posts/prediction-loop.md) —— 把「写完就扔」的脚本养成能被 AI 运维的系统
- [建站手记](posts/cos-wiki-deploy/reference/wiki-build-log.md) —— 这个 wiki 是怎么一点点长起来的
- [本 wiki 的目标与计划](posts/wiki-roadmap.md) —— 专业主干要补到应用统计研究生的水平：缺口审核、板块布局、内容清单与进度表

## 笔记

算法、概率、统计、机器学习和编程语言等专业科目的学习与推导，全部分类在[笔记索引](notes/index.md)。几个入口：

- [概率与算法](notes/probability/index.md) —— 从 [12 枚硬币的奇偶性](notes/probability/coin-parity.md) 起步
- [机器学习](notes/machine-learning/index.md) —— 从[用西瓜搞懂准确率、精确率和召回率](notes/machine-learning/classification-metrics/index.md)起步
- [Git](notes/git/index.md) —— 从 [stash 不是剪贴板，是个游离的 merge commit](notes/git/stash.md) 起步

## 课程

讲解在前、题在后：前半把一章的心智模型讲透，后半的题不自己算出数来就答不过去。答完才归档成笔记。全部在[课程索引](courses/index.md)：

- [课程是怎么设计的](courses/index.md) —— 为什么用冲突标记提问、checkout → 答题 → add 的环路、给 AI 的上课流程
- [统计学（教材伴读）](courses/statistics-book/index.md) —— 跟着向蓉美《统计学》第三版走，公式全部对着原书页图重排

## Skills

给 AI 挂载执行的成套资产，按 Claude skill 标准目录组织，每套都可以直接当远程 skill 用，全部在 [Skills 索引](skills/index.md)：

- [本 wiki 写作规范](skills/wiki-guide/index.md) —— 往这个 wiki 写东西前先读：格式怎么写、课程页怎么写、skill 怎么收纳
- [FastAPI 后端](skills/fastapi/index.md) —— 依赖注入、SQLModel 分层建模、按需参考的一整套后端约定
- [Dashboard 后台](skills/dashboard/index.md) —— 形状目录 + 每形状一个可玩的活 demo
- [写作口味](skills/writing/index.md) —— 报纸版 HTML、滚动 deck、去 AI 味、檄文
- [和 AI 协作](skills/collab/index.md) —— CLAUDE.md 模板 + 盘问式协作 + 两个图片提示词反推 skill

## Gallery

原样收录的成品参考，按媒介分图片 / 视频 / 音频 / 网页四区，全部在 [Gallery 索引](gallery/index.md)：

- [图片](gallery/images/index.md) —— 一张图配一段生成它的 prompt，7 大类共 175 条：GPT Image 2 的 163 条（译成中文）+ [二次元平面设计风格](gallery/images/linux-do-style/gallery-anime-graphic-design.md) 12 组
- [网页](gallery/web/index.md) —— [前端风格收集](gallery/web/frontend-styles/index.md)：有特色的前端美学，一种风格一个可抄的活 demo
- 视频、音频两区还没有收录
