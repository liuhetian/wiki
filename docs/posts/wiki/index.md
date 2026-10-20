---
description: "这个 wiki 自己的事：目标与计划、怎么当远程 skill 用、用到的技术一项一页（对象存储部署与双产物、自建 git-lfs 后端、打码），文末能力时间线按日期列出在 Zensical 之上加过的每项功能，附当时的需求原话和改了哪里"
copy_source: true
---

# wiki 介绍

这个 wiki 自己的事都在这里：往哪去、怎么用、靠哪些技术搭起来。写作时怎么用这些机制是写作规矩，在[写作规范](../../skills/wiki-guide/index.md)里。按时间看所有功能是怎么一项项加上来的，见文末的[能力时间线](#timeline)。

## 目标与用法 { #about }

- [本 wiki 的目标与计划](roadmap.md) —— 2026-09-29 的审核：专业主干只到本科应用统计，要补数理统计与计算、计量、机器学习、深度学习四块并加论文板块；吸纳教材只留地图、压缩、手迹、连线四样，课程排成 16 门的队列，文末进度表做一项划一项
- [把 wiki 当远程 skill](everything-skill.md) —— skill 要人能读能改，所以吸纳别人的 skill 要翻译；frontmatter 可丢，脚本部署前打包；插件里「告诉模型怎么做」的一半能换成 skill，「Claude Code 自己执行」的 hooks、mod 换不了。由此衍生出 [skill 收纳方案](../../skills/wiki-guide/skill.md)
- [新机器初始化自检](init-check.md) —— 从 clone 到能推送的五条链路：依赖与构建、链路闸门、LFS 真身、COS 凭证、GitHub 推送；各自怎么验、失败时先看哪里

## 用到的技术 { #tech }

一项技术一页。每页讲清楚这项技术是什么、为什么这么选、换到别的站要改哪里。

- [用对象存储部署 AI 友好的个人知识库](cos-deploy/index.md) —— 总纲：什么算对 AI 友好、同一份 markdown 双发布、为什么是对象存储而不是服务器；附[部署实操手册](cos-deploy/reference/deploy.md)
- [用自己的对象存储做 git-lfs 后端](git-lfs.md) —— standalone custom transfer agent：140 行脚本替掉整个 LFS 服务，协议、坑和换存储的改法
- [打码：key 和小字都以密文写进 wiki](age-mosaic.md) —— API key、服务器地址用 age 公钥加密后写进 markdown，浏览器里显示成马赛克，解锁后还原；六种存法的比较、对称与非对称加密、scrypt 为什么撑得住短口令，以及 encryptcontent 这类插件为什么在本站会漏
- [复制本页 Markdown 源：不用官方插件，自己做](md-copy.md) —— 右上角复制按钮和页头发现链接：为什么不用官方 llmstxt 插件、借 `page.edit_url` 拿源文件地址、复制时相对链接怎么改成线上绝对地址
- [Zensical 0.0.62 → 0.0.70：升不升级](zensical-upgrade/index.md) —— 八个版本逐条过：跟本站有关的只有预览重建、草稿、sitemap 几条；0.0.70 构建正式站零告警、class 未变；llmstxt 插件替不掉 `.md` 镜像

还没单独成篇的：`check-links.py` 这道闸门（现在写在总纲的[闸门一节](cos-deploy/index.md#link-check)）、vendor 本地化与按需加载、中文字体子集化。哪项值得单独讲了再拆出来。

## 能力时间线 { #timeline }

上面是单独成篇的技术；这里按落地日期从上往下，列出在 Zensical 之上加过的每一项功能，有专文的条目末尾带「详见」。每条三样：标题是日期和功能名，引用块是我当时提需求的原话（取自和 AI 的对话记录，只做删节），正文一段说改了哪里。

标题旁的分类：**配置**是只动 `mkdocs.yml` 的官方能力，**前端**是自己写的 CSS、JS、模板，**流水线**是 `deploy.sh` 和 `scripts/` 里的脚本。只记功能，不记内容：新增文章、分区、收录的资料不算，只为某一批内容服务的脚本（比如 LeetCode 笔记的校验、手绘风格库的页面生成器）也不算。只收做成了的，以及实测后决定不用的官方功能（写清不用的理由）；只是讨论过、没动手的（比如上 CDN）不收；做了又撤掉的照记，撤回写进当初加它的那一条，标题注明。以后每加一项功能，在末尾追加一条，写法见[写作规范 · 时间线](../../skills/wiki-guide/reference/components.md#timeline)。

<div class="zx-timeline" markdown>

### 2026-06 · 上线：Zensical 构建，对象存储直出 {: data-kind="配置 + 流水线" }

> 有个自己的地方放笔记，能公开访问就行。

这一条早于对话记录，引用是当时建站手记里的话。`zensical build` 出静态文件，`deploy.sh` 用 coscmd 同步进 COS 桶，自定义域名直接解析到 COS，服务器不在请求链路上。`deploy-cert/` 用 acme.sh 走 DNSPod 验证、把证书推到 COS，HTTPS 自动续期。官方配置起步：`navigation.tabs`、`navigation.indexes`、`content.code.copy`、`content.code.annotate`，以及 admonition、details、tabbed、superfences 这些官方扩展。

详见[部署实操手册](cos-deploy/reference/deploy.md)：建桶、绑域名、HTTPS 自动续期。

### 2026-06-30 · 线上同时发布 .md 源 {: data-kind="流水线" }

> 如果直接手动把docs里面的md复制到site里，会不会直接就借用这个功能？从而实现保留源md文件的效果？试试呢？

`deploy.sh` 加一行 rsync，把 `docs/` 的 `.md` 树原样镜像进 `site/`。`use_directory_urls` 让页面占 `/x/index.html`，`/x.md` 正好空着，人和 AI 同域各取一份。`.md` 上传时钉 `text/markdown`，不然 COS 给 octet-stream，浏览器直接下载。同一天把 `pymdownx.snippets` 的 `base_path` 改成 `docs` 和项目根两级，引用路径不再带 `docs/` 前缀 ——「我担心把index.md 给到大模型，大模型看到两种前缀，导致不知道怎么拼接」。

详见[对象存储部署 · 设计](cos-deploy/index.md#设计)：一颗语法糖、两个约定。

### 2026-07-01 · 一文一目录，代码真身软链进 assets {: data-kind="配置 + 流水线" }

> 我还是希望软连接，让deploy轻量一点（本质只做copy md和build两件事）

文章从单个 `.md` 变成 `index.md` + `assets/`。`assets/` 里放软链，指向仓库里真正在跑的文件（`deploy.sh`、`mkdocs.yml` 等），正文用 `--8<--` snippet 引用同一份，构建后软链变成实体文件随站发布，AI 顺 URL 能取到真身。07-02 定成标准 skill 布局：「继续使用symlink方案，并且使用 cos-wiki-deploy 这个目录（也就是标准的skill布局）」。

详见[对象存储部署 · 设计](cos-deploy/index.md#设计)：代码即引用，真身可远程取。

### 2026-07-07 · iframe 嵌交互 demo，运行时进 vendor {: data-kind="前端" }

> 我想的未来有很多都是需要借助前端进行展示的，大概是单页界面。能不能 zensical 部署，然后自己通过iframe引用这个单页界面的url进来？

demo 写成自包含的静态单页，放进各自的 `assets/`，正文用 iframe 同域嵌入。React 18 UMD + `htm` 放进 `docs/vendor/`，不用 JSX 编译、不走 CDN。demo 逻辑不压缩，AI 读同一 URL 下的源码。

详见[写作规范 · 嵌入交互单页](../../skills/wiki-guide/reference/components.md#iframe-demo)。

### 2026-07-09 · llms.txt {: data-kind="流水线" }

> 我决定了，就 build 的时候直接cp成 llms.txt，然后我写作的时候会照顾两边。

`deploy.sh` 把构建后的 `site/index.md` 复制成 `site/llms.txt`，首页按 llms.txt 规范写（H1 + 引用块 + H2）。08-12 首页有了开屏 frontmatter 之后，改成剥掉 frontmatter 和开头注释再落盘。

详见[对象存储部署 · 和 llms.txt 的对比](cos-deploy/index.md#llmstxt)。

### 2026-07-11 · 数学公式 {: data-kind="配置 + 前端" }

> 我想增加内容，放一些算法问题，机器学习的模型理解，深度模型的模型理解啥的，相当于个人笔记……比如第一个问题：12枚硬币……

没有单独提公式的需求，是随第一篇概率笔记一起加的，日期按笔记推断。官方 `pymdownx.arithmatex`（generic 模式）配本地 MathJax 3 真身，配置写在 `vendor/mathjax-init.js`。09-04 改成按需加载：页面里有 `.arithmatex` 才去拉 2MB 的真身。

### 2026-07-11 · echarts 代码块：图表写在 markdown 里 {: data-kind="配置 + 前端" }

> 帮我加一个桑基图……zensical 是否支持嵌入echarts或者其他的html图表？……感觉把图表单独放在一个html里感觉怪怪的

`superfences` 加一个 `echarts` 自定义 fence，块里直接写 ECharts 的 option JSON。`vendor/echarts-init.js` 查到这类块才动态加载 ECharts 真身渲染，没图的页面零开销。

### 2026-07-19 · 二进制赶出 git，第一次重置历史 {: data-kind="流水线" }

> 我的当前wiki中，图片资源是不是没有放入git的……我在想把这部分资源额外找个cos存储，这样可以用一个脚本复原。

`scripts/backup-media.sh` 把媒体备份到独立的备份桶，只增不删；MathJax、ECharts 这类第三方真身由 `scripts/fetch-vendor.sh` 钉版本从 CDN 拉回。git 历史重置成一个 commit。九天后被下面的 mini LFS 取代。

### 2026-07-26 · 部署前先 git pull --ff-only {: data-kind="流水线" }

> 也就是说本机的deploy.sh 进行一个pull对吧。加上吧。

为了在副机写作、主机部署：`deploy.sh` 第一步 `git pull --ff-only` 收编副机 push 的内容，本地有未推提交或冲突就停住，不静默合并。

详见[部署实操手册 · 日常写作流](cos-deploy/reference/deploy.md#写作流)。

### 2026-07-28 · 自制 mini LFS，第二次重置历史 {: data-kind="流水线" }

> 现在用cos来备份图像资源和重建，所以我的问题是能不能自己实现一个mini的lfs 服务？

`scripts/lfs-cos-agent.py`（git-lfs 的 standalone custom transfer agent，约 140 行）把 blob 按 sha256 存进备份桶的 `lfs/` 前缀；`.gitattributes` 把图、视频、字体和 vendor 真身交给 LFS；`scripts/setup-lfs.sh` 给新 clone 接入。vendor 也进 LFS：「这种产物因为不是我们自己维护的代码，也应该一起丢lfs」，`fetch-vendor.sh` 降级成升级工具。git 历史再次重置，就是现在的第一个 commit。edb03a6[^commit]

详见[用自己的对象存储做 git-lfs 后端](git-lfs.md)。

### 2026-07-30 · AI 链路闸门 check-links.py {: data-kind="流水线" }

> （这条没留下对话记录，提交说明是 "Enforce AI link-path integrity at deploy time"）

`scripts/check-links.py` 查三项：每篇都被某个祖先索引页直接链到、没有死链、注册进了 nav。`deploy.sh` 在读凭证和构建之前先跑它，非零退出就中止部署。09-04 又加两项：笔记里不许有未答的课程题、图片和 demo 等非 `.md` 资源不许死链。b0a5d3e[^commit-2]

详见[对象存储部署 · 闸门](cos-deploy/index.md#link-check)。

### 2026-08-08 · 代码源文件钉文本类型 {: data-kind="流水线" }

> 你 deploy 之后，派一个一个subagent 去读取，看看能不能读取到原始代码？（08-05）

COS 按扩展名猜类型，`.ts` 猜成 video/mp2t，`.tsx/.jsx/.mjs/.py` 猜成 octet-stream，AI 抓取工具直接拒收。`deploy.sh` 加一条带 `Content-Type: text/plain` 的上传。08-12 桶里错类型的旧对象修正完，这条改带 `-s`，没变的不再重传。清单后来陆续扩充：`.csv`（09-18，课程数据表）、`LICENSE`（09-29）、`.caddy` 和 `.conf`（10-01）、`.cjs`（10 月，HyperFrames 脚本）。807e762[^commit-3]

### 2026-08-12 · 开屏首页 {: data-kind="前端" }

> 可以帮我做一个saas风格的开屏吗，内容多一点，介绍一下本wiki和能给读者带来什么……而且首页要铺满屏幕！（08-08）

`custom_dir: overrides` 加 `overrides/home.html` 和 `stylesheets/home.css`，`docs/index.md` 用 frontmatter `template: home.html` 换成开屏。正文不上屏，照样发布成 `/index.md` 和 `/llms.txt` 给 AI 读。521b0b1[^commit-4]

### 2026-08-14 · 字体本地化 {: data-kind="配置 + 前端" }

> 开屏的时候我发现加载很慢……这个是google字体导致的我这个打开慢吗？改为本地化吧，我看字体也就 1.8mb（08-13）

`theme.font: false` 关掉官方的 Google Fonts 引用；Inter 和 JetBrains Mono 的 woff2 放进 `vendor/fonts/`，`fonts.css` 挂进 `extra_css`。c39a3cf[^commit-5]

### 2026-08-17 · 3D demo 运行时 {: data-kind="前端" }

> （这条没留下对话记录，是随 Vercel Lanyard 可拖拽 3D 工牌的拆解一起加的）

`vendor/` 增加 React 的 ES module 版、react-three-fiber、drei、rapier、meshline 和 `htm.module.js`，给 ES module 写法的 3D demo 用，同样走 LFS。3eb7118[^commit-6]

### 2026-08-25 · 全站皮肤对齐首页 {: data-kind="前端" }

> 参考本wiki的首页风格，对整个仓库都改成相符合的风格如何？修改方法见文档：https://zensical.org/docs/customization/

两层 CSS 挂进 `extra_css`：`zx-tokens.css` 是令牌层，放 Atelier Zero 的颜色和字体变量并映射到 `--md-*`；`zx-theme.css` 是皮肤层，只写选择器，管直角、导航、标题、链接、列表、代码块。d8f6124[^commit-7]

### 2026-08-25 · mermaid 真身本地化 {: data-kind="前端" }

> 要不也帮我自包含进去？这个mermaid的三方库

Zensical 内置的加载器在 `mermaid` 未定义时会去 unpkg 拉。`overrides/main.html` 只给含 mermaid 块的页面同步引入 `vendor/mermaid/`，内置加载器就不再出网；`fetch-vendor.sh` 记上它的版本。d8f6124[^commit-7]

### 2026-08-25 · 提示框、折叠块、选项卡一套语言 {: data-kind="前端" }

> 对于折叠卡，现在太丑了……颜色的话放在左边的竖线和 > 里。选项卡也实现左边竖线功能吧，这样左右切换选项卡可以知道哪些部分的内容是属于这个选项里才有的内容

`zx-theme.css` 重写 admonition、details、tabbed：去底去框，type 色只落在左侧短竖线、图标和箭头上；hover 时竖线拉长到全文底部；选项卡左侧加竖线和 1px 引导线。ac9daa4[^commit-9] 63bd3a6[^commit-8]

### 2026-09-01 · 三线表与 mermaid 手绘卡片 {: data-kind="前端" }

> 帮我看一下zensical中，能不能修改mermaid图的css样式……现在本wiki的表格不好看，能也参考其他css优化一下吗（08-31）

`zx-theme.css`：表格改 booktabs 三线表，窄表整体居中。mermaid 的 SVG 在 closed shadow root 里，外部 CSS 进不去，只能把宿主容器裹成手绘卡片。8394579[^commit-8394579]

### 2026-09-01 · 全站换 Maple Mono，中文自建子集 {: data-kind="前端 + 流水线" }

> 我发现vscode里的字体更圆润，读起来更舒服，我这里是否也能惰性加载一个字体呢？（08-25）帮我把本wiki的字体改成 maple-font

正文和代码用同一个等宽字族。拉丁字形用官方 woff2，中文由 `scripts/build-fonts.py` 按 GB2312 加本站用字子集化。同日补了三处漏网（中文字重描述符、`--zx-serif` 求值失败、ECharts 内联字体），汉字字身框从 1200 压回 1000。4d58ba3[^commit-12] 58a8b8c[^commit-11] 8556c17[^commit-10]

### 2026-09-04 · 网页上直接运行 JS 代码块 {: data-kind="前端" }

> 能不能实现代码写入在前端展示之后，可以直接在网页上运行？……没必要提供代码编辑功能，能直接运行即可……运行按钮只有hover上去才显示（09-03）

代码块写成 ```` ```{.js .run} ````，`vendor/js-runner.js` 找到这类块，在 Worker 沙箱里执行并接一个输出面板；运行按钮放进代码框右上角，hover 才出现。b93e43c[^commit-13]

详见[写作规范 · 可运行 JS 代码块](../../skills/wiki-guide/reference/components.md#js-run)。

### 2026-09-04 · 冲突标记出题与归档闸门 {: data-kind="配置 + 前端 + 流水线" }

> 新建一个和 skills notes 并排的顶级层级，叫做「课程」……要用和git一样的冲突标记提问，只有我手动回答了一个又一个的问题，证明我是真的去运行了代码，然后才能add到 notes 的同名目录

`superfences` 加 `conflict` fence，`vendor/conflict-init.js` 把它染成上问下答两半；`scripts/course.py` 管领题、看进度、归档，题没答完不让归档；`check-links.py` 加一项：`notes/` 里不许出现冲突标记。b93e43c[^commit-13] 70abb8b[^commit-14]

详见[课程是怎么设计的](../../courses/index.md)。

### 2026-09-04 · 一轮体检：线上零 CDN、堵 .venv 漏口、资源死链 {: data-kind="前端 + 流水线" }

> 帮我检查我当前的wiki仓库，寻找有没有问题或者优化空间（可能是zensical配置本身的问题，也可能是写作的问题，也可能是架构层等等等）

vendor 补上 Chart.js，线上不再走任何 CDN；MathJax 改成按需加载。`deploy.sh` 的 md 镜像加 `--exclude='.*/'`，堵住 assets 里残留的 `.venv` 跟着上桶。`check-links.py` 加资源死链检查。新增 `robots.txt`，全站开放抓取并指向 sitemap。1019e19[^commit-16] 1cca22e[^commit-15]

### 2026-09-18 · 升到 zensical 0.0.62：meta 与 redirects {: data-kind="配置" }

> 看本仓库用的 zensical 版本，然后比较一下 zensical的最近更新……看有没有什么新功能可以用？（09-14）

`plugins` 接上 `meta`：目录里放 `.meta.yml`，给上游原文、snippet 真身这类不能加 frontmatter 的文件补 description。接上 `redirects`：挪文件不留存根页，写一行旧路径到新路径。08-12 因为并行竞态误报而关掉的 `invalid_links` 校验改回 `warn`。d73ce14[^commit-17]

详见[写作规范 · 不能动的文件：目录级 .meta.yml](../../skills/wiki-guide/index.md#meta-yml)。

### 2026-09-29 · 图文并排与长文本换行 {: data-kind="配置 + 前端" }

> 这种引用"生成一张……"为什么是一行，我需要手动拖左右滚轮。能够不被折叠吗？（09-28）

图文左右并排用官方 `md_in_html` 写 `<div class="gallery-pair" markdown>`，样式在 `zx-theme.css`。长 prompt 换行：`overrides/main.html` 按 URL 前缀只给 `gallery/images/` 的 text 块开自动换行，别处 text 块里的目录树、ASCII 图不受影响；其他页面需要时手写 `{.text .wrap}`。478436c[^commit-18]

### 2026-10-01 · age 打码 {: data-kind="配置 + 前端 + 流水线" }

> 本wiki中有很多小文字需要加密，比如我的服务器id，能在前端中做简单的马赛克吗？……自动被转换成一段马赛克，解锁后才恢复。zensical有类似的插件吗？或者 mkdocs有吗

`scripts/age-seal.sh` 用 wiki 公钥加密，源文件里写 `` `age:…` `` 小字或 ```` ```age ```` 块（superfences 新增 `age` fence）。`vendor/age-init.js` 在浏览器里打码、解锁后还原，按需加载 `vendor/age-core.js`（口令和 X25519 私钥两种模式）。encryptcontent 这类插件只加密 HTML，`.md` 镜像照样是明文，所以不用。0885e62[^commit-19]

详见[打码：key 和小字都以密文写进 wiki](age-mosaic.md)。

### 2026-10-10 · navigation.prune：改 nav 不再全站重传 {: data-kind="配置" }

> 我发现本wiki 每次 deploy 如果有修改目录，就需要依次上传所有文件，相当于重新上传，非常非常慢。这是正常的吗？

官方 `theme.features` 加 `navigation.prune`，每页只渲染看得见的导航项。原来整棵导航（800 多篇）嵌进每一页，占页面体积的 94%，改一个 nav 标题就有 1024 个 HTML 变化、重传约 400MB；开了之后只变 18 个，HTML 总量从 447MB 降到 65MB。代价是侧栏里别的分区不能就地展开。2026-10-17 补：这只对改标题成立，增删条目时剪掉的导航项留下的空白会挪位，照样波及全站，见下面 minify 那条。

### 2026-10-14 · 时间线组件 {: data-kind="前端" }

> 我希望这个时间线是真的从上往下一条线，相当于有特殊的css效果，基本完全不受渲染的影响，是否可以通过特殊的插件实现？（比如写作的时候用特殊的html标记啥的）

不用插件。官方 `md_in_html` 写 `<div class="zx-timeline" markdown>` 包住条目，`zx-theme.css` 第 10 节画线：竖线挂在容器的 `::before` 上、贯穿整个容器，条目只是 h3 前的一个方块，条目里放什么都不会把线打断，也不靠 JS。分类用 `attr_list` 写在标题上 `{: data-kind="…" }`，渲染成角标；纯官方配置的方块空心，涉及自写代码的填荧光绿。AI 读 `.md` 源看到的仍是普通 markdown，只多一对 div。

详见[写作规范 · 时间线](../../skills/wiki-guide/reference/components.md#timeline)。

### 2026-10-15 · 时间线正序 / 倒序切换（当天撤回） {: data-kind="前端" }

> 对了对整个时间线块，增加一个功能，允许切换倒序/正序

加：`vendor/timeline-init.js` 挂进全站的 `extra_javascript`，在时间线上方插一个「从旧到新 / 从新到旧」两段式按钮。源文件里条目是平铺的兄弟节点，脚本把「一个 h3 到下一个 h3 之前」认作一条，整条整条地反向重排 DOM，同时反转右侧目录里的条目，选择记在 localStorage。上线时每页 HTML 都多了一行 `<script>`，全站 1027 个文件重传。

> 每个页面的 HTML 都多了一行 `<script>`。你评估一下这个开发成本呢？我发现还会动到目录，比我想象中一个独立的模块大很多，但是可能只有这一个地方会用。……确实需要回撤这个更改，成本太高了，太揉杂了

撤：删掉 `timeline-init.js`、`extra_javascript` 那一行、按钮样式和写作规范里的说明，顺序固定为从旧到新。撤的理由：一页用的功能挂在全站；反转目录要依赖 Zensical 目录的内部 DOM，升级会悄悄坏；倒序还会让正文里「下面」「后来」这些话说反。另外两种做法也评估过、没做：md 照写、部署时预处理成独立的 HTML 块，会让本地 `zensical serve` 预览和线上不一致，目录和措辞的问题也还在；用选项卡把两种顺序各写一份，是零代码，但每条要写两处，AI 读到两遍，目录里的条目也会重复。

### 2026-10-15 · 评估官方 llmstxt 插件与自研复制按钮 {: data-kind="配置 + 前端" }

> 等等，现在支持我继续使用这个官方插件的理由是什么？就是这个复制按钮吗？我们能自己实现这个复制按钮吗？我还是不想要 md 渲染 md 这一步（md到html到md），因为现在我连原始的md都是ai来写，这个是必然趋势，所以完全不存在AI不能读这个问题

**不走 md → HTML → md 路线：AI 能写 md，就能读 md，忠实发布源文件就够了；官方 `llmstxt` 插件对本站的价值只剩复制按钮，于是自己做。** Zensical 0.0.67 起的这个插件把页面渲染成 HTML 再转回 Markdown，实测丢图片、iframe、选项卡标签、frontmatter，snippet 一律展开，复制按钮还和它绑死。自研的两样：`repo_url`、`edit_uri` 设成站点根，`page.edit_url` 就是源文件地址，写进页头的 `alternate` 发现链接；`vendor/md-copy.js` 在右上角放按钮，复制源文件本身，相对链接和 `--8<--` 改成线上绝对地址。只升级 Zensical 版本、不写进 `plugins`，碰不到这个插件。

详见[复制本页 Markdown 源](md-copy.md)，实测细节见[Zensical 升级评估 · llmstxt](zensical-upgrade/index.md#llmstxt)。

### 2026-10-15 · 命令行一口气解开打码 {: data-kind="流水线" }

> 我还希望写一个解密markdown的脚本，这样客户端调用的时候 curl xxx.md | 解密脚本 密码123 可以一口气解密出来

`scripts/age-open.py`（PEP 723 单文件，依赖 pyrage）软链进 `posts/wiki/assets/`，客户端 `curl …md | uv run <脚本网址>` 整页解开：小字解开后留在反引号里，`age` 块变普通代码块，官方插件导出的版本也认。口令没按原想法做成命令行参数——参数会进 shell 历史、`ps` 和 AI 的对话记录——改成按顺序找私钥文件 `WIKI_AGE_KEY_FILE`、环境变量 `WIKI_AGE_PASS`、终端提示输入。口令模式运行时去站上取 `age-init.js` 里的 `WIKI_KEY_AGE`，钥匙仍只有一处真身。

详见[打码 · 命令行里一口气解开](age-mosaic.md#cli)。

### 2026-10-15 · 复制按钮只给正文：去掉 frontmatter、注释和维护记录 {: data-kind="前端 + 流水线" }

> frontmatter是SKILL.md的压缩，因为人复制的是完整 SKILL.md 所以frontmatter其实就不重要了

> `<!-- 来源：…/skills/collab/grilling/index.md -->` 这个暂时也不想要

> 是不是可以由复制按钮来屏蔽掉最末尾的开发注释了，这个开发注释还是有用的，特别是开发环境
>
> 不对，读者也要可以看得到维护记录，不需要屏蔽，只是复制的时候隐藏
>
> 不能够只有一个分割线，因为后面可能还有引用啥的。感觉得做成一个html块包裹起来？

`vendor/md-copy.js` 复制时去掉 frontmatter，也不再插 `<!-- 来源：… -->` 注释；此前 frontmatter 原样保留、来源注释插在它后面。另外两条：`<div class="zx-no-copy" markdown>` 包起来的块整块不复制，维护记录写在里面，网页上照常显示、读 `.md` 源的 AI 也看得到，只是不进对话框（先做过一行截止标记，因为切不掉中间段、会把后面的脚注一起切掉，改成了块）；代码以外的 HTML 注释去掉。全站生效，`.md` 源文件和镜像不变。起因是 skill 页要能直接粘进对话框当 prompt，`name`、`description` 是给自动触发和站点用的，页尾那行维护记录粘进去会被 AI 当成在说正在讨论的方案。

> 子文档可能反过来引用主文档，这样AI可能反跳回去，又重新读一遍一开始复制进来的文档

> 有些时候只是想简单复制一段文本，AI压根不知道你在复制

> 我的想法核心是如果能理清楚规则，那么就可以自动推断是否加入后缀

> 我觉得只需要考虑向下走，理论上不会出现向上这种情况，因为一定是高级封装引用低级底层能力。

> 我觉得需要加上一句说明：如果后续文章引用本文，禁止重复打开 之类的意思。

10-20 补：来源加回一半，只给子页会链回的目录入口。目录下有页面链回入口的（子页写 `见[入口 · 用法](../index.md#usage)` 这类），入口 frontmatter 写 `copy_source: true`，`vendor/md-copy.js` 复制时在末尾加一行「本文源地址：」加本页 `.md` 的线上地址：读者把入口贴给 AI，AI 读到子页、看到链回来的地址，认得出就是开头贴进来的那篇，不用再抓一遍。该不该写由 `scripts/check-links.py` 新增的第 6 项算，该写没写、不该写写了都拦部署，当天全站 17 个入口写上。没做成「有链接就加」：57 个 skill 入口有 55 个带站内链接，等于全加，只想复制一段文字贴给不联网的 AI 时这行是噪音。按「入口内容多、有外链」判断也不准：hyperframes 的 20 个子 skill 内容多、链接多，回链为 0；`agent-io` 入口几乎全是链接表，子页却链回它。也不在复制时现抓子页判断，一个入口最多链了 103 篇。只管向下：子页链上级是去读共守的规矩，上级链回它只是菜单里的一行。地址下面再跟一句「上面就是这个地址的全文。之后读到的页面再链到这个地址（包括带 # 的小节链接），直接看上文对应的地方，不要重复打开。」：光给地址，AI 不一定想到要对号入座。

详见[复制本页 Markdown 源](md-copy.md)。

### 2026-10-16 · 死链检查跳过代码块 {: data-kind="流水线" }

> 看本文，收纳skill： https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs

`scripts/check-links.py` 的死链检查只看代码块和行内 code 之外的链接，剥离规则和资源死链检查共用一套；父级链接照旧认代码块里的链接。起因是收纳这个 skill：领域建模的 GLOSSARY.md 格式模板在代码块里举例 `[Ordering](./src/ordering/GLOSSARY.md)`，那是写进别人项目的路径。吸收来的 skill 原先原文照录、目录里有 `MIRROR.md`，这类死链降级成警告；改成中译收纳后没有 `MIRROR.md`，豁免注释又只管父级链接和 nav 注册，这份模板就会挡住部署。

详见[对象存储部署 · 闸门](cos-deploy/index.md#link-check)。

### 2026-10-16 · 复制按钮支持填空：正文里直接写 HTML 输入框 {: data-kind="前端" }

> 我还设计了一个format功能，本质上是使用jinja2一样的语法，用户点击复制按钮的时候，如果发现有变量，就变成一个输入框，需要先填写

> md里面写html的input方法，这样渲染的时候可以直接用，而且提示啊，可选啊什么的，就直接被渲染出来了，写作AI也写起来容易，不需要重新定义一套语法

> 写入一个变量，可能要多次使用，这个有办法解决吗？

> 能够给这几个组件加一个默认样式吗，现在裸html很丑呢

正文里手写的 `<input>`、`<textarea>`、`<select>` 当填空，读者在网页上就地填。`vendor/md-copy.js` 复制时把源文件里的标签换成填的值，下拉框取选中项的文字；空着的写成 `【placeholder】`；写了 `required` 的没填就不复制，用浏览器自带的气泡指过去。网页上第 n 个控件对应源文件代码以外第 n 个标签，数量对不上就报错、不复制。一个变量用几次，就把带同一个 `name` 的标签写几次，在一个框里填，别的同名框跟着变。`zx-theme.css` 第 11 节给控件配了站点样式：行内的单行框和下拉框画成纸上的填空横线，只留一条墨线，填过的铺荧光笔底；多行框是 1px 墨框，聚焦时右下一道荧光绿硬投影；框随内容伸缩，Firefox 退回定宽。没用最初想的 Jinja `{{ 变量 }}`：要另造一套语法，而且 `**粗体**{{ 变量 }}` 这种紧贴行内元素的写法会被 attr_list 静默吃成属性，构建不报错。[对话提示词](../../skills/collab/chat-prompts/index.md)的占位全部换成了输入框。

详见[自研组件 · 填空](../../skills/wiki-guide/reference/components.md#fill)。

### 2026-10-17 · 带脚本的 skill 部署时打整包 {: data-kind="流水线" }

> 客户端使用这个skill，是不是要先下载一些脚本？我在想deploy的时候进行一个打包，便于客户端下载，该如何设计

> 应该是在skill的index.md里面会写一个 xxx.tar.gz ，让客户端自己下载并解压就好

> 应该是仍然允许全部用远程的方式（用于简单调用），也支持压缩包（里面全部都是原始的相对路径）用于大型任务，远程客户端可以自己选择。

> 如果要调用2次以上本skill中的脚本，直接将`[本skill](xxx.tar.gz)`下载到本地。 相当于不光是tar.gz 而是要一句有指引，有链接才行，这样更准确

> 这种命令也不需要，别人ai自己会写，所以只会留下一句话

> 这句话不要放在用法里，显得就是引导别人下载一样，感觉放在开头第一段介绍里，而且默认是保持走网络请求

新增 `scripts/build-skill-bundles.py`，`deploy.sh` 在 md 源镜像之后调用：入口 `index.md` 写了标准那一行`如果要调用 2 次以上本 skill 中的脚本，直接将[本 skill](<目录名>.tar.gz)下载到本地。`，就把整个目录原样打成这个包（跳过点开头的文件、`__pycache__` 和 `.pyc`），放进 `site/` 的同一位置，上传时钉 `application/gzip`；链接了包却不是这一行，部署停住。包按路径排序、时间戳和属主固定，内容不变字节就不变，`-s` 跳过重传；只在 `site/` 和桶里，不进 git。远程和整包共用一套文档，只写相对路径，不讲根目录：先前入口页写过「根目录是…，相对路径拼上它」，subagent 实测照着把子 skill 的脚本拼到父目录下拿到 404，已删。命令不用 shell 变量，因为 Agent 每次执行命令都是新环境。入口页只在开头介绍段末尾写这一句，默认走网络请求，不单独成节；不附下载命令，客户端 AI 自己会写。HyperFrames 的 `MANIFEST.txt` 清单删掉，换成整包；B站视频笔记逐个下载脚本的循环删掉，换成首段那一句；新增 mock 抽象 skill [测试skill](../../maintenance/mock-bundle/index.md)对照。

详见[收纳 skill · 带脚本的 skill](../../skills/wiki-guide/skill.md#scripts)。

### 2026-10-17 · minify：增删 nav 条目不再波及全站 {: data-kind="配置" }

> 为什么现在改变nav就会全部重新上传所有内容？现在不是启用了一个 nav 公用的功能吗

> 第一种就是大问题，第二种一年都不会变吧？很少会新增板块？

> 好，开 minify 吧

`mkdocs.yml` 的 `plugins` 加官方 `minify`，开 `minify_html: true`。`navigation.prune` 只是不输出剪掉的导航项，模板给它们留下的空格和换行还在：增删一个 nav 条目，全站每页的空白都挪位、字节都变。实测把测试skill 从 Skills 挪进维护，1047 页变化、重传 67 MB；开了以后只剩 532 页、28 MB，全在 Skills 和维护 —— 这两个分区每页的侧栏都列着本分区第一层，挪走一条是真变化，prune 管不了。新收一个顶层 skill 仍要重传 Skills 下 512 页，其中 HyperFrames 占 326 页。HTML 总量 70 MB 降到 50 MB。压缩前后用 HTML 解析器逐页比对，页面文字、代码块文字、输入控件全部一致，代码块只是属性去了引号；开启后第一次部署整站 HTML 重传一次。

### 2026-10-17 · 整包声明不再限于入口 index.md {: data-kind="流水线" }

> 第二个skill没有实现通过关键词，让skill打包吗？

> 要拓展，但是我其实没搞懂为什么需要拓展，我想的本身就是拓展的版本，看需不需要重构，相当于gallery里面的skill也可以用这个功能

`scripts/build-skill-bundles.py` 原来只扫各目录的 `index.md`，打它自己所在的目录；Gallery 的单条收录放在 `collected/gallery-*.md`，不占 `index.md`，写了标准那一行也打不了包。改成扫全站页面：标准那一行的链接指向 `<目录>/<目录名>.tar.gz`，就把那个目录打成包、放在它里面，原来 `index.md` 的写法是其中的特例，原有 5 个包重跑逐字节不变。代码块和行内代码里写的不再算声明；报错从「`index.md` 链了自己的包却不是标准写法」放宽成「链了全站没人声明的包」，子页链上级的包照旧不报。链接在三条路上都对：zensical 会把非 `index.md` 页面里指向构建时还不存在的文件的相对链接也改写对，用最小工程实测过；复制按钮和 AI 读的 `.md` 源按 `.md` 的地址解析相对链接，是读代码确认的。`deploy.sh` 的注释、写作规范、`CLAUDE.md` 跟着改。

详见[收纳 skill · 带脚本的 skill](../../skills/wiki-guide/skill.md#scripts)。

### 2026-10-19 · 链路闸门补三处漏判 {: data-kind="流水线" }

> 帮我审核本仓库，现在是否有冲突或者优化，可能是wiki搭建方面，也可能是wiki内部的文档

> 先修复前12吧

`scripts/check-links.py` 跳过代码块改成逐行配对围栏，按 CommonMark 闭围栏不带 info string。原来的正则开头是 `\s*`，能吃掉换行，代码块前有空行时会一路吞过闭围栏，把后面的正文也当代码剥掉：31 个文件受影响，8 篇的正文链接没被检查。nav 注册只认 nav 段里的条目，原来拿路径在整个 `mkdocs.yml` 里找子串，redirects 和注释里出现过也算注册，142 页从 nav 删掉照样通过。资源死链检查纳入指向非 `.md` 本地文件的 markdown 链接（`[文字](x.py)`），此前没有任何一道检查管，当场查出本页两处举例写成了真链接，改成行内代码；skill 整包部署时才生成，目录在就算存在，有没有声明仍归 `build-skill-bundles.py` 拦。笔记未答题检查也跳过代码块，git 笔记里贴冲突示例不会误拦部署。

详见[对象存储部署 · 闸门](cos-deploy/index.md#link-check)。

### 2026-10-19 · 复制按钮：只引几行的 snippet 地址指对 {: data-kind="前端" }

> 先修复前12吧

`vendor/md-copy.js` 改写 `--8<-- "x.py:31:36"` 这类只引几行或一段的 snippet：先剥掉 `:31:36`、`:name` 再去站上探，地址只留文件，范围写成「（第 31–36 行）」跟在后面。原来整串拿去探，站上必然没有，落到 GitHub 一个既缺 `docs/` 又带 `:31:36` 的地址。

详见[复制本页 Markdown 源](md-copy.md)。

### 2026-10-19 · 复制按钮支持分支：读者的选择决定哪段进对话框 {: data-kind="前端" }

> 能否实现根据选择，是否隐藏掉不需要的内容？现在一大段内容都是只有需要探索才看的。

> 如果选到了否，隐藏内容不要真的隐藏，只是加一个css效果，表现出不会被复制按钮复制进去即可

> 如果全部用 zx-no-copy 来控制呢，这样可以直接看出哪些部分对AI隐藏。 data-when 也通过 zx-no-copy 间接控制可见性

`<div data-when="名=值" markdown>` 包起来的内容，名为「名」的控件选了「值」才复制；只写「名」就是那个框填了才复制。`vendor/md-copy.js` 打开页面和每次填写时算一遍条件，不成立的块挂上 `zx-no-copy`，网页上和写死的那种一个样子；复制时拿源文件里的条件用同一个函数再算一遍，不成立的整块去掉，成立的只去掉外壳 div，不复制的块里的 `required` 不拦。起初复制时是按顺序去网页上查哪个块挂了 class，多一种「对不上就报错」的失败，换成直接算，结果逐字节一样，少 12 行。`zx-theme.css` 新增第 12 节：`zx-no-copy` 块左边一道虚线、上方一个「不复制」小字，没选中的分支另外变淡。不藏起来，是为了让读者看了分支内容再选，脚本出错时内容也照常可读。原有 17 个页尾维护记录块跟着有了这个样子。什么时候才值得分支、模板能力的上限，单开一篇写作规范的引用，只有写 prompt 分支时才读；[粗讲项目](../../skills/collab/chat-prompts/project-gist.md)改成新写法当活例。

详见[分支](../../skills/wiki-guide/reference/branch.md)。

</div>

[^commit]: [edb03a6](https://github.com/liuhetian/wiki/commit/edb03a6)，2026-10-15 读。
[^commit-2]: [b0a5d3e](https://github.com/liuhetian/wiki/commit/b0a5d3e)，2026-10-15 读。
[^commit-3]: [807e762](https://github.com/liuhetian/wiki/commit/807e762)，2026-10-15 读。
[^commit-4]: [521b0b1](https://github.com/liuhetian/wiki/commit/521b0b1)，2026-10-15 读。
[^commit-5]: [c39a3cf](https://github.com/liuhetian/wiki/commit/c39a3cf)，2026-10-15 读。
[^commit-6]: [3eb7118](https://github.com/liuhetian/wiki/commit/3eb7118)，2026-10-15 读。
[^commit-7]: [d8f6124](https://github.com/liuhetian/wiki/commit/d8f6124)，2026-10-15 读。
[^commit-9]: [ac9daa4](https://github.com/liuhetian/wiki/commit/ac9daa4)，2026-10-15 读。
[^commit-8]: [63bd3a6](https://github.com/liuhetian/wiki/commit/63bd3a6)，2026-10-15 读。
[^commit-8394579]: [8394579](https://github.com/liuhetian/wiki/commit/8394579)，2026-10-15 读。
[^commit-12]: [4d58ba3](https://github.com/liuhetian/wiki/commit/4d58ba3)，2026-10-15 读。
[^commit-11]: [58a8b8c](https://github.com/liuhetian/wiki/commit/58a8b8c)，2026-10-15 读。
[^commit-10]: [8556c17](https://github.com/liuhetian/wiki/commit/8556c17)，2026-10-15 读。
[^commit-13]: [b93e43c](https://github.com/liuhetian/wiki/commit/b93e43c)，2026-10-15 读。
[^commit-14]: [70abb8b](https://github.com/liuhetian/wiki/commit/70abb8b)，2026-10-15 读。
[^commit-16]: [1019e19](https://github.com/liuhetian/wiki/commit/1019e19)，2026-10-15 读。
[^commit-15]: [1cca22e](https://github.com/liuhetian/wiki/commit/1cca22e)，2026-10-15 读。
[^commit-17]: [d73ce14](https://github.com/liuhetian/wiki/commit/d73ce14)，2026-10-15 读。
[^commit-18]: [478436c](https://github.com/liuhetian/wiki/commit/478436c)，2026-10-15 读。
[^commit-19]: [0885e62](https://github.com/liuhetian/wiki/commit/0885e62)，2026-10-15 读。
