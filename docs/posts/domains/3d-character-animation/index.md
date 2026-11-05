---
description: "三维角色模型 · 给模型、关节和动作，任意视角下算出连续画面；比较建模软件蒙皮、关节拼装、程序化生成三条路线并对照 Spine，用照像素画做的小橘猫和放羊的微缩牧场看建模成本、程序化动画和四足行走"
---

# 三维角色动画（3D Character Animation）：给模型、关节和动作，任意视角下算出此刻的姿态

**三维角色动画的通用功能是：给一个三维角色模型、动作和时间，算出此刻每个关节的姿态，再从任意视角画出来。** 在[领域地图](../index.md#transformation)上归「内容变换」，处理对象是三维角色模型 —— 网格加一套关节。和[二维角色动画](../2d-character-animation/index.md)比，多出来的是空间：视角随便转，光照和阴影由渲染器实时算；代价是先得有一个三维模型。这里关注网页和小游戏里实时跑的小角色；模型怎么做、关节怎么绑，是它的前处理。

方向是几个需求逼出来的：没有美术也想要一群各不相同的角色，逼出程序化建模；动作要跟着状态现算，逼出程序化动画；脚要踩实地面，逼出腿部 IK 和程序化步态。术语采用 glTF 规范和 three.js 动画系统的叫法 —— 关节动画（articulated）、蒙皮（skinning）、动画片段（clip）、混合（blending）；IK 和步态用游戏动画的通用叫法。[^gltf][^three-anim]

## 通用功能：模型加时间，得到任意视角的一帧 { #basic }

- **输入**：网格（形状和材质）、关节层级、可选的蒙皮权重；动画片段或程序给的关节值；当前时间。交互角色再加状态：走还是停、有没有被拖起来。
- **输出**：每帧每个关节的变换，渲染成任意视角的画面；光照和阴影由渲染器按场景算。
- **顺手处理的**：播放、循环、变速、几个动作按权重混合、整体位移和转向。混合的道理和二维一样，见[二维的动画混合](../2d-character-animation/index.md#transition)；three.js 里是 `AnimationMixer` 给每个片段一个权重，`crossFadeTo` 让当前片段淡出、目标片段淡入。
- **典型用途**：网页吉祥物、三维小游戏和微缩场景、产品展示里的角色、虚拟形象。
- **管不了的**：模型长什么样（前处理）；角色该往哪走、怎么让开别人（寻路，相邻任务）；脚和地面、手和物体的真实接触 —— 不另做 IK 或物理，动画片段只会照原样播放。

### 要先有可动的模型：建模、绑定与蒙皮（modeling、rigging、skinning）· 前处理 { #rigging }

**三维的前处理比二维重**：二维拆的是已经画好的图，三维要先造出形状，再决定哪里能弯。「能弯」有两种做法，glTF 规范都支持：

> “glTF supports articulated and skinned animation via key frame animations of nodes' transforms”[^gltf]

- **关节动画（articulated）**：身体拆成刚性部件，挂在节点层级上，转节点就转部件。关节处是两个部件互相穿插，弯不出连续的皮肤。下文的猫和羊都是这种
- **蒙皮动画（skinned）**：一张连续网格，每个顶点按权重跟着几根骨骼走，关节处的皮肤会被拉伸、弯折。建模软件导出的角色多是这种，和 Spine 的加权网格是一回事

动作从哪来是另一个维度：手做关键帧、动作捕捉、现成的动作库，或者代码每帧现算。

## 三条路线：建模软件蒙皮、关节拼装、程序化生成 { #routes }

| 路线 | 存什么、运行时做什么 | 成本落在哪 | 适合 |
|---|---|---|---|
| 建模软件 + 蒙皮 + 关键帧（DCC、glTF） | 网格、贴图、骨架、权重、动画片段打包成 glTF；运行时 `AnimationMixer` 按片段算骨骼，GPU 做蒙皮 | 美术工时：建模、展 UV、画贴图、绑骨骼、刷权重、做动作，每个角色、每个动作都要做 | 造型要求高、动作多，有美术或现成资产 |
| 关节拼装（articulated） | 代码用椭球等基本体拼部件，`Group` 层级当关节；不存动画片段，每帧算关节角 | 每个细节都写成数，靠截图迭代 | 卡通低多边形、要大量变体、没有美术 |
| 程序化生成 + 蒙皮（procedural） | 代码把基本体平滑融合成一张网格，自动生成骨架和权重再蒙皮，IK 步态驱动 | 写生成器的工程量大；写成之后每种动物主要是数据 | 要连续皮肤、毛发和很多物种，能投入引擎开发 |

第三条有现成的例子：threejs-procedural-animals 在 three.js 里生成 24 种动物，README 开头就说：

> “generated entirely in code: no models, no textures, no animation clips.”[^pa]

它和下文小橘猫的起点相同 —— 都用椭球等基本体拼身体，分歧在拼的方式。它的文档写明：

> “`k` is the smooth-union blend radius, and 0 gives a hard union.”[^pa]

它把基本体当作有符号距离场（SDF）平滑融合，再重新生成一张网格、自动算权重、做双四元数蒙皮；小橘猫只是让各部件的网格互相穿插，接缝靠毛团和花纹遮住，相当于不重新生成网格的 `k = 0`。省掉的是网格化和自动权重这一大块工程，代价是关节处只能刚性地转，弯不出皮肤。这里只读了它的文档，没有运行。

## 和二维对照：Spine 那一套在三维里叫什么 { #vs-2d }

**Spine 的骨骼动画和三维蒙皮是同一套思路，差别在视角画死在图里。** 概念一一对得上：

| Spine（二维） | 三维 |
|---|---|
| 图集里的部件图 | 网格和材质 |
| 骨骼 | 关节层级：glTF 的节点，three.js 的 `Bone` 或 `Group` |
| 网格权重 | 蒙皮权重 |
| 动画时间轴 | 动画片段（`AnimationClip`） |
| 轨道混合与叠加 | `AnimationMixer` 的权重、淡入淡出、加法混合 |
| IK 约束：管 1 或 2 根骨骼，弯曲方向取 1 或 −1 | 两骨骼 IK，膝盖朝哪边同样二选一（下文羊的前后腿各取一个） |
| 物理约束（4.2 起） | three.js 本身不带物理，要另接 |

Spine 运行库源码里对 IK 约束的注释：

> “An IK constraint adjusts the rotation of 1 or 2 constrained bones so the tip of the last bone is as close to the target bone as possible.”[^spine]

不一样的地方：

- **视角**：二维的视角画死在图里，转到侧面、背面要补画（见二维地图的[扩大表现范围](../2d-character-animation/index.md#limits)）；三维随便转，光照阴影自动对
- **素材起点**：二维从一张立绘拆图开始，美术画过的就是成品质感；三维要先造形，卡通风格也得建模
- **授权**：Spine 运行库许可写明，按 Spine 编辑器许可协议第 2 节的条款可以集成运行库，否则产品的每个使用者都要自己持有 Spine 编辑器授权[^spine]；three.js 是 MIT，glTF 是开放标准
- **运行时**：二维每帧算骨骼和网格，画在一个平面上；三维多了深度、光照和阴影贴图那一遍

## 没有美术也要一群角色：程序化建模（procedural modeling）· 前处理 { #procedural-modeling }

**用代码当建模软件：形状是变形过的椭球，花纹写进顶点色，不要贴图。** 例子是照一张像素画做的小橘猫 —— 坐着，举起左前爪挥手，大眼睛带高光，张嘴吐舌，胸口和脚掌奶白，尾巴向上卷。

<figure markdown>
![参考图：举爪挥手的像素画小橘猫](assets/cat-reference.png){ width="300" }
<figcaption>参考图（用户提供的像素画）</figcaption>
</figure>

<iframe src="/posts/domains/3d-character-animation/assets/cat.html"
        style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="小橘猫：程序化建模的三维模型"></iframe>

[单独打开小橘猫演示](assets/cat.html){ target="_blank" rel="noopener" }

拖动旋转，滚轮或双指缩放；动画有挥手、眨眼、歪头、抖耳、摇尾和呼吸。

### 形状：一块积木拼全身 { #shape }

只用一块积木 —— **细分过的二十面体单位球**。每个部件给它位置、三轴缩放、旋转和一个可选的变形函数：头是头顶压平、腮帮略鼓的椭球；两团奶白小椭球挤出「ω」形上唇，下面一个深色椭球当张开的嘴、一个粉色小椭球当舌头；身体是坐成平底的下宽上窄椭球；耳朵是压扁的三棱锥；尾巴是沿曲线排的 12 节胶囊。核心是 `Builder.ellipsoid`：遍历单位球的每个三角面，先变形、再缩放和摆放，颜色由涂色函数按这个面的朝向决定。

```js title="assets/js/cat.js:78-98"
--8<-- "posts/domains/3d-character-animation/assets/js/cat.js:78:98"
```

- 部件最后合进少数几个 `BufferGeometry`，共用一个「顶点色 + 平面着色」材质 —— 低多边形的块面感是平面着色给的
- `shade` 给每个面加一点随机明度，块面更明显

### 花纹：大块按朝向涂色，细线另贴笔触 { #pattern }

**大块颜色按面的朝向算，一个函数画完。** 涂色函数拿到的是三角面中心在单位球上的方向 `d`：`d.z` 大是朝前，`d.y` 大是朝上。胸口的奶白倒三角和身上斜走的条纹：

```js title="assets/js/cat.js:171-178"
--8<-- "posts/domains/3d-character-animation/assets/js/cat.js:171:178"
```

**细条纹不能这么画** —— 颜色以三角面为单位，条纹和三角面差不多宽时边缘碎成菱形格。初版额头的竖纹就是一片菱形块，把头部细分从 3 级提到 4 级（5120 个面）也没救回来；最后改成贴在表面的扁椭球「笔触」：算出头部椭球表面某点的位置和法线，按走向摆一个扁椭球，稍微嵌进去。

```js title="assets/js/cat.js:217-225"
--8<-- "posts/domains/3d-character-animation/assets/js/cat.js:217:225"
```

经验是：**大面积色块交给涂色函数，细线交给几何。** 尾巴同理 —— 初版是首尾相接的椭球，接缝处变细像一串珠子；换成同半径的胶囊后，相邻两节在关节处是同一个球面，连成一根光滑的管子。

### 成本：资产近乎为零，时间花在「看图再改」 { #cost }

数字在无头 Chromium、软件渲染下量得，测法见文末[实测](#tests)：

| | 小橘猫 | 一只绵羊 |
|---|---|---|
| 代码 | `cat.js` 442 行、21 KB，含动画 | `sheep.js` 701 行、32 KB，含动画和行走转向 |
| 外部资源 | 无 | 无 |
| 网格 / 三角面 | 21 个 / 8276 个 | 15 个 / 4530 个 |
| 生成一只的耗时 | 约 5–8 ms | 约 1.2 ms |
| AI 做完用时 | 约 10 分钟 | 约 30 分钟，是整片牧场的，含地形、交互和测试 |

- **改参数就是改模型**：颜色、比例、腿长、步幅都在文件顶部的参数对象里，改完刷新就生效
- **变体几乎免费**：羊毛团的随机分布由 `seed` 决定，11 只羊各不相同；复制一只就是拿同一个 `seed` 再生成一次
- **每改一次都要看图**：坐标和尺寸是手写的数，写错不报错，只会长歪。猫在初版后又改了两轮，羊改了一轮，每轮都是「截图 → 看 → 改数」
- **形状语言受限**：基本体拼出来的天然是圆润卡通；写实的肌肉、褶皱走这条路成本陡增，不如走建模软件那条路

## 动作跟着状态现算：程序化动画（procedural animation） { #procedural-animation }

**骨架就是 `Group` 的父子层级，动画是每帧算出来的关节角。** 每个能动的地方放一个空 `Group` 当关节，部件网格挂在它下面。小猫的层级：

```text
root
├─ body                       呼吸（缩放）
├─ headPivot                  歪头、点头、左右看
│  ├─ 左耳 pivot / 右耳 pivot   抖耳朵
│  └─ 左眼 / 右眼               眨眼（y 方向压扁）
├─ armPivot                   挥手（肩）
│  └─ wrist                   手腕摆动
└─ 尾巴 12 节关节链             逐节摆动
```

关节要放在转动的支点上 —— 头的支点在脖子，不在头中心，否则歪头变成整个头平移。没有关键帧，各关节角每帧用正弦波和包络现算：

```js title="assets/js/cat.js:404-438"
--8<-- "posts/domains/3d-character-animation/assets/js/cat.js:404:438"
```

- 包络 `env` 让挥手「挥 2.6 秒、停 1.6 秒」，停的时候爪子仍举着
- 手腕比肩晚一个相位（`- 0.7`），爪子会甩起来
- 尾巴每节比上一节晚一点相位（`- i * 0.55`），摆动从根部传到尾尖

和关键帧片段比：片段是动画师调出来的，表演细腻，能套到同一副骨架的别的角色上；程序化动画不用做片段、能随状态和参数变，表演力有限，调参同样靠看图。羊的四种动作各是一个「姿态函数」，按权重混合、约 0.3 秒过渡，相当于把 `AnimationMixer` 的混合挪到姿态这一层自己做。

## 脚要踩实地面：腿部 IK 与程序化步态（foot IK、procedural locomotion） { #locomotion }

**姿态写死在网格里就走不了。** 小橘猫的身体、两条后腿和着地的前腿合成了一个网格，只有头、耳朵、眼睛、挥手的前爪和尾巴有关节；要走得照羊的做法重做下半身。程序化模型是为某个姿态写的代码，换姿态就是改代码。

羊从一开始按「要走路」建：四条腿各两节，动画不给关节角度，只给「脚该踩在哪」，两骨骼 IK 用余弦定理反算髋和膝：

```js title="assets/js/sheep.js:675-696"
--8<-- "posts/domains/3d-character-animation/assets/js/sheep.js:675:696"
```

步态只描述脚的轨迹：支撑相脚线性后移，摆动相按余弦曲线前移并抬起。

```js title="assets/js/sheep.js:444-462"
--8<-- "posts/domains/3d-character-animation/assets/js/sheep.js:444:462"
```

走起来碰到的问题和解法：

| 问题 | 解法 | 效果 |
|---|---|---|
| 脚在地上打滑 | 支撑相里脚相对身体后移的速度正好等于前进速度 | 支撑脚钉在地面上 |
| 四条腿的先后 | 侧向序列步态：左后 → 左前 → 右后 → 右前，相位各差四分之一周期，每条腿 62% 的时间着地 | 相邻两腿的迈步略有重叠，任何时刻至少两条腿着地 |
| 膝盖弯成 Z 字形 | 初版两节腿加起来比髋高长，走路时身体又压低一截；改成腿长恰好等于髋高，走路不压低身体 | 站立时腿伸直，只在迈步时弯 |
| 前后腿膝盖朝向 | IK 的两个解里，前腿腕关节朝前、后腿跗关节朝后 | 和真羊一致；对应 Spine IK 的弯曲方向 1 或 −1 |
| 走出草地、掉进河里、撞树 | 每帧往前探约一个半身长，探点不能走就在左右若干角度里找最近的可走方向 | 20 只羊连续走 10 分钟（模拟）：越界 0 次、卡住 0 只 |
| 羊和羊互相穿过 | 前方有羊就转向绕开，再加一道硬分离：中心距离小于 0.82 就互相推开 | 互相穿插的采样从 218 次降到 0 |

还没解决的：

- **原地转身脚会滑**：不在行走时旋转羊，整只羊绕竖轴转，脚没有跟着迈步
- **坡地不贴合**：IK 只在前后方向的竖直平面里解，四只脚假定踩在同一高度；草地起伏只有约 ±0.2 看不出来，换成陡坡就会悬空或插进地里
- **跳到半空时切走**：腾空时切到别的动作，离地高度按权重在 0.3 秒里降回去，像慢慢飘下来

程序化生成那条路把 IK 步态做进了引擎（README：“animated with IK gaits and actions”[^pa]），按体型分了爪类、蹄类、鸟、水生、蛇、蜘蛛六种身体结构；要很多物种都会走，比每种自己写一遍划算。

## 放在一起：微缩牧场 { #ranch }

**几个方向拼起来就是一个能玩的小场景。** 一块 36×36 的方形微缩草地：左边一条蜿蜒的河，右边一条浅黄色小路，圆冠绿树和一棵粉紫色的树，近 9000 片草叶；11 只羊各自吃草、发呆、走路或跳。点一只羊出现选中框，底部面板能切换四种动画、旋转、复制、删除；羊可以直接拖着走。手机上同样能单指旋转、双指缩放、按住羊拖动。

<iframe src="/posts/domains/3d-character-animation/assets/ranch.html"
        style="width:100%;height:640px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="微缩牧场：程序化绵羊、四种动画与拖动交互"></iframe>

[单独打开牧场演示](assets/ranch.html){ target="_blank" rel="noopener" }

- **羊毛是 34 个小毛团按斐波那契球面铺在一个椭球上**，毛团半径随机，肚子下的更小、更深，像腹部的阴影
- **一个高度函数管全场**：河道、小路、草叶落点、羊脚下的高度都问它；同一套距离函数还决定哪里能走、拖动时把羊推回岸上

```js title="assets/js/world.js:117-126"
--8<-- "posts/domains/3d-character-animation/assets/js/world.js:117:126"
```

- **水面高光是着色器画的**：河面网格的横向坐标表示离岸远近、纵向坐标是沿河道的距离，片元着色器把河面分成几条「车道」，亮条按各自的速度往下游走
- **草叶一次画完**：一个 `InstancedMesh` 画近 9000 片，顶点着色器按位置加正弦摆动当风
- **小目标要好点**：每只羊挂一个大一圈的不可见盒子接射线；射线没中，再找屏幕上离指针最近的羊
- **双指缩放别误选**：第一根手指落在羊附近会被当成选中，弹出的面板挡住后面的触点；改成按下只记候选，轻点抬起或开始拖动才选中，第二根手指一来就取消

```js title="assets/js/app.js:302-309"
--8<-- "posts/domains/3d-character-animation/assets/js/app.js:302:309"
```

## 怎么选 { #choose }

| 需求 | 优先考虑 |
|---|---|
| 几个固定短动作，手绘感强 | 二维序列帧 |
| 有一张立绘，要多个动作、换装、小幅转脸 | Spine 等[二维骨骼动画](../2d-character-animation/index.md#routes) |
| 视角要自由转，要实时光影，角色在场景里走动 | 三维 |
| 三维、造型精细、动作多，有美术或现成资产 | 建模软件 + 蒙皮 + glTF |
| 三维、卡通低多边形、没有美术、要大量变体 | 关节拼装，本页的猫和羊 |
| 三维、要连续皮肤和毛发、物种多、都要会走 | 程序化生成 + 蒙皮，比如在 threejs-procedural-animals 上改 |

## 相邻任务 { #neighbors }

- **二维角色动画**：动的是画好的图，见[二维角色动画](../2d-character-animation/index.md)。
- **三维生成（3D generation）**：给描述或参考图出一个三维模型，属内容生成，见[三维生成](../3d-generation.md)；从图片、文字直接生成网格（image-to-3D、text-to-3D）也在那张。本页的猫是照图手写代码做的，不是模型生成的。
- **寻路与群体行为（pathfinding、steering behaviors）**：决定角色往哪走、怎么让开，属决策、规划与控制。本页羊的避障只够演示。

## 演示源码与实测 { #sources }

两个演示是本站自己做的，`assets/js/` 是原项目六个脚本的原样拷贝；两个入口页只把脚本加载方式换成本站 `/vendor` 的 three.js。原项目钉的是 three.js r170，这里跑 r185：r182 起 `PCFSoftShadowMap` 弃用，r185 的 `THREE.Clock` 也报弃用，源码为此改了两处 —— 阴影类型按 `THREE.REVISION` 选，计时改用 `setAnimationLoop` 回调传入的时间戳。

### 实测 { #tests }

环境是 Playwright 驱动的无头 Chromium，WebGL 走 SwiftShader 软件渲染。没在真手机、Safari、Firefox 上测，真机帧率和手感要自己看。

- **画面**：桌面和手机两种尺寸截图看构图；四种动画用固定步长逐帧截图、拼成胶片看步态；猫按正面、3/4、侧面、背面截图对照参考图。正文说的几轮修改都是这样看出来的
- **鼠标和触控**：点选、动画切换、旋转、拖动、视角旋转缩放、重置、复制、删除全部通过；触控用 CDP 模拟多点触控，测出并修好了双指误选
- **行走长测**：20 只羊全设成走，固定步长 1/60 秒跑 36000 步（模拟 10 分钟），每 0.5 秒采样；加硬分离前后各跑一次，越界、非数值、卡住都是 0，互相穿插从 218 次降到 0。脚本见下
- **成本数字**：网格和三角面在 r185 下对模型 `traverseVisible` 累加，不计不可见的拾取盒；生成耗时是猫连做 10 只、羊连做 20 只取平均，两次运行，软件渲染下只看量级；AI 用时按文件时间戳 —— 牧场目录建立到最后一次改 `sheep.js`，放入参考图到最后一次改 `cat.js`
- **r185 兼容**：把本站 `/vendor/three/` 和本页 `assets/` 拷到临时目录、按站点路径起静态服务，加载两个演示只收控制台报错，不截图；牧场零报错零警告，猫页只有临时服务器缺 favicon 的一条 404

??? abstract "`walk-test.mjs` —— 行走长测脚本"

    ```js
    --8<-- "posts/domains/3d-character-animation/assets/walk-test.mjs"
    ```

??? abstract "`cat.js` —— 小橘猫：几何构建器、涂色函数、部件、关节与动画"

    ```js
    --8<-- "posts/domains/3d-character-animation/assets/js/cat.js"
    ```

??? abstract "`sheep.js` —— 绵羊：毛团几何、四种动画的姿态函数、行走转向、腿部 IK"

    ```js
    --8<-- "posts/domains/3d-character-animation/assets/js/sheep.js"
    ```

??? abstract "`world.js` —— 牧场：高度函数、地形与侧壁、河流着色器、小路、树、石头、草叶"

    ```js
    --8<-- "posts/domains/3d-character-animation/assets/js/world.js"
    ```

??? abstract "`app.js` —— 牧场场景、灯光、羊群、指针交互、默认视角、面板"

    ```js
    --8<-- "posts/domains/3d-character-animation/assets/js/app.js"
    ```

??? abstract "`controls.js` —— 带阻尼的轨道相机"

    ```js
    --8<-- "posts/domains/3d-character-animation/assets/js/controls.js"
    ```

??? abstract "`cat-viewer.js` —— 小猫演示页的舞台、灯光与交互"

    ```js
    --8<-- "posts/domains/3d-character-animation/assets/js/cat-viewer.js"
    ```

??? abstract "`cat.html` 与 `ranch.html` —— 两个演示入口"

    ```html
    --8<-- "posts/domains/3d-character-animation/assets/cat.html"
    ```

    ```html
    --8<-- "posts/domains/3d-character-animation/assets/ranch.html"
    ```

??? abstract "一手资料短句摘录、出处与读取日期"

    ```text
    --8<-- "posts/domains/3d-character-animation/assets/sources-excerpts.txt"
    ```

[^gltf]: Khronos，[glTF 2.0 Specification](https://github.com/KhronosGroup/glTF/blob/9d23a5a5b1d10f22d1554e847f2a1a3f24222392/specification/2.0/Specification.adoc) 的 Skins 与 Animations 两节，钉在 commit `9d23a5a`，读取于 2026-11-05；短句摘录见文末。
[^three-anim]: three.js r185 的 [AnimationMixer 文档](https://github.com/mrdoob/three.js/blob/2431a09f46f34c560bc8e44b33be0e567723d5b9/docs/pages/AnimationMixer.html)与 [AnimationAction 源码](https://github.com/mrdoob/three.js/blob/2431a09f46f34c560bc8e44b33be0e567723d5b9/src/animation/AnimationAction.js)，钉在 commit `2431a09`，读取于 2026-11-05。
[^spine]: Esoteric Software，spine-runtimes 4.2 分支的 [IkConstraint.ts](https://github.com/EsotericSoftware/spine-runtimes/blob/5cb78e77d3711ddcd80c7bd043bb11cf70fcc88c/spine-ts/spine-core/src/IkConstraint.ts)，注释与文件头的运行库许可，钉在 commit `5cb78e7`；物理约束看同目录的 [PhysicsConstraint.ts](https://github.com/EsotericSoftware/spine-runtimes/blob/5cb78e77d3711ddcd80c7bd043bb11cf70fcc88c/spine-ts/spine-core/src/PhysicsConstraint.ts)，4.2 分支有、4.1 分支没有。读取于 2026-11-05；官网文档页当天连不上，只读了运行库源码。
[^pa]: majidmanzarpour/threejs-procedural-animals，MIT，钉在 commit `c95ae49`（2026-10-02）：[README](https://github.com/majidmanzarpour/threejs-procedural-animals/blob/c95ae49346aa8e140a924376cec6cf0073d99512/README.md)、[AUTHORING](https://github.com/majidmanzarpour/threejs-procedural-animals/blob/c95ae49346aa8e140a924376cec6cf0073d99512/docs/AUTHORING.md)，读取于 2026-11-05；只读文档，没有运行。
