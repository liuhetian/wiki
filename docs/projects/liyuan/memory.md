---
description: "梨园怎么应付聊久了：剧情压缩保留最近 6 轮、更早的写成五节前情提要并以一条 user 消息回放；不用 coding agent 自带的压缩；可选向量记忆；跨局记忆把每局复盘合并成手册和常驻摘要，共用一份预算，删掉一局只删由它支撑的条目。每一步给出拼接模版和实跑效果"
---

<figure markdown>
  ![记忆分三层：最近 6 轮原文、本局前情提要、往局常驻摘要，越早压得越狠；旁边是可选的向量记忆库](assets/memory-layers-infographic.webp)
</figure>

# 聊久了：越早的事压得越狠

网页版 ChatGPT 每轮把历史全量回放，聊长了要么上下文爆掉，要么前面的事被截掉；开个新对话又从零开始。梨园按「越早压得越狠」分层：最近几轮留原文，更早的压成摘要，往局的事合并成一张卡的跨局记忆。下面每一步都给出梨园源码里的拼接模版，和同一段代码真跑出来的效果。

## 剧情压缩：更早的写成五节摘要 { #compact }

**问题**：历史全量回放，聊几百轮上下文就爆。

每轮场记记完账后判断一次：没被摘要覆盖的轮数达到「保留 6 轮 + 周期 30 轮」，而且能裁的正文不少于 2000 字，就压（`src/stage/compact.ts:41`）。周期在配置里改，填 0 关闭；手动 `/compact` 不等周期，500 字就能压。最近 6 轮逐字保留——续演必须从原文接；更早的交给旁路模型写成五节：

```ts title="模版 · src/scribe.ts:280-314"
--8<-- "projects/liyuan/assets/liyuan-src/src/scribe.ts:280:314"
```

实跑只演了三轮，凑不够 6 轮，演示时把开场白和前两轮全部交给场记，用的是梨园自己的 `serializeForSummary` 和 `buildRpSummaryPrompt`：

??? abstract "效果 · 压缩的完整 prompt"

    ```text
    --8<-- "projects/liyuan/assets/sim/txt/summary-prompt.txt"
    ```

旁路模型交回的摘要：

```markdown title="效果 · 五节接力摘要"
--8<-- "projects/liyuan/assets/sim/txt/summary.txt"
```

「承诺与伏笔」列了六条，连「旅人心里一沉」这种只出现过一次的反应都记下了——提示词那句「宁多勿漏」在起作用。摘要还把工具账本当成了「仅供参考」，和 user 段那行括注的意思一致。

## 被压掉的部分换成一条【前情提要】 { #replay }

**问题**：摘要写好了，放在哪、怎么让模型当它是真事。

