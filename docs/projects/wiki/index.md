---
description: "这个 wiki 自己的事：目标与计划、怎么当远程 skill 用、板块怎么分和东西为什么这样收、用到的技术一项一页（对象存储部署与双产物、自建 git-lfs 后端、打码），文末能力时间线按日期列出在 Zensical 之上加过的每项功能，每条写问题、一句话方案和当时的需求原话"
copy_source: true
---

# wiki 介绍

这个 wiki 自己的事都在这里：往哪去、怎么用、板块怎么分工、靠哪些技术搭起来。写作时怎么用这些机制是写作规矩，在[写作规范](../../skills/wiki-guide/index.md)里。按时间看所有功能是怎么一项项加上来的，见文末的[能力时间线](#timeline)。

## 目标与用法 { #about }

- [本 wiki 的目标与计划](roadmap.md) —— 2026-09-29 的审核：专业主干只到本科应用统计，要补数理统计与计算、计量、机器学习、深度学习四块；吸纳教材只留地图、压缩、手迹、连线四样，要记的科目按依赖排好、一科一本书，文末进度表做一项划一项
- [把 wiki 当远程 skill](everything-skill.md) —— skill 要人能读能改，所以吸纳别人的 skill 要翻译；frontmatter 可丢，脚本部署前打包；插件里「告诉模型怎么做」的一半能换成 skill，「Claude Code 自己执行」的 hooks、mod 换不了。由此衍生出 [skill 收纳方案](../../skills/collect/skill.md)
- [新机器初始化自检](init-check.md) —— 从 clone 到能推送的五条链路：依赖与构建、链路闸门、LFS 真身、COS 凭证、GitHub 推送；各自怎么验、失败时先看哪里

## 板块分工 { #sections }

- [板块怎么分](sections.md) —— 板块按一根从通用到具体的轴排：笔记（一门学问）、Gallery（通用到不用提问题就能挑）、文章（一个通用问题，几种方案）、项目（一个具体的东西，概要讲是什么、粗讲按功能展示机制与实例、细讲沿问题拆源码和验证）；Skills 是轴的背面，每一层给 AI 照着做的影子；轴外是收藏夹（外面的入口，只存链接）和维护（背后的记录）；来源不算数

顶栏七个板块：文章、项目、笔记、Gallery、Skills、收藏夹、维护，主题只在板块里分二级目录。

### 东西为什么这样收 { #collect-why }

- **只存经手过的，别人已有的指过去**：上游、AI、书里已经有，换个人写也一样的，不写 —— 有上游仓库的效果只放一个 demo 加一句仓库地址。照收的是要在这里看见或跑起来的东西：图和视频原件、demo 要的运行文件、吸纳来的 skill
- **页面只写怎么用，来历集中记一处**：来源、commit、改动写进维护，只写一次，正文不考据版本
- **只写现状和主线**：不写历史、旧形态、作者心路、小 bug
- **入口归入口，内容归内容**：`index.md` 当索引，内容页不占；AI 顺着祖先索引页的相对链接往下读，nav 只给人看
- **不侵入，不托管重东西**：mod、MCP 不收，重的流水线让客户端装上游
- **收多深、侧重什么只有收的人知道**：所以先分诊，交一段交接 prompt 给人改，不直接动手；没说就按最浅收 —— 浅了再加一层便宜，深了再删是白花工夫

照这些规律给一样东西分诊的是 skill [收纳](../../skills/collect/index.md)：正面（轴上四层，人和 AI 都读）和背面（skill，给 AI 照着做）分开判，一个来源可以两面都收；只定每一面用哪个 skill 收、收到哪、收多深，交出交接 prompt，具体怎么收由各个收纳 skill 管。

## 用到的技术 { #tech }

一项技术一页。每页讲清楚这项技术是什么、为什么这么选、换到别的站要改哪里。

- [用对象存储部署 AI 友好的个人知识库](cos-deploy/index.md) —— 总纲：什么算对 AI 友好、同一份 markdown 双发布、为什么是对象存储而不是服务器；附[部署实操手册](cos-deploy/reference/deploy.md)
- [用自己的对象存储做 git-lfs 后端](git-lfs.md) —— standalone custom transfer agent：140 行脚本替掉整个 LFS 服务，协议、坑和换存储的改法
- [打码：key 和小字都以密文写进 wiki](age-mosaic.md) —— API key、服务器地址用 age 公钥加密后写进 markdown，浏览器里显示成马赛克，解锁后还原；六种存法的比较、对称与非对称加密、scrypt 为什么撑得住短口令，以及 encryptcontent 这类插件为什么在本站会漏
- [COS 静态站全站上锁：绕了三圈，最后用 EdgeOne 边缘函数](static-site-lock.md) —— COS 静态站全站上锁、人和 AI 都好进：前端加密、Caddy 302、桶半开放各卡在哪，最后用 EdgeOne Makers 边缘函数验密码、签名读私有 COS —— 浏览器记 30 天登录，AI 带请求头；额度用完打不开但不漏
- [复制本页 Markdown 源：不用官方插件，自己做](md-copy.md) —— 右上角复制按钮和页头发现链接：为什么不用官方 llmstxt 插件、借 `page.edit_url` 拿源文件地址、复制时相对链接怎么改成线上绝对地址
- [子 wiki：项目自带文档，主 wiki 来收](subwiki.md) —— 自己开发的项目各带一份 wiki，本 wiki 当主 wiki 把它们收进项目板块：文档跟代码走、人读 HTML 而 AI 读 .md、文档里的实时数据浏览器和服务端各替换一次；主 wiki 没有后端所以 .md 不替换，nav 不自动生成而由 agent 手动吸纳

Zensical 本身跟到哪个版本、新版本升不升级，记在维护的[Zensical 升级评估](../../maintenance/zensical-upgrade/index.md)。

还没单独成篇的：`check-links.py` 这道闸门（现在写在总纲的[闸门一节](cos-deploy/index.md#link-check)）、vendor 本地化与按需加载、中文字体子集化。哪项值得单独讲了再拆出来。

## 能力时间线 { #timeline }

上面是单独成篇的技术；这里按落地日期从上往下，列出在 Zensical 之上加过的每一项功能。标题是日期和功能名，下面三样：**问题**是当时卡在哪、要什么，**方案**一句话说怎么解的，引用块是我当时提需求的原话（取自和 AI 的对话记录，只做删节）。具体改了哪些文件、实测数字、没选的做法收在折叠的「改了哪里」里，有专文的条目末尾带「详见」。

标题旁的分类：**配置**是只动 `mkdocs.yml` 的官方能力，**前端**是自己写的 CSS、JS、模板，**流水线**是 `deploy.sh` 和 `scripts/` 里的脚本。只记功能，不记内容：新增文章、分区、收录的资料不算，只为某一批内容服务的脚本（比如 LeetCode 笔记的校验、手绘风格库的页面生成器）也不算。只收做成了的，以及实测后决定不用的官方功能（写清不用的理由）；只是讨论过、没动手的（比如上 CDN）不收；做了又撤掉的照记，撤回写进当初加它的那一条，标题注明。以后每加一项功能，在末尾追加一条，写法见[写作规范 · 时间线](../../skills/wiki-guide/reference/components.md#timeline)。

<div class="zx-timeline" markdown>

### 2026-06 · 上线：Zensical 构建，对象存储直出 {: data-kind="配置 + 流水线" }

**问题**：想有个自己放笔记的地方，能公开访问。

**方案**：Zensical 构建成静态文件，`deploy.sh` 同步进 COS 桶，域名直接解析到桶。

> 有个自己的地方放笔记，能公开访问就行。

??? note "改了哪里"

    这一条早于对话记录，引用是当时建站手记里的话。`zensical build` 出静态文件，`deploy.sh` 用 coscmd 同步进 COS 桶，自定义域名直接解析到 COS，服务器不在请求链路上。`deploy-cert/` 用 acme.sh 走 DNSPod 验证、把证书推到 COS，HTTPS 自动续期。官方配置起步：`navigation.tabs`、`navigation.indexes`、`content.code.copy`、`content.code.annotate`，以及 admonition、details、tabbed、superfences 这些官方扩展。

详见[部署实操手册](cos-deploy/reference/deploy.md)：建桶、绑域名、HTTPS 自动续期。

### 2026-06-30 · 线上同时发布 .md 源 {: data-kind="流水线" }

**问题**：线上只有 HTML，AI 想读写作时的 markdown 源却拿不到。

**方案**：`deploy.sh` 用一行 rsync 把 `docs/` 的 `.md` 树镜像进 `site/`，`/x/` 给人、`/x.md` 给 AI，同域各取一份。

> 如果直接手动把docs里面的md复制到site里，会不会直接就借用这个功能？从而实现保留源md文件的效果？试试呢？

??? note "改了哪里"

    `deploy.sh` 加一行 rsync，把 `docs/` 的 `.md` 树原样镜像进 `site/`。`use_directory_urls` 让页面占 `/x/index.html`，`/x.md` 正好空着，人和 AI 同域各取一份。`.md` 上传时钉 `text/markdown`，不然 COS 给 octet-stream，浏览器直接下载。同一天把 `pymdownx.snippets` 的 `base_path` 改成 `docs` 和项目根两级，引用路径不再带 `docs/` 前缀 ——「我担心把index.md 给到大模型，大模型看到两种前缀，导致不知道怎么拼接」。

详见[对象存储部署 · 设计](cos-deploy/index.md#设计)：一颗语法糖、两个约定。

### 2026-07-01 · 一文一目录，代码真身软链进 assets {: data-kind="配置 + 流水线" }

**问题**：文章里讲到的脚本、配置要让 AI 顺 URL 取到真身，又不想让 deploy 多做复制以外的事。

**方案**：一篇文章一个目录，`assets/` 里放软链指向仓库里在跑的文件，正文用 snippet 引同一份。

> 我还是希望软连接，让deploy轻量一点（本质只做copy md和build两件事）

??? note "改了哪里"

    文章从单个 `.md` 变成 `index.md` + `assets/`。`assets/` 里放软链，指向仓库里真正在跑的文件（`deploy.sh`、`mkdocs.yml` 等），正文用 `--8<--` snippet 引用同一份，构建后软链变成实体文件随站发布，AI 顺 URL 能取到真身。07-02 定成标准 skill 布局：「继续使用symlink方案，并且使用 cos-wiki-deploy 这个目录（也就是标准的skill布局）」。

详见[对象存储部署 · 设计](cos-deploy/index.md#设计)：代码即引用，真身可远程取。

### 2026-07-07 · iframe 嵌交互 demo，运行时进 vendor {: data-kind="前端" }

**问题**：很多内容要靠前端单页展示，想直接嵌进 wiki 页面里。

**方案**：demo 写成自包含的静态单页放进 `assets/`，iframe 同域嵌入，React + htm 放进 `vendor/` 免编译。

> 我想的未来有很多都是需要借助前端进行展示的，大概是单页界面。能不能 zensical 部署，然后自己通过iframe引用这个单页界面的url进来？

??? note "改了哪里"

    demo 写成自包含的静态单页，放进各自的 `assets/`，正文用 iframe 同域嵌入。React 18 UMD + `htm` 放进 `docs/vendor/`，不用 JSX 编译、不走 CDN。demo 逻辑不压缩，AI 读同一 URL 下的源码。

详见[写作规范 · 嵌入交互单页](../../skills/wiki-guide/reference/components.md#iframe-demo)。

### 2026-07-09 · llms.txt {: data-kind="流水线" }

**问题**：按 llms.txt 惯例，AI 会先到站点根找一份导读，不想为它另外维护一份。

**方案**：构建时把首页 `index.md` 复制成 `llms.txt`，首页按 llms.txt 规范写。

> 我决定了，就 build 的时候直接cp成 llms.txt，然后我写作的时候会照顾两边。

??? note "改了哪里"

    `deploy.sh` 把构建后的 `site/index.md` 复制成 `site/llms.txt`，首页按 llms.txt 规范写（H1 + 引用块 + H2）。08-12 首页有了开屏 frontmatter 之后，改成剥掉 frontmatter 和开头注释再落盘。

详见[对象存储部署 · 和 llms.txt 的对比](cos-deploy/index.md#llmstxt)。

### 2026-07-11 · 数学公式 {: data-kind="配置 + 前端" }

**问题**：开始写概率、机器学习笔记，页面要能显示公式。

**方案**：官方 `arithmatex` 配本地 MathJax，页面里有公式才加载。

> 我想增加内容，放一些算法问题，机器学习的模型理解，深度模型的模型理解啥的，相当于个人笔记……比如第一个问题：12枚硬币……

??? note "改了哪里"

    没有单独提公式的需求，是随第一篇概率笔记一起加的，日期按笔记推断。官方 `pymdownx.arithmatex`（generic 模式）配本地 MathJax 3 真身，配置写在 `vendor/mathjax-init.js`。09-04 改成按需加载：页面里有 `.arithmatex` 才去拉 2MB 的真身。

### 2026-07-11 · echarts 代码块：图表写在 markdown 里 {: data-kind="配置 + 前端" }

**问题**：想在页面里放桑基图这类图表，单独做一个 HTML 再嵌进来又很别扭。

**方案**：加一种 `echarts` 代码块，块里直接写 option JSON，页面有这种块才加载 ECharts。

> 帮我加一个桑基图……zensical 是否支持嵌入echarts或者其他的html图表？……感觉把图表单独放在一个html里感觉怪怪的

??? note "改了哪里"

    `superfences` 加一个 `echarts` 自定义 fence，块里直接写 ECharts 的 option JSON。`vendor/echarts-init.js` 查到这类块才动态加载 ECharts 真身渲染，没图的页面零开销。

### 2026-07-19 · 二进制赶出 git，第一次重置历史 {: data-kind="流水线" }

**问题**：图片资源没进 git、没有备份，二进制又不想塞进 git；想另找个 COS 存着，用脚本复原。

**方案**：媒体用脚本备份进独立的备份桶，第三方库按版本从 CDN 拉回，git 历史重置成只有文本。

> 我的当前wiki中，图片资源是不是没有放入git的……我在想把这部分资源额外找个cos存储，这样可以用一个脚本复原。

??? note "改了哪里"

    `scripts/backup-media.sh` 把媒体备份到独立的备份桶，只增不删；MathJax、ECharts 这类第三方真身由 `scripts/fetch-vendor.sh` 钉版本从 CDN 拉回。git 历史重置成一个 commit。九天后被下面的 mini LFS 取代。

### 2026-07-26 · 部署前先 git pull --ff-only {: data-kind="流水线" }

**问题**：在副机写作、主机部署，主机部署前得先拿到副机 push 的内容。

**方案**：`deploy.sh` 第一步 `git pull --ff-only`，拉不干净就停住。

> 也就是说本机的deploy.sh 进行一个pull对吧。加上吧。

??? note "改了哪里"

    为了在副机写作、主机部署：`deploy.sh` 第一步 `git pull --ff-only` 收编副机 push 的内容，本地有未推提交或冲突就停住，不静默合并。

详见[部署实操手册 · 日常写作流](cos-deploy/reference/deploy.md#写作流)。

### 2026-07-28 · 自制 mini LFS，第二次重置历史 {: data-kind="流水线" }

**问题**：媒体靠单独的脚本备份和复原，跟 git 的版本是两套；想让媒体跟着 git 走，存储仍用自己的 COS。

**方案**：写一个 git-lfs 的 custom transfer agent，blob 按 sha256 存进备份桶，`git push`、`pull` 自动收发。

> 现在用cos来备份图像资源和重建，所以我的问题是能不能自己实现一个mini的lfs 服务？

??? note "改了哪里"

    `scripts/lfs-cos-agent.py`（git-lfs 的 standalone custom transfer agent，约 140 行）把 blob 按 sha256 存进备份桶的 `lfs/` 前缀；`.gitattributes` 把图、视频、字体和 vendor 真身交给 LFS；`scripts/setup-lfs.sh` 给新 clone 接入。vendor 也进 LFS：「这种产物因为不是我们自己维护的代码，也应该一起丢lfs」，`fetch-vendor.sh` 降级成升级工具。git 历史再次重置，就是现在的第一个 commit。

详见[用自己的对象存储做 git-lfs 后端](git-lfs.md)。

### 2026-07-30 · AI 链路闸门 check-links.py {: data-kind="流水线" }

**问题**：AI 只能顺索引页的相对链接找到页面，漏挂一页、写坏一个链接，AI 那边就断了，没人发现。

**方案**：`check-links.py` 查父级挂载、死链和 nav 注册，`deploy.sh` 构建前先跑，不过就停。

> （这条没留下对话记录，提交说明是 "Enforce AI link-path integrity at deploy time"）

??? note "改了哪里"

    `scripts/check-links.py` 查三项：每篇都被某个祖先索引页直接链到、没有死链、注册进了 nav。`deploy.sh` 在读凭证和构建之前先跑它，非零退出就中止部署。09-04 又加两项：笔记里不许有未答的课程题、图片和 demo 等非 `.md` 资源不许死链。

详见[对象存储部署 · 闸门](cos-deploy/index.md#link-check)。

### 2026-08-08 · 代码源文件钉文本类型 {: data-kind="流水线" }

**问题**：COS 按扩展名猜类型，`.ts`、`.py` 这类源码被标成视频或二进制，AI 抓取工具直接拒收。

**方案**：`deploy.sh` 给这些扩展名单独上传，钉 `text/plain`。

> 你 deploy 之后，派一个一个subagent 去读取，看看能不能读取到原始代码？（08-05）

??? note "改了哪里"

    COS 按扩展名猜类型，`.ts` 猜成 video/mp2t，`.tsx/.jsx/.mjs/.py` 猜成 octet-stream，AI 抓取工具直接拒收。`deploy.sh` 加一条带 `Content-Type: text/plain` 的上传。08-12 桶里错类型的旧对象修正完，这条改带 `-s`，没变的不再重传。清单后来陆续扩充：`.csv`（09-18，课程数据表）、`LICENSE`（09-29，10-23 随全站许可证文件一起撤回）、`.caddy` 和 `.conf`（10-01）、`.cjs`（10 月，HyperFrames 脚本）。

### 2026-08-12 · 开屏首页 {: data-kind="前端" }

**问题**：首页只是一页普通文档，想要一个铺满屏幕、介绍本 wiki 能给读者带来什么的 SaaS 风格开屏。

**方案**：`overrides/home.html` 做开屏模板，`index.md` 用 frontmatter 换上；正文不上屏，照样发布给 AI。

> 可以帮我做一个saas风格的开屏吗，内容多一点，介绍一下本wiki和能给读者带来什么……而且首页要铺满屏幕！（08-08）

??? note "改了哪里"

    `custom_dir: overrides` 加 `overrides/home.html` 和 `stylesheets/home.css`，`docs/index.md` 用 frontmatter `template: home.html` 换成开屏。正文不上屏，照样发布成 `/index.md` 和 `/llms.txt` 给 AI 读。

### 2026-08-14 · 字体本地化 {: data-kind="配置 + 前端" }

**问题**：开屏加载很慢，卡在去 Google Fonts 拉字体。

**方案**：关掉官方的字体引用，woff2 放进 `vendor/fonts/` 本地加载。

> 开屏的时候我发现加载很慢……这个是google字体导致的我这个打开慢吗？改为本地化吧，我看字体也就 1.8mb（08-13）

??? note "改了哪里"

    `theme.font: false` 关掉官方的 Google Fonts 引用；Inter 和 JetBrains Mono 的 woff2 放进 `vendor/fonts/`，`fonts.css` 挂进 `extra_css`。

### 2026-08-17 · 3D demo 运行时 {: data-kind="前端" }

**问题**：拆 Vercel Lanyard 的可拖拽 3D 工牌，demo 要 react-three-fiber 这一套，站内只有 UMD 版 React。

**方案**：`vendor/` 补上 React 的 ES module 版和 r3f、drei、rapier 等 3D 运行时。

> （这条没留下对话记录，是随 Vercel Lanyard 可拖拽 3D 工牌的拆解一起加的）

??? note "改了哪里"

    `vendor/` 增加 React 的 ES module 版、react-three-fiber、drei、rapier、meshline 和 `htm.module.js`，给 ES module 写法的 3D demo 用，同样走 LFS。

### 2026-08-25 · 全站皮肤对齐首页 {: data-kind="前端" }

**问题**：开屏是一种风格，内页还是默认主题，两边不像一个站。

**方案**：加令牌层、皮肤层两份 CSS，内页换成首页的颜色、字体和直角风格。

> 参考本wiki的首页风格，对整个仓库都改成相符合的风格如何？修改方法见文档：https://zensical.org/docs/customization/

??? note "改了哪里"

    两层 CSS 挂进 `extra_css`：`zx-tokens.css` 是令牌层，放 Atelier Zero 的颜色和字体变量并映射到 `--md-*`；`zx-theme.css` 是皮肤层，只写选择器，管直角、导航、标题、链接、列表、代码块。

### 2026-08-25 · mermaid 真身本地化 {: data-kind="前端" }

**问题**：Zensical 内置的 mermaid 加载器写死去 unpkg 拉，线上页面要出网。

**方案**：mermaid 收进 `vendor/`，只给含 mermaid 块的页面同步引入，内置加载器就不再出网。

> 要不也帮我自包含进去？这个mermaid的三方库

??? note "改了哪里"

    Zensical 内置的加载器在 `mermaid` 未定义时会去 unpkg 拉。`overrides/main.html` 只给含 mermaid 块的页面同步引入 `vendor/mermaid/`，内置加载器就不再出网；`fetch-vendor.sh` 记上它的版本。

### 2026-08-25 · 提示框、折叠块、选项卡一套语言 {: data-kind="前端" }

**问题**：折叠块太丑；选项卡左右切换时，分不清哪些内容属于当前选项。

**方案**：三种块统一成左侧竖线：类型色只落在竖线和图标上，选项卡用竖线圈出本选项的内容。

> 对于折叠卡，现在太丑了……颜色的话放在左边的竖线和 > 里。选项卡也实现左边竖线功能吧，这样左右切换选项卡可以知道哪些部分的内容是属于这个选项里才有的内容

??? note "改了哪里"

    `zx-theme.css` 重写 admonition、details、tabbed：去底去框，type 色只落在左侧短竖线、图标和箭头上；hover 时竖线拉长到全文底部；选项卡左侧加竖线和 1px 引导线。

### 2026-09-01 · 三线表与 mermaid 手绘卡片 {: data-kind="前端" }

**问题**：表格不好看；想改 mermaid 图的样式，外部 CSS 却进不去。

**方案**：表格改成学术三线表；mermaid 只能裹宿主容器，做成手绘卡片。

> 帮我看一下zensical中，能不能修改mermaid图的css样式……现在本wiki的表格不好看，能也参考其他css优化一下吗（08-31）

??? note "改了哪里"

    `zx-theme.css`：表格改 booktabs 三线表，窄表整体居中。mermaid 的 SVG 在 closed shadow root 里，外部 CSS 进不去，只能把宿主容器裹成手绘卡片。

### 2026-09-01 · 全站换 Maple Mono，中文自建子集 {: data-kind="前端 + 流水线" }

**问题**：想换成 VSCode 里那种更圆润的 Maple Mono，但中文字体整包太大。

**方案**：正文和代码统一用 Maple Mono，中文用脚本按 GB2312 加本站用字子集化。

> 我发现vscode里的字体更圆润，读起来更舒服，我这里是否也能惰性加载一个字体呢？（08-25）帮我把本wiki的字体改成 maple-font

??? note "改了哪里"

    正文和代码用同一个等宽字族。拉丁字形用官方 woff2，中文由 `scripts/build-fonts.py` 按 GB2312 加本站用字子集化。同日补了三处漏网（中文字重描述符、`--zx-serif` 求值失败、ECharts 内联字体），汉字字身框从 1200 压回 1000。

### 2026-09-04 · 网页上直接运行 JS 代码块 {: data-kind="前端" }

**问题**：代码在网页上只能看，想直接运行看结果，不需要编辑。

**方案**：代码块写成 `{.js .run}`，在 Worker 沙箱里执行并接一个输出面板，运行按钮 hover 才出现。

> 能不能实现代码写入在前端展示之后，可以直接在网页上运行？……没必要提供代码编辑功能，能直接运行即可……运行按钮只有hover上去才显示（09-03）

??? note "改了哪里"

    代码块写成 ```` ```{.js .run} ````，`vendor/js-runner.js` 找到这类块，在 Worker 沙箱里执行并接一个输出面板；运行按钮放进代码框右上角，hover 才出现。

详见[写作规范 · 可运行 JS 代码块](../../skills/wiki-guide/reference/components.md#js-run)。

### 2026-09-04 · 冲突标记出题与归档闸门 {: data-kind="配置 + 前端 + 流水线" }

**问题**：想要一套课程机制：用 git 冲突标记出题，自己真去跑代码、答完题，才能归档进笔记。

**方案**：加 `conflict` 代码块渲染成上问下答，`course.py` 管领题和归档，`check-links.py` 拦住笔记里没答的题。

> 新建一个和 skills notes 并排的顶级层级，叫做「课程」……要用和git一样的冲突标记提问，只有我手动回答了一个又一个的问题，证明我是真的去运行了代码，然后才能add到 notes 的同名目录

??? note "改了哪里"

    `superfences` 加 `conflict` fence，`vendor/conflict-init.js` 把它染成上问下答两半；`scripts/course.py` 管领题、看进度、归档，题没答完不让归档；`check-links.py` 加一项：`notes/` 里不许出现冲突标记。

详见[写作规范 · 提问块](../../skills/wiki-guide/course.md#conflict-syntax)。

### 2026-09-04 · 一轮体检：线上零 CDN、堵 .venv 漏口、资源死链 {: data-kind="前端 + 流水线" }

**问题**：整体体检查出三处：线上仍有 CDN 依赖，`assets/` 里残留的 `.venv` 会跟着上桶，图片等资源死链没人管。

**方案**：Chart.js 收进 `vendor/`，md 镜像排除点开头的目录，`check-links.py` 加资源死链检查。

> 帮我检查我当前的wiki仓库，寻找有没有问题或者优化空间（可能是zensical配置本身的问题，也可能是写作的问题，也可能是架构层等等等）

??? note "改了哪里"

    vendor 补上 Chart.js，线上不再走任何 CDN；MathJax 改成按需加载。`deploy.sh` 的 md 镜像加 `--exclude='.*/'`，堵住 assets 里残留的 `.venv` 跟着上桶。`check-links.py` 加资源死链检查。新增 `robots.txt`，全站开放抓取并指向 sitemap。

### 2026-09-18 · 升到 zensical 0.0.62：meta 与 redirects {: data-kind="配置" }

**问题**：上游原文、snippet 真身这类文件加不了 description，挪文件又只能留存根页；想看 Zensical 新版有什么能用。

**方案**：升到 0.0.62，接上官方 `meta` 和 `redirects` 两个插件。

> 看本仓库用的 zensical 版本，然后比较一下 zensical的最近更新……看有没有什么新功能可以用？（09-14）

??? note "改了哪里"

    `plugins` 接上 `meta`：目录里放 `.meta.yml`，给上游原文、snippet 真身这类不能加 frontmatter 的文件补 description。接上 `redirects`：挪文件不留存根页，写一行旧路径到新路径。08-12 因为并行竞态误报而关掉的 `invalid_links` 校验改回 `warn`。

详见[写作规范 · 不能动的文件：目录级 .meta.yml](../../skills/wiki-guide/index.md#meta-yml)。

### 2026-09-29 · 图文并排与长文本换行 {: data-kind="配置 + 前端" }

**问题**：引用的长 prompt 显示成一行，得拖横向滚动条；图和文字也想左右并排。

**方案**：`gallery-pair` 块做图文并排；Gallery 图片页的 text 块自动换行，别处要换行手写 `{.text .wrap}`。

> 这种引用"生成一张……"为什么是一行，我需要手动拖左右滚轮。能够不被折叠吗？（09-28）

??? note "改了哪里"

    图文左右并排用官方 `md_in_html` 写 `<div class="gallery-pair" markdown>`，样式在 `zx-theme.css`。长 prompt 换行：`overrides/main.html` 按 URL 前缀只给 `gallery/images/` 的 text 块开自动换行，别处 text 块里的目录树、ASCII 图不受影响；其他页面需要时手写 `{.text .wrap}`。

### 2026-10-01 · age 打码 {: data-kind="配置 + 前端 + 流水线" }

**问题**：wiki 里有服务器 id 这类小字要遮住，而加密插件只加密 HTML，`.md` 镜像照样是明文。

**方案**：用 age 把密文直接写进源文件，浏览器里打码、解锁后还原。

> 本wiki中有很多小文字需要加密，比如我的服务器id，能在前端中做简单的马赛克吗？……自动被转换成一段马赛克，解锁后才恢复。zensical有类似的插件吗？或者 mkdocs有吗

??? note "改了哪里"

    `scripts/age-seal.sh` 用 wiki 公钥加密，源文件里写 `` `age:…` `` 小字或 ```` ```age ```` 块（superfences 新增 `age` fence）。`vendor/age-init.js` 在浏览器里打码、解锁后还原，按需加载 `vendor/age-core.js`（口令和 X25519 私钥两种模式）。encryptcontent 这类插件只加密 HTML，`.md` 镜像照样是明文，所以不用。

详见[打码：key 和小字都以密文写进 wiki](age-mosaic.md)。

### 2026-10-10 · navigation.prune：改 nav 不再全站重传 {: data-kind="配置" }

**问题**：每页 HTML 都嵌着整棵导航，改一个 nav 标题全站 1024 页都变，部署要重传约 400MB。

**方案**：开官方 `navigation.prune`，每页只渲染看得见的导航项。

> 我发现本wiki 每次 deploy 如果有修改目录，就需要依次上传所有文件，相当于重新上传，非常非常慢。这是正常的吗？

??? note "改了哪里"

    官方 `theme.features` 加 `navigation.prune`，每页只渲染看得见的导航项。原来整棵导航（800 多篇）嵌进每一页，占页面体积的 94%，改一个 nav 标题就有 1024 个 HTML 变化、重传约 400MB；开了之后只变 18 个，HTML 总量从 447MB 降到 65MB。代价是侧栏里别的分区不能就地展开。2026-10-17 补：这只对改标题成立，增删条目时剪掉的导航项留下的空白会挪位，照样波及全站，见下面 minify 那条。

### 2026-10-14 · 时间线组件 {: data-kind="前端" }

**问题**：想让时间线真的是从上往下一条线，不管条目里放什么都不受影响。

**方案**：`md_in_html` 的 div 包住条目，纯 CSS 在容器上画贯穿的竖线，分类写在标题属性上渲染成角标。

> 我希望这个时间线是真的从上往下一条线，相当于有特殊的css效果，基本完全不受渲染的影响，是否可以通过特殊的插件实现？（比如写作的时候用特殊的html标记啥的）

??? note "改了哪里"

    不用插件。官方 `md_in_html` 写 `<div class="zx-timeline" markdown>` 包住条目，`zx-theme.css` 第 10 节画线：竖线挂在容器的 `::before` 上、贯穿整个容器，条目只是 h3 前的一个方块，条目里放什么都不会把线打断，也不靠 JS。分类用 `attr_list` 写在标题上 `{: data-kind="…" }`，渲染成角标；纯官方配置的方块空心，涉及自写代码的填荧光绿。AI 读 `.md` 源看到的仍是普通 markdown，只多一对 div。

详见[写作规范 · 时间线](../../skills/wiki-guide/reference/components.md#timeline)。

### 2026-10-15 · 时间线正序 / 倒序切换（当天撤回） {: data-kind="前端" }

**问题**：想给时间线加正序 / 倒序切换；做出来发现一页用的功能挂在了全站，还要动目录的内部 DOM。

**方案**：先用全站脚本加了切换按钮，当天撤回，顺序固定为从旧到新。

> 对了对整个时间线块，增加一个功能，允许切换倒序/正序

> 每个页面的 HTML 都多了一行 `<script>`。你评估一下这个开发成本呢？我发现还会动到目录，比我想象中一个独立的模块大很多，但是可能只有这一个地方会用。……确实需要回撤这个更改，成本太高了，太揉杂了

??? note "改了哪里"

    加：`vendor/timeline-init.js` 挂进全站的 `extra_javascript`，在时间线上方插一个「从旧到新 / 从新到旧」两段式按钮。源文件里条目是平铺的兄弟节点，脚本把「一个 h3 到下一个 h3 之前」认作一条，整条整条地反向重排 DOM，同时反转右侧目录里的条目，选择记在 localStorage。上线时每页 HTML 都多了一行 `<script>`，全站 1027 个文件重传。

    撤：删掉 `timeline-init.js`、`extra_javascript` 那一行、按钮样式和写作规范里的说明，顺序固定为从旧到新。撤的理由：一页用的功能挂在全站；反转目录要依赖 Zensical 目录的内部 DOM，升级会悄悄坏；倒序还会让正文里「下面」「后来」这些话说反。另外两种做法也评估过、没做：md 照写、部署时预处理成独立的 HTML 块，会让本地 `zensical serve` 预览和线上不一致，目录和措辞的问题也还在；用选项卡把两种顺序各写一份，是零代码，但每条要写两处，AI 读到两遍，目录里的条目也会重复。

### 2026-10-15 · 评估官方 llmstxt 插件与自研复制按钮 {: data-kind="配置 + 前端" }

**问题**：官方 llmstxt 插件走 md → HTML → md，会丢图片、iframe、frontmatter；对本站有用的只有它带的复制按钮。

**方案**：不用插件：AI 能写 md 就能读 md，忠实发布源文件就够了；复制按钮自己写，直接复制源文件本身。

> 等等，现在支持我继续使用这个官方插件的理由是什么？就是这个复制按钮吗？我们能自己实现这个复制按钮吗？我还是不想要 md 渲染 md 这一步（md到html到md），因为现在我连原始的md都是ai来写，这个是必然趋势，所以完全不存在AI不能读这个问题

??? note "改了哪里"

    Zensical 0.0.67 起的这个插件把页面渲染成 HTML 再转回 Markdown，实测丢图片、iframe、选项卡标签、frontmatter，snippet 一律展开，复制按钮还和它绑死。自研的两样：`repo_url`、`edit_uri` 设成站点根，`page.edit_url` 就是源文件地址，写进页头的 `alternate` 发现链接；`vendor/md-copy.js` 在右上角放按钮，复制源文件本身，相对链接和 `--8<--` 改成线上绝对地址。只升级 Zensical 版本、不写进 `plugins`，碰不到这个插件。

详见[复制本页 Markdown 源](md-copy.md)，实测细节见[Zensical 升级评估 · llmstxt](../../maintenance/zensical-upgrade/index.md#llmstxt)。

### 2026-10-15 · 命令行一口气解开打码 {: data-kind="流水线" }

**问题**：客户端 curl 下来的 `.md` 里全是密文，想一条命令整页解开。

**方案**：`age-open.py` 接在管道后整页解密，口令走环境变量或终端输入，不走命令行参数。

> 我还希望写一个解密markdown的脚本，这样客户端调用的时候 curl xxx.md | 解密脚本 密码123 可以一口气解密出来

??? note "改了哪里"

    `scripts/age-open.py`（PEP 723 单文件，依赖 pyrage）软链进 `posts/wiki/assets/`，客户端 `curl …md | uv run <脚本网址>` 整页解开：小字解开后留在反引号里，`age` 块变普通代码块，官方插件导出的版本也认。口令没按原想法做成命令行参数——参数会进 shell 历史、`ps` 和 AI 的对话记录——改成按顺序找私钥文件 `WIKI_AGE_KEY_FILE`、环境变量 `WIKI_AGE_PASS`、终端提示输入。口令模式运行时去站上取 `age-init.js` 里的 `WIKI_KEY_AGE`，钥匙仍只有一处真身。

详见[打码 · 命令行里一口气解开](age-mosaic.md#cli)。

### 2026-10-15 · 复制按钮只给正文：去掉 frontmatter、注释和维护记录 {: data-kind="前端 + 流水线" }

**问题**：skill 页要直接粘进对话框当 prompt，frontmatter、来源注释、页尾维护记录粘进去都是噪音，会被 AI 误读。

**方案**：复制时去掉 frontmatter、HTML 注释和 `zx-no-copy` 块；有子页链回的入口在末尾带上源地址，AI 读到子页时认得出是同一篇。

> frontmatter是SKILL.md的压缩，因为人复制的是完整 SKILL.md 所以frontmatter其实就不重要了

> `<!-- 来源：…/skills/collab/grilling/index.md -->` 这个暂时也不想要

> 是不是可以由复制按钮来屏蔽掉最末尾的开发注释了，这个开发注释还是有用的，特别是开发环境
>
> 不对，读者也要可以看得到维护记录，不需要屏蔽，只是复制的时候隐藏
>
> 不能够只有一个分割线，因为后面可能还有引用啥的。感觉得做成一个html块包裹起来？

> 子文档可能反过来引用主文档，这样AI可能反跳回去，又重新读一遍一开始复制进来的文档

> 有些时候只是想简单复制一段文本，AI压根不知道你在复制

> 我的想法核心是如果能理清楚规则，那么就可以自动推断是否加入后缀

> 我觉得只需要考虑向下走，理论上不会出现向上这种情况，因为一定是高级封装引用低级底层能力。

> 我觉得需要加上一句说明：如果后续文章引用本文，禁止重复打开 之类的意思。

??? note "改了哪里"

    `vendor/md-copy.js` 复制时去掉 frontmatter，也不再插 `<!-- 来源：… -->` 注释；此前 frontmatter 原样保留、来源注释插在它后面。另外两条：`<div class="zx-no-copy" markdown>` 包起来的块整块不复制，维护记录写在里面，网页上照常显示、读 `.md` 源的 AI 也看得到，只是不进对话框（先做过一行截止标记，因为切不掉中间段、会把后面的脚注一起切掉，改成了块）；代码以外的 HTML 注释去掉。全站生效，`.md` 源文件和镜像不变。起因是 skill 页要能直接粘进对话框当 prompt，`name`、`description` 是给自动触发和站点用的，页尾那行维护记录粘进去会被 AI 当成在说正在讨论的方案。

    10-20 补：来源加回一半，只给子页会链回的目录入口。目录下有页面链回入口的（子页写 `见[入口 · 用法](../index.md#usage)` 这类），入口 frontmatter 写 `copy_source: true`，`vendor/md-copy.js` 复制时在末尾加一行「本文源地址：」加本页 `.md` 的线上地址：读者把入口贴给 AI，AI 读到子页、看到链回来的地址，认得出就是开头贴进来的那篇，不用再抓一遍。该不该写由 `scripts/check-links.py` 新增的第 6 项算，该写没写、不该写写了都拦部署，当天全站 17 个入口写上。没做成「有链接就加」：57 个 skill 入口有 55 个带站内链接，等于全加，只想复制一段文字贴给不联网的 AI 时这行是噪音。按「入口内容多、有外链」判断也不准：hyperframes 的 20 个子 skill 内容多、链接多，回链为 0；`agent-io` 入口几乎全是链接表，子页却链回它。也不在复制时现抓子页判断，一个入口最多链了 103 篇。只管向下：子页链上级是去读共守的规矩，上级链回它只是菜单里的一行。地址下面再跟一句「上面就是这个地址的全文。之后读到的页面再链到这个地址（包括带 # 的小节链接），直接看上文对应的地方，不要重复打开。」：光给地址，AI 不一定想到要对号入座。

详见[复制本页 Markdown 源](md-copy.md)。

### 2026-10-16 · 死链检查跳过代码块 {: data-kind="流水线" }

**问题**：收纳的 skill 在代码块里举例写了别人项目里的路径，被死链检查当真，挡住部署。

**方案**：死链检查只看代码块和行内 code 之外的链接。

> 看本文，收纳skill： https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs

??? note "改了哪里"

    `scripts/check-links.py` 的死链检查只看代码块和行内 code 之外的链接，剥离规则和资源死链检查共用一套；父级链接照旧认代码块里的链接。起因是收纳这个 skill：领域建模的 GLOSSARY.md 格式模板在代码块里举例 `[Ordering](./src/ordering/GLOSSARY.md)`，那是写进别人项目的路径。吸收来的 skill 原先原文照录、目录里有 `MIRROR.md`，这类死链降级成警告；改成中译收纳后没有 `MIRROR.md`，豁免注释又只管父级链接和 nav 注册，这份模板就会挡住部署。

详见[对象存储部署 · 闸门](cos-deploy/index.md#link-check)。

### 2026-10-16 · 复制按钮支持填空：正文里直接写 HTML 输入框 {: data-kind="前端" }

**问题**：prompt 里有要读者先填的变量，想复制前就地填好，又不想另造一套模板语法。

**方案**：正文直接写 HTML 输入框，复制时把标签换成读者填的值。

> 我还设计了一个format功能，本质上是使用jinja2一样的语法，用户点击复制按钮的时候，如果发现有变量，就变成一个输入框，需要先填写

> md里面写html的input方法，这样渲染的时候可以直接用，而且提示啊，可选啊什么的，就直接被渲染出来了，写作AI也写起来容易，不需要重新定义一套语法

> 写入一个变量，可能要多次使用，这个有办法解决吗？

> 能够给这几个组件加一个默认样式吗，现在裸html很丑呢

??? note "改了哪里"

    正文里手写的 `<input>`、`<textarea>`、`<select>` 当填空，读者在网页上就地填。`vendor/md-copy.js` 复制时把源文件里的标签换成填的值，下拉框取选中项的文字；空着的写成 `【placeholder】`；写了 `required` 的没填就不复制，用浏览器自带的气泡指过去。网页上第 n 个控件对应源文件代码以外第 n 个标签，数量对不上就报错、不复制。一个变量用几次，就把带同一个 `name` 的标签写几次，在一个框里填，别的同名框跟着变。`zx-theme.css` 第 11 节给控件配了站点样式：行内的单行框和下拉框画成纸上的填空横线，只留一条墨线，填过的铺荧光笔底；多行框是 1px 墨框，聚焦时右下一道荧光绿硬投影；框随内容伸缩，Firefox 退回定宽。没用最初想的 Jinja `{{ 变量 }}`：要另造一套语法，而且 `**粗体**{{ 变量 }}` 这种紧贴行内元素的写法会被 attr_list 静默吃成属性，构建不报错。[对话提示词](../../skills/chat-prompts/index.md)的占位全部换成了输入框。

详见[自研组件 · 填空](../../skills/wiki-guide/reference/components.md#fill)。

### 2026-10-17 · 带脚本的 skill 部署时打整包 {: data-kind="流水线" }

**问题**：客户端用带脚本的 skill 得逐个下载脚本，大任务时又碎又慢。

**方案**：入口写一句带 `.tar.gz` 链接的指引，部署时把整个目录打成这个包；默认仍走网络请求。

> 客户端使用这个skill，是不是要先下载一些脚本？我在想deploy的时候进行一个打包，便于客户端下载，该如何设计

> 应该是在skill的index.md里面会写一个 xxx.tar.gz ，让客户端自己下载并解压就好

> 应该是仍然允许全部用远程的方式（用于简单调用），也支持压缩包（里面全部都是原始的相对路径）用于大型任务，远程客户端可以自己选择。

> 如果要调用2次以上本skill中的脚本，直接将`[本skill](xxx.tar.gz)`下载到本地。 相当于不光是tar.gz 而是要一句有指引，有链接才行，这样更准确

> 这种命令也不需要，别人ai自己会写，所以只会留下一句话

> 这句话不要放在用法里，显得就是引导别人下载一样，感觉放在开头第一段介绍里，而且默认是保持走网络请求

??? note "改了哪里"

    新增 `scripts/build-skill-bundles.py`，`deploy.sh` 在 md 源镜像之后调用：入口 `index.md` 写了标准那一行`如果要调用 2 次以上本 skill 中的脚本，直接将[本 skill](<目录名>.tar.gz)下载到本地。`，就把整个目录原样打成这个包（跳过点开头的文件、`__pycache__` 和 `.pyc`），放进 `site/` 的同一位置，上传时钉 `application/gzip`；链接了包却不是这一行，部署停住。包按路径排序、时间戳和属主固定，内容不变字节就不变，`-s` 跳过重传；只在 `site/` 和桶里，不进 git。远程和整包共用一套文档，只写相对路径，不讲根目录：先前入口页写过「根目录是…，相对路径拼上它」，subagent 实测照着把子 skill 的脚本拼到父目录下拿到 404，已删。命令不用 shell 变量，因为 Agent 每次执行命令都是新环境。入口页只在开头介绍段末尾写这一句，默认走网络请求，不单独成节；不附下载命令，客户端 AI 自己会写。HyperFrames 的 `MANIFEST.txt` 清单删掉，换成整包；B站视频笔记逐个下载脚本的循环删掉，换成首段那一句；新增 mock 抽象 skill [测试skill](../../maintenance/mock-bundle/index.md)对照。

详见[写 skill · 带脚本的 skill](../../skills/wiki-guide/skill.md#scripts)。

### 2026-10-17 · minify：增删 nav 条目不再波及全站 {: data-kind="配置" }

**问题**：开了 prune 以后，增删一个 nav 条目仍然让全站每页字节都变、全部重传。

**方案**：开官方 `minify` 压掉模板留下的空白，挪一条只波及它所在的分区。

> 为什么现在改变nav就会全部重新上传所有内容？现在不是启用了一个 nav 公用的功能吗

> 第一种就是大问题，第二种一年都不会变吧？很少会新增板块？

> 好，开 minify 吧

??? note "改了哪里"

    `mkdocs.yml` 的 `plugins` 加官方 `minify`，开 `minify_html: true`。`navigation.prune` 只是不输出剪掉的导航项，模板给它们留下的空格和换行还在：增删一个 nav 条目，全站每页的空白都挪位、字节都变。实测把测试skill 从 Skills 挪进维护，1047 页变化、重传 67 MB；开了以后只剩 532 页、28 MB，全在 Skills 和维护 —— 这两个分区每页的侧栏都列着本分区第一层，挪走一条是真变化，prune 管不了。新收一个顶层 skill 仍要重传 Skills 下 512 页，其中 HyperFrames 占 326 页。HTML 总量 70 MB 降到 50 MB。压缩前后用 HTML 解析器逐页比对，页面文字、代码块文字、输入控件全部一致，代码块只是属性去了引号；开启后第一次部署整站 HTML 重传一次。

### 2026-10-17 · 整包声明不再限于入口 index.md {: data-kind="流水线" }

**问题**：整包只认入口 `index.md`，Gallery 里单页收录的 skill 写了那句也打不了包。

**方案**：改成扫全站页面，链接指向哪个目录的包就打哪个目录。

> 第二个skill没有实现通过关键词，让skill打包吗？

> 要拓展，但是我其实没搞懂为什么需要拓展，我想的本身就是拓展的版本，看需不需要重构，相当于gallery里面的skill也可以用这个功能

??? note "改了哪里"

    `scripts/build-skill-bundles.py` 原来只扫各目录的 `index.md`，打它自己所在的目录；Gallery 的单条收录放在 `collected/gallery-*.md`，不占 `index.md`，写了标准那一行也打不了包。改成扫全站页面：标准那一行的链接指向 `<目录>/<目录名>.tar.gz`，就把那个目录打成包、放在它里面，原来 `index.md` 的写法是其中的特例，原有 5 个包重跑逐字节不变。代码块和行内代码里写的不再算声明；报错从「`index.md` 链了自己的包却不是标准写法」放宽成「链了全站没人声明的包」，子页链上级的包照旧不报。链接在三条路上都对：zensical 会把非 `index.md` 页面里指向构建时还不存在的文件的相对链接也改写对，用最小工程实测过；复制按钮和 AI 读的 `.md` 源按 `.md` 的地址解析相对链接，是读代码确认的。`deploy.sh` 的注释、写作规范、`CLAUDE.md` 跟着改。

详见[写 skill · 带脚本的 skill](../../skills/wiki-guide/skill.md#scripts)。

### 2026-10-19 · 链路闸门补三处漏判 {: data-kind="流水线" }

**问题**：审仓库时发现 check-links 有三处漏判：跳过代码块的正则会吞掉正文，nav 注册拿子串匹配，`[文字](x.py)` 这类链接没人查。

**方案**：按 CommonMark 逐行配对围栏，nav 注册只认 nav 段的条目，指向非 `.md` 本地文件的链接纳入资源死链检查。

> 帮我审核本仓库，现在是否有冲突或者优化，可能是wiki搭建方面，也可能是wiki内部的文档

> 先修复前12吧

??? note "改了哪里"

    `scripts/check-links.py` 跳过代码块改成逐行配对围栏，按 CommonMark 闭围栏不带 info string。原来的正则开头是 `\s*`，能吃掉换行，代码块前有空行时会一路吞过闭围栏，把后面的正文也当代码剥掉：31 个文件受影响，8 篇的正文链接没被检查。nav 注册只认 nav 段里的条目，原来拿路径在整个 `mkdocs.yml` 里找子串，redirects 和注释里出现过也算注册，142 页从 nav 删掉照样通过。资源死链检查纳入指向非 `.md` 本地文件的 markdown 链接（`[文字](x.py)`），此前没有任何一道检查管，当场查出本页两处举例写成了真链接，改成行内代码；skill 整包部署时才生成，目录在就算存在，有没有声明仍归 `build-skill-bundles.py` 拦。笔记未答题检查也跳过代码块，git 笔记里贴冲突示例不会误拦部署。

详见[对象存储部署 · 闸门](cos-deploy/index.md#link-check)。

### 2026-10-19 · 复制按钮：只引几行的 snippet 地址指对 {: data-kind="前端" }

**问题**：复制时，只引几行的 snippet（`x.py:31:36`）被整串拿去探地址，落到一个不存在的 GitHub 链接。

**方案**：先剥掉行号范围再探地址，范围写在地址后面。

> 先修复前12吧

??? note "改了哪里"

    `vendor/md-copy.js` 改写 `--8<-- "x.py:31:36"` 这类只引几行或一段的 snippet：先剥掉 `:31:36`、`:name` 再去站上探，地址只留文件，范围写成「（第 31–36 行）」跟在后面。原来整串拿去探，站上必然没有，落到 GitHub 一个既缺 `docs/` 又带 `:31:36` 的地址。

详见[复制本页 Markdown 源](md-copy.md)。

### 2026-10-19 · 复制按钮支持分支：读者的选择决定哪段进对话框 {: data-kind="前端" }

**问题**：一大段内容只有读者选了要探索才需要，想让读者的选择决定哪段进对话框。

**方案**：`data-when` 块按读者的选择决定复制时的去留，不复制的块在网页上只换样式、不隐藏。

> 能否实现根据选择，是否隐藏掉不需要的内容？现在一大段内容都是只有需要探索才看的。

> 如果选到了否，隐藏内容不要真的隐藏，只是加一个css效果，表现出不会被复制按钮复制进去即可

> 如果全部用 zx-no-copy 来控制呢，这样可以直接看出哪些部分对AI隐藏。 data-when 也通过 zx-no-copy 间接控制可见性

??? note "改了哪里"

    `<div data-when="名=值" markdown>` 包起来的内容，名为「名」的控件选了「值」才复制；只写「名」就是那个框填了才复制。`vendor/md-copy.js` 打开页面和每次填写时算一遍条件，不成立的块挂上 `zx-no-copy`，网页上和写死的那种一个样子；复制时拿源文件里的条件用同一个函数再算一遍，不成立的整块去掉，成立的只去掉外壳 div，不复制的块里的 `required` 不拦。起初复制时是按顺序去网页上查哪个块挂了 class，多一种「对不上就报错」的失败，换成直接算，结果逐字节一样，少 12 行。`zx-theme.css` 新增第 12 节：`zx-no-copy` 块左边一道虚线、上方一个「不复制」小字，没选中的分支另外变淡。不藏起来，是为了让读者看了分支内容再选，脚本出错时内容也照常可读。原有 17 个页尾维护记录块跟着有了这个样子。什么时候才值得分支、模板能力的上限，单开一篇写作规范的引用，只有写 prompt 分支时才读；[概要项目（当时称粗讲）](../../skills/project-research/gist.md)改成新写法当活例。

详见[分支](../../skills/wiki-guide/reference/branch.md)。

### 2026-10-20 · 照片三栏网格 {: data-kind="前端" }

**问题**：收小红书拍照姿势，59 组每组 9 张，原有的两栏排法整页太长。

**方案**：加 `gallery-grid`，固定三栏，窄屏两栏。

> 把这里面全部收集到本wiki的gallery吧

??? note "改了哪里"

    `zx-theme.css` 加了 `.gallery-grid`：`<div class="gallery-grid" markdown>` 包一组图，固定三栏，窄屏两栏。起因是收小红书的拍照姿势，59 组每组 9 张；原有的 `gallery-pair` 固定两栏，9 张要排 5 行，整页太长。写作规范的语法表补了这种排法，活例是 [ins风拍照姿势](../../gallery/images/xhs-poses/gallery-ins-poses.md)。

### 2026-10-20 · 点图放大：开 Zensical 自带的灯箱 {: data-kind="配置 + 前端" }

**问题**：点正文里的图会直接跳到图片文件，想要的是遮罩放大。

**方案**：开 Zensical 内置的 `glightbox`，GLightbox 收进 `vendor/`，免得它去 unpkg 拉。

> 我发现本wiki点击图片，就会直接进入图片页面，而不是简单的放大图片遮罩后面，帮我看看呢？这种基础功能zensical没有吗？

??? note "改了哪里"

    `mkdocs.yml` 开了 `glightbox` 插件。它是 Zensical 内置的，把正文里没套链接的图包成 `a.glightbox`，点一下弹出遮罩放大，可以左右翻同页的其他图。它的加载器跟 mermaid 一样写死了 unpkg，`GLightbox` 未定义时才去拉，所以 GLightbox 3.3.1 的 JS 和 CSS 收进了 `vendor/glightbox/`：`overrides/main.html` 只给有这种链接的页面引入，`fetch-vendor.sh` 记上版本。拍照姿势三页原先每张图都套了指向图片本身的链接，点了直接跳到图片文件，这次去掉了。写作规范的语法表加了一句：别给图套指向它自己的链接。

### 2026-10-23 · 侧栏分组：开 navigation.sections {: data-kind="配置 + 前端" }

**问题**：侧栏想按类型分组、全部摊开，又不想每组都装进一个折叠目录。

**方案**：开 `navigation.sections`，第二层成了不折叠的组标题，组名下加一道绿色引导线，免得读着像能点的文章。

> nav里按照类型分类，就必须装在一个折叠的目录里吗，能够全部放出来，但是有一根细线啥的分割，代表 基础 写代码  写作与协作 这样的组吗？ 感觉更轻量

> 开  navigation.sections，顺便帮我看看其他部分也可以怎么整理

> 项目拆解也要一起

> 为什么笔记、维护这种部分被强制展开了！我不希望把现在没展开的展开。所以需要你帮我增加一个分类

> 作为分割的名字，比如 写代码 ，读者很容易以为是一篇文章，而且还会想尝试点击，但其实这个点不了，有什么好的前端排版方案吗？比如我觉得可以先加粗

> 我想的是 类标题下面紧贴分割线（而不是在上面），相当于不是分割线了，而是引导线。所以也不需要那么长

??? note "改了哪里"

    `mkdocs.yml` 开了 `navigation.sections`：跟 `navigation.tabs` 合用时，每个板块的第二层在侧栏渲染成不折叠的组标题，下面的条目全部展开；宽于 1220px 才生效，手机上照旧。Zensical 的 nav 没有分隔线，组标题是唯一的官方做法 —— 用 CSS 在某几项前画线要耦合侧栏 DOM，没走。它对全站生效，只给 Skills 分组的话，笔记、维护这些原本折叠的目录全被撑开，所以七个板块的第二层都改成只放组名，原来的目录退到第三层、照常折叠：Skills 分基础、调研与收集、写作与协作、出图与视频、写代码五组，入口页按同样五组加二级标题；项目拆解按领域分 AI 角色扮演、Agent 与评测、开发工具，入口页「已拆」下加三级标题；文章分搭建一个、项目复盘、方法，笔记分数学与统计、编程，课程分在学、队列，Gallery 分按媒介、角色，维护分能力与 skill、内容收录，这五个板块的入口页没动。组名不对应页面，网址一个没变；侧栏渲染的条目跟原来一样，只多了组标题。

    组名本来就是 700 字重、点不动，但等宽字体粗细差别小，字号、左边缘又跟条目一样，浅灰色读着像一篇失效的文章。`zx-theme.css` 第 2 节给它换了样子：黑墨 800 字重，名字正下方紧贴一道跟字一样长的 2px 绿线，引着下面的条目。线用绿不用黑，黑色下划线是链接的样子，反倒像能点；文字 span 被 Zensical 设成撑满整行，归零以后线才只有字那么长。只在宽屏生效，窄于 1220px 时组名照旧是抽屉项。

### 2026-10-26 · 重新定义板块：文章是最小单位，文章线和 skill 线并行 {: data-kind="配置 + 前端" }

**问题**：文章、项目、笔记各收什么没有说清，课程内容又全是 AI 写的。

**方案**：以文章为最小单位重排顶栏，「项目拆解」改成「项目」，课程只留机制，文章线和 skill 线并行收。

> 最小单位是文章，是定义一个问题，并且提出解决方案的东西，类似于一篇论文。一定是给人看的

> 如果是解决同一个目的的多个问题整合，就是项目，如果是解决一个领域里的多个文章（本质也是一个问题），就是笔记

> 问题的来源并不是一个轴，问题就是问题

> 把现在所有的课程删除掉，因为全都是AI写的……课程的机制不删除，还是使用git标记来做提醒

> 现在已经不再是一个选择题了，而是 文章线(人读)和skill线(AI读)并行，可能一次性吸纳到两边

??? note "改了哪里"

    顶栏从八项改成 首页 · 文章 · 项目 · 笔记 · Gallery · Skills · 维护。「项目拆解」改名「项目」，自己做的也算：本 wiki、Kindle 常显信息屏、AI 助手、动画网页 PPT 从 `posts/` 搬进 `projects/` 按领域分组，如何分析数据搬进 `notes/statistics/`，`redirects` 给搬走的 27 页各加一行；文章顶栏只剩四篇单篇。课程内容全删，16 门科目留成 [roadmap](roadmap.md#subjects) 的待记科目；`conflict` 块、`course.py`、check-links 第 4 项留着，改成在笔记里给自己出题，`course.py status` 列出空着的题。写作规范的归属七问改成六问，按 Gallery、Skills、维护、项目、笔记、文章的顺序判一页放哪；[收纳导诊](../../skills/collect/index.md)改成文章线和 skill 线分开判，一个来源可以两边都收；旧刊物海报的守则从 Gallery 拆成 skill。首页两个身子按六个板块重写，开屏的特性网格把课程卡换成项目卡。

详见[板块怎么分](sections.md)。

### 2026-10-26 · 复制按钮跟着解锁走：打码复制成明文或【已加密】 {: data-kind="前端" }

**问题**：复制时密文原样进对话框，几百字白占上下文，AI 也解不开。

**方案**：复制时解锁过的换成明文，没解锁的写成【已加密】。

> 我在想这么长一串，不应该进入AI上下文吧，解密前应该复制出来是 已加密， 解密后复制出来应该是真实值

??? note "改了哪里"

    此前复制按钮把密文原样复制，页面上解锁过也一样，一段 `` `age:…` `` 两三百字，贴给 AI 只占上下文、它也解不开。`vendor/age-init.js` 把解密抽成一个函数，挂出 `WikiAge.open`，用解锁时记在 sessionStorage 里的私钥；`vendor/md-copy.js` 复制时找出源文件里的小字和 `age` 块：这个标签页解锁过就换成明文，块换成普通代码块，没解锁写成【已加密】，解锁了还解不开写成【解不开】。复制出来的跟网页上看到的一致，和填空、分支一个路子。

详见[复制本页 Markdown 源](md-copy.md)。

### 2026-11-06 · 收大一点的构建工程：产物给 iframe 跑，源码给 AI 读

**问题**：交互演示强制写成免构建的原生 HTML，稍大的工程写起来吃力，AI 读起来也更费劲。

**方案**：大工程原样收：构建产物放 `assets/` 给 iframe 跑，源码带 lockfile 放 `source/` 给 AI 读，构建在本地做。

> 我感觉对于本wiki是一个考验，现在是直接用html来写，这样一来遇到稍微大一点的就会很吃力，强制写成原生html反而增加了AI阅读wiki时候的阅读理解压力

> 需要打包这个问题，意味着开发完一个部分之后就进行build，而不是每次deploy的时候自动进行吗

> 要用简洁的话术收纳回本wiki的规范，可能要加一个时间线的板块，记录收纳大一点的项目

??? note "改了哪里"

    此前交互演示一律免构建，vite 产物能嵌但算二等公民，大一点的工程只能改写成原生脚本。[嵌入交互单页](../../skills/wiki-guide/reference/components.md#iframe-demo)改成按规模分：小 demo 照旧免构建；要 `vendor/` 里没有的 npm 依赖、本来就是构建工程做的、逻辑过千行的，原样收构建工程 —— `base: './'` 的产物整个目录放进 `assets/<名>/` 给 iframe 跑，工程带 lockfile 放进 `source/` 给 AI 读，页面列文件表、折叠引讲到的几篇，压缩过的产物不链给 AI。构建在本地、在 `docs/` 外做，产物和源码同一个 commit；`deploy.sh` 不加构建 —— 部署时要装 Node、联网装依赖，哪个工程编译失败整站就停，而且多数工程收完不再改，每次部署重打是白跑。`deploy.sh` 早已给 `.ts` 钉了文本类型，不用改。第一个这样收的是 Gallery 的 [3D 像素幸存者](../../gallery/games/terrace-survivors.md)：Vite + TypeScript，39 个模块约 6200 行，依赖 three.js 0.187 和站内 `vendor/` 没有的 postprocessing；改写成原生要把 three 降到站内的 r185、给 `vendor/` 加库，存下来的也不再是测过的那份。

### 2026-11-06 · 整包下载不再限于 skill：条件各写各的 {: data-kind="流水线" }

**问题**：想让构建工程也能整目录下载，但整包声明只认 skill 那一整句。

**方案**：声明只认后半句的 `.tar.gz` 链接，前半句的条件按场景写。

> 对于这种代码，本只是一个小仓库，之前本wiki的处理做法是打包成一个压缩包，那有没有直接下载一个目录的做法呢？比如别人 curl https://wiki.me.com/xxx/ 直接批量下载多个文件？ 是否可以实现，方式是否好呢

> 那这样改的话，本质就是一个通用的写法？ 本wiki的skills 里面的写法也可以变了？

> 要改，那对于这种情况，应该就没必要在文章中罗列项目结构树了吧？或者可以简单讲述即可？

??? note "改了哪里"

    HTTP 没有「下载一个目录」：所谓下载目录，不是服务器先打包，就是先给清单、客户端逐个取。清单在 HyperFrames 那次已经换成了整包；目录 URL 又被页面和 demo 的 `index.html` 占着，放不下列表页；所以留整包，只放宽声明。`scripts/build-skill-bundles.py` 原来只认 skill 那一整句、一字不差，构建工程的页面挂不上包；改成只认后半 `直接将[…](<目录>/<目录名>.tar.gz)下载到本地`，前半的条件按场景写 —— skill 照旧是「如果要调用 2 次以上本 skill 中的脚本」，构建工程写「要在本地运行或修改」。现有 skill 页一字未改，原有 9 个包重跑逐字节不变；链了包却没写这一句的照旧报错停住。规矩挪到[自研组件 · 整包下载](../../skills/wiki-guide/reference/components.md#bundle)，写 skill 只留 skill 那句的条件；写作规范语法表、`deploy.sh` 注释、`CLAUDE.md` 跟着改。[3D 像素幸存者](../../gallery/games/terrace-survivors.md)的「拿去改」挂上工程整包，页尾 45 行的文件表换成按目录的简述 —— 要全部文件的下整包，AI 读源码只取问答链到的那几篇。

详见[自研组件 · 整包下载](../../skills/wiki-guide/reference/components.md#bundle)。

### 2026-11-17 · 吸纳子 wiki：项目自带的文档收进项目板块，实时数据按页引入 {: data-kind="前端" }

**问题**：自己开发的项目各带一份 wiki，文档里嵌着接口的实时数据，想由本 wiki 当主 wiki 把它们收进来。

**方案**：agent 照 skill 把子 wiki 的 `docs/` 拷进 `projects/`、手动注册 nav；子 wiki 在 `.meta.yml` 写了接口地址的页面才引入取数脚本。

> 功能基本通过了，现在想收纳到本wiki，（比方说未来由本wiki来担当主wiki，然后可能有其他的子项目），所以我想先把子服务规范定义下来

> 然后要做成渐进式披露，因为子服务可能不设计动态wiki，可以拆分一下文档吧。

> 收纳位置就是放在 projects 里面

??? note "改了哪里"

    规范写成 skill [使用 wiki 管理项目开发](../../skills/subwiki/index.md)：写文档的六个板块和 wiki 部署约定是必做的，写在入口；从已有项目整理文档、动态数据、吸纳各一页，用到才读。项目索引多一档「自有：」，第一个吸纳进来的是[牛牛便利贴](../clipboard/index.md)，7 页。全站机制只动了 `overrides/main.html`：页面的 meta 里有 `api_base`（来自子 wiki 目录的 `.meta.yml`）才输出 `<meta name="api-base">` 并引入 `skills/subwiki/scripts/live.js`，把正文里的 `{{ api("…").字段 }}` 换成接口当前的返回值；脚本和发给子项目的是同一份，不进 `extra_javascript`，别的页面不加载。主 wiki 没有后端，`.md` 镜像里的占位符不替换，AI 要实时值去读子服务自己的 `/wiki/x.md`。没选的做法：实验里主 wiki 的配置由脚本整份生成、页头列出所有子服务地址按路径前缀挑，本站 nav 是手写的，不生成。

详见[子 wiki：项目自带文档，主 wiki 来收](subwiki.md)。

### 2026-11-17 · 实测后不用：awesome-nav 让子目录自带导航 {: data-kind="配置" }

**问题**：想让子 wiki 自带导航，拷进来之后主 wiki 一行不用改。

**方案**：不用。它一开就整体替换手写 nav，改成 agent 手动注册。

> 那就不走 awesome-nav 就要动主 wiki 的根基，而是子项目写好之后，用agent手动吸纳，这样如何？相当于不自动配置，走纯手动路线

??? note "改了哪里"

    Zensical 0.0.58 起支持 `awesome-nav`，每个目录放一个 `.nav.yml` 管自己那段导航，本站是 0.0.62。实测两件事：把 `mkdocs.yml` 的 nav 原样挪进 `docs/.nav.yml` 并开插件，全站 1388 页的产物逐字节相同，只多出 `.nav.yml` 自己被拷进 `site/`；根 nav 里写一行目录名，子目录的 `.nav.yml` 能接管标题和顺序。不用的理由：插件一开就报「`nav` 被生成的导航替换」，不能和 `mkdocs.yml` 的手写 nav 混用，要用就得整份挪，check-links 的 nav 注册检查、写作流程第 3 步都要跟着改；子 wiki 不会多到手动注册成为负担。配置没有改动。

</div>
