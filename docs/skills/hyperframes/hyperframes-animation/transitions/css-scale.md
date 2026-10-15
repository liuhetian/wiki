<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/transitions/css-scale.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

## 缩放 / 变焦（Scale / Zoom）

### 穿越变焦（Zoom Through）

旧场景放大冲过镜头并变模糊，新场景从后方放大进入。

```js
tl.to(old, { scale: 2.5, opacity: 0, filter: "blur(8px)", duration: 0.4, ease: "power3.in" }, T);
tl.fromTo(new,
  { scale: 0.5, opacity: 0, filter: "blur(8px)" },
  { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "power3.out" }, T + 0.15);
```

### 缩小退出（Zoom Out）

旧场景缩小远去，新场景原本就在它后面。需要管理 z-index。

```js
tl.set(new, { opacity: 1, zIndex: 1 }, T);
tl.set(old, { zIndex: 10, transformOrigin: "50% 50%" }, T);
tl.to(old, { scale: 0.3, opacity: 0, duration: 0.4, ease: "power3.in" }, T);
tl.set(old, { zIndex: "auto" }, T + 0.4);
tl.set(new, { zIndex: "auto" }, T + 0.4);
```
