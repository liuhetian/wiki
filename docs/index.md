---
template: home.html
hide:
  - navigation
  - toc
description: "AI 友好的个人知识库：每个页面在同域提供 .md 源，普通页把 URL 结尾的 / 换成 .md，目录首页在结尾加 index.md，LLM 可顺相对链接一层层读进去。收录一个问题一篇的文章、自己做的和拆别人的项目、学科笔记、图配 prompt 的 Gallery、可挂载的 AI skills，以及它们背后的维护记录。"
---

<!-- 浏览器里首页由 overrides/home.html（SaaS 开屏）渲染，下面的正文不上屏，
     但会原样发布为同域 index.md 源给 LLM 读。改开屏内容时记得两边同步。 -->

# 牛合天's wiki

> AI 友好的个人知识库：每个页面在同域提供 `.md` 源（普通页把 URL 结尾的 `/` 换成 `.md`，目录首页在结尾加 `index.md`；页头 `<link rel="alternate" type="text/markdown">` 直接给出地址），LLM 可顺相对链接一层层读进去 —— 整份 wiki 可当远程 skill 用。设计与落地详见 [用对象存储部署 AI 友好的个人知识库](projects/wiki/cos-deploy/index.md)。

## 文章

一篇文章定义一个问题、提出解决方案，像一篇论文；论文笔记也是文章。全部在[文章索引](posts/index.md)。几篇代表：

- [预测项目闭环](posts/prediction-loop.md) —— 把「写完就扔」的脚本养成能被 AI 运维的系统
- [上线前的三层验收](posts/release-acceptance.md) —— 自己想用例一定漏：黄金用例保下限、evals 保变更不退化、线上差评回灌保覆盖面增长
- [AI 时代的产品经理](posts/ai-pm.md) —— 算法岗顶上 PM 缺位的一个月：五步框架、两条回边，和用卡片汇报谈判性进展

## 项目

为了交付同一个东西，把互相牵连的问题收在一起，自己做的、拆别人的都算，一个项目一个目录，全部在[项目索引](projects/index.md)：

- [wiki 介绍](projects/wiki/index.md) —— 这个 wiki 自己的事：[目标与计划](projects/wiki/roadmap.md)（专业主干补到应用统计研究生的水平）、怎么当远程 skill 用、[板块怎么分](projects/wiki/sections.md)和东西为什么这样收、用到的技术一项一页（[对象存储部署](projects/wiki/cos-deploy/index.md)、自建 git-lfs、打码）
- [梨园 Liyuan](projects/liyuan/index.md) —— 把角色扮演从一次生成改成 agent 循环：以网页版 ChatGPT 为 baseline，按七条功能线讲每个具体问题引入了什么功能，结论是能搬走的设计
- [让 Kindle 常显一块 Token 看板](projects/kindle-dashboard/index.md) —— 墨水屏的两条硬约束（刷新有代价、只有 16 级灰）反推出的整套设计

## 笔记

算法、概率、统计、机器学习和编程语言等专业科目的学习与推导，全部分类在[笔记索引](notes/index.md)。几个入口：

- [概率与算法](notes/probability/index.md) —— 从 [12 枚硬币的奇偶性](notes/probability/coin-parity.md) 起步
- [机器学习](notes/machine-learning/index.md) —— 从[用西瓜搞懂准确率、精确率和召回率](notes/machine-learning/classification-metrics/index.md)起步
- [Git](notes/git/index.md) —— 从 [stash 不是剪贴板，是个游离的 merge commit](notes/git/stash.md) 起步

## Gallery

成品参考，别人的原样收录、本站自己做的链到做法 skill，按媒介分图片、排版、色彩、视频、音频、网页六区，另有人设一区，全部在 [Gallery 索引](gallery/index.md)：

- [图片](gallery/images/index.md) —— 一张图配一段生成它的 prompt，7 大类共 175 条：GPT Image 2 的 163 条（译成中文）+ [二次元平面设计风格](gallery/images/linux-do-style/gallery-anime-graphic-design.md) 12 组；另有把照片做成[旧刊物海报](gallery/images/collected/gallery-pulp-posters.md)的样片（做法拆成了同名 [skill](skills/pulp-poster.md)），和小红书收来的[拍照姿势](gallery/images/index.md#poses)实拍图 59 组
- [网页](gallery/web/index.md) —— [前端风格收集](gallery/web/frontend-styles/index.md)：有特色的前端美学，一种风格一个可抄的活 demo
- [视频](gallery/video/index.md) —— 视频成品配制作方法：本站自己做的[花卉动态生长海报](gallery/video/flower-growth-poster.md)，收录的[彩色手绘三维穿梭视频](gallery/video/collected/gallery-parallax-ink.md)，做法都写在成品下面
- [人设](gallery/personas/index.md) —— 角色设定一人一页：[SEOA｜徐星澄](gallery/personas/seoa.md)，24 岁，主舞兼创作型歌手
- 音频区还没有收录
- [收藏夹 · 网站](bookmarks/websites.md) —— 好用的工具站、值得常看的博客这类整站，只存链接、每条写清为什么收；已收 3 个：HeroSMS（接码）、zhanghaoya.com（买号）、guatizi.com（梯子）

## Skills

给 AI 挂载执行的成套资产，按 Claude skill 标准目录组织，每套都可以直接当远程 skill 用，全部在 [Skills 索引](skills/index.md)：

- [本 wiki 写作规范](skills/wiki-guide/index.md) —— 往这个 wiki 写东西前先读：页面怎么写、放哪个板块、什么场景用什么语法；课程页、收纳 skill、精简检查是子 skill
- [FastAPI 后端](skills/fastapi/index.md) —— 依赖注入、SQLModel 分层建模、按需参考的一整套后端约定
- [Dashboard 后台](skills/dashboard/index.md) —— 形状目录 + 每形状一个可玩的活 demo
- [写作口味](skills/writing/index.md) —— 报纸版 HTML、滚动 deck、去 AI 味、檄文
- [和 AI 协作的几个 skill](skills/index.md#collab) —— 初始化项目、盘问我、带文档盘问、对话提示词，各自独立

## 维护

skill 和 Agent 能力背后的事：为什么这样选、从哪来、改过什么、实测过什么、还有什么没做。AI 正常使用不用看，出问题或要改做法时再看，全部在[维护索引](maintenance/index.md)：

- [Agent 能力](maintenance/index.md#agent-io) —— 读 PDF、网络搜索、语音合成、图片、视频、音乐、转录、解析分享链接、结构化判断，一个能力一篇选型实测
- [Skill 吸纳](maintenance/index.md#skills) —— 吸纳来的 skill 一个一篇：上游、commit、跳过了什么、翻译之外的改动
