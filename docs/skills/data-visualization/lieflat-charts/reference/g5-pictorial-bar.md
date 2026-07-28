# G5 · 象形柱状图

<iframe src="/skills/data-visualization/lieflat-charts/assets/g5-pictorial-bar.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="G5 象形柱状图：每年种下多少棵树"></iframe>

逐年计数（一个符号=固定数量）的 **Glance** 真实参考实现。示例结论为“每年种下多少棵树”，副标题已经把图例、单位或时间口径写在图旁：植树造林计划 · 单位：千棵

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 逐年计数（一个符号=固定数量） |
| 场合 | 对外故事页 |
| 读者时间 | <10s |
| 渲染引擎 | ECharts |
| 交互与动效 | 滚入视野初始化，点击图表重播；保留原 gallery 的 tooltip 与动画 |
| 示例来源行 | `PICTORIAL BAR · MONO-FANCY · GREEN OPS` |

## 实现与使用边界

- 页面直接复用 gallery 中 “Trees planted, year by year” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“逐年计数（一个符号=固定数量）”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `G5 Pictorial Bar`，真实骨架取自 [`templates/glance-gallery.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/glance-gallery.html) 的 “Trees planted, year by year” 卡片与对应渲染块。

??? abstract "`g5-pictorial-bar.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/g5-pictorial-bar.html"
    ```
