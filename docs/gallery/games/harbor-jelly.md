---
description: "本站照小红书「你的提示音」的视频《果冻码头》复刻：一块方形果冻海上的港口沙盘，吊机搬箱、货轮离港绕圈，点水起涟漪、长按推浪、双击从三面墙掀起大浪，7 段海报式导览；下面是原片和 AI 读过的 13 张原片帧、原话 prompt、Claude Code 约 80 分钟做完的经过、四问问答（水面五层浪怎么叠、大浪怎么反射和被防波堤挡住、清水靠折射看出浪、水下为什么从切口看也对）和完整 Vite 工程"
---

# 果冻码头

<iframe src="/gallery/games/assets/harbor-jelly/index.html"
        style="width:100%;height:640px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="果冻码头：方形果冻海上的港口沙盘，点水起涟漪、长按推浪、双击掀大浪"></iframe>

[单独打开](assets/harbor-jelly/index.html){ target="_blank" rel="noopener" }

一块 40×40 的方形沙盘：东边一条陆地是码头、集装箱堆场和樱花街区，其余是透明的海，侧面切开能看到海水和土层。打开后自动导览 7 段 —— 小小港口、港口作业、樱花街区、海边散步、水下世界、真实交互、轮到你了 —— 标题、副标题和进度线跟着切，镜头在段与段之间平移；右下角 01–07 跳段，空格或「暂停 / 导览」切换，`R` 从头来。竖屏是海报版式，横屏文字放左栏。

- **拖动**：在哪儿拖都是转视角，水面上也一样；右键或 Shift 拖动平移，滚轮或双指缩放
- **点水面**：一圈细涟漪，外加一道更大的浪推开，碰到玻璃壁和防波堤弹回来
- **长按水面再拖**（约 0.25 秒，出现白色光圈；电脑上按住 Alt 或 Ctrl 直接拖）：手指下压出一个坑，拖着走留下尾浪，整片海朝拖动方向倾斜；松手后坑弹回来变成一圈浪，整块果冻晃几下再平静
- **双击**（手机上快速点两下，或按 `W`）：从离双击点最近的那面玻璃墙 —— 西、北、南三面，码头那面不会 —— 掀起一道浪峰齐平的大浪，撞上货轮、灯塔和对面的墙溅起水花，再退回一道小一点的回浪；最多三道同时在海上
- **声音**默认关，`M` 或「声音」打开：水滴声、汽笛、大浪的涌声和拍岸声

港口自己在运转：红、蓝两台岸桥吊机错开半个周期在船和岸之间搬箱；货轮停够 32 秒，吊机做完手上这趟、抬起吊臂，拖轮把货轮横着拉离码头，在港内绕一圈再推回泊位。船、浮标、轮胎都跟着水面起伏。

## 原片和 prompt { #prompt }

<figure>
  <video src="/gallery/games/assets/harbor-jelly-original.mp4" poster="/gallery/games/assets/harbor-jelly-original-poster.webp" controls preload="none" playsinline width="300"></video>
  <figcaption>原片：小红书「你的提示音」《果冻码头》Day 2，78 秒[^original]</figcaption>
</figure>

原作是 WebGPU 网页逐帧录下来的。工作目录里放着本站 [Agent 基础能力](../../skills/agent-io/index.md)的一份副本，用 Claude Code 的 `/goal` 下达 —— 它把这句话设成会话目标，挂一个 Stop hook，目标没达成就不让停，AI 中途不问人：

> /goal （小红书分享文案和链接）参考 agent-io 目录 下载下来，并直接使用网页3d进行复现

### AI 看到的原片 { #frames }

AI 没有直接看视频 —— 下载后抽成图看。下面是它读过的 13 张，按读的顺序原样收录。

**先看全片**：读视频脚本出的关键帧拼图，17 帧，按场景切换取、不够的均匀补。

<div class="grid" markdown>

