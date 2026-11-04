---
description: "Mynah 粗讲的维护记录：读的是 9f91446（2026-11-02 读），Apache-2.0 许可；上游引擎和模型各从哪来；源码存档和行号怎么对；两段演示动图从 GIF 转成 mp4；只读源码，没有实跑"
---

# Mynah 粗讲的维护记录

这是 [Mynah](../../projects/mynah/index.md) 背后的来源记录。正文按用户给的顺序写成一篇粗讲：先讲数字人的脸怎么动、涉及哪些领域，再讲几条支线，工程问题放最后、写得最短。

## 上游 { #upstream }

- 仓库 honwee/mynah[^repo]，Apache-2.0。仓库自己的代码只有实时核心、控制平面和 worker 外壳；模型权重都不在仓库里，由部署脚本从上游下载，`LICENSING.md` 列了每个组件的许可证
- 体量：416 个文件；Go 142 个文件约 2.6 万行，另有 gRPC 生成代码约 3.9 千行；Python 33 个文件约 7.4 千行；自写 JS 约 3.5 千行，另带一份 React 18 开发版约 3.3 万行；中英文档共 50 篇
- 正文提到的上游模型和出处：

| 组件 | 在 Mynah 里做什么 | 出处与许可（按 Mynah 的 `LICENSING.md`） |
|---|---|---|
| FlashHead | 默认引擎，一张肖像生成头肩画面 | Soul-AILab/SoulX-FlashHead[^flashhead]，Apache-2.0，建在 Wan 2.1 上；lite 版用的 LTX-Video VAE 另有条款 |
| MuseTalk 1.5 | 引擎，潜空间修补 | README 标 MIT，部署时从上游取 |
| wav2lipLS | 最轻的引擎 | 网络代码在仓库 `workers/avatar/wav2lipls/`，权重自训练，256 版发在 v0.1.0 的 Release |
| HuBERT `hubert-large-ls960-ft` | wav2lipLS 的语音特征 | facebook，Apache-2.0 |
| LivePortrait | 烘焙待机和动作片段 | MIT；默认人脸裁切用的 InsightFace 不可商用，Mynah 绕开 |
| Smart Turn v3.2 | 判断用户说完没有 | Pipecat，BSD-2，32 MB ONNX 随仓库发布 |
| SenseVoice、Qwen3-TTS、EdgeTTS | 识别、合成语音 | 按各自上游 |
| MediaPipe | 选基底帧时的人脸检测 | Apache-2.0 |
| open-annie | 本能层的分工思路 | 正文脚注 |
| Jev | 本能层的默认决策模型 | TypeSafe；本站也接了，见[结构化判断](../../skills/agent-io/reference/jev.md) |

## commit { #commit }

钉在 `9f91446343f893218e1380292815437437a22380`（2026-10-24），2026-11-02 读。仓库只有三次提交：v0.1.0 的 tag 打在 2026-10-12，首次开源提交在 10-15，10-24 又提交了两次。项目刚发布，只有这一个版本。

## 源码存档和行号 { #archive }

`docs/projects/mynah/assets/mynah-src/` 下按上游路径逐字拷了 9 个文件，只拷正文 `--8<--` 引到的，行号与上面的 commit 一致：

- `proto/avatarengine/v1/avatarengine.proto`
- `workers/avatar/flashhead_engine.py`、`wav2lipls_engine.py`、`halfbody.py`
- `workers/avatartrain/extract_portrait.py`
- `internal/mediaenc/idle.go`
- `internal/session/turn.go`、`abilities.go`
- `internal/instinct/engine.go`

正文只在括号里写路径和行号、没有存档的文件（`musetalk_engine.py`、`server.py`、`internal/session/idle.go`、`gate.go`、`prep_idle_segments.py` 等），同样指这个 commit。写「文件头」的指文件开头的说明注释。

演示动图取自上游 `assets/demo/`，原作是 GIF。写作规范要求动图放 mp4，所以用 ffmpeg 转码，画面和时长不改：

```bash
ffmpeg -i mynah-demo.gif -movflags +faststart -pix_fmt yuv420p \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 23 -an mynah-demo.mp4
```

`mynah-luna-demo.gif` 也照这条命令转。体积从约 3 MB 降到约 320 KB。`mynah-flashhead-demo.gif`（Nova 预设）和 Luna 那段重复，没收。

## 跳过了什么 { #omitted }

- 背面不收：Mynah 是一个要整套部署的应用，不是 skill；用户默认不部署
- 支线不讲：知识库与 RAG、频道发布与访问控制、控制台、Dify 和 Coze 适配、配置中心
- 部署相关不收：setup 向导、Docker Compose、AutoDL 和 UCloud 云镜像、商业支持、合规条款原文
- 插件仓库 honwee/dsh-plugin-mynah 没读，只按 Mynah 仓库里的 `docs/zh/guide/agents.md` 讲到它能做什么
- 上游模型仓库没读，FlashHead、MuseTalk、LivePortrait 只按 Mynah 的封装代码和注释讲输入、输出和思路
- 架构图 `assets/diagrams/*.png` 没收
- **没有实跑**：用户选了不实跑，省时间。分诊时本机有一张空闲的 RTX 4090；以后要补实跑，FlashHead 只要一张肖像（仓库带了 `workers/avatar/assets/luna.cond.png` 等），wav2lipLS 要先从视频烘出 avatar 目录（`full_imgs/`、`face_imgs/`、`coords.pkl`）

## 翻译之外的改动 { #changes }

没有改上游文件。正文是对源码、注释和中文文档的概括；性能、显存数字照抄上游 README 和设计文档，本站没有复测。

[^repo]: [honwee/mynah](https://github.com/honwee/mynah)，2026-11-02 读。
[^flashhead]: [Soul-AILab/SoulX-FlashHead](https://github.com/Soul-AILab/SoulX-FlashHead)，地址取自 Mynah 的 `deploy/compose/setup-flashhead.sh`。
