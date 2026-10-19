---
description: "去 AI 味的维护记录：吸纳自 LifelongLazyLearner/qu-ai-wei（MIT），钉在 ed35e74（v0.8.2）；上游本来是中文，SKILL.md 和 references/ 九份规则表原文照录，只把外链挪进脚注；安装脚本、多语言 readmes、README 跳过"
---

# 去 AI 味（qu-ai-wei）

[去 AI 味](../../skills/writing/qu-ai-wei/index.md)的维护记录。

- **上游**：LifelongLazyLearner/qu-ai-wei[^repo]，MIT。上游本来就是中文，不用翻译
- **commit**：钉在 `ed35e74`（v0.8.2，2026-07-01），2026-07-09 首次吸收
- **跳过**：
    - `scripts/`：build-flat.sh、install-skill.sh，安装用的 shell 胶水
    - 多语言 `readmes/`
    - README[^readme]：作者的介绍与安装说明，wiki 里不需要两个诉说者，这件事由[写作口味](../../skills/writing/index.md)那一行钩子承担。首次吸收时归档过一版，2026-07-09 移除
- **翻译之外的改动**：
    - `SKILL.md` 改名 `index.md`，和 `references/` 九份规则表（patterns、platform-patterns、brand-voice、whitelists、punctuation、syntax、examples、reference-models、sources，合计约 137KB）一起原文照录。主文件是主控（六级仲裁顺序），具体规则在九份表里，只存主文件的话 `references/` 链接全是死的，所以全部照录
    - 入口末尾加了指向本页的维护记录链接
    - 2026-10-19 起正文里的外链挪进文末脚注（3 篇、9 个网址），守[正文链接只指站内](../../skills/wiki-guide/index.md#rules)；没写成链接、直接贴出来的网址照旧

## 上游更新

1. 拿上游新 commit 和 `ed35e74` 的 diff，GitHub 限流时走 jsdelivr 镜像
2. 入口 `index.md` 和 `references/` 覆盖为新原文，正文外链重新挪进脚注，再把末尾的维护记录链接补回去
3. 更新本页的 commit、日期和脚注永链；写作口味索引那行钩子按需改

[^repo]: [LifelongLazyLearner/qu-ai-wei @ ed35e74 的 SKILL.md](https://github.com/LifelongLazyLearner/qu-ai-wei/blob/ed35e74629c7f0337fa30b85660fe59adef291ff/SKILL.md)，2026-07-09 读。
[^readme]: [qu-ai-wei 的 README @ ed35e74](https://github.com/LifelongLazyLearner/qu-ai-wei/blob/ed35e74629c7f0337fa30b85660fe59adef291ff/README.md)，2026-07-09 读。
