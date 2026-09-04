# 参考解法：已经推出去了，只能体面地反着来一次

原关卡 `4-0-0` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd alert-ticker；2) 用 git log --oneline -1 和查看 alert_rules.py / README.md 确认最近一次已推送提交把正式阈值错改成了 30；3) 因为错误提交已经 push 到远程，使用 git revert 撤销这条提交，让 Git 生成一条新的撤回 commit；4) 检查 alert_rules.py 已恢复到 90，git status 干净；5) 把这条 revert commit 推送到 origin/main；6) 再确认本地和 origin/main 同步。关键教学点：revert 不改写公共历史，而是追加一条清晰可追踪的撤销记录，适合处理已经公开的错误提交。
