#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 4-1-0）
source "$(dirname "$0")/../lib.sh"
course_setup cherry-pick-single

WORK="$ROOT/work/checkout-spark"

REMOTE=$(new_bare checkout-spark)

tmp_init "$REMOTE"
as maintainer

mkdir -p ui
cat > README.md <<'EOF'
# Checkout Spark

当前你在 `main` 分支上，只需要从 `feature/payment-badge` 借一条提交：

- `feat: add payment badge renderer`

注意：

- 只带这一条，不要把后面的草稿一起搬过来
- 完成后 `ui/payment_panel.js` 里需要出现“支付方式已校验”
- 本关只需要整理本地历史，不需要 push
EOF

cat > ui/payment_panel.js <<'EOF'
function renderPaymentPanel(status) {
  return `支付状态：${status}`;
}

module.exports = {
  renderPaymentPanel,
};
EOF

git add README.md ui/payment_panel.js
git commit -m "feat: initialize checkout panel"
git push origin main

git checkout -b feature/payment-badge
cat > ui/payment_panel.js <<'EOF'
function renderPaymentPanel(status) {
  return `支付状态：${status}`;
}

function renderPaymentBadge() {
  return "支付方式已校验";
}

module.exports = {
  renderPaymentPanel,
  renderPaymentBadge,
};
EOF
git add ui/payment_panel.js
git commit -m "feat: add payment badge renderer"

cat > scratchpad.md <<'EOF'
随手记：
- 徽章颜色以后也许改成金色
- 这份草稿不该进 main
EOF
git add scratchpad.md
git commit -m "docs: jot badge brainstorm"
git push origin feature/payment-badge

tmp_done

work_clone "$REMOTE"

summary "$WORK" \
    "远程仓库：$REMOTE"
