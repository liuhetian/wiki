---
description: "dsh 的多 agent 与长时工作：用户补的话、子 agent 交差、后台和定时任务都写进一个持久收件箱，由运行时决定插队还是排下一轮；fork 子 agent 为吃父会话的缓存而设计；目标续跑有上限、开关不落盘"
---

# 多 agent 与长时工作：收件箱唤醒

pi 只给人打的字留了队列：agent 正忙时，用户可以插一句 steering，或者排一条等它干完再发的 follow-up。子 agent 和后台命令它不内置，官网的建议是用 tmux 多开几个 pi 自己盯[^pi-agents]——子 agent 交差、后台命令跑完、一轮做不完的长任务，都没有一条路自己把 agent 叫醒。dsh 把这些和用户的话一样写进同一个持久收件箱，何时唤醒 agent 由运行时决定。下面的效果除了标明「构造的」，都来自一次真实运行：用 dsh 自己的 headless 入口跑了 fork、spawn 两组父子会话，模型是 `deepseek-flash`。

## 一个持久收件箱，三种投递 { #inbox }

**问题**：通知只追加、不唤醒就会丢：模型启动一个长命令，告诉用户「已启动」，结束本轮；命令跑完时 agent 已经空闲，完成通知停在收件箱里，直到用户随手再打一句话才被读到。

每个 agent 有一个收件箱，分两个队列：`next-turn` 等着开新的一轮，`next-step` 等着当前这轮的下一步。投递有三种：

- **followup（排下一轮）**：进 `next-turn`，并唤醒 agent
- **steer（插队）**：进 `next-step`，并唤醒 agent
- **inject（静默附带）**：进 `next-step`，不唤醒，等下一次请求时顺带发出

```ts title="模版 · packages/core/agent-loop/src/agent.ts:154-173"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/agent.ts:154:173"
```

轮次循环只认一条规矩：模型这一步说完了，只要 `next-step` 里还有东西，这一轮就不结束；一轮结束后收件箱还有待办，就接着开下一轮。

```ts title="模版 · packages/core/agent-loop/src/agent.ts:360-366"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/agent.ts:360:366"
```

```ts title="模版 · packages/core/agent-loop/src/agent.ts:392-397"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/agent.ts:392:397"
```

收件箱是会话日志里 `agent/inbox/spliced` 事件的折叠：进程崩了，排着的消息从日志重放出来；同一条消息挂两次，折叠直接报错。

```ts title="模版 · packages/core/agent-loop/src/inbox.ts:31-56"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/inbox.ts:31:56"
```

把 fork 那组父会话的真实日志喂给它，再构造一次重复挂起：

```text title="效果 · 父会话的收件箱怎么变（最后一行是构造的）"
--8<-- "projects/deepseek-harness/assets/sim/agents/txt/inbox-fold.txt"
```

第 2 轮第 3 步进行中（seq 37），子 agent 的消息插进 `next-step`，第 3 步一结束就被领走。第 4 步模型已经用文字作答，结算通知又在 seq 46 插进来，这轮于是还有第 5 步。

## 子 agent 在后台跑，运行时负责报结局 { #settlement }

**问题**：子 agent 同步跑，慢任务就卡住父 agent；结果全靠子 agent 自己汇报，它出错、被停或忘了汇报，父 agent 就什么也收不到。

委派工具一调用就返回子 agent 的 id，父 agent 接着干自己的事。子 agent 有两条路回话：自己调 `send_message`，说什么由模型定；结束时运行时发的**结算通知**，不管子 agent 发没发过消息都发。父 agent 空闲就排下一轮，正忙就插队：

```ts title="模版 · packages/subagent/subagent/src/manager.ts:1186-1206"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/subagent/subagent/src/manager.ts:1186:1206"
```

通知只说怎么结束、留了什么话，不带子 agent 的思考过程：

```ts title="模版 · packages/subagent/subagent/src/continuation-messages.ts:138-168"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/subagent/subagent/src/continuation-messages.ts:138:168"
```

用同一个函数给几种结局各出一条（结局是构造的）：

```text title="效果 · 各种结局的结算通知"
--8<-- "projects/deepseek-harness/assets/sim/agents/txt/settlement-notices.txt"
```

真实运行里，父 agent 先后收到两条，都是插队进来的：

```text title="效果 · fork 那组父会话收到的子 agent 消息和结算通知"
--8<-- "projects/deepseek-harness/assets/sim/agents/txt/parent-delivered.txt"
```

两条内容重复，项目认下这个代价：前者是子 agent 选择说的话，后者是运行时对结局的记录，子 agent 不配合时只有后者兜底。

## fork 还是 spawn：fork 为的是父会话的前缀缓存 { #fork }

