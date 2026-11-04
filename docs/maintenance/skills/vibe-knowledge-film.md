---
description: "Vibe 知识短片的维护记录：吸纳自 HeyChengC/vibe-knowledge-film（MIT），钉在 62d5150；上游本来是中文，SKILL.md、7 篇 reference、引擎、脚本和 5 段示例收齐，文档路径改成链接；粗讲页和它共用这篇，两段样片 GIF 转 mp4，未实跑"
---

# Vibe 知识短片（vibe-knowledge-film）

[Vibe 知识短片](../../skills/vibe-knowledge-film/index.md)和它的粗讲页 [Vibe 知识短片：让 AI 做「讲解」，不做「配图」](../../projects/vibe-knowledge-film/index.md)的维护记录。两面出自同一个上游，记录写在这一篇。

- **上游**：HeyChengC/vibe-knowledge-film[^repo]，GitHub 账号 HeyChengC，commit 署名 Player_D；MIT 管引擎、脚本和文档里的方法说明，许可证原文不随附。上游 README 写明的例外：
    - `examples/stim_B`、`examples/info_C` 两段复刻，以及 `references/analysis.md`、`references/prompts.md` 里按成片填好的 brief，字幕、片名和画面设计来自他人的短片，版权属于原作者，只作学习对照
    - 四条参考片出自抖音 #vibe知识大赏：《运气的形状》《超常刺激》片内有作者水印，《信息论 · 惊奇之学》《自指 · 我是个怪圈》片内无署名，作者名上游都没写
    - 两段自己题目的样片各自写了事实出处：《折叠》在 `examples/fold_C/film.js` 开头（V. M. Ingram 1957、L. Pauling 等 1949），《鸽子的迷信》在 `examples/pigeon_B/storyboard.md`（B. F. Skinner 1948）
    - 字体不在仓库里，`engine/get_fonts.py` 从 google/fonts 下载 8 款 SIL OFL 1.1 字体
- **commit**：钉在 `62d5150`（2026-10-13），2026-11-03 读时是最新；全部 9 个 commit 都在 10-06 到 10-13 之间，算不上「脚本重、更新快」，所以照收纳步骤收齐，没有只收入口
- **收成了什么**：
    - `skills/vibe-knowledge-film/`：标准 skill。`SKILL.md` 改名 `index.md`；`references/` 7 篇；`engine/` 的 `vk.js`、`vk-kit.js`、`render.py`、`audio.py`、`get_fonts.py`、`index.html`；`scripts/new_film.py`；`examples/` 的 `fold_C`、`pigeon_B`、`stim_B`、`info_C`、`kit_gallery` 五个工程，5 张 `look_*.jpg` 和 `fold_old_vs_new.jpg`。目录结构和上游一样，命令里的相对路径不用改
    - `projects/vibe-knowledge-film/`：粗讲一页，关注点是讲解设计；代码和分镜表都用 `--8<--` 引 skill 目录里的文件，项目目录只放两段样片
- **跳过**：
    - `README.md`：两段样片 GIF、安装、联系方式、友情链接。依赖那几行并进了入口
    - `LICENSE`、`requirements.txt`、`.gitignore`，`engine/fonts/` 下 6 份 OFL 许可证文本
    - `examples/fold_C.gif`（17MB）、`examples/pigeon_B.gif`（30MB）不进 skill：只有 README 用它们，`SKILL.md` 和 reference 都没提。转成 mp4 放进粗讲页，见[下文](#explain)
- **翻译之外的改动**（上游本来就是中文，正文没译）：
    - 入口：`name` 照旧，`description` 改写成什么时候用、做什么；frontmatter 加 `copy_source: true`（`references/prompts.md` 链回入口）；开头一段补一句全片怎么画出来，第二段末尾加整包声明和为什么要整包；「流程」开头补一句依赖 —— Python 包和本机 Chrome、ffmpeg，上游写在 README；页尾加维护记录链接
    - 正文用行内 code 写的文档路径改成相对链接，链接文字保留上游写法：入口里的 `references/*.md`、`visualization.md`、`engine.md`、`examples/fold_old_vs_new.jpg`，文件表的 `examples/`；`references/` 之间互指的 `analysis.md`、`visual-grammar.md`、`visualization.md`、`worlds.md`，`engine.md` 里的 `examples/`、`visualization.md` 里的对照图；`prompts.md` 的 `SKILL.md` 改成链到入口页。指向目录、`.js`、`.py` 的路径仍是行内 code
    - `examples/README.md` 改名 `examples/index.md`，`fold_C` 的分镜表、对照图和 `references/visualization.md` 改成链接；`pigeon_B` 那段加一句「分镜表在 storyboard.md」并链过去 —— 上游没提这个文件，不加 check-links 挂不上它
    - 引擎、脚本、`film.js`、分镜表一字没改

## 粗讲页 { #explain }

- **行号**：`--8<--` 引的 `film.js`、`vk.js`、`storyboard.md` 和上游逐字一致；`references/visualization.md` 只改了第 23 行里的一个路径，行号不变。页面上写的行号就是上游 `62d5150` 的行号
- **样片**：两张 GIF 都是 800×450、10fps、33 秒，转码只换封装、不改画面，17MB 变 1.9MB、30MB 变 2.3MB：

    ```bash
    ffmpeg -i fold_C.gif -movflags +faststart -pix_fmt yuv420p \
      -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 20 -preset slow -an fold_C.mp4
    ```

- **没有实跑**：讲解设计靠分镜表、代码、作者渲的拼图和样片就讲得清；`render.py` 写死了用本机 Google Chrome（`channel="chrome"`），本机只装了 Playwright 自带的 Chromium

[^repo]: [HeyChengC/vibe-knowledge-film @ 62d5150](https://github.com/HeyChengC/vibe-knowledge-film/tree/62d51508aad00003dc6209afa80c4b5dc540de59)，2026-11-03 读。
