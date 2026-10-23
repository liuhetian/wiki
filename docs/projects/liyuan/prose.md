---
description: "梨园的正文怎么产出：一轮对话里模型能反复调工具，正文写在稿纸上能定点改，收笔即结束这一轮，上一轮能原位改，文字通道里的格式块补回定稿；岔口用 ask 交给用户；写长篇用 agent 模式，一章一个文件、正文不进上下文、轮末存检查点。每一步给出拼接模版和实跑效果"
---

<figure markdown>
  ![扮演模式一轮的七步：用户说一句、先查、写在稿纸上、定点改、ask 决策卡、收笔、场记记账](assets/beat-flow-infographic.png)
</figure>

# 正文怎么产出：写在稿纸上的工件

网页版 ChatGPT 的正文就是那条回复，生成一次就定了，想改一句只能整篇重来。梨园把正文当成工件：扮演模式写在稿纸上，一轮之内能查、能写、能改，收笔才算交付；写长篇的 agent 模式更进一步，正文就是磁盘上的文件。下面每一步都给出梨园源码里的模版，和同一段代码真跑出来的效果。

## 一轮对话里，模型能反复调工具 { #beat }

**问题**：生成一次就交差，模型没机会先查设定、写完再改。

梨园跑在 pi 这个 coding agent 上，一轮就是 pi 的一次 agent 循环：模型可以反复调工具，最多 20 个工具回合。梨园用扩展钩子接管两样东西——system 在 pi 自己那份后面接上扮演的那份，消息列表整个换成梨园从会话树重建的版本：

```ts title="模版 · .liyuan/extensions/roleplay.ts:1257-1269"
--8<-- "projects/liyuan/assets/liyuan-src/extensions/roleplay.ts:1257:1269"
```

