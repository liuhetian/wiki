---
description: "酒馆怎么每轮从零重拼 prompt：一段 system prompt 拆成可排序的具名槽位；作者注释、角色笔记、世界书、/inject 都按「距末尾第几条」插进历史，同深度按角色和键名排序；预算先放固定部分，历史从新往旧连续填，示范对话最后拿余量。每一步配源码模版和实跑效果"
---

# 每轮现拼 prompt：放哪、放不下砍谁

网页版 ChatGPT 的 prompt 只有两段：开头一段 system prompt，后面是全量回放的历史。写在开头的规矩，聊得越久离生成点越远；历史一长就超出窗口，被截掉的往往是开头的人设。酒馆每轮从零重拼一遍：内容拆进具名的槽，指令按「距末尾第几条」插进历史，固定部分先占位，历史从新往旧填满剩下的预算。下面是 Chat Completion 路径（发消息数组的 API）的拼法，效果都是用酒馆自己的函数拼出来的。

## 一段 system prompt 拆成具名槽位 { #slots }

**问题**：baseline 的 system prompt 是一整段，人设、设定、规矩挤在一起，哪段放前哪段放后改不了，也没法单独关掉一段。

**功能**：Prompt Manager 把 prompt 拆成一串条目。有正文的条目由用户写（主提示 `main`、末尾指令 `jailbreak` 等）；没正文的叫 marker，运行时才填（`charDescription`、`worldInfoBefore`、`chatHistory`……）。出厂顺序：

```js title="模版 · public/scripts/PromptManager.js:2087-2099"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/PromptManager.js:2087:2099"
```

拼的时候每个槽按它在顺序里的下标落位，调用先后不影响结果，最终顺序就是用户拖出来的顺序：

```js title="模版 · public/scripts/openai.js:1187-1218"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:1187:1218"
```

**效果**：扮演主线第一轮实际拼出来的消息数组，每行是一条消息：token 数、槽、角色、开头：

```text title="效果 · 第一轮的拼装"
--8<-- "projects/sillytavern/assets/sim/txt/as-r1-ledger.txt"
```

空的槽（人设、性格、场景）不发出去。用户在顺序里加一条自定义的「写作规则」，先按顺序放，再把它改成「放进聊天里，深度 1」：

```text title="效果 · 同一条规则，按顺序放 / 改成深度 1（dry run）"
--8<-- "projects/sillytavern/assets/sim/txt/as-order.txt"
```

## 每轮从零重拼 { #every-round }

**问题**：baseline 的 system prompt 一写就定，每轮原样回放；该随剧情变的东西（眼下用得上的设定、这几轮的规矩）没有地方放。

**功能**：每次生成，作者注释、世界书、角色笔记、用户人设都重新算一遍，再进拼装：

```js title="模版 · public/script.js:4618-4636"
--8<-- "projects/sillytavern/assets/st-src/public/script.js:4618:4636"
```

**效果**：主线每一步的世界书和总量：

```text title="效果 · 主线各步的拼装"
--8<-- "projects/sillytavern/assets/sim/txt/as-rounds.txt"
```

前七步聊天里一直有森林、魔法这些词，四个条目一直在；第四轮续写起，最近两条讲的是吟游诗人和点灯，世界书全部退场，省下 893 个 token。同一张卡、同一本书，每轮发出去的 prompt 都不一样。

## 按「距末尾第几条」插：深度注入 { #depth }

**问题**：主提示里写「保持第三人称」，聊到第 80 轮，模型开始用第一人称——指令在最前面，离生成点几千 token，模型以历史为准。

**功能**：一张全局的注入表，任何模块都往里登记一段文字，带四个属性：放哪（主提示前 / 后、聊天里、不放）、深度、角色、要不要参与世界书扫描：

```js title="模版 · public/script.js:8926-8935"
--8<-- "projects/sillytavern/assets/st-src/public/script.js:8926:8935"
```

作者注释、角色笔记、世界书的 @深度条目、用户人设、`/inject`、摘要、向量召回都登记在这里。「聊天里」那一类按深度插：深度 0 在最后一条之后，深度 4 在倒数第 4 条之前。从深度 0 往上逐层处理，已插入的条数不算深度：

```js title="模版 · public/scripts/openai.js:842-870"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:842:870"
```

