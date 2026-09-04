# 参考解法：从两个分支挑三条，还得按正确顺序摘

原关卡 `4-1-1` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd invoice-deck；2) 查看 README.md 与相关分支上的提交历史，确认正式目标是从不同分支挑出 3 条提交，并识别出 `docs: add risk banner to payment flow slide` 依赖前面的骨架提交；3) 保持当前在 release-candidate，先 cherry-pick `feat: add payment flow slide skeleton`，再 cherry-pick 风险横幅提交，最后再带回 `docs: add review handoff note`；4) 确认 `docs: note playful footer idea` 没有被带进当前分支；5) 检查 git log、slides/payment_flow.md、copy/review_note.txt 与 git status。关键教学点：cherry-pick 虽然可以跨多个分支自由选取提交，但选取顺序仍要服从文件依赖与业务语义。
