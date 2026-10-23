---
description: "dsh 怎么拼 prompt：system prompt 由带序号的段拼成、只放指引；路径、权限、时间、AGENTS.md、skill 目录作为 user 消息接在后面；system prompt 变了就在历史末尾追加，不改开头"
---

# 拼 prompt：会变的都挪到缓存前缀后面

最简单的拼法是一段 system prompt 字符串加全量回放的历史：时间、权限、计划模式这类会变的东西写进 system prompt，哪个字节一变，第 0 条消息就变了，provider 的前缀缓存从第一个 token 起作废。DeepSeek Harness（下称 dsh）的拼法围着前缀缓存转：system prompt 只放不带具体值的指引，会变的事实作为带来源标签的 user 消息接在后面，system prompt 自己变了也是在末尾追加一条。新版 pi 走到了同一条路上——提示词段和工具的变化记成会话里的 system 消息、追加在历史里；但它的扩展仍能在一次运行前把整段 system prompt 换掉[^pi-prompt]，dsh 不开这个口子。下面五节，每节贴源码模版和实跑效果。

## system prompt 由带序号的段拼成 { #sections }

**问题**：工具说明手抄在人设里，抄本会漂移。dsh 的决策记录[^pi-bridge]写过这个毛病：

> 工具指导是 leaf YAML 中的手写行文。shell/subagent/todo_write 的使用指导存放在 coding-agent 和 ACP（Agent Client Protocol）的 persona 字符串里——两份漂移的副本（ACP 那份已经被删减）

system prompt 拆成一个个有名字的段，序号由一张中央表分配，工具说明由工具插件自己注册。拼的时候按序号排，同号按名字的码元序——不看 locale，每台机器拼出同样的字节：

```ts title="模版 · packages/core/system-prompt/src/index.ts:131-179"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/system-prompt/src/index.ts:131:179"
```

```ts title="模版 · packages/shell/tool-bash/src/index.ts:250-255（bash 插件自带的一句）"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/shell/tool-bash/src/index.ts:250:255"
```

```ts title="模版 · packages/core/system-prompt/src/index.ts:280-295"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/system-prompt/src/index.ts:280:295"
```

用项目自己的 Web 测试脚手架在进程内起真实的 Web 组合，给一个 agent 装上默认预设，再让 system-prompt 服务组装一次，得到 22 个段：

| 段 | 序号 | 归谁 | 字数 |
|---|---|---|---|
| `harness:identity` | -1000 | system-prompt 自己 | 48 |
| `deployment:persona-prefix` | 0 | 部署配置，预设可遮蔽 | 54 |
| `plan:policy` | 500 | 计划模式插件，平时为空 | 0 |
| `context:file-reference` | 900 | `@路径` 引用插件 | 407 |
| `tool:bash` … `tool:grep` | 1000–1500 | 各工具插件，一段一两句 | 71–140 |
| `tool:jobs` | 1600 | 后台任务插件 | 382 |
| `tool:web_search` / `tool:web_fetch` | 2000 / 2100 | 网页工具插件 | 215 / 150 |
| `tool:goal` / `tool:workflow` / `tool:subagent` | 2400 / 2600 / 2800 | 目标、workflow、子 agent 插件 | 528 / 325 / 139 |
| `ui:deliverable-file-references` | 9000 | Web 的交付文件卡片 | 1304 |
| `harness:source` / `app:web-surface` | 10000 / 10100 | 开发上下文插件 | 325 / 1002 |
| `deployment:persona-suffix` | 10200 | 部署配置 | 0 |

```text title="效果 · 组装结果和项目提交的快照对比"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/prompt-equal.txt"
```

身份和人设两句之后，全是工具插件自带的用法；空段渲染时直接丢掉。

段里可以写 `{{model}}` 这类变量。名字没注册、或注册了但这次没有值，渲染直接抛错，不会发出一段带着花括号的 prompt：

```ts title="模版 · packages/core/system-prompt/src/index.ts:359-372"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/system-prompt/src/index.ts:359:372"
```

实跑时第一次组装没给 agent 指定模型，就撞上了这一条：

```text title="效果 · 组装时 agent 没有模型"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/strict-model-error.txt"
```

