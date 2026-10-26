# 发布套件：做出你产品的发布片

anidoodle 自己的发布片就是用这些零件做成的，它们在 `engine/src/canvas-core/` 里，任何产品都能用。它们所服务的规则写在 [launch-video.md](launch-video.md)。

## 从模板起步（16 秒，一个文件）

`launchTemplate.ts` 把数据变成一部影片：一到三个请求，请求之间夹一个文字帧，最后是一张带你的安装命令的片尾卡。`launchExample.ts` 是给一个虚构产品做的完整示例（手绘观感，聊天请求）；`launchExampleClean.ts` 是用在 UI 优先产品上的第二种观感（产品自己的 UI 分三屏，其中两屏是分栏拍，60 fps）。照搬它们的结构，不要照搬它们的内容：样张、UI 数据和配乐都是产品自己的，按它的 brief 现做。

```bash
node tools/launch.mjs new myLaunch                 # the spec, every product line marked TODO (--preset clean for UI-first)
node tools/still.mjs myLaunch-9x16 --frames 0,120,330 --sheet out/look-9x16.jpg   # one look per shape, one browser
node tools/launch.mjs ship myLaunch --shapes 16x9,1x1,9x16 --blur auto --gate
```

`ship` 把每种画幅渲染成 `out/myLaunch-<shape>.mp4`，写出它的封面图（`.poster.png`，影片自己的一帧清晰可读的画面）和字幕（`.srt`、`.vtt`），对每个文件跑 `verify-export --delivery`（尺寸、帧数、配乐、每个标记点上的音画同步、编码之后的真峰值、清晰可读的第 0 帧），对每一帧跑 `framecheck.mjs`（没有文字、没有卡片、没有产品窗口被画面边缘切到），加了 `--gate` 时还会跑闸门；最后给出一张总表，任何一种画幅不通过就以 1 退出。

### 设计审查清单（每一种画幅，任何东西发布之前）

闸门能证明一部影片是确定的；它看不出这部影片设计得好不好。对照下面这张清单审查**每一种**画幅的缩略拼图（contact sheet），有问题就修，绝不豁免：

- **文字不被裁切。** 观众要读的每一个字在每一帧里都是完整的：正在输入的提示词、气泡、标签、文字页上的字、安装命令。`framecheck.mjs`（由 `ship` 调用）遇到任何一行被画面边缘切穿的文字都判不通过。
- **内容不被边缘裁掉。** 卡片、产品窗口、影片所在的卡片都完整地留在画面里，四周留出边距，除非是有意的满版出血（整个画面就是这一样东西）。镜头即将切掉的东西要在切之前先淡出。`framecheck.mjs` 会检查卡片和窗口。
- **每种画幅的构图都均衡。** 主体占据画面（产品 UI 约占 16x9 画面宽度的 70-80%），分栏拍是真正的两栏网格，文字按设计来定字号，片尾卡是一个居中、有分量的整体；没有大片空着的区域，没有东西挤在角落里。
- **示例内容前后一致。** 每个请求展示的都是**这个**产品：它的 UI、它的样张、它的文字。一部讲某样东西的影片里，不能出现现成的样张或另一个产品的界面。
- **评判设计，而不只是看有没有碰撞**：层级、间距、每一帧能不能当海报用。

```ts
import { C } from "./launchKit";
import { makeLaunchFilm } from "./launchTemplate";
import { dashboardSketch, onboardingSketch } from "./myProductPlates"; // drawn for YOUR subject
import { myProductScore } from "./myProductScore";                      // composed for YOUR brief
import { myInbox } from "./myProductUI";                                // YOUR product's UI, as data (productUI.ts)

export const myLaunch = makeLaunchFilm({
  title: "Your Product", subtitle: "the one line it lives by",
  asks: [
    { prompt: "sketch my dashboard, as a print", plate: dashboardSketch, label: "print · drawn in code" },
    { kind: "ui", ui: myInbox, prompt: "match every receipt" },            // the product's own UI, before -> after
  ],
  words: [[{ text: "IDEA IN.", style: "ink", color: C.ink }, { text: "ART OUT.", style: "ink", color: C.accent }]],
  tagline: "One sentence that says what it is",
  install: ["npm install your-product", "your-product init"],
  bpm: 96, // the tempo of the score you composed; the brief sets it, there is no default
  askBeats: 6, typeBeats: 4, endBeats: 8, claimBar: 4,
  score: myProductScore, // or null for a silent film
});
```

只靠数据，你就能得到这些：

