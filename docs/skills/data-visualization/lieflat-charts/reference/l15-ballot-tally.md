# L15 · 选票刻线图

<iframe src="/skills/data-visualization/lieflat-charts/assets/l15-ballot-tally.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="L15 选票刻线图：他们害怕什么，一票一划"></iframe>

多选题百分比（各项独立 0–100），≤6 项的 **Lupi Editorial** 真实参考实现。示例结论为“他们害怕什么，一票一划”，副标题已经把图例、单位或时间口径写在图旁：一根刻线代表一百位受访者中的一人 · 着墨表示选择该项 · 每人可以多选

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 多选题百分比（各项独立 0–100），≤6 项 |
| 场合 | 年报/故事页 |
| 读者时间 | ~30s |
| 渲染引擎 | SVG |
| 交互与动效 | 滚入视野播放，点击图表重播；数据点带浏览器原生提示 |
| 示例来源行 | `BALLOT TALLY · MONO-SMALL · WORKPLACE SURVEY` |

## 实现与使用边界

- 页面直接复用 gallery 中 “What they fear, tick by tick” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“多选题百分比（各项独立 0–100），≤6 项”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `L15 Ballot Tally`，真实骨架取自 [`templates/lupi-gallery.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/lupi-gallery.html) 的 “What they fear, tick by tick” 卡片与对应渲染块。

??? abstract "`l15-ballot-tally.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/l15-ballot-tally.html"
    ```
