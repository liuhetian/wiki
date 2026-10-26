# 模板：memory-wall

**外观：** 内省式独白，斜体的诗句在后墙上层层叠起，高潮用右对齐的瀑布式排列。Sam Harris / Pico Iyer 那一路。

**视觉风格（LOCKED —— 不要改）：**

- 4 槽位的排版弧线：italic 600 → italic 500 悬挂缩进 → 正体 700 转折 → 大写 900 高潮
- `mix-blend-mode: screen`，叠在暖骨白色（#fff4dc）上
- 柔和的 text-shadow + 提亮
- 逐词淡入，带轻微的 Y 向漂移（soft 语气）或弹出 + 缩放（present 语气）

## 何时使用

✅ **适合：**

- 口播，某一侧有平整的后墙（吸音棉、素面石膏墙、柔和的书架）
- 单个主体，机位固定或接近固定
- 旁白式的感觉：内省、叙事、「I was thinking…」
- 中间调或暗色背景（亮度 < 180）

❌ **不适合：**

- 明亮的窗户 / 天空背景 → screen 混合会过曝
- 背景杂乱、带文字 / 图形 → 和字幕文字冲突
- 高能 / vlog / TikTok 风格 → 气质不对
- 多人说话 / 硬切 → 字幕弧线会断

## agent 针对每个场景要决定的内容

| 字段 | 含义 | 示例 |
| --- | --- | --- |
| `plane.top/right/width/height` | 墙面 plane 在画面里的位置。plane 应该紧贴墙的那一侧，而不是漂浮在主体上方。 | 1280×720 用 `{top: 90, right: 30, width: 720, height: 520}` |
| `plane.rotateY` | 匹配墙面的透视角度。右侧墙用负值（文字向左退远），左侧墙用正值。 | 略带角度的右侧墙用 `-13` |
| `plane.rotateX` | 墙面上下倾斜时给一点竖向倾角。通常 0-2 度。 | `1` |
| `font_scale` | 锁定的 cap-N 基础字号的倍率。按画面高度调。 | 1280×720 用 `1.0`，1920×1080 用 `~1.5`，720p 竖屏用 `~0.7` |
| `groups[].slot` | 这个 group 用 4 个排版槽位中的哪一个（1/2/3/4）。驱动整条弧线。 | 见下文 |
| `groups[].tone` | "soft" 或 "present" —— 决定动效曲线 | 开头几句用 `"soft"`，转折 + 高潮用 `"present"` |

## 槽位分配规则

整个视频目标是走完一条弧线：`1 → 2 → 3 → 4`。能避免就不要重复槽位；没有理由不要跳过槽位。

| 槽位 | 用于 |
| --- | --- |
| 1 | 开场。「I was thinking」那一句。斜体，柔和入场。 |
| 2 | 带梦幻感的延续 / 修饰语。更小的斜体、悬挂缩进 —— 感觉像一句话的后半段，带一些错落的漂移。 |
| 3 | 转折。正体（不用斜体），句法上的转弯。（"but suddenly"、"and then…"） |
| 4 | 高潮。大号大写 900。点题句。目标 ≤4 个短词，这样右对齐的瀑布排列自然折成 2-3 行。 |

如果脚本超过 4 个 group，额外的柔和句子重复用槽位 1 或 2，但槽位 4 只留给唯一的高潮。

## Plan.json 结构

```json
{
  "mode": "template",
  "template": "memory-wall",
  "duration": 8.04,
  "fps": 24,
  "width": 1280,
  "height": 720,
  "plane": {
    "top": 90,
    "right": 30,
    "width": 720,
    "height": 520,
    "rotateY": -13,
    "rotateX": 1
  },
  "font_scale": 1.0,
  "groups": [
    {
      "id": "cg-0",
      "slot": 1,
      "tone": "soft",
      "in": 0.2,
      "out": 4.85,
      "words": [
        { "text": "Some", "start": 0.24, "end": 0.44 },
        { "text": "memories", "start": 0.48, "end": 0.82 },
        { "text": "feel", "start": 0.92, "end": 1.14 },
        { "text": "soft", "start": 1.2, "end": 1.64 }
      ]
    },
    {
      "id": "cg-1",
      "slot": 2,
      "tone": "soft",
      "in": 2.55,
      "out": 4.85,
      "words": [
        { "text": "like", "start": 2.66, "end": 2.78 },
        { "text": "old", "start": 2.86, "end": 3.02 },
        { "text": "film", "start": 3.16, "end": 3.46 }
      ]
    },
    {
      "id": "cg-2",
      "slot": 3,
      "tone": "present",
      "in": 4.9,
      "out": 8.04,
      "words": [
        { "text": "but", "start": 5.04, "end": 5.18 },
        { "text": "suddenly", "start": 5.24, "end": 5.76 }
      ]
    },
    {
      "id": "cg-3",
      "slot": 4,
      "tone": "present",
      "in": 6.7,
      "out": 8.04,
      "words": [
        { "text": "everything", "start": 6.82, "end": 7.14 },
        { "text": "is", "start": 7.18, "end": 7.28 },
        { "text": "sharp", "start": 7.32, "end": 7.52 },
        { "text": "again", "start": 7.58, "end": 7.92 }
      ]
    }
  ]
}
```

## 不要和模板对着干

如果用户想要不同的排版、不同的混合模式或不同的动效：**改用 Standard 模式**（`../../../standard/`）。不要试图覆盖锁定的 CSS —— 模板的视觉一致性正是它的全部意义。
