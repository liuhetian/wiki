---
description: "Sandboard：WebGPU 写实沙盘，划沟、堆沙、扬沙，Start again 由海浪冲平；原项目原样构建收录，附完整源码"
---

# Sandboard WebGPU 沙盘

<iframe src="/gallery/web/sandboard/assets/sandboard-demo/index.html"
        style="width:100%;height:720px;border:1px solid #8884;border-radius:10px"
        loading="lazy" allow="autoplay; fullscreen" title="Sandboard WebGPU 沙盘 demo"></iframe>

一块没人碰过的细沙，拖动鼠标或手指就能划出沟来。慢划留下干净的槽，快划会把沙子扬起来，
手机上可以几根手指一起划。点 **Start again**（或按 `R`）不会瞬间清屏，而是一道斜着推上来的海浪
把沟痕一带一带抹平，退潮刚好跟 `wave.mp3` 同时结束。没有分数，也没有目标。

**只能跑 WebGPU**：需要支持 WebGPU 的浏览器，外加一块硬件 GPU（会主动拒绝软件模拟的适配器），
所以老 Safari、部分 Firefox、没有 GPU 的机器会直接显示报错。跑不起来的话看这张截图：

![Sandboard 截图](assets/screenshot.jpeg)

原作者 GitHub 账号 scottstts，线上原版在 <https://sand.scottsun.io>，仓库是
[scottstts/Sandboard](https://github.com/scottstts/Sandboard)，收录时钉在 commit
[`489cb01`](https://github.com/scottstts/Sandboard/tree/489cb01e81b11ba575887f7c76760498eb41aaa8)（2026-09-19）。

## 要点

- 沙面是一张 512×512 高度场，每格朝八个方向成对转移沙量，对角权重 1/6、正交 2/3，这样沟不会顺着网格方向歪；休止角阈值按真实链长算
- 质量守恒写成硬约束：飞起来的沙粒从床面扣掉等量高度，不许用截断高度来掩盖守恒误差
- 指针输入按床面上走过的距离切段，不按事件频率切，鼠标、触控板和触屏划出来的几何一致；速度只影响动量和扬沙
- 沙粒质感靠每个片元一次 3×3 程序化颗粒邻域搜索（各向异性 Voronoi），不另建颗粒网格，不做逐像素 raymarch
- 宏观光照（直射遮挡 + 八方向地平线天光）在模拟网格上算，片元只做双线性重建，屏幕分辨率再高也不重复算阴影
- 椰子树 `.glb` 只当投影体：用贴图 alpha 渲一张离屏阴影遮罩，自己从来不画进画面
- 复位海浪让渲染和擦除共用同一个岸线函数（`src/reset/wgsl.ts`），画面上的浪头和模拟里的擦除带严格对齐；擦除前沿单调推进，跳帧也不会漏擦
- WGSL 只写浏览器基线能过的语法：多分量 swizzle 不能当左值，`active` 这类保留字不能当变量名。headless Dawn 能编译过不代表浏览器也能过

每一条的完整说明在原作 `source/docs/` 下的十篇设计文档里：[沙粒输运](assets/sandboard-demo/source/docs/granular-transport.md)、
[颗粒渲染](assets/sandboard-demo/source/docs/grain-rendering.md)、[床面光照](assets/sandboard-demo/source/docs/bed-lighting.md)、
[复位海浪](assets/sandboard-demo/source/docs/reset-wave.md)、[着色器兼容性](assets/sandboard-demo/source/docs/shader-compatibility.md) 等。

## 收录说明

上面的 demo 是用原仓库 `vite build --base=./` 构建出来的，功能不删不改。为了能放在 wiki 的子目录下运行，
只改了一处：把三个写死成站点根的素材路径（两段 mp3、一个 glb）和 favicon 改成相对路径。
改动全文见 [wiki-relative-paths.patch](assets/sandboard-demo/source/wiki-relative-paths.patch)。

项目采用 GPL-3.0-only 许可。按许可证的要求，构建产物旁边附有对应的完整源码和
[LICENSE](assets/sandboard-demo/source/LICENSE)：

- [运行入口](assets/sandboard-demo/index.html)
- [启动与主循环](assets/sandboard-demo/source/src/runtime.ts)
- [沙面模拟求解器](assets/sandboard-demo/source/src/simulation/solver.ts)
- [模拟着色器](assets/sandboard-demo/source/src/simulation/shaders.ts)
- [渲染器](assets/sandboard-demo/source/src/render/renderer.ts)
- [复位海浪效果](assets/sandboard-demo/source/src/reset/effect.ts) / [水面光学](assets/sandboard-demo/source/src/render/water-reset.ts)
- [工程依赖](assets/sandboard-demo/source/package.json)
