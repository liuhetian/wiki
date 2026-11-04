---
description: "概要：33 张会回应指针的等距线稿交互插图，给网页用；每个实体只画轮廓和一道折痕，板子从远到近互相遮挡，指针反投影到地面驱动弹簧，全页共用一个离屏就睡的帧循环；仓库另带一个让 AI 在同一引擎上画新图形的 skill"
---

# Hairline

Hairline[^repo] 是给网页用的交互插图：33 张等距视角的单线条立体小图，卡片托盘、地形柱、分层窗口、保险库门，指针移上去，物件就做出它该有的反应。零依赖，一个函数挂到一个元素上，按元素宽度、5:4 比例画出 SVG，也有 React 组件。

以 Terrain 看主路径：2:1 等距相机投影 81 根圆角柱，每根只画两笔 —— 上下两个圆角环的凸包作轮廓，顶面内缩一圈的前半段作暗折痕，竖棱不画；底板填底色，从远角逐条对角线追加，近的盖住远的。指针坐标反投影到地面，每根柱按距离取目标高度，各挂一个弹簧。

全页图形共用一个 requestAnimationFrame 循环，滚出视口就睡，弹簧停稳就停。它管几何、动效和明暗主题；用的人只调 intensity（每个图形换算成自己的一个量，Terrain 是半径 1.5 到 5 格）和要不要自动演示。要新图形，仓库另带一个 skill，让 AI 在同一引擎上写、守十条规则、自动拍图看样。

效果见 Gallery 的 [Hairline 等距线稿交互图形](../../gallery/web/collected/gallery-hairline.md)；照这个风格画新图形，用 [Hairline 等距线稿图](../../skills/hairline/index.md) 这个 skill。

[^repo]: [lucasmarkes/hairline @ 37d2e78](https://github.com/lucasmarkes/hairline/tree/37d2e78dcb333ab30c3338e28ed4a690364ea014)，v0.5.1（2026-10-14），2026-11-04 读。
