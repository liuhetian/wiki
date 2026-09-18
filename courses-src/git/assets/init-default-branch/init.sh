#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 1-0-1）
source "$(dirname "$0")/../lib.sh"
course_setup init-default-branch

WORK="$ROOT/work/release-cards"

REMOTE=$(new_bare release-cards)

mkdir -p "$WORK"

cat > "$WORK/README.md" <<'EOF'
# Release Cards

上线卡片整理说明：

- 每次发布前确认风险说明已填写
- 发布后同步回滚联系人
EOF

cat > "$WORK/cards.txt" <<'EOF'
卡片清单：
- 首页活动页
- 订单确认弹窗
EOF

cat > "$WORK/publish.sh" <<'EOF'
#!/bin/bash
echo "publish preview"
EOF

chmod +x "$WORK/publish.sh"

git config --global user.email "you@example.com"
git config --global user.name "you"
git config --global init.defaultBranch master

summary "$WORK" \
    "远程仓库：$REMOTE" \
    "请从零创建仓库，但最终本地与远程主分支都必须是 main"
