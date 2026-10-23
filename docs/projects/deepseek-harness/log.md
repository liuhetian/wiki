---
description: "DeepSeek Harness 的会话日志：只追加的事件日志是唯一真源，请求每步从日志现算再冻结，每次模型调用落一条结算记录，崩溃补齐悬空的工具调用，fork 复制前缀，格式升级不覆盖旧文件；每步配源码模版和实跑效果"
---

# 会话日志：模型看到的每个字都记账

pi 的会话存成一个 JSONL 文件，扩展却能在每次请求前用 `context`、`context_with_system` 改写要发的消息，改写只对这一次请求生效、不落盘[^pi-log]——模型当时看到了什么，事后从会话文件拼不回来。dsh 反过来：只追加的事件日志是唯一真源，模型历史每一步从日志现算。下面每节贴源码模版和实跑效果；模型回复是项目测试里的 MockAdapter 脚本（构造的），其余都是 dsh 自己的代码。

## 只追加的事件日志，模型视图从它折叠出来 { #event-log }

**问题**：可变的消息数组加上事后补写的日志，是两份真相，迟早对不上。项目的决策记录[^events]在否决这条路时写道：

> 可变消息数组 + 事件仅作通知发出：更简单，但状态与日志可能分歧；采用事件溯源后，日志本身即是状态，分歧在结构上不可能发生。

会话是一串带连续 `seq` 的事件，`Session.append` 先做一份无损 JSON 快照、深度冻结再提交。能进模型历史的只有五类消息事件，每条都标明自己怎么进**模型视图**——项目代码里叫 surface：

```ts title="模版 · packages/core/session/src/types.ts:450-465"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/session/src/types.ts:450:465"
```

模型视图就是一列 seq，`append` 往末尾加一个，`replace` 把连续一段换成一个：

```ts title="模版 · packages/core/session/src/surface.ts:563-585"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/session/src/surface.ts:563:585"
```

用 dsh 的 agent 循环跑四轮：第 1 轮调一次工具；第 2 轮第一次请求失败、重试成功；第 3 轮写到一半被用户取消；第 4 轮接着问。日志全貌如下（第三列是进模型视图的方式，空着的就是只留档）：

```text title="效果 · 四轮会话的完整日志（模型回复是构造的）"
--8<-- "projects/deepseek-harness/assets/sim/log/txt/loop-events.txt"
```

41 条事件里只有 11 条进了模型视图：

```text title="效果 · foldSurface 折出的模型视图"
--8<-- "projects/deepseek-harness/assets/sim/log/txt/loop-surface.txt"
```

`replace` 是[压缩](compaction.md)用的操作。下面构造一条替换，把第 1 轮那一段换成一句摘要，再试两条护栏：

```text title="效果 · 构造的 replace 过 Session.append"
--8<-- "projects/deepseek-harness/assets/sim/log/txt/surface-replace.txt"
```

被换掉的事件仍在日志里，只是不再进模型视图，项目把这叫「遮住」（shadowed）。替换必须在 `sourceEventSeqs` 里列出它遮住的每一条；第 0 个节点放的是 system prompt，只有 system 消息能替换它。

## 请求是日志的纯函数，算完冻结 { #pure-request }

**问题**：只要允许插件改单次请求，日志就解释不了请求，前缀缓存也会悄悄丢掉。决策记录[^request]否决「每次 `agent/request` 都传一个可自由修改的配置」时说：

> 监听器可以零记账地逐次切换模型，悄然放弃本设计旨在保护的提供方缓存。

dsh 的规矩叫「模型可见 ⟺ 已持久引用」：每一步先把要进模型的东西写进日志，再从日志派生消息，然后连同请求头一起冻结：

```ts title="模版 · packages/core/agent-loop/src/agent.ts:686-703"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/agent.ts:686:703"
```

把上面那段会话里发出的 6 个请求，逐个只拿日志前缀重建一遍，再试着改其中一个：

```text title="效果 · 每个请求都能只凭日志前缀重建"
--8<-- "projects/deepseek-harness/assets/sim/log/txt/loop-rebuild.txt"
```

6 个请求全都重建得一模一样，而且每个都是前一个的逐字前缀延长——前缀缓存能一路命中，靠的就是这一点。项目自己用一条测试钉住这件事，测试名直接叫 THEOREM：

```ts title="模版 · packages/core/agent-loop/tests/request-reconstruction.spec.ts:880-890"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/tests/request-reconstruction.spec.ts:880:890"
```

```text title="效果 · vitest 跑这个测试文件（摘出相关的几条）"
--8<-- "projects/deepseek-harness/assets/sim/log/txt/vitest-reconstruction.txt"
```