**问题**：子任务要接着父会话的上下文做（复查、续写、追问）。spawn 一个全新的子 agent，父 agent 得把上下文重抄进任务：抄少了答不对，抄多了全价重算。fork 把父会话复制过去，可只要子 agent 的请求开头和父会话差一个字节——多一段专属的 system、多一个专属工具——前缀缓存就失效，复制来的上下文照样全价重算。

fork 的种子是父会话截到最后一个 `turn/end` 的前缀，进行中的那一轮有没结果的工具调用，不能回放。种子只在创建时截一次，冷恢复回放的也是它：

```ts title="模版 · packages/subagent/subagent-fork-in-process/src/index.ts:46-53"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/subagent/subagent-fork-in-process/src/index.ts:46:53"
```

```ts title="模版 · packages/subagent/subagent-fork-in-process/src/index.ts:67-78"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/subagent/subagent-fork-in-process/src/index.ts:67:78"
```

子 agent 专属的东西一律不放进请求开头：

- 回话指引追加在任务**末尾**；`send_message` 全局注册，父子工具表一样
- 「你是被委派的子 agent」这句话走运行时上下文，不进 system prompt
- fork 工具不让模型给子 agent 换模型

```ts title="模版 · packages/subagent/subagent/src/continuation-messages.ts:80-96"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/subagent/subagent/src/continuation-messages.ts:80:96"
```

```ts title="模版 · packages/subagent/subagent/src/child-agent.ts:166-175"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/subagent/subagent/src/child-agent.ts:166:175"
```

```yaml title="模版 · packages/bundle/base/cordis.patch.yml:386-395"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/bundle/base/cordis.patch.yml:386:395"
```

两种工具的描述按「子 agent 看不看得到本对话」各说各的：

```ts title="模版 · packages/subagent/tool-subagent/src/index.ts:113-137"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/subagent/tool-subagent/src/index.ts:113:137"
```

??? abstract "效果 · 实跑时模型看到的两个委派工具的描述"

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/agents/txt/subagent-tool-descriptions.txt"
    ```

实跑时，两组会话第 1 轮都发同一份设计文档（dsh 自己的 `docs/architecture.md`），第 2 轮分别用 `subagent_fork` 和 `subagent` 委派同一个问题。四个请求的用量，input 是命中加未命中：

```text title="效果 · 父子请求的缓存命中"
--8<-- "projects/deepseek-harness/assets/sim/agents/txt/cache-compare.txt"
```

fork 子会话日志的开头是父会话第 1 轮的原样复制，`session/end-seed` 标出种子到此为止：

??? abstract "效果 · fork 子会话日志的前 29 条事件"

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/agents/txt/fork-child-log.txt"
    ```

fork 子 agent 首个请求的最后一条 user 消息，由任务、回话指引、运行时上下文三块组成：

