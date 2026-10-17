<!-- 中译自 alexgreensh/anidoodle@25aae33 的 skills/anidoodle/references/music/sound-design.md -->
# 音效设计：音效套件，按帧放置，在配乐之上也听得见

anidoodle 的每一个音效都是**用代码从零合成的**：没有采样，没有录音，永远没有。（音乐里的原声乐器可以播放可选音源包里的录音；音效永远不会。）每个音效都是确定性的：同样的 cue 和种子（seed）生成的采样点完全相同。

代码：`engine/src/canvas-core/music/sfxKit.ts`（套件）、`sfxMix.ts`（放置）、`sfxCore.ts`（基础构件）。工具：`engine/tools/sfx.mjs`。

## 什么让一个音效听起来是设计出来的，而不是生成出来的

- **分层。** 每个声音都有一个瞬态（transient，接触的那一下：1-4 ms 的滤波噪声脉冲）、一个主体（body，被击物体的振动模态、一个音高下滑的正弦波、一段摩擦频带）和一个尾音（tail，来自 `dsp.room` 的小房间）。单独一个噪声脉冲不是音效，它只是一声咔嗒。
- **物理，但算得便宜。** 塑料、积木和铃铛是*模态*的：几个按非谐波比例排列的阻尼正弦波。水滴和气泡鸣响时音高是*上升*的。呼啸声（whoosh）是一次*掠过*：距离决定电平和空气感，径向速度决定多普勒滑音（靠近时明亮，远去时暗沉），角度决定声像。笔的摩擦频带随笔画速度变亮。
- **会移动的立体声。** 移动的声音会在声场里穿行（`dir: 1` = 从左到右）。击打声带着哈斯（Haas）偏移，稍稍偏离中央。尾音做了去相关处理。
- **没有两下击打是一样的。** 音高、衰减、声像、模态调音和电平（±1 dB）随种子变化。二十下按键滴答声就是二十下不同的滴答声。`mixSfx` 按（kind, frame）给每个 cue 分配它自己的种子，所以插入一个 cue 永远不会改变其他 cue。
- **有音高的地方就调准。** chime、riser、`press:confirm` 和 `impact:bloom` 跟随影片的调。调不对的闪烁声听起来像个错误，所以**没有默认的调或速度**。传入 `plan.score: { piece, tempo? }`（调、bpm 和小节取自影片的乐曲），或者设置 `plan.key` / `plan.bpm`。有音高的种类没给调，或者 riser 没给 bpm，都会抛错。

## 套件

`node tools/sfx.mjs list` 会实时打印这张表。电平（level）是这个声音在它自己的发声窗口内的目标响度（K 加权，见下文）。闪避（duck）是配乐在它下面压低多少。

| 种类（kind） | 变体（第一个为默认） | 用途 | 电平 | 闪避 |
|---|---|---|---|---|
| tick | key, soft, ui, space | 打字，每个字符一下；UI 的滴答声 | -20.5 | 0 |
| press | thock, soft, confirm | Generate 按钮；`confirm` 会加一个调准的回应音 | -13 | 2 |
| pop | pop, cork, tiny | 有东西出现；一张卡片落定；一枚徽章 | -16 | 1 |
| ink | plip, double, bloom | 一滴墨水；`bloom` 为一帧墨水晕开的画面开场 | -15 | 2 |
| scratch | nib, pencil, marker | 正在书写的字（`lengthS` = 书写时长） | -18.5 | 1.5 |
| paper | slide, flip, rustle | 一张纸落下（击点 = 落定那一刻）、翻一页（击点 = 翻页的脆响） | -18 | 1.5 |
| whoosh | soft, air, fast, deep | 有东西从镜头前掠过（击点 = 掠过那一刻） | -16 | 2 |
| swish | in, out, soft | UI 面板或卡片滑动 | -17 | 1 |
| riser | soft, air, tonal | 通往揭晓的**那一次**铺垫（击点 = 它的结尾） | -15 | 2 |
| impact | boom, soft, bloom | **那一次**揭晓；`bloom` 先吸一口气，再按调闪烁 | -9 | 6 |
| chime | sparkle, bell, glint | 魔法 / 成功，按调调准 | -17 | 1.5 |
| bubble | bubbles, splash, gloop | 水中生物、koi（锦鲤） | -16.5 | 1.5 |
| brick | clack, snap, tumble | 玩具积木：轻敲、按到凸点上、掉到一堆上 | -15 | 1.5 |
| thread | pull, pierce, stitch | 刺绣：线穿过布（击点 = 拉紧那一下）、针 | -17.5 | 1.5 |

