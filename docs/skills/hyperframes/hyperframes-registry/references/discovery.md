<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-registry/references/discovery.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# Registry 发现

<!-- registry-items: allow=data-composition-id,data-start,data-track-index -->

## 先用 catalog 命令

```bash
npx hyperframes catalog
npx hyperframes catalog --type block
npx hyperframes catalog --type component
npx hyperframes catalog --type block --tag social
npx hyperframes catalog --json
npx hyperframes catalog --human-friendly
```

- 默认输出是一张易读的表格。它不会安装任何东西。
- `--type` 接受 `block` 或 `component`；`--tag` 可以进一步收窄任一结果。
- `--json` 是供 agent 和 CI 使用的确定性接口。选定一个名称，然后运行 `npx hyperframes add <name>`。
- `--human-friendly` 会打开一个选择器，并立即安装选中的条目。

## 兜底：读 registry manifest

CLI 不可用时，顶层的 `registry.json` 列出了所有可用条目：

```bash
curl -s https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry/registry.json
```

每一项都有 `name` 和 `type`（`hyperframes:example`、`hyperframes:block` 或 `hyperframes:component`）。

## 读取单个条目的 manifest

每个条目都有一个包含完整元数据的 `registry-item.json`：

```
<base>/<type-dir>/<name>/registry-item.json
```

其中 `<type-dir>` 是 `examples`、`blocks` 或 `components`。

## 条目 manifest 字段

| 字段 | 类型 | 必填 | 说明 |
| ---------------------- | -------- | -------- | ---------------------------------------------- |
| `name`                 | string   | 是 | kebab-case 标识符 |
| `type`                 | string   | 是 | `hyperframes:block` 或 `hyperframes:component` |
| `title`                | string   | 是 | 人类可读的标题 |
| `description`          | string   | 是 | 一行描述 |
| `tags`                 | string[] | 否 | 用于筛选的 tag（例如 `["data", "chart"]`） |
| `dimensions`           | object   | block 必填 | `{ width, height }` —— 仅 block |
| `duration`             | number   | block 必填 | 时长，单位为秒 —— 仅 block |
| `files`                | array    | 是 | 要安装的文件（`path`、`target`、`type`） |
| `registryDependencies` | string[] | 否 | 本条目依赖的其他 registry 条目 |

## 可用条目

### Block

要获得始终最新的列表，运行 `npx hyperframes catalog --type block`。**搜索才是事实来源；下面的表格是人工维护的样本，按设计就覆盖不全**——它们按类别归组了 registry 180 个 block 中的 97 个，所以某个 block 不在表里，并不能证明 registry 里没有它。只有 `npx hyperframes catalog --query "<what you want>" --json` 返回空结果才算证据。不要把这些表格往全集方向扩充；改用搜索。**Block 名 ≠ shader 名**：shader 转场类 block（例如 `domain-warp-dissolve`）包装了一个 HyperShader runtime，其内部名称省略了 `-dissolve`/`-warp` 后缀——标准名称请查看与 block 一起安装的展示 HTML。

#### Shader 转场（14）

单 shader 的 block；每个都会安装一个 HyperShader runtime 加一个展示 composition。每个视频最多用 2 个。

| 名称 | 说明 |
| ------------------------ | ------------------------------------------------------------------------ |
| `chromatic-radial-split` | 色差径向分离 |
| `cinematic-zoom`         | 戏剧性的变焦模糊 |
| `cross-warp-morph`       | 交叉扭曲变形 |
| `domain-warp-dissolve`   | 分形噪声域扭曲 |
| `flash-through-white`    | 白闪交叉淡化（很少适合作为中性默认——见 SKILL.md 的指引） |
| `glitch`                 | 数字 glitch 伪影 |
| `gravitational-lens`     | 引力透镜畸变 |
| `light-leak`             | 电影感漏光 overlay |
| `ridged-burn`            | 脊状湍流燃烧 |
| `ripple-waves`           | 同心涟漪波纹畸变 |
| `sdf-iris`               | 基于有符号距离场的光圈揭示 |
| `swirl-vortex`           | 旋涡扭曲 |
| `thermal-distortion`     | 热浪式热畸变 |
| `whip-pan`               | 快速甩镜（whip-pan） |

#### 转场陈列集（13）

按家族归组多种 CSS / GSAP 转场样式的展示 composition。用作挑选 CSS 场景转场时的参考；不打算原样嵌入。

