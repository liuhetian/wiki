<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-core/references/full-screen-motion.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 全屏运动模式

对于全画幅的运动（连续的背景、色彩渐变铺底、跨越多个 clip 的铺满出血视觉状态），优先使用**共享背景层 + 透明的有计时内容层**，而不是层层堆叠的不透明场景背景。

## 模式

```html
<style>
  /* The runtime auto-positions root children that carry data-start. The shared
     background deliberately has none, so it gets NO automatic layout and must
     size itself, or #bg is 0px tall and the tween paints nothing. */
  #bg.full-bleed {
    position: absolute;
    inset: 0;
  }
  .clip.transparent {
    background: transparent;
  }
</style>

<div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-duration="20">
  <!-- Shared background — NOT a clip. Always visible. Driven by the timeline. -->
  <div id="bg" class="full-bleed"></div>

  <!-- Timed content layers — transparent backgrounds. -->
  <section
    id="scene1"
    class="clip transparent"
    data-start="0"
    data-duration="6"
    data-track-index="1"
  >
    <!-- content -->
  </section>
  <section
    id="scene2"
    class="clip transparent"
    data-start="6"
    data-duration="14"
    data-track-index="1"
  >
    <!-- content -->
  </section>
</div>

<script>
  const tl = gsap.timeline({ paused: true });

  // Drive the shared background from the seekable timeline.
  tl.to("#bg", { backgroundColor: "#0a1530", duration: 6, ease: "sine.inOut" }, 0);
  tl.to("#bg", { backgroundColor: "#1a0a30", duration: 14, ease: "sine.inOut" }, 6);

  // Scene-local animations stay transparent on top.
  tl.from("#scene1 h1", { y: 48, opacity: 0, duration: 0.6 }, 0.2);

  window.__timelines["main"] = tl;
</script>
```

## 规则

- **背景不是 clip。** 没有 `data-start` / `data-duration`。它在整个 composition 期间都存在。
- **正因为它不是 clip，它不会获得自动布局。** runtime 只会给带有 `data-start` 的根元素子元素定位并设定尺寸。无计时的背景必须自己设置 `position: absolute; inset: 0`，否则它会塌陷为零高度，你在它上面做的任何动画都看不见。这是照抄这个模式时最常见的错误。
- **内容场景使用透明背景。** 你放在共享 `#bg` 里的任何东西都会透出来。
- **从共享层驱动全局状态。** 色相偏移、暗角、颗粒、胶片质感滤镜 —— 在共享层上统一做一次动画，而不是每个场景各做一遍。
- **不要对 `.clip` 元素的可见性做动画。** HyperFrames 已经根据 `data-start` 和 `data-duration` 显示 / 隐藏 clip。对 clip 本身的 `display` / `visibility` 做动画，会与框架自己的显示 / 隐藏发生竞争。改为对 clip 内部的一个*子包裹层*做动画。
- **用 snapshot 验证有意的溢出。** 在添加 `data-layout-allow-overflow` 来消除检查警告之前，先运行 `npx hyperframes snapshot`，确认溢出正是你想要的。
