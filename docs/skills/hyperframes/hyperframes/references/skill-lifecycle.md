# Skill 的安装与保鲜

在安装或更新 skill、诊断工作流的意外行为，或在 CI 中运行 HyperFrames 设置时，读这份参考。

对于插件安装，遵循[插件执行规则](plugin-installation.md)；更新由插件管理器负责，所有工作流都已捆绑在内。下面的命令只适用于独立安装的 skill。

HyperFrames 对核心集合立即安装，对工作流 skill 按需安装。

- **核心集合：** `/hyperframes`、各个 `hyperframes-*` 领域 skill，以及 `/media-use`。
- **工作流 skill：** 在路由选中它们时，通过 `npx hyperframes skills update <workflow-name>` 安装。

## `init` 做什么

`npx hyperframes init` 会检查 GitHub，并刷新核心集合以及其他已安装的 skill。它不会安装从未用过的工作流。已经是最新的安装不会有任何变化。离线或被限流时，检查会平稳降级，不会导致项目脚手架搭建失败。

`--skip-skills` CLI 参数暂时被忽略。CI 和测试可以通过 `HYPERFRAMES_SKIP_SKILLS=1` 选择不安装。

## 诊断与更新

```bash
npx hyperframes skills check
npx hyperframes skills check --json
npx hyperframes skills update
npx hyperframes skills update <workflow-name>
npx hyperframes skills
```

- 当某个已安装的 skill 过期或核心集合不完整时，`skills check` 以非零状态退出。可按需获取但尚未安装的工作流不算失败。
- 裸的 `skills update` 刷新核心集合和所有已安装的内容，清理未发布的 skill，并且不扩充工作流集合。
- 带名字的 `skills update <name...>` 还会安装那些点名的工作流或领域 skill。
- 裸的 `skills` 会显式安装完整的已发布集合。

如果 HyperFrames CLI 不可用，安装单个工作流用 `npx skills add heygen-com/hyperframes --skill <workflow-name>`，安装完整的已发布集合用 `npx skills add heygen-com/hyperframes --all`。

CLI 可能会在 `render`、`lint` 或 `check` 期间打印一行 skill 过期提醒。把更新失败当作一个可见的工具故障；不要凭记忆中的工作流契约继续下去。
