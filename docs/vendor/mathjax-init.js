// MathJax 配置：只处理 arithmatex 包裹的节点（generic 模式输出 \(...\) / \[...\]），
// 必须先于 tex-svg.js 加载
window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex"
  }
};
