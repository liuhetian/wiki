---
description: "本站照小红书 AFTERSTILL 的视频「aha鸭马路也是艺术」用 three.js 复刻的可交互小场景：米色纸上只有铅笔线稿，压路机开过才铺出蓝色马路，两旁房子和树接连弹出；路无限延伸，每隔三段一个斑马线路口，一家小鸭搭车过马路回家；下面是原片、原话 prompt、Claude Code 约 45 分钟做完的经过、拿去改哪里和完整源码"
---

# 压路机修出来的小镇

<iframe src="/gallery/games/assets/duck-road/dist/index.html"
        style="width:100%;height:640px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="压路机修出来的小镇：压过的路才长出小镇，小鸭搭车过马路"></iframe>

[单独打开](assets/duck-road/dist/index.html){ target="_blank" rel="noopener" }

按住压路机往前拖，或者按住空格、↑、W 开车，手机上按住右下角的「按住开车」。滚筒压过的地方，铅笔线稿变成蓝色马路，两旁地块上色、房子和树弹出来，地上扩散一圈白色光环。开到斑马线前，排队的小鸭飞上压路机搭车；开过去以后斑马线刷白、灯变绿，小鸭跳下来过马路，走进「家」的前院。拖空白处转视角，滚轮缩放，`V` 或「俯瞰」切到镜头拉高往回看整条街，`R` 或「重来」回到起点，点一下小鸭它会蹦，「声音」开关音效。左上角记着已经修了多少米，路一直往前生成，没有尽头。

## 原片和 prompt { #prompt }

<figure>
  <video src="/gallery/games/assets/duck-road-original.mp4" poster="/gallery/games/assets/duck-road-original-poster.webp" controls preload="none" playsinline width="300"></video>
  <figcaption>原片：小红书 AFTERSTILL「aha鸭马路也是艺术」，16.6 秒[^original]</figcaption>
</figure>

先让 AI 下载原片：

> （小红书分享文案和链接）根据下面的规范下载视频：（粘上本站[解析分享链接](../../skills/agent-io/reference/share-link/index.md)那页的全文）

下好了接着说：

> 继续解析这个视频，我想复现出来，用网页3d， 你觉得应该怎么做

AI 进 plan 模式问了三件事，选的是：做成可交互小场景，不按原片时间轴一比一回放；模型全部用代码生成；three.js + Vite。批准方案后它做出第一版 —— 一条有终点的 S 形街，修完全程收尾。看过第一版又追加一句：

> 道路改为无限延伸，自动丢弃过远的位置吧，重构一下

## 怎么做出来的 { #how }

2026-11-05 在 Claude Code 里交给 Claude Opus 5.5。方案批准后约 30 分钟做出第一版，追加无限延伸后又花约 12 分钟重构，合计约 45 分钟。成品是 `src/` 下 18 个模块、2831 行，其中约 150 行是写在字符串里的 GLSL；依赖只有 three.js 和 gsap，Vite 打包。没有图片、模型、字体、音频文件 —— 纸面、地块花纹、毛线纹小鸭、铅笔店名、窗框投影、音效全是代码现画现合成的。

动手前先拆原片：用[读视频](../../skills/agent-io/reference/read-video.md)抽 36 帧，看完写一份拆解 —— 核心机制、逐秒时间线、镜头、取样色板、模型清单、交互版怎么改编，之后颜色和镜头都照它定。

??? abstract "`docs/reference.md` —— 原片拆解：核心机制、时间线、镜头、色板、模型清单、交互版的改编"

    ```markdown
    --8<-- "gallery/games/assets/duck-road/docs/reference.md"
    ```

AI 用无头浏览器截图、和原片关键帧并排看，改了几轮，下面这些都是它自己看出来改掉的：

- 第一张截图镜头太远，路面白点太密，刷漆毛边太粗，店名太小 → 拉近镜头、减斑点、收细毛边、加大字号
- 和原片第 1 帧并排一比，原片的压路机是迎着镜头开过来的 → 镜头改成跟着路的走向转，光调亮、移轴加重，红绿灯跟着转向镜头
- 把剧情各阶段连拍 6 张拼起来看：烟囱冒出黑烟，小鸭跳车太早，下车过马路时镜头没在看它们，到家后挤成一团 → 烟团的寿命进度封顶不再算过头，推迟跳车，过马路时镜头往鸭群偏，小鸭按地块朝向在前院排开
- 窗框影子铺满整张桌子 → 改成一扇有边的窗，窗外是墙投下的大片浅影
- 手机竖屏画面太挤 → 窄屏拉远镜头、挪开按钮
- 改成无限延伸后，后排的小鸭先落地，队伍走乱 → 第一对落在队首，按顺序过马路

无限延伸是这样做的：路线不是一条固定曲线，按需往前积分出来，每 64 单位存一块；压路机前方始终留 4 块，身后超过 4 块的整块销毁，几何体、材质、店名贴图一起释放；地块模型每帧花约 3 ms 分批构建。AI 往前跳了 3000 单位，几何体数一直在 160–170 个；按住空格实际开 25 秒，1497 帧里最长 16.8 ms。

## 拿去改 { #tweak }

改数就是改小镇，改完在原项目里 `npm run build`，把 `dist/` 换进来 —— 上面的 demo 跑的是打包产物：

