---
description: "Johnson & Wichern 伴读导读：多元统计的主干，PCA、因子分析、判别分析、典型相关与 MANOVA 一本读完；队列第 11 门，排队中"
---

# Johnson & Wichern（多元统计伴读）

> 状态：排队中，队列第 11 门。版本：Johnson、Wichern《Applied Multivariate Statistical Analysis》第 6 版，Pearson Prentice Hall 2007

前置是 [Casella & Berger](../casella-berger/index.md)（多元正态、极大似然、充分统计量的记号）、[Agresti](../agresti-glm/index.md)（线性模型的矩阵写法）和 [ISLP](../islp/index.md) 第 12 章（PCA 与聚类先在机器学习的语境里见过一遍）。这门课管 roadmap 统计进阶「多元与高维」整组里的 PCA、因子分析、判别分析、典型相关与 MANOVA，读完回流成那组的前四页笔记；同组的 lasso 与后选择推断不在本书。站内最近的笔记是[方差分析](../../notes/statistics/anova/index.md)：MANOVA 是它的多响应版本。排序见[课程队列](../../posts/wiki-roadmap.md#课程队列)。

## 读法

- **在版教材：只摘句、标页码**。没有官方免费版。章号按美国版第 6 版；Pearson 2018 年起的 Classic Version 重印同一套目录，Pearson New International Edition 把第 2、3 章顺序对调，拿国际版对照时注意
- **第 1–4 章快速过**：前言（书页 xvi–xvii）建议第一遍只抓第 1 章、2.1–2.3、2.5、2.6、3.6 和第 4 章检验正态那几节。矩阵代数不熟就翻第 2 章的补充 2A
- **方法章照 roadmap 取**：PCA（第 8 章）、因子分析（第 9 章）、典型相关（第 10 章）、判别分析（第 11 章）、MANOVA（第 6 章）。第 5 章的 Hotelling $T^2$ 是第 6 章的前置，一并必读
- **lasso 与后选择推断不在本书**：lasso 由 [ISLP](../islp/index.md) 第 6 章接，后选择推断另找来源，排到再定
- 第 7 章选读：前言（书页 xvi）自己说这一章回归写得很紧、第一遍难读；单响应回归交给 [Agresti](../agresti-glm/index.md)，这里只看 7.7 多元多重回归
- 第 12 章选读：k-means 与层次聚类 ISLP 第 12 章已讲，这里多出来的多维标度、对应分析、双标图按需翻

## 章节地图

| 章 | 读法 | 接本站哪里 |
|---|---|---|
| 1 Aspects of Multivariate Analysis | 选读 | [描述统计](../../notes/statistics/data-description/index.md) |
| 2 Matrix Algebra and Random Vectors | 必读 | — |
| 3 Sample Geometry and Random Sampling | 必读 | [抽样分布](../../notes/statistics/sampling-distributions/index.md) |
| 4 The Multivariate Normal Distribution | 必读 | roadmap 统计进阶「数理统计」的指数族与充分统计量、MLE 渐近与 Fisher 信息；[Casella & Berger](../casella-berger/index.md) |
| 5 Inferences About a Mean Vector | 必读 | [假设检验](../../notes/statistics/hypothesis-testing/index.md)、[置信区间](../../notes/statistics/confidence-intervals/index.md)；5.7 接[缺失数据](../../notes/statistics/missing-data/index.md) |
| 6 Comparisons of Several Multivariate Means | 必读 | [方差分析](../../notes/statistics/anova/index.md)；roadmap 统计进阶「多元与高维」的典型相关与 MANOVA |
| 7 Multivariate Linear Regression Models | 选读 | [多元回归](../../notes/statistics/multiple-regression/index.md)；[Agresti](../agresti-glm/index.md) |
| 8 Principal Components | 必读 | roadmap 统计进阶「多元与高维」的 PCA；[ISLP](../islp/index.md) 第 12 章 |
| 9 Factor Analysis and Inference for Structured Covariance Matrices | 必读 | roadmap 统计进阶「多元与高维」的因子分析 |
| 10 Canonical Correlation Analysis | 必读 | roadmap 统计进阶「多元与高维」的典型相关与 MANOVA |
| 11 Discrimination and Classification | 必读 | roadmap 统计进阶「多元与高维」的判别分析；ISLP 第 4 章的 LDA / QDA；11.4 接[分类指标](../../notes/machine-learning/classification-metrics/index.md)；11.7 逻辑回归交给 [Agresti](../agresti-glm/index.md) |
| 12 Clustering, Distance Methods, and Ordination | 选读 | roadmap 机器学习「无监督」的 k-means 与层次聚类；[ISLP](../islp/index.md) 第 12 章 |

## 口径差异

- **样本协方差先除 n、后除 n−1**：第 1 章（书页 6–10）的样本方差和协方差阵 $S_n$ 除 n，下标 n 就是提醒；第 3.3 节末（书页 122）起改用除 n−1 的无偏版 $S$。`np.cov` 默认除 n−1，对应 $S$；scikit-learn `PCA` 的 `explained_variance_` 也按 n−1 算。和[统计学伴读](../statistics-book/index.md)那条 σ 除 n 的提醒是同一类坑
- **scikit-learn 的 `PCA` 只中心化、不标准化**：直接用得到的是书里基于 $S$ 的主成分。要基于相关阵 $R$（8.2、8.3 的标准化变量），先过 `StandardScaler`；它按 n 标准化，`PCA` 按 n−1 算方差，所以 `explained_variance_` 是 $R$ 的特征值乘 $n/(n-1)$，方差占比不受影响
- 其他读到再补

## 课程

还没开课。