摘要作为一条 `rp-summary` 追加进会话树，记下覆盖到哪一条（`coversThroughId`）。组装上下文时，被覆盖的历史直接不进来，开头换成一条 user 消息，后面接保留的历史和本轮末端消息；本局摘要和[往局常驻摘要](#cross)用同一句开场：

```ts title="模版 · src/stage/engine.ts:1056-1078"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/engine.ts:1056:1078"
```

实跑压完，再来一条新的用户消息，重新组装出的历史只剩两条：

```text title="效果 · 压缩后组装出的历史"
--8<-- "projects/liyuan/assets/sim/txt/summary-history.txt"
```

树只追加，被覆盖的原文还在树上；分支上只认最后一份摘要，下次压缩时上一份整份并进新的（模版里的 `<previous-summary>`）。

## 不用 coding agent 自带的压缩 { #why-own }

**问题**：pi 自带的压缩是给写代码设计的。

- 它的摘要模板会把陈旧的时间、场景当成关键上下文保留，压完剧情场景倒回去。所以上面五节里的「当前场景」专门写明：「必须以对话记录中**最新**的场景为准……写成更早的场景会导致剧情倒退」
- 它压的是 pi 自己那份消息副本，看不见梨园写进树里的场景快照、稿件补丁、引擎直接落下的回复

所以扮演时 pi 的压缩钩子被直接取消：

```ts title="模版 · .liyuan/extensions/roleplay.ts:1279"
--8<-- "projects/liyuan/assets/liyuan-src/extensions/roleplay.ts:1279:1279"
```

`compact.ts` 开头一句话说清了分工：「压缩权跟着上下文权走——谁装配，谁压缩」。

## 向量记忆：摘要丢的细节存进库 { #vector }

**问题**：五节摘要必然丢细节，某个早期的小道具、一句台词，后面想用就没了。

可选功能，默认关闭。打开后，压缩前被裁掉的原文先归档进向量库；每轮按用户原话召回，作为【剧情记忆】接在设定集索引后面：

```ts title="模版 · src/stage/assemble.ts:525-527"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/assemble.ts:525:527"
```

召回最多等 5 秒，超时这一轮就不出这一块；只取当前分支上的内容，见[重来和回档](branch.md#vector)。实跑没开向量记忆，上面几轮的注入里都没有这一块。

## 跨局记忆：每局写复盘 { #cross }

<figure markdown>
  ![一张卡的跨局记忆：一局演完、写复盘、合并成手册、常驻摘要、新的一局带上；删掉一局只删只由它支撑的条目](assets/cross-session-memory-infographic.webp)
</figure>

**问题**：同一张卡开新的一局，又从零开始。

记忆住在 `cards/<卡>/记忆/` 下，人可读、可改、可删：每局一份复盘 `局/<局id>.md`、合并后的手册 `记忆.md`、每轮注入的 `常驻摘要.md`。进入会话、删会话之后，后台给整张卡同步一次；模型不知道这套存在。

第一步，给每局写复盘。每局算一个指纹，没变就跳过；变了就把当前分支的正文、前情提要、场景快照交给模型：

```ts title="模版 · src/card-memory.ts:278-316"
--8<-- "projects/liyuan/assets/liyuan-src/src/card-memory.ts:278:316"
```

实跑拿前面那局（局 id 记作 `jA`）走一遍：

??? abstract "效果 · 复盘的完整 prompt"

    ```text
    --8<-- "projects/liyuan/assets/sim/txt/recap-prompt.txt"
    ```

??? abstract "效果 · 局 jA 的复盘"

    ```markdown
    --8<-- "projects/liyuan/assets/sim/txt/recap-A.txt"
    ```

为了演示「跨局」和下面的遗忘，另手写了一局 `jB` 的复盘，里面有几件 jA 里没有的事：

```markdown title="手写的另一局 jB"
--8<-- "projects/liyuan/assets/sim/txt/recap-B.txt"
```

## 合并成手册和常驻摘要 { #merge }

**问题**：复盘一局一份，每轮全塞进去太长，也没有跨局的视角。

复盘有增改删时调一次模型，同时输出两份全文：手册按局分块，跨局汇总的条目标 `[局:<局id>]`；常驻摘要不超过 1200 字，每轮注入：

```ts title="模版 · src/card-memory.ts:372-395"
--8<-- "projects/liyuan/assets/liyuan-src/src/card-memory.ts:372:395"
```

两份复盘交进去：

??? abstract "效果 · 首次合并的完整 prompt"

    ```text
    --8<-- "projects/liyuan/assets/sim/txt/merge-prompt.txt"
    ```

??? abstract "效果 · 合并出的手册 记忆.md"

    ```markdown
    --8<-- "projects/liyuan/assets/sim/txt/handbook-1.txt"
    ```

```markdown title="效果 · 合并出的常驻摘要.md"
--8<-- "projects/liyuan/assets/sim/txt/resident-1.txt"
```

两局的事并成了一份：jA 的沈怀瑾、旧伞，jB 的明前龙井、老梨树、茶田来信，都在。新开一局时，这份常驻摘要接在【前情提要】那条消息里本局摘要的后面（上面 `engine.ts` 模版里的 `residentSummary`）。

## 常驻摘要和账本共用一份预算 { #budget }

**问题**：常驻摘要、场景快照、登场名录每轮都要注入，一起挤占上下文。

三者共用 4300 字。超了在段落边界截断；截完剩不到 200 字，就整段不送：

```ts title="模版 · src/card-memory.ts:433-444"
--8<-- "projects/liyuan/assets/liyuan-src/src/card-memory.ts:433:444"
```

拿上面那份常驻摘要，假设本局账本和名录分别占去 3900 字和 4200 字：

```text title="效果 · fitResidentSummary 的两次截断"
--8<-- "projects/liyuan/assets/sim/txt/fit.txt"
```

剩 400 字时截在段落边界、末尾标「余下内容因篇幅略」；剩 100 字时返回空，整段退场。长局里往局记忆给本局的账本让位。

## 按来源遗忘 { #forget }

**问题**：删掉一局，它的事实还留在手册和常驻摘要里，每轮照常注入。

形状照搬 OpenAI Codex 的 memories，`src/card-memory.ts:17` 直接引了原话「Delete only memory supported by deleted inputs」。程序这边只认一件事：清单里合并过、盘上的复盘却没了，就是删了：

```ts title="模版 · src/card-memory.ts:351-353"
--8<-- "projects/liyuan/assets/liyuan-src/src/card-memory.ts:351:353"
```

这些局进遗忘队列，在合并 prompt 里多出一个 `<deleted-chats>` 块；删哪条由模型按 `[局:id]` 判断，规则写在合并模版的第 380 行：

```ts title="模版 · src/card-memory.ts:380"
--8<-- "projects/liyuan/assets/liyuan-src/src/card-memory.ts:380:380"
```

实跑删掉 jB 的复盘，再合并一次。user 段末尾是这样的：

```text title="效果 · 遗忘时合并 prompt 的末尾"
--8<-- "projects/liyuan/assets/sim/txt/forget-prompt-user.txt:94:98"
```

??? abstract "效果 · 遗忘时合并 prompt 的 user 段全文"

    ```text
    --8<-- "projects/liyuan/assets/sim/txt/forget-prompt-user.txt"
    ```

前后两份常驻摘要：

<div class="grid" markdown>

```markdown title="效果 · 删 jB 前"
--8<-- "projects/liyuan/assets/sim/txt/resident-1.txt"
```

```markdown title="效果 · 删 jB 后"
--8<-- "projects/liyuan/assets/sim/txt/resident-2.txt"
```

</div>

jB 那行简介，连同只由它支撑的几条——镇南茶田、老梨树、明前龙井、捎信去镇北、「喜欢慢节奏的日常对话」——都没了；jA 的内容一字不动。

??? abstract "效果 · 删 jB 后的手册"

    ```markdown
    --8<-- "projects/liyuan/assets/sim/txt/handbook-2.txt"
    ```

另有一条硬路径：调 `memory_update` / `memory_delete` 改记忆时，清掉全部合并记录，把两份汇总挪进 `.history`，下次从剩下的复盘整份重建，不靠模型挑条目。

## agent 模式的讨论也会压 { #discussion }

**问题**：agent 模式里讨论区越聊越长；按「字符数 ÷ 4」估 token，中文会低估近一倍，估算永远落在溢出之后。

讨论层按最近一次请求的真实 token 用量判断，超过「上下文窗口 − 预留」才压，从末尾按整轮切（`src/stage/discussion.ts:139`）；没有用量数据时才退回估算。

## 谁管什么 { #split }

- **程序**：何时压缩、切点、何时同步、指纹比对、谁算删了、预算截断、硬路径重建
- **模型**：写摘要、写复盘、合并手册、按 `[局:id]` 判断删哪条
- **用户**：开不开向量记忆、改压缩周期、直接改手册和常驻摘要、手删某局复盘

## 实跑原件 { #sim-files }

??? abstract "剧情压缩：prompt、摘要、压缩后的历史"

    ```json
    --8<-- "projects/liyuan/assets/sim/out/compact.json"
    ```

??? abstract "跨局记忆：复盘、合并、遗忘、预算截断"

    ```json
    --8<-- "projects/liyuan/assets/sim/out/memory.json"
    ```
