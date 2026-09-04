---
description: "init.defaultBranch 决定你 init 出来叫什么；团队约定决定你该叫什么"
---

# 默认分支名不是装饰：init 出来叫 master 怎么办

> 目标：从零建仓，并把主分支控制成 main。原关卡 `1-0-1`。

## 场景

`work/release-cards/` 里三个文件都准备好了，但这一课的沙箱 git 配置故意把 `init.defaultBranch` 设成了 `master`。团队要求本地和远程主分支都必须是 `main`。

## 搭环境

```bash
bash docs/courses/git/assets/init-default-branch/init.sh
```

环境建在 `~/courses/git/init-default-branch/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/init-default-branch/init.sh"
    ```

## 任务

- 先 `source $ROOT/env.sh` —— 不 source 就复现不出这个现场
- 初始化仓库、提交、把主分支变成 `main`，并推到远程 `main`

## 验收

- `work/release-cards/.git` 存在
- 当前分支是 `main`
- `README.md`、`cards.txt`、`publish.sh` 都已提交，`git status` 干净
- 远程有 `main` 分支且包含这次提交，**没有**多出一个 `master` 分支

## 提问

```conflict
<<<<<<< courses/git/init-default-branch
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/init-default-branch
Q2 init 出来叫什么
`git init` 之后 `git branch` 说什么？`cat .git/HEAD` 又是什么？这个名字是从哪来的（`git config --get init.defaultBranch` 试试）？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/init-default-branch
Q3 改名的两种时机
分支改名你用的是哪条命令？如果先推错了名字再改，远程会不会自动跟着改？用 `git branch -a` 的输出说明。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/init-default-branch
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/init-default-branch
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/init-default-branch
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/init-default-branch
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/init-default-branch
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
