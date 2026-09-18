#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 3-0-0）
source "$(dirname "$0")/../lib.sh"
course_setup amend-message

WORK="$ROOT/work/release-notes"

REMOTE=$(new_bare release-notes)

tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# Release Notes

本周版本说明已经提交，但最近一次的提交说明写得一团糟。

提交前请把最近一次 commit message 改成：

docs: refine release note summary
EOF

cat > release_notes.md <<'EOF'
# Weekly Release Notes

- 优化了登录页的错误提示文案
- 补充了导出报表的注意事项
EOF

git add README.md release_notes.md
git commit -m "docs: add weekly release note template"
git push origin main
tmp_done

work_clone "$REMOTE"

cat > "$WORK/release_notes.md" <<'EOF'
# Weekly Release Notes

- 优化了登录页的错误提示文案
- 补充了导出报表的注意事项
- 新增了回滚步骤摘要，方便值班同事快速确认风险
EOF

git -C "$WORK" add release_notes.md
git -C "$WORK" commit -m "asdf"

summary "$WORK" \
    "远程仓库：$REMOTE"