<figure markdown>
  ![关键帧拼图第 1 张：第 7 到 60 秒的 12 帧](assets/harbor-jelly-original/contact_sheet_01.jpg)
  <figcaption>第 7–60 秒，12 帧</figcaption>
</figure>

<figure markdown>
  ![关键帧拼图第 2 张：第 63 到 78 秒的 5 帧](assets/harbor-jelly-original/contact_sheet_02.jpg)
  <figcaption>第 63–78 秒，5 帧</figcaption>
</figure>

</div>

**分清 7 段**：AI 自己用 ffmpeg 再抽每 2 秒一帧，拼成两张。

<figure markdown>
  ![每 2 秒一帧拼图：第 0 到 30 秒](assets/harbor-jelly-original/dense_sheet_a.jpg)
  <figcaption>第 0–30 秒，16 帧</figcaption>
</figure>

<figure markdown>
  ![每 2 秒一帧拼图：第 32 到 64 秒](assets/harbor-jelly-original/dense_sheet_b.jpg)
  <figcaption>第 32–64 秒，17 帧</figcaption>
</figure>

**看建模细节**：7 段各取一帧高清。第 1 段是整帧，其余裁掉上面的标题和下面的说明，只留画面。

<div class="gallery-grid" markdown>

![01 小小港口 · 第 5 秒，整帧](assets/harbor-jelly-original/full05.jpg){ loading=lazy }
![02 港口作业 · 第 12 秒](assets/harbor-jelly-original/c12.jpg){ loading=lazy }
![03 樱花街区 · 第 20 秒](assets/harbor-jelly-original/c20.jpg){ loading=lazy }
![04 海边散步 · 第 29 秒](assets/harbor-jelly-original/c29.jpg){ loading=lazy }
![05 水下世界 · 第 38 秒](assets/harbor-jelly-original/c38.jpg){ loading=lazy }
![06 真实交互 · 第 47 秒](assets/harbor-jelly-original/c47.jpg){ loading=lazy }
![07 结尾 · 第 56 秒](assets/harbor-jelly-original/c56.jpg){ loading=lazy }

</div>

**读文案、看交互**：7 段底部的说明文字裁出来摞成一张；交互段第 43–54 秒每 0.5 秒一帧，看拖动时海面怎么倾斜、涟漪怎么扩散。

<div class="grid" markdown>

<figure markdown>
  ![7 段底部的说明文字摞成一列](assets/harbor-jelly-original/cap_sheet.jpg){ width="300" }
  <figcaption>7 段的说明文字，按文件名排序拼的，第 1 段（第 5 秒）排在倒数第二</figcaption>
</figure>

<figure markdown>
  ![交互段第 43 到 54 秒每 0.5 秒一帧](assets/harbor-jelly-original/inter_sheet.jpg)
  <figcaption>第 43–54 秒，23 帧</figcaption>
</figure>

</div>

### 追加的三轮 { #followups }

玩过第一版，追加了三轮：

> 1. 现在鼠标如果在果冻内部，就无法拖动移动视角
> 2. 感觉现在果冻的波动还是太整体了，没有局部的浪的波动的感觉（相当于简单点击的小浪花和整体的左右倾斜之间也应该有好的晃动）

> 很好，能再加一种全局的浪花吗，整个海域的冲浪，双击的时候造出来，类似海上公园的人造大浪，宽度是齐平

> 现在大浪是从海边来的，我希望是根据我的鼠标双击最接近的那个面（相当于除了从岸边发起，其他三个面都可以发起）

## 怎么做出来的 { #how }

2026-11-06 在 Claude Code 里交给 Claude Opus 5.5。第一版约 42 分钟，三轮追加分别约 22、11、6 分钟，合计约 80 分钟。成品是 `src/` 下 18 个模块、约 3950 行，依赖只有 three.js，Vite 打包。没有图片、模型、字体、音频文件 —— 瓦片、木板缝、集装箱波纹、樱花斑点都在片元着色器里按物体坐标画，地面和招牌画在 canvas 上，声音由 WebAudio 现场合成。

