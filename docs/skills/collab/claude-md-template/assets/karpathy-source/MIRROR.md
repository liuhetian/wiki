# andrej-karpathy-skills 来源与吸收说明

本目录归档 [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) 根目录 `CLAUDE.md` 的英文原文，供未来上游漂移时可对照。中译提炼 + 自己的踩坑分析在上级目录 [`../../index.md`](../../index.md)。

## 上游版本跟踪

| 项 | 值 |
|---|---|
| 上游仓库 | <https://github.com/multica-ai/andrej-karpathy-skills>（作者 Jiayuan Zhang / forrestchang，原仓库 `forrestchang/andrej-karpathy-skills` 已 301 转到本仓库） |
| 已吸收 commit | [`2c606141936f1eeef17fa3043a72095b4765b9c2`](https://github.com/multica-ai/andrej-karpathy-skills/blob/2c606141936f1eeef17fa3043a72095b4765b9c2/CLAUDE.md) |
| 抓取日期 | 2026-07-08 |
| 本地归档 | [CLAUDE.md](CLAUDE.md)（原文照录） |

## 吸收方式

原文四条（Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution）量级是单份 CLAUDE.md，走 [[article-citation-style]] 的三步规矩：真身存档进本目录 + 中译提炼进 [`../../index.md`](../../index.md) + 自己踩过的三个坑跟四条原则的对应关系写在同一页。

四条原则不是全盘照抄——正文分析了它们在真实使用中留的三处空白（全局目标丢失、工具不会自主安装、长任务反复重述背景），并补充成 `../CLAUDE.md`（跨项目模板本体）里的额外条目。

## 未来漂移处置

上游 `CLAUDE.md` 出新版时：

1. `curl` 拿新 sha 与 diff
2. 更新本页表格里的 commit + 日期 + 永链
3. 本目录 `CLAUDE.md` 同步覆盖为新原文
4. 上级 `index.md` 的中译摘录按需重译
