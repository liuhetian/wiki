<!-- 中译自 alexgreensh/anidoodle@25aae33 的 skills/anidoodle/references/camera.md -->
# 镜头：一台推轨车，关键帧对齐帧网格

`engine/src/canvas-core/camera.ts` 就是镜头。影片要么在 `begin()`/`end()` 之间用世界坐标作画（变换路径：脏矩形不会出错，因为镜头骑在 `Gfx` 的变换栈上），要么问 `toScreen()` 某个世界坐标点落在屏幕哪里，再在那里画（投影路径）。两者出自同一份状态，所以钉在画框上的字幕和它浮在上面的世界永远不会对不上。一切都是帧号的纯函数：同一个镜头问题，在任何机器上、按任何顺序问，得到的都是同一个答案。

## 运镜

```ts
import { Camera } from "./camera";

const cam = new Camera([W / 2, H / 2], [
  { f: 0,   look: [400, 300], zoom: 1, ease: "inout" }, // ease governs the segment this key LEAVES
  { f: 90,  look: [900, 300], zoom: 2 },
  { f: 150, look: [900, 300], zoom: 2 },                // a hold: say it, don't imply it
  { f: 240, look: [400, 300], zoom: 1 },
]);
cam.shake({ from: 96, to: 126, amp: 14, seed: 7, rot: 0.004 }); // an impact, ringing down
```

- **缩放在 log2 空间里插值。** 缩放是一个比率：视觉尺寸减半两次所用的时间，应当是减半一次的两倍。直接对缩放值做缓动，一次长距离推进就会在近的一端狂奔、在远的一端爬行；对 log2(zoom) 做缓动，每翻一倍所花的时间才均匀。
- **每一段单独缓动，默认 `inout`（easeInOutCubic）。** 没有真人操作的运镜，应该轻轻起步、轻轻到达。`linear` 看起来很机械，只用 `out` 看起来像被打断，只用 `in` 看起来像在坠落。
- **有好几个关键帧的缩放路径**，在逐段缓动下会在每个关键帧处喘一口气。传入 `monoZoom: true`，就改为在 log2 空间里用一条单调三次曲线穿过所有缩放关键帧：平滑，绝不越冲到没给定的缩放值，绝不倒退。
- **手写路径**：镜头要跟随一只生物或一条曲线时，传入 `path: (f) => ({ look, zoom })` 来代替关键帧。同一个镜头，同样的抖动，同样的投影。

## 深度平面（视差）

镜头与主体平面（z = 0）的距离是 D = 1/zoom。深度为 z 的平面按 `1/(D + z)` 缩放，并随之移动：近处的平面大幅摆动，远处的几乎不动，同一深度上的每个元素彼此一致，因为只有一个镜头。z 为正往远处退；z 为负则越到镜头前面（贴着镜片掠过的草）。把平面的 z 传给 `begin(g, f, z)` 或 `toScreen(p, f, z)`。一台推轨车，一个数字，视差就对所有元素同时成立：不要给每个平面单独配一套漂移。

## 抖动

`shake({ from, to, amp, seed, freq, rot, attack })` 登记一次冲击，或一段手持晃动：

- **amp 以屏幕像素为单位**，所以在任何缩放下抖动看起来都一样；**rot** 是满强度时的弧度，绕画面中心旋转。真正让人相信是手持拍摄的，是那一点点旋转。
- 包络是一段**起音斜坡**（默认 2 帧）接一段**平方衰减**：撞击那一刻满强度，一拍之后消失。冲击的余震是渐渐减弱的，不会在半空中戛然而止。
- 运动用的是带种子的**低频梯度噪声**，绝不是逐帧白噪声。逐帧跳动的噪点看起来像放映机出了故障；平滑的噪声看起来才有质量感。`freq` 是每帧的周期数（默认 0.35，在 30 fps 下约 10 Hz；想要更沉重的镜头就调低它）。
- 抖动被并入 `shaken(f)`，`begin` 和 `toScreen` 都读它，所以画出来的世界和任何投影上去的叠加层一起抖。`at(f)` 保持干净，用来驱动那些不该抖的东西（配乐、cue 网格）。

## 近距离下的线宽

墨线是在某个视角下画定的；缩放到 S 时，同一支笔尖看起来粗了 S 倍。把笔画宽度除以 `weight(cam)` = S^0.35。不是除以 S：线条稍微变粗一点，才让特写感觉是凑近了看，而不是被放大了。

## 两条作画路径

```ts
// transform path: the world moves, you draw in world units
cam.begin(g, f);                    // hero plane
meadow(g, f);
cam.end(g);
cam.begin(g, f, 2.2);               // a farther plane
hills(g, f);
cam.end(g);

// projector path: ask where things are, draw them there (cached surfaces, screen-space type)
const at = cam.toScreen(flower.centre, f, flower.z);
const k = cam.scaleAt(cam.at(f), flower.z);
```

`toWorld(s, f, z)` 是 `toScreen` 的逆运算，用于命中测试，或把世界中的内容钉到某个屏幕点上。镜头本身永远不碰绘图上下文、时钟或 `Math.random`：它只是对 `(frame, keys, seed)` 做算术，正是这一点让确定性契约保持完好。
