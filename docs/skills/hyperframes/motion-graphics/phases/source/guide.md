# source 阶段 —— 获取素材（素材优先）

**只有当 `shot-plan.json.asset_needs` 非空时**才运行（形式类 category 永远不会走到这里）。把每一个需要的素材获取下来 → 一个**冻结的项目本地路径** + 一份台账（`assets/index.md`）。使用 `/media-use`（抓取 / 素材准备），并且**当安装了外部素材搜索 skill（例如 media-use）时**，使用它的 `resolve` 步骤。如果没有这样的搜索能力，就**降级为无素材**（见下文）。

## 针对每一个 asset_need

- `image / icon / logo / svg` → media-use `resolve`：**搜索**（asset_scout：Google Images / SerpAPI + Noun Project）、**生成**（图片模型），或者**用户提供**（logo）。可选的 `treatment`：抠像（remove-bg）/ 重新着色 / 矢量化。
- `news / web / tweet` → **RWA 风格的搜索**（media-use 文档里写明的渊源 —— `media-use/references/search-strategy.md` 把 `resolve` 追溯到 RWA 子 agent）。两极查询：**原子**查询（1–3 个词，可组合）或**具体**查询（5–15 个词：一条新闻事件 / 推文）；绝不用中间状态。具体查询失败了就丢掉，不要放宽。

## 步骤

1. 从 `shot-plan.json` 读取 `asset_needs`。
2. 对每一项：**分析 → 搜索 → 审阅（use/maybe/reject —— 挑选才是难点；不要直接拿第一个 / 生成的结果）→ 冻结**留下的素材到 `assets/` 里（把远程 URL 重新托管到本地）。
3. 写 `assets/index.md` —— 给 agent 读的台账：`role → frozen path + provenance`。
4. 对 `asset-fusion`：还要抓取素材可测量的几何信息（这样 Director Part 2 才能设置 `element_positions`）+ 一份取色器色板。

## 优雅降级

如果某个 provider / 搜索不可用，在 `context.log` 里把这项需求标记为未满足；只要可能，该 category 就回退为无素材（例如 `news` → 不带获取图片的纯排版标题）。

> 示意：`(cd "$PROJECT_DIR" && node <SKILL_DIR>/phases/source/resolve.mjs --plan ./shot-plan.json --out ./assets)` —— 或者直接驱动 media-use 的 `resolve` 流程。
