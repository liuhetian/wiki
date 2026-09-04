#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 4-1-1）
source "$(dirname "$0")/../lib.sh"
course_setup cherry-pick-multi-ordered

WORK="$ROOT/work/invoice-deck"

REMOTE=$(new_bare invoice-deck)

tmp_init "$REMOTE"
as maintainer

mkdir -p slides
cat > README.md <<'EOF'
# Invoice Deck

你当前在 `release-candidate` 分支，需要从两个特性分支里有选择地带回 3 条提交：

1. `feat: add payment flow slide skeleton`
2. `docs: add risk banner to payment flow slide`
3. `docs: add review handoff note`

注意：

- `docs: add risk banner to payment flow slide` 依赖前一条骨架提交
- 不要把 `docs: note playful footer idea` 这种无关草稿带进来
- 完成后本地只需要整理 release-candidate，不需要 push
EOF

cat > slides/overview.md <<'EOF'
# 发票演示提纲

- 首页先讲开票入口
- 支付流程页还没补
EOF

git add README.md slides/overview.md
git commit -m "docs: initialize invoice deck"
git push origin main

git checkout -b release-candidate
git push origin release-candidate

git checkout -b feature/card-layout main
cat > slides/payment_flow.md <<'EOF'
# 支付流程页

## 卡片结构
- 订单摘要
- 支付方式
EOF
git add slides/payment_flow.md
git commit -m "feat: add payment flow slide skeleton"

mkdir -p draft
cat > draft/footer.txt <<'EOF'
也许页脚可以写得更活泼一点
EOF
git add draft/footer.txt
git commit -m "docs: note playful footer idea"
git push origin feature/card-layout

SKELETON_SHA=$(git rev-parse HEAD~1)
git checkout -b feature/risk-banner "$SKELETON_SHA"
cat > slides/payment_flow.md <<'EOF'
# 支付流程页

## 卡片结构
- 订单摘要
- 支付方式

## 风险横幅
- 高风险订单需要二次确认
EOF
git add slides/payment_flow.md
git commit -m "docs: add risk banner to payment flow slide"

mkdir -p copy
cat > copy/review_note.txt <<'EOF'
评审交接备注：
- 演示时先展示卡片结构，再补风险横幅说明
EOF
git add copy/review_note.txt
git commit -m "docs: add review handoff note"
git push origin feature/risk-banner

tmp_done

work_clone "$REMOTE"
git -C "$WORK" checkout -b release-candidate origin/release-candidate

summary "$WORK" \
    "远程仓库：$REMOTE"
