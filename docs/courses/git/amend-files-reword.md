---
description: "amend 只够得着最近一条，再往前就得请 rebase -i 出场"
---

# amend 补文件，rebase -i reword 改更早的说明

> 目标：既补内容又改更早那条的说明。原关卡 `3-0-1`。

## 场景

`work/brand-copy` 有两条未推送的本地提交：较早那条说明是 `update stuff`，最新那条是 `feat: add launch CTA assets`。另外 `palette_notes.txt` 还没进版本控制。

## 搭环境

```bash
bash docs/courses/git/assets/amend-files-reword/init.sh
```

环境建在 `~/courses/git/amend-files-reword/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/amend-files-reword/init.sh"
    ```

## 任务

- 把较早那条的说明改成 `docs: polish hero headline`
- 把 `palette_notes.txt` 补进**最新**那条提交里（不要新增提交）
- 最新那条的说明保持 `feat: add launch CTA assets`

## 验收

- `git log --oneline -2` 两条说明分别正确
- 最新那条包含 `button_copy.txt` 和 `palette_notes.txt`（`git show --name-only HEAD`）
- 提交总数没变，`git status` 干净

## 提问

```conflict
<<<<<<< courses/git/amend-files-reword
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-files-reword
Q2 两件事两种工具
补文件用的是哪条命令、改更早那条说明用的是哪条？为什么不能都用 amend？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-files-reword
Q3 rebase -i 的清单
`git rebase -i HEAD~2` 打开的那份清单原样贴出来（保存前）。每行的第一个词是什么？你把哪一行改成了什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-files-reword
Q4 两条 hash 都变了吗
操作前记下两条提交的 hash，操作后再记一次。变了几条？为什么改了较早那条，较新那条的 hash 也会变？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-files-reword
Q5 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-files-reword
Q6 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-files-reword
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-files-reword
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/amend-files-reword
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
