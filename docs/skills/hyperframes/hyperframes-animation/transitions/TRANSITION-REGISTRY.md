<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/transitions/TRANSITION-REGISTRY.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 转场 registry——机器用的唯一事实来源

**PLV 场景间转场**的唯一事实来源。确定性的注入器（`product-launch-video/scripts/inject-transitions.mjs`）读取下面的 JSON 块，把匹配的 `gsap_template` 打到主 timeline 上。规划者（`product-launch-video/agents/visual-design.md`）通过 `name` 点名一个转场；其余一切都由 harness 负责。

这个文件**不是**全部转场的目录——那是 `catalog.md` + `css-*.md`（约 40 个 CSS + 着色器转场）。这个 registry 是精选出来的、**可直接用于 Tier-B** 的子集：只对两个场景的 **clip 包裹层**（`#el-<sid>`）做纯 transform / opacity / filter，不注入 overlay DOM，不需要场景之间配合。Overlay 类转场（错落色块、百叶窗、漏光、网格溶解、页面灼烧）和着色器转场推迟到后续阶段。

## 注入器如何应用一个转场

在场景 _i_（`from`）和场景 _i+1_（`to`）之间的一个 `break` 边界上，注入器会：

1. 把 `#el-<from>` 包裹层的 `data-duration` 延长 `duration_s`（停在它的最后一帧——已验证：`core/src/runtime/init.ts:1393-1410` 的 external-slot 分支）。
2. 把 `#el-<to>` 包裹层的 `data-start` 提前 `duration_s`（制造出重叠窗口）。
3. 把**所有** clip 的 `data-track-index` 重新分配为 0/1 交替（ping-pong），让两个重叠的包裹层永远不共用一条 track（这是一个可读性约定，不是渲染约束，`core/src/lint/rules/composition.ts`）。更高的 track 合成在上层。
4. 在 `T = overlap-start` 处把 `gsap_template` 打进 `window.__timelines["main"]`。

已通过原型渲染验证（2026-05-31）：主 timeline 上对包裹层的 tween 会被 seek 并渲染（不会和 sub-comp 自己那条暂停的 timeline 发生双重 seek——runtime 独立驱动它们），被延长的包裹层会停在场景 _i_ 的最后一帧，而位于更高 track 的入场包裹层会合成在离场包裹层之上并与之混合。

## 模板占位符

注入器会替换每一行 `gsap_template` 里的这些 token：

| Token                              | 含义                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `__OLD__`                          | `"#el-<from>"`——离场 clip 包裹层的选择器（带引号）                 |
| `__NEW__`                          | `"#el-<to>"`——入场 clip 包裹层的选择器（带引号）                   |
| `__T__`                            | 重叠开始时间，单位秒（主时钟）                             |
| `__DUR__`                          | 这个边界的 `duration_s`                                           |
| `__DX__`                           | 有方向的类型的水平位移：`-1920`（LEFT）/ `1920`（RIGHT） |
| `__DY__`                           | 垂直位移：`-1080`（UP）/ `1080`（DOWN）                            |
| `__ORIGIN_OUT__` / `__ORIGIN_IN__` | `squeeze` 用的一对 transformOrigin                                       |

`filter` / `scaleX` / `transformOrigin` 在主 timeline 上是 lint 干净的（已验证：`core/src/lint/rules/gsap.ts` 没有按属性的白名单，并且把检查范围限定在 `data-composition-id` 区间内；x/y/scale/rotation/opacity 白名单只是一条*场景 worker* 的 prompt 规则——它不约束 index.html）。

## Registry

