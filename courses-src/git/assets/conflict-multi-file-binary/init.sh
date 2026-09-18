#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 2-0-3）
source "$(dirname "$0")/../lib.sh"
course_setup conflict-multi-file-binary

# 一张"图"的三个版本。内容确定（不是 /dev/urandom），所以 blob hash 每次跑都一样；
# 开头的 NUL 让 git 判定为二进制 —— 二进制冲突不给 hunk，只能整份选一边。
hero_png() {
    printf 'PNG\x00hero-%s\x00' "$1"
    head -c 240 /dev/zero | tr '\0' "$(printf '%s' "$1" | cut -c1)"
}

WORK="$ROOT/work/campaign-studio"

REMOTE=$(new_bare campaign-studio)

tmp_init "$REMOTE"
as maintainer

mkdir -p assets

cat > README.md <<'EOF'
# Campaign Studio

本次活动页上线要求：

- 页面主标题需要突出“灵感驱动转化”
- 按钮文案要明确引导生成活动页
- 页面必须保留“需人工复核后上线”的风险提示
- copy.txt 中必须保留“上线前请确认素材版权”
- assets/hero.png 必须采用远程最新主视觉图
EOF

cat > landing.js <<'EOF'
export function render_banner() {
  return {
    title: "活动页生成器",
    eyebrow: "把创意变成页面",
    cta: "生成",
    notice: "上线前请检查配置"
  };
}
EOF

cat > copy.txt <<'EOF'
主题：让创意更快上线
按钮：开始生成
备注：上线前请检查配置
EOF

hero_png base > assets/hero.png

git add README.md landing.js copy.txt assets/hero.png
git commit -m "feat: initialize campaign studio assets"
git push origin main
tmp_done

git config --global pull.rebase false
work_clone "$REMOTE"

tmp_clone "$REMOTE"
as colleague
cat > landing.js <<'EOF'
export function render_banner() {
  return {
    title: "灵感不是噪音，是下一次转化",
    eyebrow: "让创意进入提审流程",
    cta: "立即生成活动页",
    notice: "需人工复核后上线"
  };
}
EOF
cat > copy.txt <<'EOF'
主题：把灵感推到首页
按钮：立即生成活动页
备注：上线前请确认素材版权
EOF
hero_png remote > assets/hero.png
git add landing.js copy.txt assets/hero.png
git commit -m "feat: refresh campaign assets for review"
git push origin main
tmp_done

cat > "$WORK/landing.js" <<'EOF'
export function render_banner() {
  return {
    title: "把灵感推到首页",
    eyebrow: "让页面像舞台开灯一样亮起来",
    cta: "现在就开做",
    notice: "灵感先上场"
  };
}
EOF
cat > "$WORK/copy.txt" <<'EOF'
主题：把灵感推到首页
按钮：现在就开做
备注：让活动页先冲到大家面前
EOF
hero_png local > "$WORK/assets/hero.png"

git -C "$WORK" add landing.js copy.txt assets/hero.png
git -C "$WORK" commit -m "feat: refresh campaign page copy"

summary "$WORK" \
    "远程仓库：$REMOTE"
