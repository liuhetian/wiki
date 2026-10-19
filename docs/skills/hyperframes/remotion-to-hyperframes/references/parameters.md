<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/remotion-to-hyperframes/references/parameters.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 参数翻译：Zod schema、defaultProps、calculateMetadata

一个带类型的 Remotion `<Composition schema={...} defaultProps={...} />` 如何变成一个参数化的 HF composition。

## 同步的 calculateMetadata（可翻译）

```tsx
<Composition
  id="MyVideo"
  component={MyVideo}
  schema={z.object({ title: z.string(), duration: z.number() })}
  defaultProps={{ title: "Hello", duration: 90 }}
  calculateMetadata={({ props }) => ({
    durationInFrames: props.duration,
    fps: 30,
  })}
/>
```

当 `calculateMetadata` 是同步的、并且只用到 `props` 时，**在翻译时就把它求值** —— 用 `defaultProps`（或调用方指定的任何值）调用它，把具体的结果写进 HTML：

```html
<div
  id="stage"
  data-composition-id="MyVideo"
  data-start="0"
  data-duration="3"          <!-- 90/30 -->
  data-fps="30"
  data-title="Hello"
></div>
```

`data-title` 属性把这个值传递下去。原本读取 `props.title` 的代码，在 HF 中改为读取 `document.getElementById("stage").dataset.title`。

在场景 sub-composition 文件内部，这种查找够不到根上的 `#stage`。要把 prop 传给某个场景，就在它的宿主上用 `data-variable-values`，并在场景里用 `window.__hyperframes.getVariables()` 读取（在场景的 composition 元素上用 `data-composition-variables` 声明默认值）。

## 异步的 calculateMetadata（不可翻译）

```tsx
<Composition
  calculateMetadata={async ({ props }) => {
    const res = await fetch(...);
    return { durationInFrames: res.duration };
  }}
/>
```

**Refuse + interop**（拒绝 + 互操作）。HF 需要预先拿到 composition 的元数据来生成 HTML。在翻译时就把网络调用求值，违背了使用动态元数据的初衷。见 [escape-hatch.md](escape-hatch.md)。

lint 规则 `r2hf/async-metadata` 会捕获这种情况。T4 的案例 03 测试了它。

## 默认 props

```tsx
defaultProps={{
  title: "Hello",
  subtitle: "World",
  count: 42,
}}
```

翻译成根 `#stage` div 上的 `data-*` 属性：

```html
<div id="stage" data-title="Hello" data-subtitle="World" data-count="42">...</div>
```

约定：`propName` → `data-prop-name`（kebab-case）。在 GSAP 脚本中，通过 `document.getElementById("stage").dataset.propName` 读取。

## 嵌套的对象 / 数组 props

```tsx
defaultProps={{
  stats: [
    { label: "Stars", value: 1247, color: "#fbbf24" },
    { label: "Forks", value: 312, color: "#60a5fa" },
  ],
}}
```

不要试图把数组编码成一个 JSON 格式的 `data-` 属性 —— HF 的 runtime 不会解析它。把数组落实为**重复的 HTML 标记**：

```html
<div id="scene-stats">
  <div class="stat-card" data-stat-index="0" data-stat-value="1247" style="--card-color:#fbbf24">
    <div class="number">0</div>
    <div class="label">Stars</div>
  </div>
  <div class="stat-card" data-stat-index="1" data-stat-value="312" style="--card-color:#60a5fa">
    <div class="number">0</div>
    <div class="label">Forks</div>
  </div>
</div>
```

组件模板（`StatCard.tsx`）变成标记模板；每个实例的标量 props 都渲染成 `data-*` 和 CSS 自定义属性。

已在 T3 中验证 —— 三个 StatCard 以不同的 props 复用，平均 SSIM 0.953。

## 需要按类型解析的数值 props

`document.getElementById("stage").dataset.count` 是一个字符串。在读取时转换：

```js
const count = Number(stage.dataset.count);
```

或者，当数据在翻译时就已知、而且不需要在每次渲染之间变化时，直接把值内联进 GSAP 脚本。

## 布尔 props

```tsx
defaultProps={{ darkMode: true }}
```

有两种约定：

- `data-dark-mode="true"` —— 以字符串读取，比较 `=== "true"`
- `data-dark-mode`（有 / 无）—— true 时写 `<div data-dark-mode>`，false 时省略

选一种并保持一致。有 / 无的形式更符合 HTML 习惯，而且和 CSS 属性选择器搭配得很好：

```css
[data-dark-mode] .scene {
  background: #000;
}
```

## Zod 运行时校验

Remotion 的 `schema` 在 composition 加载时校验 props。HF 没有对应的机制 —— 等 HTML 进入渲染器时，schema 早已不在了。

改为在翻译时校验。如果用户传入了无效数据，就在输出 HTML 之前以翻译错误失败。这符合 Zod "大声失败"的意图，又不需要 runtime 依赖。

## composition 用 props 来推导计算出的 prop 时

```tsx
const Composition: React.FC<Props> = ({ stats }) => {
  const total = stats.reduce((acc, s) => acc + s.value, 0);
  return <div>{total}</div>;
};
```

在翻译时算出推导值，并把它写死进 HTML 或一个 `data-` 属性。不要试图在 HF composition 中用 JS 表达这个计算 —— 那会增加运行时开销，并让 HTML 变得有状态，给人工编辑带来麻烦。

如果推导并不简单（涉及数组本身，而不只是标量），就把它落实为 HTML 中的静态文本。
