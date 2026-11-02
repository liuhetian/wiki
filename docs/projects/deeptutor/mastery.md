---
description: "DeepTutor 精通路径：学没学会由程序按作答记录判，不由模型说；路线是带类型的知识点表，计算类按最近五次加权的掌握分过 0.9 的门，概念类要导师判过学习者的讲解，下一步由门算出，复习按遗忘曲线排，三种模式管导师能调哪些工具；每步配源码模版和实跑效果"
---

# 精通路径：学没学会，由程序按作答记录判

聊天网页里，「这一节你会了吗」由模型说了算——你说懂了，它就往下讲；它手里没有你答过几题、错在哪的记录，也不会记得哪天该回来考你。DeepTutor 的精通路径（Mastery Path，界面上叫「精通之路」）把这三件事从模型手里拿走：路线是一张带类型的知识点表，过没过门由程序按作答记录算，下一步学什么、哪天复习也是算出来的。模型管出题、讲解，和判那些没有标准答案的讲解。下面用一条构造的「第 8 章 假设检验」路径跑上游代码，判分都不经模型。

## 路线是一张表 { #route }

**问题**：让模型「一节课一节课教」，课表只活在对话里——第三天它可能把讲过的「两类错误」再讲一遍，也可能跳过你还没懂的 p 值。

**功能**：路线先由模型从知识库起草成 JSON，再经 `materialize_modules` 落成两层数据：模块和知识点。每个知识点有一个类型，四选一，后面的门、复习间隔都按它走：

```python title="模版 · deeptutor/learning/models.py:24-33"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/models.py:24:33"
```

```python title="模版 · deeptutor/learning/models.py:80-94"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/models.py:80:94"
```

模型的 JSON 不可靠，规范化时逐条兜底：名字不到两个字的扔掉，类型不认识的回落成 `concept`，一个模块最多留 7 个知识点，id 由程序发：

```python title="模版 · deeptutor/learning/topic_generation.py:399-419"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/topic_generation.py:399:419"
```

**效果**：构造一份草稿，带着模型常见的毛病——类型写成「概念型」「skill」，一个知识点只叫「α」，一个模块塞了九个点，混进一个字符串，还有个模块没名字：

```text title="效果 · 同一份草稿，起草模式和保存模式各跑一遍"
--8<-- "projects/deeptutor/assets/sim/txt/mastery-route.txt"
```

起草时宽松，坏的丢掉、好的留下；用户确认保存时 `strict=True`，同一份草稿直接报错，不会悄悄少一个知识点。路线落成表以后，后面所有判断都读这张表，不读对话。

## 两种门 { #gates }

**问题**：「算出例 8.3 的 t 值」有标准答案，按对错计分就行；「解释 p 值是什么」没有一句标准答案——选择题全选对，也可能只是背下了选项。

**功能**：四种知识点分两种门。记忆型、程序型是定量门：掌握分到 0.9 才算过。概念型、设计型是定性门：要学习者用自己的话讲一遍，导师调 `mastery_assess` 判过才算（代码注释叫它费曼式检查），答对多少道题都不算：

```python title="模版 · deeptutor/learning/policy.py:33-46"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/policy.py:33:46"
```

```python title="模版 · deeptutor/learning/policy.py:82-92"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/policy.py:82:92"
```

**效果**：路径里「p 值不是 H0 为真的概率」是概念型。连答三道选择题，掌握分到了 1.0，下一步仍是 `assess`；让学习者讲，讲成「p 值就是原假设成立的可能性」，导师判不过，掌握分压回 0.4；重讲对了才过门：

```text title="效果 · 概念题的门（摘自下文整条会话）"
--8<-- "projects/deeptutor/assets/sim/txt/mastery-session.txt:14:18"
```

判分工具把这层区别写进回给模型的话里——定性门的点再出题也开不了门，只有 `mastery_assess` 能开：

```python title="模版 · deeptutor/capabilities/mastery/tools.py:1777-1803"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/capabilities/mastery/tools.py:1777:1803"
```

## 掌握分 { #score }

**问题**：答对一题就算会，可能是蒙的；错过一次就永远不算会，又太狠。

**功能**：掌握分只看最近五次作答，越近权重越大；只答过一次封顶 0.5，两次封顶 0.8：

```python title="模版 · deeptutor/learning/mastery.py:15-37"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/mastery.py:15:37"
```

借了提示的作答和作废的题不进计分：

```python title="模版 · deeptutor/learning/service.py:522-529"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/service.py:522:529"
```