动手前先拆原片：用 agent-io 的小红书脚本下载（0.01 美元加 0.005 元），[读视频](../../skills/agent-io/reference/read-video.md)抽关键帧，再自己加抽，看的就是[上面那 13 张](#frames)；又从帧里取样配色，写成一份拆解。之后沿用[压路机小镇](duck-road.md)的做法：three.js 0.187 + Vite，模型全用代码拼，无头浏览器截图和原片同一秒并排看。

??? abstract "`docs/reference.md` —— 原片拆解：版式、7 段时间轴、布局、取样配色"

    ```markdown
    --8<-- "gallery/games/assets/harbor-jelly/source/docs/reference.md"
    ```

每一段都和原片并排比过几轮，下面这些是 AI 自己看出来改掉的：

- 水比原片浅 → 海底从 −3 压到 −4.2，鱼和水母跟着下沉，土层的分界改成跟着海底走
- 侧面土层发暗 → 土层也被套上了水下染色，加一个 `noWater` 开关让它跳过
- 海底冒出几块没染色的米色 → 海底起伏低过了底板顶面，整体抬高 0.32
- 和风小楼的屋顶是四角锥 → 加一个带屋脊的 `hipRoofRidge`
- 樱花是几团大圆球 → 改成许多小扁团拼成的宽平树冠，颜色调浅
- 正方形视口下标题折成 4 行 → 加一个 6:5 宽高比的横屏断点，字号按视口宽度夹住
- 段落标题和副标题太像原片 → 02–07 段重写，只留段名和结构
- 该离港了货轮还要等很久 → 吊机还没抓起箱子的那一趟直接放弃
- 加完中尺度的浪，模拟出的浪高已到 0.78，画面上几乎看不出 → 加水面折射，见下面[问答](#faq-refraction)

`tools/` 里除了截图工具，还有三个跑流程的脚本：[`interact.mjs`](assets/harbor-jelly/source/tools/interact.mjs) 用真实鼠标和 CDP 触摸事件把点水、拖动转视角、长按推水、Alt 拖动、平移、缩放、双指缩放、双击和 `W` 发浪逐项跑，最后一轮 22 项全过；[`cycle_test.mjs`](assets/harbor-jelly/source/tools/cycle_test.mjs) 4 倍速跑港口作业，打印货轮和吊机每次状态变化；[`tour_sheet.mjs`](assets/harbor-jelly/source/tools/tour_sheet.mjs) 让导览跑一遍、定时截图。AI 在本机 RTX 4090 上用走 GPU 的无头浏览器实测，1080p 下三道大浪同时在海上是 61 帧，即垂直同步的上限；没在手机实机上试过，触屏只在模拟环境测过。

和原片不一样的：原作用 WebGPU，这里用 WebGL；段名沿用，标题和副标题自己写；没用原作的署名和配乐。

## 问答 { #faq }

收录时按两个关注点 —— 果冻水面的浪、清水怎么看得出浪 —— 补写的四问，对话里没人问过。答案对着源码写，引的片段标了文件和行号；没单独测过的不写数字。

### 果冻水面的浪是怎么一层层叠出来的？ { #faq-layers }

**水面高度是一个函数，五层相加。** 水面网格和三面玻璃切面都在顶点着色器里调同一个 `surfaceH(p)`：

```glsl title="src/materials.js:91-97"
--8<-- "gallery/games/assets/harbor-jelly/source/src/materials.js:91:97"
```

| 层 | 多大 | 怎么算 | 谁激起它 |
| --- | --- | --- | --- |
| 果冻倾斜 | 整片海 | 一个平面斜率 `dot(uTilt, d)`，由阻尼弹簧驱动 | 长按拖动；大浪撞上对面墙 |
| 大浪 | 横贯整片海 | 解析的行波，见[下一问](#faq-surge) | 双击、`W` |
| 缓慢涌浪 | 波长 10 左右 | 两条正弦，一直在 | —— |
| 中尺度浪 | 一到几个单位 | CPU 上解波动方程，117×161 的高度场 | 点水、长按、倾斜时墙边的晃荡、船和拖轮 |
| 细涟漪 | 一圈圈细纹 | 解析的圆环，最多 10 个 | 点水 |

原来只有倾斜、涌浪和细涟漪三层 —— 点一下是细纹，拖一下是整块斜过去，中间没有「局部的浪」。第二轮补的就是中尺度这层：

```js title="src/world/waves.js:146-163"
--8<-- "gallery/games/assets/harbor-jelly/source/src/world/waves.js:146:163"
```

方程是 `h_tt = c²∇²h − κh − γh_t + ν∇²h_t + 外力`，固定步长 1/120 秒，先更新速度再更新高度。**像果冻而不像水，靠的是 `−κh` 这一项**：它给每个格点挂了一根往平拉的弹簧。按方程算，频率满足 ω² = c²k² + κ —— 窄的浪 k 大，`c²∇²h` 占主导，照常往外跑；宽的鼓包 k 趋近 0，只剩 ω ≈ √κ ≈ 1.6 rad/s，原地以约 4 秒的周期颤几下、被阻尼收平。`ν∇²h_t` 压掉格点尺度的噪声。

- **墙和防波堤会反射**：墙外或实心格（防波堤、灯塔底座）的邻居指回格点自己，边界上没有梯度，浪碰上就弹回来（[`waves.js:48-70`](assets/harbor-jelly/source/src/world/waves.js)）
- **四种外力**：点水是一次速度冲量 `impulse`；长按是每帧持续的压力 `pressure`，手指下压出坑、松手弹回成一圈浪；倾斜变化时，沿四面墙一条带子按离中心的位置加力，墙边的水「跟不上」被晃回海里（`beginFrame`）；船和拖轮沿船头椭圆推开水（[`ship.js:125-137`](assets/harbor-jelly/source/src/world/ship.js)）
- **CPU 算，GPU 读**：每帧把高度和曲率写进一张 RG 浮点纹理，着色器的 `waveSample()` 和 JS 的 `sample()` 用同一个双线性插值读，两边对得上

JS 里还有一份一模一样的 `heightAt`，船、拖轮、浮标、轮胎靠它定高度，前后左右各采一点算出俯仰和横摇：

```js title="src/world/water.js:245-260"
--8<-- "gallery/games/assets/harbor-jelly/source/src/world/water.js:245:260"
```

倾斜那层是一个二维阻尼弹簧：按住时软一些、阻尼大（k 26、c 9），松手后硬一些、阻尼小（k 30、c 2.6），所以松手会晃几下（[`water.js:345-356`](assets/harbor-jelly/source/src/world/water.js)）。

### 大浪怎么在玻璃墙上反射、怎么被防波堤挡住？ { #faq-surge }

**大浪不进模拟，是一个解析公式。** 这样浪峰永远是一条直线、形状一路不散，像造浪池推出来的一道浪；反射用镜像源，防波堤乘一个遮蔽系数。

```js title="src/world/waves.js:243-276"
--8<-- "gallery/games/assets/harbor-jelly/source/src/world/waves.js:243:276"
```

1. **方向**：双击点离西、北、南哪面墙最近，就从哪面发（`nearestSurgeWall`）。每个方向换算成一个「走过的距离」坐标 `along`，三面墙都在 along = −20，浪峰位置 `f = −21 + 4.4 × age`
2. **波形**：前坡陡（宽 1.25）、后坡长（宽 3.6），后面跟一个 −0.22 的浅谷；出墙后 1 秒内长起来，寿命的最后 2.5 秒淡掉
3. **反射用镜像法**：在对面墙后面放一道镜像浪，位置 `a2 = 2·far − along`，振幅乘 0.55。浪峰还没到墙时，镜像浪在墙外，看不见；过了墙，它从墙里冒出来往回走 —— 就是那道小一点的回浪。只算一次反射，寿命正好是去一趟加回一趟
4. **防波堤的浪影**：南北向的浪正面撞上东西走向的防波堤。`surgeShelter` 在堤后、灯塔以东的水域把浪压到只剩 12%；过渡带宽 `0.6 + 0.35 × 离堤距离`，越往后越宽，绕过灯塔尖的那部分就越摊越开 —— 这是绕射的近似，不是解出来的。西来的浪和防波堤平行，不受影响

着色器里的同名函数由 JS 常量拼成字符串，参数改一处两边一起变（[`waves.js:279-307`](assets/harbor-jelly/source/src/world/waves.js)）。

撞击在 [`surge.js`](assets/harbor-jelly/source/src/world/surge.js) 里：沿浪峰每隔 0.5 取一个点，各自找前方第一个障碍 —— 停着的货轮、灯塔底座、防波堤，都没有就是对面的墙。浪峰这一帧越过那个位置，就在那里往回、往上抛几颗白色水花，给中尺度模拟加一下随机强度的冲量，把撞击处搅成碎浪；第一次撞到对面墙时，再给果冻倾斜一个朝浪方向的速度，整块晃一下，同时放拍岸声。只有去程的浪峰会撞，回浪太小不算。

### 清水上的浪为什么看得出来？ { #faq-refraction }

**靠折射。** 海水是透明的，高度变化只挪了水面顶点，从上往下看几乎看不出 —— AI 加完中尺度浪后截图，模拟出的浪高已到 0.78，画面上却几乎没有变化。于是每帧分两遍画：先画除水面以外的全部，把这一帧拷进纹理，再单独画水面，按浪的坡度偏移去采样这张纹理。水底的海草、石子跟着浪扭动，浪就读出来了。

```js title="src/main.js:400-429"
--8<-- "gallery/games/assets/harbor-jelly/source/src/main.js:400:429"
```

水面、水花、尾迹、灯塔光束放在第 1 层，第一遍只画第 0 层；第二遍不清屏、不重算阴影，只画第 1 层。偏移在水面的片元着色器里算：

```glsl title="src/world/water.js:143-154"
--8<-- "gallery/games/assets/harbor-jelly/source/src/world/water.js:143:154"
```

- **偏移只取局部坡度**：法线换算成坡度后减掉果冻整体的倾斜 `uTilt`，不然一拖整幅海底都会跟着滑
- **近大远小**：偏移除以到相机的距离；靠近三面玻璃墙时淡掉，切口边上不露馅
- **强度** 13（`setSceneTexture` 的默认值），`?q=low` 整个关掉，水面退回普通的半透明混合

折射之外还有三处提示，都读同一张高度和曲率纹理（[`water.js:126-138`](assets/harbor-jelly/source/src/world/water.js)）：

- **明暗坡**：向阳的坡亮一点，背阳的暗一点，像画出来的
- **浪峰亮线**：又高、曲率又大的地方描一条白线；大浪的浪峰上另加被噪声打碎的白沫
- **海底聚光**：浪峰底下的海底变亮、波谷底下变暗，在 `applyWater` 里按负曲率乘上去（[`materials.js:132-135`](assets/harbor-jelly/source/src/materials.js)）

### 为什么从侧面切口看，水下也是对的？ { #faq-underwater }

**水不是一层半透明的罩子 —— 每个模型的着色器自己判断在不在水下，在就自己染成水下的颜色。** `Builder` 合并出来的模型、集装箱、鱼群、行人都用同一种材质，水母另用一份半透明的，两者都经过 `patchToy` —— 它在 `onBeforeCompile` 时把 `applyWater` 插到输出颜色之前：

```js title="src/materials.js:250-265"
--8<-- "gallery/games/assets/harbor-jelly/source/src/materials.js:250:265"
```

`applyWater` 拿这个片元的世界坐标，用同一个 `surfaceH` 算出头顶的水面高度，低于水面就处理：

```glsl title="src/materials.js:116-139"
--8<-- "gallery/games/assets/harbor-jelly/source/src/materials.js:116:139"
```

1. 水面滤掉大部分红光：颜色乘 (0.46, 0.93, 0.8)
2. 随深度往深水色雾化
3. 叠焦散：两层缓慢漂移的 Voronoi 边缘网，大多落在朝上的面上
4. 水线下方一条亮带

因为判断的是每个片元自己的位置，船身、码头墙、灯塔底座的水线随浪上下移动；从侧面切口看进去，水下那半截一样是滤过红光、带焦散的。三面玻璃切面只是一层薄的半透明青色，上沿跟着 `surfaceH` 起伏，所以浪滑过时侧面能看到轮廓。

例外是沙盘侧面的土层：它贴着水域的边，套上水下染色会整片发暗 —— 这是做第一版时 AI 截图看出来的 —— 所以 `createStrataMaterial` 传 `noWater: true` 跳过。

## 拿去改 { #tweak }

要在本地运行或修改，直接将[整个工程](assets/harbor-jelly/source/source.tar.gz)下载到本地。解开后 `npm install`、`npm run dev` 开 `http://localhost:5190`；改完 `npm run build` 出 `dist/`，整个目录丢到任意静态服务器就能跑。

- 颜色 —— 纸、水的深浅、土层条纹、樱花、集装箱：[`palette.js`](assets/harbor-jelly/source/src/palette.js) 的 `C`
- 布局 —— 码头线 `QX`、海底深度 `FLOOR_Y`、泊位、栈道、灯塔：[`world/layout.js`](assets/harbor-jelly/source/src/world/layout.js)
- 导览 7 段的文案、镜头（`target`、`az`、`el`、`fit`）和时长：[`tour.js`](assets/harbor-jelly/source/src/tour.js) 的 `SECTIONS`
- 果冻有多软：[`world/water.js`](assets/harbor-jelly/source/src/world/water.js) 顶部的 `PRESS_AMP`、`TILT_SCALE`、`TILT_MAX`、`WALL_GAIN`，`update()` 里弹簧的 `k`、`c`
- 中尺度浪：[`world/waves.js`](assets/harbor-jelly/source/src/world/waves.js) 顶部的 `C`（波速）、`KAPPA`（往平拉的劲，越大越像果冻）、`GAMMA`（阻尼）
- 大浪：同一个文件的 `SURGE` —— 同时几道 `n`、速度 `v`、反射 `r`、高度 `amp`、堤后剩多少 `leak`
- 货轮停多久：[`world/ship.js`](assets/harbor-jelly/source/src/world/ship.js) 的 `dockTime`（32 秒）

URL 参数，加在 demo 地址后面：

| 参数 | 作用 |
| --- | --- |
| `?section=3` | 从第 3 段开始 |
| `?free=1` | 不自动导览 |
| `?q=low\|mid\|high` | 画质；`low` 关阴影和折射，触屏默认 `mid` |
| `?shot=1` | 保留绘制缓冲，截图用 |

控制台里的调试钩子 `window.__harbor`：`go(5)` 跳段，`surge(dir)` 发一道大浪（0 西、1 北、2 南），`surgeAt(x, z)` 从离该点最近的墙发，`ripple(x, z)` 点水，`press(x, z)`、`pressMove(x, z)`、`pressEnd()` 长按推水，`tilt(dx, dz)`、`release()` 倾斜，`cam({target, az, el, fit})` 摆镜头，`timeScale = 4` 快进，`state()` 看状态。

## 源码 { #source }

上面 iframe 跑的是打包产物：`index.html` 加一个 679 KB 的 `index-osaKKcX5.js`，three.js r187 打在里面，压缩过，不用读。能读的是 `source/` 下的整个工程，和原项目一字不差，收的是 2026-11-06 的版本；依赖是 three.js 0.187、Vite 8，测试脚本用 playwright-core，锁在 [`package-lock.json`](assets/harbor-jelly/source/package-lock.json)。

入口是 [`src/main.js`](assets/harbor-jelly/source/src/main.js)：渲染器、灯光、相机取景、导览、点击拖动缩放的输入、两遍渲染和主循环。其余按职责分：

- `src/` 根上 —— 共用着色器（水面高度、涟漪、焦散、水下染色、图案），把一堆基础几何体合并成一个网格的 `Builder` 和屋顶，色板，带种子的随机数，7 段文案和镜头，WebAudio 音效
- `src/world/` —— 沙盘布局常量；海底、土层、陆地和码头墙；水面和切面；中尺度浪的模拟和大浪的波形；大浪的撞击和水花；集装箱堆场和两台吊机的状态机；货轮、拖轮、尾迹和离港路线；樱花街区；栈道、防波堤和灯塔；海底的海草珊瑚沉船和漂浮物；鱼群、水母、海鸥、行人、花瓣
- `tools/` —— 走 GPU 的无头截图、原片某一秒和截图并排、真实输入测试、导览连拍、港口作业循环测试

问答和「拿去改」提到的几篇：

??? abstract "`world/waves.js` —— 中尺度浪的高度场模拟和纹理，大浪的波形、反射和防波堤遮蔽"

    ```js
    --8<-- "gallery/games/assets/harbor-jelly/source/src/world/waves.js"
    ```

??? abstract "`world/water.js` —— 水面和三面切面的着色器、折射、果冻倾斜的弹簧、点水和长按推水"

    ```js
    --8<-- "gallery/games/assets/harbor-jelly/source/src/world/water.js"
    ```

??? abstract "`world/surge.js` —— 发大浪，沿浪峰找障碍、溅水花、搅浪、晃果冻"

    ```js
    --8<-- "gallery/games/assets/harbor-jelly/source/src/world/surge.js"
    ```

??? abstract "`materials.js` —— 共用着色器：水面高度、涟漪、焦散、水下染色、图案；土层材质"

    ```js
    --8<-- "gallery/games/assets/harbor-jelly/source/src/materials.js"
    ```

??? abstract "`main.js` —— 渲染器、取景、导览、输入、两遍渲染、主循环、调试钩子"

    ```js
    --8<-- "gallery/games/assets/harbor-jelly/source/src/main.js"
    ```

??? abstract "`world/ship.js` —— 货轮、拖轮、尾迹，靠泊、离港、绕港路线，船头推水"

    ```js
    --8<-- "gallery/games/assets/harbor-jelly/source/src/world/ship.js"
    ```

??? abstract "`world/layout.js`、`tour.js`、`palette.js` —— 沙盘布局常量，7 段文案和镜头，色板"

    ```js
    --8<-- "gallery/games/assets/harbor-jelly/source/src/world/layout.js"
    ```

    ```js
    --8<-- "gallery/games/assets/harbor-jelly/source/src/tour.js"
    ```

    ```js
    --8<-- "gallery/games/assets/harbor-jelly/source/src/palette.js"
    ```

[^original]: 你的提示音，小红书视频笔记「果冻码头」，<https://xhslink.cn/o/5kfUlgWpmeJ>，2026-10-14 发布，2026-11-06 用 agent-io 的小红书脚本取得。原件 2160×3840、50 fps、78.4 秒、131 MB，纯音乐；收录时用 ffmpeg 缩到 720×1280、30 fps（H.264 CRF 24，音轨 AAC 128k），7.2 MB。
