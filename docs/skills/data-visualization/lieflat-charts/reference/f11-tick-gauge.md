# F11 · 刻线进度表

<iframe src="/skills/data-visualization/lieflat-charts/assets/f11-tick-gauge.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="F11 刻线进度表：距离本季度目标还有多远"></iframe>

单值进度（0–100%）的 **Lupi Basics** 真实参考实现。示例结论为“距离本季度目标还有多远”，副标题已经把图例、单位或时间口径写在图旁：一根刻线代表目标的 1% · 着墨部分代表已经完成 · 表盘从左向右阅读

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 单值进度（0–100%） |
| 场合 | 汇报开场 |
| 读者时间 | <10s |
| 渲染引擎 | SVG |
| 交互与动效 | 滚入视野播放，点击图表重播；数据点带浏览器原生提示 |
| 示例来源行 | `TICK GAUGE · MONO-BASIC · QUARTERLY TARGET` |

## 实现与使用边界

- 页面直接复用 gallery 中 “How far to the quarter's goal” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“单值进度（0–100%）”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `F11 Tick Gauge`，真实骨架取自 [`templates/basics-gallery.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/basics-gallery.html) 的 “How far to the quarter's goal” 卡片与对应渲染块。

??? abstract "`f11-tick-gauge.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/f11-tick-gauge.html"
    ```
