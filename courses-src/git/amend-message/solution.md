# 参考解法：提交说明写歪了，推之前还能改

原关卡 `3-0-0` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd release-notes；2) 用 git log --oneline -1 确认最近一次提交说明确实是 asdf；3) 阅读 README.md，确认目标提交说明应为 docs: refine release note summary；4) 使用 git commit --amend 把最近一次提交说明改正，不新增业务提交；5) 再次查看 git log --oneline -1，确认最新提交说明已经变成目标文本；6) 确认 git status 干净后再准备 push。关键教学点：当最近一次提交内容本身没问题，只是说明写错时，amend 是最干净的修正方式。
