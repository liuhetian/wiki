---
description: "Trellis 一套文件喂 22 个平台：同一组 Python hook 按宿主改事件名和输出格式；没有会话开始 hook 的平台改用 /trellis:start 命令；不能改子代理 prompt 的让子代理自己读清单；没有子代理的走 inline、主会话先读规范；skill 什么时候加载靠一张中央描述表；附各段中译"
---

# 一套文件喂 22 个平台：同一个脚本按宿主改输出，没 hook 的退回让模型自己拉

裸用时，每换一个 coding agent，就要把规矩重写一遍：Claude Code 读 CLAUDE.md 和 `.claude/`，Cursor 读 `.cursor/`，Codex 读 AGENTS.md。Trellis 把要说的话都放在 `.trellis/` 和一组共用的模版里，`trellis init` 按平台把它们写成各家认的文件。宿主能力有高有低，同一件事分三档做：有 hook 的由程序注入；没有就写成命令或子代理定义里的指令，让模型自己去读；连子代理都没有的，主会话自己干。本篇只读了源码，没有实跑，每节贴源码模版和文字的中译；模版路径相对 `packages/cli/src/`。

## 同一组脚本，每个平台挂几个 { #hooks }

**问题**：会话开始、每轮提醒、派子代理三件事，各家宿主的 hook 支持得不一样，有的只有一两种事件。

**功能**：Python hook 只写一份，一张表登记每个平台实际挂哪几个，`trellis init` 和 `trellis update` 都照这张表分发：

```ts title="模版 · templates/shared-hooks/index.ts:95-149"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/index.ts:95:149"
```

表里是 11 个平台。另外 11 个平台不用这组 Python 脚本：

| 平台 | 怎么接 |
|---|---|
| Claude Code、Cursor、Codex、Gemini、Qoder、Copilot、CodeBuddy、Droid、Kiro、Trae、ZCode | 上表的 Python hook |
| OpenCode | 自己的 JS 插件 |
| Pi、Oh My Pi | 自己的 TypeScript 扩展 |
| Snow | 自己的 hook 配置 |
| Reasonix、Grok、Kimi Code | 只有子代理定义，子代理自己读上下文 |
| Kilo、Antigravity、Devin、[DeepSeek Harness](../deepseek-harness/index.md) | 不派子代理，主会话照 skill 做 |