```json
{
  "transitions": [
    {
      "name": "crossfade",
      "tier": "b",
      "overlay": false,
      "energy": "any",
      "default_duration_s": 0.5,
      "directions": [],
      "source": "css-dissolve.md",
      "gsap_template": [
        "tl.to(__OLD__, { opacity: 0, duration: __DUR__, ease: \"power2.inOut\" }, __T__);",
        "tl.fromTo(__NEW__, { opacity: 0 }, { opacity: 1, duration: __DUR__, ease: \"power2.inOut\" }, __T__);"
      ]
    },
    {
      "name": "blur-crossfade",
      "tier": "b",
      "overlay": false,
      "energy": "calm",
      "default_duration_s": 0.6,
      "directions": [],
      "source": "css-dissolve.md",
      "note": "Default when the two scenes' #root backgrounds differ a lot — the blur masks the background-color clash a plain crossfade would expose.",
      "gsap_template": [
        "tl.to(__OLD__, { filter: \"blur(10px)\", scale: 1.03, opacity: 0, duration: __DUR__, ease: \"power2.inOut\" }, __T__);",
        "tl.fromTo(__NEW__, { filter: \"blur(10px)\", scale: 0.97, opacity: 0 }, { filter: \"blur(0px)\", scale: 1, opacity: 1, duration: __DUR__, ease: \"power2.inOut\" }, __T__);"
      ]
    },
    {
      "name": "push-slide",
      "tier": "b",
      "overlay": false,
      "energy": "medium",
      "default_duration_s": 0.5,
      "directions": ["LEFT", "RIGHT", "UP", "DOWN"],
      "default_direction": "LEFT",
      "source": "css-push.md",
      "note": "Directional. The injector picks __DX__/__DY__ from the direction and emits the horizontal OR vertical pair (not both).",
      "gsap_template_horizontal": [
        "tl.to(__OLD__, { x: __DX__, duration: __DUR__, ease: \"power3.inOut\" }, __T__);",
        "tl.fromTo(__NEW__, { x: __DXIN__, opacity: 1 }, { x: 0, opacity: 1, duration: __DUR__, ease: \"power3.inOut\" }, __T__);"
      ],
      "gsap_template_vertical": [
        "tl.to(__OLD__, { y: __DY__, duration: __DUR__, ease: \"power3.inOut\" }, __T__);",
        "tl.fromTo(__NEW__, { y: __DYIN__, opacity: 1 }, { y: 0, opacity: 1, duration: __DUR__, ease: \"power3.inOut\" }, __T__);"
      ]
    },
    {
      "name": "zoom-through",
      "tier": "b",
      "overlay": false,
      "energy": "high",
      "default_duration_s": 0.4,
      "directions": [],
      "source": "css-scale.md",
      "gsap_template": [
        "tl.to(__OLD__, { scale: 2.5, opacity: 0, filter: \"blur(8px)\", duration: __DUR__, ease: \"power3.in\" }, __T__);",
        "tl.fromTo(__NEW__, { scale: 0.5, opacity: 0, filter: \"blur(8px)\" }, { scale: 1, opacity: 1, filter: \"blur(0px)\", duration: __DUR__, ease: \"power3.out\" }, __T__);"
      ]
    },
    {
      "name": "squeeze",
      "tier": "b",
      "overlay": false,
      "energy": "medium",
      "default_duration_s": 0.4,
      "directions": [],
      "source": "css-push.md",
      "note": "Old compresses to a vertical line on the left edge; new expands from the right edge. Incoming starts off (scaleX 0) so its higher-track stacking is harmless.",
      "gsap_template": [
        "tl.to(__OLD__, { scaleX: 0, transformOrigin: \"left center\", duration: __DUR__, ease: \"power3.inOut\" }, __T__);",
        "tl.fromTo(__NEW__, { scaleX: 0, transformOrigin: \"right center\", opacity: 1 }, { scaleX: 1, transformOrigin: \"right center\", opacity: 1, duration: __DUR__, ease: \"power3.inOut\" }, __T__);"
      ]
    }
  ],
  "tier_a_types": ["morph", "shared-element"],
  "default_high_energy": "zoom-through",
  "default_calm": "blur-crossfade",
  "max_duration_s": 2.0
}
```

## 默认值推导（规划者省略 `**Transition:**` 时由 prep.mjs 使用）

一个没有点名转场的 `break` 边界会得到一个默认值：

1. 如果入场场景的创意 brief 读起来是**高**能量（爆发性 / 动感 / 狂热之类的关键词），用 `default_high_energy`（`zoom-through`）。
2. 否则用 `default_calm`（`blur-crossfade`）——通用默认值。模糊能掩盖任何背景变化，看起来是有意为之，这能让整支视频保持在约 2 种转场类型（"重复 2-3 种"原则）。

## 作为规划者如何选择（agent 唯一的接触点）

**整支视频挑 2-3 种类型**并反复使用——重复才显得专业（见 `overview.md`）。这个预算**只计入 Tier-B 场景间类型**（上面 registry 里的 5 种）；Tier-A 的 `shared-element` 变形是由 worker 编写、由叙事 `intent: morph` 驱动的衔接——它**豁免、不计入** 2-3 种。在每个场景上点名它的入场转场：

```
**Transition:** blur-crossfade
**Transition:** push-slide LEFT
**Transition:** zoom-through 0.3s
```

省略这个锚点就接受上面的默认值。**不要**写 GSAP、碰时间，或者编辑 index.html——harness 会打入代码、计算重叠并分配 track。
