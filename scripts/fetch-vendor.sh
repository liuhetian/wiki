#!/usr/bin/env bash
# 升级 vendor 版本用的工具（vendor 真身已经 git-lfs 入库，日常恢复靠 git 即可）：
# 改这里的版本号 → 跑一次 → commit，新版真身随 LFS 上桶
set -euo pipefail
cd "$(dirname "$0")/.."

# MathJax 3.2.2：单文件 SVG 输出免字体文件，公式渲染真身
mkdir -p docs/vendor/mathjax
curl -fsSL --max-time 120 -o docs/vendor/mathjax/tex-svg.js \
  https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js

# ECharts 6.1.0：```echarts 代码块的图表真身（vendor/echarts-init.js 按需加载），
# 也是 lieflat-charts 那 20 个 demo 的运行时 —— 它们原先各自引 jsdelivr 的 echarts@6，
# 统一收进这里后线上零 CDN；升级要同时看站内 fence 图和那批 demo
mkdir -p docs/vendor/echarts
curl -fsSL --max-time 120 -o docs/vendor/echarts/echarts.min.js \
  https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js

# Chart.js 4.5.1：lieflat-charts 里 18 个 demo 与 ECharts 混用的第二个图表运行时
# （同一页两个库各画各的，用来对比同一种图在两边的实现差异），只被那批 demo 引用
mkdir -p docs/vendor/chartjs
curl -fsSL --max-time 120 -o docs/vendor/chartjs/chart.umd.js \
  https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.js

# Mermaid 11.17.1：```mermaid 图的渲染真身。Zensical 自带的加载器写死了 unpkg CDN，但只在
# window.mermaid 未定义时才去拉；overrides/main.html 在有 mermaid 块的页面里先同步引入本地真身，
# 加载器检测到全局已存在就不再出网（境内 unpkg 常超时 → 图整块空白）
mkdir -p docs/vendor/mermaid
curl -fsSL --max-time 180 -o docs/vendor/mermaid/mermaid.min.js \
  https://cdn.jsdelivr.net/npm/mermaid@11.17.1/dist/mermaid.min.js

# 字体（Maple Mono）不在这里：官方发布物是 zip，且中文字形要本地子集化，
# 升级流程独立一份 —— 见 scripts/build-fonts.py 的文件头注释。

echo "✅ vendor 真身已恢复"
