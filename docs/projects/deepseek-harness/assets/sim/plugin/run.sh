#!/usr/bin/env bash
# 重跑插件线的全部实演。dsh 克隆需已 pnpm install && pnpm run build。
# 跑项目代码的进程一律 env -i，不带任何密钥。
set -euo pipefail
cd "$(dirname "$0")"
DSH_ROOT=${DSH_ROOT:-/tmp/dsh-src/deepseek-harness}
run() { env -i HOME="$HOME" PATH="$PATH" DSH_ROOT="$DSH_ROOT" node --import ./resolve-hook.mjs "$1" > "txt/${1%.mjs}.txt" 2>&1; }
for s in reversible seam intercept factory scope preset; do run "$s.mjs"; done

# dsh --dump-config：临时 DSH_HOME，先 dump 一次 web 和 sdk-minimal，再放入构造的用户 patch 重 dump
H=$(mktemp -d)
dsh() { (cd /tmp && env -i HOME="$HOME" PATH="$PATH" DSH_HOME="$H" node "$DSH_ROOT/apps/cli/lib/bin.js" "$@"); }
dsh --profile sdk-minimal --dump-config > out/dump-sdk-minimal.yml
dsh --profile web --dump-config > out/dump-web.yml
cp user.patch.yml "$H/profiles/web/cordis.patch.yml"
dsh --profile web --dump-config > out/dump-web-patched.yml 2> /tmp/dump-web-patched.err
{ sed "s#$H#\$DSH_HOME#g" /tmp/dump-web-patched.err; echo; diff out/dump-web.yml out/dump-web-patched.yml | sed "s#$H#\$DSH_HOME#g" || true; } > txt/user-patch-diff.txt
sed -i "s#$H#\$DSH_HOME#g" out/dump-web-patched.yml
sed -n 385,398p out/dump-web.yml > txt/dump-web-rows.txt
