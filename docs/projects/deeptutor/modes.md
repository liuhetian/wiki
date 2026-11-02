---
description: "DeepTutor 的几种学习模式怎么从一句 prompt 变成流水线：出题先探再列计划、逐题生成、过格式检查才修；解题让模型写计划、程序记进度，重规划有预算；深研把子主题排成队，中途追加先去重；画图只能经提交工具上画布，交之前本地校验；结果都装进同一个信封。每一步配源码模版和实跑效果"
---

# 学习模式流水线：出题、解题、深研、画图各有骨架

baseline 里换个学习动作只是换一句话：「出 5 道题」，模型一次吐完，题目重复、答案对不上选项；「帮我研究 X」，一口气写完，不分解也不查；「画个图」，给一段渲染不了的代码。DeepTutor 把这几种动作各做成一个 Capability，接管整轮：哪些步骤、什么顺序、什么时候停由程序定，每一步里的内容由模型写。下面每一步给出源码模版，能脱离模型跑的部分用 DeepTutor 自己的代码跑出效果。

## 出题：先探、再列计划、逐题生成、过格式检查 { #quiz }

**问题**：「帮我出 4 道第 8 章的题」。baseline 一次吐四道：第 2 题和第 4 题考的是同一个点，选择题的正确答案写成了选项原文，填空题干里没有空。

**功能**：deep_question 分三段 —— 先探（一个带工具的循环，查库、看以前出过和答错的题），再列计划（一次生成，给每题定考点、题型、难度），最后逐题生成：

```python title="模版 · deeptutor/agents/question/pipeline.py:1-19"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/question/pipeline.py:1:19"
```

AGENTS.md 把阶段写成 ideation → generation，代码里实际跑的是 exploring → planning → quizzing。探和逐题生成用的是另一种循环：模型每一步先写一个标签，THINK 是想、TOOL 是调工具、FINISH 是交卷，程序按标签分派：

```python title="模版 · deeptutor/runtime/agentic/loop.py:1-23"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/runtime/agentic/loop.py:1:23"
```

每题交卷后先归一化、再按题型查格式，查出问题才花一次模型调用去修，修不好就带着问题标记交出去：

```python title="模版 · deeptutor/agents/question/pipeline.py:940-967"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/question/pipeline.py:940:967"
```

```python title="模版 · deeptutor/agents/question/pipeline.py:1450-1486"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/question/pipeline.py:1450:1486"
```

**效果**：整个模块一导入就拉起模型客户端，所以把题型、常量和三个方法的原文用 ast 抠出来跑，喂四份构造的模型输出：

```text title="效果 · 归一化和格式检查"
--8<-- "projects/deeptutor/assets/sim/txt/modes-quiz-check.txt"
```

把正确答案写成选项原文、判断题写「对」这类小毛病，归一化就收拾了，不花模型调用；缺选项、缺解析才进修复。题目一道道出，前端拿到一道就渲染一张卡。下面是照源码做的仿真界面，自动播放答两道题：

<iframe src="/projects/deeptutor/assets/demos/quiz.html" style="width:100%;height:600px;border:1px solid #8884;border-radius:10px" loading="lazy" title="DeepTutor 仿真界面：题卡作答与判分"></iframe>

??? abstract "demo 源码：quiz.html"

    ```html
    --8<-- "projects/deeptutor/assets/demos/quiz.html"
    ```

## 解题：计划由模型写，进度由程序记 { #solve }

**问题**：让模型解例 8.3。它边想边写，写到第三步忘了第二步算出的 t 是多少，跳过了查临界值；中途想换成 p 值法，又从头写了一遍。

**功能**：deep_solve 复用聊天循环，只多挂三个工具：`solve_plan` 交计划，`solve_finish_step` 标一步完成，`solve_replan` 换方案。计划、完成标记和重规划次数存在一个会话里，计划最多 12 步，重规划最多 2 次：

```python title="模版 · deeptutor/capabilities/solve/session.py:22-23"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/capabilities/solve/session.py:22:23"
```

```python title="模版 · deeptutor/capabilities/solve/session.py:39-60"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/capabilities/solve/session.py:39:60"
```

每完成一步，这一步的工具往来折叠成一行，只留最新的计划进度：

```python title="模版 · deeptutor/capabilities/solve/tools.py:197-208"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/capabilities/solve/tools.py:197:208"
```

**效果**：用上游的三个工具原样执行，参数是构造的、模型会写的样子：

```text title="效果 · 例 8.3 的计划、折叠和重规划"
--8<-- "projects/deeptutor/assets/sim/txt/modes-solve.txt"
```

步骤编号由服务端生成，模型碰不到存储的键。每一步怎么算还是模型的事，程序只管它按计划走、做完一步记一步、改方案不能没完没了。

## 深研：子主题排成队，中途追加先去重 { #research }

**问题**：「帮我研究 p 值的常见误读」。baseline 一口气写完一篇，想到哪写到哪，同一个误读换着说法写了三遍。

