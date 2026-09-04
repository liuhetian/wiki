---
description: "revert 一个 merge 之后直接再 merge，会拿到一个「看起来合了但内容没回来」的结果"
---

# 撤销一次 merge，修好之后还得先撤回那次撤回

> 目标：撤销 merge commit，并在修复后重新合并。原关卡 `4-0-3`。

## 场景

`ops-stage` 的 `main` 上已经用 `--no-ff` 合过一次 `feature/live-canvas`，那次合并带来了过快的刷新节奏。功能分支上现在已经有修复提交 `fix: calm live canvas refresh rate`。

## 搭环境

```bash
bash docs/courses/git/assets/revert-merge-revert-revert/init.sh
```

环境建在 `~/courses/git/revert-merge-revert-revert/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/revert-merge-revert-revert/init.sh"
    ```

## 任务

- 先把那条 merge commit 从 `main` 上整次撤回
- 然后把修好的 `feature/live-canvas` 重新合回 `main`，并保证被一起撤掉、但修复提交没再动过的文件也完整回来
- 推上去

## 验收

- `main` 上 `dashboard.html`、`assets/palette.txt`、`scripts/live_canvas.js` 三个文件都在且是修复后的内容
- `git log --oneline --graph` 里能看到：merge → revert → revert 的 revert → 再 merge
- `git status` 干净，已 push

## 提问

```conflict
<<<<<<< courses/git/revert-merge-revert-revert
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-merge-revert-revert
Q2 revert 一个 merge 要多一个参数
撤销 merge commit 时 git 一开始报了什么错？你加了哪个参数、参数的值取 1 还是 2、怎么判断的？（`git cat-file -p <merge 的 hash>` 能看到 parent 顺序）
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-merge-revert-revert
Q3 直接再 merge 会怎样
先别急着撤回那次撤回 —— 直接再 merge 一次 `feature/live-canvas`，然后 `ls` 和 `git log --oneline --graph -5`。文件回来了吗？git 说这次合并做了什么？为什么会这样？（做完把这一步退掉再继续）
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-merge-revert-revert
Q4 撤回那次撤回
你最后的命令序列是什么？`git log --oneline --graph -8` 贴出来，指出哪条是 merge、哪条是 revert、哪条是 revert 的 revert。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-merge-revert-revert
Q5 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-merge-revert-revert
Q6 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-merge-revert-revert
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-merge-revert-revert
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-merge-revert-revert
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
