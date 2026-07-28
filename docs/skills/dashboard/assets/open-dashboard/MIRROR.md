# open-dashboard 来源与吸收说明

本目录不是 [ahpxex/open-dashboard](https://github.com/ahpxex/open-dashboard) 的镜像，只是**吸收后残留的两份系统级契约**（`PATTERNS.md`、`backends/CONTRACT.md`），以及这份说明页。原仓库全部内容——36 篇形状 reference、skill 文档、模板代码——都不在本目录，需要时按下面钉的 commit 永链去 GitHub 读。

## 上游版本跟踪

| 项 | 值 |
|---|---|
| 上游仓库 | <https://github.com/ahpxex/open-dashboard>（MIT，作者 ahpx） |
| 已吸收 commit | [`aa9815f426e9520841c4aa15a341bfd9f866091f`](https://github.com/ahpxex/open-dashboard/tree/aa9815f426e9520841c4aa15a341bfd9f866091f)（2026-06-29） |
| 首次吸收日期 | 2026-07-07 |
| 永链前缀 | `https://github.com/ahpxex/open-dashboard/blob/aa9815f426e9520841c4aa15a341bfd9f866091f/` |

## 吸收原则（为什么本地不再存原文）

蓝本原文分三层，各自去了不同的地方：

| 蓝本层 | 去向 |
|---|---|
| **每个形状的 Invariants** | 中文提炼进对应文章的 `## 规矩` 一节（本 wiki `docs/skills/dashboard/reference/<分组>/*.md`，六组：表单 / 列表与表格 / 富视图 / 详情与页面 / 展示与反馈 / 平台能力） |
| **实现** | 自研可玩 demo（`docs/skills/dashboard/assets/demo-*.html`，源码未压缩可直读） |
| **原文档正本** | 不本地存档，改钉 commit 的 GitHub 永链，文末一行 `> 蓝本：[<ref>.md](<永链>)` |

`docs/index.md` 的项目背景一节也点了这套约定：活跃开源仓库 + 钉 commit 永链已经能满足"AI 可 GET 源"，本 wiki 存 750+ 个 tsx 只会拖垮对象存储部署。

## 为什么留 PATTERNS 和 CONTRACT 两份

原文吸收原则的例外——这两份不能切给单篇文章：

- **`PATTERNS.md`** —— 36 形状的**全局总目录 + 共享契约**。任何单篇文章都只讲一个形状，扛不下这份跨形状的全景视图；AI 施工前应先读它建立全貌。
- **`backends/CONTRACT.md`** —— **前后端线协议**（json-server 方言 + `AuthProvider` 接线）。本 wiki 的 demo 全是纯前端内存态，接真后端时它是唯一依据；这份契约不属于任何 UI 形状，无从切片。

留下的这两份文件里指向已删的 `docs/*.md`、`ROADMAP.md`、`src/*.ts` 的相对链接，都已改写成本仓库的 GitHub 永链，本地构建不会报"page does not exist"。

## 未来吸收新 commit 的流程

上游出新 commit 要继续吸收时：

1. `git clone` 上游 → `git diff aa9815f..<新commit> --stat -- .claude/skills PATTERNS.md backends/CONTRACT.md README.md` 看动了什么
2. 逐条处置：
    - **references 变了** → 更新对应文章的「规矩」（必要时 demo 也改）
    - **新增形状** → 按统一规格补文章 + demo + nav（详见仓库根 `TODO-dashboard-shapes.md` 里的「统一规格」节）
    - **`PATTERNS.md` / `backends/CONTRACT.md` 变了** → 更新本目录留存的这两份
    - **纯代码/模板变动** → 通常无需动作（本 wiki 不镜像代码）
3. 更新本页「上游版本跟踪」表：新 commit 哈希 + 日期 + 永链前缀；文章里的旧永链**不用改**（钉旧 commit 依然有效，只有内容实质变化的才随「规矩」一起更新）
4. `uv run zensical build` 零警告
