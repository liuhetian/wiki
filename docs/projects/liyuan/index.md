---
description: "梨园 Liyuan 拆解：它不是带 system prompt 的聊天网页，而是把 pi 这个 coding agent 改成演角色扮演的 agent；正文用工具写在稿纸上，收笔后另一个模型记账；设计重心是 harness 该替模型管多少；六个方向各一页细讲，末尾略讲读到的缺陷"
---

# 梨园 Liyuan：把 coding agent 改成演戏的 agent

<figure markdown>
  ![梨园主界面：左栏角色卡库，中间是最近会话，顶栏有「扮演 / 工作」两种模式，底部是世界状态条和输入框](assets/home.png)
  <figcaption>主界面，取自梨园 README[^shots]</figcaption>
</figure>

它不是「一段 system prompt 加一个聊天框」——它把 pi 这个 coding agent 整个搬进仓库，改成演角色扮演的 agent，还能直接吃酒馆（SillyTavern）的卡和预设。用户说一句，模型演一拍：先调工具查世界书和记忆，再把正文写在稿纸上，可以定点改、可以回头改上一拍，最后收笔。

程序管拼装和存档：每拍现拼 system、扫关键词、把账本和前情提要存进 pi 的会话树、到点压缩。模型管判断：查不查、写多长、哪里该停下来用 `ask` 把岔口交给用户。收笔后还有第二个模型当「场记」，记下时间、地点、谁在场、谁拿着什么，合并规则由程序写死。

重心是「harness 该替模型管多少」。8 月作者给模型加了轮次卡和门禁，结果「摄像机」的「像」被当成比喻，模型连修 9 轮；8/10 立铁律，不许再加提示词、注入点和名单，9/08 把生成循环交还 pi。现在模型每拍看到的只有数据块和工具。

## 六个方向细讲 { #directions }

- [harness 越管越差，作者把权一层层还给模型](harness.md) —— 8 月的轮次卡、门禁、受理门怎么加上又拆掉，8/10 铁律、9/08 和 10/15 两次回归 pi，现在模型每拍看到什么、程序替它做什么
- [记账不归主演，归收笔后的第二个模型](scribe.md) —— 场记旁路调用出 JSON patch、程序按规则合并、账本作为条目存进会话树，所以 swipe、回档、世界线天然对得上；剧情压缩为什么不用 pi 自带的
- [跨局记忆照搬 Codex：复盘、合并、按来源遗忘](memory.md) —— 一张卡演过的每一局写成复盘，合并成手册和每拍注入的常驻摘要；删掉一局就该忘掉只由它支撑的事，但删项目这条路漏了
- [酒馆的预设被拆开发放，卡前端靠垫片照跑](tavern.md) —— 预设为什么不能原样拼进 prompt，旁路模型怎么给每段贴七类标签再分流；卡里的 jQuery、状态栏、MVU 怎么在 iframe 里跑；世界书为什么开思考只给标题
- [写小说时正文是文件，沙箱只是一个钩子](agent-mode.md) —— agent 模式一章一个 `.md`、轮末存内容寻址的检查点；工作模式里模型能改卡和跑 bash，越界靠 `tool_call` 钩子拦，60 本世界书被脚本删掉之后补了三刀
- [铁律是写给 AI 助手的：作者怎么用 Claude 开发梨园](ai-dev.md) —— CLAUDE.md 立规矩防 AI 打补丁、先只读后动手、读模型思考记录调 RP 行为、PLAN 和 FINDINGS 按刀切分、被否决的 AI 建议记在案

## 读到的缺陷 { #defects }

- **删项目不触发遗忘**：`server/main.ts:2106` 先删掉清单里这一局的记录，`src/card-memory.ts:352` 却靠这条记录认出「删除」，于是遗忘队列为空，`记忆.md` 和每拍注入的 `常驻摘要.md` 一字不动；README 写的「删除对话同步触发事实的物理遗忘」与代码不符，做对了这件事的 `forgetChatRecap`（`src/card-memory.ts:610`）没有调用方。详见[跨局记忆](memory.md#defect)
- **完整备份不含 `cards/`**：改成「卡＝工作空间」后会话、世界状态、记忆都住在 `cards/<卡>/` 下，`src/backup.ts:56` 的范围里没有它；作者在 `docs/PLAN-CARD-SPACE.md:124` 记了待办
- **README 说世界书「不占常驻窗口」**：蓝灯条目照样常驻，有卡档案时镜像成条目，没有就进 system 的「世界设定」段（`src/stage/assemble.ts:354`）
- **几处残留**：`waitForScribe` 等的 `scribeBusy` 全仓只被赋过 `false`（`.liyuan/extensions/roleplay.ts:208`），是空等；`MAX_LOOKUPS` 没人引用，注释还写着「封顶」

[^shots]: 截图取自 [weidu12123/Liyuan](https://github.com/weidu12123/Liyuan/tree/1e9448e2057dd99baa57642f4383aca9a8b9b9ce/docs/images) 的 `docs/images/`，钉 `1e9448e`（2026-10-16），2026-10-19 读。本节其余各页的文件路径和行号都相对这个 commit 的仓库根。
