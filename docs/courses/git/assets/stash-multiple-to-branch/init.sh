#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 2-1-3）
source "$(dirname "$0")/../lib.sh"
course_setup stash-multiple-to-branch

WORK="$ROOT/work/atelier-poster"

REMOTE=$(new_bare atelier-poster)

tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# Atelier Poster

当前仓库里堆了三份 stash：

- 一份是法务备注改动，需要应用回 main
- 一份是过期但还不错的霓虹视觉草稿，应该转成独立分支继续做
- 还有一份只是随手涂鸦，先不要动

本关目标：

- 先用 `git stash list` 分辨三份 stash 各自是什么
- 把“法务备注改动”那份 stash 应用到 main，并解决 `poster.txt` 的冲突
- 解决后 `poster.txt` 必须同时保留：
  - `主题：发布会倒计时`
  - `按钮：立即生成主视觉`
  - `备注：上线前需法务复核`
- 把已经用完的“法务备注改动” stash 清理掉
- 把“霓虹视觉草稿”用 `git stash branch` 转成分支 `feature/neon-splash`
- `feature/neon-splash` 上的 `theme.txt` 必须包含：
  - `风格：霓虹流光`
  - `按钮气质：像舞台灯光一样亮`
- 那份“随手涂鸦” stash 要保留，不要动它
EOF

cat > poster.txt <<'EOF'
主题：活动页生成器
按钮：立即生成主视觉
备注：上线前请检查素材版权
EOF

cat > theme.txt <<'EOF'
风格：简洁留白
按钮气质：稳妥清晰
EOF

cat > scratchpad.txt <<'EOF'
草稿：
- 先把想法记在这里
EOF

git add README.md poster.txt theme.txt scratchpad.txt
git commit -m "feat: initialize poster workspace"
git push origin main
tmp_done

work_clone "$REMOTE"

cat > "$WORK/theme.txt" <<'EOF'
风格：霓虹流光
按钮气质：像舞台灯光一样亮
EOF
git -C "$WORK" stash push -m "wip: neon splash concept"

cat > "$WORK/poster.txt" <<'EOF'
主题：活动页生成器
按钮：立即生成主视觉
备注：上线前需法务复核
EOF
git -C "$WORK" stash push -m "wip: legal footer wording"

cat > "$WORK/scratchpad.txt" <<'EOF'
草稿：
- 先把想法记在这里
- 试试会不会太花
EOF
git -C "$WORK" stash push -m "wip: doodle notes"

cat > "$WORK/poster.txt" <<'EOF'
主题：发布会倒计时
按钮：立即生成主视觉
备注：上线前请检查素材版权
EOF
git -C "$WORK" add poster.txt
git -C "$WORK" commit -m "feat: refresh poster headline"

summary "$WORK" \
    "远程仓库：$REMOTE"
