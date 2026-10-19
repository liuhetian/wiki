<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/media-use/references/telemetry-dashboard.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# media-use 使用情况仪表盘

media-use 使用情况仪表盘的可复现定义。这个仪表盘利用 `scripts/lib/telemetry.mjs` 已经发出的遥测数据，回答"media-use 用得有多少、用来做什么、复用是否奏效、有什么需求它满足不了"。在有权限的 HyperFrames 分析项目里构建它；这份文档是事实来源，以便随时能够重建。本地的补充：`resolve --stats`（回答同样的问题，数据来自 `.media/` + `~/.media`，不需要仪表盘访问权限）。

## 身份（见 `scripts/lib/telemetry.mjs`）

事件归属于**与 hyperframes CLI 和 studio 相同的人** —— 即 `~/.hyperframes/config.json` 里共享的安装 id（`anonymousId`），在登录时与 HeyGen 账户关联起来（`$identify`，`distinct_id` = 邮箱/用户名）。按设计并非完全匿名；登录前是假名的，登录后关联到账户。`$ip:null`。退出：`HYPERFRAMES_NO_TELEMETRY=1` / `DO_NOT_TRACK=1`（在 CI、开发环境中也关闭）。

## 事件目录（已确认在项目中存在）

每个事件都带 `surface: "media-use"`。事件的**属性都是粗粒度的** —— 绝不包含意图文本、文件名或路径。

| 事件 | 触发时机 | 关键属性 |
| --- | --- | --- |
| `media_use_resolve` | 产出/返回了一个素材的 resolve | `type`、`source`、`provider`、`via`、`local_only`、`provider_override` |
| `media_use_resolve_miss` | 什么都没找到的 resolve | `type`、`local_only`、`provider_override`（不含意图） |
| `media_use_candidates` | `--candidates` / `--dry-run` 列表 | `type`、计数 |
| `media_use_doctor_run` | `--doctor` | `ok`、`checks_failed`、`failed[]` |
| `media_use_compare` | `grade-compare` / `compare` | `command`、`cells`、`truncated`、`total`、`render_ready_timed_out` |
| `media_use_transcribe` · `media_use_duck` · `media_use_transcript_cut` | 音频引擎操作 | 各操作专用 |

## 仪表盘图块

1. **调用量** —— `query-trends`，`media_use_resolve` 随时间的计数（按天）。"有多少。"
2. **按媒体类型** —— `media_use_resolve` 按 `type`（bgm/sfx/image/icon/logo/voice/grade/lut）拆分。"用来做什么。"
3. **Resolve 命中率** —— 趋势公式：`A / (A + B)`，其中 A = `media_use_resolve`，B = `media_use_resolve_miss`。"目录是否覆盖了需求。"
4. **提供方构成** —— `media_use_resolve` 按 `provider` 拆分；再加一个按 `via`（`url` / `params-fallback` / `params`）拆分的图块，用来抓出 CDN→params 的 LUT 降级。
5. **高频未命中** —— `media_use_resolve_miss` 按 `type` 拆分（这是调优信号 —— 与本地 `resolve --stats` 配合着看，后者还会显示遥测有意省略的未命中*意图*）。
6. **Doctor 健康度** —— `media_use_doctor_run` 按 `failed[]` 拆分（哪项依赖检查失败最多）+ `checks_failed` 分布。
7. **Compare 开销** —— `media_use_compare` 按 `command` 拆分，外加 `truncated` / `render_ready_timed_out` 的比率（在取消 16 格上限之前先观察）。
8. **采用情况（可选）** —— 如果 `first_run` 属性上线了（计划 U5），把 `media_use_resolve` 按首次运行 vs 重复运行分段。

## 在分析仪表盘中重建

对于每个图块，先确认事件/属性 schema，构建它的趋势或拆分，然后把它加到仪表盘上。名字保持以 `media-use:` 为前缀，这样仪表盘可以被 grep 到。跨界面说明：由于身份与 CLI/studio 共享，你也可以按同一个人跨 `cli_command*` 和 `studio:*` 事件拆分这些数据。
