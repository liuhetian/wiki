# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 这是什么

用 Zensical（MkDocs Material 兼容）构建、托管在腾讯云 COS 上的个人知识库。核心设计只有一件事：**同一份 markdown 同时发布为给人看的 HTML 和给 AI 读的 `.md` 源**。人访问 `/foo/` 拿 HTML，AI 访问 `/foo.md` 拿源，整个 wiki 可当远程 skill 用。README.md 有完整的定位说明与内容导览，先读它。

## 常用命令

```bash
uv run zensical serve              # 本地预览（Python ≥3.13，依赖由 uv 管）
uv run zensical build              # 构建到 site/
python3 scripts/check-links.py     # AI 链路校验：父级链接 + 死链 + nav 注册；写完文章必跑
./deploy.sh                        # git pull --ff-only → check-links → 构建 → md 源镜像 + llms.txt → 同步 COS
node scripts/validate-lieflat-charts.mjs   # 只在改 data-visualization/lieflat-charts 时跑：48 篇 reference ↔ 48 个 demo 一一对应
```

正式上线在部署机执行，本地只负责 commit + push：

```bash
ssh lht@172.20.90.202 'export PATH=/home/lht/.local/bin:$PATH; ./deploy.sh'
```

以部署脚本成功退出为结果。**除非看到明确报错，不要主动去浏览器或发网络请求验证线上效果**，那一步由人来做。

新机器初始化、`.env` 字段、LFS 接入见 README「本地开发与部署」。`.env` 不入库；只写文字的机器可以不配。

## 架构：几件要读多个文件才能拼出来的事

**AI 链路靠相对链接，不靠 nav。** `mkdocs.yml` 的 `nav` 只是给人的策展层。一篇文章只有被某个祖先目录的索引页（`index.md` / `MIRROR.md` / `SKILL.md`）用 markdown 链接直接指到，AI 才能读到它；`nav` 里有、索引里没有，对 AI 等于不存在。`scripts/check-links.py` 是这条规则的闸门，`deploy.sh` 在读凭证和构建之前就跑它，非零退出即中止部署。页面 URL 只由 `docs/` 里的文件位置决定，所以重排 nav 随意，挪文件才是动链接图的操作。不给挪走的文件留旧地址存根页。

**双产物是怎么出来的。** `zensical build` 只出 HTML；`deploy.sh` 用一行 rsync 把 `docs/` 下的 `.md` 树原样镜像进 `site/`。`use_directory_urls` 让页面占 `/x/index.html`，`/x.md` 这个 key 恰好空着，两者同域不撞。`site/llms.txt` 是 `docs/index.md` 剥掉 frontmatter 后的构建期副本，只维护 `index.md` 一份。上传时 `.md` 与 demo 源码（`.ts/.tsx/.jsx/.mjs/.py`）要钉文本类 Content-Type，否则 COS 按扩展名乱猜，AI 抓取工具拒收。

**首页有两个身子。** 浏览器里 `docs/index.md` 由 `overrides/home.html` 的开屏模板渲染，正文不上屏；但正文照样发布为 `/index.md` 与 `/llms.txt` 给 AI 读。改首页内容两边要同步。

**Skills 目录形态即 skill。** `docs/skills/<name>/` 按 Anthropic skill 标准布局：`index.md` + `reference/` + `assets/`。吸收自开源项目的 skill（如 writing/qu-ai-wei、writing/xi-wen）`index.md` 是上游原文照录，**不许改**；本地归档的链接责任落在同目录 `MIRROR.md` 上，来源钉 commit 永链。

**代码即引用。** 文章里的代码用 `--8<--` snippet 引用仓库真实文件，snippet `base_path` 是 `docs` 再回退到项目根，所以 docs 内引用写 `skills/.../x.md`（不带 `docs/` 前缀），根文件写 `mkdocs.yml`、`deploy.sh` 这样的相对根路径。

**交互 demo。** 自包含静态单页放进各 skill 的 `assets/`，iframe 同域嵌入，`src` 用站点根绝对路径且写到具体 `.html` 文件；逻辑不压缩，AI 读同一 URL 下的源码。运行时库全部在 `docs/vendor/`（React UMD + htm、React ESM、three/r3f、MathJax、ECharts、Mermaid、Maple Mono 字体），线上不走任何 CDN。`overrides/main.html` 只给含 mermaid 块的页面同步引入本地 mermaid 真身。升级 vendor 版本用 `scripts/fetch-vendor.sh`，换字体版本用 `scripts/build-fonts.py`（中文按 GB2312 + 本站用字子集化），两者只在升级时跑一次。

**媒体走自制 git-lfs。** `.gitattributes` 把图/视频/字体/vendor 真身交给 LFS，blob 由 `scripts/lfs-cos-agent.py`（standalone custom transfer agent）存到备份桶 `lfs/` 前缀，与部署桶隔离。`git push` 自动上传，部署机 pull 自动取回。

## 写作规矩

规矩的真身是 `docs/skills/writing/mkdocs-wiki/index.md`，改内容前先读它。写作流程：

1. 读写作规范和部署说明。
2. 写文章（可能需要生图：概念图统一白底黑色马克笔草图），在 `mkdocs.yml` 注册 nav，并在父级索引页挂一行带钩子的链接。
3. `python3 scripts/check-links.py` 自查。
4. git commit + push。
5. SSH 部署机跑 `./deploy.sh`。

三个顶层分区分工：`posts/` 讲完整来龙去脉，`notes/` 记专业科目的学习推导（每个分类有统一骨架），`skills/` 是能直接交给 AI 执行的成套资产。引外部资料三步：真身存档进 `assets/` + 正文摘句 + 自己的分析。图表优先用 ```` ```mermaid ```` / ```` ```echarts ```` 代码块声明式写。

## 已知的构建怪癖

zensical 自带的 `invalid_links` 校验有并行竞态，偶发大量误报，已在 `mkdocs.yml` 关掉，死链由 check-links.py 兜底。check-links.py 对吸收型 skill 上游原文里的死链只警告不阻断，判据是同级或祖先目录存在 `MIRROR.md`。
