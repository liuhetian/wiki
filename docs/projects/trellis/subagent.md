---
description: "Trellis 派子代理：主会话调 Task/Agent 工具时，PreToolUse hook 改写子代理的 prompt，把 implement.jsonl 或 check.jsonl 列的 spec、调研和 prd/design/implement 原文内联进去，按 32/64/128 KB 降级；implement、check、finish、research 四套角色指令和子代理定义里的递归保护、没注入时自己读，附中译"
---

# 派子代理：hook 改写子代理的 prompt，把预选的规范原文塞进去

裸用时，主会话派子代理只写一段任务描述。子代理看不到主会话里聊过的需求，也不知道该照哪几份规范写；主会话要是在描述里转述需求，转述得又常常走样。Trellis 在主会话调 Task/Agent 工具的那一刻拦下调用，把子代理收到的 prompt 整段换掉：前面是规划时挑好的 spec、调研文件，以及 `prd.md`、`design.md`、`implement.md` 的原文，后面是这个角色的固定指令，主会话写的描述夹在中间。本篇只读了源码，没有实跑，每节贴源码模版和注入文字的中译；模版路径省略前缀 `packages/cli/src/templates/`。

## 在派发那一刻改写 prompt { #rewrite }

**问题**：主会话派 `trellis-implement` 去写「订单导出 CSV」，任务描述只有一句「按 PRD 实现导出接口」。子代理不知道 PRD 在哪，也不知道项目里错误怎么处理、日志怎么打。

**功能**：PreToolUse 对 `Task` 和 `Agent` 两个工具名各挂一次同一个脚本，两个名字都是派子代理的工具：

```json title="模版 · claude/settings.json:38-59"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/claude/settings.json:38:59"
```

脚本只认 `trellis-implement`、`trellis-check`、`trellis-research` 三种子代理，别的直接放行。按类型取上下文、拼新 prompt：

```python title="模版 · shared-hooks/inject-subagent-context.py:1156-1177"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-subagent-context.py:1156:1177"
```

再把新 prompt 塞回工具参数里，同时声明放行。为了几家平台都认，一份输出里写了三种字段：

```python title="模版 · shared-hooks/inject-subagent-context.py:1184-1212"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-subagent-context.py:1184:1212"
```

implement 和 check 必须有活动任务，没有就不改写；改写前还会再核一次任务路径确实在仓库或 `.trellis/` 里面，免得一个旧版本写下的越界指针把仓库外的文件读进 prompt。

## implement 拿到什么 { #implement }

**问题**：同上，子代理要的是规范的原文，不是一句「请遵守规范」。

**功能**：上下文按固定顺序拼：`implement.jsonl` 里的每个文件，然后是 `prd.md`、`design.md`、`implement.md`，缺的跳过。每个文件写成一个 `=== 路径 ===` 开头的块：

```python title="模版 · shared-hooks/inject-subagent-context.py:534-589"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-subagent-context.py:534:589"
```

拼好的上下文填进 implement 的模版：

```python title="模版 · shared-hooks/inject-subagent-context.py:649-681"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-subagent-context.py:649:681"
```

```text title="译文 · implement 子代理收到的 prompt"
<!-- trellis-hook-injected -->
# Implement 代理任务

你是多代理流水线里的 Implement 代理。

## 你的上下文

你需要的信息都已经替你准备好了：

=== .trellis/spec/backend/index.md ===
……（implement.jsonl 列的每个文件，原文）
=== .trellis/tasks/11-04-order-csv-export/prd.md (Requirements) ===
……（prd.md 原文）
=== .trellis/tasks/11-04-order-csv-export/design.md (Technical Design) ===
……（有才出现，implement.md 同理）

---

## 你的任务

<主会话写的派发描述，原样放在这里>

---

## 工作流程

1. **理解 spec** —— 所有开发 spec 都已注入在上面，读懂它们
2. **理解任务产物** —— 读需求，有技术设计和执行计划的也读
3. **实现功能** —— 照 spec 和任务产物实现
4. **自查** —— 对照检查 spec 确保代码质量

## 重要约束

- 不要执行 git commit，只改代码
- 遵守上面注入的所有开发 spec
- 完成后报告改动 / 新建了哪些文件
```

