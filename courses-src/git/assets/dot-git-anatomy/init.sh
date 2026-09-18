#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 1-0-2）
source "$(dirname "$0")/../lib.sh"
course_setup dot-git-anatomy

WORK="$ROOT/work/telemetry-probe"
ACCIDENT_MARKER="$ROOT/work/.git-lost"

rm -f "$ACCIDENT_MARKER"

REMOTE=$(new_bare telemetry-probe)

mkdir -p "$WORK"

cat > "$WORK/README.md" <<'EOF'
# Telemetry Probe

这个目录目前还不是 Git 仓库。

本关建议顺序：
1. 先把当前目录初始化成 Git 仓库
2. 观察 `.git` 目录里的 HEAD、objects、refs
3. 执行 `./accident.sh` 模拟误删 `.git`
4. 重新把仓库建回来，并推送到公司远程
EOF

cat > "$WORK/collector.py" <<'EOF'
def collect_metrics():
    return [
        "latency:p95",
        "error_rate:daily"
    ]
EOF

cat > "$WORK/notes.md" <<'EOF'
# 采集备注

- 先接入登录链路
- 晚上补仪表盘字段
EOF

cat > "$WORK/accident.sh" <<'EOF'
#!/bin/bash
set -e

touch "$(dirname "$PWD")/.git-lost"
rm -rf .git
echo ".git 已被误删。当前目录还在，但 Git 身份已经丢失。"
EOF

chmod +x "$WORK/accident.sh"

git config --global user.email "you@example.com"
git config --global user.name "you"
git config --global init.defaultBranch main

summary "$WORK" \
    "远程仓库：$REMOTE" \
    '先把 .git 的结构看清楚，再运行 ./accident.sh 体验误删，然后重新建仓并推送'
