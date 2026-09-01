#!/usr/bin/env bash
# 升级 vendor 版本用的工具（vendor 真身已经 git-lfs 入库，日常恢复靠 git 即可）：
# 改这里的版本号 → 跑一次 → commit，新版真身随 LFS 上桶
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

# Mermaid 11.17.1：```mermaid 图的渲染真身。Zensical 自带的加载器写死了 unpkg CDN，但只在
# window.mermaid 未定义时才去拉；overrides/main.html 在有 mermaid 块的页面里先同步引入本地真身，
# 加载器检测到全局已存在就不再出网（境内 unpkg 常超时 → 图整块空白）
mkdir -p docs/vendor/mermaid
curl -fsSL --max-time 180 -o docs/vendor/mermaid/mermaid.min.js \
  https://cdn.jsdelivr.net/npm/mermaid@11.17.1/dist/mermaid.min.js

# 字体（Maple Mono）不在这里：官方发布物是 zip，且中文字形要本地子集化，
# 升级流程独立一份 —— 见 scripts/build-fonts.py 的文件头注释。

echo "✅ vendor 真身已恢复"
