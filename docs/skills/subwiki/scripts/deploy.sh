#!/usr/bin/env bash
# 子 wiki 构建：构建 HTML → 复制 .md 源 → 后处理。在项目根跑（docs/、zensical.toml 所在的目录）；
# 下面假定同目录的其余脚本放在 wiki-tools/，放别处就改这两处路径。
# 服务每次请求都现读 site/，构建完立即生效，不用重启。
set -euo pipefail
cd "$(dirname "$0")"

# 有动态数据才需要：live.js 进 docs/，zensical.toml 里 extra_javascript = ["javascripts/live.js"]
mkdir -p docs/javascripts && cp wiki-tools/live.js docs/javascripts/live.js

# 1. 构建 HTML。zensical 每次清空并重建 site/，所以复制 .md 必须在它之后
uv run zensical build

# 2. docs/ 下的 .md 按原目录结构复制进 site/：页面在 x/index.html，x.md 正好空着
rsync -a --exclude='.*/' --include='*/' --include='*.md' --exclude='*' --prune-empty-dirs docs/ site/

# 3. 每个页面的 <head> 加指向 .md 的 <link rel="alternate">，检查相对链接
uv run python wiki-tools/postbuild.py site
