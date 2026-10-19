<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/transitions/css-radial.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

## 径向 / 形状（Radial / Shape）

### 圆形光圈（Circle Iris）

从中心扩张的圆形揭示出新场景。

```js
tl.set(new, { opacity: 1 }, T);
tl.fromTo(new,
  { clipPath: "circle(0% at 50% 50%)" },
  { clipPath: "circle(75% at 50% 50%)", duration: 0.5, ease: "power2.out" }, T);
tl.set(old, { opacity: 0 }, T + 0.5);
```

### 菱形光圈（Diamond Iris）

从中心扩张的菱形。

```js
tl.set(new, { opacity: 1 }, T);
tl.fromTo(new,
  { clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)" },
  { clipPath: "polygon(50% -20%, 120% 50%, 50% 120%, -20% 50%)", duration: 0.5, ease: "power2.out" }, T);
tl.set(old, { opacity: 0 }, T + 0.5);
```

### 对角分割（Diagonal Split）

旧场景缩成一角的一个三角形。

```js
tl.set(new, { opacity: 1, zIndex: 1 }, T);
tl.set(old, { zIndex: 10, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }, T);
tl.to(old, { clipPath: "polygon(60% 0%, 100% 0%, 100% 40%, 60% 0%)", duration: 0.5, ease: "power3.inOut" }, T);
tl.set(old, { opacity: 0, zIndex: "auto", clipPath: "none" }, T + 0.5);
tl.set(new, { zIndex: "auto" }, T + 0.5);
```
