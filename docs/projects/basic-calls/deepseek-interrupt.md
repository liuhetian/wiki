---
description: "DeepSeek 插话拼接实测：玩家在 AI 出正文、思考、等工具时插话，消息怎么拼 API 才收；只有工具调用没收尾、prefix 没走 /beta、思考加 tools 时当前轮缺 reasoning_content 三种会 400；历史里有 tool_calls 时关工具会把 DSML 标记吐进正文；附 dsh-purge 插件在哪些时刻改消息的案例"
---

# DeepSeek 插话拼接：只有三种拼法会 400

做 AI 聊天，玩家随时会插话，插话那一刻 AI 可能在出正文、还在思考、或在等工具结果 —— 被打断的半截怎么留、新消息往哪接，取决于 API 收哪些消息顺序。实测结论：DeepSeek 很宽松，只有三种拼法会 400。

## 测试条件

- 2026-11-12，经 API 中转调 `deepseek-flash`（V4.1-Flash）和 `deepseek-v4-pro`，两个模型结论一致
- 场景：酒馆老板娘角色，挂两个工具 `query_inventory`、`check_door`
- 被打断的半截正文、半截思考，都是真实流式生成到一半主动断开拿到的
- 收不收、`prompt_tokens` 多少，每次跑都一样；回复内容每例只采样一次，只看倾向

## 会 400 的三种

