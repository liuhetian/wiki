---
description: "DeepSeek Harness 拆解的维护记录：读的是 687f282（2026-10-20 读），MIT 许可、Landlock 启动器子包 BSD-3；存档和行号怎么对；六条线怎么实跑、密钥怎么隔离、模型用量多少，脚本附后"
---

# DeepSeek Harness 拆解的维护记录

这是 [DeepSeek Harness](../../projects/deepseek-harness/index.md) 背后的事。正常阅读不用看，要对照上游更新、核对出处、重跑实验时再看。

## 版本和素材 { #sources }

- **上游**：[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)，MIT 许可。`native/system/` 下的 Landlock 启动器子包是 BSD-3，两份许可都随存档放着
- **读的版本**：`687f282`（2026-10-17 提交，0.2.1-rc.2 发版合并），2026-10-20 读。各页不逐处标版本，上游更新了再对照这一个点
- **源码存档**：`assets/dsh-src/` 只存细讲页 `--8<--` 引到的文件，逐字未改，路径和原仓库一致。决策记录（原仓库 `.agents/notes/`）不存档：正文摘句，脚注钉这个 commit 的永链
- **行号**：模版标题里的 `路径:起-止` 是原仓库同版本的行号，存档逐字，两边一致
- **pi 的事实**：pi 官网和文档经 Context7 读取（2026-10-20）。压缩对照组照抄了 `@earendil-works/pi-coding-agent` 1.3.0（MIT）里的两段提示词
- **调研**：先派五个子 agent 分读插件、会话日志、工具与沙箱、多 agent、全部 prompt 文本，再按第一轮盘问定下的六条线各派一个子 agent 实跑、写初稿，主会话统一术语、审稿、写入口篇

## 实验设置 { #sim }

材料在 `assets/sim/<线>/`：脚本在目录根，`out/` 是原始记录，`txt/` 是页面上逐块引用的效果。

- **环境**：在 `/tmp` 克隆上游，`pnpm install --frozen-lockfile`（跳过 Electron 二进制）再 `pnpm run build`，Node 24.16、pnpm 11.28.5。脚本按绝对路径 import 克隆里的源码或构建产物，重跑前要先把克隆和构建恢复到同一个 commit
- **隔离**：跑 dsh 代码的进程一律 `env -i HOME PATH` 起，不带任何密钥。模型请求由另一个进程发，持有 key 的只有它：
    - `ds_call.py` 直接发请求体（拼 prompt 线）
    - `compaction/proxy.py` 和 `agents/relay.py` 是监听 `127.0.0.1` 的转发进程：dsh 拿一个假 key、把 `baseURL` 指到本机，转发进程换上真 key 经本站中转发给 DeepSeek
- **会话日志上传**：dsh 默认在请求体里带 `dsh_session_log`，三个调用脚本转发前都剥掉了，日志实际没有上传。dsh 只看到转发进程回了 2xx，照样在日志里记了 `session-log-deepseek/delivery-accepted`
- **模型**：全部 `deepseek-flash`，思考开、effort high，都是 dsh 的默认值；走 DeepSeek 的 Anthropic 兼容接口（`/anthropic/v1/messages`）
- **各线跑了什么**：
    - **插件**：Cordis、`dsh-scope`、工具注册表、agent 注册表直接从构建产物加载；`--dump-config` 在临时 `DSH_HOME` 里真跑。构造的：`weather` 插件、`rm_cache` 工具、三个拦截插件、`DryRunBash`、`TinyLoop`、三个 agent key、用户 patch。预设注册表本身没有整套跑
    - **会话日志**：dsh 的 agent 循环加仓库测试用的 MockAdapter 跑四轮；项目自带的 `request-reconstruction.spec.ts` 30 条全部通过。模型回复、崩溃时刻、replace、v0 快照的占位符替换都是构造的。`bash-tool-turn` 快照的 manifest 标着人手写的场景，只用来看事件顺序
    - **拼 prompt**：用项目的 Web 测试脚手架在进程内起真实组合，导出的 system prompt 和项目快照逐字节一致（5632 字节）；用到的 10 个 headless 快照回放全部通过。Web 的 e2e 回放没跑完：本机没有 musl-gcc，构建不出发行版的启动器，bash 被沙箱拒掉。构造的：两轮提问、时间读数、read 的结果、三份 AGENTS.md
    - **压缩**：dsh 自己的循环、压缩、裁剪、AGENTS.md 插件、read 工具和 DeepSeek 适配器真跑三遍。阈值从默认的 678,464 调到 15,000（第一遍 8,000），其余照 base 组合包；对话任务和三行 AGENTS.md 是写的。第二遍是试跑，原件没存档；页面用第三遍，「拒收」一段取自第一遍。超长后重试那一支没跑
    - **工具与沙箱**：Landlock 启动器用本机 gcc 编上游 `main.c`，产物不进仓库（`build-launcher.sh`）；沙箱、审批、工具注册表、观察策略、落盘都是真组合。构造的：审批回答方、`delete_path` 和 `fetch_log` 两个工具、「用户中途改文件」、落盘上限 300（默认 12500）、只认前缀的旧分类规则。三个放宽场景用上游快照测试重放。PTC、Auto review 没跑
    - **多 agent**：dsh 的 headless 入口真跑 fork、spawn 两组父子会话，第 1 轮发 dsh 的 `docs/architecture.md`，两轮指令是写的。构造的：各种结局的结算通知、委派深度、目标折叠日志、定时提醒、重复挂起。后台任务完成通知（函数没导出）、续跑驱动、权限判断、Workflow 没跑
