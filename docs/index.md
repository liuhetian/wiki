# 牛合天's wiki

> AI 友好的个人知识库：每个页面在同域提供 `.md` 源（把 URL 结尾的 `/` 换成 `.md` 即可），LLM 可顺相对链接一层层读进去 —— 整份 wiki 可当远程 skill 用。设计与落地详见 [用对象存储部署 AI 友好的个人知识库](posts/cos-wiki-deploy/index.md)。

## 文章

- [工作方法](posts/methods/index.md) —— 精力管理、推进执行和做出决策
- [用对象存储部署 AI 友好的个人知识库](posts/cos-wiki-deploy/index.md) —— 讲这个站点本身的定位设计与部署过程
- [预测项目闭环](posts/prediction-loop.md) —— 把「写完就扔」的脚本养成能被 AI 运维的系统
- [建站手记](posts/cos-wiki-deploy/reference/wiki-build-log.md) —— 这个 wiki 是怎么一点点长起来的
- [把下午调回可用状态](posts/afternoon-reset/index.md) —— 清空桌面、制造凉意、缩小任务入口

## 笔记

算法、概率、机器学习和编程语言等专业科目的学习与推导：

- [概率与算法](notes/probability/index.md) —— 从 [12 枚硬币的奇偶性](notes/probability/coin-parity.md) 起步

## Skills

给 AI 挂载执行的成套资产，按 Claude skill 标准目录组织，每套都可以直接当远程 skill 用：

- [FastAPI 后端](skills/fastapi/index.md) —— 依赖注入、SQLModel 分层建模、按需参考的一整套后端约定
- [Dashboard 后台](skills/dashboard/index.md) —— 形状目录 + 每形状一个可玩的活 demo
- [写作口味](skills/writing/index.md) —— MkDocs Wiki 文档、报纸版 HTML、去 AI 味
- [前端风格收集](skills/frontend-styles/index.md) —— 有特色的前端美学，一种风格一个可抄的活 demo
- [和 AI 协作](skills/collab/index.md) —— CLAUDE.md 模板 + 盘问式协作
