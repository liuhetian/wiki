# B2 · 密集力导向图

<iframe src="/skills/data-visualization/lieflat-charts/assets/b2-force-graph-dense.html"
        style="width:100%;height:760px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="B2 密集力导向图：一百八十项服务，自成星系"></iframe>

网络 180 节点力导向星系的 **Interactive Big Chart** 真实参考实现。示例结论为“一百八十项服务，自成星系”，副标题已经把图例、单位或时间口径写在图旁：8 个领域自行聚拢 · 节点代表调用量 · 拖动任意节点可观察网络回弹 · 点击空白处重播

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 网络 180 节点力导向星系 |
| 场合 | 大型服务网络、依赖关系 |
| 读者时间 | 交互探索 |
| 渲染引擎 | ECharts |
| 交互与动效 | 拖拽回弹、hover 聚焦 |
| 示例来源行 | `FORCE GRAPH · DENSE · SOURCE · SERVICE MESH` |

## 实现与使用边界

- 页面直接复用 gallery 中 “A galaxy of one hundred eighty services” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“网络 180 节点力导向星系”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `B2 Force Graph Dense`，真实骨架取自 [`templates/big-force.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/big-force.html) 的 “A galaxy of one hundred eighty services” 卡片与对应渲染块。

??? abstract "`b2-force-graph-dense.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/b2-force-graph-dense.html"
    ```
