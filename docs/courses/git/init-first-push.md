---
description: "仓库身份不是天生的，是那个隐藏的 .git 给的"
---

# 从普通目录跨进 Git 仓库

> 目标：把一个普通文件夹变成仓库，并完成第一次推送。原关卡 `1-0-0`。

## 场景

`work/morning-notes/` 里 `README.md` 和 `notes.txt` 都写好了，但这个目录现在只是个普通文件夹。远程那边已经准备了一个空仓库。

## 搭环境

```bash
bash docs/courses/git/assets/init-first-push/init.sh
```

环境建在 `~/courses/git/init-first-push/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/init-first-push/init.sh"
    ```

## 任务

- 先 `source $ROOT/env.sh`（这一课要用沙箱里的 git 全局配置）
- 把目录初始化成 Git 仓库，完成第一次提交，推到远程 `main`

## 验收

- `work/morning-notes/.git` 存在
- `README.md` 与 `notes.txt` 都已提交，`git status` 干净
- 当前分支是 `main`
- `origin` 指向 init.sh 打印的地址
- `git log origin/main --oneline` 能看到这条初始提交（不是只有本地 commit）

## 提问

```conflict
<<<<<<< courses/git/init-first-push
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/init-first-push
Q2 init 之后多了什么
`git init` 前后各跑一次 `ls -a`，差别是什么？`.git` 刚建好时里面有哪几项（`ls .git`）？这时候 `git log` 说什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/init-first-push
Q3 空仓库怎么接上
远程是个空仓库，你是怎么把本地和它接上的？`git remote add` 之后、push 之前，`git branch -a` 输出是什么？push 之后又多了什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/init-first-push
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/init-first-push
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/init-first-push
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/init-first-push
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/init-first-push
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
