<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/adapters/gsap-easing-and-stagger.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# Easing、Stagger 与基于函数的值

## Easing

内置 ease：`power1`、`power2`、`power3`、`power4`、`back`、`bounce`、`circ`、`elastic`、`expo`、`sine`、`none`。

每个都有 `.in`、`.out`、`.inOut` 三种变体。

| Ease | 用途 |
| --- | --- |
| `power1.out`、`power2.out` | 次要元素的轻柔运动（字幕淡入、小幅位移）。**不是**入场的默认值。 |
| `power3.out`（本家默认）、`power4.out` | 标准的长尾落定。入场、标题卡、hero 揭示。 |
| `sine.inOut` | 长而慢、平静的运动。交叉淡化、环境漂移。 |
| `back.out(1.7)` | 冲过头再落定。**罕用** —— 只用于明确俏皮的语域，绝不作为默认。 |
| `elastic.out(1, 0.3)` | 弹簧式弹跳。同样只限俏皮语域；优先用烘焙好的弹簧（见下文 Spring Eases）。 |
| `expo.inOut` | 干脆、有戏剧性。hero 场景之间的快速转场。 |
| `none`（线性） | 带定时反衬的镜头运动、机械运动。 |

入场选 `.out`，退场选 `.in`，对称运动和连续运动选 `.inOut`。

**顺滑胜过弹跳** —— 运动准则（`rules/spring-pop-entrance.md`、各工作流的 `motion-language.md`）：入场默认用 `power3.out` 或烘焙好的临界阻尼弹簧（见下文 Spring Eases）；过冲类 ease（`back` / `elastic` / `bounce`）是罕用的、明确俏皮的语域，绝不是本家风格。

## Easing 词汇（性格与情绪）

Easing 就是语气：一支只会低语的视频很无聊；在低语、正常、重击之间切换的视频才抓人。一个 composition 应该在各段落节拍中用到约 3 种 easing 性格 —— 但要**在顺滑家族内部按能量变化**（`sine` / `power1` 平静 → `power3` 标准 → `power4` / `expo` 重击）；不要靠过冲来制造变化。过冲是一种*语域*（明确俏皮），不是调味料。处处同一个 ease 显得平淡；处处弹跳显得廉价 —— 后一种失败更糟。

按性格划分的完整色板（每个家族都有 `.in`、`.out`、`.inOut` 变体）：

| 家族 | 性格 | 典型用途 |
| --- | --- | --- |
| `power1`–`power4` | 从轻柔（1）到激进（4）的加速曲线 | 通用。**power3 是本家主力**；power2 用于轻柔的次要运动，power4 用于戏剧性的急停 |
| `back(N)` | 冲过头再落定。N 控制越过目标的幅度（1=细微，4=狂野） | **罕用** —— 只用于明确俏皮的语域，绝不作为默认。保持 N ≤ 2；优先用 ζ 0.6–0.7 的烘焙弹簧（物理式落定，见 Spring Eases） |
| `elastic(amp, freq)` | 弹簧弹跳。amp=幅度，freq=振荡速度 | **罕用** —— 同样只限俏皮语域；烘焙弹簧（见下文）是它的物理版本 |
| `bounce` | 球落地式弹跳 | **罕用** —— 只用于肢体喜剧语域（真的有东西掉下来） |
| `expo` | 极端的加速曲线（比 power4 陡得多） | 高端/奢华的揭示、戏剧性入场 |
| `sine` | 顺滑、有机，没有硬边 | 环境漂浮、呼吸、Ken Burns、任何循环的东西。yoyo 运动用 `.inOut` |
| `circ` | 圆形加速（起步非常快、收尾非常柔，或反过来） | 镜头运动、场景转场、轨道运动 |
| `steps(N)` | 离散的 N 步跳变，不做插值 | 打字效果、光标闪烁、计数器跳动、复古/数码美学 |

