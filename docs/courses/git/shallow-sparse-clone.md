---
description: "--depth 省历史、sparse-checkout 省目录、--unshallow 再把历史要回来"
---

# 浅克隆 + 稀疏检出，然后再把历史补回来

> 目标：只拿需要的那部分，事后再补全历史。原关卡 `0-0-3`。

## 场景

`palette-ai` 仓库里 `assets/` 占了绝大部分体积，你只需要 `models/` 下的代码。但仓库历史里有一条很早的灵感笔记提交要翻出来看，所以历史最后还是得补全。

## 搭环境

```bash
bash docs/courses/git/assets/shallow-sparse-clone/init.sh
```

环境建在 `~/courses/git/shallow-sparse-clone/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/shallow-sparse-clone/init.sh"
    ```

## 任务

- 浅克隆到 `work/palette-ai`（注意：远程是 `file://` 地址，写成裸路径的话 git 会走本地捷径、`--depth` 会被忽略）
- 用 sparse-checkout 只检出 `models/`
- 最后把完整历史补回来，能看到全部 7 条提交

## 验收

- `work/palette-ai/models/` 下有 `generator.py`、`train.py`、`discriminator.py`、`creative_notes.md`
- `git log --oneline` 能看到全部 7 条提交（说明已经 unshallow）
- `assets/` 没有被检出

## 提问

```conflict
<<<<<<< courses/git/shallow-sparse-clone
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/shallow-sparse-clone
Q2 三步各省了什么
分别贴出：浅克隆刚完成时的 `git log --oneline | wc -l`、`du -sh .git`、`ls`；sparse-checkout 之后的 `ls`；unshallow 之后的 `git log --oneline | wc -l`、`du -sh .git`。三步各自省掉的是什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/shallow-sparse-clone
Q3 为什么必须写 file://
把远程地址写成裸路径再浅克隆一次，`git log --oneline | wc -l` 是多少？为什么本地路径克隆时 `--depth` 不起作用？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/shallow-sparse-clone
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/shallow-sparse-clone
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/shallow-sparse-clone
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/shallow-sparse-clone
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/shallow-sparse-clone
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
