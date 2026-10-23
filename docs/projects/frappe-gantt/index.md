---
description: "Frappe Gantt 粗讲：给网页用的甘特图组件，只画图、改内存里的任务，不存也不排期；主路径是日期和像素按列宽互换，拖一条任务时依赖它的下游跟着平移，存回后端靠 on_date_change 交给用的人"
---

# Frappe Gantt：只画图、不排期的甘特图组件

Frappe Gantt 是网页上的甘特图组件，Frappe 给 ERPNext 做甘特视图时自己写的。给它带 start、end、progress、dependencies 的任务数组，它在 SVG 里画出时间轴、任务条和依赖箭头，还能拖动改日期和进度。

主路径是日期和像素互换。view mode 定下每列多长时间、多宽，任务条的 x 就是开始日期离起点隔几列乘列宽；松手时反过来，由 x 和宽度算回起止日期。位移吸附到 snap_at 整格、跳过周末这类 ignore 区间；move_dependencies 默认开，拖一条，依赖它的下游一起平移。

它只画图、改内存里的任务，不存也不排期。拖动中每跨一格调一次 on_date_change，存回后端归用的人；任务按数组顺序一行一条，不分组，不算关键路径。

代码最多的是拖拽和滚动。换算只几行，坑在月份不等长 —— Month 视图按「月数 + 当天日期 / 31」近似定位，公式 2025 年才换过[^repo]。

[^repo]: [frappe/gantt](https://github.com/frappe/gantt/tree/5c83708d300a99d9142edea0d4d52f421e3a2e68)，读的是 commit `5c83708`，2026-10-20 读。
