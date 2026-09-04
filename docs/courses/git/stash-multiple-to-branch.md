---
description: "stash@{n} 的编号会变，靠 -m 留下的说明才认得出哪份是哪份"
---

# 三份 stash：认出来、用掉一份、转走一份、留下一份

> 目标：管理多份 stash，定向恢复，并把旧草稿转成分支。原关卡 `2-1-3`。

## 场景

`atelier-poster` 里堆了三份 stash：一份是法务备注改动，一份是霓虹视觉草稿，一份只是随手涂鸦。之后 `poster.txt` 又被提交改过一次，所以恢复法务那份会冲突。

## 搭环境

```bash
bash docs/courses/git/assets/stash-multiple-to-branch/init.sh
```

环境建在 `~/courses/git/stash-multiple-to-branch/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/stash-multiple-to-branch/init.sh"
    ```

## 任务

- 用 `git stash list` 分辨三份各是什么
- 把「法务备注」那份应用到 `main`，解决 `poster.txt` 的冲突，结果必须同时保留 `主题：发布会倒计时`、`按钮：立即生成主视觉`、`备注：上线前需法务复核`
- 用完的那份 stash 清理掉
- 把「霓虹视觉草稿」那份用 `git stash branch` 转成分支 `feature/neon-splash`，该分支上 `theme.txt` 要包含 `风格：霓虹流光` 和 `按钮气质：像舞台灯光一样亮`
- 「随手涂鸦」那份保留，不要动

## 验收

- `main` 上 `poster.txt` 三行都对，没有冲突标记
- `feature/neon-splash` 分支存在且 `theme.txt` 内容正确
- `git stash list` 里只剩「涂鸦」那一份

## 提问

```conflict
<<<<<<< courses/git/stash-multiple-to-branch
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-multiple-to-branch
Q2 编号会变
`git stash list` 原样贴出来。三份分别是 `stash@{几}`？用掉一份之后再 list 一次，剩下两份的编号变了吗？这说明编号是什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-multiple-to-branch
Q3 stash 冲突时的状态
应用法务那份时冲突了，`git status` 说什么？这时能不能用 `git merge --abort`？真跑一次，把 git 的回答贴出来，并说明为什么。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-multiple-to-branch
Q4 stash branch 做了什么
`git stash branch` 一条命令做了哪几件事？执行前后的 `git branch`、`git stash list`、`git status` 各是什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-multiple-to-branch
Q5 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-multiple-to-branch
Q6 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-multiple-to-branch
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-multiple-to-branch
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/stash-multiple-to-branch
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
