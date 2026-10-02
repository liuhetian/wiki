---
description: "d2l 伴读导读：深度学习只走基础与 Transformer 两段，读完转去时序、表格、不确定性；队列第 8 门，排队中"
---

# Dive into Deep Learning（深度学习伴读）

> 状态：排队中，队列第 8 门。版本：Zhang、Lipton、Li、Smola《Dive into Deep Learning》，Cambridge University Press 2023；线上版 d2l.ai 1.0.3

前置是 [ISLP 伴读](../islp/index.md)，它的第 10 章 Deep Learning 由这门课接手；线性回归与 softmax 回归的统计底子在 ISLP 第 3、4 章和笔记[多元回归](../../notes/statistics/multiple-regression/index.md)。这门课只走 roadmap 深度学习必修档的「基础」与「Transformer」两段，读完直奔必修档里的时序、表格、不确定性三块：这三块是[预测项目](../../posts/prediction-loop.md)直接用得上的，时序那块拿 [FPP3](../fpp3/index.md) 的 ETS / ARIMA 当基线。排序见[课程队列](../../posts/wiki-roadmap.md#课程队列)。

## 读法

- **免费线上版**：英文版 [d2l.ai](https://d2l.ai/) 每节有 PyTorch、MXNet、JAX、TensorFlow 四套实现，选 PyTorch。讲解直接链到小节，不摘抄
- **纸质版只到第 11 章**：Cambridge 2023 的纸质书只收第 1–11 章和工具附录，第 12 章优化算法起只在线上。本课以线上版为准
- **章号以英文版为准**，和 roadmap 一致。中文版 [zh.d2l.ai](https://zh.d2l.ai/)（第二版 2.0.0）对不上：英文第 3、4 章在中文版合成第 3 章「线性神经网络」，之后整体错一章（英文第 11 章 Transformer 是中文第 10 章，英文第 12 章优化是中文第 11 章）；小节也重排过，权重衰减英文是 3.7、中文是 4.5；英文第 17–22 章中文版没有。代码接口也不同：英文版 3.2 起用 `d2l.Module` / `DataModule` / `Trainer` 一套面向对象的写法，中文版没有这一节。中文版只做对照
- **只走两段**：「基础」是第 3–6 章加第 12 章，「Transformer」是第 11 章。roadmap 基础档列的 BN / LN 和残差不在第 3–6 章：BatchNorm 与 LayerNorm 在 8.5，ResNet 在 8.6，这两节补读；第 7 章只为看懂这两节的卷积例子。第 10 章的 10.5–10.7（机器翻译数据、编码器-解码器、seq2seq）是第 11 章例子的前置
- **读完转去三块**：时序深度模型、表格 DL 对 GBDT、不确定性量化，d2l 都没讲，资料照 roadmap 必修档那三行走

## 章节地图

| 章 | 读法 | 接本站哪里 |
|---|---|---|
| 1 Introduction | 跳 | — |
| 2 Preliminaries | 选读 | 2.6 接 [Blitzstein & Hwang](../blitzstein-hwang/index.md) |
| 3 Linear Neural Networks for Regression | 必读 | roadmap 深度学习必修「基础」；[简单线性回归](../../notes/statistics/linear-regression/index.md)；3.7 的权重衰减对照 [ISLP](../islp/index.md) 第 6 章 ridge |
| 4 Linear Neural Networks for Classification | 必读 | [分类指标](../../notes/machine-learning/classification-metrics/index.md)；roadmap 机器学习「线性与正则化」的逻辑回归与 softmax 作为 GLM |
| 5 Multilayer Perceptrons | 必读 | roadmap 深度学习必修「基础」的 MLP、反向传播、初始化、Dropout |
| 6 Builders' Guide | 必读 | roadmap 深度学习必修「基础」 |
| 7 Convolutional Neural Networks | 选读 | roadmap 深度学习「了解」档的 CNN 与 CV |
| 8 Modern Convolutional Neural Networks | 选读 | 8.5、8.6 接 roadmap 深度学习必修「基础」的 BN / LN、残差 |
| 9 Recurrent Neural Networks | 选读 | roadmap 深度学习「了解」档的 RNN / LSTM |
| 10 Modern Recurrent Neural Networks | 选读 | 10.5–10.7 是第 11 章的前置；roadmap 深度学习「了解」档的 RNN / LSTM |
| 11 Attention Mechanisms and Transformers | 必读 | roadmap 深度学习必修「Transformer 与注意力」；roadmap 论文起步清单的 Vaswani 2017 Attention |
| 12 Optimization Algorithms | 必读 | roadmap 深度学习必修「基础」的 SGD / Adam；12.3 的牛顿法接 roadmap 统计进阶「统计计算」的数值优化，交给 [Givens & Hoeting](../givens-hoeting/index.md) |
| 13 Computational Performance | 跳 | roadmap 深度学习「了解」档的训练与部署 |
| 14 Computer Vision | 跳 | roadmap 深度学习「了解」档的 CNN 与 CV |
| 15 Natural Language Processing: Pretraining | 跳 | — |
| 16 Natural Language Processing: Applications | 跳 | — |
| 17 Reinforcement Learning | 跳 | roadmap 深度学习「了解」档的 RL |
| 18 Gaussian Processes | 选读 | roadmap 机器学习「核与非参」的核岭回归与 GP |
| 19 Hyperparameter Optimization | 跳 | — |
| 20 Generative Adversarial Networks | 跳 | — |
| 21 Recommender Systems | 跳 | — |
| 22 Appendix: Mathematics for Deep Learning | 选读 | 查阅用；22.7 极大似然接 [Casella & Berger](../casella-berger/index.md) |
| 23 Appendix: Tools for Deep Learning | 跳 | — |

## 口径差异

- **平方损失带 1/2**：式 (3.1.5) 的平方损失乘了 1/2，再按样本平均；PyTorch 的 `nn.MSELoss` 不带 1/2，3.5.2 节自己点明了。同一个模型，从零实现和简洁实现打印出的 loss 差一倍。ISLP 的 RSS 是求和，既不带 1/2 也不平均
- **权重衰减的 λ 和 ISLP 的 λ 差一个 n**：式 (3.7.2) 把惩罚写成 $\frac{\lambda}{2}\|\mathbf w\|^2$，加在按样本平均、带 1/2 的损失上；ISLP 的 ridge 是 RSS 加 $\lambda\sum\beta_j^2$。两边目标乘开对齐，d2l 的 λ 等于 ISLP 的 λ 除以 n。PyTorch `SGD` 的 `weight_decay` 就是 d2l 的 λ
- **PyTorch 默认连 bias 一起衰减**：3.7 节点明了这一点，示例只给权重设 `weight_decay`；ISLP 的 ridge 不罚截距
- 其他读到再补

## 课程

还没开课。
