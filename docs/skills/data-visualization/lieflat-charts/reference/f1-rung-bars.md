# F1 · 梯级柱状图

<iframe src="/skills/data-visualization/lieflat-charts/assets/f1-rung-bars.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px;background:#f0efeb"
        loading="lazy" title="F1 梯级柱状图：按方案比较月度经常性收入"></iframe>

少类目比较的 Lupi Basics 版本：远看保留柱状图剪影，近看柱身由一格格真实单位组成。点击图表可以重播入场动画。

## 数据契约

- **数据形状**：2–8 个类目的非负数值比较
- **场合**：年报、故事页、产品复盘
- **阅读时间**：约 30 秒
- **视觉编码**：柱高与数值成正比；一根横档 = 一个 `$1k MRR`
- **适用边界**：数值必须能拆成读者理解的诚实单位；极端值不使用断轴

## 模板要点

- 柱身不是实心色块，而是一列可数的横档；每第五档用侧边小点辅助计数
- 横档宽度与透明度只做确定性微扰，刷新后保持一致
- 标题、副标题、图、来源行四件套固定；标题写结论，不写“柱状图”
- 颜色只使用纸灰、炭黑和中间灰阶，不使用渐变、阴影或装饰色
- 滚入视野才播放，点击重播；`prefers-reduced-motion` 下关闭动画

> 模板来源：Lieflat Charts `F1 Rung Bars`，真实骨架取自 [`templates/basics-gallery.html`](https://github.com/larashero3-dotcom/lieflat-charts/blob/e5b369de1d0d32637093ee62d60bd556cf2c1af4/templates/basics-gallery.html) 的 “Revenue by plan, rung by rung” 卡片与对应渲染块。

??? abstract "`f1-rung-bars.html` —— 自包含单页源码"

    ```html
    --8<-- "skills/data-visualization/lieflat-charts/assets/f1-rung-bars.html"
    ```
