<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes/references/subagent-dispatch.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 子 agent 派发 —— harness 适配层

各个视频工作流（`product-launch-video` / `faceless-explainer` / `pr-to-video` / `motion-graphics` / `general-video`）用与 harness 无关的动词来描述子 agent 派发。本文件把这些动词映射到你当前所运行的 agent harness 的原语上。每次运行读一次，在第一次派发之前读；工作流里的其余一切（派发帧包、文件产物、退出码闸门、Resume 表）都与 harness 无关，无需转换。

## 契约（在每种 harness 上都相同）

- **DISPATCH(role_file, dispatch_context)** —— 启动一个子 agent，它的 prompt 是**所点名角色文件的完整内容**（构建器组装好的载荷，如 `.hyperframes/frame-packets/_role.md`，或工作流的 `sub-agents/<role>.md`），后面跟上工作流中的 `## Dispatch context` 块，**原样**复制（绝不消化或转述）。下面每种 harness 都接受任意任务文本，所以这在哪里都行得通；绝不要指望子 agent 能看到你的对话、记忆或 skill —— prompt 和磁盘上的文件就是它的全部世界。
- **并行扇出** —— 当某一步说"并行启动 N 个 worker"时，这些 worker 彼此独立（没有顺序，除文件系统外没有共享状态）。在 harness 允许的范围内尽可能多地并发运行。
- **WAIT** —— 一个步骤的完成标准永远是**预期的产物出现在磁盘上**（例如 `compositions/<scene-id>.html`），而绝不是 harness 的完成通知（有些 harness 只是尽力投递结果）。等待之后，核实产物；产物缺失就意味着那个子 agent 失败了 —— 用同样的 prompt 重新派发一次，之后仍失败再报错。

## 并发上限 → 分批规则（上限绝不改变范围）

harness 的并发限制**降低的是并行度，而不是工作量**：每个场景仍然都要构建，每次派发一个场景，由可用的槽位把整个列表逐一消化掉。

- 当 harness 会在内部把多出来的子 agent 排队时，**一次性提交全部 N 个**，让队列自己消化。
- harness 对活跃子 agent 有硬上限（例如 OpenClaw 的 `maxChildrenPerAgent`）→ **按上限大小分波**派发：启动 `cap` 个 worker，等它们的产物出来，再启动下一波，直到所有 N 个场景都存在。示例：在上限为 3 的 harness 上有 9 个场景 = 3 波，每波 3 个 —— 绝不丢场景，也绝不为了适应上限把多个场景合并给一个 worker。

## Harness 映射

当前 harness 有原生的委派和等待工具时就用它们。工作流契约保持不变：

- **DISPATCH** 把完整的角色文件和派发上下文发给一个 worker。
- **并行扇出** 在 harness 限制之内并发启动相互独立的 worker。
- **WAIT** 核实磁盘上预期的产物，而不仅仅是一条完成通知。
- **重新派发** 用同样的上下文加上闸门失败信息，启动一个全新的 worker。

当原生委派不可用时，使用现有的回退阶梯：启动共享项目文件系统的无头 CLI worker，再不行就回退到内联串行执行。

在 Codex 上，原生委派需要用户的明确许可。在派发之前，把一行请求并入工作流中第一个已有的用户暂停点；`AGENTS.md` 或启动 prompt 里的长期授权也算数。没有许可时，使用回退阶梯，而不是悄悄跳过工作。

## 词汇映射

- 要求"在后台"做的工作，意味着在 harness 支持时并发派发。
- 通过 harness 的 skill 机制加载点名的 skill，或者直接读 `<skills-root>/<skill>/SKILL.md`。
- 把通用的读、写、编辑和 shell 动词映射到当前 harness 的对应工具上。
