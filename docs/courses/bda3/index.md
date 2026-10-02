---
description: "BDA3 伴读导读：贝叶斯的方法主干，先验、层级模型、模型检查、MCMC、回归与 GLM；作者官方免费 PDF；队列第 10 门，排队中"
---

# BDA3（贝叶斯伴读）

> 状态：排队中，队列第 10 门。版本：Gelman、Carlin、Stern、Dunson、Vehtari、Rubin《Bayesian Data Analysis》第 3 版，Chapman & Hall/CRC 2013

前置是[统计计算](../givens-hoeting/index.md)的 MCMC，和[线性模型与 GLM](../agresti-glm/index.md)的 GLM 与混合效应。本站[贝叶斯统计](../../notes/statistics/bayesian/index.md)笔记停在「会用」，这门课把它补成完整的方法：先验、层级模型、模型检查、计算、回归。roadmap「设计与实务进阶」的贝叶斯多层模型与工作流落在这里。第 8 章讲数据收集机制，和[抽样调查](../lohr/index.md)、[因果推断](../what-if/index.md)两门对照读。排在第 10 门的理由见[课程队列](../../posts/wiki-roadmap.md#课程队列)：要先会 MCMC，所以排在统计计算后面。

## 读法

- **免费 PDF**：Gelman 的书页 [sites.stat.columbia.edu/gelman/book](https://sites.stat.columbia.edu/gelman/book/) 提供全书 PDF，限非商业用途，勘误修到 2025 年 2 月。同页有数据集、勘误表和部分习题解答。讲解直接链到书页，不摘抄
- **顺序照 Aki Vehtari 的 Aalto 课走**：[BDA_course_Aalto](https://avehtari.github.io/BDA_course_Aalto/) 按第 1、2、3、10、11、12、5、6、7、9、4 章的顺序走，先学计算再学层级模型；第 7 章配一篇 LOO 与 WAIC 的补充论文。每章有阅读提示（chapter notes）和讲课视频
- **代码用 Python**：Aki 的 [BDA_py_demos](https://github.com/avehtari/BDA_py_demos) 复现书里的例子；模型用 CmdStanPy，诊断用 ArviZ。诊断函数比书新，见口径差异
- 第 1–7、9–12、14–16 章必读；第 8、13、17、18、20–22 章选读；第 19、23 章跳。附录 A 的分布表当速查用

## 章节地图

| 章 | 读法 | 接本站哪里 |
|---|---|---|
| 1 Probability and inference | 必读 | [贝叶斯统计](../../notes/statistics/bayesian/index.md)的贝叶斯公式；[概率模型](../../notes/statistics/probability-models/index.md) |
| 2 Single-parameter models | 必读 | [贝叶斯统计](../../notes/statistics/bayesian/index.md)的 Beta-Binomial |
| 3 Introduction to multiparameter models | 必读 | [贝叶斯统计](../../notes/statistics/bayesian/index.md) |
| 4 Asymptotics and connections to non-Bayesian approaches | 必读 | [Casella & Berger](../casella-berger/index.md) 第 10 章的渐近；[置信区间](../../notes/statistics/confidence-intervals/index.md) |
| 5 Hierarchical models | 必读 | roadmap 统计进阶「设计与实务进阶」的贝叶斯多层模型与工作流；[贝叶斯统计](../../notes/statistics/bayesian/index.md)的层级模型 |
| 6 Model checking | 必读 | [贝叶斯统计](../../notes/statistics/bayesian/index.md)的后验预测检查；[统计分析工作流](../../notes/statistics/statistical-workflow/index.md) |
| 7 Evaluating, comparing, and expanding models | 必读 | [重抽样](../../notes/statistics/resampling/index.md)的交叉验证；roadmap 机器学习「框架与评估」的交叉验证与信息准则 |
| 8 Modeling accounting for data collection | 选读 | [抽样](../../notes/statistics/sampling/index.md)、[实验设计](../../notes/statistics/experimental-design/index.md)、[因果推断](../../notes/statistics/causal-inference/index.md)；[Lohr](../lohr/index.md)、[What If](../what-if/index.md) |
| 9 Decision analysis | 必读 | [贝叶斯统计](../../notes/statistics/bayesian/index.md)的损失函数；roadmap 统计进阶「数理统计」的决策理论与贝叶斯估计 |
| 10 Introduction to Bayesian computation | 必读 | [Givens & Hoeting](../givens-hoeting/index.md) 第 5、6 章 |
| 11 Basics of Markov chain simulation | 必读 | roadmap 统计进阶「统计计算」的 MCMC；[贝叶斯统计](../../notes/statistics/bayesian/index.md)的收敛诊断；[Givens & Hoeting](../givens-hoeting/index.md) 第 7 章 |
| 12 Computationally efficient Markov chain simulation | 必读 | roadmap「统计计算」MCMC 里的 HMC，在 12.4 节 |
| 13 Modal and distributional approximations | 选读 | roadmap 机器学习「概率模型」的变分推断（13.7 节）；13.4 节的 EM 接 [Givens & Hoeting](../givens-hoeting/index.md) 第 4 章 |
| 14 Introduction to regression models | 必读 | [多元回归](../../notes/statistics/multiple-regression/index.md)；[Agresti](../agresti-glm/index.md) 第 2–3 章 |
| 15 Hierarchical linear models | 必读 | roadmap「设计与实务进阶」的贝叶斯多层模型与工作流、「线性模型与 GLM」的混合效应与纵向数据；[Agresti](../agresti-glm/index.md) 第 9 章 |
| 16 Generalized linear models | 必读 | [Agresti](../agresti-glm/index.md) 第 4–7 章；[分类数据](../../notes/statistics/categorical-data/index.md)的 logistic 回归 |
| 17 Models for robust inference | 选读 | [点估计](../../notes/statistics/estimation/index.md)的稳健估计 |
| 18 Models for missing data | 选读 | [缺失数据](../../notes/statistics/missing-data/index.md)的多重插补 |
| 19 Parametric nonlinear models | 跳 | — |
| 20 Basis function models | 选读 | roadmap 机器学习「核与非参」的样条与 GAM |
| 21 Gaussian process models | 选读 | roadmap 机器学习「核与非参」的核岭回归与 GP |
| 22 Finite mixture models | 选读 | roadmap 机器学习「概率模型」的 EM 与 GMM |
| 23 Dirichlet process models | 跳 | — |

## 口径差异

- **正态的第二个参数是方差**：书里写 N(μ, σ²)。Stan 的 `normal(mu, sigma)`、PyMC 的 `pm.Normal(mu, sigma)`、`scipy.stats.norm(loc, scale)` 收的都是标准差
- **Gamma 和指数用逆尺度**：附录 A 的 Gamma(α, β)、Expon(β) 里 β 是 inverse scale，Gamma 均值 α/β，和 Stan 一致。[Casella & Berger](../casella-berger/index.md) 的 β 是尺度，正好倒过来；`scipy.stats.gamma` 要传 `scale=1/β`
- **方差的先验写成 scaled Inv-χ²**：Inv-χ²(ν, s²) 等于 Inv-gamma(ν/2, νs²/2)。scipy 没有这个分布，用 `scipy.stats.invgamma(ν/2, scale=ν*s²/2)`
- **R̂ 比 ArviZ 旧一版**：书里 11.4 节的 R̂ 是把每条链对半切开再算的 split-R̂；ArviZ 的 `az.rhat` 默认 `method='rank'`，是 Vehtari 等 2021 的 rank-normalized 版本，本站[贝叶斯统计](../../notes/statistics/bayesian/index.md)里的 bulk / tail ESS 也出自那篇。对书上的数要传 `method='split'`
- **第 7 章讲 WAIC，ArviZ 已经没有 WAIC**：书里比较 AIC、DIC、WAIC 和交叉验证；ArviZ 1.3 的 `az.loo` 用 PSIS-LOO（Vehtari、Gelman、Gabry 2017），`waic` 已经移除
- 其他读到再补

## 课程

还没开课。排到时照 Aalto 的顺序，先写第 2 章伴读。
