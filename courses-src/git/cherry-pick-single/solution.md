# 参考解法：从别的分支只摘一条提交过来

原关卡 `4-1-0` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd checkout-spark；2) 用 git log --oneline feature/payment-badge 或等价方式查看源分支上的提交，确认要拿的是 `feat: add payment badge renderer`，而不是后面的草稿提交；3) 保持当前在 main 分支，对那条目标提交执行 git cherry-pick；4) 检查 ui/payment_panel.js 已经出现支付徽章渲染逻辑，同时 scratchpad.md 没有进入当前分支；5) 再确认 git log、git status 与本地分支相对 origin/main 的状态。关键教学点：cherry-pick 的本质是把指定提交的变更复制到当前分支，并生成新的提交历史，而不是移动原来的提交。
