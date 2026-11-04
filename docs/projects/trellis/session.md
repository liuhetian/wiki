---
description: "Trellis 的会话开始：新开、/clear、压缩后三个时机跑同一个 hook，注入当前状态、流程摘要、spec 索引路径和按任务状态算出的下一步；规范正文不注入，按需拉；附整段注入的中译"
---

# 会话开始：只给状态、索引和下一步，细节按需拉

裸用 Claude Code 时，新会话只读一份 CLAUDE.md：规矩写多了，每轮都背着；写少了，模型不知道项目规矩，也不知道上次做到哪；`/compact` 之后同样一片空白。Trellis 在会话开始时注入一段精简上下文：当前任务和它的状态、流程摘要、有哪些 spec 索引、下一步该干什么。规范正文一个字不塞，要用时模型自己去读。本篇只读了源码，没有实跑，每节贴源码模版和注入文字的中译；模版路径省略前缀 `packages/cli/src/templates/`。

## 新开、清空、压缩后都重新注入 { #matchers }

**问题**：一个会话聊到上下文快满，宿主压缩了历史，开头注入的东西跟着被压成一句摘要；用户 `/clear` 之后更是什么都没了。

**功能**：Claude Code 的 SessionStart 事件按来源分 `startup`、`clear`、`compact` 三种，Trellis 给三种挂同一个脚本，超时 30 秒：

```json title="模版 · claude/settings.json:5-37"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/claude/settings.json:5:37"
```

压缩之后重新注入的还是同一段，`<task-status>` 照当时的状态重新算一遍。只有更新提示做了节流：同一会话第一次 SessionStart 才去查 `trellis --version`，之后的 clear、compact 直接跳过。

## 注入七个块，规范只给路径 { #payload }

**问题**：CLAUDE.md 想把规范、流程、当前任务都写进去，结果越写越长，和这一轮要干的事无关的规矩也每次都占着上下文。

**功能**：脚本依次写七个块，最后作为 `additionalContext` 交给宿主：

```python title="模版 · shared-hooks/session-start.py:870-916"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/session-start.py:870:916"
```

