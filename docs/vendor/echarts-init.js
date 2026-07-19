// ```echarts 代码块渲染器：页面上有图才动态加载本地 ECharts 真身，无图页面零开销。
// fence 由 pymdownx.superfences 输出为 <pre class="echarts"><code>{option JSON}</code></pre>，
// JSON 顶层可带 "height"（像素，默认 320），其余原样交给 setOption。
// 图表可能藏在未激活的 tab 里（初始化时宽度为 0），靠 ResizeObserver 在可见时补一次 resize。
(function () {
  function render() {
    var blocks = document.querySelectorAll("pre.echarts");
    if (!blocks.length) return;
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
        var chart = echarts.init(div, null, { renderer: "svg" });
        chart.setOption(option);
        new ResizeObserver(function () {
          chart.resize();
        }).observe(div);
      });
    };
    document.head.appendChild(script);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
