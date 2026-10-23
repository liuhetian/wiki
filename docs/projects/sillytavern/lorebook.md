---
description: "酒馆的世界书怎么让设定按需进场：每轮只扫最近 2 条消息，关键词命中才注入；次关键词消歧、条目内容再触发别的条目、预算按上下文的 25% 封顶溢出即停、同组只留一条、sticky/cooldown/delay 按聊天条数计时、8 个插入位置。判定过程取自酒馆自己的调试日志"
---

# 世界书：设定按关键词进场

网页版 ChatGPT 的设定只能写进 system prompt：几万字的世界观塞不下，塞进去了也稀释注意力，聊天里提没提到都占着位置。酒馆的世界书（World Info，也叫 Lorebook）把设定拆成条目，每个条目带一组关键词；每轮生成前扫一遍最近的聊天，命中了才把这一条注入。下面的「效果」都是直接调 `world-info.js` 的 `checkWorldInfo` 跑出来的，判定过程取自酒馆自己打的 `[WI]` 调试日志。

所用的书是随包的 Eldoria 译成中文的「埃尔多利亚」，四个条目：埃尔多利亚、影牙、林间空地、力量，绑在塞拉菲娜的卡上。出厂设置：扫描深度 2、预算 25%、递归开、整词匹配开。

## 只扫最近几条，关键词命中才进场 { #scan }

**问题**：设定全塞进 system prompt，上下文贵，注意力被稀释，大世界根本塞不下。

**功能**：每轮把最近 N 条消息（出厂 2 条）连成一段扫描文本，每条消息前加一个 `\x01` 分隔符，方便写正则锚定说话人：

```js title="模版 · public/scripts/world-info.js:295-297"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:295:297"
```

条目的任一主关键词出现在扫描文本里，就进入候选。关键词先展开宏，所以可以写 `{{char}}`：

```js title="模版 · public/scripts/world-info.js:4910-4935"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:4910:4935"
```

常驻条目（社区叫「蓝灯」）不看关键词，直接进候选，但之后的概率、分组、预算照样要过：

```js title="模版 · public/scripts/world-info.js:4893-4897"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:4893:4897"
```

**效果**：扮演主线第一轮，扫描文本是开场白加用户这句（消息前带名字，`world_info_include_names` 出厂开着）：

```text title="效果 · 第一轮的扫描文本（最近 2 条，新的在前）"
--8<-- "projects/sillytavern/assets/sim/txt/lb-scan-text.txt"
```

`checkWorldInfo` 自己的判定日志：

```text title="效果 · 第一轮世界书的判定过程"
--8<-- "projects/sillytavern/assets/sim/txt/lb-real-trace.txt"
```

