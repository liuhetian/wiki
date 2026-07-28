# G13 · 大切片图

<iframe src="/skills/data-visualization/lieflat-charts/assets/g13-big-slice.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="G13 大切片图：大份额带来深参与"></iframe>

双编码：占比(角)×强度(径)的 **Glance** 真实参考实现。示例结论为“大份额带来深参与”，副标题已经把图例、单位或时间口径写在图旁：角度代表用户占比 · 半径代表每日使用分钟数 · 虚线环标记 15、30、45 分钟

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 双编码：占比(角)×强度(径) |
| 场合 | 产品分析 |
| 读者时间 | ~30s |
| 渲染引擎 | ECharts custom |
| 交互与动效 | 滚入视野初始化，点击图表重播；保留原 gallery 的 tooltip 与动画 |
| 示例来源行 | `CUSTOM PIE · MONO-FANCY3 · PRODUCT ANALYTICS` |

## 实现与使用边界

- 页面直接复用 gallery 中 “Big slice, deep engagement” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“双编码：占比(角)×强度(径)”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `G13 Big Slice (Custom Pie)`，真实骨架取自 [`templates/glance-gallery.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/glance-gallery.html) 的 “Big slice, deep engagement” 卡片与对应渲染块。

??? abstract "`g13-big-slice.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/g13-big-slice.html"
    ```
