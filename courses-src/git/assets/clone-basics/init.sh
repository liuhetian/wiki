#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 0-0-0）
source "$(dirname "$0")/../lib.sh"
course_setup clone-basics

WORK="$ROOT/work/cal"

REMOTE=$(new_bare cal)

tmp_init "$REMOTE"
as maintainer
cat > README.md <<'EOF'
# cal

公司内部练手项目。
EOF
cat > calc.py <<'EOF'
def add(a, b):
    return a + b
EOF
git add README.md calc.py
git commit -m "Initial commit: bootstrap cal project"
git push origin main
tmp_done

summary "$WORK" \
    "远程仓库：$REMOTE" \
    "先确认公司仓库地址，再把项目拉下来"