??? abstract "效果 · fork 子 agent 首个请求的最后一条 user 消息"

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/agents/txt/fork-child-last-user.txt"
    ```

spawn 子 agent 拿到的任务是父 agent 自己写的，它从文档里抄了一句原文进去：

```text title="效果 · spawn 子 agent 拿到的任务（父 agent 写的）"
--8<-- "projects/deepseek-harness/assets/sim/agents/txt/spawn-child-task.txt"
```

fork 子 agent 背着整份文档，10367 token 里 9856 命中缓存，没命中的 511 是任务、回话指引和新的运行时上下文。spawn 子 agent 只有 6051 token：命中的 5376 是 system prompt 加工具表，同一部署所有会话的开头都是这段；没命中的 675 里有父 agent 抄进来的那句原文。这次抄对了，spawn 也答对了；抄漏了，子 agent 只能瞎猜。

## 委派深度和权限在委派那一刻定死 { #depth }

**问题**：子 agent 是持久会话，空闲后释放内存，再收到消息时从磁盘冷恢复，拿到一套新的运行参数。深度要是从参数里读，就从 0 算起，能像顶层 agent 一样一层层委派下去。

深度写进子会话的头部（`delegationDepth`），读的时候取头部和运行参数里较大的那个：

```ts title="模版 · packages/subagent/subagent/src/depth.ts:28-36"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/subagent/subagent/src/depth.ts:28:36"
```

```text title="效果 · 几种情况下的委派深度（构造的 agent）"
--8<-- "projects/deepseek-harness/assets/sim/agents/txt/delegation-depth.txt"
```

权限也在委派时截取：审批策略固定为 `never`，沙箱范围取委派那一刻父会话的，记进子会话日志（上面 seq 19–20，来源 `delegation`）。超出范围直接被拒，运行时上下文让它把限制写进回复交给父 agent，就是上面那条 user 消息的最后一段。深度用完时工具表不变，运行时上下文里多一行「别再调 `subagent`」；真调了，`resolveChildDepth`（`child-agent.ts:49-58`）照样拒。

```ts title="模版 · packages/subagent/subagent/src/child-agent.ts:220-235"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/subagent/subagent/src/child-agent.ts:220:235"
```

## 同会话目标：轮数有上限，人类消息不计数，续跑开关不落盘 { #goal }

**问题**：agent 做到一半就宣布完成，得有人一遍遍说「继续」。做成内存里的循环，进程一重启目标就没了；每一轮都算进度，用户插的闲话也会花掉续跑的轮数。

目标是挂在会话上的状态，存成日志事件 `goal/change`，带轮数上限（默认 256）。计数只认来源是 `goal`、轮号正好是上一轮加 1 的消息：

```ts title="模版 · packages/goal/goal/src/fold.ts:321-331"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/goal/goal/src/fold.ts:321:331"
```

```text title="效果 · 目标折叠（构造的日志：上限 3 轮，中间插了两条人类消息）"
--8<-- "projects/deepseek-harness/assets/sim/agents/txt/goal-fold.txt"
```

续跑驱动只在 agent 空闲、没有人类消息排队、目标激活时出手：先等子 agent 全部静默；到上限就把目标标成 blocked，否则 followup 一条 `<goal_round>` 消息开新一轮：

```ts title="模版 · packages/goal/goal-round-driver/src/index.ts:172-208"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/goal/goal-round-driver/src/index.ts:172:208"
```

```text title="效果 · 第 3 轮的续跑消息（构造的目标）"
--8<-- "projects/deepseek-harness/assets/sim/agents/txt/goal-round-prompt.txt"
```

「能不能自动续跑」只存在进程内存里，项目叫它 armed / disarmed。agent 一创建就是 disarmed，打开旧会话、fork 都算；不是本进程写下的 `goal/change` 也会让它变回 disarmed。打开旧会话不该自己烧 token；开关要是进了日志折叠，就会写进检查点，武装它的进程没了它还在。

```ts title="模版 · packages/goal/goal/src/index.ts:255-267"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/goal/goal/src/index.ts:255:267"
```

自动开出的一轮能做什么，看本轮消息的来源，不看 prompt：建、改、暂停、恢复目标都要本轮有人类消息；完成和 blocked 还接受本轮正是当前目标轮。

```ts title="模版 · packages/goal/tool-goal/src/authority.ts:105-118"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/goal/tool-goal/src/authority.ts:105:118"
```

## 后台任务和定时任务也走这个收件箱 { #jobs }

**问题**：后台任务完成会唤醒空闲的 agent，被唤醒的那一轮又可能启动新任务，自己一直叫醒自己。给唤醒设上限 3，一个会话连跑 4 个后台任务、中间没人插话，第 4 个通知就静默附带进一个不会再醒的 agent，界面上看不到，像卡死了（issue #4944）。

后台任务完成时，agent 正忙就静默附带，同时完成的几个只多花一步；空闲就唤醒。唤醒上限默认不设、部署可配，理由是看得见的花费胜过看不见的卡死。

```ts title="模版 · packages/jobs/tool-jobs/src/index.ts:263-267"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/jobs/tool-jobs/src/index.ts:263:267"
```

```ts title="模版 · packages/jobs/tool-jobs/src/index.ts:296-308"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/jobs/tool-jobs/src/index.ts:296:308"
```

定时任务到点时，先把冷会话恢复成 agent，再 followup 一条提醒，落盘成功才记为已送达：

```ts title="模版 · packages/schedule/schedule/src/runtime.ts:119-125"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/schedule/schedule/src/runtime.ts:119:125"
```

```text title="效果 · 一条到点的提醒（构造的记录）"
--8<-- "projects/deepseek-harness/assets/sim/agents/txt/schedule-reminder.txt"
```

大批扇出用 Workflow：模型写一段 JS，用 `agent()` 起子 agent，中间结果不回父会话，总数默认以 1000 封顶。Ralph 循环、Agent Teams 默认关闭，不展开。

## 谁管什么 { #split }

- **程序**：三种投递、一轮何时结束、何时唤醒、结算通知、fork 种子截到哪、请求开头父子一致、委派深度和权限、目标计数和上限、续跑开关
- **模型**：何时委派、选 fork 还是 spawn、spawn 时往任务里抄什么、要不要中途 `send_message`、目标轮里何时 complete 或 block
- **用户**：设目标和上限、暂停和恢复目标、批准权限；子 agent 的权限不会超过委派时父会话已有的

## 实跑原件 { #sim-files }

??? abstract "15 次模型调用的用量：fork 组 1–8，spawn 组 9–15，含父 agent 等待时自己调的 list_agents 等步骤"

    ```json
    --8<-- "projects/deepseek-harness/assets/sim/agents/out/calls-index.jsonl"
    ```

[^pi-agents]: pi 官网「What we didn't build」一节的 No sub-agents、No background bash，和 RPC 文档里的 `steer`、`follow_up` 两条命令（[pi.dev](https://pi.dev)、[RPC commands](https://pi.dev/docs/latest/rpc-commands)），经 Context7 读取，2026-10-20 读。
