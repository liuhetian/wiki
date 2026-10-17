<!-- 中译自 alexgreensh/anidoodle@25aae33 的 skills/anidoodle/references/music/sounds-licenses.md -->
# 音源包许可证

音源包要单独下载，由 `engine/tools/soundfetch.mjs` 安装。本仓库里的任何东西都不在这里授权；这一页写的是：如果你再分发这个音源包，或者再分发用它做出来的影片，必须随附哪些东西。简短版本也写在仓库的 `NOTICE` 里。

两个来源，两种许可证。乐器什么都不需要。房间需要一行署名。

## 乐器：CC0

所有录音都来自 Versilian Community Sample Library（VCSL，Versilian 社区采样库）。

- 来源：VCSL 的 GitHub 仓库[^vcsl]
- 许可证：CC0 1.0 Universal（公有领域）

CC0 什么都不要求：不要署名，不要许可证声明，不要相同方式共享，也没有任何限制。署名依然受欢迎，anidoodle 的页面上也写出了这个采样库的名字。

从里面取了八件乐器：

| 乐器 id | 录音 | VCSL 文件夹 |
|---|---|---|
| `piano` | 三角钢琴，Steinway B | `Chordophones/Zithers/Grand Piano, Steinway B` |
| `piano.upright` | 立式钢琴，Knight | `Chordophones/Zithers/Upright Piano, Knight` |
| `harp` | 音乐会竖琴 | `Chordophones/Composite Chordophones/Concert Harp` |
| `marimba` | 马林巴 | `Idiophones/Struck Idiophones/Marimba` |
| `vibes` | 颤音琴 | `Idiophones/Struck Idiophones/Vibraphone` |
| `glockenspiel` | 钟琴 | `Idiophones/Struck Idiophones/Glockenspiel` |
| `bell.tubular` | 管钟 1 | `Idiophones/Struck Idiophones/Tubular Bells 1` |
| `timpani` | 定音鼓 | `Membranophones/Struck Membranophones/Timpani 2` |

每个文件夹里具体取的是哪个 WAV、它的 sha256 是多少，都写在音源包自带的 `LICENSES.md` 里，就在 `manifest.json` 旁边。那份文件是权威，这张表只是地图。

## 房间：CC BY 4.0

录制的脉冲响应来自 OpenAIR（Open Acoustic Impulse Response library，开放声学脉冲响应库），约克大学（University of York）Audio Lab[^openair]。

- 许可证：知识共享署名 4.0 国际许可协议（Creative Commons Attribution 4.0 International，CC BY 4.0）
- B 格式（W X Y Z）录音按 L = W + Y、R = W - Y 解码成立体声

CC BY 4.0 要求署名。任何人再分发这个音源包，或者再分发用其中某个房间渲染出来的影片，都必须随附这行署名：

> 录制的脉冲响应来自 OpenAIR（Open Acoustic Impulse Response library，开放声学脉冲响应库），约克大学（University of York）Audio Lab[^openair]，按 CC BY 4.0 授权。

能逐个房间署名的地方，就给每个房间署名：

| 房间 id | 房间 | 网址 |
|---|---|---|
| `small-room` | 约克大学 Arthur Sykes Rymer 礼堂（Arthur Sykes Rymer Auditorium, University of York） | OpenAIR 上的该房间页面[^small-room] |
| `recital-hall` | 约克大学 Jack Lyons 音乐厅（Jack Lyons Concert Hall, University of York） | OpenAIR 上的该房间页面[^recital-hall] |
| `live-room` | 约克大学 Genesis 6 录音棚的主录音间（Genesis 6 Studio live room, University of York） | OpenAIR 上的该房间页面[^live-room] |

CC BY 4.0 允许的另外三件事也值得知道：商用、修改（所以对脉冲响应做处理并不违反许可）、分发。唯一的条件就是上面那行署名。

## 这些规定从哪来

`anidoodle-research/sound-pack/CONTRACT.md` 定下了第 1 版的规矩：FLAC、48 kHz、24-bit，整包小于 200 MB，只收 CC0 或公有领域的素材。三个 OpenAIR 房间是例外，由 2026-10-04 的修订 (b) 批准，批准是在听出这些麦克风录音确实让声音令人信服之后。它们是本 skill 附带的唯一一批 CC BY 素材，也是唯一需要署名的部分。

用 `node tools/soundpack.mjs` 可以重新生成音源包和许可证，它根据引擎读取的同一份 manifest 写出逐文件的 `LICENSES.md`。

[^vcsl]: VCSL（Versilian Community Sample Library）的 GitHub 仓库 <https://github.com/sgossner/VCSL>，网址照上游原文抄录（2026-10-17），未打开核对。
[^openair]: OpenAIR（Open Acoustic Impulse Response library，约克大学 Audio Lab）官网 <https://www.openair.hosted.york.ac.uk/>，网址照上游原文抄录（2026-10-17），未打开核对。
[^small-room]: OpenAIR 上 Arthur Sykes Rymer Auditorium 的页面 <https://www.openair.hosted.york.ac.uk/?page_id=425>，网址照上游原文抄录（2026-10-17），未打开核对。
[^recital-hall]: OpenAIR 上 Jack Lyons Concert Hall 的页面 <https://www.openair.hosted.york.ac.uk/?page_id=571>，网址照上游原文抄录（2026-10-17），未打开核对。
[^live-room]: OpenAIR 上 Genesis 6 Studio live room 的页面 <https://www.openair.hosted.york.ac.uk/?page_id=483>，网址照上游原文抄录（2026-10-17），未打开核对。
