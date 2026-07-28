# G16 · 动态条形竞赛

<iframe src="/skills/data-visualization/lieflat-charts/assets/g16-bar-race.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="G16 动态条形竞赛：八款产品竞逐收入"></iframe>

排名随时间演变的 **Glance** 真实参考实现。示例结论为“八款产品竞逐收入”，副标题已经把图例、单位或时间口径写在图旁：各产品月度经常性收入，千美元 · 2019 → 2026 · 领先者使用炭黑 · 点击重播

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 排名随时间演变 |
| 场合 | 短视频 |
| 读者时间 | 动画 |
| 渲染引擎 | ECharts realtimeSort |
| 交互与动效 | 滚入视野初始化，点击图表重播；保留原 gallery 的 tooltip 与动画 |
| 示例来源行 | `BAR RACE · MONO-FANCY4 · BILLING` |

## 实现与使用边界

- 页面直接复用 gallery 中 “Eight products race” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“排名随时间演变”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `G16 Bar Race`，真实骨架取自 [`templates/glance-gallery.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/glance-gallery.html) 的 “Eight products race” 卡片与对应渲染块。

??? abstract "`g16-bar-race.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/g16-bar-race.html"
    ```
