---
description: "分支不是给大项目准备的仪式，是「改错了能整段丢掉」的保险"
---

# 别在 main 上裸奔：开分支、做完、合回去

> 目标：走一遍最基本的分支开发流程。原关卡 `2-1-0`。

## 场景

`team-board` 已经克隆好，你要给 `board.txt` 加一行。规矩是不许直接在 `main` 上改。

## 搭环境

```bash
bash docs/courses/git/assets/feature-branch-merge/init.sh
```

环境建在 `~/courses/git/feature-branch-merge/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/feature-branch-merge/init.sh"
    ```

## 任务

- 从 `main` 建并切到 `feature/snack-reminder`
- 在 `board.txt` 末尾加一行：`茶水间补货后记得同步群消息`
- 在功能分支上提交
- 切回 `main` 合并功能分支（本课不要求 push）

## 验收

- `board.txt` 末尾有那一行
- `main` 上能看到功能分支的提交
- `git branch` 里 `feature/snack-reminder` 存在
- `git status` 干净

## 提问

```conflict
<<<<<<< courses/git/feature-branch-merge
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/feature-branch-merge
Q2 分支只是一个指针
建分支前后各跑一次 `git log --oneline --graph --all --decorate -3`。刚 `checkout -b` 完、还没提交时，新分支和 `main` 指向的是同一条提交吗？`cat .git/refs/heads/feature/snack-reminder` 和 `cat .git/refs/heads/main` 说明了什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/feature-branch-merge
Q3 这次合并是什么类型
合并时 git 输出里出现了哪个词（`Fast-forward` 还是 `Merge made by ...`）？合并后 `git log --graph` 是一条直线还是有分叉？为什么会是这个结果？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/feature-branch-merge
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/feature-branch-merge
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/feature-branch-merge
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/feature-branch-merge
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/feature-branch-merge
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
