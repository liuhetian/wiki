// MathJax 配置 + 按需加载器：页面上有公式才拉本地 MathJax 真身，无公式页面零开销。
// tex-svg.js 有 2MB，全站 300 多页里只有约 30 页写公式，无条件引入等于让绝大多数页面
// 白解析一遍（对应 vendor/echarts-init.js、overrides/main.html 里 mermaid 的按需思路）。
// pymdownx.arithmatex 的 generic 模式把公式包进 <span|div class="arithmatex">，
// 所以「这页有没有公式」在 DOM 里可直接查。
//
// window.MathJax 必须在真身加载前就位 —— 这里配置和加载写在同一个文件、配置在前，
// 天然满足顺序要求；mkdocs.yml 的 extra_javascript 也因此只需列这一个文件。
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

(function () {
  function load() {
    if (!document.querySelector(".arithmatex")) return;
    if (document.getElementById("mathjax-tex-svg")) return;
    var script = document.createElement("script");
    script.id = "mathjax-tex-svg";
    script.src = "/vendor/mathjax/tex-svg.js";
    script.async = true;
    document.head.appendChild(script);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
