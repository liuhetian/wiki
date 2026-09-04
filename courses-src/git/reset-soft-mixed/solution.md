# 参考解法：后悔药分软硬两款：soft 与 mixed 的差别

原关卡 `4-0-1` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd release-brief；2) 查看 git log --oneline -2、git status 和 README.md，确认较早一条提交正确，最新一条未推送提交同时带了错误 message、临时草稿 brainstorm.txt 和未整理好的负责人备注；3) 对最近一次提交使用 git reset --soft HEAD~1，把 HEAD 回退一格但保留暂存内容，回到“这次提交还没正式定稿”的状态；4) 因为还需要重新挑选文件，再执行默认 mixed 的 git reset，把 rollout.md 与 brainstorm.txt 从暂存区放回工作区；5) 删除 brainstorm.txt，修正文案为“回滚负责人：值班发布经理”，只重新 add rollout.md 并提交为 docs: add rollback owner note；6) 再确认 git log、git status 和 rollout.md 都符合要求。关键教学点：soft 适合只把提交拉回暂存区继续改；mixed 适合进一步清空暂存区，重新选择哪些文件进入这次提交。
