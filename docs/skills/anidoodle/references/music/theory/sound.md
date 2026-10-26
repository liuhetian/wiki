# 声音理论：作曲与混音用的心理声学

你写音符，引擎负责混音。大多数"浑浊"、"单薄"或"被埋掉"的结果，其实是由音符决定的：音区、间距、密度，以及哪些声部相互重叠。本页讲的是这些选择背后的物理。引擎的守卫和 `craft` 检查的是你能从乐谱里控制的那部分。混音链本身在 `render.ts` 和 `mixProfiles.ts` 里（音效见 [../sound-design.md](../sound-design.md)）。

## 1. 临界频带与粗糙度

- 耳朵在相互重叠的**临界频带**（critical bands）里分析声音：500 Hz 以下每个频带约 100 Hz 宽，500 Hz 以上约为中心频率的 20 %（Zwicker 1961；ERB 为 24.7 x (4.37 f/kHz + 1) Hz，Glasberg & Moore 1990）。
- 落在同一个频带里的两个分音会**产生拍频，变得粗糙**。两者相距约四分之一个临界频带时粗糙度最大（Plomp & Levelt 1965）。
- 在低音区，一个频带跨越许多个半音，所以**C2 上的三度是粗糙的，而 C4 上同样的三度是甜美的。**

这就是**低音区音程下限**（low interval limits）背后的物理（Berklee 编曲课上教的那张图表；例如 Pease & Pullig 2001），也就是每种音程在变浑浊之前，下方那个音所能到的最低位置：

| 音程 | m2 | M2 | m3 | M3 | P4 | 三全音 | P5 | m6-M7 | m9 | M9 |
|---|---|---|---|---|---|---|---|---|---|---|
| 下方音的最低位置 | E3 | Eb3 | C3 | Bb2 | Bb2 | B2 | Bb1 | F2 | E2 | Eb2 |

- 八度没有下限。这张图表有大约 ±2 个半音的宽松度（一台音乐会三角钢琴能突破得更多），所以 `craft` 只标记比下限低 3 个或更多半音的音程。
- 修法：把声部排布展开（在低音区用 `1-5-3'` 代替 `1-3-5`），或者把上方的音升高一个八度。

## 2. 掩蔽：曲调为什么会被埋掉

- 较响的声音会把同一临界频带里较轻的声音盖住。掩蔽向**上**扩散：响亮的低音掩蔽较高的声音，比反过来更厉害（Zwicker & Fastl 2007；Moore 2012）。
- 处在旋律所在八度里的 pad 或和弦堆叠，即使电平更低也会掩蔽旋律。引擎的掩蔽守卫要求旋律在 500 Hz-4 kHz 范围内比其他每个声部都高出 3 dB。
- **先用作曲手段修，再动电平：**
    - 把和弦排在曲调下方（`craft` 的 "melody under chords" 一项）；
    - 旋律在动的时候削薄伴奏；
    - 给主奏一个独特的音色和它自己的八度；
    - 让对位声部在休止处作答，而不是与旋律重叠。
- **频率槽位**（[form.md](form.md) 第 4 节）：同一时间每个音区只归一个声部。

## 3. 等响（Fletcher-Munson / ISO 226）

- 听觉在频率两端最不敏感，在 2-5 kHz 最敏感。听音音量较低时，低频和高频会消失掉（Fletcher & Munson 1933；ISO 226:2003）。
- 一条在录音棚监听音箱上"够响"的低音线，到了手机扬声器上就会消失（小扬声器在大约 150-200 Hz 以下会滚降）。**手机规则：** 每个低音声部都需要 500 Hz 以上的谐波：带一点驱动失真或拨片起音的贝斯，加了饱和的 808。在低电平下把低音线高八度重叠一遍也有效。
- 安静的段落听起来是更单薄，而不只是更轻。轻柔的段落可以多带一点中低频的温暖。

## 4. 不同风格的音色平衡（长期频谱）

- 商业混音都集中在一条平滑的下降斜线附近，从 100 Hz 到 4 kHz 大约每倍频程 -5 dB，再往上更陡（Pestana et al. 2013）。这个形状在几十年间、在各种风格中都保持不变。各风格的差别在两端：

