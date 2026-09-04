#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 1-1-1）
source "$(dirname "$0")/../lib.sh"
course_setup reset-unpushed-commit

WORK="$ROOT/work/deploy-guard"
SEED_DIR=$(mktemp -d)

REMOTE=$(new_bare deploy-guard)

git init --initial-branch=main "$SEED_DIR" >/dev/null
git -C "$SEED_DIR" config user.email "maintainer@example.com"
git -C "$SEED_DIR" config user.name "seed"

cat > "$SEED_DIR/README.md" <<'EOF'
# Deploy Guard

发布脚本实验仓库。
EOF

cat > "$SEED_DIR/deploy.sh" <<'EOF'
#!/bin/bash
echo "deploy preview"
EOF

chmod +x "$SEED_DIR/deploy.sh"

git -C "$SEED_DIR" add README.md deploy.sh
git -C "$SEED_DIR" commit -m "init: create deploy-guard" >/dev/null
git -C "$SEED_DIR" remote add origin "$REMOTE"
git -C "$SEED_DIR" push -u origin main >/dev/null

git clone "$REMOTE" "$WORK" >/dev/null 2>&1

cat > "$WORK/deploy.sh" <<'EOF'
#!/bin/bash
echo "deploy preview"
echo "timeout=30"
EOF

cat > "$WORK/staging.pem" <<'EOF'
-----BEGIN PRIVATE KEY-----
demo-staging-key-please-remove-from-history
-----END PRIVATE KEY-----
EOF

git -C "$WORK" add deploy.sh staging.pem
git -C "$WORK" commit -m "feat: update deploy script with staging key" >/dev/null

rm -rf "$SEED_DIR"

summary "$WORK" \
    "远程仓库：$REMOTE" \
    "最后一次提交还没 push，但里面混进了 staging.pem。请先撤回这次提交，再只提交安全的内容。"
