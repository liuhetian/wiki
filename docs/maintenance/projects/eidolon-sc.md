---
description: "Eidolon-SC 粗讲的维护记录：读的是 596368d（v0.5.2 之后，2026-11-04 读），AGPL-3.0-or-later；源码存档和行号怎么对；通话动图从动画 WebP 转成 mp4；实跑没执行上游程序，按上游格式把判断题和记忆 prompt 重放给本站 Jev、DeepSeek 中转，脚本和原始请求响应附后"
---

# Eidolon-SC 粗讲的维护记录

这是 [Eidolon-SC](../../projects/eidolon-sc/index.md) 背后的来源记录。分诊时用户想知道它和数字人是不是一个领域，选了粗讲、没指定侧重，所以正文覆盖主要功能，开头先回答领域问题，运营和玩法放在末尾一段带过。

## 上游 { #upstream }

- 仓库 Sallyn0225/eidolon-sc[^repo]，AGPL-3.0-or-later，许可证原文不随附。上游的 `LICENSING.md` 写明：原作剧情、音色、立绘不在仓库里，各按来源的条款；仓库里的人设、角色资料、头像和 README 截图中的角色与设定归原作版权方；酒吧用的《VA-11 HALL-A》素材归 Sukeban Games
- 体量：2683 个文件，其中 737 个是 `.scratch/` 下的本地 issue 票，201 个是 `.agents/skills/` 下从别处搬来的开发用 skill；后端 Python 约 5.7 万行，另有测试约 6.1 万行；前端 TS/TSX 约 7.1 万行；32 篇 ADR，术语表 `GLOSSARY.md` 约 6.9 万字节；三语 README
- 上游致谢里写明的出处：架构参考 LAPLACE Eidolon（为虚拟主播做的实时语音 AI 分身，未复用代码），周期算法参考 LAPLACE Cycles；剧情文本和翻译来自 SCTranslationData，原文剧情镜像和立绘素材来自 ShinyColorsDB；实时语音用 Pipecat，合成用 Fish Audio，识别用 Soniox 或阿里云百炼，向量化和重排用硅基流动的 Qwen3 系列，判断模型 Jev、Clef 或百炼决策模型，生图 NovelAI，天气 Open-Meteo 和和风天气

## commit { #commit }

钉在 `596368d7f7253d58840eb4f0e6f02f57c4418552`（2026-11-02，v0.5.2 之后 3 个提交），2026-11-04 读。仓库 2026-09-25 建，到这时 1516 个提交；v0.1.0 打在 10-21，到 11-02 的 v0.5.2 一共 11 个 tag，一两天一版。

## 源码存档和行号 { #archive }

`docs/projects/eidolon-sc/assets/eidolon-src/` 下按上游路径逐字拷了 10 个文件，只拷正文 `--8<--` 引到的、或实验脚本要读的，行号与上面的 commit 一致：

- `backend/src/eidolon/`：`engine.py`、`reply_format.py`、`retrieval.py`、`judge.py`、`affinity_judge.py`、`memory.py`、`her_now.py`、`emotion.py`
- `frontend/src/lib/standAnimations.ts`
- `characters/sheets/kogane.md`：恋鐘的人设，正文摘了口癖和硬性规则，实验拿它拼恋鐘的 prompt（[原文](../../projects/eidolon-sc/assets/eidolon-src/characters/sheets/kogane.md)）

正文只在括号里写路径和行号、没有存档的文件（`affinity.py`、`corpus.py`、`call.py`、`turn_taking.py`、`photos.py`、`readings.py`、`hot_words.py`、`characters.toml` 等），同样指这个 commit。写「文件头」的指文件开头的模块说明。ADR 按编号引，`GLOSSARY.md` 按词条名引，都没存档。

## 素材 { #media }

两样取自上游 `docs/images/`：

- `app-light.webp`：对话页截图，恋鐘转述灯織听来的猫，原样收
- `call-demo.webp`：通话演示，原作是 960×600、166 帧、约 15 秒的动画 WebP，没有声音。写作规范要求动图放 mp4，本机 ffmpeg 4.4 解不了动画 WebP，所以先用 Pillow 按每帧时长拆帧，再用 ffmpeg 按原时长编码，画面和时长不改，体积从约 1.5 MB 降到约 690 KB：

