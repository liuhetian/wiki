---
description: "本站自己做的低多边形小橘猫：照一张像素画用代码拼的三维模型，坐着举起左前爪挥手，大眼睛带高光，张嘴吐舌，胸口和脚掌奶白，尾巴向上卷；没有模型文件、贴图和骨骼绑定，442 行代码、21 个网格 8276 个三角面，Claude Code 约 10 分钟做完；下面是参考图、原话 prompt、AI 自己改过的两轮、拿去改哪里和完整源码"
---

# 低多边形小橘猫

<iframe src="/gallery/models/assets/orange-cat/index.html"
        style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="低多边形小橘猫：程序化建模的三维模型"></iframe>

[单独打开](assets/orange-cat/index.html){ target="_blank" rel="noopener" }

拖动旋转，滚轮或双指缩放，右键拖动平移；顶栏能暂停动画、自动旋转、重置视角。动画有挥手、眨眼、歪头、抖耳、摇尾和呼吸，全部循环。

## 参考图和 prompt { #prompt }

<figure markdown>
![参考图：举爪挥手的像素画小橘猫](assets/orange-cat/cat-reference.png){ width="300" }
<figcaption>参考图（用户提供的像素画）</figcaption>
</figure>

> （附上面这张参考图）能够给这只小猫建个模型吗

原话只有这一句，因为是接在[低多边形 3D 牧场](../games/lowpoly-ranch.md)同一个对话里说的：低多边形、平面着色、柔和阴影、「模型由可编辑的程序化几何构成」这些要求，AI 沿用了牧场那段 prompt 的做法。新开对话单独做，要把这几条补进 prompt。

## 怎么做出来的 { #how }

2026-11-05 在 Claude Code 里交给 Claude Opus 5.5，中间没有追加要求，从放入参考图到最后一次改猫的代码约 10 分钟。成品是一个 `index.html` 加两个脚本：`cat.js` 442 行、21 KB，含全部动画；没有模型文件、贴图和骨骼绑定，21 个网格、8276 个三角面。

做法是用代码当建模软件：主要的积木是细分过的二十面体单位球，每个部件给它位置、三轴缩放、旋转和一个变形函数 —— 头是头顶压平、腮帮略鼓的椭球，两团奶白小椭球挤出「ω」形上唇，身体是坐成平底的椭球，耳朵是压扁的三棱锥；颜色写进顶点，大块花纹（胸口的奶白倒三角、身上斜走的条纹）由涂色函数按每个三角面的朝向决定。

AI 按正面、3/4、侧面、背面截图对照参考图，初版后自己又改了两轮：

- 额头的细竖纹碎成一片菱形格 —— 颜色以三角面为单位，条纹和三角面差不多宽就会这样，头部细分从 3 级提到 4 级也没救回来 → 改成贴在头部表面的扁椭球「笔触」
- 尾巴是首尾相接的椭球，接缝处变细像一串珠子 → 换成 12 节同半径的胶囊，相邻两节在关节处是同一个球面，连成一根光滑的管子

## 拿去改 { #tweak }

改数就是改模型，改完刷新就生效，全在 `cat.js` 顶部的 `CAT_PARAMS`：

- `colors`：毛色、条纹、奶白、耳内、鼻子、舌头、虹膜等全部颜色
- `head`、`ear`、`eye`、`body`、`arm`：各部件的位置和大小，`head.detail` 是头部细分级数
- `tail`：节数、粗细和沿哪几个点弯
- `anim`：挥手速度、挥多久停多久、多久眨一次眼

## 源码 { #source }

两个脚本和原项目一字不差，放在 [`assets/orange-cat/`](assets/orange-cat/index.html) 下。入口页改成加载本站 `/vendor` 的 three.js r185；轨道相机 `controls.js` 和牧场共用一份，从 [低多边形 3D 牧场](../games/lowpoly-ranch.md#source) 的目录加载。

??? abstract "`index.html` —— 入口页：参考图小窗、顶栏按钮，按顺序加载脚本"

    ```html
    --8<-- "gallery/models/assets/orange-cat/index.html"
    ```

??? abstract "`cat.js` —— 几何构建器、涂色函数、部件、关节与动画"

    ```js
    --8<-- "gallery/models/assets/orange-cat/js/cat.js"
    ```

??? abstract "`cat-viewer.js` —— 演示页的舞台、灯光与交互"

    ```js
    --8<-- "gallery/models/assets/orange-cat/js/cat-viewer.js"
    ```
