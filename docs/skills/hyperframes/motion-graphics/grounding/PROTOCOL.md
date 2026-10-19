<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/motion-graphics/grounding/PROTOCOL.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# locate —— 在图片里找到 "X"（不假设有检测器 API）

每一个使用方（asset-fusion 圆环、webpage 高亮、未来的讲解视频 / 重剪 overlay）都使用的唯一契约：

```
locate(image, target-description) → { box: [x0,y0,x1,y1], center: [cx,cy] }   # normalized 0..1
```

## 为什么要有这个

创作模型在一张杂乱的整图上**回归像素坐标**时并不可靠（实测：较弱的视觉模型中心误差约 16–24% → 圆环套偏），但在**挑选带编号的条带**时是可靠的（用下面的循环约 3–4%）。所以：绝不目测坐标；用离散选择来定位。（RSVP，ACL 2025。）

## 路由 —— 选实际可用的最便宜路径

1. **有强力检测器可用**（例如环境里有 `GEMINI_API_KEY`）→ `node grounding/locate.mjs auto <img> "<target>"` —— 一次调用，完事。**绝不假设这个 key 存在。** 没有 key → 路径 2。
2. **没有检测器（常规情况）** → 你自己就是定位器；跑网格循环。

## 网格循环（步骤之间由你读图）

```
node grounding/locate.mjs overlay <img> --out /tmp/g
  → READ /tmp/g/gv.png (vertical strips 1-9) and gh.png (horizontal 1-9);
    decide which strip numbers the target spans (list EVERY strip it touches).
node grounding/locate.mjs region <img> --vids 4,5 --hids 6,7 --out /tmp/g
  → READ /tmp/g/gc.png (the region cropped + upscaled, finer 6×6 grid);
    pick the finer strips. (Pick strips again — do NOT switch to estimating
    coordinates; discrete choice is the whole point, at BOTH stages.)
node grounding/locate.mjs final <img> --region <from step 2> --vids 3,4 --hids 3,4
  → the final {box, center}.
node grounding/locate.mjs mark <img> --box <final box> --out /tmp/g/check.png
  → VERIFY: READ check.png. Red box ON the target → done. Off → redo
    region/final with corrected strips (you now know which direction). Never
    skip this step; it converts silent misses into one cheap retry.
```

## 歧义 —— 在定位之前先解决

如果目标描述能匹配好几个实例（场景里有五面鼓时说"一面鼓"），再多的几何计算也救不了你。先让指代变得唯一（"最右边那面鼓"、"前面那条船上的鼓"），必要时问用户 —— 然后再跑循环。

## 降级路径（如果 locate.mjs 本身不可用）

思路只有 5 行 —— 用任何图像工具都能复现：画一个带编号的 9×9 网格 → 挑出目标跨越的条带 → 裁出那个区域（+ 约 0.4 个条带的边距）并放大 → 画一个更细的 6×6 网格 → 再挑一次 → 映射回原图（`global = region_origin + local × region_size`）→ 画出框，然后**看**它。

## 备注

- 几何计算已固化在 `locate.mjs` 里（node + ffmpeg，零 npm 依赖 —— 两者都是 hyperframes 本来就需要的）。不要临时重新实现它；实测的精度只对**这一份**实现成立。
- 使用方：`samples/asset-fusion/_ref-circle-highlight.html` 直接从 `final`/`auto` 的输出取 `CFG.box`。
- 端到端实测（同一个 agent、同一个模板，只有定位这一步不同）：目测平均中心误差 6.5% → 本协议 2.3%，没有任何一个用例变差。
