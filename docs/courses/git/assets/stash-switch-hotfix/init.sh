#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 2-1-2）
source "$(dirname "$0")/../lib.sh"
course_setup stash-switch-hotfix

WORK="$ROOT/work/incident-console"

REMOTE=$(new_bare incident-console)

tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# Incident Console

当前情况：

- 你现在停在 `feature/live-summary` 分支上，`status_panel.py` 里还有没提交完的半成品
- 请先把手头未完成工作暂存起来，再切回 main 处理紧急 hotfix
- hotfix 要求：在 `hotfix.txt` 中写入 `修复 stale cache 导致的旧状态展示`
- hotfix 提交完成后，再切回 `feature/live-summary`，恢复之前暂存的修改
- 继续完成 `status_panel.py`，让 `render_summary_card()` 返回 `summary: backlog synced`
- 功能分支提交完成后，切回 main 合并 `feature/live-summary`
- 收尾时 stash 列表应该清空
EOF

cat > status_panel.py <<'EOF'
def render_status_panel():
    return [
        "service: api",
        "status: pending"
    ]
EOF

git add README.md status_panel.py
git commit -m "feat: initialize incident console"
git push origin main
tmp_done

work_clone "$REMOTE"
git -C "$WORK" checkout -b feature/live-summary

cat > "$WORK/status_panel.py" <<'EOF'
def render_status_panel():
    return [
        "service: api",
        "status: pending"
    ]

def render_summary_card():
    return "summary: collecting data"
EOF

git -C "$WORK" add status_panel.py
git -C "$WORK" commit -m "feat: add summary card scaffold"

cat > "$WORK/status_panel.py" <<'EOF'
def render_status_panel():
    return [
        "service: api",
        "status: pending"
    ]

def render_summary_card():
    return "summary: backlog synced"
EOF

summary "$WORK" \
    "远程仓库：$REMOTE"