带具体值的指引拆成两半：段里只写「运行时上下文会给出路径」，路径和 URL 注册成 context，进下一节的运行时上下文：

```ts title="模版 · packages/context/harness-dev-context/src/index.ts:141-164"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/context/harness-dev-context/src/index.ts:141:164"
```

## 会变的事实：每步一份运行时上下文 { #runtime-context }

**问题**：权限模式随时会被用户切换。dsh 的决策记录[^policy]写了两头的代价——不告诉模型：

> 在 `read-only` 下的 Web 会话中，write 与 edit schema 仍然可见，因此模型会声称自己能够写入，直到一次被拒绝的调用后才发现事实并非如此。

写进 system 段：

> 首次 `danger-full-access` 和 `workspace-write` 请求分别只有 256 个缓存读取 token，而未缓存输入 token 为 14,691 和 14,782 个。

工作目录、沙箱策略、审批策略由各自的插件注册成 context，同样带序号。每步渲染成一条完整快照，作为 user 消息发出，开头声明「本快照取代之前所有快照」；和上一份一样就不发，全没了发一句清空声明：

```ts title="模版 · packages/core/system-prompt/src/index.ts:314-318"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/system-prompt/src/index.ts:314:318"
```

```ts title="模版 · packages/core/agent-loop/src/runtime-context.ts:152-164（CLEARED 定义在第 20 行）"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/runtime-context.ts:152:164"
```

```ts title="模版 · packages/sandbox/sandbox-policy/src/index.ts:140-151（沙箱策略注册的是 context，不是 section）"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/sandbox/sandbox-policy/src/index.ts:140:151"
```

每一步先提交 system 节点，再按顺序提交本步的 user 消息，快照落在它在 pre-step 里占的位置：

```ts title="模版 · packages/core/agent-loop/src/agent.ts:411-441"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/agent.ts:411:441"
```

Web 默认组合的那份快照：

```text title="效果 · 运行时上下文（路径和 URL 换成了占位符）"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/web-runtime-context.txt"
```

项目录下的一次真实 Web 会话，首个请求的消息顺序——system 节点、用户原话、运行时上下文、时间读数（时间每轮第一步一条）：

```text title="效果 · fresh-round-trip 快照的首个请求（{{…}} 是快照的占位符）"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/first-request-order.txt"
```

另一份项目真调模型录下的会话里，四轮切了三次权限：

```text title="效果 · permission-policy-context 快照：追加了什么、每次调用的用量"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/policy-switch.txt"
```

system 节点从头到尾只有第 12 条一条。每次切换只多一份新快照，审批变了再多一句通知；没缓存的输入只有 59–265 token，缓存读一直在 1.5 万上下。

## AGENTS.md 和 skill 目录：带框的 user 消息 { #instructions }

**问题**：项目说明（AGENTS.md / CLAUDE.md）和 skill 清单随工作区变，写进 system 就是改第 0 条；它们又来自仓库，文件里一句 `</system-reminder>` 就能提前合上外面的框。

- 首步注入一条基线，`<system-reminder>` 框住，开头写明优先级：更具体的优先，不覆盖 system、developer 和用户的直接指令
- 从用户全局、项目根到当前目录；65536 字节预算，超了先省掉最宽的，再截断最具体的，第一行写明省了谁、截了多少
- 读写进更深的目录才补读那里的 AGENTS.md；文件改了、删了，各追加一条说明
- 文件里的闭合标签转义

```ts title="模版 · packages/context/agent-instructions/src/render.ts:16-27"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/context/agent-instructions/src/render.ts:16:27"
```

```ts title="模版 · packages/context/agent-instructions/src/render.ts:360-367（先省最宽的）"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/context/agent-instructions/src/render.ts:360:367"
```

构造三份说明文件——用户全局、项目根、`packages/app`——过 dsh 的渲染函数：

<div class="grid" markdown>

```text title="效果 · 两份，预算 65536"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/instructions-baseline.txt"
```

```text title="效果 · 三份，预算 600：省掉用户全局"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/instructions-budget-600.txt"
```

</div>

```text title="效果 · 三份，预算 480：只剩最具体的，还被截断"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/instructions-budget-480.txt"
```

