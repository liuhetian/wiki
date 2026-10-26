# news —— category 模块（搜索驱动）

搜索一篇真实的新闻文章 → 把它做成**文章高亮（article-highlight）**动画 —— 这是对居中强调技法的忠实 HF 移植。标志性运动：文章文字以**可读的尺寸（不放大）**排版，向上滑动 + 淡入，然后**就地高亮关键词** —— 一条马克笔色带在它后面从左向右生长。不做放大特写。约 5–7 秒。

两种布局共用同一个高亮内核 —— 按画幅比例 + 是否有 logo / 人物要展示来挑：

| 布局                      | 画幅       | 何时使用                                                        | 包含                                                                       |
| ------------------------- | ---------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **A · 居中强调**          | 9:16 / 1:1 | 纯文字、社交竖屏                                                | 眉题（kicker）+ 一句居中的句子 + 关键词高亮                                |
| **B · 完整文章**          | 16:9       | 有真实的**媒体 logo**，和 / 或报道里有一个**人物**              | logo + 日期 + 多行标题高亮 + 导语（dek）+ 媒体名 + 人物抠像                |

## 获取素材（Step 2）

RWA / 网页搜索（或 `hyperframes capture`）→ 一篇真实文章。Director 提取出**关键词**（1–2 个词 / 一个数字 / 一个名字 —— 也就是钩子），对布局 B 还要提取一个**品牌 logo**、一个**日期**和一张**人物照片**。`asset_needs: { kind: news|web|image, query }` —— 把 logo（`media-use resolve --type logo`，theSVG 优先）和人物照片（Wikimedia）作为两个独立的素材查询来请求。把人物照片过一遍 `hyperframes remove-background <in> -o <out>.png`，得到透明抠像。

## 高亮内核（两种布局共用）—— 马克笔色带技法

关键词高亮是一条通过 `background-size` 从左向右生长的马克笔色带（**不是** `transform:scaleX` 的条）：

```css
.hl {
  --hlw: 0%;
  background-image: linear-gradient(var(--hl), var(--hl)); /* --hl: rgba(250,222,99,.6) */
  background-repeat: no-repeat;
  background-position: 0 72%;
  background-size: var(--hlw) 64%;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
```

`box-decoration-break:clone` 让色带**跨行无缝折行** —— 一个跨 2–3 行的多词关键词也能连续地被高亮（旧的 `scaleX` 条做不到）。GSAP 把 CSS 变量 `--hlw` 从 0% tween 到 100%，**在文字落定之后才扫上去 —— 绝不预先应用**。可以按关键词长度把时长调到约 0.5–1.5 秒。

## 布局 A —— 居中强调（9:16，纯文字）—— Builder

1. **以可读的尺寸排出关键句 —— 不要放大。** 纸张般的浅色舞台；顶部放一个媒体 `#kicker`（例如 "BBC NEWS · TECHNOLOGY"，用品牌强调色）；关键句居中，衬线体，**约 70–76px / 700 / 行高约 1.4**，`max-width ≈ 900`。整句话都保持可读；关键词是在句子 _内部_ 被强调。
2. 把关键词内联包起来：`… raised <span class="hl" id="kw">$750M</span> at …`。
3. **Timeline**（seek 安全、paused）：眉题淡入 + 滑入 → **句子向上滑动 + 淡入**（`set{autoAlpha:0,y:52}`→`to{autoAlpha:1,y:0,duration:0.8,ease:"power3.out"}`，不放大）→ **关键词高亮生长**（`--hlw 0→100%`，在句子落定之后）→ 轻柔定格（`scale 1.012`）。

**参考：** `samples/news/_ref-centered-emphasis.html`（+ `news/v2-*`）。

## 布局 B —— 完整文章（16:9，logo + 人物）—— Builder

编辑风格的文章卡片布局（左上角 logo + 日期 + 带多行关键词高亮的大号衬线标题 + 导语 + 左下角媒体名 + 右下角一个去除了背景的**人物抠像**）。1920×1080，纸张般的浅色渐变舞台，Georgia 衬线体。

1. **Logo** 放在左上角（`#logo`，约 64px）—— 内联媒体 / 品牌的 SVG，`fill:currentColor`，把 `color` 设成这个标志自己的色相（单色标志则用接近黑色）。**日期**放在它下面（`#date`，约 30px，弱化）。
2. **标题**（`#headline`，Georgia **96px / 700**，`width≈1080`，`line-height 1.16`），关键词用 `<span class="hl" id="kw">` 包起来 —— 高亮色带会扫过该短语折行后的**所有行**。
3. **导语**（`#dek`，Helvetica 约 38px 灰色）放在标题下方；**媒体名**（`#outlet`，Georgia 粗体约 50px）放在左下角。
4. **人物抠像**（`#subject`，去除背景的 PNG，`height≈860`，`right:40; bottom:0`，`drop-shadow`）—— 作为 hero 段落节拍，**从右下角向上滑入**。
5. **Timeline**（seek 安全、paused）：logo `back.out` @0.15 → 日期 @0.4 → **人物向上滑入**（`set{autoAlpha:0,x:90,y:60}`→`to{autoAlpha:1,x:0,y:0,duration:0.85,ease:"power3.out"}`）@0.45 → 标题 @0.7 → 导语 @1.5 → 媒体名 @1.9 → **关键词高亮**（`--hlw 0→100%`，`duration:0.8`）@2.2。时长约 6.5 秒。

**参考：** `samples/news/_ref-article-layout.html`（一篇真实文章，用真实的媒体 logo + 一个去除背景的人物 + 一则真实报道渲染而成）。

## 关键点

高亮是**就地生长的，在文字出现之后才扫上去 —— 绝不预先应用**。文字**保持可读 —— 不要把关键词放大到填满画面**（团队反馈 2026-06-09：放大会丢失上下文，读起来不对；这个技法从不放大 —— 它呈现文字，然后高亮那个词）。对布局 B，人物**必须**是 `remove-background` 抠出来的（不要矩形的照片框）。确定性的；遵守 `references/builder-contract.md`。
