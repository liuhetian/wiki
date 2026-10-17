<!-- 中译自 alexgreensh/anidoodle@25aae33 的 skills/anidoodle/references/styles.md -->

# 画风：九种手笔，以及画它们用的工具包

画风是做出一种**笔触**的方式，它远不止一套调色板。同一只狐狸，交给一个拿蜡笔的孩子、一位拼贴艺术家和一位版画家来画，形状、边缘和光线都会变，连笔触落下的顺序也会变。给一幅画重新上色，你得到的只是同一幅画换了九套衣服。下面每一张样张都是 `engine/src/canvas-core/` 里一个能运行的模块：用它的画风画画之前先打开它，因为头部注释就是配方，代码就是证明。

任意渲染其中一个：`node tools/still.mjs koi --out out/koi.png`。整张总览页：`node tools/still.mjs styleGallery`。

## 这九种

| # | 画风 | 模块 | 造就它的笔触 |
|---|---|---|---|
| 1 | 铅笔水彩 | `ranunculus.ts` | 淡彩永远填不满它的轮廓，形体朝**一个**光源塑造，石墨线画在颜料之上 |
| 2 | 马克笔漫画 | `koi.ts` | 平涂的赛璐璐填色带一道硬阴影边，一条粗重的轮廓线，在背光的一侧变粗 |
| 3 | 圆珠笔速写 | `pocketWatch.ts` | 一支圆珠笔，线宽几乎恒定；明暗只来自排线**落在哪里**（单向、交叉、第三个方向），再加上用力的一笔停下时留下的墨团 |
| 4 | 蜡笔 | `balloon.ts` | 来回涂抹的填色跳过纸面的凹谷，暗面上再叠一支更深的蜡笔，用一支白蜡笔把高光压亮，一条粗轮廓描了两遍 |
| 5 | 墨线淡彩 | `wren.ts` | 先上湿淡彩，漫过线条，沿每个形状的**底**边沉积，带回花（backrun）；然后上弹性笔尖，下压处粗、提笔处细如发丝，光线吃掉边缘的地方轮廓留着开口 |
| 6 | 黑板粉笔 | `moonPhases.ts` | 用粉笔侧面擦出的薄涂，受光的月缘反复画两遍，每一笔都被黑板的颗粒打断、两侧落着粉尘，还有旧课残留的痕迹 |
| 7 | 剪纸拼贴 | `fox.ts` | 一条画出来的线都没有：撕开的纸片带着白色的纤维毛边，剪刀剪的纸片边缘利落，每一片都带着柔和的影子从下面那片上翘起 |
| 8 | 孔版印刷（Risograph） | `lighthouse.ts` | 每个滚筒一层，各自透过自己的套印偏移做正片叠底；其他每一种颜色都是**叠印**出来的；明暗是每种油墨角度下的一层半调网屏；白色就是纸的本色 |
| 9 | 单线雕刻 | `mellan.ts` | 一条不间断的螺旋线，宽度随一个程序化的明暗场变化：整幅画就是一笔 |

另外两种手笔在完整示例影片里（[example/](../example/index.md)）：一种**氰版蓝图**（直线笔、`draftTooth` + `blueMottle` 瓦片、`inkGroup` 光晕、倾斜哥特体字），以及一个**绘本铅笔 + 水彩**角色（`storybook.ts`）。`print.ts` 是同一个角色的孔版印刷版。

## 怎么挑

先按**用途**挑，再看外观。同一个想法放进每一种画风，读起来都不一样。

| 作品是 | 首选 |
|---|---|
| 温暖、有人情味，一个带笑容的品牌 | 铅笔水彩、蜡笔、剪纸 |
| 严肃的主题、一份报告、一篇创始人文章 | 圆珠笔、墨线淡彩、雕刻 |
| 讲解片、原理说明、信息图 | 黑板粉笔、蓝图、带制图标注的圆珠笔 |
| 热闹的、社交媒体、一次发布 | 马克笔漫画、孔版印刷 |
| 海报、封面、一张人们会留着的图 | 雕刻、孔版印刷、剪纸 |

一个品牌挑**一种**手笔，并一直用下去：之后的每一张主视觉、插图和卡片都用同一种笔触，正是这一点让一组作品看起来像一个体系。

## 你自己的画风