代价也在这里。项目在 pi 扩展桥接提案里列了一张「比 pi 窄」的表[^pi-bridge]，第一行就是它：pi 的 `context`、`before_provider_request` 钩子能逐请求改写模型输入，dsh 给不了——「循环从日志派生每个请求并将其冻结」。插件想影响下一个请求，只能往日志里追加带来源的消息，见[拼 prompt](prompt.md)。

## 每次模型调用落一条结算记录 { #settlement }

**问题**：只存最终消息，失败、重试、取消都没了痕迹；可取消时把半截扔掉也不对。决策记录[^cancel]里举的例子：

> 后续的「第二点展开讲讲」之类追问会缺少用户已读到的文本，在该轮次上创建的分支也会继承这个缺口。

每次模型调用落且只落一条**结算记录**（settlement）：成功是进模型视图的 `assistant/message`；失败或重试是只留档的 `assistant/attempt`，原始流照样嵌在里面。用户取消时，已经流出来的文字和推理照常记成 `assistant/message`，打上 `interrupted`；写到一半的工具调用整个丢掉——它从没执行，不能留一个没结果的调用：

```ts title="模版 · packages/core/agent-loop/src/agent.ts:465-494（取消与流中断）"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/agent.ts:465:494"
```

```ts title="模版 · packages/core/agent-loop/src/agent.ts:506-526（失败先留档，再问要不要重试）"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/agent.ts:506:526"
```

重试会回到循环开头，从同一个模型视图重新派生请求——上一节的 request 3 和 request 4 一模一样。日志里对应的两段：

<div class="grid" markdown>

```text title="效果 · 第 2 轮：失败一次再重试"
--8<-- "projects/deepseek-harness/assets/sim/log/txt/loop-events.txt:21:23"
```

```text title="效果 · 第 3 轮：写到一半被取消"
--8<-- "projects/deepseek-harness/assets/sim/log/txt/loop-events.txt:30:33"
```

</div>

第 3 轮模型吐出「第一点是」，又开了一个参数只写一半的 echo 调用；日志只留下「第一点是」，那个调用连 `tool/call` 都没有。第 4 轮的请求带着这半截（上一节末行 `carries the interrupted prefix: true`），用户说「第二点展开讲讲」，模型知道第一点讲到了哪。

## 崩溃补齐：结果未知的工具调用别盲目重试 { #repair }

**问题**：进程在工具执行到一半时被杀，日志尾巴上就剩一个没有结果的工具调用。provider 不收悬空的调用；要是直接重放，有副作用的操作就会再跑一遍。另一条路是加载时整轮丢掉，项目否决了：「单个轮次可以包含大量真实工作」[^truncate]。

恢复会话时，dsh 先给悬空的调用补错误结果，再补上 `step/end` 和 `turn/end`。错误结果分两种措辞：已经记下开始的叫「结果未知」，还没开始的叫「没开始，需要就重试」：

```ts title="模版 · packages/core/session/src/repair.ts:31-41"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/session/src/repair.ts:31:41"
```

```ts title="模版 · packages/core/agent-loop/src/index.ts:884-892（恢复时由 agent 层补，存储层不碰语义）"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/index.ts:884:892"
```

构造一个崩溃现场：模型一步里先要 `deploy`，再要 `echo`；工具默认一个接一个跑，`deploy` 开始执行后卡住不返回，这时把日志拿走（相当于进程被杀）：

```text title="效果 · 构造的崩溃日志过 interruptedTurnClosers"
--8<-- "projects/deepseek-harness/assets/sim/log/txt/crash-closers.txt"
```

`deploy` 已记下开始，补的结果让模型先判断有没有副作用，有就先核实或问用户；`echo` 没开始，可以直接重试。补完每个调用都有配对的结果，provider 能收。

## fork 复制前缀，不在原日志里分叉 { #fork }

**问题**：用户想从某个旧位置换个走向；fork 出来的子 agent 要带着父会话的上下文开工，还要命中父会话的前缀缓存。

pi 的会话文件是一棵树，分支留在同一个文件里。dsh 的日志是线性的：fork 把父日志切一刀，前缀复制进一个新会话，末尾打一个 `session/end-seed` 标记；切点落在一个没收尾的轮次里，就照崩溃补齐的办法收尾，只是措辞换成「父会话在切点之后可能已经做完了」：

```ts title="模版 · packages/core/session/src/fork.ts:20-30"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/session/src/fork.ts:20:30"
```

在两份真实日志上各切一刀——A 切在第 1 轮结束处，B 切在 `deploy` 刚开始处：

```text title="效果 · buildForkSeed 的两种切法"
--8<-- "projects/deepseek-harness/assets/sim/log/txt/fork-seed.txt"
```

两种切法下，子会话派生出的消息开头都和父会话逐字节相同，fork 出来的子 agent 第一次请求就能命中父会话的缓存。界面上的「分支」按钮和 fork 型子 agent 都走这条，后者见[多 agent 与长时工作](agents.md)。

