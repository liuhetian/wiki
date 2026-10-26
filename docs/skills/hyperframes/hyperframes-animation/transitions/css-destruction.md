## 破坏（Destruction）

### 页面灼烧（Page Burn）

离场场景真的从一个角开始被烧掉。一道火线以基于噪声的不规则边缘向外扩张，一块 canvas 在灼烧边界画出焦黑的炭化线，当火烧到单个文字字符/元素时，它们碎裂剥落并在重力作用下掉落。入场场景在灼烧后面显露出来。

这个转场由三个系统协同工作：

1. **火焰几何**——从一个角（例如右下角）向外扩张的径向火线，用基于噪声的不规则性做出有机的边缘
2. **场景裁切**——离场场景使用一个 SVG clip-path（带 `fill-rule: evenodd`），挖出一个与火线形状吻合的洞。随着火势扩张，场景被裁掉的部分越来越多。所有内容（文字、图片、线条）都随页面一起烧掉——没有单独的碎片。
3. **焦边**——一个 `<canvas>` overlay 在火焰边界画出径向渐变的镶边，模拟炭化

**什么时候用：** 戏剧性的揭示、锋利/破坏性的情绪、游戏、霓虹黑色风格。这是目录里最戏剧化的转场——留给 hero 时刻。

**要求：**

- 一个用于灼烧边缘 overlay 的 `<canvas>` 元素
- 一个用于生成有机火焰边缘几何的噪声函数
- 带 evenodd fill-rule 的 SVG clip-path，用于反向裁切

**火焰几何（确定性噪声）：**

```js
function noise(x) {
  var ix = Math.floor(x),
    fx = x - ix;
  var a = Math.sin(ix * 127.1 + 311.7) * 43758.5453;
  var b = Math.sin((ix + 1) * 127.1 + 311.7) * 43758.5453;
  var t = fx * fx * (3 - 2 * fx);
  return a - Math.floor(a) + (b - Math.floor(b) - (a - Math.floor(a))) * t;
}

function fireRadiusAtAngle(angle, progress) {
  var base = progress * maxRadius;
  return (
    base +
    noise(angle * 3 + progress * 4) * 50 +
    noise(angle * 8 + progress * 9) * 20 +
    noise(angle * 15 + progress * 15) * 8
  );
}
```

**入场场景的时机：** 灼烧期间入场场景**不应该**可见。随着火焰吞噬离场场景，**洞里透出的是黑色**——这正是戏剧性所在。观众看着内容在黑暗的背景下被毁掉。

灼烧进行到约 90% 时，入场场景从黑色中**缓慢地**淡入——先是背景，然后内容错落出现。使用长而柔和的淡入（`power1.out`，时长 0.8-1.2s），让人感觉新场景是从黑暗中凝聚成形的，而不是生硬地交换。

```js
// Scene 2 stays at opacity: 0 during the burn — black behind the fire
tl.set("#s2-title", { opacity: 0 }, T);
tl.set("#s2-subtitle", { opacity: 0 }, T);

// At 90% through, scene bg fades in slowly from black
var contentReveal = T + BURN_DURATION * 0.9;
tl.to("#scene2", { opacity: 1, duration: 1.2, ease: "power1.out" }, contentReveal);

// Content fades in staggered on top, even slower
tl.to("#s2-title", { opacity: 1, duration: 1.0, ease: "power1.out" }, contentReveal + 0.5);
tl.to("#s2-subtitle", { opacity: 1, duration: 0.8, ease: "power1.out" }, contentReveal + 0.7);
```

**内容随页面一起烧掉——没有掉落的碎片。** scene1 上的 clip-path **就是**效果本身——随着火焰形状扩张，火焰边缘后面的一切（文字、图片、线条）都自然消失。不要克隆元素，不要制造掉落的碎片。内容是正在被吞噬的页面的一部分。焦黑的 canvas 边缘在灼烧边界提供视觉上的炭化线。

**在灼烧结束时用 `tl.set` 隐藏 scene1——绝不在 `onComplete` 里做。** 用 `onComplete` 隐藏 scene1 在来回拖动（scrub）时不可逆。改为在精确的灼烧结束时间点用一个 `tl.set`：

```js
tl.to(
  burnState,
  {
    progress: 1,
    duration: BURN_DURATION,
    ease: "none",
    onUpdate: function () {
      var wp = burnState.progress;
      var scene1 = document.getElementById("scene1");
      if (wp <= 0) {
        scene1.style.clipPath = "none"; // fully visible when rewound
      } else if (wp < 1) {
        scene1.style.clipPath = buildClipPath(wp);
      }
      drawEdge(wp);
    },
    // NO onComplete — use tl.set instead
  },
  T,
);

// Hide scene1 at exact burn end — reversible via timeline
tl.set("#scene1", { opacity: 0 }, T + BURN_DURATION);
tl.set("#scene1", { clipPath: "none" }, T + BURN_DURATION);
```

`onUpdate` 负责逐帧处理 clip-path 和 canvas 边缘。`tl.set` 负责最后的隐藏——向后拖动时 GSAP 会自动把它反转，把 scene1 恢复到 `opacity: 1`。

`onUpdate` 回调是关键——它每一帧都会运行，让 clip-path 和 canvas 边缘与 timeline 同步推进。
