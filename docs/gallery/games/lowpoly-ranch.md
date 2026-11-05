---
description: "本站自己做的低多边形 3D 牧场：米白底上一块方形微缩草地，左边蜿蜒的河、右边浅黄小路、圆冠绿树和一棵粉紫色的树，11 只白色绵羊；鼠标和触控都能转视角、点选、拖羊，选中后切 Idle、Graze、Walk、Jump 四种动画，旋转、复制、删除；下面是做出它的整段 prompt，交给 Claude Code 一次做完，约 30 分钟，以及 AI 自己改过的几轮、拿去改哪里和完整源码"
---

# 低多边形 3D 牧场

<iframe src="/gallery/games/assets/lowpoly-ranch/index.html"
        style="width:100%;height:640px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="低多边形 3D 牧场：程序化绵羊、四种动画与拖动交互"></iframe>

[单独打开](assets/lowpoly-ranch/index.html){ target="_blank" rel="noopener" }

拖动空白处转视角，滚轮或双指缩放，顶栏按钮回到默认视角、再添一只羊。点一只羊出现选中框，底部面板切换四种动画、左右各转 45°、复制、删除；按住羊直接拖到别处，拖进河里会被推回岸上。手机上单指转、双指缩放、按住羊拖动都一样。键盘也能操作：1–4 切动画，Q、E 转向，D 复制，Delete 删除，Esc 取消选择。

## Prompt { #prompt }

> 制作一个可直接在浏览器运行的低多边形 3D 牧场网页。使用米白背景和柔和阴影，在宽敞的方形微缩草地上布置左侧蜿蜒蓝色河流、沿河道纵向流动的水面高光、右侧浅黄色弯曲小路、圆冠绿树、一棵粉紫色树和细小草叶，不要深色田埂线条。创建约 11 只小巧的白色蓬松绵羊，深色头部与四肢，模型由可编辑的程序化几何构成，草地相对于羊要有充足活动空间。支持在空白处通过鼠标和触控旋转缩放、重置视角、点击选羊及选中框，并可用鼠标或触控直接拖动羊只移位。选中后可切换 Idle、Graze、Walk、Jump 四种持续循环的真实动画，并旋转、复制、删除羊只。

## 怎么做出来的 { #how }

2026-11-05 在 Claude Code 里用 `/goal` 把上面这段 prompt 交给 Claude Opus 5.5，中间没有再追加要求，从建目录到最后一次改羊的代码约 30 分钟。成品是一个 `index.html` 加 4 个脚本（约 2000 行），three.js 打包在本地，不联网、双击 `index.html` 就能跑；没有模型文件和贴图，草地、河、树、羊全是代码现拼的。

AI 自己用无头浏览器截图、看、改了几轮，下面这些都是它自己看出来改掉的：

- 镜头裁掉了草地边角 → 按草地四角投到屏幕上自动定默认视角，竖屏再加大视场角
- 腿走成锯齿、腿偏长，羊毛偏米黄，草叶太大 → 改参数
- 双指缩放时第一根手指落在羊附近被当成选中，弹出的面板挡住了第二根手指 → 按下只记候选，轻点抬起或开始拖动才选中
- 羊走着走着互相穿过去 → 绕行之外再加一道硬分离，挨得太近就互相推开

## 拿去改 { #tweak }

改数就是改场景，改完刷新就生效：

- 草地大小、河和小路的走向与宽窄、草叶多少、所有颜色：`world.js` 顶部的 `WORLD_CONFIG`
- 羊的颜色、身材、毛团数、腿长、步幅、跳跃高度：`sheep.js` 顶部的 `SHEEP_PARAMS`
- 开场几只羊、各自在做什么：`app.js` 的 `spawnInitial`

## 源码 { #source }

四个脚本和原项目一字不差，放在 [`assets/lowpoly-ranch/`](assets/lowpoly-ranch/index.html) 下。原项目用本地打包的 three.js r170；这里的入口页改成加载本站 `/vendor` 的 three.js r185，r182 起 `PCFSoftShadowMap` 弃用、r185 的 `THREE.Clock` 也报弃用，为此两边一起改了两处：阴影类型按 `THREE.REVISION` 选，计时改用 `setAnimationLoop` 回调传入的时间戳。[3D 模型](../models/index.md)区也用这一份：小橘猫借轨道相机 `controls.js`，[绵羊](../models/sheep.md)和[树](../models/tree.md)的查看页直接加载 `world.js`、`sheep.js` 和 `controls.js`。

??? abstract "`index.html` —— 入口页：顶栏、提示条、选中后的面板，按顺序加载四个脚本"

    ```html
    --8<-- "gallery/games/assets/lowpoly-ranch/index.html"
    ```

??? abstract "`world.js` —— 牧场：高度函数、地形与侧壁、河流着色器、小路、树、石头、草叶"

    ```js
    --8<-- "gallery/games/assets/lowpoly-ranch/js/world.js"
    ```

??? abstract "`sheep.js` —— 绵羊：毛团几何、四种动画的姿态函数、行走转向、腿部 IK"

    ```js
    --8<-- "gallery/games/assets/lowpoly-ranch/js/sheep.js"
    ```

??? abstract "`controls.js` —— 带阻尼的轨道相机"

    ```js
    --8<-- "gallery/games/assets/lowpoly-ranch/js/controls.js"
    ```

??? abstract "`app.js` —— 场景、灯光、羊群、指针交互、默认视角、面板"

    ```js
    --8<-- "gallery/games/assets/lowpoly-ranch/js/app.js"
    ```
