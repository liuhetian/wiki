---
description: "停止追踪不等于从历史里消失，推出去之后能做的只有止损"
---

# 已经推上去的敏感文件，删得掉吗

> 目标：区分 rm 与 rm --cached，并认清「已推送」这条边界。原关卡 `1-1-2`。

## 场景

`work/night-watch` 里有人把 `.env`、`db.sqlite3`、`run.log` 一起提交并**推到了远程**。

## 搭环境

```bash
bash docs/courses/git/assets/rm-vs-rm-cached/init.sh
```

环境建在 `~/courses/git/rm-vs-rm-cached/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/rm-vs-rm-cached/init.sh"
    ```

## 任务

- 让这三个文件不再被 git 追踪，但文件留在本地
- 写 `.gitignore` 防止再犯
- 提交并推送这次清理

## 验收

- `git ls-files` 里不再有 `.env`、`db.sqlite3`、`run.log`
- 这三个文件仍在磁盘上
- `.gitignore` 覆盖了它们
- 改动已 push

## 提问

```conflict
<<<<<<< courses/git/rm-vs-rm-cached
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rm-vs-rm-cached
Q2 两条 rm 的区别
你用的是哪条命令？它和不带 `--cached` 的版本，对「磁盘上的文件」和「索引」分别做了什么？各贴一次 `git status` + `ls`。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rm-vs-rm-cached
Q3 历史里还有没有
清理并推送之后，`git log --all --name-only | grep -c '\.env'` 是多少？`git show <最初那条提交>:.env` 还能打印出内容吗？这说明「删掉」到底删掉了什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rm-vs-rm-cached
Q4 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rm-vs-rm-cached
Q5 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rm-vs-rm-cached
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rm-vs-rm-cached
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rm-vs-rm-cached
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
