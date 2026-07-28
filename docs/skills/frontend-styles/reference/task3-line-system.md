# LINE//SYSTEM 线性工业图形

<iframe src="/skills/frontend-styles/assets/task3-line-system-demo/"
        style="width:100%;height:760px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="LINE SYSTEM 线性工业图形 demo"></iframe>

瑞士网格披上一层航天档案语义：超细线、巨型编号、条码、刻度和校准十字都像功能部件，
用“底色 + 墨色 + 单一信号色”压住未来复古最容易失控的装饰欲。样本来自工作区 `task3`。

## 要点

- 先搭 12 栏硬网格，再把标题、参数、波形和编号放进明确跨栏，不靠自由拖拽凑秩序
- 全页使用 0.5–1px 细线和零圆角，粗线只给真正的分区边界
- 配色固定为底色、墨色、信号色 2+1 结构，切主题只替换三枚令牌
- 用超大无衬线编号承担视觉重心，等宽小字承担坐标、版本、状态和参数
- 中文与英文共享基线和层级，中文不被缩成难读的装饰标签
- 条码、刻度、波形、定位角和校准十字必须绑定语义，不能当无意义赛博贴纸
- 纸张噪点与扫描线只给极低透明度，先保证细线和小字仍然清楚
- 波形、雷达和参数由 SVG / Canvas 程序化绘制，不用图片冒充实时组件
- 随机重组只能改数值与图形，不动网格骨架，确保每次结果仍属于同一设计系统
- 响应式把跨栏区顺序展开，不缩放整张海报导致文字与命中区一起变小

上面的 demo 就是工作区 `task3` 的完整单页，保留海报实验室、提示词复制、随机重组、
四套色彩预设、拆解与参数标签页、案例区、组件图谱和提示词库，没有裁成首屏样例。

## 完整实现

- [运行入口](../assets/task3-line-system-demo/index.html)
- [完整 HTML、CSS 与交互源码](../assets/task3-line-system-demo/source/index.html)
- [组件图谱素材](../assets/task3-line-system-demo/assets/component-atlas.png)
- [案例海报素材](../assets/task3-line-system-demo/assets/poster-cases.png)
