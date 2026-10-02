---
description: "Givens & Hoeting 伴读导读：统计计算主干，数值优化、EM、Monte Carlo、MCMC、bootstrap，给贝叶斯垫底；队列第 9 门，排队中"
---

# Givens & Hoeting（统计计算伴读）

> 状态：排队中，队列第 9 门。版本：Givens、Hoeting《Computational Statistics》第 2 版，Wiley 2013（Wiley Series in Computational Statistics）

前置是[数理统计](../casella-berger/index.md)的似然、Fisher 信息和渐近。roadmap「统计进阶 · 统计计算」整组落在这里：数值优化、EM、Monte Carlo 与方差缩减、MCMC；bootstrap 那一章接本站[重抽样](../../notes/statistics/resampling/index.md)。[线性模型与 GLM](../agresti-glm/index.md) 的 IRLS 在这里落成算法。后面[贝叶斯](../bda3/index.md)要先会 MCMC，所以排在这门之后。排在第 9 门的理由见[课程队列](../../posts/wiki-roadmap.md#课程队列)：正对清单「统计计算」组。

## 读法

- **在版教材：只摘句、标页码**。没有免费版
- **数据和代码**：作者站 [stat.colostate.edu/computationalstatistics](https://www.stat.colostate.edu/computationalstatistics/) 有数据集、例子的 R 代码和勘误。本站改写成 Python（`numpy`、`scipy.optimize`、`scipy.stats`），先拿书上一个例子把数对上
- 第 2、4、6、7、9 章必读：数值优化、EM、Monte Carlo、MCMC、bootstrap
- 第 1 章是复习，用到再回查
- 第 3 章组合优化跳；第 5、8、10–12 章选读：数值积分、MCMC 进阶、密度估计与平滑。GAM 和树在 ISLP 已经讲过
- **HMC 不在这本书里**：roadmap 的 MCMC 一页列了 HMC，书里最接近的是 8.4.3 节 Langevin Metropolis–Hastings。HMC 交给 [BDA3](../bda3/index.md) 12.4 节

## 章节地图

| 章 | 读法 | 接本站哪里 |
|---|---|---|
| 1 Review | 选读 | 回查用；1.4 节似然推断接 [Casella & Berger](../casella-berger/index.md) |
| 2 Optimization and Solving Nonlinear Equations | 必读 | roadmap 统计进阶「统计计算」的数值优化（牛顿、拟牛顿、坐标下降），坐标下降对应 2.2.5 节 Nonlinear Gauss–Seidel Iteration；2.2.1.1 节 IRLS 接 [Agresti](../agresti-glm/index.md) 第 4 章 |
| 3 Combinatorial Optimization | 跳 | — |
| 4 EM Optimization Methods | 必读 | roadmap「统计计算」的 EM、机器学习「概率模型」的 EM 与 GMM；[缺失数据](../../notes/statistics/missing-data/index.md) |
| 5 Numerical Integration | 选读 | [BDA3](../bda3/index.md) 第 10 章 |
| 6 Simulation and Monte Carlo Integration | 必读 | roadmap「统计计算」的 Monte Carlo 与方差缩减；[抽样分布](../../notes/statistics/sampling-distributions/index.md)的模拟 |
| 7 Markov Chain Monte Carlo | 必读 | roadmap「统计计算」的 MCMC（Metropolis、Gibbs）；[贝叶斯统计](../../notes/statistics/bayesian/index.md)的收敛诊断；前置是 [B&H](../blitzstein-hwang/index.md) 第 11–12 章 |
| 8 Advanced Topics in MCMC | 选读 | 见读法里的 HMC 一条 |
| 9 Bootstrapping | 必读 | [重抽样](../../notes/statistics/resampling/index.md)；roadmap 论文起步清单的 Efron 1979 |
| 10 Nonparametric Density Estimation | 选读 | [描述统计](../../notes/statistics/data-description/index.md)的密度图带宽 |
| 11 Bivariate Smoothing | 选读 | roadmap 机器学习「核与非参」的样条与 GAM |
| 12 Multivariate Smoothing | 选读 | roadmap 机器学习「核与非参」的样条与 GAM、「树与集成」的 CART；[ISLP](../islp/index.md) 第 7、8 章已讲 |

## 口径差异

- **指数与 Gamma 用率参数**：表 1.2 的 Exp(λ)、Gamma(r, λ) 均值是 1/λ、r/λ，和 [B&H](../blitzstein-hwang/index.md) 一致，本站[常见分布](../../notes/statistics/distributions/index.md)的指数分布也用率参数；和 [Casella & Berger](../casella-berger/index.md) 的尺度参数相反。`scipy.stats` 要传 `scale=1/λ`
- **Weibull 的 a 不是尺度参数**：表 1.3 的 Weibull(a, b) 密度是 $abx^{b-1}e^{-ax^b}$。换到 `scipy.stats.weibull_min`，形状参数 `c` 取 $b$，`scale` 取 $a^{-1/b}$
- **书里求最大值，scipy 求最小值**：第 2 章以最大化对数似然为目标，2.2.2.1 节叫 Ascent Algorithms；`scipy.optimize.minimize` 只做最小化，目标、梯度、Hessian 要一起取负号
- **`scipy.stats.bootstrap` 默认 BCa**：第 9 章先讲百分位法（9.3.1 节），scipy 的默认是 `method='BCa'`。对书上的百分位区间要显式传 `method='percentile'`
- 其他读到再补

## 课程

还没开课。排到时先写第 2 章伴读：牛顿法与 Fisher scoring，顺手把 Agresti 的 IRLS 跑一遍。
