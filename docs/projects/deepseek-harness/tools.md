---
description: "DeepSeek Harness 的工具与安全边界：先把命令关进内核沙箱跑，被拒了才让模型为这一条命令申请一次放宽；分清三种失败；守卫只能否决；权限记进日志再告诉模型；先读后改、大输出落盘。配源码模版和本机 Landlock 实跑"
---

# 工具与安全边界：先关进沙箱再问

pi 不弹权限框：工具以启动它的账户权限直接跑，要安全就放进容器，或者自己写扩展在 `tool_call` 上拦下来逐条确认[^pi-sec]。前一种全有全无；后一种每条都要用户判断，判断烦了就全局放开。dsh 把顺序倒过来：先把命令关进内核沙箱跑，真被拒了，模型才能为这一条命令申请一次放宽。沙箱部分在本机真跑（Linux 5.15，没装 bwrap，落到 Landlock）。

## 先关进沙箱：每次调用自带策略，没有后端就不跑 { #confine }

**问题**：首选的 bwrap 恰恰在最需要沙箱的主机上用不了——精简容器、禁用了非特权 user namespace、LSM 拒绝 mount。设计记录因此要求备选 runner 随 SDK 交付，不能假设主机已有。

`ctx.sandbox.confine(argv, policy)` 把要 spawn 的 argv 包一层交回，调用方拿它替换原 argv。策略跟着每次调用走：同一时刻 bash 可以按 read-only 跑，子 agent 按 workspace-write 跑。模式三档，**只管写**——读一律放行，网络不在词表里：

```ts title="模版 · packages/sandbox/sandbox/src/index.ts:24-30"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/sandbox/sandbox/src/index.ts:24:30"
```

每个平台一条后端链，同一份策略在三个平台翻成各自的参数：

```ts title="模版 · packages/sandbox/sandbox-local/src/index.ts:160-167"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/sandbox/sandbox-local/src/index.ts:160:167"
```

```text title="效果 · profiles.ts 对两档策略生成的参数"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/profiles.txt"
```

Landlock 这一档是仓库自带的约 300 行 C：给自己装上规则再 `exec` 目标命令，规则随 `execve` 继承。内核不支持就失败退出；旧 ABI 只能部分强制执行，照跑，但每次在 stderr 报一行：

```c title="模版 · native/system/packages/entry/src/main.c:285-298"
--8<-- "projects/deepseek-harness/assets/dsh-src/native/system/packages/entry/src/main.c:285:298"
```

本机是 ABI 1。装上真的提供方，看选中的后端和包装后的 argv：

```text title="效果 · landlock-run --probe"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/probe.txt"
```

```json title="效果 · 本机 confine() 的返回（工作区路径换成了 <ws>）"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/confine.txt"
```

同一个组合真跑几条命令，「模型拿到」是渲染给模型的原文：

```text title="效果 · workspace-write 下真跑"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/landlock-runs.txt:1:28"
```

```text title="效果 · 切到 read-only"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/landlock-runs.txt:46:57"
```

把启动器路径指到不存在的文件，本机一个后端都没有，`confine()` 直接抛错：

```text title="效果 · 没有可用后端"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/unavailable.txt"
```

## 被拒了才申请一次放宽 { #escalation }

**问题**：设计记录[^policy]的原话——「拒绝后没有升级路径就是死路：模型只能放弃，这会迫使运维人员全局配置 `workspace-write` 或 `danger-full-access`，从而使沙箱形同虚设。」

被拒时，结果末尾带两行标记：一行说被拒，一行提示可以原样重试一次。提示放在结果里，不靠模型记得工具说明——上面工作区外那条命令的最后三行就是：

```ts title="模版 · packages/sandbox/sandbox/src/escalation.ts:71-86"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/sandbox/sandbox/src/escalation.ts:71:86"
```

重试时 bash 多带 `sandbox_permissions`（要哪一档）和 `justification`（给用户看的理由）。档位只能往宽里走：

```ts title="模版 · packages/sandbox/sandbox/src/escalation.ts:28-31"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/sandbox/sandbox/src/escalation.ts:28:31"
```

```ts title="模版 · packages/sandbox/sandbox/src/escalation.ts:171-208"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/sandbox/sandbox/src/escalation.ts:171:208"
```

批下来的档只盖在这一次调用上，不写进会话策略：

```ts title="模版 · packages/shell/tool-bash/src/index.ts:478-487"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/shell/tool-bash/src/index.ts:478:487"
```

用真的审批服务跑各种回答，agent 和回答方是构造的：

```text title="效果 · approveEscalation 的九种情形"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/escalation.txt"
```

只有 `allowed-once` 放行；没人回答、回答方抛错、答了词表外的值，都按没有审批通道拒绝。

上游录过两段真会话：用户提示是构造的，明说要带放宽重试；模型回复是 `deepseek-v4-flash` 的真输出。用上游的快照测试重放，日志和仓库里提交的逐条对上：

