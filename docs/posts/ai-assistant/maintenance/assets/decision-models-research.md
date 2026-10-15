**有，已经不止三家了。价格上，Jev 和微软相同，OpenAI 贵约 2.38 倍；Inception 目前更便宜。性能则还没有可信的统一总冠军，要分延迟、准确率和置信度校准来看。** 以下是截至 **2026 年 10 月 10 日** 查到的信息。

先看你能直接在 **OpenRouter** 上试的几款。价格单位为美元／百万输入 token，表中模型的**输出均免费**。

| 模型 | 输入价格 | 页面当前 P50 延迟 | 上下文 | 输入类型 |
|---|---:|---:|---:|---|
| [TypeSafe Jev 1.13](https://openrouter.ai/typesafe/jev-1.13) | **$0.042** | **约 150 ms** | 64K | 文本 |
| [Microsoft-Decision-1](https://openrouter.ai/microsoft/microsoft-decision-1) | **$0.042** | 约 290 ms | 32K | 文本 |
| [GPT-6 Luna Decisions](https://openrouter.ai/openai/gpt-6-luna-decisions) | $0.10 | 约 220 ms | 1.05M | **文本、图片** |
| [Inception Mercury Decide](https://openrouter.ai/inception/mercury-decide) | **$0.02 促销价**，标价 $0.04 | 约 810 ms | 64K | 文本 |

价格、上下文和延迟来自各模型页。**P50 是平台请求的中位延迟，输入长度和流量不同，不能当成同题竞速排名。**:chatgpt-content-reference{index="0"}

Mercury 还有 [免费版](https://openrouter.ai/inception/mercury-decide:free)，有调用限额。OpenAI 上面的价格专用于 Decisions API；官方说明区域处理和长上下文可能有加价。:chatgpt-content-reference{index="1"}

假设每次决策总共输入 **1,000 token**，做 **100 万次决策**，按上述基础价格计算：Jev／微软约 **$42**，OpenAI **$100**，Mercury 促销价 **$20**。实际还要计入问题、候选答案和评分规则的 token。

**准确率方面，目前的证据更复杂。**

- **微软自测很强**：官方称在 36 套基准、近 15 万道题中准确率最高。不过这是微软自己的测试，不能直接推成所有业务上都优于 Jev 和 OpenAI。:chatgpt-content-reference{index="2"}
- **微软“最快”的宣传存在口径问题**：H2O 指出，微软比较中的部分自部署延迟用了榜单的“实测 ×2＋150 ms”调整值。例如 H2O 是约 **29 ms 实测**，调整后约 **210 ms**。因此，这种比较不足以证明微软是整个市场最快的模型。:chatgpt-content-reference{index="3"}
- **决策模型也不会在每类任务上胜出**：Red Hat 在内容安全、提示注入测试中发现，Jev 并未稳定超过专用小分类器或 LLM judge。模型选择仍然取决于任务。:chatgpt-content-reference{index="4"}

独立的 **JevBench v1.6.1** 能提供一些横向参考，但它没有给出上述三款主力模型的完整同条件排名：

| 模型 | Intelligence 分 | 校准分 | 综合分 |
|---|---:|---:|---:|
| Levanto Sage 1.3 | 65.6 | **91.6** | **74.0** |
| H2O-Lightning-4B v1.1 | 60.0 | 90.0 | 72.5 |
| Inception Mercury Decide | **65.9** | 81.3 | 72.4 |
| Jev 1.13 | 63.6 | 90.6 | 71.5 |

**这些分数不是准确率百分比。** 综合分还包含速度和成本，部分自部署成本是估算值。这里能看出：H2O 综合分高于 Jev，但 Intelligence 较低；Mercury 的 Intelligence 较高，但概率校准较弱。校准衡量的是“声称有 90% 把握的回答，是否真的约有 90% 正确”。:chatgpt-content-reference{index="5"}

其他已经确认的厂商和产品：

| 厂商 | 产品 | 价格与特点 |
|---|---|---|
| **H2O.ai** | [H2O-Lightning-4B](https://huggingface.co/h2oai/h2o-lightning-4b) | 开放权重，Qwen3.5-4B 底座，支持文本和图片；自部署成本取决于硬件及利用率。:chatgpt-content-reference{index="6"} |
| **Fastino** | [GLiDE](https://fastino.ai/blog/introducing-glide-the-first-thinking-decision-model)、GLiNER2.5-Decide | GLiDE 对不确定的问题增加推理；另有开放权重版本。此次未核实到可直接比较的 API 单价。:chatgpt-content-reference{index="7"} |
| **Levanto Labs** | [Sage](https://levanto.ai/pricing) | 输入 $0.038–0.05/M，随套餐变化；**推理输出 $10/M**，最终答案免费，另有套餐费用。支持图片、推理和搜索。:chatgpt-content-reference{index="8"} |
| **Databricks** | `ai_decide` | 提供 SQL／REST 决策能力，底层模型可能更新；更适合已有 Databricks 数据流程，不能简单当成一个固定模型来排名。:chatgpt-content-reference{index="9"} |

**我的试用顺序建议：**

- **文本分类、路由、Agent 控制**：先用 **Jev＋微软**做同题对比，单价相同，重点看错误率和 P95 延迟。
- **图片判断或超长文档**：先试 **GPT-6 Luna Decisions**。
- **低成本探索**：先试 **Mercury 免费版**；需要自部署时，优先评估 **H2O-Lightning-4B**。

如果主要处理中文，值得拿自己的中文样本测试；现有榜单分数不足以说明中文业务中的准确率。比较时除了“答对多少”，还应看**高置信度错误有多少**——这直接决定你能否放心让程序自动采取下一步。
