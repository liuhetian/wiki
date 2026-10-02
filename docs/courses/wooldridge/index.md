---
description: "Wooldridge 伴读导读：计量的主干，重心在面板与政策评估，8e 新增因果推断一章；队列第 6 门，排队中"
---

# Wooldridge《Introductory Econometrics》（计量经济学伴读）

> 状态：排队中，队列第 6 门。版本：Jeffrey M. Wooldridge《Introductory Econometrics: A Modern Approach》第 8 版，Cengage 2025

前置是[线性模型与 GLM](../agresti-glm/index.md)（OLS 的投影视角）和[曼昆微观](../mankiw-micro/index.md)（例子背后的经济问题）。这门课把回归用到经济问题的识别上：截面回归与稳健标准误、面板与政策评估、IV、受限因变量，8e 再加一章因果推断。roadmap「计量经济学」整张清单都落在这里或从这里出发。后面 [What If](../what-if/index.md) 从统计与流行病学一侧重讲潜在结果；时序那几章和 [FPP3](../fpp3/index.md) 分工，这里管推断，FPP3 管预测。排在第 6 门的理由见[课程队列](../../posts/wiki-roadmap.md#课程队列)：重心在面板与政策评估。

## 读法

- **在版教材：只摘句、标页码**
- **数据用 Python 包**：PyPI 包名 [`wooldridge`](https://pypi.org/project/wooldridge/)，`wooldridge.data('wage1')` 直接返回 pandas DataFrame。包的说明写的是第 7 版的数据集，8e 新增例子的数据在不在里面，读到再补
- **Python 对照**：Heiss、Brunner《Using Python for Introductory Econometrics》在 [upfie.net](http://www.upfie.net/) 免费在线，复现书中例子，按第 7 版的章节编排；8e 新增的第 19 章不在里面
- **交错 DID 去补充读物**：8e 第 13、14 章讲两期 DID 与面板上的政策分析，18-6 节讲带对照组的事件研究，但 Goodman-Bacon、Callaway-Sant'Anna、Sun-Abraham 这些 2020 年后的方法不在目录里（14-4a 节讲到多少读到再补）。补两本免费在线书：
    - Huntington-Klein《The Effect》，[theeffectbook.net](https://theeffectbook.net/)，第 18 章 Difference-in-Differences 的 18.2.6、18.3.1 讲多期铺开与 Callaway-Sant'Anna
    - Cunningham《Causal Inference: The Mixtape》，第 2 版《The Remix》在线施工中，[mixtape.scunning.com](https://mixtape.scunning.com/)，第 10 章 Complex Diff-in-Diff Designs 逐节讲 Bacon 分解、Callaway-Sant'Anna、Sun-Abraham 和 Honest Diff-in-Diff；第 1 版在 [mixtape-1ed.netlify.app](https://mixtape-1ed.netlify.app/)
- 第 1 部分（2–9 章）截面回归全读；第 2 部分时序（10–12 章）和第 18 章选读；第 3 部分挑面板、IV、受限因变量和因果推断
- 书后 Math Refresher A–C 跳，统计学伴读和笔记已经覆盖；Advanced Treatment D–E 的矩阵形式选读

## 章节地图

| 章 | 读法 | 接本站哪里 |
|---|---|---|
| 1 The Nature of Econometrics and Economic Data | 必读 | 1-4 节的反事实推理接[因果推断](../../notes/statistics/causal-inference/index.md) |
| 2 The Simple Regression Model | 必读 | [简单线性回归](../../notes/statistics/linear-regression/index.md)、[统计学第 9 章](../statistics-book/ch09-regression.md) |
| 3 Multiple Regression Analysis: Estimation | 必读 | [多元回归](../../notes/statistics/multiple-regression/index.md)；roadmap 计量「回归与标准误」的 OLS 假设与 Gauss-Markov、「内生性与识别」的遗漏变量 |
| 4 Multiple Regression Analysis: Inference | 必读 | [假设检验](../../notes/statistics/hypothesis-testing/index.md)、[置信区间](../../notes/statistics/confidence-intervals/index.md) |
| 5 Multiple Regression Analysis: OLS Asymptotics | 必读 | roadmap 数理统计「Delta 方法与 Slutsky」；[Casella & Berger](../casella-berger/index.md) |
| 6 Multiple Regression Analysis: Further Issues | 必读 | [多元回归](../../notes/statistics/multiple-regression/index.md)的交互与非线性；附录 6A 的 bootstrap 接[重抽样](../../notes/statistics/resampling/index.md) |
| 7 Multiple Regression Analysis with Qualitative Information | 必读 | 7-6 节随机分配下的回归调整接[实验设计](../../notes/statistics/experimental-design/index.md) |
| 8 Heteroskedasticity | 必读 | roadmap 计量「回归与标准误」的异方差与 HC 稳健 SE；论文清单的 White 1980；roadmap 首批第 8 件事 |
| 9 More on Specification and Data Issues | 必读 | roadmap 计量「内生性与识别」的遗漏变量与测量误差；9-5 节接[缺失数据](../../notes/statistics/missing-data/index.md) |
| 10 Basic Regression Analysis with Time Series Data | 选读 | [时间序列](../../notes/statistics/time-series/index.md) |
| 11 Further Issues in Using OLS with Time Series Data | 选读 | roadmap 计量「时序计量」的单位根与 ADF |
| 12 Serial Correlation and Heteroskedasticity in Time Series Regressions | 选读 | roadmap 计量「回归与标准误」的序列相关与 HAC；12-6c 节的 ARCH 接「时序计量」的 GARCH |
| 13 Pooling Cross Sections across Time: Simple Panel Data Methods | 必读 | roadmap 计量「面板与政策评估」的 DID 与平行趋势 |
| 14 Advanced Panel Data Methods | 必读 | roadmap 计量「面板与政策评估」的 FE / RE 与 Hausman；「回归与标准误」的聚类 SE |
| 15 Instrumental Variables Estimation and Two-Stage Least Squares | 必读 | roadmap 计量「内生性与识别」的 IV / 2SLS 与弱工具 |
| 16 Simultaneous Equations Models | 选读 | [曼昆微观](../mankiw-micro/index.md)第 4 章的供需 |
| 17 Limited Dependent Variable Models and Sample Selection Corrections | 必读 | roadmap 计量「离散与受限因变量」整组；Poisson 回归接 [Agresti](../agresti-glm/index.md) |
| 18 Advanced Time Series Topics | 选读 | roadmap 计量「时序计量」的单位根与 ADF、协整；18-6 节接「面板与政策评估」的事件研究；18-5 节预测由 [FPP3](../fpp3/index.md) 接手 |
| 19 Advanced Methods for Causal Inference | 必读 | [因果推断](../../notes/statistics/causal-inference/index.md)；roadmap 计量「面板与政策评估」的倾向得分与双稳健、RDD，「内生性与识别」的 LATE；后接 [What If](../what-if/index.md) |
| 20 Carrying Out an Empirical Project | 选读 | [统计分析工作流](../../notes/statistics/statistical-workflow/index.md) |
| Math Refresher A–C | 跳 | [统计学伴读](../statistics-book/index.md) |
| Advanced Treatment D–E | 选读 | [多元回归](../../notes/statistics/multiple-regression/index.md)的矩阵公式 |

## 口径差异

- **k 不含截距**：书里 k 是解释变量个数，残差自由度写 n − k − 1；[多元回归](../../notes/statistics/multiple-regression/index.md)笔记用 p 个预测变量。误差项书里记 u，笔记记 ε
- **log 指自然对数**：书里的 log(wage) 都是 ln，系数乘 100 读成百分比变化
- **statsmodels 默认不给稳健标准误**：`OLS(...).fit()` 的 `cov_type` 默认是 `nonrobust`，要对第 8 章的稳健 SE 得显式指定；书里用的是 HC0 还是带自由度修正的版本，读到再补
- **8e 和第 7 版的章号错一位**：第 7 版的第 19 章是 Carrying Out an Empirical Project，8e 插入新的第 19 章因果推断后它变成第 20 章。`wooldridge` 包和 upfie.net 都按第 7 版编排，查例子时注意
- 其他读到再补

## 课程

还没开课。排到时先写第 8 章异方差，roadmap 首批第 8 件事的「异方差与稳健标准误」笔记跟着它长。
