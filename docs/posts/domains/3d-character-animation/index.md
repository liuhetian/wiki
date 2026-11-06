---
description: "三维角色模型 · 给绑好关节的模型、动作和时间，任意视角下算出此刻的姿态；关键帧片段回放、程序化动画两条路线并排比，和 Spine 逐项对照；脚踩实地面的腿部 IK 与程序化步态是一个方向；小橘猫、绵羊、微缩牧场三个交互演示"
---

# 三维角色动画（3D character animation）：给模型、关节和动作，任意视角下算出此刻的姿态

**三维角色动画的通用功能只有一件事：给一个绑好关节的三维模型、一个动作和当前时间，算出此刻每个关节的姿态，再从任意视角画出来。** 细分方向都是被新需求逼出来的：动作要跟着状态现算，逼出程序化动画；脚要踩实地面，逼出腿部 IK 和程序化步态。术语按 glTF 规范和 three.js 动画系统的叫法 —— 关节、蒙皮、动画片段（clip）、混合（blending）；IK 和步态用游戏动画的通用叫法。[^gltf][^three-anim] 在[领域地图](../index.md#transformation)上它在「内容变换」一组，处理对象是三维角色模型；模型从哪来、关节怎么绑，归[三维生成](../3d-generation.md)。

和[二维角色动画](../2d-character-animation/index.md)比，多出来的是空间：视角随便转，光照和阴影由渲染器实时算；代价是先得有一个三维模型。本页三个演示 —— 小橘猫、绵羊、微缩牧场 —— 都是本站用代码拼、用代码驱动的。

## 通用功能：模型加时间，得到任意视角的一帧 { #basic }

- **输入**：绑好关节的模型 —— 网格、关节层级、可选的蒙皮权重，怎么做见三维生成的[绑定与蒙皮](../3d-generation.md#rigging)；动画片段或程序给的关节值；当前时间。交互角色再加状态：走还是停、有没有被拖起来
- **输出**：每帧每个关节的变换，渲染成任意视角的画面；光照和阴影按场景算
- **顺手处理的**：播放、循环、变速、几个动作按权重混合、整体位移和转向。混合的道理和二维一样，见[二维的分层与混合](../2d-character-animation/index.md#transition)；three.js 里是 `AnimationMixer` 给每个片段一个权重，`crossFadeTo` 让当前片段淡出、目标片段淡入
- **典型用途**：网页吉祥物、三维小游戏和微缩场景、产品展示里的角色、虚拟形象
- **管不了的**：模型长什么样；角色该往哪走、怎么让开别人（寻路，相邻任务）；脚和地面、手和物体的真实接触 —— 不另做 IK 或物理，动画片段只会照原样播

## 两条路线：关键帧片段回放、程序化动画 { #routes }

**两条路线的差别在「关节值从哪来」：动画师事先记好，还是代码每帧现算。**

| 路线 | 思想 | 成本落在哪 | 适合 |
|---|---|---|---|
| 关键帧片段回放（keyframe clip） | 在几个时刻记下每个关节的姿态，运行时在关键帧之间插值 | 每个动作都要人做，或者动捕、买动作库 | 表演细腻、动作固定，有美术 |
| 程序化动画（procedural animation） | 关节角是时间和状态的函数，每帧现算 | 每个动作都写成公式，靠看图调参 | 动作随状态和参数变，没有美术 |

=== "关键帧片段回放"

    **动画师记关键帧，运行时插值。** glTF 把动画写成节点变换的关键帧：

    > "glTF supports articulated and skinned animation via key frame animations of nodes' transforms"[^gltf]

    运行时 three.js 的 `AnimationMixer` 是播放器，每个片段一个 `AnimationAction`，按权重混合、淡入淡出，算完骨骼再由 GPU 蒙皮。[^three-anim] 片段能套到同一副骨架的别的角色上，表演最细腻；动作来自手做关键帧、动作捕捉或现成的动作库。本站没有这条路的实测例子 —— 没有美术，也没有现成资产。

=== "程序化动画"

    **关节角是时间和状态的函数。** 不存片段，每帧用正弦波、包络和状态算出关节角，直接写到节点上；动作能随参数和状态变，表演力有限，调参同样靠看图。

    <iframe src="/gallery/models/assets/orange-cat/index.html"
            style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
            loading="lazy" title="小橘猫：程序化动画的三维模型"></iframe>

    [单独打开小橘猫演示](../../../gallery/models/assets/orange-cat/index.html){ target="_blank" rel="noopener" }

    骨架就是 `Group` 的父子层级：每个能动的地方放一个空 `Group` 当关节，部件网格挂在它下面。小猫的层级：

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

    关节要放在转动的支点上 —— 头的支点在脖子，不在头中心，否则歪头变成整个头平移。各关节角每帧现算：

    ```js title="cat.js:404-438" hl_lines="7 11 32"
    --8<-- "gallery/models/assets/orange-cat/js/cat.js:404:438"
    ```

    - 包络 `env` 让挥手「挥 2.6 秒、停 1.6 秒」，停的时候爪子仍举着
    - 手腕比肩晚一个相位（`- 0.7`），爪子会甩起来
    - 尾巴每节比上一节晚一点相位（`- i * 0.55`），摆动从根部传到尾尖

    混合也能自己做：羊的四种动作各是一个「姿态函数」，按权重混、约 0.3 秒过渡，相当于把 `AnimationMixer` 的混合挪到姿态这一层。演示、prompt 和完整源码收在 Gallery 的[小橘猫](../../../gallery/models/orange-cat.md)。

## 和二维对照：Spine 那一套在三维里叫什么 { #vs-2d }

**Spine 的骨骼动画和三维蒙皮是同一套思路，差别在视角画死在图里。** 概念一一对得上：

| Spine（二维） | 三维 |
|---|---|
| 图集里的部件图 | 网格和材质 |
| 骨骼 | 关节层级：glTF 的节点，three.js 的 `Bone` 或 `Group` |
| 网格权重 | 蒙皮权重 |
| 动画时间轴 | 动画片段（`AnimationClip`） |
| 轨道混合与叠加 | `AnimationMixer` 的权重、淡入淡出、加法混合 |
| IK 约束：管 1 或 2 根骨骼，弯曲方向取 1 或 −1 | 两骨骼 IK，膝盖朝哪边同样二选一（[下文羊](#locomotion)的前后腿各取一个） |
| 物理约束（4.2 起） | three.js 本身不带物理，要另接 |

Spine 运行库源码里对 IK 约束的注释：

> "An IK constraint adjusts the rotation of 1 or 2 constrained bones so the tip of the last bone is as close to the target bone as possible."[^spine]

不一样的地方：

- **视角**：二维的视角画死在图里，转到侧面、背面要补画（见二维的[怎么选](../2d-character-animation/index.md#choose)）；三维随便转，光照阴影自动对
- **素材起点**：二维从一张立绘拆图开始，美术画过的就是成品质感；三维要先造形，卡通风格也得建模
- **授权**：Spine 运行库许可写明，按 Spine 编辑器许可协议第 2 节的条款可以集成运行库，否则产品的每个使用者都要自己持有 Spine 编辑器授权[^spine]；three.js 是 MIT，glTF 是开放标准
- **运行时**：二维每帧算骨骼和网格，画在一个平面上；三维多了深度、光照和阴影贴图那一遍

## 细分方向：一个新需求，一个方向 { #needs }

### 脚要踩实地面：腿部 IK 与程序化步态（foot IK、procedural locomotion） { #locomotion }

**姿态写死在网格里就走不了。** 小橘猫的身体、两条后腿和着地的前腿合成了一个网格，只有头、耳朵、眼睛、挥手的前爪和尾巴有关节；要走得照羊的做法重做下半身 —— 程序化模型是为某个姿态写的代码，换姿态就是改代码。

羊从一开始按「要走路」建：四条腿各两节，动画不给关节角度，只给「脚该踩在哪」，两骨骼 IK 用余弦定理反算髋和膝：

```js title="sheep.js:675-696" hl_lines="12 16"
--8<-- "gallery/games/assets/lowpoly-ranch/js/sheep.js:675:696"
```

- 第 12 行把髋到脚的距离夹在可达范围内，脚够不着也不会算出 NaN
- 第 16 行是 IK 两个解里选哪个：前腿腕关节朝前、后腿跗关节朝后，对应 Spine IK 的弯曲方向 1 或 −1

步态只描述脚的轨迹：支撑相脚线性后移，摆动相按余弦曲线前移并抬起。

```js title="sheep.js:444-462" hl_lines="11 15-16"
--8<-- "gallery/games/assets/lowpoly-ranch/js/sheep.js:444:462"
```

单独拿一只羊出来原地走，转到侧面看四条腿的先后和膝盖朝向最清楚；底部能切另外三种动作，演示收在 Gallery 的[低多边形绵羊](../../../gallery/models/sheep.md)：

<iframe src="/gallery/models/assets/ranch-models/index.html?m=sheep&a=Walk"
        style="width:100%;height:480px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="一只绵羊原地行走：两节腿、两骨骼 IK 与侧向序列步态"></iframe>

走起来碰到的问题和解法：

| 问题 | 解法 | 效果 |
|---|---|---|
| 脚在地上打滑 | 支撑相里脚相对身体后移的速度正好等于前进速度 | 支撑脚钉在地面上 |
| 四条腿的先后 | 侧向序列步态：左后 → 左前 → 右后 → 右前，相位各差四分之一周期，每条腿 62% 的时间着地 | 相邻两腿的迈步略有重叠，任何时刻至少两条腿着地 |
| 膝盖弯成 Z 字形 | 初版两节腿加起来比髋高长，走路时身体又压低一截；改成腿长恰好等于髋高，走路不压低身体 | 站立时腿伸直，只在迈步时弯 |
| 走出草地、掉进河里、撞树 | 每帧往前探约一个半身长，探点不能走就在左右若干角度里找最近的可走方向 | 20 只羊连续走 10 分钟（模拟）：越界 0 次、卡住 0 只 |
| 羊和羊互相穿过 | 前方有羊就转向绕开，再加一道硬分离：中心距离小于 0.82 就互相推开 | 互相穿插的采样从 218 次降到 0 |

??? note "还没解决的三件"

    - **原地转身脚会滑**：不在行走时旋转羊，整只羊绕竖轴转，脚没有跟着迈步
    - **坡地不贴合**：IK 只在前后方向的竖直平面里解，四只脚假定踩在同一高度；草地起伏只有约 ±0.2 看不出来，换成陡坡就会悬空或插进地里
    - **跳到半空时切走**：腾空时切到别的动作，离地高度按权重在 0.3 秒里降回去，像慢慢飘下来

程序化生成的引擎把 IK 步态做进了框架（README："animated with IK gaits and actions"[^pa]），按体型分了爪类、蹄类、鸟、水生、蛇、蜘蛛六种身体结构；要很多物种都会走，比每种自己写一遍划算。

## 放在一起：微缩牧场 { #ranch }

**几个方向拼起来就是一个能玩的小场景。** 一块 36×36 的方形微缩草地：左边一条蜿蜒的河，右边一条浅黄色小路，圆冠绿树和一棵粉紫色的树，近 9000 片草叶；11 只羊各自吃草、发呆、走路或跳。点一只羊出现选中框，底部面板切四种动画、旋转、复制、删除；羊可以直接拖着走。手机上单指旋转、双指缩放、按住羊拖动。

<iframe src="/gallery/games/assets/lowpoly-ranch/index.html"
        style="width:100%;height:640px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="微缩牧场：程序化绵羊、四种动画与拖动交互"></iframe>

[单独打开牧场演示](../../../gallery/games/assets/lowpoly-ranch/index.html){ target="_blank" rel="noopener" }

演示、做出它的整段 prompt 和完整源码收在 Gallery 的[低多边形 3D 牧场](../../../gallery/games/lowpoly-ranch.md)，本页只嵌它、只摘几段代码。羊毛和树怎么拼见[三维生成](../3d-generation.md#cost)；树在牧场的 13 棵里轮换，演示收在 Gallery 的[低多边形树](../../../gallery/models/tree.md)：

<iframe src="/gallery/models/assets/ranch-models/index.html?m=tree"
        style="width:100%;height:440px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="牧场里的低多边形树：七棱圆台树干与鼓包的树冠"></iframe>

??? note "场景本身的几处做法，不属于角色动画"

    - **一个高度函数管全场**：河道、小路、草叶落点、羊脚下的高度都问它；同一套距离函数还决定哪里能走、拖动时把羊推回岸上

        ```js title="world.js:117-126"
        --8<-- "gallery/games/assets/lowpoly-ranch/js/world.js:117:126"
        ```

    - **水面高光是着色器画的**：河面网格的横向坐标表示离岸远近、纵向坐标是沿河道的距离，片元着色器把河面分成几条「车道」，亮条按各自的速度往下游走
    - **草叶一次画完**：一个 `InstancedMesh` 画近 9000 片，顶点着色器按位置加正弦摆动当风
    - **小目标要好点**：每只羊挂一个大一圈的不可见盒子接射线；射线没中，再找屏幕上离指针最近的羊
    - **双指缩放别误选**：第一根手指落在羊附近会被当成选中，弹出的面板挡住后面的触点；改成按下只记候选，轻点抬起或开始拖动才选中，第二根手指一来就取消

        ```js title="app.js:302-309"
        --8<-- "gallery/games/assets/lowpoly-ranch/js/app.js:302:309"
        ```

## 怎么选 { #choose }

**先问视角要不要自由转；要，模型怎么来照[三维生成](../3d-generation.md#choose)定，动作怎么来照下表定。**

| 需求 | 优先考虑 |
|---|---|
| 视角固定，有一张立绘或几个短动作 | 回[二维角色动画](../2d-character-animation/index.md#choose) |
| 表演细腻、动作固定，有美术或动作库 | 关键帧片段回放 |
| 动作随状态和参数变、没有美术 | 程序化动画，本页的猫和羊 |
| 角色要在场景里走、脚要踩实 | 程序化步态加腿部 IK；物种多时在 threejs-procedural-animals 这类引擎上改 |

## 相邻任务：常一起出现，但不属于这个领域 { #neighbors }

- **三维生成**：模型从哪来、形状怎么拼、关节怎么绑，属内容生成，见[三维生成](../3d-generation.md)；本页的猫、羊、树都是那张里手写代码拼的，那张还列了它们的建模成本
- **二维角色动画**：动的是画好的图，见[二维角色动画](../2d-character-animation/index.md)
- **寻路与群体行为（pathfinding、steering behaviors）**：决定角色往哪走、怎么让开，属决策、规划与控制；本页羊的避障只够演示

## 演示源码与实测 { #sources }

三个演示是本站自己做的，只在 Gallery 存一份，本页的演示和代码摘录都引用那里：小橘猫在 [Gallery · 小橘猫](../../../gallery/models/orange-cat.md#source)，牧场在 [Gallery · 低多边形 3D 牧场](../../../gallery/games/lowpoly-ranch.md#source)，完整源码折叠在各自页尾。六个脚本和原项目一字不差，两个入口页只把脚本加载方式换成本站 `/vendor` 的 three.js，猫的入口页另从牧场目录加载共用的轨道相机 `controls.js`。

!!! warning "three.js r170 的代码跑在 r185 上改了两处"

    原项目用本地打包的 r170，这里跑 r185：r182 起 `PCFSoftShadowMap` 弃用，r185 的 `THREE.Clock` 也报弃用。阴影类型按 `THREE.REVISION` 选，计时改用 `setAnimationLoop` 回调传入的时间戳，两边一起改。

### 实测 { #tests }

环境是 Playwright 驱动的无头 Chromium，WebGL 走 SwiftShader 软件渲染。没在真手机、Safari、Firefox 上测，真机帧率和手感要自己看。

- **画面**：桌面和手机两种尺寸截图看构图；四种动画用固定步长逐帧截图、拼成胶片看步态；猫按正面、3/4、侧面、背面截图对照参考图。正文说的几轮修改都是这样看出来的
- **鼠标和触控**：点选、动画切换、旋转、拖动、视角旋转缩放、重置、复制、删除全部通过；触控用 CDP 模拟多点触控，测出并修好了双指误选
- **行走长测**：20 只羊全设成走，固定步长 1/60 秒跑 36000 步（模拟 10 分钟），每 0.5 秒采样；加硬分离前后各跑一次，越界、非数值、卡住都是 0，互相穿插从 218 次降到 0。脚本见下
- **成本数字**：网格和三角面在 r185 下对模型 `traverseVisible` 累加，不计不可见的拾取盒；[三维生成](../3d-generation.md#cost)那张的树和整片牧场同样这么算，草叶是一个 `InstancedMesh`，按实例数乘每片的三角面；生成耗时是猫连做 10 只、羊连做 20 只取平均，两次运行，软件渲染下只看量级；AI 用时按文件时间戳 —— 牧场目录建立到最后一次改 `sheep.js`，放入参考图到最后一次改 `cat.js`
- **r185 兼容**：把本站 `/vendor/three/` 和两个演示的目录拷到临时目录、按站点路径起静态服务，加载两个演示只收控制台报错，不截图；牧场零报错零警告，猫页只有临时服务器缺 favicon 的一条 404

??? abstract "`walk-test.mjs` —— 行走长测脚本"

    ```js
    --8<-- "posts/domains/3d-character-animation/assets/walk-test.mjs"
    ```

??? abstract "一手资料短句摘录、出处与读取日期"

    ```text
    --8<-- "posts/domains/3d-character-animation/assets/sources-excerpts.txt"
    ```

[^gltf]: Khronos，[glTF 2.0 Specification](https://github.com/KhronosGroup/glTF/blob/9d23a5a5b1d10f22d1554e847f2a1a3f24222392/specification/2.0/Specification.adoc) 的 Skins 与 Animations 两节，钉在 commit `9d23a5a`，读取于 2026-11-05；短句摘录见文末。
[^three-anim]: three.js r185 的 [AnimationMixer 文档](https://github.com/mrdoob/three.js/blob/2431a09f46f34c560bc8e44b33be0e567723d5b9/docs/pages/AnimationMixer.html)与 [AnimationAction 源码](https://github.com/mrdoob/three.js/blob/2431a09f46f34c560bc8e44b33be0e567723d5b9/src/animation/AnimationAction.js)，钉在 commit `2431a09`，读取于 2026-11-05。
[^spine]: Esoteric Software，spine-runtimes 4.2 分支的 [IkConstraint.ts](https://github.com/EsotericSoftware/spine-runtimes/blob/5cb78e77d3711ddcd80c7bd043bb11cf70fcc88c/spine-ts/spine-core/src/IkConstraint.ts)，注释与文件头的运行库许可，钉在 commit `5cb78e7`；物理约束看同目录的 [PhysicsConstraint.ts](https://github.com/EsotericSoftware/spine-runtimes/blob/5cb78e77d3711ddcd80c7bd043bb11cf70fcc88c/spine-ts/spine-core/src/PhysicsConstraint.ts)，4.2 分支有、4.1 分支没有。读取于 2026-11-05；官网文档页当天连不上，只读了运行库源码。
[^pa]: majidmanzarpour/threejs-procedural-animals，MIT，钉在 commit `c95ae49`（2026-10-02）：[README](https://github.com/majidmanzarpour/threejs-procedural-animals/blob/c95ae49346aa8e140a924376cec6cf0073d99512/README.md)、[AUTHORING](https://github.com/majidmanzarpour/threejs-procedural-animals/blob/c95ae49346aa8e140a924376cec6cf0073d99512/docs/AUTHORING.md)，读取于 2026-11-05；只读文档，没有运行。
