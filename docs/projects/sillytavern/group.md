---
description: "酒馆怎么让几个角色同场：外层调度器按点名和话痨度决定这轮谁说，一次只让一个角色跑一次普通生成；历史消息带名字前缀、末尾加「只写某某的下一句」、回复里冒出别人的名字就截掉；Swap 只放发言者的卡，Join 把全员的卡拼在一起。实跑两人群聊，中文名点名点不中"
---

# 多角色同场

网页版 ChatGPT 只有 user 和 assistant 两个角色。几个 NPC 都挤在 assistant 里，模型分不清哪句是谁说的，常常一口气替三个人写台词；下一句该谁说，也没人管。酒馆的群聊不改单次生成，在外面套一层：调度器决定这轮谁开口，再逐个切换当前角色，各跑一次和单聊一样的生成。下面实跑的是塞拉菲娜和构造的第二个角色「洛恩」（守在森林北缘的老猎人，和她认识二十年），出厂的 Natural 调度、Swap 拼卡。

## 调度器决定这轮谁说 { #scheduler }

**问题**：群里有几个角色，用户说了一句，该谁回？都回太吵，轮流太机械。

**功能**：出厂的 Natural 调度模拟真实对话：

1. 用户这句里点到谁的名字，谁一定说
2. 其余成员洗牌后各掷一次骰，骰子不超过自己的「话痨度」（0 到 1，出厂 0.5）就说；话痨度 0 的只在被点名时开口
3. 一个都没选中，从话痨度大于 0 的人里随机挑一个
4. 自动模式下，上一句是谁说的，这轮他不能接自己的话

```js title="模版 · public/scripts/group-chats.js:1246-1290"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/group-chats.js:1246:1290"
```

另有三种调度：按列表顺序人人轮一遍；从「上次用户发言后还没说过话」的人里抽；纯手动。

**效果**：调度函数原样跑，每种情况用 6 个固定种子各抽一次：

```text title="效果 · Natural 调度（固定种子）"
--8<-- "projects/sillytavern/assets/sim/txt/gr-scheduler.txt"
```

中文点名和完全没点名，结果一模一样：点名靠 `\b\w+\b` 切词，`\w` 只认拉丁字母和数字，中文名切不出来，只能靠话痨度掷骰。换成英文名，Lorne 每次都在。

## 一次只让一个角色生成 { #one-at-a-time }

**问题**：让模型一次写完整个场景，它会替所有人说话，也替用户说。

**功能**：选出这轮的发言者后，逐个设成当前角色，每人调一次普通的生成。`{{char}}`、卡字段、角色笔记、角色绑的世界书都换成这个人的；历史是共享的一份，后说的人看得到先说的人刚说了什么：

```js title="模版 · public/scripts/group-chats.js:1051-1063"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/group-chats.js:1051:1063"
```

**效果**：两轮群聊。第一轮调度选中两人（这一轮的种子是挑过的），第二轮用户用中文点了洛恩的名，他是靠话痨度掷中的：

```text title="效果 · 两轮群聊的回复"
--8<-- "projects/sillytavern/assets/sim/txt/gr-replies.txt"
```

洛恩接着塞拉菲娜的话说，因为轮到他时，塞拉菲娜的回复已经在历史里了。

## 防串台：名字、提示、截断 { #no-crosstalk }

**问题**：几个角色都是 assistant，模型看不出哪句是谁说的，写着写着就替别人开口。

**功能**：三道防线：

- **名字前缀**：群聊里，历史中不是用户发的消息，正文前加上「名字: 」：

    ```js title="模版 · public/scripts/openai.js:595-602"
    --8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:595:602"
    ```

- **群聊提示**：历史开头换成「[Start a new group chat. Group members: …]」，历史末尾加一条「[Write the next reply only as `{{char}}`.]」：

    ```js title="模版 · public/scripts/openai.js:892-903"
    --8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:892:903"
    ```

- **截掉别人的台词**：回复里一旦出现「换行 + 别的成员名 + 冒号」，从那里截断（Text Completion 下这些名字还直接当停止串）：

    ```js title="模版 · public/script.js:3171-3201"
    --8<-- "projects/sillytavern/assets/st-src/public/script.js:3171:3201"
    ```

**效果**：第一轮轮到洛恩时，发给 DeepSeek 的完整消息数组：

```text title="效果 · 洛恩那次的请求"
--8<-- "projects/sillytavern/assets/sim/txt/gr-lorne-request.txt"
```

塞拉菲娜的话都带着「塞拉菲娜: 」；两人的开场白是连着的两条 assistant，被 semi 后处理合成了第一条；末尾的「只写洛恩的下一句」原本是 system，发出去时变成了 user。主提示里写的是「between 洛恩 and 旅人」，因为出厂的主提示用的是 `{{char}}`，没用会展开成全体成员名的 `{{charIfNotGroup}}`。

## Swap 和 Join：拼谁的卡 { #swap-join }

**问题**：每次换人发言，prompt 里的人设就整段换掉；本地模型的前缀缓存全部失效，每轮重算。

**功能**：拼卡有两种方式。Swap（出厂）只放当前发言者的卡，各人只看见自己的设定。Join 把全员的描述、性格、场景、示范对话按成员顺序拼成一份，可以给每段加前后缀：

```js title="模版 · public/scripts/group-chats.js:547-570"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/group-chats.js:547:570"
```

**效果**：轮到洛恩时，三种设置下的描述槽：

```text title="效果 · Swap / Join / Join 加前缀（前缀是构造的）"
--8<-- "projects/sillytavern/assets/sim/txt/gr-join.txt"
```

Join 是为本地后端的前缀缓存做的让步：换发言者时 system 段不变。文档自己认下的代价是角色会把自己和别人混在一起。Join 只拼这四个字段，卡自带的 system prompt、末尾指令、角色绑的世界书仍然只取当前发言者的。

## 静音和自动模式 { #mute-auto }

成员可以静音：不参与调度，但仍在成员名单里，用户可以强制让他说话，适合旁白或昏睡中的角色。自动模式每隔 5 秒（出厂）在空闲时触发一轮调度，角色之间自己聊下去，用户一打字就停。这两样没有实跑，调度函数和生成流程同上。

## 谁管什么 { #split }

- **程序**：谁开口（点名、掷骰、兜底、不许自己接自己）、按什么顺序生成、名字前缀、群聊提示、截掉别人的台词、拼谁的卡
- **用户**：调度方式、每个角色的话痨度、静音谁、开不开自动模式、Swap 还是 Join
- **模型**：每次只演一个角色，在「只写某某」的提示下接着写

## 实跑原件 { #sim-files }

??? abstract "构造的第二个角色「洛恩」"

    ```json
    --8<-- "projects/sillytavern/assets/sim/material/lorne.constructed.json"
    ```

??? abstract "两轮群聊的请求和回包"

    ```json
    --8<-- "projects/sillytavern/assets/sim/out/group-record.json"
    ```
