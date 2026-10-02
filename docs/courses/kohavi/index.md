---
description: "Kohavi 伴读导读：A/B 测试的工业实践，SRM、方差缩减、变体间干扰各有专章；队列第 15 门，排队中"
---

# Trustworthy Online Controlled Experiments（在线实验伴读）

> 状态：排队中，队列第 15 门。版本：Kohavi、Tang、Xu《Trustworthy Online Controlled Experiments: A Practical Guide to A/B Testing》，Cambridge University Press 2020

前置是 [What If](../what-if/index.md)（潜在结果，随机化为什么能识别因果）和 [Lohr](../lohr/index.md)（分配单位、比率与回归估计、设计效应），站内笔记[实验设计](../../notes/statistics/experimental-design/index.md)、[功效与样本量](../../notes/statistics/power-sample-size/index.md)、[假设检验](../../notes/statistics/hypothesis-testing/index.md)是底子。这门课管 roadmap 统计进阶「设计与实务进阶」的「A/B 工业实践（CUPED、SRM、序贯、网络效应）」。队列最后一门，读完回流成那一页笔记。排序见[课程队列](../../posts/wiki-roadmap.md#课程队列)。

## 读法

- **在版教材：只摘句、标页码**。第 1 章连同目录和前言，作者在 [experimentguide.com](https://experimentguide.com/) 免费放出；站上还有勘误和参考文献，也列了中、日、韩、俄、波兰语译本（中译本书名《关键迭代：可信赖的线上对照实验》）
- **按读者分部读**：前言（书页 xv–xvi）把全书分五部分，第一部分人人读，第二部分偏管理层，第三部分讲实验之外的手段，第四部分给建平台的工程师，第五部分给做分析的数据科学家。本课必读第一、五部分，第二到四部分只挑和统计有关的章
- **roadmap 四件事在书里的位置**：SRM 有专章（第 21 章）；网络效应对应第 22 章的变体间泄漏与干扰；CUPED 归第 18 章的方差缩减（Improving Sensitivity 一节）。**序贯检验目录里没有专章**，要另找来源，排到再定
- **统计推导回前置课补**：第 17 章统计基础只占 8 页（书页 185–192）。这本书的长处在坑和平台，公式回 [What If](../what-if/index.md)、[Lohr](../lohr/index.md) 和站内笔记去推

## 章节地图

| 章 | 读法 | 接本站哪里 |
|---|---|---|
| 1 Introduction and Motivation | 必读 | [实验设计](../../notes/statistics/experimental-design/index.md) |
| 2 Running and Analyzing Experiments: An End-to-End Example | 必读 | [假设检验](../../notes/statistics/hypothesis-testing/index.md)、[功效与样本量](../../notes/statistics/power-sample-size/index.md) |
| 3 Twyman's Law and Experimentation Trustworthiness | 必读 | [假设检验](../../notes/statistics/hypothesis-testing/index.md)、[置信区间](../../notes/statistics/confidence-intervals/index.md) |
| 4 Experimentation Platform and Culture | 选读 | — |
| 5 Speed Matters: An End-to-End Case Study | 选读 | — |
| 6 Organizational Metrics | 选读 | — |
| 7 Metrics for Experimentation and the Overall Evaluation Criterion | 必读 | [实验设计](../../notes/statistics/experimental-design/index.md)的 estimand |
| 8 Institutional Memory and Meta-Analysis | 选读 | — |
| 9 Ethics in Controlled Experiments | 选读 | — |
| 10 Complementary Techniques | 跳 | — |
| 11 Observational Causal Studies | 选读 | [因果推断](../../notes/statistics/causal-inference/index.md)；[What If](../what-if/index.md) |
| 12 Client-Side Experiments | 跳 | — |
| 13 Instrumentation | 跳 | — |
| 14 Choosing a Randomization Unit | 必读 | [实验设计](../../notes/statistics/experimental-design/index.md)的分配单位；[Lohr](../lohr/index.md) 第 5 章整群抽样 |
| 15 Ramping Experiment Exposure: Trading Off Speed, Quality, and Risk | 选读 | — |
| 16 Scaling Experiment Analyses | 跳 | — |
| 17 The Statistics behind Online Controlled Experiments | 必读 | [假设检验](../../notes/statistics/hypothesis-testing/index.md)、[置信区间](../../notes/statistics/confidence-intervals/index.md)、[功效与样本量](../../notes/statistics/power-sample-size/index.md) |
| 18 Variance Estimation and Improved Sensitivity: Pitfalls and Solutions | 必读 | roadmap 统计进阶「设计与实务进阶」A/B 工业实践的 CUPED；[Lohr](../lohr/index.md) 第 4 章回归估计 |
| 19 The A/A Test | 必读 | [假设检验](../../notes/statistics/hypothesis-testing/index.md) |
| 20 Triggering for Improved Sensitivity | 必读 | [功效与样本量](../../notes/statistics/power-sample-size/index.md) |
| 21 Sample Ratio Mismatch and Other Trust-Related Guardrail Metrics | 必读 | roadmap 统计进阶「设计与实务进阶」A/B 工业实践的 SRM |
| 22 Leakage and Interference between Variants | 必读 | roadmap 统计进阶「设计与实务进阶」A/B 工业实践的网络效应；[因果推断](../../notes/statistics/causal-inference/index.md)的无干扰假设 |
| 23 Measuring Long-Term Treatment Effects | 选读 | — |

## 口径差异

- **「Parameter」是实验因子**：书里的 parameter 指可控的实验变量，也叫 factor，取值叫 level（书页 7）；统计里的参数指总体的量，见[统计学第 1 章](../statistics-book/ch01-overview.md)。读到 parameter 先看上下文
- **「Multivariate test」是多因子实验**：MVT 指几个因子一起测（书页 7），对应笔记[实验设计](../../notes/statistics/experimental-design/index.md)的因子设计；[多元统计](../johnson-wichern/index.md)的「多元」指多个响应变量，两者无关
- **「Variant」包括对照组**：书里把 Control 也算一个 variant（书页 7）；有的文献里 variant 只指实验组
- 其他读到再补

## 课程

还没开课。
