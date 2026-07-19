# 滚动叙事开场 — tap4fun 公司简介

做一个**滚动驱动**的单页 PPT 开场。用户向下滚动，背景在 3 个静帧场景之间用 2 段过渡视频无缝衔接，前景文案随场景切换。**不循环**，滚到底停在最后一帧。

---

## 一、资产清单

当前目录文件（路径用相对路径，**已去除空格**）：

```
./scene1.png        场景1静帧（开场）
./scene2.png        场景2静帧（中段）
./scene3.png        场景3静帧（终场）
./trans1to2.mp4     场景1→2 过渡视频
./trans2to3.mp4     场景2→3 过渡视频
./reference.png     排版参考图（仅用于学习版式，不出现在页面里）
```

**重要**：没有一条贯穿始终的 main 视频。叙事是 "静帧 → 过渡视频 → 静帧 → 过渡视频 → 静帧" 的 5 段混合结构。

---

## 二、叙事结构与滚动映射

页面总高度 = `500vh`。把全局 scroll 进度 `p ∈ [0, 1]` 划成 5 个区间：

| 区间 | p 范围 | 背景层 | 文案 |
|---|---|---|---|
| ① | 0.00 – 0.20 | `scene1.png` 静帧 | 场景1文案常显 |
| ② | 0.20 – 0.40 | `trans1to2.mp4` 播放 | 文案 fade 1→2 |
| ③ | 0.40 – 0.60 | `scene2.png` 静帧 | 场景2文案常显 |
| ④ | 0.60 – 0.80 | `trans2to3.mp4` 播放 | 文案 fade 2→3 |
| ⑤ | 0.80 – 1.00 | `scene3.png` 静帧 | 场景3文案 + CTA |

视频驱动规则：
- 在区间 ② 内：`trans1to2.currentTime = ((p - 0.20) / 0.20) × trans1to2.duration`
- 在区间 ④ 内：`trans2to3.currentTime = ((p - 0.60) / 0.20) × trans2to3.duration`
- 静帧区间：对应图片 `opacity:1`，所有视频 `opacity:0`
- 过渡区间：对应视频 `opacity:1`，所有图片 `opacity:0`
- 层切换用 `0.3s ease` opacity 过渡，避免硬切

**不循环**。滚动到底停在场景3，CTA 可点击。

---

## 三、文案内容（tap4fun 公司简介）

所有文案沿用 reference.png 的版式骨架：**顶部导航 + 左上大标题/副标/CTA + 右上两组统计 + 底部品牌行 + 社交图标**。

顶部导航（三个场景共享，固定）：
- 左：`tap4fun` logo
- 中：About / Games / Studio / Careers / Contact
- 右：`Press Kit`（次按钮）/ `Join Us`（主按钮）

### 场景 1 — Brand Vision
- 主标题：`BUILDING WORLDS THAT ENDURE`
- 副标：Global mobile strategy, crafted in Chengdu since 2008.
- 描述（CTA 下方小字）：A studio of builders, designers, and engineers shaping interactive worlds that millions return to.
- CTA pill：`Discover tap4fun →`
- 右上统计 ×2：
  - `200M+ PLAYERS WORLDWIDE` — From day-one launches to franchises that still grow today.
  - `15+ YEARS IN THE INDUSTRY` — Pioneers of cross-cultural SLG, scaling across regions.

### 场景 2 — Portfolio
- 主标题：`GAMES THAT DEFINE A GENRE`
- 副标：Strategy titles that turn empires into stories.
- 描述：From real-time war to long-tail kingdoms — operated live, every hour, every region.
- CTA pill：`Explore our games →`
- 右上统计 ×2：
  - `10+ FLAGSHIP TITLES` — Invasion: Modern Empire · Last Empire–War Z · Age of Z Origins.
  - `150+ COUNTRIES SERVED` — 20+ languages, 24/7 live operations.

### 场景 3 — Team & Future
- 主标题：`THE NEXT WORLD STARTS HERE`
- 副标：Builders, designers, engineers — one studio, one mission.
- 描述：We are hiring across engineering, art, game design, and live operations.
- CTA pill：`Join the studio →`
- 右上统计 ×2：
  - `800+ TEAM MEMBERS` — Engineering, art, ops, and live-game craft, under one roof.
  - `∞ POSSIBILITIES` — AI, cross-platform, new frontiers in interactive entertainment.
