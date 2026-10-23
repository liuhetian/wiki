---
description: "Teable 粗讲：不是又一个在线表格，是套了表格外壳的 Postgres；程序管结构和联动计算，模型只填 AI 字段；重心是改一格后跨表连锁重算；追问两条：更像 Airtable，计算字段不靠触发器、在应用层算"
---

# Teable：套了表格外壳的 Postgres

它不是又一个在线表格，而是套了表格外壳的 Postgres：每张表是一张真表，每个字段是一列。AI 在开源代码里也不跟人并排操作表格，只是一种会自己填值的列。

程序管结构和能算的一切：link、lookup、rollup、formula 由后端维护，公式编译成 SQL 在库里算。人建表、连表、写公式。模型只填 AI 字段，照同一行的源字段做摘要、翻译、分类。README 说的 agent，后端在闭源的 teable-ee，这里只同步了界面壳。

重心是改一格之后连锁算到哪。B 表一个值变了，所有 link 到它的 A 表记录，lookup、rollup、formula 都得重算。新 base 默认走重写的 v2 引擎：被改的表当场算完，波及别的表的写进 outbox，交给 BullMQ worker 接着算，反复失败的进 dead letter 表。

作者一直在补的也是这块：近五分之一的提交带 link、lookup、rollup、formula 或 computed[^repo]，最近在补 schema repair 和卡住任务的恢复。

## 追问 { #qa }

### 意思是给 Postgres 加一层封装，就变成了一个 Google Sheet？ { #sheet }

封装对，Google Sheet 不对 —— 它更像 Airtable。Google Sheet 是一张格子网：哪一格都能写公式，用 A1 这种坐标引别的格子。Teable 是每列一个类型、一行一条记录：公式写在列上，对整列每一行生效；表和表之间用 link 连，不靠格子坐标。这层封装让不会 SQL 的人用表格界面操作一个关系数据库，视图里的筛选、排序最后也翻成 SQL 的 `where`、`orderBy` 交给 Postgres。

### 核心就是有了触发器之类的，能让某些列变成依赖其他列的函数？ { #trigger }

某些列是别的列的函数 —— 对，这就是计算字段；靠触发器 —— 不对。Teable 没让 Postgres 自己算公式：

- 生成列（`GENERATED ALWAYS AS`）在 v2 里只给 CreatedTime、AutoNumber 这类系统字段用，`GeneratedColumnRule.ts` 的注释写明了是哪几种[^gen]
- 触发器只有一个 `__teable_undo_capture`，记每行改前改后的样子供撤销用，不算公式[^undo]
- 公式字段就是普通列，值由 Node 后端算好、拼成 SQL `UPDATE` 写进去

不交给数据库，是因为两样现成机制都不够用：

- 生成列只能引同一行、同一张表，函数还得结果固定 —— 跨表的 lookup、rollup 做不了，`TODAY()` 也做不了
- 触发器能跨表，但只能在这次写入的事务里一口气级联到底 —— 改一格牵连上万行，用户这次保存就得等全部算完；中途出错整笔回滚，也没法看进度、单独重试

所以它在应用层自己维护一张字段依赖图：每次改动先算出哪些表、哪些行脏了，按依赖顺序分层生成 `UPDATE`；被改的表当场写，别的表进 outbox 交给后台 worker，失败重试，一直失败进 dead letter 表。核心不是「有了触发器」，而是把触发器的活搬到应用层，换来能拆开、延后、重试、看进度。

[^repo]: [teableio/teable](https://github.com/teableio/teable/tree/f139ee25e435de847b7e26ca54c58014bce11393)，读的是 commit `f139ee2`，2026-10-20 读。
[^gen]: [GeneratedColumnRule.ts](https://github.com/teableio/teable/blob/f139ee25e435de847b7e26ca54c58014bce11393/packages/v2/adapter-table-repository-postgres/src/schema/rules/field/GeneratedColumnRule.ts)，同一 commit。
[^undo]: [undoCapture.ts](https://github.com/teableio/teable/blob/f139ee25e435de847b7e26ca54c58014bce11393/packages/v2/adapter-table-repository-postgres/src/shared/undoCapture.ts)，同一 commit。
