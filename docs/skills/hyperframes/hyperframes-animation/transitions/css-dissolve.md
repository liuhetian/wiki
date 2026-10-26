## 溶解（Dissolve）

### 交叉淡化（Crossfade）

简单的不透明度交换。基准款。

```js
tl.to(old, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, T);
tl.fromTo(new, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.inOut" }, T);
```

### 模糊交叉淡化（Blur Crossfade）

带模糊 + 缩放变化的溶解。**模糊量随能量缩放**——见 SKILL.md 的「Blur Intensity by Energy」（按能量划分的模糊强度）一节。下面的示例是中等（默认）版本。平静的 composition 把模糊加到 20-30px，并在模糊峰值处停留 0.3-0.5s。高能量的则把模糊减到 3-6px，不停留。

**中等（默认）：**

```js
tl.to(old, { filter: "blur(10px)", scale: 1.03, opacity: 0, duration: 0.5, ease: "power2.inOut" }, T);
tl.fromTo(new,
  { filter: "blur(10px)", scale: 0.97, opacity: 0 },
  { filter: "blur(0px)", scale: 1, opacity: 1, duration: 0.5, ease: "power2.inOut" }, T + 0.1);
```

**平静（养生、奢侈品）——重模糊，停留在抽象色块上：**

```js
tl.to(old, { filter: "blur(25px)", scale: 1.05, duration: 0.6, ease: "power1.in" }, T);
tl.to(old, { opacity: 0, duration: 0.4, ease: "power1.in" }, T + 0.4);
tl.fromTo(new,
  { filter: "blur(25px)", scale: 0.95, opacity: 0 },
  { filter: "blur(25px)", scale: 0.95, opacity: 1, duration: 0.3, ease: "power1.inOut" }, T + 0.5);
tl.to(new, { filter: "blur(0px)", scale: 1, duration: 0.6, ease: "power1.out" }, T + 0.8);
```

### 焦点转移（Focus Pull）

离场场景缓慢变模糊，同时入场场景清晰地淡入。景深的感觉。**模糊量和停留时长都随能量缩放。**

**中等：**

```js
tl.to(old, { filter: "blur(15px)", duration: 0.5, ease: "power1.in" }, T);
tl.to(old, { opacity: 0, duration: 0.3, ease: "power2.in" }, T + 0.25);
tl.fromTo(new, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, T + 0.25);
```

**平静——缓慢的跟焦，在最大失焦处长时间停留：**

```js
tl.to(old, { filter: "blur(30px)", duration: 0.8, ease: "power1.in" }, T);
tl.to(old, { opacity: 0, duration: 0.5, ease: "power1.in" }, T + 0.6);
tl.fromTo(new, { opacity: 0, filter: "blur(20px)" },
  { opacity: 1, filter: "blur(20px)", duration: 0.3, ease: "power1.inOut" }, T + 0.7);
tl.to(new, { filter: "blur(0px)", duration: 0.6, ease: "power1.out" }, T + 1.0);
```

### 色彩过渡（Color Dip）

淡出到纯色，停留，再淡入新场景。

```js
tl.to(old, { opacity: 0, duration: 0.2, ease: "power2.in" }, T);
// Background color shows through
tl.fromTo(new, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" }, T + 0.25);
```
