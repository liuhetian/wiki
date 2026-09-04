#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 1-0-0）
source "$(dirname "$0")/../lib.sh"
course_setup init-first-push

WORK="$ROOT/work/morning-notes"

REMOTE=$(new_bare morning-notes)

mkdir -p "$WORK"

cat > "$WORK/README.md" <<'EOF'
# Morning Notes

算法组早会记录草稿。

- 站会前整理好昨天的问题
- 把今天要验证的接口列出来
EOF

cat > "$WORK/notes.txt" <<'EOF'
今日安排：
- 检查登录接口日志
- 补上首页埋点备注
EOF

git config --global user.email "you@example.com"
git config --global user.name "you"
git config --global init.defaultBranch main

summary "$WORK" \
    "远程仓库：$REMOTE" \
    "当前目录只是普通文件夹，请把它初始化成 Git 仓库并完成第一次推送"
