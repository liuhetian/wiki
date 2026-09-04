---
description: "--cached 这个开关决定了你删的是「索引里的记录」还是「磁盘上的文件」"
---

# 只从暂存区移走，别把文件也删了

> 目标：把误加的文件撤出暂存区，同时保住磁盘上的文件。原关卡 `1-1-0`。

## 场景

`work/leak-lab` 已经是个仓库，`README.md` 和 `app.py` 已提交。但 `scratch.log`（里面有临时 token）被手滑 `add` 进了暂存区，还没提交。

## 搭环境

```bash
bash docs/courses/git/assets/rm-cached-unstage/init.sh
```

环境建在 `~/courses/git/rm-cached-unstage/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/rm-cached-unstage/init.sh"
    ```

## 任务

- 把 `scratch.log` 从暂存区移走
- 文件本身必须留在本地

## 验收

- `git status` 里 `scratch.log` 显示为未跟踪（Untracked）
- `scratch.log` 文件还在磁盘上
- `README.md` 与 `app.py` 的已提交状态没受影响

## 提问

```conflict
<<<<<<< courses/git/rm-cached-unstage
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rm-cached-unstage
Q2 带不带 --cached
你用的命令是什么？先在一个复制品上试一次不带 `--cached` 的版本，对比两次的 `ls` 和 `git status`，差别是什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rm-cached-unstage
Q3 索引里到底存了什么
移走前后各跑一次 `git ls-files --stage`，`scratch.log` 那一行发生了什么变化？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rm-cached-unstage
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rm-cached-unstage
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rm-cached-unstage
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rm-cached-unstage
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rm-cached-unstage
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
