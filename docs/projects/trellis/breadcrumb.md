---
description: "Trellis 的每轮提醒与规划关卡：每条用户消息都按任务状态从 workflow.md 取一段 workflow-state 注入；「开干」不算批准、一次只问一个问题写在 brainstorm skill 里；状态只由 task.py 改，唯一的程序硬门是 start 前清单不能空；附各段中译"
---

# 每轮提醒：按任务状态取一段规矩，规划关卡大半写在 prompt 里

规矩只在会话开头说一遍，聊到第二十轮，模型就照自己的习惯来了；用户一句「直接开干」，它马上动手写代码。Trellis 给每条用户消息都附上一小段 `<workflow-state>`：现在是哪个任务、什么状态、这个状态下该守哪几条。「先规划后实现」的细则写在 brainstorm skill 里。状态本身只能由 `task.py` 改，唯一一道由程序把守的门在 `task.py start`。本篇只读了源码，没有实跑，每节贴源码模版和注入文字的中译；模版路径省略前缀 `packages/cli/src/templates/`。

下文的构造情境：订单后台，用户说「给订单列表加一个导出 CSV 的按钮，直接开干」，任务目录叫 `.trellis/tasks/11-04-order-csv-export`。

## 每条用户消息都附一段状态提醒 { #per-turn }

**问题**：会话开头注入的流程，二十轮之后早被冲淡了；压缩一次，就只剩一句摘要。

**功能**：UserPromptSubmit 事件在每条用户消息提交时触发，不设 matcher，超时 15 秒：

```json title="模版 · claude/settings.json:60-70"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/claude/settings.json:60:70"
```

脚本找到当前会话的活动任务，读出状态，拼成一个三段的块：标签、一行抬头、这个状态的正文。没有任务时抬头写 `Status: no_task`，有任务时写 `Task: <任务 id> (<状态>)`：

```python title="模版 · shared-hooks/inject-workflow-state.py:359-380"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-workflow-state.py:359:380"
```

找不到对应状态的正文时，只写一句「Refer to workflow.md for current step.」（去 workflow.md 看当前这一步）。这是故意的：提醒坏了要让用户看得出来，而不是被一段写死的默认文字悄悄盖过去。

## 每种状态一段话 { #blocks }

**问题**：规划阶段要提醒的是「别写代码、先把需求问清」，实现阶段要提醒的是「派子代理、别忘了提交」，用同一段话哪头都说不准。

**功能**：正文按状态分块，写在 `workflow.md` 里，用 `[workflow-state:状态]` 和 `[/workflow-state:状态]` 包起来。没有任务和任务记录坏了的两段：

```markdown title="模版 · trellis/workflow.md:179-191"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/trellis/workflow.md:179:191"
```

```text title="译文 · no_task（没有活动任务，每条消息都注入）"
没有活动任务。建任何 Trellis 任务之前，先给当前这一轮分类，并征得建任务的同意。
简单对话 / 小任务：只问这一轮要不要建 Trellis 任务。用户说不要，本次会话就不走 Trellis。
复杂任务：问用户能不能建一个 Trellis 任务并进入规划阶段。用户说不行，就解释、澄清范围，或建议拆小。
```

```text title="译文 · task_error（指针在，task.json 读不出来）"
活动任务的记录读不出来。不要新建或激活别的任务。
检查上面点名的任务目录，修好它的 task.json。它必须是合法的 JSON 对象，status 不能为空。
保留已有的任务字段和产物。如果没法安全地判断正确的状态，重建记录之前先问用户。
```

规划阶段的一段：

```markdown title="模版 · trellis/workflow.md:203-208"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/trellis/workflow.md:203:208"
```

```text title="构造 · 建好任务后，下一条用户消息附带的块（中译）"
<workflow-state>
Task: order-csv-export (planning)
加载 `trellis-brainstorm`；留在规划阶段。
轻量任务：有 `prd.md` 就够。复杂任务：写完 `prd.md`、`design.md` 和 `implement.md`；`task.py start` 之前请用户评审。
多个交付物：考虑一个父任务加几个能各自验证的子任务；依赖关系写进子任务的产物里，不要靠树的位置暗示。
子代理模式：开工前把 `implement.jsonl` 和 `check.jsonl` 整理成 spec / 调研文件清单。
</workflow-state>
```

