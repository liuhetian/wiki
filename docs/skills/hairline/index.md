---
name: Hairline 等距线稿图
description: "要给网页画一张会回应指针的等距线稿插图时用（产品页主图、空状态、文档配图；给一个想法，或一个现成的 SVG 图标、标志）：在 @lucasmarkes/hairline 的固定引擎上只写一个图形文件，守十条规则，构建、校验、拍八张图看样直到合格，交一个零依赖、双击就能打开的单文件 HTML"
argument-hint: "[idea]"
copy_source: true
---

# Hairline 等距线稿图

网页上要一张会回应指针的小插图：一只托盘、一排柱子、一台机柜，用等距视角的单线条立体画成，指针移上去它就做出这个物件该有的反应。Hairline 是一套现成的这种图形，它的引擎和页面模板是固定的；你只写一个图形文件，十条规则卡住画法，再用脚本构建、校验、拍图看样，不合格就改，直到合格再交。如果要调用 2 次以上本 skill 中的脚本，直接将[本 skill](hairline.tar.gz)下载到本地。`build.mjs` 要读同目录的 `kernel.js` 和 `bench.html`，`look.mjs` 又要调 `build.mjs` 和 `validate.mjs`，单取一个脚本跑不起来。

你要做的是一个 Hairline 风格的图形：等距线稿，用圆角实体、单一笔画搭成，会回应指针。交付物是一个 HTML 文件，什么都不用装。`@lucasmarkes/hairline` 包里的六个图形就是标准线；[examples/terrain.js](examples/terrain.js) 和 [examples/riffle.js](examples/riffle.js) 是其中两个，格式就是你要写的格式。

你只写一样东西：图形。引擎 [scripts/kernel.js](scripts/kernel.js) 和页面 [scripts/bench.html](scripts/bench.html) 是固定的。绝不修改它们，绝不贴一份改过的副本，也绝不把引擎已经给的东西重写一遍。

下面提到的文件都在本 skill 目录里。图形和页面写在用户的工作目录里：在那里运行 `build.mjs`、`validate.mjs` 和 `look.mjs`，按它们在本 skill 目录里的路径调用。

## 0. 来源

只在请求带了一个 `.svg` 文件时做：用户给了一张图标、标志或插画，想让它变成 Hairline 图形。一次只做一个图形；给了几个 SVG，先问先做哪个。绝不让 SVG 本身动起来，也绝不描它的路径：图只提供身份，图形用实体重新搭，保留它的比例和部件。

运行 `node <skill 目录>/scripts/read.mjs <file.svg>`：它把 SVG 渲染成一张图，再写一张卡片记下量到的东西，两个文件都写在工作目录里。然后读[从现成的 SVG 起](reference/source.md)，回答里面的问题。到这里物件和它的部件就定死了：第 1 步的每个概念都保留它们。

## 1. 概念

读[从想法到概念](reference/concepts.md)。里面有一节讲空状态，一节讲从标志画图形。然后给出两三个概念，每个一行：

> **名字。** 物件。指针对它做什么。读数显示什么。tour 停在哪里。

等用户挑。只有用户带着已经选好的物件和手势来的时候，才跳过这一步。没人可问时，选静止姿态最强的那个概念，并说明你选了哪个。

有来源（第 0 步）时，给概念前先用一行说你把图读成了什么、留下了哪些部件；用户纠正了你的读法，就按用户的读法重读，再搭任何概念。每个概念都保留物件和部件，彼此只在手势上不同；手势已经随请求给定的，就在形态和读数上不同。

一个图形，一个想法。要靠标签才看得懂的概念，还不算概念。

## 2. 构建

1. 读[十条规则](reference/rules.md)。这十条不是建议：违反任何一条的图形都不算完成。
2. 读 [scripts/kernel.js](scripts/kernel.js) 顶部的索引：哈希行下面那段注释，一直到 `var HL`。它列出了你能调用的一切。不要读它下面的代码。
3. 读和你的概念更接近的那个示例：连续的场用 [examples/terrain.js](examples/terrain.js)，离散的条目用 [examples/riffle.js](examples/riffle.js)。
4. 在用户的工作目录里把图形写成 `<name>.js`，形状照示例：从 `HL` 里取你要的东西，定义返回 `{ set, destroy }` 的 `mount({ stage, svg, read }, value)`，文件以 `hairline({ name, means, rules, range, tour, mount })` 结尾。
    - `name`：小写，一个词或用连字符连起来。
    - `means`：一句话，最多 140 个字符，说这个图形表现什么。它就是舞台下面那行字。
    - `rules`：这个图形最倚重的几条规则的编号。
    - `range`：滑块驱动的那一个数，分别在 intensity 为 0、0.5 和 1 时的值。中间那个是默认值，三个值朝同一个方向变。`mount` 的 `value`，以及滑块移动时 `set(value)` 收到的 `value`，就是这个数：图形自己的量，按 `range` 读，不是 0 到 1。
    - `tour`：页面自动演示时那只看不见的指针要去的三到六个 viewBox 点，`null` 表示离开；这一圈就是手不在页面上时陌生人看到的样子。写字面量 `[x, y]` 数字，至少有一个是点。图形自己从不自动演示：演示由页面的播放键和包来做。
