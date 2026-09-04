---
description: "Git 不等于 GitHub，远程可以是任意一个能访问到的路径"
---

# clone 的第一课：仓库地址不在 GitHub 上

> 目标：把一个远程仓库拉到本地。原关卡 `0-0-0`。

## 场景

`cal` 项目已经存在于一个远程仓库里，但它不在 GitHub 上。你手上只有 `init.sh` 末尾打印的那个地址，工作目录里现在什么都没有。

## 搭环境

```bash
bash docs/courses/git/assets/clone-basics/init.sh
```

环境建在 `~/courses/git/clone-basics/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/clone-basics/init.sh"
    ```

## 任务

- 把 `cal` 项目克隆到 `$ROOT/work/` 下。

## 验收

- `work/cal/.git` 存在
- `work/cal` 的 `origin` 指向 init.sh 打印的那个 `file://` 地址
- `README.md` 与 `calc.py` 都在

## 提问

```conflict
<<<<<<< courses/git/clone-basics
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-basics
Q2 clone 到底做了什么
`git clone` 之后 `work/cal` 里多了哪些东西？`git remote -v`、`git branch -a`、`git log --oneline` 分别输出什么？贴原文。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-basics
Q3 远程地址的形态
这次的远程地址是 `file://...`。它和 `https://github.com/...`、`git@github.com:...` 在 git 眼里是同一类东西吗？说出你的判断依据（`git remote -v` 的输出能支持你的说法吗）。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-basics
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-basics
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-basics
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-basics
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-basics
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
