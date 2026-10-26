---
name: figma
description: "把 Figma 内容导入 HyperFrames composition —— 渲染出的素材、品牌 token、组件、分镜 section → 重建的运动（frame 被当作状态来读，而不是幻灯片）（REST/CLI）、有连接器时借助连接器获取的运动，以及来自连接器或原生导出的 shader。当用户粘贴一个 figma.com 链接，或要求把某个 Figma 设计、frame、logo、品牌或动画放进视频 / composition 时使用。"
---

**插件安装：** 当本 skill 位于 HyperFrames 插件内时，在执行安装或更新命令之前，先遵循 [插件执行规则](../hyperframes/references/plugin-installation.md)。独立安装则沿用下面的更新说明。

> **首先，保持本 skill 为最新 —— 运行前先征得用户确认：** `npx hyperframes skills update figma`。一切都是最新时它会快速空跑；否则它会刷新本 skill 以及它所依赖的核心领域 skill，然后你再依赖它们。

# Figma → HyperFrames

把用户的 Figma 作品带进一个 composition。**按能力拆分**（设计规范 §2）：

| 阶段 | 内容 | 传输方式 | 入口 |
| --- | --- | --- | --- |
| 1 | 静态素材 | REST | `hyperframes figma asset` |
| 2 | 品牌 token / 样式 | REST | `hyperframes figma tokens` |
| 3 | 组件 → HTML | REST | `hyperframes figma component` |
| 4 | 运动 → GSAP | 有连接器时用连接器 | 使用它的运动上下文 |
| 5 | Shader | 连接器 / 手动导出 | 用连接器，或用原生导出 |

凡是能用 REST 的地方都用 REST（能扛大批量、无需界面）。兼容的 Figma 连接器对运动和 shader 数据来说是可选的；没有连接器时，请用户提供原生导出。每条路径都会把素材冻结到本地，让渲染保持确定性。分镜重建是把阶段 1 的素材导出（REST）与 agent 驱动的 timeline 组装组合起来 —— 不需要连接器。已有的冻结素材、manifest 记录和绑定不受路由变化的影响 —— 这种拆分只改变下一次导入用哪个凭据。

## 认证 —— 两个凭据，各有范围

**预检 —— 在第一次调用 CLI 之前，检查 token 是否存在**：shell 环境变量（`[ -n "$FIGMA_TOKEN" ]`）**或**项目的 `.env`（CLI 会自动加载它 —— `.env` 里有这一项就算已配置）。两者都没有的话，**不要**为了拿到报错去跑命令 —— 先带用户走一遍一次性设置，然后停下来等待：

1. figma.com/settings → **Security** → **Personal access tokens** → Generate new token。
2. 权限范围 —— 这个集成永远只需要只读权限（它从不写入 Figma）：**File content: Read-only** + **File metadata: Read-only**。如果你要在非 Enterprise 方案上运行 `tokens`，再加上 **Library content: Read-only** —— 已发布样式的回退路径会访问 `/v1/files/:key/styles`，没有这个权限就会 403（旧版设置说明漏掉了这个权限）。可选加上 **Variables: Read-only** 以获取品牌变量 —— 仅限 Enterprise；没有它时 `tokens` 会自动降级为已发布样式（这是预期行为，不是错误 —— 要告诉用户）。现在 403 会点名确切缺少的权限；429 会自动重试（按分钟限流，遵守 `Retry-After`）。
3. 让用户在自己的 shell 配置文件或项目 `.env` 里设置 `FIGMA_TOKEN`；绝不要求他们把 token 粘贴到对话里。

引导设置时，顺带一口气把预期也讲清楚：每一次导入都会落成一个**带来源记录的本地冻结文件** —— 渲染时从不调用 Figma，重跑命令只会重新导入 Figma 里有变化的部分，而且一个 token 就能在其 Figma 账号可查看的所有文件上用于素材、品牌 token 和组件。

