---
description: "另一个仓库的提交要先 fetch 进本地对象库，才有资格被 cherry-pick"
---

# 跨仓库搬提交：先 fetch 进来，再 cherry-pick

> 目标：从一个独立的远程仓库把连续历史搬到本仓库。原关卡 `4-1-3`。

## 场景

`payment-gateway` 和 `partner-snippets` 是两个**互不相干**的仓库。你要从后者的两个分支上把三条提交搬到前者的 `main`。

## 搭环境

```bash
bash docs/courses/git/assets/cherry-pick-range-cross-repo/init.sh
```

环境建在 `~/courses/git/cherry-pick-range-cross-repo/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/cherry-pick-range-cross-repo/init.sh"
    ```

## 任务

- 把外部仓库加成一个 remote 并 fetch 进来
- 从 `feature/pay-tunnel` 上连续搬回两条：`feat: add pay tunnel adapter` 与 `chore: document tunnel provider env`
- 再从 `hotfix/callback-copy` 上搬回 `docs: clarify callback confirmation copy`
- 不要把 `docs: archive abandoned sdk note` 带进来
- 完成后保留新增的那个 remote，不需要 push

## 验收

- `git remote -v` 里除了 `origin` 还有外部仓库那个 remote
- `main` 上有那三条提交、没有 abandoned sdk 那条
- `lib/pay_tunnel.js` 存在，`config/payment.env.example` 里有 `TUNNEL_PROVIDER`
- `docs/integration_note.md` 里有回调文案那一行
- `git status` 干净

## 提问

```conflict
<<<<<<< courses/git/cherry-pick-range-cross-repo
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-range-cross-repo
Q2 fetch 之前 fetch 之后
`git remote add` 之后、`fetch` 之前，`git log <remote>/feature/pay-tunnel` 能跑通吗？fetch 之后呢？`git branch -a` 前后各贴一次。这说明 fetch 把什么搬进来了？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-range-cross-repo
Q3 两个仓库没有共同祖先
`git merge-base main <remote>/main` 输出什么？既然两个仓库毫无关系，为什么 cherry-pick 还能成功？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-range-cross-repo
Q4 范围写法
搬那连续两条时你写的范围是什么？确认第一条真的被搬进来了 —— 用什么命令确认的？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-range-cross-repo
Q5 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-range-cross-repo
Q6 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-range-cross-repo
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-range-cross-repo
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/cherry-pick-range-cross-repo
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
