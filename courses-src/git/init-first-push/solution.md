# 参考解法：从普通目录跨进 Git 仓库

原关卡 `1-0-0` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd morning-notes；2) 用 git init 把普通目录初始化成 Git 仓库；3) 用 git status 确认 README.md 和 notes.txt 处于未跟踪状态；4) git add 把文件纳入版本控制；5) git commit 完成第一次提交；6) git remote add origin morning-notes.git 连接远程空仓库；7) git push -u origin main 推送首次提交。关键教学点：Git 仓库不是“有一堆文件”就自动成立，而是要先有 `.git` 目录，之后本地提交和远程仓库才通过 remote 建立联系。
