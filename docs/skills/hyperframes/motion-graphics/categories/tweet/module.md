<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/motion-graphics/categories/tweet/module.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# tweet —— category 模块（搜索驱动）

**搜索一条推文 → 给推文卡片做动画。** 以一条真实帖子为依据（RWA）。约 4–8 秒。

## 获取素材（Step 2）

RWA `search_tweets`（具体查询，或者给定的推文 URL / id）→ 推文：作者、账号名、头像、正文、时间戳、指标数据（点赞 / 转发）。`asset_needs`：`{ kind: tweet, query|source, treatment: none }`。冻结头像 + 任何内嵌媒体。

## 词汇 / 依托

- Block：registry 里的 **`x-post`**（带互动指标的 X/Twitter 帖子卡片动画 overlay）—— 直接复用它。
- 基本元素：卡片滑入 / 缩放入场 · 文字打字效果 / 逐行显现 · 头像弹出 · 指标数据 **count-up** · 可选地强调某个关键词。

## 构建（复用优先）

`npx hyperframes add x-post` → 用解析到的推文填入作者 / 账号名 / 头像 / 正文 / 指标数据；让卡片入场，文字打字出现（或逐行显现），指标数据 count-up。头像 / 媒体用冻结的项目本地文件（绝不用远程 URL）。如果它要叠在其他素材画面上，用 `export: alpha-overlay`。
