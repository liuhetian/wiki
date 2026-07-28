#!/usr/bin/env bash
# 把"当前所在的 git 仓库"接上 COS 后端的 git-lfs（scripts/lfs-cos-agent.py）。
#
# 每台机器 / 每个 clone 跑一次（agent 路径出于安全不能写进仓库内 .lfsconfig，
# 只能落在本地 git config）。在目标仓库目录里执行：
#   bash /path/to/wiki/scripts/setup-lfs.sh          # 前缀默认 lfs
#   bash /path/to/wiki/scripts/setup-lfs.sh lfs-test # 测试仓用独立前缀
#
# 依赖：本机装有 git-lfs；wiki 项目的 .venv（qcloud_cos）与 .env（COS 凭证）。
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PREFIX="${1:-lfs}"

git rev-parse --is-inside-work-tree >/dev/null || { echo "请在目标 git 仓库里执行" >&2; exit 1; }
[ -x "$PROJECT_DIR/.venv/bin/python" ] || { echo "缺 $PROJECT_DIR/.venv，先 uv sync" >&2; exit 1; }
[ -f "$PROJECT_DIR/.env" ] || { echo "缺 $PROJECT_DIR/.env（COS 凭证）" >&2; exit 1; }

git lfs install --local
git config lfs.customtransfer.cos.path "$PROJECT_DIR/.venv/bin/python"
git config lfs.customtransfer.cos.args "$PROJECT_DIR/scripts/lfs-cos-agent.py $PREFIX"
git config lfs.standalonetransferagent cos

echo "✅ 已接入 COS-LFS：blob → cos://\$COS_BACKUP_BUCKET/$PREFIX/（凭证读 $PROJECT_DIR/.env）"