有一个 hook 不在 Claude Code 上挂：Bash 执行之前递会话身份的那个。Claude Code 能在会话开始时把身份写进环境文件（见[会话开始](session.md#context-key)），别家没有这个口子，于是改在每条 shell 命令执行之前拦一下：

```python title="模版 · templates/shared-hooks/inject-shell-session-context.py:1-14"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-shell-session-context.py:1:14"
```

```text title="译文 · 文件头注释"
shell 之前的 hook：把宿主的会话身份递给 task.py。

调研过的平台没有一家会把 session id 导出给 shell 工具起的子进程，但每家支持 hook 的都会把它放在 hook 的 stdin 里。所以这个在 shell 命令执行之前触发的 hook，一看到将要执行的命令调用了 `task.py start/current/finish`，就写一张短时效的运行时票据；task 脚本拿不到原生的会话环境时，就消费这张票据。

挂在宿主提供的那个 shell 之前的事件上 —— Cursor 的 `beforeShellExecution`、Claude 式的 `PreToolUse`、Gemini 的 `BeforeTool` —— 所以这里唯一需要知道载荷差异的，是 `_pending_shell_command`。
```

## 输出格式各家不同，一份 JSON 写几种字段 { #output }

**问题**：同样是「往上下文里加一段」，Claude Code 认 `hookSpecificOutput.additionalContext`，Cursor 认顶层的 `additional_context`，Kiro 直接把 stdout 当上下文，Gemini 的每轮事件改了名。

**功能**：脚本先猜平台——看 hook 输入里的字段和环境变量里的项目目录变量，再看脚本自己装在 `.claude/`、`.cursor/` 哪个目录下——然后按平台调整输出。会话开始那段同时写两种字段，唯独 ZCode 两个都读、会重复注入，只写一种：

```python title="模版 · templates/shared-hooks/session-start.py:927-945"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/session-start.py:927:945"
```

每轮提醒：Kiro 输出纯文本；Gemini 的事件名写 `BeforeAgent`，其余写 `UserPromptSubmit`：

```python title="模版 · templates/shared-hooks/inject-workflow-state.py:462-484"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-workflow-state.py:462:484"
```

注入的文字各平台一样，变的只是外面那层壳。

## 没有会话开始 hook：用户输入 `/trellis:start` { #start }

**问题**：有的宿主能派子代理，却没有会话开始的事件，状态、流程摘要、spec 索引都进不了上下文。

**功能**：每个平台登记两个属性：能不能派子代理、有没有会话开始那类 hook。两样都有的不装 `start` 命令，其余都装，让用户开工时手动输入：

```ts title="模版 · configurators/shared.ts:391-399"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/configurators/shared.ts:391:399"
```

Claude Code 两样都有，所以只装 `/trellis:continue` 和 `/trellis:finish-work`。`start` 命令的正文是把 SessionStart 那段拆成几条命令，让模型自己跑：

```markdown title="模版 · templates/common/commands/start.md:1-59"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/common/commands/start.md:1:59"
```

```text title="译文 · /trellis:start（命令里的代码块只留命令名）"
# 开始会话

初始化一个由 Trellis 管理的开发会话。这个平台没有会话开始的 hook，所以按下面的步骤手动加载等价的精简上下文。

## 第 1 步：当前状态
身份、git 状态、当前任务、活动任务、日志位置。
运行 get_context.py。
如果输出里有一行以 `Trellis update available:` 开头，总结会话上下文时原样抄下整行。不要缩短操作命令的提示。

## 第 2 步：流程概览
精简的 Phase Index、请求分诊规则、规划产物约定，以及取步骤细节的命令。
运行 get_context.py --mode phase。
完整指南在 `.trellis/workflow.md`（按需读）。

## 第 3 步：规范索引
找出有哪些包和 spec 层，再读每个相关的索引文件。
运行 get_context.py --mode packages，读 .trellis/spec/guides/index.md，再读每个相关层的 .trellis/spec/<包>/<层>/index.md。
索引文件列出了真正开始写代码时要读的具体规范文档。

## 第 4 步：决定下一步
从第 1 步知道了当前任务和状态。看任务目录：
- 活动任务状态 `planning`、没有 `prd.md` → 阶段 1.1。加载 `trellis-brainstorm` skill。
- 活动任务状态 `planning`、有 `prd.md` → 留在阶段 1。轻量任务可以只有 PRD；复杂任务要 `design.md` + `implement.md`。`task.py start` 之前先加载对应的阶段 1 步骤细节。
- 活动任务状态 `in_progress` → 阶段 2 的 2.1 步。加载步骤细节：get_context.py --mode phase --step 2.1 --platform <平台>
- 没有活动任务 → 先分类。简单对话 / 小任务，只问这一轮要不要建 Trellis 任务。复杂工作，问能不能建 Trellis 任务并进入规划。用户说不，本次会话就不走 Trellis。

## skill 路由（速查）
| 用户意图 | skill |
| 新功能 / 需求不清 | trellis-brainstorm |
| 要开始写代码 | trellis-before-dev |
| 写完了 / 质量检查 | trellis-check |
| 卡住了 / 同一个 bug 修了好几次 | trellis-break-loop |
| 学到了值得记下的东西 | trellis-update-spec |

完整规则和反自我开脱表在 `.trellis/workflow.md`。
```

和 hook 注入比，差在两处：要用户记得输入，模型跑的命令输出未必和 hook 拼的完全一样。每轮提醒没有对应的命令：宿主没有每轮事件、也没有插件补上的，就少了这一层。

## 改不了子代理 prompt：在子代理定义里写「先自己读」 { #pull }

**问题**：有的宿主能派子代理，但 hook 改不了子代理收到的 prompt，[派子代理](subagent.md)那套内联用不上。

**功能**：写子代理定义时，在 implement 和 check 两个定义的开头插一段前置指令，让子代理一启动先自己把清单和任务产物读进来：

```ts title="模版 · configurators/shared.ts:618-648"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/configurators/shared.ts:618:648"
```

```text title="译文 · 插在子代理定义开头的那段（以 implement 为例）"
## 必须：先加载 Trellis 上下文

这个平台不会通过 hook 自动注入任务上下文。做任何事之前，你必须自己加载上下文。

### 第 1 步：找到活动任务的路径

按顺序试，哪一个先拿到任务路径就停：

1. **看主代理给你的派发 prompt**。如果第一行是 `Active task: <路径>`（比如 `Active task: .trellis/tasks/04-17-foo`），就用这个路径。在这类平台上，主代理必须带上这一行。
2. **运行** `python3 ./.trellis/scripts/task.py current --source`，读 `Current task:` 那一行。
3. **两个都不行**（prompt 里没有 `Active task:` 行，`task.py current` 也没返回任务），问用户做哪个任务；不要猜。

### 第 2 步：从这个路径加载任务上下文

1. 读 `<任务路径>/implement.jsonl` —— 和这个代理相关的 spec / 调研文件清单。
2. 清单里每一条，读它的 `file` 路径 —— 这些是你必须遵守的 spec 和调研笔记。
   **跳过没有 `"file"` 字段的行**（比如旧版 `task.py create` 留下的 `{"_example": "..."}` 占位行）。
3. 读任务的 `prd.md`（需求），有的话再读 `design.md`（技术设计）和 `implement.md`（执行计划）。

如果 `implement.jsonl` 没有整理过的条目（空的、只有占位行，或者文件不存在），就退回到：读任务产物，用 `python3 ./.trellis/scripts/get_context.py --mode packages` 列出可用的 spec，自己挑和任务领域匹配的。不要因为缺 jsonl 就卡住 —— 轻量任务可能只有 PRD，复杂任务可能还有 `design.md` 和 `implement.md`。

如果解析出的任务路径下没有 `prd.md`，问用户要做什么；没有上下文不要往下做。
```

内容和 hook 注入的一样，区别在谁去读：hook 那边是程序读好塞进来，这边是一段 prompt 求子代理自己读。research 不插这段，它本来就不依赖任务。

## 没有子代理：主会话先读规范再改 { #inline }

**问题**：有的宿主根本不能派子代理，实现和检查只能在主会话里做，也就没有一个「派发的时刻」可以拦。

**功能**：`workflow.md` 里同一个步骤按平台写两份，用 `[平台名, ...]` 和 `[/平台名, ...]` 包起来。`get_context.py --mode phase --step <X.Y> --platform <平台>` 取步骤细节时，只留包含这个平台的那一份。2.1 实现的 inline 版：

```markdown title="模版 · templates/trellis/workflow.md:529-537"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/trellis/workflow.md:529:537"
```

```text title="译文 · 2.1 的 inline 版"
1. 加载 `trellis-before-dev` skill，读项目规范
2. 读 `{TASK_DIR}/prd.md`，有的话再读 `design.md` 和 `implement.md`
3. 参考 `{TASK_DIR}/research/` 下的材料
4. 照评审过的产物实现代码
5. 运行项目的 lint 和类型检查
```

规划阶段的 1.3（整理清单）在这类平台上直接跳过；只装了这类平台的仓库，建任务时也不生成两个清单。规范改由 `trellis-before-dev` 在动手前读：

```markdown title="模版 · templates/common/skills/before-dev.md:1-46"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/common/skills/before-dev.md:1:46"
```

```text title="译文 · trellis-before-dev"
开始任务之前，先读相关的开发规范。

执行这些步骤：

1. **读当前任务的产物**：
   - `prd.md`：需求和验收标准
   - `design.md`（如有）：技术设计
   - `implement.md`（如有）：执行顺序和验证计划
2. **找出有哪些包和它们的 spec 层**：运行 get_context.py --mode packages
3. **判断哪些 spec 适用**于你的任务，依据：
   - 你在改哪个包（比如 `cli/`、`docs-site/`）
   - 是什么类型的活（后端、前端、单测、文档等）
   - 任务产物里引用到的 spec / 调研路径
4. **读每个相关模块的 spec 索引**：.trellis/spec/<包>/<层>/index.md。照索引里的 **「开发前检查清单」** 一节做。
5. **读开发前检查清单里列出的、和你的任务相关的具体规范文件**。索引不是目的 —— 它指向真正的规范文件（比如 `error-handling.md`、`conventions.md`、`mock-strategies.md`）。读这些文件，弄懂编码标准和模式。
6. **共用的指南一定要读**：.trellis/spec/guides/index.md
7. **不简单的任务，写代码之前先说清改动边界。** 不简单指：碰到不止一个文件、跨层、改公开接口，或者改的是你刚才没写的代码。写下：
   - 现在的行为和应有的行为之间最小的差距
   - 这个行为实际在哪里实现（不是哪里最容易拦截）
   - 你预计要改哪些文件，每个为什么必须改
   - 这次明确不做什么
   - 需要局部重构的话，你怎么证明它没改变行为
   小而范围清楚的改动不用这一步 —— 直接做。
   真实范围明显比这大的话，先说出来、说明原因再继续。不要自己扩大改动。
8. 弄懂需要遵守的编码标准和模式，然后照你的开发计划进行。

这一步在写任何代码之前都是**强制的**。
```

Codex 两种都能走：`.trellis/config.yaml` 的 `codex.dispatch_mode` 设成 `inline`，每轮提醒就换成带 `-inline` 后缀的那几段。

## skill 什么时候被加载：一张中央描述表 { #skills }

**问题**：skill 要靠描述被宿主匹配上，五个 skill 在每个平台都要写一份 frontmatter，各写各的，描述迟早不一样。

**功能**：描述只写在一张表里，写 SKILL.md 时由同一个函数包上 frontmatter；表里缺了某个 skill 的描述，生成时直接报错：

```ts title="模版 · configurators/shared.ts:239-256"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/configurators/shared.ts:239:256"
```

| skill | 描述（中译）——宿主拿它判断什么时候加载 |
|---|---|
| `start` | 初始化一个 AI 开发会话：从 `.trellis/` 读流程指南、开发者身份、git 状态、活动任务和项目规范。给进来的任务分类，路由到 brainstorm、直接改，或任务流程。开始新的编码会话、恢复工作、开新任务、重新建立项目上下文时用 |
| `continue` | 恢复当前任务的工作。加载流程的 Phase Index，判断该从哪个阶段 / 步骤接着做，再用 `get_context.py --mode phase` 拉那一步的细节。回到一个进行中的任务、需要知道下一步做什么时用 |
| `finish-work` | 收尾当前会话：确认质量关已过，提醒用户提交，归档已完成的任务，把会话进展记进开发者日志。写完代码、准备结束会话时用 |
| `before-dev` | 在实现开始之前，从 `.trellis/spec/` 找出并注入项目专属的编码规范。读目标包的 spec 索引、开发前检查清单和共用的思考指南。开始新的编码任务、写任何代码之前、切到另一个包、或需要刷新项目约定和标准时用 |
| `brainstorm` | 在实现之前引导协作式的需求发现。建任务目录、生成 PRD 初稿、一次问一个高价值问题、调研技术选型、收敛到 MVP 范围。需求不清、有多种可行方案、或用户描述一个新功能或复杂任务时用 |
| `check` | 全面的质量验证：spec 合规、lint、类型检查、测试、跨层数据流、代码复用和一致性检查。代码写完需要质量验证、提交之前、或在长会话里抓上下文漂移时用 |
| `break-loop` | 深度 bug 分析，打破「修 -> 忘 -> 再犯」的循环。分析根因类别、之前的修法为什么失败、防范机制，并把知识沉淀进 spec。修完一个 bug 之后用，防止同一类 bug |
| `update-spec` | 把能执行的契约和编码约定沉淀进 `.trellis/spec/` 文档。从调试、实现或讨论中学到值得留给以后会话的东西时用 |

所以 skill 有两条路被加载：模型自己按描述匹配，或者每轮提醒、会话开始里点了名。斜杠命令另有一张短描述表，只给命令面板显示用（`configurators/shared.ts` 第 281–286 行）。bundled skill（`trellis-session-insight`、`trellis-channel` 等）的描述写在各自的 SKILL.md 里，不走这张表。

## AGENTS.md 只占一块，升级按文件比对 { #agents-md }

**问题**：AGENTS.md、CLAUDE.md 这类文件用户自己也在写，工具往里加东西，不能把用户的内容冲掉；Trellis 自己升级时，用户改过的 `workflow.md` 也不能被悄悄覆盖。

**功能**：往根目录的 AGENTS.md 里只写一个带起止注释的托管块，块外的内容不碰：

```markdown title="模版 · templates/markdown/agents.md"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/markdown/agents.md"
```

```text title="译文 · AGENTS.md 托管块"
# Trellis 说明

这些说明给在本项目里工作的 AI 助手看。

本项目由 Trellis 管理。你需要的工作知识在 `.trellis/` 下：

- `.trellis/workflow.md` —— 开发阶段、什么时候建任务、skill 路由
- `.trellis/spec/` —— 按包和层划分的编码规范（在某一层写代码之前先读）
- `.trellis/workspace/` —— 每个开发者的日志和会话痕迹
- `.trellis/tasks/` —— 进行中和已归档的任务（PRD、调研、jsonl 上下文）

如果你的平台上有 Trellis 命令（比如 `/trellis:finish-work`、`/trellis:continue`），优先用命令，而不是手动执行步骤。不是每个平台都提供全部命令。

如果你用的是 Codex 或别的能派代理的工具，项目范围的辅助文件可能还在：
- `.agents/skills/` —— 可复用的 Trellis skill
- `.codex/agents/` —— 可选的自定义子代理

由 Trellis 管理。块外的编辑会保留；块内的编辑可能被以后的 `trellis update` 覆盖。
```

`trellis update` 按文件记模版的 hash：装上之后没改过的文件直接换成新版；改过的，逐个问用户是覆盖、跳过（默认），还是把新版另存成 `.new`。`workflow.md` 也走这条路，不按标签块局部合并——标签块外面的平台标记行同样被脚本解析，局部合并不安全。

## 谁管什么 { #who }

- **程序做死的**：每个平台挂哪几个 hook、装哪几个命令；输出格式按平台换壳；skill 描述只有一份；AGENTS.md 只写托管块；升级时按 hash 判断用户改没改过
- **留给模型的**：没 hook 的平台上照 `start` 命令和子代理前置指令自己读；inline 平台上动手前自己读规范、说清改动边界
- **留给用户的**：`trellis init` 时选平台；没 hook 的平台开工时输入 `/trellis:start`；升级时处理改过的文件；Codex 上选派子代理还是 inline
