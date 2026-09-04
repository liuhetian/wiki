# 参考解法：还没推出去，赶紧把这次提交撤回来

原关卡 `1-1-1` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd deploy-guard；2) 用 git log 或 git status 确认最新一条提交尚未 push；3) 用 git reset HEAD~ 把错误提交撤回，让 deploy.sh 和 staging.pem 的改动回到工作区；4) 处理 staging.pem，让它不再被 Git 跟踪，同时保留文件本身；5) 把 staging.pem 写入 .gitignore，避免再次误加；6) 重新只提交 deploy.sh 和 .gitignore。关键教学点：未推送的错误提交可以先用 reset 拿下来，再重新组织要进入下一次提交的内容。
