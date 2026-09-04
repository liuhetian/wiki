#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 2-1-0）
source "$(dirname "$0")/../lib.sh"
course_setup feature-branch-merge

WORK="$ROOT/work/team-board"

REMOTE=$(new_bare team-board)

tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# Team Board

本关目标：

- 不要直接在 main 分支上改公告板
- 请先创建并切换到分支 `feature/snack-reminder`
- 在 `board.txt` 末尾补上一行：茶水间补货后记得同步群消息
- 在功能分支提交后，切回 `main` 再合并 `feature/snack-reminder`
- 本关不要求 push，重点是本地分支开发流程
EOF

cat > board.txt <<'EOF'
今日公告：
- 上午十点站会在小会议室
- 新同学入职资料放在前台抽屉
EOF

git add README.md board.txt
git commit -m "feat: initialize team board"
git push origin main
tmp_done

work_clone "$REMOTE"

summary "$WORK" \
    "远程仓库：$REMOTE"
