<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/motion-graphics/catalog-map.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Director → catalog block 对照表（复用优先）

<!-- registry-items: allow=geo-highlight,geo-flow,flag-borders,pin-rollout,stat-motion,data-composition-src -->
<!-- allow= entries above are deliberately NOT registry items: geo-*/flag-borders/pin-rollout and stat-motion are hand-authored gaps this file names in order to say they are gaps. -->

**使用这张表之前先搜索在线 catalog，任何手写效果之前也要再搜一次。** 运行 `npx hyperframes catalog --query "<the move, in plain English>" --json` —— 用户要求的每一种被点名的外观或效果都跑一次（"CRT 扫描线"、"故障效果"、"胶片颗粒"、"微光扫过"），包括构建中途才提出的效果。**搜索不需要安装任何东西**：它在任意目录下都能对整个托管 registry（约 400 项）排序，不需要项目、不需要事先 `add`、也不需要账号。下面的表是那个 registry 中一部分内容的手工维护快照，按设计就覆盖不全 —— 在这里没找到只能算未经证实，只有搜索本身返回空结果，才能证明 catalog 里确实没有这种动作。确实没有时，在手写之前用 `npx hyperframes feedback --search-miss "<query>" --wanted "<the move>" --tier <tier from the envelope>` 报告。完整参数和 tier：`/hyperframes-registry` → § Discovery。

Builder 的**默认做法是组装现有的 HF catalog block，而不是手写。** `npx hyperframes add <block>` 会把一个 block 的源码放进 `compositions/`；然后 Builder **就地定制** —— 大多数 block 把内容 / 数据直接写死在自己的脚本里（只有少数暴露了 CSS 变量 `params`），所以复用 = **add + 编辑**，而不是单纯注入变量。只手写 (a) 没有任何 block 覆盖的缺口，以及 (b) asset-fusion 的 affordance 绑定。

在把意图归类到 category 之后，**Director 在 shot-plan IR 里点名 block 以及要定制什么**：

```jsonc
"content": { "block": "data-chart", "customize": { "data": [...], "headline": "…", "palette": ["…"] } }
```

## Category → block

| Category               | 从 catalog 借用                                                                                                                                                                                                                                                                                                                                                                             | 定制                                                                                             | 缺口 → 手写                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **kinetic-typo**       | **17 个 `caption-*`** 中的一个（kinetic-slam、editorial-emphasis、clip-wipe、gradient-fill、neon-glow、glitch-rgb、matrix-decode、particle-burst、weight-shift、pill-karaoke、highlight、blend-difference……）                                                                                                                                                                                | 文字；`emphasis_words` → `word--emphasis`；色板；字体；时间                                      | 这 17 个都覆盖不到的母题                                                                                       |
| **charts**             | `data-chart`（柱状 + 折线、错开出现、数值标签）、`bar-chart-race`（排名竞赛）                                                                                                                                                                                                                                                                                                               | 编辑数据数组 + 标题 / 副标题；`--bg`/`--text`                                                    | 饼图 / 环形图、圆环 / 百分比                                                                                   |
| **stat**               | `apple-money-count`（金融：$ 计数器 + 爆发效果 + 音效）**或者**按 `categories/stat/module.md` 手写一个通用的百分比 / 数字 + 圆环（并不存在 `stat-motion` 这个 block）                                                                                                                                                                                                                       | 目标值、前缀 / 后缀、标签、色板                                                                  | —                                                                                                              |
| maps/geo               | **vector 通道**：`us-map`（+bubble/hex/flow）、`world-map`、`spain-map` + **手写** `geo-highlight`/`geo-flow`/`flag-borders`/`pin-rollout`（**不在** registry 里 —— 按 `categories/maps/module.md` 构建）。**basemap 通道**（真实卫星图 / 暗色 / 缩放到某地）：用 `categories/maps/bake-basemap.mjs` 烘焙 → `<video>` + 与地理坐标对齐的 SVG overlay（边界描绘 + 色块填充）              | 区域 / 数据、色板、标注 / 连接线、底图样式                                                       | （basemap 通道现在已经覆盖真实影像 + 缩放到地址 —— 这曾是缺口）                                                |
| 图示（diagram）        | `flowchart`（SVG 连接线 + 节点）                                                                                                                                                                                                                                                                                                                                                            | 节点、边、标签                                                                                   | —                                                                                                              |
| **品牌揭示**           | `logo-outro`（部件组装 + 发光 + 标语 + URL 胶囊）                                                                                                                                                                                                                                                                                                                                           | logo 素材、标语、URL、色板                                                                       | —                                                                                                              |
| 转场                   | 15 个以上的 shader 转场（domain-warp、whip-pan、sdf-iris、glitch……）                                                                                                                                                                                                                                                                                                                       | 方向、时间                                                                                       | —                                                                                                              |
| 社交 overlay           | ig / tiktok / yt / x / reddit / spotify / macos 卡片                                                                                                                                                                                                                                                                                                                                       | 账号名、指标数据、头像                                                                           | —                                                                                                              |
| 润色                   | grain-overlay、vignette、shimmer-sweep、texture-mask-text                                                                                                                                                                                                                                                                                                                                   | 强度                                                                                             | —                                                                                                              |
| **asset-fusion (RWA)** | **来自 `north-korea-locked-down` 的标注套件** —— 潦草圆圈描绘、弹出胶囊 + 指针、红色罩染、扫描线、边角框、镜头推进；+ `us-map-bubble` 的标注 / 连接线                                                                                                                                                                                                                                      | 素材、标注位置（`element_positions`）、标签、**用取色器从素材上取色得到的**色板                  | **全新（catalog 里没有）：affordance 绑定 —— 素材的几何形状 _变成_ 图表的坐标轴（吸管 → 量表）**               |

## 复用机制

- `npx hyperframes add <block>` → 源码落到 `compositions/<block>.html`；把它内联，或通过 `data-composition-src` 引用；就地定制内容 / 数据 / 色板 / 位置。
- block 以固定画布尺寸发布（1920×1080 / 1080×1920 / 1080×1080）—— 匹配它，或做适配。
- block 已经遵守 HF 契约（paused timeline、seek）—— 保持住。

## Asset-fusion：借用 + 全新（唯一真正全新的 IP）

借用 `north-korea-locked-down` 的标注 _语言_；全新的是 RWA 融合 _逻辑_（见 RWA 研究）：

1. 给数据类型分类；读出素材的**几何 affordance** —— 线性 → 时间线 / 量表，体积 / 质感 → 饼图，高度 → 柱状，容器 → 爆炸视图。
2. **`element_positions`** —— 测量素材的特征（中心 / 范围 / 安全区 / 回避区）。这是逆向推断那一步（视觉）；在原型里是手工估算的。
3. 从素材用**取色器取出色板**（绝不用通用的 #FFF/#000）。
4. **两层** —— 素材（z0，满出血）+ 与其几何形状融合的数据图形（z1+），以 `element_positions` 为锚点；连接线 / 潦草笔迹把数据和素材在物理上绑在一起；素材始终可见。
