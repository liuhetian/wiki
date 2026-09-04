---
description: "stash 不是剪贴板，它把工作区打包成一个游离的提交挂在一边"
---

# 半成品先塞抽屉：stash 出去救火再回来

> 目标：用 stash 暂存半成品，处理完紧急事项再恢复。原关卡 `2-1-2`。

## 场景

你停在 `feature/live-summary` 上，`status_panel.py` 还是半成品。这时来了个必须马上处理的 hotfix。

## 搭环境

```bash
bash docs/courses/git/assets/stash-switch-hotfix/init.sh
```

环境建在 `~/courses/git/stash-switch-hotfix/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/stash-switch-hotfix/init.sh"
    ```

## 任务

- 把手头未完成的改动暂存起来，切回 `main`
- 在 `main` 上建 `hotfix.txt`，内容写 `修复 stale cache 导致的旧状态展示`，提交
- 切回 `feature/live-summary`，恢复暂存的改动
- 把 `render_summary_card()` 改成返回 `summary: backlog synced`，提交
- 切回 `main` 合并功能分支
- 收尾时 stash 列表必须是空的

## 验收

- `hotfix.txt` 内容正确且已提交
- `status_panel.py` 里 `render_summary_card()` 返回 `summary: backlog synced`
- `main` 上两处改动都在
- `git stash list` 为空
- `git status` 干净

## 提问

```conflict
<<<<<<< courses/git/stash-switch-hotfix
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-switch-hotfix
Q2 stash 之后工作区去哪了
`git stash` 之前和之后各跑一次 `git status` 和 `git diff`。`git stash list` 输出是什么？那条记录里的 `On <分支>: <说明>` 是谁写的？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-switch-hotfix
Q3 stash 是个 commit
用 `git log --oneline --graph refs/stash -1` 和 `git cat-file -p refs/stash` 看看。它有几个 parent？第一个 parent 是谁？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-switch-hotfix
Q4 pop 和 apply
你恢复时用的是哪条命令？另一条会有什么不同？用 `git stash list` 的前后变化说明。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-switch-hotfix
Q5 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-switch-hotfix
Q6 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-switch-hotfix
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-switch-hotfix
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-switch-hotfix
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
