---
description: "DeepTutor 的学习空间怎么把散在对话里的东西收起来：所有地方出的题判完分进同一张表；答错的题由数据库触发器自己排进复习，复习按 SM-2 式规则排间隔；课程只持有对教材、书、路径的引用；看板记任务，状态跟着对话；学习日志每轮只把任务和上一次带进对话。每一步配源码模版和实跑效果"
---

# 学习空间：题库一张表，错题自己排进复习，日志每轮带上

在聊天网页里学，做过的题、答错过的题散在一段段对话里，过几天就找不回来；没人告诉你今天该复习哪几题；下次打开是新对话，上次学到哪要自己再讲一遍。DeepTutor 的学习空间收这些散件：各处出的题进同一张表，答错的题由数据库自己排进复习，课程把一门课用到的资源挂在一起，看板记要做的事，学习日志每轮带进对话。下面每一步给出源码模版和用 DeepTutor 自己的代码跑出的效果；题目和作答都是构造的，接着《应用统计学》第 8 章「假设检验」。

## 所有地方出的题进一张表 { #bank }

**问题**：出题模式的题、精通路径的检验、书里的测验、阅读时的随堂题各存各的——想拉一张「这周答错的题」，拉不出来。

**功能**：不管哪里出的题，判完分都经同一个函数写进 `notebook_entries`，一行一道题：

```python title="模版 · deeptutor/learning/assessment.py:1-10"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/assessment.py:1:10"
```

表里记着题目、选项、正确答案、用户的答案、对错、来源、所属的精通路径和知识点；唯一键是「来源类型、来源、回合、题号」，同一道题重复提交只更新这一行，每一次作答另记进一份不可改的作答日志：

```python title="模版 · deeptutor/services/session/sqlite_store.py:375-413"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/session/sqlite_store.py:375:413"
```

**效果**：和下一节一起跑，见下面的效果块。

下面的每日练习、课程页上的题目统计，读的都是这张表，不另存副本。

## 答错的题自己排进复习 { #practice }

**问题**：知道自己哪题错了，不等于知道今天该复习哪几题；错题本要人自己抄、自己维护。

**功能**：每日练习不另存题目，只在题库表旁边建一张复习表，再给题库表挂 SQLite 触发器：写进来的题如果是错的、并且判过分，就在复习表里排一条，24 小时后到期；原来判对的题后来改判为错，也补排一条：

```python title="模版 · deeptutor/services/practice/storage.py:30-42"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/practice/storage.py:30:42"
```

```python title="模版 · deeptutor/services/practice/storage.py:61-68"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/practice/storage.py:61:68"
```

**效果**：建一个内存 SQLite，题库表的建表语句原样从 DeepTutor 源码里截出来执行，复习表和触发器用它自己的 `initialize_practice` 建；写进四道来源不同的题，再把其中一道改判为错：

```text title="效果 · 题库和复习表"
--8<-- "projects/deeptutor/assets/sim/txt/space-bank.txt"
```

没判分的题不进复习，判对的不进；改判为错的那一刻，触发器补上一条。谁出的题、在哪个界面答的，复习这一层都不用知道。

复习时用户自己打分：再练、困难、掌握了、简单。间隔照 SM-2 式的冷启动规则走——第一次答对是 3 天，之后乘 ease；「再练」回到 10 分钟、ease 减 0.2；「简单」再多乘 1.3、ease 加 0.15；ease 夹在 1.3 到 3.0 之间，间隔最长 365 天：

```python title="模版 · deeptutor/services/practice/scheduler.py:30-60"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/practice/scheduler.py:30:60"
```

**效果**：四串构造的评分，每次都把返回的状态喂回去、在到期那一刻再复习：

```text title="效果 · 四串评分走出来的间隔"
--8<-- "projects/deeptutor/assets/sim/txt/space-practice.txt"
```

一次「再练」把间隔打回 10 分钟，下一次答对从 3 天重新起步，ease 留着这次的扣分。注意这和[精通路径](mastery.md)用的不是同一个调度器：精通路径按知识点排、分四种知识类型各有间隔表、算遗忘概率；每日练习按题排、照用户的自评走。两边共用的只有题库那张表。

下面是照前端源码做的仿真界面，自动播放：今日复习卡、作答、对照参考答案、自评。

<iframe src="/projects/deeptutor/assets/demos/practice.html" style="width:100%;height:620px;border:1px solid #8884;border-radius:10px" loading="lazy" title="DeepTutor 仿真 demo：每日练习，今日复习和自评"></iframe>