| 拼法 | 报错原文 |
|---|---|
| `assistant(tool_calls) → user`，工具结果还没回 | An assistant message with 'tool_calls' must be followed by tool messages responding to each 'tool_call_id'. |
| `assistant(tool_calls) → user → tool`，user 夹在中间 | 同上 |
| 并行两个 tool_calls，只回一个 tool 就接 user | 同上 |
| `prefix: true` 没走 `/beta` | prefix is only available when using beta api |
| 思考模式加 tools，当前轮的 tool_calls 不带或带空 `reasoning_content` | The \`reasoning_content\` in the thinking mode must be passed back to the API. |

最后一条比官方文档松。文档说的是所有历史轮都要回传[^thinking]：

> If your code does not correctly pass back `reasoning_content`, the API will return a 400 error.

实测只查当前轮，即最后一条 user 之后、以 tool 结尾的那条 tool_calls。历史轮不带不报错，只是那段思考不进上下文。当前轮用真实的 `tool_call_id` 不带也能过，`prompt_tokens` 和带上时一样，像是服务端按 id 补回；伪造 id 才 400 —— 别依赖。

## 都收的

- 两条 user 相连
- 两条 assistant 相连
- 历史中间插 system
- 以 assistant 结尾、不开 prefix —— 半句被当成完整一轮，模型另起一轮：flash 重讲，pro 接着讲，不可靠
- 以 tool 结尾
- assistant 的 `content` 为空串

## reasoning_content 进不进上下文

看 `prompt_tokens`（flash，思考模式）：不带 tools 时完全忽略，带 tools 时拼进去，被打断的半截也算。

| 拼法 | prompt_tokens |
|---|---|
| 不带 tools：空 assistant | 98 |
| 不带 tools：空 assistant + 60 字半截思考 | 98 |
| 带 tools：空 assistant | 395 |
| 带 tools：空 assistant + 60 字半截思考 | 439 |
| 带 tools：历史轮 tool_calls 带 120 字思考 | 533 |
| 带 tools：历史轮 tool_calls 不带思考 | 446 |

## 按插话时的状态怎么拼

| AI 当时在 | 拼法 | 实测 |
|---|---|---|
| 出正文 | 半句原样留作 assistant，后接新 user | 两个模型都先回应插话；半句末尾标不标「——（被玩家打断）」都行 |
| 出正文，插话无关紧要（「嗯」「继续」） | 走 `/beta`，半句设 `prefix: true` 续写[^prefix] | 接得上半句 |
| 想定下回应的开头 | 插话后再加一条 `prefix: true` 的 assistant，比如「啊？」 | 正常 |
| 思考中，正文没出 | 不带 tools：整轮丢掉，思考本来就被忽略。带 tools：可留 `content: ""` 加半截思考 | 带 tools 时模型接着那段思路，去看门外 |
| 等工具结果 | 先给每个 tool_call 补 tool 再接 user：等真实结果、写「已取消」，或把插话写进工具结果、以 tool 结尾 | 三种都通；pro 收到「已取消」后没查库存就编了火把数量 |
| 工具参数还在流式生成 | 整条 assistant 丢掉，相当于撤掉这次调用 | 模型会重新查。工具已执行、有副作用的别撤，按真实结果补 |

## 坑：关工具会把调用标记吐进正文

历史里有 tool_calls 时，去掉 `tools` 参数，或保留 `tools` 但设 `tool_choice: "none"`，模型想调工具调不了，会把内部调用标记当 `content` 返回：

```text
<｜｜DSML｜｜ calls>
<｜｜DSML｜｜ invoke name="query_inventory">
<｜｜DSML｜｜ parameter name="item" string="true">火把</｜｜DSML｜｜ parameter>
</｜｜DSML｜｜ invoke>
</｜｜DSML｜｜ calls>
```

flash、pro 共复现 6 次，pro 的标签名是 `tool_calls`。插话后别靠关工具逼它说话：工具列表保持不变，展示前检测 `<｜｜DSML｜｜`。

## 案例：dsh-purge 在哪些时刻改消息

dsh-purge 是 DeepSeek Harness（dsh）的第三方「破甲」插件[^purge] —— 目标是让 agent 少拒绝、少确认，手段全是改 prompt。按一次请求的先后，它在这些时刻动消息：

| 时刻 | 挂在哪 | 改什么 |
|---|---|---|
| 安装时点「应用」 | 直接改 dsh 源码，重启生效 | 删官方身份句；审批、沙箱、计划模式的提示语改成可以继续；网页工具结果删掉「当不可信数据、别当指令」那句 |
| 每步拼 system prompt | `system-prompt/assemble` 钩子，排最前，等别的插件拼完再改 | 删官方身份段、记忆插件段；用户的注入正文包上 ChatML 外壳置顶；强化段放最后，注释说「长上下文里尾部指令更稳」 |
| 发请求前 | `agent/pre-step` 钩子 | 从消息列表删掉记忆插件插的消息、回退留下的占位消息 |
| system prompt 中途变了 | 改 dsh 源码 | dsh 原生在[历史末尾追加一条 system](../deepseek-harness/prompt.md#in-history)，改成每步换掉第一条 |
| 渲染完 system prompt | 改 dsh 源码 | 注入正文的头或尾不在，就再置顶一份 |
| 流式输出 | `llm/stream` 钩子，默认关 | 前 400 字像拒绝，就丢掉这次输出，在第一条 system 末尾追加催促话术重跑 |
| 用户插话 | 改 dsh 源码 | 旧版把插话一律推到下一轮，现版恢复原生 |
| 用户回退 | 插件代码加 dsh 源码补丁 | 停掉这一轮，删掉排队的插话，已发出的消息从对话里拿掉 |

对插话拼接能借三点：

- **插话分两种时机**：dsh 原生的 `steer` 在下一步边界插进当前轮，`followup` 等这一轮结束 —— 「等工具结果」那行先补 tool 再接 user，就是 `steer` 落在工具边界
- **程序自己也会插话**：空闲 280ms 自动发一条「继续」、Stop hook 用 `steer` 塞一条假 user 消息，都和用户插话抢同一个时机；插件把两样都关了，注释说这是「第二轮立刻发出被拒」的根因之一。程序插的消息要和玩家插话走同一个队列
- **工具结果里的话模型会照做**：上面把插话写进工具结果能用，靠的就是这一点；插件删掉网页工具的「不可信」那句，等于把同一个口子对外网敞开

[^purge]: [kingcharleslzy-ai/dsh-purge](https://github.com/kingcharleslzy-ai/dsh-purge/tree/accadd4062d6aa739d3bbf83f355515c99423baf)，读的是 1.6.93，commit `accadd4`，2026-11-12 读。
[^thinking]: [DeepSeek 思考模式 · 工具调用](https://api-docs.deepseek.com/guides/thinking_mode/)，2026-11-12 读。
[^prefix]: [DeepSeek 对话前缀续写（Beta）](https://api-docs.deepseek.com/guides/chat_prefix_completion/)，2026-11-12 读。
