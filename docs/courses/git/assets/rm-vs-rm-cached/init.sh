#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 1-1-2）
source "$(dirname "$0")/../lib.sh"
course_setup rm-vs-rm-cached

WORK="$ROOT/work/night-watch"
SEED_DIR=$(mktemp -d)

REMOTE=$(new_bare night-watch)

git init --initial-branch=main "$SEED_DIR" >/dev/null
git -C "$SEED_DIR" config user.email "maintainer@example.com"
git -C "$SEED_DIR" config user.name "seed"

cat > "$SEED_DIR/README.md" <<'EOF'
# Night Watch

值班巡检记录仓库。
EOF

cat > "$SEED_DIR/monitor.py" <<'EOF'
def check_jobs():
    return ["cron", "backup", "metrics"]
EOF

git -C "$SEED_DIR" add README.md monitor.py
git -C "$SEED_DIR" commit -m "init: create night-watch" >/dev/null

cat > "$SEED_DIR/.env" <<'EOF'
APP_KEY=prod-demo-key
EOF

cat > "$SEED_DIR/db.sqlite3" <<'EOF'
sqlite-demo-content
EOF

cat > "$SEED_DIR/run.log" <<'EOF'
[debug] processed 3 jobs
[debug] token=night-watch-demo
EOF

cat > "$SEED_DIR/README.md" <<'EOF'
# Night Watch

值班巡检记录仓库。

最近有人把本地敏感文件也一起交上去了，需要尽快清理追踪状态。
EOF

git -C "$SEED_DIR" add README.md .env db.sqlite3 run.log
git -C "$SEED_DIR" commit -m "oops: add local runtime files" >/dev/null
git -C "$SEED_DIR" remote add origin "$REMOTE"
git -C "$SEED_DIR" push -u origin main >/dev/null

git clone "$REMOTE" "$WORK" >/dev/null 2>&1

rm -rf "$SEED_DIR"

summary "$WORK" \
    "远程仓库：$REMOTE" \
    ".env 和 db.sqlite3 要保留在本地但停止追踪，run.log 要彻底删掉。注意：这些文件已经被 push 过了。"
