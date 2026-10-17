# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 这是什么

用 Zensical（MkDocs Material 兼容）构建、托管在腾讯云 COS 上的个人知识库。核心设计只有一件事：**同一份 markdown 同时发布为给人看的 HTML 和给 AI 读的 `.md` 源**。人访问 `/foo/` 拿 HTML，AI 访问 `/foo.md` 拿源，整个 wiki 可当远程 skill 用。

## 常用命令

```bash
uv run zensical serve              # 本地预览（Python ≥3.13，依赖由 uv 管）
uv run zensical build              # 构建到 site/
python3 scripts/check-links.py     # AI 链路校验：父级链接 + 死链 + nav 注册 + 笔记未答题 + 图片/demo 资源死链；写完文章必跑
./deploy.sh                        # git pull --ff-only → check-links → 构建 → md 源镜像 + llms.txt + skill 整包 → 同步 COS
node scripts/validate-lieflat-charts.mjs   # 只在改 data-visualization/lieflat-charts 时跑：48 篇 reference ↔ 48 个 demo 一一对应
python3 scripts/check-leetcode.py         # 只在改 notes/leetcode 时跑：每篇 python 块拼起来真跑 assert + 五段骨架 + 热题 100 覆盖
python3 scripts/course.py checkout <分类>/<slug>   # 课程：领题到 docs/notes/ 同名文件；status 看进度，add 归档（答完才通过）
bash scripts/course-smoke.sh               # 只在改 courses-src/git/assets/ 时跑：33 个 init.sh 各跑两遍
```

## 做到哪一步为止

- **写或改任何页面，先读 `docs/skills/wiki-guide/index.md`**（写作规范），按里面的写作流程走
- **终点**：文件写好 + 父级索引挂钩子 + `mkdocs.yml` 注册 nav + 跑一次 `check-links.py`。不反复构建复查
- **commit、push、部署都等用户说**。部署是在部署机的仓库根跑 `./deploy.sh`，以脚本成功退出为结果；它用工作树构建，没提交的改动也会一起上线，跑之前提醒用户
- **渲染效果由用户自己看**：AI 不截图、不开浏览器、不发网络请求验证线上效果，mermaid 也一样；除非看到明确报错
- 新机器初始化、`.env` 字段、LFS 接入见 README「本地开发与部署」，只在配新机器时读。`.env` 不入库；只写文字的机器可以不配

## 架构：几件要读多个文件才能拼出来的事

**AI 链路靠相对链接，不靠 nav。** 页面 URL 只由 `docs/` 里的文件位置决定，`nav` 只是给人的策展层；AI 只能顺祖先目录索引页（`index.md` / `MIRROR.md` / `SKILL.md`）的 markdown 链接读到页面。`scripts/check-links.py` 是这条规则的闸门，`deploy.sh` 在读凭证和构建之前跑它，非零退出即中止部署。挪文件后在 `mkdocs.yml` 的 `redirects` 写 `旧路径.md: 新路径.md`，支持 `#锚点` 级；它只产出 HTML 跳转页，`.md` 那一半是从 `docs/` 实镜像的，旧的 `/旧路径.md` 仍然 404，站内引用得一并改。

**双产物是怎么出来的。** `zensical build` 只出 HTML；`deploy.sh` 用一行 rsync 把 `docs/` 下的 `.md` 树原样镜像进 `site/`。`use_directory_urls` 让页面占 `/x/index.html`，`/x.md` 这个 key 恰好空着，两者同域不撞。`site/llms.txt` 是 `docs/index.md` 剥掉 frontmatter 后的构建期副本，只维护 `index.md` 一份。每页页头的 `<link rel="alternate" type="text/markdown">` 和右上角的复制按钮（`vendor/md-copy.js`）都靠 `page.edit_url` 指向 `.md` 源：`mkdocs.yml` 的 `repo_url`、`edit_uri` 设成站点根不是为了显示仓库，别删；顶栏仓库入口由空的 `overrides/partials/source.html` 关掉。复制时去掉 frontmatter、代码以外的 HTML 注释和 `zx-no-copy` 块，正文里的 `<input>`、`<textarea>`、`<select>` 换成读者填的值。来龙去脉见 `posts/wiki/md-copy.md`。上传时 `.md` 与 demo 源码（`.ts/.tsx/.jsx/.mjs/.py`）要钉文本类 Content-Type，否则 COS 按扩展名乱猜，AI 抓取工具拒收。入口 `index.md` 写了「如果要调用 2 次以上本 skill 中的脚本，直接将[本 skill](<目录名>.tar.gz)下载到本地。」这一行的 skill，由 `scripts/build-skill-bundles.py` 在部署时把整个目录打成这个包放进 `site/`，只上桶、不进 git；写法见写作规范「收纳 skill · 带脚本的 skill」。

