# 参考解法：摘一段范围：中间一条要跳过，最后一条会冲突

原关卡 `4-1-2` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd handover-desk；2) 查看 README.md、git log 与相关文件，确认要搬的是 feature/handover-pack 上一段连续提交范围；3) 对这段范围执行 cherry-pick，在过程中遇到热线同步那条提交变成空提交时，理解这是因为 main 已经拥有等价结果，因此使用 git cherry-pick --skip 跳过；4) 继续处理最后一条提交时，手动解决 scripts/escalate.sh 的冲突，让最终结果回到 war-room 版本并保留目标注释，然后执行 git cherry-pick --continue；5) 检查 handover.md、contacts.txt、scripts/escalate.sh、git log 与 git status。关键教学点：cherry-pick 是一个可能跨越多个提交的过程，空提交意味着结果已存在，冲突则意味着你必须亲自决定两段历史该如何汇合。
