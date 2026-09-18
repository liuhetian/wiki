#!/bin/bash
# TODO: 补一句这一课造的是什么现场（原关卡 0-0-3）
source "$(dirname "$0")/../lib.sh"
course_setup shallow-sparse-clone

WORK="$ROOT/work/palette-ai"

# 清理旧环境

# 初始化远程裸仓库
REMOTE=$(new_bare palette-ai)

# 构造一个有丰富历史和多目录结构的仓库
tmp_init "$REMOTE"
as maintainer

# === 第一次提交：项目骨架 ===
cat > README.md <<'EOF'
# Palette-AI

公司内部 AI 调色板项目，用深度学习实现自动配色方案生成。

## 目录结构

- `models/` — 模型定义与训练脚本
- `data/` — 数据处理和样本
- `frontend/` — Web 前端展示界面
- `docs/` — 项目文档
- `assets/` — 大型资源文件（图片素材库）
EOF

mkdir -p models data frontend/src frontend/public docs assets

cat > models/__init__.py <<'EOF'
# Palette-AI Models
EOF

cat > models/generator.py <<'EOF'
import torch
import torch.nn as nn

class PaletteGenerator(nn.Module):
    """根据输入图片生成配色方案"""
    def __init__(self, latent_dim=64):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(3 * 224 * 224, 512),
            nn.ReLU(),
            nn.Linear(512, latent_dim)
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 5 * 3)  # 5 colors, RGB
        )

    def forward(self, x):
        z = self.encoder(x.flatten(1))
        palette = self.decoder(z)
        return palette.view(-1, 5, 3)
EOF

cat > models/train.py <<'EOF'
from generator import PaletteGenerator

def train():
    model = PaletteGenerator()
    print("Training Palette Generator...")
    # TODO: training loop

if __name__ == "__main__":
    train()
EOF

cat > data/preprocess.py <<'EOF'
"""数据预处理脚本"""

def load_images(path):
    """加载图片数据"""
    pass

def extract_colors(image, n_colors=5):
    """从图片中提取主色调"""
    pass
EOF

cat > frontend/src/App.js <<'EOF'
import React from 'react';

function App() {
    return (
        <div className="palette-app">
            <h1>Palette AI</h1>
            <p>Upload an image to generate a color palette</p>
        </div>
    );
}

export default App;
EOF

cat > frontend/package.json <<'EOF'
{
  "name": "palette-ai-frontend",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0"
  }
}
EOF

cat > docs/architecture.md <<'EOF'
# 架构设计

## 模型架构

Encoder-Decoder 结构，输入图片编码为潜在向量，解码为 5 色调色板。

## 数据流

图片 → 预处理 → 模型推理 → 配色方案 → 前端展示
EOF

# 生成大型资源文件（模拟大仓库）
for i in $(seq 1 20); do
    dd if=/dev/urandom bs=1024 count=50 2>/dev/null | base64 > "assets/sample_${i}.dat"
done

git add .
git commit -m "Initial commit: Palette-AI project skeleton"

# === 第二次提交：模型改进 ===
cat > models/discriminator.py <<'EOF'
import torch.nn as nn

class PaletteDiscriminator(nn.Module):
    """判断配色方案是否美观"""
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(5 * 3, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )

    def forward(self, palette):
        return self.net(palette.flatten(1))
EOF
git add models/discriminator.py
git commit -m "feat: add discriminator for palette quality scoring"

# === 第三次提交：数据管道 ===
cat > data/pipeline.py <<'EOF'
"""数据处理管道"""

class DataPipeline:
    def __init__(self, batch_size=32):
        self.batch_size = batch_size

    def process(self, raw_data):
        # 批量处理逻辑
        pass
EOF
git add data/pipeline.py
git commit -m "feat: add data processing pipeline"

# === 第四次提交：前端更新 ===
cat > frontend/src/ColorPicker.js <<'EOF'
import React from 'react';

function ColorPicker({ colors }) {
    return (
        <div className="color-picker">
            {colors.map((c, i) => (
                <div key={i} style={{ backgroundColor: c }} className="color-swatch" />
            ))}
        </div>
    );
}

export default ColorPicker;
EOF
git add frontend/src/ColorPicker.js
git commit -m "feat: add ColorPicker component"

# === 第五次提交：文档更新 ===
cat > docs/api.md <<'EOF'
# API 文档

## POST /api/generate

上传图片，返回配色方案。

### 请求

- Content-Type: multipart/form-data
- Body: image file

### 响应

```json
{
  "colors": ["#FF5733", "#33FF57", "#3357FF", "#F0F033", "#FF33F0"]
}
```
EOF
git add docs/api.md
git commit -m "docs: add API documentation"

# === 第六次提交：灵感笔记（关键历史记录） ===
cat > models/creative_notes.md <<'EOF'
# 灵感笔记

## 色彩即音乐

如果把 RGB 映射成音阶，配色方案就是一段和弦。
和谐的配色 = 和谐的和弦进行。

## 下一步

尝试用音乐理论中的和弦进行规则来约束配色生成器的输出空间。
这可能是 GAN 的 loss function 里一个有趣的正则项。
EOF
git add models/creative_notes.md
git commit -m "notes: 色彩音乐理论灵感 (重要参考)"

# === 第七次提交：更多资源 ===
for i in $(seq 21 40); do
    dd if=/dev/urandom bs=1024 count=50 2>/dev/null | base64 > "assets/sample_${i}.dat"
done
git add assets/
git commit -m "assets: add more sample data files"

# === 推送 ===
git push origin main
tmp_done

# 移交权限

summary "$WORK" \
    "远程仓库：$REMOTE"
