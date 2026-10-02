---
description: "What If 伴读导读：从统计与流行病学一侧讲潜在结果，识别假设、IP weighting、g-formula 到时变处理；队列第 7 门，排队中"
---

# What If（因果推断伴读）

> 状态：排队中，队列第 7 门。版本：Miguel A. Hernán、James M. Robins《Causal Inference: What If》，Chapman & Hall/CRC 2020（作者给的引用年份；印刷版尚未上市，在线 PDF 持续修订，本页按 2026-08-19 版）

前置是 [Wooldridge](../wooldridge/index.md)，尤其第 19 章；站内对应笔记是[因果推断](../../notes/statistics/causal-inference/index.md)、[实验设计](../../notes/statistics/experimental-design/index.md)、[缺失数据](../../notes/statistics/missing-data/index.md)。这门课从统计与流行病学一侧讲潜在结果：先不用模型把识别讲清，再用模型估计，最后处理时变处理。后面接 roadmap 计量「ML × 计量」的 Double ML 与异质效应，以及深度学习必修档的「因果 + DL」，DL 那半等 [d2l 伴读](../d2l/index.md)之后再接。排在第 7 门的理由见[课程队列](../../posts/wiki-roadmap.md#课程队列)：从统计角度讲潜在结果，补计量的经济学视角。

## 读法

- **免费 PDF**：作者页 [miguelhernan.org/whatifbook](https://miguelhernan.org/whatifbook) 提供下载。PDF 隔一阵就修订，章节和页码会动，摘句时注明 PDF 日期
- **Part I 全读**（第 1–10 章，Causal inference without models）：不用模型讲识别，后两部分都建在它上面
- **Part II 是现场**（第 11–18 章，Causal inference with models）：第 12–17 章用 NHEFS 数据，作者页给 CSV；Python 代码是 James Fiedler 的 [causal_inference_python_code](https://github.com/jrfiedler/causal_inference_python_code)，覆盖第 11–17 章。题换一个处理变量或结局自己出，不照抄书里的数
- **Part III 选读**（第 19–23 章，Causal inference for time-varying treatments）：时变处理和 g-methods 离应用统计的日常远；要只读一章就读第 22 章 target trial emulation，它和 3.6 节呼应
- 正文旁的 Fine Point 面向所有读者，Technical Point 要中级统计，后者选读

## 章节地图

| 章 | 读法 | 接本站哪里 |
|---|---|---|
| 1 A definition of causal effect | 必读 | [因果推断](../../notes/statistics/causal-inference/index.md)；论文清单的 Rubin 1974 |
| 2 Randomized experiments | 必读 | [实验设计](../../notes/statistics/experimental-design/index.md) |
| 3 Observational studies | 必读 | [因果推断](../../notes/statistics/causal-inference/index.md)的三条识别假设 |
| 4 Effect modification | 必读 | roadmap 计量「ML × 计量」的 causal forest 与异质效应 |
| 5 Interaction | 选读 | — |
| 6 Graphical representation of causal effects | 必读 | [因果推断](../../notes/statistics/causal-inference/index.md)的 DAG |
| 7 Confounding | 必读 | [因果推断](../../notes/statistics/causal-inference/index.md)；roadmap 计量「内生性与识别」的遗漏变量 |
| 8 Selection bias | 必读 | [缺失数据](../../notes/statistics/missing-data/index.md)、[抽样](../../notes/statistics/sampling/index.md) |
| 9 Measurement bias and "Noncausal" diagrams | 选读 | roadmap 计量「内生性与识别」的遗漏变量与测量误差 |
| 10 Random variability | 必读 | [置信区间](../../notes/statistics/confidence-intervals/index.md) |
| 11 Why model? | 必读 | 11.5 节接 roadmap 机器学习「框架与评估」的偏差-方差；[ISLP](../islp/index.md) 第 2 章 |
| 12 IP weighting and marginal structural models | 必读 | [因果推断](../../notes/statistics/causal-inference/index.md)的倾向得分与加权；roadmap 计量「面板与政策评估」的倾向得分与双稳健；12.6 节接[缺失数据](../../notes/statistics/missing-data/index.md) |
| 13 Standardization and the parametric g-formula | 必读 | [因果推断](../../notes/statistics/causal-inference/index.md)的回归标准化 |
| 14 G-estimation of structural nested models | 选读 | — |
| 15 Outcome regression and propensity scores | 必读 | [因果推断](../../notes/statistics/causal-inference/index.md)的匹配与双重稳健；[Wooldridge](../wooldridge/index.md) 第 19 章 |
| 16 Instrumental variable estimation | 必读 | roadmap 计量「内生性与识别」的 IV / 2SLS 与弱工具、LATE；[Wooldridge](../wooldridge/index.md) 第 15、19 章 |
| 17 Causal survival analysis | 选读 | roadmap 统计进阶「线性模型与 GLM」的生存分析 |
| 18 Variable selection and high-dimensional data | 必读 | roadmap 计量「ML × 计量」的 Double ML；深度学习必修档的「因果 + DL」 |
| 19 Time-varying treatments | 选读 | — |
| 20 Treatment-confounder feedback | 选读 | — |
| 21 G-methods for time-varying treatments | 选读 | — |
| 22 Target trial emulation | 选读 | [实验设计](../../notes/statistics/experimental-design/index.md) |
| 23 Causal mediation | 选读 | — |

## 口径差异

- **记号不同**：书里处理记 A、协变量记 L、反事实结局记上标 $Y^{a}$；[因果推断](../../notes/statistics/causal-inference/index.md)笔记处理记 Z、协变量记 X、潜在结果记 $Y(z)$。Wooldridge 用什么记号，读到再补
- **识别假设换了名字**：书里的 exchangeability、positivity，Wooldridge 第 19 章叫 unconfoundedness、overlap，说的是同一组条件
- **effect modification 和 interaction 分开定义**：第 4 章的修饰变量不必是干预，第 5 章的 interaction 要求两个变量都被干预。回归里的交互项两种都可能代表，读系数前先说清是哪一种
- 其他读到再补

## 课程

还没开课。排到时 Part I 先读完，第一课从第 12 章开：NHEFS 是现成的数据现场。
