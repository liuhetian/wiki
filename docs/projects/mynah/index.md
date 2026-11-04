---
description: "粗讲：开源实时数字人，回复语音边合成边驱动一张脸推到浏览器；先讲脸怎么动——三种口型引擎、贴回半身画布、烘焙待机与动作、从视频挑基底帧，再讲语音轮次、本能层、给 Agent 一张脸，最后几个工程问题"
---

# Mynah：让一张肖像跟着语音实时说话

Mynah 属于实时数字人（realtime talking avatar）：访客对着网页说话，页面里的人用合成语音回答，嘴、头和表情跟着语音动，随时能打断。最简单的做法是一张人物图加一段语音，离线生成一段口播视频 —— 本站的[对口型视频](../../skills/agent-io/reference/video/lip-sync.md)就是这条路，片子生成完才能看。Mynah 要的是**边说边出画面**：回复语音一边合成，脸一边生成、一边推给浏览器；没人说话时，人也不能定格。

<figure>
  <video src="/projects/mynah/assets/media/mynah-demo.mp4" autoplay loop muted playsinline width="720"></video>
  <figcaption>上游演示：问一句，数字人边说边对口型，右边是字幕和输入框</figcaption>
</figure>

整套分五块，相邻两块之间只有一份接口：

| 部分 | 在哪 | 管什么 |
|---|---|---|
| 实时核心 cored | Go，`internal/session`、`internal/mediaenc` | 每个访客一个会话：WebRTC 连接、对话状态机、打断、音画配速、没人说话时回放待机画面 |
| 大脑 | `internal/llm` + `internal/tts`、`internal/qwenrt`、`internal/pipecatrt` | 把访客的话变成回复文字和 16 kHz 回复语音 |
| 数字人引擎 | Python worker，`workers/avatar/` | 吃回复语音，吐对口型的画面，跑在 GPU 上 |
| 本能层 | `internal/instinct` | 大脑还在想时，挑一个表情或动作片段 |
| 控制平面 | `internal/control` 等，与 cored 同进程 | 控制台、配置、知识库、频道发布、烘焙任务 |

生成脸的模型大多不在这个仓库里 —— FlashHead、MuseTalk、LivePortrait 都由部署脚本从上游拉取。Mynah 写的是包在模型外面的那一层：切语音、接帧、贴回、烘焙、回放。下文讲模型只讲输入、输出和思路，讲 Mynah 自己的代码时给源码。**本文没有运行项目**，演示动图取自上游仓库，版本和出处见[维护记录](../../maintenance/projects/mynah.md)。

## 一张脸怎么动起来 { #face }

### 「让照片说话」落到代码里是四个问题

| 问题 | 领域 | Mynah 用什么 |
|---|---|---|
| 说话时嘴和头怎么跟着声音动 | 音频驱动的说话人脸生成（talking head generation、lip sync） | 三个可换的引擎：wav2lipLS、MuseTalk 1.5、FlashHead |
| 生成的脸怎么放回整张画面不露缝 | 人脸解析与图像融合 | 按引擎的裁切框原位贴回，蒙版羽化过渡 |
| 不说话时为什么不定格 | 肖像动画、动作迁移（portrait animation） | 用 LivePortrait 预先烘好待机循环和动作片段 |
| 用户自己的形象从哪来 | 人脸检测与关键点 | 用 MediaPipe 打分，从说话视频里挑一帧当基底 |

四件事都压在一个约束下：**实时**。回复语音是一段一段流进来的，引擎只能按块生成，块与块之间要接得上，访客一打断就得把算好没播的帧全扔掉。

### 引擎只认一份契约：语音进，帧出

三个引擎对 cored 完全等价，因为它们讲同一个 gRPC 双向流：cored 往里推 16 kHz 单声道语音块，worker 往回推画面帧和对齐的音频，中途可以插一个打断。

