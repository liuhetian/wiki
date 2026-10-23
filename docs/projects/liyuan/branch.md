---
description: "梨园怎么处理重来和回档：会话是一棵树，重新生成是同级分支；场景快照和摘要挂在树上、按当前分支现算；叶守卫丢掉迟到的账；向量记忆按分支过滤；存档是树上的点，从旧存档接着玩分出新世界线。每一步给出源码模版和实跑效果"
---

<figure markdown>
  ![会话是一棵树：每轮挂一份场景快照，重新生成是同级分支，废弃分支的账留在原地，从存档可以分出新世界线](assets/branch-tree-infographic.png)
</figure>

# 重来和回档：会话是一棵树

网页版 ChatGPT 的重新生成只是换一条回复，它没有别的状态要管。梨园有了[场景快照](state.md)、[前情提要和跨局记忆](memory.md)，重来一次就得回答：废掉的那版已经记过的账、压过的摘要，算不算数？梨园的回答是一条原则——**世界是当前分支的函数**。下面每一步给出梨园源码，和同一段代码真跑出来的效果。

## 重新生成是同级分支 { #swipe }

**问题**：重新生成时，旧回复要留着随时能切回去，新回复不能覆盖它。

梨园的会话存在 pi 的会话树里，树只追加不改写。重新生成（swipe）时，把树的当前位置挪回最后一条用户消息，再生成一条回复，新回复就成了旧回复的同级分支；左右切换变体，就是把当前位置跳到另一条分支的末端（`server/main.ts:1108`）。

实跑第一轮同一句用户原话生成了两次，两条分支共用开场白和这句原话，各自往下长：

<div class="grid" markdown>

```text title="效果 · 分支 A 的回复"
--8<-- "projects/liyuan/assets/sim/txt/round1-final.txt"
```

```text title="效果 · 分支 B 的回复"
--8<-- "projects/liyuan/assets/sim/txt/branch-B-reply.txt"
```

</div>

## 账本跟着分支走 { #branch-state }

**问题**：有了账本以后，废掉的那版已经记过账，状态里带着废稿里发生的事。

场景快照、前情提要、面板数据都作为条目挂在树上。每轮从当前分支的末端往回找最近一份，现算出来：

```ts title="模版 · src/stage/assemble.ts:245-255"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/assemble.ts:245:255"
```

设计文档 `docs/PLAN-RP-HARNESS.md:92` 把这条定成原则：

> **R4 世界 = f(分支)**。账本从当前分支的 rp-state 快照重建，磁盘文件降级为缓存。swipe/rewind/世界线切换天然看到正确账本——泄漏整类消失，不再需要恢复桥。

拿上面两条分支各跑一次 `stateFromBranch`：

<div class="grid" markdown>

```text title="效果 · 分支 A 的账本"
--8<-- "projects/liyuan/assets/sim/txt/branch-A.txt"
```

```text title="效果 · 分支 B 的账本"
--8<-- "projects/liyuan/assets/sim/txt/branch-B.txt"
```

</div>

两份账本各记各的：A 的青梧是「客栈掌柜」，B 里她已经说出了「沈家旧宅的独子」，B 的账本记下了这件事，A 的账本里没有。切回 A，B 记过的账不在 A 的路径上，自然看不到——重新生成不需要任何「恢复账本」的代码。

用户在界面上手改账本，也是在当前位置追加一条新快照，切到别的分支就看不到这次修改。[前情提要](memory.md#replay)同理：压缩写下的 `rp-summary` 挂在哪条分支上，就只对哪条分支生效。

## 叶守卫：迟到的账整份丢掉 { #leaf-guard }

**问题**：场记和压缩是收笔后的旁路调用，要跑好几秒；这期间用户可能已经切了分支，迟到的结果会记到别人的分支上。

旁路调用前后各读一次树的当前位置（叶），两次不一致就整份丢弃：

```ts title="模版 · src/stage/scribe-run.ts:88-92"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/scribe-run.ts:88:92"
```

压缩落摘要前有同样一道（`src/stage/compact.ts:274`）。另外，台上正在生成时，界面直接拒绝重新生成、切换和压缩。

## 向量记忆也按分支过滤 { #vector }

**问题**：向量库不在树上，重新生成废掉的那几轮照样能被召回。`src/memory/service.ts:55` 记着一次实测（原文的「拍」就是一轮）：

> 13 次重roll 中第 5、10 拍入库，第 11 拍起开始写「承接上一拍」

模型把被废掉的版本当成了上一轮。现在入库时带上树节点的 id，检索、召回、列举都只取当前分支上的节点（`server/main.ts:800`）。

## 存档和世界线 { #save }

**问题**：想停在某一刻，过几天回来换个走向接着玩。

- **存档**是树上的一条 `rp-save` 条目，排在场记之后写，保证存档紧跟这一轮的账本
- **回档**就是把当前位置跳回那个节点，账本、摘要随之回到当时
- **世界线**：新存档时看一眼，上一个存档之后有没有不在当前分支上的存档——有，说明从那里走出过另一条后续，这次就分出一条新世界线；没有，就是延长当前这条

```ts title="模版 · src/worldline.ts:193-237"
--8<-- "projects/liyuan/assets/liyuan-src/src/worldline.ts:193:237"
```

实跑搭一棵小树过 `planNewSave`：开场 → 第一轮回复（存档「雨夜问名」）→ 第二轮回复（存档「直问生死」）；再回到第一轮的存档，换个走向演一轮，在新的末端存档「坦言来意」。另外在一棵没有存档的树上存第一个档「开场」：

```json title="效果 · planNewSave 的三次规划"
--8<-- "projects/liyuan/assets/sim/txt/worldline.json"
```

- `first`：分支上没有更早的存档，开一条新的「主线」
- `sameLine`：在原路径的末端再存，「雨夜问名」之后的存档都在当前分支上，延长主线
- `fork`：回档后换了走向，「直问生死」在「雨夜问名」之后、却不在当前分支上，于是分出「从「雨夜问名」分出 · 线2」

世界线的改名、软删除记在旁路文件 `世界线.json` 里，不往树里写。

## agent 模式不用树导航 { #agent }

**问题**：写小说时要回到的是「某一次改稿之前」，不是对话树上的某个节点。

agent 模式不靠会话树回退，靠每轮末尾的文件检查点，可以只恢复正文文件，也可以文件和对话一起回去，见[正文怎么产出](prose.md#checkpoint)。

## 谁管什么 { #split }

- **程序**：分支怎么挂、按分支现算账本和摘要、叶守卫、向量按分支过滤、分不分新世界线
- **模型**：不参与，回退和分支全由程序处理
- **用户**：重新生成、左右切换、存档、回档、给世界线改名

## 实跑原件 { #sim-files }

??? abstract "两条分支过 rebuildHistory 和 stateFromBranch 的输出"

    ```json
    --8<-- "projects/liyuan/assets/sim/out/lab-branch.json"
    ```

??? abstract "分支 B 那一轮的完整记录：注入、思考、工具调用、定稿、场记"

    ```json
    --8<-- "projects/liyuan/assets/sim/out/round1-swipe.json"
    ```
