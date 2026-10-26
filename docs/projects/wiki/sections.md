---
description: "最小单位是文章：一个问题加解决方案，写给人看；项目、笔记、Gallery 是把多个问题收在一起的三种方式（交付同一个东西、学会同一门学问、同一类小问题），Skill 是从文章提炼、写给 AI 的执行方式；来源不算数"
---

<figure markdown>
  ![板块按两件事分：横着看写给谁，从人到 AI；竖着看收了几个问题，从一个到多个。上面一排从左到右是笔记、项目、Gallery，文章在项目正下方；Skills 是最右边一根长条，从一个问题通到多个问题，由文章提炼而来，按编号查 Gallery；维护单独画在坐标系外面](assets/sections-infographic.png)
</figure>

# 板块怎么分：文章是最小单位，项目、笔记、Gallery 是三种收法，Skill 写给 AI

**这个 wiki 的最小单位是文章**：定义一个问题，提出解决方案，像一篇论文。其余板块都从文章来 —— 项目、笔记、Gallery 是把多个问题收在一起的三种方式，Skill 是从文章里提炼出来、给 AI 照着做的执行方式。看一样东西放哪，横着看写给谁，竖着看收了几个问题。

| 板块 | 是什么 | 写给谁（大致比例） |
|---|---|---|
| [文章](../../posts/index.md) | 一个问题加解决方案；论文笔记也是文章 | 人 70%，AI 30% |
| [项目](../index.md) | 为了交付同一个东西，把互相牵连的问题收在一起 | 人 70%，AI 30% |
| [笔记](../../notes/index.md) | 为了学会同一门学问，把一个领域的文章收在一起；可以用 git 冲突标记给自己出题 | 人 90%，AI 10% |
| [Gallery](../../gallery/index.md) | 同一类小问题的合集，一个问题对应一件成品 | 人 50%，AI 50% |
| [Skills](../../skills/index.md) | 从文章提炼的执行方式：守则加脚本，很少讲原因 | AI 100% |

