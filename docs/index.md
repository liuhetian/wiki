---
template: home.html
hide:
  - navigation
  - toc
description: "AI 友好的个人知识库：每个页面在同域提供 .md 源，普通页把 URL 结尾的 / 换成 .md，目录首页在结尾加 index.md，LLM 可顺相对链接一层层读进去。板块按一根从通用到具体的轴排：学科笔记、拿来就挑的 Gallery、讲通用问题的文章、讲一个具体东西的项目（自己做的和拆别人的）；可挂载的 AI skills 是这根轴的背面；轴外是只存链接的收藏夹和背后的维护记录。"
---

<!-- 浏览器里首页由 overrides/home.html（SaaS 开屏）渲染，下面的正文不上屏，
     但会原样发布为同域 index.md 源给 LLM 读。改开屏内容时记得两边同步。 -->

# 牛合天's wiki

> AI 友好的个人知识库：每个页面在同域提供 `.md` 源（普通页把 URL 结尾的 `/` 换成 `.md`，目录首页在结尾加 `index.md`；页头 `<link rel="alternate" type="text/markdown">` 直接给出地址），LLM 可顺相对链接一层层读进去 —— 整份 wiki 可当远程 skill 用。设计与落地详见 [用对象存储部署 AI 友好的个人知识库](projects/wiki/cos-deploy/index.md)。

板块按一根从通用到具体的轴排：笔记、Gallery、文章、项目；Skills 是这根轴的背面，每一层给 AI 照着做的影子；收藏夹和维护在轴外。为什么这样分见[板块怎么分](projects/wiki/sections.md)。

## 文章

文章讲一个通用问题：定义问题，给几种方案和依据，讲各自适合什么、怎么选，像一篇论文；代码只是示意，论文笔记也是文章。全部在[文章索引](posts/index.md)。几篇代表：

- [预测项目闭环](posts/prediction-loop.md) —— 把「写完就扔」的脚本养成能被 AI 运维的系统
- [上线前的三层验收](posts/release-acceptance.md) —— 自己想用例一定漏：黄金用例保下限、evals 保变更不退化、线上差评回灌保覆盖面增长
- [AI 时代的产品经理](posts/ai-pm.md) —— 算法岗顶上 PM 缺位的一个月：五步框架、两条回边，和用卡片汇报谈判性进展

## 项目

项目是一个具体的东西：自己做的软件、别人的仓库，讲它解了哪些问题，每个问题只留它那一种方案；概要讲它是什么，粗讲按功能展示机制与实例，细讲沿问题拆源码和验证。一个项目一个目录，全部在[项目索引](projects/index.md)：

- [wiki 介绍](projects/wiki/index.md) —— 这个 wiki 自己的事：[目标与计划](projects/wiki/roadmap.md)（专业主干补到应用统计研究生的水平）、怎么当远程 skill 用、[板块怎么分](projects/wiki/sections.md)和东西为什么这样收、用到的技术一项一页（[对象存储部署](projects/wiki/cos-deploy/index.md)、自建 git-lfs、打码）
- [梨园 Liyuan](projects/liyuan/index.md) —— 把角色扮演从一次生成改成 agent 循环：以网页版 ChatGPT 为 baseline，按七条功能线讲每个具体问题引入了什么功能，结论是能搬走的设计
- [让 Kindle 常显一块 Token 看板](projects/kindle-dashboard/index.md) —— 墨水屏的两条硬约束（刷新有代价、只有 16 级灰）反推出的整套设计
- [wenai](projects/wenai/index.md) —— 粗讲：按功能展示 prompt、档案、跨轮记忆文件与实测接续效果
- 概要 8 个仓库，一个一页：[Teable](projects/teable/index.md)、[Coolify](projects/coolify/index.md)、[Docmost](projects/docmost/index.md)、[TiddlyWiki](projects/tiddlywiki/index.md) 等

## 笔记

算法、概率、统计、机器学习和编程语言等专业科目的学习与推导，全部分类在[笔记索引](notes/index.md)。几个入口：

