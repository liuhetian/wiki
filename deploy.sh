#!/usr/bin/env bash
# 构建 + 同步到腾讯云 COS：site/ 的 .html 给人看，docs/ 的 .md 源给 AI 读
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# 0. 收编副机 push 到 GitHub 的内容；--ff-only：本地有未推提交或冲突时报错停住（set -e 拦下），
#    逼人先处理再部署，不会静默合并出意外内容
git pull --ff-only

# 0.5 链路校验：本 wiki 的 AI 入口是相对链接、不是 nav，所以漏挂链接的文章对 AI 等于
#     不存在。这道闸门要求每篇 .md 都能被某个祖先索引页直接链到，另查死链与 nav 注册。
#     放在读凭证和构建之前 —— 失败得越早，浪费越少（set -e 拦下非零退出码）
python3 "$PROJECT_DIR/scripts/check-links.py"

# 1. 读凭证、写 coscmd 配置
set -a; source .env; set +a
COSCMD="$PROJECT_DIR/.venv/bin/coscmd"
"$COSCMD" config -a "$COS_SECRET_ID" -s "$COS_SECRET_KEY" -b "$COS_BUCKET" -r "$COS_REGION"

# 2. 构建（先清 site/：第 4 步 --delete 以 site/ 为准，残留会"保护"桶里陈旧不被清掉）
rm -rf "$PROJECT_DIR/site"
uv run zensical build

# 3. 复制 docs/ 的 .md 源进 site/（保留目录结构）→ site/ 成为桶的单一镜像；
#    .md 与 .html 的 key 不冲突（use_directory_urls：页面在 /x/index.html，源在 /x.md）
rsync -am --include='*/' --include='*.md' --exclude='*' "$PROJECT_DIR/docs/" "$PROJECT_DIR/site/"

# 3.5 llms.txt = index.md 的构建期副本（同一份内容双 URL：/index.md 给源、/llms.txt 给 llms.txt 协议爬虫）
#     写作时只维护 docs/index.md 一份即可；index.md 正文按 llms.txt 规范写（H1+blockquote+H2），
#     但头部带首页开屏的 frontmatter（template: home.html）和同步提示注释 —— llms.txt 要求
#     H1 开头，这里剥掉 frontmatter 块和正文前的 HTML 注释再落盘
awk 'NR==1 && /^---$/ {fm=1; next} fm && /^---$/ {fm=0; next} fm {next} {print}' \
  "$PROJECT_DIR/site/index.md" \
  | perl -0pe 's/\A\s*(<!--.*?-->\s*)*//s' > "$PROJECT_DIR/site/llms.txt"

# 4. 同步 site/ 到 bucket 根（cd 进 site/ 用绝对路径 coscmd；不能用 uv run --directory，
#    它会把 CWD 切回项目根、把 .venv/.env 一起传上去）
#    .md 必须先传：coscmd 默认给 .md 配 octet-stream，所以新增/变动的 .md 要由这条带
#    Content-Type 的命令落桶；随后的全量同步见 MD5 一致会跳过，不会用错类型覆盖回去。
#    两条递归都带 -s（MD5 一致跳过），没变化的文件两步都不动。
cd "$PROJECT_DIR/site"
"$COSCMD" upload -rs --include '*.md' -H 'Content-Type: text/markdown; charset=utf-8' ./ /
#    代码源文件（demo 的 source/、文章附的脚本）同理要钉类型：COS 按扩展名猜，
#    .ts 会猜成 video/mp2t（MPEG 视频流）、.tsx/.jsx/.mjs/.py 猜成 octet-stream——
#    AI 抓取工具按 content-type 过滤文本时直接拒收，「完整实现」的链接摆得再对也读不回内容。
#    带 -s：-s 只比对 MD5 不看类型，新增/内容变动的文件会带着正确类型上传，没变的跳过。
#    （桶里错类型的历史对象已在 2026-08 前的部署里全量重传修正过，此后无需再无条件重传；
#    若哪天又混入错类型对象，临时去掉 -s 跑一次即可自愈）
"$COSCMD" upload -rs --include '*.ts,*.tsx,*.jsx,*.mjs,*.py' -H 'Content-Type: text/plain; charset=utf-8' ./ /
# llms.txt 不带 -s：coscmd 单文件 upload -s 命中"MD5 一致跳过"时退出码是 254（且静默），
# 会被 set -e 误杀、后面的全量镜像不再执行；2KB 每次直传换脚本必然走完。
"$COSCMD" upload -H 'Content-Type: text/plain; charset=utf-8' llms.txt /llms.txt  # 内容是 markdown，扩展名按 llms.txt 规范用 .txt，浏览器直读用 text/plain
"$COSCMD" upload -rs --delete -y ./ /  # 全量镜像+清桶里陈旧；-y 免确认（set -e 保证 build 失败不会拿空 site 清空桶）

echo
echo "✅ 部署完成 — https://${COS_DOMAIN}/"
