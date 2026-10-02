---
description: "FPP3 伴读导读：预测实务的主干，分解、ETS、ARIMA 与滚动评估，以 Python 版为准；队列第 13 门，排队中"
---

# FPP3（时间序列伴读）

> 状态：排队中，队列第 13 门。版本：Rob J Hyndman、George Athanasopoulos《Forecasting: Principles and Practice》第 3 版，OTexts 2021；本站以 Python 版为准：Hyndman、Athanasopoulos、Garza、Challu、Mergenthaler、Olivares《Forecasting: Principles and Practice, the Pythonic Way》，OTexts 2026

前置是[统计学伴读第 4 章](../statistics-book/ch04-time-series.md)（水平、速度与季节分解）和[曼昆宏观](../mankiw-macro/index.md)（序列背后的经济量）；站内对应笔记是[时间序列](../../notes/statistics/time-series/index.md)。这门课管预测实务：分解、基线、ETS、ARIMA、动态回归和按时间滚动的评估，对应 roadmap 统计进阶「设计与实务进阶」的时序进阶。Python 版另加神经网络和基础模型两章，正好接深度学习必修档的「时序深度模型与基础模型」，网络结构的底子由排在前面的 [d2l 伴读](../d2l/index.md)打。时序回归的推断（序列相关、HAC 标准误）归 [Wooldridge](../wooldridge/index.md)，这里不重复。排在第 13 门的理由见[课程队列](../../posts/wiki-roadmap.md#课程队列)：预测实务与 ETS / ARIMA 基线，接深度学习的时序那块。

## 读法

- **免费在线，以 Python 版为准**：[OTexts.com/fpppy](https://otexts.com/fpppy/)。第 1–13 章跟 R 版第 3 版一一对应，代码换成 Nixtla 的 nixtlaverse（`statsforecast`、`neuralforecast`、`utilsforecast` 等），另加第 14、15 章。R 版 [OTexts.com/fpp3](https://otexts.com/fpp3/) 只做对照，讲解链到 Python 版的章节，不摘抄
- **环境照书**：附录 Using Python 给了 `environment.yml`（conda 环境名 `fpppy`）和打包好的数据 `fpppy_data.zip`，版本钉死，跑出来的数才能和书对上
- **每章习题当任务**：题换一条序列自己出，不照抄书里的数
- 第 6 章判断预测跳；第 11 章层级预测、第 12、13 章选读
- **GARCH 不在书里**：roadmap 时序进阶的 GARCH 去 [Wooldridge](../wooldridge/index.md) 第 12 章的 ARCH 一节

## 章节地图

| 章 | 读法 | 接本站哪里 |
|---|---|---|
| 1 Getting started | 必读 | [时间序列](../../notes/statistics/time-series/index.md)的「先确认时间索引和预测任务」 |
| 2 Time series graphics | 必读 | [时间序列](../../notes/statistics/time-series/index.md)的自相关 |
| 3 Time series decomposition | 必读 | [统计学第 4 章](../statistics-book/ch04-time-series.md)的季节分解；[时间序列](../../notes/statistics/time-series/index.md)的四类结构 |
| 4 Time series features | 选读 | — |
| 5 The forecaster's toolbox | 必读 | [时间序列](../../notes/statistics/time-series/index.md)的朴素基线与按时间向前滚；roadmap 时序进阶的滚动评估 |
| 6 Judgmental forecasts | 跳 | — |
| 7 Time series regression models | 必读 | [多元回归](../../notes/statistics/multiple-regression/index.md)；[Wooldridge](../wooldridge/index.md) 第 10 章 |
| 8 Exponential smoothing | 必读 | [时间序列](../../notes/statistics/time-series/index.md)的指数平滑；roadmap 时序进阶的 ETS 状态空间 |
| 9 ARIMA models | 必读 | [时间序列](../../notes/statistics/time-series/index.md)的 ARIMA；roadmap 计量「时序计量」的单位根与 ADF |
| 10 Dynamic regression models | 必读 | [时间序列](../../notes/statistics/time-series/index.md)的外生变量回归；[Wooldridge](../wooldridge/index.md) 第 12 章 |
| 11 Forecasting hierarchical and grouped time series | 选读 | — |
| 12 Advanced forecasting methods | 选读 | 12.3 节 VAR 接 roadmap 时序进阶的 VAR、计量「时序计量」的 VAR 与脉冲响应；[曼昆宏观](../mankiw-macro/index.md) |
| 13 Some practical forecasting issues | 选读 | 13.7 节接[缺失数据](../../notes/statistics/missing-data/index.md) |
| 14 Neural networks（Python 版） | 必读 | roadmap 深度学习必修档「时序深度模型与基础模型」的 PatchTST、iTransformer；[d2l 伴读](../d2l/index.md) |
| 15 Foundation forecasting models（Python 版） | 必读 | roadmap 深度学习必修档同一行的 Chronos / TimesFM |

## 口径差异

- **两种单位根检验的零假设相反**：书里 9.1 节用 KPSS，零假设是序列平稳；Wooldridge 第 18 章的 Dickey-Fuller 零假设是有单位根。同一条序列两边都「不拒绝」时，结论正好相反
- **Python 版和 R 版的章内编号不全一致**：R 版 12.4 节是 Neural network models，Python 版把神经网络挪进第 14 章，12.4 节换成 Bootstrapping and bagging。引用节号时写明是哪一版
- 其他读到再补

## 课程

还没开课。排到时先写第 5 章：基线和滚动评估是后面每一章比较模型的尺子。
