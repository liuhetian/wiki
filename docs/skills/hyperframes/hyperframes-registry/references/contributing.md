<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-registry/references/contributing.md（Apache-2.0）；改动说明见 skills/hyperframes/MIRROR.md -->

# 向 registry 贡献 block 或 component

引导用户把一个新的 registry block 或 component 从构思一路推进到 PR 合并。

## 工作流

```
1. Clarify → 2. Scaffold → 3. Build → 4. Validate → 5. Preview → 6. Ship
```

### Step 1：澄清

问清楚他们要做什么。registry 有两种条目类型：

- **Block**（`registry/blocks/`，type `hyperframes:block`）—— 完整的独立 composition，尺寸和时长固定。字幕样式、VFX 效果、标题卡、lower third。
- **Component**（`registry/components/`，type `hyperframes:component`）—— 可复用的片段，没有固定的尺寸或时长。CSS 效果、文字处理、能适应任意 composition 尺寸的 overlay。

然后问：

- 用一句话描述这个效果
- 视觉参考（URL、截图或文字描述）
- 谁会用它，在什么时候用？

### Step 2：搭骨架

创建 registry 目录结构：

**block：**

```
registry/blocks/{block-name}/
  {block-name}.html
  registry-item.json
```

**component：**

```
registry/components/{component-name}/
  {component-name}.html
  registry-item.json
```

**命名约定：**

| 条目名称 | ID 前缀 | 示例 ID |
| ---------------- | --------- | ---------------------- |
| `cap-hormozi`    | `hz`      | `hz-cg-0`, `hz-cw-3`   |
| `cap-typewriter` | `tw`      | `tw-cg-0`, `tw-ch-0-5` |
| `vfx-chrome`     | `vc`      | `vc-canvas`            |

使用 2–3 个字母的前缀。所有元素 ID 都必须使用这个前缀，以免在 sub-composition 中发生冲突。

**registry-item.json** —— 使用 [templates.md](templates.md) 中的标准模板（分 block 和 component 两种，都包含全部必填字段）。

### Step 3：构建

按类型套用正确的模板。可直接复制粘贴的起步代码见 [templates.md](templates.md)。

#### 字幕 block

**不容商量的字幕规则：**

- 字号：比例字体**至少 96px**。**等宽字体可以接受 64–72px**（字符更宽，所需字号更小）。
- 可读性：`-webkit-text-stroke: 2-3px` 或者多层 `text-shadow`
- 溢出：对每个字幕组调用 `window.__hyperframes.fitTextFontSize()`
- 卡拉 OK：通过 `tl.to(wordEl, { color/scale }, WORDS[wi].start)` 高亮当前词
- 硬性清除：对每一个字幕组执行 `tl.set(groupEl, { opacity: 0, visibility: "hidden" }, g.end)`
- **绝不要在与 `tl.set(el, { opacity: 1 })` 相同的位置使用 `tl.from(el, { opacity: 0 })`** —— from 会覆盖掉 set。改用 `tl.to`。

**逐字符动画**（打字机、乱码解码）：

- 把每个字符包进 `<span>`，ID 为 `{prefix}-ch-{group}-{char}`
- 根据词的时间戳算出间隔，用 `tl.set` 错开
- 光标 / 装饰元素：按间隔用 `tl.set` —— 不要用 CSS 动画（不可 seek）

**定位变体：**

- 居中：`display: flex; align-items: center; justify-content: center;`
- Lower-third：`position: absolute; bottom: 100px; left: 0; width: 100%; text-align: center;`
- 左对齐：`position: absolute; bottom: 100px; left: 120px; text-align: left;`

#### VFX block（Three.js）

- 从 CDN 使用 `three@0.147.0`（全局 script）
- `tl.eventCallback("onUpdate", renderScene); renderScene();` —— 不要用 requestAnimationFrame
- 状态代理模式：GSAP 对一个普通 JS 对象做动画，渲染函数读取它
- 用带种子的 PRNG（`mulberry32`）产生随机性

#### 所有类型

