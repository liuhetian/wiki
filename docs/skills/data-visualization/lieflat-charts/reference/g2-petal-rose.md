# G2 · 花瓣玫瑰图

<iframe src="/skills/data-visualization/lieflat-charts/assets/g2-petal-rose.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="G2 花瓣玫瑰图：每次发布带来的情绪"></iframe>

单变量分类计数，≤8 类且近似等分的 **Glance** 真实参考实现。示例结论为“每次发布带来的情绪”，副标题已经把图例、单位或时间口径写在图旁：复盘中标记的情绪反应 · 2026 年上半年

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 单变量分类计数，≤8 类且近似等分 |
| 场合 | 门面/封面 |
| 读者时间 | <10s |
| 渲染引擎 | ECharts（暗卡） |
| 交互与动效 | 滚入视野初始化，点击图表重播；保留原 gallery 的 tooltip 与动画 |
| 示例来源行 | `PETAL ROSE · MONO-DEMO · TEAM RETRO BOARD` |

## 实现与使用边界

- 页面直接复用 gallery 中 “How releases made us feel” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“单变量分类计数，≤8 类且近似等分”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `G2 Petal Rose`，真实骨架取自 [`templates/glance-gallery.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/glance-gallery.html) 的 “How releases made us feel” 卡片与对应渲染块。

??? abstract "`g2-petal-rose.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/g2-petal-rose.html"
    ```
