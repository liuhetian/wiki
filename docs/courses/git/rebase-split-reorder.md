---
description: "edit 让 rebase 停在那条提交上，接下来就是普通的 reset + 分批 commit"
---

# 把一坨 wip 拆开，还要重排顺序

> 目标：在交互式 rebase 里拆分大提交并调整顺序。原关卡 `3-0-3`。

## 场景

`work/ops-dashboard` 本地有 3 条提交，其中一条巨大的 `wip: finish dashboard` 把布局、脚本、交接说明全揉在了一起。

## 搭环境

```bash
bash docs/courses/git/assets/rebase-split-reorder/init.sh
```

环境建在 `~/courses/git/rebase-split-reorder/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/rebase-split-reorder/init.sh"
    ```

## 任务

- 把最近 3 条整理成下面 5 条，顺序也要一致：
    1. `feat: build dashboard layout`
    2. `feat: wire metrics renderer`
    3. `docs: add dashboard handoff notes`
    4. `docs: add incident review outline`
    5. `feat: add release checklist footer`

## 验收

- `git log --oneline -5` 的 5 条说明与顺序完全一致
- `dashboard.html` 里保留 `<h1>值班总览面板</h1>` 与 `发布前检查：日志、告警、回滚预案`
- `scripts/metrics.js` 里保留 `renderMetrics`
- `README.md` 里保留 `交接说明：值班前先确认告警联系人`
- `review.md` 里保留 `事故复盘提纲`
- `git status` 干净

## 提问

```conflict
<<<<<<< courses/git/rebase-split-reorder
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-split-reorder
Q2 停在中间那条
你用哪个动作词让 rebase 停在 `wip` 那条上？停住之后 `git status` 和 `git log --oneline -2` 分别说什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-split-reorder
Q3 拆的具体步骤
停住之后你敲了哪几条命令把它拆成三条？（提示：先把那条提交撤成改动，再分批 add/commit）按顺序贴出来。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-split-reorder
Q4 重排是怎么发生的
顺序调整是在清单里做的还是拆完之后做的？如果在清单里调换两行，git 会在什么时候才可能报冲突？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-split-reorder
Q5 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-split-reorder
Q6 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-split-reorder
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-split-reorder
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/rebase-split-reorder
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
