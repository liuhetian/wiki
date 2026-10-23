---
description: "DeepSeek Harness 拆解：领域是 agent harness，以 pi 为 baseline，按插件、会话日志、拼 prompt、压缩、工具与沙箱、多 agent 六条线讲问题和功能，配源码模版和实跑；重心是请求从会话日志现算"
---

# DeepSeek Harness：请求每次从会话日志现算，连 agent 循环都是插件

## 摘要 { #abstract }

DeepSeek Harness（下称 dsh）是 DeepSeek 开源的 agent harness，即包在模型外面、把它变成 coding agent 的那层程序[^repo]。拿 pi 当 baseline：内核极小，扩展几乎什么都能改，包括逐请求改写上下文。这套做法在六处出毛病：内核换不掉，一个进程只有一套组合；事后重建不出模型看到了什么；摘要请求用不上前缀缓存；安全要么全放开、要么逐条确认；后台事件叫不醒 agent。dsh 按插件、会话日志、拼 prompt、压缩、工具与沙箱、多 agent 六条线回答。设计重心是一条规矩：请求每次从只追加的会话日志现算、算完冻结，插件只能往日志里追加事件，不能改单次请求。比如中途换 system prompt，也不改开头，而是在历史末尾追加一条，实测前缀缓存照样命中 17536 token。

## 关键词 { #keywords }

agent harness · 智能体框架 · agent 运行时（agent runtime）· coding agent · 插件架构（plugin architecture）· 事件溯源（event sourcing）· 前缀缓存（prefix caching / KV cache）· 上下文压缩（context compaction）· 沙箱（sandbox）· 子 agent（subagent）

## 术语 { #terms }

dsh 自造的词，各页换成了更直白的说法，只在引原话时保留一次。

| 词 | 出处 | 意思 |
|---|---|---|
| agent harness | 领域通用 | 包在模型外面、把它变成 agent 的程序 |
| 前缀缓存 | 领域通用 | provider 对和上次请求开头相同的部分不再重算，少收钱 |
| 可替换能力 | dsh 叫 seam | 定义、提供方、消费方三个角色，换提供方不动消费方 |
| profile、组合包 | dsh（profile、bundle） | 启动时按序叠加的几层配置 |
| agent 作用域 | dsh（scope） | 注册的可见范围和生命周期绑在一个 agent 上 |
| 模型视图、遮住 | dsh 叫 surface、shadowed | 日志里哪些事件进模型历史；被 replace 移出视图、仍留在日志里的叫遮住 |
| 结算记录 | dsh（settlement） | 每次模型调用落且只落一条记录 |
| 运行时上下文 | dsh（runtime context） | 工作目录、权限这类会变的事实，作为 user 消息发 |
| 历史内追加 | dsh（in-history） | system prompt 变了，在历史末尾追加一条新的，不改第 0 条 |
| 检查点 | dsh（checkpoint） | 压缩出来的 8 节英文摘要 |
| 落盘 | dsh（spill） | 大工具输出写进文件，模型只拿预览和路径 |
| 放宽申请 | 领域通用（escalation） | 被沙箱拒后，为同一条命令申请一次更宽的权限 |
| 插队、排下一轮、静默附带 | dsh（steer、followup、inject） | 收件箱的三种投递，前两种会唤醒 agent |
| 目标轮 | dsh（Goal Round） | 为同一会话目标自动续跑的一轮 |

## 引言 { #intro }

**领域是 agent harness**：包在模型外面的现成程序，管循环、工具、上下文、权限和持久化，产品形态是 coding agent。Claude Code、Codex CLI、OpenCode、pi 都是这一类。LangChain 属于另一个领域，它是写 LLM 应用的库，agent 要你在上面自己搭。dsh 本身是成品，带 Web UI、桌面端、CLI 和 Python SDK，默认接 DeepSeek 的 Anthropic 兼容接口；内部全拆成 Cordis 插件[^cordis]。

**baseline 是 pi**：

- **内核极小**：官网把不内置子 agent、权限弹窗、计划模式、后台 bash 写成卖点[^pi]
- **扩展几乎什么都能改**：每次请求前改写上下文、整段换掉 system prompt、改工具参数、替换已定稿的消息
- **上下文快满时**，另起一次摘要调用

dsh 反过来：连循环都是插件，但插件的权力更窄，只能往会话日志里追加事件，请求每次从日志现算。下面六条线各从一个具体毛病讲起，每条线另有一篇细讲，每一步贴源码模版和 dsh 代码真跑出来的效果。

