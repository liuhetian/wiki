# TINTORY 视觉考古编辑部

<iframe src="/skills/frontend-styles/assets/task6-tintory-demo/"
        style="width:100%;height:800px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="TINTORY 视觉考古编辑部 demo"></iframe>

奶油纸、深棕墨、衬线巨字和一摞斜放研究便签，把工作室首页做成视觉研究杂志；
进入长文后立刻回到克制分栏与可靠层级。样本来自工作区 `task6`。

## 要点

- 用奶油纸、深棕、砖红和赭黄建立旧印刷气质，不用纯白纯黑制造廉价强对比
- Hero 用衬线巨字承担情绪，正文继续使用清楚的无衬线与 1.8–1.9 行高
- 把 Culture / Fashion / Graphic 当作同一研究方法的栏目，不做三套互不相干的皮肤
- 首页便签使用轻微旋转、纸色差和错位硬阴影，像研究材料而不是 Dashboard 卡片
- hover 只把当前便签抬起并转正，层叠关系要像桌面纸堆一样可预期
- 栏目页共用“编号 kicker + 巨标题 + 侧栏索引 + 档案列表”的编辑骨架
- 图片不是版式成立的前提；没有照片时仍能靠纸张、纹样、字体和留白完整表达气质
- 中文长文不模仿英文窄栏到过细，正文宽度控制在舒适阅读区
- 页面切换只做短暂淡入与小位移，视觉连续性来自固定顶栏和共用令牌
- 小屏先保留标题、栏目和正文顺序，再把斜叠便签收进可控高度
- 研究型内容优先让标题和引言可复制、可选中、可检索，不把正文烘焙进图

上面的 demo 直接由工作区 `task6` 原项目构建，完整保留 Home、Graphic、Fashion、
Culture、Journal、Contact 六个 hash 页面、移动菜单、回到顶部、真实民族服饰素材和全部长文区块，
不是只留下首页便签的简化样例。

## 完整实现

- [运行入口](../assets/task6-tintory-demo/index.html)
- [六页内容与导航源码](../assets/task6-tintory-demo/source/src/main.jsx)
- [视觉与响应式源码](../assets/task6-tintory-demo/source/src/styles.css)
- [工程依赖](../assets/task6-tintory-demo/source/package.json)
