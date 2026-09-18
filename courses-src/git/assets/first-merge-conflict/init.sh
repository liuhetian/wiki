#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 2-0-0）
source "$(dirname "$0")/../lib.sh"
course_setup first-merge-conflict

WORK="$ROOT/work/math-project"

REMOTE=$(new_bare math-project)

tmp_init "$REMOTE"
as maintainer

cat > math_tool.py <<'EOF'
def add(a, b):
    return a + b
EOF

git add math_tool.py
git commit -m "feat: initialize math tool with add"
git push origin main
tmp_done

git config --global pull.rebase false
work_clone "$REMOTE"

tmp_clone "$REMOTE"
as colleague
cat >> math_tool.py <<'EOF'

def sub(a, b):
    return a - b
EOF
git add math_tool.py
git commit -m "feat: add subtraction helper"
git push origin main
tmp_done

cat >> "$WORK/math_tool.py" <<'EOF'

def mul(a, b):
    return a * b
EOF
git -C "$WORK" add math_tool.py
git -C "$WORK" commit -m "feat: add multiplication helper"

summary "$WORK" \
    "远程仓库：$REMOTE"