[维护](#maintenance)不在这张表里：它是这些东西背后的记录，写给 AI 看。

## 文章：一个问题加解决方案 { #article }

先把问题定义清楚，再给方案和依据 —— 读完的人懂了一件事。[上线前的三层验收](../../posts/release-acceptance.md)就是一篇：问题是 AI 项目自己想用例一定漏，方案是三层测试集，各层管什么、为什么。

论文笔记也是一篇文章，不另开板块。

文章主要写给人看，AI 也会浅浅读一下，但它干活照的是 skill，不是文章。

没答完的问题也写成文章，标在研；答完在原处补完，地址不变。

## 三种收法 { #collect }

多个问题收在一起，看是什么把它们收在一起。

### 项目：交付同一个东西 { #project }

问题之间互相牵连，一个怎么解会牵制另一个 —— 读者从项目里拿走的是整个东西怎么拼起来，单篇文章给不了。[梨园](../liyuan/index.md)抽掉[状态](../liyuan/state.md)那页，[重来和回档](../liyuan/branch.md)就讲不通，因为每一轮的分支挂着一份场景快照。

只为这个项目写的操作手册、截图，跟着项目放。[Kindle 常显信息屏](../kindle-dashboard/index.md)的[越狱与显示通道实操](../kindle-dashboard/reference/jailbreak.md)只为把这块看板显示出来，不单独算 skill。

### 笔记：学会同一门学问 { #notes }

学问可以偏理论，比如[统计学](../../notes/statistics/index.md)；也可以很具体，比如数据结构配 [LeetCode 热题 100](../../notes/leetcode/index.md)。

笔记里可以用 git 冲突标记给自己出题：上半写问题，下半空着，答案空着就是提醒，写法见[提问块](../../skills/wiki-guide/course.md#conflict-syntax)。

### Gallery：同一类小问题 { #gallery }

每个问题小到答案就是一个参数：一段 prompt、一个色号、一段版式描述、一个 demo、一个网站。一个问题对应一件成品，各自独立，拿来翻、来挑 —— [图片](../../gallery/images/index.md)里 GPT Image 2 的 163 条图配 prompt、[排版](../../gallery/layouts/index.md)里的 167 种版式、[收藏夹](../../bookmarks/websites.md)里的网站都是这样。

## Skill：从文章提炼，写给 AI { #skill }

文章给出思路，提炼出具体的执行方式，就是 skill：AI 照着这套守则做，就能解决那个问题。一个 skill 可以只管一个问题，也可以是解一组问题的一整套 —— [PPT Master](../../skills/ppt-master/index.md) 带规划 deck、沟通模式、生成配图三个子 skill。skill 很少讲原因，可以带更多执行脚本，更偏机器。原因留在文章里 —— 文章链到 skill，skill 不链回去，比如[动画网页 PPT](../animated-ppt/index.md)链到它的[工程手册](../../skills/writing/deck.md)。

## AI 读哪些 { #ai }

从人到 AI 排一排：笔记几乎只给人看。文章和项目以人为主，AI 读三成左右 —— 文章它浅浅读；接着做一个项目时，它要读操作手册和来龙去脉，比如 CLAUDE.md 让 AI 去[复制本页 Markdown 源](md-copy.md)那篇看复制按钮的来龙去脉。Gallery 两边各一半：人来翻、来挑，AI 不自己翻，skill 让它按编号查哪条，它就取哪条。AI 干活不需要理由，但需要具体参数，Gallery 每条的答案正好就是参数 —— **对 AI 来说，Gallery 是 skill 的查表数据**。[配图规范](../../skills/wiki-guide/reference/infographic.md)就让 AI 从[信息图排版](../../gallery/layouts/infographics.md)里抄版式、从[经典主题色](../../gallery/colors/classic.md)里挑颜色。最右边是 Skill，整篇写给 AI。

## 边界怎么判 { #boundary }

- 文章和项目，看是一个问题还是一组互相牵连的问题。出自项目、只讲一个通用做法的还是文章：三层验收出自 AI 项目，任何 AI 项目都能用
- 项目和笔记，看有没有要交付的东西：梨园要交付一个软件，统计学要的只是学会
- 笔记和 Gallery 都可能是一堆小问题，看拿去干什么：刷 LeetCode 为了学会能迁移的技巧，翻 Gallery 为了挑一件照着做出来
- 文章和 Gallery，看要不要讲理由：动画网页 PPT 里 all-intra 重编码那个坑要讲理由才说得清，是文章；[花卉动态生长海报](../../gallery/video/flower-growth-poster.md)的五步拿去就能照做，是 Gallery 里的一条
- Gallery 和 Skill，看答案是一个参数还是一套守则：做 PPT 的步骤是 [PPT Master](../../skills/ppt-master/index.md)，挑风格的样例在 [PPT 风格库](../../gallery/images/ppt-master/index.md)
- 来源不算数：自己做的 Kindle 常显信息屏和别人做的梨园都是项目
- 收外面的东西不是选择题：文章线给人读，skill 线给 AI 读，两条并行，一个来源可以一次收进两边 —— 同一个仓库，要它的效果进 Gallery、要学它的设计进项目，是文章线；要让 agent 能用进 Skills，是 skill 线

## 维护：东西背后的记录 { #maintenance }

维护不在这套分法里：它不是一个问题加解决方案，是 skill、Gallery 收录和项目背后的记录 —— 从哪来、怎么选的、读的哪个 commit、实测过什么。它写给 AI 看：改一个 skill、重新吸纳上游、换接口之前，先读它的维护记录。页面里只写怎么用，页尾链过去，比如[生成、编辑图片](../../skills/agent-io/reference/image.md)和它的[维护记录](../../maintenance/image.md)。

具体放哪个目录、页面怎么写，照[写作规范](../../skills/wiki-guide/index.md#where)。