skill 目录同理，只给名字和一句描述，并写明加载前不许照着做：

```ts title="模版 · packages/skill/tool-skill/src/index.ts:256-279"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/skill/tool-skill/src/index.ts:256:279"
```

```text title="效果 · skill-load 快照里注入的目录"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/skill-catalog.txt"
```

用户在消息里直接写 `/skill名`，skill 全文排在这一步所有注入的最后：

```ts title="模版 · packages/skill/tool-skill/src/index.ts:165-178"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/skill/tool-skill/src/index.ts:165:178"
```

## system prompt 自己变了：在历史末尾追加 { #in-history }

**问题**：总有些变化必须改 system prompt。决策记录[^in-history]原话：

> 每一次系统提示词变更都要付出整个提供方前缀缓存的代价。循环在每个步骤渲染提示词；一旦字节不同——plan 模式片段进入或退出、某个 skill 或工具指引片段完成注册、agent 作用域的 persona 遮蔽、`{{model}}` 变量改变——请求的消息 0 随之改变，DeepSeek 上下文缓存从第一个 token 起失效。

system prompt 本身是会话日志里的第 0 个节点。路由声明能接受历史中的 system 消息（目录里只有 `deepseek-flash`）且请求系列没断，新 prompt 就作为新节点追加到末尾；否则替换第 0 个节点，后面的 system 节点清空：

```ts title="模版 · packages/llm/llm-deepseek/src/models.ts:6-14"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/llm/llm-deepseek/src/models.ts:6:14"
```

```ts title="模版 · packages/core/agent-loop/src/runtime-context.ts:57-104"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/runtime-context.ts:57:104"
```

| 情况 | 动作 |
|---|---|
| 第一步 | 追加第 0 个节点，prompt 为空也占位 |
| 文本没变 | 不动 |
| 文本变了，路由支持、请求系列延续 | 追加一个新 system 节点 |
| 路由不支持、开了新请求系列，或 prompt 清空 | 替换第 0 个节点，清空后面的 system 节点 |

DeepSeek 序列化时，历史中的 system 放在那一轮 user 之后、下一条 assistant 之前：

```ts title="模版 · packages/llm/llm-deepseek/src/serialize.ts:83-89、106-117"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/llm/llm-deepseek/src/serialize.ts:83:89"

--8<-- "projects/deepseek-harness/assets/dsh-src/packages/llm/llm-deepseek/src/serialize.ts:106:117"
```

追加的是完整的新 prompt，不是差异：模型把最新一条 system 当成完整提示词，决策记录的说法是「增量会静默丢掉每个未变化的片段」[^in-history]。

接真模型实测：第一轮用 Web 默认组合的 system prompt、运行时上下文和 31 个工具，让 `deepseek-flash` 读一个源文件再解释；第二轮用户切进计划模式再提问。计划模式那段排在 500 号，新 prompt 紧跟着身份和人设就不同了：

```text title="效果 · 计划模式前后的 system prompt"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/plan-diverge.txt"
```

同一个第二轮请求，用 dsh 的序列化函数按两种做法各拼一份：

<div class="grid" markdown>

```text title="效果 · 历史内追加（dsh 在 deepseek-flash 上的做法）"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/wire-in-history.txt"
```

```text title="效果 · 替换第 0 条（不支持的路由、新请求系列）"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/wire-replace.txt"
```

</div>

```text title="效果 · 各次请求的用量（token）"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/cache-compare.txt"
```

替换第 0 条，1.8 万 token 一个也没命中：DeepSeek 匹配完整前缀，工具表排在 system 之后，开头一改全废。历史内追加命中 17536，只算 1706——新 prompt 全文加这一轮的三条 user 消息。第一轮第一步就命中 8064，是同一账号此前发过开头相同的请求。

## 工具、模式、模型换了：只追加通知 { #switches }

**问题**：计划模式要求模型别动文件。最省事的做法是把写工具从工具表里拿掉——可工具表也在缓存前缀里，进出一次计划模式就付两次全价。

