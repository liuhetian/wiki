---
description: "DeepSeek Harness 怎么组装：注册挂在插件上、卸载即撤销；换提供方不动工具；拦截点是事件，守卫只能否决；profile 是一叠 patch，agent 循环也只是一行；作用域和预设让一个进程跑几套组合。每步配源码模版和实跑效果"
---

# 插件：连 agent 循环都是插件

pi 的扩展是挂在固定内核外面的工厂函数 `(pi) => void`：想收回注册的东西，得自己留着 `pi.on()` 返回的撤销函数，或者整体 reload[^pi]；循环、会话、工具注册表换不掉，一个进程只有一套组合。DeepSeek Harness 的底座是 Cordis 插件框架，没有特权内核，连 agent 循环都是插件，注册的东西卸载时由框架撤销。下面每节贴源码模版和用 dsh 自己的包跑出的效果，构造的插件和工具都注明了。

## 卸载就撤销：注册都挂在插件上 { #reversible }

**问题**：插件管理器关掉一行、配置热重载、agent 结束，都要把插件装进来的工具、提示词段、监听器收干净——漏一样，模型就还看得见已经卸掉的工具。

Cordis 里每个注册都是当前插件上的一个 effect：执行时交回撤销函数，插件卸载时框架按逆序全跑一遍。监听器这样挂：

```ts title="模版 · vendor/cordis/src/events.ts:245-260"
--8<-- "projects/deepseek-harness/assets/dsh-src/vendor/cordis/src/events.ts:245:260"
```

dsh 的工具注册表走同一条路：

```ts title="模版 · packages/core/tools/src/index.ts:1091-1095"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/tools/src/index.ts:1091:1095"
```

构造一个插件 `weather`，注册工具、提示词段、监听器和一个带清理的 effect，挂到真实的注册表上再卸掉：

```text title="效果 · 挂载和卸载一个构造的插件"
--8<-- "projects/deepseek-harness/assets/sim/plugin/txt/reversible.txt"
```

插件没写一行反注册代码，三样注册随卸载消失。

## 换提供方不动消费方：依赖到齐才启动 { #seam }

**问题**：约定、实现、给模型用的接口变化节奏不同，打包在一起，换实现就牵动接口。决策记录[^seams]原话：

> 把本地执行器换成沙箱化执行器时，模型看到的工具 schema 也会被搅动，尽管面向模型的约定从未改变。

dsh 把可替换能力（项目叫 seam）拆成三个角色，bash 是范本。**定义**是占住 `ctx.shell` 的抽象类：

```ts title="模版 · packages/shell/shell/src/index.ts:64-67"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/shell/shell/src/index.ts:64:67"
```

**提供方**继承它，沙箱版又继承本地版，多依赖两项沙箱服务：

```ts title="模版 · packages/shell/bash-local/src/index.ts:97-98"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/shell/bash-local/src/index.ts:97:98"
```

```ts title="模版 · packages/shell/bash-sandbox/src/index.ts:38-46"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/shell/bash-sandbox/src/index.ts:38:46"
```

**消费方**是 bash 工具，只声明要 `shell`：

```ts title="模版 · packages/shell/tool-bash/src/index.ts:33-34"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/shell/tool-bash/src/index.ts:33:34"
```

启停由 `inject` 决定：依赖缺一个就卸载自己，实现换了就重跑：

```ts title="模版 · vendor/cordis/src/fiber.ts:611-638"
--8<-- "projects/deepseek-harness/assets/dsh-src/vendor/cordis/src/fiber.ts:611:638"
```

写一个只 inject `shell` 的消费方，依次挂、卸、换提供方。提供方一是真实的 `LocalBashExecutor`；`DryRunBash` 是构造的，照沙箱版继承本地版、只改 `resolve`：

```text title="效果 · 消费方不改一行，跟着提供方启停"
--8<-- "projects/deepseek-harness/assets/sim/plugin/txt/seam.txt"
```

消费方代码没动：没有提供方时连监听器都没装上，换了提供方自己重新激活。默认挂的是沙箱版，换本地版只改配置一行（下一节实演）；`packages/ssh/` 的一组 SSH 提供方也靠换行把文件和进程搬到远端。

## 拦截点是事件：守卫只能否决 { #intercept }

**问题**：hook 若能改参数、靠注册顺序定结果，后注册的监听器就能把前面的拒绝翻回来，日志里记的调用也和实际跑的对不上。pi 的 `tool_call` 处理器能直接改 `event.input`；dsh 没开这个口子，改参数的方案还停在提案，要求日志、界面、执行三处同时改写。

dsh 的说法是「原生 hook 不是一个包」：hook 就是监听规范事件的普通插件。拦截用 waterfall——外层先跑，调 `next()` 交给里层，不调就短路：

```ts title="模版 · vendor/cordis/src/events.ts:224-243"
--8<-- "projects/deepseek-harness/assets/dsh-src/vendor/cordis/src/events.ts:224:243"
```

