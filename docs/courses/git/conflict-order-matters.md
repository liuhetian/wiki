---
description: "「两边都留」最省事也最危险，这一课它会留出一个重复调用"
---

# 顺序敏感的冲突：把两半拼起来会拼出重复调用

> 目标：按业务语义决定最终顺序，而不是机械保留两边。原关卡 `2-0-1`。

## 场景

`notifier-service` 的 `dispatch()` 最早只有一步 `deliver_message`。

同事先推的版本是「先校验、再整形，然后发送」；你本地提交的版本是「先整形、再签名，然后发送」。两边插入的位置完全相同，而且**都插了 `normalize_message`**。你的提交还没推。

## 搭环境

```bash
bash docs/courses/git/assets/conflict-order-matters/init.sh
```

环境建在 `~/courses/git/conflict-order-matters/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/conflict-order-matters/init.sh"
    ```

## 任务

- 把两边的改动合成一条正确的处理链，提交合并结果并推上去。

## 验收

- `dispatch()` 里依次是 `validate_message` → `normalize_message` → `sign_message` → `deliver_message`，**每步只出现一次**
- 没有冲突标记残留
- `git status` 干净
- `git log --oneline --graph -3` 能看到一次合并提交
- 已 push，远程 `main` 与本地一致

## 提问

```conflict
<<<<<<< courses/git/conflict-order-matters
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-order-matters
Q2 冲突原文
`git pull` 之后 `dispatch()` 变成了什么样？把带标记的那一整段原样贴进来，并说明哪半是 `HEAD`。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-order-matters
Q3 两边各加了什么
上下两半分别新增了哪些调用？哪一个调用是两边都加了的？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-order-matters
Q4 机械保留两边会怎样
如果只删掉三行标记、上下内容都留着，`dispatch()` 会变成什么？把那几行写出来，并说明它错在哪。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-order-matters
Q5 正确顺序的理由
最终顺序为什么是 validate → normalize → sign → deliver？分别说明：为什么 `validate` 必须在最前，为什么 `sign` 必须在 `normalize` 之后。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-order-matters
Q6 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-order-matters
Q7 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-order-matters
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-order-matters
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/conflict-order-matters
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
