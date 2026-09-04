#!/bin/bash
# 一次克隆要同时拿对三样东西：非默认分支、子模块内容、以及子模块自己的历史。
# 原关卡 0-0-2 还要求先配 SSH 才连得上，那部分依赖 sshd 与 root，本地跑不了，
# 已经去掉 —— 考点收敛到「一条 clone 命令要带哪些参数」。
source "$(dirname "$0")/../lib.sh"
course_setup clone-branch-submodule

SUB=$(new_bare starnet-utils)
REMOTE=$(new_bare starnet)
# git 2.38.1 起默认禁止子模块走 file:// 协议（CVE-2022-39253）。
# 课程的远程本来就是本地裸仓库，这里在沙箱配置里放行 —— 所以这一课必须先 source env.sh。
git config --global protocol.file.allow always
WORK="$ROOT/work/starnet"

# 1. 子模块仓库：公共工具库
tmp_init "$SUB"
as maintainer
cat > utils.py <<'EOF'
import numpy as np

def normalize(data):
    """归一化处理"""
    return (data - np.min(data)) / (np.max(data) - np.min(data) + 1e-8)

def split_dataset(data, ratio=0.8):
    """按比例划分数据集"""
    n = int(len(data) * ratio)
    return data[:n], data[n:]
EOF
cat > README.md <<'EOF'
# starnet-utils

StarNet 项目的公共工具库，提供数据预处理和通用辅助函数。
EOF
git add .
git commit -m "Initial commit: add utility functions"
git push origin main
tmp_done

# 2. 主仓库：main 是稳定版，dev 才有训练脚本；utils/ 是子模块
tmp_init "$REMOTE"
as maintainer
cat > README.md <<'EOF'
# StarNet

公司内部星图网络识别项目。

## 子模块

- `utils/` — 公共工具库 (starnet-utils)

## 分支说明

- `main` — 稳定版本
- `dev` — 开发分支，训练脚本只在这里
EOF
cat > model.py <<'EOF'
import torch
import torch.nn as nn

class StarNet(nn.Module):
    def __init__(self, input_dim=128, hidden_dim=256, output_dim=10):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, output_dim)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        return self.fc2(x)
EOF
git -c protocol.file.allow=always submodule add -q "$SUB" utils
git add .
git commit -m "Initial commit: StarNet project with utils submodule"

git checkout -q -b dev
cat > train.py <<'EOF'
from model import StarNet
from utils.utils import normalize, split_dataset

def train():
    print("Training StarNet on dev branch...")
    # TODO: implement training loop

if __name__ == "__main__":
    train()
EOF
git add train.py
git commit -m "dev: add training script skeleton"
git push -q origin main
git push -q origin dev
tmp_done

summary "$ROOT/work" \
    "远程仓库：$REMOTE" \
    "要的是 dev 分支上的代码，而且 utils/ 里必须有真实文件（不是空目录）。" \
    "克隆到 $ROOT/work 下，一条命令拿全。"
