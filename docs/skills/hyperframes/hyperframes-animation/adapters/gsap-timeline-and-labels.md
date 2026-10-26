# Timeline 与 Label

HyperFrames 是一个由 seek 驱动的 runtime。每个 composition 构建一个暂停的 timeline，挂到 `window.__timelines["<composition-id>"]` 上，让 HyperFrames 去 seek 它。对于影响渲染结果的运动，绝不要调用 `.play()`。

## 创建 Timeline

```javascript
const tl = gsap.timeline({
  paused: true,
  defaults: { duration: 0.5, ease: "power3.out" },
});

tl.to(".a", { x: 100 }).to(".b", { y: 50 }).to(".c", { opacity: 0 });
```

Timeline 选项：

- **paused: true** —— 在 HyperFrames 里是必需的。由框架驱动播放头。
- **repeat**、**yoyo** —— 作用于整个 timeline。`repeat: -1` 要求根节点有有限的 `data-duration`（导出时按它截断）；否则请用有限次数。
- **defaults** —— 合并进每个子 tween 的 vars。用它来代替在每一行重复写 `ease` 和 `duration`。

## 位置参数

`.to()`/`.from()`/`.fromTo()` 的第三个参数控制在 timeline 上的摆放位置：

| 形式 | 含义 |
| --- | --- |
| `0`、`1.5` | 以秒为单位的绝对时间 |
| `"+=0.5"` | timeline 结尾之后 0.5s |
| `"-=0.2"` | timeline 结尾之前 0.2s |
| `"intro"` | 在 `intro` label 处 |
| `"intro+=0.3"` | `intro` label 之后 0.3s |
| `"<"` | 与上一个 tween 同时开始 |
| `">"` | 紧接上一个 tween 结束之后 |
| `"<0.2"` | 上一个 tween 开始后 0.2s |
| `">-0.1"` | 上一个 tween 结束前 0.1s |

```javascript
tl.to(".a", { x: 100 }, 0);
tl.to(".b", { y: 50 }, "<"); // same start as .a
tl.to(".c", { opacity: 0 }, "<0.2"); // 0.2s after .b starts
```

优先用位置参数而不是 `delay:` —— 它组合起来很自然，在重排 tween 的重构中也不会出错。

## Label

```javascript
tl.addLabel("intro", 0);
tl.to(".a", { x: 100 }, "intro");

tl.addLabel("outro", "+=0.5");
tl.to(".a", { opacity: 0 }, "outro");
```

Label 让长 timeline 易读，并让多个 tween 汇聚到同一个段落节拍上，而无需重复输入绝对时间。

## 嵌套 Timeline

```javascript
const master = gsap.timeline({ paused: true });

const child = gsap.timeline();
child.to(".a", { x: 100 }).to(".b", { y: 50 });

master.add(child, 0);
```

在 HyperFrames 里，**不要**把 sub-composition 的 timeline 嵌套进宿主。通过 `data-composition-src` 加载的 sub-composition 由 HyperFrames 依据它们各自的 `data-start` 独立 seek。嵌套只用于把*同一个* composition 的 timeline 里的片段分组。

## 在 Sub-Composition 内部：优先用 `fromTo` 而不是 `from`

对于 sub-composition 内的入场 tween，优先用 `gsap.fromTo()` 而不是 `gsap.from()`：

```javascript
// Sub-composition entrance — survives re-seek cleanly
tl.fromTo(".title", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.2);
```

原因：每当宿主 clip 变为可见时，HyperFrames 都会重新 seek 这个 sub-composition。`gsap.from()` 在**注册时**（页面加载时）对起始状态拍快照；当播放头往回跳过 `data-start` 时，这份快照可能与实际的 CSS 状态失同步，元素就会渲染在错误的位置。`gsap.fromTo()` 显式声明了两个端点，所以往回 seek 总能得到相同的起始状态。

在顶层（独立的）composition 里两种写法都行 —— 那里不存在"经过挂载重新 seek"的循环。

## 播放控制（仅用于调试 / preview）

```javascript
tl.play();
tl.pause();
tl.reverse();
tl.restart();
tl.time(2);
tl.progress(0.5);
tl.kill();
```

这些在浏览器里 preview 时很有用。在渲染输出中，HyperFrames 会在内部调用 `seek()` —— 你的 timeline 每次被 seek 到同一个时间值时，都必须产生完全相同的状态。
