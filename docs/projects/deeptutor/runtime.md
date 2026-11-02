---
description: "DeepTutor 的一轮对话怎么跑：一轮是一个 agent 循环，不调工具的那一轮收尾；ask_user 是工具，回合暂停等回答再续上；每个事件编号、落库，刷新页面按号重放；每轮挂哪些工具由一个纯函数算，换模式不是换 prompt；规矩和运行时事实分开放，超窗先剪工具结果。每一步配源码模版和实跑效果"
---

# 一轮对话：一个能暂停、能重放的循环

baseline 的聊天页一问一答：模型一口气生成完，中途想问你一句只能先猜一个往下讲；刷新页面，正在生成的回答就断了；「换成出题模式」只是换一段 prompt，模型手里能做的事没变。DeepTutor 把一轮对话做成一个运行时：一轮是一个会调工具的循环，问用户也是一次工具调用，过程中的每个事件都编号存下，挂哪些工具按这一轮的情况现算。下面每一步给出源码模版，能脱离模型跑的部分用 DeepTutor 自己的代码跑出效果。

## 一轮是一个循环，不调工具的那一轮收尾 { #loop }

**问题**：学习者问「p 值小于 0.05 就能说明原假设是错的吗」。好好回答要先查教材第 248 页的定义，再翻第 236 页显著性水平那段，最后才组织答案；聊天页把这些都压在一次生成里，查没查、查了哪页看不见。

**功能**：一轮对话就是一个 agent 循环。每一圈调一次模型：这一圈调了工具，就执行工具、把结果追加回对话，接着下一圈；某一圈没调工具，它写的字就是答案的收尾。每一圈的文字都按顺序留在答案里，工具的进展夹在中间：

```python title="模版 · deeptutor/agents/loop/agent_loop.py:1-30"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/loop/agent_loop.py:1:30"
```

探索最多 8 圈；用完了还在调工具，再给 3 圈收束，最后强制一圈不带工具的收尾：

```python title="模版 · deeptutor/agents/loop/pipeline.py:104-106"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/loop/pipeline.py:104:106"
```

```python title="模版 · deeptutor/agents/loop/agent_loop.py:93-101"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/loop/agent_loop.py:93:101"
```

**效果**：这一节要接模型，只贴模版。界面上，一轮就是一串活动行：检索知识库、读来源、模型思考，最后流出带页码的答案。下面是照源码做的仿真界面，自动播放这一轮：

<iframe src="/projects/deeptutor/assets/demos/chat-home.html" style="width:100%;height:720px;border:1px solid #8884;border-radius:10px" loading="lazy" title="DeepTutor 仿真界面：首页一轮对话"></iframe>

??? abstract "demo 源码：chat-home.html"

    ```html
    --8<-- "projects/deeptutor/assets/demos/chat-home.html"
    ```

收尾由模型自己决定 —— 不再调工具就是答完了；圈数上限只兜底，不是常态。

## 模型想问你一句：ask_user 是一个工具 { #ask-user }

**问题**：学习者只说了一句「讲讲 p 值」。想听定义还是想先看例 8.3，模型不知道。baseline 里它要么猜一个讲下去，要么回一句「你想听哪部分」把这一轮结束掉，下一轮再从头拼上下文。

**功能**：问用户是一次普通的工具调用。模型给 ask_user 交 1 到 4 道题，每题若干选项；程序先清洗参数 —— 卡片总带一行自填，模型自己补的「其他」丢掉，只差空格或大小写的重复项去掉：

```python title="模版 · deeptutor/tools/ask_user.py:269-282"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/tools/ask_user.py:269:282"
```

这类工具排在同一圈的最后执行，分发结果标记 `pause`，回合不结束：

```python title="模版 · deeptutor/runtime/agentic/tool_dispatch.py:55-60"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/runtime/agentic/tool_dispatch.py:55:60"
```

接着等回答。没有能回答的前端（比如接在微信上的伙伴），就把问题本身当最终回复发出去：

```python title="模版 · deeptutor/agents/loop/pipeline.py:1249-1263"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/loop/pipeline.py:1249:1263"
```

答案写回那条工具消息，后面跟一句「用这些回答继续原来的请求」，循环接着转：

```python title="模版 · deeptutor/agents/loop/pipeline.py:1303-1323"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/loop/pipeline.py:1303:1323"
```

命令行没有终端可问时，回一个空答案，让回合继续而不是卡住：

```python title="模版 · deeptutor_cli/common.py:523-535"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor_cli/common.py:523:535"
```

**效果**：喂几份构造的、模型会写的参数，用上游的 `build_ask_user_payload` 清洗：

```text title="效果 · ask_user 参数清洗成卡片"
--8<-- "projects/deeptutor/assets/sim/txt/runtime-ask-user.txt"
```

参数不合格不抛异常，错误原样回给模型，让它重写。

## 刷新不断流：事件编号、落库、按号重放 { #replay }

**问题**：答案流到一半，学习者刷新了页面，或者地铁里断了网。baseline 的流断了，要么丢掉，要么从头再生成一遍。

**功能**：一轮里发生的一切都是一个事件，共 15 种 —— 阶段开始结束、思考、工具调用和结果、正文片段、等用户输入、完成：

