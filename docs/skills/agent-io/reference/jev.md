---
description: "Agent 让大模型做结构化判断：默认 OpenRouter 的 typesafe/jev-1.13；要看图片或材料超过 64k token 换 openai/gpt-6-luna-decisions（图片只收 base64 data URL），用户点名微软换 microsoft/microsoft-decision-1，要省钱换 inception/mercury-decide，请求格式一样只改 model；走海外中转 https://openrouter.reverse-pro.xyz，MY_API_KEY 写成 Authorization: Bearer；不是对话模型，POST /api/alpha/decisions 交 state 和 questions，返回是非概率、选项或分档，不返回文字；一秒多，输出不收钱"
---

# 结构化判断

默认用 OpenRouter 上的 `typesafe/jev-1.13`，走[中转](../../../posts/ai-assistant/api-gateway.md)的海外机。它不是对话模型：交给它一段材料（`state`）和几道带类型的题（`questions`），它返回是非题的概率、单选题选了哪项、分档题落在第几档，不生成文字。适合代码里要分类、路由、打标签的地方，比如判断工单归哪个组、有多急。照 [OpenRouter 模型页](https://openrouter.ai/typesafe/jev-1.13)的示例调，只改两处：

- **base URL**：`https://openrouter.ai` 换成 `https://openrouter.reverse-pro.xyz`
- **API key**：用 `.env` 里的 `MY_API_KEY`，写成 `Authorization: Bearer $MY_API_KEY`，别打印出来

```bash
curl -sS https://openrouter.reverse-pro.xyz/api/alpha/decisions \
  -H "Authorization: Bearer $MY_API_KEY" -H "Content-Type: application/json" \
  -d '{"model": "typesafe/jev-1.13",
       "state": {"ticket": "我点了支付之后结账页面一片空白，换了两个浏览器都一样。周五发工资前必须修好。"},
       "questions": {
         "is_bug": {"type": "noul", "instructions": "`ticket` 里的客户是在报告软件缺陷吗？"},
         "team":   {"type": "choice", "instructions": "`ticket` 该交给哪个团队？",
                    "criteria": {"payments": "结账、账单、支付", "frontend": "渲染、布局、浏览器兼容", "account": "登录、权限、资料"}},
         "urgency": {"type": "score", "instructions": "`ticket` 有多急？",
                     "criteria": ["不急，下个版本再说", "这周内要修", "现在就挡着收钱"]}}}'
```

返回的 `answers` 按题目的键排好（摘录）：

```json
{"is_bug":  {"type": "noul", "noul": 0.96},
 "team":    {"type": "choice", "choice": "payments", "probabilities": {"payments": 0.73, "frontend": 0.27, "account": 0}, "confidence": 0.6},
 "urgency": {"type": "score", "score": 1.93, "probabilities": {"0": 0, "1": 0.07, "2": 0.93}, "confidence": 0.89, "legend": {"0": "不急，下个版本再说", "1": "这周内要修", "2": "现在就挡着收钱"}}}
```

- **端点**：`/api/alpha/decisions`，`/api/v1/systemone` 也行，两个返回一样。调 `chat/completions` 会被拒，OpenAI SDK 用不了，直接发 HTTP
- **三种题**：
    - `noul` 是非题：返回 `noul`，是「是」的概率，不是布尔值。可以加 `criteria: {"true": "…", "false": "…"}` 说清楚什么算是、什么算否
    - `choice` 单选题：`criteria` 写成「选项键: 说明」的对象，返回 `choice` 和每项的概率
    - `score` 分档题：`criteria` 写成从低到高的数组，返回的 `score` 是按概率算的期望值，会带小数，比如 1.93
- **state**：可以是对象，也可以是一个字符串。`instructions` 里用反引号指字段，比如 `` `ticket` ``。一次可以问好几道题，各题分开作答
- **阈值自己定**：材料说得含糊，概率就落在中间。「订阅扣了我两次钱」问「是不是要退款」，中英文几种问法只给了 0.44 到 0.76；加上「请退给我」就是 0.98。要靠得住，就把 state 写清楚，再按业务定一个阈值
- **结果**：经中转一秒多，中文能用。只收输入的钱，每百万 token 0.042 美元，三道题一次大约 0.00002 美元；上下文 64k

## 换模型 { #other-models }

OpenRouter 上另外三家的决策模型，请求格式和 Jev 一样，只改 `model`。默认用 Jev，碰到下面几种情况再换：

| 情况 | `model` |
|---|---|
| 要看图片 | `openai/gpt-6-luna-decisions` |
| 材料超过 64k token | `openai/gpt-6-luna-decisions`，上下文 105 万 |
| 用户点名微软，或者要拿两家同题对比 | `microsoft/microsoft-decision-1` |
| 用户要省钱、批量很大 | `inception/mercury-decide` |

- **带图片**：`state` 写成数组，文字和图片混排。图片只收 base64 data URL，填 http 链接返回 400。请求体太大，命令行参数放不下，先写进文件再 `-d @body.json`。看图一次几秒到半分钟，超时别设太短

    ```json
    "state": ["这是一张统计课的配图。", {"type": "image_url", "image_url": {"url": "data:image/png;base64,…"}}]
    ```

- **图片别发给 Jev 和微软**：Jev 返回 400；微软填图片链接不报错，把链接当文字读，照样给出概率，那是从链接字面猜出来的
- **OpenAI 会拒答**：材料里找不到答案，它不给中间的概率，直接返回 502 `refused to answer question`。当「判断不了」处理，别当网络故障重试

维护记录：[接口从哪来、四家的实测和选型依据](../../../posts/ai-assistant/maintenance/jev.md)。正常使用不用看，出问题再看。
