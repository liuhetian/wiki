#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 0-1-1）
source "$(dirname "$0")/../lib.sh"
course_setup status-selective-add

WORK="$ROOT/work/cal"

# 清理旧环境

# 初始化远程裸仓库
REMOTE=$(new_bare cal)

# 构造初始提交（项目骨架）
tmp_init "$REMOTE"
as maintainer

cat > calc.py <<'EOF'
def sub(a, b):
    return a - b
EOF

git add calc.py
git commit -m "Initial commit: bootstrap cal project"
git push origin main
tmp_done

# 移交权限

# 克隆到用户空间
work_clone "$REMOTE"

# 以学生身份配置 git 信息
bash -c "cd '$WORK' && git config user.email 'you@example.com' && git config user.name 'you'"

# 你已经写完了开发工作，工作区里堆了好几个文件：
# 1. calc.py — 修改：添加了 add 和 multiply 函数（需要提交）
# 2. test_calc.py — 新增：测试文件（需要提交）
# 3. debug.log — 新增：调试日志（不应该提交）
# 4. __pycache__/calc.cpython-311.pyc — 新增：编译缓存（不应该提交）
# 5. README.md — 项目经理要求必须有 README（需要新建并提交）

cat > "$WORK/calc.py" <<'PYEOF'
def sub(a, b):
    return a - b

def add(a, b):
    return a + b

def multiply(a, b):
    return a * b
PYEOF

cat > "$WORK/test_calc.py" <<'PYEOF'
from calc import add, sub, multiply

def test_add():
    assert add(1, 2) == 3

def test_sub():
    assert sub(5, 3) == 2

def test_multiply():
    assert multiply(3, 4) == 12

if __name__ == '__main__':
    test_add()
    test_sub()
    test_multiply()
    print('All tests passed!')
PYEOF

# 调试日志文件（不应提交）
cat > "$WORK/debug.log" <<'LOGEOF'
[2024-03-15 14:32:01] DEBUG: Loading calc module
[2024-03-15 14:32:01] DEBUG: Running test_add... OK
[2024-03-15 14:32:02] DEBUG: Running test_sub... OK
[2024-03-15 14:32:02] DEBUG: Running test_multiply... OK
LOGEOF

# 编译缓存目录（不应提交）
mkdir -p "$WORK/__pycache__"
bash -c "echo 'binary cache data' > '$WORK/__pycache__/calc.cpython-311.pyc'"

summary "$WORK" \
    "远程仓库：$REMOTE" \
    "工作区里有好几处改动，但这次只该提交其中一部分；另外还缺一个 README.md。"