## 格式升级不覆盖旧文件 { #migration }

**问题**：日志格式会变，已经发出去的旧版本会话还得能打开。整份读进内存再迁移扛不住大会话：决策记录[^migrate]里，一份 116 MB 的真实会话在返回之前耗尽了 16 GB 的 Node 进程；改成逐行流式迁移后用了 6.2 秒、2.1 GB。

迁移拆成一串相邻的边，每条边只管 vN → vN+1，声明时就检查相邻：

```ts title="模版 · packages/session/session-format/src/chain.ts:24-34"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/session/session-format/src/chain.ts:24:34"
```

每条边建一个有状态的 stage，事件一条条流过去，不需要中间数组：

```ts title="模版 · packages/session/session-format/src/types.ts:142-157"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/session/session-format/src/types.ts:142:157"
```

当前版本是 v4，四条边连成一条链：

```ts title="模版 · packages/session/session-format-catalog/src/generated.ts:16-31"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/session/session-format-catalog/src/generated.ts:16:31"
```

拿仓库快照里一份 v0 会话（`snapshots/session/text-turn`，占位符换回真值、补回快照去掉的 seq），放进临时会话目录，先只读打开、再写打开：

```text title="效果 · v0 会话被 JSONL 存储打开两次"
--8<-- "projects/deepseek-harness/assets/sim/log/txt/migrate.txt"
```

只读打开只在内存里迁移，不写文件；写打开时在旁边发布 `session.v4.jsonl`，原来的 `session.jsonl` 一个字节没动。v0 的 25 行里有打包的流式分片，迁到 v4 折成 17 个事件。

## 谁管什么 { #split }

- **程序**：追加、冻结、编号；折出模型视图；每步派生请求再冻结；落结算记录；补齐悬空调用；fork 复制前缀；迁移只发布新文件
- **模型**：只读派生出来的视图；补齐的错误结果交给它判断要不要重试、要不要先问用户
- **用户**：取消、分支、恢复旧会话
- **插件**：能往日志里追加带来源的事件，不能改已经派生出来的请求

## 实跑原件 { #sim-files }

脚本在 `assets/sim/log/`：`loop.ts`（四轮会话）、`surface.ts`（构造的 replace）、`crash.ts`（构造的崩溃）、`fork.ts`、`migrate.ts`、`snapshot-events.py`；实验设置见[维护记录](../../maintenance/projects/deepseek-harness.md)。

??? abstract "四轮会话的完整日志（loop-events.json）"

    ```json
    --8<-- "projects/deepseek-harness/assets/sim/log/out/loop-events.json"
    ```

??? abstract "崩溃那一刻的日志和补上的事件（crash-persisted.json、crash-closers.json）"

    ```json
    --8<-- "projects/deepseek-harness/assets/sim/log/out/crash-persisted.json"
    ```

    ```json
    --8<-- "projects/deepseek-harness/assets/sim/log/out/crash-closers.json"
    ```

??? abstract "request-reconstruction.spec.ts 的完整测试输出"

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/log/out/vitest-reconstruction.txt"
    ```

??? abstract "对照：项目快照里一份 headless 组合的会话日志，摘成一行一个事件"

    多了产品组合会带上的东西：开头三条权限状态、一条 `source=runtime-context` 的运行时上下文、bash 作为后台任务登记和结算。

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/log/txt/snapshot-events.txt"
    ```

[^pi-log]: pi 的[扩展文档](https://pi.dev/docs/latest/extensions)（`context`、`context_with_system` 两个事件）和[会话格式](https://pi.dev/docs/latest/session-format)，经 Context7 读取，2026-10-20 读。
[^events]: dsh 的决策记录[事件溯源的会话与派生消息历史](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/implemented/architecture/2026-06-11-event-sourced-sessions.zh.md)，2026-10-20 读。
[^request]: dsh 的决策记录[每个 LLM 请求都可从会话日志重建](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/implemented/architecture/2026-07-05-reconstructable-requests.zh.md)，2026-10-20 读。
[^pi-bridge]: dsh 的决策记录[Pi 扩展桥接](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/proposed/feature/2026-10-03-pi-extensions-bridge.zh.md)，提案，2026-10-20 读。
[^cancel]: dsh 的决策记录[被取消的流定稿其已送达前缀](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/implemented/architecture/2026-08-10-cancelled-stream-prefix-finalize.zh.md)，2026-10-20 读。
[^truncate]: dsh 的决策记录[加载时截断被中断的最终轮次](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/rejected/simplification/2026-06-20-truncate-interrupted-turns.zh.md)，已否决，2026-10-20 读。
[^migrate]: dsh 的决策记录[已发布 Session 格式通过有状态流式 Stage 迁移](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/implemented/architecture/2026-08-31-released-session-format-migrations.zh.md)，2026-10-20 读。
