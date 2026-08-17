# VERCEL LANYARD 可拖拽 3D 工牌

<iframe src="/skills/frontend-styles/assets/vercel-lanyard-demo/index.html"
        style="width:100%;height:680px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="Vercel Lanyard 可拖拽 3D 工牌 demo"></iframe>

一张挂在绳上的会议工牌：抓住它甩出去，绳子跟着摆、卡片自己转回正面 —— 物理引擎驱动的"真实感小玩具"，复现自 Vercel 官方博客 [Building an interactive 3D event badge with React Three Fiber](https://vercel.com/blog/building-an-interactive-3d-event-badge-with-react-three-fiber)（Ship 2024 注册页彩蛋）。核心只有约 80 行声明式代码。

## 要点

- 绳子建模成刚体链：`fixed → j1 → j2 → j3` 三段 `useRopeJoint`（每段最大长度 1），工牌用 `useSphericalJoint` 锚在卡片顶部 `[0, 1.45, 0]`，能像真挂绳一样自由摆动
- 关节只挂 `BallCollider args={[0.1]}` 参与物理不参与渲染；绳子的视觉每帧把四个刚体位置塞进 `CatmullRomCurve3`（`curveType='chordal'` 防过冲）采样 32 点交给 meshline
- 用 meshline 画绳带：three 原生线宽在几乎所有 GPU 上固定 1px，meshline 才能画出有宽度、可贴图的带子；贴图 `repeat={[-3, 1]}` + `RepeatWrapping` 沿绳长平铺
- 拖拽 = 指针 `unproject` 反投影到相机视线 + 刚体在 `kinematicPosition`（鼠标驱动）与 `dynamic`（物理接管）之间切换；按下时记录点击点相对卡片中心的偏移，卡片才不会跳到鼠标正下方
- `onPointerDown` 里 `setPointerCapture`，拖出 canvas 也不丢事件；拖拽中对整条链 `wakeUp()`，否则休眠刚体不跟手
- 对中间关节位置做 lerp 平滑消除猛拉抖动，但插值系数必须 `Math.min(1, dt * speed)` 钳在 [0,1] —— 超过 2 会每帧放大直至坐标爆成 NaN、绳子整条消失（实测掉帧时 `delta` 突增触发，坐标飙到 1e105）
- 每帧给卡片反向角速度 `y - rot.y * 0.25`，让正面始终倾向朝屏幕；`angularDamping/linearDamping = 2` 让甩动自然衰减
- 环境光用 drei 的 `Environment` + 四片 `Lightformer` 手搓，不依赖外部 HDRI 文件，卡片的 clearcoat 反光全靠它
- 免构建运行时：htm tagged template 替代 JSX + import map 指向 `/vendor/` 下 esbuild 预打的 ESM 单文件；react / three / fiber 这类"单例敏感"包打包时 external 化，由 import map 保证全页唯一实例
- esbuild external 是包名前缀匹配（`react-dom` 会连 `react-dom/client` 一起 external 掉造成自引用死循环），wrapper 入口要 `require.resolve` 成真实文件路径再 import
- CJS 包（react-dom、react-reconciler）对 external 依赖的 `require()` 在 ESM 产物里会炸，产物 banner 里 import 这些包并提供模块作用域 `require` shim 即可救回

## 第三方库

| 库 | 作用 |
| --- | --- |
| `three` | WebGL 3D 引擎（走全站共享 `/vendor/three/`，r185） |
| `@react-three/fiber` | three 的 React 渲染器，场景全部 JSX/htm 声明式 |
| `@react-three/drei` | 只用 4 个导出：`useGLTF` / `useTexture` / `Environment` / `Lightformer` |
| `@react-three/rapier` | Rapier 物理引擎（Rust→WASM）封装：刚体、碰撞体、rope/spherical joint |
| `meshline` | 有宽度可贴图的线渲染，绳带的视觉本体 |
| `htm` | JSX 的免构建替身，`html\`<mesh>\`` 直接跑 |

模型 `tag.glb`（含 card / clip / clamp 三个 node）与贴图 `band.jpg` 取自 Vercel 官方 demo CDN，已 vendor 进本文 assets。

## 已知瑕疵

绳子与卡扣连接处偶发闪烁/破面：meshline 在 shader 里用屏幕空间投影算带宽方向，绳末端切线接近指向相机时投影退化、方向随机翻转，参数层面无解。根治要换渲染方式（每帧重建 `TubeGeometry`，或自建 ribbon 几何在 CPU 算宽度方向、退化帧沿用上帧方向），收录版保持与原文一致未做替换。

## 完整实现

- [运行入口](../assets/vercel-lanyard-demo/index.html) —— 自包含单页，逻辑未压缩
- [vendor 打包脚本存档](../assets/vercel-lanyard-demo/build-vendor.mjs) —— esbuild 把 fiber/drei/rapier/meshline 打成 external 化 ESM 的配方；drei 需要新导出时在 stdin 入口加名字重跑
- 运行时库真身在全站共享 [`/vendor/react-esm/`](../../writing/mkdocs-wiki/index.md#iframe-demo)（react 19 ESM 五件套）与 `/vendor/r3f/`（fiber / drei-slim / rapier / meshline）

??? abstract "`assets/vercel-lanyard-demo/index.html` —— 演示单页源码（自包含、未压缩）"

    ```html
    --8<-- "skills/frontend-styles/assets/vercel-lanyard-demo/index.html"
    ```