5. 组装：`node <skill 目录>/scripts/build.mjs <name>.js` 写出 `hairline-<name>.html`，第 3 步每跑一次 `look.mjs` 也会写出它。没有 Node 时，复制一份 `bench.html`，用文件操作把 `kernel.js` 的内容放到 `/*KERNEL*/` 处、把你的图形放到 `/*FIGURE*/` 处，别的一概不改。

## 3. 检查

1. 运行 `node <skill 目录>/scripts/look.mjs <name>.js --answer x,y,z --edge x,y,z`，有来源时加 `--source <file.svg>`；这些点是你图形里的世界坐标点，按[看样](reference/look.md)说的取。它会构建页面、校验、把八张图拍在一张拼图上（`hairline-<name>-look.png`），并检查画框、读数和控制台。打印出来标为失败的每一行都改掉，再跑，直到它以 0 退出。
2. 读[看样](reference/look.md)，再看拼图，回答里面的问题。有不过的就改，然后回到 1。

`look.mjs` 需要浏览器，第一次会把 `playwright-core` 装到本 skill 目录之外，只装一次。没有浏览器时，每次构建后用 `node <skill 目录>/scripts/validate.mjs hairline-<name>.html` 检查，看样照[看样](reference/look.md)的「没有浏览器时」做。没有 Node 时，读 [scripts/validate.mjs](scripts/validate.mjs) 顶部的检查清单，逐条用你的代码作答。

校验器拒绝的页面不交。没看过样，不要说看样做完了。

## 4. 交付

能发成 artifact 就把 `hairline-<name>.html` 发成 artifact。发不了，就把文件留在用户能打开的地方，并说明在哪。然后各用一行说：

- 隐喻：物件是什么，指针对它做什么；
- 它倚重哪几条规则；
- tour：按顺序停在哪里；
- 任何你没能验证的东西（没有 Node、没有浏览器），直说。
- 图形来自别人的标志时：页面上是另一家公司的标志，发不发布由对方定。

然后请用户按页面上的播放键，或者用 `?play=1` 打开，说这一圈有没有把图形的故事讲出来。没人可问时，说明 tour 没人评判过。

## 5. 调整

用户要改时，只改 `<name>.js`，然后再跑一次 `look.mjs`，看新的拼图。第十版和第一版守同一条标准线。改这一圈只改 `tour`。

## 常见跑偏

| 如果你发现自己在 | 改成 |
| --- | --- |
| 往图里加标签、数字或字母 | 用几何说（规则 10）；名字写进 `read.textContent` |
| 想用颜色、填充或辉光 | 把一笔从 `sil` 换成 `hi`（规则 04） |
| 写定时器、`requestAnimationFrame` 或 CSS 动画 | `register(stage, tick)`，配弹簧或补间（规则 07 和 08） |
| 拿指针去比此刻画在屏上的姿态 | 拿它比静止姿态或目标姿态（规则 01） |
| 画一个有十二条棱的盒子 | 用两个圆角环做 `prism`：一个轮廓加一道折痕（规则 09） |
| 把一个部件画成普通的圆角块 | 给它那几个让它成为它的特征，就是你在概念里点过名的那些（[从想法到概念](reference/concepts.md)） |
| 因为省事，让静止姿态平、空或对称 | 去构图：静止姿态就是缩略图（规则 05） |
| 在盒子上印一个标志说明它是谁的 | 把标志搭成物件本身，或者不放（[从想法到概念](reference/concepts.md)「从标志画」） |
| 为了让某样东西能跑去改引擎或页面 | 错的是图形；改图形 |
| 让 tour 把每个部件挨个走一遍 | 三个停点，各展示一种不同的反应，再离开：一圈是一句话，不是一份清单 |
| 塞进第二个想法 | 删掉：一个图形，一个想法 |
| 照 SVG 描路径，或者抄它的坐标 | 按卡片给的比例把部件搭成实体（[从现成的 SVG 起](reference/source.md)） |
| 留着 SVG 里只是装饰的部件 | 丢掉：两三个部件就构成物件 |

<div class="zx-no-copy" markdown>

---

维护记录：[从哪来、改了什么](../../maintenance/skills/hairline.md)。正常使用不用看，出问题再看。

</div>