```python title="模版 · deeptutor/core/stream.py:15-32"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/core/stream.py:15:32"
```

每一轮一条事件总线，给每个事件一个递增的 `seq`，存一份历史。新订阅者先按 `after_seq` 重放历史，再接实时队列；登记队列和截取历史在同一步里做，重放期间新来的事件不会收两遍：

```python title="模版 · deeptutor/runtime/stream_bus.py:113-154"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/runtime/stream_bus.py:113:154"
```

事件同时按 `(turn_id, seq)` 写进 SQLite，进程重启后从库里重放，再接活的尾巴：

```python title="模版 · deeptutor/services/session/sqlite_store.py:358-370"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/session/sqlite_store.py:358:370"
```

```python title="模版 · deeptutor/app/service.py:256-272"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/app/service.py:256:272"
```

**效果**：用上游的 `StreamBus` 发一轮构造的事件，浏览器 A 收到第 4 号时刷新，浏览器 B 带着 `after_seq=4` 重连；最后看等用户输入时有人答和没人答两种情况：

```text title="效果 · 断线重连和等待输入"
--8<-- "projects/deeptutor/assets/sim/txt/runtime-replay.txt"
```

重连只补后面的号，不重复也不漏；命令行的 `--format json` 输出的就是这串事件，一行一个。

## 换模式不是换 prompt：工具表是算出来的 { #tools }

**问题**：baseline 里「换成出题模式」只是换一段 system prompt，模型能做的事没变：想让它查知识库，库没挂上它也照样「查」；想让它安心讲题，它手边还挂着一堆用不上的工具。

**功能**：两层插件 —— Tool 是模型随时能调的单个函数，Capability 接管整轮（出题、深研、解题，见[学习模式流水线](modes.md)）。每一轮挂哪些工具由一个纯函数算：用户在设置里能开关的只有 8 个，其余按条件自动挂 —— 挂了库才有 `rag`，有记忆才有 `read_memory`：

```python title="模版 · deeptutor/agents/_shared/tool_composition.py:47-67"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/_shared/tool_composition.py:47:67"
```

顺序是：用户开的、条件满足的、能力自带的、总是在的。独占的知识能力（比如 Obsidian 笔记库）走另一支，只留自己的工具：

```python title="模版 · deeptutor/agents/_shared/tool_composition.py:254-277"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/_shared/tool_composition.py:254:277"
```

还有一条规则路由：明说「帮我出 N 道测验题」直接改派给出题流水线，「考考我」留在聊天：

```python title="模版 · deeptutor/runtime/capability_routing.py:33-44"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/runtime/capability_routing.py:33:44"
```

**效果**：用上游的 `compose_enabled_tools` 算四种轮次的工具表，再拿几句话过路由：

```text title="效果 · 四种轮次的工具表和出题路由"
--8<-- "projects/deeptutor/assets/sim/txt/runtime-tools.txt"
```

用户开关里塞进 `rag`、`exec` 不起作用 —— 它们归条件管，不归开关管。在精通路径的工作区里不改派，免得把导师循环换成一次性出题。AGENTS.md 说用户能开关的工具有 7 个，代码里是 8 个，多一个 `zotero_search`。

## 聊久了：规矩不动，事实换快照，超窗先剪工具结果 { #context }

**问题**：一轮里查了十几次库，每次返回几千字；聊到第 30 轮，记忆和资料清单也变了几次。baseline 把这些一股脑堆进上下文，直到超窗被截。

**功能**：system prompt 分两半。规矩（你是谁、循环怎么转）每轮一字不变；记忆、学习日志、资料、工具清单这些会变的事实单独成块，插在历史里当快照，值变了才追加一份新的，模型以最新那份为准：

```python title="模版 · deeptutor/agents/loop/prompt_blocks.py:24-40"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/loop/prompt_blocks.py:24:40"
```

```python title="模版 · deeptutor/agents/loop/prompt_blocks.py:99-117"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/loop/prompt_blocks.py:99:117"
```

请求超过窗口的 90% 时，从最早的工具结果开始换成占位标记，剪到够为止：

```python title="模版 · deeptutor/agents/loop/pipeline.py:1690-1707"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/loop/pipeline.py:1690:1707"
```

**效果**：只贴模版。

规矩一字不变，前缀缓存就一直命中 —— 演示里用量那一栏的「缓存命中率」就是它。

## 谁管什么 { #split }

- **程序**：循环的圈数和收尾、ask_user 参数清洗和暂停续跑、事件编号落库和重放、每轮的工具表、规矩与快照的拼法、超窗时剪什么
- **模型**：每一圈调不调工具、调哪个、什么时候问用户、问什么、什么时候收尾
- **用户**：能开关的 8 个工具、挂哪些库、回答 ask_user 的卡片、选哪个能力
- **前端**：渲染事件流、断线后带着最后的 `seq` 重连

## 实跑原件 { #sim-files }

??? abstract "断线重连的完整事件"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/runtime-replay.json"
    ```

??? abstract "ask_user 清洗的完整记录"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/runtime-ask-user.json"
    ```

??? abstract "工具表和路由的完整记录"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/runtime-tools.json"
    ```
