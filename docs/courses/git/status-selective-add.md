---
description: "先读 status 再决定谁进这次提交，git add . 是最容易犯的错"
---

# 只提交该提交的那部分

> 目标：看懂 status，然后有选择地 add。原关卡 `0-1-1`。

## 场景

工作区里堆了好几样东西：改过的 `calc.py`、新写的 `test_calc.py`、跑出来的 `debug.log`、还有 `__pycache__/` 缓存目录。另外 README 还没写。

## 搭环境

```bash
bash docs/courses/git/assets/status-selective-add/init.sh
```

环境建在 `~/courses/git/status-selective-add/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/status-selective-add/init.sh"
    ```

## 任务

- 补一个 `README.md`
- 只把 `calc.py`、`test_calc.py`、`README.md` 提交上去
- `debug.log` 和 `__pycache__/` 不要进版本库

## 验收

- 最新提交里包含 `calc.py`、`test_calc.py`、`README.md`
- `git log --all --name-only` 里没有 `debug.log`、没有 `__pycache__`
- `debug.log` 与 `__pycache__/` 这两个文件本身还留在磁盘上

## 提问

```conflict
<<<<<<< courses/git/status-selective-add
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/status-selective-add
Q2 status 的三段
`git status` 的原始输出贴出来。它把文件分成了几组？每组的标题行原文是什么、分别意味着什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/status-selective-add
Q3 选择性 add
你是怎么只加进那三个的？如果先 `git add .` 再往回退，退的命令是什么、文件会不会被删掉？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/status-selective-add
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/status-selective-add
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/status-selective-add
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/status-selective-add
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/status-selective-add
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