```protobuf title="契约 · proto/avatarengine/v1/avatarengine.proto:69-77、115-124"
--8<-- "projects/mynah/assets/mynah-src/proto/avatarengine/v1/avatarengine.proto:69:77"
--8<-- "projects/mynah/assets/mynah-src/proto/avatarengine/v1/avatarengine.proto:115:124"
```

画面在 worker 里就编成 VP8 或 H.264，语音编成 Opus（`workers/avatar/server.py:23-27`），cored 只按节拍转发。`SpeechEnd` 是「这句说完了」的标记，待机一节会用到。

### 三个引擎：补下半张脸、在潜空间里修补、整个头重画

三者差在「模型重画画面的哪一块」，这又决定了要准备什么素材、怎么贴回：

| 引擎 | 形象素材 | 语音特征 | 重画哪里 | 显存 |
|---|---|---|---|---|
| wav2lipLS | 一段说话视频烘成的帧序列 | HuBERT，每帧 [10, 1024] | 脸的下半 | ≈ 2 GB |
| MuseTalk 1.5 | 同上，另存每帧的 VAE 潜变量和融合蒙版 | whisper-tiny 编码器，每帧 [50, 384] | 在潜空间里修补脸部 | ≈ 7.7 GB |
| FlashHead | 一张肖像 | wav2vec | 整个 512 头肩方块 | ≈ 6.6 GB |

**wav2lipLS 走 Wav2Lip 的路数**：把参考脸的下半涂黑，和完整参考脸叠成 6 个通道送进网络，网络听着这一帧前后的语音特征，把下半张脸补出来。

```python title="源码 · workers/avatar/wav2lipls_engine.py:341-344"
--8<-- "projects/mynah/assets/mynah-src/workers/avatar/wav2lipls_engine.py:341:344"
```

语音特征先过一个 LSTM，状态跨帧传、每 12 帧清零（`wav2lipls_engine.py:351-355`）。基底帧是那段说话视频的逐帧，来回往复地取（`_mirror_index`，`:60-63`）—— 所以说话时身体和头在做原视频里的小动作，只有嘴是生成的。补出来的脸贴回原帧时，底边和左右各留 20 像素渐变（`_correction`，`:66`）。

**MuseTalk 1.5 把同样的事搬进潜空间**：烘焙形象时就用 Stable Diffusion 的 VAE 把每帧的脸编成潜变量存好；说话时 UNet 以语音特征做 cross-attention，只走一步去噪（timestep=0），再解码回像素（`musetalk_engine.py:9-11`）。只走一步，所以赶得上实时；每帧独立，没有跨帧状态要传。

**FlashHead 是扩散模型，整个头重画。** 它只要一张肖像：载入时检测人脸，裁一个 512 方块当条件图。说话时它保留一段最近的语音做滑动窗口，每块生成一小段画面；开头几帧与上一块的结尾重叠，用来让动作接续，丢掉只留新帧：

```python title="源码 · workers/avatar/flashhead_engine.py:176-184"
--8<-- "projects/mynah/assets/mynah-src/workers/avatar/flashhead_engine.py:176:184"
```

一块 24 帧、0.96 秒，稳态约 0.43 秒算完；第一块会触发 torch.compile，编译约两分钟，所以 worker 启动时先空跑两块把这笔付掉（`flashhead_engine.py:8`、`:61-74`）。它动的不只是嘴 —— 头的姿态、头发、脖子、肩线都在变，这让它的贴回办法和另外两个不一样。

### 贴回：512 的头肩方块回到半身画布

wav2lipLS 和 MuseTalk 重画的是脸的一块，贴回原视频帧就行。FlashHead 只出一个 512×512 的头肩方块，要做成竖屏 720×1280 的半身主持人，得把方块贴回一张静态的半身画布。`halfbody.py` 分两半（文件头注释 `:1-27`）：

