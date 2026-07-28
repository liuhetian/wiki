# PARALLAX 三态作品档案

<iframe src="/skills/frontend-styles/assets/task2-parallax-archive-demo/"
        style="width:100%;height:760px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="PARALLAX 三态作品档案 demo"></iframe>

冷白画布上的可变策展系统：内容不换，只把同一批卡片切成层叠、环绕和规整档案三种观看距离。
样本来自工作区 `task2`。

## 要点

- 把恒定说明和模式控制留在左栏，把全部视觉变化限制在右侧展台
- 同一份作品数据渲染 Layered / Orbit / Archive 三种视角，不复制三套内容 DOM
- Layered 用小步距对角错位形成纸堆，hover 只抬高当前卡，不带着邻居乱动
- Orbit 用椭圆轨道排卡，指针只给全局轻微漂移，hover 当前卡时转正并前提
- Archive 回到三栏平面网格和原生滚动，让用户能真正检索作品
- 卡片保持零圆角、细黑边和档案编号，封面信号色是变化源，壳体始终克制
- 模式切换只改变 transform 与容器布局，标题、年份、编号和封面不闪换
- 给堆叠态明确 z-index 递进，hover 时逐级上升，避免直接跳到最顶造成穿帮
- 程序化图形代替来源截图时，保留色板、裁切比例和信息密度，不仿原作品内容
- 竖屏把说明压成顶部控制带，展台占剩余高度，不把横屏布局等比缩小

上面的 demo 直接由工作区 `task2` 原项目构建，完整保留 24 件作品、三种视图、
Orbit 卡片独立拖拽、Archive 自定义滚动条与键盘控制、指针视差和响应式布局，
不是为文章重写的简化样例。

## 完整实现

- [运行入口](../assets/task2-parallax-archive-demo/index.html)
- [三态视图与交互源码](../assets/task2-parallax-archive-demo/source/src/App.tsx)
- [视觉与响应式源码](../assets/task2-parallax-archive-demo/source/src/styles.css)
- [工程依赖](../assets/task2-parallax-archive-demo/source/package.json)