## 在影片里放置音效

cue 按**影片帧号**定位，帧号是整数（小数帧会抛错；想让击点落在两帧之间，就用 `snap` 把它对齐到拍上）。这一帧就是声音同步点落下的位置：击打的那一下；whoosh 的掠过；paper slide 的落定；riser 的**结尾**。预卷（pre-roll：whoosh 的逼近、riser 的铺垫）渲染在这一帧之前。如果预卷会早于第 0 帧开始，计划会抛错，并报出最早的合法帧。

```ts
import { filmSfx, filmAudio, composePiece, type SfxPlan } from "./music";
import { myScore } from "./myScore";                  // the Material YOU composed for this film (compose.md)
const score = composePiece(myScore);
const plan: SfxPlan = {
  fps: 30, frames: 450, score: { piece: score }, beatZeroS: 0, seed: 7,  // key, bpm, bar from the score
  cues: [
    { frame: 12, kind: "tick" },                                          // ...one per typed character
    { frame: 157, kind: "press", variant: "thock", snap: "beat", label: "Generate" },
    { frame: 182, kind: "scratch", variant: "nib", lengthS: 1.4 },
    { frame: 232, kind: "whoosh", variant: "soft", dir: 1 },
    { frame: 400, kind: "riser", beats: 4 },                              // ends ON bar 5
    { frame: 400, kind: "impact", variant: "bloom", snap: "bar" },
  ],
};
export const audio = filmSfx(filmAudio(score, 15), plan);   // Film.audio: score + effects
```

- `snap: "bar" | "beat" | "8th" | "16th"` 把同步点移到速度网格上（`bpm`、`beatZeroS`、`beatsPerBar`）。音乐性的时刻要对齐网格：揭晓落在小节上，闪烁声落在拍上。UI 声音（打字、点击）贴着画面走。
- `beats` 按速度确定 riser 的长度。它的和弦先以八分音符脉动，然后是十六分，再到三十二分，并停在小节首拍上。
- 每个 cue 可设：`variant`、`seed`、`pitch`（半音数）、`gainDb`、`dir`、`lengthS`、`duckDb`、`minDb`、`label`。
- `mixSfx(music, plan)` 返回混音、分轨（`sfx` 和被压低的 `music`）、闪避曲线、每一个已放置的 cue 以及可闻度表。`filmSfx` 把它包装给 `Film.audio` 用，并且**遇到被淹没的 cue 就抛错**。
- 最末尾只有一道母带处理：一个前瞻式真峰值上限，设在 -1 dBTP（`ceilingDb`）。配乐送到这里时已经做过母带，所以不做任何重新归一化。

## 电平与可闻度规则

没人听得见的 cue 是 bug，不是含蓄的选择。只检查 cue 是否存在的测试什么也证明不了：要测的是它在自己那一刻能压过音乐被听见。

- 每个 cue 都**在它自己那一刻**与压低后的配乐比较。量尺是 cue *发声窗口*内的 K 加权（BS.1770）响度：发声窗口指与它最响处相差 10 dB 以内的那些 10 ms 帧，长度 15-500 ms。配乐在同一窗口内测量，窗口至少 100 ms。
- **余量（margin）= cue - 配乐。** 只要有任何一个 cue 比配乐低出超过 `minDb`（默认 **-6 dB**），混音就不合格。短促的瞬态在 -3 到 -6 之间就能穿透出来。持续的质感声（scratch、thread）要 -3 或更好。
- 要修一个不合格的 cue，先提高它的 `gainDb`。只在关键的时刻才提高它的 `duckDb`。
- 闪避：配乐在 cue 的窗口之前压低（40 ms 升余弦起音），保持，然后在 280 ms 内恢复（impact 之后是 1.2 s）。打字不触发闪避。揭晓时压低 6 dB。
- 在我们自己的发布片配乐上测得的结果（`launchLofi3`：只是一个演示，绝不是给你的影片用的配乐；前 15 s，33 个 cue）：-15.5 LUFS，-1.9 dBTP，每个 cue 都听得见。余量：打字声比前奏的铺底高 +3 到 +8 dB；律动段的 cue 为 -3.5 到 +5 dB；揭晓为 +10.7 dB。

