# 参考解法：「fix typo」三连击：把杂乱历史压成一条

原关卡 `3-0-2` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd event-invite；2) 查看 git log --oneline -5 和 README.md，确认最近 5 条历史里有 3 条分散的 fix typo，目标是把它们压成 1 条有意义的提交；3) 对最近 5 条提交执行 git rebase -i，在编辑列表时注意顺序是从旧到新；4) 通过调整顺序，把三条 fix typo 挪到一起并 squash 成一条；5) 在编辑合并后的提交说明时，把 message 改成 docs: polish invitation wording；6) 完成 rebase 后，再检查 git log --oneline、invite.md 和 git status，确认邀请函仍然同时保留地点提示、精确的 RSVP 时间和修正后的附注措辞。关键教学点：rebase -i 不只是改文字，还能重排和压缩提交，把凌乱的修修补补整理成能表达逻辑单元的历史。