- 离线，每个形象一次：把高清半身照放进 720×1280 画布，头顶留足余量；再逐字复刻 FlashHead 内部的裁切几何，算出引擎会从画布上裁哪个框，并自检与引擎实际裁出的像素一致 —— 框差一点，贴回去的头就错位
- 运行时：按这个框把每帧生成的方块贴回去，用预先算好的蒙版混合，每帧 1–2 毫秒

蒙版选哪种，是踩过坑才定下的：

```python title="源码 · workers/avatar/halfbody.py:174-183"
--8<-- "projects/mynah/assets/mynah-src/workers/avatar/halfbody.py:174:183"
```

只换脸部皮肤（MuseTalk 那种人脸解析蒙版）适合只改嘴的引擎；FlashHead 整个头都在动，只换皮肤会出现「头的轮廓和身体都不动、里面一张脸在说话」的面具感。所以 FlashHead 保留整个方块，只在框边向内羽化，渐变到静态画布。

<figure>
  <video src="/projects/mynah/assets/media/mynah-luna-demo.mp4" autoplay loop muted playsinline width="720"></video>
  <figcaption>上游演示：内置的 Luna 预设，FlashHead 生成头部，贴回 720×1280 半身画布</figcaption>
</figure>

### 不说话时：烘好的待机循环，由 cored 自己回放

数字人在听的时候不能定格，可也不值得为呼吸和眨眼一直占着 GPU。Mynah 的规矩是**没人说话时回放，不生成**，素材分四步做出来：

1. 抽动作骨架：用 LivePortrait 从一段真人视频里抽出头部转动、嘴型、眨眼的关键点轨迹，存成 `.pkl`，只有轨迹、不含长相（`workers/avatartrain/extract_template.py` 文件头）。原始轨迹带检测抖动，先沿时间做高斯平滑，再从 30 fps 重采样到 25 fps（`smooth_motion.py` 文件头）
2. 烘待机片段：把轨迹迁移到形象的肖像上，渲染出几段待机片段。每段都从同一个中性姿态起步，这一帧叫锚点；片段放长到 10–26 秒，因为每隔几秒回一次原位显得机械（`workers/avatar/prep_idle_segments.py` 文件头）
3. 离线编码：用最好的参数编成 VP8 或 H.264 码流文件，锚点帧都是关键帧（`bake_idle.py` 文件头）
4. 回放：cored 读进这个文件，没人说话时直接把码流发给浏览器，worker 一帧都不出。片段之间随机跳，锚点像素完全一样，跳过去看不出来

```go title="源码 · internal/mediaenc/idle.go:11-24"
--8<-- "projects/mynah/assets/mynah-src/internal/mediaenc/idle.go:11:24"
```

两头的切换靠契约里的两个信号：开口时 worker 先发一个强制关键帧，因为浏览器的解码器正停在待机码流中间；说完时 worker 发 `SpeechEnd`，cored 从锚点重新进入待机 —— 锚点是中性姿态，接近说完话时的样子，缝最小。还有一处细节：LivePortrait 渲染出来整体偏暗 5–6 个灰阶，烘焙时要拟合一个颜色校正，不然一开口整张脸突然变亮（`halfbody.py:234-242`）。

挥手、摇头、大笑、害羞、眨眼这些动作片段用同一套办法烘，与待机循环在同一个帧域里，按形象登记（`internal/session/idle.go:26-33`）。没烘待机的形象退回让 worker 用静音驱动引擎实时生成待机画面 —— 人是对的，但占 GPU（`idle.go:1-15`）。

### 形象从哪来：从一段视频里挑一帧

「上传一段视频训练自己的形象」实际不微调任何权重，是**选帧**：把 10–20 秒的说话视频抽帧，给每帧打分，挑出最适合当说话基底的那张。之后生成的每一帧都以它为条件：

```text title="源码 · workers/avatartrain/extract_portrait.py:10-19"
--8<-- "projects/mynah/assets/mynah-src/workers/avatartrain/extract_portrait.py:10:19"
```

闭嘴、正脸、清晰、脸大，上游说这是生产里总结出的说话基底规则。人脸检测特意用 MediaPipe 而不用 InsightFace —— 后者的许可证不允许商用。

