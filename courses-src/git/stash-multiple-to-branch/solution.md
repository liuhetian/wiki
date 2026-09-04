# 参考解法：三份 stash：认出来、用掉一份、转走一份、留下一份

原关卡 `2-1-3` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd atelier-poster；2) 阅读 README.md，明确三份 stash 的用途；3) 用 git stash list 找到法务备注那份 stash，把它 apply 到当前 main；4) 处理 poster.txt 冲突，保留“发布会倒计时”“立即生成主视觉”和“上线前需法务复核”三项要求；5) git add poster.txt 并完成当前变更收尾，然后把已用的法务备注 stash drop 掉；6) 再从 stash list 找到霓虹视觉草稿，使用 git stash branch feature/neon-splash <stash> 把它转成独立分支；7) 确认该分支上的 theme.txt 已恢复霓虹版本后，切回 main；8) 保留随手涂鸦 stash 不动，确认工作区干净。关键教学点：stash 不是黑盒缓存，而是一份可以阅读、筛选、恢复、转分支和清理的临时工作清单。