## 品味：什么时候用音效

- **只在真正的方向变化上用音效。** 一次按下、一次出现、一次场景移动、一次落定。绝不在每个动作下面都垫音效，也绝不铺一层持续不断的呼啸声。cue 周围的安静才让它落得有力。
- **每部影片一个标志性的 riser、一个 impact。** 它们标记那次大揭晓。再加一个 riser，两个的分量都减半。
- 转场默认是轻柔的移动，所以它们的声音也轻柔：`whoosh:soft` 和 `swish:soft`。匹配剪辑式的硬切配一下落在拍上的短击打，或者什么都不配。绝不用尖利的嗖声。
- 打字是按打字的节奏每个字符一个 `tick`，空格处用 `space`。它的电平高于前奏、低于律动段。
- 任意 100 ms 内最多放两个 cue。落在底鼓上的 thock 会融进底鼓里：如果它正好开启律动，那很美；放在别处就是一团糊。
- 交付之前先放在上下文里听。渲染套件页（`node tools/sfx.mjs kit <dir>`）和一段配在真实配乐上的演示，并检查可闻度表。
- **克制就是设计。** 一个 cue 要靠标记观众应该感受到的东西来赢得一席之地：一次按下、一次抵达、一次落定、那次揭晓。只是剪辑造成的画面变化保持安静。拿 cue 的数量对照影片的长度数一数；如果说不出每一个标记的是什么，就删掉它。
- **落在那一帧上。** 击打属于事情发生的那一帧；前后一帧以内都会被看成同一个事件。击打之前一个轻柔的引入会被读作预期。声音晚于它的画面会被读作延迟，这是观众永远会注意到的那一种错误。
- **一种功能一个声音。** 每个按钮的每次按下都是同一下点击，同样的电平，这样 UI 感觉是一个整体。变化留给故事里的时刻，而不是给同一动作的重复。
- **结尾要喘口气。** 音乐落在主音上，或者让最后一个和弦延续鸣响；如果影片有最后一个标记，在它之前留一拍近乎安静；尾音一直响到最后一帧。绝不戛然切断，之后也绝不冷场。

## 成品混音 { #the-finished-mix }

整部影片的声音（配乐和音效合在一起）在交付之前必须做到：

- **达到响度目标。** 交付母带（`music/delivery.ts`，即 `mixSfx` 和 `mixLaunch` 的最后一级）先设一个静态增益到 -16 LUFS（轻柔）或 -14（密集、发布片），再接一个平滑的真峰值限幅器，它的工作量有上限（轻柔 4 dB，密集 6 dB）：超过上限时让增益让步，而不是把击打声压扁，并报告差了多少。`master: "none"` 保留旧的只限峰值的上限。只有配乐的影片保留它自己的母带处理（[music/index.md](index.md) 里的 Master 一步）。
- **绝不出现数字静音。** 只有音效的影片要铺一层比 cue 低 22 dB 的房间底噪（room tone，`bed`），几乎是单声道，好让手机也能保留它，从第一帧铺到最后一帧。
- **完整的形状。** 从第一帧起就有声音（0.5 s 以内），中间没有超过 0.25 s 的空洞，最后一个声音距最后一帧不超过 0.5 s。影片有意为之的安静（屏住的一口气、在一拍上的停顿）要在 `meta.quiet` 里声明为 `[fromFrame, toFrame, reason]`。`verify-export --delivery` 会在形状不对、编码后真峰值超过 -1 dBTP、响度低于 -19 LUFS 时判不合格；从 -17 起给出警告。


## 检查成片的声音 { #checking-the-finished-films-sound }

在影片交给任何人之前，给实际交付的那份混音打上数字。有两个工具读取渲染出的文件来做这件事（给一个影片名对应 `out/<name>.mp4`，或者直接指向一个 `.wav` 或 `.m4a`）：

```
node tools/soundcheck.mjs <film|file>                 # the scorecard; exit 1 on any FAIL
node tools/soundcheck.mjs <film> --json --out x.json  # the same, as data
node tools/soundcheck.mjs <film> --allow 3.1:3.6      # the silence there is a declared held breath
node tools/soundsheet.mjs <film> -o out/<film>-sound.png   # one picture of it all
```

