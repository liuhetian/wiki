#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 1-1-0）
source "$(dirname "$0")/../lib.sh"
course_setup rm-cached-unstage

WORK="$ROOT/work/leak-lab"

mkdir -p "$WORK"

cat > "$WORK/README.md" <<'EOF'
# Leak Lab

这个仓库用来整理一次日志清理演练。
EOF

cat > "$WORK/app.py" <<'EOF'
def check_health():
    return "ok"
EOF

cat > "$WORK/scratch.log" <<'EOF'
[debug] token=tmp-9234-demo
[debug] this file should stay local only
EOF

git init --initial-branch=main "$WORK" >/dev/null
git -C "$WORK" add README.md app.py
git -C "$WORK" commit -m "init: create leak-lab" >/dev/null
git -C "$WORK" add scratch.log

summary "$WORK" \
    "scratch.log 只是手滑暂存，还没提交。请把它从暂存区移走，但文件本身要留在本地。"