??? abstract "demo 源码：每日练习"

    ```html
    --8<-- "projects/deeptutor/assets/demos/practice.html"
    ```

## 课程把散的资源挂在一起 { #courses }

**问题**：一门课的教材、知识库、书、精通路径、伙伴散在各个页面，每开一个新对话都要重新选一遍。

**功能**：课程只持有引用，不持有资源——一本教材可以同时是两门课的读物，一个伙伴可以帮所有的课；拆掉引用、删掉课程，都不删它指向的东西。只有对话反过来记着自己属于哪门课：

```python title="模版 · deeptutor/services/courses.py:1-17"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/courses.py:1:17"
```

能挂的资源有七种：

```python title="模版 · deeptutor/services/courses.py:44-52"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/courses.py:44:52"
```

课程里有两段给模型看的文字：用户写的「这门课的约定」（记号、老师的讲法、想被怎么教），和助手自己积累的「对这个学习者的看法」。两段分开存，助手改不了用户写的那段：

```python title="模版 · deeptutor/services/courses.py:133-160"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/courses.py:133:160"
```

**效果**：没有实跑——课程状态要聚合书、路径、对话、题库各处的索引，这里只贴模版。

大纲单元的「已学完」只能由用户勾，不从掌握度推断——上游的注释说，悄悄猜出来的进度条比没有进度条更糟。

## 看板记任务，状态跟着对话 { #kanban }

**问题**：今天要做的几件事记在脑子里，学到哪一步没有地方看。

**功能**：一块按账号存的看板，待办、进行中、已完成三栏，卡片可以分到工作区、关联到对话；关联之后，最新关联的那张卡的状态决定这段对话在侧栏里的颜色。SQLite 是多个标签页、多个工作进程之间唯一的权威，每次改动把版本号加一，前端拿版本号判断要不要重新拉：

```python title="模版 · deeptutor/services/task_board.py:107-128"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/task_board.py:107:128"
```

**效果**：没有实跑，这里只贴模版。

看板目前只给人看。同一个文件里写好了把关联任务拼成一段上下文的函数，这一版没有调用它的地方，模型看不到看板。

下面是照前端源码做的仿真界面，自动播放：添加一张卡，拖进进行中，再移到已完成。

<iframe src="/projects/deeptutor/assets/demos/task-board.html" style="width:100%;height:600px;border:1px solid #8884;border-radius:10px" loading="lazy" title="DeepTutor 仿真 demo：任务看板"></iframe>

??? abstract "demo 源码：任务看板"

    ```html
    --8<-- "projects/deeptutor/assets/demos/task-board.html"
    ```

## 学习日志每轮带进对话 { #journal }

**问题**：下次打开是新对话，上次学到哪、下一步做什么，要自己重讲一遍。

**功能**：学习日志存三样：当前的学习任务（学什么、为什么、什么水平），上一次的小结和下一步，已确认的学习记录（最多 50 条）。每轮开始只把前两样拼进系统 prompt，记录不注入，留在 `learning_status` 工具后面，要用时再查——每轮的开销不随历史变长；日志是空的就什么都不注入：

```python title="模版 · deeptutor/services/learning_journal/store.py:134-159"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/learning_journal/store.py:134:159"
```

选中一段文字发问的轮次不带日志，免得一个不相干的旧任务干扰对这一句的讲解：

```python title="模版 · deeptutor/services/session/turns/executor.py:574-581"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/services/session/turns/executor.py:574:581"
```

**效果**：构造一份日志：一个学习任务、上一次的小结、三条学习记录，看这一轮注入了什么：

```text title="效果 · 注入系统 prompt 的日志"
--8<-- "projects/deeptutor/assets/sim/txt/space-journal.txt"
```

日志由模型在对话里调 `learning_update` 写，写入时逐字段截断长度；它是「软」状态，和题库、掌握度这些判过分的「硬」记录分开存。

## 谁管什么 { #split }

- **程序**：题库的唯一键和作答日志、错题触发器、复习间隔、课程只存引用、看板的版本号、日志注入哪几样
- **模型**：判主观题、在对话里更新学习日志、在课程里积累对学习者的看法
- **用户**：给复习自评、勾大纲单元、写课程约定、拖看板上的卡
- **各个出题的界面**：只管把判完分的题交给 `record_assessment`，复习、统计都不用自己做

## 实跑原件 { #sim-files }

??? abstract "题库建表语句和复习表的最终状态"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/space-bank.json"
    ```

??? abstract "四串评分的完整状态"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/space-practice.json"
    ```
