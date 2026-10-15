<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/motion-graphics/categories/maps/module.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# maps —— category 模块

地理运动：高亮区域、连接地点、缩放到某个位置。**第一个决策：这个镜头需不需要真实底图**（卫星 / 街道 / 地形影像、地球仪，或者缩放到一个真实地址）？这决定走哪条通道。

## 规划（Director）

先设置 `content.lane`：

- **vector**（默认）—— 风格化的区域形状，没有真实影像。HF 原生支持 + 实时运行，开销小。`asset_needs: []`。
- **basemap** —— 需要真实的卫星 / 暗色瓦片、地球仪，或缩放到真实地点。`asset_needs: [{ type: "map-bake", … }]`。**在 Source 阶段烘焙影像**：HF 禁止渲染时联网，并且要求确定性，所以实时瓦片（每次渲染都会重新拉取，而且可能变化）不能充当影像层 —— 烘焙把它冻结下来（附带的好处是还很流畅）。见 Basemap 通道 + 确定性。

`content`：`{ lane, shot: highlight|flow|choropleth|labels|flag|pin-rollout|zoom-to, regions[], points[], basemap: satellite|dark, palette, headline, overlays: [label|pin|callout-card] }`。

`overlays` 独立于 `shot`，在两条通道里都能用。**`callout-card`** = 一张钉住的卡片（旗帜小块 + 数据 + 进度条）—— 这就是"纪录片弹窗"（top #13）；把它组合到任意 zoom-to / highlight 镜头上，而不是把它当成一种独立的镜头。

## 词汇 / 依托

**Vector 通道**（D3 + TopoJSON —— 复用现有的地图系列，不要重复造）：

- 复用：`us-map`（+bubble/hex/flow）、`world-map`、`spain-map`。
- **手写**这些（**不在** catalog 里 —— 按下面的标志性效果来构建，别指望能 `add`）：`geo-highlight`（N 个国家上色 + 标签 + 边界脉冲）、`geo-flow`（世界弧线 / 枢纽网络）、`flag-borders`（旗帜裁切进一个国家的形状）、`pin-rollout`（城市依次脉冲 + 计数器）。
- 标志性效果：国家填色错开出现 · 图钉落下 + 脉冲圆环 · 弧线 `stroke-dashoffset` 描绘 + 飞行物 · 分级设色图颜色显现 · **viewBox** 缩放。

**Basemap 通道**（MapLibre，在 Source 阶段烘焙 —— 已验证的流水线，`bake-basemap.mjs`，完全由环境变量参数化 —— 对任意国家都能跑，不只是原型里那几个）：