### 一、插件：连 agent 循环都是插件 { #plugin }

1. 关掉一个插件，它装进来的工具、监听器得收干净 → **可逆注册**：每个注册都挂在插件上，卸载时框架逆序撤销
2. 本地 bash 换成沙箱版，模型看到的工具 schema 跟着变 → **可替换能力**：消费方只声明要什么，换提供方时自己重新激活
3. 后注册的 hook 能把前面的拒绝翻回来 → **拦截点是事件**：调用前只有四种决定，不能改参数；最后一层守卫只能否决
4. 启动器把组合写死，装个外部插件得改仓库 → **profile 是一叠 patch**：按 id 整行替换，agent 循环也只是一行
5. 一个进程里几个 agent，专属工具会漏给别人 → **agent 作用域**，再往上是 **agent 预设**：几套组合常驻同一进程

细讲：[插件](plugin.md) —— 卸载即撤销、换提供方、真跑 `--dump-config` 和一份用户 patch、作用域视图、两套预设并存

### 二、会话日志：模型看到的每个字都记账 { #log }

1. 扩展改写的上下文不落盘，事后重建不出模型看到了什么 → **只追加的事件日志**：模型视图只靠 append、replace 两种操作折出来
2. 允许改单次请求，日志就解释不了请求 → **请求是日志的纯函数**：先写日志、再派生、再冻结。实跑 6 个请求全部只凭日志重建一致
3. 失败没痕迹，取消把用户已读的半截也扔了 → **结算记录**：取消时留下半截文字，丢掉写了一半的工具调用
4. 进程死在工具执行中途 → **崩溃补齐**：已开始的标「结果未知，只读或幂等才重试」，没开始的标「可以重试」
5. 想换个走向、要格式升级 → **fork 复制前缀**（没有 pi 的会话树），**相邻迁移链**（新版本发布在旧文件旁边）

细讲：[会话日志](log.md) —— 四轮会话的完整日志、逐个重建请求、构造的崩溃现场、两种 fork 切法、v0 迁到 v4

### 三、拼 prompt：会变的都挪到缓存前缀后面 { #prompt }

1. 工具说明手抄进人设，抄本互相漂移 → **带序号的段**：工具说明归工具插件，Web 默认拼出 22 段、5632 字节
2. 权限写进 system，切一次缓存只剩 256 token；不写，只读模式下模型以为能写 → **运行时上下文**：每步一份 user 快照，声明取代旧快照，没变不发
3. AGENTS.md、skill 清单随工作区变，又是不可信文本 → **带框的 user 消息**：写明优先级，64 KB 预算，闭合标签转义
4. 进计划模式必须改 system prompt → **历史内追加**。实测改开头命中 0，追加命中 17536 token
5. 工具表也在缓存前缀里 → **计划模式不动工具表**，工具真增删写成增删块

细讲：[拼 prompt](prompt.md) —— 22 个段的主人、运行时上下文、AGENTS.md 预算取舍、改开头和追加的缓存实测、切换通知

### 四、压缩与补丁文本：压的时候也要命中缓存 { #compaction }

1. 回复要预留 25.6 万，按窗口 80% 算阈值会塞不下 → **扣掉预留和余量**：DeepSeek 默认 678,464 token 才压
2. 上下文常被几个大工具结果撑满 → **先裁后摘**：大结果只留头尾，裁完够了就不摘要
3. 摘要另起 system prompt，缓存全废 → **指令作最后一条 user 消息**。实跑 11,666 token 命中 11,136，按 pi 的格式发命中 0
4. 摘要可能被截断、比原文还长 → **拒收**，收下的用一条 user 消息 replace 掉被压的那段
5. AGENTS.md、运行时上下文被压进检查点 → **按模型视图补发**；另有重复调用提醒、超时、图片省略几种补丁文本

细讲：[压缩与补丁文本](compaction.md) —— 阈值、裁剪标记、压缩请求和对照组的缓存实测、两份真实检查点、拒收、补发

### 五、工具与安全边界：先关进沙箱再问 { #tools }

1. pi 不弹权限框，要么全放开，要么写扩展逐条确认 → **内核沙箱**：每次调用带自己的策略，没有后端就不跑；只管写
2. 被拒后没出路，运维只好全局放开 → **被拒才申请一次放宽**：提示写在被拒的结果里，批一次只管一次
3. 旧内核的一行无害提示，让 `false` 也被报成沙箱坏了 → **三种失败分开判**
4. 后注册的插件能把拒绝改回放行 → **守卫只能否决**，审批答不上来算拒
5. 只读会话里模型以为能写 → **权限记进日志再告诉模型**；另有先读后改、大输出落盘

