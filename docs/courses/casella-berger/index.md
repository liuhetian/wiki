---
description: "Casella & Berger 伴读导读：数理统计主干，抽样分布、充分性、点估计、检验、区间、渐近一条线，本科和研究生的分界；队列第 3 门，排队中"
---

# Casella & Berger（数理统计伴读）

> 状态：排队中，队列第 3 门。版本：Casella、Berger《Statistical Inference》第 2 版，Duxbury（Thomson Learning）2002；2024 年由 CRC Press 重印，归入 Chapman & Hall/CRC Texts in Statistical Science

前置是[概率论伴读](../blitzstein-hwang/index.md)。roadmap「统计进阶 · 数理统计」整组落在这里：本站[点估计](../../notes/statistics/estimation/index.md)、[假设检验](../../notes/statistics/hypothesis-testing/index.md)、[置信区间](../../notes/statistics/confidence-intervals/index.md)几篇笔记停在「会用」，这门课补它们下面的理论层。后面三门课都用它：[线性模型与 GLM](../agresti-glm/index.md) 拿它的似然与渐近搭 GLM 推断，[统计计算](../givens-hoeting/index.md)把它的 MLE 落到数值优化，[贝叶斯](../bda3/index.md)接它第 7 章的贝叶斯估计。排在第 3 门的理由见[课程队列](../../posts/wiki-roadmap.md#课程队列)：研究生的分界线。

## 读法

- **在版教材：只摘句、标页码**。没有免费版。两个印本的出版社页标的页数不同（Duxbury 本 660 页，CRC 重印本 565 页），页码大概率对不上，摘句时注明用的哪一本
- **第 1–4 章跳**：概率部分由 [B&H](../blitzstein-hwang/index.md) 覆盖。例外三处：3.4 Exponential Families 和 3.5 Location and Scale Families 在 B&H 里没有对应章，第 6 章的充分统计量要用，开第 5 章前补读；4.4 Hierarchical Models and Mixture Distributions 选读，[BDA3](../bda3/index.md) 用得上；2.4 Differentiating Under an Integral Sign 到第 7 章 Cramér-Rao 时回查
- **主读第 5–10 章**：抽样分布 → 数据压缩 → 点估计 → 检验 → 区间 → 渐近，roadmap「数理统计」五页全在这一段
- 第 11–12 章选读：方差分析与回归由 [Agresti](../agresti-glm/index.md) 接手，讲得更完整
- **题换数字自己出**：数理统计的题也要落到能算出数的地方，解析结果用模拟核对

## 章节地图

| 章 | 读法 | 接本站哪里 |
|---|---|---|
| 1 Probability Theory | 跳 | 由 [B&H](../blitzstein-hwang/index.md) 覆盖 |
| 2 Transformations and Expectations | 跳 | 由 [B&H](../blitzstein-hwang/index.md) 覆盖；2.4 节到第 7 章回查 |
| 3 Common Families of Distributions | 选读 | 只读 3.4、3.5；[常见分布](../../notes/statistics/distributions/index.md)；roadmap 统计进阶「数理统计」的指数族与充分统计量 |
| 4 Multiple Random Variables | 跳 | 由 [B&H](../blitzstein-hwang/index.md) 覆盖；4.4 节接 [BDA3](../bda3/index.md) 的层级模型 |
| 5 Properties of a Random Sample | 必读 | [抽样分布](../../notes/statistics/sampling-distributions/index.md)、[统计学第 6 章](../statistics-book/ch06-sampling-distribution.md)；roadmap「数理统计」的 Delta 方法与 Slutsky |
| 6 Principles of Data Reduction | 必读 | [点估计](../../notes/statistics/estimation/index.md)的充分统计量；roadmap「数理统计」的指数族与充分统计量 |
| 7 Point Estimation | 必读 | [点估计](../../notes/statistics/estimation/index.md)、[统计学第 7 章](../statistics-book/ch07-estimation.md)；roadmap「数理统计」的 MLE 渐近与 Fisher 信息、决策理论与贝叶斯估计 |
| 8 Hypothesis Testing | 必读 | [假设检验](../../notes/statistics/hypothesis-testing/index.md)、[功效与样本量](../../notes/statistics/power-sample-size/index.md)、[统计学第 8 章](../statistics-book/ch08-hypothesis-anova.md)；roadmap「数理统计」的 NP 引理与 LRT / Wald / Score 三检验 |
| 9 Interval Estimation | 必读 | [置信区间](../../notes/statistics/confidence-intervals/index.md) |
| 10 Asymptotic Evaluations | 必读 | roadmap「数理统计」的 MLE 渐近与 Fisher 信息、NP 引理与 LRT / Wald / Score 三检验；[点估计](../../notes/statistics/estimation/index.md)的稳健估计 |
| 11 Analysis of Variance and Regression | 选读 | [方差分析](../../notes/statistics/anova/index.md)、[简单线性回归](../../notes/statistics/linear-regression/index.md)；由 [Agresti](../agresti-glm/index.md) 第 2–3 章接手 |
| 12 Regression Models | 跳 | 逻辑回归由 [Agresti](../agresti-glm/index.md) 第 5 章接手；errors in variables 对应 roadmap 计量经济学「内生性与识别」的遗漏变量与测量误差 |

## 口径差异

- **指数与 Gamma 用尺度参数**：书里 exponential(β) 的均值是 β，gamma(α, β) 的均值是 αβ。[B&H](../blitzstein-hwang/index.md) 和本站[常见分布](../../notes/statistics/distributions/index.md)用率参数 λ，均值 1/λ，从上一门课过来要取倒数。`scipy.stats.expon`、`scipy.stats.gamma` 的 `scale` 正好等于书里的 β
- **β(θ) 是功效函数**：书里 8.3 节把 β(θ) = P_θ(X ∈ R) 叫 power function。本站[假设检验](../../notes/statistics/hypothesis-testing/index.md)和[功效与样本量](../../notes/statistics/power-sample-size/index.md)里 β 是第二类错误概率，功效写成 1 − β(θ)。书里的 β(θ) 等于本站的 1 − β(θ)
- **几何分布数试验次数**：书里的 geometric(p) 支撑从 1 开始，和本站[常见分布](../../notes/statistics/distributions/index.md)、`scipy.stats.geom` 一致；B&H 的 Geom 从 0 开始
- 其他读到再补

## 课程

还没开课。排到时先补读 3.4、3.5，再从第 5 章按顺序写伴读。
