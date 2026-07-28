# L8 · 点阵空间矩阵

<iframe src="/skills/data-visualization/lieflat-charts/assets/l8-dotty-matrix.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="L8 点阵空间矩阵：四支小队，层层堆叠"></iframe>

多组×网格×量，等距堆叠的 **Lupi Editorial** 真实参考实现。示例结论为“四支小队，层层堆叠”，副标题已经把图例、单位或时间口径写在图旁：每个平面代表一支小队 · 6 × 6 周活动 · 圆点面积代表完成任务数

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 多组×网格×量，等距堆叠 |
| 场合 | 封面/海报（装饰强） |
| 读者时间 | ~30s |
| 渲染引擎 | SVG |
| 交互与动效 | 滚入视野播放，点击图表重播；数据点带浏览器原生提示 |
| 示例来源行 | `DOTTY MATRIX · MONO-EDITORIAL2 · SPRINT BOARD` |

## 实现与使用边界

- 页面直接复用 gallery 中 “Four squads, stacked in space” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“多组×网格×量，等距堆叠”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `L8 Dotty Matrix`，真实骨架取自 [`templates/lupi-gallery.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/lupi-gallery.html) 的 “Four squads, stacked in space” 卡片与对应渲染块。

??? abstract "`l8-dotty-matrix.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/l8-dotty-matrix.html"
    ```
