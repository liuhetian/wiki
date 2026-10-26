# shot-plan IR

Director 与 Builder 之间唯一的契约。一个文件：`PROJECT_DIR/shot-plan.json`。

```jsonc
{
  // ── envelope (every category) ──
  "category": "kinetic-type | stat | charts | logo-reveal | lower-thirds | webpage | news | tweet | asset-fusion",
  "duration_s": 6,
  "fps": 30,
  "canvas": { "w": 1080, "h": 1920, "aspect": "9:16" },
  "style": "free-form visual direction (mood / energy / reference)",
  "palette": ["#…"], // or "derive-from-asset"
  "font": "<HF embed-list font>",
  "beats": [12, 37], // optional accent frames/seconds
  "export": "mp4", // or "alpha-overlay" (transparent webm/mov)

  // ── sourcing seam (Director Part 1) — [] means skip the source phase ──
  "asset_needs": [
    {
      "role": "hero",
      "kind": "image|icon|logo|svg|news|web|tweet",
      "query": "…",
      "source": "…",
      "treatment": "cutout|recolor|vectorize|none",
    },
  ],

  // ── build directive (Director Part 2, reuse-first) ──
  "block": "<catalog block id, e.g. data-chart | caption-kinetic-slam>", // optional
  "customize": {
    /* what to change on the block: data, text, palette, positions */
  },

  // ── category-specific content ──
  "content": {
    /* shape varies by category, below */
  },
}
```

**各 category 的 `content` 结构：**

- `kinetic-type` → `scenes[]` `{ id, start, end, text, emphasis_words[], emotion, motion, beats[] }`
- `stat` → `{ value, prefix, suffix, label, ring: bool }`
- `charts` → `{ type: bar|line|pie|race|pct, data[], labels[], headline, axes: bool }`
- `logo-reveal` → `{ logo: <asset path>, tagline, url }`
- `lower-thirds` → `{ name, role, position, brand_colors[] }`
- `webpage` → `{ url, capture, highlights: [ { selector|region, label } ] }`（对一个真实抓取的页面做逐步高亮）
- `news` → `{ outlet, headline, body, keyword, layout: A|B, logo?, date?, subject? }`（文章高亮：把文字排成可读的样子 —— **不放大** —— 然后在关键词上就地扫过一条马克笔色带。布局 **A** = 居中强调，9:16，纯文字；**B** = 完整文章，16:9，带 `logo` + `date` + `subject`（一张人物照片 → `remove-background` 抠像））
- `tweet` → `{ author, handle, avatar, text, metrics }`
- `asset-fusion` → `{ data_type, asset: <path>, affordance, element_positions: {center, extent, safe[], avoid[]}, derived_palette[], connectors[] }`

**不变量：** `scenes`（如果有）把 `[0, duration_s]` 划分成无间隙、无重叠的若干段 · `asset_needs` 为空 ⇒ 跳过 Step 2（source）· 点名了 `block` ⇒ Builder 复用并定制它，而不是手写。