- **阶段 4–5（运动 / shader）：** 一个兼容的 Figma 连接器，它的授权与 token 分开。如果它不可用或未认证，请用户连接它或提供一个原生导出，然后停下。
- 准确说出失败的那个阶段需要哪个凭据 —— 绝不要把这种拆分说成是坏了。
- 流程中途出现 `BAD_TOKEN`（401）→ token 已过期 / 被吊销；重新生成。`FORBIDDEN`（403）→ 消息会点名确切缺少的权限（例如样式回退需要的 `library_content:read`）—— 加上它，否则就是这个文件对该账号不可见。`REQUIRES_ENTERPRISE`（变量接口返回 403）→ 不是失败：样式回退已经跑过了。`RATE_LIMITED`（429）→ 客户端已经带退避重试过了（这适用于**每一次**读取 —— 素材、token、样式、节点树、版本 —— 重试逻辑在共享的请求路径里；遵守 `Retry-After`，上限 60 秒）；如果仍然报出来，等一分钟，或者每次调用少导入一些节点。

**限流意识（规范 §2.1）：** 连接器的配额因 Figma 方案而异 —— 批量请求父 frame，除非被要求否则跳过核验截图，并缓存原始响应，这样重新推导时绝不会多花一次调用。REST 按分钟限流（每分钟 10 次以上，按接口分桶）—— 大批量没问题，遇到 429 就退避。

## 路由

用 `parseFigmaRef` 解析用户的 figma 链接（URL、`fileKey:nodeId`、单独的 `fileKey`）。然后按意图分流：

- "用这个图层 / logo / 图片" → **Asset**（CLI）
- "拉取我的品牌 / 颜色 / token" → **Tokens**（CLI）
- "用这个 frame 搭一个场景" → **Component**（CLI）
- "导入这段动画 / 运动" → **Motion**（有连接器时用连接器，见下文）
- 一个分镜 section / 由场景 frame 组成的胶片条 → **Storyboard**（见下文）
- shader 填充 / 效果 → **Shaders**（见下文）

**每一步都向用户讲清楚** —— 每条命令执行之前，说明你要从 Figma 拉取什么；执行之后，说明产物落在哪里（冻结路径 / 附属文件 / 组件目录）、composition 里改了什么，以及紧接着的下一步动作（预览、添加打印出来的变量、重新导入以链接绑定）。用户绝不应该需要问"成功了吗？"或"接下来呢？"。

## 素材（阶段 1 —— CLI）

```bash
hyperframes figma asset '<url-or-fileKey:nodeId>' [more refs…] [--format svg|png|jpg|pdf] [--scale 2] [--description "..."] [--entity "..."]
```

通过 REST 渲染，清理 SVG，冻结到 `.media/images/` 下，把带来源记录的条目追加进 manifest，重新生成 `.media/index.md`（共享的 media-use 清单），并打印一段 `<img>` 片段。按 `fileKey:nodeId:format:scale:version` 保证幂等。矢量 / logo 优先用 SVG（可缩放、可动画），追求位图保真时用 PNG `--scale 2`。**始终传 `--description "<what it is>"`**（它会成为清单行 + `<img alt>`）；对有名字的品牌标识加上 `--entity "<name>"`，这样之后 media-use 的 `resolve --entity` 能找到它们（entity 命中会跨 image/icon 匹配）。

**在一个请求里批量处理多个节点** —— 传入同一个文件的多个引用（空格分隔或逗号拼接）：`hyperframes figma asset 'KEY:1-2' 'KEY:3-4' 'KEY:5-6'`。它们会在一次 `/v1/images` 调用中全部渲染，这正是 figma 自己针对按分钟限流给出的方案 —— 拉取一整个 frame 的素材时，优先用它，而不是 N 条单独的命令。`--description`/`--entity` 会作用于批次里的每个节点，所以把用途相同的节点放进一批。无论如何，429 也都会带退避自动重试。

## Token（阶段 2 —— CLI）

```bash
hyperframes figma tokens <fileKey>
```

