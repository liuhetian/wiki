#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 4-0-0）
source "$(dirname "$0")/../lib.sh"
course_setup revert-pushed-commit

WORK="$ROOT/work/alert-ticker"

REMOTE=$(new_bare alert-ticker)

tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# Alert Ticker

正式值班规则：

- CPU 告警阈值必须保持在 90%
- 演示环境的宽松配置不能直接进入 main

如果错误提交已经 push 到远程，请不要改写公共历史，而要留下明确的撤回记录。
EOF

cat > alert_rules.py <<'EOF'
CPU_ALERT_THRESHOLD = 90

# 保持 90% 阈值，避免演示模式配置进入正式值班
def should_alert(cpu_usage):
    return cpu_usage >= CPU_ALERT_THRESHOLD
EOF

git add README.md alert_rules.py
git commit -m "feat: initialize alert guard"
git push origin main
tmp_done

work_clone "$REMOTE"

cat > "$WORK/alert_rules.py" <<'EOF'
CPU_ALERT_THRESHOLD = 30

# 保持 90% 阈值，避免演示模式配置进入正式值班
def should_alert(cpu_usage):
    return cpu_usage >= CPU_ALERT_THRESHOLD
EOF

git -C "$WORK" add alert_rules.py
git -C "$WORK" commit -m "feat: loosen cpu alert threshold for demo"
git -C "$WORK" push origin main

summary "$WORK" \
    "远程仓库：$REMOTE"
