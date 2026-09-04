#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 4-1-3）
source "$(dirname "$0")/../lib.sh"
course_setup cherry-pick-range-cross-repo

WORK="$ROOT/work/payment-gateway"

REMOTE=$(new_bare payment-gateway)
EXTERNAL=$(new_bare partner-snippets)

tmp_init "$REMOTE"
as maintainer

mkdir -p docs config src
cat > README.md <<'EOF'
# Payment Gateway

你当前在 `main` 分支，需要从一个独立远程仓库里把几段提交偷回来。

外部仓库地址由 init.sh 在末尾打印（形如 file:///…/partner-snippets.git）。

目标：

1. 从外部分支 `feature/pay-tunnel` 里带回连续两条提交：
   - `feat: add pay tunnel adapter`
   - `chore: document tunnel provider env`
2. 另外再带回外部分支 `hotfix/callback-copy` 上的一条提交：
   - `docs: clarify callback confirmation copy`

注意：

- `feature/pay-tunnel` 后面还有 `docs: archive abandoned sdk note`，不要带进来
- 连续两条提交必须一起搬，范围要包含第一条本身
- 完成后本地 main 不需要 push，但要保留新增的外部 remote
EOF

cat > docs/integration_note.md <<'EOF'
# 集成备注

- 先接通主网关
EOF

cat > config/payment.env.example <<'EOF'
PAYMENT_MODE=standard
EOF

cat > src/gateway.js <<'EOF'
function bootGateway() {
  return "gateway-online";
}

module.exports = {
  bootGateway,
};
EOF

git add README.md docs/integration_note.md config/payment.env.example src/gateway.js
git commit -m "feat: initialize payment gateway"
git push origin main
tmp_done

tmp_init "$EXTERNAL"
as maintainer

mkdir -p docs config lib
cat > README.md <<'EOF'
# Partner Snippets
EOF

cat > docs/integration_note.md <<'EOF'
# 集成备注

- 回调到达后再更新订单状态
EOF

cat > config/payment.env.example <<'EOF'
PAYMENT_MODE=standard
EOF

git add README.md docs/integration_note.md config/payment.env.example
git commit -m "feat: initialize partner snippets"
git push origin main

git checkout -b feature/pay-tunnel
cat > lib/pay_tunnel.js <<'EOF'
function openPayTunnel() {
  return "trusted-channel";
}

module.exports = {
  openPayTunnel,
};
EOF
git add lib/pay_tunnel.js
git commit -m "feat: add pay tunnel adapter"

cat > config/payment.env.example <<'EOF'
PAYMENT_MODE=standard
TUNNEL_PROVIDER=trusted-channel
EOF
git add config/payment.env.example
git commit -m "chore: document tunnel provider env"

mkdir -p notes
cat > notes/abandoned_sdk.txt <<'EOF'
这个旧 SDK 方案已经废弃，不要带回主仓库
EOF
git add notes/abandoned_sdk.txt
git commit -m "docs: archive abandoned sdk note"
git push origin feature/pay-tunnel

git checkout main
git checkout -b hotfix/callback-copy
cat > docs/integration_note.md <<'EOF'
# 集成备注

- 回调到达后再更新订单状态
- 回调文案需标注：异步到账以网关确认页为准
EOF
git add docs/integration_note.md
git commit -m "docs: clarify callback confirmation copy"
git push origin hotfix/callback-copy

tmp_done

work_clone "$REMOTE"

summary "$WORK" \
    "远程仓库：$REMOTE" \
    "外部仓库：$EXTERNAL"
