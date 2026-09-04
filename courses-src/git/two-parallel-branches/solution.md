# 参考解法：两条独立的功能分支同时推进

原关卡 `2-1-1` 设计时写的标准流程。

标准流程：1) 进入项目目录 cd launch-playbook；2) 阅读 README.md，明确两个功能分支名和各自要修改的文件；3) 从 main 创建并切换到 `feature/qa-checklist`，编辑 checklist.md，提交该分支；4) 回到 main，再创建并切换到 `feature/release-note`，编辑 release_notes.md，提交该分支；5) 切回 main，先后 merge 这两个功能分支；6) 确认 main 上两处文档都已生效且工作区干净。关键教学点：多个功能并行时，分支的价值不只是“能切换”，更是把不同主题的改动边界隔离开。