| 名称 | 说明 |
| ------------------------- | ----------------------------------- |
| `transitions-3d`          | 3D 透视翻转和旋转 |
| `transitions-blur`        | 基于模糊的场景转场 |
| `transitions-cover`       | 覆盖 / 揭开式滑动 |
| `transitions-destruction` | 破坏式碎裂 |
| `transitions-dissolve`    | 溶解和淡化 |
| `transitions-distortion`  | 扭曲和畸变 |
| `transitions-grid`        | 基于网格的拼块 |
| `transitions-light`       | 基于光的辉光和闪光 |
| `transitions-mechanical`  | 机械快门和光圈 |
| `transitions-other`       | 其他创意类（VHS、重力、变形） |
| `transitions-push`        | 推移和滑动 |
| `transitions-radial`      | 径向擦除和揭示 |
| `transitions-scale`       | 缩放和变焦 |

#### Liquid Glass（7）

WebGPU + html-in-canvas 的毛玻璃表面。**需要 Brave / Chrome canary** 并启用 WebGPU——设置 `PRODUCER_HEADLESS_SHELL_PATH` 指向该浏览器；引擎会自动传入 `--enable-unsafe-webgpu`。见 `/hyperframes-animation` → `adapters/typegpu.md`。

| 名称 | 说明 |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `ios26-liquid-glass`        | 3D iPhone（GLTF）+ iOS 26 主屏幕、玻璃质感应用图标、shader 壁纸、通知 |
| `macos-tahoe-liquid-glass`  | 3D MacBook（GLTF）+ macOS Tahoe 风格桌面、玻璃菜单栏、Finder、Dock |
| `liquid-glass-widgets`      | 极光 shader 之上的毛玻璃数据卡片、展示面板、药丸形标签 |
| `liquid-glass-notification` | 漂浮在极光 shader 之上的毛玻璃通知卡片 |
| `vfx-liquid-glass`          | 用于液态玻璃效果的空白 VFX composition 外壳 |

#### VFX（6）

HTML-in-canvas + WebGL 的 composition block。底层 API 见 `/hyperframes-animation` → `adapters/three.md` 和 `adapters/html-in-canvas-patterns.md`。

| 名称 | 说明 |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `vfx-iphone-device`     | GLTF iPhone 15 Pro Max + MacBook Pro，屏幕为实时 HTML-in-canvas，玻璃透镜变形，360° 转台 |
| `vfx-liquid-background` | 有机液体模拟——在细分平面上做顶点位移，HTML 浮在上方 |
| `vfx-magnetic`          | VFX 外壳（磁力线处理） |
| `vfx-portal`            | VFX 外壳（传送门揭示） |
| `vfx-shatter`           | VFX 外壳（碎裂成碎片） |
| `vfx-text-cursor`       | 黑色舞台上的光标辉光 + 色差阴影射线 + 光谱边缘 |

#### 展示片（6）

叙事驱动的展示 composition——带旁白的 YouTube 风格插入片段。大多数附带音效（SFX）。

| 名称 | 说明 |
| -------------------------- | ----------------------------------------------------------------- |
| `app-showcase`             | 三块漂浮的智能手机屏幕，健身应用产品展示 |
| `apple-money-count`        | 计数器 $0 → $10,000，绿色闪光，钱币图标迸发，音效 |
| `blue-sweater-intro-video` | 温暖风格的 AI 创作者开场，最后落到一张 X 关注卡片 |
| `north-korea-locked-down`  | 地图推近，红色潦草圆圈，弹出"封锁"标签 |
| `nyc-paris-flight`         | 地图动画，飞机从纽约飞往巴黎，标记圆圈，落地弹跳，音效 |
| `vpn-youtube-spot`         | 应用商店滚动，VPN 安装流程，音效 |

#### 地图 + 数据可视化（8）

D3 + GSAP 的动画地理图和图表。

| 名称 | 说明 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| `us-map`                           | 美国分级统计图（choropleth），各州错开揭示，数值标签，渐变图例 |
| `us-map-bubble`                    | 美国气泡地图——按比例缩放的城市标记、标注、连接线 |
| `us-map-flow`                      | 美国流向地图——带动画的起讫点弧线 |
| `us-map-hex`                       | 美国六边形网格地图——每个州为等权重的六边形，按数据填充 |
| `spain-map`                        | 按自治区划分的西班牙分级统计图——D3 圆锥等角投影 |
| `world-map`                        | 世界分级统计图 + 旋转地球仪插图，D3 Natural Earth |
| `data-chart`                       | 动画柱状图 + 折线图，错开揭示，NYT 风格字体排印 |
| `flowchart` / `flowchart-vertical` | 决策树，SVG 连接线，便利贴样式节点，光标 + 打字修正（vertical = 竖屏） |

#### 社交 overlay（7）

