#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 4-0-3）
source "$(dirname "$0")/../lib.sh"
course_setup revert-merge-revert-revert

WORK="$ROOT/work/ops-stage"

REMOTE=$(new_bare ops-stage)

tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# Ops Stage

当前主线已经合入过一次 `feature/live-canvas`，但那次合并带来了过快的刷新节奏。

处理要求：

1. 先把 merge commit `merge feature/live-canvas for ops screen` 从 main 上整次撤回
2. `feature/live-canvas` 分支上已经有修复提交 `fix: calm live canvas refresh rate`
3. 如果只是在撤回 merge 之后直接再 merge 修复分支，之前被一起撤掉但修复提交没有再次修改的文件不会完整回来
4. 在重新合并修好的分支前，需要先撤销那次撤回
EOF

cat > dashboard.html <<'EOF'
<main>
  <h1>值班总览</h1>
  <p>当前展示静态概览，不启用实时画布。</p>
</main>
EOF

git add README.md dashboard.html
git commit -m "feat: initialize ops stage shell"

git checkout -b feature/live-canvas

mkdir -p assets scripts
cat > dashboard.html <<'EOF'
<main>
  <h1>值班总览</h1>
  <section id="live-canvas">实时大屏画布</section>
</main>
EOF

cat > assets/palette.txt <<'EOF'
主视觉：霓虹青
辅助色：雾灰蓝
EOF

cat > scripts/live_canvas.js <<'EOF'
export function bootLiveCanvas() {
  const refresh_ms = 5;
  return `canvas refresh:${refresh_ms}`;
}
EOF

git add dashboard.html assets/palette.txt scripts/live_canvas.js
git commit -m "feat: add live canvas scene"

git checkout main
git merge --no-ff feature/live-canvas -m "merge feature/live-canvas for ops screen"

git push origin main
git push origin feature/live-canvas

git checkout feature/live-canvas
cat > scripts/live_canvas.js <<'EOF'
export function bootLiveCanvas() {
  const refresh_ms = 30;
  // 给值班屏幕留一点喘息时间
  return `canvas refresh:${refresh_ms}`;
}
EOF

git add scripts/live_canvas.js
git commit -m "fix: calm live canvas refresh rate"
git push origin feature/live-canvas

tmp_done

work_clone "$REMOTE"
git -C "$WORK" branch --track feature/live-canvas origin/feature/live-canvas

summary "$WORK" \
    "远程仓库：$REMOTE"
