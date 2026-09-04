# 参考解法：半成品先塞抽屉：stash 出去救火再回来

原关卡 `2-1-2` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd incident-console；2) 查看 README.md，确认当前在 `feature/live-summary` 且存在未提交修改；3) 用 git stash 暂存这份半成品；4) 切回 main；5) 新建或编辑 hotfix.txt，写入“修复 stale cache 导致的旧状态展示”，并提交 hotfix；6) 再切回 `feature/live-summary`；7) 使用 git stash pop 恢复之前暂存的 status_panel.py 修改；8) 完成功能分支提交；9) 切回 main，merge `feature/live-summary`；10) 确认 git stash list 为空且工作区干净。关键教学点：stash 让未完成工作可以暂时离开工作区，但它不是结束开发，而是为了稍后安全地回来继续。
