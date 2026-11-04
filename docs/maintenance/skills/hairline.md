---
description: "Hairline 等距线稿图的维护记录：吸纳自 lucasmarkes/hairline（MIT），钉在 37d2e78（v0.5.1）；hairline-create 收齐中译、hairline-adopt 并进入口，脚本、引擎、页面模板和示例一字没改，文档进 reference/、脚本进 scripts/；Gallery demo 用 npm 包 0.5.1 的构建产物原样跑；未实跑"
---

# Hairline 等距线稿图（hairline）

[Hairline 等距线稿图](../../skills/hairline/index.md)和 Gallery 的 [Hairline 等距线稿交互图形](../../gallery/web/collected/gallery-hairline.md)的维护记录。两面出自同一个上游，记录写在这一篇；概要页 [Hairline](../../projects/hairline/index.md) 照概要的规矩，版本写在它自己的脚注里。

- **上游**：lucasmarkes/hairline[^repo]，作者 Lucas Marques（GitHub 账号 lucasmarkes），MIT，许可证原文不随附。原文提到的出处：
    - `rules.md` 开头说十条规则来自这个包背后的研究[^study]，这句挪到这里，skill 里删掉
    - 上游站点的 inspo 页（`apps/site/app/inspo/page.tsx`）写了来历：作者用 Claude Opus 加一个实时预览的 Artifact 做出这套图形，每次纠正都写成一条规则
- **commit**：钉在 `37d2e78`（2026-10-14，v0.5.1），2026-11-04 读时是最新；10-01 到 10-14 发了六版，之后三周没动。skill 目录 14 个文件、约 2.4k 行，引擎 `kernel.js` 是包里 `src/core` 的自包含拷贝，不依赖上游 monorepo，算不上「脚本重、更新快」，所以照收纳步骤收齐
- **收成了什么**：
    - `skills/hairline/`：标准 skill。`hairline-create/SKILL.md` 中译成 `index.md`；`rules.md`、`concepts.md`、`look.md`、`source.md` 中译进 `reference/`；`kernel.js`、`bench.html`、`build.mjs`、`validate.mjs`、`look.mjs`、`read.mjs` 原样进 `scripts/`；`examples/terrain.js`、`examples/riffle.js` 原样留在 `examples/`
    - `gallery/web/collected/gallery-hairline.md`：极简收。demo 是 `assets/hairline-demo/`：`hairline.js` 是 npm 包 `@lucasmarkes/hairline@0.5.1` 的 `dist/index.js`，用 `npm pack` 取下，原样未改、没压缩，`.map` 和 React 入口没带；`index.html` 是本站写的，33 个图形按 README 的顺序排成网格，一根 intensity 滑块和一个自动演示开关同时控制全部
- **跳过**：
    - `hairline-adopt/SKILL.md` 不单独成子 skill：它只是带着 SVG 去调 create 的第 0 步，独有的几句并进了入口，见下
    - README：装法（`npm i`、`npx skills add`、shadcn）、选项表、主题变量
    - `packages/` 的 TS 源码和测试、`apps/site` 的 Next.js 站点（含 12 个 skill 做出的成品页 `apps/site/public/skill/`）、`registry/`、`fixtures/`、`scripts/`、CI、CHANGELOG、CONTRIBUTING、`assets/hero.gif`、`LICENSE`
- **翻译之外的改动**：
    - 文件挪位：上游一个平目录，`.md` 进 `reference/`，脚本连同 `kernel.js`、`bench.html` 进 `scripts/`。脚本之间只按同目录找彼此和 `kernel.js`、`bench.html`，一起挪就不用改；脚本打印的提示里仍说 `look.md`、`source.md`，指的是 `reference/` 下同名的页
    - 命令里的 `<skill folder>/look.mjs` 改成 `<skill 目录>/scripts/look.mjs`，其他脚本同理；正文提到的文件名改成相对链接，`SKILL.md` 改成链到入口
    - 并进 adopt：第 0 步加「一次只做一个图形，给了几个先问先做哪个」「绝不让 SVG 本身动起来，也绝不描它的路径」；第 1 步加「出概念前先用一行说把图读成了什么、留下了哪些部件，用户纠正了就重读」；第 4 步交付清单加「图形来自别人的标志时，说明发不发布由对方定」
    - 入口：`name` 改成「Hairline 等距线稿图」，`description` 改写成什么时候用、做什么，`argument-hint` 照留；开头补一段领域建模和整包声明，说明为什么单取一个脚本跑不起来；页尾加维护记录链接
    - 脚本、`kernel.js`、`bench.html`、两个示例一字没改：`validate.mjs` 会核 `kernel.js` 首行的 sha256，引擎改一个字就报错
- **未实跑**：本机执行上游脚本被权限拦下，`build.mjs`、`validate.mjs`、`look.mjs` 都没在新目录结构下跑过；Gallery demo 没在浏览器里看过，效果由用户看

[^repo]: [lucasmarkes/hairline @ 37d2e78](https://github.com/lucasmarkes/hairline/tree/37d2e78dcb333ab30c3338e28ed4a690364ea014)，2026-11-04 读。
[^study]: [Hairline](https://lucasmarkes.com/lab/hairline) —— 作者的长文，讲这些图形怎么画、为什么只用线；只在上游 `rules.md` 开头提到，没读。