**效果**：构造几串作答，看掌握分和 0.9 的门：

```text title="效果 · compute_mastery 和 calculate_mastery"
--8<-- "projects/deeptutor/assets/sim/txt/mastery-score.txt"
```

最快三连对过门。中间错一次，这次错误要滑出五次的窗口才不拖分——之后得连对五题。过了门也不是一劳永逸：连对四次后错一次，掌握分掉到 0.75，这个点退回「学习中」。

下面是照上游 `MasteryStudy.tsx`、`ModuleOutline.tsx` 和 `LevelUpCelebration.tsx` 做的仿真界面，自动播放一次学习会话：导师出题、判分工具回写掌握分、过门那一刻左栏的点落定。

<iframe src="/projects/deeptutor/assets/demos/mastery-study.html" style="width:100%;height:640px;border:1px solid #8884;border-radius:10px" loading="lazy" title="DeepTutor 仿真界面：精通学习会话"></iframe>

??? abstract "demo 源码：精通学习会话"

    ```html
    --8<-- "projects/deeptutor/assets/demos/mastery-study.html"
    ```

## 判分不经模型的嘴 { #grading }

**问题**：让模型自己判对不对，它容易顺着你；答案只在上一轮对话里，隔几轮它自己都可能记错。

**功能**：导师出题时调 `mastery_quiz`，题目连同答案键存进服务端的 `PendingQuestion`，不再回到模型手里：

```python title="模版 · deeptutor/learning/models.py:258-275"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/models.py:258:275"
```

学习者作答后，先照答案键精确比对（`exact_verdict`）：选择题认「b」「选 B」和选项原文，含糊的「A 或 B 吧」不判错，判「待澄清」。比不上的才交给模型判，模型只交回结果和置信度，置信度不到 0.8 不算数：

```python title="模版 · deeptutor/learning/semantic_assessment.py:21-37"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/semantic_assessment.py:21:37"
```

拿不到任何判定时，`_apply_grade` 退回一段确定性比对：选择题比标签，短答比相似度，开放题数关键词：

```python title="模版 · deeptutor/learning/grading.py:30-47"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/grading.py:30:47"
```

**效果**：题目和作答是构造的，三组依次是精确比对、判定回执、确定性比对：

```text title="效果 · 精确比对、判定回执、确定性比对"
--8<-- "projects/deeptutor/assets/sim/txt/mastery-grade.txt"
```

不算数的判定不留错题、不动掌握分——判定没定稿时，`service.py:1662` 直接跳过记分。确定性比对的开放题按逗号拆关键词、命中六成算对，最后一行那句典型误读也被判对了；所以开放题实际走模型判定，关键词比对只是兜底。

## 下一步是算出来的 { #next }

**问题**：聊天页的「下一课」是模型凭印象接着讲；你卡在 t 统计量上，它也可能照着大纲往下走。

**功能**：`next_objective` 每轮按固定的优先级算出下一步：有题没答先判这题，有到期的复习先复习，否则沿模块顺序找第一个没过门的点——门就是游标，过了门的自动跳过：

```python title="模版 · deeptutor/learning/policy.py:266-279"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/policy.py:266:279"
```

没过门的点按状态和门派动作：没碰过的先摸底（probe，学习者要求先讲就是 teach），定量门接着练（practice），定性门要讲解（assess）：

```python title="模版 · deeptutor/learning/policy.py:325-342"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/policy.py:325:342"
```

导师每轮调 `mastery_status`，拿到的就是这份 `next` 和整张地图 `map_summary`（`tools.py:850-851`）。

**效果**：构造的路径从头走到尾。每行是一步操作、这个点的掌握分，和 `next_objective` 给出的下一步：

```text title="效果 · 一条路径走到底"
--8<-- "projects/deeptutor/assets/sim/txt/mastery-session.txt"
```

几处值得看：t 统计量答错一题后，`next` 一直停在它身上，直到第七题过门；过了门又错一题，`next` 立刻退回来。点「我已经掌握，直接放行」的那个点掌握分还是 0，地图上来源标成自报，和系统判的分开记。把时钟拨到五天后，`next` 先派复习，排第一的是遗忘风险最高的点——「α 的含义」那三道题是当场连着答的，只算一次巩固，五天后记得住的概率只剩 1%。

仿真界面：照 `ModuleOutline.tsx` 和 `mastery-theme.css` 做的精通地图，自动播放。上游的状态只靠形状区分——实心是已掌握，带点的圆环是学习中，空心是未开始，颜色只用一种主色。

