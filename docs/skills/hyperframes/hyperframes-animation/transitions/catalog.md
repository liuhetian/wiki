# 转场目录

硬规则、场景模板，以及到实现代码的路由。只读你需要的那种转场类型的参考文件——不要全部加载。

## 目录

- CSS 转场的硬规则
- 着色器转场
- 场景模板
- CSS 转场示例
- 着色器转场路由

## 硬规则（CSS）

违反这些会导致真实的 bug。

**场景可见性：** 场景 1 默认可见（不加 `opacity: 0`）。场景 2 及之后的场景在**容器** div 上设 `opacity: 0`。由 GSAP 把它们显现出来。不要用可见性垫片（`timedEls`）。

**字体：** 直接写你想要的 `font-family` 就行——编译器会通过带内联 data URI 的 `@font-face` 自动嵌入支持的字体。不需要 `<link>` 标签或 `@import`。在包括沙箱 iframe 在内的所有环境里都有效。

**元素结构：** 独立 composition 里的场景 div 上不要加 `class="clip"`。只有根 div 带 `data-composition-id`/`data-start`/`data-duration`。

**Overlay 元素：** 错落色块 = 全屏 1920x1080，**不是**细条。故障 RGB overlay = 普通混合、35% 不透明度，**不是** `mix-blend-mode: multiply`（在深色背景上看不见）。漏光 overlay = 比画面更大（2400px+），绝不能看出形状。过曝 = 对场景用 `filter: brightness()`，而不只是加一层白色 overlay。

**VHS 磁带：** 用 `cloneNode(true)` 克隆真实的场景内容，**不是**彩色条。每一条：比画面更宽（2020px，left:-50px）。红+蓝两个色差副本的 z-index 在主条之上。用带种子的 PRNG 生成确定性的随机偏移。

**Z-index：** 重力坠落、缩小退出、对角分割需要离场场景在**上层**（`zIndex: 10`），这样它离开时会揭示出后面的新场景（`zIndex: 1`）。

**页面灼烧：** 内容随页面一起烧掉——没有掉落的碎片。在灼烧结束时用 `tl.set` 隐藏 scene1，**绝不**用 `onComplete`（不可逆）。为了支持倒带，`onUpdate` 必须在 `wp <= 0` 时恢复 `clipPath: "none"`。入场场景在灼烧进行到 90% 时从黑色淡入。

**时钟擦除：** 9 个点的多边形，带中间的边缘位置。用独立的 tween 依次走过 4 个象限。

**网格溶解：** 每个格子在 5 种色板颜色之间循环，不要单色。

**百叶窗条数按能量定：** 平静：4 横/6 竖。中等：6-8 横/8 竖。高：12-16 横/16 竖。

**不要用：** 星形光圈（多边形插值有问题）、移轴（CSS 没有选择性模糊）、镜头光晕（形状可见，不像光学效果）、铰链/开门（变形太快）。

## 着色器转场

着色器设置、WebGL 初始化、抓取和片元着色器都由 `@hyperframes/shader-transitions`（`packages/shader-transitions/`）处理。API 细节读这个包的源码。使用着色器的 composition 必须遵守 `overview.md`（本目录）里与着色器兼容的 CSS 规则。

## 场景模板

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      body {
        margin: 0;
        width: 1920px;
        height: 1080px;
        overflow: hidden;
        background: #000;
        font-family: "YOUR FONT", sans-serif; /* compiler embeds supported fonts automatically */
      }
      .scene {
        position: absolute;
        top: 0;
        left: 0;
        width: 1920px;
        height: 1080px;
        overflow: hidden;
      }
      #scene1 {
        z-index: 1;
        background: #color;
      }
      #scene2 {
        z-index: 2;
        background: #color;
        opacity: 0;
      }
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-width="1920"
      data-height="1080"
      data-start="0"
      data-duration="TOTAL"
    >
      <div id="scene1" class="scene"><!-- visible --></div>
      <div id="scene2" class="scene"><!-- hidden --></div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      var tl = gsap.timeline({ paused: true });
      // Transition code here
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
```

每个转场都遵循：摆好新场景 → 让离场场景动起来 → 交换 → 让入场场景动起来 → 清理 overlay。

## CSS 转场

所有代码示例都用 `old` 表示离场场景内层的选择器，用 `new` 表示入场的，用 `T` 表示转场开始时间。只读你需要的那种类型的参考文件。

| 类型           | 转场                                          | 参考                        |
| -------------- | ---------------------------------------------------- | -------------------------------- |
| 推移（Push）           | 推移滑动、垂直推移、弹性推移、挤压     | `transitions/css-push.md`        |
| 径向 / 形状（Radial / Shape） | 圆形光圈、菱形光圈、对角分割            | `transitions/css-radial.md`      |
| 3D             | 3D 卡片翻转                                         | `transitions/css-3d.md`          |
| 缩放 / 变焦（Scale / Zoom）   | 穿越变焦、缩小退出                               | `transitions/css-scale.md`       |
| 溶解（Dissolve）       | 交叉淡化、模糊交叉淡化、焦点转移、色彩过渡     | `transitions/css-dissolve.md`    |
| 覆盖（Cover）          | 错落色块、水平百叶窗、垂直百叶窗 | `transitions/css-cover.md`       |
| 光效（Light）          | 漏光、过曝灼烧、胶片灼烧             | `transitions/css-light.md`       |
| 失真（Distortion）     | 故障、色差、波纹、VHS 磁带       | `transitions/css-distortion.md`  |
| 机械（Mechanical）     | 快门、时钟擦除                                  | `transitions/css-mechanical.md`  |
| 网格（Grid）           | 网格溶解                                        | `transitions/css-grid.md`        |
| 其他（Other）          | 重力坠落、圆形变形                           | `transitions/css-other.md`       |
| 模糊（Blur）           | 模糊穿越、方向模糊                       | `transitions/css-blur.md`        |
| 破坏（Destruction）    | 页面灼烧                                            | `transitions/css-destruction.md` |

## 着色器转场

WebGL 着色器转场由 `@hyperframes/shader-transitions`（`packages/shader-transitions/`）提供。这个包负责设置、抓取、WebGL 初始化、渲染循环和 GSAP 集成。可用的着色器和 API 读包的源码——不要手动复制原始 GLSL。

内置效果不是上限。对于内置效果都覆盖不到的效果，你可以从零写自定义 GLSL，改造网上找到的着色器代码（ShaderToy、GLSL Sandbox、GitHub），或者搭一个不属于任何现有类别的自定义 CSS 转场——用新的方式组合 clip-path、transform 和 filter。如果分镜要求一个还不存在的效果，就把它做出来；浏览器能跑的东西，框架都能渲染。
