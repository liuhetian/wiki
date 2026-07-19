#!/usr/bin/env bash
# 恢复不入 git 的重型 vendor 真身（版本钉死，与 mkdocs.yml extra_javascript 的引用一一对应）
set -euo pipefail
cd "$(dirname "$0")/.."

# MathJax 3.2.2：单文件 SVG 输出免字体文件，公式渲染真身
mkdir -p docs/vendor/mathjax
curl -fsSL --max-time 120 -o docs/vendor/mathjax/tex-svg.js \
  https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js

# ECharts 5.6.0：```echarts 代码块的图表真身（vendor/echarts-init.js 按需加载）
mkdir -p docs/vendor/echarts
curl -fsSL --max-time 120 -o docs/vendor/echarts/echarts.min.js \
  https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js

echo "✅ vendor 真身已恢复"
