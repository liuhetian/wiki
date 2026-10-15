---
description: "本站钉在 Zensical 0.0.62，最新是 0.0.70：八个版本加配套 UI 逐条过一遍，分成跟本站有关和无关两堆，附 2026-10-15 用 0.0.70 构建正式站的实测、llmstxt 插件在正式站上的实测和用不用它的三条路、draft_docs 要配套改哪几处、升级步骤和升级后要看的地方"
---

# Zensical 0.0.62 → 0.0.70：升不升级

本站钉在 0.0.62（`uv.lock`），最新是 0.0.70（2026-10-12）。这篇把中间八个版本和配套 UI 0.0.31–0.0.37 的改动逐条过一遍，按跟本站有没有关系分成两堆，再附 2026-10-15 用 0.0.70 构建正式站的实测。发布说明原文存档在 [assets/releases.md](assets/releases.md)。

事实层面的结论：**用 0.0.70 构建正式站零告警，三个代表页的 CSS class 一个没变**——升级风险低；**收益集中在本地预览和草稿**，线上读者几乎感觉不到；**代价是一次全站重传**——主题资源换了哈希，每页 HTML 都变。唯一跟本站设计正面冲突的是新出的 `llmstxt` 插件——它要在 `plugins` 里写上才生效，只升级不开它就碰不到；评估后没开，它的复制按钮和发现链接本站自己做了，见[最后的做法](#own-copy)。

## 跟本站有关的改动 { #relevant }

| 版本 | 改动 | 对本站 |
|---|---|---|
| 0.0.63 | 被 snippet 引用的源文件改了，预览里引用它的页会重建（#950） | **好**：本站大量用 `--8<--` 引用真身，0.0.62 上改了真身，引用它的页不会自动重建 |
| 0.0.69 | 预览时监听软链目录和软链文件（#1010） | **好**：`assets/` 里的真身是软链，道理同上 |
| 0.0.70 | `exclude_docs` / `draft_docs` / `not_in_nav` | 有用，但要配套改两处，见[草稿](#drafts) |
| 0.0.66 | sitemap 收录所有发布的页（#977） | 好坏参半：实测 822 条变 1024 条，见[实测](#test-build) |
| 0.0.67 | 原生 `llmstxt` 插件 + 「Copy as Markdown」按钮 | 唯一正面冲突的改动，见[下一节](#llmstxt)；不写进 `plugins` 就不生效 |
| 0.0.67 | `github-admonitions`：`> [!NOTE]` 渲染成提示框 | 中性：要在 `plugins` 里声明才生效；吸收的上游原文里有这种写法时用得上 |
| UI 0.0.33 | Mermaid 节点标签的自定义颜色不再被盖掉（#241） | 要看一眼：本站 mermaid 有手绘卡片样式，标签颜色可能变 |
| UI 0.0.35 | 搜索结果改走 instant navigation | 按代码看不影响：跳转经 `setLocation`，只有开了 `navigation.instant` 才无刷新，本站没开，init 脚本照常整页运行；升级后实测确认一次 |
| UI 0.0.31–0.0.37 | ARIA 标注、跳转链接改指 `#__skip`、导航里代码符号后加间距 | 实测模板只差这些，class 没变 |
| 0.0.68 | 要求 Python ≥ 3.11 | 无影响：本站是 3.13 |

## 跟本站无关的 { #irrelevant }

- 博客（0.0.64）、RSS（0.0.65）：本站没有博客形态的分区
- mkdocstrings、autorefs、autoapi、api-autonav（0.0.65–0.0.66）：给 Python API 文档用
- mike 版本切换（0.0.65）：本站不分版本
- social 社交卡片（0.0.67）：每页生成一张预览图，800 多页就是 800 多张图要上传
- `exclude` 插件（0.0.67）：0.0.70 已有原生的 `exclude_docs`
- audio / video 插件（0.0.68）、macros（0.0.65、0.0.68）、nav-weight 与 markdownextradata（0.0.69）：没用到
- 压缩 HTML 时多字节字符崩溃（0.0.69，#1013）：本站没开 minify
- 点开头的文件不进产物（0.0.63，#945）：本站的 `.meta.yml` 本来就不进 `site/`；`.venv` 的漏口在 `deploy.sh` 的 rsync，仍靠那条 `--exclude='.*/'`
- 预览站根地址与 404 页（0.0.63），博客侧栏、任务列表、GLightbox、instant navigation 的几处修复（UI 0.0.31–0.0.36）

## llmstxt 插件：导出的是转换版 { #llmstxt }

官方文档对它的定义：

> An `llms.txt` index and Markdown copies of selected pages are generated.

（[plugins.md，钉 commit](https://github.com/zensical/docs/blob/1a86815c8f96c9b171c91017cd8c2c90498d3a30/docs/compatibility/mkdocs/plugins.md)）关键在 selected 和 copies。2026-10-15 在临时站上实测：

- **内容走的是 md → HTML → md**：`autoclean` 的说明是 "Clean generated HTML before conversion to Markdown"——HTML 里没留下的回不来。frontmatter、选项卡标签、代码块标题、自定义块类型（mermaid、echarts、`conflict`、`age`）、折叠状态、自定义锚点、`md_in_html` 外层 div 全丢，提示框变成 GitHub 的 `> [!NOTE]`；公式被 Markdown 转义成 `\\(E\[T\] = n H\_n\\)`，按 Markdown 解析回去仍是正常 LaTeX，只是原文多了一层噪音
- **代码块语言靠 `pygments_lang_class: true` 保住**：HTML 里有 `language-xxx` 才转得回来，本站开着
- **snippet 一律展开**，放进默认收起的 `???` 折叠块也一样。原版 mkdocs-llmstxt 能用 `preprocess` 在转换前处理，Zensical "silently ignores `preprocess`"——本站「代码即引用」的那行 `--8<--` 在副本里不存在
- **路径跟着 HTML 走**：开着 `use_directory_urls` 时 `foo.md` 的副本在 `foo/index.md`，本站镜像在 `foo.md`
- **链接改成绝对 URL**，域名按 `site_url` 在构建时写死，不写 `site_url` 直接报错；带锚点的链接指向 HTML 页
- **只有 `sections` 列出的页有副本**：漏列的页 404，指向它的链接悄悄变死链，构建不报错。`"**"` 一行能全列，`"**/*.md"` 会漏掉根目录的 `index.md`
- **`llms.txt` 是全站平铺清单**，每行只有标题，没有本站索引页的「—— 钩子」
- **关掉 `use_directory_urls` 更糟**：副本路径和本站镜像一致了，但副本里的站内链接全部指向 `.html`

插件有三样本站没有：HTML 页头的 `<link rel="alternate" type="text/markdown">` 发现链接、「Copy as Markdown」按钮、`zensical serve` 时就有副本。本站为什么只把 llms.txt 当入口，见[和 llms.txt 的对比](../cos-deploy/index.md#llmstxt)。

### 正式站实测：和现在的 `deploy.sh` 叠在一起 { #llmstxt-overlay }

2026-10-15 用 0.0.70 开插件（`sections` 写 `"**"`、加 `content.action.copy`）构建正式站，再照 `deploy.sh` 的顺序叠上 rsync 镜像和 `llms.txt` 那两步：

- **插件给 1026 页各出一份副本**。121 个目录首页和源文件同路径（`/x/index.md`），被随后的 rsync 覆盖回源文件；其余 905 篇普通文章多出第二份——`/x.md` 是源文件，`/x/index.md` 是转换版
- **`llms.txt` 线上不变**：插件出的是 1030 行全站清单，`deploy.sh` 随后换回 47 行的首页副本；本地 `zensical serve` 看到的是插件那份
- **每页 HTML 多出发现链接和复制按钮**，都指向 `./index.md`——普通文章拿到转换版，目录首页拿到的却是源文件（带 frontmatter、`--8<--`、相对链接）。同一个按钮，行为一页一个样

本站各项写法在转换版里的样子：

| 写法 | 转换版里 | 测在哪 |
|---|---|---|
| 能力时间线 | 标题、原话、正文都在；`data-kind` 分类角标全丢 | 正式站 wiki-tech 索引 |
| 公式 | 被 Markdown 转义，解析回去仍是 LaTeX | 正式站 `coupon-collector` |
| iframe 交互 demo | 整个 iframe 消失，只剩正文里手写的「真身在 …」链接 | 正式站写作规范第 9 节 |
| 可运行 JS 块 `{.js .run}` | 代码和 `js` 语言保留，`.run` 丢 | 正式站写作规范 |
| 选项卡 | 标签名全丢，只剩并排的几个代码块 | 正式站写作规范、临时站 |
| 课程 `conflict` 块 | 冲突标记和题目都在，块类型丢 | 正式站统计学课程 |
| mermaid、echarts | 不带类型的代码块 | 临时站 |
| 提示框、折叠块 | `> [!NOTE]`，「默认收起」丢 | 临时站 |
| snippet `--8<--` | 展开成真身全文 | 临时站 |
| age 打码 | 密文原样保留，不漏；`age` 块变普通代码块 | 临时站 |

### 能不能直接用：三条路 { #llmstxt-paths }

两份 Markdown 服务的是不同的读者——**转换版适合「复制一页贴进对话框」**：snippet 已展开、链接是绝对地址、没有 frontmatter，一页自成一体，贴源文件那行 `--8<--` 进去反而没用；**源文件适合「AI 把整站当 skill 逐层读」**：结构全、页面小、相对链接。转换版的导航是完整的，丢的是上表那些结构。所以真正要定的是：**AI 逐层读站时，接不接受读转换版**。

**1. 全面换成官方插件**

- 得到：一键复制、发现链接、预览就有副本；URL 规则统一成一条「页面地址加 `index.md`」，比现在两条简单；`deploy.sh` 少一段 rsync
- 代价：AI 读转换版；905 篇普通文章的 `.md` 地址从 `/x.md` 变成 `/x/index.md`，旧地址全部 404；`llms.txt` 变成 1030 行清单；「同一份 markdown 双发布」这个核心设计要重写——首页、README、`CLAUDE.md`、[对象存储部署](../cos-deploy/index.md)、[skill 怎么收纳](../../../skills/wiki-guide/remote-skill.md)

**2. 官方为主，旧地址兼容**

在第 1 条之上，`deploy.sh` 只改两处：

- rsync 镜像加 `--exclude='index.md'`：目录首页用官方转换版，不再被源文件覆盖——复制按钮和发现链接在每一页上行为一致
- 普通文章的源文件照旧镜像到 `/x.md`，当旧地址的兼容别名：发出去的链接不断；从这里顺相对链接走，碰到目录首页就进入转换版，不会 404
- `llms.txt` 改成复制插件转换后的首页 `site/index.md`：链接都是绝对地址且都存在，策展过的入口保住，不退成 1030 行清单

比第 1 条多付的只有 rsync 那一行，换来不断链。接受转换版的前提下，这是代价最小的迁移。

**3. 维持现状，向官方提需求**

本站缺的就三个选项：保留相对链接、发布源文件而不是转换版、snippet 不展开。给 Zensical 提 issue，官方支持了再迁移；他们几天发一版。在那之前没有一键复制。第 3 条和第 2 条不冲突，可以先走第 2 条、同时提 issue，官方加了选项再切过去。

发现链接不开插件也能有：在 `overrides/main.html` 里自己加一行，普通文章指向 `/x.md`、目录首页指向 `/x/index.md`。代价同样是全站 HTML 变化、重传一次，和升级放在同一次部署里只付一次。

### 最后的做法：不用插件，按钮和发现链接自己做 { #own-copy }

三条路都没走。插件里真正想要的只有复制按钮和发现链接，两样都自己做了，转换那一步对本站是负收益——源文件就是 AI 写的，AI 读源文件没有障碍，转换反倒丢图片、iframe、选项卡标签和 frontmatter。做法和原理单独成篇：[复制本页 Markdown 源](../md-copy.md)。

## 草稿：`draft_docs` 要三处一起改 { #drafts }

> Files matched by `draft_docs` are excluded from `zensical build` but included during `zensical serve`.

（[basics.md，钉 commit](https://github.com/zensical/docs/blob/1a86815c8f96c9b171c91017cd8c2c90498d3a30/docs/setup/basics.md)）现在没写完、没挂索引的草稿，每次部署都得临时挪出 `docs/`，不然 `check-links.py` 拦部署。`draft_docs` 只管 Zensical 自己的构建，本站另外两处不认它，要省掉挪文件得三处一起改：

- `mkdocs.yml` 写 `draft_docs: "*.draft.md"`，草稿统一以 `.draft.md` 结尾
- `deploy.sh` 的 md 镜像加 `--exclude='*.draft.md'`，否则草稿源照样上桶
- `check-links.py` 跳过 `*.draft.md`

## 实测：用 0.0.70 构建正式站 { #test-build }

2026-10-15，工作树原样，构建缓存先挪开，产物输出到 `tmp/`，和线上 0.0.62 的产物对比：

- **构建通过，零告警**，不带缓存 11 秒
- **产物文件数一样**，差别只有两处：主题的 CSS / JS 包换了哈希；`objects.inv` 不再生成——mkdocstrings 用的清单，本站用不到，部署时 `--delete` 会把桶里旧的删掉
- **三个代表页的 CSS class 集合完全一致**（wiki-tech 索引、写作规范、Git stash 笔记）。模板差异只有 ARIA 属性、跳转链接改指 `#__skip`、空白——`zx-theme.css` 的选择器不受影响
- **sitemap 从 822 条变成 1024 条**：多出的 202 条里 150 条在 `gallery/images`、25 条在 `gallery/web`，都是不在 nav 里的页，比如各处的 `MIRROR`、上游原文存档 `handdraw-style/assets/AGENTS`。搜索引擎能发现更多页，也会收录这些存档
- **一处没汉化**：新增的复制失败提示是英文 "Could not copy to clipboard"，只在复制按钮出错时出现

## 升级要做什么 { #steps }

1. `uv lock --upgrade-package zensical`，`pyproject.toml` 的下限顺手改成 `>=0.0.70`
2. `uv run zensical build`，确认零告警
3. 部署。主题资源换了哈希，每页 HTML 都变——全站重传一次，上次同样规模是 1027 个文件
4. 上线后看一遍：首页开屏、mermaid 手绘卡片的标签颜色、提示框 / 折叠块 / 选项卡、代码块复制按钮；搜一个带 ECharts 或公式的页，从搜索结果点进去，确认图和公式照常渲染
5. `CLAUDE.md`「已知的构建怪癖」里 `invalid_links` 那段写的是 0.0.62 的情况，升级后核对一次

只升版本不进[能力时间线](../index.md#timeline)；顺手接上 `draft_docs` 这类新功能才记一条。

## 升还是不升 { #decision }

看两件事：

- **本地预览常改真身吗**：常改，0.0.63 和 0.0.69 两处修复每天都用得上；很少改，这条不算收益
- **想不想用 `draft_docs`**：想，就得升，还要按[草稿](#drafts)那节改三处；不想，草稿照旧部署时挪开
两件都否，就没有非升不可的理由；风险低，什么时候想升都行，代价始终是那一次全站重传。一键复制不用为它升级：按钮自己做在 0.0.62 上，见[最后的做法](#own-copy)。