抬头里的任务 id 取 `task.json` 的 `id` 字段，这里是编的；正文照源码译。

实现阶段的一段，从 `task.py start` 一直用到归档，覆盖实现、检查、更新 spec 和提交：

```markdown title="模版 · trellis/workflow.md:236-241"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/trellis/workflow.md:236:241"
```

```text title="译文 · in_progress"
工具：`trellis-implement` / `trellis-research` 只是子代理类型（用 Task/Agent 工具调，不是 Skill；没有叫这两个名字的 skill）。`trellis-update-spec` 是 skill。`trellis-check` 两种都有；改完代码做验证时优先用 Agent 形式。
流程：`trellis-implement` -> `trellis-check` -> `trellis-update-spec` -> 提交（阶段 3.4）-> `/trellis:finish-work`。
主会话默认：派 implement / check 子代理。子代理自我豁免：如果你已经是 `trellis-implement`，不要再派 `trellis-implement` 或 `trellis-check`；如果你已经是 `trellis-check`，不要再派 `trellis-check` 或 `trellis-implement`。只有主会话派子代理。
派发 prompt 以 `Active task: <task.py current 给出的任务路径>` 开头。读上下文的顺序：jsonl 条目 -> `prd.md` -> `design.md（如有）` -> `implement.md（如有）`。
```

第一行专门澄清「这几个名字哪个是子代理、哪个是 skill」，因为模型容易拿 Skill 工具去调 `trellis-implement`。还有一段 `completed` 的正文（「代码已提交。运行 `/trellis:finish-work`；有未提交改动先回 3.4」），但它是死代码：`task.py archive` 改状态和把目录挪进 `archive/` 在同一次调用里完成，指针随之失效，这段永远轮不到注入。`workflow.md` 自己在这段上方的注释里写明了。

## 规矩只存一处，测试守着必做步骤 { #single-source }

**问题**：提醒文字要是写死在脚本里，用户改了 `workflow.md`，每轮的提醒还是旧的；反过来，一个必做步骤没写进提醒，模型就会悄悄跳过。

**功能**：脚本里没有任何默认文字，正文只从 `workflow.md` 的标签块里解析：

```python title="模版 · shared-hooks/inject-workflow-state.py:204-232"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-workflow-state.py:204:232"
```

`workflow.md` 在标签块前面留了一段给维护者的注释，写明契约和一条由回归测试守着的不变式：

```markdown title="模版 · trellis/workflow.md:101-120"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/trellis/workflow.md:101:120"
```

```text title="译文 · 不变式那段"
不变式（test/regression.test.ts）：
  步骤说明里每个标了 `[required · once]` 的步骤，都必须在它所在阶段的 [workflow-state:*] 块里有一行对应的强制说明。每轮提醒是唯一一条每轮都在的通道；必做步骤没在这里提到，AI 就会悄悄跳过它（阶段 1 的规划关卡被跳过、阶段 3.4 的提交被跳过，都是从这个缺口出的事）。
```

