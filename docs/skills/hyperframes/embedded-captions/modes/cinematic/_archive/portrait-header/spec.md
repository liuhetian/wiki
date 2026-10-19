<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/embedded-captions/modes/cinematic/_archive/portrait-header/spec.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 模板：portrait-header

**外观：** 9:16 竖屏口播，字幕放在画面顶部、主体头顶上方的一条水平横条里。镜头拍到主体腰部或更低时，可以在底部加一个可选的 crown。

**视觉风格（LOCKED）：**

- 5 个排版槽位：intro / phrase / emph / dream / crown（居中）
- `mix-blend-mode: screen`，叠在暖骨白色（#fff5df）上
- 单字幕替换（字幕在标题横条里的同一位置叠放）
- 逐词淡入，带轻微的 Y 向漂移（soft）或弹出 + 缩放（present）

## 何时使用

✅ **适合：**

- 9:16 竖屏视频（典型为 1080×1920）
- 单个主体占满画面中部
- 头顶上方能看到一条干净的横带
- 讲话比较密（很多短句）—— crown 只留给那一个真正的高潮

❌ **不适合：**

- 主体的头被裁到画面最顶端（根本没有标题横带）
- 16:9 横屏 → 改用 `champion` 或 `memory-wall`
- 多人说话 / 切镜

## 布局决定

| 字段 | 含义 | 示例（1080×1920） |
| --- | --- | --- |
| `header.top` | 标题横条的 Y 位置。应位于主体头顶上方，留约 30px 的呼吸空间。 | 头发顶部在 y=200 左右时用 `30` |
| `header.height` | 横条高度。字幕较长 / 要折成 2 行时调大。 | `280` |
| `crown_top` | crown 那一行的 Y 位置（画面底部）。看不到腰部就跳过。 | 接近全身的镜头用 `1620` |
| `crown_enabled` | 是否渲染底部 crown。主体身体完全占满下半部分时跳过（反正 matte 也会把 crown 挡住）。 | 紧凑的头肩镜头用 `false` |
| `font_scale` | 锁定字号的缩放倍率。 | 1080×1920 用 `1.0` |

## 槽位分配

和 champion 一样的弧线：intro / phrase / emph / dream / crown。

portrait-header 特有的一点是标题横带很窄（只有一条），所以：

- 大多数 group 放得进 1-2 行
- crown 会被身体 matte 挡住时就不要用（Pausch 那类竖屏人像往往需要完全跳过 crown，改为把高潮提升为标题横带里的 `emph`）

## Plan.json 结构

```json
{
  "mode": "template",
  "template": "portrait-header",
  "duration": 25.3, "fps": 24, "width": 1080, "height": 1920,
  "header": { "top": 30, "height": 280 },
  "crown_top": 1620,
  "font_scale": 1.0,
  "groups": [
    { "id": "cg-0", "slot": "intro", "tone": "soft",
      "in": 0.10, "out": 3.20, "words": [...] },
    { "id": "cg-1", "slot": "phrase", "tone": "soft",
      "in": 3.55, "out": 5.80, "words": [...] },
    { "id": "cg-2", "slot": "emph", "tone": "present",
      "in": 17.85, "out": 22.10,
      "words": [
        {"text": "Time", "start": 17.94, "end": 18.26},
        {"text": "is",   "start": 18.38, "end": 18.54},
        {"text": "all",  "start": 18.66, "end": 18.80},
        {"text": "we",   "start": 18.92, "end": 19.02},
        {"text": "have", "start": 19.12, "end": 19.38}
      ]}
  ],
  "crown_group": null
}
```

如果你已经确认 crown 会被主体身体或镜头构图挡住，就设 `crown_group: null`。