### 边说边生成：切块、流水线、打断

- **切块**：回复语音按块送进引擎，FlashHead 一块 0.96 秒，wav2lipLS 一块 16 帧、0.64 秒
- **流水线**：wav2lipLS 把一块拆成三段，各跑一个线程 —— HuBERT 特征 28 ms、GPU 前向 311 ms、CPU 贴回 291 ms；后两段重叠，瓶颈从两者相加变成取大的那个（`wav2lipls_engine.py:191-196`）
- **打断**：每个会话有一个代数计数，打断时加一并清空所有队列；还在路上的旧代帧到了也直接丢（`flashhead_engine.py:126-136`）

## 支线 { #side }

### 实时语音闭环：说完没有，算不算打断

麦克风的声音经 WebRTC 进 cored，转给 ASR worker（SenseVoice）出转写。难点不在转写，在轮次：

- **说完没有**：仓库自带一个 Smart Turn v3.2 模型（whisper-tiny 编码器加一个线性头，ONNX 跑在 CPU 上），听刚结束那句话的波形，判断是不是真说完了；判为没说完就先等 700 毫秒，没有新话再照已有的回答
- **算不算打断**：默认不按声音打断，按转写内容 —— 「嗯」「对对对」这类附和词永远不打断、也不触发回答，不到 4 个字不打断；「停一下」「别说」「闭嘴」这类打断词绕过这些门槛（`turn.go:300`）

```go title="源码 · internal/session/turn.go:34-41、65-73"
--8<-- "projects/mynah/assets/mynah-src/internal/session/turn.go:34:41"
--8<-- "projects/mynah/assets/mynah-src/internal/session/turn.go:65:73"
```

附和词表里有「Yeah」「응」「うん」，是 SenseVoice 自动判语种时把中文「嗯」听错的样子。

### 三种大脑，一套事件

回复从哪来可以换：本地 LLM 流式输出、按句切开送 TTS；Qwen 实时模型语音进、语音出；或者接一条 Pipecat 管线。三者对会话暴露同一组事件 —— 用户文本、回复增量（字幕）、回复语音、打断 —— 所以引擎不关心是谁在说（`docs/zh/guide/architecture.md` 的「一次语音轮次的完整数据流」）。

### 本能层：大脑还在想，身体先动

说话的模型不管动作。另一个快速决策模型盯着实时转写，大约每 450 毫秒问一道封闭题：「这些动作片段里哪个此刻最合适，还是都不做？」默认用 Jev（本站也接了，见[结构化判断](../../skills/agent-io/reference/jev.md)），没 key、超时或连败三次就退回关键词规则。置信度过 0.6 才播，文本还在流进来时要过 0.8，两次动作至少隔 4 秒。这套「说话归大脑、动作归本能层」的分工来自 open-annie[^annie]。

视频数字人多一个约束：说话帧是引擎实时生成的，烘好的动作片段没法和它叠在一起，所以说话中选中的动作先存着，这句说完再播：

```go title="源码 · internal/instinct/engine.go:36-41"
--8<-- "projects/mynah/assets/mynah-src/internal/instinct/engine.go:36:41"
```

### 声音克隆

TTS 默认是 EdgeTTS，不占 GPU、要联网。换成本地 Qwen3-TTS（经 vLLM-omni）后，上传一小段参考音频就能克隆音色；每个音色固定一个随机种子，句与句之间音色不漂（`docs/zh/guide/avatars.md` 的「声音」一节）。

### 给 Agent 一张脸

两条路让别的程序驱动这张脸：

