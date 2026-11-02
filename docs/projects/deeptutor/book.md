---
description: "DeepTutor 的 Book 引擎怎么把一章教材编成能从头学的书：先确认提案和书脊，确认前按模板报出字数和时间；页面一页一页编，同一页只编一次，连续两页因服务商失败就整本暂停；每种块都有文字投影，整本能导出 Markdown；教材改了按来源锚点标出过期页；进度和弱章从最近一次作答重算。每一步配源码模版和实跑效果"
---

# Book 引擎：先报价再开工，一页一页编，教材改了标出过期页

对聊天网页说「把第 8 章当一本书，一节课一节课教我」，模型会一口气往下讲，讲到哪算哪：第 3 节方向偏了只能整段重来，不知道要讲多久，中途断了没处接着讲，教材换了版，讲过的内容也不会知道自己过时了。DeepTutor 的 Book 引擎把这件事拆开——先定书脊、报价，确认了再一页一页编译，编完的页记着自己引了哪份材料。下面每一步给出源码里的模版和用 DeepTutor 自己的函数跑出的效果；材料是构造的：一本以《应用统计学》第 8 章为知识库的书《假设检验：从直觉到判断》。

下面是照前端源码做的仿真界面，自动播放：编辑书脊、确认、逐章编译，最后教材有改动、弹出过期提示。

<iframe src="/projects/deeptutor/assets/demos/books.html" style="width:100%;height:640px;border:1px solid #8884;border-radius:10px" loading="lazy" title="DeepTutor 仿真 demo：Book 引擎的书脊编辑器和阅读器"></iframe>

??? abstract "demo 源码：Book 引擎"

    ```html
    --8<-- "projects/deeptutor/assets/demos/books.html"
    ```

## 先确认，再生成 { #confirm }

**问题**：一次写完的六节里第 3 节方向偏了——只能整本重来，前面的调用全白花。

**功能**：建书分三步，每步停下等用户点头。先出提案：这本书讲什么、给谁、大约几章；确认后出书脊：每章的标题、学习目标、章节类型，可以增删改；再确认，才给每章建一个空页面、排进编译队列：

```python title="模版 · deeptutor/book/engine.py:9-20"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/book/engine.py:9:20"
```

确认书脊时，按书脊给每章建页面空壳；已经有的页面只同步标题和顺序，不重编：

```python title="模版 · deeptutor/book/engine.py:931-963"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/book/engine.py:931:963"
```

**效果**：没有实跑——提案和书脊都要模型生成，这里只贴模版。

确认书脊时引擎还会在最前面插一章「概览」，由书脊直接拼出章节索引和概念图，不调模型。

## 确认前先报价 { #estimate }

**问题**：一按「确认」就是几十次模型调用、十几分钟，用户不知道自己批准的是多大一件事。

**功能**：每种章节类型对应页面规划器里一张固定的块模板，估算直接从这张模板算——字数是每块的目标字数乘深度系数，时间按长文块 45 秒、其余块 15 秒。理论型一章的模板长这样：

```python title="模版 · deeptutor/book/agents/page_planner.py:74-93"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/book/agents/page_planner.py:74:93"
```

深度只有三档，乘在目标字数上：

```python title="模版 · deeptutor/book/models.py:100-104"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/book/models.py:100:104"
```

后端只报「每类一章」的成本：

```python title="模版 · deeptutor/book/estimate.py:22-59"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/book/estimate.py:22:59"
```

前端按书脊里每章的类型加起来，用户增删章节时估算跟着变，不用每次回后端：

```ts title="模版 · web/app/(workspace)/learning/books/components/SpineEditor.tsx:213-228"
--8<-- "projects/deeptutor/assets/deeptutor-src/web/app/(workspace)/learning/books/components/SpineEditor.tsx:213:228"
```

**效果**：用 DeepTutor 的 `chapter_basis` 算出每类一章的成本，再照前端的加法汇总一份构造的 5 章书脊（概念、理论、推导、理论、练习各一章）：

```text title="效果 · 每类一章的成本，和 5 章书脊的估算"
--8<-- "projects/deeptutor/assets/sim/txt/book-estimate.txt"
```

估算和生成共用同一张模板，报的块数就是会生成的块数。深度只放大字数、不改时间——每块的秒数是常数，深度 deep 和 brief 报的分钟数一样。

## 一页一页编，同一页只编一次 { #compile }

**问题**：用户点开第 3 章时，后台正好编到第 3 章，用户又按了一次「重新生成」——三路各跑一遍、各付一次钱，最后互相覆盖。服务商额度用完时，后面每一页都失败，留下一本半成品。

**功能**：每本书一个页面队列、一个后台 worker。任何要编某页的请求先查「正在编的表」：普通请求加入已经在跑的那一次，强制重编等它跑完再开新的一轮：

```python title="模版 · deeptutor/book/engine.py:1235-1266"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/book/engine.py:1235:1266"
```

一页里的块默认按顺序一块一块生成，生成一块往前端推一块，读者看到的顺序就是书的顺序：