<iframe src="/projects/deeptutor/assets/demos/mastery-map.html" style="width:100%;height:640px;border:1px solid #8884;border-radius:10px" loading="lazy" title="DeepTutor 仿真界面：精通地图"></iframe>

??? abstract "demo 源码：精通地图"

    ```html
    --8<-- "projects/deeptutor/assets/demos/mastery-map.html"
    ```

## 复习按遗忘曲线排 { #review }

**问题**：学完第 8 章不复习，三周后做综合题，哪个是弃真、哪个是取伪又分不清了。

**功能**：每个点有一份复习状态。记得住的概率按 $e^{-t/S}$ 衰减，S 是稳定度，单位是天；下一次复习排在记得住的概率掉到目标（默认 90%）的那一刻，间隔约为 0.105 S。四种类型的第一次间隔按种子序列给：

```python title="模版 · deeptutor/learning/scheduler.py:16-21"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/scheduler.py:16:21"
```

每次复习更新 S。同一次坐下来连着答——间隔不到 6 小时、也不到当前间隔的一半——只刷新记忆，不长 S，也不推迟原定的复习：

```python title="模版 · deeptutor/learning/scheduler.py:263-275"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/scheduler.py:263:275"
```

隔开了再答：答对就长，越是快忘了还答对、隔得越久，长得越多；答错按「本以为记得住」的程度砍：

```python title="模版 · deeptutor/learning/scheduler.py:295-321"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/learning/scheduler.py:295:321"
```

**效果**：时间戳全部显式给出，作答结果是构造的：

```text title="效果 · 稳定度怎么长、怎么掉"
--8<-- "projects/deeptutor/assets/sim/txt/mastery-schedule.txt"
```

五分钟后再答一题，S 不变、复习日子也不动；到期答对，间隔从 6 天拉到 17 天、39 天；第 62 天忘了，S 砍掉七成，下次只隔 5.6 天——失败后的间隔再减一半。目标记住率按路径设，从 90% 降到 80%，同样的作答，下次复习从 92 天后推到 195 天后。代码注释说明这是指数遗忘加按类型的冷启动先验，不是拟合过的 FSRS（`scheduler.py:66-67`）。

## 模式管工具 { #modes }

**问题**：和导师商量路线时，它顺手出题考你；正在学习时，它又顺手把路线改了，你都没注意。

**功能**：精通对话分三种模式：outline 设计路线，study 沿路线学，review 回头考已掌握的。改路线的工具只属于 outline，考人的工具只属于 study 和 review：

```python title="模版 · deeptutor/capabilities/mastery/mode.py:71-81"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/capabilities/mastery/mode.py:71:81"
```

工具每轮都挂上，调用时才查模式——模式能在一轮里切换，而一轮的工具清单开头就定死了：

```python title="模版 · deeptutor/capabilities/mastery/tools.py:625-639"
--8<-- "projects/deeptutor/assets/deeptutor-src/deeptutor/capabilities/mastery/tools.py:625:639"
```

**效果**：

```text title="效果 · 工具 × 模式，和被拒时回给模型的话"
--8<-- "projects/deeptutor/assets/sim/txt/mastery-mode.txt"
```

被拒的工具不只说不行，还点名先调 `mastery_mode` 切到哪个模式，并让导师告诉学习者为什么切——模式就显示在对话上方。没记录模式的旧对话和命令行一律不拦，免得老对话突然什么都调不了。

## 谁管什么 { #split }

- **程序**：知识点表的规范化、两种门的阈值、掌握分的算法、下一步的优先级、复习间隔和遗忘风险、每种模式能调的工具、题目的答案键
- **模型**：起草路线、出题、讲解、判没有标准答案的讲解——只交回结果和置信度，置信度不够不算；决定什么时候提议切模式
- **学习者**：作答、用自己的话讲、确认路线、自报已掌握（单独记来源）、设目标记住率
- **上游留着的口子**：掌握分只是近期加权正确率，`mastery.py` 的注释写明可以整个换成 IRT 或 BKT 估计；复习模型没有用真实数据拟合

## 实跑原件 { #sim-files }

??? abstract "整条会话的完整记录：每一步的 next 和最后的地图"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/mastery-session.json"
    ```

??? abstract "复习状态的完整记录"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/mastery-schedule.json"
    ```

??? abstract "规范化前后的路线"

    ```json
    --8<-- "projects/deeptutor/assets/sim/out/mastery-route.json"
    ```
