# Git

Git 的日常用法笔记。骨架是**场景 → 一句话 → 心智模型 → 操作 → 坑**，价值密度在"心智模型"——记住分支之间该是什么关系，命令自己就推得出来，不用背。

- [fork 别人的仓库，还要持续吸收上游](fork-upstream-sync.md) —— 把 `main` 降级成上游的只读镜像，自己的 commit 一行都不放上去；同步上游因此永远是 fast-forward
- [stash 不是剪贴板，是个游离的 merge commit](stash.md) —— 看清它的 2~3 个 parent 和 reflog 出身，「为什么冲突时 `merge --abort` 用不了」「为什么 `apply` 敲两次不会叠加」都不用背
