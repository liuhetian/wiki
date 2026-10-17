<!-- 中译自 alexgreensh/anidoodle@25aae33 的 skills/anidoodle/references/styles/koiDraw.md -->
# 马克笔漫画，绘制过程（koiDraw）

模块：`engine/src/canvas-core/koiDraw.ts`，建在 `koi.ts` 之上（`drawKoi` 的可选第 4 个参数 `KoiClock`；不传它时每个分支都走原来的调用，样张的 md5 不变：1x dfd5350f5c2b94d030d7c62e34d2dc7d，2x 27ebed84ad3a09aac4336d124d6e2707）。

**过程。** 不可复印蓝（non-photo blue）起稿（脊柱动势、体块、部件）-> 赛璐珞平涂色块，最浅的先画，每块都用凿形头马克笔来回几遍铺上，起笔收笔都越过铅笔线；大面积（池塘）用一块块短笔触来填，所以它的前沿参差不齐，永远不是一抹而过 -> 硬边阴影形状和地面投影 -> 细节（鳞片弧线、鳍条、条纹、水波环、中性笔白色高光）-> 厚重的软头笔轮廓**最后**画，每一笔沿它的中心线长出来。

**层叠。** 每个元素每帧都按它自己的 z 顺序画，只有它的范围在增长，所以一片先于身体铺下的鳍仍然在身体下面。这里的马克笔是不透明的：铅笔在它下面就看不见了。

**工具包。** `koiDrawKit.ts`：`streaks`/`streakClip`（马克笔或毛笔铺一块平涂），`cut`（按弧长取一条线的前 q 部分），`part`/`stagger`，`sequence`/`cueClock`（严格的 cue 表：缺了某个 cue 会抛错，而不是在第 0 帧把那一笔画成已完成的样子）。
