#!/usr/bin/env bash
# 给 wiki 打码生成密文：用 wiki 专用公钥加密（age -r），加密不碰任何秘密，所以公钥可以写在这里。
# 浏览器里由 docs/vendor/age-init.js 显示成马赛克，解锁后还原；规矩见
# docs/skills/wiki-guide/mkdocs-wiki/index.md 的「打码」一节。
# 私钥在 ~/.config/age/wiki.key（不进仓库），用口令锁住的副本内嵌在 age-init.js 的 WIKI_KEY_AGE；
# 换钥匙对时两处一起改。
#
#   bash scripts/age-seal.sh       # 输一行小字（不回显、不进 shell 历史）→ 打印 age:…，贴进反引号里
#   bash scripts/age-seal.sh -a    # 从标准输入读多行，Ctrl-D 结束 → 打印 armor，贴进 ```age 代码块
set -euo pipefail
WIKI_PUB=age1clt8yf9p6yp6umdg6lyqzt7vgs0ht37c3zky4rtf43ygsyy8e55q55ucr6

command -v age >/dev/null || { echo "没找到 age：装法见 docs/posts/wiki-tech/age-mosaic.md#install" >&2; exit 1; }

if [ "${1:-}" = "-a" ]; then
    age -r "$WIKI_PUB" -a
else
    read -rsp "要打码的小字：" plain; echo >&2
    [ -n "$plain" ] || { echo "空的，没加密" >&2; exit 1; }
    printf '%s' "$plain" | age -r "$WIKI_PUB" | base64 -w0 | sed 's/^/age:/'
    echo
fi
