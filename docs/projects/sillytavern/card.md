---
description: "酒馆的角色卡怎么把一段人设拆开：卡是一张内嵌 JSON 的 PNG；描述常驻、示范对话让位、开场白进历史、末尾指令贴在最后、角色笔记固定在深度 4；{{original}} 在卡覆盖全局时留住原文，{{pick}} 让随机值同一局不变；用户人设是另一张卡。每一步配源码模版和实跑效果"
---

# 角色卡：一段人设按寿命拆成几格

网页版 ChatGPT 的人设是 system prompt 框里的一段字：人设、说话示范、开场白、「别替用户说话」挤在同一段里，寿命都一样，从第一轮占到最后一轮，也带不走。酒馆的角色卡把这段字按「在上下文里该活多久」拆成几个字段，各自落进不同的槽。下面每一步给出源码里的模版，和用酒馆自己的代码跑出来的效果；用的卡是随包的 Seraphina 译成中文的「塞拉菲娜」，用户名「旅人」。

## 卡是一张 PNG { #png }

**问题**：人设是一段文字，换个前端、发给别人就得整段复制，头像另传。

**功能**：卡的 JSON 转成 base64，写进 PNG 的 tEXt 块，图片就是角色。写的时候同时写两块，keyword 分别是 `chara` 和 `ccv3`：

```js title="模版 · src/character-card-parser.js:27-39"
--8<-- "projects/sillytavern/assets/st-src/src/character-card-parser.js:27:39"
```

读的时候 `ccv3` 优先，没有再读 `chara`：

```js title="模版 · src/character-card-parser.js:64-74"
--8<-- "projects/sillytavern/assets/st-src/src/character-card-parser.js:64:74"
```

**效果**：把中文卡写进随包的头像，再读回来，PNG 里多了两个 tEXt 块：

```text title="效果 · 写卡后 PNG 的分块"
--8<-- "projects/sillytavern/assets/sim/txt/card-png.txt"
```

本地存储也是这张 PNG：角色列表逐个解析头像，编辑卡就是重写整张图。别的前端读同一个块，转发图片就等于转发角色。

## 字段按寿命分槽 { #slots }

**问题**：示范对话写在 system prompt 里，聊到第 80 轮还占着位置；「不要替用户说话」写在最前面，离生成点越来越远。

**功能**：卡的每个字段落进一个具名的槽，拼装时各有各的规则：

