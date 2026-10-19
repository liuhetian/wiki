<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/motion-graphics/categories/asset-fusion/module.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# asset-fusion —— category 模块（搜索驱动 · 全新的 IP）

**一个真实素材的几何形状 _变成_ 图表本身** —— RWA 叙事内融合（吸管变成量表；一杯液体变成饼图）。任何 catalog 里都没有；这是真正全新的能力。约 5–8 秒。

## 获取素材（Step 2）

搜索或生成一个具有强烈几何 affordance 的 **hero 素材**。`asset_needs`：`{ kind: image, query|generate, treatment: cutout|none }`。把它冻结到项目本地。

## 规划（Director Part 2）—— 融合逻辑

1. 给**数据类型**分类（时间型 / 数量型 / 比例型 / 空间型）。
2. 读出素材的**几何 affordance** —— 线性 → 时间线 / 量表 · 体积 / 质感 → 饼图 · 高度 → 柱状 · 容器 → 爆炸视图。
3. `element_positions`：**用定位协议来锚定（GROUND）—— 绝不目测像素坐标。** 阅读 **`grounding/PROTOCOL.md`**，并用 `node grounding/locate.mjs` 跑这个循环（`overlay` → 读条带 → `region` → 读裁切图 → `final` → **`mark` + 验证**）。默认不假设有任何 key / 依赖（只要 node + ffmpeg）；可选的 `auto` 快速路径只在恰好设置了 `GEMINI_API_KEY` 时才存在。原因：目测会让圆环偏离主体（在较弱的视觉模型上中心误差约 16–24%）；网格循环能把它拉到约 2–4%（端到端实测：目测 6.5% → 协议 2.3% 的平均中心误差，没有任何一个用例变差）。
4. 从素材用**取色器取出色板**（绝不用通用的 #FFF/#000）。

## 高亮 + 圈选配方（常见情况）

"在一张真实图片里给物体 X 套圆环 / 打聚光" → 使用即插即用的模板 **`samples/asset-fusion/_ref-circle-highlight.html`**：设置 `CFG.box`（来自定位协议）、`CFG.label`、`CFG.asset`、偶数的 `CFG.W/H`、`CFG.mode`（`full` = 圆环 + 连接线 + 标签 + 括角 + 扫描线，`circle` = 只有圆环）。它会根据框算出径向罩染、琥珀色双层描边圆环、连接线、标注和四角括号式准星。整条流水线就是：定位（PROTOCOL.md）→ 填模板 → 渲染。

## 渲染陷阱（已成文 —— 跳过这些会让渲染出错）

- **宽和高都必须是偶数** —— 宽度 _或高度_ 是奇数（例如 1400×933）→ `ffmpeg` 编码失败 / 画面变形。把素材 / 舞台缩放到偶数尺寸（1400×932）。
- **`data-width`/`data-height` 必须是舞台上的静态 HTML 属性** —— 渲染器的 StaticGuard 在编译期、JS 运行之前就读取它们。通过 `setAttribute` 设置就太晚了 → 渲染回退到竖屏 1080×1920 并且变形。（圈选高亮模板现在已经把它们写死；让它们保持等于 `CFG.W/H`。）
- **描绘动画（`stroke-dashoffset`）必须用 `autoAlpha:0` 做闸门** —— `getTotalLength()` 在布局完成之前可能读到 0 → 虚线失效 → t=0 时显示出一条实线。给每个描绘元素都用 `autoAlpha:0` 做闸门，直到它开始描绘，并用 `getTotalLength() || <const>` 做兜底。
- **CSS 变量 tween 的作用域** —— `gsap.to(":root", {"--x":..})` 影响不到自己带有内联 `--x` 的元素；要在该元素本身上 tween 这个变量。
- **固定 overlay 底下不要做镜头推进** —— 图片在缩放而圆环 / 罩染保持不动，目标就会漂出圆环。要么不做推进，要么把整个场景一起缩放。
- 无损交付：`--format mov`（ProRes）；`mp4` 是有损的。

## 词汇 / 依托

- 借用 registry 里 **`north-korea-locked-down`** 的标注套件（手绘潦草圆圈描绘、弹出标签 + 指针、编辑风格罩染、镜头推进）。
- 基本元素：沿着 affordance 的量表填充 / 标记上升 · 连接线（数据 → 素材上的点）· 与素材几何形状融合的叙事内图表。
- 让叙事内图表适配每个素材的 affordance（读出几何形状，把数据融合进去）。

## 构建（复用优先 + 手写 affordance）

**两层**：素材（z0，满出血）+ 与其几何形状融合的数据图形（z1+），以 `element_positions` 为锚点；连接线 / 潦草笔迹把数据和素材在物理上绑在一起；素材始终可见。参考实现：原型 `fusion-demo/index-annotated.html`（吸管 → 量表 + 借用的标注套件）。