<div class="grid" markdown>

```text title="效果 · 用户批准（日志摘录）"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/escalation-approved.txt"
```

```text title="效果 · 用户拒绝（日志摘录）"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/escalation-rejected.txt"
```

</div>

「必须先被拒过才能申请」只写在给模型看的参数说明里，代码不查，把关的是审批弹窗。

## 分清三种失败：启动器坏了、被拒、命令自己失败 { #failures }

**问题**：上游复盘 0004——旧 ABI 上启动器每次都打一行无害提示，规则若只是「带 `landlock-run: ` 前缀 + 非零退出 = 启动器坏了」，`false`、ripgrep 没匹配的退出 1 就全被报成沙箱不可用。

三种分开报：启动器失败说明命令没跑，抛 `SANDBOX_UNAVAILABLE`；被拒打上面两行标记；命令自己失败只报退出码。判启动器失败要三样证据同时成立——退出码在允许集合里（Landlock 只认 125）、按整行精确排除提示行、剩下某行带致命前缀。被拒按各后端自己的报错特征判：

```ts title="模版 · packages/sandbox/sandbox-local/src/index.ts:207-215"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/sandbox/sandbox-local/src/index.ts:207:215"
```

```ts title="模版 · packages/sandbox/sandbox-local/src/index.ts:233-242"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/sandbox/sandbox-local/src/index.ts:233:242"
```

```ts title="模版 · packages/sandbox/sandbox/src/diagnostics.ts:65-87"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/sandbox/sandbox/src/diagnostics.ts:65:87"
```

先判启动器失败，再判被拒：

```ts title="模版 · packages/shell/bash-sandbox/src/index.ts:115-124"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/shell/bash-sandbox/src/index.ts:115:124"
```

```text title="效果 · workspace-write 下真跑"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/landlock-runs.txt:30:44"
```

同一个分类函数，喂本机 `confine()` 返回的真规则，和照复盘构造的「只认前缀」规则对照：

```text title="效果 · classifyRunnerFailure"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/classify.txt"
```

## 工具管线：守卫只能否决，审批没答复就算拒 { #pipeline }

**问题**：扩展点能随意改决定和参数时，后注册的插件能把前面拒掉的调用改回放行；改了参数，日志里记的调用又和真执行的对不上。

一次调用依次过：`tools/pre-execute` 瀑布 → 守卫 → `tools/execute` 包装（超时、重试、计量）→ 工具体 → `tools/post-execute` → `tools/result`。前置决定只有四种，没有改参数——参数执行前已经记进日志、显示给用户了：

```ts title="模版 · packages/core/tools/src/index.ts:599-612"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/tools/src/index.ts:599:612"
```

守卫在所有监听器之后跑，只能返回拒绝理由：

```ts title="模版 · packages/core/tools/src/index.ts:724-732"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/tools/src/index.ts:724:732"
```

```ts title="模版 · packages/core/tools/src/index.ts:1512-1539"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/core/tools/src/index.ts:1512:1539"
```

审批服务把 `never` 判在派发前；回答方抛错或乱答，一律收成 `unavailable`：

```ts title="模版 · packages/interaction/user-approval/src/index.ts:267-293"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/interaction/user-approval/src/index.ts:267:293"
```

用真的工具注册表，注册一个构造的 `delete_path`，挂不同的监听器去删 `/etc/passwd`：

```text title="效果 · 七种挂法"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/pipeline.txt"
```

第 3 条：外层监听器不调 `next()` 就盖掉了里层的拒绝；第 4 条换成守卫，顺序就翻不了盘；第 5 条的参数是冻结的。

## 权限记进日志，原样告诉模型 { #policy }

**问题**：上游设计记录[^policy]里的实测——read-only 会话里 write、edit 的 schema 照样可见，「模型会声称自己能够写入，直到一次被拒绝的调用后才发现事实并非如此」。反过来，只读写成绝对化的声明，模型又直接用文字拒绝、一个工具都不调。

沙箱模式和审批策略各是一个只记日志的事件（`sandbox/mode`、`approval/policy`），三档预设是两个旋钮的组合：

```yaml title="模版 · packages/bundle/base/cordis.patch.yml:264-276"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/bundle/base/cordis.patch.yml:264:276"
```

每次请求从会话日志现算当前策略，渲染成一段话随运行时上下文发出（位置见[拼 prompt](prompt.md)）。read-only 那句叮嘱：别单凭策略就拒绝，照常调工具，按工具返回的提示走：

```ts title="模版 · packages/sandbox/sandbox-policy/src/index.ts:41-56"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/sandbox/sandbox-policy/src/index.ts:41:56"
```

```ts title="模版 · packages/sandbox/sandbox-policy/src/index.ts:155-171"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/sandbox/sandbox-policy/src/index.ts:155:171"
```

用真的会话，像用户在界面上切预设那样追加事件，每次重新组装：

