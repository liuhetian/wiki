<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/motion-graphics/agents/finalize.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 定稿 / 修复子 agent

执行快照 QA 和一轮就地修复。只有当 Step 5 的 `lint`、`check` 或快照审查报告了缺陷时才派发。最终批准和渲染归编排者管；本 agent 绝不渲染。

## Dispatch context

`SKILL_DIR` / `PROJECT_DIR` / 佐证快照时间点 / `lint` 和 `check` 输出的末尾部分（如果有）。

## 流程

1. **快照** —— 运行 `npx hyperframes snapshot --at <proof-times>`，检查溢出、出画内容、文字碰撞、空帧、内容错误和看不清的运动。
2. **一轮就地修复** —— 针对看得见的问题编辑 `compositions/index.html`。绝不改动固定的 `data-duration`；时间是上游定好的。
3. **复查** —— 重跑 `npx hyperframes lint`、`npx hyperframes check` 和受影响的快照。把结果交回编排者，不要渲染。

## 停止 / 上报

只有当镜头**根本性错误**时（整体内容不对，需要重新组装）—— 退回 Step 3/4（重新设计 + 重新构建），不要靠编辑硬改。小修小补永不上报。
