# qu-ai-wei 来源与吸收说明

本目录归档 [LifelongLazyLearner/qu-ai-wei](https://github.com/LifelongLazyLearner/qu-ai-wei) 的真身，供未来上游漂移时可对照。真身就是入口：[`index.md`](index.md) 即上游 `SKILL.md` 原文照录（仅改文件名），人读的一句话介绍在分类索引 [`../index.md`](../index.md)。

## 上游版本跟踪

| 项 | 值 |
|---|---|
| 上游仓库 | <https://github.com/LifelongLazyLearner/qu-ai-wei>（MIT 协议） |
| 已吸收 commit | [`ed35e74629c7f0337fa30b85660fe59adef291ff`](https://github.com/LifelongLazyLearner/qu-ai-wei/blob/ed35e74629c7f0337fa30b85660fe59adef291ff/SKILL.md)（v0.8.2，2026-07-01） |
| 首次吸收日期 | 2026-07-09 |
| 本地归档 | [index.md](index.md)（上游 `SKILL.md` 原文照录，922 行，仅改名）+ `references/` 全部 9 份规则表（[patterns](references/patterns.md) / [platform-patterns](references/platform-patterns.md) / [brand-voice](references/brand-voice.md) / [whitelists](references/whitelists.md) / [punctuation](references/punctuation.md) / [syntax](references/syntax.md) / [examples](references/examples.md) / [reference-models](references/reference-models.md) / [sources](references/sources.md)），原文照录 |

## 吸收方式

跟 [`grilling`](../../collab/grilling/MIRROR.md) 一样按 skill 吸收规矩归档：目录镜像上游布局——主文件原文照录为 `index.md`、依赖的 `references/` 平级归档，内部相对链接原样有效。人读介绍压成一句话进分类索引（2026-07-09 起不再单独写落地文/摘录页：人读内容太少，不值得独立页面）。

**改动声明**：主文件（现 `index.md`）与 `references/` 九份均原文照录，除主文件改名外未做任何改动。

这个 skill 的行为定义横跨两层：主文件是主控（六级仲裁顺序），具体规则表在 `references/` 下 9 份文件里（brand-voice / examples / patterns / platform-patterns / punctuation / reference-models / sources / syntax / whitelists，合计约 137KB）。只存主文件的话，里面的 `references/xxx.md` 链接全是死的，起不到"真身可对照/可运行"的作用，所以 9 份全部照录。不归档的：`scripts/`（build-flat.sh / install-skill.sh，安装用 shell 胶水）和多语言 `readmes/` 不属于 skill 行为定义；人读的 [`README.md`](https://github.com/LifelongLazyLearner/qu-ai-wei/blob/ed35e74629c7f0337fa30b85660fe59adef291ff/README.md)（永链）是上游作者的介绍与安装说明，**wiki 里不需要两个诉说者**，这个任务由分类索引 [`../index.md`](../index.md) 里的一句话承担（首次吸收时曾归档过一版并做过死链归一化，2026-07-09 依此原则移除）。

## 未来漂移处置

上游 `SKILL.md` 出新版时：

1. `curl`（或 jsdelivr 镜像，遇 GitHub 限流时用）拿新 sha 与 diff
2. 更新本页表格里的 commit + 日期 + 永链
3. 本目录 `index.md`（= 上游 `SKILL.md`）/ `references/` 同步覆盖为新原文
4. 分类索引 `../index.md` 的一句话介绍按需更新
