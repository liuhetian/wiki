---
description: "删掉 .git 之后文件都还在，丢的是身份，以及全部历史"
---

# 掀开 .git 看一眼，然后把它删了再建回来

> 目标：看清 .git 的结构，体验仓库身份丢失与重建。原关卡 `1-0-2`。

## 场景

`work/telemetry-probe/` 是个普通目录，里面还放了一个 `accident.sh`，运行它会把 `.git` 删掉。

## 搭环境

```bash
bash docs/courses/git/assets/dot-git-anatomy/init.sh
```

环境建在 `~/courses/git/dot-git-anatomy/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/dot-git-anatomy/init.sh"
    ```

## 任务

- 先 `source $ROOT/env.sh`
- 把目录初始化成仓库并提交
- 观察 `.git` 里的 `HEAD`、`objects/`、`refs/`
- 运行 `./accident.sh` 模拟误删
- 重新建仓、提交、推送到远程

## 验收

- `work/telemetry-probe/.git` 存在
- 文件都已提交，`git status` 干净
- `origin` 指向 init.sh 打印的地址，远程 `main` 上有提交

## 提问

```conflict
<<<<<<< courses/git/dot-git-anatomy
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/dot-git-anatomy
Q2 HEAD / objects / refs 各是什么
第一次提交之后，`cat .git/HEAD`、`ls .git/refs/heads/`、`cat .git/refs/heads/main`、`find .git/objects -type f | head` 分别是什么？把 HEAD → refs → object 这条链走一遍，并用 `git cat-file -p <hash>` 把那条链上的对象都打印出来。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/dot-git-anatomy
Q3 删掉 .git 丢了什么
运行 `accident.sh` 之后，`ls` 和 `git status` 分别是什么？文件还在吗？历史还在吗？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/dot-git-anatomy
Q4 重建之后的历史
重新 init 并提交之后，`git log --oneline` 有几条？和删之前一样吗？为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/dot-git-anatomy
Q5 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/dot-git-anatomy
Q6 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/dot-git-anatomy
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/dot-git-anatomy
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/dot-git-anatomy
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