- **聊天请求**（省略 `kind`）：开头的钩子：第一个提示词是主角，第 0 帧时就已经在一个横跨大半个画面的大输入框里输入到一半了（在 1x1/4x5/9x16 上字号至少 64 px，在 16x9 上至少 56 px，折成 2-3 行，绝不裁切；提示词长到放不下就报错），按下 Generate 时输入框缩小，停靠到聊天窗的底部。之后的提示词输入时整个输入框都在画面内，按下按钮时镜头缓缓拉远，一滴墨从 Generate 划出一道弧线落进对话流，晕开成一张卡片，样张在卡片里现场把自己画出来（卡片以弹簧动画打开），对话流保留之前的回答并向上滚动，镜头轻轻倾近每一张新卡片，同时让卡片保持完整、四周留出边距（镜头即将切掉的东西先淡出）。
- **UI 请求**（`kind: "ui"`）：根据数据（`productUI.ts`）画出产品的界面，处于 `before` 状态；如果有 `prompt`，就把请求输入它的命令栏；指针按下它的 `action`；每个条目以弹簧动画移到 `after` 状态里的位置（按 `id` 对应：行会移动，数字会滚动计数，条形会填满，新条目进场，旧条目离场）。
- **影片请求**（`kind: "film"`）：把本引擎的任何一部影片（一个 `webTour`、一段循环动画、一张样张）放进一张卡片里。
- **分栏功能拍**：带 `split: [lines]` 的 UI 请求或影片请求，会把它的文字放进实时 UI 旁边单独的一栏（在手机上放在 UI 上方），绝不压在 UI 上面：比整页的文字页更快。
- **接缝**：聊天接聊天是同一条对话流；不同种类之间、中间没有文字页的接缝，以晕开的方式打开。
- **动机（motif）**：一滴墨从 Generate（或产品的动作按钮，或影片所在的卡片）上升起，落下成为片尾卡标志（"NAME."）里的那个点；片尾卡**从**这个点晕开，然后停住。
- **声音来自画面**（`launchSound.ts`）：每输入一个字符响一声按键（空格键有它自己的声音），Generate 按下去的那一帧响一声按压，墨滴和它的晕开，每张卡片在它的弹簧第一次到位时落定，每个 UI 条目的落定；每个 cue 都按它在屏幕上发生的位置做声像定位；揭晓时只有一个上升音效（riser）和一个冲击音效（impact），其他任何切点上都没有。测得被配乐压住的 cue 会被调高，直到能听见为止（最多 +8 dB），然后检查混音，仍然被淹没的 cue 会抛错。`film.cues` 列出这些 cue；`meta.sync` 为 verify-export 标出各次按压和那次冲击。
- **字幕**：`meta.captions` 取自提示词、文字页、分栏文字和片尾卡；`launch.mjs ship` 或 `captions.mjs` 写出 `.srt`/`.vtt`；`captions: "burn"` 还会在手机画幅上把字幕画进画面下方属于它们自己的一条字幕带里（画面在字幕带上方构图）。
- 角标（你的名字）会在镜头任何一次倾近之前让开。真正的停留都已经声明过，所以闸门能通过。

同步优先于时长：配乐严格按影片的 bpm 演奏，所以每个切点都落在它的强拍上，影片由配乐的整小节构成（`gridScore`：伸缩段被重复或删掉，然后片尾卡的停留——它本来就是停留——伸长或缩短到对齐小节；尾音以整小节余响收尾）。配乐要求 4/4 拍、没有弱起、从第 0 帧开始。如果没有哪种曲式放得下，构建就会抛错：写一个 1 小节的伸缩段，或者改 askBeats/endBeats。节拍网格影片的配乐偏离它的 bpm 超过 0.5%，渲染会拒绝。垫乐设为 -14 LUFS，真峰值不高于 -1 dBTP（`musicBed`）；动态大的曲子会先碰到峰值上限，渲染会告诉你还差多少；`limit: true` 让一个前视限幅器来处理那些峰值。

**样张、UI 和配乐，每一次都为这个产品现做。** 画风是一份套用到用户主题上的配方（[references/style-guide.md](../style-guide.md)）：用选定的手笔画出他们的仪表盘、他们的吉祥物、他们产品的世界，做成一张静帧加上它对应的 `*Draw` 影片；UI 请求的数据来自产品真实的界面和状态。anidoodle 自己的样张（`launchExample.ts` 里的灯塔和狐狸）和网页导览只是占位，绝不是用户的影片。配乐按 brief 的风格、情绪和时长来作曲（[references/music/compose.md](../music/compose.md)）；`score` 必填（`null` 表示无声），`bpm` 没有默认值，模板会拒绝 anidoodle 自己的曲子，按身份、按标题、按内容都会拒绝（和 `music.mjs check` 跑的是同一道新颖性闸门）。

### 一条时间线，四种画幅

