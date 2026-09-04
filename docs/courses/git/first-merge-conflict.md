---
description: "冲突标记不是报错信息，是 git 把选择权交还给你的方式"
---

# 第一次合并冲突：读懂那三行标记

> 目标：看懂冲突标记的结构，手工合出正确结果。原关卡 `2-0-0`。

## 场景

`math_tool.py` 里你和同事同时往文件末尾加了函数。同事先推了 `sub`，你本地提交了 `mul`，还没推。

## 搭环境

```bash
bash docs/courses/git/assets/first-merge-conflict/init.sh
```

环境建在 `~/courses/git/first-merge-conflict/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/first-merge-conflict/init.sh"
    ```

## 任务

- 把两边的改动合到一起，提交合并结果并推上去。

## 验收

- `math_tool.py` 里同时有 `add`、`sub`、`mul`，没有重复定义
- 没有 `<<<<<<<` / `=======` / `>>>>>>>` 残留
- `git status` 干净，`git log --graph -3` 能看到合并提交
- 已 push：`git rev-parse HEAD origin/main` 两行一致

## 提问

```conflict
<<<<<<< courses/git/first-merge-conflict
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/first-merge-conflict
Q2 三行标记的结构
`git pull` 之后 `math_tool.py` 的冲突段原样贴出来。`<<<<<<<` 后面跟的是什么、`>>>>>>>` 后面跟的是什么？哪半是你的？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/first-merge-conflict
Q3 冲突期间 git 处于什么状态
冲突未解决时，`git status` 的原文是什么？它建议了哪两条出路？`git ls-files --stage math_tool.py` 有几行、每行开头的数字是什么意思？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/first-merge-conflict
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/first-merge-conflict
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/first-merge-conflict
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/first-merge-conflict
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/first-merge-conflict
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
