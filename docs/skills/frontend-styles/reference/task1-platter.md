# PLATTER 平面音乐档案

<iframe src="/skills/frontend-styles/assets/task1-platter-demo/"
        style="width:100%;height:760px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="PLATTER 平面音乐档案 demo"></iframe>

暖纸白上的侧视唱片架：封套像档案一样排开，但每张始终只有一个平面；
点进唱片后，空间退场，扁平曲目表与固定播放器接管阅读和操作。
样本来自工作区 `3d-music-album-clone`，按目录顺序记作 task1。

## 要点

- 用 CSS `perspective` + 单张 `rotateY` 平面组织侧视唱片架，不补侧面、背面和盒厚
- 让选中封套保留一点侧角并向前拉，周围封套退后淡出，空间层级靠位置而不是重阴影
- 把“档案感”落在竖排编号条、卷号、等宽小字和统一封套比例上，不堆怀旧贴图
- 用暖纸白、墨黑和单一信号红定主色，专辑各自的主题色只进入封套内部
- 拖拽、滚轮和方向键共用同一个连续索引，松手后吸附到最近封套
- 从唱片架进入详情时先移交同一张封套，再切成平面双栏，不突然跳到另一套页面
- 长曲目仍用原生滚动列表，空间效果只服务入口，不能污染正文的可读性
- 固定迷你播放器贯穿 library / detail，播放状态不因页面切换被重置
- 小屏把侧视架降级成居中横向轨道，按钮命中区保持至少 44px
- `prefers-reduced-motion` 下取消转场和均衡器动画，内容与操作一步到位

上面的 demo 直接由工作区 `3d-music-album-clone` 原项目构建，完整保留 12 张专辑、
曲目数据、搜索、队列、键盘导航、拖拽/滚轮吸附、详情轮播、长曲目滚动条和音频播放器，
不是为文章重写的简化样例。

## 完整实现

- [运行入口](../assets/task1-platter-demo/index.html)
- [交互与页面状态源码](../assets/task1-platter-demo/source/src/App.tsx)
- [完整专辑与曲目数据](../assets/task1-platter-demo/source/src/data.ts)
- [视觉与响应式源码](../assets/task1-platter-demo/source/src/styles.css)
- [工程依赖](../assets/task1-platter-demo/source/package.json)
