---
description: "三种 reset 的区别只在「改动被放回哪一层」：仓库、暂存区、还是工作区"
---

# 后悔药分软硬两款：soft 与 mixed 的差别

> 目标：用 reset 的不同模式回退未推送的提交并重新组织。原关卡 `4-0-1`。

## 场景

`work/release-brief` 有两条未推送的提交，最新那条 `wip: note rollback owner` 把临时草稿 `brainstorm.txt` 也带了进去。

## 搭环境

```bash
bash docs/courses/git/assets/reset-soft-mixed/init.sh
```

环境建在 `~/courses/git/reset-soft-mixed/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/reset-soft-mixed/init.sh"
    ```

## 任务

- 把本地最近两条整理成：
    1. `docs: add launch checklist skeleton`
    2. `docs: add rollback owner note`
- 最新一条只能包含 `rollout.md` 的正式负责人备注，写成 `回滚负责人：值班发布经理`
- `brainstorm.txt` 不能留在仓库里

## 验收

- `git log --oneline -2` 两条说明正确
- `rollout.md` 里有 `回滚负责人：值班发布经理`
- `git ls-files` 里没有 `brainstorm.txt`
- `git status` 干净

## 提问

```conflict
<<<<<<< courses/git/reset-soft-mixed
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/reset-soft-mixed
Q2 三种模式的落点
在一个安全的地方分别试 `--soft`、默认（`--mixed`）、`--hard`，每次都贴出紧接着的 `git status`。改动分别落在哪一层？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/reset-soft-mixed
Q3 你选了哪个，为什么
这一课你实际用的是哪个模式？为什么另外两个不合适？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/reset-soft-mixed
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/reset-soft-mixed
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/reset-soft-mixed
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/reset-soft-mixed
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/reset-soft-mixed
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
