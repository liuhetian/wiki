---
description: "wenai 粗讲的维护记录：上游版本和过滤范围、原文行号、构造示例与三次 DeepSeek 文件记忆对照，脚本和原始请求响应附后"
---

# wenai 粗讲的维护记录

这是 [wenai](../../projects/wenai/index.md) 背后的来源与实验记录。正文按用户要求写成一篇几千字的项目介绍，每个功能一个板块，保留原入口路径，不按细讲模板拆成多篇。

## 上游、版本与原文定位 { #sources }

- 上游作者 Straniero44，仓库见脚注[^upstream]。读取日期 2026-11-02，commit 为 `a9c49260b479aeef3d541e4afc6ebf1d492deef6`；这一个记录管理正文的全部原文行号。
- 该版本八个文件共 19,688 字节、564 行，Markdown 310 行，工作流 JSON 254 行，没有程序脚本。已读取全部文件。
- 该版本没有 LICENSE 文件，不推定为 MIT 或其他许可证；未整包复制仓库。正文以概括和过滤改写为主，原文只摘录一条中性的恢复要求。
- README 提到的推广支持来源是 LINUX DO[^linuxdo]，不将其视为功能实现来源。
- 上游没有 tag 或 release。11 次提交集中在 2026-08-25、08-31、09-03、09-17，批次间约 6、3、14 天。这是提交批次的间隔，不是发版周期。

| 正文主题 | 上游位置 | 对照内容 |
|---|---|---|
| 人格与流程分工 | `README.md` 的配置人格一节 | 人格由宿主配置，skill 管流程与档案 |
| prompt 阶段与读档案 | `SKILL.md:18–53` | 会话开始、每轮读取、发送后更新 |
| 档案与统计口径 | `SKILL.md:55–110`、四份 `assets/*.md` | 累计值、偏好、反应表、角色状态 |
| 每日记忆与恢复 | `SKILL.md:22`、`47`、`112–116` | 场景线、序号、消息标识、新会话接续 |
| 补记与压缩 | `SKILL.md:45–53` | 失败后读取实值补齐，压缩时核对未落盘项 |
| 生图与外观 | `SKILL.md:30–44`、`WORKFLOW.md`、工作流 JSON | 外观初始化、生成与投递分工、不识图校验的取舍 |
| 日常联动 | `SKILL.md:118–122` | 问候、约定跟进、统计查询 |
| 账号限制 | `SKILL.md:8–16`、`124–128` | 自然语言约束，没有认证实现 |

存档的 [upstream-memory-rule.txt](../../projects/wenai/assets/examples/upstream-memory-rule.txt) 逐字取自 `SKILL.md:115`，只保留这一行，没有改写。原仓库其余源码没有收进 assets；正文里的路径与行号均指上面记录的上游版本。

## 跳过了什么 { #omitted }

- 没有将原始主 skill 吸纳到背面，没有新建可直接执行的 wenai skill。
- 过滤会话破限、露骨互动指令、成人图片标签与成人行为分类；保留模块职责及状态管理的中性解释。
- 四份成人专用档案不逐字收录；用非露骨的偏好、反应、状态和活动累计示意结构，不把示意字段冒充上游字段。
- 不存档工作流 JSON、LoRA 配方、节点接入与安装说明；只介绍生图服务与宿主、状态记录之间的分工。
- README 不整篇复制，营销文案和完整安装流程不收；作者与推广支持来源记在本页。
- 不读取其他分支，不将历史提到但不在本次 main 树里的文件算作本次过滤内容。
- 未运行 OpenClaw、ComfyUI、图片生成或消息投递；没有测试真实画像更新、计数、补记、压缩回调、去重与定时提醒。

## 翻译之外的改动与示例来源 { #changes }

上游本来是中文，本次是概括与过滤改写。按用户后续要求，从概要（当时称粗讲）扩成同一入口下的几千字粗讲；正文不再沿用概要的 400 字限制。没有改动上游文件，也没有把过滤改写注册成本站 skill。

| 本站文件 | 性质与改动 |
|---|---|
| [prompt.txt](../../projects/wenai/assets/examples/prompt.txt) | 过滤后的流程骨架；改成非露骨陪伴，省略成人要求，非逐字原文 |
| [profiles.txt](../../projects/wenai/assets/examples/profiles.txt) | 全部构造；换了四份演示档案的名字、条目和数值，借用分类存储的思路 |
| [memory.txt](../../projects/wenai/assets/examples/memory.txt) | 全部构造；原项目没有交付此格式，标题、未完成约定、待补记标记由本文补充 |
| [ledger.txt](../../projects/wenai/assets/examples/ledger.txt) | 全部构造；演示发送与写入不一致的状态，不是上游事务日志实现 |

