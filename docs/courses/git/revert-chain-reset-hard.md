---
description: "已推送的用 revert 一条条反做，没推送的直接 reset 掉，两种情况两种手法"
---

# 连环翻车：连续 revert 三条，再把本地废提交丢掉

> 目标：连续撤回多个已推送提交，并丢弃本地不要的提交。原关卡 `4-0-2`。

## 场景

`work/night-watch` 里有三条**已推送**的提交依次放松了发布门禁、还删掉了 runbook 里的呼叫提醒；另外本地还有一条没推的废提交。

## 搭环境

```bash
bash docs/courses/git/assets/revert-chain-reset-hard/init.sh
```

环境建在 `~/courses/git/revert-chain-reset-hard/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/revert-chain-reset-hard/init.sh"
    ```

## 任务

- 把三条已推送的改动都撤回来（`release_guard.py` 恢复成三个条件都要，`README.md` 恢复出「值班呼叫提醒」那一条）
- 把本地那条未推送的废提交丢掉
- 推上去

## 验收

- `release_guard.py` 的判断恢复成 staging + 审批 + 负责人确认三个条件
- `README.md` 里有值班呼叫提醒那一条
- 本地没有那条废提交（`git log origin/main..HEAD` 为空或只有 revert 提交）
- `git status` 干净，已 push

## 提问

```conflict
<<<<<<< courses/git/revert-chain-reset-hard
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-chain-reset-hard
Q2 撤回的顺序
三条 revert 你是按什么顺序做的？反过来会不会冲突？把你实际的命令序列和 `git log --oneline -8` 贴出来。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-chain-reset-hard
Q3 两种手法的分界
哪几条用了 revert、哪条用了 reset？分界线是什么？用 `git log origin/main..HEAD` 的输出说明你怎么判断的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-chain-reset-hard
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-chain-reset-hard
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-chain-reset-hard
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-chain-reset-hard
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-chain-reset-hard
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