```text title="效果 · 切预设时日志和模型看到的话"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/policy-context.txt"
```

策略只有日志一个来源，没有「上次告诉过模型什么」的进程状态，恢复、fork 之后权限跟着日志走。

## 先读后改，写入带版本 { #observe }

**问题**：进程内的 write、edit 不经过 argv 包装，内核沙箱管不到。模型可能改一个没读过的文件，也可能覆盖用户刚在编辑器里改过的版本。

观察策略记下每个会话读到的每个文件版本：没读过就 edit 或覆盖，拒；读过就带着版本号去写，期间文件被改过，拒：

```ts title="模版 · packages/fs/fs-observation-policy/src/index.ts:61-88"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/fs/fs-observation-policy/src/index.ts:61:88"
```

版本比对在提供方的文件锁里做；报给模型的话统一附上补救办法：

```ts title="模版 · packages/fs/fs-local/src/index.ts:214-223"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/fs/fs-local/src/index.ts:214:223"
```

```ts title="模版 · packages/fs/tool-fs/src/error.ts:21-34"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/fs/tool-fs/src/error.ts:21:34"
```

用真的工具和本地文件系统跑；假 agent、「用户中途改文件」是构造的：

```text title="效果 · 先读后改"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/fs-observe.txt"
```

## 大输出落盘，结果带标记 { #spill }

**问题**：抓回来的网页、几千行日志整段塞进下一次请求，可之后也许还要回头查。

落盘策略挂在 `tools/post-execute` 最外层：结果估算超过 `maxInlineTokens`（base 组合包是 12500）就把全文写进会话私有的文件，模型拿头尾预览加一句路径提示。`read` 自己不落盘，否则读落盘文件又会被落盘：

```ts title="模版 · packages/spill/spill-policy/src/index.ts:133-150"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/spill/spill-policy/src/index.ts:133:150"
```

```ts title="模版 · packages/spill/spill-policy/src/notice.ts:21-24"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/spill/spill-policy/src/notice.ts:21:24"
```

用真的落盘策略和本地存储跑一个吐 400 行日志的构造工具，上限设成 300 好放进页面：

```text title="效果 · 模型拿到的落盘结果（存储根换成了 <spill-root>）"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/spill.txt"
```

bash 另有一套标记：非零退出不算工具出错，只标退出码，由模型判断；前台超时默认不杀进程，转成后台任务，完成时再通知：

```ts title="模版 · packages/shell/tool-bash/src/render.ts:43-61"
--8<-- "projects/deepseek-harness/assets/dsh-src/packages/shell/tool-bash/src/render.ts:43:61"
```

```text title="效果 · render.ts 对几种构造的执行结果"
--8<-- "projects/deepseek-harness/assets/sim/tools/txt/render.txt"
```

## 两个可选项 { #optional }

- **PTC**（programmatic tool calling）：模型写代码批量调工具，代码跑在新起的 Node 子进程里，同样过 `confine()`（`packages/ptc-runtime/ptc-runtime-node/src/index.ts:219`），每次 `tools.x()` 重走整条管线（`packages/core/tools/src/ptc.ts:539-556`）
- **Auto review**：实验性，默认关。调用前让模型评一次风险，放行的以完全权限执行，被拒的转成问用户

## 这套边界管不到什么 { #scope }

- **上游自称未审计**：`SAFETY.zh.md` 写明沙箱「不保证隔离」
- **只限写**：读整个文件系统、访问网络都不拦
- **进程内的 write、edit 只有路径围栏**：源码注释自认是 containment、不是安全边界（`packages/fs/fs-sandbox/src/index.ts:10-18`）
- **旧内核管不全**：Landlock 在 ABI 3 之前不管 truncate

## 谁管什么 { #split }

- **程序**：沙箱包装、没后端就拒、失败分类、守卫和审批关死、从日志现算权限、先读后改、落盘
- **模型**：读结果里的标记；被拒后决定要不要带理由申请放宽，被用户拒了就停下解释
- **用户**：选预设，批或拒每一次放宽

## 实跑原件 { #sim-files }

??? abstract "沙箱组合真跑的完整输出（sandbox.mts）"

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/tools/out/sandbox.txt"
    ```

??? abstract "放宽申请九种情形的完整输出，含审计事件（escalation.mts）"

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/tools/out/escalation.txt"
    ```

??? abstract "上游快照测试重放三个放宽场景（replay.sh）"

    ```text
    --8<-- "projects/deepseek-harness/assets/sim/tools/out/replay.txt"
    ```

[^pi-sec]: pi 的[安全说明](https://pi.dev/docs/latest/security)和官网「What we didn't build」一节的 [No permission popups](https://pi.dev)，经 Context7 读取，2026-10-20 读。
[^policy]: dsh 的决策记录[当前沙箱策略上下文](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/.agents/notes/archived/feature/2026-07-30-current-sandbox-policy-context.zh.md)，2026-10-20 读。
