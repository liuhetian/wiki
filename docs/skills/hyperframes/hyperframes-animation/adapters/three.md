---
name: hyperframes-three
description: >
  HyperFrames 的 Three.js 与 WebGL adapter 模式。在创建确定性的 Three.js 场景、WebGL canvas 图层、AnimationMixer 时间线、镜头运动、shader 驱动的视觉，或响应 HyperFrames hf-seek 事件的 canvas 渲染时使用。
---
<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/adapters/three.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# HyperFrames 中的 Three.js

HyperFrames 通过它的 `three` runtime adapter 支持 Three.js。这个 adapter 并不接管你的场景。它发布 HyperFrames 时间并派发一个 seek 事件，让你的 composition 能渲染出精确的那一帧。

## 契约

- 尽可能同步地创建场景、相机、渲染器、材质和素材。
- 依据 HyperFrames 时间来渲染，而不是挂钟时间。
- 监听 `hf-seek` 事件，并精确渲染那个时间点。
- 在影响渲染结果的 seek 发生之前加载好模型、纹理和 HDRI。不要在 seek 时才去获取它们。
- 避免把 `requestAnimationFrame` 或 `renderer.setAnimationLoop` 当作影响渲染结果的运动的事实来源。
- **务必在根 `[data-composition-id]` 元素上设置 `data-duration="<seconds>"`。** 与 CSS/WAAPI/Lottie 不同，`three` adapter 没有时长自动推断 —— 它只通过 `hf-seek`/`__hfThreeTime` 转发时间，不会去检查你的场景里 `AnimationClip`/`AnimationMixer` 的长度。没有 `data-duration`（也没有 GSAP timeline）时，渲染引擎无从得知要抓取多长，会以 "Composition has zero duration" 失败。`npx hyperframes lint` 会对此报错（`root_composition_missing_duration_source`）。

adapter 在每次 seek 时设置 `window.__hfThreeTime`，并派发 `new CustomEvent("hf-seek", { detail: { time } })`。

## 基本模式

```html
<canvas id="three-layer"></canvas>
<script type="module">
  import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.2/+esm";

  const canvas = document.getElementById("three-layer");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  // Match these to your composition's frame size.
  renderer.setSize(1920, 1080, false);
  renderer.setPixelRatio(1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1920 / 1080, 0.1, 100);
  camera.position.set(0, 0, 6);

  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.4, 4),
    new THREE.MeshStandardMaterial({ color: 0x64d2ff, roughness: 0.38 }),
  );
  scene.add(mesh);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 2));

  function renderAt(time) {
    mesh.rotation.y = time * 0.7;
    mesh.rotation.x = Math.sin(time * 0.6) * 0.16;
    renderer.render(scene, camera);
  }

  window.addEventListener("hf-seek", (event) => {
    renderAt(event.detail.time);
  });

  renderAt(window.__hfThreeTime || 0);
</script>
```

```css
#three-layer {
  width: 100%;
  height: 100%;
  display: block;
}
```

## 加载扩展（`GLTFLoader`、`OrbitControls` 等）

对于 `three/addons/` 下的任何东西，用 importmap 让裸模块说明符能够解析。HyperFrames lint 既认这种写法，也认上面的内联 `+esm` import —— 按你的 composition 需要任选其一。

```html
<script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/"
    }
  }
</script>
<script type="module">
  import * as THREE from "three";
  import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  // ...
</script>
```

把两个条目中的 `three` 版本固定为同一个值。importmap 与裸导入之间混用不同版本会导致无声的故障。

## 重型初始化（大型网格、shader 编译）

runtime 在发布 render-ready 之前，已经会等待通过 Three 的 `DefaultLoadingManager` 排队的纹理/模型。但它看不到素材加载完之后你自己做的 CPU 密集型工作 —— 构建大型程序化网格、编译 shader、预热管线。这些工作可能会让 canvas 在 runtime 和播放器都已经报告"就绪"之后，依然空白好几秒。

如果你的初始化做了这类工作，就在 `window.__hf.buildReady` 上注册一个 promise（声明式计算等待：runtime 会等待，播放器显示加载状态而不是一个空白帧）：

