#!/bin/sh
# 用上游 native/system/packages/entry/src/main.c 原样编一个 Landlock 启动器。
# 发行版里是 musl 静态链接的预编译件；仓库构建没产出它，这里用本机 gcc 动态链接编同一份源码。
set -eu
R=/tmp/dsh-src/deepseek-harness
OUT=/tmp/dsh-lab/tools
mkdir -p "$OUT"
gcc -std=c11 -O2 -Wall -o "$OUT/landlock-run" "$R/native/system/packages/entry/src/main.c"
echo "built $OUT/landlock-run"
"$OUT/landlock-run" --probe