| 风格 | 低频端 | 中频 | 高频端 |
|---|---|---|---|
| EDM、hip-hop、trap | 超低频 +3-6 dB（40-80 Hz），底鼓和 808 主导 | 在 300-500 Hz 附近略微挖低 | 明亮的踩镲 |
| 流行、摇滚 | 饱满，底鼓和贝斯平衡 | 人声和吉他在 1-4 kHz 处靠前 | 明亮 |
| lo-fi | 温暖，60-90 Hz 处有磁头凸起 | 中低频靠前 | 8-10 kHz 以上滚降 |
| 管弦乐、原声 | 自然，超低频较少 | 宽 | 因距离和厅堂而自然滚降 |
| 氛围 | 柔和的低频、长尾音 | 退后 | 有空气感但温和 |

- 引擎的混音配置实现了这些，`check` 会针对情绪测量频谱质心。对作曲来说：**暗色的情绪需要更低的音区和更少的明亮起音，而不只是一个更暗的滤波器。**

## 5. 立体声与纵深

- **低频单声道：** 底鼓、贝斯以及大约 120 Hz 以下的任何东西都放在中间。低频几乎不携带方向信息，铺开了还会吃掉动态余量。
- **宽度来自差异**：两边放不同的声部（或者同一声部换一种声部排布），以及两个在时值和音准上略有差异的演奏者。把一个声部复制到左右两边，仍然是单声道。
- **优先效应（哈斯效应，precedence / Haas effect）：** 同一个声音晚 1-30 ms 到达，会被听成来自较早那一侧的单一声音（Haas 1951；Blauert 1997）。它对叠录声部的加宽很有用，对单声道回放则很危险（梳状滤波）。
- **纵深线索：** 远处的声音更轻、更暗（空气会吸收高频）、更湿（混响与直达声之比更高），起音也更软。主奏放近，pad 放远。

## 6. 混响与延迟的时值

- **与速度同步的延迟：** 一个四分音符 = 60,000 / bpm ms（90 bpm 时为 667 ms）。附点八分音符 = 它的 0.75 倍。八分音符 = 0.5 倍。
- **预延迟**（pre-delay，混响开始之前的空隙）让起音保持干声、声部保持清晰。10-30 ms 是典型值。再长一些（最长到一个 1/32 或 1/64 音符）能让人声和主奏保持靠前（Izhaki 2017）。
- **衰减时间要配合速度：** 让尾音在下一个强拍之前消失（四分音符到二分音符的长度）。更长的尾音会模糊和声的变化。尾音和干声相差不到 10 dB 时，引擎的混响守卫判不合格。
- **慢而稀疏 = 更多空间。快而密集 = 更少空间。** 很多音符再加上一个长厅堂混响，就是 ghost 守卫专门要防的那种"鬼影"糊团。

## 7. 响度与动态

- 引擎把母带做到 -16 LUFS（轻柔）或 -14 LUFS（密集）、-1 dBTP，也就是流媒体规范（AES TD1004，2015）。
- **真正的动态是写出来的，不是母带处理出来的：** 靠段落的 `energy`、`dyn` 和力度。峰值是作曲问题：让低音在最响的那个首拍下错开一点，把大和弦以琶音方式滚奏出来，也不要在每个声部里都重叠高潮音。
- 感知响度除了跟随电平，还跟随密度和明亮度。在表头读数相同的情况下，一段推进可以靠更多的起音和更高的音区听起来更响。

资料来源：Zwicker, "Subdivision of the audible frequency range into critical bands", *JASA* 33 (1961)；Glasberg & Moore, "Derivation of auditory filter shapes from notched-noise data", *Hearing Research* 47 (1990)；Plomp & Levelt, "Tonal consonance and critical bandwidth", *JASA* 38 (1965)；Zwicker & Fastl, *Psychoacoustics: Facts and Models*（第 3 版，2007）；Moore, *An Introduction to the Psychology of Hearing*（第 6 版，2012）；Fletcher & Munson, "Loudness, its definition, measurement and calculation", *JASA* 5 (1933)；ISO 226:2003；Pestana, Ma, Reiss, Barbosa & Black, "Spectral characteristics of popular commercial recordings 1950-2010", AES 第 135 届大会 (2013)；Haas, "Über den Einfluss eines Einfachechos auf die Hörsamkeit von Sprache", *Acustica* 1 (1951)；Blauert, *Spatial Hearing* (1997)；Izhaki, *Mixing Audio*（第 3 版，2017）；Owsinski, *The Mixing Engineer's Handbook*（第 4 版，2017）；Katz, *Mastering Audio*（第 3 版，2015）；Pease & Pullig, *Modern Jazz Voicings* (2001)；AES TD1004.1.15-10, "Recommendation for loudness of audio streaming and network file playback" (2015)。
