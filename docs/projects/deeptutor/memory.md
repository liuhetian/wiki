---
description: "DeepTutor 记忆：不是藏起来的向量库，是三层看得见、改得了的文件；L1 按场景按天追加原始事件，L2 每个场景一份 markdown、每条事实用脚注指回 L1 证据，L3 是跨场景的画像；改记忆是一批整体校验的操作，归并要人点、模型只能引它这一块里看得见的来源，回到对话时只带 L3；每步配源码模版和实跑效果"
---

# 记忆：一份带脚注、改得了的 markdown

聊天网页的记忆有两种毛病——开个新对话它就不认识你；开了「记忆」功能，它记了什么、从哪句话记的、记错了怎么改，你都看不见。DeepTutor 的记忆是三层文件：L1 是原始事件，按场景、按天追加；L2 是每个场景一份 markdown，每条事实用脚注指回 L1 的证据；L3 是跨场景的综合，学习者画像、最近在学什么、材料范围。从 L1 长出 L2、从 L2 长出 L3 要调模型，但只在你点了才跑，每一步都能撤回；回到对话里的只有 L3。下面用构造的统计学学习记录跑上游代码，调模型的那一步不跑。

## 三层是三种文件 { #layers }

**问题**：模型说「我记得你上次卡在 p 值上」，你没法查它是从哪次对话记下的，也没法删。

**功能**：记忆根目录下三层各是一种文件，路径写在 `paths.py` 的开头：

```python title="模版 · deeptutor/services/memory/paths.py:1-12"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/memory/paths.py:1:12"
```

L1、L2 按七个场景分（聊天、笔记本、测验、知识库、书、伙伴、写作），L3 分四个槽：

```python title="模版 · deeptutor/services/memory/paths.py:48-60"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/memory/paths.py:48:60"
```

L1 只追加，写失败只记日志、不抛错——记忆坏了不能拖垮正在用的功能：

```python title="模版 · deeptutor/services/memory/trace.py:66-79"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/memory/trace.py:66:79"
```

**效果**：构造一条聊天事件，追加进当天文件的就是这样一行：

```text title="效果 · L1 的一行"
--8<-- "projects/deeptutor/assets/sim/txt/memory-document.txt:1:2"
```

id 前缀是场景名，后 26 位是带毫秒时间戳的 ULID，按字符串排序就是时间顺序。

## 每条事实带脚注 { #document }

**问题**：记下一句「学习者常把 p 值读成 H0 为真的概率」，三周后谁也说不清这条从哪来、现在还对不对。

**功能**：L2、L3 都是普通 markdown：一个标题，几个小节，每条事实一行，行尾用脚注标来源，再用一段 HTML 注释留住这一条的 id：

```python title="模版 · deeptutor/services/memory/document.py:3-29"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/memory/document.py:3:29"
```

写回时每个来源只占一个编号，按首次出现排，两条引同一个来源就共用一个脚注：

```python title="模版 · deeptutor/services/memory/document.py:193-201"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/memory/document.py:193:201"
```

**效果**：构造一份旧格式的「聊天」L2——脚注按条目编号，一个脚注里写好几个来源。`parse` 两种格式都认，`serialize` 一律写成新格式，再读再写逐字不变：

```text title="效果 · parse 和 serialize"
--8<-- "projects/deeptutor/assets/sim/txt/memory-document.txt:4:41"
```

来源是 `场景:实体 id`，指向 L1 里某一次对话、某一道题。文件本身就是界面：记忆页的编辑器直接改这份 markdown，删一条就是删一行。

## 改记忆是一批受校验的操作 { #ops }

**问题**：让模型直接重写记忆文件，它会丢条目、编来源，还可能在同一次输出里先改一条、再把它删了。

**功能**：程序写记忆只走三种操作：加、改、删。一批操作先整体校验，全部合格才动文件，有一条不合格整批作废：

```python title="模版 · deeptutor/services/memory/ops.py:18-20"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/memory/ops.py:18:20"
```

```python title="模版 · deeptutor/services/memory/ops.py:68-84"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/memory/ops.py:68:84"
```

```python title="模版 · deeptutor/services/memory/ops.py:120-129"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/memory/ops.py:120:129"
```

**效果**：一批合法操作，再五批各有一处毛病的（都是构造的）：

```text title="效果 · ops.apply"
--8<-- "projects/deeptutor/assets/sim/txt/memory-ops.txt"
```

每条不超过 240 字、必须有合法格式的来源、删除理由只能是四个词之一——矛盾了、被取代、过时、信息量低。被拒的五批，文档一个字没动。

## 归并：模型只能引它看见的来源 { #consolidate }

**问题**：把一个月的对话一股脑丢给模型总结，它会编出处，也会把一句话从中间切开。

**功能**：从 L1 长 L2 叫 update（另有 audit 核对、dedup 去重两种模式），流程写在模块开头：

```python title="模版 · deeptutor/services/memory/consolidator/modes/update.py:1-17"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/memory/consolidator/modes/update.py:1:17"
```

新进来的 L1 按时间拼成一长串，每个实体前带一行 `@entity` 标记，再按段落边界切块，相邻块重叠一成：

```python title="模版 · deeptutor/services/memory/consolidator/chunker.py:43-60"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/memory/consolidator/chunker.py:43:60"
```

每块的来源池，是标记落在这一块范围里的实体：

