<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/embedded-captions/references/layout-heuristics.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 布局启发式

如何在 plan.json 里选择 `wall_position` / `crown_position`。

## Step 1：采样 3 帧

```bash
ffmpeg -y -ss 0.5 -i source.mp4 -vframes 1 frame0.jpg
ffmpeg -y -ss <mid> -i source.mp4 -vframes 1 frame1.jpg
ffmpeg -y -ss <end-0.5> -i source.mp4 -vframes 1 frame2.jpg
```

三帧都要看。记下：主体头部的包围框、肩膀顶部的线，以及做手势时手会移动到的所有地方。最坏情况下的前景包络 = 3 帧的并集。

## Step 2：找到干净区域

字幕 plane 应该位于在整个片段中**始终是背景**的像素上。绝不放在身体会落到的地方。

标注大致范围：

- 头部包围框：`head_x_min`、`head_x_max`、`head_y_min`、`head_y_max`
- 手势包络（如果有）：通常在 `y = shoulder_top ≈ head_y_max + 40` 以下
- 道具（麦克风、杯子）：通常是静止的，记下包围框

**干净区域**，按优先级排序：

1. **离头部最远的角落**（通常与视线方向相反）
2. **head_y_min 上方、减去 30px 边距的顶部条带**
3. **Lower-third**，如果上方被占用（最后手段 —— 会破坏"嵌入"美学）

## Step 2.5：放在主体的哪一侧？

知道了主体和烧录图形的位置之后，决定由哪一侧（主体的左边还是右边）来承载字幕栏。优先顺序：

### 1. 先看硬约束 —— 烧录图形

台标、水印、日期戳、"60 Overtime" 这类 lower-third 已经存在于原片中。它们占据着你必须避开的永久区域。根据采样帧把它们标出来：

- Jobs 60 Minutes：左上角有 "2003"（x=280–460，y=30–90）；左下角有 "60 Overtime"（x=280–770，y=960–1080）。左侧部分受限；在这些区域的上方 / 下方仍然可用。
- TikTok 搬运视频：每隔几秒就在各个角落轮换的用户名水印 —— 很难规划避让，常常是拒绝的理由。

如果某一侧有硬约束吃掉了那一侧干净区域的 60% 以上，默认用另一侧。

### 2. 主体身体的偏向 —— 选较大的干净区域

计算两侧的干净区域宽度：

```
left_clean_width  = body_x_min − safe_left_margin
right_clean_width = safe_right_margin − body_x_max
```

选干净区域更宽的那一侧。如果差值在画面宽度的 10% 以内，两侧大致相当 → 进入第 3 步。

实例：

- **Champion**（Djokovic，1920×1080）：身体 x ≈ 550–1200。左侧干净 = 510，右侧干净 = 720。右侧更宽 → 但我们因为视线（见第 3 步）把字幕放在了**左**边。差距不大，两边都行得通。
- **Jobs**：身体 x ≈ 700–1480（中心偏右）。左侧干净 = 420，右侧干净 = 160。左侧完胜。字幕放在了**左**边。
- **Memory Wall**：表面的位置决定了放在哪一侧（见下面关于 wall-embed 的说明）。

### 3. 视线方向 —— "视线空间"规则（决胜条件，也是审美考量）

经典的电影构图：在主体**看向**的那一侧留出更多空白。这能保留他们的视线路径，画面也不显得拥挤。**字幕放在相反的一侧**（主体背对着的那一侧），这样就不会占用视线空间。

快速检查：采样 3 帧。估计视线向量。它更偏左还是更偏右？

- 看向画面右侧 → 字幕放**左**边
- 看向画面左侧 → 字幕放**右**边
- 正视镜头 → 视线上没有偏好，只用第 2 步

champion / Djokovic 的镜头里，他是从略偏左的位置对着镜头说话 —— 字幕放在左边，读起来其实像是他正看向的文字，会让人感觉他在回应这些字幕。在这里没问题，但这是一种风格选择；一般情况下优先放在视线的反方向。

### 4. 叙事强调（针对可选的 crown）

如果你用的是**中央舞台式 crown**，它横跨主体 —— 对它来说没有左右之分。但其他字幕（栏）仍然遵循第 1–3 步。

如果你用的是**干净区域式 crown**（缩小后放在某一块干净区域里，而不是横穿身体），为了视觉一致性，把它放在**与主栏相同的一侧**。不要把 crown 和栏分在相对的两侧 —— 那会造成来回跳动。

### 特例 —— wall-embed

当模板是 `wall-embed` 时，放在哪一侧**由可用表面的位置决定**，而不是由身体偏向或视线决定。Memory Wall 的吸音棉板在右边，所以即使主体略偏左，字幕也放在了右边。表面位置胜出，因为整个效果依赖于文字恰好坐落**在**那块特定的表面上。

