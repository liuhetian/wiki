---
description: "「从暂存区移走」和「把文件改回去」是两条不同的命令，别记混"
---

# 把暂存区清干净、把文件改回去、再让它们别再来

> 目标：撤销误加与误改，并用 .gitignore 兜住。原关卡 `0-1-2`。

## 场景

上午写完了 `add` 和 `divide` 还有测试，出门前顺手 `git add .` 把所有东西都加进了暂存区 —— 包括带数据库密码的 `.env` 和 `__pycache__/`。回来发现 `config.py` 里还被压出了一串乱码。

## 搭环境

```bash
bash docs/courses/git/assets/discard-changes-gitignore/init.sh
```

环境建在 `~/courses/git/discard-changes-gitignore/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/discard-changes-gitignore/init.sh"
    ```

## 任务

- 把 `.env` 和 `__pycache__/` 从暂存区移走（文件留在本地）
- 把 `config.py` 的乱码改回去
- 写 `.gitignore` 让它们不再被误加
- 正确提交并推送

## 验收

- 最新提交包含 `calc.py`（有 `add` 与 `divide`）和 `test_calc.py`
- `config.py` 里没有乱码
- `git log --all --name-only` 中没有 `.env`、没有 `__pycache__`
- `.gitignore` 存在且至少忽略 `.env` 与 `__pycache__`
- `git status` 干净，改动已 push

## 提问

```conflict
<<<<<<< courses/git/discard-changes-gitignore
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/discard-changes-gitignore
Q2 移走 vs 改回去
你用了哪两条不同的命令分别处理「从暂存区移走」和「把工作区改回去」？把它们对调会发生什么（可以在别的文件上真的试一次）？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/discard-changes-gitignore
Q3 .gitignore 的作用边界
写完 `.gitignore` 之后，已经在暂存区里的文件会自动消失吗？用 `git status` 的输出证明你的答案。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/discard-changes-gitignore
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/discard-changes-gitignore
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/discard-changes-gitignore
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/discard-changes-gitignore
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/discard-changes-gitignore
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