| 块 | 内容 | 来源 |
|---|---|---|
| `<session-context>` | 一句话：这是精简上下文，细节按需加载 | 写死 |
| `<first-reply-notice>` | 第一条回复先确认已加载，见[下文](#first-reply) | 写死，可带更新提示 |
| `<migration-warning>` | 旧版 spec 目录结构的迁移提醒，只在需要时出现 | 现算 |
| `<current-state>` | 开发者、分支是否干净、当前任务、活动任务数、日志路径和行数、spec 索引个数 | 现算 |
| `<trellis-workflow>` | `workflow.md` 里 Phase Index 一节，去掉每轮提醒用的标签块 | 摘自文件 |
| `<guidelines>` | 子代理读上下文的顺序，加上 spec 索引文件的路径清单 | 现算 |
| `<task-status>` | 当前状态和下一步，见[下文](#next-action) | 现算 |

`<guidelines>` 只列 `index.md` 的路径，不读里面的内容；日志也只给路径和行数，不给正文。

下面是一个构造情境下拼出来的整段，已译成中文：订单后台的单仓库，`.trellis/spec/` 下只有 `backend/` 一层和共用的 `guides/`，开发者 `lin`，还没有任务。块的顺序和固定句子照源码；分支名、行数这类现算的值是编的；`<trellis-workflow>` 按源码规则手工摘出（取 `## Phase Index` 到 `## Phase 1: Plan` 之间的内容，去掉标签块、HTML 注释和平台标记行），没有实跑：

````text title="构造 · 新会话、无任务时注入的整段（中译）"
<session-context>
Trellis 精简版 SessionStart 上下文。用它给本次会话定位；细节按需加载。
</session-context>

<first-reply-notice>
本次会话第一条可见的助手回复里，简短确认 Trellis SessionStart 上下文已加载。
确认用什么语言，按这个顺序选：
1. 用用户当前请求（触发这条回复的那条用户消息）的语言。
2. 那条请求没有明确的自然语言时，用项目里明确约定的沟通语言。
3. 两者都没有，就原样输出与语言无关的兜底：`Trellis SessionStart ✓`。
确认之后直接接着处理用户的请求。
这句确认不得改变本条回复其余部分的语言。
本提示只生效一次：第一条可见回复之后不再重复。
</first-reply-notice>

<current-state>
Developer: lin
Git: branch main; clean.
Current task: none.
Active tasks: 0 total. 仅在需要时运行 `python3 ./.trellis/scripts/task.py list --mine`。
Journal: .trellis/workspace/lin/journal-1.md, 212 / 2000 lines.
Spec indexes: 2 available.
</current-state>

<trellis-workflow>
# 开发流程 —— 会话摘要
完整指南：.trellis/workflow.md。某一步的细节：`python3 ./.trellis/scripts/get_context.py --mode phase --step <X.Y>`。

## Phase Index（阶段索引）

```
阶段 1：规划 → 给请求分类，取得建任务的同意，再写规划产物
阶段 2：执行 → 任务状态是 in_progress 之后才动手实现
阶段 3：收尾 → 验证、更新 spec、提交、收尾
```

### 请求分诊

- 简单对话或小任务：只问这一轮要不要建 Trellis 任务。用户说不要，本次会话就不走 Trellis。
- 复杂任务：问能不能建 Trellis 任务、进入规划。用户说不行，就不要在主会话里大面积直接实现；改为解释、澄清范围，或建议拆小。
- 用户同意建任务，不等于同意开始实现。规划照样先做。

### 规划产物

- `prd.md` —— 需求、约束和验收标准。不放技术设计和执行清单。
- `design.md` —— 复杂任务的技术设计：边界、契约、数据流、取舍、兼容性、上线 / 回滚方式。
- `implement.md` —— 复杂任务的执行计划：有序清单、验证命令、评审关口、回滚点。
- `implement.jsonl` / `check.jsonl` —— 给子代理的 spec 和调研文件清单。它们不能代替 `implement.md`。
- 轻量任务可以只有 PRD。复杂任务在 `task.py start` 之前必须有 `prd.md`、`design.md` 和 `implement.md`。

### 父子任务树

一个用户请求里有几个能各自验证的交付物时，用父任务。父任务管来源需求、任务映射、跨子任务的验收标准和最后的集成评审；除非它自己也有直接要做的活，一般不当实现对象。

能各自规划、实现、检查、归档的交付物用子任务。父子结构不是依赖系统：一个子任务要等另一个，就把顺序写进子任务的 `prd.md` / `implement.md`，每个子任务的验收标准保持可测。

新建子任务用 `task.py create "<标题>" --slug <名字> --parent <父任务目录>`。挂已有任务用 `task.py add-subtask <父> <子>`，挂错了用 `task.py remove-subtask <父> <子>` 解开。

### 阶段 1：规划
- 1.0 建任务 `[必做 · 一次]`（只在得到建任务的同意之后）
- 1.1 需求探索 `[必做 · 可重复]`（`prd.md`；复杂任务还要 `design.md` + `implement.md`）
- 1.2 调研 `[可选 · 可重复]`
- 1.3 配置上下文 `[必做 · 一次]` —— Claude Code、Cursor、OpenCode、Codex、Kiro、Gemini、Qoder、CodeBuddy、Copilot、Droid、Pi、Oh My Pi、ZCode、Snow、Reasonix、Grok、Kimi Code（只限派子代理的平台；inline 平台跳过）
- 1.4 激活任务 `[必做 · 一次]`（先过评审关，再 `task.py start`；状态 → in_progress）
- 1.5 完成标准

### 阶段 2：执行
- 2.1 实现 `[必做 · 可重复]`
- 2.2 质量检查 `[必做 · 可重复]`
- 2.3 回退 `[按需]`

子代理派发协议适用于所有平台和所有子代理，包括 Codex 原生的 `SubagentStart` 上下文注入（子代理一侧自己拉取兜底）、第二类的 Gemini/Qoder/Copilot/Reasonix/Trae/Grok/Kimi Code、靠 hook 的 ZCode/Snow，以及 `trellis-research`：每段派发 prompt 都以 `Active task: <task.py current 给出的任务路径>` 开头，然后才是各角色的指令。在 Grok Build 上，用 `spawn_subagent` 并把 `subagent_type` 设成 Trellis 的代理名（如 `trellis-implement`）。在 Kimi Code 上，派内置的 `coder` / `explore` 子代理，带上对应的 `.kimi-code/skills/trellis-<角色>/SKILL.md` 指令。

### 阶段 3：收尾
- 3.2 调试复盘 `[按需]`
- 3.3 更新 spec `[必做 · 一次]`
- 3.4 提交改动 `[必做 · 一次]`
- 3.5 收尾提醒

> 注：3.1 已并入 2.2（最后一轮做全范围检查）和 3.4（提交前的引导）。编号保持不变，免得外部引用失效。

### 规则

1. 先判断自己在哪个阶段，再从那个阶段的下一步接着做
2. 阶段内按顺序执行；`[必做]` 的步骤不能跳
3. 阶段可以回退（比如执行时发现 prd 有缺陷 → 回到规划修好，再重新进入执行）
4. 标 `[一次]` 的步骤，产出已经存在就跳过，不要重跑
5. 看产物在不在来决定下一步；轻量任务缺 `design.md` / `implement.md` 是正常的，复杂任务缺就是规划没做完。

### 活动任务的路由

有活动任务时，用户的请求对上下面某种意图，先路由，需要时再加载那一步的细节。

- 规划或需求不清 -> `trellis-brainstorm`。
- `in_progress` 的实现 / 检查 -> 派 `trellis-implement` / `trellis-check`。
- 反复调试 -> `trellis-break-loop`；更新 spec -> `trellis-update-spec`。

- 规划或需求不清 -> `trellis-brainstorm`。
- 改之前 -> `trellis-before-dev`；改之后 -> `trellis-check`。
- 反复调试 -> `trellis-break-loop`；更新 spec -> `trellis-update-spec`。

### 护栏

- 同意建任务不等于同意实现；实现要等产物评审过、跑了 `task.py start` 之后。
- 轻量任务只有 PRD 是可以的；复杂任务要 `design.md` + `implement.md`。
- 规划必须落到任务产物里；报告完成之前必须先跑检查。

### 加载某一步的细节

每一步都运行这条命令取详细指引：

```bash
python3 ./.trellis/scripts/get_context.py --mode phase --step <step>
# 例如 python3 ./.trellis/scripts/get_context.py --mode phase --step 1.1
```

---
</trellis-workflow>

<guidelines>
实现 / 检查时读任务上下文的顺序：jsonl 条目 -> `prd.md` -> `design.md（如有）` -> `implement.md（如有）`。轻量任务缺的可选产物直接跳过。

## 可用的索引（按需读）
- .trellis/spec/guides/index.md
- .trellis/spec/backend/index.md

更多用这条命令发现：`python3 ./.trellis/scripts/get_context.py --mode packages`
</guidelines>

<task-status>
Status: NO ACTIVE TASK
Next-Action: 建任何 Trellis 任务之前，先给当前这一轮分类。简单对话 / 小任务只问这一轮要不要建 Trellis 任务。复杂任务问能否建任务并进入规划。
</task-status>

<ready>
上下文已加载。照 <task-status> 做。workflow / spec / 任务的细节只在需要时加载。
</ready>
````

「活动任务的路由」出现两份清单，是因为去掉平台标记行之后，派子代理平台那份和 inline 平台那份都留了下来，SessionStart 不按平台过滤；按平台过滤只发生在 `get_context.py --mode phase --step <X.Y> --platform <平台>` 取步骤细节的时候。

??? abstract "原文 · trellis/workflow.md:147-317（Phase Index 一节，含被去掉的标签块）"

    ```markdown
    --8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/trellis/workflow.md:147:317"
    ```

摘 Phase Index 和去标签块的代码：

```python title="模版 · shared-hooks/session-start.py:803-819"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/session-start.py:803:819"
```

## 下一步由任务状态和产物算出来 { #next-action }

**问题**：模型读到「当前任务 xxx」，还是不知道该从哪一步接着做：需求问完了没有，能不能开始写代码。

**功能**：`<task-status>` 按 `task.json` 的 `status` 字段和任务目录里有哪些文件，算出一句 Next-Action。轻量还是复杂由模型判断，脚本只看文件在不在：

```python title="模版 · shared-hooks/session-start.py:424-514"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/session-start.py:424:514"
```

各分支的 Next-Action 译文：

| 情形 | Status | Next-Action（中译） |
|---|---|---|
| 没有活动任务 | NO ACTIVE TASK | 建任何 Trellis 任务之前，先给当前这一轮分类。简单对话 / 小任务只问这一轮要不要建任务；复杂任务问能否建任务并进入规划 |
| 指针指向的目录不在了 | STALE POINTER | 运行 `task.py finish` 清掉失效的指针，再问用户接下来做什么 |
| 状态是 completed | COMPLETED | 运行 `/trellis:finish-work`；工作区有未提交改动，先回到 3.4 |
| planning，还没有 `prd.md` | PLANNING | 加载 `trellis-brainstorm`，写 `prd.md`。留在规划阶段 |
| planning，缺 `design.md` 或 `implement.md` | PLANNING | 轻量任务可以只凭 PRD 申请开工评审；复杂任务 start 之前必须补上缺的文件 |
| planning，产物齐了 | PLANNING | 规划产物都在了；`task.py start` 之前先请用户评审 |
| planning，jsonl 还空着 | PLANNING | （追加）派子代理模式开工前，先整理好 `implement.jsonl` 和 `check.jsonl` |
| 其他状态，如 in_progress | IN_PROGRESS | 照对应的每轮 workflow-state 做。实现 / 检查时上下文顺序是 jsonl 条目 -> `prd.md` -> `design.md（如有）` -> `implement.md（如有）` |

planning 的几种情形都以同一句结尾：「用户确认开工之前，不要进入实现。」

每条 Next-Action 指向的那段规矩，每轮还会再注入一次，见[每轮提醒](breadcrumb.md)。

## 第一句回复先说「已加载」 { #first-reply }

**问题**：hook 有没有生效，用户看不见：注入只进模型的上下文。更新提示同样埋在上下文里，模型多半不提，用户一直不升级。

**功能**：`<first-reply-notice>` 让模型在第一条回复里用一句话确认加载成功；有新版本时，同一句里顺带转告更新提示。源码注释写明了这么做的理由：

> The reminder has to reach the *user*, not just the model's context — a line buried in SessionStart context is exactly how the update step kept getting skipped.

（提醒必须送到用户眼前，不能只进模型的上下文 —— 埋在 SessionStart 上下文里的一行字，正是更新这一步一直被跳过的原因。）

```python title="模版 · shared-hooks/session-start.py:70-102"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/session-start.py:70:102"
```

有更新时，在开头那句之后插进一行，译文：「同一条回复里，单独占一行转告这条 Trellis 维护通知：<更新提示>」。没有更新时，这一块和常量逐字相同，不留空行、不留占位。

## 让后面的 Bash 认得是哪个会话 { #context-key }

**问题**：同一个仓库开两个窗口，各做各的任务。`task.py start` 是模型后来在 Bash 里跑的普通命令，它拿不到 hook 那次的 stdin，不知道自己属于哪个会话，也就不知道该改哪个窗口的「当前任务」。

**功能**：当前任务不是全仓库一个，而是每个会话一个指针，存在 `.trellis/.runtime/sessions/` 下。会话身份从 hook 输入里的 session id 算出来；SessionStart 时把它写进 Claude Code 提供的 `CLAUDE_ENV_FILE`，之后这个会话里的每条 Bash 命令都带着 `TRELLIS_CONTEXT_ID`：

```python title="模版 · shared-hooks/session-start.py:278-306"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/session-start.py:278:306"
```

这个文件是用户自己的（conda 初始化、代理设置都写在里面），每次 SessionStart 都追加一行，它会越长越大，所以先看最后一条同名 export 是不是已经是这个值，是就不写。拿不到身份时，`task.py start` 退化为只改 `task.json` 的状态，不写指针，提示「AI 依据对话上下文继续」。没有 `CLAUDE_ENV_FILE` 的平台，靠另一个挂在 Bash 之前的 hook 递票据，见[多平台](platforms.md#hooks)。

## 关掉注入 { #skip }

**问题**：用 `claude -p` 跑一次性脚本，或者想对比一下有没有 Trellis 的差别，这时不需要这段注入。

**功能**：环境变量 `TRELLIS_HOOKS=0` 或 `TRELLIS_DISABLE_HOOKS=1` 时直接退出；十个平台的非交互标志（如 `CLAUDE_NON_INTERACTIVE=1`）也让它退出：

```python title="模版 · shared-hooks/session-start.py:153-173"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/session-start.py:153:173"
```

要整体比较有无 Trellis，另有 `trellis ablate`：先在项目外存一份能还原的事务，再临时移走所有由 Trellis 管理的文件，比完用 `trellis restore` 按字节还原。

## 谁管什么 { #who }

- **程序做死的**：三个时机都触发；注入哪七块、按什么顺序；Next-Action 由状态和文件是否存在决定；会话身份写进环境文件；更新检查每个会话只做一次
- **留给模型的**：照 Next-Action 做；判断任务是轻量还是复杂；需要细节时自己跑 `get_context.py --mode phase --step`、自己读 spec 索引和日志
- **留给用户的**：写 spec 的内容；决定这一轮要不要建任务；用环境变量关掉注入