- **用量**（token）：

| 实验 | 调用 | 未命中输入 | 命中缓存 | 输出 |
|---|---|---|---|---|
| 拼 prompt：两轮，第二轮按两种做法各发一次 | 4 | 28,910 | 34,176 | 821 |
| 压缩第一遍（阈值 8,000） | 17 | 50,672 | 55,040 | 29,355 |
| 压缩第二遍（试跑） | 13 | 45,886 | 89,984 | 13,660 |
| 压缩第三遍（正式） | 15 | 52,610 | 97,024 | 20,492 |
| 压缩对照组：pi 格式 | 2 | 约 11,600 | 0 | 约 4,800 |
| 多 agent：fork、spawn 两组 | 15 | 13,540 | 132,992 | 1,515 |

## 实跑脚本 { #scripts }

各线脚本清单：

- `plugin/`：`run.sh` 一键重跑；`reversible`、`seam`、`intercept`、`factory`、`scope`、`preset` 六个 `.mjs`；`resolve-hook.mjs` 让仓库外的脚本按包名解析到克隆里；`user.patch.yml` 是构造的用户 patch
- `log/`：`loop.ts`（四轮会话）、`surface.ts`、`crash.ts`、`fork.ts`、`migrate.ts`、`snapshot-events.py`
- `prompt/`：`dump/`（Web 测试脚手架导出组装结果）、`lab.ts`（只调 dsh 的序列化、SSE 解析和 AGENTS.md 渲染）、`run.py`（编排和调模型）、`extract.py`
- `compaction/`：`run.ts`、`proxy.py`、`hook.mjs`、`control.py`（pi 格式对照组）、`lab.ts`、`lab-texts.ts`、`extract.py`
- `tools/`：`build-launcher.sh`、`sandbox`、`profiles`、`escalation`、`pipeline`、`policy-context`、`fs-observe`、`spill`、`render` 九个 `.mts`，`lib.mts`、`replay.sh`、`events.py`
- `agents/`：`run.sh`、`relay.py`、`lab.ts`、`analyze.py`；重跑 `lab.ts`、`analyze.py` 前先把 `out/sessions/*.zstd` 解压

??? abstract "ds_call.py：把请求体发给 DeepSeek，剥掉 dsh_* 字段"

    ```python
    --8<-- "projects/deepseek-harness/assets/sim/ds_call.py"
    ```

??? abstract "agents/relay.py：持有 key 的本机转发进程"

    ```python
    --8<-- "projects/deepseek-harness/assets/sim/agents/relay.py"
    ```

??? abstract "compaction/proxy.py：持有 key 的本机转发进程，顺带记录用量"

    ```python
    --8<-- "projects/deepseek-harness/assets/sim/compaction/proxy.py"
    ```

??? abstract "compaction/control.py：pi 格式的对照组"

    ```python
    --8<-- "projects/deepseek-harness/assets/sim/compaction/control.py"
    ```

??? abstract "plugin/run.sh：插件线一键重跑"

    ```bash
    --8<-- "projects/deepseek-harness/assets/sim/plugin/run.sh"
    ```
