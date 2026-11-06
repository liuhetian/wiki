---
description: "本站自己做的 3D 像素幸存者：台地悬崖地形上的 roguelite 小游戏，8 方向像素精灵、6 种武器、Boss 和三张地图，美术全由代码生成；配做出它的 prompt、四问问答（地图怎么做成 3D、命中看不看高低差、2D 角色进 3D 叫什么、8 个方向怎么画）和完整 Vite 工程"
---

# 3D 像素幸存者

<iframe src="/gallery/games/assets/terrace-survivors/index.html"
        style="width:100%;height:640px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="3D 像素幸存者：台地地形、8 方向像素精灵、自动攻击与怪物潮"></iframe>

[单独打开](assets/terrace-survivors/index.html){ target="_blank" rel="noopener" }

先在菜单里选地图和起始武器，点一下画面再按键。WASD 或方向键移动（相对镜头方向），空格跳；鼠标转视角 —— 点画面锁定指针，或者左键拖动、按 Q E；滚轮拉远近。E 开宝箱，1、2、3 选升级，Esc 或 P 暂停。只支持键鼠，没有音效。

一局 10 分钟，第 9 分钟刷出 Boss「远古岩魔像」，打倒就赢 —— 它会冲撞、砸落石，半血后狂暴。武器 6 种：奥术飞弹、星环护符、炎爆术、连锁闪电、新月斩、陨石雨；被动 5 种，各 5 级。经验宝石分蓝绿红三档，进拾取范围自动吸过来，磁铁吸走全图的宝石；宝箱花金币开，开出三选一，精英怪（金色描边）掉免费宝箱；站进神坛光圈充能 3.5 秒，得一项永久增益。地图三张：翠风高原、霜牙雪岭、赤砂峡谷，同一种子复现同一张图。

## Prompt { #prompt }

> 制作一个可直接在浏览器运行的 3D 像素风幸存者（survivor-like）roguelite 小游戏，用 Vite + TypeScript + three.js + postprocessing。地图用噪声高度场做阶梯量化，压成一层层台地和悬崖，土路成为天然坡道，每块台地都要走得到；地形 shader 对齐像素网格，两级 toon 光照，Bayer 抖动硬切。角色和怪物是 8 方向逐帧像素精灵，画在始终朝向镜头的 instanced billboard 上，后处理加深度描边和调色，让 2D 角色和 3D 地形看起来是一体的。美术全部用代码程序化生成，不用任何外部图片，精灵图集格式留出替换口。玩法：第三人称移动和跳跃、自动攻击、怪物潮、经验宝石、升级三选一；一局 10 分钟，结尾刷出 Boss；6 种武器、5 种被动各 5 级；宝箱、神坛、磁铁等地图互动物件；草原、雪山、沙漠三个生物群系，同一种子复现同一张地图。

## 怎么做出来的 { #how }

2026-11-05 在 Claude Code 里交给 Claude Opus 5.5，前后约 85 分钟。实际是几轮对话，上面那段是事后合成的一段：

1. 先让它调研 PokéBonk[^pokebonk] —— 一个 three.js 写的宝可梦幸存者同人游戏 —— 地图和角色怎么做的。结论：地形是阶梯量化的高度场加 toon shader，角色是 PMD 风格的逐帧图集，不是 Spine。约 10 分钟
2. 再要一个只留核心玩法的简化版。AI 没有复用 PokéBonk 和宝可梦的任何素材，改成同类玩法、同一套技术方案、美术全部原创；精灵图集格式和 PokéBonk 的 `sprites.json` 一致，留着以后换美术。它问了三件事：美术用代码生成；玩法在基础循环外，计时 Boss、多种武器、地图物件、多个群系四项全要；工程用 Vite + TypeScript。定计划约 20 分钟
3. 写代码约 55 分钟

成品是 39 个 TypeScript 模块，约 6200 行，依赖 three.js 和 postprocessing。没有一张图片文件：主角、6 种怪、地表 tile、树石草、特效和图标都在开局时由代码画出来。

AI 自己用无头浏览器截图、看、改了几轮，下面这些都是它自己找出来改掉的：

