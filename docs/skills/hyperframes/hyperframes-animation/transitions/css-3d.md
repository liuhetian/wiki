## 3D

### 3D 卡片翻转（3D Card Flip）

绕 Y 轴旋转 180°。需要 CSS：在两个场景内层上都加 `backface-visibility: hidden; transform-style: preserve-3d;`。父元素需要 `perspective: 1200px`。

```js
tl.set(new, { rotationY: -180, opacity: 1 }, T);
tl.to(old, { rotationY: 180, duration: 0.6, ease: "power2.inOut" }, T);
tl.to(new, { rotationY: 0, duration: 0.6, ease: "power2.inOut" }, T);
tl.set(old, { opacity: 0 }, T + 0.6);
```
