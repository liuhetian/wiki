---
description: "Trellis 拆解的维护记录：读的是 f089cb3（0.6.17，2026-11-04 读），AGPL-3.0 许可；源码存档和行号怎么对；以 Claude Code 为主讲；上游顶层模块的覆盖表；文档和代码对不上的几处；只读源码，没有实跑，构造情境和译文怎么标"
---

# Trellis 拆解的维护记录

这是 [Trellis](../../projects/trellis/index.md) 背后的事。正常阅读不用看，要对照上游更新、核对出处时再看。

## 版本和素材 { #sources }

- **上游**：[mindfold-ai/Trellis](https://github.com/mindfold-ai/Trellis)，Mindfold 出品，npm 包 `@mindfoldhq/trellis`，AGPL-3.0 许可，许可证原文不随附。官方文档站 docs.trytrellis.app 没读，README 只当线索
- **读的版本**：`main` 分支 `f089cb3`（2026-09-29 提交，包版本 0.6.17），2026-11-04 读。各页不逐处标版本，上游更新了再对照这一个点。读的时候 0.6.0（06-15）到 0.6.17（09-12）三个月发了 17 版，大约一周一版；0.7 的 beta 在 `feat/v0.7-beta` 分支上并行，没读；`main` 在 09-29 之后一个多月没有提交
- **体量**：仓库里纳入版本管理的文件 2571 个，`packages/` 下的 TypeScript 和 Python 不算测试约 5.4 万行，算上测试约 11 万行
- **源码存档**：`projects/trellis/assets/trellis-src/` 是细讲页引到的 27 个文件，逐字未改，路径和原仓库一致：四个共享 hook、hook 分发表、`workflow.md`、五个 skill、`start` 和 `finish-work` 两个命令、Claude Code 的 `settings.json` 和三个子代理定义、`trellis-session-insight` 的 SKILL.md、AGENTS.md 托管块模版、`configurators/shared.ts`、`task.py`、`task_store.py`、`add_session.py`；另有上游仓库自己 `.trellis/` 里的一个任务（两份清单和 `task.json`）和一份日志，当真实样本。`.md` 原件也存了，靠 `--8<--` 引用，会被建成没有入口的页面
- **行号**：模版标题里的 `路径:起-止` 是原仓库同版本的行号，存档逐字，两边一致；各页省略的前缀在页首写明
- **主讲平台**：hook、子代理定义、命令都以 Claude Code 为准；别的平台只在「多平台」一篇讲差别

## 覆盖表 { #coverage }

上游每个顶层模块的去处：

| 上游模块 | 去处 |
|---|---|
| `packages/cli/src/templates/shared-hooks/` | 会话开始、每轮提醒、派子代理三篇的主体；平台差别进多平台 |
| `packages/cli/src/templates/trellis/workflow.md` | 会话开始（Phase Index）、每轮提醒（标签块）、派子代理（1.3）、收尾（3.2–3.4）、多平台（平台标记块） |
| `packages/cli/src/templates/trellis/scripts/` | 每轮提醒（状态、开工门、默认 PRD）、收尾（日志格式）；`get_context.py` 只讲用法，`common/` 下的会话身份解析只讲结论 |
| `packages/cli/src/templates/common/skills/` | 每轮提醒（brainstorm）、收尾（check、update-spec、break-loop）、多平台（before-dev） |
| `packages/cli/src/templates/common/commands/` | 收尾（finish-work）、多平台（start）；`continue` 只在入口的时机表里 |
| `packages/cli/src/templates/common/bundled-skills/` | `trellis-session-insight` 进收尾；`trellis-channel`、`trellis-spec-bootstrap`、`trellis-meta` 入口各一段 |
| `packages/cli/src/templates/claude/` | 会话开始和每轮提醒（`settings.json`）、派子代理（三个子代理定义）；状态栏入口一句 |
| 其余 20 个 `packages/cli/src/templates/<平台>/` | 多平台一张表，不逐个拆 |
| `packages/cli/src/templates/markdown/` | AGENTS.md 托管块进多平台；spec 模版入口一句 |
| `packages/cli/src/configurators/` | 多平台：命令过滤、子代理前置指令、skill 描述表 |
| `packages/cli/src/commands/` | `update` 进多平台；`ablate` 进入口和会话开始各一句；`mem` 只讲用法；`channel` 入口一段；`init`、`uninstall`、`upgrade`、`workflow`（切换 workflow.md 模版）不收 |
| `packages/cli/src/migrations/` | 不收：149 份版本迁移清单，和注入什么无关 |
| `packages/core/` | `mem` 只讲用法、`channel` 入口一段，实现都没读 |
| 仓库根的 `.trellis/` | 一个任务的两份清单、一份日志当真实样本；上游自己的 spec 不收 |
| 仓库根的 `.claude/`、`.cursor/`、`.codex/`、`.agents/` 等 | 不收：是 `trellis init` 生成的副本，外加上游自己开发用的几个 skill |
| `docs-site/`、`marketplace/`、`drafts/`、`assets/` | 不收 |

## 跳过了什么 { #skipped }

- **背面不收**：Trellis 自带的 trellis-* skill、子代理、hook 不吸纳进本站的 Skills，本站也不部署 Trellis
- README 的 59 MB 演示 GIF、社区二维码、Star 历史图不收
- 每个平台的配置细节（各家的 settings 格式、插件和扩展的写法）、Codex 的 `SubagentStart` 原生注入、`codex-mode` 横幅只在多平台一篇点到
- `trellis channel` 的事件日志、worker 生命周期，`trellis mem` 的各家会话格式解析，`trellis-meta` 的定制文档，都没读实现
- 工作流细讲里没有盘问：用户给的要求是「不实际跑，细讲每个功能什么时候触发、插入什么样的 prompt（翻译为中文），直接开做」，领域、baseline 和五条功能线由主会话定，没有先出样章

## 文档和代码对不上的地方 { #mismatch }

正文都以代码为准：

- `workflow.md` 的 1.3 说 `task.py create` 往两个清单里各写一行 `_example` 占位；`task_store.py` 现在建的是空文件，注释写明占位行会被校验当成没整理完的脚手架
- `configurators/claude.ts` 的文件注释说 Claude Code 装 `start` 和 `finish-work` 两个命令；`filterCommands` 对既能派子代理又有 hook 的平台去掉了 `start`，实际装的是 `continue` 和 `finish-work`，上游仓库自己的 `.claude/commands/trellis/` 也是这样
- check 子代理的 prompt 要求「特别注意影响半径分析（L1-L5）」，整个仓库别处没有 L1-L5 的定义
- research 的 hook prompt 禁止「修改任何文件」，`trellis-research` 子代理定义却要求把每个调研主题写进 `{TASK_DIR}/research/`
- `[workflow-state:completed]` 那段是死代码，`workflow.md` 自己的注释写明了原因
- README 说工作日志让「每次新会话都能基于真实上下文开始」；SessionStart 只注入日志的路径和行数

## 翻译之外的改动 { #changes }

- **译文**：注入的固定文字照源码逐句译；标「略」「摘要」的是删节，删了哪段在标题或括号里写明。`/trellis:start` 的译文把代码块压成命令名。代码、路径、命令、标签名、字段名保留原文
- **构造情境**：订单后台的单仓库，用户要「给订单列表加一个导出 CSV 的按钮」，任务目录 `.trellis/tasks/11-04-order-csv-export`，开发者 `lin`。各页标「构造」的块都出自这个情境：块的顺序和固定句子照源码，分支名、行数、任务 id、问题内容是编的
- **会话开始的整段**：`<trellis-workflow>` 按 `_extract_range` 和 `_strip_breadcrumb_tag_blocks` 的规则手工摘出，取 `## Phase Index` 到 `## Phase 1: Plan` 之间的内容，去掉标签块、HTML 注释和平台标记行，没有跑那两个函数

## 实验设置 { #sim }

只读了源码，没有实跑：没装 Trellis，没跑 `trellis init`，没执行任何 hook 或脚本，没调任何模型，模型用量为零。各细讲页每节只贴源码模版和译文，不放效果块。

文中几处行为判断靠读代码推出，没跑过验证，上游更新后要重新对照：

- SessionStart 的 `<trellis-workflow>` 不按平台过滤，派子代理和 inline 两份路由清单同时注入；按平台过滤只发生在 `get_context.py --mode phase --step --platform`
- 子代理上下文的内联顺序是清单文件、`prd.md`、`design.md`、`implement.md`，总预算用完之后后面的都降级成一行路径
- `task.py start` 只查两个清单非空，不查 `design.md`、`implement.md`，也不查用户是否批准
- Claude Code 上没有挂在 Edit、Write 上的 hook，只有 `Task`、`Agent` 两个 PreToolUse matcher
- 每轮提醒的关键词 `no-trellis` 按词边界、不分大小写匹配，连字符算词内字符