```python title="模版 · deeptutor/services/memory/consolidator/references.py:64-79"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/memory/consolidator/references.py:64:79"
```

模型读完一块交回事实，每条事实的来源都要过这个池子。默认设置下，没写来源的整条丢掉，池外的来源剔掉，剔完不剩就整条丢；模型爱写成「标题:chat:id」的，剥掉前缀认回来：

```python title="模版 · deeptutor/services/memory/consolidator/references.py:125-163"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/memory/consolidator/references.py:125:163"
```

**效果**：四次聊天是构造的，模型输出也是构造的。默认最小块 1000 字，这里调成 200，好在短文本上看到切分：

```text title="效果 · 切块、来源池、过滤"
--8<-- "projects/deeptutor/assets/sim/txt/memory-consolidate.txt"
```

第 1 块只看得见 9 号和 12 号两次对话，所以引 20 号的那条丢了——它得等模型读到第 3 块再记。池子只管来源在不在这一块里，不管它是不是这条事实的出处：最后一条借着 12 号留下了，其实那句话出自 15 号。从 L2 长 L3 时，模型只拿到各场景条目的文字，不给来源编号，L3 的脚注只记来自哪个场景（`references.py:203-215`）。

归并不在对话后自动跑。上游只有记忆页的 Update、Audit、Dedup 按钮，经 `api/routers/memory.py:308` 的接口启动一次运行；点了 Update 之后，有新事实写入就接着去重，脚注合并也默认跟着跑（`update.py:325`、`:339`）。对话里模型唯一能写的是 L3 的偏好：

```python title="模版 · deeptutor/tools/builtin/__init__.py:1159-1166"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/tools/builtin/__init__.py:1159:1166"
```

每次写文件前存一份快照，跑完不满意可以一步步撤回：

```python title="模版 · deeptutor/services/memory/consolidator/runs.py:205-220"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/memory/consolidator/runs.py:205:220"
```

## 怎么回到对话里 { #recall }

**问题**：记住了，下次也得用上；可三层全塞进 prompt，一个月后光记忆就占满上下文。

**功能**：回合开了记忆引用时，执行器读一次 L3，四个槽拼成一段（`services/session/turns/executor.py:572`）；L1、L2 都不进 prompt：

```python title="模版 · deeptutor/services/memory/store.py:94-103"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/memory/store.py:94:103"
```

这段字进 `memory` 块。它属于运行时快照，不进 system prompt——system prompt 整轮保持逐字不变，快照挂在历史里，内容变了才追加一份新的：

```python title="模版 · deeptutor/agents/loop/prompt_blocks.py:27-40"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/loop/prompt_blocks.py:27:40"
```

```python title="模版 · deeptutor/agents/loop/prompt_blocks.py:112-117"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/loop/prompt_blocks.py:112:117"
```

另外，只要 L3 有内容，`read_memory` 工具就会挂上，模型可以按需去读，拿到的是同一段字（`agents/_shared/tool_composition.py:55`、`:299`）。

**效果**：在临时目录里写三份 L3 和一份 L2（内容是构造的），把上游的记忆根目录指过去，调 `read_l3_concat`：

```text title="效果 · 进 memory 块的那段字"
--8<-- "projects/deeptutor/assets/sim/txt/memory-recall.txt"
```

## 图谱是从文件里拼出来的 { #graph }

**问题**：几十个文件，人看不出哪条画像来自哪些对话。

**功能**：记忆图谱不另存数据，前端读三层文件现拼：L3 在内环，L2 在中环，L1 在外环按场景分扇区；L2 条目的脚注是指向 L1 实体的实线，L3 的场景脚注是指向该场景整片 L2 的虚线：

```ts title="模版 · web/lib/memory-graph.ts:579-591"
--8<-- "projects/deeptutor/assets/deeptutor-src/web/lib/memory-graph.ts:579:591"
```

仿真界面：照 `MemoryHub.tsx`、`MemoryGraph.tsx` 和 `memory-graph.ts` 的环半径、扇区规则做，自动播放——三环画出、节点逐层亮起、悬停一个 L2 节点时它的证据边亮起来。

<iframe src="/projects/deeptutor/assets/demos/memory-graph.html" style="width:100%;height:640px;border:1px solid #8884;border-radius:10px" loading="lazy" title="DeepTutor 仿真界面：记忆图谱"></iframe>

??? abstract "demo 源码：记忆图谱"

    ```html
    --8<-- "projects/deeptutor/assets/demos/memory-graph.html"
    ```

## 谁管什么 { #split }

- **程序**：三层的文件布局、L1 只追加、脚注编号、编辑批的校验和原子提交、切块、来源池、每次写入的撤回快照、只把 L3 带进对话
- **模型**：读一块 L1 抽事实、读 L2 写综合，交回的来源要过池子；对话里只能写偏好
- **学习者**：什么时候归并、跑哪种模式、撤不撤回，直接在记忆页改或删任何一行，每轮带不带记忆
- **上游留着的口子**：来源池只保证引的东西模型看过，不保证引得对；L3 的脚注只到场景，查不到具体是哪条 L2

## 实跑原件 { #sim-files }

??? abstract "四次聊天拼成的长串、切块和过滤的完整记录"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/memory-consolidate.json"
    ```

??? abstract "编辑批的完整记录"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/memory-ops.json"
    ```
