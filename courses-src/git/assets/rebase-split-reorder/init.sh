#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 3-0-3）
source "$(dirname "$0")/../lib.sh"
course_setup rebase-split-reorder

WORK="$ROOT/work/ops-dashboard"

REMOTE=$(new_bare ops-dashboard)

tmp_init "$REMOTE"
as maintainer

mkdir -p scripts

cat > README.md <<'EOF'
# Ops Dashboard

当前本地历史里有一个巨大的 `wip: finish dashboard`，把布局、脚本和交接说明全揉在了一起。

代码审查前请把最近 3 条本地历史整理成下面 5 条，顺序也必须一致：

1. feat: build dashboard layout
2. feat: wire metrics renderer
3. docs: add dashboard handoff notes
4. docs: add incident review outline
5. feat: add release checklist footer

最终文件要求：
- dashboard.html 中必须保留 `<h1>值班总览面板</h1>` 和 `发布前检查：日志、告警、回滚预案`
- scripts/metrics.js 中必须保留 `renderMetrics`
- README.md 中必须保留 “交接说明：值班前先确认告警联系人”
- review.md 中必须保留 “事故复盘提纲”
EOF

cat > dashboard.html <<'EOF'
<main>
  <p>Dashboard skeleton</p>
</main>
EOF

cat > scripts/metrics.js <<'EOF'
export function renderPlaceholder() {
  return "metrics pending";
}
EOF

git add README.md dashboard.html scripts/metrics.js
git commit -m "chore: initialize ops dashboard skeleton"
git push origin main
tmp_done

work_clone "$REMOTE"

cat > "$WORK/review.md" <<'EOF'
# 事故复盘提纲

- 时间线
- 影响范围
- 后续改进
EOF
git -C "$WORK" add review.md
git -C "$WORK" commit -m "docs: add incident review outline"

cat > "$WORK/dashboard.html" <<'EOF'
<main class="dashboard">
  <h1>值班总览面板</h1>
  <section id="metrics"></section>
</main>
EOF

cat > "$WORK/scripts/metrics.js" <<'EOF'
export function renderMetrics(items) {
  return items.map((item) => `- ${item.label}: ${item.value}`).join("\n");
}
EOF

cat >> "$WORK/README.md" <<'EOF'

交接说明：值班前先确认告警联系人
EOF

git -C "$WORK" add dashboard.html scripts/metrics.js README.md
git -C "$WORK" commit -m "wip: finish dashboard"

cat >> "$WORK/dashboard.html" <<'EOF'
<footer>发布前检查：日志、告警、回滚预案</footer>
EOF
git -C "$WORK" add dashboard.html
git -C "$WORK" commit -m "feat: add release checklist footer"

summary "$WORK" \
    "远程仓库：$REMOTE"
