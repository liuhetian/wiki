# 参考解法：撤销一次 merge，修好之后还得先撤回那次撤回

原关卡 `4-0-3` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd ops-stage；2) 用 git log --graph --oneline --all、README.md 和文件内容确认 main 上已有 merge feature/live-canvas for ops screen 这次合并，而 feature/live-canvas 分支后来又补了一条 fix: calm live canvas refresh rate；3) 先在 main 上用 git revert -m 1 撤销那次 merge commit，把整支功能安全回退；4) 确认线上主线暂时回到不带 live-canvas 的状态后，因为要重新引入这整支功能，先对刚才那条 revert 再执行一次 git revert，也就是 revert the revert，恢复原始合并语义；5) 再把已经修好的 feature/live-canvas 合并回 main，让那条 fix 进入主线；6) 最后检查 dashboard.html、assets/palette.txt、scripts/live_canvas.js、git log 与 origin/main，确认历史和结果都完整。关键教学点：merge commit 的撤销必须指定主线父提交；而当一整支分支曾被 revert 过，想重新引入时，revert the revert 是恢复那次分支语义的关键步骤。