`shape: "16x9" | "1x1" | "4x5" | "9x16"`（或者 `film.reshape(shape)`，或者在任何工具里用影片名 `myLaunch-9x16`）通过 `launchLayout.ts` 为另一种画幅排出同一个剪辑：聊天窗口、输入框和卡片都按这种画幅布局（手机上的输入框会把提示词折行，镜头让整个输入框留在画面里），文字页重新排行，分栏拍改为上下堆叠，片尾卡上下堆叠并居中。时间安排、剪辑和声音都不变。在 1x1、4x5 和 9x16 上，观众必须读的每一行都对手机安全：提示词、气泡、卡片标签、标语和安装命令在横向 1080 下至少 32 px（手机上大约 11 pt），文字页至少 64 px；某一行做不到时（比如安装命令太长，9x16 放不下），布局会抛错并给出修法。

### 两种观感

`preset: "drawn"`（默认）：墨晕、手写文字（`writeOn`）、暖色纸张调色板。`preset: "clean"`：安静的画布，**一种**强调色（按钮、墨滴、圆点、光标；由 `accent` 设定），字体排印本身就是设计：文字页用粗重的无衬线体**排**出来（`setType`：每个词从它自己的基线后面升到位），接缝用圆形光圈代替墨晕，回答卡片以光圈方式打开。两种都是我们自己的：简洁观感是一种基调，不是照抄谁的影片。

### 帧率与运动模糊

`fps: 60` 在同样的时间安排上把帧数翻倍（UI 多的影片，滚动和弹簧动画看起来更顺滑）；cue、停留、字幕和同步标记都随之调整。`render.mjs --blur auto` 按每一帧测得的屏幕上的移动速度，取所需数量的子帧（静止帧取 1 个），`--shutter 180`。

| 规格字段 | 含义 |
|---|---|
| `title`、`subtitle`、`placeholder`、`genLabel`、`accent` | 聊天窗的名字、副标题、空白时的占位文字、按钮上的词、按钮颜色（也是简洁观感那一种强调色） |
| `asks[]` | 1-3 个 `{ prompt, plate, label, from?, to?, crop? }`（聊天）、`{ kind: "ui", ui, prompt?, split? }`、`{ kind: "film", film, from?, to?, split? }` |
| `words[i]` | `asks[i]` 之后的文字帧（最后一个请求之后没有；它直接流入片尾卡） |
| `tagline`、`install[]`、`footer` | 片尾卡；安装命令完全按给定的内容显示 |
| `bpm`（必填）、`fps`（30 或 60）、`askBeats`、`typeBeats`、`endBeats` | 节拍网格（30 fps 下一拍是 60 x 30 / bpm 帧）以及每一部分以拍计的长度 |
| `claimBar` | 让片尾卡落在这一小节的强拍上，从第 0 小节数起（`claimBar: 4` = 第 4 x 每小节帧数 帧）；做不到就抛错。更长的最后一个请求是真的更长，绝不放慢 |
| `score`（必填）或 `audio` | 为这个产品作的配乐（[compose.md](../music/compose.md) 写出的 `Material` 函数，或者一个 `Piece`），作为垫乐；`null` 表示无声；或者你自己混好的成品（不做检查；它也会取代 cue） |
| `shape`、`preset`、`sfx`、`motif`、`captions` | 画幅（默认 16x9）；观感（drawn、clean）；声音 cue（默认开）；接力进片尾卡的动机（默认开）；`"sidecar"`（默认）或 `"burn"` |

模板会拒绝功能清单（超过 3 个请求），也会拒绝短到来不及读的片尾卡。

## 零件：用来做你自己结构的影片

**`launchKit.ts`**：时间安排和 UI。

- 缓动：`ramp`、`inOut`、`out3`、`in3`、`expo`、闭式解的 `spring`、`press`（按钮按下去先沉一下再弹回来）。镜头：`Cam`、`camLerp`（缩放在对数空间里行进）、`useCam`、`toScreen`。更长的镜头运动参考 [references/camera.md](../camera.md)。
- `plateLayer(env, key, film, frame, px)`：把本引擎的**任何**影片在任意一帧画进一个离屏图层。这是不靠录屏的合成：发布片里的每一张样张，都是由它自己的代码现场画出来的真样张。`selfLayer` 是一块草稿画面，给场景里的场景用。
- 聊天：`drawChatFrame(ctx, state)`（窗口、输入框、Generate；`title`、`subtitle`、`genLabel`、`accent` 由你定），`charTimes`/`typedAt`（像人一样打字），`caretAt`、`pointer`、`inkDrop`（从按钮落到卡片上的那滴墨）、`inkCard`（晕开打开的回答卡片）、`artCard`、`softShadow`、`rr`。
- 墨：`blot(c, R, seed)` 和 `pathOf`，一圈带种子的抖动边缘，用于墨晕和墨滴。

