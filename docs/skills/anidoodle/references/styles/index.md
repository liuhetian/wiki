<!-- 中译自 alexgreensh/anidoodle@25aae33 的 skills/anidoodle/references/styles/INDEX.md -->
# 画风索引

本页原由 `node tools/registry.mjs`（在 `engine/` 下运行）从 `engine/src/canvas-core/` 里的 `export const STYLE` 块加上 `engine/styles.legacy.json` 生成，这里是中译并加了「配方」列；`registry.mjs` 在本站只更新 `engine/styles.gen.json`，新增画风时手工在本页加一行。

| # | 画风 | 媒介 | 主图模块 | 绘制过程片模块 | 配方 |
|---|---|---|---|---|---|
| 1 | 蜡笔（`balloon`） | 有纸齿的纸上的蜡笔：来回涂抹的填色跳过纸纹凹处，暗面用一支更深的蜡笔，一支白蜡笔给高光压光，一条描了两遍的粗轮廓 | `engine/src/canvas-core/balloon.ts` | `engine/src/canvas-core/balloonDraw.ts` | — |
| 2 | 蓝晒蓝图（`blueprint`） | 直线笔和弹簧弓圆规，蘸白墨，画在普鲁士蓝的蓝晒图纸上 | `engine/src/canvas-core/blueprint.ts` | `engine/src/canvas-core/blueprint.ts` | [blueprint.md](blueprint.md) |
| 3 | 破色（`brokenColour`） | 在打过底的亚麻布上，用蘸满颜料的扁平猪鬃笔点出不透明的油彩点戳，未经调和的颜色并排放着，由眼睛去混合 | `engine/src/canvas-core/brokenColour.ts` | `engine/src/canvas-core/brokenColour.ts` | [brokenColour.md](brokenColour.md) |
| 4 | 炭笔，擦掉再画（`charcoalErasure`） | 厚棉浆纸上的柳条炭和压缩炭，用纸擦笔揉过，用可塑橡皮提亮，再在自己的残留上重画 | `engine/src/canvas-core/charcoalErasure.ts` | `engine/src/canvas-core/charcoalErasure.ts` | [charcoalErasure.md](charcoalErasure.md) |
| 5 | 彩色铅笔（`colouredPencil`） | 蜡基彩色铅笔在有纸齿的奶油色卡纸上朝一个对角方向排线，色相层层叠加，暗部交叉排线 | `engine/src/canvas-core/colouredPencil.ts` | `engine/src/canvas-core/colouredPencil.ts` | [colouredPencil.md](colouredPencil.md) |
| 6 | 梦境罩染（`dreamGlaze`） | 用很小的软笔在光滑白底上铺树脂稀释的油彩罩染：看不见笔触，每个形体在一个低低的太阳下逐像素转出体积，每条边都是硬的 | `engine/src/canvas-core/dreamGlaze.ts` | `engine/src/canvas-core/dreamGlazeDraw.ts` | [dreamGlaze.md](dreamGlaze.md) |
| 7 | 手工刺绣（`embroidery`） | 多股棉绣线，绣在山毛榉绣绷里的天然平纹亚麻布上 | `engine/src/canvas-core/embroidery.ts` | `engine/src/canvas-core/embroidery.ts` | [embroidery.md](embroidery.md) |
| 8 | 扁平矢量（`flatVector`） | 矢量软件里的钢笔工具路径，路径闭合时落下的平涂填色，带透明度渐变的长投影形状，背光面上刷一层栅格颗粒笔刷 | `engine/src/canvas-core/flatVector.ts` | `engine/src/canvas-core/flatVector.ts` | [flatVector.md](flatVector.md) |
| 9 | 民间故事绘本（`folkTale`） | 奶油色卡纸上，在 HB 铅笔画之上画水粉和水彩：前景是不透明的干笔颜料，往远处变薄成浅淡的淡彩，再到裸露的铅笔 | `engine/src/canvas-core/folkTale.ts` | `engine/src/canvas-core/folkTale.ts` | [folkTale.md](folkTale.md) |
| 10 | 剪纸拼贴（`fox`） | 一条画出来的线都没有：撕下的纸片带白色纤维毛边，剪刀剪的纸片边缘利落，每一片都在下面那片上投出一道柔和的抬起投影 | `engine/src/canvas-core/fox.ts` | `engine/src/canvas-core/foxDraw.ts` | [foxDraw.md](foxDraw.md) |
| 11 | 新闻纸半色调（`halftone`） | 卷筒胶印报纸：黑色在 45 度 AM 网屏上，加一种 15 度的橙色专色，油性墨在未漂白的机械木浆新闻纸上网点扩大 | `engine/src/canvas-core/halftone.ts` | `engine/src/canvas-core/halftone.ts` | [halftone.md](halftone.md) |
| 12 | 等轴剖视（`isometric`） | 真正 2:1 等轴网格上的扁平矢量平面，每种材质三个色调，边缘清晰，按钢笔工具的顺序画 | `engine/src/canvas-core/isometric.ts` | `engine/src/canvas-core/isometric.ts` | [isometric.md](isometric.md) |
| 13 | 马克笔漫画（`koi`） | 酒精马克笔的赛璐珞平涂，阴影是硬边，上面一条厚重的轮廓，越背光越粗 | `engine/src/canvas-core/koi.ts` | `engine/src/canvas-core/koiDraw.ts` | [koiDraw.md](koiDraw.md) |
| 14 | 孔版印刷（`lighthouse`） | 大豆油墨，每个滚筒一层，各自带着套印偏移以正片叠底叠加；其余每种颜色都是叠印出来的，色调是按每种油墨的网角加的半色调网屏，白色就是空白纸 | `engine/src/canvas-core/lighthouse.ts` | `engine/src/canvas-core/lighthouseDraw.ts` | [lighthouseDraw.md](lighthouseDraw.md) |
| 15 | 低多边形（`lowPoly`） | 三角网格用手算经一台针孔相机投影，每个面片按它的法线对着一个低低的太阳做平面着色，按画家算法由远到近排序；没有 3D 引擎 | `engine/src/canvas-core/lowPoly.ts` | `engine/src/canvas-core/lowPoly.ts` | [lowPoly.md](lowPoly.md) |
| 16 | 单线雕版（`mellan`） | 一条不间断的雕刻线，宽度跟随一个程序生成的色调场：整幅画就是一笔 | `engine/src/canvas-core/mellan.ts` | `engine/src/canvas-core/mellanUnspool.ts` | — |
| 17 | 世纪中期水粉（`midCentury`） | 暖色插画板上不透明、哑光的设计用水粉，干笔在平涂上拖过，一条松散的笔墨线套印错位地印上去 | `engine/src/canvas-core/midCentury.ts` | `engine/src/canvas-core/midCentury.ts` | [midCentury.md](midCentury.md) |
| 18 | 黑板粉笔（`moonPhases`） | 石板黑板上用粉笔侧面擦出的薄涂，受光的边缘画两遍，每一笔都被板面的颗粒打断，两侧带着粉尘，还有旧课留下的残影 | `engine/src/canvas-core/moonPhases.ts` | `engine/src/canvas-core/moonPhasesDraw.ts` | [moonPhasesDraw.md](moonPhasesDraw.md) |
| 19 | 布面油画（`paintedOil`） | 在铺过底色的亚麻画布上用猪鬃笔画不透明油彩，从少油的铺大色到多油的厚涂 | `engine/src/canvas-core/paintedOil.ts` | `engine/src/canvas-core/paintedOil.ts` | [paintedOil.md](paintedOil.md) |
| 20 | 玩具剧场纸拼贴（`paperCraft`） | 一座硬纸板玩具剧场：花纹纸和色卡纸（sugar paper）或剪或撕，水粉上色的剪纸带一圈白色贴纸边，每一片都有卡纸的厚边，并且和后面的布景片之间留有空隙 | `engine/src/canvas-core/paperCraft.ts` | `engine/src/canvas-core/paperCraft.ts` | [paperCraft.md](paperCraft.md) |
| 21 | 像素画（`pixelArt`） | 一张 120x120 的格子网格，每格是声明好的 16 种调色板颜色之一，一次放一格，再按整数倍放大，不做平滑 | `engine/src/canvas-core/pixelArt.ts` | `engine/src/canvas-core/pixelArt.ts` | [pixelArt.md](pixelArt.md) |
| 22 | 圆珠笔速写（`pocketWatch`） | 奶油色卡纸上的一支蓝色圆珠笔，粗细几乎恒定；色调只来自排线落在哪里，外加用力的一笔停下时留下的墨团 | `engine/src/canvas-core/pocketWatch.ts` | `engine/src/canvas-core/pocketWatchDraw.ts` | [pocketWatchDraw.md](pocketWatchDraw.md) |
| 23 | 铅笔水彩（`ranunculus`） | 冷压纸上的石墨和固体水彩：淡彩从来不会完全填满它的轮廓，形体朝一个光源做明暗，石墨压在颜料上面 | `engine/src/canvas-core/ranunculus.ts` | `engine/src/canvas-core/ranunculusDraw.ts` | [ranunculusDraw.md](ranunculusDraw.md) |
| 24 | 橡皮管动画（`rubberHose`） | 在蓝铅笔草稿上覆一张透明赛璐珞片，用恒定压力画墨汁线，背面涂平的灰色颜料，拍摄后印在黑白胶片上 | `engine/src/canvas-core/rubberHose.ts` | `engine/src/canvas-core/rubberHose.ts` | [rubberHose.md](rubberHose.md) |
| 25 | 档案剪贴簿（`scrapbook`） | 泛黄起斑的棉浆纸相册页；撕开的卡片、玻璃纸胶带、麻绳上的一只晾衣夹；手工上色的铜版雕刻画；打字机字、勒索信式的剪贴字母、红笔、橡皮图章 | `engine/src/canvas-core/scrapbook.ts` | `engine/src/canvas-core/scrapbook.ts` | [scrapbook.md](scrapbook.md) |
| 26 | 刮画板（`scratchboard`） | 黑色墨汁下面是白色瓷土；每个笔触都是用刀或刮笔尖把墨刮掉 | `engine/src/canvas-core/scratchboard.ts` | `engine/src/canvas-core/scratchboard.ts` | [scratchboard.md](scratchboard.md) |
| 27 | 钢笔点画（`stipple`） | 一支 0.25 mm 针管笔垂直点在热压布里斯托纸上；色调只来自点的密度 | `engine/src/canvas-core/stipple.ts` | `engine/src/canvas-core/stipple.ts` | [stipple.md](stipple.md) |
| 28 | 绘本铅笔 + 水彩（`storybook`） | 绘本式的石墨和柔和的固体水彩，为一个反复出场的角色而画 | `engine/src/canvas-core/storybook.ts` | `engine/src/canvas-core/storybookDraw.ts` | [storybookDraw.md](storybookDraw.md) |
| 29 | 水墨画（`sumiE`） | 一支饱蘸墨汁的软毫笔，五种浓淡，画在未上胶矾、吸水的生宣纸上，盖一方朱砂印 | `engine/src/canvas-core/sumiE.ts` | `engine/src/canvas-core/sumiE.ts` | [sumiE.md](sumiE.md) |
| 30 | 玩具积木（`toyBrick`） | 注塑 ABS 玩具积木，以正交视图渲染成扁平塑料感：各面色调按立方体规则，倒角高光，接缝细线，真实的凸点，一道柔和的地面投影 | `engine/src/canvas-core/toyBrick.ts` | `engine/src/canvas-core/toyBrick.ts` | [toyBrick.md](toyBrick.md) |
| 31 | 浮世绘套色木版（`woodcut`） | 用马楝（baren）把水性颜料从手刻的樱桃木版上拓印到潮湿的楮皮和纸上：一块墨线主版，若干平涂色版，晕染（bokashi）的擦拭渐变 | `engine/src/canvas-core/woodcut.ts` | `engine/src/canvas-core/woodcut.ts` | [woodcut.md](woodcut.md) |
| 32 | 钢笔淡彩（`wren`） | 先上湿淡彩，漫过线条并沿每个形状的底边沉积，带水渍回流，然后用一支弹性笔尖，下压时粗、提起时细如发丝 | `engine/src/canvas-core/wren.ts` | `engine/src/canvas-core/wrenDraw.ts` | [wrenDraw.md](wrenDraw.md) |

共 32 种画风。