- **烘焙** `bake-basemap.mjs`（puppeteer + MapLibre；由环境变量驱动：`NAME STYLE COUNTRIES CENTER ZSTART ZEND PITCH BEARING FPS DUR`）：以**缩放 → 定格**（`easeInOutCubic`）驱动镜头，并且**每一帧之前都 `await map.once('idle')`**，让每一帧的瓦片都完整（Remotion 的 `delayRender` 技巧 → 不会有瓦片突然冒出来）。这个辅助脚本会自己找到 Chrome、精确锁定依赖版本、针对每个主体推导出海外领土过滤规则，并且**在 idle 超时时大声失败**（可疑帧 → 非零退出码）。_外部依赖：锁定版本的 CDN 库（maplibre/topojson/world-atlas）+ Esri/CARTO 瓦片端点都是第三方的 —— 任何一次版本升级都要重新核实可用性 + 服务条款。_ `preserveDrawingBuffer:true`、`fadeDuration:0`。然后这个辅助脚本会**自己把帧编码成全帧内（all-intra）MP4**（`ffmpeg -framerate FPS -i f%04d.png -c:v libx264 -g 1 -pix_fmt yuv420p`），并把所有东西写到 **`$OUT`（默认 `cwd`）**，而不是 skill 目录 → `<NAME>.mp4` + `<NAME>-coords.json`。
- 在定格视角下**导出地理 → 屏幕坐标**：对每个请求的国家做 `map.project()` → `<NAME>-coords.json` = `{ view, countries: [{ name, color, d (SVG path), bbox, label }] }`。镜头在缩放之后静止定格，所以这些路径保持像素级对齐。`label` 是一个**近似**锚点（本土外环的顶点平均值 —— 对凹形国家要按「可读性」一节微调）。使用 `coords.countries[i]`；`smooth-frde2`/`smooth-flag` 这两个示例目录早于这个辅助脚本，用的是扁平的 `{fr,de,…}` 结构，所以要调整它们的接线方式。
- **Builder**：轨道 0 上放 `<video>` 底图 + 一个 **SVG overlay**，在定格期间给国家的**边界（`stroke-dashoffset` 描绘）** + **填充（色块显现）** + 标签 / 图钉 / 卡片做动画 —— 全部通过 `coords.json` 与地理坐标对齐。这能复现 Hera 那种「卫星图 + 动画彩色边界 / 标注」的外观。
  - 同一条投影路径还能兼作 SVG **`clipPath`**：把**一面旗帜（或任何纹理）裁切进真实边界**，做出 _旗帜填充边界_ 的效果 —— 在真实地图背景之上，比纯色填充更丰富（已验证：暗色底图上的法国三色旗，`smooth-flag`）。把要素在屏幕上的 **bbox** 和它的路径一起导出，这样旗帜条纹 / 纹理就能按国家的大小来定尺寸。
- **延伸 / 数据缺口**（按需扩展 `bake-basemap.mjs` —— 评测 agent 就这么做过）：**地球仪开场**（"从地球仪开始"）= 开场阶段用 MapLibre `projection:{type:'globe'}`，到达目标时缓动过渡到墨卡托（辅助脚本默认用墨卡托）。**次国家级**区域（州 / 省）不在 world-atlas 里（它只有国家）→ 改用 Natural Earth 的 **admin-1** TopoJSON，或者把质心投影成图钉（`pin-rollout`）。

## 构建（复用优先）

Vector：`npx hyperframes add <block>` → 就地编辑区域 / 数据 / 色板。Basemap：把烘焙好的 `map.mp4` 作为轨道 0 的 `<video>`，再把 overlay 绑定到锚点上。

**克制（不要俗气 —— 这是自动生成的地图出问题的头号原因）：** 每一个动画元素都必须服务于信息 —— 区域、连接线、标签、图钉、镜头。**不要装饰性的环境光晕、背景光斑、漂浮粒子、镜头光晕，也不要无端的泛光。** 运动 = 一个连续的镜头运动（viewBox 推进 / 缩放）+ 有目的、相互重叠的元素显现 —— 不是灯光秀。色板：颜色必须**承载意义** —— 数据色阶（分级设色图）、用来区分区域的分类填色（政区图），或者在其余一切保持中性的前提下，给主体（高亮的国家 / 路线）用 1–2 个强调色。不要把颜色当**装饰**加上去（只是为了对比就把某个国家涂成琥珀色，为了"能量感"加个光晕）。画面读起来应该像一张干净的电视新闻地图，而不是屏保。

**可读性（硬规则）：** 标签要与高亮形状错开，彼此之间也要错开；限制在安全区内；标注胶囊不能压在另一个标签或边界上（评测中就暴露出一个 DE/PL 的 "Oder–Neisse" 胶囊压住了 POLAND 标签）。关键元素要保持可读至少约 0.3 秒。

**署名（硬规则）：** 真实的底图影像带有使用条款 —— 只要底图出现在画面上，就要在 composition 里烘焙进一个署名元素（Esri 卫星图 → "Esri, Maxar, Earthstar Geographics"；CARTO → "© CARTO, © OpenStreetMap"）。放在下方角落的一个小标签（见 `smooth-jp`）。凡是要发布的作品都不可商量。

**确定性（硬规则 —— 每一条都在原型里坑过我们）：**