`soundcheck` 里的每项指标都有一行状态：有范围的给 PASS、WARN 或 FAIL，只做报告的给 INFO。它们下面是 **START HERE**（从这里开始）：按重要性排好序的修改清单，每一条都具体到在哪里、改什么，例如 "3.4 s hole at 0:03.4"、"crowded body, strongest near 630 Hz: notch it a couple of dB"、"mids decorrelated: narrow the stereo width below 2 kHz"。这些数字分成五组：

- 电平：整合响度 LUFS、真峰值、响度范围、最响的 3 s、开头和结尾的电平、一条 11 点的响度弧线、最响的时刻；
- 形状：第一个声音何时到来、片中有没有空洞、最后一个声音之后的冷场、淡出、收尾的时刻、被切断的结尾、每秒有多少起音和重音（电平的突然跳升），以及屏息（短暂下陷又马上恢复）；
- 频谱：能量在五个频段（隆隆声、温暖、主体、咬劲和闪亮，20 Hz 到 16 kHz）之间如何分配，外加频谱质心；
- 立体声：侧信号与中信号之比（side vs mid）、整体和分频段的左右声道相关性（150 Hz-2 kHz 是手机会把主体梳状抵消掉的频段），以及折叠成单声道时比预期的 3 dB 多损失多少；
- 画面（任何带视频的文件）：帧差事件、在 100 ms 内有起音的事件占比（与随机基线对比）、没有声音的事件，以及起音偏移的中位数。仅为 INFO：并不是每一个画面变化都该配 cue。

内置的范围是为绘制过程片设的：-16 到 -13 LUFS（网页目标 -14，轻柔的影片 -16），真峰值不高于 -1 dBTP，LRA 至多 9 LU，0.5 s 内出现声音，没有超过 0.25 s 的空洞，结尾静音至多 0.5 s，150 Hz-2 kHz 相关性至少 0.3，额外的单声道损失至多 1.5 dB，隆隆声（80 Hz 以下）不高于总能量的 -5 dB。

如果用户有自己很喜欢其声音的影片，就改用那些影片作基准来打分：`node tools/soundcheck.mjs profile <films...> -o references/music/sound-profile.json`，然后传入 `--profile references/music/sound-profile.json`。这份 profile 会移动那些属于品味问题的范围（响度、频段、宽度）。交付必须满足的范围（真峰值、第一个声音、空洞、结尾静音、单声道损失）不会变。

`soundsheet` 把整条音轨从上到下排在一条时间线上：一条帧缩略图带、频谱图、波形、瞬时响度和短期响度（标出整合电平和 -14），然后是几行起音、重音和画面事件（如果没有声音落在某个画面事件上，它会变红）。空洞和结尾的冷场用阴影标出。交出影片之前先看一眼；缺口、无声的结尾或迟到的重音在这一页上一目了然。

这些指标实现在 `engine/src/canvas-core/music/soundcheck.ts`，并用 `engine/test/soundcheck.test.ts` 里人工合成的故障做测试。

## 工具与检查

```
node tools/sfx.mjs list                              # kinds, variants, levels, uses
node tools/sfx.mjs one whoosh soft 3 out.mp3         # one sound
node tools/sfx.mjs kit <dir>                          # every variant x3 + demo + page + meters.json + spectra/
node tools/sfx.mjs test                               # the gate
node tools/soundcheck.mjs <film>                      # the finished film's sound (see above)
```

测试会对每一个种类和变体检查：

- 确定性（两次渲染的 md5）以及种子带来的变化；
- 没有 NaN、没有直流偏移（DC）、峰值不高于 -1 dBFS、结尾归零，20 kHz 以上没有嘶嘶声（内置了 16.5 kHz 的空气感滚降）；
- 声音不是静音，且电平在不同种子之间保持稳定。

它还检查：

- whoosh 的多普勒和声像移动；
- chime 调准到它的调；
- riser 与速度同步，以及对齐到拍（snap-to-beat）；
- 演示：确定性、长度等于影片长度、真峰值在上限之内、每个 cue 都听得见、配乐在 impact 下被压低；
- 被淹没的 cue 会判不合格；
- 遇到未知的种类或变体、早于第 0 帧的预卷、错误的种子、影片范围之外的帧、没有 bpm 的 snap、错误的调或超出范围的音高时，校验会清晰地抛错。