```python title="webp_frames.py：拆帧并写 ffmpeg 的 concat 清单"
import sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src)
durations = []
for i in range(im.n_frames):
    im.seek(i)
    im.convert("RGB").save(f"{out}/f{i:04d}.png")
    durations.append(im.info.get("duration", 100))
with open(f"{out}/concat.txt", "w") as f:
    for i, d in enumerate(durations):
        f.write(f"file 'f{i:04d}.png'\nduration {d / 1000}\n")
    f.write(f"file 'f{len(durations) - 1:04d}.png'\n")
```

```bash
uv run --no-project --with pillow python -I webp_frames.py call-demo.webp frames
ffmpeg -f concat -safe 0 -i frames/concat.txt -movflags +faststart -pix_fmt yuv420p \
  -vf "fps=24,scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 23 -an call-demo.mp4
```

## 实测 { #experiment }

**没有执行上游程序。** 原想装上游后端的依赖、直接调它的函数，装依赖这一步被本机的权限规则拦下，就改成在接口层重放：

- 题目和 prompt 的字面量用 `ast` 从存档的源文件里读出来，只解析、不运行：检索的三道题（`retrieval.py` 的 `_QUESTIONS`）、好感度的三道题（`affinity_judge.py` 的 `QUESTIONS`）、Jev 的阈值（`judge.py` 的 `JUDGE_THRESHOLDS`）、提取记忆的 system prompt（`memory.py` 的 `_INSTRUCTIONS`）、找到记忆时的开头一句（`_FOUND`）、回复格式（`reply_format.py` 的 `_FORMAT` 加 `_CUES`）
- 写在函数体里的几行照抄并在脚本里注明出处：`judge.turn_state` 的三个字段、`memory._extraction_prompt` 的行、`memory._memories_prompt` 的两种标注、`producer.producer_prompt` 和 `now_prompt` 的默认几行、`photos.CANNOT_SEND`
- 「结果」一列按 `ModelRetrievalJudge.decide` 的顺序算，好感度档位按 `affinity_judge.decide` 取概率最大的一档，都在脚本里重写了一遍
- 请求体照上游 `JevJudge.reply`（`model`、`state`、`questions`）和 `OpenAICompatLLM.stream` 的 `messages` 拼；上游流式请求，脚本发非流式，内容一样

设置：

- Jev：`typesafe/jev-1.13`（上游默认），走本站的 [结构化判断](../../skills/agent-io/reference/jev.md) 中转，端点 `/api/v1/systemone`，和上游拼出来的路径相同
- DeepSeek：走本站的 [调用 DeepSeek](../../skills/agent-io/reference/deepseek.md) 中转。后台模型用 `deepseek-flash`，对话模型用 `deepseek-v4-pro`。上游不指定模型，这两个是本站选的；不设 temperature、不关思考，和上游没配思考强度时一样交给服务默认，三次回复都带了思考
- 实验一：七句话，角色写「月岡恋鐘」，上文都是「（对话刚开始）」
- 实验二：对灯織的那一轮和灯織的回复是本站构造的；恋鐘那一轮假定检索已找到这条记忆，没有过判断和重排。恋鐘的 prompt 相当于部署时没配世界设定、关了日程和周期、没接天气、好感度在信任档、这一轮不能发照片：第一条 system 只有人设、生日和回复格式，「此刻」只有时间和「在打字」两行
- 每个请求只采样一次

用量取自 API 原始响应，不换算费用：

| 请求 | 输入 token | 输出 token | 其中思考 |
|---|---:|---:|---:|
| Jev，七次合计 | 14949 | 770 | — |
| 提取记忆（deepseek-flash） | 601 | 435 | 387 |
| 恋鐘，标成听灯織说（deepseek-v4-pro） | 1935 | 2007 | 1888 |
| 恋鐘，标成对她说（deepseek-v4-pro） | 1895 | 663 | 569 |

