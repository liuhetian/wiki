---
title: MIRROR
---

# xi-wen 来源与吸收说明

本目录归档 [YuanZHAO321/XiWen](https://github.com/YuanZHAO321/XiWen) 的真身，供未来上游漂移时可对照。真身就是入口：[`index.md`](index.md) 即上游 `SKILL.md` 原文照录（仅改文件名），人读的一句话介绍在分类索引 [`../index.md`](../index.md)。

## 上游版本跟踪

| 项 | 值 |
|---|---|
| 上游仓库 | <https://github.com/YuanZHAO321/XiWen>（Apache-2.0 协议） |
| 已吸收 commit | [`eb32d38d2ba66178e01f25a25e016a913604b1c8`](https://github.com/YuanZHAO321/XiWen/blob/eb32d38d2ba66178e01f25a25e016a913604b1c8/SKILL.md)（2026-07-07） |
| 首次吸收日期 | 2026-07-09 |
| 本地归档 | [index.md](index.md)（上游 `SKILL.md` 原文照录，仅改名）+ `references/` 四份精讲笔记（[逐篇精读](references/逐篇精读.md) / [骈句声律](references/骈句声律.md) / [用典骂法库](references/用典骂法库.md) / [戏仿范例](references/戏仿范例.md)）+ `references/originals/` 五篇底本古檄（[为袁绍檄豫州文](references/originals/为袁绍檄豫州文.md) / [为李密檄洛州文](references/originals/为李密檄洛州文.md) / [为徐敬业讨武曌檄](references/originals/为徐敬业讨武曌檄.md) / [谕中原檄](references/originals/谕中原檄.md) / [讨粤匪檄](references/originals/讨粤匪檄.md)） |

## 吸收方式

按 skill 吸收规矩归档：目录镜像上游布局——主文件原文照录为 `index.md`、依赖的 `references/` 与 `references/originals/` 平级归档，内部相对链接（如 `references/逐篇精读.md`、`originals/为袁绍檄豫州文.md`）原样有效。人读介绍压成一句话进分类索引。

这个 skill 的行为定义横跨三层：第一层是 `SKILL.md`（骨架 + 套语速查，触发即加载）；第二层是 `references/` 的四份精讲（症状→药方式按需读 1–2 份）；第三层是 `references/originals/` 的五篇原文（沉浸语感、核对引文）。三层都是 `SKILL.md` 显式声明的"行为定义"，只留主文件会让第二第三层的相对链接全成死链，起不到"真身可对照"的作用，故 10 份全部照录。

**改动声明**：

- `SKILL.md` → `index.md` 仅改名，内容原文照录。
- 四份 `references/*.md` 原文照录，内部无跨文引用。
- 五篇 `references/originals/*.md` 原文以 blockquote 元信息起头、无 H1；为免 mkdocs 页面标题落回 "Index"，在文件开头补 `title:` frontmatter（值即上游文件名去 `.md`），正文一字未改。

**不归档的**：

- 上游 [`README.md`](https://github.com/YuanZHAO321/XiWen/blob/eb32d38d2ba66178e01f25a25e016a913604b1c8/README.md)（永链）是给人看的介绍与安装说明——wiki 里不需要两个诉说者，这个任务由分类索引 [`../index.md`](../index.md) 里的一句话承担。
- [`evals/evals.json`](https://github.com/YuanZHAO321/XiWen/blob/eb32d38d2ba66178e01f25a25e016a913604b1c8/evals/evals.json) 是 skill-creator 评测用例，不属于行为定义。
- `LICENSE`（Apache-2.0）、`.gitattributes` 亦非行为定义。

## 未来漂移处置

上游 `SKILL.md` 出新版时：

1. `curl`（或 jsdelivr 镜像 `cdn.jsdelivr.net/gh/YuanZHAO321/XiWen@<sha>/<path>`，遇 GitHub 限流时用）拿新 sha 与 diff
2. 更新本页表格里的 commit + 日期 + 永链
3. 本目录 `index.md`（= 上游 `SKILL.md`）/ `references/` / `references/originals/` 同步覆盖为新原文；五篇原文覆盖后需重新补 `title:` frontmatter
4. 分类索引 `../index.md` 的一句话介绍按需更新
