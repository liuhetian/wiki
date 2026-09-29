# bili-note 来源与吸收说明

本目录归档 [Rimagination/bili-note](https://github.com/Rimagination/bili-note)：把 B站视频和图文动态整理成 Markdown 学习笔记。视频先拿字幕，拿不到再下音频做语音识别，按需再抽关键帧。主文件 `SKILL.md` 改名为 [index.md](index.md)，`references/` 和 `scripts/` 按上游相对路径放在同级，一律钉 commit 原文照录。唯一的例外是 `references/bilibili-api-notes.md`：上游是英文，2026-09-29 按要求译成了简体中文，接口地址、字段名、参数、置换表和命令一律不动；英文原文看下面钉 commit 的永链。`index.md` 和脚本一个字没改。

!!! warning "AI 不要去读上游仓库"

    这个 skill 的内容已经全部迁进本 wiki，本目录就是完整可执行的版本。**AI 执行或引用这个 skill 时，禁止去抓取上游仓库**：不需要，也不要拿上游内容覆盖这里。下文的仓库链接只用来标注出处，由人来维护。

## 上游版本跟踪

| 项 | 值 |
|---|---|
| 上游仓库 | <https://github.com/Rimagination/bili-note>（Bili Note contributors） |
| 已吸收 commit | [`08fe812`](https://github.com/Rimagination/bili-note/tree/08fe81297ef876a668a7e187409fa2c3366b9faa)（2026-09-22） |
| 抓取日期 | 2026-09-29 |
| 许可证 | MIT，原文见同目录 [`LICENSE`](LICENSE) |

上游还在活跃开发，这里是上面那个 commit 的快照。

## 本地归档

- [index.md](index.md)（= 上游 `SKILL.md`）
- [references/bilibili-api-notes.md](references/bilibili-api-notes.md) —— B站元数据、字幕、音频、评论接口和已知坑（中译）
- `scripts/` 下 12 个 Python 脚本，全部照录：
    - [check_environment.py](scripts/check_environment.py)
    - [setup_qwen_asr_env.py](scripts/setup_qwen_asr_env.py)
    - [run_qwen_asr.py](scripts/run_qwen_asr.py)
    - [run_bili_note.py](scripts/run_bili_note.py)
    - [extract_bilibili.py](scripts/extract_bilibili.py)
    - [extract_bilibili_opus.py](scripts/extract_bilibili_opus.py)
    - [fetch_browser_ai_subtitles.py](scripts/fetch_browser_ai_subtitles.py)
    - [edge_cdp.py](scripts/edge_cdp.py)
    - [extract_video_keyframes.py](scripts/extract_video_keyframes.py)
    - [archive_bili_materials.py](scripts/archive_bili_materials.py)
    - [score_bili_note.py](scripts/score_bili_note.py)
    - [update_note_budget_section.py](scripts/update_note_budget_section.py)

## 脚本归类

按 [skill 怎么收纳](../wiki-guide/remote-skill.md) 的三类，12 个脚本**全部属于第 3 类「下载后本地执行」**：输入是任意的 B站链接，要联网调接口，还要调 ffmpeg、yt-dlp、语音识别模型，没法预算，也不是查表。

脚本之间互相 import（如 `extract_video_keyframes.py` 引用 `extract_bilibili.py`），所以要把整个 `scripts/` 目录一起下载到本地才能跑。本站**没有打 bundle 包**：这个 skill 同时用来实测，看客户端 AI 会不会自己按相对链接把文件拉下来。

上游 `index.md` 里的路径按 Windows 本地安装写（`$env:USERPROFILE\.codex\skills\bili-note`），执行时要换成实际下载到的目录。这是在执行第三方代码，执行前应让用户知情。

## 外部依赖

- `web-access`：`index.md` 要求联网和登录态操作先用这个 skill，上游仓库里没有，本站也没有收。缺了它只影响网页 AI 字幕这条路线
- 可选的本机工具：ffmpeg、yt-dlp、Qwen3-ASR / Whisper，由 `check_environment.py` 检查

## 跳过的

- `README.md`、`assets/bili-note-logo.png`：展示用，不是行为定义
- `agents/openai.yaml`：给 OpenAI 那一侧 agent 运行时用的清单，不是行为定义
- `tests/`：上游的单元测试，运行 skill 用不到
- `.gitignore`

## 未来漂移处置

只由人来做，AI 不要执行（见页首警示）。

1. `git clone --depth 1` 拿新 commit，对比 `SKILL.md`、`references/`、`scripts/`
2. 有变化就覆盖 `index.md`、`references/`、`scripts/`，更新本页 commit、日期和永链；上游新增或删除脚本时同步「本地归档」一栏
