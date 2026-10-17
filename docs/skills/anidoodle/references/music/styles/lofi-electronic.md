<!-- 中译自 alexgreensh/anidoodle@25aae33 的 skills/anidoodle/references/music/styles/lofi-electronic.md -->
# 风格：lo-fi 电子（放松、轻快、干净）

> 这是一套词汇，不是一首歌。数据是 `engine/src/canvas-core/music/vocab.ts` 里的 `VOCAB.lofiElectronic`（打印出来：`node tools/music.mjs vocab lofiElectronic`）。音符由你照 [../compose.md](../compose.md) 来写。我们的发布片就是用这个风格配的乐（`launchLofi3`）。那份配乐是我们的，已收进新颖度语料库（novelty corpus）。绝不重用它的和弦进行、hook、节奏、鼓或曲式。

## 声音

放松但**轻快**、**清晰**、**不嘈杂**：

- 一层温暖的铺底（pad），随底鼓一起呼吸；
- 一条拨奏主旋律，穿过附点八分音符的乒乓延迟；
- 一条高音副旋律；
- 一个圆润的正弦超低音（sub）；
- 一套有弹性、干净的鼓组。

**绝不要：**

- 合成电钢琴；
- 黑胶噼啪声；
- 降比特（bit-crush）；
- 压暗的母带低通；
- 厚重的磁带效果。

这些听起来是尘感 lo-fi 嘻哈（`lofi` 风格），而不是干净的电子乐。

| 槽位 | 音色 | 做法 | 分轨 RMS 目标 |
|---|---|---|---|
| chords | `warmPad` | 7 个 PolyBLEP 锯齿波，展开 0.55 x +-14 音分，每个声部缓慢漂移，2.6 kHz 处 12 dB 低通，0.5 s 起音，1.4 s 释音 | -22 dB |
| lead | `softPluck` | 三角波 + 低一个八度的方波，滤波器猛地打开，0.42 s 衰减，附点八分乒乓延迟（反馈 0.28，混合比 0.24） | -15.5 dB |
| counter | `softPluck` | 更亮，声像 0.35，更多延迟和房间感 | -20 dB |
| bass | `sub` | 正弦波 + 一丝二次谐波，150 Hz 低通 | -18.5 dB |
| kick / snare / ghost / hat | 鼓组 | 有弹性的底鼓、一个军鼓、低约 11 dB 的鼓边幽灵音、十六分音符踩镲 | -14.5 / -19 / - / -24.5 dB |
| arp, perc | `softPluck`, `hat` | 可选的额外层 | - |

备选音色：

- lead：`bell`、`mallet`、`guitar`；
- chords：`strings`、`piano`；
- bass：`warm`。

总线：

- 底鼓把和弦和副旋律侧链压低（深度 0.38，释放 0.24 s）；
- 磁带效果几乎听不出（2.5 音分的 wow）；
- 干净的母带，**-14 LUFS**，真峰值 **<= -1 dBTP**。

这些分轨目标是在一份有人听过的配乐上校准的，也是唯一校准过的目标。

## 律动

`bounce`、`halfTime`、`broken`、`skip`、`pulse`、`build`。每个段落角色（`main`、`half`、`build`）各挑一个，再设好 `density` 和 `variation`。随机种子每小节都变。摇摆 0.52-0.56。

## 和声语言（和弦进行自己写）

- **调式：** 大调（major）、多利亚（dorian）、利底亚（lydian）、爱奥利亚（aeolian）、混合利底亚（mixolydian）。
- **和弦性质：** 七和弦、九和弦、十一和弦、十三和弦、add9、sus2 和 sus4。光秃秃的三和弦留给落点。
- **倾向：**
    - 2、4 或 8 小节的循环；
    - ii-V 进行；
    - 漂移的 IV-iii-vi 进行；
    - 调式循环段（vamp）（多利亚里的 i-IV，利底亚里的 I-II）；
    - 借用的 iv 或 bVII，做一个怅惘的转折。
- **和声节奏：** 每小节一个或两个和弦。换和弦可以比小节线早一个八分音符。
- **声部排布：** 无根音的 3-4 音排布，大约在 E3 到 E4 之间，级进移动。根音归超低音。
- **张力：** sus4 和十三和弦带着倾向，maj7#11 漂浮，7b9 或借用的 iv 带着酸楚。把带倾向的那个声部往下走一级来解决。

## 旋律规则（动机自己写）

- 主旋律在 C4-A5，副旋律高一个八度。
- 短的拱形，最高点放在乐句靠后的位置。
- 每拍 1-3 个音，留出休止让回声来应答。
- 一个 2-5 个音、有自己节奏的小单元：先重复它，再变化它（上移一级、最后一个音程倒置、错后一个八分音符）。
- 主旋律和副旋律之间一呼一应。

## 编曲语法

典型结构：前奏 → 律动段 → hook →（半速段或抽空段）→ 落回主和弦的 drop → 尾奏。每次只加或减一层。把 drop（所有层回来、主和弦）放在画面最强的那一拍上。

**过渡：**

- 一小节加花；
- 一小节半速；
- 鼓撤掉，做一段抽空段。

**结尾：**

- 主和弦延长，配上动机的最后一个音；
- 一记干净的收尾短击（button）。

## 混音：先按分轨 RMS 配平，再做母带

```
node tools/music.mjs check <file>.ts#<export>              # the whole gate, stems included
node tools/music.mjs stems <file>.ts#<export>              # the stem table alone, while you balance
node tools/music.mjs render <file>.ts#<export> out.mp3 --stems
```

分轨是一个声部自己的信号：

- 未经母带处理、进房间混响之前、经过它自己的增益和侧链压低之后；
- 在它的 **mid**（(L + R) / 2，声像之后，30 Hz 高通）上测量，取它发声处那些 20 ms 块的 RMS：低于 -70 dBFS 的块一律不算，然后比该声部自身电平低 20 dB 以上的块被剔除（像响度那样做门限），采样率 24 kHz。（v1 电平表读的是左声道，逐个采样点、阈值 -80 dB；每个目标都在 sound-v2 合并时、在当初设定它的那次渲染上换算过，所以平衡没有变。）

被标出来的声部用 `levels` 修，绝不动母带。

**教训：** 整合响度（integrated LUFS）只说明整个混音有多响。在发布片的配乐上，混音读数是健康的 -14 LUFS，超低音却**高了 7-10 dB**。`tools/music-unit.mjs` 把这件事留作回归测试：超低音高 9 dB 时母带照样能做到 -14.0 LUFS，只有分轨电平表会把它标出来。
