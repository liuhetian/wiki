---
description: "Blitzstein & Hwang 伴读导读：概率论主干，从计数到条件期望和极限定理，给数理统计垫底；作者官方免费在线版；队列第 2 门，排队中"
---

# Blitzstein & Hwang（概率论伴读）

> 状态：排队中，队列第 2 门。版本：Blitzstein、Hwang《Introduction to Probability》第 2 版，Chapman & Hall/CRC 2019

前置是[统计学伴读](../statistics-book/index.md)。本站现有的概率只有[量化面试题解](../../notes/probability/index.md)，这门课补的是题解底下那套语法：计数、条件概率、随机变量、期望、联合分布、变换、条件期望、极限定理。后面[数理统计](../casella-berger/index.md)直接站在它上面，Casella & Berger 第 1–4 章的概率部分由这门课覆盖；第 11–12 章的 Markov 链与 MCMC 接[统计计算](../givens-hoeting/index.md)。排在第 2 门的理由见[课程队列](../../posts/wiki-roadmap.md#课程队列)：数理统计的前置。

## 读法

- **免费在线版**：作者在 [probabilitybook.net](https://probabilitybook.net/) 放了第 2 版全书，跳转到 Google Drive，只能在线看，不开放下载。讲解标章节和页码链回去，不摘抄
- **课程视频**：同一作者的 Harvard Stat 110 讲课视频在 [stat110.net](http://stat110.net/)，路线和书一致，卡住时看
- **代码换成 Python**：书的附录 B 和例子用 R，本站用 `scipy.stats`，每个分布先对一遍参数化（见口径差异）
- **题换数字自己出**：解析解和模拟两条路各算一遍，交叉核对
- 第 1–10 章必读；第 11–13 章选读：Markov 链和 MCMC 由统计计算接手，Poisson 过程用到再读。附录 C 的分布表当速查用

## 章节地图

| 章 | 读法 | 接本站哪里 |
|---|---|---|
| 1 Probability and Counting | 必读 | [概率模型](../../notes/statistics/probability-models/index.md)；[概率与算法](../../notes/probability/index.md)的对称性一组 |
| 2 Conditional Probability | 必读 | [概率模型](../../notes/statistics/probability-models/index.md)的条件概率与 Bayes 公式；[三门问题](../../notes/probability/monty-hall.md)、[两个孩子问题](../../notes/probability/two-children.md) |
| 3 Random Variables and Their Distributions | 必读 | [常见分布](../../notes/statistics/distributions/index.md)的离散部分 |
| 4 Expectation | 必读 | [概率与算法](../../notes/probability/index.md)的期望一组，如[随机排列的不动点](../../notes/probability/fixed-points.md)、[集卡问题](../../notes/probability/coupon-collector.md) |
| 5 Continuous Random Variables | 必读 | [常见分布](../../notes/statistics/distributions/index.md)的连续部分；[均匀随机数累加超过 1](../../notes/probability/uniform-sum-exceeds-one.md) |
| 6 Moments | 必读 | [描述统计](../../notes/statistics/data-description/index.md)的分布形状 |
| 7 Joint Distributions | 必读 | [概率模型](../../notes/statistics/probability-models/index.md)的协方差；多元正态接 [Johnson & Wichern](../johnson-wichern/index.md) |
| 8 Transformations | 必读 | [常见分布](../../notes/statistics/distributions/index.md)的 Gamma 与 Beta |
| 9 Conditional Expectation | 必读 | [掷到 6、全程偶数的期望次数](../../notes/probability/dice-until-six-even.md)；[多元回归](../../notes/statistics/multiple-regression/index.md)的条件均值 |
| 10 Inequalities and Limit Theorems | 必读 | [概率模型](../../notes/statistics/probability-models/index.md)的大数定律与中心极限定理；[抽样分布](../../notes/statistics/sampling-distributions/index.md) |
| 11 Markov Chains | 选读 | [赌徒破产](../../notes/probability/gamblers-ruin.md)；MCMC 的前置，接 [Givens & Hoeting](../givens-hoeting/index.md) |
| 12 Markov Chain Monte Carlo | 选读 | roadmap 统计进阶「统计计算」的 MCMC，由 [Givens & Hoeting](../givens-hoeting/index.md) 第 7 章接手 |
| 13 Poisson Processes | 选读 | [常见分布](../../notes/statistics/distributions/index.md)的 Poisson 与 Exponential |

## 口径差异

- **Geom 从 0 数起**：书里的 Geom(p) 是第一次成功之前的失败次数，支撑 {0, 1, 2, …}，均值 q/p；连成功那一次也数进去的叫 First Success 分布 FS(p)，均值 1/p。本站[常见分布](../../notes/statistics/distributions/index.md)的几何分布、`scipy.stats.geom`、[Casella & Berger](../casella-berger/index.md) 的 geometric 都是 FS 那一种。`scipy.stats.geom(p, loc=-1)` 才是书里的 Geom
- **负二项也数失败**：书里的 NBin(r, p) 是第 r 次成功之前的失败次数，和 `scipy.stats.nbinom` 一致
- **指数与 Gamma 用率参数**：Expo(λ)、Gamma(a, λ) 的 λ 是率，均值 1/λ、a/λ。本站[常见分布](../../notes/statistics/distributions/index.md)的指数分布同样用率参数，Gamma 没写参数化。`scipy.stats.expon`、`scipy.stats.gamma` 只收 `scale`，要传 `scale=1/λ`。Casella & Berger 用尺度参数，下一门课要倒过来
- 其他读到再补

## 课程

还没开课。排到时从第 1 章按顺序写伴读。