所以 in_progress 那段正文里，流程一路写到「提交（阶段 3.4）」和 `/trellis:finish-work`。会话开始注入的 Phase Index 去掉了这些标签块，免得同一段话进两次上下文，见[会话开始](session.md#payload)。

## 一句「开干」不算批准 { #consent }

**问题**：用户说「给订单列表加一个导出 CSV 的按钮，直接开干」。模型把「开干」当成授权，跳过需求就改代码——导出全部还是当前筛选、金额要不要千分位、大表会不会超时，一个都没问。

**功能**：两道同意分开算。no_task 那段只许问「要不要建任务」；建了任务，状态是 planning，提醒里点名加载 `trellis-brainstorm`。这个 skill 开头两节是不容商量的契约：

```markdown title="模版 · common/skills/brainstorm.md:1-19"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/common/skills/brainstorm.md:1:19"
```

```text title="译文 · brainstorm 开头两节"
## 不容商量的规划契约

用户要求构建、实现、修复、重构，或者说「开干」，都不等于批准离开规划阶段。同意建任务也不等于批准实现。

每个不简单的任务，在开始实现之前，用户必须在最初的请求之后至少再回应一次。如果不需要澄清，这次回应就必须是批准下文所说的最终规划总结。

只要还有属于用户的产品、范围、交互、兼容性、风险或验收决定没定，这一轮就以恰好一个价值最高的问题结尾。不要改产品代码，不要派实现，不要运行 `task.py start`。

## 不容商量的证据规则

一个问题如果能靠探查代码库回答，就去探查代码库。

这是强制的。问用户之前，先查答案是不是已经在代码、测试、配置、文档、现有 spec 或任务历史里。

不要让用户确认仓库能回答的事实。只问产品意图、偏好、范围、风险承受度、验收行为，或者查过之后仍然含糊的决定。

仓库里的证据说明的是现在的行为和技术约束。用户想要的行为、功能范围的边界和交互偏好，单凭仓库证据永远回答不了，哪怕已有现成的模式；已有模式只是选项和推荐的依据，不是决定。
```

最后一段防的是另一头：模型在代码里看到「别的列表都导出全部」，就替用户定了。

## 一次只问一个问题，代码能答的不问 { #questions }

**问题**：模型一口气列十个问题，其中一半是「数据库用的什么」「有没有现成的导出工具」这种它自己 grep 就能知道的。

**功能**：规划流程和提问规则：

```markdown title="模版 · common/skills/brainstorm.md:39-77"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/common/skills/brainstorm.md:39:77"
```

```text title="译文 · 规划流程与提问规则"
## 规划流程

1. 把用户的请求和已知事实先记进 `prd.md`。
2. 提问之前先查能查到的证据：
   - 代码、测试、fixture 和配置
   - README、文档、现有 spec 和领域笔记
   - 相关的 Trellis 任务、调研文件，有的话还有会话历史
3. 把查到的分成：
   - 已确认的事实
   - 还需要用户给的产品意图
   - 还需要用户定的范围或风险
   - 多半不在范围内的事
4. 还剩属于用户的决定，就问价值最高的那一个问题，附上你的推荐和取舍，然后停下。同一轮里不做实现。
5. 用户每答一次，更新 `prd.md`，重新盘点还剩哪些决定，从第 2 步再来。
6. 没有属于用户的决定了，复杂任务就新建或更新 `design.md` 和 `implement.md`。
7. 过需求收敛关，再做 PRD 收敛整理。
8. 给出最终规划总结，然后停下。同一轮里不运行 `task.py start`，不改产品代码。
9. 只有之后的一条用户消息明确批准了最新的规划总结，才算授权 `task.py start` 和实现。批准之后产物又有实质改动，就重新走一遍最终评审。

不要自己发明一套项目专用的产品 / spec 层级。仓库里已经有产品、领域或 spec 文档就用；没有，就用现有的证据往下做。

## 提问规则

每条消息只问一个问题。

每个问题都要包含：

- 要定的是什么
- 为什么这个答案要紧
- 你推荐的答案
- 用户选别的会有什么取舍

不要问流程性的问题，比如要不要搜、要不要看文件、要不要继续头脑风暴。证据工作直接做。只有剩下的是产品决定、偏好、范围边界或风险承受度时才问用户。

推荐不是默认选项。不要因为用户要求了实现，就替用户选定推荐的产品决定。

请求和仓库证据已经解决了所有决定时，不要硬造澄清问题。这时直接给最终规划总结，它仍然需要之后的明确批准。

最终评审是一道必须过的阶段切换关，不属于被禁止的流程性问题。同意建任务、最初的实现请求、在最新总结之前给的批准，都不满足这道关。
```

套到构造情境里，模型查过路由和现有的列表接口之后，问的应该是这样一句（构造）：「导出的范围是当前筛选结果，还是全部订单？推荐当前筛选结果——和页面上看到的一致，也不用处理全表；选全部订单，就要分批流式写出，否则大表会超时。」

收尾的「最终规划总结」有固定栏目：目标、范围内、范围外、验收标准、关键决定、风险或推迟项、产物状态（brainstorm.md 第 135 行）。总结之前还要把 `prd.md` 按最终结构重写一遍，合并重复、删掉已解决的问题，同时保留每个 `文件:行号` 锚点。

## 状态只由脚本改，唯一的硬门在 start { #gate }

**问题**：模型自己宣布「规划完成」就开工；派出去的子代理一份 spec 都没拿到，主会话也不知道。

**功能**：状态写在 `task.json` 的 `status` 字段，只经 `task.py` 改，每轮提醒跟着它切换：

- `task.py create`：建目录，`status` 写 `planning`，生成默认 `prd.md`；在有子代理的平台上建两个空的 `implement.jsonl`、`check.jsonl`；拿得到会话身份时顺手设好当前任务指针，下一条消息的提醒立刻换成 planning 那段
- `task.py start`：`planning` 改成 `in_progress`，提醒换成实现阶段那段
- `task.py archive`：改成 `completed`，挪进 `archive/年-月/`，删掉指向它的会话指针

上游仓库里一个进行中的任务，`task.json` 开头是这样，每轮提醒抬头里的任务 id 就取自 `id` 字段：

```json title="模版 · .trellis/tasks/07-23-codex-inline-default-agent-model/task.json:1-8"
--8<-- "projects/trellis/assets/trellis-src/.trellis/tasks/07-23-codex-inline-default-agent-model/task.json:1:8"
```

默认的 PRD 只有骨架，末尾三行提示写什么、不写什么：

```python title="模版 · trellis/scripts/common/task_store.py:299-322"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/trellis/scripts/common/task_store.py:299:322"
```

```text title="译文 · 默认 prd.md 的 Notes"
- `prd.md` 只写需求、约束和验收标准。
- 轻量任务可以只有 PRD。
- 复杂任务在 `task.py start` 之前补上技术设计 `design.md` 和执行计划 `implement.md`。
```

两个清单建出来是空文件，不放占位行——占位行会被校验当成没整理完的脚手架：

```python title="模版 · trellis/scripts/common/task_store.py:578-590"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/trellis/scripts/common/task_store.py:578:590"
```

`start` 在改状态之前查两个清单，有一个没有真实条目就拒绝：

```python title="模版 · trellis/scripts/task.py:194-215"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/trellis/scripts/task.py:194:215"
```

```text title="译文 · start 被拒时模型看到的输出"
Error: implement.jsonl 和 check.jsonl 没有整理过的条目
子代理（implement / check）会在零 spec 上下文的情况下运行。
  整理：python3 .trellis/scripts/task.py add-context <任务> implement <路径> "<理由>"
  校验：python3 .trellis/scripts/task.py validate <任务>
  确实要空着？加 --allow-empty-context 重跑 start
```

这是规划阶段唯一由程序把守的门。「复杂任务必须有 `design.md` 和 `implement.md`」「用户批准之后才能 start」都只写在提醒和 skill 里，`cmd_start` 不检查；模型要直接改代码，也没有任何 hook 拦它——Trellis 没在 Edit、Write 上挂 hook。

## 这一轮不要提醒 { #skip }

**问题**：用户只是顺口问一句「这个函数是干嘛的」，不想每次都被拉进任务流程。

**功能**：消息里出现关键词 `no-trellis`，这一轮就不注入。按词边界匹配，不分大小写，连字符算词内字符，所以 `no-trellisx` 不算；关键词可以在 `.trellis/config.yaml` 的 `prompt_injection.skip_keyword` 里改，设成空字符串就关掉这个口子：

```python title="模版 · shared-hooks/inject-workflow-state.py:273-283"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-workflow-state.py:273:283"
```

```python title="模版 · shared-hooks/inject-workflow-state.py:420-435"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-workflow-state.py:420:435"
```

## 谁管什么 { #who }

- **程序做死的**：每条消息都注入；按 `status` 选哪一段；`status` 只经 `task.py` 改；`start` 前两个清单不能空；关键词跳过
- **留给模型的**：给请求分类、判断任务轻重；先查代码再提问，一次一个；写 `prd.md`、`design.md`、`implement.md`；守「批准之后才 start」——这一条没有程序兜底
- **留给用户的**：同意建任务；回答产品决定；明确批准最终规划总结；改 `workflow.md` 里各段的措辞
