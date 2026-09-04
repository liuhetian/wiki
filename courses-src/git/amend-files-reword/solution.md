# 参考解法：amend 补文件，rebase -i reword 改更早的说明

原关卡 `3-0-1` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd brand-copy；2) 先查看 git log --oneline -2 和 git status，确认一条旧提交说明写成了 update stuff，且工作区还有漏掉的 palette_notes.txt；3) 阅读 README.md，明确最终应保留两条本地提交，且名称分别是 docs: polish hero headline 与 feat: add launch CTA assets；4) 先把 palette_notes.txt git add 进去，再用 git commit --amend 把它补进最近一次提交；5) 再对最近两条提交执行 git rebase -i，通过 reword 把较早的那条 update stuff 改成 docs: polish hero headline；6) 完成后再次检查 git log --oneline -2、git status 和 palette_notes.txt 是否都符合要求。关键教学点：最近一次提交的内容漏了，用 amend 补最自然；更早的提交说明要改，就需要交互式 rebase 精确定位到那一条历史。
