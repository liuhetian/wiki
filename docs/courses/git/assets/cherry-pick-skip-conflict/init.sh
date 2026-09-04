#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 4-1-2）
source "$(dirname "$0")/../lib.sh"
course_setup cherry-pick-skip-conflict

WORK="$ROOT/work/handover-desk"

REMOTE=$(new_bare handover-desk)

tmp_init "$REMOTE"
as maintainer

mkdir -p scripts
cat > README.md <<'EOF'
# Handover Desk

你当前在 `main` 分支，需要把 `feature/handover-pack` 上一段连续历史搬回来。

目标范围：

- 从 `docs: add handover window reminder` 到 `feat: wire war-room escalation channel`

注意：

- 这段范围里的中间那条热线同步提交，在 main 上已经以别的 SHA 存在，需要跳过
- 最后一条升级通道提交会和 main 当前内容冲突，解决后继续
- 最终 handover.md、contacts.txt、scripts/escalate.sh 都要符合 README 描述
EOF

cat > handover.md <<'EOF'
# 值班交接单

- 交接前确认告警面板在线
EOF

cat > contacts.txt <<'EOF'
值班联系人：
- 主响应群：ops-bridge
EOF

cat > scripts/escalate.sh <<'EOF'
#!/bin/bash

TARGET_CHANNEL="ops-room"
RETRY_LIMIT=1
EOF

git add README.md handover.md contacts.txt scripts/escalate.sh
git commit -m "feat: initialize handover desk"
git push origin main

git checkout -b feature/handover-pack
cat > handover.md <<'EOF'
# 值班交接单

- 交接前确认告警面板在线
- 交接单模板必须写明值班窗口
EOF
git add handover.md
git commit -m "docs: add handover window reminder"

cat > contacts.txt <<'EOF'
值班联系人：
- 主响应群：ops-bridge
- 升级通道：夜班电话 6001
EOF
git add contacts.txt
git commit -m "chore: sync fallback hotline"

cat > scripts/escalate.sh <<'EOF'
#!/bin/bash

TARGET_CHANNEL="war-room"
RETRY_LIMIT=2
# 给值班切换留一个明确出口
EOF
git add scripts/escalate.sh
git commit -m "feat: wire war-room escalation channel"
git push origin feature/handover-pack

git checkout main
cat > contacts.txt <<'EOF'
值班联系人：
- 主响应群：ops-bridge
- 升级通道：夜班电话 6001
EOF
git add contacts.txt
git commit -m "docs: record night hotline in contacts"
git push origin main

cat > scripts/escalate.sh <<'EOF'
#!/bin/bash

TARGET_CHANNEL="night-ops"
RETRY_LIMIT=2
# 主线先换个更明确的频道名
EOF
git add scripts/escalate.sh
git commit -m "refactor: rename escalation room for mainline"
git push origin main

tmp_done

work_clone "$REMOTE"

summary "$WORK" \
    "远程仓库：$REMOTE"
