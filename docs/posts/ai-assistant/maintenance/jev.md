---
description: "结构化判断的维护记录：默认的 OpenRouter typesafe/jev-1.13 接口从哪来（Context7 查到的 OpenRouter 文档仓库）、模型元数据和价格，2026-10-02 经海外中转实测两个端点、中文、三种题、含糊材料的概率和报错；2026-10-10 照调研接入微软 Decision-1、OpenAI GPT-6 Luna Decisions、Inception Mercury Decide，四家同题实测：单价一样计费 token 差 3.5 倍，经中转延迟都在 1.4 秒左右；图片只收 base64，微软填图片链接不报错照样作答，Mercury 元数据写纯文本实际能看图，OpenAI 材料里没答案返回 502 拒答；用接口不用看，出问题再看"
---

# 结构化判断的维护记录：Jev 和另外三家决策模型

这是[结构化判断](../../../skills/agent-io/reference/jev.md)背后的维护记录。用接口时不用看，接口出问题或者要换模型时再看。前三节是默认的 Jev 1.13，后面是 2026-10-10 接入的[另外三家](#other-models)。

## 接口从哪来 { #upstream }

- 模型是用户指定的，页面是 [openrouter.ai/typesafe/jev-1.13](https://openrouter.ai/typesafe/jev-1.13)。页面靠 JS 渲染，抓不到正文。
- 请求格式是经 Context7 查 OpenRouter 文档仓库（`openrouterteam/docs`）查到的，主要看了这几篇：博客 2026-09-21 的「What is Jev」、2026-09-23 的「How to use Jev」，社区指南 `jev-tutorial.mdx` 和 `typesafe-sdk.mdx`。要点：
    - Jev 是 TypeSafe 的第一个 System One 模型，回答关于 state 的带类型问题，不生成文字。
    - 端点：教程和博客都用 `POST /api/alpha/decisions`；`typesafe-sdk.mdx` 说 OpenRouter 另有 `POST /api/v1/systemone`，实现的是 TypeSafe 自己的请求和响应格式，TypeSafe 的 SDK 能直接指过来。
    - 必填 `model`、`state`、`questions`；题型只有 `noul`、`choice`、`score` 三种；`noul` 的 `criteria` 可以不写。
    - 返回 `model`、`answers`、`usage`，OpenRouter 另外加了 `id`、`provider` 和 `usage.cost`。
- 元数据：`GET /api/v1/models` 列出的 463 个模型里没有 `jev-1.13`，只有 `typesafe/jev-router`。`jev-router` 是按请求自动挑模型和推理强度的路由，输出文字，跟 Jev 1.13 不是一回事。Jev 1.13 的元数据要从 `GET /api/v1/models/typesafe/jev-1.13/endpoints` 查：
    - 模态写的是 `text->decisions`，提供方只有 TypeSafe 一家，实际版本是 `typesafe/jev-1.13-20260917`。
    - 上下文 32000，输入每 token 0.000000042 美元，输出不要钱。2026-10-10 再查，上下文变成了 64000，价格没变。
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

- 长材料没测，64k 上下文没试到头，也不知道一次最多能问几道题。
- 没跟用 DeepSeek 加结构化输出做同样的判断比过准确率和速度。
- TypeSafe 的 SDK 没试，`jev-router` 没试。
- `/api/alpha/` 是 alpha 路径，哪天改了要回来改用法页。
- 海外机的 SSH 公钥还没装回去，OpenRouter 的中转配置没同步进 `assets/gateway/`。

## 另外三家 { #other-models }

2026-10-10 照用户的调研接入，默认仍是 Jev。三家都在 OpenRouter 上，走现成的海外中转，中转配置没动；请求格式和 Jev 一样，换 `model` 就行。

??? abstract "调研原文（2026-10-10，ChatGPT 生成后由用户贴来；`:chatgpt-content-reference` 是 ChatGPT 的引用标记，出处没随复制带过来）"

    ```markdown
    --8<-- "posts/ai-assistant/maintenance/assets/decision-models-research.md"
    ```

### 调研说的和实测对不对得上 { #research-vs-tests }

> 价格上，Jev 和微软相同，OpenAI 贵约 2.38 倍；Inception 目前更便宜。

单价没错，但一次花多少要看计费 token，各家数法差很多。同一个三道题的工单，Jev 计 476 token，微软 136——单价一样，Jev 一次贵 3.5 倍。只问一道题时 Jev 计 290，微软 33，Jev 每次像是多计两百多 token 的固定开销。调研里「每次 1000 token」的估算没算这一层。按次算，Mercury 和微软最便宜（单题时两家几乎一样，三道题时 Mercury 便宜一半多），其次是 Jev，OpenAI 最贵。

> P50 是平台请求的中位延迟，输入长度和流量不同，不能当成同题竞速排名。

经中转，四家的中位数都在 1.4 秒左右，页面上 150 ms 和 290 ms 的差别被中转加跨境往返盖住了。OpenAI 和 Mercury 各出过一次 5 秒左右的慢请求。

> Mercury 的 Intelligence 较高，但概率校准较弱

只有一道分档题能对照：工单有多急，Mercury 给 1.53、confidence 0.29，在「这周内要修」和「挡着收钱」之间拿不定，另外三家都在 1.7 以上。一道题说明不了校准，只是方向和榜单一致。

> 文本分类、路由、Agent 控制：先用 Jev＋微软做同题对比……图片判断或超长文档：先试 GPT-6 Luna Decisions。低成本探索：先试 Mercury 免费版

用法页的换模型表照这个排。Mercury 免费版我们的账号用不了（见下面实测），所以省钱那一行写的是付费版。

> 如果主要处理中文，值得拿自己的中文样本测试

还没做，只跑了下面几个例子，见[没做的](#other-not-done)。

### 元数据

`GET /api/v1/models/<id>/endpoints`，2026-10-10 查：

| 模型 | 实际版本 | 上游 | 上下文 | 输入每百万 token | 模态 | p50 / p99 |
|---|---|---|---|---|---|---|
| `typesafe/jev-1.13` | `jev-1.13-20260917` | TypeSafe | 64000 | 0.042 美元 | 文本 | 139 / 355 ms |
| `microsoft/microsoft-decision-1` | `microsoft-decision-1-20261009` | Azure | 32768 | 0.042 美元 | 文本 | 301 / 713 ms |
| `openai/gpt-6-luna-decisions` | `gpt-6-luna-decisions-20261006` | OpenAI | 1050000 | 0.10 美元 | 文本、图片 | 211 / 1560 ms |
| `inception/mercury-decide` | `mercury-decide-20260930` | Inception | 65536 | 0.02 美元（`discount` 0.5） | 文本 | 487 / 1633 ms |
| `inception/mercury-decide:free` | 同上 | Inception | 65536 | 0 | 文本 | 937 / 3231 ms |

- 输出都不收钱。OpenAI 另有 `web_search` 每次 0.01 美元，没试。
- 微软的版本日期是 2026-10-09，接入前一天才上。
- `GET /api/v1/models?output_modalities=decisions` 列出 19 个决策模型，调研外的还有 Cloudflare 的 Clef 三个、Perplexity、Upstage、Liquid、Together、Respan 等，没测。调研里的 H2O、Fastino、Levanto、Databricks 不在 OpenRouter 上，没接。

### 实测 { #other-tests }

2026-10-10 经海外中转，用法页的工单例子和 Jev 那节的退款例子，每家同样的请求：

| 请求 | Jev | 微软 | OpenAI | Mercury |
|---|---|---|---|---|
| 工单 `is_bug` | 0.96 | 0.998 | 0.96 | 0.995 |
| 工单 `team` | payments 0.75 | payments 0.70 | payments 0.89 | payments 0.87 |
| 工单 `urgency`（confidence） | 1.93（0.90） | 1.96（0.94） | 1.72（0.58） | 1.53（0.29） |
| 工单计费 token、花费 | 476，0.000020 美元 | 136，0.0000057 美元 | 457，0.000046 美元 | 109，0.0000022 美元 |
| 「这个月 Pro 订阅扣了我两次钱。」要退款吗，跑两次 | 0.45、0.46 | 0.38、0.41 | 0.56、0.56 | 0.47、0.47 |
| 加上「多扣的那笔请退给我」，跑两次 | 0.98、0.98 | 都约等于 1 | 1、1 | 都约等于 1 |
| 退款单题计费 token | 290 | 33 | 167 | 71 |
| 工单跑五次的耗时（秒） | 2.25、1.38、1.43、1.73、1.33 | 1.34、1.54、1.43、1.45、1.45 | 1.49、4.80、1.49、1.36、2.42 | 1.33、5.89、1.37、1.55、1.41 |

图片和报错（图是统计课那张 1.2 MB 的手绘配图 `repeated-samples-marker-doodle.png`，上面一个画满圆圈的大椭圆，下面三个杯子，中间那个圆圈最少）：

| 请求 | 结果 |
|---|---|
| OpenAI，`state` 是一句话加这张图（base64 data URL），问是不是黑白手绘、下面几个杯子 | 200，4.6 秒，手绘 1，三个杯子 1；计 1823 token，0.00018 美元 |
| OpenAI，四道题（再加哪个杯子圆圈最少、上面是什么形状） | 200，28 秒，四道全对，概率都是 1；计 2067 token，0.00021 美元 |
| Mercury，同样四道题 | 200，14 秒，四道全对，概率都在 0.999 以上；计 1091 token，0.000022 美元 |
| Mercury，同样四道题，只给那句话不给图 | 200，四道都答错，confidence 都在 0.2 以下——上一行确实是看了图 |
| OpenAI，同样只给那句话不给图 | 502：`OpenAI refused to answer question "handdrawn"`，材料里没有答案就拒答，不给中间概率 |
| Jev，带 base64 图片 | 400，`max_tokens_exceeded` |
| 微软，带 base64 图片 | 413：`request body too large: limit is 1048576 bytes`，20 秒才返回 |
| OpenAI，图片换成 COS 上同一张图的 https 链接 | 400：`OpenAI Decisions accepts only embedded base64 data URL images` |
| Mercury，同样填 https 链接 | 422，`Decision service could not complete the request.` |
| 微软，同样填 https 链接 | 200，手绘 0.87，三个杯子 0.50；只计 100 token，图没看，链接文件名里有 `marker-doodle` |
| `inception/mercury-decide:free`，工单 | 404，`free-model-training-violation-by-account`：账号隐私设置不允许免费模型拿数据训练 |
| base64 请求体直接塞进 curl 的 `-d` 参数 | 本机报 `Argument list too long`，要先写进文件 |

- 四家都返回同样的 `answers` 结构，三种题型都认。Jev 和 OpenAI 的概率保留两位小数，微软和 Mercury 给完整浮点数。
- 退款例子跑两次，Mercury 两次一模一样，微软差了 3 个百分点。
- 材料含糊时四家落在 0.38 到 0.56 之间，写清楚了都接近 1——Jev 那节的结论对另外三家也成立。
- Mercury 元数据写的是只收文字，实际能看图，看图的花费是 OpenAI 的十分之一。没写进 OpenRouter 的模态，哪天可能就不认了，所以用法页看图仍写 OpenAI。
- 看图慢：OpenAI 同一张图一次 4.6 秒、一次 28 秒，Mercury 14 到 31 秒。
- 微软填图片链接不报错是最危险的：程序拿到一个看着正常的概率，其实是从链接字面猜的。
- OpenAI 拒答返回的是 502，程序要把它当「判断不了」处理，别当成网络故障去重试。

### 没做的 { #other-not-done }

- 没拿一批自己的中文样本比准确率，也没算高置信度错误有多少；上面只是几个例子。
- OpenAI 的长材料（上下文 105 万）没试到头，`web_search` 没试。
- Mercury 免费版要去 OpenRouter 后台改隐私设置才能用，没改。
- 微软、Mercury 的上下文上限没试到头。
- OpenAI 的拒答只在材料完全没有答案时碰到过一次，材料含糊时会不会也拒答没测。
