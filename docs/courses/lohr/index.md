---
description: "Lohr 伴读导读：有限总体抽样的设计与分析，复杂抽样、权重、无回答调整与校准都在这一本；队列第 14 门，排队中"
---

# Lohr（抽样调查伴读）

> 状态：排队中，队列第 14 门。版本：Lohr《Sampling: Design and Analysis》第 3 版，CRC Press（Chapman & Hall/CRC）2022

前置是 [Casella & Berger](../casella-berger/index.md)（期望、方差、无偏性），以及站内的[统计学伴读第 6 章](../statistics-book/ch06-sampling-distribution.md)、笔记[抽样](../../notes/statistics/sampling/index.md)和[抽样分布](../../notes/statistics/sampling-distributions/index.md)。笔记只讲到四种设计和 Kish 有效样本量，这门课把设计、权重、方差估计做全，管 roadmap 统计进阶「设计与实务进阶」的「复杂抽样与权重校准」。后续是[在线实验](../kohavi/index.md)：A/B 测试里的比率型指标和 CUPED 式回归调整，在这本书里就是第 4 章的比率估计和回归估计。排序见[课程队列](../../posts/wiki-roadmap.md#课程队列)。

## 读法

- **在版教材：只摘句、标页码**。作者页 [sharonlohr.com](https://www.sharonlohr.com/books-1) 放了目录、前言和勘误；配套的 R Companion（Lu & Lohr）和 SAS Companion 两本 PDF 免费下载，数据集有 CSV 包，也有 CRAN 上的 R 包 `SDAResources`
- **计算照 R Companion 走**，用 R 的 `survey` 包；它覆盖第 1–13 章的例子
- **主线是第 1–9 章**：前言（书页 xv）给统计研究生一学期的建议就是第 1–9 章、余下按需挑。本课再加两章：第 11 章（11.6 是校准到总体总量）和第 15 章（非概率样本，业务数据最常碰到的情形）
- 带星号的小节是随机化理论和基于模型的理论，要数理统计底子；[Casella & Berger](../casella-berger/index.md) 读过再回头补
- 第 13 章跳：capture–recapture 估总体规模，离 roadmap 远

## 章节地图

| 章 | 读法 | 接本站哪里 |
|---|---|---|
| 1 Introduction | 必读 | [抽样](../../notes/statistics/sampling/index.md) |
| 2 Simple Probability Samples | 必读 | [抽样分布](../../notes/statistics/sampling-distributions/index.md)、[统计学第 6 章](../statistics-book/ch06-sampling-distribution.md)、[置信区间](../../notes/statistics/confidence-intervals/index.md)；2.7 样本量接[功效与样本量](../../notes/statistics/power-sample-size/index.md) |
| 3 Stratified Sampling | 必读 | [抽样](../../notes/statistics/sampling/index.md)；[实验设计](../../notes/statistics/experimental-design/index.md)的分层与区组 |
| 4 Ratio and Regression Estimation | 必读 | roadmap 统计进阶「设计与实务进阶」的复杂抽样与权重校准（4.4 事后分层）；回归估计接 [Kohavi](../kohavi/index.md) 的 CUPED |
| 5 Cluster Sampling with Equal Probabilities | 必读 | [抽样](../../notes/statistics/sampling/index.md)的整群与设计效应；[功效与样本量](../../notes/statistics/power-sample-size/index.md)的聚类随机实验 |
| 6 Sampling with Unequal Probabilities | 必读 | [抽样](../../notes/statistics/sampling/index.md)的不等概率加权 |
| 7 Complex Surveys | 必读 | roadmap 统计进阶「设计与实务进阶」的复杂抽样与权重校准（7.2 权重、7.4 设计效应） |
| 8 Nonresponse | 必读 | [缺失数据](../../notes/statistics/missing-data/index.md)；roadmap 统计进阶「设计与实务进阶」的复杂抽样与权重校准（8.5 无回答权重调整、8.6 事后分层） |
| 9 Variance Estimation in Complex Surveys | 必读 | 9.3 接[重抽样](../../notes/statistics/resampling/index.md) |
| 10 Categorical Data Analysis in Complex Surveys | 选读 | [分类数据](../../notes/statistics/categorical-data/index.md) |
| 11 Regression with Complex Survey Data | 必读 | [多元回归](../../notes/statistics/multiple-regression/index.md)；11.6 接 roadmap 统计进阶「设计与实务进阶」的复杂抽样与权重校准 |
| 12 Two-Phase Sampling | 选读 | — |
| 13 Estimating the Size of a Population | 跳 | — |
| 14 Rare Populations and Small Area Estimation | 选读 | 14.2 小区域估计接[贝叶斯统计](../../notes/statistics/bayesian/index.md)的层级模型、[BDA3](../bda3/index.md) |
| 15 Nonprobability Samples | 必读 | [抽样](../../notes/statistics/sampling/index.md)的自选择与大样本偏差 |
| 16 Survey Quality | 选读 | — |
| A Probability Concepts Used in Sampling | 选读 | [Blitzstein & Hwang](../blitzstein-hwang/index.md) |

## 口径差异

- **总体方差除 N−1**：Lohr 把总体方差 $S^2$ 定义成除 $N-1$，简单随机抽样均值的方差写成 $(1-n/N)\,S^2/n$；笔记[抽样](../../notes/statistics/sampling/index.md)用除 $N$ 的 $\sigma^2$ 配 $\sqrt{(N-n)/(N-1)}$。两种写法化简后标准误相同，换的只是参数的定义；把一边的方差代进另一边的公式，就会差一个 $(N-1)/N$
- **通用 t 检验不带有限总体修正**：R Companion（书页 18–19）提醒 base R 的 `t.test` 不做 fpc，区间比书上宽；要在 `survey` 包的 `svydesign` 里给 `fpc`
- 其他读到再补

## 课程

还没开课。