- 纸、路、压路机、小鸭的颜色：`palette.js` 的 `C`；地块底色和花纹：`PLOT_STYLES`；墙、屋顶、树叶、花各一个数组
- 路怎么弯：`world/roadPath.js` 里 `RoadPath` 的三条正弦 `waves`（幅度、波长）和 `curvature` 的回正系数；路宽、人行道宽在 `ROAD`
- 店名、第几块开始有斑马线、之后隔几块一个、前后各留多少路：`world/world.js` 顶部的 `NAMES`、`FIRST_CROSS`、`CROSS_EVERY`、`AHEAD`、`BEHIND`
- 第一个路口讲原片故事的那几家（家、外婆家、小卖部、早点摊、老街、车站、邮局）：`world/chunk.js` 的 `STORY`
- 换一条街：`World` 的 `seed`（默认 7），同一个种子每次生成的街都一样
- 一家几只小鸭：`actors/flock.js` 的 `N`；压路机的滚筒半径、宽度和轴距：`actors/roller.js` 顶部
- 画质：网址加 `?q=low|mid|high`，`high` 开 AO 和移轴景深，`mid` 只开景深，`low` 都关；触屏默认 `mid`

## 源码 { #source }

原项目的源码一字未改，放在 [`assets/duck-road/`](assets/duck-road/dist/index.html) 下。demo 嵌的是 Vite 打包出的 `dist/`：three.js r187 和 gsap 打进一个 775 KB 的压缩脚本 —— 本站 `/vendor/three` 没有它要的轨道相机、圆角方块和整套后处理，也没有 gsap。下面这些源码 `npm install && npm run build` 打出来的包和 `dist/` 逐字节相同。

??? abstract "`index.html`、`vite.config.js`、`package.json` —— 入口页、相对路径打包、依赖"

    ```html
    --8<-- "gallery/games/assets/duck-road/index.html"
    ```

    ```js
    --8<-- "gallery/games/assets/duck-road/vite.config.js"
    ```

    ```json
    --8<-- "gallery/games/assets/duck-road/package.json"
    ```

??? abstract "`main.js` —— 渲染器、相机跟随、输入、主循环、调试钩子 `window.__duck`"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/main.js"
    ```

??? abstract "`materials.js` —— 共用的玩具材质（顶点色加程序化波点、网格、格纹、毛线纹）、纸、铅笔、窗框投影"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/materials.js"
    ```

??? abstract "`geo.js` —— 把一堆基础几何体合并成一个 mesh；屋顶、地块板"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/geo.js"
    ```

??? abstract "`palette.js`、`rand.js` —— 色板，带种子的随机数"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/palette.js"
    ```

    ```js
    --8<-- "gallery/games/assets/duck-road/src/rand.js"
    ```

??? abstract "`world/roadPath.js` —— 无限延伸的中线：按块生成、丢弃，(s, d) 和世界坐标互转"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/world/roadPath.js"
    ```

??? abstract "`world/road.js` —— 一块路面的条带和 shader：前方画铅笔线，压过的地方画蓝色沥青、标线、斑马线、毛边"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/world/road.js"
    ```

??? abstract "`world/chunk.js` —— 一段街：地块布局、铅笔轮廓、店名、路灯、路口和小鸭，地块分批构建、整块销毁"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/world/chunk.js"
    ```

??? abstract "`world/world.js` —— 管理压路机前后的块：生成、丢弃、分批构建、弹出队列，汇总各家小鸭的状态"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/world/world.js"
    ```

??? abstract "`world/props.js` —— 房子、塔楼、云朵树、花、栅栏、路灯"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/world/props.js"
    ```

??? abstract "`world/trafficLight.js` —— 小鸭信号灯"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/world/trafficLight.js"
    ```

??? abstract "`actors/roller.js` —— 压路机：滚筒和后轮按行驶距离转动，烟囱冒烟"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/actors/roller.js"
    ```

??? abstract "`actors/duck.js` —— 小鸭：待机、走路、蹦、扑腾"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/actors/duck.js"
    ```

??? abstract "`actors/flock.js` —— 鸭群故事线的状态机：排队、搭车、落地、过马路、到家"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/actors/flock.js"
    ```

??? abstract "`fx/post.js`、`fx/rings.js` —— 后处理（GTAO → 移轴模糊 → OutputPass → 暗部提亮、暗角、颗粒），地块弹出时的白色光环"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/fx/post.js"
    ```

    ```js
    --8<-- "gallery/games/assets/duck-road/src/fx/rings.js"
    ```

??? abstract "`sfx.js`、`ui.js` —— WebAudio 合成的弹出声、鸭叫和到家的和弦；标题、提示、俯瞰／声音／重来按钮、按住开车和里程"

    ```js
    --8<-- "gallery/games/assets/duck-road/src/sfx.js"
    ```

    ```js
    --8<-- "gallery/games/assets/duck-road/src/ui.js"
    ```

[^original]: AFTERSTILL，小红书视频笔记「aha鸭马路也是艺术」，<https://xhslink.cn/o/4yMuUNeMyMq>，2026-11-04 发布，2026-11-05 用 agent-io 的小红书脚本取得。原件 1080×1440、60 fps、83 MB，收录时用 ffmpeg 缩到 720×960、30 fps（H.264 CRF 24，音轨 AAC 128k），4.4 MB。
