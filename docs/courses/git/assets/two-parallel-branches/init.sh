#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 2-1-1）
source "$(dirname "$0")/../lib.sh"
course_setup two-parallel-branches

WORK="$ROOT/work/launch-playbook"

REMOTE=$(new_bare launch-playbook)

tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# Launch Playbook

本关目标：

- 不要把两项工作都堆在同一个功能分支里
- 请先从 main 分别创建 `feature/qa-checklist` 和 `feature/release-note`
- 在 `feature/qa-checklist` 上给 checklist.md 追加一行：- 回归测试完成后在群里同步结果
- 在 `feature/release-note` 上给 release_notes.md 追加一行：- 发布说明需附上回滚负责人
- 两个分支都提交完成后，切回 main，逐一合并这两个分支
EOF

cat > checklist.md <<'EOF'
# 上线检查单

- 核对配置与环境变量
- 确认监控面板可访问
EOF

cat > release_notes.md <<'EOF'
# 发布说明模板

- 变更摘要
- 风险说明
EOF

git add README.md checklist.md release_notes.md
git commit -m "feat: initialize launch playbook"
git push origin main
tmp_done

work_clone "$REMOTE"

summary "$WORK" \
    "远程仓库：$REMOTE"
