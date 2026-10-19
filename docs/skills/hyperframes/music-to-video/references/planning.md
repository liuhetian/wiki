<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/music-to-video/references/planning.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 规划（Step 3）—— 挑选品牌，填满每一个 frame

在 Step 3，**你（编排者）**把 Step 2 的骨架变成一份完整的、获得批准的 `STORYBOARD.md`。你就地编辑**同一个文件**：先挑定品牌主干，然后为每个 frame 决定它的 **group**，给每个 group 一种处理方式，绑定真实的节拍锚点，并写好文案。

你的信条：**音乐是主心骨；模板是一个起步优势，不是一个笼子；字体排印是底线，素材是同一张节拍网格上的一种可选配料。**

**你负责做什么，不负责怎么做。** 你点名模板 / 基本元素、内容、品牌、锚点秒数和意图。frame-worker（Step 4）决定怎么做 —— 微观时间、具体实现、frame 内部的切。**绝不要把毫秒级的 tween 写进分镜。**

## 输入

- 已经在 `STORYBOARD.md` 里的 Step 2 骨架 —— 带有 `span_sec` + `pacing` + `mood` + `feel` 的各个 frame。
- `audiomap.json` —— 时间上的事实依据；读出每个 frame 的 span 内真实的锚点秒数。
- [`template-catalog.md`](template-catalog.md) —— 模板选择菜单。
- [`motion-primitive-catalog.md`](motion-primitive-catalog.md) —— 自由组合菜单（L0 配方）。
- [`montage.md`](montage.md) —— 素材处理方式（仅当用户提供了图片 / 视频时）。
- 用户的 brief / 提供的文案 —— 主题、情绪、需要原样保留的确切措辞。

## Step A —— 挑定品牌主干（一个 preset，原封不动）

整支视频共用一个字体家族 + 色板。用 `../../hyperframes-creative/references/design-spec.md` 里的 preset 表，从 `../../hyperframes-creative/frame-presets/` 中挑**一个现成的 preset** —— 按曲目的情绪 + brief 来选，而且**只有它的字体 + 颜色有意义**（构图 + 运动归模板管；preset 只决定外观）。**原封不动**地复制进来：

```bash
cp ../hyperframes-creative/frame-presets/<preset>/FRAME.md "$PROJECT_DIR/frame.md"
```

然后据此填写分镜 frontmatter 的 `style`：`font` 取自它的 `typography:`，一个 ≤4–6 个色块的 `palette` 取自它的 `colors:`。**hex 值 / 字体家族名要逐字照抄 —— 绝不编造或取整。** 每个 group 的色板参数都取自这一个色板；正是这种统一，让不同的模板读起来像同一件作品。

## Step B —— 为每个 frame 决定它的 group

一个 frame 通常就是**一个 group**（一个模板，或者一个跨越整个 frame 的自由组合）。**只有当单一处理方式覆盖不了这个 frame 时**，才细分成 2 个以上的 group —— 例如一个繁忙的开场加一个收尾的 lockup。拆分时，在该 frame 的 span 内的一个**真实 audiomap 锚点**处切开（一个 `key_moment` / `phrase` 边缘 / onset 簇之间的间隙），**绝不在一段 `rolls[]` 内部**切，并且每个 group 都要**≥ 约 1 小节**。密度**不会**迫使你增加 group —— 一个密集的 frame 通常是**一个** group，由它的模板在内部消化掉这种密度（像 `poster-tile-mosaic` 这样的元模板）。**group 的数量跟随不同处理方式的数量，而不是节拍数。**

## Step C —— 为每个 group 挑一种处理方式（三选一，恰好一种）

### A. 匹配一个模板

阅读 [`template-catalog.md`](template-catalog.md)。把这个 group 的 `feel` + `mood` + `pacing` 与模板的 **Reach for it when**（何时选用）进行匹配；选最接近的那个。然后绑定它：

- 填写 `params`（键名取自 catalog 条目）—— 你的文案填进文字槽位，色板取自品牌主干，`duration` = 这个 group 的 span 长度。
- 用从 `audiomap.json` 中读出的、这个 group 的 span 范围内的**真实锚点秒数**填写 `role_bindings`（不要用示例时间）。
- 如果模板的自然结束点和 group 的 span 终点对不上，就吸附到最近的锚点。

### B. 自由组合（没有合适的模板）

写一个 `free_design` —— 一个来自 [`motion-primitive-catalog.md`](motion-primitive-catalog.md) 的视觉主张（一个主导系统 + 点名的 L0 基本元素 + 一种密度拓扑）+ `anchors`（各个动作所骑的真实节拍 / onset 秒数）。自由组合是一种**一等**选择，要写得和匹配模板的 group 一样用心 —— 它绝不是一种失败。

### C. 素材处理方式（仅当用户提供了素材并且合适时）

把它做成一个 `asset` group（[`montage.md`](montage.md)）。**遵守 `pacing`：** 在 `beat_cut` frame 上用 `beat_cut`（每个锚点一个 clip）或 `bg_under_text`；在 `phrase_flow` frame 上用 `ken_burns` 或缓慢的交叉淡化 —— **绝不**做逐 onset 硬切。素材是附加的：如果没有素材适合某个 group，就回退为模板 / 自由组合（字体排印是底线 —— 一支完整的视频不需要素材）。

## 文案（措辞由你负责）

- 保留用户的确切措辞；否则就按 brief 的情绪，有品位地自己写。
- **信息 vs 质感：** 一个可读的词至少要停留 1 拍（标题 3–8 拍，句子 4–10 拍），稳定 + 处于焦点；停留不足 1 拍的词就是质感（频闪 / 网格 / 刻度）。绝不要把一条信息硬塞进不足一拍的时长里 —— 把它降级为质感。
- 把文案放进模板的文字参数、放到自由组合 group 的锚点上，或者作为素材 group 的 `overlay_copy`。声明锚点 + 累加 / 错开的意图；微观时间留给 worker。
- 收尾的 logo / CTA 落在最后一下打点 / hard stop 上，并在之后的静音中一直保持。

## 转场（不由你产出）

目前一切都是 **0ms 硬切**。**frame → frame** 归组装器管（文件首尾相接）；相邻的 `span_sec` 本身就意味着切。**frame 内部的 group → group** 归 worker 在它的 frame timeline 上管；你只需设置每个 group 的 `span_sec`。

## 写出 + 校验

写完整的 `STORYBOARD.md`（[`storyboard-format.md`](storyboard-format.md)），然后运行 `node scripts/validate-plan.mjs`，修好每一个 `✗`。在聊天里呈现逐 frame 的摘要，反复修改直到获得批准（具体做法见 `SKILL.md` 的 Step 3）。

## 自查

- `frame.md` 是某一个 preset 的逐字副本；frontmatter 的 `style.font` / `style.palette` 取自它（确切值）。
- 每个 frame 都变成了 ≥1 个 group；各个 group 按顺序铺满 frame 的 span；没有 group 短于约 1 小节；没有 group 边界落在一段 `rolls[]` 内部。
- 每个 group 恰好是 template / free_design / asset 三者之一。
- 模板的 `params` 键名与 catalog 条目一致；`role_bindings` / `anchors` 使用真实的 audiomap 秒数。
- 素材处理方式遵守 `pacing`（`phrase_flow` frame 上不用 `beat_cut`）。
- 每个 group 的色板都取自那一个品牌色板。
- `duration_s == audiomap.audio.duration_sec`；`validate-plan.mjs` 通过。
