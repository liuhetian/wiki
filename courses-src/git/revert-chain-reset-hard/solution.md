# 参考解法：连环翻车：连续 revert 三条，再把本地废提交丢掉

原关卡 `4-0-2` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd night-watch；2) 用 git log --oneline、README.md 和 release_guard.py 确认远程 main 上已经连续推了 3 条坏提交，同时本地顶端还有一条未推送的 wip: add local panic toggle；3) 因为这条本地废提交没有保留价值，先用 git reset --hard HEAD~1 把它直接丢弃，回到与 origin/main 同步的错误基线；4) 再按从新到旧的顺序，对那 3 条已经公开的坏提交逐条 git revert，让主线逻辑和文档一步步恢复；5) 检查 release_guard.py、README.md 与 git log，确认安全规则已经完全回来了；6) 把这 3 条 revert commit 推送到 origin/main。关键教学点：未公开的无价值本地提交可以用 hard reset 丢弃；已公开的错误历史要用 revert 留下清晰的补救轨迹，多条连续撤销时还要注意顺序。