- [概率与算法](notes/probability/index.md) —— 从 [12 枚硬币的奇偶性](notes/probability/coin-parity.md) 起步
- [机器学习](notes/machine-learning/index.md) —— 从[用西瓜搞懂准确率、精确率和召回率](notes/machine-learning/classification-metrics/index.md)起步
- [Git](notes/git/index.md) —— 从 [stash 不是剪贴板，是个游离的 merge commit](notes/git/stash.md) 起步

## Gallery

现成的东西，通用到不用提问题就能挑：别人的原样收录、本站自己做的成品和做法写在同一页，分图片、排版、色彩、视频、音频、前端特效、人设七类，全部在 [Gallery 索引](gallery/index.md)：

- [图片](gallery/images/index.md) —— 一张图配一段生成它的 prompt，7 大类共 175 条：GPT Image 2 的 163 条（译成中文）+ [二次元平面设计风格](gallery/images/linux-do-style/gallery-anime-graphic-design.md) 12 组；另有把照片做成[旧刊物海报](gallery/images/collected/gallery-pulp-posters.md)的样片（做法拆成了同名 [skill](skills/pulp-poster.md)），和小红书收来的[拍照姿势](gallery/images/index.md#poses)实拍图 59 组
- [前端特效](gallery/web/index.md) —— [前端风格收集](gallery/web/frontend-styles/index.md)：有特色的前端美学，一种风格一个可抄的活 demo
- [视频](gallery/video/index.md) —— 视频成品配制作方法：本站自己做的[花卉动态生长海报](gallery/video/flower-growth-poster.md)，收录的[彩色手绘三维穿梭视频](gallery/video/collected/gallery-parallax-ink.md)，做法都写在成品下面
- [人设](gallery/personas/index.md) —— 角色设定一人一页：[SEOA｜徐星澄](gallery/personas/seoa.md)，24 岁，主舞兼创作型歌手
- 音频区还没有收录

## Skills

给 AI 挂载执行的成套资产，按 Claude skill 标准目录组织，每套都可以直接当远程 skill 用，全部在 [Skills 索引](skills/index.md)：

- [本 wiki 写作规范](skills/wiki-guide/index.md) —— 往这个 wiki 写东西前先读：页面怎么写、放哪个板块、什么场景用什么语法；课程页、写 skill、精简检查是子 skill
- [FastAPI 后端](skills/fastapi/index.md) —— 依赖注入、SQLModel 分层建模、按需参考的一整套后端约定
- [Dashboard 后台](skills/dashboard/index.md) —— 形状目录 + 每形状一个可玩的活 demo
- [写作口味](skills/writing/index.md) —— 报纸版 HTML、滚动 deck、去 AI 味、檄文
- [和 AI 协作的几个 skill](skills/index.md#collab) —— 初始化项目、盘问我、带文档盘问、对话提示词，各自独立

## 收藏夹

外面的整个来源，里面什么层的东西都有，只存链接、每条写清为什么收、拆出过什么；按来源的形态分页，全部在[收藏夹索引](bookmarks/index.md)：

- [社区和论坛](bookmarks/community.md) —— linux.do
- [人](bookmarks/people.md) —— 小红书、linux.do 上的作者，工作室 Lusion
- [合集和导航站](bookmarks/collections.md) —— prompt 卡牌图鉴、agent 用例合集、梯子合集
- [工具和服务](bookmarks/tools.md) —— 接码、买号、下歌、内网穿透

## 维护

skill 和 Agent 能力背后的事：为什么这样选、从哪来、改过什么、实测过什么、还有什么没做。AI 正常使用不用看，出问题或要改做法时再看，全部在[维护索引](maintenance/index.md)：

- [Agent 能力](maintenance/index.md#agent-io) —— 读 PDF、网络搜索、语音合成、图片、视频、音乐、转录、解析分享链接、结构化判断，一个能力一篇选型实测
- [Skill 吸纳](maintenance/index.md#skills) —— 吸纳来的 skill 一个一篇：上游、commit、跳过了什么、翻译之外的改动