把变量导入为 composition 的品牌变量条目 + `figma-tokens.json` 附属文件 + 绑定索引记录（`.media/figma-bindings.jsonl`）。变量在上游受 Enterprise 限制：在其他方案上，这条命令会降级为已发布样式的元数据（值在导入组件时解析）。把打印出来的条目加进 composition 的 `data-composition-variables`。

**两者都需要时，先导入 token 再导入组件** —— 这样组件的颜色才能链接到品牌变量，而不是烘焙成重复的字面值。

**非 Enterprise 的变量路径（经过实测）：** REST 变量受 Enterprise 限制，但兼容的连接器可能提供变量定义。当 `tokens` 报出 `REQUIRES_ENTERPRISE` 而连接器可用时，取一次父场景的变量，把原始响应缓存到 `.media/figma-cache/`，并用它构建绑定索引。REST 节点树的 `boundVariables` 提供逐属性的 `VariableID`；按节点和属性把它们连接起来，然后写出 `.media/figma-bindings.jsonl` 行（`{kind:"binding", figmaId, sourceFileKey, compositionVariableId: "figma:<name>", version}`）以及 composition 变量条目。下游的一切（组件的 `var()` 解析、刷新、运行时 CSS 变量）都是现成的机制。向用户标明来源："token 通过 Figma 连接器获取 —— Enterprise 方案可以直接从 `hyperframes figma tokens` 拿到。"

runtime 会把每个声明过的 composition 变量定义为一个 CSS 自定义属性（文档根 + sub-composition 宿主），所以导入的 `var(--slug, literal)` 填充会在变量默认值改变时重新着色 —— 在 `data-composition-variables` 里改一个值，就能给每个导入的组件换上新品牌，什么都不用重新导入。`hyperframes render --variables '<json>'` 会在渲染时覆盖它们。

## 组件（阶段 3 —— CLI）

```bash
hyperframes figma component '<url-or-fileKey:nodeId>'
```

节点树 → 按 figma 精确几何尺寸生成的可编辑 HTML，打包成 `compositions/components/<name>/` 下的一个 registry 条目。矢量 / 布尔运算会通过阶段 1 的导出自动栅格化。绑定环节（规范 §7.1，只按 ID 精确匹配 —— 绝不按值匹配）：

- **静态保真自检（hero 内容必做）**：导入之后，渲染这个片段，并与 figma 自己的像素对比 —— `figma asset <same node> --format png` 就是基准真相。文字是已知的漂移维度：一个高度小于其 line-height 的 figma 文本框，是经过垂直裁切的边界（映射器会为这类文本框输出 `text-box-trim`；没有它时，在 70px 字号上测得的漂移约 6px）。如果对比显示出映射器没覆盖到的漂移，就报告出来 —— 不要悄悄手工微调这个片段。
- 绑定到一个**已导入** token 的填充 → `var(--slug, #literal)` —— 品牌刷新会传播过去。
- 绑定到一个**未知** token → 字面值 + `data-figma-unresolved` 标记。命令会告诉你；向用户提议：在源文件（或库文件）上运行 `tokens`，然后重新导入组件来链接它们。对每个未知的库，只问**一次**它是哪个文件 —— 绝不猜测，绝不按十六进制色值匹配。

## 运动（阶段 4 —— 借助连接器）

**使用信标：** 借助连接器的阶段没有 CLI 触点，所以在开始和结束时发出 skill 信标（匿名、需经同意、永不失败）：开始时 `npx hyperframes events --skill=figma-motion`，完成时 `npx hyperframes events --skill=figma-motion --event=skill_completed --outcome=success|error`。shader（`figma-shaders`）和分镜（`figma-storyboard`）同理。

没有对应的 REST 接口。有兼容的连接器时，用它，并把它的输出交给 `@hyperframes/core/figma` 里的纯函数辅助工具；否则请用户提供原生导出：

