## 覆盖（Cover）

### 错落色块（Staggered Color Blocks）

全屏（1920x1080）的彩色 div 错落地横扫过画面。场景在被盖住时完成交换。

**2 块**（标准）：

```js
tl.set("#wipe-a", { x: -1920 }, T - 0.01);
tl.set("#wipe-b", { x: -1920 }, T - 0.01);
tl.to("#wipe-a", { x: 0, duration: 0.25, ease: "power3.inOut" }, T);
tl.to("#wipe-b", { x: 0, duration: 0.25, ease: "power3.inOut" }, T + 0.06);
tl.set(old, { opacity: 0 }, T + 0.2);
tl.set(new, { opacity: 1 }, T + 0.2);
tl.to("#wipe-a", { x: 1920, duration: 0.25, ease: "power3.inOut" }, T + 0.28);
tl.to("#wipe-b", { x: 1920, duration: 0.25, ease: "power3.inOut" }, T + 0.34);
```

**5 块**（密集变体）：同样的模式，5 个色块，错开 0.04s。使用 composition 色板里的颜色。

### 水平百叶窗（Horizontal Blinds）

全宽的条带错落地横扫过画面。每一条：`width: 1920px; height: Xpx`。

**6 条**（每条 180px）：错开 `0.03s`；**12 条**（每条 90px）：错开 `0.018s`

```js
for (var i = 0; i < N; i++) {
  tl.set("#blind-h-" + i, { x: -1920 }, T - 0.01);
  tl.fromTo("#blind-h-" + i, { x: -1920 }, { x: 0, duration: 0.2, ease: "power3.inOut" }, T + i * stagger);
}
tl.set(old, { opacity: 0 }, T + coverTime);
tl.set(new, { opacity: 1 }, T + coverTime);
for (var i = 0; i < N; i++) {
  tl.to("#blind-h-" + i, { x: 1920, duration: 0.2, ease: "power3.inOut" }, T + exitStart + i * stagger);
}
```

### 垂直百叶窗（Vertical Blinds）

和水平百叶窗一样，只是条带又高又窄，沿 Y 轴移动。
