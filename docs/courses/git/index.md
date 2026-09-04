---
description: "33 课 5 章，从 clone 到跨仓库 cherry-pick，答完的笔记落在笔记 / Git"
---

# Git

33 课，每课一个 `init.sh` 在你机器上造出一个真实现场：冲突、误删、写歪的历史都是真的。答完的笔记落在 [笔记 / Git](../../notes/git/index.md) 的同名文件里 —— 怎么答、怎么归档见[课程说明](../index.md)。

环境默认建在 `~/courses/git/<slug>/`，`COURSE_ROOT` 可以改到别处；每个脚本都可重复运行，重跑即重置。

## 1. 先用起来

不问原理，先把 clone / add / commit / push 跑通，建立最朴素的直觉。

- [clone 的第一课：仓库地址不在 GitHub 上](clone-basics.md) —— Git 不等于 GitHub，远程可以是任意一个能访问到的路径
- [clone 到指定目录：最后那个参数不是可选装饰](clone-into-dir.md) —— 默认落点是仓库名，要落到别处就得自己指定
- [一条 clone 要同时拿对分支和子模块](clone-branch-submodule.md) —— 默认分支不是你要的分支，子模块默认是空目录，两件事一条命令解决
- [浅克隆 + 稀疏检出，然后再把历史补回来](shallow-sparse-clone.md) —— `--depth` 省历史、`sparse-checkout` 省目录、`--unshallow` 再把历史要回来
- [第一次把改动交上去：add、commit、push 各管一段](add-commit-push.md) —— 从工作区到远程要过三道门，`add`/`commit`/`push` 各管一道
- [只提交该提交的那部分](status-selective-add.md) —— 先读 status 再决定谁进这次提交，`git add .` 是最容易犯的错
- [把暂存区清干净、把文件改回去、再让它们别再来](discard-changes-gitignore.md) —— 「从暂存区移走」和「把文件改回去」是两条不同的命令，别记混

## 2. 三个区与 .git

工作区、暂存区、仓库各自是什么；.git 里到底放着什么。

- [从普通目录跨进 Git 仓库](init-first-push.md) —— 仓库身份不是天生的，是那个隐藏的 `.git` 给的
- [默认分支名不是装饰：init 出来叫 master 怎么办](init-default-branch.md) —— `init.defaultBranch` 决定你 init 出来叫什么；团队约定决定你该叫什么
- [掀开 .git 看一眼，然后把它删了再建回来](dot-git-anatomy.md) —— 删掉 `.git` 之后文件都还在，丢的是身份，以及全部历史
- [只从暂存区移走，别把文件也删了](rm-cached-unstage.md) —— `--cached` 这个开关决定了你删的是「索引里的记录」还是「磁盘上的文件」
- [还没推出去，赶紧把这次提交撤回来](reset-unpushed-commit.md) —— 没 push 的提交可以当作没发生过，前提是你知道 reset 把改动放回了哪一层
- [已经推上去的敏感文件，删得掉吗](rm-vs-rm-cached.md) —— 停止追踪不等于从历史里消失，推出去之后能做的只有止损

## 3. 和别人一起改

冲突、分支、stash —— 多人同时动同一份代码时的全部日常。

- [第一次合并冲突：读懂那三行标记](first-merge-conflict.md) —— 冲突标记不是报错信息，是 git 把选择权交还给你的方式
- [顺序敏感的冲突：把两半拼起来会拼出重复调用](conflict-order-matters.md) —— 「两边都留」最省事也最危险，这一课它会留出一个重复调用
- [同一行上的冲突：两个业务意图要合成一个](conflict-same-line.md) —— 冲突在同一行时没有「都保留」这个选项，只能重新想清楚规则该是什么
- [多文件冲突，其中一个是二进制](conflict-multi-file-binary.md) —— 二进制文件没有 hunk 可合，只能用 `--ours` / `--theirs` 整份选一边
- [别在 main 上裸奔：开分支、做完、合回去](feature-branch-merge.md) —— 分支不是给大项目准备的仪式，是「改错了能整段丢掉」的保险
- [两条独立的功能分支同时推进](two-parallel-branches.md) —— 两件事塞进一个分支，就再也拆不开了
- [半成品先塞抽屉：stash 出去救火再回来](stash-switch-hotfix.md) —— stash 不是剪贴板，它把工作区打包成一个游离的提交挂在一边
- [三份 stash：认出来、用掉一份、转走一份、留下一份](stash-multiple-to-branch.md) —— `stash@{n}` 的编号会变，靠 `-m` 留下的说明才认得出哪份是哪份

## 4. 整理历史

把写歪的提交改回该有的样子：amend 与交互式 rebase。

- [提交说明写歪了，推之前还能改](amend-message.md) —— amend 不是「编辑」那条提交，是造一条新的把它换掉
- [amend 补文件，rebase -i reword 改更早的说明](amend-files-reword.md) —— amend 只够得着最近一条，再往前就得请 `rebase -i` 出场
- [「fix typo」三连击：把杂乱历史压成一条](rebase-squash-fixups.md) —— 历史是写给下一个人读的，五条流水账该压成一条有意义的提交
- [把一坨 wip 拆开，还要重排顺序](rebase-split-reorder.md) —— `edit` 让 rebase 停在那条提交上，接下来就是普通的 reset + 分批 commit

## 5. 救火

已经推出去了怎么办：revert、reset，以及从别处把提交搬过来。

- [已经推出去了，只能体面地反着来一次](revert-pushed-commit.md) —— 推出去的历史不能改，只能追加一条「反做」的提交
- [后悔药分软硬两款：soft 与 mixed 的差别](reset-soft-mixed.md) —— 三种 reset 的区别只在「改动被放回哪一层」：仓库、暂存区、还是工作区
- [连环翻车：连续 revert 三条，再把本地废提交丢掉](revert-chain-reset-hard.md) —— 已推送的用 revert 一条条反做，没推送的直接 reset 掉，两种情况两种手法
- [撤销一次 merge，修好之后还得先撤回那次撤回](revert-merge-revert-revert.md) —— revert 一个 merge 之后直接再 merge，会拿到一个「看起来合了但内容没回来」的结果
- [从别的分支只摘一条提交过来](cherry-pick-single.md) —— cherry-pick 搬的是「那条提交的 diff」，不是那条提交本身
- [从两个分支挑三条，还得按正确顺序摘](cherry-pick-multi-ordered.md) —— 有依赖关系的提交顺序摘错就直接冲突，先想清楚谁依赖谁
- [摘一段范围：中间一条要跳过，最后一条会冲突](cherry-pick-skip-conflict.md) —— cherry-pick 一段范围会中途停下，`--skip` / `--continue` / `--abort` 是三个出口
- [跨仓库搬提交：先 fetch 进来，再 cherry-pick](cherry-pick-range-cross-repo.md) —— 另一个仓库的提交要先 fetch 进本地对象库，才有资格被 cherry-pick
