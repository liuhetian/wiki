# 参考解法：同一行上的冲突：两个业务意图要合成一个

原关卡 `2-0-2` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd release-gate；2) 先尝试 git push，确认被远程拒绝；3) git pull 触发 release_gate.py 的单行冲突；4) 阅读冲突两边的 return 表达式和 README.md 中的规则说明，理解本地想保留 staging 值班放行，远程想扩展 production 发布；5) 手动把 can_release 重写成同时表达两种业务约束的最终逻辑，而不是简单保留某一边；6) git add release_gate.py；7) git commit 完成合并提交；8) git push。关键教学点：真正的困难冲突不是文本冲突，而是语义冲突；有时正确答案是重写一行新代码，把双方意图都吸收到最终实现里。
