---
description: "细讲：Trellis 拆解：领域是 AI 编码工作流框架，以裸用 Claude Code 加一份 CLAUDE.md 为 baseline，按会话开始、每轮提醒、派子代理、收尾沉淀、多平台五条线讲每个功能什么时候触发、注入什么 prompt，附中译；重心是 hook 按任务状态现拼提示，状态只由脚本改"
---

# Trellis：规范和任务落成仓库里的文件，hook 在固定时机按状态拼给 agent

## 摘要 { #abstract }

Trellis 是 Mindfold 开源的 AI 编码工作流框架[^repo]：一个 npm 命令行，往仓库里生成 `.trellis/` 目录和各家 coding agent 认的 hook、skill、子代理、命令文件。baseline 是裸用 Claude Code、只靠一份 CLAUDE.md：每次会话从零开始，规矩越写越长，一句「开干」就动手，子代理拿不到需求，踩过的坑下次再踩。Trellis 按会话开始、每轮提醒、派子代理、收尾沉淀、多平台五条线回答。设计重心是让提示词按任务状态现拼，不靠模型记住：会话开始注入状态和下一步；每条用户消息附一段从 `workflow.md` 取出的、对应当前状态的规矩；派子代理时，把规划阶段挑好的 spec 和 `prd.md` 原文内联进子代理的 prompt。状态只记在 `task.json` 里，只经 `task.py` 改，唯一由程序把守的门是开工前两份上下文清单不能空。

## 关键词 { #keywords }

AI 编码工作流（AI coding workflow）· coding agent harness · 规格驱动开发（spec-driven development）· 上下文工程（context engineering）· hook · 子代理（sub-agent）· skill · 斜杠命令（slash command）· 项目记忆（project memory）

## 术语 { #terms }

Trellis 自造的词，各页换成了更直白的说法，只在引原话时保留一次。

| 词 | 出处 | 意思 |
|---|---|---|
| spec | Trellis 的用法 | `.trellis/spec/<包>/<层>/` 下的项目编码规范，每层一个 `index.md` 当入口；和「规格驱动开发」里的需求规格不是一回事 |
| code-spec | Trellis | 写到签名、字段、错误矩阵、测试断言这一层，能照着执行的规范 |
| 任务 | Trellis（task） | `.trellis/tasks/月-日-名字/` 一个目录：`task.json` 记状态，另有 `prd.md`、`design.md`、`implement.md`、`research/` |
| 每轮提醒 | Trellis（breadcrumb、workflow-state） | 每条用户消息附带的 `<workflow-state>` 块，按状态取自 `workflow.md` |
| 上下文清单 | Trellis（context manifest） | `implement.jsonl`、`check.jsonl`，列出给子代理内联的 spec 和调研文件 |
| 工作日志 | Trellis（journal） | `.trellis/workspace/<开发者>/journal-N.md`，一次收尾写一条 |
| 会话身份 | Trellis（context key） | 由宿主的 session id 算出的键，每个会话各有一个「当前任务」指针 |
| hook | 领域通用 | 宿主在固定事件上调用的外部命令；输出能加进上下文，或改写工具参数 |
| 子代理 | 领域通用（sub-agent） | 主会话派出去、带自己系统提示的另一个 agent |
| skill | 领域通用 | 带描述的说明文件，宿主或模型按描述匹配后把正文载入上下文 |
| hook 注入、自己拉取、inline | Trellis（class-1、class-2、inline） | 平台的三档：程序把上下文塞给子代理；子代理照指令自己读；不派子代理，主会话自己干 |

## 引言 { #intro }

**领域是 coding agent 外面的工作流层**：不造 agent，而是给 Claude Code、Cursor、Codex 这类现成的 agent 加一套项目级的规矩——什么时候规划、照哪份规范写、怎么检查、学到的东西写回哪里。本站的[超级轻量的自用 AI 编程 Harness 框架](../../posts/ai-code-skeleton/index.md)把 superpowers、OpenSpec、Trellis 列为同类，并问过：这些插件自带的命令、脚本、hooks 是必要的吗？各篇末尾的「谁管什么」就是 Trellis 这一家的答案。

**baseline 是裸用 Claude Code 加一份 CLAUDE.md**。Trellis 的 README 自己拿它对照：这些文件「本身是有用的入口，但容易在长期使用中变得冗长臃肿」[^readme]。这样用会出这几种毛病：

- 新会话、`/clear`、压缩之后，模型不知道项目规矩，也不知道上次做到哪
- 规矩说过一遍，二十轮之后就不照着做了；用户一句「直接开干」，它马上写代码
- 派出去的子代理看不到需求，也不知道该读哪份规范
- 这次踩的坑只留在对话里，下次照样踩
- 换一个 coding agent，所有规矩重写一遍

Trellis 的回答是一串固定的触发时机。下表就是全书的骨架：每一行什么时候触发、谁触发、往上下文里放什么。