- 描述、性格、场景：常驻，进 `charDescription`、`charPersonality`、`scenario`
- 示范对话：进 `dialogueExamples`，只拿历史填完后剩下的预算，逐块被挤掉（见[预算](assembly.md#budget)）
- 开场白：不进 system，是聊天的第 0 条消息，聊长了和普通历史一样被挤出
- 末尾指令（Post-History Instructions，酒馆的叫法）：覆盖 `jailbreak` 槽，默认排在聊天历史之后
- 角色笔记（Character's Note）：注册成深度注入，固定在离末尾 4 条的位置
- 卡自带的 system prompt：覆盖全局的主提示 `main`

前三个字段和槽的对应写在 Chat Completion 的拼装函数里：

```js title="模版 · public/scripts/openai.js:1374-1386"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:1374:1386"
```

末尾指令和卡自带的 system prompt 先从卡上取出来，受两个开关控制，出厂都开着：

```js title="模版 · public/script.js:3413-3426"
--8<-- "projects/sillytavern/assets/st-src/public/script.js:3413:3426"
```

角色笔记每轮注册一次，深度和角色取卡上的值，默认 4 和 system：

```js title="模版 · public/script.js:4472-4486"
--8<-- "projects/sillytavern/assets/st-src/public/script.js:4472:4486"
```

**效果**：随包的卡只填了描述和开场白，示范对话写在描述里。为了一次看清每个字段落在哪，在译本上补齐性格、场景、单独的示范对话、末尾指令、角色笔记、带 `{{original}}` 的 system prompt（构造的「完整版」卡，见附录），拿第二轮的真实聊天拼一次。每行是一条消息：token 数、槽、角色、开头：

```text title="效果 · 完整版卡第二轮的拼装（dry run）"
--8<-- "projects/sillytavern/assets/sim/txt/card-slots.txt"
```

示范对话被拆成一问一答的 system 消息，前面带 `[Example Chat]`；角色笔记插在倒数第 4 条之前；末尾指令压在最后。世界书那 893 个 token 来自卡绑定的世界书，见[世界书](lorebook.md)。

## 开场白和备选开场白 { #greetings }

**问题**：空白开局，用户得自己起头，模型也没有文风参照；一张卡只有一个开局，每次都一样。

**功能**：开场白作为第 0 条消息写进聊天，备选开场白和它一起成为这条消息的候选，开局前左右滑着挑：

```js title="模版 · public/script.js:7710-7742"
--8<-- "projects/sillytavern/assets/st-src/public/script.js:7710:7742"
```

**效果**：完整版卡新开一局，第 0 条消息带两个候选：

```text title="效果 · 新聊天的第 0 条消息"
--8<-- "projects/sillytavern/assets/sim/txt/card-greetings.txt"
```

开场白是模型最先看到的「它自己说过的话」，长度和格式会被后面的回复模仿，这是作者控制文风最直接的地方。

## 卡覆盖全局时留住原文 { #original }

**问题**：卡作者想在用户调好的全局主提示上补一句，而不是整段替换掉用户的规则。

**功能**：卡的 system prompt 和末尾指令里可以写 `{{original}}`，展开成被覆盖的那段全局原文。覆盖发生在拼装时，被覆盖的原文作为 `original` 传进宏：

```js title="模版 · public/scripts/openai.js:1495-1513"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:1495:1513"
```

`{{original}}` 只在这次替换里有效，第二次出现返回空：

```js title="模版 · public/scripts/macros/engine/MacroEnvBuilder.js:144-151"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/macros/engine/MacroEnvBuilder.js:144:151"
```

**效果**：完整版卡的 system prompt 写的是「`{{original}}`⏎塞拉菲娜说话时常带一点歉意。」，主提示槽拼出来是：

```text title="效果 · main 槽"
--8<-- "projects/sillytavern/assets/sim/txt/card-original.txt"
```

前一句是出厂的全局主提示，后一句是卡补的。预设作者在条目上勾 `forbid_overrides`，卡就覆盖不了这一条。

## 用户人设是另一张卡 { #persona }

**问题**：baseline 只知道对面是 user，「我是谁」只能和角色设定混写在同一段里；写在开头的身份，聊久了也会被忘。

**功能**：用户人设（Persona，酒馆的叫法）是一份独立的描述，绑名字、头像，可以锁到某个角色或某个聊天。放的位置可选：默认进 `personaDescription` 槽，也可以注册成深度注入，或者并进作者注释：

```js title="模版 · public/script.js:3203-3225"
--8<-- "projects/sillytavern/assets/st-src/public/script.js:3203:3225"
```

**效果**：同一份人设「`{{user}}`是二十出头的猎人，左腿被影牙咬伤，说话直来直去。」，放在 prompt 里和放在深度 2，第二轮分别拼成：

```text title="效果 · 人设的两个位置"
--8<-- "projects/sillytavern/assets/sim/txt/persona.txt"
```

放在深度 2 时，人设跟着对话前沿走，始终在倒数第二条之前。

## 名字和随机值每轮现算 { #macros }

**问题**：人设里把名字写死，这张卡就没法给别的用户用，进了群聊也认不出谁是谁。宏每轮都会重新展开，写 `{{random::金发::红发}}`，发色就每轮变一次。

**功能**：卡里写 `{{char}}`、`{{user}}`，每轮拼装时才代入当前角色和当前人设的名字。随机有两种：`{{random}}` 每次求值都重抽；`{{pick}}` 的种子由聊天 ID、整段原文和宏在原文里的位置拼成，同一局里永远抽到同一个：

```js title="模版 · public/scripts/macros/definitions/core-macros.js:388-405"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/macros/definitions/core-macros.js:388:405"
```

聊天 ID 取的是主聊天的名字，从这局开出的分支也用同一个：

```js title="模版 · public/scripts/macros/definitions/core-macros.js:471-481"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/macros/definitions/core-macros.js:471:481"
```

**效果**：

```text title="效果 · 宏引擎实算"
--8<-- "projects/sillytavern/assets/sim/txt/macros.txt"
```

`{{pick}}` 同一局四次都一样，换一局才变；想重抽，用 `/reroll-pick` 改种子。

## 谁管什么 { #split }

- **程序**：字段落进哪个槽、示范对话什么时候让位、角色笔记的深度、`{{original}}` 和 `{{pick}}` 的求值规则
- **卡作者**：每个字段写什么，要不要覆盖全局指令、要不要用 `{{original}}` 接上原文
- **用户**：要不要让卡覆盖（两个开关）、人设写什么放哪、开局选哪个开场白
- **模型**：只读拼好的结果，不知道这些内容来自哪个字段

## 实跑原件 { #sim-files }

??? abstract "构造的完整版卡：在译本上补齐各字段"

    ```json
    --8<-- "projects/sillytavern/assets/sim/material/seraphina-full.constructed.json"
    ```

??? abstract "字段落槽的完整账本"

    ```json
    --8<-- "projects/sillytavern/assets/sim/out/assembly-card-slots.json"
    ```