一眼就能认出平台的 UI overlay。盖在一个段落节拍上，或者用作一拍的收尾。

| 名称 | 说明 |
| -------------------- | ------------------------------------------------ |
| `instagram-follow`   | 个人资料卡片 + 关注按钮 |
| `tiktok-follow`      | 个人资料卡片 + 关注按钮 |
| `yt-lower-third`     | 带头像的 YouTube 订阅 lower third |
| `x-post`             | 带互动数据的 X/Twitter 帖子卡片 |
| `reddit-post`        | 带点赞数和评论的帖子卡片 |
| `spotify-card`       | 带专辑封面和进度条的正在播放卡片 |
| `macos-notification` | 带应用图标和消息的 macOS 风格横幅 |

#### 品牌 + 3D UI（2）

| 名称 | 说明 |
| -------------- | ------------------------------------------------------------------- |
| `logo-outro`   | 逐块拼装的 logo，辉光绽放，标语淡入，URL 药丸 |
| `ui-3d-reveal` | 用于 UI 元素的透视 3D 揭示 |

#### 代码片段（24）

一个代码 / 终端窗口，**逐字符打出一段代码或 shell 会话**。主题只影响视觉外框；24 个的结构、接入方式和安装完全相同——按名字挑一个，像任何 block 一样接入（`data-composition-id` + `data-start` + `data-track-index`，见 `wiring-blocks.md`）。两个外框家族：

**Apple Terminal（12）** —— macOS Terminal.app 窗口在打一段 shell 会话。Profile = 窗口配色：

| 名称 | 外观 |
| --------------------------------- | -------------------------------- |
| `code-snippet-apple-terminal-pro` | 黑色背景，灰色文字，青柠色光标 |

#### 代码动画（9）

比上面静态的 `code-snippet-*` 窗口主题更丰富、以运动为先的对应物：每一个都是自包含的 1920×1080 block（约 5–8 秒），带一个暂停的、确定性的 GSAP timeline，对代码做*动画*——打字、diff、变形、聚光，或者 GPU 主视觉揭示——而不是在编辑器 / 终端外框里打出一段固定片段。**复用优先**：`npx hyperframes add <name>`，然后就地自定义内置的代码 / diff 内容；只有当没有 block 覆盖你需要的动作时才手写。

**DOM / 文字揭示（6）：**

| 名称 | 说明 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `code-typing`    | 按 token 流式打字揭示，光标（caret）跟着最前沿走（不用 CSS 动画）——屏幕上的现场编码 |
| `code-diff`      | 以彩色 diff 展示一次编辑：删除的行以红色收起，新增的行以绿色展开——行级的前后对比 |
| `code-morph`     | 一段代码变换成另一段，token 在位置之间滑动（Shiki Magic Move）——一次重构 / 从一种状态到另一种状态 |
| `code-highlight` | 高亮带扫过目标行，周围上下文变暗——聚光某一行 |
| `code-scroll`    | 镜头滚动一个长文件，把目标行居中并聚光——带人走读一个真实模块 |

**GPU / WebGL 主视觉揭示（3）：** 更重，用于标题卡 / hero 级的代码时刻。

| 名称 | 说明 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `code-3d-extrude`        | 带语法高亮的代码放在一块受光照、带倒角的 3D 厚板上，在真实空间中旋转后落定（真正的 WebGL 深度） |
| `code-shader-dissolve`   | 代码从带种子的噪声中浮现，带色差溶解前沿 + 边缘辉光，然后清晰地保持 |
| `code-particle-assemble` | 成千上万个 GPU 点飞向精确的字形像素，汇聚成可读的语法高亮代码 |

### Component

| 名称 | 说明 | Tags |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `grain-overlay`      | 动态胶片颗粒纹理 overlay | texture, grain, overlay, film                    |
| `shimmer-sweep`      | 用于 AI 点缀的 CSS 渐变扫光 | text, shimmer, highlight, effect                 |
| `morph-text`         | 黏滑的文字变形，循环切换一个可编辑的词表（SVG 阈值 + GSAP 模糊） | text, text-effect, typography, morph, gooey      |
| `grid-pixelate-wipe` | 场景之间的网格溶解转场 | transition, wipe, grid, pixelate                 |
| `parallax-zoom`      | 中央卡片放大到铺满画面，同时同级卡片向外视差移动（单个 `--pz-progress` 0→1） | transition, zoom, parallax, grid, hero           |
| `parallax-unzoom`    | `parallax-zoom` 的反向——焦点卡片从全画面缩小，同时同级卡片视差移入（`--pu-progress`） | transition, reveal, unzoom, parallax, grid, hero |