中间几个 `===` 块的路径套的是构造情境，块头格式照源码。第一行的 HTML 注释是给子代理看的标记，见[下文](#fallback)。

## check、finish、research 各一套指令 { #roles }

**问题**：检查和实现要的规范不一样，检查要的是质量清单；PR 前的最后一遍又和平时的检查不同，它要顺手把新约定写回 spec。

**功能**：check 读 `check.jsonl`，其余同 implement。主会话的派发描述里带 `[finish]` 字样时，check 换成 finish 那套指令，上下文不变。

```python title="模版 · shared-hooks/inject-subagent-context.py:684-716"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-subagent-context.py:684:716"
```

```text title="译文 · check 子代理收到的 prompt（上下文和任务两节同 implement，略）"
<!-- trellis-hook-injected -->
# Check 代理任务

你是多代理流水线里的 Check 代理（代码与跨层检查员）。

## 你的上下文

你需要的全部检查 spec 和开发 spec：
……

## 工作流程

1. **拿到改动** —— 运行 `git diff --name-only` 和 `git diff` 看代码改动
2. **对照 spec 检查** —— 对照上面的 spec 逐条检查
3. **自己修** —— 发现问题直接修，不要只报告
4. **跑验证** —— 运行项目的 lint 和 typecheck 命令

## 重要约束

- 问题自己修，不要只报告
- 必须走完检查 spec 里的整张清单
- 特别注意影响半径分析（L1-L5）
```

「影响半径分析（L1-L5）」在仓库里别处没有定义，模型只能自己理解。

```python title="模版 · shared-hooks/inject-subagent-context.py:719-758"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-subagent-context.py:719:758"
```

```text title="译文 · finish 的工作流程和约束（开头同 check，标题换成「Finish 代理任务：建 PR 之前做最后一遍检查」）"
## 工作流程

1. **看改动** —— 运行 `git diff --name-only` 看所有改过的文件
2. **核对任务产物** —— 核对 prd.md 里的需求，有 design.md / implement.md 的也核对
3. **同步 spec** —— 分析改动有没有引入新的模式、契约或约定
   - 发现新模式 / 新约定：读目标 spec 文件 → 更新它 → 需要时更新 index.md
   - 基础设施 / 跨层改动：照 update-spec.md 里那份必填 7 节的模版写
   - 只是修代码、没有新模式：跳过这一步
4. **跑最终检查** —— 执行 lint 和 typecheck
5. **确认就绪** —— 确保代码可以提 PR

## 重要约束

- 发现缺口时可以更新 spec 文件（以 update-spec.md 为指南）
- 改 spec 之前必须先读目标文件（免得重复已有内容）
- 小改动不更新 spec（错别字、格式、显而易见的修复）
- 发现严重的代码问题，清楚地报告出来（修 spec，不修代码）
- 核对 prd.md 里的每一条验收标准都已满足
- 有 design.md 和 implement.md 时，核对其中的约束
```

research 不要求有任务。它拿不到 PRD，拿到的是 `.trellis/spec/` 下有哪些包、每个包分哪几层的目录树，加上几条搜索提示：

```python title="模版 · shared-hooks/inject-subagent-context.py:808-865"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-subagent-context.py:808:865"
```

```text title="译文 · research 子代理收到的 prompt（项目信息、任务、工具表略）"
# Research 代理任务

你是多代理流水线里的 Research 代理（搜索研究员）。

## 核心原则

**你只做一件事：找到信息并解释清楚。**

你是记录者，不是评审者。

……

## 工作流程

1. **理解查询** —— 判断搜索类型（内部 / 外部）和范围
2. **规划搜索** —— 复杂的查询先列出搜索步骤
3. **执行搜索** —— 几个互不依赖的搜索并行执行
4. **整理结果** —— 输出结构化的报告

## 严格边界

**只允许**：描述有什么、在哪里、怎么工作

**禁止**（除非明确要求）：
- 提改进建议
- 批评实现
- 建议重构
- 修改任何文件

## 报告格式

给出结构化的搜索结果，包括：
- 找到的文件清单（带路径）
- 代码模式分析（如适用）
- 相关的 spec 文档
- 外部参考（如有）
```

这里和 research 子代理自己的定义有出入：hook 写「修改任何文件」都禁止，`trellis-research.md` 却要求它把每个调研主题写成 `{TASK_DIR}/research/<主题>.md`、回复里只报路径。两段同时进了子代理的上下文，靠模型自己调和。定义开头是这样写的：

```markdown title="模版 · claude/agents/trellis-research.md:1-15"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/claude/agents/trellis-research.md:1:15"
```

```text title="译文 · trellis-research 定义的开头"
描述：代码与技术搜索专家。找文件、模式和技术方案，并把每一条发现都**落盘**到当前任务的 research/ 目录。那个目录以外不改代码。

# Research 代理

你是 Trellis 工作流里的 Research 代理。

## 核心原则

**你只做一件事：找到、解释并落盘信息。**

对话会被压缩，文件不会。每一份调研产出都必须落成 `{TASK_DIR}/research/` 下的一个文件。只在聊天回复里返回发现就是失败 —— 调用方下个会话读不到。
```

## 喂哪些规范，规划时手挑 { #manifest }

**问题**：spec 目录下有十几份文件，全塞进去会撑爆上下文，一份不塞又等于没有。

**功能**：规划阶段的 1.3 步让主会话把这次要用的 spec 和调研文件挑出来，一行一个写进两个清单。只列规范和调研，不列代码：

```markdown title="模版 · trellis/workflow.md:392-437"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/trellis/workflow.md:392:437"
```

```text title="译文 · 1.3 的要点"
整理 `implement.jsonl` 和 `check.jsonl`，让阶段 2 的子代理拿到对的 spec / 调研上下文。
格式：每行一个 JSON 对象 —— {"file": "<路径>", "reason": "<为什么>"}。路径相对仓库根。
放什么：
- spec 文件 —— 和这次任务相关的 `.trellis/spec/<包>/<层>/index.md`，以及具体的规范文件（`error-handling.md`、`conventions.md` 等）
- 调研文件 —— 子代理需要参考的 `{TASK_DIR}/research/*.md`
不放什么：
- 代码文件（`src/**`、`packages/**/*.ts` 等）—— 子代理实现时自己读，不在这里预先登记
- 你正要改的文件 —— 同上
怎么分：
- `implement.jsonl` → implement 子代理写对代码需要的 spec + 调研
- `check.jsonl` → check 子代理需要的 spec（质量规范、检查约定，需要的话也放同样的调研）
这两个清单不代替 `implement.md`：`implement.md` 是给人看的执行计划，jsonl 只列要注入或加载的上下文文件。
开工关：`task.py start` 之前，两个文件都必须至少有一条真实的 {"file": ..., "reason": ...}。
```

这一步的文字说清单建时带一行 `_example` 占位，代码已经改成建空文件了（见[每轮提醒](breadcrumb.md#gate)），以代码为准。清单里也可以写目录，`{"file": "路径/", "type": "directory"}` 会读进目录下最多 20 个 `.md`。

Trellis 仓库自己就用这套流程开发，`.trellis/tasks/` 下留着真实的清单。一个改 Codex 默认派发方式的任务：

```json title="模版 · .trellis/tasks/07-23-codex-inline-default-agent-model/implement.jsonl"
--8<-- "projects/trellis/assets/trellis-src/.trellis/tasks/07-23-codex-inline-default-agent-model/implement.jsonl"
```

```json title="模版 · .trellis/tasks/07-23-codex-inline-default-agent-model/check.jsonl"
--8<-- "projects/trellis/assets/trellis-src/.trellis/tasks/07-23-codex-inline-default-agent-model/check.jsonl"
```

implement 拿两份规范，check 只拿 PRD——reason 写的是「逐条核对的验收标准」。check 的 PRD 本来就会作为任务产物再注入一次，这里等于让它进上下文两遍。

## 上下文太大就降级成路径 { #budget }

**问题**：某份 spec 有 80 KB，或者清单列了十几份文件，一股脑内联会把子代理的上下文先吃掉一大块。

**功能**：三道字节上限，可以在 `.trellis/config.yaml` 里改：清单里的单个文件 32 KB，任务产物（prd、design、implement）单个 64 KB，全部加起来 128 KB。

```python title="模版 · shared-hooks/inject-subagent-context.py:177-185"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-subagent-context.py:177:185"
```

单个文件超了就截断，末尾补一句；总量超了，后面的文件不再内联，只留一行路径和理由；二进制文件也只留一行：

```python title="模版 · shared-hooks/inject-subagent-context.py:316-333"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-subagent-context.py:316:333"
```

```text title="译文 · 三种降级提示"
[Trellis：在 32768 字节处截断 —— 完整内容读 <路径>]
[Trellis：未内联（已达上下文总上限）—— <路径>（<大小> 字节）：<理由>]
[Trellis：未内联（二进制文件）—— <路径>（<大小> 字节）：<理由>]
```

??? abstract "原文 · shared-hooks/inject-subagent-context.py:287-313"

    ```python
    --8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-subagent-context.py:287:313"
    ```

顺序决定谁先被降级：清单里的文件排在前面，`prd.md` 之后才是 `design.md` 和 `implement.md`。规范列多了，挤掉的是执行计划。

## 清单空了，子代理要知道 { #empty }

**问题**：清单空着时，脚本往 stderr 打的那行警告不进任何会话；子代理以为规范已经给齐，照着空气写代码。

**功能**：清单读不出任何条目时，把这件事写进子代理的 prompt：

```python title="模版 · shared-hooks/inject-subagent-context.py:483-507"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/shared-hooks/inject-subagent-context.py:483:507"
```

```text title="译文 · 清单为空时代替 spec 块的那段"
[Trellis] <任务目录>/implement.jsonl 没有整理过的条目，所以没有注入任何 spec / 调研上下文。开始之前，先读 .trellis/spec/ 下和你要改的代码相关的规范，并把下面的任务产物当成唯一准备好的上下文。
```

这和 `task.py start` 拒绝空清单是同一个问题的两头：start 那边拦住开工，这边兜住用 `--allow-empty-context` 硬开工或者半路清空的情况。

## 子代理别再派子代理，hook 没触发就自己读 { #fallback }

**问题**：会话开始和每轮提醒都在说「派 `trellis-implement`」。子代理也看得到这些话，照做就会再派一个自己，层层套娃。反过来，hook 有时根本不触发——Windows 上的 Claude Code、`--continue` 续上的会话、关了 hook——子代理拿到的只是主会话那一句描述。

**功能**：子代理自己的定义文件里写了两节，宿主启动子代理时作为它的系统提示加载：

```markdown title="模版 · claude/agents/trellis-implement.md:1-24"
--8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/claude/agents/trellis-implement.md:1:24"
```

```text title="译文 · trellis-implement 定义的前两节（trellis-check 同构，角色名互换）"
# Implement 代理

你是 Trellis 工作流里的 Implement 代理。

## 递归保护

你就是主会话派出来的那个 `trellis-implement` 子代理。直接做实现。

- 不要再派 `trellis-implement` 或 `trellis-check` 子代理。
- 如果 SessionStart 上下文、workflow-state 提醒或 workflow.md 说要派 `trellis-implement` / `trellis-check`，把它当成给主会话的指令，你现在这个角色已经满足了它。
- 只有主会话能派 Trellis 的 implement / check 代理。需要更多并行的活，就提出建议，不要自己派。

## Trellis 上下文加载协议

在上面的输入里找 `<!-- trellis-hook-injected -->` 标记。

- **有这个标记**：prd / spec / 调研文件已经替你自动加载在上面了。直接开始实现。
- **没有这个标记**：hook 注入没有触发（Windows + Claude Code、`--continue` 续会话、fork 分发、hook 被关掉等）。从派发 prompt 的第一行 `Active task: <路径>` 找到活动任务的路径，然后先读 `<任务路径>/implement.jsonl`、里面列的每个文件、`<任务路径>/prd.md`，有的话再读 `<任务路径>/design.md` 和 `<任务路径>/implement.md`，再开始干活。
```

??? abstract "原文 · claude/agents/trellis-check.md:1-24"

    ```markdown
    --8<-- "projects/trellis/assets/trellis-src/packages/cli/src/templates/claude/agents/trellis-check.md:1:24"
    ```

这就是每轮提醒里要求「派发 prompt 以 `Active task: <路径>` 开头」的原因：hook 正常时这一行用不上，hook 失灵时它是子代理唯一的线索。递归保护在每轮提醒的 in_progress 那段里也写了一遍（「子代理自我豁免」），两边都靠措辞，没有程序拦截子代理调 Task 工具。

## 谁管什么 { #who }

- **程序做死的**：派发那一刻改写 prompt；按角色选清单和指令模版；上下文的拼接顺序；三道字节上限和降级提示；清单为空时在 prompt 里明说；`[finish]` 标记切换指令
- **留给模型的**：规划时挑哪些 spec 进清单；写派发描述，第一行带任务路径；子代理守住不再派子代理；hook 没触发时照协议自己读
- **留给用户的**：spec 写得好不好；改字节上限；决定要不要用 `--allow-empty-context` 硬开工
