# F2 · 发丝折线图

<iframe src="/skills/data-visualization/lieflat-charts/assets/f2-hairline-line.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="F2 发丝折线图：三十天注册量，一天不落"></iframe>

日序列（≤30 天，逐日读数）的 **Lupi Basics** 真实参考实现。示例结论为“三十天注册量，一天不落”，副标题已经把图例、单位或时间口径写在图旁：一个圆点代表一天 · 空心圆点代表周末 · 底部条码保留完整日历

## 技术档案

| 项目 | 约定 |
|---|---|
| 数据形状 | 日序列（≤30 天，逐日读数） |
| 场合 | 年报/故事页 |
| 读者时间 | ~30s |
| 渲染引擎 | SVG |
| 交互与动效 | 滚入视野播放，点击图表重播；数据点带浏览器原生提示 |
| 示例来源行 | `HAIRLINE LINE · MONO-BASIC · GROWTH` |

## 实现与使用边界

- 页面直接复用 gallery 中 “Thirty days of sign-ups” 的卡片结构和同名渲染块，没有按截图重新绘制。
- 标题、副标题、图形、来源行四件套保持原样；数据编码、比例关系、灰阶和动画节奏由原实现决定。
- 使用时只替换数据与文案，并保持“日序列（≤30 天，逐日读数）”这一数据契约；若数据本体改变，应回到总目录重新选型。
- 颜色限于 Mono 灰阶，面积编码继续使用平方根换算；柱长、位置与角度编码不得断轴或视觉夸大。

> 模板来源：Lieflat Charts `F2 Hairline Line`，真实骨架取自 [`templates/basics-gallery.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/basics-gallery.html) 的 “Thirty days of sign-ups” 卡片与对应渲染块。

??? abstract "`f2-hairline-line.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/f2-hairline-line.html"
    ```
