#!/usr/bin/env bash
# 课程环境冒烟测试：把每个 init.sh 各跑两遍（第二遍验证「可重复运行」这条硬规矩），
# 任一非零退出即失败。只在改 courses-src/git/assets/ 下的脚本时跑 —— 那 33 课 Git 课程
# 2026-09-17 下线，init.sh 真身跟参考解法一起留在不发布的 courses-src/ 等重做。
# 只有环境类的课需要这道冒烟；教材伴读那种数据类的课没有 init.sh，不走这里。
#
#   bash scripts/course-smoke.sh            # 全部 33 课
#   bash scripts/course-smoke.sh <slug>...  # 只跑指定的几课
set -uo pipefail
cd "$(dirname "$0")/.."
ASSETS=courses-src/git/assets
export COURSE_ROOT="${COURSE_ROOT:-$(mktemp -d)/courses}"

if [ $# -gt 0 ]; then slugs=("$@"); else mapfile -t slugs < <(ls "$ASSETS" | grep -v '^lib.sh$'); fi

fail=0
for slug in "${slugs[@]}"; do
    for pass in 1 2; do
        if ! out=$(bash "$ASSETS/$slug/init.sh" 2>&1); then
            echo "✗ $slug（第 $pass 遍）"
            echo "$out" | tail -12 | sed 's/^/    /'
            fail=$((fail + 1))
            break
        fi
    done
done

echo
if [ "$fail" -gt 0 ]; then
    echo "课程环境冒烟未通过：$fail / ${#slugs[@]} 课跑不起来"
    echo "  → 环境留在 $COURSE_ROOT 供排查"
    exit 1
fi
echo "✅ 课程环境冒烟通过 —— ${#slugs[@]} 课各跑两遍都能重建"
rm -rf "$COURSE_ROOT"