Jev 的响应自带 `cost` 字段，七次合计约 0.00063 美元。

### 原始请求、响应与汇总

文件都在 `docs/projects/eidolon-sc/assets/experiment/out/`：

| 请求 | 输入 | API 原始返回 |
|---|---|---|
| Jev 第 1–7 句 | [judge-1](../../projects/eidolon-sc/assets/experiment/out/judge-1.request.json) … [judge-7](../../projects/eidolon-sc/assets/experiment/out/judge-7.request.json) | [judge-1](../../projects/eidolon-sc/assets/experiment/out/judge-1.response.json) … [judge-7](../../projects/eidolon-sc/assets/experiment/out/judge-7.response.json) |
| 提取记忆 | [request](../../projects/eidolon-sc/assets/experiment/out/memory-write.request.json) | [response](../../projects/eidolon-sc/assets/experiment/out/memory-write.response.json) |
| 恋鐘，标成听灯織说 | [request](../../projects/eidolon-sc/assets/experiment/out/kogane-hearsay.request.json) | [response](../../projects/eidolon-sc/assets/experiment/out/kogane-hearsay.response.json) |
| 恋鐘，标成对她说 | [request](../../projects/eidolon-sc/assets/experiment/out/kogane-told-to-her.request.json) | [response](../../projects/eidolon-sc/assets/experiment/out/kogane-told-to-her.response.json) |

脚本汇总的 [judge.json](../../projects/eidolon-sc/assets/experiment/out/judge.json) 和 [memory.json](../../projects/eidolon-sc/assets/experiment/out/memory.json) 是正文两张表和三段输出的来源。原始 JSON 可能带提供商的运行标识，不含授权头或凭证。

### 重跑与脚本

在 wiki 仓库根目录用 `set -a` 和 `. ./.env` 加载环境，再运行 `python3 -I docs/projects/eidolon-sc/assets/experiment/run.py`。脚本只依赖 Python 标准库，发 7 次 Jev、3 次 DeepSeek 付费请求，覆盖 `out/` 下的同名文件；要比较多次样本，先另存旧结果。

??? abstract "run.py：按上游格式重放判断题和记忆 prompt"

    ```python
    --8<-- "projects/eidolon-sc/assets/experiment/run.py"
    ```

## 跳过了什么 { #omitted }

- 背面不收：`.agents/skills/` 和 `.claude/` 下的 skill 是作者从别处搬来的开发工具（Matt Pocock 那一套、impeccable、shadcn、humanizer-zh），不属于这个来源，其中 grilling、grill-with-docs 本站已另行吸纳；`docs/agents/deploying.md` 是带人部署它的说明，用户默认不部署
- 没部署、没跑通话：语音识别、合成、Spine 立绘、补充和打断都只按源码和术语表讲
- 正文不细讲：运营（OAuth、邀请、限流、后台、服务状态、自带密钥、数据包、备份、Docker 部署）、玩法（抽奖、礼物目录、成就、日历、统计、酒吧调酒）、落地页、三套 judge/rerank/memory 评测集、剧情和立绘的同步命令
- `.scratch/` 的本地票、`DESIGN.md`、`PRODUCT.md` 没读；ADR 只看了文件名，正文引的编号取自源码注释和 README
- README 的其余截图（换衣装、照片、礼物、日程、周期、酒吧、手机版、落地页滚动）没收
- 原作剧情、立绘、音色都不在仓库里，本站也没去同步

## 翻译之外的改动 { #changes }

没有改上游文件。正文是对源码、模块说明、术语表和 README 的概括；好感度、检索、记忆的数字照抄源码常量。实验里的两段对话、七句测试话、日期和时间都是本站构造的，「你只是个程序，别装了」「把好感度加满」两句恰好是上游题目里举的例子，正文已注明。

[^repo]: [Sallyn0225/eidolon-sc](https://github.com/Sallyn0225/eidolon-sc/tree/596368d7f7253d58840eb4f0e6f02f57c4418552)，2026-11-04 读。