- 鼠标转视角相机不跟 → 鼠标增量在 60Hz 的逻辑步里就被清空，渲染时读不到；按键和鼠标增量改成分两次清
- 出生点五条土路交汇，土路占地太大 → 收窄路宽
- 测胜利流程时，死亡计时的正负号写反了（负数在它的约定里表示活着）→ 改成小的正随机数，怪的溶解有先有后
- 重开一局报 `getImageData` 性能警告 → 每张图集的脚底测量结果缓存起来

最后写了冒烟测试 [`smoke.mjs`](assets/terrace-survivors/source/scripts/smoke.mjs)：无头浏览器里让 bot 绕圈走、偶尔跳、升级选第一项，玩一局，页面报错就失败。替换美术的口子也实测过：把史莱姆图集导出、染成粉色放回去，重新加载看到粉色史莱姆。无头实测 500 只怪时，敌人逻辑约 0.33ms/帧，流场重建约 0.19ms（每 0.4 秒一次），渲染组装约 0.7ms，draw call 约 90；无头用的是软件渲染（约 10 FPS），只能验证逻辑和画面，不代表真机帧率。

## 问答 { #faq }

做完第二天问的四个问题。回答照录，文件名换成链到源码，另从 README 补了阶梯量化的公式和选方向行的算式。

### 地图是怎么做成 3D 的？成本高吗？ { #faq-terrain }

**做法：一张高度图，生成一整块网格。** 地图不是建模做的，也不是体素或拼块。

1. 在 251×251 的格点上用噪声（fbm）生成平滑起伏，相当于一张灰度高度图。
2. **阶梯量化**：把连续高度压成一层一层的台地，每层高 4.6。台地边缘被压成陡坡，看起来就是悬崖。公式是 `H = (floor(f) + smoothstep(.5-k, .5+k, fract(f))) * 4.6`。
3. 做一次模糊；土路附近不做量化，路就成了天然坡道。再用 BFS 检查每块台地能不能走到，走不到就修一条坡道。
4. 用 `PlaneGeometry` 按高度图抬起顶点，得到**一整块 mesh**，一次 draw call 画完。
5. 草地、高地、雪、路、悬崖石壁都在**同一个地形 shader** 里按坡度、高度和路径判断，决定采样哪张 128px 无缝 tile。

玩家移动、怪物寻路、弹道落地、相机防穿地都查同一张高度图 `terrain.height(x, z)`（双线性插值）。

**成本：**

| 项目 | 数据 |
| --- | --- |
| 渲染 | 约 6.3 万顶点、12.5 万三角形，1 次 draw call；现代显卡上基本可以忽略 |
| 内存 | 高度场 Float32 251² ≈ 250KB，烘焙阴影 560² 单通道，每个群系 6 张 128px tile |
| 生成耗时 | 每张图约 90–110ms（无头 Chrome 实测），开局时算一次 |
| 高度查询 | 约 12ns 一次，500 只怪每帧都查也没有压力 |
| 制作成本 | 不需要 3D 建模，也不需要关卡编辑器。一个群系只需一组参数和 6 张 tile。代码方面，地形生成约 440 行（[`terrain.ts`](assets/terrace-survivors/source/src/world/terrain.ts)），地形 shader 约 150 行（[`terrainMat.ts`](assets/terrace-survivors/source/src/world/terrainMat.ts)） |

**局限：** 高度图上每个 (x, z) 只能有一个高度，所以做不出山洞、桥、悬空平台这类结构，需要的话得另外放模型。

### 地图有了高度以后，技能命中会考虑高低差吗？ { #faq-height }

**部分会。** 现在的判定规则如下：

| 判定 | 看不看高度 | 具体规则 |
| --- | --- | --- |
| 奥术飞弹 | ✅ 看 | 在 3D 空间里追踪飞行，竖直方向差 < 1.4×体型才算命中；撞到地形（例如悬崖）直接消失 |
| 新月斩 | ✅ 看 | 扇形范围内，且高度差 ≤ 2.5。一层台阶高 4.6，所以砍不到崖上或崖下的怪 |
| 炎爆术 | ⚠️ 部分 | 抛物线弹道下落时撞到更高的地形会提前爆炸；但爆炸范围只算水平距离 |
| 陨石雨 | ⚠️ 部分 | 落点贴着地形；爆炸范围只算水平距离 |
| 星环护符 | ❌ 不看 | 只算水平距离 |
| 连锁闪电 | ❌ 不看 | 只按水平距离找下一个目标，也不检查是否被地形挡住 |
| 自动索敌 | ❌ 不看 | 按水平距离找最近的怪，不做视线检测 |
| 怪物碰撞伤害 | ✅ 看 | 高度差 < 1.8 才会受伤，所以站在崖上的怪碰不到崖下的你 |
| Boss 落石 | ❌ 不看 | 只算水平距离 |