- **宿主页借工具给模型**：嵌着数字人的网页经 DataChannel 告诉 cored「我能做什么」，比如打开某页、筛选某张图；cored 把这些能力当工具报给模型，模型调用时原样转回网页执行，cored 不解释参数。动作类立刻回模型一个 ok，嘴上说的和页面切换同时发生；查询类要等结果，cored 先说一句「我查一下。」垫着 —— 回合中间两秒无声，看着像画面卡死，不像在想
- **DeepSeek Harness 插件**：`dsh-plugin-mynah` 给 Agent 一组工具，让数字人说话、做动作、打断、看谁在线、往知识库塞资料（`docs/zh/guide/agents.md`）。插件机制见本站 [DeepSeek Harness 的插件](../deepseek-harness/plugin.md)

```go title="源码 · internal/session/abilities.go:15-22"
--8<-- "projects/mynah/assets/mynah-src/internal/session/abilities.go:15:22"
```

## 工程上的几个大问题 { #engineering }

- **Go 管实时、Python 管推理，中间只隔一份 proto**：cored 不 import 任何模型，worker 不知道对面是哪个大脑；加一个口型引擎，只要写一个讲同一份契约的 worker
- **音画同步靠同一个起点**：视频、音频两个配速循环都等到各自的第一个真实样本，在同一个 t0 放行，之后按绝对截止时间发包，浏览器才能把嘴和声对上（`internal/mediaenc/gate.go:9-14`）。worker 按 40 毫秒一格出帧，只预跑约 120 毫秒 —— 早先整块突发会在 cored 里堆出 0.8 秒的队列（`workers/avatar/server.py:18-21`）；Opus 编码从 ffmpeg 换成 PyAV，因为 ffmpeg 出第一个包前要缓冲约 2 秒（`server.py:23-27`）
- **延迟大头在引擎**：上游在一张 4090 上测，云端大脑从用户说完到第一个回复音频 1–170 ms，引擎出第一个对口型画面 MuseTalk 0.40–0.72 s、FlashHead 半身 0.86–1.15 s
- **一个 worker 只服务一个会话**：FlashHead 跨块有状态，一张 4090 约等于一位同时在线的访客；N 个并发就要 N 个 worker，路由目前得自己写。频道的并发配额按引擎记账，所有频道配额之和必须放得进 worker 数
- **显存按稳态算**：MuseTalk 刚起时 4.6 GB，跑满一天、经历并发峰值后稳定在 7.7 GB；按冷启动读数定容会超配（`docs/design/avatar-engine-pool.md`）
- **默认组件要能商用**：原版 Wav2Lip 的权重用 BBC 授权的 LRS2 训练，不能商用，整个移除，换成自训练权重的 wav2lipLS；LivePortrait 默认的人脸裁切走 InsightFace，同样绕开（`LICENSING.md`）

## 谁管什么，局限在哪 { #limits }

| 谁 | 管什么 |
|---|---|
| Mynah 的程序 | 会话与轮次、切块与打断、贴回、烘焙流水线、待机回放、音画配速、并发配额 |
| 上游模型 | 由语音生成脸（FlashHead、MuseTalk、wav2lipLS 网络），动作迁移（LivePortrait），识别、断句、TTS、LLM |
| 部署的人 | GPU、模型权重、TTS 与 LLM 端点、形象素材和本人授权 |
| 访客 | 说话、打断、点动作按钮 |

- **离不开 GPU**：默认的 FlashHead 要 4090 级，最轻的 wav2lipLS 也要 6 GB 的卡；本机没有 GPU，只能把 worker 放到远端
- **一卡一会话**：多 worker 调度还在路线图上
- **身体基本不动**：FlashHead 只生成头，半身是静态画布加烘好的片段；说话时身体不会跟着话做手势，动作只能在说完后播
- **「训练形象」是选帧**：不微调，长相的上限由那一帧和引擎决定
- **项目很新**：只有 v0.1.0 一个版本、三次提交
- **合规**：克隆真人的长相和声音受深度合成法规约束，上游的上传接口都要勾选本人授权

[^annie]: [rehan-remade/open-annie](https://github.com/rehan-remade/open-annie)，Mynah 的 `docs/zh/guide/instinct.md` 注明分工取自它，2026-11-02 读。
