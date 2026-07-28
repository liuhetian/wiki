# Lieflat Charts

一套**从数据形状出发的选图方法与真实模板**：单色、编辑感、可阅读。这里收录 48 张图，每张都有可运行效果、技术档案、使用边界和完整 HTML 源码。

与 [Dashboard 后台的图表页](../../dashboard/reference/详情与页面/图表页.md) 不同：dashboard 关心后台总览的功能契约；Lieflat Charts 关心一张图如何诚实编码数据、如何在几秒或几十秒内被读懂，以及怎样保持一致的 Mono 视觉语言。

规范真身独立维护在 [lieflat-charts 仓库](https://github.com/larashero3-dotcom/lieflat-charts/tree/e5b369de1d0d32637093ee62d60bd556cf2c1af4)；本目录把固定版本的真实 gallery 实现拆成可逐张浏览、可直接取用的 Wiki 页面。

## 怎么看这套目录

每个图型都按同一个结构收录：

1. iframe 里的真实效果，可点击或交互；
2. 数据形状、场合、阅读时间与渲染引擎；
3. 编码契约和使用边界；
4. 可展开、复制的完整 HTML 源码。

选图默认按 **Lupi Editorial → Lupi Basics → Glance** 的顺序。独立交互大图只在节点或路径规模超过小图边界时使用。

## 图型目录

### 基础型 · Lupi Basics

基础图型剪影保留熟悉的读法，近看仍能逐单位阅读。

- [F1 · 梯级柱状图](reference/f1-rung-bars.md) —— 少类目比较（≤8），单位可数
- [F2 · 发丝折线图](reference/f2-hairline-line.md) —— 日序列（≤30 天，逐日读数）
- [F3 · 发丝面积图](reference/f3-hairline-area.md) —— 日序列（30–60 天，看形态）
- [F4 · 刻线环形图](reference/f4-tick-donut.md) —— 100% 构成（≤6 段）
- [F5 · 刻线横条图](reference/f5-tick-rows.md) —— 横向排名比较，单位可数（≤8 行）
- [F6 · 并列梯级柱](reference/f6-paired-rungs.md) —— 分组对比（每类 2 系列，如今昔）
- [F7 · 堆叠梯级柱](reference/f7-stacked-rungs.md) —— 堆叠构成（≤4 类 × ≤3 段）
- [F8 · 铅垂散点图](reference/f8-plumb-scatter.md) —— 二维散点（≤20 点）
- [F9 · 梯级瀑布图](reference/f9-rung-waterfall.md) —— 瀑布 / 增减分解（≤6 级）
- [F10 · 点阵热力图](reference/f10-dot-heat.md) —— 星期×小时×量（小热力）
- [F11 · 刻线进度表](reference/f11-tick-gauge.md) —— 单值进度（0–100%）
- [F12 · 串珠哑铃图](reference/f12-dumbbell-queue.md) —— 类目级前后对比（≤6 类，串珠=真单位）

### 编辑型 · Lupi Editorial

发丝线与逐记录结构适合年报、故事页和需要停留阅读的场合。

- [L1 · 上线扇形图](reference/l1-launch-fan.md) —— 多实体各带出生时间+当前规模
- [L2 · 点阵级联图](reference/l2-dot-cascade.md) —— 排名比较，可数单位（unit chart）
- [L3 · 条码棒棒糖图](reference/l3-barcode-lollipop.md) —— 每天一个读数的日序列（90 天级）
- [L4 · 弧形矩阵](reference/l4-arc-matrix.md) —— 分类×分类+量，小数据（≤100 格）
- [L5 · 径向汇聚图](reference/l5-radial-convergence.md) —— 多对一归属，不丢明细（≤60 条）
- [L6 · 贡献者星群](reference/l6-cluster-field.md) —— 中心+卫星网络，海报版
- [L7 · 品牌光谱](reference/l7-brand-spectrum.md) —— 双极量表（两端都是合法位置）+ 竞品对照
- [L8 · 点阵空间矩阵](reference/l8-dotty-matrix.md) —— 多组×网格×量，等距堆叠
- [L9 · 气泡年鉴](reference/l9-bubble-almanac.md) —— 分类×年份+量+状态，大跨度（手绘 blob）
- [L10 · 径向拼布图](reference/l10-radial-patchwork.md) —— 逐事件叠加：时刻(角)×规模(径)，透明度=密度
- [L11 · 趋势谱系图](reference/l11-trend-lineage.md) —— 事件序列生命史（首发/重做/休眠/存活）
- [L12 · 归属柱廊图](reference/l12-type-colonnade.md) —— 多对一归属+逐条名单（≤50 条）
- [L13 · 沙漏流图](reference/l13-hourglass-stream.md) —— 分阶段递减人数（漏斗）
- [L14 · 百人点阵](reference/l14-hundred-field.md) —— 100% 构成（占比），≤6 类小数据
- [L15 · 选票刻线图](reference/l15-ballot-tally.md) —— 多选题百分比（各项独立 0–100），≤6 项

### 快读型 · Glance

为 dashboard、周报、监控和三秒快读准备；只有前两组不适配时才默认使用。

- [G1 · 区间胶囊图](reference/g1-range-capsules.md) —— 每天一个区间（min–max）的日序列
- [G2 · 花瓣玫瑰图](reference/g2-petal-rose.md) —— 单变量分类计数，≤8 类且近似等分
- [G3 · 粗体柱状图](reference/g3-chunky-bars.md) —— 少类目排名比较（≤6）
- [G4 · 点阵华夫图](reference/g4-dot-waffle.md) —— 100% 构成（占比）
- [G5 · 象形柱状图](reference/g5-pictorial-bar.md) —— 逐年计数（一个符号=固定数量）
- [G6 · 小型环形关系图](reference/g6-circular-graph.md) —— 网络，≤12 节点
- [G7 · 左右树状图](reference/g7-tree-lr.md) —— 层级结构（2–3 层）
- [G8 · 雨幕双面积图](reference/g8-rainfall-dual-area.md) —— 双序列因果（投入 vs 产出）
- [G9 · 散点变形图](reference/g9-scatter-morph.md) —— 同一实体集的三个维度轮播
- [G10 · 发散条形图](reference/g10-diverging-bar.md) —— 有正负的分类数值
- [G11 · 小型力导向图](reference/g11-force-graph.md) —— 中心+卫星网络，≤15 节点
- [G12 · 错落波形图](reference/g12-stagger-wave.md) —— 多类目分布（30–60 根）
- [G13 · 大切片图](reference/g13-big-slice.md) —— 双编码：占比(角)×强度(径)
- [G14 · 单轴图](reference/g14-single-axis.md) —— 星期×小时×量（punch card 数据）
- [G15 · 抖动条带图](reference/g15-jitter-strip.md) —— 分组分布，逐条记录（几百点）
- [G16 · 动态条形竞赛](reference/g16-bar-race.md) —— 排名随时间演变
- [G17 · 动态流图](reference/g17-dynamic-stream.md) —— 实时滚动序列
- [G18 · 一笔绘制与计数器](reference/g18-draw-in-plus-counter.md) —— 累计增长（一条线+一个大数）

### 独立交互大图

节点或路径规模超过小图边界时使用，一图一页并提供查询交互。

- [B1 · 密集环形关系图](reference/b1-circular-graph-dense.md) —— 网络 60 节点环形弦膜
- [B2 · 密集力导向图](reference/b2-force-graph-dense.md) —— 网络 180 节点力导向星系
- [B3 · 三段丝线图](reference/b3-thread-triptych.md) —— 三段路径 100+ 条丝线