- 底部品牌行（只在场景3显示）：`Invasion  ·  Last Empire  ·  Age of Z  ·  Kings Throne  ·  Hero Clash`
- 社交图标：Facebook · X · LinkedIn · Bilibili

---

## 四、排版语言（学习 reference.png）

观察 reference.png 后还原以下要点：

- **字体**
  - 主标题：粗体无衬线 condensed/grotesk，全大写，字重对比极强 → 用 Google Fonts `Archivo Black` 或 `Anton`
  - 正文/副标：现代无衬线 → `Inter` 400/500
  - 统计数字：与主标同字体保持一致性
- **字号层级**：主标 `clamp(2.8rem, 6vw, 5.5rem)` / 统计数字 `clamp(1.8rem, 3vw, 2.6rem)` / 副标 `1rem` / 描述 `0.85rem`
- **对齐**：非对称三栏——左上 / 右上 / 底部一行；导航横贯顶部
- **颜色**：背景由场景图决定，文字默认黑色 `#0a0a0a`；CTA pill 黑底白字带白色圆形 → 箭头 icon；强调色橙 `#FF6A1A`（用在 hover / 强调小元素）
- **装饰**：CTA 是 pill button 带末尾圆形 → 图标；统计数字下有 1 行细描述；底部品牌名用 `·` 分隔
- **气质**：极简、留白大、字重对比强、设计克制
- **关键原则**：**三个场景共用同一套版式骨架**，只换文字内容。滚动时让用户感到"画面在变、版式在呼吸"，而不是切到一个完全不同的页面。

---

## 五、技术实现

技术栈：**纯 HTML + CSS + JavaScript 单文件**，不用任何框架。直接通过 Google Fonts CDN 引字体。

### 背景层结构
```html
<div class="bg-layer">
  <img id="s1" src="./scene1.png">
  <video id="v12" src="./trans1to2.mp4" muted playsinline preload="auto"></video>
  <img id="s2" src="./scene2.png">
  <video id="v23" src="./trans2to3.mp4" muted playsinline preload="auto"></video>
  <img id="s3" src="./scene3.png">
</div>
```
所有 5 个元素：`position: fixed; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s ease;`

### 视频要点（避坑）
- `muted` + `playsinline` + `preload="auto"` 必须有
- **不要** `autoplay`，**不要** `controls`，**不要** `loop`
- iOS Safari 必须 `playsinline`（小写）
- 视频用 `currentTime` 驱动，不调用 `play()`

### 滚动驱动
```js
let targetT12 = 0, targetT23 = 0;
function onScroll() {
  const p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  // 计算各层 opacity 与视频 currentTime
  // 用变量缓存目标值，rAF 里再赋给 video.currentTime
}
function tick() {
  v12.currentTime += (targetT12 - v12.currentTime) * 0.25; // 缓动 seek
  v23.currentTime += (targetT23 - v23.currentTime) * 0.25;
  requestAnimationFrame(tick);
}
window.addEventListener('scroll', onScroll, { passive: true });
requestAnimationFrame(tick);
```
关键：scroll 事件只更新目标值，真正的 `currentTime` 赋值放在 rAF 里做缓动，避免连续 seek 卡顿。

### 文案层
- 三段文案各自 `position: fixed`，按 reference.png 三栏骨架布局
- opacity 由所在区间决定，`transition: opacity 0.4s ease`
- 同时只有一段处于 `opacity:1`

### 响应式
- 断点 `≤768px`：左右两栏堆叠为单列；导航折叠为汉堡（或简化为只显示 logo + Join Us）；主标题用 `clamp()` 自适应
- 底部品牌行在移动端换行展示，分隔点保留

### 其他
- 页面初始 `body { overflow-x: hidden }`，纵向 scroll height 由一个 `<div style="height:500vh"></div>` spacer 撑开
- 字体预加载，避免 FOUT
- 不需要做加载进度条，但首屏前确保 `scene1.png` 已 decode（用 `<link rel="preload">` 或 `img.decode()`）

---

## 六、输出

**直接输出完整 `index.html` 单文件**（含内联 CSS 与 JS，引用 Google Fonts CDN）。资产用相对路径引用，文件命名见【一】。不要输出说明文字，只要 HTML。