### 决策小结

```
Side = f(baked graphics, body bias, gaze, surface)

priority:
1. Hard constraints (baked logos)    — never place here
2. Wall-embed surface location       — wins if using wall-embed
3. Bigger clean zone                 — default for corner-column
4. Gaze direction (looking room)     — tiebreaker when both sides similar
```

如果主体在片段中视线来回摆动（从左向右转头），就选一个对两个极端都行得通的一侧，而不只是最常出现的那一侧。或者接受视线空间会被短暂侵占 —— 这是一个 10 秒的视频，没人在意。

## Step 3：选择模板 + 位置

### 如果场景有平整的后墙（吸音棉、灰泥墙、布景幕布）

→ `wall-embed.html`

```
wall_position: {
  top:       max(40, head_y_min - 40),
  right:     20-60 (hug outer edge),
  width:     video_width * 0.35 – 0.50,
  height:    shoulder_top - top,
  rotateY:   -10 to -16 deg if wall angles away on the left,
             +10 to +16 deg if mirrored, 0 if wall is parallel,
  rotateX:   0-3 deg subtle downtilt only
}
```

这个模板里是 `mix-blend-mode: overlay` —— 在中间调的墙面上有效。如果墙面接近黑色（亮度 < 60），把 CSS 切换为 `screen`。

### 如果场景背景杂乱但偏暗（书架、植物、布景陈设）

→ `corner-column-crown.html`

```
wall_position: {
  top:       40,
  left:      40,               // anchor to clean corner opposite head
  width:     video_width * 0.40,
  height:    clamp(360, 520),  // don't reach below shoulder top
  rotateY:   3-6 deg (subtle, not flashy)
}
crown_position: {
  top:       video_height * 0.40   // center-ish; body will cut middle letters
}
```

这里用 `mix-blend-mode: screen` 是对的（书架是暗的）。

### 如果主体占据画面的 70% 以上

用哪个模板都无所谓 —— 没有任何干净的地方。**拒绝**，建议用经典的 lower-third。

## Step 3.5：crown 摆放（Crown placement）（使用 `corner-column-crown` 时）

**默认偏好：中央舞台式 crown。** 一个横穿主体的、巨大的居中 crown 词（想想 "WIMBLEDON CHAMPION"、"BEATLES"、"SHARP AGAIN"）是最有力的嵌入手法 —— 身体遮挡中间的字母，两侧的干净区域承托外侧的字母，这个词读起来就像一次标题亮相。**只要条件允许就用它。**

### 居中 crown 行得通的条件

采样 3 帧，目测主体在整个片段中的水平包络。设 `body_x_min / body_x_max` = 能在任意一帧中包住头 + 肩 + 手臂的最紧水平边界。

字号为 F 的居中 crown（其中 `crown_width ≈ F × 0.55 × char_count`）在满足以下条件时才有戏剧性：

1. **主体大致居中**：`|body_center_x − frame_width/2| < frame_width × 0.10`。身体位于中间三分之一。
2. **两侧的干净区域都不小**：`body_x_min > frame_width × 0.15` **并且** `body_x_max < frame_width × 0.85`。每一侧都有 ≥15% 画面宽度的干净空间。
3. **crown 词宽到足以从两侧探出来**：`crown_width > body_width + 400px`。如果这个词在到达身体右边缘之前就结束了，大部分字母都会被吞掉 —— 很难看。

三条全部满足，居中 crown 就是对的。做大 —— 字号定到让这个词横跨 `0.8 × frame_width` 或更宽。在 1920 宽的画面里，面对 Jobs 那样大小的身体（780px 宽），140px 的 "BEATLES"（约 500px 宽）不满足条件 3。同一画面里 140px 的 "WIMBLEDON CHAMPION"（约 1700px）则轻松通过。

### 居中行不通时 —— 把 crown 挪到干净区域

只要三个条件里有一个不满足，中央舞台就会被吃掉太多，这个词会变得无法辨认（"THE BEATLES" → "THE" 加一小条 "S"）。两种策略：

**方案 A —— 缩小 crown，让它干净地放进较大的那块干净区域。** 选与主体偏向相反的一侧。计算那一侧的 `clean_zone_width`。挑选 crown 字号，让这个词在区域内折成 1–2 行。尾部字母可以碰到主体边缘，带一点嵌入的意味，但词的主体部分要落在背景上。

```
// Jobs: subject center ≈ x=1100 (right of frame center 960). Left clean zone is larger.
crown_plane: { left: 200, width: 560, text-align: center }
font-size: 118px  →  "THE / BEATLES" wraps to 2 lines, fits in x=230-770
                      leaving "S" tail at x~760 lightly touching Jobs's shoulder
```

