#!/usr/bin/env bash
# 重跑 DeepTutor 细讲页的全部实跑：bash run_all.sh <DeepTutor 克隆路径>
# 克隆要 checkout 在 a31d826（v1.6.15）；脚本只读克隆、不改它，输出写回 ../out 和 ../txt。
# 都是纯函数，不调模型、不要密钥。-I 隔离用户环境，-B 不写 __pycache__（这个目录会随站点发布）。
set -euo pipefail
CLONE="${1:?用法：bash run_all.sh <DeepTutor 克隆路径>}"
HERE="$(cd "$(dirname "$0")" && pwd)"
WITH=(--with pydantic --with pyyaml --with json-repair --with jsonschema --with defusedxml --with httpx)
fail=0
for f in "$HERE"/[a-z]*_*.py; do
  name="$(basename "$f" .py)"
  if uv run --quiet "${WITH[@]}" python3 -I -B "$f" "$CLONE" >/dev/null 2>"/tmp/dt-sim-$name.err"; then
    echo "ok    $name"
  else
    echo "FAIL  $name（错误输出在 /tmp/dt-sim-$name.err）"
    fail=1
  fi
done
exit $fail