1. 用一次递归请求获取父 frame 的运动上下文，而不是每个元素请求一次。把原始 JSON 保存在项目旁边（`.media/figma-cache/`），这样重新转换不花任何代价。
2. 用 `@hyperframes/core/figma` 里的 `motionContextToDocs(rawResponse, { selectorFor, repeat })` 规范化成 `MotionDoc` —— **绝不手工抄写关键帧数值**。这个辅助函数机械地实现了经过实测的解码规则：它解析 motion.dev 片段（可靠的编码 —— CSS 片段会拉伸时长，而且可能不一致；它们被忽略），剥掉循环回绕的尾部关键帧（时间 ≈0.9999→1 处不到一毫秒的片段是循环的瞬间复位，不是作者写的运动 —— 回绕由 `repeat` 重新开始来实现），并原样保留贝塞尔 ease。`selectorFor` 必须返回阶段 3 组件导入时的 id —— 不要从节点名推导选择器。
   2b. **宣布完成之前先对照基准真相验证 —— 必做**：通过可用的连接器导出这组元素的根 frame，然后运行 `node <SKILL_DIR>/scripts/verify-motion.mjs --reference <export.mp4> --render <render.mp4> --crop WxH+X+Y` —— 它对比运动能量的增量（静态导入的保真度会被抵消掉），最小 motion-PSNR 低于 15dB 即判失败（已校准：忠实 ≈ 20+，偏离 ≈ 5）。`--crop` 要从渲染结果里卡片的实际边缘量出来，不要猜。FAIL 意味着要重新检查转换，而不是去改阈值。
3. `motionToGsap(doc)` → `emitTimelineScript(spec)` → 作为一个 `<script>` 注入到 GSAP + CustomEase 的 CDN 标签之后。暂停的、有限的，用一个字面键注册到 `window.__timelines` 上。
4. 无法转换的轨道（shader 驱动的、不支持的属性、复杂遮罩）→ 通过连接器导出，冻结 MP4，然后嵌入为 `<video class="clip">`。例外：shader 驱动的轨道 —— Figma 的导出路径会把 shader 压平成底色（见下面的 Shader 一节），所以在那里烘焙会悄无声息地丢掉 shader；改为请用户提供 Figma 原生导出。始终说明你走了哪条路径以及原因。映射集之外的具名 ease 会回退为 linear —— 映射表在 `motionEase.ts` 里；触发回退时要向用户标明。
5. 宣布完成之前运行 `npx hyperframes check`。

## Shader（阶段 5 —— 基本靠手动）

Figma 连接器的渲染路径不会执行 shader（它们会被压平成底色），而 shader 源码只有**发布到库的**样式才能拿到（需要付费的 Full 席位）。默认路径：请用户在 Figma 里原生导出 shader frame（PNG 或 Motion MP4），然后作为阶段 1 的素材 / clip 导入。不要尝试用连接器对 shader 做像素抓取 —— 它会悄无声息地产出错误的东西。

## 分镜（由场景 frame 组成的 SECTION → 动画）

**基本铁律：分镜里的 frame 是关键帧，不是幻灯片。** 包含同一个元素的两个 frame，描述的是这个元素随时间变化的状态 —— 在状态之间为这个**元素**做动画；绝不把这些 frame 当作一串静帧来播放。一个在连续四个 frame 里 y 值依次递减的 logo，是**一个**元素经过四个关键帧在上升。把分镜 frame 一张接一张地播放是失败模式；把它们所隐含的元素 timeline 重建出来才是工作。

分镜文件遵循一套可以机械解析的语法 —— 不要靠眼睛看，要解码：