实跑第二轮第一次调用时，system 之后发出去的消息列表是这样的：开场白，第一轮的问答只留定稿，末条是数据块加本轮原话（[状态](state.md#snapshot)、[设定](setting.md#search)两页讲过这些块怎么来）：

```text title="效果 · 第二轮第一次调用的 messages"
--8<-- "projects/liyuan/assets/sim/txt/round2-messages.txt"
```

同时发出去的还有 33 个工具，说明加参数共 13221 字，是 system 本身的 6 倍多。这次调用一共 7519 token，其中 6784 命中了前缀缓存——system 和工具说明逐字不变，每轮只有末尾几条是新的。

查不查、写多长、何时停下来问用户、何时收笔，都由模型自己定。扮演定义只管住一件事——什么叫写完（「拍」是梨园对一轮的叫法）：

> 一拍的结束条件是**正文已经交付**——不是「计划已列」，也不是「工具已调」。

## 稿纸：正文能定点改 { #draft }

**问题**：回复不可逆，模型为了一次写对只能在思考里反复打草稿。`src/draft.ts:4` 记着一次实测：改一处就得把全稿在脑内重誊一遍，25k 字的思考里正文出现了两遍。

正文改写在稿纸上，由引擎保管；每次写都带版本号，版本对不上整批不改：

```ts title="模版 · src/stage/tools.ts:115-140"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/tools.ts:115:140"
```

实跑第一轮的四次调用：先并发三个检索，再补查一个，然后一次 `draft_write` 写完，最后 `draft_seal`：

```text title="效果 · 第一轮的模型调用"
--8<-- "projects/liyuan/assets/sim/txt/round1-calls.txt"
```

第三次调用的思考有 4485 字，模型在里面定了怎么写；稿纸上落下的是 259 字的定稿：

```text title="效果 · 第一轮定稿"
--8<-- "projects/liyuan/assets/sim/txt/round1-final.txt"
```

## 收笔就结束这一轮 { #seal }

**问题**：模型交完稿还会接着说话，或者收了笔又想改。

`draft_seal` 成功，工具回执带上 `terminate`，pi 的循环就此停下，模型没有下一次调用的机会；改上一轮的 `previous_draft_edit` 同理：

```ts title="模版 · src/stage/engine.ts:1883"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/engine.ts:1883:1883"
```

实跑三轮的最后一次调用都是 `draft_seal` 或 `previous_draft_edit`，之后没有别的。收笔之后，定稿交给[场记](state.md#scribe)记账，再判断要不要[压缩](memory.md#compact)。

模型写了稿却没收笔，这一轮算没写完：界面提示「本拍尚未收笔」，场记不记账，也不触发压缩。

## 上一轮能原位改 { #previous }

**问题**：用户说「上一轮那句改成……」，重写这一轮是绕路，原来那句还留在历史里。

```ts title="模版 · src/stage/tools.ts:141-148"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/tools.ts:141:148"
```

实跑第三轮，用户说：「上一轮她最后那句『我倒想先问一句——你从哪里来，又为什么要寻他？』，改成『这些年，他过得好吗？』」。模型先读、再改，两次调用：

```text title="效果 · 第三轮的模型调用"
--8<-- "projects/liyuan/assets/sim/txt/round3-calls.txt"
```

<div class="grid" markdown>

```text title="效果 · 第二轮定稿（改前）"
--8<-- "projects/liyuan/assets/sim/txt/round2-final.txt"
```

```text title="效果 · 第三轮改完的第二轮"
--8<-- "projects/liyuan/assets/sim/txt/round3-after.txt"
```

</div>

只有最后一句变了，其余逐字保留。这一轮不产生新回复，历史里第二轮那条直接换成改后的版本；账本和记忆不跟着重算。

## 稿纸之外的输出 { #direct }

**问题**：有的模型不调稿纸工具，直接把正文当回复输出；有的写了稿纸，又在文字通道里输出状态栏这类格式块。

稿纸还空着、模型直接输出了正文，引擎把这段文字代收成一次 `draft_write`；模型写了稿、没再调工具就停了，后面的文字代收成 `draft_append`：

```ts title="模版 · src/stage/engine.ts:1405-1418"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/engine.ts:1405:1418"
```

定稿以稿纸为主体，文字通道里的东西只认格式块，补在后面：

```ts title="模版 · src/stage/engine.ts:1189-1196"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/engine.ts:1189:1196"
```

```ts title="模版 · src/stage/engine.ts:576-599"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/engine.ts:576:599"
```

拿第一轮的稿纸过两遍 `mergeFinalText`。例一的文字取自实跑里模型的一次真实输出，它把稿纸上的正文又缩写着说了一遍；例二是构造的格式块：

```text title="效果 · mergeFinalText 的两次合并"
--8<-- "projects/liyuan/assets/sim/txt/tail.txt"
```

重述的正文是闲聊，整段丢掉；`<status>` 是格式块，补到定稿末尾。

## 岔口交给用户 { #ask }

<figure markdown>
  ![决策卡：模型问是否把一条角色档案写入知识库，下面是「写入」「不写入」两个选项和一个自由输入框](assets/choice-card.png)
  <figcaption>ask 决策卡：选项之外还能自己写。这张是早期版本的界面</figcaption>
</figure>

**问题**：模型替用户选剧情走向，甚至替用户的角色说话、做决定。

`ask` 让模型停下来，给几个选项和一个自由输入框，用户拍板后再接着演。什么时候该问，写在工具说明里：

```ts title="模版 · src/stage/tools.ts:153-181"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/tools.ts:153:181"
```

实跑第二轮，用户说「接下来我该怎么做？给我几个选项」。模型思考的头一句就是「用户在求方向，要求给选项」，第一次调用就是 `ask`；模拟用户选了第一项，模型再去查设定、写稿、收笔：

```text title="效果 · 第二轮的模型调用"
--8<-- "projects/liyuan/assets/sim/txt/round2-calls.txt"
```

定稿就是上面[改前](#previous)那份：旅人放下茶盏直问生死，青梧答「没有」——按用户选的那一项演。

## 写长篇：agent 模式，正文是文件 { #agent }

<figure markdown>
  ![agent 模式像一栋三层楼：楼上是讨论区，中层是一章一个文件的正文目录，地下是存检查点的历史目录](assets/agent-mode-infographic.png)
</figure>

**问题**：想写成一部长篇，要回头改第三章的某一句；扮演模式里正文是一轮轮的回复，改不到那么远。

新建项目时可以选 agent 模式（默认是扮演），建好不能切换。这时用户是导演，讨论和正文分开，正文是 `正文/` 下一章一个 `.md`，模型用 pi 原生的 `read`、`grep`、`edit`、`write` 改。system 换一份身份说明，后面照接卡的两层：

```ts title="模版 · src/stage/agent.ts:21-38"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/agent.ts:21:38"
```

```markdown title="模版 · assets/AGENT_APPEND_SYSTEM.md 开头"
--8<-- "projects/liyuan/assets/liyuan-src/assets/AGENT_APPEND_SYSTEM.md:1:15"
```

正文不进上下文。实跑把开场白和前两轮的定稿存成三章，用户说「第一章里她答的那句『记得。』太干了，改得更有余味一点；第二章结尾补一句雨停了的描写」。随这句话附上的状态块只有账本、名录和【正文目录】：

```text title="效果 · agent 轮的项目状态块"
--8<-- "projects/liyuan/assets/sim/txt/agent-stateblock.txt"
```

模型要看正文只能自己读。三次调用：先把三章都读一遍，再两处定点改，最后在讨论区说改了什么——正文落在文件里，讨论区只放讨论：

```text title="效果 · agent 轮的模型调用"
--8<-- "projects/liyuan/assets/sim/txt/agent-calls.txt"
```

??? abstract "效果 · agent 轮的完整 system"

    ```markdown
    --8<-- "projects/liyuan/assets/sim/txt/agent-system.txt"
    ```

## 检查点：改坏了能回去 { #checkpoint }

**问题**：一轮改了好几章，改坏了想回到改之前。

每轮结束，把 `正文/` 下每个文件按内容哈希存进 `历史/对象/`，同样的内容不重存；整份文件清单和上一个检查点比，变了才往 `检查点.jsonl` 追加一行。文件头说得直白：「这是 git 的 blob＋tree，没有 git 的分支/合并/远端」。

```ts title="模版 · src/stage/story-history.ts:185-204"
--8<-- "projects/liyuan/assets/liyuan-src/src/stage/story-history.ts:185:204"
```

上面那一轮结束时落下的检查点：

```json title="效果 · 轮末检查点"
--8<-- "projects/liyuan/assets/sim/txt/checkpoint.json"
```

`000-开场.md` 的哈希和导入时那个检查点相同，没重存；改过的两章各多一个对象，`历史/对象/` 里一共 5 个。恢复有两种：只把正文文件恢复到某个检查点、讨论不动；或者文件和对话一起回到那一轮之前，前端的「撤销本轮」就是后者。

## 谁管什么 { #split }

- **程序**：工具回合上限、稿纸版本、收笔即停、直出代收、格式块补回、存检查点
- **模型**：查不查、怎么写、改哪句、何时 `ask`、何时收笔；agent 模式里读哪章、改哪章
- **用户**：在 `ask` 的岔口拍板，要求改上一轮；agent 模式里当导演、选恢复方式

## 实跑原件 { #sim-files }

??? abstract "第三轮完整记录：改上一轮"

    ```json
    --8<-- "projects/liyuan/assets/sim/out/round3.json"
    ```

??? abstract "agent 轮完整记录：system、状态块、每次调用、两个检查点"

    ```json
    --8<-- "projects/liyuan/assets/sim/out/agent.json"
    ```
