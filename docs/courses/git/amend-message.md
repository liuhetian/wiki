---
description: "amend 不是「编辑」那条提交，是造一条新的把它换掉"
---

# 提交说明写歪了，推之前还能改

> 目标：用 commit --amend 修正最近一次提交说明。原关卡 `3-0-0`。

## 场景

`work/release-notes` 里最近一条提交的说明写成了 `asdf`。这条**还没推**。

## 搭环境

```bash
bash docs/courses/git/assets/amend-message/init.sh
```

环境建在 `~/courses/git/amend-message/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/amend-message/init.sh"
    ```

## 任务

- 把最近一次提交说明改成一句像样的话（说清这次改了什么），不要新增提交。

## 验收

- `git log --oneline -1` 的说明不再是 `asdf`
- `git log --oneline | wc -l` 与改之前相同（没多出提交）
- `git status` 干净

## 提问

```conflict
<<<<<<< courses/git/amend-message
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-message
Q2 amend 换掉了什么
amend 之前先记下 `git rev-parse HEAD`，amend 之后再记一次。两个 hash 一样吗？这说明 amend 做的是「修改」还是「替换」？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-message
Q3 旧的那条去哪了
`git reflog -3` 输出是什么？被换掉的那条提交还能找到吗？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-message
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-message
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-message
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-message
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-message
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
