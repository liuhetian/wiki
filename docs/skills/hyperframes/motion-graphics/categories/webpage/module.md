<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/motion-graphics/categories/webpage/module.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# webpage —— category 模块（搜索驱动）

**给一个网页 / 链接做动画**（"网站动画"这个用例）。搜索驱动：用户给出或点名一个 URL → 拉取 / 抓取它 → 给它做动画（滚动浏览、UI 显现、光标演示、区域标注）。它不同于给一个现有的 _视频文件_ 加字幕（那是 `/embedded-captions`），也不同于一支 _关于_ 某个网站的有旁白视频（那是 `/product-launch-video` 的网站导览需求）；这里的来源是一个 _网页_，输出是一段短小、无旁白的高亮镜头。

## 获取素材（Step 2）

通过 `hyperframes capture --json`（DOM + 截图）或用户提供的截图拉取页面 → 冻结成项目本地的图片 / DOM。`asset_needs`：`{ kind: web, source: <url>, treatment: none }`。

构建之前先检查抓取结果。如果存在 `BLOCKED.md`、JSON 报告 `ok: false`，或者命令以非零码退出，就停止 URL 抓取这条路径，并报告原因。只有当截图是用户明确提供的来源（或者用户在失败之后明确选择了它）时，才继续用这张截图。不要给一个被拦截的不完整抓取结果做动画，不要编造缺失的 DOM，也不要从防护 / 验证挑战页面上目测元素坐标。

这种网页需求不能使用通用的无素材兜底：它需要一张可用的抓取截图或 DOM，或者一张用户明确选用的、由用户提供的截图。都没有的话，就停止。

## 词汇 / 依托

- Rules：`hyperframes-animation/rules/{3d-page-scroll, demo-page-scroll-spotlight, cursor-click-ripple, coordinate-target-zoom, viewport-change}`。
- 基本元素：滚动平移 · 聚光 / 压暗 · 光标移动 + 点击涟漪 · 缩放到区域 · 标注图钉 + 标签。

## 构建（复用优先）

把抓取到的页面放作底层；做一段**滚动浏览**（在页面高度范围内 translateY），**聚光**关键区域（压暗 + 高亮），一个会移动并点击（涟漪）的**光标**，**缩放**到某个坐标，以及锚定在页面区域上的**标注**图钉 / 标签。遵守 `builder-contract.md`。

**两条与新闻文章高亮一致的规则（见 `../news/module.md`）：**

- **高亮是扫上去 / 动画加上去的，绝不预先应用** —— 聚光框擦入（`scaleX 0→1`），马克笔扫过一个区域，标注在缩放落定 _之后_ 弹出；页面绝不一开始就带着标注。
- **锚定到真实的元素位置** —— `hyperframes capture` 会给出页面的 HTML/DOM，所以要测量目标元素（`getBoundingClientRect` → 舞台局部坐标），然后精确地、一步一步地缩放 / 高亮它（「高亮一个真实元素」技法）。不要目测坐标。
