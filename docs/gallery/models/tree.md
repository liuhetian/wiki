---
description: "本站自己做的低多边形树：牧场里的圆冠绿树和那棵粉紫色的树单独拿出来转着看，一根七棱圆台当树干，4–5 团顶点随机鼓包的二十面体当树冠，树冠轻轻摇摆；「换一棵」在牧场的 13 棵里轮换，每棵团数、位置、配色和大小都不同；5–6 个网格 348–428 个三角面，约 45 行；下面是出处 prompt、怎么拼的、拿去改哪里"
---

# 低多边形树

<iframe src="/gallery/models/assets/ranch-models/index.html?m=tree"
        style="width:100%;height:520px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="低多边形树：程序化建模的三维模型"></iframe>

<a href="/gallery/models/assets/ranch-models/index.html?m=tree" target="_blank" rel="noopener">单独打开</a>

拖动旋转，滚轮或双指缩放，右键拖动平移。「换一棵」在牧场的 13 棵树里轮换，第 13 棵是粉紫色那棵；树冠一直在轻轻摇摆，暂停动画就停下。

## Prompt { #prompt }

树没有单独的 prompt，是[低多边形 3D 牧场](../games/lowpoly-ranch.md#prompt)那段里的半句：

> 圆冠绿树、一棵粉紫色树

## 怎么拼的 { #how }

一棵树 5–6 个网格、348–428 个三角面，形状代码约 45 行（`world.js` 的 `lumpyIco` 和 `makeTree`）。

- **树干**：一根七棱圆台，上细下粗，高度和粗细都乘这棵树的尺寸
- **树冠**：正中一个大团，周围随机 2–3 个小团，顶上再一个，共 4–5 团。每团是细分一级的二十面体（80 个面），每个顶点随机推远或拉近 8% 以内，鼓出不规则的块面，再随机转个角度
- **颜色**：四种绿打乱后分给各团，粉紫色那棵换成三种粉紫；每团一种纯色、平面着色，不写顶点色
- **13 棵各不相同**：位置和尺寸（0.85–1.2）写在一张表里，团数、团的位置和配色由整片牧场的种子决定；摆树时自动避开河和小路，再登记成障碍物，羊走路会绕开
- **摇摆**：每棵树冠按自己的相位绕两个轴做很小的正弦摆动，树干不动

查看页没有另写一份树：`makeTree` 没有导出，就用牧场的 `world.js` 搭一整片牧场，只把里面的 13 棵树取出来摆到底座上。

## 拿去改 { #tweak }

- 树干和树冠的颜色：`world.js` 顶部 `WORLD_CONFIG.colors` 里的 `trunk`、`crowns`、`pinkCrowns`
- 每棵树的位置和尺寸：`world.js` 的 `TREE_SPOTS` 和 `PINK_TREE`
- 形状：`makeTree` 里树干的高和粗细、树冠团数和每团的位置大小；`lumpyIco` 的第四个参数（现在是 0.16）管鼓包有多不规则

## 源码 { #source }

`world.js` 只在[低多边形 3D 牧场](../games/lowpoly-ranch.md#source)存一份，完整源码折叠在那页页尾。查看页和绵羊共用一个，源码在[低多边形绵羊](sheep.md#source)。