**功能**：deep_research 分四段 —— 先用最多 3 轮 ask_user 把题目问清，再拆成大纲给用户确认，然后每个子主题跑一个循环，最后按大纲、引言、各节、结论逐段写报告：

```python title="模版 · deeptutor/agents/research/pipeline.py:1-30"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/research/pipeline.py:1:30"
```

研究某个子主题时，模型可以用 APPEND 标签往队尾追加新子主题。程序先看队列满没满，再做模糊去重，都过了才入队：

```python title="模版 · deeptutor/agents/research/pipeline.py:2957，2981-2982，3013"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/research/pipeline.py:2957:2957"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/research/pipeline.py:2981:2982"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/research/pipeline.py:3013:3013"
```

相似度取「字符序列相似度」和「词重合度」里大的那个，过 0.85 算重复：

```python title="模版 · deeptutor/agents/research/data_structures.py:344-372"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/research/data_structures.py:344:372"
```

**效果**：用上游的 `DynamicTopicQueue` 演一遍，大纲和 APPEND 的标题是构造的：

```text title="效果 · 五次 APPEND 的去重和排队"
--8<-- "projects/deeptutor/assets/sim/txt/modes-research-queue.txt"
```

「三种常见的误读」和已有的「三种常见误读」只差一个字，被拦下；大小写不同的「P 值」也算同一个。追加的子主题挂着父块的编号，写报告时能还原成一棵树。

## 画图：只能经提交工具上画布，交之前本地校验 { #visualize }

**问题**：「画一下例 8.3 的拒绝域」。baseline 给一段 matplotlib 代码，或者一份 Chart.js 配置，里面夹着 JS 回调函数，网页渲染不了。

**功能**：visualize 自己只做两件事：标记这一轮、收最终的信封。生成交给聊天循环跑，最多 5 圈：

```python title="模版 · deeptutor/agents/visualize/capability.py:138-141"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/visualize/capability.py:138:141"
```

```python title="模版 · deeptutor/agents/visualize/capability.py:188-196"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/visualize/capability.py:188:196"
```

AGENTS.md 列的「分析 → 生成 → 复核」三个阶段名还在，但生成就是这几圈聊天循环，复核就是插件校验；原先各由一个 agent 负责的 `VisualizePipeline` 现在只给书里的插图块用。图上画布只有一条路，`submit_visualization` 工具；它先用装好的可视化插件校验，不过就把具体错因回给模型重交：

```python title="模版 · deeptutor/visualizers/tool.py:98-107"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/visualizers/tool.py:98:107"
```

Chart.js 的校验：严格 JSON、类型在 8 种之内、每个数据集有 label 和数据：

```python title="模版 · deeptutor/visualizers/builtin.py:60-102"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/visualizers/builtin.py:60:102"
```

**效果**：用上游的校验器原样执行，喂一份合格的 t 分布图和五份各有一个毛病的 payload：

```text title="效果 · 六份 payload 的校验结果"
--8<-- "projects/deeptutor/assets/sim/txt/modes-visualize-validate.txt"
```

这些毛病都不用模型就能查出来，只有修的时候才花一次模型调用。下面是照源码做的仿真界面，自动播放出图、看代码、全屏：

<iframe src="/projects/deeptutor/assets/demos/visualize.html" style="width:100%;height:560px;border:1px solid #8884;border-radius:10px" loading="lazy" title="DeepTutor 仿真界面：可视化结果卡"></iframe>

??? abstract "demo 源码：visualize.html"

    ```html
    --8<-- "projects/deeptutor/assets/demos/visualize.html"
    ```

## 结果都装进同一个信封 { #envelope }

**问题**：出题交一组题，深研交一篇报告，画图交一份图表配置。前端、命令行、伙伴的消息通道要是为每种结果各写一套，加一种模式就得改三处。

**功能**：每种能力最后都调同一个函数发结果，附上这一轮的 token 用量：

```python title="模版 · deeptutor/agents/_shared/capability_result.py:21-48"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/agents/_shared/capability_result.py:21:48"
```

**效果**：只贴模版。AGENTS.md 说这个函数在 `capabilities/_shared.py`，实际在 `agents/_shared/capability_result.py`。

## 谁管什么 { #split }

- **程序**：每种模式分几段、按什么顺序；出题的归一化和格式检查；解题的步骤编号、完成标记、重规划预算；深研队列的容量和去重；画图的提交通道和校验
- **模型**：探什么、出什么题、计划怎么拆、每一步怎么算、追加哪些子主题、图画成什么样，以及被退回时怎么修
- **用户**：选模式和题型题量、确认深研大纲、回答 ask_user 的追问
- **可视化插件**：各自声明能画什么、payload 长什么样、怎么校验

## 实跑原件 { #sim-files }

??? abstract "出题格式检查的完整记录"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/modes-quiz-check.json"
    ```

??? abstract "解题三个工具的完整调用记录"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/modes-solve.json"
    ```

??? abstract "深研队列的完整记录"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/modes-research-queue.json"
    ```

??? abstract "可视化校验的完整记录"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/modes-visualize-validate.json"
    ```
