---
description: "为什么用冲突标记提问、checkout → 答题 → add 的环路、给 AI 的上课流程"
---

# 课程

带空白的题，不是教程。每一课先用一个脚本在你机器上造出一个真实的事故现场，然后逼你动手把它解决，最后用 **git 冲突标记**的形状向你提问 —— 答案栏空着，就等于这一课还没合并。

课程和[笔记](../notes/index.md)是同一件事的两半：**课程是题，笔记是我的答卷**。同名文件，答完才搬过去。

## 为什么用冲突标记提问

一道题在页面上长这样：

```conflict
<<<<<<< courses/git/conflict-order-matters
Q2 两边各加了什么
上下两半分别新增了哪些调用？哪一个调用是两边都加了的？
=======
>>>>>>> notes
```

上半是课程的问，下半是我的答，中间一道 `=======`。这个形状不是装饰，它精确对应了这套流程的语义：

- **答案为空 = 未合并。** 跟 git 里没解决的冲突一模一样，扫一眼就知道哪些题还欠着。
- **闸门是机器把的，不是自觉。** `scripts/course.py add` 只要发现任何一题的答案区是空的就拒绝归档；`scripts/check-links.py` 进一步拦住任何带残留标记的笔记文件进入部署 —— `deploy.sh` 在构建前就跑它，非零退出即中止。
- **问题设计成不跑代码答不出来。** 贴冲突 hunk 原文、贴 `git log --oneline --graph` 输出、说出某个 commit 的 parent 是谁 —— 靠读文档编不出来。这就是「证明我真的跑了」的全部依据。

## 一课的环路

```bash
python3 scripts/course.py checkout git/<slug>   # 把题复制进 docs/notes/git/<slug>.md，答案区留空
bash docs/courses/git/assets/<slug>/init.sh     # 造出事故现场
#   …在终端里把任务做完，把答案填进 notes 副本的答案区…
python3 scripts/course.py status                # 看还有哪些题空着
python3 scripts/course.py add git/<slug>        # 全答完才通过：改写成笔记排版并附上参考解法
```

`add` 通过之后，去 `docs/notes/git/index.md` 挂一行钩子、在 `mkdocs.yml` 注册 nav，跑 `python3 scripts/check-links.py`，就是一篇正常的笔记了。

`courses/` 下的页面**永远保持纯题状态**，答案一个字都不写进去 —— 这样同一课可以重做，也可以直接交给别人或别的 agent 用。

## 给 Claude Code 的上课流程

抓到这一页的 agent，照下面做：

1. **读课程页**（`/courses/git/<slug>.md`）。先读完「场景 / 任务 / 验收 / 提问」，心里有整条链路再开工。
2. **造环境**：跑该课 `assets/<slug>/init.sh`。脚本可重复运行，重跑即重置；它只写 `~/courses/git/<slug>/`（`COURSE_ROOT` 可改），不碰用户的 `~/.gitconfig`。
3. **不要代替用户敲 git 命令。** 命令由用户在自己的终端里执行 —— 这一课的价值全在他手上那几次操作。你负责提问、追问、纠正理解，**不直接说出解法命令**；用户明确卡住并主动要提示时，给的是下一步该看什么，不是整条命令。
4. **逐题提问**，按课程页里 conflict 块的顺序来。用户口述答案，你追问到答案落到实处（能贴出的就要求贴原文）。
5. **验收**：用户说做完了，按课程页「验收」小节逐条跑命令核对（`git status`、`git log --oneline --graph`、`cat` 目标文件）。**必须亲自看真实状态，不能只根据对话判断。** 没过就指出是哪一条没过，回到第 4 步。
6. **归档**：把每题的最终答案写进 `docs/notes/git/<slug>.md` 对应块的答案区（`=======` 与 `>>>>>>>` 之间）；答案下面用 `> ` 开头的行附上这一题相关的关键对话摘录（`> 我：…` / `> CC：…`），跑题和寒暄不要。最后跑 `python3 scripts/course.py add git/<slug>`。

末尾三题固定是「一句话」「心智模型」「坑」，答完之后它们会成为笔记的三个小节 —— 这套课的归档结果，形状正好是 `notes/git` 的骨架 **场景 → 一句话 → 心智模型 → 操作 → 坑**。

## 分类

- [Git](git/index.md) —— 33 课，从 clone 到跨仓库 cherry-pick；每课一个 `init.sh` 造出真实事故现场，冲突、误删、写歪的历史都是真的
