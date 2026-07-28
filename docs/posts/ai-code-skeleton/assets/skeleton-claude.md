# 开发约定

本目录是 custom-iap-backend 的**骨架 / 设计蓝图**：函数体是 `...`，
docstring 是规约。实装仓库是 `../custom-iap-backend-v2/`。
架构、已定决策、复现步骤见 `README.md`。

## 改动工作流（蓝图先行）

1. **plan**：先规划，说明改什么、为什么
2. **改骨架**：签名 + docstring 写规约；设计思考写成 `#` 注释（只留骨架）
3. **用户批准后**再同步写入 v2：写函数体，docstring 逐字照搬骨架，
   `#` 注释不带过去
4. 在 v2 跑对齐检查，必须通过：
   `uv run python -m scripts.check_skeleton_sync`

## 硬规则

- **docstring = 规约，`#` 注释 = 思考**。判据一句话：使用者/读者需要的 →
  docstring（骨架与 v2 逐字一致）；实现者/考古需要的 → `#` 注释（只写在
  骨架，不同步）：`[源: file:line]` 溯源、`[新: 日期]` 标记、设计理由、
  实现草图。
- 两个实码文件骨架与 v2 **整文件一致**：`custom_iap_backend/config.py`、
  `custom_iap_backend/packages/models.py`。
- 发布契约住仓库根 `shared/iap_assets`（零 IO、零表，backend 与
  img-generate 共用）；组装逻辑住 `packages/composer.py`（backend 私有），
  不回流共享包。
