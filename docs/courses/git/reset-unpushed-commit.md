---
description: "没 push 的提交可以当作没发生过，前提是你知道 reset 把改动放回了哪一层"
---

# 还没推出去，赶紧把这次提交撤回来

> 目标：撤回未推送的提交并重新整理这次要提交的内容。原关卡 `1-1-1`。

## 场景

`work/deploy-guard` 里最新一条提交 `feat: update deploy script with staging key` 把 `staging.pem` 也一起交了进去。这条提交**还没推**。

## 搭环境

```bash
bash docs/courses/git/assets/reset-unpushed-commit/init.sh
```

环境建在 `~/courses/git/reset-unpushed-commit/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/reset-unpushed-commit/init.sh"
    ```

## 任务

- 撤回这次提交
- 只把 `deploy.sh` 的改动重新提交上去
- `staging.pem` 不能进版本库

## 验收

- `git log --all --name-only` 里没有 `staging.pem`
- 最新提交只包含 `deploy.sh`
- `staging.pem` 文件仍在磁盘上
- `git status` 干净（或 `staging.pem` 被忽略）

## 提问

```conflict
<<<<<<< courses/git/reset-unpushed-commit
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/reset-unpushed-commit
Q2 reset 把改动放回了哪一层
撤回用的是哪条命令？执行前后各跑一次 `git status` 和 `git log --oneline -3`。撤回之后，`deploy.sh` 的改动去了工作区还是暂存区？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/reset-unpushed-commit
Q3 软硬之间
同样的撤回换成另一个模式（`--soft` / 默认 / `--hard`）会有什么不同？至少真跑一种对比，贴出 `git status` 的差别。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/reset-unpushed-commit
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/reset-unpushed-commit
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/reset-unpushed-commit
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/reset-unpushed-commit
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/reset-unpushed-commit
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
