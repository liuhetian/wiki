#!/usr/bin/env bash
# 首次配置：装 acme.sh、申请证书、注册自动续期 hook
# 之后续期由 acme.sh 内置 cron 触发，无需再跑此脚本
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

set -a
# shellcheck disable=SC1091
source .env
set +a

# 必填项
need() {
    if [ -z "${!1:-}" ]; then
        echo "ERROR: .env 缺少 $1" >&2
        exit 1
    fi
}
need DP_Id
need DP_Key
need ACME_EMAIL
need COS_SECRET_ID
need COS_SECRET_KEY
need COS_BUCKET
need COS_REGION
need COS_DOMAIN

ACME="$HOME/.acme.sh/acme.sh"
PYTHON="$PROJECT_DIR/.venv/bin/python"
DEPLOY_SCRIPT="$PROJECT_DIR/deploy-cert/deploy_cert_to_cos.py"

# 1. 装 acme.sh（如果还没装）
if [ ! -x "$ACME" ]; then
    echo ">>> 安装 acme.sh ..."
    curl -fsSL https://get.acme.sh | sh -s email="$ACME_EMAIL"
fi

# 2. 切到 Let's Encrypt 作为默认 CA（acme.sh 0.6 起默认 ZeroSSL）
"$ACME" --set-default-ca --server letsencrypt

# 3. 申请证书（DNS-01）—— DP_Id/DP_Key 已经在环境里
echo ">>> 申请证书 for $COS_DOMAIN ..."
"$ACME" --issue --dns dns_dp -d "$COS_DOMAIN" --keylength ec-256

# 4. 注册 reloadcmd：续期成功后自动调 Python 脚本，把新证书推到 COS
RELOADCMD="set -a; . '$PROJECT_DIR/.env'; set +a; \
export TENCENT_SECRET_ID=\"\$COS_SECRET_ID\" TENCENT_SECRET_KEY=\"\$COS_SECRET_KEY\"; \
'$PYTHON' '$DEPLOY_SCRIPT'"

"$ACME" --install-cert -d "$COS_DOMAIN" --ecc --reloadcmd "$RELOADCMD"

# 5. 首次也手动跑一次 reloadcmd，把刚拿到的证书推到 COS
echo ">>> 首次部署证书到 COS ..."
"$ACME" --renew -d "$COS_DOMAIN" --ecc --force

echo
echo "✅ 完成"
echo
echo "已注册的 cron 任务（acme.sh 自动加的，每天 0 点检查）："
crontab -l 2>/dev/null | grep -i acme || echo "（看不到？运行 ~/.acme.sh/acme.sh --install-cronjob）"
echo
echo "常用命令："
echo "  查看证书状态:    ~/.acme.sh/acme.sh --list"
echo "  强制立即续期:    ~/.acme.sh/acme.sh --renew -d $COS_DOMAIN --ecc --force"
echo "  查看续期日志:    tail -f ~/.acme.sh/acme.sh.log"
