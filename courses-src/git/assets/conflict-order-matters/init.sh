#!/bin/bash
# 顺序敏感的合并冲突：dispatch 原本只有 deliver 一步，两边都在它之前插入了新步骤，
# 而且都插了 normalize —— 机械「两边都留」会留出一个重复调用。
source "$(dirname "$0")/../lib.sh"
course_setup conflict-order-matters

REMOTE=$(new_bare notifier-service)

# dispatch 的四个候选步骤，三份版本只差调用顺序
pipeline() {
    cat > notifier.py <<EOF
def validate_message(message):
    return bool(message.strip())


def normalize_message(message):
    return message.strip().replace("\n", " ")


def sign_message(message):
    return f"[signed]{message}"


def deliver_message(message):
    print(message)


def dispatch(message):
$(for step in "$@"; do echo "    $step(message)"; done)
EOF
}

# 1. 基线：dispatch 里只有一步 deliver
tmp_init "$REMOTE"
as maintainer
pipeline deliver_message
git add notifier.py
git commit -q -m "feat: initialize notifier pipeline"
git push -q origin main
tmp_done

# 2. 你把仓库克隆下来
work_clone "$REMOTE"
WORK="$ROOT/work/notifier-service"

# 3. 同事先一步推上去：发送前补了校验和整形
tmp_clone "$REMOTE"
as colleague
pipeline validate_message normalize_message deliver_message
git add notifier.py
git commit -q -m "feat: validate and normalize before delivery"
git push -q origin main
tmp_done

# 4. 你在本地提交：发送前补了整形和签名（还没 push）
#    两边都在 deliver 前插入，且都插了 normalize —— 冲突里机械「两边都留」会留出重复调用
cd "$WORK"
as you
pipeline normalize_message sign_message deliver_message
git add notifier.py
git commit -q -m "feat: normalize and sign before delivery"

summary "$WORK" \
    "远程仓库：$REMOTE" \
    "你有一条未推送的提交，同事也推了一条。先试试 git push 看会发生什么。"
