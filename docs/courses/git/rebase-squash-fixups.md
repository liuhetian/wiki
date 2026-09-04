---
description: "历史是写给下一个人读的，五条流水账该压成一条有意义的提交"
---

# 「fix typo」三连击：把杂乱历史压成一条

> 目标：用交互式 rebase 压缩并重写提交历史。原关卡 `3-0-2`。

## 场景

`work/event-invite` 里有 5 条未推送的本地提交，其中三条都叫 `fix typo`。

## 搭环境

```bash
bash docs/courses/git/assets/rebase-squash-fixups/init.sh
```

环境建在 `~/courses/git/rebase-squash-fixups/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/rebase-squash-fixups/init.sh"
    ```

## 任务

- 把这 5 条压成 1 条，说明写成一句能说清这次做了什么的话
- 最终 `invite.md` 的内容必须是压缩前最后的样子

## 验收

- `git log --oneline` 里本地只剩 1 条新提交（`git log origin/main..HEAD` 只有一条）
- 没有 `fix typo` 说明残留
- `invite.md` 内容与压缩前一致
- `git status` 干净

## 提问

```conflict
<<<<<<< courses/git/rebase-squash-fixups
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-squash-fixups
Q2 清单和动作词
`git rebase -i` 清单原样贴出来（保存前和保存后各一次）。你用了哪个动作词？它和 `fixup` 有什么区别？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-squash-fixups
Q3 内容有没有变
压缩前先 `md5sum invite.md`，压缩后再算一次。一样吗？如果不一样，说明你哪一步弄丢了内容。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-squash-fixups
Q4 历史被重写到什么程度
压缩前后 `git log --oneline` 各贴一次。被压掉的那几条还能通过 `git reflog` 找到吗？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-squash-fixups
Q5 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-squash-fixups
Q6 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-squash-fixups
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-squash-fixups
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-squash-fixups
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
