---
description: "本 wiki 自研的写法和 mermaid 的坑：iframe 嵌交互单页、可运行 JS 代码块、age 打码、时间线、复制时跳过的块、填空输入框；写作规范的语法表指到哪节读哪节"
---

# 自研组件

[写作规范](../index.md)语法表指过来的几样。Material 原生语法 AI 都会，这里只写本站自己做的组件和踩过的坑。

- [mermaid 的坑](#mermaid)
- [嵌入交互单页](#iframe-demo)
- [可运行 JS 代码块](#js-run)
- [打码](#age-mosaic)
- [时间线](#timeline)
- [复制时跳过](#no-copy)
- [填空](#fill)

## mermaid 的坑 { #mermaid }

- **边标签里有圆括号就套双引号**：`-->|文本|` 里出现 `(` 或 `)`，解析器就断在那里（控制台报 `got 'PS'`），整张图退化成代码块原样显示。节点标签 `A["..."]` 习惯带引号，容易漏的是边标签：

    ```text
    B -->|一个 Z 除以 √(χ²/n)| C      ← 整图不渲染
    B -->|"一个 Z 除以 √(χ²/n)"| C    ← 正确
    ```

- **`√` 别进标签**：Maple Mono 下它的字形像积分号 `∫`，写成文字「的平方根」
- **渲染效果由用户自己在浏览器里看，AI 不截图**：上面两类问题 `zensical build` 和 check-links 都报不出来，mermaid 渲染在 closed shadow root 里、脚本也测不到；写了 mermaid 就提醒用户看一眼

活例：[统计学第 6 章](../../../courses/statistics-book/ch06-sampling-distribution.md)的三大分布构造图，两处都踩过。

## 嵌入交互单页 { #iframe-demo }

要展示交互效果（组件、可视化、小工具），把纯客户端的自包含单页放进所属 skill 或文章的 `assets/`，用原生 `<iframe>` 同域嵌入。AI 顺同一个 URL 能读到未压缩的源码。

<iframe src="/skills/wiki-guide/assets/react-spa-demo.html"
        style="width:100%;height:720px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="React 单页 demo：商品管理"></iframe>

真身在 [`assets/react-spa-demo.html`](../assets/react-spa-demo.html)，React 迷你 CRUD。

- **只能纯客户端**：对象存储是静态托管，带服务端的应用只能外部部署后跨域嵌
- **不走 CDN**：运行时库用全站共享的 `docs/vendor/`，demo 里写根绝对路径 `/vendor/xxx.js`；不放 `docs/assets/`，那会跟主题产物的 `site/assets/` 混居
- **免构建**：React 钉 18 的 UMD（19 起不发 UMD）配 `htm` 的 tagged template，源码即真身
- **逻辑不压缩**：vite 构建产物（`base: './'` 后整个目录丢进 `assets/`）也能嵌，但 minified 对 AI 不可读，算二等公民
- **`src` 写站点根绝对路径，且指到具体 `.html` 文件**（`/skills/<skill>/assets/xxx.html`，vite 目录产物写到 `xxx-demo/index.html`）：目录式 URL 下相对路径容易算错层级，目录 URL 能不能解析到入口又取决于托管配置。活例：[前端风格收集](../../../gallery/web/frontend-styles/index.md)的 task1–task7
- 样式给固定高度 + `loading="lazy"`

??? abstract "`assets/react-spa-demo.html` —— 演示单页源码（自包含、未压缩）"

    ```html
    --8<-- "skills/wiki-guide/assets/react-spa-demo.html"
    ```

## 可运行 JS 代码块 `{.js .run}` { #js-run }

语言机制、算法、数据结构这类不依赖 DOM 的例子，fence 上加 `.run`，读者当场看到输出：

```{.js .run}
const xs = [3, 1, 2]
console.log(xs.sort((a, b) => a - b))
console.log({ 对象也会格式化: true, 嵌套: [1, { k: "v" }] })
```

[`vendor/js-runner.js`](../../../vendor/js-runner.js) 在代码框右下角浮一个「运行」按钮、下方接输出面板，Pygments 高亮和复制按钮原样保留；脚本没加载就退化成普通代码块。

- **在 Web Worker 里跑，没有 `document` / `window`**：要摸 DOM 走[嵌入交互单页](#iframe-demo)。不用 iframe 是因为它和父页共用主线程，死循环会卡死整页；Worker 能被硬杀，死循环 5 秒后砍掉
- **值要 `console.log` 出来才看得见**，不是 REPL；对象、`Map`、`Set`、循环引用都有格式化
- **顶层 `await` 直接写**；主体跑完后会等排队的 `setTimeout` 执行完再收尾，不用 `await` 等住；从点「运行」起总共 5 秒，超时整个砍掉 —— 没 `clearInterval` 的 `setInterval` 一定撞上这条线
- **故意写坏是正当用法**：报错带行号，坏例子和好例子一样值得放
- **只能运行，不能在页面上改**（编辑态会丢掉 Pygments 高亮），所以例子要自带对照组：把「换成 X 会怎样」写成注释或第二个块

## 打码：`age:…` 小字与 ```` ```age ```` 块 { #age-mosaic }

不想公开、泄露了也不致命的小字 —— 服务器地址、域名、用户名 —— 写进源文件时就是 age 密文。HTML、`.md` 镜像、git、AI 拿到的全是密文；浏览器里显示成马赛克，点开输口令就地还原。

在仓库根目录生成密文，只用 wiki 公钥：

```bash
bash scripts/age-seal.sh      # 输一行（不回显）→ 打印 age:…，贴进反引号里
bash scripts/age-seal.sh -a   # 粘贴多行、Ctrl-D 结束 → 打印 armor，放进 age 代码块
```

````markdown
```age
-----BEGIN AGE ENCRYPTED FILE-----
…
-----END AGE ENCRYPTED FILE-----
```
````

- **按泄露后果决定放不放**：口令被猜中时这些会一起漏。地址、域名、用户名放心放；API key 先在厂商控制台设好用量上限再放；能直接接管账号的凭证不放
- **只写在反引号里**：行内代码或代码块都认，比如 `ssh ubuntu@age:…` 嵌在命令中间；正文里裸写的不认
- **举例只写 `age:…`**：脚本认 `age:` 加「age-encryption.org/v1」的 base64 前缀，前缀写全的例子会被当成密文、解不开标红
- **块解开后是素 `<pre><code>`**，没有语法高亮，要高亮的内容别放进 `age` 块
- **wiki 钥匙对专用**：私钥在部署机 `~/.config/age/wiki.key`，公钥在 `scripts/age-seal.sh`，口令锁住的副本在 [`vendor/age-init.js`](../../../vendor/age-init.js) 的 `WIKI_KEY_AGE`；换钥匙对时三处一起改，旧密文重新加密
- 命令行读 `.md` 源时，管道接 `uv run scripts/age-open.py` 整页解开；用法和凭据查找顺序写在脚本头部

活例：[开发环境第 0 步](../../../posts/ai-assistant/dev-env.md#proxy)代码块里的服务器地址和登录密码。

## 时间线 `<div class="zx-timeline" markdown>` { #timeline }

一串按时间排的事件画成一条从上往下的线，每条是一个 `###`：

<div class="zx-timeline" markdown>

### 2026-08-14 · 字体本地化 {: data-kind="配置 + 前端" }

> 开屏的时候加载很慢……改为本地化吧

`theme.font: false`，字体真身放进 `vendor/fonts/`。条目里放代码块、表格、提示框都行，线不会断。

</div>

- **div 里第一个元素必须是 `###`**；开头的 `<div …>` 和结尾的 `</div>` 前后各空一行，里面不缩进
- **`data-kind` 写分类**，渲染成标题旁的角标：只有「配置」的方块空心，含「前端」或「流水线」的填荧光绿；不写就是空心、没有角标
- **日期写在标题最前面**，从旧到新往下排，新的追加在末尾
- 样式在 `zx-theme.css` 第 10 节，纯 CSS

活例：[wiki 介绍 · 能力时间线](../../../posts/wiki/index.md#timeline)。

## 复制时跳过 `<div class="zx-no-copy" markdown>` { #no-copy }

右上角的复制按钮把页面源文件复制进对话框。读者要看、粘进对话框会被 AI 误读的内容，包起来：

```markdown
<div class="zx-no-copy" markdown>

读者要看、复制时不要的内容

</div>
```

网页上照常显示，左边一道虚线、上方一个「不复制」小字；读 `.md` 源的 AI 也看得到，只有复制按钮整块跳过；块放在页面任何位置都行。写法同时间线：开头结尾前后各空一行，里面不缩进。复制按钮另外还会去掉 frontmatter 和代码以外的 HTML 注释；目录下有页面链回的入口在 frontmatter 写 `copy_source: true`，复制时末尾带一行源地址，该写没写、不该写写了 check-links 都会拦。样式在 `zx-theme.css` 第 12 节。

活例：[盘问我](../../grilling.md)页尾的维护记录，写法见[收纳 skill · 维护记录](../skill.md#maintenance-record)。

要按读者的选择决定哪段复制，见[分支](branch.md)。

## 填空 `<input>` { #fill }

prompt 里要读者先填的空，直接写 HTML 输入框：网页上就地填，复制按钮把填的值换进源文件再复制。

```markdown
用中学生能听懂的话解释<input name="概念" placeholder="填写概念">。规则：
```

- **单行 `<input>`、多行 `<textarea>`、选项 `<select>`**，写进句子里，一个标签写在一行内；`<textarea>` 单独占一行会把段落切成两段
- **必须写 `placeholder`**：空着复制出去是【placeholder】；`<select>` 想留空，第一项写 `<option value="">提示</option>`
- **同一个变量用几次就写几次，`name` 相同**：在一个框里填，别的同名框跟着变；只用一次、也没被[分支](branch.md)用到的不写 `name`
- **`required`**：没填就不让复制，浏览器气泡指过去
- **不另写「占位没填先问」这类说明**：输入框本身就说明了哪里要填 —— 复制出去空着的是【placeholder】，直接读 `.md` 源的 AI 看到的是带 placeholder 的标签
- 单选、复选框不算填空；代码块里写的只是文字。样式在 `zx-theme.css` 第 11 节

活例：[人话翻译](../../chat-prompts/plain-talk.md)。
