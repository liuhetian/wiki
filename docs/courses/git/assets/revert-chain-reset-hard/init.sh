#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 4-0-2）
source "$(dirname "$0")/../lib.sh"
course_setup revert-chain-reset-hard

WORK="$ROOT/work/night-watch"

REMOTE=$(new_bare night-watch)

tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# Night Watch

正式值班要求：

- 只能在 staging 环境发布
- 必须审批通过
- 必须获得负责人确认
- 值班呼叫提醒：发布前必须 ping 当班负责人
EOF

cat > release_guard.py <<'EOF'
def can_release(env, approved, owner_ack):
    return env == "staging" and approved and owner_ack
EOF

git add README.md release_guard.py
git commit -m "feat: initialize release guard"
git push origin main
tmp_done

work_clone "$REMOTE"

cat > "$WORK/release_guard.py" <<'EOF'
def can_release(env, approved, owner_ack):
    return approved and owner_ack
EOF
git -C "$WORK" add release_guard.py
git -C "$WORK" commit -m "feat: loosen release gate for rehearsal"
git -C "$WORK" push origin main

cat > "$WORK/release_guard.py" <<'EOF'
def can_release(env, approved, owner_ack):
    return approved
EOF
git -C "$WORK" add release_guard.py
git -C "$WORK" commit -m "feat: drop owner acknowledgement check"
git -C "$WORK" push origin main

cat > "$WORK/README.md" <<'EOF'
# Night Watch

正式值班要求：

- 只能在 staging 环境发布
- 必须审批通过
- 必须获得负责人确认
EOF
git -C "$WORK" add README.md
git -C "$WORK" commit -m "docs: remove pager reminder from runbook"
git -C "$WORK" push origin main

cat > "$WORK/panic_toggle.txt" <<'EOF'
本地临时试验：
- 如果今晚继续炸锅，就一键切演示模式
EOF
git -C "$WORK" add panic_toggle.txt
git -C "$WORK" commit -m "wip: add local panic toggle"

summary "$WORK" \
    "远程仓库：$REMOTE"
