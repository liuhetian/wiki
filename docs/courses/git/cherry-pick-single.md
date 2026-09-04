---
description: "cherry-pick 搬的是「那条提交的 diff」，不是那条提交本身"
---

# 从别的分支只摘一条提交过来

> 目标：把单个 commit 从另一个分支搬到当前分支。原关卡 `4-1-0`。

## 场景

`feature/payment-badge` 上有两条提交：一条是要的功能，一条只是随手记的草稿。你只想要功能那条。

## 搭环境

```bash
bash docs/courses/git/assets/cherry-pick-single/init.sh
```

环境建在 `~/courses/git/cherry-pick-single/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/cherry-pick-single/init.sh"
    ```

## 任务

- 把 `feat: add payment badge renderer` 摘到 `main` 上
- 不要把 `docs: jot badge brainstorm` 带过来

## 验收

- `main` 上 `ui/payment_panel.js` 有 badge renderer
- `main` 上没有 `scratchpad.md`
- `git log --oneline main -3` 里能看到那条被摘过来的提交
- `git status` 干净

## 提问

```conflict
<<<<<<< courses/git/cherry-pick-single
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-single
Q2 摘过来的是同一条吗
原分支上那条的 hash 和 `main` 上新出现那条的 hash 一样吗？两条的 `git show --stat` 一样吗？这说明 cherry-pick 搬的是什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-single
Q3 怎么指定要摘哪条
你的命令是什么？如果写成分支名（而不是具体 hash）会摘到哪一条？真试一次看看。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-single
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-single
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-single
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-single
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-single
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