**首页有两个身子。** 浏览器里 `docs/index.md` 由 `overrides/home.html` 的开屏模板渲染，正文不上屏；但正文照样发布为 `/index.md` 与 `/llms.txt` 给 AI 读。改首页内容两边要同步。

**运行时全在本地 vendor。** `docs/vendor/` 里有 React UMD + htm、React ESM、three/r3f、MathJax、ECharts、Chart.js、Mermaid、Maple Mono 字体，线上不走任何 CDN，demo 引 `/vendor/...` 根绝对路径。真身大的按需加载，不给无关页面付代价：MathJax（2MB）由 `vendor/mathjax-init.js` 查到 `.arithmatex` 才拉，ECharts 由 `vendor/echarts-init.js` 查到 ```echarts 块才拉，`overrides/main.html` 只给含 mermaid 块的页面同步引入 mermaid 真身。升级 vendor 版本用 `scripts/fetch-vendor.sh`，换字体版本用 `scripts/build-fonts.py`（中文按 GB2312 + 本站用字子集化），两者只在升级时跑一次。

**打码靠密文直接进源文件。** `vendor/age-init.js` 在浏览器里把 `` `age:…` `` 和 ```` ```age ```` 块打码、解锁后还原，按需加载 `vendor/age-core.js`（age 解密核心，口令 / X25519 两种模式）；命令行读 `.md` 源时用 `scripts/age-open.py` 整页解开，口令走环境变量 `WIKI_AGE_PASS`，不收命令行参数。私钥在部署机 `~/.config/age/wiki.key`，不进仓库；用口令锁住的副本内嵌在 `age-init.js`。encryptcontent 这类插件只加密 HTML，`.md` 镜像照样明文，所以不能用。写法见写作规范「打码」一节，来龙去脉见 `posts/wiki/age-mosaic.md`。

**媒体走自制 git-lfs。** `.gitattributes` 把图/视频/字体/vendor 真身交给 LFS，blob 由 `scripts/lfs-cos-agent.py`（standalone custom transfer agent）存到备份桶 `lfs/` 前缀，与部署桶隔离。`git push` 自动上传，部署机 pull 自动取回。

## 加功能就记一笔时间线，内容不记

改了 `mkdocs.yml` 里 nav 和 redirects 以外的部分、`overrides/`、`docs/stylesheets/`、`docs/vendor/` 下的 init 脚本、`deploy.sh`，或 `scripts/` 里作用于全站的脚本，在 `docs/posts/wiki/index.md` 的「能力时间线」一节末尾追加一条。新增文章、分区、收录资料不记，只为某一批内容服务的脚本（如 `check-leetcode.py`、`build-handdraw-gallery.py`）也不记。功能撤回也记，写进当初加它的那一条，标题注明撤回；实测后决定不用的官方功能也记一条，写清不用的理由，只是讨论过的不记。每条写：日期 + 分类（配置 / 前端 / 流水线）、用户提需求的原话（删节可以，key、口令、服务器地址不进）、一段改了哪里。原话取自本次对话；有专文的条目末尾加一行「详见」链过去；写法见写作规范「时间线」一节。

## 两道链接校验

zensical 自带的 `invalid_links` 设为 `warn`，报错带 `文件:行:列`，`serve` 时当场可见。阻断部署只靠 check-links.py —— 父级索引挂载、nav 注册、笔记未答题、资源死链这四项只有它管。
