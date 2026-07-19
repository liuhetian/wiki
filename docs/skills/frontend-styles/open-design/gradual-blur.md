# 页底渐进高斯模糊

<iframe src="/skills/frontend-styles/open-design/assets/gradual-blur-demo.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="页底渐进高斯模糊 demo：Gradual Blur 分层 backdrop-filter"></iframe>

open-design.ai 整站底边那条"内容化进白雾"的横带：滚动的文字经过页底时
先发虚再化开，不是白色渐变盖上去的。上游是 React Bits 的 Gradual Blur
（MIT，原作者 ansh-dhanani），官网把它移植成 SSR 静态输出 —— 构建期直接
渲染出一叠内联样式 div，浏览器端零 JS。

## 要点

- 单个 `backdrop-filter: blur()` 只能给整块区域一个统一模糊值，做不出"越靠底越糊"—— 解法是叠 N 层完全重合的 div，每层持有一档递增的模糊值
- 每层用四段式 mask 划定责任区：`linear-gradient(to bottom, transparent p1%, black p2%, black p3%, transparent p4%)`，断点按 `increment = 100/divCount` 均分推进
- 相邻层的 mask 窗口互相咬合一格（p3/p4 伸进下一层的区域），两档模糊值在重叠带内互相过渡 —— 肉眼看到的连续梯度其实是 N 档阶梯
- 模糊量指数增长：`blur(i) = 2^(progress×4) × 0.0625 × strength`，浅处几乎不可察觉、贴边处彻底化开；线性档 `0.0625×(progress×divCount+1)×strength` 备用
- 官网首页参数：`height 4rem、strength 3、divCount 10、curve linear、exponential`
- 两种挂法一套代码：`target='page'` 用 `position:fixed` 钉视口底边（整站那条）；`target='parent'` 用 absolute 贴最近定位祖先（hero 背景画的底边同款）
- 容器必须 `pointer-events: none`：带子悬在整页最上层，不能挡住穿过它的链接和按钮
- 和白色渐变遮罩的本质区别：渐变是把内容**盖白**，Gradual Blur 是把内容**失焦** —— 颜色还在、形状还在，只是化开；demo 里细条纹穿带对比最明显
- 官网是构建期 React `renderToStaticMarkup` 直出这叠 div（upstream 的 hooks / hover / responsive 全部砍掉，只保留视觉算法），页面不为它付任何运行时成本
- 模糊带静止不动，不属于 `prefers-reduced-motion` 要关停的运动，官网也不为它降级

## 源码（折叠）

??? abstract "gradual-blur-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/open-design/assets/gradual-blur-demo.html"
    ```
