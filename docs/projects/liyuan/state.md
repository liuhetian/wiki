---
description: "梨园怎么让剧情状态不漂移：每轮一份场景快照，放在用户原话前注入；收笔后另一个模型当场记出 JSON patch，程序按规则合并；登场名录只增不删；地点和所在地两个字符串一比就知道谁在场。每一步给出拼接模版和实跑效果"
---

<figure markdown>
  ![一个场景由地点、时间、人物（好感、处境、备注、所在地）、离场、物品、零散事实、伏笔和登场名录组成](assets/scene-state-infographic.png)
</figure>

# 状态别漂移：每轮一份场景快照

网页版 ChatGPT 没有状态：谁拿着什么、现在几点、谁已经离场，全靠模型从聊天记录里回忆，聊长了就漂。梨园把这些事实记成一份**场景快照**，每轮更新一次。下面每一步都给出梨园源码里的拼接模版，和同一段代码真跑出来的效果。

## 场景快照放在用户原话前面 { #snapshot }

**问题**：模型回忆状态会漂移，否定的事最容易丢——礼物被拒了，下一轮东西已经在对方手里。

每轮开演时，引擎从当前分支往回找最近一份快照，渲染成【世界状态】【登场名录】两块，排在末端注入的最前面：

```ts title="模版 · src/stage/assemble.ts:487-491"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/assemble.ts:487:491"
```

【世界状态】一行一个事实：

```ts title="模版 · src/state.ts:203-220"
--8<-- "projects/liyuan/assets/liyuan-src/src/state.ts:203:220"
```

注入块整个放在用户原话前面：

```ts title="模版 · src/stage/engine.ts:1006-1013"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/engine.ts:1006:1013"
```

实跑第二轮开演时，末条 user 消息是这样的，第一轮记的账已经在最前面（「本拍」是梨园对一轮的叫法）：

```text title="效果 · 第二轮末条 user 消息"
--8<-- "projects/liyuan/assets/sim/txt/round2-message.txt"
```

主演手上只有只读的 `world_state_get`，账本它改不了。

## 场记：收笔后另一次调用专门记账 { #scribe }

<figure markdown>
  ![每轮记一次账：上一份快照注入、主演收笔、场记读稿出 patch、程序按规则合并、新快照存进会话树，再进入下一轮](assets/scribe-loop-infographic.png)
</figure>

**问题**：让主演一边写戏一边记账，它顾着写戏就漏记。

收笔后另起一次模型调用：配了旁路模型就用它，可以选便宜的；默认关思考，上限 2048 token。system 讲字段语义，user 只给当前账本和本轮对话：

```ts title="模版 · src/scribe.ts:94-105（system）"
--8<-- "projects/liyuan/assets/liyuan-src/src/scribe.ts:94:105"
```

```ts title="模版 · src/scribe.ts:123-131（user）"
--8<-- "projects/liyuan/assets/liyuan-src/src/scribe.ts:123:131"
```

实跑第一轮收笔后，场记拿到的完整 prompt：

??? abstract "效果 · 第一轮场记的 prompt"

    ```text
    --8<-- "projects/liyuan/assets/sim/txt/scribe1-prompt.txt"
    ```

场记（`deepseek-flash`，关思考）吐出：

```json title="效果 · 第一轮场记的输出"
--8<-- "projects/liyuan/assets/sim/txt/scribe1-raw.json"
```

场记的输入里没有角色卡，也没有开场白。卡里写的是「听雨轩」「夜里」，正文没提这两个词，它就照正文记成了「青梧的客栈（檐外下雨）」「傍晚（雨中）」。从这一轮起，这就是账本里的事实，下一轮按它注入。

只有正常收笔才记账：本轮有正文、没被中断。

## 合并规则写死在程序里 { #merge }

**问题**：模型给的 patch 格式和取值不可靠，直接覆盖会把账本写坏。

`applyPatch` 按固定规则合并：时间、地点整体替换，人物按字段合并，物品和伏笔每次给完整清单。另有三道闸——好感取整、夹在 ±100：

```ts title="模版 · src/state.ts:115-121"
--8<-- "projects/liyuan/assets/liyuan-src/src/state.ts:115:121"
```

数组里的非字符串丢掉，并告诉场记该怎么写：

```ts title="模版 · src/state.ts:149-158"
--8<-- "projects/liyuan/assets/liyuan-src/src/state.ts:149:158"
```

不认识的顶层字段整个拒收；最后一步登记名录：

```ts title="模版 · src/state.ts:194-199"
--8<-- "projects/liyuan/assets/liyuan-src/src/state.ts:194:199"
```

上面那份真实 patch 合并后：

```text title="效果 · 第一轮 patch 的合并结果"
--8<-- "projects/liyuan/assets/sim/txt/scribe1-merged.txt"
```

