<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-animation/blueprints/video-text-pivot.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# video-text-pivot —— 视频 → 文字转向

**intent / 意图**：一段产品视频占据中央、抓住注意力，然后滑到一边，把它的分量交给在它腾出的空间里出现的一个 hero 数据，接着两者都清场，动态文字打进中央 —— 强调词承载起原先由视频承载的含义 —— 最后由一个渐变胶囊封口。整条弧线是「展示 → 让位 → 转向 → 盖章」，每一次交接都把一个退场和一个同锚点的入场配成一对，这样读起来是两拍，而不是四拍。

**roles served / 服务的角色**

- Product_Intro（来自 `metric-video-text-pivot`）：当开场是先「看这个功能」再「看它的影响」，并且 `[product video]` 必须在数据揭示期间一直可见时使用 —— 它是滑走，而不是切走。
- Key_Feature：一段功能片段让位给一个占满画面的指标和一行排版式的影响句。

**duration / 时长**：6–8 秒

**shot structure / 镜头结构**（一张 `[bg]` 画布；一个 `[product video]`，是真实的静音 `.mp4` clip，一个 hero 数据，然后是动态文字 —— 每一对共享同一个屏幕锚点，让交接读起来像一次分量转移）

- **Scene 1（0.0–约 1.6 秒）—— 视频展示。** `[product video]` 以平滑的放大落在中央并呼吸（一个小幅的 y 方向浮动），占据全部注意力。镜头静止。
- **Scene 2（约 1.6–3.2 秒）—— 让位 + 数据（招牌动作）。** 视频**滑**到一边（x 移动 + 缩小），**正好滑进** `[hero stat]` 此刻填满的那块空间 —— 同时数据以带 3D 纵深的字体弹出 —— 一次分量转移读起来是单一事件，而不是两个。数据在这个时间窗口内呼吸。
- **Scene 3（约 3.2–5.0 秒）—— 转向文字。** 视频和数据都清场，动态的 `[impact text]` 逐字符**打进**腾空的中央；它的 `[accent words]` 承载起原先由视频承载的含义。
- **Scene 4（约 5.0 秒–结束）—— 盖章。** 一个渐变 `[pill]` 围绕收尾句猛然合拢（`scaleX` 0→1），它的光晕晚一拍才定型，让轮廓先于光晕被读到 —— 把这句陈述封成一个整体图形。停留。

**motion vocabulary / 动作词汇**：视频放大入场 + 小幅呼吸；分量转移式滑动（视频 x 移动 + 缩小，在同一个锚点交接给数据）；带 3D 纵深的数据字体；字符流式打字；渐变胶囊的 scaleX 猛合；光晕绽放落后于轮廓。

**rule mapping / 规则映射**

- 视频入场（平滑）和分量转移式滑动 → `gsap-effects`（先 scale/opacity，然后用长尾的 `power3` 做 x + scale）；视频本身是根节点的直接子元素，一个静音的 `<video class="clip">`
- hero 数据占满画面的 3D 字体 → `3d-text-depth-layers`（静态纵深变体 —— 图层在 setup 时就建好，没有级联去和入场打架）
- 同锚点的视频退场 ↔ 数据入场交接（如果当作变形处理）→ `scale-swap-transition`（共享中心）
- 通过分段 span 逐字符打出影响句 → `dynamic-content-sequencing`（干净的字符流）或 `discrete-text-sequence`
- 胶囊 `scaleX` 猛合 + 尾随的光晕 → `gsap-effects`（scaleX）+ `ambient-glow-bloom`（光晕，晚一拍定型）
- 视频 / 数据在各自时间窗口内的呼吸 → `sine-wave-loop`（低振幅的那一档 —— 细微抖动，限定在各元素自己的时间窗口内，绝不做永久循环）

**camera modifier / 镜头修饰**：镜头静止 —— 所有运动都在元素空间里（视频在平移），所以「转向」是元素在动，而不是镜头在动。
