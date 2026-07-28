# PIXEL BLOOM 网格揭示

<iframe src="/skills/frontend-styles/assets/task5-pixel-bloom-demo/"
        style="width:100%;height:760px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="PIXEL BLOOM 网格揭示 demo"></iframe>

一张克制主图藏着多个真正不同的世界状态；指针走过时，方格逐块复制隐藏图的同坐标纹理，
轨迹像把另一层现实擦出来。样本来自工作区 `task5`。

## 要点

- 主图保持轮廓清楚、纹理克制，隐藏状态必须改变环境、材质和结构，不能只换色
- 所有状态图使用完全一致的尺寸、主体位置、裁切和坐标映射
- 每个网格复制隐藏图的真实矩形纹理，不用单个采样色填满整格
- 指针位置按小于格宽的间距插值，快速移动也要形成连续轨迹而不是断点
- 每个轨迹点记录出生时间，逐帧按寿命淘汰，停止后自然从旧端消散
- 点击切换隐藏状态时清空旧轨迹，让一笔涂抹永远只属于一个世界
- 格子、笔刷半径、插值间距和轨迹寿命从同一画面比例计算，不写四套固定像素
- 图片使用 `cover` 时响应式取最大轴比例，使用 `contain` 时取最小轴比例
- 大画面同步扩大笔刷并延长寿命，保持相对覆盖范围与涂抹节奏
- UI 只保留品牌、状态和一句操作提示，把视觉重量全部交给画面与轨迹
- 触屏设备用 pointer 事件统一处理；`prefers-reduced-motion` 隐去持续操作暗示

上面的 demo 直接由工作区 `task5` 原项目构建，完整带入主图和 3 个同坐标世界状态，
保留高分屏 Canvas、图片预采样、轨迹插值、网格纹理复制、寿命消散、点击换世界与触屏事件，
不是用色块模拟的简化样例。

## 完整实现

- [运行入口](../assets/task5-pixel-bloom-demo/index.html)
- [Canvas 采样与轨迹系统源码](../assets/task5-pixel-bloom-demo/source/src/App.jsx)
- [视觉与响应式源码](../assets/task5-pixel-bloom-demo/source/src/styles.css)
- [工程依赖](../assets/task5-pixel-bloom-demo/source/package.json)