**为什么不全部改成 3D 判定：** 幸存者类玩法里怪物基本都在你身边一圈。如果判定太严格，经常会出现"怪就在旁边却打不到"，玩起来很挫败。所以这里取了一个常见的折中：先按水平距离判定，再给个别技能加一道高度门槛。空间哈希本来就只按 xz 分格，多比较一次 y 几乎没有额外开销。

**想做得更严格也很简单：**

- 在爆炸和星环的判定里补一句 `Math.abs(敌人y - 中心y) < 阈值`。
- 加视线检测：沿两点连线每隔约 0.5 单位采样一次 `height()`，有采样点高过连线就算被挡住。单次查询只要 12ns，几十次采样也很便宜。

相关代码在 [`weapons.ts`](assets/terrace-survivors/source/src/game/weapons.ts)、[`projectiles.ts`](assets/terrace-survivors/source/src/game/projectiles.ts) 和 [`enemies.ts`](assets/terrace-survivors/source/src/game/enemies.ts)（碰撞伤害）。

### 角色是贴图吗？2D 贴图放进 3D 地图的做法叫什么？ { #faq-sprites }

**是贴图。** 每个角色是一张**序列帧图集**：8 个方向 × 5 个动作 × 每个动作若干帧。游戏里把它画在一张**始终面向镜头的四边形**上：

- 镜头从哪个方向看角色，就取图集里对应方向的那一行。
- 动作按每帧的时长逐帧切换。
- 不是 Spine 这类骨骼动画，也不是 3D 模型。

**这种做法的叫法：**

| 名称 | 指的是什么 |
| --- | --- |
| **Billboard（公告板）精灵** | 技术名词：一张始终朝向镜头的贴图面片 |
| **8 方向精灵（directional sprites）** | 按观察角度切换不同方向的图。从《毁灭战士》（1993）那一代 3D 游戏就开始用 |
| **2.5D** | 最笼统的叫法，泛指 2D 和 3D 混在一起的画面 |
| **HD-2D** | Square Enix 为《八方旅人》提出的叫法：像素角色 + 3D 场景 + 景深、光照、Bloom 等后处理。后来的《三角战略》、《勇者斗恶龙 III HD-2D》也用这个名字。**"像素角色站在 3D 世界里"这类风格，现在大家最常用的就是这个词** |

《饥荒》、《咩咩启示录》（Cult of the Lamb）也是"2D 角色 + 3D 场景"，只是角色用的是手绘骨骼动画，不是像素序列帧。

**要让 2D 角色和 3D 地图看起来是一体的，本项目做了这几件事：**

- **统一像素密度**：角色贴图和地面 tile 都按 13.5 像素/世界单位对齐。否则角色看起来像贴上去的贴纸。
- **略向镜头倾斜**：面片朝镜头方向倾斜 35%（`uLean`），俯视时角色不会被压扁。
- **用 alpha test，不用半透明混合**：这样上千个精灵不需要排序。
- **脚下加 blob 阴影**：让角色看起来是站在地面上，而不是浮着。
- **统一的后处理**：描边和调色同时作用在 2D 角色和 3D 地形上，把两者的观感拉到一起。

面片、选帧和 8 方向在 [`spriteBatch.ts`](assets/terrace-survivors/source/src/render/spriteBatch.ts)。方向行号按相机坐标系算：`round(atan2(right·v, -fwd·v) / 45°) & 7`。

**代价：** 美术量随"方向数 × 动作数 × 帧数"成倍增长。手绘时常见的省法是只画 5 个方向，另外 3 个用水平镜像。另外，角色只按一个固定俯角（约 24°）绘制，所以镜头俯仰不能拉得太离谱，否则会穿帮。

### 2D 贴图的多个视角是怎么做出来的？ { #faq-views }

