# 参考解法：跨仓库搬提交：先 fetch 进来，再 cherry-pick

原关卡 `4-1-3` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd payment-gateway；2) 根据 README.md 先给当前仓库添加外部 remote，例如命名为 partner，并 fetch 这个远程，让外部分支引用进入本地可见范围；3) 查看 partner/feature/pay-tunnel 与 partner/hotfix/callback-copy 的提交历史，确认要带回的是连续两条 pay-tunnel 提交，以及单独一条回调文案提交；4) 对 pay-tunnel 那段连续历史使用包含起点的范围语法，也就是从第一条提交的父提交开始到第二条结束，把两条一起 cherry-pick 到 main；5) 再 cherry-pick `docs: clarify callback confirmation copy`；6) 检查 remote、git log、lib/pay_tunnel.js、config/payment.env.example、docs/integration_note.md，确认无关的废弃 SDK 备注没有进入主仓。关键教学点：跨仓操作的前提是先把外部远程接入并 fetch；而 cherry-pick 的范围语法必须根据“是否包含起点提交本身”来选择。