```python title="模版 · deeptutor/book/compiler.py:219-227"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/book/compiler.py:219:227"
```

连续两页都因服务商层面的原因失败（额度、凭证、服务不可用），就熔断：清空队列、整本暂停，没编的页保持空白：

```python title="模版 · deeptutor/book/engine.py:101-106"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/book/engine.py:101:106"
```

```python title="模版 · deeptutor/book/engine.py:1529-1534"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/book/engine.py:1529:1534"
```

**效果**：没有实跑——这几段围着模型调用和 asyncio 任务转，这里只贴模版。

源码注释的原话是「没编的页是资产，编了一半的页是要用户收拾的垃圾」。熔断只认服务商层面的失败，某一块写崩了不算，那一页标成部分完成，不会每次打开都重花一遍钱。

## 块有类型，导出不丢东西 { #blocks }

**问题**：聊天里的讲解是一整段字，讲解、要点、测验混在一起，没法单独重做其中一段，也带不走。

**功能**：一页由有类型的块组成：长文 section、要点 callout、测验 quiz、闪卡、图、代码、动画、交互、时间线、概念图、延伸阅读等，每块单独生成、单独重做、单独改。整本能导出成一份 Markdown，每种块都有自己的文字投影；动画、交互这类没法用文字表达的，留一句说明，不悄悄丢掉：

```python title="模版 · deeptutor/book/export.py:222-259"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/book/export.py:222:259"
```

**效果**：构造一本两页的中文书，第 4 章编好了七块（其中一块生成失败），第 5 章还没编，用 `render_book_markdown` 导出：

```markdown title="效果 · 导出的 Markdown"
--8<-- "projects/deeptutor/assets/sim/txt/book-export.txt"
```

生成失败的块不出现在导出里，动画留下一句「无法用文本表示」，没编的章写明「尚未生成」。结构标签跟着书的语言走，中文书不会夹着英文的 Answer、Sources。

## 教材改了，标出哪几页过期 { #drift }

**问题**：讲义里 p 值的定义改了一句，书里引过这段的第 4 章还是旧说法，读者不会知道。

**功能**：编译完给知识库的每份原始文件存一个内容哈希，整库再合成一个指纹：

```python title="模版 · deeptutor/book/kb_health.py:80-89"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/book/kb_health.py:80:89"
```

打开书时重算一遍。指纹变了，先找出改动的文件，再让每个已编好的页按自己的来源锚点（章上的和块上的）去对：引了改动文件的页标过期；有锚点对不上任何已知文件的，宁可多标，也标过期，并把 fallback 记成真：

```python title="模版 · deeptutor/book/kb_health.py:238-280"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/book/kb_health.py:238:280"
```

**效果**：构造的知识库有三份原始文件。四个已编好的页面：第 2 章锚在教材 PDF 上，第 3 章锚在习题答案上，第 4 章的正文块锚在讲义上，第 5 章的锚点写的是一份库里没有的文件。先存基线，再改讲义里的一句，用 `detect_kb_drift` 检查：

```text title="效果 · 改了讲义之后的漂移报告"
--8<-- "projects/deeptutor/assets/sim/txt/book-drift.txt"
```

新书第一次检查没有基线，不报漂移——否则刚建好的书一打开就弹警告。改动按文件算：讲义改了只牵连引讲义的第 4 章，第 5 章是因为锚点对不上号被保守地标上。前端的横幅给出过期页数和「先重编第一页」，用户也可以确认无碍、强制刷新基线。

## 进度从最近一次作答重算 { #progress }

**问题**：一道题答错过一次，那一章就永远挂着「薄弱」；同一道题反复答对，分数一直往上涨。

**功能**：分数和弱章不累加，每次都从每道题最近一次作答重算：

```python title="模版 · deeptutor/book/progress.py:19-26"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/book/progress.py:19:26"
```

```python title="模版 · deeptutor/book/progress.py:38-67"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/book/progress.py:38:67"
```

**效果**：构造的作答序列，每一步之后的分数和弱章：

```text title="效果 · 作答序列"
--8<-- "projects/deeptutor/assets/sim/txt/book-progress.txt"
```

第 2 章同一题答对两次，分数只算一次；第 4 章改对之后立刻从弱章里消失。要补救时，引擎能在那一页末尾追加一段易错提示、一段讲解和一组更容易的题，同一主题只补一次。

## 谁管什么 { #split }

- **程序**：三步确认的关口、按模板估价、页面队列和合流、熔断、块的文字投影、文件指纹和过期页、进度重算
- **模型**：写提案和书脊、给每页规划块、写每一块的内容；来源锚点由生成时的检索记下
- **用户**：改书脊、选深度、每一步确认、看到过期提示后决定重编还是忽略
- **知识库**：原始文件是指纹和锚点的唯一依据，换了文件名也算改动

## 实跑原件 { #sim-files }

??? abstract "成本估算的完整输出：三档深度、每类一章"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/book-estimate.json"
    ```

??? abstract "漂移检查的完整报告：基线、未改、改后"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/book-drift.json"
    ```
