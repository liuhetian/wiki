#!/usr/bin/env bash
# 构建 + 同步到腾讯云 COS：site/ 的 .html 给人看，docs/ 的 .md 源给 AI 读
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# 1. 读凭证、写 coscmd 配置
set -a; source .env; set +a
COSCMD="$PROJECT_DIR/.venv/bin/coscmd"
"$COSCMD" config -a "$COS_SECRET_ID" -s "$COS_SECRET_KEY" -b "$COS_BUCKET" -r "$COS_REGION"

# 1.5 重型 vendor 不入 git：缺了先恢复，否则第 4 步 --delete 会把线上真身清掉
{ [ -f "$PROJECT_DIR/docs/vendor/mathjax/tex-svg.js" ] &&
  [ -f "$PROJECT_DIR/docs/vendor/echarts/echarts.min.js" ]; } || bash "$PROJECT_DIR/scripts/fetch-vendor.sh"

# 2. 构建（先清 site/：第 4 步 --delete 以 site/ 为准，残留会"保护"桶里陈旧不被清掉）
rm -rf "$PROJECT_DIR/site"
uv run zensical build

# 3. 复制 docs/ 的 .md 源进 site/（保留目录结构）→ site/ 成为桶的单一镜像；
#    .md 与 .html 的 key 不冲突（use_directory_urls：页面在 /x/index.html，源在 /x.md）
rsync -am --include='*/' --include='*.md' --exclude='*' "$PROJECT_DIR/docs/" "$PROJECT_DIR/site/"

# 3.5 llms.txt = index.md 的构建期副本（同一份内容双 URL：/index.md 给源、/llms.txt 给 llms.txt 协议爬虫）
#     写作时只维护 docs/index.md 一份即可；index.md 已按 llms.txt 规范写（H1+blockquote+H2）
cp "$PROJECT_DIR/site/index.md" "$PROJECT_DIR/site/llms.txt"

# 4. 同步 site/ 到 bucket 根（cd 进 site/ 用绝对路径 coscmd；不能用 uv run --directory，
#    它会把 CWD 切回项目根、把 .venv/.env 一起传上去）
#    .md 必须先传：coscmd 默认给 .md 配 octet-stream，所以新增/变动的 .md 要由这条带
#    Content-Type 的命令落桶；随后的全量同步见 MD5 一致会跳过，不会用错类型覆盖回去。
#    两条递归都带 -s（MD5 一致跳过），没变化的文件两步都不动。
cd "$PROJECT_DIR/site"
"$COSCMD" upload -rs --include '*.md' -H 'Content-Type: text/markdown; charset=utf-8' ./ /
# llms.txt 不带 -s：coscmd 单文件 upload -s 命中"MD5 一致跳过"时退出码是 254（且静默），
# 会被 set -e 误杀、后面的全量镜像不再执行；2KB 每次直传换脚本必然走完。
"$COSCMD" upload -H 'Content-Type: text/plain; charset=utf-8' llms.txt /llms.txt  # 内容是 markdown，扩展名按 llms.txt 规范用 .txt，浏览器直读用 text/plain
"$COSCMD" upload -rs --delete -y ./ /  # 全量镜像+清桶里陈旧；-y 免确认（set -e 保证 build 失败不会拿空 site 清空桶）

echo
echo "✅ 部署完成 — https://${COS_DOMAIN}/"
