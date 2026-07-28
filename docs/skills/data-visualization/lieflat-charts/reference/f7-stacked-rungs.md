# F7 · 堆叠梯级柱

<iframe src="/skills/data-visualization/lieflat-charts/assets/f7-stacked-rungs.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="F7 堆叠梯级柱：各地区收入由什么构成"></iframe>

堆叠构成（≤4 类 × ≤3 段）的 **Lupi Basics** 真实参考实现。示例结论为“各地区收入由什么构成”，副标题已经把图例、单位或时间口径写在图旁：一根横档代表 $1k · 三种产品沿同一梯子堆叠 · 最深灰阶承载最大份额

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 堆叠构成（≤4 类 × ≤3 段） |
| 场合 | 年报/复盘 |
| 读者时间 | ~30s |
| 渲染引擎 | SVG |
| 交互与动效 | 滚入视野播放，点击图表重播；数据点带浏览器原生提示 |
| 示例来源行 | `STACKED RUNGS · MONO-BASIC · REVENUE MIX` |

## 实现与使用边界

- 页面直接复用 gallery 中 “Where each region's revenue sits” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“堆叠构成（≤4 类 × ≤3 段）”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `F7 Stacked Rungs`，真实骨架取自 [`templates/basics-gallery.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/basics-gallery.html) 的 “Where each region's revenue sits” 卡片与对应渲染块。

??? abstract "`f7-stacked-rungs.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/f7-stacked-rungs.html"
    ```
