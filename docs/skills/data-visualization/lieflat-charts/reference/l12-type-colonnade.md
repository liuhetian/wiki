# L12 · 归属柱廊图

<iframe src="/skills/data-visualization/lieflat-charts/assets/l12-type-colonnade.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="L12 归属柱廊图：44 个代码仓库，归属十位负责人"></iframe>

多对一归属+逐条名单（≤50 条）的 **Lupi Editorial** 真实参考实现。示例结论为“44 个代码仓库，归属十位负责人”，副标题已经把图例、单位或时间口径写在图旁：每根发丝线把代码仓库交给负责团队 · 线条堆叠显出未被正式画出的组织结构

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 多对一归属+逐条名单（≤50 条） |
| 场合 | 治理/审计报告 |
| 读者时间 | ~30s |
| 渲染引擎 | SVG |
| 交互与动效 | 滚入视野播放，点击图表重播；数据点带浏览器原生提示 |
| 示例来源行 | `TYPE COLONNADE · MONO-EDITORIAL2 · CODE OWNERSHIP` |

## 实现与使用边界

- 页面直接复用 gallery 中 “Forty-four repos, ten owners” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“多对一归属+逐条名单（≤50 条）”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `L12 Type Colonnade`，真实骨架取自 [`templates/lupi-gallery.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/lupi-gallery.html) 的 “Forty-four repos, ten owners” 卡片与对应渲染块。

??? abstract "`l12-type-colonnade.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/l12-type-colonnade.html"
    ```
