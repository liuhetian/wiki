# L3 · 数据驱动节点图

L3 的分水岭不是"有没有连线"，而是**节点位置由谁决定**：L1/L2/L4 里用户摆哪是哪，L3 里位置是布局算法从数据里算出来的。JSON 可视化（jsoncrack）、DAG 流水线、血缘图谱都属于这档。demo 内置一个 60 行的迷你布局引擎（最长路径分层 + 重心排序），让你直观看到"数据进、图出"。

<iframe src="/skills/canvas/assets/demo-l3-nodegraph.html"
        style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="L3 demo：JSON → 自动布局节点图"></iframe>

试这几下：

- 左侧**改 JSON 再点渲染** —— 加几个字段、嵌套几层，图和布局全自动重算
- 点**换示例：流水线 DAG** —— 多入边的非树结构，分层布局照样服帖
- **悬停节点**高亮它的连线；注意节点**不可拖** —— 这是 L3 的立场：位置属于算法

## 生产选型

demo 里的迷你布局只为教学，生产直接用库：

| 库 | 渲染层 | 布局 | 什么时候选 |
|---|---|---|---|
| **@xyflow/react**（React Flow） | DOM 节点 + SVG 连线 | 自己接 dagre/ELK | 节点是富 React 组件、要交互（生产首选，MIT，社区最大） |
| **reaflow** | 纯 SVG | ELK 内置开箱即用 | 只读展示派生图，节点是简单文本 |
| **react-zoomable-ui** | 容器 | 无 | 单独提供 pan/zoom 容器，常与 reaflow 组合 |

jsoncrack 的经典组合（版本号来自其仓库实测）：

```json
{
  "jsonc-parser": "3.3.1",       // 容错 JSON 解析（注释/尾逗号不炸）
  "reaflow": "5.4.1",             // SVG 节点图 + ELK 自动布局
  "react-zoomable-ui": "^0.11.0"  // 缩放容器
}
```

数据流：`JSON → jsonc-parser AST → 自定义 parser → {nodes, edges} → reaflow <Canvas/> → 包进 <Space/>`。

React Flow 走法（节点要交互/表单时）：

```tsx
import { ReactFlow, Background, MiniMap, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';

// 1) 自定义节点 = 普通 React 组件，data 里塞什么都行
const nodeTypes = { task: TaskNode };

// 2) 布局：dagre 算 x/y 回填 nodes（大图放 Web Worker）
function layoutWith(nodes, edges) {
  const g = new dagre.graphlib.Graph().setGraph({ rankdir: 'LR' });
  nodes.forEach(n => g.setNode(n.id, { width: 200, height: 80 }));
  edges.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map(n => ({ ...n, position: g.node(n.id) }));
}

<ReactFlowProvider>
  <ReactFlow nodes={layouted} edges={edges} nodeTypes={nodeTypes} fitView>
    <Background variant="dots" />
    <MiniMap />
  </ReactFlow>
</ReactFlowProvider>
```

## 要点

- **分层布局的骨架很小**：① layer = 距根的最长路径（拓扑序推进）② 层内按父节点重心排序减少交叉 ③ 每层宽度取最宽节点。demo 里 60 行——理解了这个再看 ELK/dagre 的文档就不慌
- **端口类型化**是节点编辑器的好模式：每个节点声明输入/输出端口的 kind（`text|image|video|…`），连线要求两端 kind 一致——把图的合法性挪进类型系统
- **运行态与文档态分离**：执行进度/输出这类瞬时态不落盘，持久化时剥离，节点终态单独按 nodeId 存映射
- 图的**执行调度器写成纯逻辑模块**（拓扑排序、入度归零入队、并发上限、失败下游级联 skip、含环拒跑），不依赖 React——可独立单测，React hook 只注入执行器和回调
- React Flow 节点也支持用户拖拽自由摆放（很多生产工作流编辑器就这么用，配"新节点螺旋避让落位"即可），**不要因为"要自由摆放"而放弃 L3**——真正让你放弃 L3 的是"要白板工具链"

## 性能上限

- reaflow 是 SVG，**~5000 节点封顶**；jsoncrack 的官方策略是超过阈值（`NODE_LIMIT`）直接拒渲画布
- ELK/dagre 对超大图要 1–3 秒，**必须放 Web Worker**，否则冻 UI
- 富组件 + 大量节点选 React Flow（DOM 节点 + 内置视口优化）

## 源码（折叠）

??? abstract "demo 源码：`assets/demo-l3-nodegraph.html`（自包含单页，含 60 行布局引擎）"

    ```html
    --8<-- "skills/canvas/assets/demo-l3-nodegraph.html"
    ```
