#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 3-0-2）
source "$(dirname "$0")/../lib.sh"
course_setup rebase-squash-fixups

WORK="$ROOT/work/event-invite"

REMOTE=$(new_bare event-invite)

tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# Event Invite

最近 5 条本地提交历史里，有 3 条 commit message 都是无意义的 `fix typo`。

在发起代码审查前，请把最近 5 条历史整理成只剩下下面 3 条：

1. docs: draft launch invitation
2. docs: add venue reminder
3. docs: polish invitation wording

最终 invite.md 需要同时满足：
- 标题：春季发布会邀请函
- 地点：A 栋 3 层多功能厅
- 地点提示：请从南侧电梯入场
- RSVP：请在周四 18:00 前回复
- 附注：入场时请佩戴工牌
EOF

cat > invite.md <<'EOF'
# 春季发布会预告

地点：A 栋 3 层多功能厅
RSVP：请在周四 18:00 前回复
附注：入场请佩戴工牌
EOF

git add README.md invite.md
git commit -m "docs: initialize invitation draft"
git push origin main
tmp_done

work_clone "$REMOTE"

cat > "$WORK/invite.md" <<'EOF'
# 春季发布会邀约函

地点：A 栋 3 层多功能厅
RSVP：请在周四下班前回复
附注：入场请佩戴工牌
EOF
git -C "$WORK" add invite.md
git -C "$WORK" commit -m "docs: draft launch invitation"

cat > "$WORK/invite.md" <<'EOF'
# 春季发布会邀约函

地点：A 栋 3 层多功能厅
RSVP：请在周四下班前回复
附注：入场时请佩戴工牌
EOF
git -C "$WORK" add invite.md
git -C "$WORK" commit -m "fix typo"

cat >> "$WORK/invite.md" <<'EOF'

地点提示：请从南侧电梯入场
EOF
git -C "$WORK" add invite.md
git -C "$WORK" commit -m "docs: add venue reminder"

cat > "$WORK/invite.md" <<'EOF'
# 春季发布会邀约函

地点：A 栋 3 层多功能厅
地点提示：请从南侧电梯入场
RSVP：请在周四 18:00 前回复
附注：入场时请佩戴工牌
EOF
git -C "$WORK" add invite.md
git -C "$WORK" commit -m "fix typo"

cat > "$WORK/invite.md" <<'EOF'
# 春季发布会邀请函

地点：A 栋 3 层多功能厅
地点提示：请从南侧电梯入场
RSVP：请在周四 18:00 前回复
附注：入场时请佩戴工牌
EOF
git -C "$WORK" add invite.md
git -C "$WORK" commit -m "fix typo"

summary "$WORK" \
    "远程仓库：$REMOTE"
