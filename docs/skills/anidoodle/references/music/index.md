<!-- 中译自 alexgreensh/anidoodle@25aae33 的 skills/anidoodle/references/music/README.md -->
# 音乐：以数据作曲，交给引擎演奏，经过测量，最后让人听一次

anidoodle 里的每一份配乐都以数据写成，每一个声音都是引擎自己的：你写音符，引擎演奏。你听不见自己做出来的东西，所以每个选择都是一个数字，每个数字都要测量，并且在任何东西交付之前，都要让一个人听 8 秒。

有八件原声乐器还能播放**真实乐器的录音**，录音来自一个需要另行安装的可选音源包：三角钢琴和立式钢琴、音乐会竖琴、马林巴、颤音琴、钟琴、管钟和定音鼓，外加三个录制下来的房间。其余的一切，以及没装音源包的机器上的每一份配乐，都和以前完全一样，用代码合成。见下文[录音乐器](#recorded-instruments-the-optional-sound-pack)。

代码：`engine/src/canvas-core/music/`。工具：`engine/tools/music.mjs`、`engine/tools/soundfetch.mjs`。要检查成片的声音：用 `engine/tools/soundcheck.mjs` 和 `soundsheet.mjs`（[做法](sound-design.md#checking-the-finished-films-sound)）。

**从这里开始：[`compose.md`](compose.md)。** 它带你从 brief 一路走到一份原创配乐。风格是一套词汇：声音、律动、和声语言、旋律规则、编配语法。它永远不是音符。每一个音符都由你来写，没有任何东西替你补上。没有默认风格。

页面：

- [`compose.md`](compose.md)：工作流程、素材格式、手艺，以及绝不复用的规矩。
- [`theory/`](theory/index.md)：背后的手艺：旋律、和声、节奏、情绪映射、曲式与配器、声音（服务于声部排布和混音的心理声学）。附有出处，并由 `node tools/music.mjs craft` 测量。
- [`styles/vocabularies.md`](styles/vocabularies.md)：全部 21 套风格词汇、15 个律动家族和各种段落类型。它由代码生成。
- [`styles/lofi-electronic.md`](styles/lofi-electronic.md)：深入讲 lo-fi 电子风格的词汇，以及分轨平衡测量仪。
- [`styles/music-box.md`](styles/music-box.md)：最初那份八音盒配方的声音参数，以及各道守卫背后的伤疤故事。
- [`sounds-licenses.md`](sounds-licenses.md)：录音从哪里来，以及 CC BY 要求的署名。再分发音源包之前必读。

**演示不是配乐。** `pieces/` 里的曲子（音色样本曲、各乐器家族的演示、夜曲、我们自己的发布片配乐）是为了证明合成器和测量工具而写的，其中一首就是我们自己影片的配乐。它们是试听参照，也是新颖度语料库（`node tools/music.mjs list`）。影片永远不播放它们：一份配乐只要听起来像它们或引用了它们，`node tools/music.mjs novelty` 就判它不通过。

## 流水线

```
MusicPlan + notes (you write)  ->  perform  ->  instruments (one stem per part)  ->  room  ->  master  ->  [L, R]
   plan.ts, pieces/*.ts           perform.ts    piano.ts, instruments.ts          dsp.ts     render.ts
```

1. **计划**（`plan.ts`、`tables.ts`、`theory.ts`）。一个 `Piece` = 一个 `MusicPlan` + 若干声部的音符 + 和声列表。
    - 计划里写明：
        - 一个**风格**；
        - 一个速度和一个拍号（2/4、3/4、4/4、5/4、6/8、7/8、9/8、12/8）；
        - 若干**段落**，每段各有一种情绪（或一个混合 `[a, b, w]`）、一个调和调式、旋律类型、一个 0..1 的力度级别 `[start, end]`，以及一个结尾；
        - `repeatable` / `optional` / `pickup` / `variations` 标记，靠它们适配任意时长。
    - 音符用一种逐小节校验的记谱法来写。某一小节加起来不等于拍号，就抛错：
        ```ts
        line(<start beat>, "<NOTE>:<beats> <NOTE>:<beats> | [<NOTE> <NOTE>]:<beats>@<vel> | r:<beats>", { role, bpb })
        ```
    - 角色：`melody`、`inner`、`bass`、`accomp`、`color`、`drum`。
    - 没有任何东西会生成音符。**由你来作曲**（[compose.md](compose.md)）：
        - 真正的和声与声部进行；
        - 一个让人记得住的动机，以及一问一答的乐句；
        - 终止式。
2. **演奏**（`perform.ts`）。拍变成秒，写下的力度变成奏出的力度。「MIDI」到这里为止。钢琴的处理：
    - 声部排布：旋律比其余部分高出 6-10 dB；
    - 力度和速度上都有一道乐句的弧线；
    - 旋律领先 10-30 ms，和弦错开奏出；
    - 旋律音之间有连奏重叠；
    - 每次和声变化之后紧接着换踏板；
    - 结尾有符合运动学的渐慢，突然转弱之前留一口气；
    - 来自 `rng(seed)` 的人性化扰动，经过平滑，在整个乐句里前后相关。

    带 `opts.grid` 的声部（八音盒、chiptune、drive）有意保持机械。
3. **让乐器演奏。** 每个声部是一件乐器：

    | 乐器 | 怎么做出来的 |
    |---|---|
    | `piano` | 模态合成，按物理规律塑形：非谐和泛音，2-3 根彼此微失谐、两段式衰减的弦，随力度变化的琴槌明亮度和敲击梳状滤波，敲击声，音板模态，制音器，带共鸣弦的延音踏板，按音高分布的立体声。见 ADVISORY 4.1。 |
    | `musicBox`、`bell` | 配方里的参数 |
    | `celesta`、`marimba`、`vibes` | 模态音条 |
    | `harp`、`guitar` | 扩展的 Karplus-Strong：拨弦位置，两个振动偏振方向，交换式琴体（commuted body；竖琴的按 CC0 录音拟合）。`kind`：nylon（尼龙弦，默认）、steel（钢弦）、electric（电吉他；`pickup`：neck 琴颈或 bridge 琴桥拾音器，`drive` 推进一台干净的音箱） |
    | `strings` | 一个由 `players` 名演奏者组成的声部（默认 10 人，按和弦分配），每人各有自己的时值、音准、漂移、颤音和弓噪，经过实测的小提琴、中提琴和大提琴琴体。`pizz: true` 改为拨奏 |
    | `fmBell`、`ePiano` | 双算子 FM |
    | `pulse`、`triangle`、`noiseDrum` | NES 风格的芯片音色 |
    | `kick`、`snare`、`hat`、`vinyl` | 鼓和质感 |
    | `bass` | `kind`：finger（指弹，默认，经过音箱的电贝斯，`drive`）、pick（拨片）、upright（立式低音提琴：琴体、音高稳定过程、闷击声）、synth（锯齿波 + 次低音送进 24 dB 滤波器，滑音） |
    | `warmPad`、`softPluck`、`sub` | lo-fi 电子套件（`lofiKit.ts`）：失谐锯齿波铺底、带乒乓延迟的滤波拨弦音色、正弦次低音 |
    | `organ` | 拉杆音栓（谐波 1 2 3 4 6 8）、合唱效果、震音器 |
    | `brass` | 由 `players` 人组成的声部（默认 3 人）：越响越亮的谐波、唇部上滑音、气息、喇叭口共振峰（`type`：trumpet 小号、trombone 长号或 horn 圆号；`bright` < 0.75 = horn） |
    | `woodwind` | 长笛（起音气声 chiff、气流和气息噪声、气息颤音），或 `reed: true` 时为单簧管（奇次谐波、簧片噪声）。相接的音符连奏 |
    | `choir` | 歌手（`singers`，默认 8 人），带声门源、频率抖动（jitter）、振幅抖动（shimmer）和气息，每个元音经过 5 个共振峰。`vowel`：a e i o u，或者一个序列（`"uoa"`），在每个音符内部逐渐变形 |
    | `timpani` | 调过音的鼓膜模态、音高稳定过程、槌击闷声（在鼓轨里用 `pitch` 给它定音） |
    | `leadSynth` | 单音锯齿波 + 方波，滑音（portamento），滤波包络，渐渐展开的颤音 |
    | `bowedSolo` | 弓弦波导模型（小提琴，或 `cello: true` 时为大提琴）：相接的音符是同一弓，带手指滑音、延迟颤音、实测琴体 |

    这些乐器里有八件，在装了音源包时会播放真实乐器的录音。这张表是引擎自己搭出来的东西；[录音乐器](#recorded-instruments-the-optional-sound-pack)讲的是它改为播放的东西。

    建模音色都是近似：电影感、风格化，永远不是「写实」。每个音符都有变化（按种子），所以重复永远不会变成克隆。一个人听过之后，它才能撑起一部影片。已经交付的配乐在自己的 piece 上设 `legacy: true`，保持交付时的声音，根本不会走到采样器。
4. **房间。** 由风格选择：
    - 八音盒：一次反射，没有尾音；
    - 夜曲和摇篮曲：一个小房间；
    - cinematic 和 drive：一个大厅；
    - chiptune：什么都没有。

    装了音源包时，风格可以改为指定一个录制的房间，引擎就用那份录音做卷积。
5. **母带。**
    - **柔和风格：** 用一个固定增益推到 **-16 LUFS**，真峰值 <= -1 dBTP，母带上永远不用压缩器。敲击类分轨（拨弦、拨奏的贝斯、钢琴、槌击乐器和钟、定音鼓）先在混音里经过一道感知瞬态的增益（只把高出音符自身主体的拨片或琴槌尖峰压下来，最多 6 dB，分轨电平不变），这样它们的起音就不会把母带卡在天花板以下。`RenderOpts.gentleGlue`（一个 <= 1 dB、2:1 的总线粘合压缩）是有的，但默认关闭。如果峰值仍然挡住增益，响度就往下降。解药在音乐上（见下文「峰值」）：一首响度范围 10 LU 的独奏钢琴（夜曲演示）母带做到 -17.5。
    - **密集风格**（lofiElectronic、lofi、drive、house、synthwave、hipHop、rock、chiptune）：经过一个前瞻式真峰值限幅器推到 **-14 LUFS**，如果仍有采样间峰值超过 -1 dBTP，再做一次固定的电平修剪。
    - **影片的整条混音**（配乐加音效，或者只有音效）最后经过交付母带：见 [sound-design.md 的「成品混音」一节](sound-design.md#the-finished-mix)。

影片的 `audio` 是 `filmAudio(piece, seconds)`，它返回 `(sampleRate) => [L, R]`，长度恰好等于影片长度。它先适配配乐（`fitScore`，见下文），所以音乐在最后一帧落在乐句的结尾，永远不会被截断。任何渲染配乐的影片混音（包括带音效的）都必须用同样的方式适配。`engine/src/canvas-core/score.ts` 是一个空骨架：`filmScore(material, fps, frames)` 把你的素材作成曲子并适配好。

## 录音乐器：可选的音源包 { #recorded-instruments-the-optional-sound-pack }

音源包要单独下载（约 390 MB），不属于本 skill。装好之后，八个原声声部播放真实乐器的录音，三个房间是录制的脉冲响应。没有它，每一份配乐照样能播放，用建模音色，一切不变。

每份立体声录音在它的音色库加载时都会被处理成手机上安全的样子（`sampler.ts` 里的 `RECORDING_WIDTH`）：主体（150 Hz 到 2 kHz）明显反相的那一侧被翻转回来，主体收窄，而 2 kHz 以上的空气感保留宽度，所以折叠成单声道时整件乐器都还在。


```bash
node tools/soundfetch.mjs list          # the install directory and what is installed; no network
node tools/soundfetch.mjs get harp rooms # the one command that downloads: hash, unpack, install (`all` = 373 MB)
node tools/soundfetch.mjs decline       # the user said no: remembered, nobody is asked again
node tools/soundfetch.mjs where         # the install directory
node tools/soundfetch.mjs verify        # re-hash every installed file
node tools/soundfetch.mjs remove <id>   # drop one instrument, or `rooms`
```

**由用户决定，只问一次。** 每次会话的第一份配乐之前，先运行 `list`。如果什么都没装，而且它也没说录音已被谢绝，就用大白话问用户想不想要真实录制的乐器，并说出大小：整包 373 MB，单是三角钢琴就 233 MB，一首曲子通常只需要一件乐器加上 `rooms`（0.4 MB）。答应：`get` 那些 id。不要：`decline`，这个回答会跨会话记住。没有得到这个回答，绝不下载。每当某个声部退回到代码搭建的音色时，`music.mjs` 和各个影片工具都会打印同样的提议，附上手头这首曲子需要的 id 和大小。

`get` 点名它要的 id，或者 `all`。它安装到 `ANIDOODLE_SOUNDS`，或者 `~/.anidoodle/sounds`，并且在解包之前，拒绝任何大小或 sha256 与索引不符的压缩包。`ANIDOODLE_SOUNDS_URL` 让下载指向另一个发布版本；把它指向一个本地目录或一个 `file://` URL，`list` 还会打印那里有哪些可用，因为本地来源是从磁盘上读的。对着 GitHub release 时，`list` 只读已安装的清单，并打印说明索引只由 `get` 获取。引擎会自己找到已安装的音源包；要不安装、直接从某个音源包目录渲染，给 `music.mjs` 传 `--sounds <dir>`。

| 声部 | `variant` | 录音 | 音域 | 带来什么 |
|---|---|---|---|---|
| `piano` | | 三角钢琴，Steinway B | A0 到 G#7 | 3 个力度层，踏板踩下时的共鸣（`sus`）和松键声（`rel`） |
| `piano` | `"upright"` | 立式钢琴，Knight | A0 到 C8 | 2 层，只有松键声，没有踏板共鸣 |
| `harp` | | 音乐会竖琴 | D1 到 G7 | 自然延音，没有东西止住它 |
| `marimba` | | 马林巴 | D2 到 C7 | 3 层，自然延音。稀疏：有些音是把一份录音最多移高 3 个半音得来的 |
| `vibes` | | 颤音琴 | F3 到 F6 | 3 层，有制音，所以靠踏板延长 |
| `glockenspiel` | | 钟琴 | G5 到 C8 | 3 层，自然延音。稀疏：最多移 3 个半音 |
| `bell` | `"tubular"` | 管钟 1 | C4 到 F#5 | 2 层，自然延音 |
| `timpani` | | 定音鼓 | C#2 到 B3 | 3 层，自然延音 |

录音来自 VCSL，CC0。上面的音域和层数读自已安装音源包自己的 `manifest.json`；`check` 遇到稀疏的音色库时会点名。不带 `"tubular"` 的 `bell`，以及上面那张表里的其他每一件乐器，仍然是建模的。

没有录音、仍用代码合成的：弦乐、吉他、贝斯、铜管、木管、合唱、钢片琴、八音盒、电钢琴和原声套鼓。合成器、lo-fi 色彩、电子鼓和每一个音效都是代码，并且一直是代码。

### 为录音写作时有什么不同

- **写在音域之内。** 超出音色库音域的音会抛错，渲染随之停止。三角钢琴能低到 A0；定音鼓止于 B3，所以定音鼓声部里任何高于 B3 的音都需要换一件乐器。音域之内每个音都能播放：引擎取最近的已录音高。
- **衰减是乐器自己的。** 三角钢琴的一个低音会响上几十秒，没有任何东西为了适配尾音而把它剪短。让低音响下去，给它们留出空间。
- **踏板就是踏板。** `sus` 区是制音器抬起时琴弦一同鸣响的声音，凡是踏板踩着时敲下的音，都用它代替普通区来播放；`rel` 区是制音器落回的声音，在松键时轻轻叠加进去。`perform.ts` 在每次和声变化之后紧接着换踏板，所以要把换踏板写在和声变化的地方。`opts: { pedal: false }` 让踏板一直抬着。
- **轻奏保留真实的起音。** Steinway 音色库有三个力度层，而且源录音做过归一化，所以轻音来自轻奏的那份录音，并套用建模钢琴的力度规律，而不是一份重奏录音调小音量的拷贝。不要添加原本没有的起音。
- **层与层之间、键与键之间，音色跟随真实录音。** 介于两个层之间的力度，播放较响的那一层，并把它柔化到在这个键的几份真实录音之间读出的色彩（敲得轻，声音更暗，而不只是更小声）；介于两份录音之间的键，取两侧录音的色彩，所以一份被挪用的录音不会把自己的琴体共鸣一起拖过去。两个钢琴音色库都这样做；`opts: { velocityTone: "lowpass" }` 恢复旧的单一滤波器。在三角钢琴上，如果某份录音的高音比两侧的录音突出，或者两份相邻录音之间的音区出现拐角，音色库加载时就给它加一个固定的柔和搁架滤波：较闷的那份最多提升 4 dB，较亮的那份把剩下的差距降下来。
- **松键让低音嗡鸣。** 在三角钢琴上，毡头会立刻止住上方泛音，而最低的那些弦还会保留片刻低沉的嗡鸣，和录下来的松键声一样。`opts: { release: "flat" }` 让所有频率以同一速率衰减。
- **先测量，再调。** `node tools/pianoruler.mjs` 依次把每份录音留出，用剩下的录音来演奏它，并以真实钢琴自身从轻到响的台阶为单位给差距打分（1.0 = 差了整整一级）。改一样东西，重跑，只有数字朝正确的方向移动时才保留。
- **真实马林巴的低音很丰满。** D2 到 C4 的分量和乐器最高处一样足。让低音线避开旋律的音区，而不是往下够建模马林巴那单薄的低音。
- **稀疏的音色库会自报家门。** 马林巴和钟琴被标为 `sparse`，所以落在空隙里的音是一份移调过的录音。`check` 会在 `voices` 行里说出来，而不是藏起来。

### 选一个房间

| 房间 | rt60 | 录音出自哪里 |
|---|---|---|
| `live-room` | 0.2 s | 约克大学 Genesis 6 录音棚的主录音间 |
| `small-room` | 0.4 s | 约克大学 Arthur Sykes Rymer 礼堂 |
| `recital-hall` | 1.8 s | 约克大学 Jack Lyons 音乐厅 |

风格的 `space.room` 指定一个房间；`node tools/music.mjs --room <id> ...` 只在这一次运行中覆盖它。没有安装的 id 会保留合成的空间，所以同一条命令在没有音源包时也是安全的。按房间的大小选房间，而不是按曲子的长度：`live-room` 用于应该显得贴近、干燥的演奏，`small-room` 用于夜曲或摇篮曲，`recital-hall` 用于房间里坐着听众的时候。混响守卫照样运行：一个录制的大厅如果把后期尾音推到干混音的 10 dB 以内，`check` 照样判它不通过，和任何其他空间一样。

### 检查实际播放了什么

`check` 和 `render` 会打印一行，点名每个声部以及它落在划分的哪一边：

```
voices   recordings: lead (piano), accomp (piano.upright); modeled: bass (bass), drums (kick)
```

本该播放录音却没有播放的，要么是音符落在音色库音域之外的声部，要么是选择了退出的声部。

声部用 `opts: { sampled: false }` 退出，这就是你有意把建模音色放在录音音色旁边对听的方法，也是让录音覆盖不了的音高或音区保持安全的方法。退出的声部渲染出的音频，和没装音源包时同一声部的音频逐位相同，所以退出永远不是瞎猜。

## 任意时长，绝不写死

`fitScore(piece, seconds)` 先调用 piece 自己的 `refit(seconds)`（如果有的话）。作曲生成的 piece 会重复或删掉它的 `stretch` 段，所以仍然落在尾奏上。然后它运行 `fitToDuration`。

`fitToDuration(piece, seconds)` 会尝试每一种曲式：

- 删掉一部分 `optional` 段（删音乐的代价比微调速度高）；
- 把 `repeatable` 组重述 0..n 次，排成「A B A B」或「A A B」（重述时采用该段的 `variations`：`octaveDouble`、`octaveUp`、`thin`）；
- 用能让最后一个音落在 `seconds - tail` 的速度，并且在风格的速度范围之内。

它挑速度最接近原写速度的那种曲式。如果没有完整曲式放得下，就退回到 piece 的 `shortForm`。段落的 `pickup` 跟着段落走：无论这一段落到哪里，都由它自己的弱起引入。

一首手写的 piece，只要有短曲式、可重复段和可选段，就能适配从它四分之一长到它许多倍长的任何长度，而且仍然结束在它的终止式上。

已经放得下的曲式保持原速：当最后一个音加上尾音落在目标长度的 max(0.5 s, 一拍) 之内时，`fitScore` 什么都不改，由尾音吸收差值（否则单是结尾的渐慢就会把速度推偏）。**必须卡准画面时刻的音乐**（剪辑点上的 drop、揭晓时的 sting）要按长度作曲，并且不带 `--fit` 渲染，或者用发布片所用的拍点网格模式（`launchTemplate.ts` 里的 `gridScore`）：这种模式下配乐严格按影片的 bpm 播放，每个剪辑点都落在强拍上。改变了速度的适配会让每个卡点跟着一起移动。

## 风格（21）与情绪（21）

两者都是 `tables.ts` 里的一行行数字。词汇在 `vocab.ts` 和 `vocabMore.ts` 里，[`styles/vocabularies.md`](styles/vocabularies.md) 由它们生成。brief 点名的是行，永远不是形容词。每一行在有人听过它 8 秒之前都保持 `unconfirmed`；随后把听的人说的话写进 `confirmedBy`。

| 风格 | 氛围 | 母带 |
|---|---|---|
| lofiElectronic | 放松、轻快、干净的电子乐 | 密集 |
| lofi | 带灰尘感的 lo-fi hip-hop（电钢琴、黑胶底噪） | 密集 |
| drive | 有推进力的电子乐，四四拍底鼓（four-on-the-floor） | 密集 |
| house | 欢腾的 house / EDM | 密集 |
| synthwave | 霓虹复古，门限军鼓，高飞的主奏 | 密集 |
| hipHop | 点头律动或阴暗的 trap，厚重的 808 | 密集 |
| rock | 乐队的能量，过载吉他，紧凑的套鼓 | 密集 |
| chiptune | 8-bit，两路脉冲波、三角波、噪声 | 密集 |
| cinematic | 弦乐涌起、固定音型、竖琴和钟的色彩 | 柔和 |
| orchestral | 英雄/史诗：铜管主题、弦乐动力声部、合唱、定音鼓 | 柔和 |
| suspense | 持续音、心跳般的脉动、弓奏泛音、惊吓音（stinger） | 柔和 |
| ambient | 空灵、开阔、钟和铺底 | 柔和 |
| choral | 分声部的人声、管风琴、钟 | 柔和 |
| folk | 温柔的原声：吉他、钢琴、竖琴、鼓刷 | 柔和 |
| world | 持续音、调式旋律、手鼓、奇数拍号 | 柔和 |
| playful | 弹跳的槌击乐器、蹦跳的套鼓 | 柔和 |
| jazz | 摇摆的叮叮镲、行走低音、和弦伴奏（comping） | 柔和 |
| nocturne | 独奏钢琴，自由速度（rubato） | 柔和 |
| minimalist | 互相咬合的固定音型 | 柔和 |
| lullaby | 轻柔、摇荡，没有任何打击感 | 柔和 |
| musicBox | 发条拨奏，没有延音 | 柔和 |

情绪：喜悦（joy）、俏皮（playful）、温柔（tender）、怅惘（wistful）、忧郁（melancholy）、充满希望（hopeful）、好奇（curious）、紧张（tension）、恐惧（dread）、敬畏（awe）、凯旋（triumph）、驱动（drive）、平静（calm）、怀旧（nostalgic）、浪漫（romantic）、愤怒（anger）、诡异（eerie）、恶作剧（mischief）、英雄（heroic）、性感（sensual）、悲恸（grief）。

- 每一行都有这些列：
    - 调式和速度；
    - 和声节奏和主奏音区；
    - 每拍起音点数和起音时间（attack）；
    - 目标 LRA 和明亮度；
    - 乐器家族和旋律类型。
- 相容的混合会插值。
- 拒绝的混合：喜悦 + 恐惧、俏皮 + 悲恸、平静 + 紧张。改用前后相连的段落。
- 大幅转变必须落在同步点上。

## 调与调式（13）

大调（major）、爱奥利亚（aeolian）、和声小调（harmonic minor）、旋律小调（melodic minor）、多利亚（dorian）、弗里吉亚（phrygian）、利底亚（lydian）、混合利底亚（mixolydian）、大调五声（major pentatonic）、小调五声（minor pentatonic）、布鲁斯（blues）、全音阶（whole-tone）、洛克里亚（locrian）。音程、色彩音、用途和各调式各自的守卫都在 `theory.ts` 里。

- **调式必须被听出来。** 尽早亮出它的色彩音：dorian 的还原 6 级、lydian 的 #4、mixolydian 的 b7。否则它听起来就是普通的大调或小调。
- **调式必须匹配情绪。** 影片没打算要的调式，会被听成错误的情绪（蝴蝶那次的伤疤：本想要阳光明媚，听到的却是「悲伤又诡异」）。`planProblems` 会拿每一段声明的调和调式去核对它的音符。

旋律类型（9）：琶音（arpeggio）、级进（stepwise）、记忆点（hook）、固定音型（ostinato）、持续音（drone）、呼应（call and response）、对位旋律（counter-melody）、模进（sequence）、主题变形（theme transformation）。

## 怎样写一份配乐

照 [`compose.md`](compose.md) 做。简单说：

1. brief -> 数字（时长、画面拍点、感觉）；
2. 一个风格 + 一个情绪 + 五个情绪控制量；
3. 把**你自己的**和声、低音线、动机、律动选择和曲式写成 `Material`；
4. `node tools/music.mjs check <file>.ts#<export>` 必须 PASS（调、母带、ghost/reverb/masking 守卫、分轨、新颖度）；它的 ARC 行也要回应（整体的形状：[`theory/form.md`](theory/form.md) 第 3 节）；
5. `node tools/music.mjs render <file>.ts#<export> out.wav`（循环用 wav：mp3 不是无缝的）；
6. 先把 8 秒（然后是整首）给人听，做成网页上的一个 mp3。

没有词汇构建器的风格，手写的 `Piece`（夜曲、音色样本曲）依然有效。用 `line()` 写，用 `renderPiece` 渲染。

**峰值是作曲问题。** 两只手的八度落在同一个强拍上，会形成一个真峰值，把柔和母带的响度封顶。在音符里解决：

- 把低音错后一个八分音符；
- 把高潮摊开成一个琶音式的和弦；
- 不要加倍高潮的那个音。

永远不要用压缩器来解决。

## 守卫（`guards.ts`）：悲伤可以，没有形状不行

| 守卫 | 规则 | 在哪里运行 |
|---|---|---|
| **ghost** | 按窗口（4 小节，速度未知时为 8 秒），只有以下条件**全部**成立时才 FAIL：每拍起音点 < 1，持续能量占比 > 60 %，混响尾在干声 12 dB 以内，并且没有终止式。如果窗口是声明过的换气段，则豁免。 | 纯音频也跑。对参考文件，未知的混响和终止式都按不利的一方计算。 |
| **reverb** | 每一小节里，后期尾音都比干混音低 >= 10 dB。 | 渲染出来的曲子 |
| **masking** | 旋律发声时，它的 500 Hz-4 kHz 频段在 >= 80 % 的小节里比其他每个角色都高 >= 3 dB。 | 渲染出来的曲子，按角色分轨 |
| **plan** | 声明的调式与音符相符；钢琴在 C3 以下没有密集的三度。 | 音符数据 |

ghost 守卫怎么测：

- 「持续」指的是那些不像敲击音那样衰减（下降得比 6 dB/s 慢）、也不是紧跟在起音点之后的 50 ms 帧。
- 起音点来自响度归一化后的频谱通量，绝对下限为 4.0。在那首喜欢的参照曲里，真正的音符起点落在 8-62；失谐铺底音色的拍频落在 2-3.4。

**校准**（`node tools/music.mjs samples`，见样本里的 METERS.md）：

| 文件 | 每窗口起音点 | 持续占比 | Ghost |
|---|---|---|---|
| 喜欢的 Kevin Ngo 钢琴曲（只有音频） | 1.00-1.88 | 0.26-0.45 | 通过 |
| 讨厌的 ghost 测试样例（`pieces/fixtures.ts`：缓慢的铺底、5 秒尾音、漂移的 maj7 和弦、没有终止式） | 0.00 | 0.79-0.90 | 每个窗口都不通过 |

这个测试样例同样不通过 reverb（+8 dB）和 masking（0 %）。一道守卫只有在每首喜欢的曲子都通过、每首讨厌的曲子都不通过时，才能上线。

明亮度只报告，从不卡关：那首喜欢的钢琴曲的频谱质心约为 600 Hz。

## 8 秒人耳试听

测量只能证明我们没有明显出错。只有耳朵能说对不对。

- **每部影片：** 配乐之前先听一段 8 秒的样本。它要包含最重要的那次情绪转变。
- **第一次用某个风格、某个家族或某个情绪行：** 听它 8 秒，一次就够。听的人说的话存进那一行。
- **不符规则：** 如果听的人说出的情绪和声明的不一样，错的是那一行，不是听的人。改数字，重新测量，重新听。
- **诚实规则：** 测量通过不等于对音色或情绪的断言。如果没有人听过，交付时就要如实说明。