1. **场景单元**：在 SECTION 内部，每一个 frame 尺寸的节点都是一个场景 —— 既包括具名的 FRAME，*也*包括松散的满画面 RECTANGLE（设计师会把静帧直接粘贴进 section）。按尺寸过滤（≈ composition 的宽高比，例如 >1400×900），而不是按节点类型或名字过滤。
2. **顺序 = x 坐标**（如果胶片条折行，则按行优先）。按 `absoluteBoundingBox.x` 给场景排序。
3. **对相邻 frame 做 diff，得到元素链** —— 动画就藏在这里。在连续的 frame 之间匹配子节点：先按**名字**（同名 = 同一个元素 → 在状态之间对它的相对 x/y/w/h 做 tween），再按**几何相似度**（尺寸相近 + 中心靠近 = 同一个逻辑元素，只是像素变了 → 在几何 tween 的同时，原地交叉淡化两张导出图；这能覆盖逐字打出的文字进展和变形状态）。没匹配上的子节点在所属场景的那一拍入场 / 出场。frame 的背景填充作为一条颜色轨道做 tween。每条链导出**一个**素材（只有在像素确实不同时才每个状态导出一个）—— 绝不每个 frame 导出一张静帧。
4. **静帧是兜底，不是默认** —— 只用于无法分解的 frame（没有共享元素的扁平满画面截图）；这些 frame 采用下面的 animatic 处理。
5. **导演批注**：胶片条下方的 TEXT 节点是运动意图，按 x 范围的重叠与对应的场景配对。它们描述的是*如何*做动画 —— 它们不是屏幕上的文案。
6. **批量导出**（元素或静帧）：`GET /v1/images` 接受逗号分隔的 id，但大的场景 frame 超过约 12 个 id 就会遇到 "Render timeout" —— 分块成每次调用约 4 个并带重试。（每个场景调用一次会浪费限流预算；26 个场景走单素材路径 ≈ 52 次调用。）
7. **批注动词 → 转场**（起步词汇，遇到新的就扩充）：

| 批注写着 | 做法 |
| --- | --- |
| EXPLOSION / BURST | 入场元素缩放约 1.5→1 + 淡入，`power3.out` |
| SLIDES / SLIDE TO THE… / SCROLL | 从那一侧边缘定向滑入 |
| MORPH / REVEALS | 交叉淡化 —— 如果运动发生在一个场景内部，则用阶段 3 导入 |
| CYCLE THROUGH / EACH ONE | 更长的停留 —— 如果条目在场景内部有动画，则用阶段 3 导入 |
| （无批注） | 交叉淡化 + 缓慢的 Ken-Burns 漂移 |

8. **静帧还是组件的路由**：描述场景*之间*运动的批注 → 在静帧上做转场（见上）。描述场景*内部*运动的批注（"TEXT LINES REVEAL ONE AFTER THE OTHER"、"PILLS ANIMATE IN"）→ 那个 frame 值得做一次阶段 3 的组件导入（真实元素），按批注做动画，而不是用一张扁平的 PNG。先用静帧做一遍 animatic，再升级批注特别点出的那些场景。
9. 用一条 `main` timeline 编排一切（每个场景在绝对时间上的 opacity/x/y）—— animatic 不需要每个场景单独一个 sub-composition。
10. **升级 —— frame 描绘的是同一个产品 UI → 重建这个应用，而不是做元素链。** 当每个 frame 都是同一个应用界面的连续状态时（一个注册流程、一个设置面板、一个播放器），元素链会把它做小了。把 UI 重建为活的 DOM —— 会改变状态的部分用阶段 3 的组件导入，静态的外框用真实导出的像素（**会变状态的写成代码，不变的冻结**）—— 并把每个 frame 之间的差异当作一次**要执行的交互**，而不是要套用的 tween：光标进入，点击控件，状态随之响应，界面像真实导航一样推入 / 滑动。结果读起来像一段连续的、可正常工作的应用录屏。这是把基本铁律在 UI 流程上贯彻到底；静帧 / 元素链的处理方式适用于那些不是同一个连贯应用的分镜。

## 确定性

绝不在 composition 里留下 Figma URL —— 先冻结。没有有限的根 `data-duration` 时，绝不输出 `repeat: -1`。timeline 必须是暂停的、有限的，`window.__timelines` 的键必须是字面值。所有 Figma I/O 都在导入时完成；渲染只看得到本地文件。
