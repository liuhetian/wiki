#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 0-1-2）
source "$(dirname "$0")/../lib.sh"
course_setup discard-changes-gitignore

WORK="$ROOT/work/cal"

# 清理旧环境

# 初始化远程裸仓库
REMOTE=$(new_bare cal)

# 构造初始提交
tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# cal

公司内部计算器项目。

## 模块说明

- `calc.py` — 核心计算模块
- `config.py` — 配置加载模块
EOF

cat > calc.py <<'EOF'
def sub(a, b):
    return a - b
EOF

cat > config.py <<'EOF'
import os

def load_config():
    """从环境变量加载配置"""
    return {
        "debug": os.getenv("DEBUG", "false"),
        "db_host": os.getenv("DB_HOST", "localhost"),
    }
EOF

git add .
git commit -m "Initial commit: bootstrap cal project"
git push origin main
tmp_done

# 移交权限

# 克隆到用户空间
work_clone "$REMOTE"

# 以学生身份配置 git 信息
bash -c "cd '$WORK' && git config user.email 'you@example.com' && git config user.name 'you'"

# === 上午的正常开发工作 ===

# 1. 正常修改：在 calc.py 中添加了 add 和 divide 函数
cat > "$WORK/calc.py" <<'PYEOF'
def sub(a, b):
    return a - b

def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为零")
    return a / b
PYEOF

# 2. 新建测试文件
cat > "$WORK/test_calc.py" <<'PYEOF'
from calc import add, sub, divide

def test_add():
    assert add(1, 2) == 3

def test_sub():
    assert sub(5, 3) == 2

def test_divide():
    assert divide(10, 2) == 5.0

if __name__ == '__main__':
    test_add()
    test_sub()
    test_divide()
    print('All tests passed!')
PYEOF

# 3. 创建 .env 文件（包含敏感信息，不应提交）
cat > "$WORK/.env" <<'ENVEOF'
DEBUG=true
DB_HOST=192.168.1.100
DB_PASSWORD=s3cret_p@ssw0rd
API_KEY=sk-abc123def456ghi789
ENVEOF

# 4. 创建 __pycache__ 目录（不应提交）
mkdir -p "$WORK/__pycache__"
bash -c "echo 'binary cache data' > '$WORK/__pycache__/calc.cpython-311.pyc'"

# === 中午离开前把所有文件都 add 了（包括不该加的） ===
bash -c "cd '$WORK' && git add ."

# === 模拟中午午休脸趴键盘，在 config.py 里打了乱码 ===
cat > "$WORK/config.py" <<'PYEOF'
import os

def load_config():
    """从环境变量加载配置"""
    return {
        "debug": os.getenv("DEBUG", "false"),
        "db_host": os.getenv("DB_HOST", "localhost"),
    }

hjkl;asdf jkl;hjkl asdfghjkl;
fffffffffff jjjjjjjjjjjjj
kkkkkkkk llllllllll ;;;;;;;;
PYEOF

# 此时的状态：
# - calc.py: 已修改并 add（正确的修改，应该提交）
# - test_calc.py: 新文件已 add（正确，应该提交）
# - .env: 已 add（不应该提交，需要从暂存区移除）
# - __pycache__/: 已 add（不应该提交，需要从暂存区移除）
# - config.py: 已 add（暂存区里是正确版本），但工作区被乱码污染了（需要恢复工作区）

summary "$WORK" \
    "远程仓库：$REMOTE" \
    "有几个文件被键盘压出了乱码，暂存区里还混进了不该提交的东西。"