从最接近的样张出发，改**笔触**，绝不只改颜色：

1. **用物理的说法讲清媒介。** 什么东西接触纸面，有多湿，怎么提起，纸面又怎么回应。在写任何代码之前把它写成头部注释，就像上面那九种一样。
2. **给用笔的手笔设一个 `Medium`**：`{ nib, taper, pressure, retrace, wobble, rough }`。对比 `PENCIL`、`BIRO_M`（pocketWatch）、`CRAYON_M`（balloon）、`INK_M`（wren）、`CHALK_M`（moonPhases）、`LITHO`（riso）。圆珠笔几乎没有收锋；弹性笔尖的压力变化很大。
3. **决定笔触的顺序。** 先淡彩后线条（墨线淡彩），先线条后淡彩（铅笔水彩），一版接一版（孔版印刷），一片接一片（拼贴）。顺序就是画风的一半。
4. **挑纸**：用哪些瓦片，多大的不透明度，最后叠上去。
5. **用它渲染一张最难题材的静帧**，在把这种画风用到任何别的地方之前，对照 [realism-and-craft.md](realism-and-craft.md) 里的手艺对照表批评它。

## 工具包

一切都是几何，再加几层合成。没有滤镜，没有素材文件。

**`core.ts`** 是绘图表面和形状辅助函数。

- `new Gfx(ctx, env, frame, medium)`，绘图表面。`frame` 驱动运动中的线条抖动；静帧传 0。
- `g.group("paint" | "ink" | "plain", fn, { blend, alpha, off, textures, blur })`：在一个图层上绘制，给它加一次纹理，只合成被画到的部分。`paint` 会柔化并加颗粒，`ink` 得到铅笔纸纹，`plain` 用于剪纸或印刷类媒介。
- `g.pen(pts, { w, color, seed, closed, wobble, boil, taper, opacity, retrace, progress })`：一道带收锋、按压力塑形的笔画。`progress < 1` 只画一部分，沿中心线截断，观众看到一条线正在被**画出来**，靠的就是这个。
- `g.form(pts, color, shade, { light, hi })`：朝一个光源着色的体块，可选高光。
- `g.wash(pts, color, { alpha, dx, dy, shrink, rim })`：漏出轮廓的水彩，颜料积在边缘。
- `g.fill`、`g.hatch`、`g.glow`、`g.paper(tile, opacity)`、`g.vignette`、`g.inkGroup`（带光晕的线条）。
- 形状：`oval`、`softBox`、`arc`、`line(a, b, bow)`、`tube(centre, r0, r1)`、`poly`、`turn`、`sample`（把折线平滑化）、`jitter`、`displace`（噪声位移后的几何）、`halftone`。
- 随机性：`rng(seed)`、`fractal(seed, x, y, fx, fy, octaves)`。
- 瓦片：`paper`、`coldpress`、`pencilTooth`、`washGran`、`risoSpeck`、`risoMottle`、`draftTooth`、`blueMottle`。

**`gallery.ts`** 存放各样张共用的具象辅助函数：`body(ctrl, halfWidth)`（一根带宽度剖面的脊线，用于鱼、鸟、四肢）、`profile(knots)`、`ink(g, centre, color, opts)`（一条在背光一侧变粗的轮廓带）、`blob`（一个有机的闭合形状）、`hatchRuns`（裁切到形状之内的排线）、`fillShape`、`clipped`、`inside`、`mix`、`resample`。

**`riso.ts`** 负责版画：`INK` 颜色、`drum(g, offset, fn)`、`screen(...)`（由一个明暗函数驱动的半调网屏）、`REG` 偏移、`cut`（手工裁切的边缘）、`plateMarks`、`across`（横跨一个形状的 0..1 渐变）。

**字母用笔画画出来，所以从不加载任何字体。**

- `drafting.ts`：`letter(g, text, x, y, { cap, color, seed, w, progress })`，单线倾斜哥特体大写字母，也就是工程图上的那种字。用于标签、标注、说明文字、信息图里的数字。`progress` 把它一笔一笔写出来。
- `lettering.ts`：尖头笔书写体，宽度取决于每一段往下走了多少。它只拼写一个专门绘制好的词（横幅上那个）；换一个新词，就意味着用同样的方式为它绘制中心线。
