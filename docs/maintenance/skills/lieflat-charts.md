---
description: "Lieflat Charts 的维护记录：蓝本 larashero3-dotcom/lieflat-charts，钉在 e5b369d；六个模板里的 48 张图拆成一图一页，每页嵌可运行的自包含 demo，文末钉模板永链；规范文档不存档"
---

# Lieflat Charts（lieflat-charts）

[Lieflat Charts](../../skills/data-visualization/lieflat-charts/index.md)的维护记录。

- **上游**：larashero3-dotcom/lieflat-charts[^repo]，规范真身在那里独立维护。许可证当时没记下来，再同步时补上
- **commit**：钉在 `e5b369d`；2026-07-28 随本仓库初始化提交入库，更早的吸收日期没记录
- **跳过**：规范文档本身不存档，要看原文走脚注里的永链
- **翻译之外的改动**：
    - `templates/` 下三个 gallery（`lupi-gallery.html` 15 张、`basics-gallery.html` 12 张、`glance-gallery.html` 18 张）和三个大图模板（`big-circular.html`、`big-force.html`、`big-threads.html`）里的 48 张图，拆成一图一页：`reference/` 下 48 篇，每篇是 iframe 里的可运行效果、数据形状与场合、编码契约与使用边界，文末折叠引用 `assets/` 下同名的自包含 HTML
    - demo 直接复用 gallery 里对应卡片的结构和渲染块，没有按截图重画；标题、副标题、图形、来源行四件套原样；运行时（ECharts、Chart.js）引站内 `/vendor/`
    - 每篇文末一行「模板来源」，钉 commit 永链指到取骨架的那个 gallery 文件
    - 入口按 Lupi Editorial → Lupi Basics → Glance → 独立交互大图分组列出 48 张，选图默认按这个顺序
    - `scripts/validate-lieflat-charts.mjs` 校验 48 篇 reference、48 个 demo、48 条 nav 一一对应，只在改这个目录时跑

[^repo]: [larashero3-dotcom/lieflat-charts @ e5b369d](https://github.com/larashero3-dotcom/lieflat-charts/tree/e5b369de1d0d32637093ee62d60bd556cf2c1af4)，2026-07-28 读。