**本项目：用代码生成。每个角色只有一份 3D 描述，渲染 8 次就得到 8 个方向。** 没有手绘图，也没有一张张独立的图片文件。

1. **用椭球拼成角色**（[`creatures.ts`](assets/terrace-survivors/source/src/art/creatures.ts)）：每个角色在代码里是一组椭球，每个椭球有中心、三个半径、旋转角和材质。例如史莱姆只有 5 个椭球：身体、两只眼睛、嘴、高光。主角法师复杂一些，有身体、头、帽子、手臂、法杖等。
2. **用 pose 函数描述每一帧**：给定"哪个动作、第几帧"，返回各部件的位置和角度，以及整体的压扁、抬起、前冲、后仰。例如史莱姆走路的 4 帧，就是 4 组不同的压扁和跳起系数。
3. **自己写的软件光栅器把它画成像素画**（[`rig.ts`](assets/terrace-survivors/source/src/art/rig.ts)）：
    - 用俯角约 24° 的正交相机，对每个像素做射线与椭球求交，取最前面的表面。
    - 按光照把亮度压成 4 阶色板，形成卡通色带。
    - 外轮廓描 1px 深色边；部件互相重叠的地方加内轮廓线，这样看起来更像手绘像素画。
4. **转 8 次相机**：每次绕角色转 45°，画一遍，就是 8 个方向。结果拼进**同一张图集**，每个动作占 8 行（每个方向一行）× n 帧。这张图在浏览器启动时现场生成，只存在内存里，格式和 PMD 的 `sprites.json` 一致。

**优点：**

- 8 个方向来自同一个模型，比例和配色天然一致，不会出现"转个身就变形"。
- 改造型、做换色变体，只需要改几个数字。
- 美术成本为零。

**缺点：** 造型只能是一些"圆滚滚"的形体组合，细节、表情和手感远不如手绘。

业界常见的三种做法：

| 做法 | 多个视角怎么来 | 优点 | 缺点 | 例子 |
| --- | --- | --- | --- | --- |
| **逐方向手绘** | 画师把每个方向的每一帧都画出来。常见省法是只画 5 个方向（正、斜前、侧、斜后、背），另外 3 个用水平镜像 | 质量最高，最有风格 | 工作量最大；各方向是否一致全靠画师 | PMD 系列精灵（PokéBonk 用的就是这类），大多数像素风游戏 |
| **3D 预渲染** | 先做 3D 模型和骨骼动画，在 8 个角度各渲染一遍导出成图，再像素化或手工修图 | 视角一致；加一个动作的成本低 | 需要 3D 美术和一套渲染流程；直接渲出来的图像素感不够，通常还要人工修 | 《暗黑破坏神 2》、《死亡细胞》（侧视） |
| **代码生成**（本项目） | 用代码描述简单的 3D 形体，由程序渲染 | 零美术成本，可以批量出变体 | 造型简单 | 本 Demo |

本项目的做法，其实就是"3D 预渲染"的极简版：模型换成了椭球，渲染器换成了约 200 行自己写的代码。

想换成真美术的话：

