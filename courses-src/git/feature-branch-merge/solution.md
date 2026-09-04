# 参考解法：别在 main 上裸奔：开分支、做完、合回去

原关卡 `2-1-0` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd team-board；2) 阅读 README.md，确认本关要求先创建并切换到 `feature/snack-reminder`；3) 在该分支编辑 board.txt，追加“茶水间补货后记得同步群消息”；4) git add 和 git commit，把提醒内容提交在功能分支上；5) 切回 main；6) 在 main 上执行 merge，把 `feature/snack-reminder` 合并进来；7) 确认 git status 干净。关键教学点：开发动作发生在功能分支上，merge 则应该在接收改动的目标分支 main 上完成。
