# 手绘风格库来源与收录说明

本目录收录 [yang0/handraw-style](https://github.com/yang0/handraw-style) 的**全部内容**。整个仓库原样镜像在 [`assets/`](assets/SKILL.md)，
另外按本站图库「一张图 + 一段 prompt」的格式生成了 12 个浏览页，挂在 [手绘风格库](index.md) 下面。

## 上游版本跟踪

| 项 | 值 |
|---|---|
| 上游仓库 | <https://github.com/yang0/handraw-style>（作者 yang0） |
| 已收录 commit | [`b5c302e`](https://github.com/yang0/handraw-style/tree/b5c302e7164f287230ed80bde2f69f35aac39914)（上游最后更新 2026-09-29，`version.json` 为 1.2.29） |
| 抓取日期 | 2026-09-29 |
| 许可证 | MIT，原文见 [`assets/LICENSE`](assets/LICENSE)，按条款随收录保留 |

## 文件对应

| 本地 | 上游 |
|---|---|
| `assets/**` | 仓库根目录，逐文件原样，只去掉了 `.gitignore` |
| `styles-a.md` … `styles-h.md` | 由 `skills/handdraw-style-prompter/references/styles.json` 生成，按 `group` 首字母分成 8 页 |
| `layouts-*.md` | 由 `references/layouts.json` 和 `references/layouts/*.md` 生成，只取 `<!-- zh -->` 段 |
| `colors.md` | 由 `references/colors.json` 生成，取 `prompt_zh` |

## 收录方式

- **`assets/` 一字不改**：`SKILL.md` 和 5 个子 skill 都靠相对路径去找 `images/`、`references/`，改动目录会让 AI 当远程 skill 用时找不到参考图。
  其中 `AGENTS.md` 是上游仓库自己开发时用的规则（「每次回复末尾都附画廊链接」），不适用于本站；交互画廊里的微信二维码图片直接引用了 raw.githubusercontent.com，也照原样保留
- **浏览页是生成物**：由仓库根目录的 `scripts/build-handdraw-gallery.py` 从 `assets/` 生成，不要手改。
  风格片段按上游 README 海报示例的格式拼成「风格名称 · 参考作者 · 核心风格特征」，`traits` 原样照抄，没有过滤负面子句（过滤规则写在 [index.md](index.md) 里，由使用者自己处理）；
  样片优先用 `{编号}_grid.webp`，没有才用 `{编号}.webp`，跟上游 skill 选参考图的顺序一致
- 001–200 的单张样片是上游从拼图大表裁出来的，部分样片边缘带着相邻格子的半行标题（如 #036 底部露出「040 — …」）。上游 skill 垫图用的也是这张，照原样保留
- 条目内容保持上游原文，没有翻译：风格名是英文，特征描述和版式 prompt 本来就是中文

## 未来漂移处置

1. 在上游 clone 上执行 `git archive <新 commit> | tar -x -C docs/gallery/images/handdraw-style/assets`（先清空 `assets/`，再删掉 `.gitignore`）
2. `python3 scripts/build-handdraw-gallery.py` 重新生成浏览页；如果新增了风格分组或版式类别，要先改脚本里的 `STYLE_GROUPS` / `LAYOUT_GROUPS`
3. 更新上面表格里的 commit、日期和版本号；如果条数变了，同步修改 [index.md](index.md) 和 [图片分区索引](../index.md) 里的数字
