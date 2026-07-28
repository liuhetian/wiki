# B3 · 三段丝线图

<iframe src="/skills/data-visualization/lieflat-charts/assets/b3-thread-triptych.html"
        style="width:100%;height:760px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="B3 三段丝线图：数据究竟流向哪里，现在可以查清了"></iframe>

三段路径 100+ 条丝线的 **Interactive Big Chart** 真实参考实现。示例结论为“数据究竟流向哪里，现在可以查清了”，副标题已经把图例、单位或时间口径写在图旁：来源 → 处理器 → 目的地 · 每条丝线代表一条数据路径 · 悬停追踪单条路径或整束关系 · 点击钉住，点击暗处解除

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 三段路径 100+ 条丝线 |
| 场合 | 多段流向、数据血缘 |
| 读者时间 | 交互探索 |
| 渲染引擎 | SVG |
| 交互与动效 | hover 单线或整束、点击钉住、状态栏读数 |
| 示例来源行 | `THREAD TRIPTYCH · INTERACTIVE · DATA MAP` |

## 实现与使用边界

- 页面直接复用 gallery 中 “Where the data actually goes — now answerable” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“三段路径 100+ 条丝线”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `B3 Thread Triptych`，真实骨架取自 [`templates/big-threads.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/big-threads.html) 的 “Where the data actually goes — now answerable” 卡片与对应渲染块。

??? abstract "`b3-thread-triptych.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/b3-thread-triptych.html"
    ```
