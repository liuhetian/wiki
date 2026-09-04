---
description: "冲突在同一行时没有「都保留」这个选项，只能重新想清楚规则该是什么"
---

# 同一行上的冲突：两个业务意图要合成一个

> 目标：把互相冲突的两种判断合成一条正确的规则。原关卡 `2-0-2`。

## 场景

`release_gate.py` 决定什么情况下允许发版。同事推的版本放宽了 production，你本地改的是 staging 的紧急放行。两边改的是同一行判断。

## 搭环境

```bash
bash docs/courses/git/assets/conflict-same-line/init.sh
```

环境建在 `~/courses/git/conflict-same-line/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/conflict-same-line/init.sh"
    ```

## 任务

- 合出一条同时满足下面三条规则的判断，提交并推送：
    - staging：至少一个审批通过，或值班负责人紧急放行
    - production：必须有审批通过，值班负责人**不能**绕过审批
    - 其他环境：一律不允许

## 验收

- `release_gate.py` 的判断同时满足上面三条
- 没有冲突标记残留
- `git status` 干净，有合并提交
- 已 push：`git rev-parse HEAD origin/main` 两行一致

## 提问

```conflict
<<<<<<< courses/git/conflict-same-line
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-same-line
Q2 同一行冲突长什么样
冲突段原样贴出来。和「两边各加一段」的冲突相比，这次的标记范围有什么不同？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-same-line
Q3 三条规则怎么落成代码
你最终写成了什么？把那几行贴出来，并逐条说明它是怎么满足三条规则的 —— 特别是 production 那条，为什么不能照抄任何一边。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-same-line
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-same-line
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-same-line
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-same-line
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-same-line
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