作者注释还能隔几轮插一次（出厂每轮都插，深度 4，system）：

```js title="模版 · public/scripts/authors-note.js:346-362"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/authors-note.js:346:362"
```

**效果**：完整版卡（带角色笔记）、作者注释、两条世界书 @深度 4（一条 system、一条 user）、一条 `/inject`（assistant，深度 4）、用户人设 @深度 2，拼主线最后一轮。注入表：

```text title="效果 · 这一轮的注入表"
--8<-- "projects/sillytavern/assets/sim/txt/as-injection-table.txt"
```

拼出来的聊天部分：

```text title="效果 · 注入落位（dry run）"
--8<-- "projects/sillytavern/assets/sim/txt/as-injections.txt"
```

深度 4 上的五样东西合成了三条消息。顺序规则写死在代码里：

- **同一深度、不同角色**：各成一条，从上到下 assistant → user → system，system 离生成点最近（注释原话「most important go lower」）
- **同一深度、同一角色**：合成一条，按注入表的键名字典序排；作者注释的键特意起名 `2_floating_prompt`，源码注释写着「for sorting lower than memory」，排在摘要 `1_memory` 之后
- **末尾指令**：是 `jailbreak` 槽，排在整个聊天历史之后，比深度 0 还靠后

## 预算：固定部分必放，历史从新往旧，示范拿余量 { #budget }

**问题**：全量回放，聊长了要么超出窗口报错，要么被从前面截断，截掉的是人设。

**功能**：预算 = 上下文上限 − 回复长度（出厂 4095 − 300）：

```js title="模版 · public/scripts/openai.js:3982-3989"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:3982:3989"
```

填的次序：

1. 主提示、角色卡、世界书、末尾指令这些固定槽先放，放不下就报错
2. 聊天历史从最新一条往旧填，第一条放不下就停——不会跳过一条长消息去塞更旧的短消息，进上下文的总是连续的最近一段：

    ```js title="模版 · public/scripts/openai.js:947-955，1070-1074"
    --8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:947:955"
    --8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:1070:1074"
    ```

3. 示范对话最后拿剩余的预算，整块放或整块丢：

    ```js title="模版 · public/scripts/openai.js:1124-1126"
    --8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:1124:1126"
    ```

    用户可以把示范对话设成「总是放」，那它就排在历史前面先占位：

    ```js title="模版 · public/scripts/openai.js:1336-1343"
    --8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:1336:1343"
    ```

**效果**：完整版卡（带示范对话），主线最后的 11 条聊天，上下文上限分别设成出厂的 4095、2048、1400：

```text title="效果 · 三档上下文各留下什么（h 是第几条历史，ex 是示范对话）"
--8<-- "projects/sillytavern/assets/sim/txt/as-budget.txt"
```

4095 全放得下；2048 先丢示范对话，历史一条不少；1400 再从最旧的开始丢，开场白和前四条都出去了，角色笔记（h8）和末尾指令照样在。

## 截断线标在界面上 { #in-context }

**问题**：baseline 被截断是静默的，用户不知道模型已经看不见哪些消息。

**功能**：拼完数一下进了上下文的消息条数，在聊天界面倒数那一条上加一个标记，并记进聊天文件头：

```js title="模版 · public/script.js:6083-6101"
--8<-- "projects/sillytavern/assets/st-src/public/script.js:6083:6101"
```

上面 1400 那档，标记会落在倒数第 6 条上。Prompt Manager 还会把每个槽的 token 数显示出来，历史占得太少时提示用户关掉别的条目。

## 谁管什么 { #split }

- **程序**：每轮重拼、槽位按顺序落位、深度注入的放置和排序、预算的填法和砍法、截断线
- **用户**：槽的顺序和开关、自定义条目放哪、作者注释写什么插多深隔几轮、上下文上限和回复长度、示范对话放不放
- **卡作者、世界书作者、扩展**：往槽里和注入表里写内容
- **模型**：只看到拼好的消息数组

## 实跑原件 { #sim-files }

??? abstract "注入落位的完整账本"

    ```json
    --8<-- "projects/sillytavern/assets/sim/out/assembly-injections.json"
    ```

??? abstract "三档上下文的完整账本"

    ```json
    --8<-- "projects/sillytavern/assets/sim/out/assembly-budget.json"
    ```