- 一切都由 seek 时钟驱动；有状态的更新（计数器、文字）**绝不用 `tl.call`** → 用代理 tween + `onUpdate`（在 HF seek 下 tl.call 会冻结 timeline）。
- SVG 缩放 = 对 **viewBox** 做动画（不要手算分组的 transform 原点）。
- 居中的 overlay（用 `transform: translate(-50%,…)` 居中的卡片 / 标签）：**只对 opacity 做动画**，或者在外面包一层居中的 div —— GSAP 对 `y`/`scale` 做动画会覆盖整个 transform，把居中搞没。
- 国家几何形状：只保留**在主体周围一个经纬度框内**的多边形 —— world-atlas 把海外领土也打包在一起，会把 bbox 撑爆（法国 + 法属圭亚那）。保留近处的岛屿（科西嘉、西西里），丢掉远处的。（`bake-basemap.mjs` 以顶点最多的多边形 ± `KEEPMARGIN` 为锚点 —— 没有任何针对特定大洲的常数。）
- **瓦片的世界尺度**：不管栅格的 `tileSize` 是多少，MapLibre 内部的世界宽度都是 `512·2^zoom`。Esri/CARTO 栅格 → `tileSize:256`（正确）；512px / @2x / retina / 矢量来源需要 `tileSize:512`，否则每个缩放级别都会差一级（这曾经悄悄让一次烘焙放大过头 —— 法国从画面顶部溢出到底部）。
- **反子午线**：跨越 ±180° 的要素（俄罗斯、斐济、新西兰）在逐顶点的 `map.project()` 下会被拉花。`bake-basemap.mjs` 在投影之前会**围绕镜头中心参考点展开经度**，这能处理这个问题；如果展开之后某个要素仍然跨度超过 180°，它还是会发出警告。
- **流畅度 = 每帧完整的瓦片 + 带缓动的镜头。** 烘焙时，每次截图之前都 `await map.once('idle')`（= Remotion `delayRender`），并用 `easeInOutCubic` 给镜头加缓动（= interpolate+Easing）。`preserveDrawingBuffer:true`、`fadeDuration:0`、较大的 `maxTileCacheSize`。
- **Overlay 对齐**：在**定格**的镜头下投影要素边界，并且只在定格期间给 overlay 做动画 —— 镜头在动而投影路径固定，两者就会漂开。
- **定格之前的隐藏状态**：一个要在定格 _时_ 显现的 overlay，必须在构建时就用 `gsap.set` 设成隐藏状态（`scaleX:0`、完整的 `stroke-dashoffset`、`opacity:0`）—— 光秃秃的 `fromTo` 在 tween 开始之前**不会**应用它的 "from"，否则这个元素在推进缩放期间会以它的自然状态（可见、位置错误）显示出来。
- **为什么要烘焙**（真正的原因 —— 不只是为了流畅）：烘焙把影像冻结成**确定性的**像素。实时栅格瓦片每次渲染都会重新拉取，而且可能变化，而渲染时联网是被禁止的。MapLibre 在 HF 里 _确实_ 能实时渲染（只是卡顿：瓦片突然冒出来，深度缩放跑得比加载还快）；把引擎每帧的 `onBeforeCapture` 钩子暴露出来（它是存在的 —— `frameCapture.ts:~1250`）可以让实时渲染变**流畅** —— 但它**消除不了**为了**确定性 + 离线可复现**而冻结瓦片的需要。所以 `onBeforeCapture` 能取代的是烘焙的 _流畅_ 作用，而不是它的 _冻结_ 作用。

## 范围之外

3D 照片级写实地标（那是 Cesium 的地盘）· 按国家 / 按模板做的 block（改用参数化）· 图表（→ `charts`）。（在引擎内 _实时_ 运行 MapLibre 是可能的，但目前很卡 —— 改用烘焙；等引擎有了每帧就绪钩子再重新考虑。）

## 登记

`director.md` 里的分类器行（通道分叉）+ `catalog-map.md` 里的 `maps/geo` 行（加上 basemap 通道）。阶段流水线不用动。
