<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/transitions/css-other.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

## 其他（Other）

### 重力坠落（Gravity Drop）

旧场景带着轻微旋转向下坠落。新场景原本就在它后面。需要处理 z-index。

```js
tl.set(new, { opacity: 1, zIndex: 1 }, T);
tl.set(old, { zIndex: 10 }, T);
tl.to(old, { y: 1200, rotation: 4, duration: 0.5, ease: "power3.in" }, T);
tl.set(old, { opacity: 0, zIndex: "auto" }, T + 0.5);
tl.set(new, { zIndex: "auto" }, T + 0.5);
```

### 圆形变形（Morph Circle）

一个圆从中心放大直至填满画面（变成新场景的背景色）。新场景的内容在它上面淡入。

```js
tl.set("#morph-circle", { background: newBgColor, opacity: 1, scale: 0 }, T);
tl.to("#morph-circle", { scale: 30, duration: 0.5, ease: "power3.in" }, T);
tl.set(old, { opacity: 0 }, T + 0.4);
tl.set(new, { opacity: 1 }, T + 0.4);
tl.to("#morph-circle", { opacity: 0, duration: 0.15, ease: "power2.out" }, T + 0.5);
```
