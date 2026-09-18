#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 2-0-2）
source "$(dirname "$0")/../lib.sh"
course_setup conflict-same-line

WORK="$ROOT/work/release-gate"

REMOTE=$(new_bare release-gate)

tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# Release Gate

发版规则：

- staging 环境：至少一个审批通过，或者值班负责人紧急放行
- production 环境：必须至少一个审批通过，值班负责人不能绕过审批
- 其他环境：一律不允许发布
EOF

cat > release_gate.py <<'EOF'
def can_release(env, approved_count, is_on_duty):
    return env == "staging" and approved_count >= 1
EOF

git add README.md release_gate.py
git commit -m "feat: initialize release gate"
git push origin main
tmp_done

git config --global pull.rebase false
work_clone "$REMOTE"

tmp_clone "$REMOTE"
as colleague
cat > release_gate.py <<'EOF'
def can_release(env, approved_count, is_on_duty):
    return env in ("staging", "production") and approved_count >= 1
EOF
git add release_gate.py
git commit -m "feat: allow approved production releases"
git push origin main
tmp_done

cat > "$WORK/release_gate.py" <<'EOF'
def can_release(env, approved_count, is_on_duty):
    return env == "staging" and (approved_count >= 1 or is_on_duty)
EOF
git -C "$WORK" add release_gate.py
git -C "$WORK" commit -m "feat: allow on-duty emergency staging releases"

summary "$WORK" \
    "远程仓库：$REMOTE"
