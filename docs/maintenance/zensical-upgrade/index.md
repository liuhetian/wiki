---
description: "Zensical 钉在 0.0.62、最新 0.1.1：实测只差模板层，description 修好 9 页；官方 llmstxt 能出相对链接，但填空、分支、frontmatter、iframe 全丢，体积涨 68%；升级步骤"
---

# Zensical 0.0.62 → 0.1.1：升不升级

本站钉在 0.0.62（`uv.lock`），最新是 0.1.1（2026-11-10）。0.1.0 是 Zensical 发布满一年的里程碑版本，自身没有新功能，只有 6 条对齐 MkDocs 的兼容修复；官方从这一版起进入三个月 beta，之后计划转 stable。这篇把中间十四个版本和配套 UI 0.0.31–0.0.42 的改动逐条过一遍，按跟本站有没有关系分成两堆，再附 2026-11-16 用 0.1.1 构建正式站的实测（10-15 用 0.0.70 测过一次，结论一致）、2026-10-28 用 0.0.73 搭临时站测 privacy 插件，以及 11-16 用 0.1.1 给全站开 llmstxt 的逐项对比。发布说明原文存档在 [assets/releases.md](assets/releases.md)。

**事实层面：用 0.1.1 构建正式站零告警，CSS class 集合只多了一个 `md-visually-hidden`，1534 页的 `.md` 发现链接一条没变**——升级风险低；**收益集中在本地预览、草稿、一处 minify 崩溃修复和 9 页 description 截断**，线上读者几乎感觉不到；**代价是一次全站重传**——主题资源换了哈希，1110 个 HTML 都变。升不升见[升还是不升](#decision)。「同一份 markdown 双发布」这条线官方没有能借的：`llmstxt` 插件只出转换版，本站不开，复制按钮和发现链接自己做了，见[最后的做法](#own-copy)；官方也不打算发布源文件，见[官方立场](#stance)。

## 跟本站有关的改动 { #relevant }

| 版本 | 改动 | 对本站 |
|---|---|---|
| 0.0.63 | 被 snippet 引用的源文件改了，预览里引用它的页会重建（#950） | **好**：本站大量用 `--8<--` 引用真身，0.0.62 上改了真身，引用它的页不会自动重建 |
| 0.0.69 | 预览时监听软链目录和软链文件（#1010） | **好**：`assets/` 里的真身是软链，道理同上 |
| 0.0.71–0.0.72 | 预览监听：扫描文件时误重启、同一秒内连改两次、ext4 复用 inode 都修了 | **好**：预览更稳 |
| 0.0.69 | `minify` 遇到属性值里的多字节字符会 panic（#1013） | **好**：本站 10-17 起开着 minify。触发面窄——raw HTML 里把「“」这类全角引号当属性引号写，整站构建 panic，不报是哪一页；至今没碰上 |
| UI 0.0.41 | 页面 description 先转义再写进 `<meta>` | **好**：0.0.62 不转义，description 里写了英文双引号的页，meta 在第一个引号处截断——[L3 节点图](../../skills/canvas/reference/l3-nodegraph.md)只剩「L3 的分水岭不是」，以引号开头的几页是空的。0.1.1 实测修好 9 页。不升也能修：把这几处 `\"` 换成中文引号 |
| 0.1.0 | `edit_url`、canonical 改按 MkDocs 的规则拼 URL；构建前校验配置 | 要看一眼：复制按钮和页头发现链接靠 `edit_url`（`repo_url`、`edit_uri` 都是站点根）。0.1.1 实测 1534 页的发现链接一条没变，配置校验通过 |
| 0.1.1 | 预览服务器校验 Host 头 | 要看一眼：用 `localhost` 或 IP 访问 200，用域名访问 400——端口转发到本机看预览不受影响，用域名反代看预览会被拒 |
| 0.1.1 | 写输出目录不穿过软链；预览服务器不服务指出站点根的软链 | 无影响：只管 `site/`。`docs/` 里 8 个指向仓库别处的软链（`assets/` 里的脚本真身），构建后是普通文件 |
| UI 0.0.42 | 代码块复制修复；导航标签放不下时两边渐隐 | 无害：本站 8 个标签，窄屏能看到渐隐 |
| 0.0.70 | `exclude_docs` / `draft_docs` / `not_in_nav` | 有用，但要配套改两处，见[草稿](#drafts) |
| 0.0.72 | `privacy` 插件：外部资源下载进站内 | 能接管本站手工 vendor 的 mermaid 和 GLightbox，但默认下得太多，见 [privacy](#privacy)；不写进 `plugins` 就不生效 |
| 0.0.72 | SuperFences 按配置里的扩展顺序生效；HTML 地址改写只改属性值、先解析字符引用 | 要看一眼：本站有 4 个自定义 fence、大量 raw HTML 和 iframe。0.1.1 实测产物只差模板层，见[实测](#test-build) |
| 0.0.74 | 模板和主题资源改从单独的 `zensical-ui` 包取，钉死 `zensical-ui==0.0.41` | 要看一眼：本站 `overrides/` 覆盖了 `main.html`、`home.html`、`partials/source.html`。0.1.1 实测照旧生效：首页和各页的发现链接都还在 |
| UI 0.0.39 | 内置加载器从 `mermaid@11` 换成 `@12`，图表配色改了 | 要看一眼：`overrides/main.html` 预先加载的 11.17.1 会被加载器直接拿去用。按代码看能配合：`initialize` 多传的 `theme: "default"` 本来就是默认值，`dropShadow` 是 12 才有的变量，渲染结果改取 `bindFunctions`（11 也是这个名字，旧代码取的 `fn` 一直是空的）。主题 CSS 新加了 `[filter*="drop-shadow"], [style*="drop-shadow"] { filter: none !important }`——本站手绘卡片的硬阴影在宿主 `div.mermaid` 上，图源码里没有 drop-shadow，碰不到。配色变没变上线后看一眼 |
| 0.0.66 | sitemap 收录所有发布的页（#977） | 好坏参半：0.1.1 实测 880 条变 1109 条，见[实测](#test-build) |
| 0.0.67 | 原生 `llmstxt` 插件 + 「Copy as Markdown」按钮 | 唯一正面冲突的改动，见[下一节](#llmstxt)；不写进 `plugins` 就不生效 |
| 0.0.74 | llmstxt 转换不再丢图片（#1095） | 中性：本站不开插件。转换版里站内图片变成绝对地址的 `![alt](…)`，`data:` 内嵌图换成 alt 文字[^1095] |
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
- audio / video 插件（0.0.68）、macros（0.0.65、0.0.68）、nav-weight 与 markdownextradata（0.0.69）、optimize 图片压缩（0.0.74）：没用到
- 点开头的文件不进产物（0.0.63，#945）：本站的 `.meta.yml` 本来就不进 `site/`；`.venv` 的漏口在 `deploy.sh` 的 rsync，仍靠那条 `--exclude='.*/'`
- `include-markdown` 插件（0.0.71）：只是把 `{% include-markdown %}` 翻成 Snippets 指令，每处单独写的参数一律忽略；比 `--8<--` 多的只有 `./`、`../` 开头的路径按当前文件解析[^plugins-new]。本站 163 个文件用 `--8<--`，`md-copy.js` 和 `check-links.py` 都认这个语法，换了没收益
- 链接可以写成 `foo.md/`、`serve` 打印所有绑定地址、自定义 polyfill 脚本（0.0.72），搜索字段超长报错、社交卡片配色、ARM 安装包（0.0.71），`rustls` 安全补丁（0.0.72）
- 预览站根地址与 404 页（0.0.63），博客侧栏、任务列表、GLightbox、instant navigation 的几处修复（UI 0.0.31–0.0.36），顶栏无障碍、目录长词省略号、mermaid 状态图注释颜色（UI 0.0.38），锚点和前进后退的滚动位置（UI 0.0.39）
- 内部重定向保留查询参数、博客日期按 locale 显示、旧式 `validation` 写法和 `relative_to_docs`（#1060，本站只写了 `invalid_links`）、privacy 下载认自定义 CA 证书（0.0.74），搜索按标签过滤、GLightbox 只显示当前配色的图（UI 0.0.41）
- `meta-descriptions` 插件（0.1.1）：给没写 description 的页自动摘一段。本站缺 description 的 227 页都是 `assets/`、`MIRROR` 这类原样收的存档，另有 244 个跳转页
- `.mjs` 自动标 module 的逻辑挪进配置（0.1.0）：`extra_javascript` 里没有 `.mjs`；静态模板和 extra 模板路径对齐 MkDocs（0.1.0）；llmstxt 转换前先解析 autorefs（0.1.1，#1141）；依赖安全更新（0.1.0），预览服务器的其余加固（0.1.1）；instant previews、搜索结果滚动、过期版本横幅的修复（UI 0.0.42）

## llmstxt 插件：导出的是转换版 { #llmstxt }

官方文档对它的定义：

> An `llms.txt` index and Markdown copies of selected pages are generated.

（plugins.md，钉 commit[^plugins]）关键在 selected 和 copies。2026-10-15 在临时站上实测：

- **内容走的是 md → HTML → md**：`autoclean` 的说明是 "Clean generated HTML before conversion to Markdown"——HTML 里没留下的回不来。frontmatter、选项卡标签、代码块标题、自定义块类型（mermaid、echarts、`conflict`、`age`）、折叠状态、自定义锚点、`md_in_html` 外层 div 全丢，提示框变成 GitHub 的 `> [!NOTE]`；公式被 Markdown 转义成 `\\(E\[T\] = n H\_n\\)`，按 Markdown 解析回去仍是正常 LaTeX，只是原文多了一层噪音
- **代码块语言靠 `pygments_lang_class: true` 保住**：HTML 里有 `language-xxx` 才转得回来，本站开着
- **snippet 一律展开**，放进默认收起的 `???` 折叠块也一样。原版 mkdocs-llmstxt 能用 `preprocess` 在转换前处理，Zensical "silently ignores `preprocess`"——本站「代码即引用」的那行 `--8<--` 在副本里不存在
- **路径跟着 HTML 走**：开着 `use_directory_urls` 时 `foo.md` 的副本在 `foo/index.md`，本站镜像在 `foo.md`；没有控制副本位置的选项
- **链接默认改成绝对 URL**，前缀是 `base_url`（默认取 `site_url`），在构建时写死；不写 `site_url` 直接报错。带锚点的链接 0.1.1 指向副本（`second/index.md#小节`）
- **`base_url: "/"` 出相对链接**：按副本自己的位置算——`sub/page/index.md` 链根首页写成 `../../index.md`，`llms.txt` 里也是相对的，域名不再写死。跟源文件里的写法（`../index.md`）对不上，但都解析得到，见[全站逐项对比](#llmstxt-inventory)
- **只有 `sections` 列出的页有副本**：漏列的页 404，指向它的链接悄悄变死链，构建不报错。`"**"` 一行能全列，`"**/*.md"` 会漏掉根目录的 `index.md`
- **`llms.txt` 是全站平铺清单**，每行只有标题，没有本站索引页的「—— 钩子」
- **关掉 `use_directory_urls` 更糟**：副本路径和本站镜像一致了，但副本里的站内链接全部指向 `.html`；再加 `base_url: "/"` 也只是变成相对的 `../index.html`。所以没有哪种组合能做出本站的样子——`/x.md` 的位置加指向 `.md` 的相对链接

插件有三样本站没有：HTML 页头的 `<link rel="alternate" type="text/markdown">` 发现链接、「Copy as Markdown」按钮、`zensical serve` 时就有副本。本站为什么只把 llms.txt 当入口，见[和 llms.txt 的对比](../../projects/wiki/cos-deploy/index.md#llmstxt)。

### 正式站实测：和现在的 `deploy.sh` 叠在一起 { #llmstxt-overlay }

2026-10-15 用 0.0.70 开插件（`sections` 写 `"**"`、加 `content.action.copy`）构建正式站，再照 `deploy.sh` 的顺序叠上 rsync 镜像和 `llms.txt` 那两步：

- **插件给 1026 页各出一份副本**。121 个目录首页和源文件同路径（`/x/index.md`），被随后的 rsync 覆盖回源文件；其余 905 篇普通文章多出第二份——`/x.md` 是源文件，`/x/index.md` 是转换版
- **`llms.txt` 线上不变**：插件出的是 1030 行全站清单，`deploy.sh` 随后换回 47 行的首页副本；本地 `zensical serve` 看到的是插件那份
- **每页 HTML 多出发现链接和复制按钮**，都指向 `./index.md`——普通文章拿到转换版，目录首页拿到的却是源文件（带 frontmatter、`--8<--`、相对链接）。同一个按钮，行为一页一个样

### 全站逐项对比：本站自己的写法在转换版里 { #llmstxt-inventory }

2026-11-16 用 0.1.1 给正式站开插件（`base_url: "/"`，`sections` 写 `"**"`），1110 篇源文件逐篇和副本对比：

- **地址**：1109 篇有副本，其中 964 篇普通文章从 `/x.md` 变成 `/x/index.md`，只有目录首页不变；点开头目录里那 1 篇没有副本
- **链接都对得上**：副本里 6243 条站内链接都是相对的；对应不到文件的只有代码块里的示例路径和部署时才生成的 `.tar.gz`
- **`llms.txt` 是 1113 行平铺清单**；插件转出来的首页副本里「—— 钩子」都在，拿它当 `llms.txt` 能保住策展过的入口
- **体积从 6.6 MB 涨到 11.1 MB**：snippet 全部展开，[DeepTutor](../../projects/deeptutor/index.md) 首页 23.6 KB → 209 KB。AI 逐层读站时读进去的 token 跟着涨

| 写法 | 页数 | 转换版里 |
|---|---|---|
| frontmatter（`description`、`name`、`copy_source`） | 758 | 全丢 |
| 填空 `<input>`、`<textarea>` | 71 | 输入框整个消失，[婚纱骨架](../../skills/photo-shoot/shooting/reference/wedding-prompt.md)只剩「新郎：岁，」，连要填什么都看不到 |
| 填空 `<select>` | 同上 | 选项拼成一串字：「没有，只给镜头文案有，每镜另外注明了」 |
| `data-when` 分支 | 11 | 外层 div 丢，所有分支不论条件全部出现 |
| `zx-no-copy` | 48 | 外层 div 丢，维护记录、选择框混进正文，复制时剔不掉 |
| iframe 交互 demo | 146 | 整个消失，只剩正文里手写的「真身在 …」链接 |
| snippet `--8<--` | 191 | 展开成真身全文，放进默认收起的 `???` 也一样 |
| `assets/` 里原样收的存档 | 230 | 被重新排版，不再一字不差 |
| mermaid、echarts | 49 / 19 | 不带类型的代码块 |
| 课程 `conflict` 块 | 3 | 冲突标记和题目都在，块类型丢 |
| 选项卡 | 37 | 标签名丢，只剩并排的几个代码块 |
| 提示框、折叠块 | — | `> [!NOTE]`；折叠块的标题和「默认收起」丢 |
| 可运行 JS 块 `{.js .run}` | 4 | 代码和 `js` 语言保留，`.run` 丢 |
| 公式 | 61 | 被转义成 `\\(O(\\log n)\\)`，按 Markdown 解析回去仍是 LaTeX |
| 自定义锚点 `{ #id }` | — | 标题上的 id 丢，页内 `#decision` 这类链接对不上标题 |
| 能力时间线 | 1 | 标题、原话、正文都在；`data-kind` 分类角标丢 |
| 正文 | 全站 | 加 `\[`、`\*\*`、`\<` 转义；分行写的段落并成一行，prompt 原文被重排 |
| age 打码 | 9 | 密文原样保留，不漏；`age` 块变普通代码块，`age-open.py` 照样认 |

echarts、`conflict`、`.run`、提示框、时间线这几行是 10-15 用 0.0.70 测的，11-16 没逐个复核；其余在 0.1.1 上核过。前五行正好是 skill 和 prompt 页靠的机制——转换版里，AI 拿到的 prompt 缺空、分支全摊开、还混着维护记录。

### 构建时填值：插件只转构建出来的 HTML { #llmstxt-build-time }

2026-11-16 在独立的测试站上试过「页面里有接口实时数据，给 AI 的 md 也要带值」：

- **浏览器里 JS 填的值进不了副本**：占位符 `{{ api("/api/today").date }}` 由前端脚本在浏览器里换成值，构建时的 HTML 里只有占位符，副本里也只有占位符
- **配 macros 插件就能进**：项目根的 `main.py` 在 `define_env` 里定义 `api()`，构建时调接口，值写进 HTML，副本里就是填好的值；构建机连得上接口就行，内网也可以
- **说明里的示例也会被执行**：行内代码和代码块里的 `{{ api(...) }}` 照样求值，出错时整页换成报错页，构建却报「No issues found」。示例包 `{% raw %}…{% endraw %}`，并设 `on_error_fail: true`
- **网页上想继续实时**：宏输出 `<span class="live" data-api="…" data-key="…">值</span>`，网页里留着 span 给前端脚本刷新，副本里只剩值
- **每页重新初始化宏环境**：同一个接口每页各调一次，跨页缓存不住
- **本站要按页开**：代码块里大量写着 `{{ }}`，全站默认渲染会误伤，要 `render_by_default: false`，只在用到的页的 frontmatter 里打开
- **值是构建那一刻的**：要新就得定时重新构建、上传

### 能不能直接用：三条路 { #llmstxt-paths }

两份 Markdown 服务的是不同的读者——**转换版适合「复制一页贴进对话框」**：snippet 已展开、链接是绝对地址、没有 frontmatter，一页自成一体，贴源文件那行 `--8<--` 进去反而没用；**源文件适合「AI 把整站当 skill 逐层读」**：结构全、页面小、相对链接。转换版的导航是完整的，丢的是上表那些结构。所以真正要定的是：**AI 逐层读站时，接不接受读转换版**。

**1. 全面换成官方插件**

- 得到：一键复制、发现链接、预览就有副本；URL 规则统一成一条「页面地址加 `index.md`」，比现在两条简单；`deploy.sh` 少一段 rsync
- 代价：AI 读转换版，填空、分支、frontmatter、iframe 都丢，见[全站逐项对比](#llmstxt-inventory)；964 篇普通文章的 `.md` 地址从 `/x.md` 变成 `/x/index.md`，旧地址全部 404；`llms.txt` 变成 1113 行清单；「同一份 markdown 双发布」这个核心设计要重写——首页、README、`CLAUDE.md`、[对象存储部署](../../projects/wiki/cos-deploy/index.md)、[写 skill](../../skills/wiki-guide/skill.md)

**2. 官方为主，旧地址兼容**

在第 1 条之上，`deploy.sh` 只改两处：

- rsync 镜像加 `--exclude='index.md'`：目录首页用官方转换版，不再被源文件覆盖——复制按钮和发现链接在每一页上行为一致
- 普通文章的源文件照旧镜像到 `/x.md`，当旧地址的兼容别名：发出去的链接不断；从这里顺相对链接走，碰到目录首页就进入转换版，不会 404
- `llms.txt` 改成复制插件转换后的首页 `site/index.md`：链接都存在，策展过的入口保住，不退成 1113 行清单

比第 1 条多付的只有 rsync 那一行，换来不断链。接受转换版的前提下，这是代价最小的迁移。

**3. 维持现状，向官方提需求**

本站缺的就三个选项：保留相对链接、发布源文件而不是转换版、snippet 不展开。给 Zensical 提 issue，官方支持了再迁移；他们几天发一版。在那之前没有一键复制。第 3 条和第 2 条不冲突，可以先走第 2 条、同时提 issue，官方加了选项再切过去。

发现链接不开插件也能有：在 `overrides/main.html` 里自己加一行，普通文章指向 `/x.md`、目录首页指向 `/x/index.md`。代价同样是全站 HTML 变化、重传一次，和升级放在同一次部署里只付一次。

### 最后的做法：不用插件，按钮和发现链接自己做 { #own-copy }

三条路都没走。插件里真正想要的只有复制按钮和发现链接，两样都自己做了，转换那一步对本站是负收益——源文件就是 AI 写的，AI 读源文件没有障碍，转换反倒丢 iframe、选项卡标签和 frontmatter（图片 0.0.74 起保住了）。做法和原理单独成篇：[复制本页 Markdown 源](../../projects/wiki/md-copy.md)。

### 官方立场：不打算发布源文件 { #stance }

「`/x.md` 拿源」正是 issue #859 提的需求，维护者的回复：

> Serving the raw Markdown sources is not enough, because includes (snippets, directives, mkdocstrings) and potentially other constructs would be missing from the source. The only way to sensibly serve Markdown is to go through rendering, then convert HTML to CommonMark.

（#859 维护者回复，2026-08-14[^859]）

- **官方和本站方向相反**：他们嫌源文件缺了 snippet 展开的内容，所以先渲染再转回去；本站的 `--8<--` 路径先相对 `docs/`，AI 照着路径能自己读到真身，复制按钮还会把它改成线上绝对地址，缺的那部分补得上
- [第 3 条路](#llmstxt-paths)里想提的「发布源文件而不是转换版」不用等了。0.0.70 之后 `llmstxt` 改过两处：0.0.74 起 `autoclean` 不再删图片（#1095），0.1.1 起转换前先解析 autorefs（#1141）；发布源文件的选项仍然没有，文档的参数表 11-16 复核还是那 6 项
- 路线图上给 AI 的文档（Agent-ready documentation）只挂在 Agentic workflows 一节，不在「已上线、开发中、下一步」三栏里[^roadmap]。「下一步」里有 **Module API for Python**——用 Python 写模块扩展构建。它出来以后，`deploy.sh` 里的 md 镜像、`llms.txt`、skill 打包有可能挪进构建，`zensical serve` 时就有，到时再评估

??? abstract "原文存档：#859 维护者回复、路线图节选（2026-10-28 抓取）"

    `````markdown
    --8<-- "maintenance/zensical-upgrade/assets/agent-docs.md"
    `````

## privacy 插件：能接管 vendor，默认下得太多 { #privacy }

本站线上不走 CDN，Zensical 内置加载器写死 unpkg 的两样——mermaid 和 GLightbox——现在靠 `scripts/fetch-vendor.sh` 下载进 `docs/vendor/`，再由 `overrides/main.html` 在有图的页面里先同步加载，让加载器直接复用、不出网。privacy 插件要做的就是这件事：

> Automatically self-host external assets and annotate external links.

（plugins.md，钉 commit[^plugins-new]）2026-10-28 用 0.0.73 搭临时站，开 `glightbox`、`privacy`，放一个 mermaid 块，实测：

- **加载器里的地址被改写**：主题 JS 里的 `https://unpkg.com/mermaid@12/...`、`glightbox@3/...` 变成站内 `assets/external/unpkg.com/...`，0.0.73 修好了嵌套页上的相对路径（#1080）。本站那两段手工 vendor 和模板里的条件加载都能删
- **默认把加载器里引用的外部资源全下**，不管页面用没用：pyodide、ace、plyr 视频播放器，顺着 plyr 又抓了 vimeo 和 Google IMA 广告 SDK，一共 16 个文件 7.2 MB，两个超时告警。写 `assets_include` 只放 `unpkg.com/mermaid@*`、`unpkg.com/glightbox@*`，就只剩 3 个文件 5.4 MB
- **版本跟着主题走**：`mermaid@12`、`glightbox@3` 是浮动标签，首次构建下载后缓存在 `.cache/plugin/privacy`，不再由 `fetch-vendor.sh` 钉版本；部署机第一次构建要能连上 unpkg
- **外链注解不改普通链接**：只给已经带 `target="_blank"` 的外链补 `rel="noopener"`

现在的做法能用，privacy 只算升级时顺手做的简化，不是升级的理由。要接就写成：

```yaml
plugins:
  - privacy:
      assets_include:
        - unpkg.com/mermaid@*
        - unpkg.com/glightbox@*
```

## 草稿：`draft_docs` 要三处一起改 { #drafts }

> Files matched by `draft_docs` are excluded from `zensical build` but included during `zensical serve`.

（basics.md，钉 commit[^basics]）现在没写完、没挂索引的草稿，每次部署都得临时挪出 `docs/`，不然 `check-links.py` 拦部署。`draft_docs` 只管 Zensical 自己的构建，本站另外两处不认它，要省掉挪文件得三处一起改：

- `mkdocs.yml` 写 `draft_docs: "*.draft.md"`，草稿统一以 `.draft.md` 结尾
- `deploy.sh` 的 md 镜像加 `--exclude='*.draft.md'`，否则草稿源照样上桶
- `check-links.py` 跳过 `*.draft.md`

## 实测：用 0.1.1 构建正式站 { #test-build }

2026-11-16，工作树复制到 `tmp/`，清掉缓存分别用 0.0.62 和 0.1.1 构建，逐文件对比。10-15 用 0.0.70 测过一次，结论一致：

- **两版都零告警**，不带缓存 13 秒、12 秒
- **文件数 4856 对 4854**，差别有三处：主题的 6 个 CSS / JS 包换了哈希；`objects.inv` 不再生成——mkdocstrings 用的清单，本站用不到，部署时 `--delete` 会把桶里旧的删掉；点开头目录里的 `trellis-src/.trellis/…/journal-1.md` 不再出 HTML 页，它只是被 `--8<--` 引用的存档
- **1110 个 HTML 有变化，抹掉资源哈希后只剩模板层**：generator 版本号、ARIA 属性、跳转链接改指 `#__skip`，minify 把代码块里的 `&quot;` 写成 `"`
- **CSS class 集合只多了一个 `md-visually-hidden`**（按钮的无障碍文字），`zx-theme.css` 的选择器不受影响
- **1534 页的 `.md` 发现链接一条没变**，description 修好 9 页
- **sitemap 从 880 条变成 1109 条**：多出的里 169 条在 `gallery/images`、25 条在 `gallery/web`，都是不在 nav 里的页，比如各处的 `MIRROR`、上游原文存档 `handdraw-style/assets/AGENTS`。搜索引擎能发现更多页，也会收录这些存档
- **一处没汉化**：复制失败提示是英文 "Could not copy to clipboard"，只在复制按钮出错时出现

## 升级要做什么 { #steps }

1. `uv lock --upgrade-package zensical`，`pyproject.toml` 的下限顺手改成新版本
2. 构建正式站到 `tmp/`，确认零告警，和线上产物对比——[上面的实测](#test-build)到 0.1.1；比新版本时重点看页头两行发现链接、首页开屏、自定义 fence 和 raw HTML 多的页
3. 部署。主题资源换了哈希，每页 HTML 都变——全站重传一次，0.1.1 是 1110 个 HTML 加 6 个主题包
4. 上线后看一遍：首页开屏、mermaid 手绘卡片（加载器已换成 Mermaid 12，本站预加载的是 11.17.1）、提示框 / 折叠块 / 选项卡、代码块复制按钮、窄屏下的导航标签；搜一个带 ECharts 或公式的页，从搜索结果点进去，确认图和公式照常渲染
5. 本地预览用 `localhost` 或 IP 打开，用域名访问会被 0.1.1 的预览服务器拒掉
6. `CLAUDE.md`「两道链接校验」里 `invalid_links` 那段写的是 0.0.62 的情况，升级后核对一次

只升版本不进[能力时间线](../../projects/wiki/index.md#timeline)；顺手接上 `draft_docs`、`privacy` 这类新功能才记一条。

## 升还是不升 { #decision }

2026-10-28 看完 0.0.73，定下先不升——没有非升不可的：

- 「同一份 markdown 双发布」这条线官方没有新东西，也不打算发源文件，见[官方立场](#stance)
- privacy 能替掉手工 vendor，但现在的做法能用
- minify 的崩溃修复是唯一的防御性理由，触发面窄，至今没碰上

2026-11-04 看过 0.0.74，下面的条件一条没碰上，照旧不升：llmstxt 只是不再丢图片，导出的还是转换版；新增的好处是 description 转义，改几处源文件的引号就能修，不用为它升级。

2026-11-16 复核到 0.1.1：下面四条仍一条没碰上，Module API for Python 在路线图上还在「Up next」。0.1.x 没带来新的升级理由，但实测已经覆盖到 0.1.1，差别只在模板层；0.1.0 起官方进入三个月 beta。

碰上下面任何一条再重新评估：

- **本地预览改真身不重建，嫌烦了**：0.0.63、0.0.69 和 0.0.71–0.0.72 的监听修复都管这事
- **想用 `draft_docs`**：得升，还要按[草稿](#drafts)那节改三处
- **minify 真的 panic 了**：先查哪页 raw HTML 里有全角引号，改掉就能过；改不过就升
- **官方 Module API for Python 上线**：看双发布能不能挪进构建

风险低，什么时候想升都行，代价始终是那一次全站重传。

[^plugins]: [plugins.md，钉 commit](https://github.com/zensical/docs/blob/1a86815c8f96c9b171c91017cd8c2c90498d3a30/docs/compatibility/mkdocs/plugins.md)，2026-10-15 读。
[^basics]: [basics.md，钉 commit](https://github.com/zensical/docs/blob/1a86815c8f96c9b171c91017cd8c2c90498d3a30/docs/setup/basics.md)，2026-10-15 读。
[^plugins-new]: [plugins.md，钉 commit](https://github.com/zensical/docs/blob/1a8b4b27db1ba939f85ed9381448c5c2004d19d7/docs/compatibility/mkdocs/plugins.md)，`include-markdown`、`privacy` 两节，2026-10-28 读。
[^859]: [zensical/zensical#859 维护者回复](https://github.com/zensical/zensical/issues/859#issuecomment-5291561058)，2026-10-28 读，原文存档见上面的折叠块。
[^1095]: [zensical/zensical@49132b7](https://github.com/zensical/zensical/commit/49132b79d40b110f1fb8d9f0d7c1e757edbda169)，修 #1095 的提交，2026-11-04 读。
[^roadmap]: [Zensical 路线图](https://zensical.org/roadmap/)，2026-10-28 读，节选存档见上面的折叠块；2026-11-16 复核，Module API for Python 仍在「Up next」。
