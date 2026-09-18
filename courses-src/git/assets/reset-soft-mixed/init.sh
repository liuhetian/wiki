#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 4-0-1）
source "$(dirname "$0")/../lib.sh"
course_setup reset-soft-mixed

WORK="$ROOT/work/release-brief"

REMOTE=$(new_bare release-brief)

tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# Release Brief

发起审查前，请把本地最近两条提交整理成：

1. docs: add launch checklist skeleton
2. docs: add rollback owner note

注意：

- 最新一条提交只能包含 rollout.md 的正式负责人备注
- 正式负责人应写成：回滚负责人：值班发布经理
- brainstorm.txt 是临时草稿，不应该留在仓库里
EOF

cat > rollout.md <<'EOF'
# 发布简报

上线前检查：
- 核对值班群公告
EOF

git add README.md rollout.md
git commit -m "docs: initialize release brief"
git push origin main
tmp_done

work_clone "$REMOTE"

cat > "$WORK/rollout.md" <<'EOF'
# 发布简报

上线前检查：
- 核对值班群公告
- 确认回滚窗口已预留
EOF
git -C "$WORK" add rollout.md
git -C "$WORK" commit -m "docs: add launch checklist skeleton"

cat > "$WORK/rollout.md" <<'EOF'
# 发布简报

上线前检查：
- 核对值班群公告
- 确认回滚窗口已预留

回滚负责人：待值班同学补名字
EOF

cat > "$WORK/brainstorm.txt" <<'EOF'
随手记：
- 也许要补一张拓扑图
- 这份草稿不该进正式提交
EOF

git -C "$WORK" add rollout.md brainstorm.txt
git -C "$WORK" commit -m "wip: note rollback owner"

summary "$WORK" \
    "远程仓库：$REMOTE"
