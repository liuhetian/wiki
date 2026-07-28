# G10 · 发散条形图

<iframe src="/skills/data-visualization/lieflat-charts/assets/g10-diverging-bar.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="G10 发散条形图：哪些细分增长，哪些流失"></iframe>

有正负的分类数值的 **Glance** 真实参考实现。示例结论为“哪些细分增长，哪些流失”，副标题已经把图例、单位或时间口径写在图旁：各细分市场净账户变化 · 2026 年第二季度 · 左侧为流失，右侧为增长

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 有正负的分类数值 |
| 场合 | 周报 dashboard |
| 读者时间 | <10s |
| 渲染引擎 | ECharts |
| 交互与动效 | 滚入视野初始化，点击图表重播；保留原 gallery 的 tooltip 与动画 |
| 示例来源行 | `DIVERGING BAR · MONO-FANCY2 · CRM` |

## 实现与使用边界

- 页面直接复用 gallery 中 “Where we gained, where we bled” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“有正负的分类数值”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `G10 Diverging Bar`，真实骨架取自 [`templates/glance-gallery.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/glance-gallery.html) 的 “Where we gained, where we bled” 卡片与对应渲染块。

??? abstract "`g10-diverging-bar.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/g10-diverging-bar.html"
    ```
