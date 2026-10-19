<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/transitions/css-push.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

## 线性 / 推移（Linear / Push）

### 推移滑动（Push Slide）

两个场景一起移动——新场景把旧场景推出去。

```js
tl.to(old, { x: -1920, duration: 0.5, ease: "power3.inOut" }, T);
tl.fromTo(new, { x: 1920, opacity: 1 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.inOut" }, T);
```

### 垂直推移（Vertical Push）

和推移滑动一样，只是方向是垂直的。

```js
tl.to(old, { y: -1080, duration: 0.5, ease: "power3.inOut" }, T);
tl.fromTo(new, { y: 1080, opacity: 1 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.inOut" }, T);
```

### 弹性推移（Elastic Push）

推移时入场场景带有过冲回弹。

```js
tl.to(old, { x: -1920, duration: 0.5, ease: "power3.in" }, T);
tl.fromTo(new, { x: 1920, opacity: 1 }, { x: 30, opacity: 1, duration: 0.4, ease: "power4.out" }, T + 0.1);
tl.to(new, { x: -15, duration: 0.15, ease: "sine.inOut" }, T + 0.5);
tl.to(new, { x: 0, duration: 0.1, ease: "sine.out" }, T + 0.65);
```

### 挤压（Squeeze）

旧场景被压扁，新场景从相反一侧展开。

```js
tl.to(old, { scaleX: 0, transformOrigin: "left center", duration: 0.4, ease: "power3.inOut" }, T);
tl.fromTo(new, { scaleX: 0, transformOrigin: "right center", opacity: 1 },
  { scaleX: 1, opacity: 1, duration: 0.4, ease: "power3.inOut" }, T + 0.1);
tl.set(old, { opacity: 0 }, T + 0.5);
```