**情绪映射：** 让 easing 性格匹配该段落节拍的情感内容。顺滑/有机的 easing（`sine`、`power1`）显得沉思、漂浮。激进的减速（`power4.out`、`expo.out`）显得干脆、自信。弹簧过冲（`back.out`）显得弹跳、有物理感 —— 但弹跳是一种语域，不是强调工具；只在明确俏皮的段落节拍上才用它。由分镜里的情绪描述来引导该用哪种性格 —— 而不是套公式。

## 默认值

```javascript
const tl = gsap.timeline({
  paused: true,
  defaults: { duration: 0.6, ease: "power3.out" }, // the house settle — smooth beats bouncy
});
```

或者全局设置：

```javascript
gsap.defaults({ duration: 0.6, ease: "power3.out" });
```

优先在 timeline 作用域设置默认值 —— 这样就在一个地方记录了这个 composition 的运动语言。

## Spring Eases（烘焙好的物理，seek 安全）

"iOS 手感"是**阻尼弹簧的速度曲线**，不是弹跳：快速起步，进入一段漫长的渐近落定。做得好的系统动画是临界阻尼或接近临界阻尼的 —— 几乎不过冲，或者完全不过冲。`power3.out` / `expo.out` 近似这条曲线；当你想要精确的那条 —— 或者为罕用的俏皮语域要一个*物理式*过冲 —— 就把弹簧的闭式解烘焙进一个函数 ease。

为什么不用实时弹簧库：交互式弹簧是一个有状态的积分器（速度逐帧累积），无法被确定性地 seek —— 要渲染第 N 帧，你得先模拟第 0…N−1 帧。下面的闭式解是**进度的纯函数** —— 没有状态，没有可失同步的东西，从构造上就是 seek 安全的。这也是 composition 里禁用交互库弹簧求解器的原因。

```javascript
// springEase — a damped spring's exact position curve as a GSAP ease.
// response         ≈ seconds one oscillation would take (0.3–0.6 for entrances)
// dampingFraction  1.0       = critically damped — smooth settle, NO overshoot (house default)
//                  0.80–0.85 ≈ the iOS system register — ~1–1.5% overshoot, felt not seen
//                  0.60–0.70 = explicitly playful — ~5–10% overshoot (rare; replaces back.out)
function springEase({ response = 0.5, dampingFraction = 1 } = {}) {
  const w = (2 * Math.PI) / response; // undamped natural frequency
  const z = dampingFraction;
  let pos; // x(t): 0 → 1, starting at rest (v0 = 0)
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z);
    pos = (t) => 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  } else if (z > 1) {
    const wo = w * Math.sqrt(z * z - 1);
    pos = (t) =>
      1 - Math.exp(-z * w * t) * (Math.cosh(wo * t) + ((z * w) / wo) * Math.sinh(wo * t));
  } else {
    pos = (t) => 1 - Math.exp(-w * t) * (1 + w * t);
  }
  // Settle time: last moment the curve sits outside ±0.1% of target.
  // Fixed-step scan, runs once at setup — deterministic (no Math.random / Date.now).
  const EPS = 0.001;
  const rate = z <= 1 ? z * w : (z - Math.sqrt(z * z - 1)) * w; // slowest decay mode
  const SCAN = 12 / rate;
  const N = 4800;
  let T = SCAN;
  for (let i = N; i >= 0; i--) {
    const t = (i / N) * SCAN;
    if (Math.abs(1 - pos(t)) > EPS) {
      T = ((i + 1) / N) * SCAN;
      break;
    }
  }
  const xT = pos(T);
  return {
    duration: T, // use as the tween's duration — the settle time IS the physics
    ease: (p) => pos(p * T) + p * (1 - xT), // normalized so ease(1) === 1 exactly
  };
}
```

用法 —— 从 helper 里**同时**取 ease 和 duration（落定时间是物理的一部分；覆盖 duration 只是给同一条曲线重新定时，所以要调速度请改 `response`）：

```javascript
const settle = springEase({ response: 0.4 }); // critically damped → duration ≈ 0.59s
tl.fromTo(
  "#hero",
  { scale: 0, opacity: 0 },
  { scale: 1, opacity: 1, duration: settle.duration, ease: settle.ease },
  0.2,
);
```