**方案 B —— 完全去掉 crown，把这个词提升为主栏里的 `emph`。** 当这个短语不值得中央舞台式的戏剧化处理时，这样更简单。对 "the Beatles" 或 "incredible things" 这样 2 个词的 emph 完全适用 —— 它们会变成左侧栏里的大号粗体文字，尾部被身体遮挡。

### 选择时的经验法则

| 主体占据画面中央 X% 以上 | 左 / 右干净区域          | Crown 处理方式                                  |
| ------------------------------------ | ------------------------ | ----------------------------------------------- |
| < 50%，大致居中              | 两侧都 ≥ 宽度的 15%      | 居中 crown，做**大**（frame_w × 0.8 以上）         |
| 50–70%，略有偏移              | 一侧 ≥ 25%           | crown 挪到较大的干净区域              |
| > 70%，占满画面大部分           | 没有一侧足够宽 | 去掉 crown，在栏里用 `emph`                |
| 近景脸部特写，占满 > 80%         | 基本没有         | 不用 crown。所有字幕放在顶部 / 底部条带里 |

## Step 4：遵守这些不变量

1. **绝不遮住眼睛。** 眼睛的包围框神圣不可侵犯。检查字幕包围框是否相交时，在它周围加 20px 边距。
2. **字幕包围框不得超出画面。** 所有边缘都保留 4% 的广播安全边距。
3. **大号强调词要有水平余量。** 在 `cap-emph`（92px）下，一个 8 字符的词 ≈ 580px。plane 需要 ≥ 620px 宽，**或者**依靠折成 2 行。
4. **Crown 位于 `top ≈ shoulder_top − crown_font_size/2`**，这样它横跨上半身，而不是脸。
5. **如果宽高比是竖屏（9:16），就旋转布局**：wall-plane 变成**顶部横带**（全宽，高度 ≈ 20%），如果要用 crown，就放在它下方。

## Step 5：渲染前验证

在调用 `render-and-composite.sh` 之前，做一遍合理性检查：

- 你是否把 plane 放在了与脸相对的象限？✓
- plane 是否在任何地方超出画面？如果是，缩小。
- 字号相对 plane 宽度是否太大？计算：words[] 中最长的词 × 0.55 × font_size < plane_width - padding\*2。
- 对于 `corner-column-crown`，你设的 `crown_position.top` 是否让 crown 真正横穿了身体（不在头顶上方，也不在躯干下方）？
- **Pillarbox / letterbox 硬性检查。** 如果原片有黑边（见 SKILL.md 里的预检探测），按文字对齐方式用正确的公式计算 `leftmost_text_x`：

  | 对齐方式                   | 公式                                            |
  | --------------------------- | -------------------------------------------------- |
  | 左对齐                | `plane_left + padding_left`                        |
  | 右对齐（主栏） | `plane_right − padding_right − longest_word_width` |
  | 居中对齐（crown）      | `plane_center − longest_word_width / 2`            |

  其中 `longest_word_width ≈ font_size × char_count × 0.55`（斜体把 0.55 下调到约 0.50，全大写粗体上调到约 0.62）。这些值**全部**必须 ≥ `pillarbox_left_edge + 10–20px`（安全边距）。右侧黑边同理镜像处理。

  **过去迭代中踩过的坑**：在 Jobs 60 Minutes 片段上（pillarbox 在 280）用右对齐栏设 `plane_left = 180`，看起来"在 plane 之内"，但 108px 字号的右对齐文字得出 `leftmost = plane_right − padding − 468 = 180 + 700 − 36 − 468 = 376` …… 等等，这**确实**越过了 pillarbox。真正的 bug 是另一回事：对于一个折成 3 行的短语（"four very / talented / guys"），最宽的一行是约 468px 的 "talented"，而不是整个短语。要按换行之后最长的**单行**来计算，而不是整个短语的宽度。

  **改动字号之后要重新检查** —— 字号从 84 加到 104 会让右对齐文字向左移约 30px。如果预算本来就很紧，这一加就会冲破 pillarbox。

  **经验目标**：最左边的文字在 pillarbox + 10–20px 处，看起来是"锚定"在黑边上的（视觉上有根基）。推得更深（50px 以上）会让字幕感觉漂浮在画面中间。

## 实例

### memory-wall（1280×720，吸音棉墙）

```json
{
  "template": "wall-embed",
  "wall_position": {
    "top": 40,
    "right": 30,
    "width": 720,
    "height": 520,
    "rotateY": -13,
    "rotateX": 1
  }
}
```

### champion（1920×1080，书架背景）

```json
{
  "template": "corner-column-crown",
  "wall_position": { "top": 40, "left": 40, "width": 720, "height": 420, "rotateY": 4 },
  "crown_position": { "top": 440 }
}
```
