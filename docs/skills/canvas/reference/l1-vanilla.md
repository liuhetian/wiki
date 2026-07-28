# L1 · 原生无限画布

零依赖：三个变量（`scale / panX / panY`）+ 一条锚点缩放公式，就是一块能缩放、能平移、卡片能拖着走、还带连线和网格的无限画布。适合静态作品集、展示页、任何不需要持久化编辑的场景。

<iframe src="/skills/canvas/assets/demo-l1-vanilla.html"
        style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="L1 demo：vanilla JS + CSS transform 无限画布"></iframe>

试这几下：

- **滚轮缩放** —— 注意缩放始终锚定鼠标位置，鼠标底下那个点不漂移
- **拖空白**平移画布，**拖卡片**移动单张卡 —— 连线实时跟随
- 缩放到很小再点**适应全部**，画布按内容包围盒回正

## 结构

整个画布只有三层，各司其职：

```
.viewport   裁剪窗口，overflow:hidden，自己永远不动，接收所有鼠标事件
├─ .grid    网格：CSS background，不进 transform 层
└─ .world   世界层：唯一被 transform 的元素
   ├─ svg.wires   连线（与节点同层，缩放时自动同步）
   └─ .card ×N    普通 absolute 定位 div，left/top 是 world 坐标
```

## 要点

- **锚点缩放一条公式**：`ratio = 1 - next/scale; panX += (ax - panX) * ratio` —— 保证锚点处的 world 坐标缩放前后不变。这条公式 L1 到 L4 通用，值得背下来
- **网格用 CSS background 而不是画图**：`background-size` 乘 scale、`background-position` 对 `28 * scale` 取模，跟随视口几乎零开销；千万别用 SVG 画一整张网格
- **`will-change: transform`** 把 world 层提升成独立合成层，平移缩放走 GPU，不触发重排
- **坐标换算只有一对函数**：`screenToWorld` / `worldToScreen`，拖卡片时把指针换算到 world 坐标再减初始偏移，天然适配任意缩放级别
- **一套 Pointer Events 通吃**鼠标/触屏/触控笔；`setPointerCapture` 保证快速甩动不脱手；`touch-action: none` 防止触屏把拖动抢去做页面滚动
- **wheel 监听要 `{ passive: false }`** 才能 `preventDefault`，否则浏览器照常滚动页面
- 连线是 world 层里一个 `overflow: visible` 的 `<svg>`，三次贝塞尔从源卡右侧到目标卡左侧，只在卡片移动时重画

## 局限（升级信号）

- 没有撤销/重做、没有序列化、没有视口剔除 —— 需要"编辑器"就该去 [L2](l2-react.md) 或 [L4](l4-whiteboard.md)
- 状态全靠全局变量，节点带业务逻辑（表单、播放器）后难以为继 —— 去 [L2](l2-react.md)
- 卡片上千后 DOM 本身拖慢渲染

## 源码（折叠）

??? abstract "demo 源码：`assets/demo-l1-vanilla.html`（自包含单页，零依赖）"

    ```html
    --8<-- "skills/canvas/assets/demo-l1-vanilla.html"
    ```