细讲：[工具与安全边界](tools.md) —— 本机 Landlock 真拦写、九种放宽情形、新旧失败分类对照、七种拦截挂法、先读后改、落盘预览

### 六、多 agent 与长时工作：收件箱唤醒 { #agents }

1. pi 的插队、排队只给人打的字用，后台命令跑完没人叫醒 agent → **持久收件箱，三种投递**
2. 子 agent 出错或忘了汇报 → **结算通知**：结束时运行时一定发一条
3. 子 agent 请求开头和父会话差一个字节就全价重算 → **fork 守住前缀**。实跑 10,367 token 命中 9,856
4. 子 agent 冷恢复后深度从 0 算起 → **深度和权限在委派时定死**
5. agent 一轮就宣布完成 → **同会话目标**：只认目标轮，有上限；续跑开关只在进程内存里

细讲：[多 agent 与长时工作](agents.md) —— 收件箱折叠、结算通知、fork 与 spawn 的缓存实测、目标续跑、后台与定时任务

## 局限 { #limits }

只列设计上的取舍，项目自己认下的在前：

- **比 pi 窄**：项目自己列了 15 项 pi 能做、dsh 做不到的事[^pi-bridge]。头几条出自日志规矩：不能逐请求改写模型输入，不能改工具参数，日志是线性的、没有会话树
- **一处出错，所有会话一起倒**：插件都以 Host 进程的全部权限运行，一个未捕获的异常会拖垮整个应用（同一清单第 15 项）
- **压缩只有一个引擎**：`/compact` 不接受指令；摘要请求带着工具表，模型可能去调工具不写摘要，只能拒收兜底；压完后第一次请求只命中 256 token
- **历史内追加只在一个模型上**：只有 `deepseek-flash` 声明支持，每次追加完整的新 prompt
- **发布过的 prompt 文案改不得**：改了，持有旧段落的会话就得重写日志里的 prompt
- **沙箱只管写**：读和网络都放行；进程内文件围栏源码自认「不是安全边界」；`SAFETY.zh.md` 写明未审计
- **会话日志默认上传**：消息、工具参数和结果、工作区路径随请求发给 DeepSeek 端点或网关，可关[^upload]

## 结论：可以搬走的设计 { #takeaways }

- **请求从日志现算，算完冻结**：模型视图只有 append、replace 两种操作；可重建、fork、崩溃补齐、压缩不丢原文都是副产品
- **指引放 system，具体值放 user 快照**：路径、权限、时间每步一份完整快照，声明取代旧的，没变不发
- **system prompt 变了，往历史末尾追加**：provider 支持时，开头一个字节都不动
- **摘要是对话的延续**：原样回放上一个请求，指令放最后一条 user 消息；检查点固定节标题和语言，用一次 replace 拼回
- **注入物按「模型还看不看得见」对账**：被压掉就重发
- **先沙箱，被拒才升权**：放宽提示写在被拒的结果里；审批答不上来算拒
- **硬禁令写成只能否决的守卫**，可扩展的 waterfall 留给包装
- **一个收件箱接所有异步事件**：子 agent 交差、任务完成、定时到点都变成带来源的 user 消息
- **自动续跑的授权不落盘**：权限看消息来源，不看 prompt

[^repo]: [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)，MIT 许可，2026-10-20 读。
[^cordis]: Cordis 的设计见论文 [A Programming Paradigm for Spatiotemporal Composability](https://arxiv.org/abs/2608.25512)，dsh README 引用，2026-10-20 读。
[^pi]: pi 官网 [pi.dev](https://pi.dev)「What we didn't build」与「Primitives, not features」两节，和[扩展文档](https://pi.dev/docs/latest/extensions)，经 Context7 读取，2026-10-20 读。
[^pi-bridge]: dsh 的 [pi 扩展桥接提案](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/proposed/feature/2026-10-03-pi-extensions-bridge.zh.md)「比 Pi 窄的核心机制」一节，2026-10-20 读。
[^upload]: dsh 的[会话日志默认上传决策记录](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/implemented/architecture/2026-09-14-session-log-upload-default.zh.md)，2026-10-20 读。

<div class="zx-no-copy" markdown>

---

维护记录：[读的哪个版本、素材从哪来、实验怎么跑的](../../maintenance/projects/deepseek-harness.md)。正常阅读不用看。

</div>