**`kinetic.ts`**：文字是写出来的，绝不是排出来的。

- `writeOn(ctx, env, text, x, y, size, p, style, opts)`：一行字由一件看得见的工具一笔一笔写出来，工具可以是 `ink`、`crayon`、`thread`、`chalk`、`brick` 或 `marker`。`measure` 量它的尺寸。
- `setType(ctx, env, text, x, y, size, p, opts)`：一行用粗重无衬线体**排**出来的字，每个词从基线后面升到位：简洁观感的字体。`setWidth` 量它的宽度。
- `sentence`（每个词一种媒介，每拍一个词）、`caption`（带下划线或箭头的小标注）、`logo`/`logoCentred` 和 `logoBug`（anidoodle 自己的文字标志和角标；换成你的产品时，像模板那样用 `writeOn` 写出你的名字）。

**`launchLayout.ts`**：`launchLayout(shape, content)` 给出一种画幅的完整构图（聊天的几何、对话流、镜头的停驻点、文字页、分栏、片尾卡、字幕带）和每种文字角色的字号，并对照手机安全的最小值（`MIN_PX`）做检查。`drawChatFrame`、`caretAt`、`inkDrop` 和 `inkCard` 接受它的 `chat` 几何；`chatGeom(rect, k, px, promptPx, lines)` 是任意尺寸下的同一个聊天组件。

**`productUI.ts`**：`drawProductUI(ctx, rect, ui, { f, t0 }, theme, { minPx })` 根据数据画出产品界面的 before 状态，并从 `t0` 起让每个条目以弹簧动画移到 after 状态；窗口大小贴合它的内容。`uiSettles` 给出每个条目落定的帧，`springLand(t0, omega, zeta)` 给出任意一个弹簧第一次到达目标的帧（它的声音就放在那里）。

**`motif.ts`**：`relay(keys)` 是一个物件跨过接缝（切点帧）的连续路径，`seamGap` 和 `checkRelay` 在匹配剪辑的两侧测量它，偏差超过 2 px 就抛错。

**`launchSound.ts`**：`mixLaunch`/`launchAudio` 从音效套件（`music/sfx`）里取 cue 摆放好，按每个 cue 在屏幕上的 x 位置做声像定位（`panOf`），压低配乐，把被淹没的 cue 调高到能听见，并让混音保持在 -1 dBTP 以下。

**`launchCut.ts`**：剪辑即数据。

- `pic(from, to, len)` 在 `len` 帧内播放你内容时间线上的一段；`type(lines, len, before, after)` 是一张文字页。`makeCut(segs)` 给出 `N`、`at(F)`、`contentOf`、`cutOf`（把内容帧上的声音事件映射到剪辑上）。
- `beatGrid(bpm, fps)`：`beat`、`bar`、`frameOf(bar, beat)`，以及 `solve(bar, fixed)`，它算出留给一个可伸缩片段的帧数，让主张落在一个小节上（launch3 落在第 26 小节）。
- `bloomFrame`（墨晕里的一页；`close: false` 让它保持打开，用作片尾卡；`center` 让它从一个点打开，也就是动机；`shape: "circle"` 是简洁观感的光圈）、`typeFrame`（在上面写一到三行字；`lead`、`stagger`）、`bloomRadius`（用于停留）。

**`launchGallery.ts`**：`drawWall` 和 `wallCam`，一面滚动的画风卡片墙，焦点卡片朝观众**变大**，而不是镜头推近。这是证明能力范围的那一拍。

**`webTour.ts`**：一个用代码画出来并带人参观的网站：先看整页，然后镜头推近每一次点击，由指针和输入日志驱动页面自己的状态。

## 完整示例

`launch2.ts` 是 anidoodle 的内容时间线（聊天、锦鲤和它流式输出的代码、画风墙、砖块气球、杏花手笔（以梵高的公有领域作品《杏花》（*Almond Blossom*）作为附带的参考图，放在 `engine/assets/refs/`，附 `PROVENANCE.json`；见 [adapt-a-style.md](adapt-a-style.md)）、刺绣循环动画、网页导览、蝴蝶影片、片尾卡）；`launch3.ts` 是剪辑：数据片段与文字帧拼接在一起，77 秒，落在配乐的 29 个小节上。它们是 anidoodle 自己的影片，所以普通的脚手架不包含它们；`scaffold.mjs <dir> --example` 会把它们（连同它们赖以构建的蝴蝶）带进来供你研究。研究它们的节奏，然后在模板上用你自己的画面和你自己的音乐做你的影片；anidoodle 的发布片是这套语法的一个示例，不是一层拿来复用的皮。
