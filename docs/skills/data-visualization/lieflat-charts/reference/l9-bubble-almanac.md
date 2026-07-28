# L9 · 气泡年鉴

<iframe src="/skills/data-visualization/lieflat-charts/assets/l9-bubble-almanac.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="L9 气泡年鉴：八年工单，汇成一本年鉴"></iframe>

分类×年份+量+状态，大跨度（手绘 blob）的 **Lupi Editorial** 真实参考实现。示例结论为“八年工单，汇成一本年鉴”，副标题已经把图例、单位或时间口径写在图旁：气泡面积代表各产品领域每年的客服工单量 · 年份堆叠时气泡相互覆盖 · 深色内核代表升级事件 · 虚线环代表仍处于测试阶段

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 分类×年份+量+状态，大跨度（手绘 blob） |
| 场合 | 年报（带旁注/大事记） |
| 读者时间 | >30s |
| 渲染引擎 | SVG（通栏） |
| 交互与动效 | 滚入视野播放，点击图表重播；数据点带浏览器原生提示 |
| 示例来源行 | `BUBBLE ALMANAC · MONO-EDITORIAL2 · SUPPORT DESK` |

## 实现与使用边界

- 页面直接复用 gallery 中 “Eight years of tickets, one almanac” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“分类×年份+量+状态，大跨度（手绘 blob）”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `L9 Bubble Almanac`，真实骨架取自 [`templates/lupi-gallery.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/lupi-gallery.html) 的 “Eight years of tickets, one almanac” 卡片与对应渲染块。

??? abstract "`l9-bubble-almanac.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/l9-bubble-almanac.html"
    ```