- **计划模式不动工具表**：只加一段 prompt（走上一节的历史内追加），再在用户消息后加一句通知；那段 prompt 自己交代了写工具为什么还在
- **工具表真变了**（MCP 服务器连上、插件装上）：记一条 developer 消息，只列增删的工具名，DeepSeek 序列化成历史中的 system 消息里的 `tool_addition` / `tool_removal` 块
- **换模型、换审批、换工作目录**：各追加一句通知

```yaml title="模版 · packages/bundle/base/cordis.patch.yml:340（计划模式那段 prompt 的一句）"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/bundle/base/cordis.patch.yml:340:340"
```

```ts title="模版 · packages/plan/plan-mode/src/index.ts:462-474"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/plan/plan-mode/src/index.ts:462:474"
```

```ts title="模版 · packages/core/agent-loop/src/agent.ts:652-666"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/agent.ts:652:666"
```

```ts title="模版 · packages/llm/llm-deepseek/src/serialize.ts:91-102"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/llm/llm-deepseek/src/serialize.ts:91:102"
```

```ts title="模版 · packages/core/agent/src/model-selection.ts:47-62"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent/src/model-selection.ts:47:62"
```

项目自己的两个回放场景：

```text title="效果 · dynamic-tool-prompt-updates：工具先加后删"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/tool-updates.txt"
```

```text title="效果 · model-switch-notice：从 deepseek-v4-flash 换到 deepseek-v4-pro"
--8<-- "projects/deepseek-harness/assets/sim/prompt/txt/model-switch.txt"
```

换模型那次是替换第 0 个节点：人设里有 `{{model}}`，`deepseek-v4-pro` 又不支持历史内追加；紧跟一句通知，告诉模型上面的回复出自哪个模型。

## 谁管什么 { #split }

- **程序**：段的序号和拼接顺序、变量严格插值、运行时上下文何时追加、AGENTS.md 的预算和取舍、system prompt 追加还是替换、工具表变化写成增删块、各种切换通知的措辞
- **模型**：读快照和通知，以最新一份为准；自己决定什么时候加载 skill
- **用户**：写 AGENTS.md / CLAUDE.md、装 skill、配部署的人设前后缀和预设；切权限、切计划模式、换模型，用 `/skill名` 直接点名

## 实跑原件 { #sim-files }

??? abstract "Web 默认组合组装出的 system prompt 全文（和项目快照逐字节一致）"

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/prompt/out/dump-web/web-system-prompt.txt"
    ```

??? abstract "计划模式下的 system prompt 全文（deepseek-flash）"

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/prompt/out/dump-flash/web-system-prompt-plan.txt"
    ```

??? abstract "真模型实验的用量汇总"

    ```json
    --8<-- "projects/deepseek-harness/assets/sim/prompt/out/cache-summary.json"
    ```

??? abstract "AGENTS.md 渲染：进了新子目录、文件改了、文件删了（构造的输入）"

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/prompt/txt/instructions-nested.txt"
    ```

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/prompt/txt/instructions-updated.txt"
    ```

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/prompt/txt/instructions-removed.txt"
    ```

??? abstract "项目回放场景 system-prompt-in-history：第二步追加了第 19 条 system 节点"

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/prompt/txt/in-history-log.txt"
    ```

??? abstract "快照回放结果：本页用到的无头场景全部通过"

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/prompt/out/replay.log"
    ```

[^pi-prompt]: pi 的[会话格式](https://pi.dev/docs/latest/session-format)（SessionMessageEntry 一节）和[扩展文档](https://pi.dev/docs/latest/extensions)（`before_agent_start` 返回 `systemPrompt` 或设 `forceSystemPrompt`），经 Context7 读取，2026-10-20 读。
[^pi-bridge]: dsh 的决策记录[Pi 扩展桥接](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/proposed/feature/2026-10-03-pi-extensions-bridge.zh.md)，提案，2026-10-20 读。
[^policy]: dsh 的决策记录[当前沙箱策略上下文](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/archived/feature/2026-07-30-current-sandbox-policy-context.zh.md)，2026-10-20 读。
[^in-history]: dsh 的决策记录[历史内系统提示词替换，实现缓存稳定的提示词变更](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/implemented/feature/2026-09-02-in-history-system-prompt-replacement.zh.md)，2026-10-20 读。
