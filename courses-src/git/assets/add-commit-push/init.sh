#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 0-1-0）
source "$(dirname "$0")/../lib.sh"
course_setup add-commit-push

WORK="$ROOT/work/cal"

# 清理旧环境

# 初始化远程裸仓库
REMOTE=$(new_bare cal)

# 构造初始提交（项目骨架，calc.py 只有 sub 函数）
tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# cal

公司内部计算器项目。

## 任务

请实现 calc.py 中的 add 函数。
EOF

cat > calc.py <<'EOF'
def sub(a, b):
    return a - b
EOF

git add README.md calc.py
git commit -m "Initial commit: bootstrap cal project"
git push origin main
tmp_done

# 移交权限

# 代码已经替你拉下来了
work_clone "$REMOTE"

# 以学生身份配置 git 信息
bash -c "cd '$WORK' && git config user.email 'you@example.com' && git config user.name 'you'"

# 你已经写好了 add 函数（改的是 calc.py）
cat > "$WORK/calc.py" <<'PYEOF'
def sub(a, b):
    return a - b

def add(a, b):
    return a + b
PYEOF

summary "$WORK" \
    "远程仓库：$REMOTE" \
    "calc.py 已经改好了，把这次改动提交并推到远程。"
