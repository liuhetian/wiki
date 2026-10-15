<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/references/memory.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 用户记忆 —— 偏好与配方

## 偏好 —— 记住的默认值

用户记忆中较轻量的一层：已确认的 brief 回答（投放渠道 destination、画幅 aspect、语言 language、流程 flow、分镜 storyboard、声音 voice、风格 preset），按与素材相同的两层划分持久化 —— 项目级 `.media/preferences.json`（提交到仓库，团队会继承）和个人级 `~/.media/preferences.json`。一个值要在**两个不同的项目**中都被确认过，才能进入个人层，这样一次性的选择永远不会污染全局默认值。

```bash
node <SKILL_DIR>/scripts/prefs.mjs get --hyperframes . --json      # merged view (project overrides user)
node <SKILL_DIR>/scripts/prefs.mjs record --hyperframes . --key destination --value x-feed
node <SKILL_DIR>/scripts/prefs.mjs record --hyperframes . --key style_preset --value pin-and-paper --workflow faceless-explainer
```

只记录用户真正确认过的值 —— 绝不记录推断出的或默认填入的值。工作流如何使用这些值（记住的值会成为附带依据的推荐默认值，并且绝不因此跳过任何问题）由 brief 约定规定：`hyperframes/references/brief-contract.md` § 2，Remembered defaults（记住的默认值）。

## 配方 —— 冻结的视频包

用户记忆中较重量级的一层：把一次已获批准的运行冻结成一个具名、带版本的包 —— `frame.md`、分镜骨架（保留结构，内容清空为逐帧待填项）、brief 骨架（项目有 `BRIEF.md` 时取自它 —— 保留可复用的 frontmatter，清空运行形态和正文），以及已确认的 brief 取值。同样分两层：项目级 `.media/recipes/<name>/`（提交到仓库）和 `~/.media/recipes/<name>/`（冻结出来的本身就是已确认的包，所以会立即晋升 —— 不适用两个项目的规则）。再次冻结同一个名字会递增 `version`，并把旧文件夹归档为 `<name>@v<N>`。

```bash
node <SKILL_DIR>/scripts/recipe.mjs freeze --hyperframes . --name weekly-promo   # workflow read from BRIEF.md (--workflow only for briefless projects)
node <SKILL_DIR>/scripts/recipe.mjs list --hyperframes . --workflow product-launch-video
node <SKILL_DIR>/scripts/recipe.mjs use --hyperframes . --name weekly-promo   # also: resolve.mjs --type recipe --entity weekly-promo
```

冻结会在最终批准之后提供一次（`hyperframes/references/review-loop.md` § 4），意图层（`/hyperframes` → `references/intent-interview.md`，step 1）会在问第一个问题之前检查是否有匹配的配方。采用一个配方会填好 brief、设计规范和分镜骨架 —— 而且与偏好不同，它可以跳过它已经回答了的问题：这个包是作为一个整体被批准的，"要不要采用"本身就是那个问题。

## 文件

- `.media/manifest.jsonl`：机器用的唯一事实来源（SSOT），每行一条 JSON 记录。记录以路径为键，只追加不修改，所以某个路径的最后一条记录就是该文件的记录；手工移动或替换的文件会按路径保留（或失去）它的记录。
- `.media/index.md`：agent 可读的表格（id、type、dur、dims、path、description）
- `.media/preferences.json`：项目记住的默认值（提交到仓库）
- `~/.media/`：全局跨项目复用缓存（按内容寻址，SHA-256）
- `~/.media/preferences.json`：个人记住的默认值（在两个项目中确认后晋升）
- `.media/recipes/<name>/`：冻结的视频包 —— recipe.json + frame.md + 分镜骨架（提交到仓库）
- `~/.media/recipes/<name>/`：个人配方层（冻结时晋升）
- `~/.media/misses.jsonl`：仅本地保存的 resolve 未命中记录，包括供 `--stats` 使用的意图文本