所有示例的书签、热茶、活动计数、日期、消息标识、图片序号均为虚构数据。正文把上游事实、原文摘录、本文手工示例与模型真实输出分别标明。

## DeepSeek 文件记忆对照 { #experiment }

实验按 [调用 DeepSeek](../../skills/agent-io/reference/deepseek.md) 走本站中转，接口字段参照官方 Chat Completions 文档[^deepseek]。脚本只依赖 Python 标准库，凭证通过既有 `.env` 的 `MY_API_KEY` 传入，不存到请求或响应文件里。

这不是从上游抠函数执行：上游没有聊天核心程序可导入。本文自写一个中性读书会的文件记忆展示脚本，仅说明文本状态经磁盘交接后如何影响新请求。没有将成人互动 prompt 发给模型。

- 模型请求使用 `deepseek-flash`，关闭 thinking，temperature 为 0，max_tokens 为 1200，JSON 输出；这些是本文实验设置，上游没有指定对应参数。
- 第一次请求提供读书会事实，模型返回面向用户的回复和 `memory_markdown`。宿主脚本将后者写到文件。
- 第二次请求使用全新 messages，不给首轮历史或记忆，只问如何接续。
- 第三次请求也使用全新 messages，由脚本实际读回首轮文件并附在输入中，再问相同问题。
- 三组使用相同 system：只按本次给定记录回答，缺少过去事实时先问清，不编造；因此“无记忆组提问”不算上游独有能力。
- 工具并未交给模型调用。实际写文件、读取文件和请求编排都是本站脚本执行，不能用此样本证明 Agent 会自觉保存状态。
- 没有执行任何上游程序或配置，持有密钥的进程只运行本站脚本。

| 请求 | 输入 token | 输出 token | 总 token |
|---|---:|---:|---:|
| 首轮生成记忆 | 242 | 173 | 415 |
| 新会话，无记忆 | 168 | 70 | 238 |
| 新会话，读回记忆 | 278 | 151 | 429 |
| 合计 | 688 | 394 | 1082 |

输入中 128 token 命中缓存，其余 560 未命中。用量取自 API 原始响应，不换算费用。

本样本中，无记忆组要求补充信息；带记忆组恢复散步、蓝色书签、不加糖的热茶和下一张序号 00008。脚本核对读回文本与写入文本相等，以及最终回答含这五项字符串。它不是多次采样的评测，也不代表跨天、多用户、并发和失败恢复的可靠性。

### 原始请求、响应与产物

| 请求 | 输入 | API 原始返回 | 提取的回复 |
|---|---|---|---|
| 首轮生成记忆 | [request](../../projects/wenai/assets/experiment/out/01-write.request.json) | [response](../../projects/wenai/assets/experiment/out/01-write.response.json) | [reply](../../projects/wenai/assets/experiment/out/01-write.reply.txt) |
| 无记忆的新会话 | [request](../../projects/wenai/assets/experiment/out/02-no-memory.request.json) | [response](../../projects/wenai/assets/experiment/out/02-no-memory.response.json) | [reply](../../projects/wenai/assets/experiment/out/02-no-memory.reply.txt) |
| 读回记忆的新会话 | [request](../../projects/wenai/assets/experiment/out/03-with-memory.request.json) | [response](../../projects/wenai/assets/experiment/out/03-with-memory.response.json) | [reply](../../projects/wenai/assets/experiment/out/03-with-memory.reply.txt) |

实际写入磁盘并读回的 [memory-2026-11-02.txt](../../projects/wenai/assets/experiment/out/memory-2026-11-02.txt)，以及[样本核对结果](../../projects/wenai/assets/experiment/out/checks.json) 一并保留。原始 API JSON 可能带提供商的运行标识，不含授权头或凭证。

### 重跑与脚本

在 wiki 仓库根目录用 shell 的 `. ./.env` 与 `set -a` 加载环境，再运行 `python3 docs/projects/wenai/assets/experiment/run.py`。脚本会发生三次付费请求，并覆盖自己的 out 目录中同名产物；要对比多次样本，先另存旧结果。当前存档是一轮运行的结果。

??? abstract "run.py：本文构造的记忆文件对照脚本"

    ```python
    --8<-- "projects/wenai/assets/experiment/run.py"
    ```

[^upstream]: [Straniero44/wenai](https://github.com/Straniero44/wenai/tree/a9c49260b479aeef3d541e4afc6ebf1d492deef6)，上游版本与获取日期见本页开头。
[^linuxdo]: [LINUX DO](https://linux.do)，上游 README 的致谢所列，2026-11-02 读。
[^deepseek]: [DeepSeek Chat Completions API](https://api-docs.deepseek.com/api/create-chat-completion/)，2026-11-02 读取；本次使用非流式 JSON 输出、关闭 thinking。
