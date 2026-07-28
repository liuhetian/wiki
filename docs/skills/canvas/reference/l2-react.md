# L2 · React 手写画布

节点是**有业务逻辑的真 React 组件**（受控表单、计数器、播放器）、需要状态管理、但不需要白板全家桶 —— 这一档不要引入任何画布库，React + 一个状态方案 + 手写 transform 就是正解。本页 demo 的核心示范只有一件事：**transform 放 `useRef` 直写 DOM，别放 React state**。

<iframe src="/skills/canvas/assets/demo-l2-react.html"
        style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="L2 demo：React + useRef transform，renders 计数器现场对照"></iframe>

试这几下：

- 每个节点右上角有 **renders 计数** —— 使劲拖空白平移、滚轮缩放，计数**纹丝不动**：视口变换全程没有触发 React 渲染
- **拖节点标题**移动节点：拖拽中同样直写 DOM，松手那一刻才 sync 回状态（计数 +1）
- 节点里的**输入框和按钮**是货真价实的受控组件 —— 这就是 L2 相对 L4 的意义：节点想长什么样就长什么样

## 为什么 transform 必须走 ref

画布拖拽是 60fps 高频事件。如果 `transform` 放 React state，每帧 `setState` 都触发整个组件树 diff —— 节点一多必卡。正确姿势：

```tsx
const transformRef = useRef<Transform>({ x: 0, y: 0, scale: 1 });
const worldRef = useRef<HTMLDivElement>(null);

const applyTransform = () => {
  const t = transformRef.current;
  worldRef.current!.style.transform =
    `translate(${t.x}px, ${t.y}px) scale(${t.scale})`;
};

// 高频 move 只动 ref + DOM；松手才让 React 知道最终位置
const onPointerUp = () => setViewport({ ...transformRef.current });
```

React 只负责它擅长的事（节点内容、选中态、增删），60fps 的活交给浏览器合成器。

## 要点

- **文档态和视口态分家**：节点数组走 React 状态（不可变更新，为将来接撤销/持久化留路）；`transform` 走 ref。节点拖拽同理——move 直写 `style.left/top`，up 才 `setNodes`
- **viewport.ts 不到 30 行**：`screenToWorld` / `worldToScreen` / `applyZoom`（锚点缩放公式与 [L1](l1-vanilla.md) 同一条），纯函数可单测
- **wheel 必须原生绑定**：React 合成事件拿不到 `{ passive: false }`，`preventDefault` 会失效，`useEffect` 里 `addEventListener` 一次
- 节点内部的交互元素（input/button）记得 `stopPropagation`，否则点按钮变成拖节点
- 推荐目录（骨架长这样，状态用 zustand 或 useState 皆可）：

```
src/canvas/
├── Canvas.tsx           # 容器：鼠标事件、框选、拖拽
├── viewport.ts          # 坐标转换 + 缩放，纯函数
└── nodes/
    ├── NodeWrapper.tsx  # 通用外壳：选中态、拖拽 handle
    └── XxxNodeView.tsx  # 业务节点
src/store/canvasStore.ts # nodes / viewport / selection
```

## L2 做到产品级要补什么

L2 架构撑得起完整产品，但 tldraw 白送的能力都得自己建，按需取用：

| 能力 | 低成本自建方案 |
|---|---|
| 撤销/重做 | 不可变更新 + 快照栈（见 [L4 demo](l4-whiteboard.md) 的 80 行实现） |
| 持久化 | 防抖 diff → PATCH，本地 IndexedDB 读缓存 |
| 协同 | 写锁 + 乐观锁 version + 服务端推送通道（见[总览](../index.md)） |
| 导出 | DOM 渲染的红利：html2canvas 直接截图；jspdf/pptxgenjs 动态 `import()` |
| 视口剔除 | 只渲染与视口相交的节点，节点多时再加 |

## 何时升级

- 节点位置应该由数据/算法决定 → [L3](l3-nodegraph.md)
- 要白板工具栏/自由绘制/开箱协作 → [L4](l4-whiteboard.md)

## 源码（折叠）

??? abstract "demo 源码：`assets/demo-l2-react.html`（React 18 + htm，站内 vendor，无构建）"

    ```html
    --8<-- "skills/canvas/assets/demo-l2-react.html"
    ```