调用前的决定只有四种，没有改参数——参数已经记进日志、上了屏：

```ts title="模版 · packages/core/tools/src/index.ts:599-612"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/tools/src/index.ts:599:612"
```

waterfall 之后还有一层守卫，签名里没有「放行」：

```ts title="模版 · packages/core/tools/src/index.ts:724-732"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/tools/src/index.ts:724:732"
```

```ts title="模版 · packages/core/tools/src/index.ts:1512-1527"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/tools/src/index.ts:1512:1527"
```

在真实工具管线上构造工具 `rm_cache` 和三个插件：记日志的 `audit`、拒绝策略、插到最外层直接放行的 `allow-all`。拒绝先写成监听器，再写成守卫：

```text title="效果 · 同一个拒绝，两种写法"
--8<-- "projects/deepseek-harness/assets/sim/plugin/txt/intercept.txt"
```

第 4 步，`allow-all` 不调 `next()`，里层的拒绝连同 `audit` 都没跑；第 5 步写成守卫，翻不回来。硬禁令写守卫，waterfall 留给包装和可协商的策略；管线后几站和审批见[工具与安全边界](tools.md)。

## 组装是一叠 patch：agent 循环也只是一行 { #profile }

**问题**：启动器把组合写死，装一个树外插件（TUI、新的模型 provider）就得改仓库，第三方包也没处贡献默认组合。

profile 是 `$DSH_HOME/profiles/<名字>` 目录：一张组合包（bundle）清单，加用户自己的 `cordis.patch.yml`。随发行版带的模板：

```ts title="模版 · packages/boot/app-boot/src/profile.ts:178-195"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/boot/app-boot/src/profile.ts:178:195"
```

启动时从空列表起，依次叠组合包、profile patch、home patch、`--patch`。patch 按 id 找行、整体替换写到的字段，包名对不上就跳过：

```ts title="模版 · vendor/include/src/index.ts:109-123"
--8<-- "projects/deepseek-harness/assets/dsh-src/vendor/include/src/index.ts:109:123"
```

公共底座 `dsh-base` 开头写明了这套语义，agent 循环在里面是普通的一行：

```yaml title="模版 · packages/bundle/base/cordis.patch.yml:1-13"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/bundle/base/cordis.patch.yml:1:13"
```

```yaml title="模版 · packages/bundle/base/cordis.patch.yml:509-514"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/bundle/base/cordis.patch.yml:509:514"
```

`dsh --dump-config` 不启动，只调同一个叠加函数，打出来的就是会挂的。在临时 `DSH_HOME` 里真跑 `dsh --profile web --dump-config`，展开是 190 行顶层插件，每段标着来自哪一层：

```yaml title="效果 · web profile 展开后的三行"
--8<-- "projects/deepseek-harness/assets/sim/plugin/txt/dump-web-rows.txt"
```

再放一份构造的用户 patch：沙箱版 bash 换本地版，直接改 agent-loop 的包名，换人设：

```yaml title="构造的用户 patch · profiles/web/cordis.patch.yml"
--8<-- "projects/deepseek-harness/assets/sim/plugin/user.patch.yml"
```

```text title="效果 · 重新 dump 的告警和前后差异"
--8<-- "projects/deepseek-harness/assets/sim/plugin/txt/user-patch-diff.txt"
```

被改的行标上了来源，插入的行排在最后；改包名那条被跳过——同一个 id 不能偷换插件，想换循环就 disabled 这一行、insert 自己的。

循环插件占注册表里的工厂槽位，同时只能有一个：

```ts title="模版 · packages/core/agent/src/index.ts:205-206"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent/src/index.ts:205:206"
```

```ts title="模版 · packages/core/agent/src/index.ts:360-369"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent/src/index.ts:360:369"
```

```ts title="模版 · packages/core/agent-loop/src/index.ts:388"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/index.ts:388:388"
```

在真实的 `dsh-agent` 注册表上挂、卸一个构造的循环 `TinyLoop`：

```text title="效果 · 工厂槽位"
--8<-- "projects/deepseek-harness/assets/sim/plugin/txt/factory.txt"
```

能替换只在结构上成立：仓库只带 `dsh-agent-loop` 一个实现，目标续跑、Ralph 都做成循环之上的插件，见[多 agent 与长时工作](agents.md)。

## agent 作用域：同一进程里各 agent 看到的不一样 { #scope }

**问题**：一个进程里几个 agent 共享适配器、持久化和界面，人设、工具变体、监听器却只属于其中一个。全局一张注册表，专属工具就漏给别人；每个 agent 一整套服务，又把基础设施复制一遍。[^scope]

agent 对象本身就是作用域的 key：

```ts title="模版 · packages/core/agent-loop/src/agent.ts:130-131"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/agent-loop/src/agent.ts:130:131"
```

作用域是一个空插件加一个标签，经它注册的东西只对这个 agent 可见，也随它释放：

```ts title="模版 · packages/core/scope/src/index.ts:137-147"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/scope/src/index.ts:137:147"
```

