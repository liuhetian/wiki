# ATELIER 纸白动力学

<iframe src="/skills/frontend-styles/assets/atelier-kinetic-demo.html"
        style="width:100%;height:820px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="ATELIER 纸白动力学 demo：弹簧驱动的实验排版作品页"></iframe>

暖纸白 + 墨黑巨字 + 一个朱砂红的实验排版作品页：标题被指针推开、卡片甩出去会自己弹回来、
向下滚动把作品索引横向推过去 —— 全页手感出自同一个十行的弹簧积分器。
这页不是扒哪个真实站点，是拿下面这段**审美基调提示词**现做出来的产物。

## 提示词原文

> - **图标**：统一使用 Lucide 图标，界面全程禁止使用表情符号。
> - **设计标准**：对标 Awwwards 顶级网站水准，达到 Awwwards、FWA、CSS Design Awards 每日最佳网站同等设计品质。
> - **创意自由度**：将浏览器视作交互式艺术画布，跳出传统布局框架，追求先锋视觉风格、实验性排版、流畅物理动效、极具冲击力的文字版式。
> - **沉浸式体验**：融合代码、高级渲染逻辑，打造统一完整的精品页面，做出突破常规 UI 认知、令人惊艳的数字交互体验。

四条里只有第一条是**可验收的硬约束**（图标库钉死、emoji 全禁），照着做就有；后三条是**放飞开关** —— 它只提高"敢不敢"，不提供"往哪走"。开关拉满而不给方向，AI 会默认滑向深色 + 霓虹 + 玻璃拟态的老三样，所以真正决定成败的是自己补上的那半句：色板、题材、气质。本页补的是「暖纸白印刷感 + 单一朱砂红 + 瑞士排版」。

!!! warning "适用边界"
    这段 prompt 只配 hero、作品集、发布页这类**首屏说服型**页面。后台、表单、数据看板别喂第三四条 —— 自定义光标吃掉指针反馈、巨字吃掉信息密度、排斥动效吃掉点击精度，全是可用性的净亏损。要那种场合的皮肤，看 [Verdant Glass](verdant-glass.md) 或 [Dashboard 后台](../../dashboard/index.md)。

## 要点

- 物理感只写一次：十行半隐式欧拉 `a = (target - x) * k - v * d`，全页光标 / 巨字 / 卡片 / 横轨共用同一个 `Spring` 类，不用 CSS transition 凑手感
- 所有弹簧跑在同一个 rAF 循环里，一帧只做一遍 step + 一遍写样式；`dt` 钳在 `1/30` 秒，切后台回来才不会积一大坨时间把物体弹飞
- 帧里交替「读 `getBoundingClientRect` → 写 transform」会触发 layout thrashing（40 个字母就是 40 次强制重排）：静止坐标缓存成**文档坐标**，只在 resize / `document.fonts.ready` / 入场落定后重量一次，帧里只做纯算术
- 逐字入场拆三层：`.ch` 遮罩、`.ch-in` 归 CSS 入场、`.ch-rp` 归 JS 排斥 —— 入场和物理写同一个元素的 transform 会互相覆盖
- 遮罩的 `overflow:hidden` 会裁掉负字距溢出的字形边缘和斜体的右倾部分：用 `padding` 把遮罩框撑开、再用等量负 `margin` 抵消回来，版式一像素不动
- 指针排斥的权重用 `(1 - dist/R)²` 平方衰减，纵向分量只给横向的 `.55`，看起来像字被拨开而不是被吸走
- 拖拽的回弹不靠动画曲线：跟手时改弹簧 target，松手把指针速度注入 `spring.v`、target 归零，超调回摆是解算出来的；速度钳在 ±2600 防甩飞
- 自定义光标做两层：实心点直接跟手、外环走弹簧慢一拍，`mix-blend-mode:difference` 自动反色；hover 元素时读 `data-cursor` 换文案并放大外环，`(hover:none)` 下整套不渲染
- 磁性元素只需一条规则：指针进半径后 target = 偏移量 × `.32`，离开归零，弹簧负责所有缓动
- 横向作品轨不劫持 `wheel`：`300vh` 滚动区套 `100vh` sticky 视口，滚动进度映射成 `translateX` 再过一层弹簧 —— iframe 里的滚动行为保持正常，惯性拖尾照样有
- 作品名用 `-webkit-text-stroke` 描边空心 + hover 填实，比改颜色的对比强得多
- Lucide 图标按官方 24×24 轮廓手抄成 `<symbol>`、页内 `<use>` 复用，不拉 CDN 也不引 npm；全页零 emoji，状态点用 CSS 圆点
- 纸纹用 `feTurbulence` 生成的 SVG data URI 铺满 + `mix-blend-mode:multiply` + `steps(6)` 位移抖动，`opacity:.06` 一档就够，重了就脏
- 版式冲击力的配方：巨字负字距 `-.055em` + 行高 `.78`，第二行右缩进 26vw 并上提 `-.06em` 跟第一行咬住，大写无衬线撞小写衬线斜体，侧边一条 `writing-mode:vertical-rl` 竖标，小字全用等宽 + 大字距当刻度
- 正文段落不参与实验，仍是 16px / 1.9 的老实排版 —— 实验排版只放在 hero 和页脚，否则整页不可读
- `prefers-reduced-motion` 下：入场直接到位、噪点停摆、光标退回原生、排斥与磁性全关，只留横轨的直接映射

## 源码（折叠）

??? abstract "atelier-kinetic-demo.html（自包含单页，含内联 style + script）"

    ```html
    --8<-- "skills/frontend-styles/assets/atelier-kinetic-demo.html"
    ```
