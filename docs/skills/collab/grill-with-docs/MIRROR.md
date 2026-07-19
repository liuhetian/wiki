# mattpocock/grill-with-docs 来源与吸收说明

本目录归档 [mattpocock/skills](https://github.com/mattpocock/skills) 里 `skills/engineering/grill-with-docs/SKILL.md` 的英文原文，供未来上游漂移时可对照。真身就是入口：[`index.md`](index.md) 即上游 `SKILL.md` 原文照录（仅改文件名），人读的一句话介绍在分类索引 [`../index.md`](../index.md)。

`grill-with-docs` 本身只是一行触发器，真正的行为——边问边把术语写进 `CONTEXT.md`、把难以回退的决策写成 ADR——定义在它依赖的 `domain-modeling` skill 里，因此把 `domain-modeling` 的三份文件一并归档到 [`domain-modeling/`](domain-modeling/SKILL.md) 子目录，不然读者对着一行文件看不出这东西到底做了什么。

## 上游版本跟踪

| 项 | 值 |
|---|---|
| 上游仓库 | <https://github.com/mattpocock/skills>（作者 Matt Pocock，MIT 协议） |
| 已吸收 commit | [`658d53e6ded8cc0eaa26a96e0580bee9381ca0e3`](https://github.com/mattpocock/skills/tree/658d53e6ded8cc0eaa26a96e0580bee9381ca0e3/skills/engineering/grill-with-docs)（2026-05-31） |
| 首次吸收日期 | 2026-07-09 |
| 本地归档 | [index.md](index.md)（grill-with-docs 上游 `SKILL.md` 原文照录，仅改名）+ [domain-modeling/SKILL.md](domain-modeling/SKILL.md)、[domain-modeling/ADR-FORMAT.md](domain-modeling/ADR-FORMAT.md)、[domain-modeling/CONTEXT-FORMAT.md](domain-modeling/CONTEXT-FORMAT.md)（依赖的三份原文） |

## 吸收方式

跟 [`grilling`](../grilling/MIRROR.md) 一样按 skill 吸收规矩归档：原文照录为 `index.md`，人读介绍压成一句话进分类索引 [`../index.md`](../index.md)。差别是这次多带了一层依赖（domain-modeling），因为不把依赖也存下来，grill-with-docs 的主文件单看只有一句话，起不到"真身可对照"的作用。

**改动声明**：正文原文照录；除改名外，仅在 `index.md` 的 frontmatter 补一行 `title:`（上游原文无 H1，不补则页面标题落回 "Index"）；`domain-modeling/` 三份未做任何改动。

## 未来漂移处置

上游任意一份原文出新版时：

1. `curl` 拿新 sha 与 diff
2. 更新本页表格里的 commit + 日期 + 永链
3. 本目录对应文件（主文件对应 `index.md`）同步覆盖为新原文
4. 分类索引 `../index.md` 的一句话介绍按需更新
