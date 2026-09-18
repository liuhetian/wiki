#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 3-0-1）
source "$(dirname "$0")/../lib.sh"
course_setup amend-files-reword

WORK="$ROOT/work/brand-copy"

REMOTE=$(new_bare brand-copy)

tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# Brand Copy

代码审查前请把最近两次本地提交整理成下面的样子：

1. 较早的那次提交说明应该是：docs: polish hero headline
2. 最新一次提交说明应该是：feat: add launch CTA assets
3. 最新一次提交里除了 button_copy.txt，还必须把 palette_notes.txt 一并纳入版本控制
EOF

cat > landing_copy.txt <<'EOF'
主标题：让数据说人话
副标题：把复杂指标变成会自己讲重点的日报
EOF

git add README.md landing_copy.txt
git commit -m "docs: initialize landing copy"
git push origin main
tmp_done

work_clone "$REMOTE"

cat > "$WORK/landing_copy.txt" <<'EOF'
主标题：让数据说人话
副标题：把复杂指标变成会自己讲重点的日报
说明：首屏文案需要更稳一点，不要像情绪口号
EOF
git -C "$WORK" add landing_copy.txt
git -C "$WORK" commit -m "update stuff"

cat > "$WORK/button_copy.txt" <<'EOF'
主按钮：立即生成发布页
次按钮：先看示例
EOF
git -C "$WORK" add button_copy.txt
git -C "$WORK" commit -m "feat: add launch CTA assets"

cat > "$WORK/palette_notes.txt" <<'EOF'
按钮色板：
- 主按钮：珊瑚橙
- 次按钮：雾蓝灰
EOF

summary "$WORK" \
    "远程仓库：$REMOTE"
