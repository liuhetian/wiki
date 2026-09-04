# 参考解法：把一坨 wip 拆开，还要重排顺序

原关卡 `3-0-3` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd ops-dashboard；2) 查看 git log --oneline -3 与 README.md，明确当前三条本地历史中，中间那条 wip: finish dashboard 需要被拆成三条，且 docs: add incident review outline 还要后移；3) 对最近 3 条提交执行 git rebase -i，把 wip: finish dashboard 标记为 edit，并把 incident review 文档那条移到目标顺序的位置；4) rebase 停下后，把大提交打散，再按逻辑把 dashboard.html、scripts/metrics.js、README.md 分别重新提交为 feat: build dashboard layout、feat: wire metrics renderer、docs: add dashboard handoff notes；5) 继续 rebase，让 docs: add incident review outline 和 feat: add release checklist footer 落到正确顺序；6) 最后检查 git log --reverse --oneline HEAD~5..HEAD、各文件内容与 git status。关键教学点：高级历史整理不只是压缩提交，而是把一个混杂的大改动重新拆成清晰的逻辑单元，并让提交顺序符合工程阅读路径。