- 有 3D 美术：推荐 **3D 预渲染**。在 Blender 里固定俯角约 24°，用正交相机，绕 Y 轴每 45° 渲染一张，关掉抗锯齿后缩到目标像素尺寸，最后手工修一下。
- 只有 2D 美术：**手绘 5 个方向，再镜像出另外 3 个**。
- 两种方式最后都输出成一张 PNG 加一个 JSON，格式见下文[换自己的美术](#sprites)。注意目前的加载器**不会自动镜像**，需要先把镜像好的 8 行都放进图里。行号对应关系是：0 面向镜头，2 朝右，4 背对，6 朝左；可以互为镜像的是 1↔7、2↔6、3↔5。

## 拿去改 { #tweak }

把 [`source/`](assets/terrace-survivors/source/package.json) 下的文件拷到本地，`npm install` 后 `npm run dev` 开 `http://localhost:5180`；改完 `npm run build` 出 `dist/`，整个目录丢到任意静态服务器就能跑。

- 数值平衡 —— 敌人、武器各级数值、被动、经验曲线：[`game/data.ts`](assets/terrace-survivors/source/src/game/data.ts)
- 三张地图的地形形状、配色、怪物构成：[`world/biomes.ts`](assets/terrace-survivors/source/src/world/biomes.ts)
- 刷怪节奏、精英和 Boss 出场：[`game/director.ts`](assets/terrace-survivors/source/src/game/director.ts)
- 角色造型和动作：[`art/creatures.ts`](assets/terrace-survivors/source/src/art/creatures.ts) 里每个角色的椭球和 pose 函数

测试用的 URL 参数，加在 demo 地址后面：

| 参数 | 作用 |
| --- | --- |
| `?biome=meadow\|snow\|desert&seed=N&weapon=bolt` | 跳过菜单直接开局 |
| `?time=120` | 一局的时长（秒），Boss 在 90% 处出现 |
| `?debug` | 调试面板（FPS、draw call、实体数）。快捷键：F1 无敌 · F2 升级 · F3 +100 只怪 · F4 跳 60 秒 · F5 立即召唤 Boss · F6 全武器 |
| `?spawn=500` | 场上至少保持 N 只怪（压力测试） |
| `?px=2` | 低分辨率渲染再像素放大，像素感更强 |
| `?art` / `?art&sheet=hero&anim=walk&scale=3` | 美术预览页：tile、物件图集、特效、角色序列帧 |

### 换自己的美术 { #sprites }

把 `<id>.png` 和 `<id>.json` 放进工程的 `public/sprites/`（打包后是和 `index.html` 同级的 `sprites/`），就会替换对应的程序生成图集。id 可选 `hero`、`slime`、`bat`、`mushroom`、`beetle`、`gargoyle`、`golem`。JSON 格式：

```json
{
  "w": 240, "h": 1600,
  "anims": {
    "walk":   { "y": 0,   "fw": 40, "fh": 46, "n": 6, "rows": 8, "d": [7,7,7,7,7,7] },
    "idle":   { "y": 368, "fw": 40, "fh": 46, "n": 4, "rows": 8, "d": [26,10,26,10] },
    "attack": { "...": "..." }, "hurt": { "...": "..." }, "faint": { "...": "..." }
  }
}
```

- 每个动作在图里占一块：8 行对应 8 个方向（0 = 面向镜头，2 = 朝右，4 = 背对，6 = 朝左），每行 `n` 帧，`y` 是这一块的起始像素行
- `d` 是每帧持续的 tick 数（按 60fps 计）
- 缺少的动作用 walk 代替；`rows: 1` 表示不分方向
- 脚底位置自动从 walk 第一帧的 alpha 测出来；贴图密度约 13.5 像素/世界单位

## 源码 { #source }

上面 iframe 跑的是打包产物：`index.html` 加一个 725KB 的 `index-Be4VVCnG.js`，three.js 和 postprocessing 都打在里面，压缩过，不用读。能读的是 `source/` 下的整个工程，和原项目一字不差，收的是 2026-11-06 的版本；依赖是 Vite 8、TypeScript 7、three.js 0.187、postprocessing 6.39，锁在 [`package-lock.json`](assets/terrace-survivors/source/package-lock.json)。

| 文件 | 管什么 |
| --- | --- |
| [`src/main.ts`](assets/terrace-survivors/source/src/main.ts) | 入口：生成美术 → 主菜单 → 开局；读 URL 参数 |
| [`core/rng.ts`](assets/terrace-survivors/source/src/core/rng.ts) | 种子随机数和噪声，同一种子出同一张地图、同一套精灵 |
| [`core/input.ts`](assets/terrace-survivors/source/src/core/input.ts) | 键鼠；拿不到指针锁定时左键拖动和 Q E 转视角 |
| [`core/loop.ts`](assets/terrace-survivors/source/src/core/loop.ts) | 固定步长 60Hz 逻辑，渲染帧率不定 |
| [`art/index.ts`](assets/terrace-survivors/source/src/art/index.ts) | 开局生成全部美术；有自制图集就用自制的 |
| [`art/pixel.ts`](assets/terrace-survivors/source/src/art/pixel.ts) | 像素画工具：环绕写入（无缝 tile）、色阶 |
| [`art/rig.ts`](assets/terrace-survivors/source/src/art/rig.ts) | 椭球小骨架的软件光栅器：色带着色、选择性描边、内轮廓线 |
| [`art/creatures.ts`](assets/terrace-survivors/source/src/art/creatures.ts) | 主角与 6 种原创怪：椭球加每个动作的 pose 函数 → 8 方向 × 5 动作图集 |
| [`art/tiles.ts`](assets/terrace-survivors/source/src/art/tiles.ts) | 128px 无缝地表 tile：草地、高地、雪、沙、路、悬崖石墙或砂岩层 |
| [`art/props.ts`](assets/terrace-survivors/source/src/art/props.ts) | 物件图集：树、松、灌木、岩石、仙人掌、棕榈、冰晶、草丛 |
| [`art/fx.ts`](assets/terrace-survivors/source/src/art/fx.ts) | 特效图集与 UI 图标 |
| [`render/renderer.ts`](assets/terrace-survivors/source/src/render/renderer.ts) | WebGLRenderer、天空、雾、灯光、后处理链 |
| [`render/post.ts`](assets/terrace-survivors/source/src/render/post.ts) | 后处理：PixelOutline 深度描边、ToonGrade 调色 |
| [`render/glsl.ts`](assets/terrace-survivors/source/src/render/glsl.ts) | 共用 GLSL：哈希、噪声、4×4 Bayer 抖动矩阵 |
| [`render/spriteBatch.ts`](assets/terrace-survivors/source/src/render/spriteBatch.ts) | 角色精灵：每个物种一个 InstancedMesh，billboard shader，选帧与 8 方向 |
| [`render/propBatch.ts`](assets/terrace-survivors/source/src/render/propBatch.ts) | 物件：圆柱 billboard、风摆、挡住玩家时 screen-door 透明 |
| [`render/fxBatch.ts`](assets/terrace-survivors/source/src/render/fxBatch.ts) | 弹道、粒子、宝石、地面贴花的实例化批次，以及 blob 阴影 |
| [`render/toonModel.ts`](assets/terrace-survivors/source/src/render/toonModel.ts) | 宝箱、神坛：3 阶 MeshToonMaterial 加反向外壳描边 |
| [`world/terrain.ts`](assets/terrace-survivors/source/src/world/terrain.ts) | 高度场：fbm → 阶梯量化 → 模糊 → BFS 连通台地并修坡道；静态碰撞 |
| [`world/terrainMat.ts`](assets/terrace-survivors/source/src/world/terrainMat.ts) | 地形 shader：像素网格对齐、Bayer 抖动分区、toon 两级光照、悬崖贴图、雪线、风带、云影 |
| [`world/scatter.ts`](assets/terrace-survivors/source/src/world/scatter.ts) | 物件撒点（聚簇、坡度和路径过滤）与烘焙阴影 |
| [`world/biomes.ts`](assets/terrace-survivors/source/src/world/biomes.ts) | 生物群系参数 |
| [`game/game.ts`](assets/terrace-survivors/source/src/game/game.ts) | 一局的状态机与帧组装 |
| [`game/player.ts`](assets/terrace-survivors/source/src/game/player.ts) | 主角：相对镜头移动、跳跃、悬崖阻挡、无敌帧 |
| [`game/camera.ts`](assets/terrace-survivors/source/src/game/camera.ts) | 第三人称轨道相机：被地形挡住时拉近，不钻地 |
| [`game/enemies.ts`](assets/terrace-survivors/source/src/game/enemies.ts) | 敌人：SoA 存储、追击与分离、悬崖绕行、飞行、溶解死亡、Boss 冲撞和落石 |
| [`game/flow.ts`](assets/terrace-survivors/source/src/game/flow.ts) | 流场寻路：从玩家所在格 BFS，每格最多爬 0.9、往下随便跳，怪绕开悬崖走坡道 |
| [`game/director.ts`](assets/terrace-survivors/source/src/game/director.ts) | 刷怪节奏：随时间加量、精英、包围潮、Boss |
| [`game/weapons.ts`](assets/terrace-survivors/source/src/game/weapons.ts) | 武器行为：索敌和发射；数值在 `data.ts` |
| [`game/projectiles.ts`](assets/terrace-survivors/source/src/game/projectiles.ts) | 弹道：追踪飞弹、抛物线火球和陨石、Boss 落石，爆炸范围伤害 |
| [`game/pickups.ts`](assets/terrace-survivors/source/src/game/pickups.ts) | 经验宝石、金币、回血果、磁铁 |
| [`game/interact.ts`](assets/terrace-survivors/source/src/game/interact.ts) | 宝箱与神坛 |
| [`game/upgrades.ts`](assets/terrace-survivors/source/src/game/upgrades.ts) | 升级与宝箱的三选一 |
| [`game/grid.ts`](assets/terrace-survivors/source/src/game/grid.ts) | 空间哈希：分离、索敌、命中检测 |
| [`game/fxsys.ts`](assets/terrace-survivors/source/src/game/fxsys.ts) | 粒子、地面环、预警、闪电、伤害数字 |
| [`game/data.ts`](assets/terrace-survivors/source/src/game/data.ts) | 数值表：敌人、武器等级、被动、经验曲线 |
| [`ui/hud.ts`](assets/terrace-survivors/source/src/ui/hud.ts) | DOM HUD：经验条、血条、计时、小地图、武器栏、Boss 血条 |
| [`ui/menus.ts`](assets/terrace-survivors/source/src/ui/menus.ts) | 加载、主菜单、三选一、暂停、结算 |
| [`ui/style.css`](assets/terrace-survivors/source/src/ui/style.css) | 界面样式 |
| [`debug/overlay.ts`](assets/terrace-survivors/source/src/debug/overlay.ts) | `?debug` 调试面板 |
| [`scripts/smoke.mjs`](assets/terrace-survivors/source/scripts/smoke.mjs) | 无头冒烟测试：bot 自动玩一局，检查页面报错 |
| [`scripts/shot.mjs`](assets/terrace-survivors/source/scripts/shot.mjs) | 无头截图 |
| [`index.html`](assets/terrace-survivors/source/index.html)、[`package.json`](assets/terrace-survivors/source/package.json)、[`tsconfig.json`](assets/terrace-survivors/source/tsconfig.json)、[`vite.config.ts`](assets/terrace-survivors/source/vite.config.ts) | 页面入口与工程配置 |

问答和「拿去改」提到的几篇：

??? abstract "`world/terrain.ts` —— 高度场、阶梯量化、台地连通与修坡道"

    ```ts
    --8<-- "gallery/games/assets/terrace-survivors/source/src/world/terrain.ts"
    ```

??? abstract "`world/terrainMat.ts` —— 地形 shader"

    ```ts
    --8<-- "gallery/games/assets/terrace-survivors/source/src/world/terrainMat.ts"
    ```

??? abstract "`world/biomes.ts` —— 三张地图的参数"

    ```ts
    --8<-- "gallery/games/assets/terrace-survivors/source/src/world/biomes.ts"
    ```

??? abstract "`render/spriteBatch.ts` —— billboard 精灵、选帧与 8 方向"

    ```ts
    --8<-- "gallery/games/assets/terrace-survivors/source/src/render/spriteBatch.ts"
    ```

??? abstract "`art/creatures.ts` —— 角色的椭球与 pose 函数"

    ```ts
    --8<-- "gallery/games/assets/terrace-survivors/source/src/art/creatures.ts"
    ```

??? abstract "`art/rig.ts` —— 椭球画成像素画的软件光栅器"

    ```ts
    --8<-- "gallery/games/assets/terrace-survivors/source/src/art/rig.ts"
    ```

??? abstract "`game/weapons.ts` —— 武器索敌与发射"

    ```ts
    --8<-- "gallery/games/assets/terrace-survivors/source/src/game/weapons.ts"
    ```

??? abstract "`game/projectiles.ts` —— 弹道与爆炸"

    ```ts
    --8<-- "gallery/games/assets/terrace-survivors/source/src/game/projectiles.ts"
    ```

??? abstract "`game/enemies.ts` —— 敌人移动、碰撞伤害与 Boss"

    ```ts
    --8<-- "gallery/games/assets/terrace-survivors/source/src/game/enemies.ts"
    ```

??? abstract "`game/director.ts` —— 刷怪节奏"

    ```ts
    --8<-- "gallery/games/assets/terrace-survivors/source/src/game/director.ts"
    ```

??? abstract "`game/data.ts` —— 数值表"

    ```ts
    --8<-- "gallery/games/assets/terrace-survivors/source/src/game/data.ts"
    ```

[^pokebonk]: [PokéBonk](https://pokebonk.com/)，2026-11-05 调研。
