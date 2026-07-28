# B1 · 密集环形关系图

<iframe src="/skills/data-visualization/lieflat-charts/assets/b1-circular-graph-dense.html"
        style="width:100%;height:760px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="B1 密集环形关系图：六百次协作，汇成一环"></iframe>

网络 60 节点环形弦膜的 **Interactive Big Chart** 真实参考实现。示例结论为“六百次协作，汇成一环”，副标题已经把图例、单位或时间口径写在图旁：60 个代码仓库 · 连线代表共享贡献者 · 悬停仓库可聚焦其关系 · 点击重播

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 网络 60 节点环形弦膜 |
| 场合 | 大型关系图、代码协作网络 |
| 读者时间 | 交互探索 |
| 渲染引擎 | ECharts |
| 交互与动效 | hover 聚焦邻接，点击重播 |
| 示例来源行 | `CIRCULAR GRAPH · DENSE · SOURCE · GIT LOG` |

## 实现与使用边界

- 页面直接复用 gallery 中 “Six hundred collaborations, one ring” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“网络 60 节点环形弦膜”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `B1 Circular Graph Dense`，真实骨架取自 [`templates/big-circular.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/big-circular.html) 的 “Six hundred collaborations, one ring” 卡片与对应渲染块。

??? abstract "`b1-circular-graph-dense.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/b1-circular-graph-dense.html"
    ```