注册表合并全局层和本 agent 层，同名的本层胜出；带标签的监听器只收本 agent 的事件；收窄工具只能对某个 agent 做：

```ts title="模版 · packages/core/tools/src/index.ts:1098-1109"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/tools/src/index.ts:1098:1109"
```

子 agent 就这样定制：同名段换人设，`restrict` 去工具，加一条委派说明：

```ts title="模版 · packages/subagent/subagent/src/child-agent.ts:204-218"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/subagent/subagent/src/child-agent.ts:204:218"
```

构造三个全局工具和三个 agent：child 走真实的 `applyChildComposition`，换人设、去 bash；other 注册自己的 `read`，再挂一个监听器：

```text title="效果 · 三个 agent 的视图"
--8<-- "projects/deepseek-harness/assets/sim/plugin/txt/scope.txt"
```

child 换了人设、少了 bash，多出的委派说明走运行时上下文、不进 system prompt（见[拼 prompt](prompt.md)）；other 的监听器只听见自己的调用；全局限制直接抛错；child 一释放，视图回到全局。作用域只管看得见什么，不管能做什么——决策记录明写「安全与权限是非目标」。

## agent 预设：一个进程跑几套组合 { #preset }

**问题**：启动时那份组合决定了 agent 的工具、人设、提示词段。要让跑分用的精简 agent 和完整的编码 agent 并存，就得开两个进程；在进程级配置里关几行工具，又会改掉所有会话。[^preset]

预设是一份插件清单，写法同 profile 的行。Web 默认带 standard、ptc、minimal、cordis 四套，minimal 这样写：

```yaml title="模版 · packages/bundle/web-app/presets/minimal.patch.yml:1-31"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/bundle/web-app/presets/minimal.patch.yml:1:31"
```

每套预设的每个修订版在进程里只常驻一份，有自己的作用域 key：

```ts title="模版 · packages/preset/agent-preset-registry/src/index.ts:103-122"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/preset/agent-preset-registry/src/index.ts:103:122"
```

agent 用作用域父链挂到它下面——注册向下继承，事件向上放行，兄弟预设互不可见：

```ts title="模版 · packages/preset/agent-preset-registry/src/index.ts:265-274"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/preset/agent-preset-registry/src/index.ts:265:274"
```

预设自带的服务（minimal 里的压缩、持久终端）必须放进独立的 isolate 命名空间，否则挂载被拒：

```ts title="模版 · packages/preset/agent-preset-registry/src/mount.ts:204-215"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/preset/agent-preset-registry/src/mount.ts:204:215"
```

注册表本身（加载 YAML、逐行审计）没整套跑；脚本用它底下的作用域父链和 isolate 搭两套构造的预设：standard 带 bash、web_fetch 和真实的本地 shell，minimal 只带 `DryRunBash`：

```text title="效果 · 两套预设、三个 agent"
--8<-- "projects/deepseek-harness/assets/sim/plugin/txt/preset.txt"
```

a1、a2 共用 standard 那一份，b1 只看得见共享的 `read`；两套预设各有 shell，根上没有。不 isolate，第二个 shell 就撞在根上——预设挂载拒绝的正是这种情况。

## 谁管什么 { #split }

- **程序**：注册即 effect，卸载按逆序撤销；`inject` 决定谁什么时候启动、重启；patch 的叠加顺序和整行替换；作用域的可见性和事件路由；守卫只能否决
- **模型**：默认不碰这一层，只看到组装的结果——工具表和提示词段，不知道背后是哪个提供方、哪套预设。只有 cordis 预设给了它插件管理工具，每次操作都要用户审批，或者会话本来就开着完全放开的权限
- **用户**：写 profile 和 home 的 `cordis.patch.yml`、命令行 `--patch`；在插件管理器里开关一行、装树外的组合包；在 Web 里给会话选预设

## 实跑原件 { #sim-files }

??? abstract "dsh --profile web --dump-config 全文"

    ```yaml
    --8<-- "projects/deepseek-harness/assets/sim/plugin/out/dump-web.yml"
    ```

??? abstract "dsh --profile sdk-minimal --dump-config 全文"

    ```yaml
    --8<-- "projects/deepseek-harness/assets/sim/plugin/out/dump-sdk-minimal.yml"
    ```

[^pi]: [pi 扩展文档](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md)与 [CHANGELOG](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)，经 Context7 读取，2026-10-20 读。
[^seams]: dsh 的决策记录[能力 seam——Service Definition / Service Provider / Consumer 角色](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/implemented/architecture/2026-06-13-capability-seams.zh.md)，2026-10-20 读。
[^scope]: dsh 的决策记录[agent 即注册作用域](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/archived/architecture/2026-07-08-agent-scope-contexts.zh.md)，2026-10-20 读。
[^preset]: dsh 的决策记录[会话的 agent 由一份 preset cordis.yml 组装而成](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/archived/architecture/2026-08-03-per-session-agent-presets.zh.md)，2026-10-20 读。