- **只要是由脚本拼出路径（纹理、字体、JSON、模型），加载 block 自带的文件时就通过 `__hyperframes.assetUrl("assets/...")`。** `src`、`href` 这类属性在 block 挂载时会被重新定基；脚本里的字符串不会，所以一旦 block 位于 `compositions/<name>/` 之下，裸写的 `"assets/..."` 就会 404。单独的 `.js` 文件从 block 的内联脚本拿到这些 URL。素材安装到项目自己的 `assets/` 下的 block（target 为 `compositions/<name>.html`），保持普通的项目根路径即可；`assetUrl` 会到文件旁边去找。
- **占位内容一律单色** —— 在选任何一种颜色之前，先读 [placeholder-material.md](placeholder-material.md)。替身屏幕、图片、卡片、头像、logo 和图表数据序列，使用 composition 文字颜色的四个 alpha 台阶；强调色只标记一个元素，绝不用在占位内容上。
- `data-composition-id` 必须与 `window.__timelines["id"]` 一致
- 所有元素 ID 都以 block 缩写为前缀
- `gsap.timeline({ paused: true })` —— 始终暂停
- 不用 `Math.random()`，不用 `Date.now()`

### Step 4：校验

```bash
hyperframes lint                    # 0 errors required
hyperframes check --no-contrast  # 0 console errors required
```

### Step 5：预览

```bash
# Render preview video
hyperframes render -o preview.mp4

# Snapshot for visual QA
hyperframes snapshot --at "1.0,3.0,5.0,7.0"

# Publish to hyperframes.dev for review
npx hyperframes publish
```

**Catalog 预览图** —— 对于默认的 PNG 预览图，把你的截图保存到仓库 checkout 中的 `docs/images/catalog/{kind}/{name}.png`（`{kind}` 是 `blocks` 或 `components`）。上传后，catalog 从 `https://static.heygen.ai/hyperframes-oss/docs/images/catalog/{kind}/{name}.png` 提供这张图。如果 `registry-item.json` 声明了 `preview`，卡片会使用它的 `poster` URL；声明了 `preview` 却没有 `poster` 的，没有图片兜底。

- **HeyGen 内部贡献者：** 在仓库根目录运行 `scripts/upload-docs-images.sh`（需要 AWS profile `engineering-767398024897`）
- **外部贡献者：** 把预览 MP4 附到你的 PR 描述里。维护者会在合并前生成并上传 catalog 图片。

### Step 6：发布

**所有步骤都是必需的。漏掉任何一步都会产生一个残缺的 catalog 条目。**

`{kind}` 取 `blocks` 还是 `components`，取决于你在 Step 1 中做的是什么。

```bash
# 1. Create branch
git checkout -b feat/registry-{name}

# 2. Format HTML
npx oxfmt registry/{kind}/{name}/*.html

# 3. Regenerate registry/registry.json from the item directories.
#    Do not hand-edit it: an entry added by hand survives until the next
#    regeneration and then vanishes, and one left behind for a directory that
#    no longer exists is worse, because `hyperframes add <name>` resolves the
#    name and then fails on missing files.
npx tsx scripts/generate-registry-items.ts

# 4. Generate catalog docs page
npx tsx scripts/generate-catalog-pages.ts

# 5. Publish to hyperframes.dev so reviewers can preview
npx hyperframes publish

# 6. Stage everything
git add registry/{kind}/{name}/ registry/registry.json docs/catalog/

# 7. Commit
git commit -m "feat(registry): add {name} — {one sentence}"

# 8. Push and open PR with hyperframes.dev link
git push origin feat/registry-{name}
gh pr create --title "feat(registry): {name}" --body "preview: {hyperframes.dev-url}"
```

**如果你没有 GitHub 账号：** 开 PR 需要一个。在 https://github.com/signup 注册，然后运行 `gh auth login`。

## 质量闸门

- [ ] `hyperframes lint` → 0 个错误
- [ ] `hyperframes check` → 0 个控制台错误
- [ ] `npx oxfmt --check` 通过
- [ ] `registry/registry.json` 已更新，包含新条目
- [ ] 已运行 `scripts/generate-catalog-pages.ts`（文档页已生成）
- [ ] 已运行 `npx hyperframes publish`（认领你的项目 URL）
- [ ] 预览 MP4 已附到 PR（外部），或 catalog PNG 已上传（内部）
- [ ] 所有 ID 唯一且带前缀