| 时机 | 谁触发 | 放进上下文的 | 细讲 |
|---|---|---|---|
| 新开会话、`/clear`、压缩之后 | 宿主的 SessionStart hook | 当前状态、Phase Index 摘要、spec 索引路径、下一步、「第一句先确认已加载」 | [会话开始](session.md) |
| 每条用户消息 | 宿主的 UserPromptSubmit hook | `<workflow-state>`：任务、状态、该状态的那段规矩；带 `no-trellis` 就跳过 | [每轮提醒](breadcrumb.md) |
| 主会话调 Task/Agent 派子代理 | 宿主的 PreToolUse hook | 改写子代理的 prompt：清单里的 spec 和调研、`prd.md` 等原文、角色指令 | [派子代理](subagent.md) |
| 子代理启动 | 宿主加载子代理定义 | 递归保护；hook 没触发时自己读的规矩 | [派子代理](subagent.md#fallback) |
| 模型觉得该用了 | 宿主按描述匹配 skill | brainstorm、before-dev、check、update-spec、break-loop、session-insight 的正文 | 各篇，描述表见[多平台](platforms.md#skills) |
| 模型跑脚本 | `task.py`、`get_context.py` | 步骤细节；开工被拒时的报错 | [每轮提醒](breadcrumb.md#gate) |
| 用户输入 | `/trellis:continue`、`/trellis:finish-work`，没 hook 的平台还有 `/trellis:start` | 命令正文 | [收尾](finish.md#finish-work)、[多平台](platforms.md#start) |

下面五条线各从一个具体毛病讲起，每条线另有一篇细讲。各篇贴源码模版，注入的文字都附中译；只读了源码，没有实跑。

### 一、会话开始：只给状态、索引和下一步 { #session }

1. 新开、`/clear`、压缩之后都是一片空白 → **三个时机挂同一个脚本**
2. 规矩全塞进开头，越来越长 → **只注入 Phase Index 和 spec 索引路径**，细节用 `get_context.py --step` 按需拉
3. 模型知道当前任务，不知道从哪一步接 → **Next-Action 由状态和产物算出**：planning 没 PRD 就去 brainstorm，产物齐了就请用户评审
4. hook 生没生效、要不要升级，用户都看不见 → **第一句回复先确认已加载**，更新提示顺着这句说出来
5. 两个窗口各做各的任务，Bash 里的 `task.py` 分不清自己属于哪个会话 → **会话身份写进环境文件**，每个会话一个当前任务指针

细讲：[会话开始](session.md) —— 七个块逐块说明，附新会话时注入的整段中译

### 二、每轮提醒与规划关卡：按状态取一段规矩 { #breadcrumb }

1. 二十轮之后规矩就淡了 → **每条用户消息附一段 `<workflow-state>`**
2. 规划和实现要提醒的事不一样 → **按状态分段**，写在 `workflow.md` 的标签块里
3. 提醒写死在脚本里会和文档漂移，必做步骤漏写就被跳过 → **唯一来源加一条回归测试**：每个必做步骤都要在提醒里出现
4. 「开干」被当成批准 → **两道同意分开算**：同意建任务不等于同意开工
5. 一口气问十个问题，一半自己 grep 就知道 → **一次一个问题，代码能答的不问**，附推荐和取舍
6. 模型自己宣布规划完了，子代理零规范开工 → **状态只经 `task.py` 改，start 前清单不能空**
7. 只是顺口一问，不想进流程 → **关键词 `no-trellis` 跳过这一轮**

细讲：[每轮提醒](breadcrumb.md) —— 各状态的正文中译、brainstorm 的契约与提问规则、开工门

### 三、派子代理：改写子代理的 prompt { #subagent }

1. 子代理看不到需求 → **派发那一刻由 hook 改写 prompt**
2. 规范要原文，不要一句「请遵守」→ **清单文件和任务产物按序内联**
3. 检查、PR 前的最后一遍、调研要的指令不同 → **四套角色模版**，`[finish]` 字样切换
4. 规范十几份，全塞会爆 → **规划时手挑进清单**，只列规范和调研，不列代码
5. 单个文件太大、总量太大 → **32 KB / 64 KB / 128 KB 三道上限**，超了降级成一行路径
6. 清单空着，子代理以为规范给齐了 → **把「没注入」写进 prompt**
7. 子代理照着提醒再派自己，hook 不触发时什么都拿不到 → **递归保护和「没标记就自己读」**写进子代理定义

细讲：[派子代理](subagent.md) —— 四套指令的中译、Trellis 仓库自己的真实清单、降级提示

### 四、收尾与沉淀：检查、写回、提交、记日志 { #finish }

1. 跑通一次就说完成 → **检查清单**：范围纪律一节专查顺手重构和揣测的兜底，最后一遍全范围
2. 学到的坑只留在对话里 → **每个任务必过一次 update-spec**，接口和跨层改动写满七节 code-spec
3. 同一个 bug 修了三次 → **break-loop 五维复盘**
4. 用户手边的半成品被一起提交 → **提交分两组**：本会话改的、不认识的，一次确认，不 amend 不 push
5. 明天接不上今天 → **`/trellis:finish-work` 归档并写一条日志**
6. 「上次怎么解的」→ **`trellis mem` 直接翻宿主的会话记录**，按建任务、开工两条命令切段

细讲：[收尾与沉淀](finish.md) —— 各 skill 和命令的中译、一条真实日志

### 五、一套文件喂 22 个平台 { #platforms }

1. 各家 hook 事件不同 → **一组 Python 脚本，一张表登记每个平台挂哪几个**
2. 输出格式不同 → **同一段文字按平台换壳**
3. 没有会话开始 hook → **`/trellis:start` 让模型自己跑那几条命令**
4. hook 改不了子代理的 prompt → **在子代理定义开头写「先自己读清单」**
5. 根本没有子代理 → **inline：主会话照 before-dev 先读规范、说清改动边界**
6. skill 描述各写一份会漂 → **一张中央描述表**
7. AGENTS.md 用户也在写，升级不能冲掉改动 → **只写托管块，升级按 hash 比对**

细讲：[多平台](platforms.md) —— 22 个平台的接法、三档的差别、八个 skill 描述的中译

## 其余模块 { #others }

几个模块不开线，在这里各说一段：

- **`trellis channel`**：本地的多 agent 协作运行时，agent 之间通过一个持久的事件日志对话，可以把 implement、check 当成独立进程派出去，也能开论坛式的频道记反馈；由 bundled skill `trellis-channel` 在用户说「和 codex 讨论一下」「派一个 worker」时载入。和主线的 hook 注入无关，用到时再看
- **`trellis-spec-bootstrap`**：spec 的初稿让 AI 照着现有代码写，再由人收紧关键规则；模版里带的 spec 都是写着「To fill」的空壳
- **`trellis-meta`**：教 AI 改 Trellis 自己的本地结构，给想定制的人用
- **`trellis ablate` / `restore`**：临时移走 Trellis 管理的全部文件、按字节还原，用来比较有无 Trellis 的差别
- **状态栏**：Claude Code 的 statusLine 脚本，默认不装，`trellis init --with-statusline` 才装

## 局限 { #limits }

只列设计上的取舍：

- **门大多是 prompt**：程序只把守一道门——`task.py start` 拒绝空清单。「复杂任务先写 design 和 implement」「用户批准之后才开工」「子代理别再派子代理」都只靠提醒和 skill 的措辞；Trellis 没在 Edit、Write 上挂 hook，模型要直接改代码，没有东西拦它
- **日志写了不读回**：会话开始只注入日志的路径和行数；README 说新会话「基于真实上下文开始」，代码层面就是这一行路径，读不读正文由模型决定
- **每轮都有固定开销**：每条用户消息都附一段提醒，实现阶段那段四行都很长；不想要只能每次写 `no-trellis`
- **效果取决于 spec 写得多好**：模版 spec 是空壳；清单要模型在规划时手挑，挑漏了，子代理就照不全的规范写
- **子代理的上下文是预选的**：清单只列规范和调研、不列代码，128 KB 之后降级成路径；顺序排在后面的执行计划最先被挤掉
- **没 hook 的平台退回 prompt**：同一件事从程序注入变成「请你自己去读」，靠模型自觉
- **提交分组靠模型的记忆**：哪些文件是本会话改的，程序不记录

## 结论：可以搬走的设计 { #takeaways }

- **状态写文件，提示词按状态现取**：`task.json` 的一个字段决定每轮注入哪段；状态只经脚本改，模型说了不算
- **一段规矩只存一处，测试守着必做步骤**：提醒正文写在流程文档的标签块里，hook 只解析；回归测试检查每个必做步骤都在提醒里出现
- **会话开始只给索引，细节按需拉**：流程摘要加规范索引路径，某一步的细节用一条命令取
- **派子代理时改写它的 prompt**：把预先挑好的规范原文内联，超预算降级成路径；留一个标记，没标记时子代理按第一行的任务路径自己读
- **唯一的硬门放在状态切换上**：开工前检查给子代理的上下文不为空，空了就把这件事写进 prompt
- **要用户看见的提醒，让模型第一句说出来**：不要指望它从上下文里转述
- **提交分「本会话改的」和「不认识的」两组**，一次确认，否定了分组就转手动

[^repo]: [mindfold-ai/Trellis](https://github.com/mindfold-ai/Trellis)，AGPL-3.0 许可，2026-11-04 读。
[^readme]: Trellis [README_CN.md](https://github.com/mindfold-ai/Trellis/blob/f089cb3286071199e84118dee86b6d76aab032f1/README_CN.md)「常见问题」第一条，2026-11-04 读。

<div class="zx-no-copy" markdown>

---

维护记录：[读的哪个版本、素材从哪来、哪些没收](../../maintenance/projects/trellis.md)。正常阅读不用看。

</div>