第一轮循环里，开场白的「森林」「野兽」「魔法」各命中一条。这三条的内容进了这一轮；第四条「林间空地」是第二轮循环找到的，见下面[递归](#recursion)。

## 次关键词消歧 { #secondary }

**问题**：同一个词在不同话题里指不同的东西，只按一个词触发，就会在错的话题里塞进错的设定。

**功能**：条目可以再挂一组次关键词，和主关键词按四种逻辑组合：次关键词任一命中、全都命中、全都没命中、不全命中：

```js title="模版 · public/scripts/world-info.js:4955-4975"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:4955:4975"
```

**效果**：构造两个主关键词都是「苹果」的条目，一个要求次关键词「手机 / 发布会」任一命中，一个要求都不命中：

```text title="效果 · 次关键词（构造的输入）"
--8<-- "projects/sillytavern/assets/sim/txt/lb-secondary.txt"
```

## 递归：条目引出条目 { #recursion }

**问题**：设定之间互相引用：聊天里提到了埃尔多利亚，它的条目里又说到林间空地，可聊天里没出现「林间空地」，模型就不知道那是什么。

**功能**：一轮循环激活的条目，内容拼起来加进扫描文本，再扫一轮，直到没有新条目：

```js title="模版 · public/scripts/world-info.js:5096-5100"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:5096:5100"
```

```js title="模版 · public/scripts/world-info.js:5135-5144"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:5135:5144"
```

条目上有三个开关管递归：`preventRecursion`（内容不再触发别的），`excludeRecursion`（不能被递归触发），`delayUntilRecursion`（只能被递归触发，第一轮扫描一律压住）：

```js title="模版 · public/scripts/world-info.js:4860-4868"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:4860:4868"
```

**效果**：真实输入下，关掉递归少一条：

```text title="效果 · 第一轮，递归开 / 关"
--8<-- "projects/sillytavern/assets/sim/txt/lb-real-norecursion.txt"
```

构造一条链：「银溪谷」的内容提到荆棘魔，「荆棘魔」的内容提到影牙，「影牙的来历」设了 `delayUntilRecursion`：

```text title="效果 · 递归链（构造的输入）"
--8<-- "projects/sillytavern/assets/sim/txt/lb-recursion.txt"
```

用户直接问「影牙到底是什么」，这条反而不进场：它只给「被别的设定提到时」补细节，作者能分层揭示，先给概要，细节等别的条目带出来。

## 预算：按上下文比例封顶，溢出就停 { #budget }

**问题**：世界书一扩张，就把聊天历史挤掉了。

**功能**：每轮的世界书预算 = 上下文上限 × 比例（出厂 25%），可以再设一个绝对上限：

```js title="模版 · public/scripts/world-info.js:4736-4741"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:4736:4741"
```

候选按优先级逐条累加，第一次超预算就记下溢出，之后本轮不再收（标了 `ignoreBudget` 的除外），递归也停：

```js title="模版 · public/scripts/world-info.js:5057-5076"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:5057:5076"
```

**效果**：第一轮的真实聊天，用户把世界书预算从 25% 调到 10%：

```text title="效果 · 世界书预算 25% / 10%"
--8<-- "projects/sillytavern/assets/sim/txt/lb-budget.txt"
```

这不是背包算法：第一条放不下，后面体积更小、本来放得下的条目也一起不要。优先级先看 sticky，再看来源（聊天绑的书、人设绑的书排在角色书和全局书前面），最后看条目的 `order`。

## 互斥组和概率 { #group }

**问题**：输入一样，拼出来的 prompt 就一样，随机事件做不出来；几个互斥的变体（晴、雨、雾）同时命中，只该要一个。

**功能**：同组的条目只留一条：有勾了优先的取 `order` 最高的，否则按权重抽签。条目还可以带触发概率：

```js title="模版 · public/scripts/world-info.js:5451-5465"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:5451:5465"
```

```js title="模版 · public/scripts/world-info.js:5041-5048"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:5041:5048"
```

**效果**：构造三个天气条目放进同一组，权重 60 / 30 / 10，再加一条 30% 概率的「偶遇商队」，用 10 个固定种子各跑一次：

```text title="效果 · 互斥组和概率（构造的输入，固定种子）"
--8<-- "projects/sillytavern/assets/sim/txt/lb-group.txt"
```

## 定时效果：按聊天条数计时 { #timed }

**问题**：每轮从零扫描，没有跨轮状态：进了地牢，地牢规则只在提到「地牢」的那两条里有效；伏笔一提就触发，没法「过几轮再说」。

**功能**：三种定时效果，时钟是聊天条数：

- **sticky**：激活后在接下来 N 条里无条件在场
- **cooldown**：激活后 N 条里压住，不管有没有命中
- **delay**：聊天不满 N 条时压住

计时存在聊天文件头的 `chat_metadata.timedWorldInfo` 里，起点、终点都是当时的聊天长度：

```js title="模版 · public/scripts/world-info.js:604-611"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:604:611"
```

每轮检查时，聊天没有比起点更长，就说明这是重来（swipe、regenerate），计时作废：

```js title="模版 · public/scripts/world-info.js:626-630"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:626:630"
```

**效果**：构造一段八条的地牢对话。「地牢规则」sticky 2、cooldown 3；「伏兵」关键词「走廊」、delay 6；每加一条消息扫一次：

```text title="效果 · 定时效果逐条（构造的输入）"
--8<-- "projects/sillytavern/assets/sim/txt/lb-timed.txt"
```

第 5 条明明提到「地牢」，正在冷却，没进场；「伏兵」第 3 条起就被「走廊」命中，一直压到第 6 条。sticky 到期时如果配了 cooldown，会立刻挂上一个受保护的 cooldown，重来也删不掉。重来的情形：

```text title="效果 · 聊天没有前进时，计时作废"
--8<-- "projects/sillytavern/assets/sim/txt/lb-timed-swipe.txt"
```

## 插到哪 { #positions }

**问题**：设定放在开头，离生成点远，影响弱；有的设定是「现在的天气」，应该贴着最新消息。

**功能**：每个条目选一个位置，共 8 种：

```js title="模版 · public/scripts/world-info.js:855-864"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:855:864"
```

按位置分发：角色定义前后两段并成字符串，进 Chat Completion 的 `worldInfoBefore` / `worldInfoAfter` 两个槽；示范对话前后的并进示范对话；作者注释顶部和底部的改写作者注释；@深度的按深度和角色分组，注册成深度注入；outlet 只给宏 `{{outlet::名}}` 取用：

```js title="模版 · public/scripts/world-info.js:5203-5247"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:5203:5247"
```

**效果**：构造六条蓝灯条目各放一个位置，打开作者注释，拿第二轮的真实聊天整轮拼一次：

```text title="效果 · 各位置的条目落在哪（构造的输入，dry run）"
--8<-- "projects/sillytavern/assets/sim/txt/lb-positions.txt"
```

作者注释顶部的条目只在作者注释本轮出现时才进来，作者注释隔几轮插一次时，它也跟着隔轮缺席。

## 关键词覆盖不到的：向量匹配 { #vector }

**问题**：用户说「那个长胡子的巫师」，没说名字，关键词命中不了。

**功能**：条目可以标成向量匹配，由向量扩展在生成前用最近 2 条消息做相似度检索（取前 5 条、阈值 0.25），命中的条目通过事件送进世界书，只替代关键词判定，之后的概率、分组、预算照常：

```js title="模版 · public/scripts/world-info.js:1020-1029"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/world-info.js:1020:1029"
```

这一节没跑：要另起一个 embedding 服务。文档自己的建议是要确定、可预期的结果就用关键词。

## 谁管什么 { #split }

- **程序**：扫多少条、怎么匹配、递归几轮、预算怎么算怎么砍、组里留谁、计时什么时候作废、每个位置怎么分发
- **世界书作者**：条目写什么、关键词怎么挑、放哪个位置、要不要递归、概率和定时效果怎么设
- **用户**：扫描深度、预算比例、递归开关，哪些书挂全局、哪些绑角色或聊天
- **模型**：不参与。哪些设定进场在生成前就定了，模型只看到结果

## 实跑原件 { #sim-files }

??? abstract "中文世界书「埃尔多利亚」"

    ```json
    --8<-- "projects/sillytavern/assets/sim/material/eldoria.zh.json"
    ```

??? abstract "各组实验的原始输出：判定日志和激活结果"

    ```json
    --8<-- "projects/sillytavern/assets/sim/out/lorebook-A-real-r1.json"
    ```

    ```json
    --8<-- "projects/sillytavern/assets/sim/out/lorebook-C-recursion.json"
    ```

    ```json
    --8<-- "projects/sillytavern/assets/sim/out/lorebook-F-timed.json"
    ```