```js
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["<your-piece-name>"] = buildScene(); // resolves once the scene is actually drawable
```

在启动构建的同一个 script 块里同步注册它 —— 时机与 `DefaultLoadingManager` 相同，这样 runtime 的首次就绪检查就能看到它。只对 adapter 看不到的初始化这样做；影响渲染结果的 seek 依然来自 `hf-seek`，而不是这个等待。键在 composition 内必须唯一 —— 在同一个键下的第二次注册会无声地替换第一次，丢掉它的等待。

## AnimationMixer 模式

对于 GLTF 或预先制作的 clip 动画，直接 seek mixer：

```js
function renderAt(time) {
  mixer.setTime(time);
  renderer.render(scene, camera);
}
```

如果有多个 mixer，就用同一个 `time` seek 所有 mixer。

## 同一个 Canvas 内的镜头切换

当一个场景按时间切换镜头时，每个切点只声明一次，并在所有地方读取这个常量：在相机的镜头选择器里，以及在每个物体的可见性窗口里。在切点附近单独写一个字面量的窗口（`t > 22.9`，而切点是 `t < 23`），会让下一个镜头的物体出现在上一个镜头的最后几帧里。在 30 fps 下这就是两帧的突然闪现，而每个镜头只截一张静帧是发现不了的。

```js
const CUT_B = 23;
const CUT_C = 35;

function shotFor(t) {
  if (t < CUT_B) return shotA(t);
  if (t < CUT_C) return shotB(t);
  return shotC(t);
}

function renderAt(t) {
  const shot = shotFor(t);
  camera.position.copy(shot.position);
  camera.lookAt(shot.target);
  shotBProps.forEach((mesh) => {
    mesh.visible = t >= CUT_B && t < CUT_C;
  });
  renderer.render(scene, camera);
}
```

验证每个切点时，要看它之前的最后一帧和之后的第一帧，而不只是每个镜头内部的某处。切点之前的最后一帧是 `(Math.ceil(cut * fps) - 1) / fps`：对于 30 fps 渲染中位于 23 s 的切点，用 `npx hyperframes snapshot --at 22.9667,23 --no-end`。

## 给受光网格打光

一个只被一盏 `PointLight` 或 `DirectionalLight` 照亮、没有环境光、环境贴图或自发光颜色的 `MeshStandardMaterial`，其背光的一侧完全得不到光。当相机正对那盏灯时，网格只露出这一侧，渲染成一个平平的黑色剪影。添加一盏补光来模拟环境的反射光，比如一盏颜色取自周围辉光的 `HemisphereLight`。如果主光的亮度随时间变化，就用同一个源以固定比例驱动两盏灯，比例靠肉眼调。它们的强度单位不同，所以不要把主光的数值照抄到补光上。

## 适用场景

- 确定性的 3D 物体、产品旋转展示、使用带种子数据的粒子，以及 shader 底板。
- 由 `time` 推导出的镜头运动。
- 素材在本地、且在校验完成之前就已加载好的 GLTF 动画 clip。

## 避免

- 用 `Date.now()`、`performance.now()` 或时钟增量来更新场景状态。
- 把影响渲染结果的工作留在一个自由运行的动画循环里。
- 在渲染时加载远程模型或纹理。
- 依赖设备像素比的输出。视频渲染时要固定渲染器尺寸和像素比。
- 依赖前一帧历史的后期处理 pass，除非你能根据时间重建状态。

## 校验

编辑 Three.js composition 之后：

```bash
npx hyperframes lint
npx hyperframes check
```

## 致谢与参考

- HyperFrames adapter 源码：`packages/core/src/runtime/adapters/three.ts`。
- 为什么这里特别需要 `data-duration`（这个 adapter 没有自动推断）：`packages/core/src/runtime/init.ts`（`resolveAdapterDurationFloorSeconds`），以及 CSS/WAAPI/Lottie adapter 的 `getInferredDurationSeconds`，`three` adapter 有意没有实现它。
- Three.js `WebGLRenderer` 文档：https://threejs.org/docs/pages/WebGLRenderer.html
- Three.js `AnimationMixer.setTime()` 文档：https://threejs.org/docs/pages/AnimationMixer.html
