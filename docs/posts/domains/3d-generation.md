---
description: "三维模型 · 给一段描述或一张参考图，出一个三维模型；建模软件手工建、代码拼、AI 生成三条路线并排比，本站实测代码拼：小橘猫、绵羊、树、整片牧场和修路小镇各花多少；照图拼形状、不用贴图上花纹、一群各不相同各是一个方向，让模型能动的绑定与蒙皮是后处理"
---

# 三维生成（3D generation）：给一段描述或一张参考图，出一个三维模型

**三维生成的通用功能只有一件事：给一段描述或一张参考图，出一个能放进场景、转着看的三维模型。** 细分方向都是被新需求逼出来的：照一张图拼出形状；要花纹又不想画贴图；要一群各不相同；模型还要能动，就要绑定和蒙皮。术语按 glTF 规范的叫法 —— 网格、材质、节点、蒙皮。[^gltf] 在[领域地图](index.md#generation)上它在「内容生成」一组，处理对象是三维模型；模型做好以后怎么动，归[三维角色动画](3d-character-animation/index.md)。

## 通用功能：一句描述，出一个能转着看的模型 { #basic }

- **输入**：一段描述、一张参考图，或者几张多视角照片
- **输出**：网格加材质，颜色写在贴图或顶点色里；要动的话再带一副关节
- **顺手处理的**：整体尺寸、朝向、原点放在哪、三角面数控制在多少以内
- **典型用途**：网页和小游戏里的角色、道具、场景，产品展示
- **管不了的**：让它动起来，见[三维角色动画](3d-character-animation/index.md)；摆进场景之后的光照和相机

## 三条路线：手工建、代码拼、AI 生成 { #routes }

**三条路线的差别在「谁来决定每个顶点在哪」：人在建模软件里推，代码按参数算，还是模型从图或文字里猜。**

| 路线 | 思想 | 成本落在哪 | 适合 |
|---|---|---|---|
| 建模软件手工建（DCC） | 人直接推顶点、展 UV、画贴图 | 美术工时，每个角色都要做一遍 | 造型要求高，有美术 |
| 代码拼（procedural modeling） | 模型是参数的函数：基本体加变换加变形函数 | 每个细节都写成数，靠截图迭代 | 卡通低多边形、要大量变体、没有美术 |
| AI 生成（image-to-3D、text-to-3D） | 模型从大量三维资产里学到图和形状的对应，给图或文字直接出网格 | 本站没实测 | 本站没实测 |

=== "建模软件手工建"

    **人直接推顶点。** 在建模软件里拉出形状、展开 UV、画贴图，导出 glTF。造型和质感上限最高，每个角色、每次修改都是美术工时。本站没有这条路的实测例子。

=== "代码拼"

    **模型是参数的函数。** 拿基本体当积木，每块给位置、缩放、旋转和一个变形函数，颜色按面的朝向写进顶点；改参数就是改模型，换种子就是另一只。小橘猫是照一张像素画拼出来的：

    <iframe src="/gallery/models/assets/orange-cat/index.html"
            style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
            loading="lazy" title="小橘猫：程序化建模的三维模型"></iframe>

    [单独打开小橘猫演示](../../gallery/models/assets/orange-cat/index.html){ target="_blank" rel="noopener" }

    拖动旋转，滚轮或双指缩放。演示、prompt 和完整源码收在 Gallery 的[小橘猫](../../gallery/models/orange-cat.md)；形状和花纹怎么拼见下面两个方向，本站拼过的五样各花多少见[成本](#cost)。

=== "AI 生成"

    **从图或文字直接出网格。** 模型在大量三维资产上训练，给一张图或一段描述就猜出形状和贴图。本站没实测，先占着。

### 代码拼的成本：资产近乎为零，时间花在「看图再改」 { #cost }

本站用代码拼过五样，都不要模型文件和贴图，形状由基本体变形拼成，颜色写进顶点：

| | 怎么拼 | 代码 | 网格 / 三角面 | AI 用时 |
|---|---|---|---|---|
| [小橘猫](../../gallery/models/orange-cat.md)（照像素画） | 变形椭球拼全身，大块花纹按面的朝向涂色，细条纹另贴扁椭球笔触 | `cat.js` 442 行，含挥手、眨眼、摇尾 | 21 / 8276 | 约 10 分钟 |
| [一只绵羊](../../gallery/models/sheep.md) | 34 个小毛团铺在椭球上合成羊毛；脖子、头、耳朵、尾巴和四条两节腿各是一块，挂在关节上 | 建模约 270 行；`sheep.js` 另外约 430 行是四种动画、腿部 IK 和行走 | 15 / 4530 | 算在整片牧场里 |
| [一棵树](../../gallery/models/tree.md) | 一根七棱圆台当树干，4–5 团顶点随机鼓包的二十面体当树冠 | 约 45 行 | 5–6 / 348–428 | 算在整片牧场里 |
| [整片牧场](../../gallery/games/lowpoly-ranch.md) | 一个高度函数出草地、河道和小路，再摆 13 棵树、20 块石头、近 9000 片草叶和 11 只羊 | 4 个脚本约 2000 行，含相机、交互和面板 | 267 / 约 10.7 万 | 约 30 分钟 |
| [修路小镇](../../gallery/games/duck-road.md)（照小红书视频） | 方块、圆柱、球和三棱柱拼房子、云朵树、压路机和小鸭，波点、格纹、毛线纹在着色器里画；店名和信号灯图标是 canvas 现画的；街按 64 单位一块往前生成、身后销毁 | 18 个模块 2831 行，含无限延伸、鸭群剧情、后处理和音效 | 跟随视角每帧 187 次 draw call / 约 26 万 | 约 45 分钟 |

- **生成快**：生成一只猫约 5–8 ms，一只羊约 1.2 ms，软件渲染下量的，只看量级
- **每改一次都要看图**：坐标和尺寸是手写的数，写错不报错，只会长歪。猫在初版后又改了两轮，羊改了一轮，每轮都是「截图 → 看 → 改数」
- **形状语言受限**：基本体拼出来的天然是圆润卡通；写实的肌肉、褶皱走这条路成本陡增，不如手工建

测法见三维角色动画的[实测](3d-character-animation/index.md#tests)。

## 细分方向：一个新需求，一个方向 { #needs }

### 照一张图拼出形状：基本体与变形（primitives、deformation） { #procedural-modeling }

**只用一块积木 —— 细分过的二十面体单位球。** 每个部件给它位置、三轴缩放、旋转和一个可选的变形函数：头是头顶压平、腮帮略鼓的椭球；两团奶白小椭球挤出「ω」形上唇，下面一个深色椭球当张开的嘴、一个粉色小椭球当舌头；身体是坐成平底的下宽上窄椭球；耳朵是压扁的三棱锥；尾巴是沿曲线排的 12 节胶囊。

<figure markdown>
![参考图：举爪挥手的像素画小橘猫](../../gallery/models/assets/orange-cat/cat-reference.png){ width="300" }
<figcaption>小橘猫的参考图（用户提供的像素画）</figcaption>
</figure>

核心是 `Builder.ellipsoid`：遍历单位球的每个三角面，先变形、再缩放和摆放，颜色由涂色函数按这个面的朝向决定。

```js title="cat.js:78-98"
--8<-- "gallery/models/assets/orange-cat/js/cat.js:78:98"
```

- 部件最后合进少数几个 `BufferGeometry`，共用一个「顶点色 + 平面着色」材质 —— 低多边形的块面感是平面着色给的
- `shade` 给每个面加一点随机明度，块面更明显

### 要花纹又不画贴图：顶点色与笔触（vertex color） { #pattern }

**大块颜色按面的朝向算，一个函数画完。** 涂色函数拿到的是三角面中心在单位球上的方向 `d`：`d.z` 大是朝前，`d.y` 大是朝上。胸口的奶白倒三角和身上斜走的条纹：

```js title="cat.js:171-178"
--8<-- "gallery/models/assets/orange-cat/js/cat.js:171:178"
```

**细条纹不能这么画** —— 颜色以三角面为单位，条纹和三角面差不多宽时边缘碎成菱形格。初版额头的竖纹就是一片菱形块，把头部细分从 3 级提到 4 级（5120 个面）也没救回来；最后改成贴在表面的扁椭球「笔触」：算出头部椭球表面某点的位置和法线，按走向摆一个扁椭球，稍微嵌进去。

```js title="cat.js:217-225"
--8<-- "gallery/models/assets/orange-cat/js/cat.js:217:225"
```

!!! tip "大面积色块交给涂色函数，细线交给几何"

    尾巴同理 —— 初版是首尾相接的椭球，接缝处变细像一串珠子；换成同半径的胶囊后，相邻两节在关节处是同一个球面，连成一根光滑的管子。

### 要一群各不相同：参数与种子（parametric、seed） { #variants }

**变体几乎不要钱。** 颜色、比例、腿长、步幅都在文件顶部的参数对象里，改完刷新就生效。每只羊的毛团分布由各自的 `seed` 决定，11 只各不相同，复制一只就是拿同一个 `seed` 再生成一次；每棵树的树冠团数、位置和配色由随机数决定，粉紫色那棵只换了一组配色。

### 要让模型能动：绑定与蒙皮（rigging、skinning）· 后处理 { #rigging }

**「能弯」有两种做法，glTF 规范都支持：**

> "glTF supports articulated and skinned animation via key frame animations of nodes' transforms"[^gltf]

- **关节动画（articulated）**：身体拆成刚性部件，挂在节点层级上，转节点就转部件。关节处是两个部件互相穿插，弯不出连续的皮肤。猫和羊都是这种 —— 代码拼的时候就把部件挂到 `Group` 上，建模和绑定是同一步
- **蒙皮动画（skinned）**：一张连续网格，每个顶点按权重跟着几根骨骼走，关节处的皮肤会被拉伸、弯折。建模软件导出的角色多是这种，和 Spine 的加权网格是一回事

**代码拼也能做连续皮肤：把基本体平滑融合成一张网格，再自动绑定。** threejs-procedural-animals 在 three.js 里生成 24 种动物，README 开头就说：

> "generated entirely in code: no models, no textures, no animation clips."[^pa]

它和小橘猫的起点相同 —— 都用椭球等基本体拼身体，分歧在拼的方式。它把基本体当有符号距离场（SDF）平滑融合，文档写明：

> "`k` is the smooth-union blend radius, and 0 gives a hard union."[^pa]

融合后重新生成网格、自动算权重、做双四元数蒙皮。小橘猫只让部件的网格互相穿插，相当于 `k = 0` 且不重新网格化 —— 省掉了网格化和自动权重这一大块工程，代价是关节只能刚性地转。这里只读了它的文档，没有运行。

## 怎么选 { #choose }

| 需求 | 优先考虑 |
|---|---|
| 造型精细、动作多，有美术或现成资产 | 建模软件手工建 |
| 卡通低多边形、没有美术、要大量变体 | 代码拼，本站的猫、羊、树 |
| 要连续皮肤和毛发、物种多 | 代码拼加 SDF 融合和自动绑定，在 threejs-procedural-animals 这类引擎上改 |
| 视角固定，有一张立绘就够 | [二维角色生成](2d-character-generation/index.md) |

## 相邻任务：常一起出现，但不属于这个领域 { #neighbors }

- **三维角色动画**：模型做好以后关节怎么动、脚怎么踩实地面，见[三维角色动画](3d-character-animation/index.md)
- **二维角色生成**：出的是能动的二维素材，见[二维角色生成](2d-character-generation/index.md)；那张的矢量代码和这里的代码拼是同一个思路

## 来源 { #sources }

??? abstract "一手资料短句摘录、出处与读取日期（与三维角色动画共用）"

    ```text
    --8<-- "posts/domains/3d-character-animation/assets/sources-excerpts.txt"
    ```

[^gltf]: Khronos，[glTF 2.0 Specification](https://github.com/KhronosGroup/glTF/blob/9d23a5a5b1d10f22d1554e847f2a1a3f24222392/specification/2.0/Specification.adoc) 的 Skins 与 Animations 两节，钉在 commit `9d23a5a`，读取于 2026-11-05；短句摘录见文末。
[^pa]: majidmanzarpour/threejs-procedural-animals，MIT，钉在 commit `c95ae49`（2026-10-02）：[README](https://github.com/majidmanzarpour/threejs-procedural-animals/blob/c95ae49346aa8e140a924376cec6cf0073d99512/README.md)、[AUTHORING](https://github.com/majidmanzarpour/threejs-procedural-animals/blob/c95ae49346aa8e140a924376cec6cf0073d99512/docs/AUTHORING.md)，读取于 2026-11-05；只读文档，没有运行。
