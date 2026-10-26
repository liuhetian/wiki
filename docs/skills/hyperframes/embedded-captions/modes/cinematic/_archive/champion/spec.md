# 模板：champion

**外观：** 播客 / 访谈，偏上的侧栏，intro→phrase→emph 一拍拍递进，最终落到一个横穿主体身体、位于画面正中的 CROWN（冠冕）。「Wimbledon Champion」那种能量。

**视觉风格（LOCKED）：**

- 5 个排版槽位：intro / phrase / emph / dream / crown
- `mix-blend-mode: screen`，叠在暖骨白色（#fff5df）上
- 深的 text-shadow + 提亮
- 单字幕替换式布局（字幕在栏内同一位置叠放）
- 画面正中的 crown 横穿主体，形成电影感遮挡

## 何时使用

✅ **适合：**

- 播客 / 访谈风格，单个坐着的主体
- 背景杂乱（书架、道具、暗色）—— screen 混合能透出来
- 主体大致居中，一侧或两侧有清晰的干净区
- 讲话里有一句清晰的点题句，可以做成「crown」（1-3 个短词）
- 16:9 横屏，1920×1080 最理想

❌ **不适合：**

- 明亮 / 天空 / 窗户背景（screen 混合会被冲淡）
- 主体严重偏离中心，以致没有干净的栏区
- 讲话里没有清晰的高潮句
- 竖屏 9:16 → 改用 `portrait-header` 模板

## agent 要做的布局决定

| 字段 | 含义 | 示例（1920×1080） |
| --- | --- | --- |
| `plane.top/left/width/height` | 侧栏放在哪里。选主体视线相反的一侧（留出视线空间），紧贴最干净的背景区。 | `{top: 40, left: 40, width: 720, height: 420}` |
| `plane.rotateY` | 向墙面里稍微透视。左栏用正值（向右退远），右栏用负值。保持小角度（3-7°）。 | `4` |
| `crown_top` | crown 的 Y 位置。应落在主体的胸口 / 脖子处，让身体遮住中间的字母。 | `420` |
| `font_scale` | 锁定字号的倍率。 | 1920×1080 用 `1.0` |
| `crown_enabled` | 是否渲染 crown。讲话没有干净的点题句，或主体太偏、放在中央的 crown 落不住时，就跳过。 | `true` |

### Crown 摆放规则

启用 crown 之前，确认以下 3 个条件全部满足：

1. 主体身体中心在画面水平中心 ±10% 以内
2. 主体两侧的干净区域都 ≥ 画面宽度的 15%
3. Crown 文字宽度（大写 140px × ~字符数）> 主体身体宽度 + 400px

只要有一条不满足：关掉 crown，或者换更小的字号、把它放进较大的那块干净区域而不是正中。见 `references/layout-heuristics.md`。

## 槽位分配

| 槽位 | 用于 |
| --- | --- |
| intro | 填充词 / 话语标记（"you know,"、"for me,"、"so…"） |
| phrase | 主要陈述分句 |
| emph | 关键成就 / 最高级的那一句 |
| dream | 带憧憬的句子、过去时的回顾 |
| crown | 唯一的高潮句 —— 画面正中的点题 |

每个视频目标 ≤3 个槽位（不含 crown）。12 秒的片子里不要 4 个全用上。

## Plan.json 结构

```json
{
  "mode": "template",
  "template": "champion",
  "duration": 12.08, "fps": 24, "width": 1920, "height": 1080,
  "plane": {
    "top": 40, "left": 40, "width": 720, "height": 420,
    "rotateY": 4
  },
  "crown_top": 420,
  "font_scale": 1.0,
  "groups": [
    { "id": "cg-0", "slot": "intro", "tone": "soft",
      "in": 0.10, "out": 1.45, "words": [...] },
    { "id": "cg-1", "slot": "phrase", "tone": "soft",
      "in": 1.55, "out": 4.20, "words": [...] },
    { "id": "cg-2", "slot": "emph", "tone": "present",
      "in": 6.50, "out": 8.30, "words": [...] }
  ],
  "crown_group": {
    "id": "cg-crown", "tone": "present",
    "in": 10.85, "out": 12.08,
    "words": [
      {"text": "Wimbledon", "start": 10.94, "end": 11.28},
      {"text": "Champion",  "start": 11.38, "end": 11.84}
    ]
  }
}
```

`crown_group` 总是使用 crown 槽位 —— 不需要指定 `slot`。设为 `crown_group: null` 即关闭。
