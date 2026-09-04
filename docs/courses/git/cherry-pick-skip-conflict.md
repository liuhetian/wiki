---
description: "cherry-pick 一段范围会中途停下，--skip / --continue / --abort 是三个出口"
---

# 摘一段范围：中间一条要跳过，最后一条会冲突

> 目标：在 cherry-pick 过程中处理空提交与冲突续传。原关卡 `4-1-2`。

## 场景

你在 `main` 上，要把 `feature/handover-pack` 上从 `docs: add handover window reminder` 到 `feat: wire war-room escalation channel` 这一段搬回来。这段里中间那条的内容在 `main` 上已经以别的 SHA 存在，最后一条会冲突。

## 搭环境

```bash
bash docs/courses/git/assets/cherry-pick-skip-conflict/init.sh
```

环境建在 `~/courses/git/cherry-pick-skip-conflict/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/cherry-pick-skip-conflict/init.sh"
    ```

## 任务

- 把那一段范围摘到 `main`（范围要包含第一条本身）
- 中间那条重复的跳过
- 最后一条的冲突解决掉并继续
- 最终 `handover.md`、`contacts.txt`、`scripts/escalate.sh` 都符合 README 描述

## 验收

- 三个文件内容都对，没有冲突标记
- `git status` 干净、不在 cherry-pick 进行中（没有 `.git/CHERRY_PICK_HEAD`）
- `git log --oneline -4` 能看到摘过来的提交

## 提问

```conflict
<<<<<<< courses/git/cherry-pick-skip-conflict
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-skip-conflict
Q2 范围怎么写
你用的范围写法是什么？为什么要在起点后面加那个符号？不加会少摘哪一条（可以真试一次）？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-skip-conflict
Q3 中途停下来的两种原因
第一次停下来时 git 说什么？第二次呢？两次的 `git status` 有什么不同？分别该用哪个出口（`--skip` / `--continue`）？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-skip-conflict
Q4 空提交是怎么来的
中间那条为什么会变成「空」的？用 `git log --oneline --all` 和 `git show --stat` 说明它的内容已经以什么形式存在于 `main` 上了。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-skip-conflict
Q5 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-skip-conflict
Q6 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-skip-conflict
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-skip-conflict
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-skip-conflict
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
