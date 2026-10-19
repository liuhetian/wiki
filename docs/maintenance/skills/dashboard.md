---
description: "Dashboard 的维护记录：蓝本 ahpxex/open-dashboard（MIT），钉在 aa9815f；每个形状的 Invariants 提炼成文章的「规矩」，实现换成自研 demo，原文不存档、各篇文末钉永链，只留 PATTERNS.md 和 backends/CONTRACT.md 两份系统级契约"
---

# Dashboard（open-dashboard）

[Dashboard](../../skills/dashboard/index.md)的维护记录。

- **上游**：ahpxex/open-dashboard[^repo]，作者 ahpx，MIT。技术栈 TanStack Start（React 19）+ Drizzle + better-auth + shadcn-on-base-ui + Tailwind v4
- **commit**：钉在 `aa9815f`（2026-06-29），2026-07-07 首次吸收
- **跳过**：
    - 36 篇形状 reference、skill 文档和模板代码的原文都不在本地存档：活跃开源仓库钉 commit 永链就能满足「AI 可 GET 源」，750 多个 tsx 存进对象存储只会拖累部署。要一比一的成品模板，去原仓库装它的 skill 目录
- **翻译之外的改动**：蓝本分三层，各去了不同的地方
    - 每个形状的 Invariants：中文提炼进对应文章的「规矩」一节，六组（表单、列表与表格、富视图、详情与页面、展示与反馈、平台能力）
    - 实现：换成自研可玩 demo（`skills/dashboard/assets/demo-*.html`，源码未压缩可直读），全部内存状态、免构建
    - 原文档正本：各篇文末一行「蓝本」钉 commit 永链
    - 例外是两份系统级契约，切不进任何单篇文章，留在 `skills/dashboard/assets/open-dashboard/`：[`PATTERNS.md`](../../skills/dashboard/assets/open-dashboard/PATTERNS.md) 是 36 形状的全局总目录加共享契约，施工前先读它建立全貌；[`backends/CONTRACT.md`](../../skills/dashboard/assets/open-dashboard/backends/CONTRACT.md) 是前后端线协议（json-server 方言 + `AuthProvider` 接线），demo 全是纯前端内存态，接真后端时它是唯一依据。两份里指向已删的 `docs/*.md`、`ROADMAP.md`、`src/*.ts` 的相对链接都改成了钉 commit 的永链

## 上游更新

1. `git clone` 上游，`git diff aa9815f..<新 commit> --stat -- .claude/skills PATTERNS.md backends/CONTRACT.md README.md` 看动了什么
2. 逐条处置：
    - references 变了：更新对应文章的「规矩」，必要时 demo 也改
    - 新增形状：照现有文章的结构补文章、demo，注册 nav
    - `PATTERNS.md`、`backends/CONTRACT.md` 变了：更新留存的这两份
    - 纯代码、模板变动：不用动，本 wiki 不镜像代码
3. 更新本页的 commit 和日期；文章里的旧永链不用改，钉旧 commit 依然有效，只有内容实质变化的才随「规矩」一起更新
4. 跑 `python3 scripts/check-links.py`

[^repo]: [ahpxex/open-dashboard @ aa9815f](https://github.com/ahpxex/open-dashboard/tree/aa9815f426e9520841c4aa15a341bfd9f866091f)，2026-07-07 读。