| dampingFraction | 过冲 | 语域 |
| --- | --- | --- |
| **1.0（默认）** | 无（单调） | 本家落定 —— 正是 `power3.out` 所近似的那条曲线。产品 / 企业 / 严肃基调。 |
| 0.80–0.85 | ~1–1.5% | "有生气，但不弹" —— iOS 系统默认的语域。过冲能感觉到，但看不出来。 |
| 0.60–0.70 | ~5–10% | **仅限**明确俏皮的场合（与 `back.out` 同一条规则，它就是用来替代 `back.out` 的 —— 弹簧的二阶落定读起来有物理感，而 `back` 读起来像卡通）。 |
| < 0.55 | > 12% | 不要用。进入卡通晃动的地界了。 |

| response | duration（ζ=1） | 手感 |
| --- | --- | --- |
| 0.25–0.35 | 0.37–0.51s | 紧凑的急停 —— chip、小型 UI |
| 0.35–0.50 | 0.51–0.74s | 标准入场 |
| 0.50–0.70 | 0.74–1.03s | 有分量的 hero 落地 —— 注意核对 `t ≤ 0.5s` 可见性规则 |

工艺要点：

- **ζ=1 对比 `power3.out`**：真实弹簧的前段发力更猛（四分之一时间处走完约 67%，对比约 58%），并以更长的渐近尾巴落定；形状的最大差异约 11%。正是这条长尾巴读起来"高级" —— 当落定本身**就是**这个镜头时用它（wordmark 落地、最终的 lockup）。
- **ζ<1 时，过冲曲线只能用在 transform 上** —— 绝不用在 `opacity` 上（会冲过 1）或颜色上。把 opacity 拆成一个独立的 `power2.out` tween，放在同一个 timeline 位置。
- **准则不变**：ζ 低于约 0.8 依旧是罕用的、明确俏皮的例外（`rules/spring-pop-entrance.md`）。本节的默认值是 ζ=1 —— 真实的弹簧物理不是弹跳的许可证。

## Stagger

```javascript
gsap.fromTo(".item", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 });
```

对象形式：

```javascript
gsap.fromTo(
  ".item",
  { y: 24, opacity: 0 },
  {
    y: 0,
    opacity: 1,
    stagger: {
      each: 0.08, // delay between each
      from: "center", // "start" | "end" | "center" | "edges" | "random" | index
      amount: 0.6, // total stagger time (overrides each if both set)
      grid: "auto", // for 2D stagger
      axis: "x" | "y",
    },
  },
);
```

优先用 `stagger`，而不是 N 个各自手动设 delay 的 tween —— 目标数量或顺序变化时它依然正确。用 `fromTo()` 而不是 `from()`，让起始状态显式化（见 `gsap-timeline-and-labels.md` → sub-composition 入场）。

## 基于函数的值

任何 var 都可以是一个函数 `(index, target, targets) => value`：

```javascript
gsap.to(".item", {
  x: (i, target, targets) => i * 50,
  rotation: (i) => (i % 2 === 0 ? 5 : -5),
  stagger: 0.1,
});
```

当每个元素的值取决于索引、属性或测量出的尺寸时用这个。比在循环里逐个构建 tween 更省、也更地道。

## gsap.matchMedia（仅限 preview）

`matchMedia` 只在某个媒体查询匹配时运行 setup，不再匹配时自动还原。它适合在浏览器里以不同 viewport 尺寸做 **preview**，也适合处理 `prefers-reduced-motion`。它**不能**替代按 composition 实际的 `data-width`/`data-height` 渲染 —— HyperFrames 以固定的 viewport 渲染。

```javascript
let mm = gsap.matchMedia();
mm.add(
  {
    isDesktop: "(min-width: 800px)",
    reduceMotion: "(prefers-reduced-motion: reduce)",
  },
  (context) => {
    const { isDesktop, reduceMotion } = context.conditions;
    gsap.to(".box", {
      rotation: isDesktop ? 360 : 180,
      duration: reduceMotion ? 0 : 2,
    });
  },
);
```
