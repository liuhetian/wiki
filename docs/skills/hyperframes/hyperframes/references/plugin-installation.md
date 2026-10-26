# 从已安装的插件中运行

检查已加载的 `SKILL.md` 往上两级的目录里，是否有标识为 `hyperframes` 的 `plugin.json`、`.claude-plugin/plugin.json`、`.codex-plugin/plugin.json` 或 `.cursor-plugin/plugin.json`，或者一个 Gemini 扩展清单。那个目录就是 `<PLUGIN_ROOT>`。如果都不存在，这就是一个独立安装的 skill；按常规的安装和版本刷新说明执行。

对于插件安装，下面这些规则替代所有工作流和参考文档里的独立安装更新命令：

- 不要运行 `hyperframes skills update`、`skills check` 或 `npx skills add`。安装和更新由 agent 的插件管理器负责。从 `<PLUGIN_ROOT>/skills/<name>/SKILL.md` 读取工作流；捆绑的 skill 缺失时要报告出来，而不是去下载另一个发布版本。所有 skill 引用都在这个捆绑包内部解析，即使同时还装了一份独立副本。Claude 把路由器暴露为 `/hyperframes:hyperframes`；其他客户端可能暴露为 `/hyperframes`。
- 把命令示例里的 `npx hyperframes`（或裸的 `hyperframes`）替换为：

  ```bash
  node "<PLUGIN_ROOT>/skills/hyperframes/scripts/plugin-cli.mjs" <command> <args...>
  ```

  在用户的项目目录里运行，绝不在插件目录里运行。这个启动器会选用清单里指定的 CLI 版本，并禁用独立 skill 的自动安装，`init` 期间也是如此。第一次调用可能会通过 npm 下载那个确切的 CLI 版本。下载失败是一个错误，而不是允许你改用最新版本。已有的项目依赖文件和 lockfile 不得为了匹配插件而被覆盖；在改动它们之前，先把运行时不兼容的问题报出来。

- 对于捆绑的 Node 辅助脚本，使用同一个启动器，加上 `--script <absolute-script-path> <args...>`。这样会把发布版本号传给它们的依赖加载器。外部提供方、registry 下载和已有的项目依赖有各自的版本；仅凭插件版本并不能冻结这些输入。
- 把插件目录视为只读。把输出和临时工作放在项目里或临时目录里。把这个插件根目录和启动器约定传给任何被委派的工作流，这样它就不会回退到全局 skill。

要获取更新的 skill，使用客户端的插件更新流程并重新加载会话。不要在视频任务进行中悄悄更新已安装的插件。

启动器会屏蔽 CLI 更新提示以及独立 skill 的刷新，包括用带有过期提示缓存的旧版 CLI 运行时。它把发布版本以 `HYPERFRAMES_PLUGIN_VERSION` 传给支持插件的辅助脚本，并以 `HYPERFRAMES_SKILL_PKG_VERSION` 传给现有的辅助包引导程序。我们的发布流程会让这些包的版本一起变动。
