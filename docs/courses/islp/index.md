---
description: "ISLP 伴读导读：统计学习的入门主干，每章 lab 就是现成的任务；队列第 1 门，排队中"
---

# ISLP（统计学习伴读）

> 状态：排队中，队列第 1 门。版本：James、Witten、Hastie、Tibshirani、Taylor《An Introduction to Statistical Learning with Applications in Python》，Springer 2023

前置是[统计学伴读](../statistics-book/index.md)的回归一章和笔记[多元回归](../../notes/statistics/multiple-regression/index.md)。这门课把机器学习的框架、正则化、树和无监督搭起来；后面[线性模型与 GLM](../agresti-glm/index.md) 接它的逻辑回归、[深度学习](../d2l/index.md)接它的第 10 章、[多元统计](../johnson-wichern/index.md)接它的 PCA。排在第 1 门的理由见[课程队列](../../posts/wiki-roadmap.md#课程队列)：最快见效，和算法岗最近。

## 读法

- **免费 PDF**：作者官网 [statlearning.com](https://www.statlearning.com/) 提供下载，讲解直接链到章节，不摘抄
- **lab 当任务**：每章末尾的 Python lab 就是现成的现场，代码用官方 [`ISLP` 包](https://islp.readthedocs.io/)。题换一份数据自己出，不照抄 lab 的数
- **ESL 只做参考**：同一批作者的 *The Elements of Statistical Learning* 推导更全，查证明时翻，不开课
- 第 1 章导言跳过；第 9、10、11 章选读，各有更合适的接手课

## 章节地图

| 章 | 读法 | 接本站哪里 |
|---|---|---|
| 1 Introduction | 跳 | — |
| 2 Statistical Learning | 必读 | roadmap 机器学习「框架与评估」的偏差-方差；首批第 4、5 件事 |
| 3 Linear Regression | 必读 | [简单线性回归](../../notes/statistics/linear-regression/index.md)、[多元回归](../../notes/statistics/multiple-regression/index.md)、[统计学第 9 章](../statistics-book/ch09-regression.md) |
| 4 Classification | 必读 | [分类指标](../../notes/machine-learning/classification-metrics/index.md)；逻辑回归作为 GLM 交给 [Agresti](../agresti-glm/index.md) |
| 5 Resampling Methods | 必读 | [重抽样](../../notes/statistics/resampling/index.md) |
| 6 Linear Model Selection and Regularization | 必读 | roadmap 机器学习「线性与正则化」、统计进阶「多元与高维」的 lasso |
| 7 Moving Beyond Linearity | 必读 | roadmap 机器学习「核与非参」的样条与 GAM |
| 8 Tree-Based Methods | 必读 | roadmap 机器学习「树与集成」；首批第 6 件事 GBM |
| 9 Support Vector Machines | 选读 | roadmap 机器学习「核与非参」的 SVM |
| 10 Deep Learning | 选读 | 由 [d2l 伴读](../d2l/index.md)接手 |
| 11 Survival Analysis and Censored Data | 选读 | roadmap 统计进阶「线性模型与 GLM」的生存分析 |
| 12 Unsupervised Learning | 必读 | roadmap 机器学习「无监督」；PCA 接 [Johnson & Wichern](../johnson-wichern/index.md) |
| 13 Multiple Testing | 必读 | [假设检验](../../notes/statistics/hypothesis-testing/index.md)；roadmap 论文清单的 Benjamini-Hochberg 1995 |

## 口径差异

- **lasso 的 λ 和 scikit-learn 的 `alpha` 不是同一个数**：书里的目标是 RSS 加 λ 乘以 L1 惩罚；`sklearn.linear_model.Lasso` 先把 RSS 除以 2n 再加 `alpha` 乘以惩罚。照书上的 λ 网格直接填 `alpha` 会差一个和样本量有关的倍数。ridge 的 `Ridge` 没有这个 1/(2n)，两边一致
- **逻辑回归默认带惩罚**：`sklearn.linear_model.LogisticRegression` 默认加 L2 惩罚（`C=1.0`），系数和书上不加惩罚的极大似然估计对不上；要对数，用 `statsmodels` 或把惩罚关掉
- 其他读到再补

## 课程

还没开课。排到时先写第 2 章伴读（roadmap 首批第 4 件事）。
