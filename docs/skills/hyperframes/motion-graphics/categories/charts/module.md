<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/motion-graphics/categories/charts/module.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# charts —— category 模块

由数据生成的动画**数据可视化**。无素材（"输入"就是数据）。时长短时遵循"一张图表，一个信息"。

规划或构建之前，先读[数据的运动表达](../../../hyperframes-creative/references/data-in-motion.md)。默认的图表选择按它的指导来；用户明确要求的图表类型要保留。

## 规划（Director）

`content`：`{ type: bar|line|pie|race|pct, data[], labels[], headline, axes: bool }`。对 `race`，数据必须是累计的 / 按时间分段的。

## 词汇 / 依托

- Block：**`data-chart`**（动画化的**柱状 + 折线**、错开显现、数值标签 —— 已验证：在原型 `charts-demo` 里被借用 + 定制 + 渲染成了 MP4）。
- registry 里还有：**`bar-chart-race`** —— 安装它，而不是手写一个排名竞赛。
- 缺口（手写）：**饼图 / 环形图、圆环 / 百分比** —— 没有 registry block 覆盖这些。先搜索（`npx hyperframes catalog --query "pie chart reveal" --json`），然后用 SVG/CSS 做数据 → 几何，用 GSAP 做运动。
- 标志性动画：柱子错开生长 · 折线 `stroke-dashoffset` 描绘 · 饼图径向扫过 · 圆环填充 · KPI count-up · 排名竞赛重排。

## 构建（复用优先）

复用 `data-chart`：`npx hyperframes add data-chart` → 就地编辑数据数组 + 比例尺 + 标题 / 标签 + 色板（它的数据写死在脚本里，不是一个 `--variables` 参数）。坐标轴默认隐藏；只有当数值大小本身就是信息时，才以弱化方式显示。确定性：任何动画都由 seek 时钟驱动，绝不用挂钟时间。

## Dashboard 骨架变体

对于**产品 dashboard** 这类情况：先布出一个骨架 dashboard —— 顶栏放一个**真实的测试 logo**（例如 `samples/_assets/` 里的 hyperframes logo）+ 一个标题，然后是由 3–4 张 **KPI 卡片**（每张都是一个 `stat` count-up）+ 一个 `data-chart` 面板组成的网格。显现顺序：页眉 / logo 进场 → 卡片错开进场 → 图表开始动画。它在一个 dashboard 框架内组合了 `stat` + `charts` 两种基本元素；logo 是一个冻结的项目本地素材。
