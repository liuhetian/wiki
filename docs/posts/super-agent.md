---
description: "Super-agent 论文笔记：多任务卡在人的注意力，把会话交给系统管；Router 只派活、Worker 只干活，事件按话题直通，存算分离、Watchdog 撑常驻；比主 agent 带 subagent，派的是任务、不干活由结构定"
---

# Super-agent：多任务卡在人的注意力，就把会话交给系统管

DeepSeek Harness 团队 2026-10-31 发了一篇架构探讨[^paper]。它的判断是：单任务 agent 越来越不用人盯，瓶颈转到了人身上 —— 一个人同时只跟得住 3 到 5 个活跃会话，多任务的上限由人的注意力定。解法是让会话退成系统的实现细节：用户在 IM、GitHub 里面对的始终是同一个 agent，底下由系统分派、并发、续命。全文没有新理论，五个模块都借自计算机系统的老办法。本页按「毛病 → 模块」压缩，单开一节回答[它和主 agent 带 subagent 差在哪](#vs-subagent)，最后和本站拆过的 [DeepSeek Harness](../projects/deepseek-harness/index.md) 对照哪些是现成底座。

<figure markdown>
![Super-agent 整体架构：Router 层、Worker 层、事件过滤与路由、云端存算分离、端侧 daemon 和 Watchdog](assets/super-agent/03.jpg)
<figcaption>整体架构，标号 [2]–[6] 对应原文第 2–6 节</figcaption>
</figure>

## 单会话撑不起「一直在线」：四个特征、五个模块 { #why }

原文要的 agent 有四个特征，单个 ReAct Loop 一个都给不全：

| 特征 | 单会话的毛病 | 模块 | 借的系统思想 |
|---|---|---|---|
| **连续**：IM 里定方案 A、PR 评论改成 B，它都接得上 | 每个会话各管各的上下文，人得记哪件事在哪个会话 | [双层架构](#two-layer) | 全局序点 |
| **高效**：不等上一件做完就接下一件 | 一个循环串行，工具一跑就阻塞 | 双层架构、[全双工](#duplex) | 批处理、异步 |
| **主动**：没人 @ 也推进值得做的事 | 只等人敲提示词 | [事件驱动](#events) | Fast/Slow Path、按局部性管 Cache、投机执行 |
| **持久**：设备休眠、模型跑偏都能自己恢复 | 计算、状态、环境绑在一台机器上 | [存算分离](#separation)、[Watchdog](#watchdog) | 存算分离、外部 Control Loop |

在 CLI、MCP 上给单会话 agent 接外部消息不够 —— 同步阻塞、多任务上下文混在一起、本机一离线就停，都得人来维护。下面两张是团队内部实例的样子：

<div class="grid" markdown>
<figure markdown>
![同一个开发任务在 IM 群聊和 GitHub Pull Request 评审之间连续推进](assets/super-agent/01.jpg)
<figcaption>同一个任务在 IM 群聊与 PR 评审之间连续推进</figcaption>
</figure>
<figure markdown>
![没人 @ 时持续关注公共群聊，主动定位缺陷并提交修复 Pull Request](assets/super-agent/02.jpg)
<figcaption>没人 @，主动定位缺陷并提交修复 PR</figcaption>
</figure>
</div>

## 双层：Router 只派活，Worker 只干活 { #two-layer }

<figure markdown>
![双层架构：Router 层统一负责路由与对外交互，多个 Worker 会话隔离并发执行任务](assets/super-agent/04.jpg)
</figure>

**连续性和吞吐量是一对取舍，拆到两层各管一头**：

- 所有事件进一个会话：上下文最连续，但串行慢，几件事的中间细节搅在一起
- 每个事件开一个新会话：吞吐最高，但缺全局上下文，几个会话各自回用户，乱
- **Router 层**常驻，接所有入口的人类交互，是全局的序点、协调点和记忆；不执行具体任务，可以不配 Bash，轻量模型就够
- **Worker 层**上下文隔离、挂完整工具、配最强的模型；不直接对外说话，向 Router 汇报，由 Router 统一回复
- **Worker 之间不直接通信**：冲突多出在同一个 PR 上，订阅了同一个 Thread 就收到同样的事件，自己发现自己解决；少数跨任务协同由 Router 中转

**单个 Router 会话没想象中容易堵** —— 推理期间到的事件攒到下一轮一起处理，Router 每步是长输入、短输出，攒的几条在 Prefill 阶段并行算。压测里待决定的事件从每分钟约 1 条升到约 40 条，平均一批从 1.0 条升到 2.8 条，单次请求只从 2.5 秒涨到 3.9 秒，摊到每个决定反而从 6.4 秒降到 1.6 秒：

<figure markdown>
![不同 Trigger 到达速率下 Router 会话的 batch 大小、单次请求耗时与单个决定的分摊推理时间](assets/super-agent/14.png)
</figure>

- 规模再大，Router 可以多层过滤或水平切分 —— 切得越细吞吐越高、分片之间的记忆越断，全局记忆解决之前这个取舍一直在
- **会话从界面上退下去**：原文认为让用户手动管会话是从底层 LLM API 延续下来的惯性。会话同时扛着上下文管理和项目管理，拆开后，给用户看什么样的任务管理成了独立的产品问题，见[还没解决的](#open)

## 和主 agent 带 subagent 差在哪：派的是任务不是步骤，不干活由结构定死 { #vs-subagent }

<figure markdown>
![主 agent 带 subagent 和 Super-agent 四处对照：拆的是什么、中心节点干不干活、分不分工谁定、后续消息走哪](assets/super-agent/vs-subagent-infographic.png)
</figure>

结构上两者是同一棵树 —— 一个中心节点往下派活。原文自己承认：用提示词约束 Agent Team 的主会话不亲自执行、只对外交互和分派，它也算双层架构。差别在四处：

| | 主 agent 带 subagent | Super-agent |
|---|---|---|
| 拆的是什么 | **一个任务的内部步骤**：子步骤耦合紧 | **多个独立任务**：只管任务之间的关联 |
| 中心节点 | **主 agent 自己也干活**：要懂细节、做规划、高频协调 | **Router 不干活，只分派**：轻量模型就够，可以不配 Bash |
| 分不分工 | **模型临场判断**：靠提示词劝它委派 | **结构上定死**：Router 手里没有执行工具 |
| 后续消息 | **全部经过主 agent**：干活时被新消息打断 | **按 Thread 直通 Worker**：Router 只看没人订阅的新事件 |

- **两者是嵌套，不是替代**：Worker 内部可以再开 subagent，本身也可以是一个 Agent Team，对 Router 透明 —— 主 agent 带 subagent 是 Super-agent 某一层的内部结构
- **只靠提示词，模型多半不委派**：消融实验的对照组就是「单会话 + subagent 工具」。约 300 条群聊和 CI 消息里混着约 20 条工作请求，写代码换成只耗时间的空工具，每种方案跑 5 次：

| 方案 | 委派情况 | 完成时间 p50 / p95（分钟） | 单次读缓存 token |
|---|---|---|---|
| 单会话 + subagent，中性提示「Use a subagent for a piece of work when appropriate」 | 5 次运行一次都没委派，全在主会话里做、不停被新消息打断 | 20.4 / 29.5 | 605 万 |
| 单会话 + subagent，提示优先委派 | 5 次里委派了 4 次；剩下 1 次嫌活小自己做，拖出长尾 | 13.8 / 29.0 | 1082 万 |
| Super-agent | Router 不执行，活全由 Worker 做 | 12.4 / 15.7 | 2323 万 |

<div class="grid" markdown>
<figure markdown>
![工作请求的累计到达曲线与四种方案的累计完成曲线，5 次运行均值](assets/super-agent/12.png)
<figcaption>累计到达与完成曲线，紫色长尾是那次没委派的</figcaption>
</figure>
<figure markdown>
![四种方案的任务完成时间与读缓存 token 汇总，每种方案重复 5 次](assets/super-agent/13.png)
<figcaption>四种方案汇总，完成时间从工作请求算到结果消息</figcaption>
</figure>
</div>

- **代价是 token**：多个会话各读各的缓存，读缓存 token 是中性提示单会话的近 4 倍 —— 拿 token 换更短、更稳的完成时间；委派一多，p50 就追上来，差距主要在 p95 的长尾
- **实验只测调度**：负载是合成的，写代码换成了空工具，量不出活干得好不好；原文也说只作初步参考

## 事件驱动：先用程序筛，再让模型判 { #events }

驱动 agent 的不再是人敲的提示词，而是群聊消息、邮件、日程提醒、代码评审评论、CI 结果这类半结构化事件，原文叫 **Trigger**。一条 Trigger 从进门到处理过四关。

### 过滤：程序走快路，模型走慢路 { #filter }

<figure markdown>
![两级过滤：先由程序层策略筛掉大部分无关消息，再交给语义层策略判断](assets/super-agent/05.jpg)
</figure>

- 事件流「高噪音、低触发率」，每条都让模型从头判，延迟和花费都扛不住
- **程序层**（Fast Path）按来源、群组、白名单直接准入，每个来源设成「仅响应明确请求」「作为候选」或「直接忽略」
- **语义层**（Slow Path）让模型按提示词写的策略判断要不要行动，也是给人用自然语言加开关的扩展点

### 路由：同一话题的后续事件直通认领它的 Worker { #routing }

<div class="grid" markdown>
<figure markdown>
![Thread 示例：同一个 IM 话题或同一个 GitHub Pull Request 下的连续 Trigger 构成一条 Thread](assets/super-agent/06.jpg)
<figcaption>同一话题、同一 PR 下的连续事件是一条 Thread</figcaption>
</figure>
<figure markdown>
![订阅与直通：首条事件经 Router 创建 Worker 并建立订阅，同一 Thread 的后续事件直接发往该 Worker](assets/super-agent/07.jpg)
<figcaption>首条经 Router，后续直通</figcaption>
</figure>
</div>

- 同一个 PR、同一个 IM 话题、同一串邮件下的连续事件叫 **Thread**
- Router 按 Thread 的首条事件建 Worker，Worker 订阅这个 Thread；后续事件由程序直送，不再经 Router 转发；超出任务范围的，Worker 退订或交回 Router
- Router 仍看得见所有事件，只判断、分派没人订阅的
- 订阅是多对多：几个 Worker 撞在同一个 PR 上，新事件同时送到每一个，不用点对点通信
- **直通省的是 Router 的开销，不是时间**：去掉直通，完成时间基本不变，Router 要做的决定多约 30%，读缓存 token 从 2323 万涨到 3177 万，多 37%

### 上下文：窗口当 Cache 管，引用串成链 { #context }

<figure markdown>
![链式召回：每次召回的对象都内联下一跳关联对象的 ID，沿引用关系逐跳展开上下文](assets/super-agent/08.jpg)
</figure>

- **Inline**：近期很可能用到的直接塞进窗口，省一次工具往返；**Spill**：超预算的留在窗外，只留引用或摘要
- 从最少开始：先给当前对象的 ID 和摘要，再按局部性带上紧密关联对象的 ID 和时空相邻的内容 —— 前 50 字、IM 的前后消息和被回复的那条、同一评审讨论里的相邻评论；长内容截断，留续读入口
- **链式召回**：Trigger、Thread、Worker 会话都有 ID，召回一个对象，返回里又内联下一跳的摘要和 ID —— 从一条消息读到 Thread，从 Thread 追到 Worker，再追到这个 Worker 关联的另一个评审 Thread。Router 不用装下全部历史，用户跨信道提起旧任务也找得回来

### 提前行动：后台先做，有用才交 { #speculative }

<figure markdown>
![投机执行示例：群里还在讨论方案时，Super-agent 已在后台提交了修复 Pull Request](assets/super-agent/09.jpg)
</figure>

- 借**投机执行**：还不确定会不会被采用就先在后台试，有价值就交付，没价值就丢 —— 拿后台算力换人的等待
- 活例是「静默复现并修复」：群里有人反馈问题，agent 在后台先复现、找修复，确认了才发 PR，否则全程不出声

## 全双工：工具一跑不再堵住对话 { #duplex }

<figure markdown>
![经典 ReAct Loop 与异步 ReAct Loop 对比：异步调用立即返回 Started，后台工具运行期间仍能响应新消息](assets/super-agent/10.jpg)
</figure>

- 耗时命令和子任务改成异步的 `start()`、`stop()`：调 `start()` 立刻返回「已启动」，跑完的结果作为一条新事件投回会话；跑太久模型可以 `stop()`
- 新输入在当前推理步结束就处理，不等后台工具
- 这套异步任务 dsh 已经实现，默认没开
- **按信道定输出**：推理和工具调用关在 Worker 里，由 Router 对外说话；IM 只在要决策、要验收时发通知，硬规定单次回复不超过 100 词；GitHub、邮件、文档给结构化、高密度的交付

## 存算分离：计算上云，环境留在原地 { #separation }

<figure markdown>
![存算分离与执行环境解耦：Agent Loop 与持久化状态在云端分离，经端侧 daemon 按需接入各类执行环境](assets/super-agent/11.jpg)
</figure>

- 本地 agent 把计算、会话状态、执行环境绑在一台机器上，机器一睡就停
- **第一步，计算和状态分开**：循环放进云端无状态容器，可扩、可重启、可替换；会话存数据库
- **第二步，计算和执行环境分开**：真实环境有没提交的改动、私有凭据、内网依赖，同步上云又贵又漏 —— 不搬，端侧只装一个不存会话的轻量 daemon，只执行命令、回结果
- 自带机器（BYOM）、云托管机器、临时环境都能接；间歇在线的设备重新上线时，云端再把要在它上面做的任务触发起来
- 原文说这和 Anthropic 的「脑手分离」一致，区别在场景：那边是托管沙箱，这边先要接的是个人机器

## Watchdog：在主系统外面再放一个 agent 盯着 { #watchdog }

- 进程活着不等于在干活：很多异常是模型陷进无效循环、偏离目标
- 主系统外放一个独立的 **Watchdog 会话**，定时消息驱动，构成外部 Control Loop：管接口报错、状态恢复失败，也由模型判断每个 Worker 有没有实质进展、方向偏没偏
- 它本身是带全套工具的 agent，维护者可以直接问它故障原因，让它在线改提示词、调触发规则

## dsh 已有的底座，Super-agent 新加的 { #vs-dsh }

**dsh 的收件箱已经把「异步结果变成一条消息」做完了；Super-agent 加的是事件从哪来、谁来接、谁不许干活。** 本站拆过的 [DeepSeek Harness](../projects/deepseek-harness/index.md) 是 Super-agent 的宿主，原型就是它的一个插件[^proto]。按本站细讲读到的版本对照：

| Super-agent 要的 | dsh 里已有的 | Super-agent 新加的 |
|---|---|---|
| 异步结果投回会话 | [持久收件箱，三种投递](../projects/deepseek-harness/agents.md#inbox)：排下一轮、插队、静默附带 | 外部环境事件当 Trigger 投进来，先过两级过滤 |
| Worker 向 Router 汇报 | [结算通知](../projects/deepseek-harness/agents.md#settlement)：子 agent 结束时运行时一定发一条 | Router 统一对外回复，Worker 不直接说话 |
| 长任务不堵对话 | [后台任务和定时任务走收件箱](../projects/deepseek-harness/agents.md#jobs)；异步 `start()` 已实现、默认没开 | 默认全双工 |
| 中心节点派活 | 何时委派、[fork 还是 spawn](../projects/deepseek-harness/agents.md#fork)由模型决定 | Router 不配执行工具，派活由结构定死；按 Thread 订阅直通 |
| 一直在线 | [会话日志](../projects/deepseek-harness/log.md)只追加，崩溃能补齐 | 云端无状态循环、端侧 daemon、外部 Watchdog |

## 还没解决的 { #open }

- **双层怎么扩**：单 Router、订阅直通、Worker 不互通是现阶段的简化；Router 何时切分、Worker 何时要直接通信没有定论；跨月的长程记忆是下一个瓶颈
- **没了会话，人怎么协作**：底层会话不再对应界面上的会话，任务怎么呈现、人怎么中途插手接管还没答案；原文认为聊天窗口是路径依赖，交互可能挪进 GitHub Issue、PR 这类领域界面
- **上下文边界和 A2A**：组织决定配几个实例，就是在划上下文共享和隔离的边界；彼此隔离的实例之间怎么安全通信没解决
- **安全和隐私**：事件驱动让 agent 接触更多不可信输入；云端被攻破或被提示词注入，连着的端侧设备全暴露；还得让 agent 用凭据而不碰到凭据本身

??? abstract "原文存档（2026-11-02 用 wechat_mp.py 取下，图片路径指向同目录，招聘海报未收）"

    ````markdown
    --8<-- "posts/assets/super-agent/original.md"
    ````

[^paper]: DeepSeek 产品部，[《Super-agent 设计探索：迈向更自主的 Agent 系统》](https://mp.weixin.qq.com/s/zoS7GlReWPhfCjENGxXCdg)，微信公众号「DeepSeek Harness 团队」，2026-10-31 发布，2026-11-02 读；本页除对照信息图外，图都取自原文。
[^proto]: [deepseek-ai/dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype)，MIT 许可，commit 6337fc8（2026-10-31）；原文说它是验证技术路线的原型，不是正式产品，本页没读它的源码。
