---
description: "每页右上角的复制按钮和页头的 Markdown 发现链接怎么来的：为什么不用 Zensical 官方 llmstxt 插件（它给的是 md→HTML→md 的转换版），怎么借 page.edit_url 拿到源文件地址，复制时怎么把相对链接改成线上能直接访问的绝对地址"
---

# 复制本页 Markdown 源：不用官方插件，自己做

每页右上角有一个复制按钮，复制的是这一页的 `.md` 源文件；页头有一行 `<link rel="alternate" type="text/markdown">` 指向同一个文件。Zensical 0.0.67 起官方 `llmstxt` 插件也给这两样，本站没用，自己做了——**官方给的是从 HTML 转回来的 Markdown，本站要的是源文件本身**。

## 为什么不用官方插件 { #why }

- **源文件就是 AI 写的、给 AI 读的**：不存在「AI 读不懂源文件」的问题。官方坚持转换，理由是源文件里的 snippet、指令没展开，维护者在 [#859](https://github.com/zensical/zensical/issues/859#issuecomment-5291561058) 的原话是 "serving the raw Markdown sources is not enough"——在本站，snippet 是故意留的指针，相对链接本身就是给 AI 逐层读的链接图
- **转换是负收益**：2026-10-15 实测，图片、iframe、音视频整个丢，连说明文字都不剩；选项卡标签、代码块标题、自定义块类型、时间线分类、frontmatter 丢；snippet 一律展开，关不掉
- **复制按钮和插件绑死**：不开插件没有按钮；开了，按钮复制的就是转换版
- **想要的只有两样**：按钮和发现链接，都能自己做，下面就是做法

逐条实测和三条备选路线见[Zensical 升级评估 · llmstxt](zensical-upgrade/index.md#llmstxt)；决定记在[能力时间线](index.md#timeline) 10-15「评估官方 llmstxt 插件与自研复制按钮」那一条。

## 源文件地址：借 `page.edit_url` { #edit-url }

难点在于页面地址 `/x/` 看不出源文件是 `/x.md` 还是 `/x/index.md`——普通文章是前者，目录首页是后者。Zensical 的模板里 `page` 没有 `file` 字段，写 `{{ page.file.src_uri }}` 直接报 `undefined value`，拿不到源文件路径。

能拿到的是 `edit_url`：`edit_uri` 设成绝对地址时，`edit_url` = `edit_uri` + 源文件路径。把 `repo_url` 和 `edit_uri` 都设成站点根：

```yaml
repo_url: https://wiki.liuhetian.work/
edit_uri: https://wiki.liuhetian.work/
```

`edit_url` 就正好是源文件的线上地址：首页 `/index.md`、普通文章 `/posts/foo.md`、目录首页 `/posts/sub/index.md`，不在 nav 里的页也对，0.0.62 和 0.0.70 实测一样。不设 `repo_url` 时 `edit_url` 是空的，两个都得设。

- **副作用一个**：`repo_url` 让顶栏和侧栏抽屉多出「Go to repository」入口，来自主题的 `partials/source.html`，放一个空的 [`overrides/partials/source.html`](https://github.com/liuhetian/wiki/blob/main/overrides/partials/source.html) 关掉
- **编辑按钮不会冒出来**：它要开 `content.action.edit` 才显示，本站不开
- **域名是线上的**：`edit_url` 永远指向 `https://wiki.liuhetian.work/`，发现链接给 AI 用，本来就该指线上

## 发现链接 { #discovery }

`overrides/main.html` 和首页的 `home.html` 在页头写两行，按 [llms.txt 提案](cos-deploy/index.md#llmstxt)的约定：

```html
<link rel="alternate" type="text/markdown" href="{{ page.edit_url }}">
<link rel="describedby" href="{{ 'llms.txt' | url }}">
```

AI 落在任何一个 HTML 页，顺着 `alternate` 就拿到源文件，不用知道「普通页把 `/` 换成 `.md`、目录首页加 `index.md`」这套规则。

## 复制按钮：相对链接怎么变成能直接访问的地址 { #rewrite }

按钮由 [`vendor/md-copy.js`](../../vendor/md-copy.js) 插进页面右上角，样式借主题的 `.md-content__button`；页头没有发现链接就不出按钮。点下去取源文件、改写、写进剪贴板。改写的目的是让贴进对话框的文字自成一体：读的人没有站点上下文，相对路径对它没有意义。

**以源文件的线上地址为基准，用浏览器标准的 URL 解析拼出来**：

```js
const base = link.href;   // 发现链接的地址，如 https://wiki.liuhetian.work/posts/wiki-tech/age-mosaic.md
const abs = (target, base) => (!target || KEEP.test(target) ? target : new URL(target, base).href);
```

`new URL(相对路径, 基准)` 就是浏览器解析相对链接的规则：取基准所在目录，再按 `..`、`./` 走。打码那篇里的真实链接：

| 源文件里写的 | 复制出去的 |
|---|---|
| `../ai-assistant/dev-env.md#proxy` | `https://wiki.liuhetian.work/posts/ai-assistant/dev-env.md#proxy` |
| `cos-deploy/index.md` | `https://wiki.liuhetian.work/posts/wiki-tech/cos-deploy/index.md` |
| `assets/age-open.py` | `https://wiki.liuhetian.work/posts/wiki-tech/assets/age-open.py` |
| `/posts/wiki-tech/assets/age-passphrase.html`（iframe 的 `src`） | `https://wiki.liuhetian.work/posts/wiki-tech/assets/age-passphrase.html` |

转出来的是 `.md` 源和真身文件的地址，不是 HTML 页面——源文件里的链接本来就指向 `.md`，AI 拿到直接读源。

- **拼出来的地址一定存在**：`deploy.sh` 用 rsync 把 `docs/` 原样镜像上桶，每个源文件在线上的相对位置和在 `docs/` 里一样，在 `docs/` 里成立的相对路径，以线上地址为基准解析也成立。这也是镜像必须放 `/x.md`、不能像官方那样放 `/x/index.md` 的原因——基准深一层，相对链接全错
- **基准用线上，取文件用当前站点**：基准取发现链接的完整地址，复制出去的链接都指向线上；取源文件只用它的路径部分、按当前站点去拿，本地预览上也能点
- **改写哪些**：逐行匹配 Markdown 链接和图片的 `](目标)`、链接定义 `[名字]: 目标`（脚注 `[^1]:` 除外）、HTML 的 `src="…"` 和 `href="…"`
- **不动哪些**：已带协议的（`https:`、`mailto:`）、页内锚点 `#cli`、`//` 开头、`<…>` 包着的；代码块里（按 ```` ``` ```` / `~~~` 围栏判断进出）和行内代码里的——写作规范里举例写的链接不能被改
- **snippet 另算**：`--8<-- "路径"` 的路径不相对当前页，相对 snippet 的 `base_path`（先 `docs/`，再仓库根）。先拼「站点根 + 路径」，发一个 HEAD 请求：站上有就用站上的地址（如 `vendor/age-core.js`）；没有说明它只在仓库根（如 `scripts/age-open.py`），指向 GitHub 仓库
- **开头加来源**：frontmatter 原样保留，后面插一行 `<!-- 来源：…/age-mosaic.md -->`，读的人知道去哪接着读
- **打码原样复制**：取的是源文件，页面上解锁过也还是密文；要明文接 [`age-open.py`](age-mosaic.md#cli)
- **写剪贴板**：https 下用 `navigator.clipboard`；本地 http 预览没有这个接口，退回隐藏 textarea 加 `execCommand("copy")`

## 实现 { #impl }

| 文件 | 做什么 |
|---|---|
| `mkdocs.yml` | `repo_url`、`edit_uri` 设成站点根；`extra_javascript` 挂 `vendor/md-copy.js` |
| `overrides/main.html`、`overrides/home.html` | 页头写 `alternate` 和 `describedby` 两行 |
| `overrides/partials/source.html` | 空文件，关掉 `repo_url` 带出来的仓库入口 |
| [`vendor/md-copy.js`](../../vendor/md-copy.js) | 复制按钮和改写，约 110 行，不压缩 |

2026-10-15 测过：正式站构建并照 `deploy.sh` 镜像 `.md` 后起本地预览，在打码那篇把剪贴板接口换成记录、自动点按钮——frontmatter 保留、来源注释在、三种 snippet 各指对地方、正文相对链接和 iframe 的 `src` 改成线上地址、`#cli` 锚点和代码块里的命令不动。

??? abstract "`vendor/md-copy.js` —— 复制按钮源码（未压缩）"

    ```js
    --8<-- "vendor/md-copy.js"
    ```

## 没做的 { #todo }

- 自动测试替换了剪贴板接口；真实写进剪贴板、按钮在页面上的样子，由人在浏览器里点过确认
- 改写是逐行正则，不是完整的 Markdown 解析：网址里带括号的链接、跨行的链接、双反引号包的行内代码、单引号写的 HTML 属性可能处理不对，本站现有写法里没碰到
