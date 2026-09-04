---
description: "两件事塞进一个分支，就再也拆不开了"
---

# 两条独立的功能分支同时推进

> 目标：让两件不相干的事各走各的分支。原关卡 `2-1-1`。

## 场景

`launch-playbook` 里有两件不相干的活：补 QA 清单、补发布说明。

## 搭环境

```bash
bash docs/courses/git/assets/two-parallel-branches/init.sh
```

环境建在 `~/courses/git/two-parallel-branches/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/two-parallel-branches/init.sh"
    ```

## 任务

- 从 `main` 分别建 `feature/qa-checklist` 和 `feature/release-note`
- 在 `feature/qa-checklist` 上给 `checklist.md` 追加：`- 回归测试完成后在群里同步结果`
- 在 `feature/release-note` 上给 `release_notes.md` 追加：`- 发布说明需附上回滚负责人`
- 两边都提交后切回 `main`，逐一合并

## 验收

- 两个分支都存在且各有一条提交
- `main` 上两处改动都在
- `git log --graph --oneline --all` 能看出两条分支从同一点分出
- `git status` 干净

## 提问

```conflict
<<<<<<< courses/git/two-parallel-branches
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/two-parallel-branches
Q2 从哪里分出去
建第二个分支时你在哪个分支上？如果忘了先切回 `main` 会怎样（`git log --graph` 会长什么样）？把你实际的 `git log --oneline --graph --all --decorate` 贴出来。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/two-parallel-branches
Q3 两次合并的差别
第一次合并和第二次合并，git 的输出一样吗？为什么第二次可能不再是 fast-forward？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/two-parallel-branches
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/two-parallel-branches
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/two-parallel-branches
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/two-parallel-branches
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/two-parallel-branches
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
