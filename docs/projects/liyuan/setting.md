---
description: "梨园的设定从哪来：角色卡投影进 system，蓝灯常驻，绿灯按关键词命中只给标题、另附全库索引，正文由模型自己检索；关思考的档直接给正文；新造的设定写进补充设定集，可选写入门禁。每一步给出拼接模版和实跑效果"
---

<figure markdown>
  ![每轮的设定分四层：常驻的角色卡和蓝灯条目、命中只给标题的绿灯条目、模型按需检索的正文、模型新写的补充设定集](assets/setting-sources-infographic.png)
</figure>

# 设定从哪来：越往下，越要模型自己动手

网页版 ChatGPT 的设定只有一处：贴进 system prompt 的那段人设。梨园把设定分成四层，下面每一步都给出梨园源码里的拼接模版，和同一段代码真跑出来的效果。

## 角色卡：人设投影进 system { #card }

**问题**：每开一个对话都要重贴人设，换个角色就得重写。

梨园直接吃酒馆（SillyTavern）的角色卡，导入后一张卡落成一个目录 `cards/<卡>/`。卡目录里有 `AGENTS.md` 就整份照用；没有就从卡的字段现拼：

```ts title="模版 · src/stage/assemble.ts:322-335"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/assemble.ts:322:335"
```

实跑用的是随包的默认卡「青梧」，没有 `AGENTS.md`，拼出来是 system 里的这一段：

```markdown title="效果 · 实跑 system 第 48–57 行"
--8<-- "projects/liyuan/assets/sim/txt/system.txt:48:57"
```

## 世界书：蓝灯常驻，绿灯按关键词进来 { #lorebook }

**问题**：一张卡装不下整个世界，门派、地名、往事动辄几万字，全塞进 prompt 上下文就满了。

世界书把设定拆成条目，每条带关键词。蓝灯条目每轮都在，进 system：

```ts title="模版 · src/stage/assemble.ts:354-357"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/assemble.ts:354:357"
```

```markdown title="效果 · 实跑 system 第 61–62 行"
--8<-- "projects/liyuan/assets/sim/txt/system.txt:61:62"
```

绿灯条目每轮扫最近 4 条消息，命中关键词的才进来，一轮最多 3 条：

```ts title="模版 · src/lorebook.ts:547-558"
--8<-- "projects/liyuan/assets/liyuan-src/src/lorebook.ts:547:558"
```

实跑第一轮，用户问「十年前从镇北渡口走的那位怀瑾公子，掌柜可还记得？」，加上开场白里的「听雨轩」，命中了三条：听雨轩、怀瑾、镇北渡口。

## 命中只给标题，正文让模型自己查 { #search }

**问题**：命中了就把正文塞进去，模型会把注入的内容当成全部设定——没列出来的名字就自己编，有了正文也不再去查别的。

所以命中的绿灯只给标题，另附一份全库的标题索引；正文交给检索工具：

```ts title="模版 · src/stage/assemble.ts:503-521"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/assemble.ts:503:521"
```

实跑第一轮，末条 user 消息里的注入块加用户原话是这样的：

```text title="效果 · 第一轮末条 user 消息"
--8<-- "projects/liyuan/assets/sim/txt/round1-message.txt"
```

模型拿到的只有三个标题，于是先查再写——第一次调用就并发三个 `lorebook_search`，第二次又补查了索引里的「旧油纸伞」：

```text title="效果 · 第一轮的模型调用"
--8<-- "projects/liyuan/assets/sim/txt/round1-calls.txt"
```

检索按关键词命中 ×5、标题命中 ×3、正文出现次数 ×1 打分（`src/lorebook.ts:569`），所以查「镇北渡口」时，正文里提到渡口的「怀瑾」也以 1 分跟了上来。查回来的「有人提起时，她会先去擦那把伞」，成了定稿里的一段：

```text title="效果 · 第一轮定稿（节选）"
--8<-- "projects/liyuan/assets/sim/txt/round1-final.txt:3:5"
```

扮演定义里专门写了一句，防模型把标题当正文：「看到标题就当『查过了』是错的，正文要用 `lorebook_search` 取。」

## 关思考的档照旧直接给正文 { #thinking-off }

**问题**：关了思考档的模型基本不主动调工具，只给标题等于什么都没给。

同一段模版的另一个分支：思考档为 off 时，`passiveLore` 为真，【相关设定】直接给命中条目的正文。拿同样的输入、关掉思考，拼出来是：

```text title="效果 · 关思考档的第一轮注入块"
--8<-- "projects/liyuan/assets/sim/txt/round1-passive.txt"
```

## 新造的设定写进补充设定集 { #overlay }

**问题**：剧情里新出现的人物、地名、规矩，压缩之后或者下一局就没人记得了。

模型可以用 `lorebook_write` 把新设定写下来，缺省写进卡目录里的 `补充设定集.json`，不碰用户导入的原书；要写进某本世界书得指名（`src/tools/lore.ts:237`）。

配置 `creationMode` 为 `ask` 时多一道写入门禁：看用户这一轮的原话里有没有相应的意思。写入和删除各认一套词：

```ts title="模版 · src/tools/gate.ts:52-62"
--8<-- "projects/liyuan/assets/liyuan-src/src/tools/gate.ts:52:62"
```

拿三句话过一遍门禁函数：

```text title="效果 · checkWriteGate 的三次判定"
--8<-- "projects/liyuan/assets/sim/txt/gate.txt"
```

被拦时回给模型的那段话，也写明了「不要询问『是否写入』」——拦下就是拦下，不让模型反过来追问用户。代码缺省不拦；随包的配置样例写的是 `ask`。

## 谁管什么 { #split }

- **程序**：投影角色卡、扫关键词、拼索引、按思考档决定给标题还是正文、写入门禁
- **模型**：查不查、查什么，新设定记不记
- **用户**：导入卡和世界书、挂哪几本、改卡的 `AGENTS.md`、开不开写入门禁

## 实跑原件 { #sim-files }

??? abstract "演示世界书「栖水镇」：一条蓝灯，五条绿灯"

    ```json
    --8<-- "projects/liyuan/assets/sim/demo-lorebook.json"
    ```

??? abstract "第一轮完整记录：注入、每次调用的思考全文、工具调用、定稿、场记"

    ```json
    --8<-- "projects/liyuan/assets/sim/out/round1.json"
    ```
