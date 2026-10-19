---
description: "檄文的维护记录：吸纳自 YuanZHAO321/XiWen（Apache-2.0），钉在 eb32d38；上游本来是中文，SKILL.md、四份精讲、五篇底本古檄原文照录，原典补 title、入口的文件路径改成链接；README、evals、LICENSE 跳过"
---

# 檄文（xi-wen）

[檄文](../../skills/writing/xi-wen/index.md)的维护记录。

- **上游**：YuanZHAO321/XiWen[^repo]，Apache-2.0。上游本来就是中文，不用翻译
- **commit**：钉在 `eb32d38`（2026-07-07），2026-07-09 首次吸收
- **跳过**：
    - README[^readme]：给人看的介绍与安装说明，由[写作口味](../../skills/writing/index.md)那一行钩子承担
    - `evals/evals.json`：skill-creator 的评测用例，不属于行为定义
    - `LICENSE`、`.gitattributes`
- **翻译之外的改动**：
    - 行为定义分三层，都是 `SKILL.md` 显式声明的，全部照录：第一层 `SKILL.md`（骨架 + 套语速查）改名 `index.md`；第二层 `references/` 四份精讲笔记（逐篇精读、骈句声律、用典骂法库、戏仿范例）；第三层 `references/originals/` 五篇底本古檄（为袁绍檄豫州文、为李密檄洛州文、为徐敬业讨武曌檄、谕中原檄、讨粤匪檄）
    - 五篇原典以 blockquote 元信息起头、没有 H1，为免页面标题落回「Index」，开头补了 `title:` frontmatter，值是上游文件名去掉 `.md`，正文一字未改
    - 入口两张「读什么」表里用行内代码写的 9 个文件路径改成链接，链接文字保留上游写法 —— 不挂链 AI 顺链接走不到这些文件；末尾加了指向本页的维护记录链接

## 上游更新

1. 拿上游新 commit 和 `eb32d38` 的 diff，GitHub 限流时走 jsdelivr 镜像
2. 入口 `index.md`、`references/`、`references/originals/` 覆盖为新原文；五篇原典重新补 `title:`，入口两张表的路径重新改成链接，末尾的维护记录链接补回去
3. 更新本页的 commit、日期和脚注永链；写作口味索引那行钩子按需改

[^repo]: [YuanZHAO321/XiWen @ eb32d38 的 SKILL.md](https://github.com/YuanZHAO321/XiWen/blob/eb32d38d2ba66178e01f25a25e016a913604b1c8/SKILL.md)，2026-07-09 读。
[^readme]: [XiWen 的 README @ eb32d38](https://github.com/YuanZHAO321/XiWen/blob/eb32d38d2ba66178e01f25a25e016a913604b1c8/README.md)，2026-07-09 读。
