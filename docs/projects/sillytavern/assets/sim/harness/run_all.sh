#!/usr/bin/env bash
# 统一重跑：生成桩 → 扮演主线（调模型）→ 群聊（调模型）→ 不调模型的实验。输出在 ../out/。
set -euo pipefail
cd "$(dirname "$0")"
export ST_ROOT=${ST_ROOT:-/data2/work/lht/study/26.06/_ext/st/SillyTavern}
node make-stubs.mjs
rm -rf ../out/main ../out/group ../out/lorebook ../out/assembly ../out/adapt ../out/branch ../out/rules
python3 run_main.py
python3 run_memory.py
python3 run_group.py
for exp in exp_lorebook exp_card_assembly exp_adapt exp_branch exp_group exp_rules; do
    node --import ./register.mjs "$exp.mjs"
done
echo ALL DONE
