---
description: "从工作区到远程要过三道门，add/commit/push 各管一道"
---

# 第一次把改动交上去：add、commit、push 各管一段

> 目标：把本地改动送到远程，理解中间隔着几道门。原关卡 `0-1-0`。

## 场景

`work/cal` 已经克隆好了，`calc.py` 里的 `add` 函数也已经写完。现在这份改动只存在于你的磁盘上，远程仓库还不知道它的存在。

## 搭环境

```bash
bash docs/courses/git/assets/add-commit-push/init.sh
```

环境建在 `~/courses/git/add-commit-push/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/add-commit-push/init.sh"
    ```

## 任务

- 把 `calc.py` 的改动提交并推到远程 `main`。

## 验收

- `git status` 干净
- `git log --oneline` 最新一条是你的提交
- `git log origin/main --oneline` 能看到同一条（说明真的推上去了）

## 提问

```conflict
<<<<<<< courses/git/add-commit-push
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/add-commit-push
Q2 三道门
在 `add` 之前、`add` 之后、`commit` 之后各跑一次 `git status`，三次输出分别是什么？同一个文件在这三个时刻分别处于什么状态？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/add-commit-push
Q3 push 之前和之后
`commit` 之后、`push` 之前，`git log --oneline --all --decorate -3` 里 `main` 和 `origin/main` 分别指向哪一条？push 之后呢？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/add-commit-push
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/add-commit-push
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/add-commit-push
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/add-commit-push
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/add-commit-push
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
