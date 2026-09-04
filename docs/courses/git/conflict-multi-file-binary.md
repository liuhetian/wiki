---
description: "二进制文件没有 hunk 可合，只能用 --ours / --theirs 整份选一边"
---

# 多文件冲突，其中一个是二进制

> 目标：同时处理文本冲突与二进制冲突。原关卡 `2-0-3`。

## 场景

`campaign-studio` 里 `landing.js`、`copy.txt`、`assets/hero.png` 三个文件你和同事都改了。前两个是文本，最后一个是二进制。

## 搭环境

```bash
bash docs/courses/git/assets/conflict-multi-file-binary/init.sh
```

环境建在 `~/courses/git/conflict-multi-file-binary/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/conflict-multi-file-binary/init.sh"
    ```

## 任务

- 三个文件的冲突都解决掉：文本按业务合并，`assets/hero.png` 采用**远程**那一版
- 提交合并结果并推送

## 验收

- 三个文件都没有冲突标记残留
- `git show origin/main:assets/hero.png | cmp - assets/hero.png` 无差异（用的是远程那版）
- `git status` 干净，有合并提交
- 已 push：`git rev-parse HEAD origin/main` 两行一致

## 提问

```conflict
<<<<<<< courses/git/conflict-multi-file-binary
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-multi-file-binary
Q2 二进制冲突长什么样
`git status` 里三个文件的状态标记分别是什么？试着 `cat assets/hero.png` 或 `git diff assets/hero.png`，git 说了什么？为什么二进制文件不给你 hunk？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-multi-file-binary
Q3 整份选一边
你是用哪条命令选定 `hero.png` 的？`--ours` 和 `--theirs` 在这次 merge 里分别指谁？（`git log --oneline MERGE_HEAD -1` 能帮你确认）
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-multi-file-binary
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-multi-file-binary
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-multi-file-binary
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-multi-file-binary
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-multi-file-binary
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
