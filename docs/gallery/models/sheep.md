---
description: "本站自己做的低多边形绵羊：牧场里那只白色蓬松的羊单独拿出来转着看，34 个小毛团拼成羊毛，深色的脸、耳朵和四条两节腿挂在关节上；底部切待机、吃草、行走、跳跃四种动画，走路原地踏步看步态，「换一只」换随机种子看毛团变体；15 个网格 4530 个三角面，建模约 270 行；下面是出处 prompt、怎么拼的、拿去改哪里和查看页源码"
---

# 低多边形绵羊

<iframe src="/gallery/models/assets/ranch-models/index.html?m=sheep"
        style="width:100%;height:520px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="低多边形绵羊：程序化建模的三维模型与四种动画"></iframe>

<a href="/gallery/models/assets/ranch-models/index.html?m=sheep" target="_blank" rel="noopener">单独打开</a>

拖动旋转，滚轮或双指缩放，右键拖动平移。底部切换待机、吃草、行走、跳跃，动作之间约 0.3 秒混过去；行走是原地踏步，转到侧面看腿最清楚。「换一只」随机换一个种子，毛团的分布跟着变。

## Prompt { #prompt }

绵羊没有单独的 prompt，是[低多边形 3D 牧场](../games/lowpoly-ranch.md#prompt)那段里的两句：

> 创建约 11 只小巧的白色蓬松绵羊，深色头部与四肢，模型由可编辑的程序化几何构成……选中后可切换 Idle、Graze、Walk、Jump 四种持续循环的真实动画

## 怎么拼的 { #how }

没有模型文件、贴图和骨骼绑定，15 个网格、4530 个三角面，生成一只约 1 毫秒。`sheep.js` 701 行里建模约 270 行，其余约 430 行是四种动画、腿部 IK 和行走转向。

- **羊毛**：34 个小毛团按斐波那契球面铺在一个椭球上，合成一个网格；毛团半径随机，肚子下的更小、更深，像腹部的阴影。毛团怎么分布由每只羊的种子决定，所以一群羊各不相同
- **脖子、头、耳朵、尾巴**：各拼一块，挂在各自的关节上，动画转关节就行。头是深色的脸加头顶几团白毛，耳朵深色，脖子和尾巴是白毛团
- **四条腿**：每条两节，上节挂在髋上、下节挂在膝上；动画不给关节角度，只给脚该踩在哪，两骨骼 IK 反算髋和膝，前腿膝盖朝前、后腿朝后
- **颜色**：全身共用一个「顶点色 + 平面着色」材质，颜色写在几何里，低多边形的块面感是平面着色给的

初版的腿走成锯齿、偏长，羊毛偏米黄，是做牧场时 AI 自己截图看出来、改参数改掉的。

查看页没有另写一份羊：直接用牧场的 `sheep.js` 生成，给它一块无限平地，走路时每帧把羊拉回原点、朝向固定，就成了原地踏步。

## 拿去改 { #tweak }

改数就是改模型，改完刷新就生效，全在 `sheep.js` 顶部的 `SHEEP_PARAMS`：

- `colors`：羊毛、毛团暗部、脸、腿、蹄、眼睛的颜色
- `body`、`wool`：身体椭球的三个半径，毛团个数和大小范围
- `neck`、`head`、`legs`、`tail`：各部件的位置；`legs.upper` 加 `legs.lower` 是腿长，要等于髋高，否则走路时膝盖会弯成 Z 字形
- `walk`、`jump`：步速、步幅、每条腿着地的时间占比、抬脚高度，跳跃的周期和高度

## 源码 { #source }

`sheep.js`、`world.js`、`controls.js` 只在[低多边形 3D 牧场](../games/lowpoly-ranch.md#source)存一份，查看页从那个目录加载，完整源码折叠在那页页尾。这里只有绵羊和[低多边形树](tree.md)共用的查看页，网址参数 `?m=sheep` 或 `?m=tree` 选模型。

??? abstract "`index.html` —— 查看页入口：顶栏按钮、底部动画切换，按顺序加载牧场的三个脚本和 viewer.js"

    ```html
    --8<-- "gallery/models/assets/ranch-models/index.html"
    ```

??? abstract "`viewer.js` —— 底座、灯光、相机交互；绵羊原地踏步，树从整片牧场里取出来"

    ```js
    --8<-- "gallery/models/assets/ranch-models/js/viewer.js"
    ```
