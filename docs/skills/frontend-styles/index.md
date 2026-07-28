# 前端风格收集

平时看到、做过、想复用的**成品前端美学**收进这里 —— 每种风格一个自包含单页 demo，讲清楚色彩令牌、面板结构、字体链、悬停/状态怎么处理，直接抄走套到自己的项目。

跟 [Dashboard 后台](../dashboard/index.md) 的区别：dashboard 讲**功能形状**（表单、表格、看板 …… 骨架逻辑），这里讲**皮肤气质**（终端风、赛博朋克、极简白 …… 视觉语言）。同一个"表格"形状，套上不同风格就是不同的观感。

- [PIP-BOY 琥珀终端](reference/pip-boy-terminal.md) —— 单色琥珀 + 深黑底 + 等宽微发光的复古 CRT 面板，Fallout Pip-Boy 灵感
- [Celestia 主题收藏卡](reference/celestia-collection.md) —— 数据自带主题色板的玻璃拟态收藏画廊，衬线大字 + 宽字距小标签的杂志气质
- [Verdant Glass 苔光用量台](reference/verdant-glass.md) —— 浅灰绿底 + 白玻璃卡 + 翡翠绿点缀的 LLM 网关用量看板，悬浮胶囊侧栏 + 热力图 + 面积图
- [Syzygy 克莱因蓝星穹](reference/syzygy-astral.md) —— 一 div 巨行星 + 大气层渐变落地纸白正文的深空官网首屏，data-brand-theme 令牌一键换肤
- [NEXUS 2030 酸绿深空首屏](reference/nexus-2030.md) —— 近黑墨绿深空底 + 酸性荧光绿点缀的科幻发布页 hero，SVG 笔画描边大标题 + 行星轨道核心 + 纯 CSS 伪影片模态
- [ATELIER 纸白动力学](reference/atelier-kinetic.md) —— 暖纸白 + 墨黑巨字 + 单一朱砂红的实验排版作品页，一个弹簧积分器驱动全页：巨字被指针推开、卡片甩出去弹回来、滚动横推作品轨；页内附「对标 Awwwards」那段审美基调提示词原文与它的适用边界
- [PLATTER 平面音乐档案](reference/task1-platter.md) —— 完整唱片架、详情轮播、搜索、队列和音频播放器
- [PARALLAX 三态作品档案](reference/task2-parallax-archive.md) —— 同一批卡片在 Layered / Orbit / Archive 三种视角间切换
- [LINE//SYSTEM 线性工业图形](reference/task3-line-system.md) —— 海报实验室、设计拆解、组件图谱与提示词库
- [WORLD FILES 档案袋叙事](reference/task4-world-files.md) —— 横向档案架与解绳、铺纸、显字的连续转场
- [PIXEL BLOOM 网格揭示](reference/task5-pixel-bloom.md) —— Canvas 沿指针轨迹逐格揭开三个同坐标隐藏世界
- [TINTORY 视觉考古编辑部](reference/task6-tintory.md) —— 六页视觉研究工作室与真实民族服饰素材
- [NEAT ANNOTATIONS 手绘标注标本](reference/task7-neat-annotations.md) —— 八方向、内置颜色与组合效果的完整 CSS 标本页
- [Open Design 官网拆解](open-design/index.md) —— open-design.ai 首页 11 个动效逐个复刻：磁性 Dock、物理掉落、点阵地球、逐词模糊入场 …… 纸白 + 荧光绿的零 React runtime 渐进增强流派
- [HAOQI 3D 开屏拆解](haoqi/index.md) —— 一个完整开屏展示：手写 Banana TubeGeometry、Pointer 视差、玻璃折射与 GPU Fluid Push；后续独立特效按第二、第三篇追加
- [ORYZO 官网拆解](oryzo/index.md) —— Lusion 的高斯泼溅玩梗营销站，按叙事顺序复现精彩场面：蓝图开场、泼溅渲染系统、翻滚转台场景切换、巨型标题景深换焦、照片滑轨、RGB 呼吸光边

## 收录格式

每篇风格文章按同一个模子写：**iframe 活例 → 一两句气质定义 → prompt 式要点清单 → 完整实现入口**。单页实验可以把源码直接放进一个 HTML；从完整项目收录时则保留原构建、素材和可读源码目录，不能为了满足单文件格式重写或删减交互。

- 要点清单一行一条，每条是可直接喂给 AI 的指令（如「用 SVG `<text>` + `paint-order:stroke` 实现大标题按字体笔画描边」），不写「**小标题**：多行解释」的格式
- demo 必须能随 wiki 独立运行：轻量单页的运行时走全站共享 `/vendor/`；完整项目保留自己的已构建运行时并改成相对资源路径，不依赖原工作区开发服务器。规矩见[写作规范·嵌入交互单页](../writing/mkdocs-wiki/index.md#iframe-demo)
- 删原稿的 CDN 字体前，先确认字体是不是视觉效果本身的一部分（nexus-2030 的笔画描边依赖 Noto Sans SC 保留笔画重叠轮廓，换系统字体效果即失）；是的话用 `fonts.googleapis.com/css2?family=...&text=<那几个字>` 拿几 KB 的子集 woff2 vendor 进文章 `assets/`，`@font-face` + `unicode-range` 钉死那几个码位
