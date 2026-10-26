# 完整示例：添加一个 component

## 场景

用户想给标题文字加一个 shimmer 光带扫过的效果。

## 步骤

### 1. 安装 component

```bash
hyperframes add shimmer-sweep
```

### 2. 阅读片段

打开 `compositions/components/shimmer-sweep.html`，读一下头部的注释。

### 3. 接入你的 composition

**HTML** —— 包住目标元素：

```html
<div class="shimmer-sweep-target" style="--shimmer-color: rgba(255, 255, 255, 0.5)">
  <h1 class="title">AI-Powered Video</h1>
</div>
```

**CSS** —— 粘贴片段中的 `.shimmer-sweep-target` 和 `.shimmer-mask` 规则。

**JS** —— 粘贴自动注入脚本（放在 timeline 代码之前）：

```js
document.querySelectorAll(".shimmer-sweep-target").forEach((el) => {
  if (!el.querySelector(".shimmer-mask")) {
    const mask = document.createElement("div");
    mask.className = "shimmer-mask";
    el.appendChild(mask);
  }
});
```

**Timeline** —— 加上扫光：

```js
tl.fromTo(
  ".shimmer-sweep-target",
  {
    "--shimmer-pos": "-20%",
  },
  {
    "--shimmer-pos": "120%",
    duration: 1.2,
    ease: "power2.inOut",
    stagger: 0.15,
  },
  1.5,
);
```

### 4. lint 并预览

```bash
hyperframes lint
hyperframes preview
```

### 5. 自定义

- `--shimmer-color`：每个元素的高光颜色
- `--shimmer-width`：光带宽度（默认 20%）
- `--shimmer-angle`：扫光方向（默认 120deg）
- Timeline 的 `duration`、`ease`、`stagger`：控制速度和手感
