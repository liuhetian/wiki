// ```echarts 代码块渲染器：页面上有图才动态加载本地 ECharts 真身，无图页面零开销。
// fence 由 pymdownx.superfences 输出为 <pre class="echarts"><code>{option JSON}</code></pre>，
// JSON 顶层可带 "height"（像素，默认 320），其余原样交给 setOption。
// 图表可能藏在未激活的 tab 里（初始化时宽度为 0），靠 ResizeObserver 在可见时补一次 resize。
// 字体：ECharts 把 font-family 写成 SVG text 的内联属性（默认 sans-serif），外部 CSS 管不到，
// 所以从 body 上读全站字体栈注入 option.textStyle（全局默认，fence 里显式写的以它为准）。
// --md-text-font-family 是 Zensical 定义在 body 而非 :root 上的，别改成读 documentElement。
(function () {
  function siteFont() {
    return getComputedStyle(document.body)
      .getPropertyValue("--md-text-font-family")
      .trim();
  }

  function render() {
    var blocks = document.querySelectorAll("pre.echarts");
    if (!blocks.length) return;
    var font = siteFont();
    var charts = [];
    var script = document.createElement("script");
    script.src = "/vendor/echarts/echarts.min.js";
    script.onload = function () {
      blocks.forEach(function (pre) {
        var option;
        try {
          option = JSON.parse(pre.textContent);
        } catch (e) {
          console.error("echarts fence JSON 解析失败:", e, pre);
          return;
        }
        var height = option.height || 320;
        delete option.height;
        var div = document.createElement("div");
        div.className = "echarts-chart";
        div.style.height = height + "px";
        pre.replaceWith(div);
        if (font) option.textStyle = Object.assign({ fontFamily: font }, option.textStyle);
        var chart = echarts.init(div, null, { renderer: "svg" });
        chart.setOption(option);
        charts.push(chart);
        new ResizeObserver(function () {
          chart.resize();
        }).observe(div);
      });
      // 标签布局是按当时可用的字体量出来的。中文子集 ~1MB，首屏往往还没到，
      // 先出图、字体到位后统一 resize 重排一次，比阻塞等字体更划算
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          charts.forEach(function (c) {
            c.resize();
          });
        });
      }
    };
    document.head.appendChild(script);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
