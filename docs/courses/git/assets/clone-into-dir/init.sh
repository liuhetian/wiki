#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 0-0-1）
source "$(dirname "$0")/../lib.sh"
course_setup clone-into-dir

TARGET_DIR="$ROOT/work/projects/cal-review"

# 清理旧环境
# 预创建 projects 目录，模拟公司已有的项目结构
mkdir -p "$ROOT/work/projects"

# 初始化远程裸仓库
REMOTE=$(new_bare cal)

# 构造初始提交（多个文件，模拟真实项目）
tmp_init "$REMOTE"
as maintainer

cat > README.md <<'EOF'
# cal

公司内部计算器项目。

## 目录结构

- `calc.py` — 核心计算模块
- `tests/` — 测试用例
- `docs/` — 项目文档
EOF

cat > calc.py <<'EOF'
def add(a, b):
    return a + b

def sub(a, b):
    return a - b
EOF

mkdir -p tests
cat > tests/test_calc.py <<'EOF'
from calc import add, sub

def test_add():
    assert add(1, 2) == 3

def test_sub():
    assert sub(5, 3) == 2
EOF

mkdir -p docs
cat > docs/guide.md <<'EOF'
# 开发指南

代码提交前请先运行测试。
EOF

git add .
git commit -m "Initial commit: bootstrap cal project with tests and docs"

git push origin main
tmp_done

# 移交权限

summary "$ROOT/work"
