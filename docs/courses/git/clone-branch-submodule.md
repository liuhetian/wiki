---
description: "默认分支不是你要的分支，子模块默认是空目录，两件事一条命令解决"
---

# 一条 clone 要同时拿对分支和子模块

> 目标：用一条命令拿到非默认分支 + 子模块内容。原关卡 `0-0-2`。

## 场景

`starnet` 项目的训练脚本只在 `dev` 分支上，`utils/` 是一个子模块。直接 `git clone` 拿到的是 `main`，而且 `utils/` 会是个空目录。

（原关卡还要求先配 SSH 才连得上，那部分依赖 sshd 与 root，本地跑不了，已经去掉。）

## 搭环境

```bash
bash docs/courses/git/assets/clone-branch-submodule/init.sh
```

环境建在 `~/courses/git/clone-branch-submodule/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/clone-branch-submodule/init.sh"
    ```

## 任务

- 先 `source $ROOT/env.sh` —— 这一课的子模块走 `file://`，需要沙箱配置里的 `protocol.file.allow`（git 2.38.1 起默认禁止，CVE-2022-39253）
- 用**一条** clone 命令，把 `dev` 分支和子模块内容一次拿全，落到 `work/starnet`

## 验收

- `work/starnet` 当前分支是 `dev`（`git branch` 显示 `* dev`）
- `work/starnet/train.py` 存在（这是 dev 分支特有的文件）
- `work/starnet/utils/utils.py` 存在且**有内容**（不是空目录）

## 提问

```conflict
<<<<<<< courses/git/clone-branch-submodule
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-branch-submodule
Q2 两个参数分别管什么
你的完整命令是什么？其中哪个参数管分支、哪个管子模块？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-branch-submodule
Q3 不带参数会怎样
另外克隆一份、什么参数都不带，对比两份的 `git branch`、`ls utils/`、`cat .gitmodules`。子模块那个「空目录」在 git 眼里是什么状态（`git submodule status` 说什么）？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-branch-submodule
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-branch-submodule
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-branch-submodule
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-branch-submodule
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-branch-submodule
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
