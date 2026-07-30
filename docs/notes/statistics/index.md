# 统计学

统计学不是一串检验名称。完整路线从数据怎样产生开始，经过描述、建模和推断，最后回到决策：**先写清 estimand，再计算估计值；先检查设计和假设，再解释不确定性。**

```mermaid
flowchart LR
    A[数据怎样产生] --> B[数据长什么样]
    B --> C[样本怎样波动]
    C --> D[估计与检验]
    D --> E[关系与模型]
    E --> F[因果、预测与决策]
```

## 一、基础：先认识数据与随机性

- [描述统计](data-description/index.md) —— 中心、散布、分布形状和异常要一起看；一个平均数通常不够
- [概率模型](probability-models/index.md) —— 条件概率、独立性、Bayes 公式、大数定律和中心极限定理组成推断的语法
- [常见分布](distributions/index.md) —— 从数据生成机制识别 Bernoulli、Binomial、Poisson、Normal、Gamma、Beta、t、卡方和 F
- [抽样](sampling/index.md) —— 标准误来自抽样设计；样本再大，也修不好覆盖偏差和自选择
- [抽样分布](sampling-distributions/index.md) —— 区分总体、样本与统计量的分布，弄清标准误为什么存在

## 二、推断：从一个样本谈未知总体

- [点估计](estimation/index.md) —— 用偏差、方差、MSE 和一致性评价估计量，理解矩估计、最大似然与稳健估计
- [置信区间](confidence-intervals/index.md) —— 区间是长期覆盖程序，不是“参数有 95% 概率在里面”
- [假设检验](hypothesis-testing/index.md) —— p 值只度量数据与零假设的冲突，不等于效应大小或零假设为真的概率
- [组间比较](group-comparisons/index.md) —— 独立、配对和二元结局有不同标准误与效应尺度
- [功效与样本量](power-sample-size/index.md) —— 研究开始前先定义最小实际重要效应，再权衡 $\alpha$、功效、噪声和设计
- [分类数据](categorical-data/index.md) —— 从列联表到卡方、Fisher、风险差、风险比、odds ratio 和 logistic 回归
- [非参数方法](nonparametric/index.md) —— 秩方法少依赖分布，但仍有抽样、独立性和分布形状假设
- [重抽样](resampling/index.md) —— bootstrap 估不确定性，置换检验造零分布，交叉验证估泛化误差

## 三、模型：描述关系而不掩盖假设

- [简单线性回归](linear-regression/index.md) —— 一条线同时包含效应估计、均值响应、个体预测和模型诊断
- [多元回归](multiple-regression/index.md) —— 系数是条件关联；交互、非线性、共线性和变量角色决定怎样解释
- [方差分析](anova/index.md) —— ANOVA 用方差分解比较均值，并延伸到事后比较、多因素与重复测量
- [时间序列](time-series/index.md) —— 趋势、季节和自相关让时间顺序不能被打乱

## 四、设计与实务：让结论真的回答原问题

- [实验设计](experimental-design/index.md) —— 随机化、对照、重复和区组在数据产生之前决定证据强度
- [因果推断](causal-inference/index.md) —— 从潜在结果和 DAG 说清反事实、混杂、识别与常用准实验设计
- [缺失数据](missing-data/index.md) —— MCAR、MAR、MNAR 是关于缺失机制的假设，删掉缺失行不是中性操作
- [贝叶斯统计](bayesian/index.md) —— 先验通过似然更新为后验，并用后验预测检查模型、支持决策
- [统计分析工作流](statistical-workflow/index.md) —— 把问题、数据生成、estimand、模型、诊断、不确定性和决策连成可复核证据链

## 建议读法

第一次系统学习按页面顺序读。手头已有问题时，可以从下面的入口切入：

| 现在的问题 | 先读 |
|---|---|
| 我只有一张数据表，不知道从哪开始 | [描述统计](data-description/index.md) → [统计分析工作流](statistical-workflow/index.md) |
| 我想比较 A/B 两组 | [抽样](sampling/index.md) → [组间比较](group-comparisons/index.md) → [假设检验](hypothesis-testing/index.md) |
| 我想解释几个变量的关系 | [简单线性回归](linear-regression/index.md) → [多元回归](multiple-regression/index.md) |
| 我想声称“X 导致 Y” | [实验设计](experimental-design/index.md) → [因果推断](causal-inference/index.md) |
| 我担心样本不够 | [功效与样本量](power-sample-size/index.md) |
| 数据有缺失、聚类或时间顺序 | [缺失数据](missing-data/index.md) / [抽样](sampling/index.md) / [时间序列](time-series/index.md) |

每章都可以独立查阅，但不要跳过数据生成过程。**统计模型能量化已声明假设下的不确定性，不能替未声明的设计问题兜底。**
