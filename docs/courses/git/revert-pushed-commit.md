---
description: "推出去的历史不能改，只能追加一条「反做」的提交"
---

# 已经推出去了，只能体面地反着来一次

> 目标：用 revert 安全撤回已推送的提交。原关卡 `4-0-0`。

## 场景

`work/alert-ticker` 里有一条错误提交已经 push 到远程了。

## 搭环境

```bash
bash docs/courses/git/assets/revert-pushed-commit/init.sh
```

环境建在 `~/courses/git/revert-pushed-commit/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/revert-pushed-commit/init.sh"
    ```

## 任务

- 用不改写历史的方式撤回那次改动，并推上去。

## 验收

- `alert_rules.py` 的内容回到出错前的样子
- `git log --oneline` 里错误提交**仍在**，后面多了一条撤回提交
- `git status` 干净，已 push

## 提问

```conflict
<<<<<<< courses/git/revert-pushed-commit
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-pushed-commit
Q2 revert 加了什么
revert 前后各贴一次 `git log --oneline -3`。历史里少了东西还是多了东西？`git show <revert 那条>` 的 diff 和被撤回那条的 diff 是什么关系？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-pushed-commit
Q3 为什么不用 reset
如果这里改用 `git reset --hard` 再 push，会发生什么？（可以真的试一次，把 git 拒绝的原文贴出来，然后恢复。）说明为什么已推送的提交要用 revert。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-pushed-commit
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-pushed-commit
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-pushed-commit
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-pushed-commit
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/revert-pushed-commit
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
