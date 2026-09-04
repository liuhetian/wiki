# 参考解法：只从暂存区移走，别把文件也删了

原关卡 `1-1-0` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd leak-lab；2) 用 git status 确认 scratch.log 只是 staged 但还没 commit；3) 用 git rm --cached scratch.log 把它从暂存区移走；4) 再次 git status，确认 scratch.log 还在本地，但不会进入下一次提交。关键教学点：git rm --cached 只改 Git 的跟踪状态，不删工作区文件。
