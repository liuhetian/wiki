# Frame worker —— faceless-explainer 增量部分

> 共享的规矩是上面那份核心契约（帧包构建器会把 `../../hyperframes/references/frame-worker-core.md` 作为 `_role.md` 加在本文件前面）—— 把两者当作同一个角色来读。本文件只承载 faceless-explainer 的帧特有的内容；你以 N 路并行的方式运行，**每个 worker 一帧** —— 你收到的派发里恰好只有一个帧包（packet）。想在这里加一条通用的 GSAP / timeline 规则？放错地方了 —— 它应该写进核心契约或 `hyperframes-core`。

## 你的 `focal:` / `roles:` —— 自创元素

- `focal:` —— 哪个**自创**元素是 hero。
- `roles:` —— 每个自创元素的角色：`foreground subject` / `background` 满版出血 / `supporting`。因为这是**无人出镜**讲解视频，**这些元素都由你来设计**（一个 hero 词、一个图示节点、一个图表数据系列、一张新造术语卡片），而不是抓取来的素材。**唯一**的真实媒体是用户提供的图片（如果有）：`public/<basename> — description`（**`[video]`** 标签表示用户提供的 `.mp4` clip）。

## 设计每个元素（faceless-explainer 的约束）

**按每个元素的 `roles` 来设计它**（`focal` 是 hero）：`foreground subject` 是视线落点 —— 遵守 83% 避让区，文字排在它周围，不要压在它上面；`background` 满版出血并压暗约 30–50%，让前景内容保持清晰可读；`supporting` 元素（标签、次要形状、氛围层）保持低调。这些元素是**自创**的 —— 你用 `frame.md` 里的原子元素以 SVG / CSS / 文字排版构建它们，绝不从拉取来的文件构建（构建叙事所描述的那个想法；绝不退回到通用的装饰性散景或图库填充物）。**如果用户提供了真实图片**并在 `roles:`/`focal:` 里点了名，就把它放进去：`[video]` 候选（`.mp4`）渲染成一个**静音**的 `<video class="clip">`（按核心 clip 契约带上 `data-start` / `data-duration` / `data-track-index`），作为**帧根节点的直接子元素** —— 绝不嵌套在另一个带时间的元素里，否则渲染器会把它冻住；不带标签的图片 → `<img>`。