真实 patch 很规矩，三道闸都没碰到。另构造一份越界的 patch，过同一个函数：

```text title="效果 · 构造的越界 patch 过 applyPatch"
--8<-- "projects/liyuan/assets/sim/txt/patch-demo.txt"
```

好感 150 被夹到 100，`mood` 被拒收，数字 `42` 被丢掉；告警原文回给场记，它下次就知道怎么写。

合并完的整份快照作为一条 `rp-state` 追加进 pi 的会话树，磁盘上的 json 只是缓存；用户在界面上手改账本，也是追加一条新的 `rp-state`。快照挂在树上，[重来和回档](branch.md)时账本自然跟着走。

## 登场名录：只增不删，记首次登场 { #roster }

<figure markdown>
  ![角色详情页右栏的登场名录：人物、地点、物品、事件四张表](assets/character-detail-roster.png)
</figure>

**问题**：快照只记当前值，模型分不清一个名字是新登场的还是早就出现过的老熟人。

每次合并的最后一步，`registerRoster` 把当前出现的人物、物品、剧情线、地点并进名录。名字一旦登记就不删，值是首次登场时的剧内时间；当前地点和每个人的所在地都算「到过」：

```ts title="模版 · src/state.ts:256-280"
--8<-- "projects/liyuan/assets/liyuan-src/src/state.ts:256:280"
```

注入时四张表压成一行：

```ts title="模版 · src/state.ts:313-324"
--8<-- "projects/liyuan/assets/liyuan-src/src/state.ts:313:324"
```

实跑第二轮注入里的那一行：

```text title="效果 · 第二轮的【登场名录】"
--8<-- "projects/liyuan/assets/sim/txt/round2-message.txt:11:11"
```

地点表里有两条：「青梧的客栈（檐外下雨）」来自 `location`，「青梧的客栈」来自两人的 `at`。程序不判断这是不是同一个地方，写法不同就是两个名字。上限分别是人物、地点 100 条，物品、剧情线 60 条；超了预算先砍时间、不砍名字——注入时告诉模型「名录之外的名字才是新登场」，名字丢了就会被当成新人。

## 地点和所在地一比，就知道谁在场 { #at }

**问题**：名录里只有人、没有「场」，判断不了谁已经离开。

每个人物有一个所在地 `at`，场记的提示词要求它和当前地点用同一种写法，离开的人写他去了哪。格式化时两个字符串一比（上面 `formatState` 的第 212 行）：相等写「在场」，不等写「在：某处」。

实跑里同一句话生成了两次（[两条分支](branch.md#swipe)），两次的场记写法不同，结果就不同：

<div class="grid" markdown>

```text title="效果 · 分支 A 的【世界状态】"
--8<-- "projects/liyuan/assets/sim/txt/branch-A.txt"
```

```text title="效果 · 分支 B 的【世界状态】"
--8<-- "projects/liyuan/assets/sim/txt/branch-B.txt"
```

</div>

分支 B 的场记给两人写的 `at` 都是「镇北渡口附近的客栈」，和 `location` 一字不差，所以都「在场」；分支 A 的地点多了「（檐外下雨）」，青梧就成了「在：青梧的客栈」。程序只比字符串，源码注释说得明白：给的是两个地名这条事实，「他能不能看见这边」由模型自己判断。

## 卡的状态栏和自建面板吃同一份快照 { #panels }

**问题**：用户想在界面上看见这些状态；酒馆的卡还自带状态栏，指望模型每轮末尾输出一段变量补丁。

主演不再输出变量补丁。卡的变量树（MVU）和梨园自建面板的数据，都存在同一份快照里，由场记每轮多出一个字段推进——只有卡带了变量树、或者建了面板，system 里才多这一段：

```ts title="模版 · src/scribe.ts:74-92"
--8<-- "projects/liyuan/assets/liyuan-src/src/scribe.ts:74:92"
```

前端用 postMessage 把变量树推进卡的 iframe；自建面板注入时只喂数据不喂外观——一张 HTML 面板的外观动辄四千字，模型要的只是里面几十个字的事实。实跑用的卡两样都没有，上面场记的 prompt 里也就没有这两段。

## 谁管什么 { #split }

- **程序**：什么时候记、合并规则、好感夹值、名录只增、在场判定、注入顺序
- **模型**：主演只读账；场记决定 patch 里写什么、地名怎么写
- **用户**：在界面上手改账本，看面板

## 实跑原件 { #sim-files }

??? abstract "第二轮完整记录：注入、每次调用的思考全文、工具调用、定稿、场记"

    ```json
    --8<-- "projects/liyuan/assets/sim/out/round2.json"
    ```

??? abstract "合并规则演示：applyPatch 的输入和输出"

    ```json
    --8<-- "projects/liyuan/assets/sim/out/lab-patch.json"
    ```
