---
description: "Agresti 伴读导读：线性模型的投影视角、GLM 的拟合与推断、二元与计数、相关数据和混合效应；队列第 4 门，排队中"
---

# Agresti（线性模型与 GLM 伴读）

> 状态：排队中，队列第 4 门。版本：Agresti《Foundations of Linear and Generalized Linear Models》，Wiley 2015（Wiley Series in Probability and Statistics）

前置是[数理统计](../casella-berger/index.md)的似然与渐近，和 [ISLP](../islp/index.md) 第 3、4 章的回归与逻辑回归。roadmap「统计进阶 · 线性模型与 GLM」整组落在这里，生存分析除外（见读法）。后面[计量经济学](../wooldridge/index.md)接它的线性模型和相关数据，[贝叶斯](../bda3/index.md)第 15、16 章把它第 9、10 章的混合效应和贝叶斯 GLM 做成多层模型。排在第 4 门的理由见[课程队列](../../posts/wiki-roadmap.md#课程队列)：投影视角的 Gauss-Markov、GLM 与 IRLS，混合效应接得上。

## 读法

- **在版教材：只摘句、标页码**。目前只有这一版
- **数据**：书里印的 `www.stat.ufl.edu/~aa/glm/data` 已失效，数据集和勘误在作者站 [alanagresti.com/glm](https://alanagresti.com/glm/glm.html)
- **代码换成 Python**：书的例子用 R，本站用 `statsmodels`。先拿书上一个例子把系数和偏差对上，再往下读
- **附录 B 有部分习题的解答提纲**：题换数据自己出，提纲只用来核对思路
- 第 1–5、7、9 章必读；第 6、8、10、11 章选读：多项与有序 logit 到计量的离散因变量再用，准似然接第 7 章的过度离散，贝叶斯 GLM 交给 BDA3，正则化与 GAM 在 ISLP 第 6、7 章已经讲过
- **生存分析不在这本书里**：roadmap 这一组的生存分析交给 [ISLP](../islp/index.md) 第 11 章

## 章节地图

| 章 | 读法 | 接本站哪里 |
|---|---|---|
| 1 Introduction to Linear and Generalized Linear Models | 必读 | [多元回归](../../notes/statistics/multiple-regression/index.md)的矩阵公式 |
| 2 Linear Models: Least Squares Theory | 必读 | roadmap 统计进阶「线性模型与 GLM」的投影视角的 Gauss-Markov；[简单线性回归](../../notes/statistics/linear-regression/index.md)、[多元回归](../../notes/statistics/multiple-regression/index.md)、[方差分析](../../notes/statistics/anova/index.md)的平方和分解 |
| 3 Normal Linear Models: Statistical Inference | 必读 | [多元回归](../../notes/statistics/multiple-regression/index.md)；3.5 节多重比较接[假设检验](../../notes/statistics/hypothesis-testing/index.md)和 roadmap 论文清单的 Benjamini-Hochberg 1995 |
| 4 Generalized Linear Models: Model Fitting and Inference | 必读 | roadmap「线性模型与 GLM」的 GLM 与 IRLS；IRLS 的数值一面接 [Givens & Hoeting](../givens-hoeting/index.md) 第 2 章；LRT / Wald / Score 接 [Casella & Berger](../casella-berger/index.md) 第 10 章 |
| 5 Models for Binary Data | 必读 | [分类数据](../../notes/statistics/categorical-data/index.md)的 logistic 回归；[ISLP](../islp/index.md) 第 4 章；roadmap 机器学习「线性与正则化」的逻辑回归与 softmax 作为 GLM |
| 6 Multinomial Response Models | 选读 | roadmap 计量经济学「离散与受限因变量」的 Logit / Probit 与多项、有序 |
| 7 Models for Count Data | 必读 | roadmap「线性模型与 GLM」的 Poisson 与负二项计数回归；[分类数据](../../notes/statistics/categorical-data/index.md)的列联表；roadmap 计量经济学「离散与受限因变量」的计数模型 |
| 8 Quasi-Likelihood Methods | 选读 | roadmap「线性模型与 GLM」的 Poisson 与负二项计数回归（过度离散） |
| 9 Modeling Correlated Responses | 必读 | roadmap「线性模型与 GLM」的混合效应与纵向数据；[方差分析](../../notes/statistics/anova/index.md)的重复测量；多层模型由 [BDA3](../bda3/index.md) 第 15 章接手 |
| 10 Bayesian Linear and Generalized Linear Modeling | 选读 | [贝叶斯统计](../../notes/statistics/bayesian/index.md)；由 [BDA3](../bda3/index.md) 接手 |
| 11 Extensions of Generalized Linear Models | 选读 | roadmap 统计进阶「多元与高维」的 lasso 与后选择推断、机器学习「核与非参」的样条与 GAM；[ISLP](../islp/index.md) 第 6、7 章已讲 |

## 口径差异

- **`sm.GLM` 不自动加截距**：R 的 `glm()` 默认带截距；`statsmodels` 的矩阵接口 `sm.GLM(y, X)` 要先 `sm.add_constant(X)`，公式接口 `smf.glm` 才和 R 一样
- **二项响应的写法**：R 写 `cbind(成功, 失败)`；`statsmodels` 的 `Binomial` 族收一个两列数组作 `endog`，第一列成功数、第二列失败数
- **负二项的离散参数是倒数关系**：R 的 `MASS::glm.nb` 报 θ，方差 μ + μ²/θ；`statsmodels` 的 `NegativeBinomial` 报 α，方差 μ + αμ²，α = 1/θ。GLM 接口的 `families.NegativeBinomial` 把 α 固定为默认的 1，不估计
- 书里自己的记号和参数化读到再补

## 课程

还没开课。排到时先写第 2 章伴读：投影视角的 Gauss-Markov 是清单这一组的第一页。
