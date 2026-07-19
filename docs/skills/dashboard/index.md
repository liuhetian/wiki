# Dashboard 后台

搭后台管理系统（admin dashboard / back-office）的口味：**不 clone 样板再做减法，按「形状目录」组装** —— 每种页面形态（表格、看板、向导、图表页……）是一个带固定契约的「形状」，从目录里挑、按说明拼，而不是发明新结构。

本目录就是这份形状目录本身：**36 个形状，一个形状一篇小文，配一个能直接玩的活 demo**（纯客户端 React 单页，iframe 同域嵌入，AI 可直接 GET 源码 —— 机制见[写作规范·嵌入交互单页](../writing/mkdocs-wiki/index.md#iframe-demo)）。要搭某个后台页面，从下表挑最接近的形状进去照做。[^src]

## 完整目录（36 形状）

36 形状全部成文（「批量操作」合到[表格](reference/列表与表格/表格.md)、「空态」合到[反馈状态](reference/展示与反馈/反馈状态.md)，故实际 35 篇文章），按分组归档在 `reference/<分组>/` 下。

| 分组 | 形状 |
|---|---|
| 表单（5） | [表单](reference/表单/表单.md) · [向导表单](reference/表单/向导表单.md) · [搜索下拉](reference/表单/搜索下拉.md) · [文件上传](reference/表单/文件上传.md) · [行内编辑](reference/表单/行内编辑.md) |
| 列表与表格（9） | [表格 + 批量操作](reference/列表与表格/表格.md) · [卡片列表](reference/列表与表格/卡片列表.md) · [紧凑列表](reference/列表与表格/紧凑列表.md) · [无限滚动](reference/列表与表格/无限滚动.md) · [虚拟表格](reference/列表与表格/虚拟表格.md) · [列控制](reference/列表与表格/列控制.md) · [筛选面板](reference/列表与表格/筛选面板.md) · [保存视图](reference/列表与表格/保存视图.md) · [CSV 导入导出](reference/列表与表格/CSV导入导出.md) |
| 富视图（5） | [看板](reference/富视图/看板.md) · [日历](reference/富视图/日历.md) · [树形](reference/富视图/树形.md) · [时间线](reference/富视图/时间线.md) · [主从视图](reference/富视图/主从视图.md) |
| 详情与页面（6） | [详情页](reference/详情与页面/详情页.md) · [记录选项卡](reference/详情与页面/记录选项卡.md) · [关联记录](reference/详情与页面/关联记录.md) · [多栏布局](reference/详情与页面/多栏布局.md) · [设置页](reference/详情与页面/设置页.md) · [图表页](reference/详情与页面/图表页.md) |
| 展示与反馈（5） | [数据展示件](reference/展示与反馈/数据展示件.md) · [空态 + 反馈状态](reference/展示与反馈/反馈状态.md) · [通知中心](reference/展示与反馈/通知中心.md) · [审计日志](reference/展示与反馈/审计日志.md) |
| 平台能力（6） | [权限门控（RBAC）](reference/平台能力/权限门控.md) · [登录方式](reference/平台能力/登录方式.md) · [全局搜索（⌘K）](reference/平台能力/全局搜索.md) · [i18n](reference/平台能力/i18n.md) · [计费](reference/平台能力/计费.md) · [实时刷新](reference/平台能力/实时刷新.md) |

## 一篇形状文章怎么用

每篇都是同一个规格，从上往下四件东西，各有各的用法：

1. **开头一段** —— 这个形状解决什么问题、什么时候选它。选型阶段只读这段就够。
2. **活 demo +「试这几下」** —— 先玩两下，确认交互是不是你要的，别靠想象拍板。
3. **「规矩」** —— 这个形状的不变量，施工时逐条对照落实；demo 与真实版的替换点（数据层、URL 状态、服务端鉴权）也标在这一节。
4. **文末** —— 蓝本永链（钉 commit，想读原文去 GitHub）+ 可折叠的 demo 源码（自包含、未压缩）。

## 共享不变量（每个形状都服从）

形状能互相拼装，靠的是同一组契约，不是运气：

1. **列表参数一个形状**：`{ page, pageSize, search?, sortBy?, sortDir?, filters? }` → `{ rows, total }`
2. **数据只走服务端函数**，鉴权在服务端（`requireUser` / `requireRole`），密钥不进客户端
3. **列表/选中状态放 URL**（分享、刷新、后退都不丢）；例外：多选等瞬态 UI 状态放局部 state
4. **查询键约定**：`["<resource>", "list", params]` / `["<resource>", "detail", id]`，变更后失效 `["<resource>"]`
5. **反馈**：变更必 toast；破坏性操作先过确认弹窗
6. **每个数据视图显式处理 loading / empty / error**
7. 资源住 `features/<name>/`，路由住 `routes/_app/<name>`

## 从单个形状到一整个后台

一页后台通常是几个形状的拼装，先后有讲究：

- **先数据，后 UI**：屏幕要有自己的数据，先立一条 CRUD 纵切 —— [表格](reference/列表与表格/表格.md)打底、[表单](reference/表单/表单.md)进出数据、[详情页](reference/详情与页面/详情页.md)看单条；只是给已有数据换个看法、加层交互（[筛选面板](reference/列表与表格/筛选面板.md)、[保存视图](reference/列表与表格/保存视图.md)、[看板](reference/富视图/看板.md)……），直接往纵切上叠 UI 形状。
- **平台能力最后横切**：[权限门控](reference/平台能力/权限门控.md)、[全局搜索](reference/平台能力/全局搜索.md)、[i18n](reference/平台能力/i18n.md)、[计费](reference/平台能力/计费.md)不属于哪一页，等页面成形后统一接入。

动工前值得通读的两份系统级契约（本目录唯二留档的蓝本原文 —— 它们跨所有形状，切不进任何单篇文章）：

- [`PATTERNS.md`](assets/open-dashboard/PATTERNS.md) —— 36 形状总目录 + 共享不变量的完整表述，施工前扫一遍建全貌
- [`backends/CONTRACT.md`](assets/open-dashboard/backends/CONTRACT.md) —— 前后端线协议。本目录的 demo 全是内存态，把形状接上真后端时，这份契约是唯一依据

!!! note "demo 与真实版的差距，是刻意的"
    本目录的 demo 全部**内存状态、免构建**（React 18 UMD + `htm`，运行时在全站共享的 `/vendor/`，样式共用 [`assets/demo.css`](assets/demo.css)），把形状的交互契约演示到位；真实项目里，数据换成 `Repository` 适配器、列表状态进 URL、鉴权走服务端 —— 各篇「规矩」一节都标了替换点。

[^src]: 蓝本：[ahpxex/open-dashboard](https://github.com/ahpxex/open-dashboard)（MIT，作者 ahpx，技术栈 TanStack Start（React 19）+ Drizzle + better-auth + shadcn-on-base-ui + Tailwind v4），已吸收 commit `aa9815f`（2026-06-29，首次吸收 2026-07-07）。吸收方式：各形状的 Invariants 提炼进对应文章的「规矩」节，实现由自研可玩 demo 承担；原文与模板代码不本地存档（对象存储不适合扛 750+ 文件），钉 commit 的 GitHub 永链在各篇文末指路 —— 详见 [`MIRROR.md`](assets/open-dashboard/MIRROR.md)。要一比一的成品模板，去原仓库装它的 skill 目录。
