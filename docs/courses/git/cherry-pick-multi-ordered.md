---
description: "有依赖关系的提交顺序摘错就直接冲突，先想清楚谁依赖谁"
---

# 从两个分支挑三条，还得按正确顺序摘

> 目标：跨多个分支挑选多个提交并按依赖顺序摘取。原关卡 `4-1-1`。

## 场景

你在 `release-candidate` 上。`feature/card-layout` 和 `feature/risk-banner` 两个分支上一共有四条提交，你只要其中三条，而且其中一条依赖另一条。

## 搭环境

```bash
bash docs/courses/git/assets/cherry-pick-multi-ordered/init.sh
```

环境建在 `~/courses/git/cherry-pick-multi-ordered/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/cherry-pick-multi-ordered/init.sh"
    ```

## 任务

- 把这三条按正确顺序摘到 `release-candidate`：
    1. `feat: add payment flow slide skeleton`
    2. `docs: add risk banner to payment flow slide`
    3. `docs: add review handoff note`
- 不要带上 `docs: note playful footer idea`
- 本课不要求 push

## 验收

- `release-candidate` 上 `git log --oneline -3` 是那三条，顺序正确
- 没有 `docs: note playful footer idea`
- `slides/payment_flow.md` 同时有骨架和 risk banner
- `git status` 干净

## 提问

```conflict
<<<<<<< courses/git/cherry-pick-multi-ordered
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-multi-ordered
Q2 谁依赖谁
四条提交分别在哪个分支上、各改了什么文件？（`git log --oneline --graph --all` 和 `git show --stat <hash>` 一起看）哪两条动了同一个文件、因此有先后关系？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-multi-ordered
Q3 顺序摘错会怎样
先故意把有依赖的那条摘在前面，看看 git 说什么，把输出贴出来，然后 abort 掉重来。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-multi-ordered
Q4 一次摘多条
你是一条一条摘的还是一次给多个 hash？两种写法的 `git log` 结果一样吗？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-multi-ordered
Q5 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-multi-ordered
Q6 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-multi-ordered
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-multi-ordered
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-multi-ordered
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
