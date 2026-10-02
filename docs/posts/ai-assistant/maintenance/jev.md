---
description: "结构化判断的维护记录：OpenRouter 上 typesafe/jev-1.13 的接口从哪来（Context7 查到的 OpenRouter 文档仓库）、模型元数据和价格，2026-10-02 经海外中转实测两个端点、中文、三种题、含糊材料的概率和报错；用接口不用看，出问题再看"
---

# 结构化判断的维护记录：OpenRouter 的 Jev 1.13

这是[结构化判断：Jev](../../../skills/agent-io/reference/jev.md)背后的维护记录。用接口时不用看，接口出问题或者要换模型时再看。

## 接口从哪来 { #upstream }

- 模型是用户指定的，页面是 [openrouter.ai/typesafe/jev-1.13](https://openrouter.ai/typesafe/jev-1.13)。页面靠 JS 渲染，抓不到正文。
- 请求格式是经 Context7 查 OpenRouter 文档仓库（`openrouterteam/docs`）查到的，主要看了这几篇：博客 2026-09-21 的「What is Jev」、2026-09-23 的「How to use Jev」，社区指南 `jev-tutorial.mdx` 和 `typesafe-sdk.mdx`。要点：
    - Jev 是 TypeSafe 的第一个 System One 模型，回答关于 state 的带类型问题，不生成文字。
    - 端点：教程和博客都用 `POST /api/alpha/decisions`；`typesafe-sdk.mdx` 说 OpenRouter 另有 `POST /api/v1/systemone`，实现的是 TypeSafe 自己的请求和响应格式，TypeSafe 的 SDK 能直接指过来。
    - 必填 `model`、`state`、`questions`；题型只有 `noul`、`choice`、`score` 三种；`noul` 的 `criteria` 可以不写。
    - 返回 `model`、`answers`、`usage`，OpenRouter 另外加了 `id`、`provider` 和 `usage.cost`。
- 元数据：`GET /api/v1/models` 列出的 463 个模型里没有 `jev-1.13`，只有 `typesafe/jev-router`。`jev-router` 是按请求自动挑模型和推理强度的路由，输出文字，跟 Jev 1.13 不是一回事。Jev 1.13 的元数据要从 `GET /api/v1/models/typesafe/jev-1.13/endpoints` 查：
    - 模态写的是 `text->decisions`，提供方只有 TypeSafe 一家，实际版本是 `typesafe/jev-1.13-20260917`。
    - 上下文 32000，输入每 token 0.000000042 美元，输出不要钱。
    - 上游延迟近 30 分钟 p50 是 184 ms，p99 是 401 ms。

## 实测 { #tests }

2026-10-02 经海外中转实测。

| 请求 | 结果 |
|---|---|
| `/api/alpha/decisions`，中文工单，三种题各一道（就是用法页的例子） | 200，1.07 秒，`is_bug` 0.96，`team` 选 payments（0.73），`urgency` 1.93；输入 490 token，0.00002058 美元 |
| `/api/v1/systemone`，同一个请求 | 200，1.07 秒，结构一样，数值差一两个百分点 |
| `/api/v1/systemone`，`model` 只写 `jev-1.13`，`state` 是字符串「这个月 Pro 订阅扣了我两次钱。」，问「客户是在要求退款吗？」 | 200，1.14 秒，`noul` 0.44 |
| 上一行换成英文问题 | 0.64 |
| 上一行的中文问题加 `criteria`，写明投诉重复扣费也算 | 0.66 |
| 文档原例：英文 state「I was charged twice for my subscription.」，英文问题 | 0.76，文档里写的是 0.98 |
| state 加上「多扣的那笔请退给我」 | 0.98 |
| `type` 写错成 `yesno` | 400，报错列出可选的三种题型 |
| 不带 `questions` | 400，`expected record` |
| 用 `/api/v1/chat/completions` 调 | 400：`is a decisions model and cannot be used with the chat/completions endpoint` |
| 错的 token | 401，被中转拦下 |

- `usage.cost` 正好是输入 token 数乘单价，输出 token 照记但不收钱。
- `score` 是各档概率的加权平均：0.07 × 1 + 0.93 × 2 = 1.93。
- 响应头里有 `X-Generation-Id`，形如 `gen-dec-…`，跟响应体里的 `id` 一样。
- 同一个请求两次结果会差一两个百分点，不是完全确定的。
- 上游的 400 报错体里带 OpenRouter 账号的 `user_id`，中转原样透传给了 Agent。
- 材料含糊时，换英文问题、加 `criteria` 只把概率从 0.44 推到 0.65 左右，把材料写清楚才到 0.98。

## 没做的 { #not-done }

- 长材料没测，32k 上下文没试到头，也不知道一次最多能问几道题。
- 没跟用 DeepSeek 加结构化输出做同样的判断比过准确率和速度。
- TypeSafe 的 SDK 没试，`jev-router` 没试。
- `/api/alpha/` 是 alpha 路径，哪天改了要回来改用法页。
- 海外机的 SSH 公钥还没装回去，OpenRouter 的中转配置没同步进 `assets/gateway/`。
