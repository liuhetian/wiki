# G12 · 错落波形图

<iframe src="/skills/data-visualization/lieflat-charts/assets/g12-stagger-wave.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="G12 错落波形图：五十个市场，汇成一道波"></iframe>

多类目分布（30–60 根）的 **Glance** 真实参考实现。示例结论为“五十个市场，汇成一道波”，副标题已经把图例、单位或时间口径写在图旁：各市场注册量 · 柱形依次入场 · 点击重播

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 多类目分布（30–60 根） |
| 场合 | 短视频入场 |
| 读者时间 | 动画 |
| 渲染引擎 | ECharts |
| 交互与动效 | 滚入视野初始化，点击图表重播；保留原 gallery 的 tooltip 与动画 |
| 示例来源行 | `STAGGER DELAY · MONO-FANCY2 · GROWTH` |

## 实现与使用边界

- 页面直接复用 gallery 中 “Fifty markets, one wave” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“多类目分布（30–60 根）”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `G12 Stagger Wave`，真实骨架取自 [`templates/glance-gallery.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/glance-gallery.html) 的 “Fifty markets, one wave” 卡片与对应渲染块。

??? abstract "`g12-stagger-wave.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/g12-stagger-wave.html"
    ```
