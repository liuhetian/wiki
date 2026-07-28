# L4 · 白板

真正的白板产品 —— 自由摆放、多选框选、撤销重做、序列化导出、协作。demo 是一个约 300 行的**迷你白板**：不是让你照抄它上生产，而是让你亲手摸一遍这些能力，从而理解 L4 SDK（tldraw）到底替你写了多少代码 —— 这个玩具大概覆盖了 tldraw 能力面的 5%。

<iframe src="/skills/canvas/assets/demo-l4-whiteboard.html"
        style="width:100%;height:620px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="L4 demo：迷你白板（撤销/框选/序列化）"></iframe>

试这几下：

- **N** 放便签、**R** 画矩形、**双击便签**改文字、拖空白**框选**、Shift 加选、多选后整体拖动
- 干几步再 **Ctrl+Z / Ctrl+Shift+Z** —— 左下角历史深度实时变化；一次拖拽 = 一步历史
- **导出 JSON** 下载完整文档 —— 序列化就是这么回事

## 撤销/重做：80 行快照栈

demo 的历史引擎是最小可用实现，思路值得记住：

```js
const undoStack = [], redoStack = [];
const serialize = () => JSON.stringify(shapes);

// 每个"用户动作"提交一次：把动作前的世界压栈
function commit(prevSnapshot) {
  undoStack.push(prevSnapshot);
  redoStack.length = 0;          // 新动作作废重做线
}
function undo() {
  redoStack.push(serialize());
  shapes = JSON.parse(undoStack.pop());
}
```

两个容易做错的细节：**拖拽必须整体算一步**（pointerdown 时先拍快照，pointerup 且确实移动了才 commit，否则撤销一次只回退 1px）；**新动作清空 redo 栈**。快照栈在形状几百个时完全够用，形状上万才需要 op-based（记操作而非全量）方案——而那正是 SDK 的地盘。

## 生产：tldraw

```json
{ "tldraw": "^4.5", "react": "^18 || ^19" }
```

> **⚠ 许可证**：tldraw v2 起非宽松开源——免费使用必须保留 "Made with tldraw" 水印，商用去水印需购买 business license。这是选型决策因子。不能接受时用 MIT 的 [Excalidraw](https://github.com/excalidraw/excalidraw)（白板能力类似，自定义形状扩展弱于 tldraw）。

内置能力（demo 里手写的一切 + 你没空写的一切）：无限画布 + 视口剔除、完整撤销重做、snapshot 序列化、形状系统、多选/对齐/复制粘贴/快捷键、PNG/SVG/PDF 导出、协作方案、响应式 store（大量形状只重渲变化部分）。

自定义形状是核心扩展点。简单矩形盒直接继承 `BaseBoxShapeUtil`（免写 getGeometry）：

```tsx
import { BaseBoxShapeUtil, HTMLContainer, T } from 'tldraw';
import type { RecordProps, TLBaseShape } from 'tldraw';

type CardShape = TLBaseShape<'card', { w: number; h: number; title: string }>;

export class CardShapeUtil extends BaseBoxShapeUtil<CardShape> {
  static override type = 'card' as const;
  static override props: RecordProps<CardShape> = {
    w: T.number, h: T.number, title: T.string,
  };
  getDefaultProps() { return { w: 240, h: 120, title: '' }; }
  component(shape: CardShape) {
    return <HTMLContainer>{/* 任意 React UI */}</HTMLContainer>;
  }
  indicator(shape: CardShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={8} />;
  }
}

<Tldraw shapeUtils={[CardShapeUtil]} />
```

## 要点

- **框选的坐标要算两遍**：命中检测在 world 坐标（矩形相交），框子本身画在 viewport 层（screen 坐标 = world × scale + pan）——demo 里这两行对照着看
- **文档态天然可序列化**是白板架构的根基：形状就是一个扁平 JSON 数组，导出/导入/协同/历史全部建立在这上面
- 行内编辑（双击便签）时记得让快捷键和拖拽**让位**给 contenteditable：`e.target.isContentEditable` 一律 return
- 键盘可达：工具切换（V/H/N/R）、Delete、Ctrl+D，成本极低体验差别巨大

## 何时不要用 L4

- 只是展示一块画布 → [L1](l1-vanilla.md) 半天搞定
- 节点是高度业务化的卡片、不需要白板工具 → [L2](l2-react.md) 自己写更顺手，还没有水印
- 数据驱动的有向图 → [L3](l3-nodegraph.md)，tldraw 没有自动布局

## 源码（折叠）

??? abstract "demo 源码：`assets/demo-l4-whiteboard.html`（自包含单页，约 300 行）"

    ```html
    --8<-- "skills/canvas/assets/demo-l4-whiteboard.html"
    ```
