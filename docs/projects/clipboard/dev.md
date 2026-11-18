---
description: "牛牛便利贴的开发说明：一次请求从静态文件到边缘函数怎么走、代码地图、怎么跑测试、EdgeOne 平台和数据上的坑、加一页文档要同步的三处"
---

# 开发

**改功能之前先读[需求](requirements.md)**：每个功能该是什么样、每条规则是什么，以它为准，改了行为要同步改它。目录结构和每个设计决定的理由在仓库根 `README.md`（「目录」「几个决定」）。这里只写一次请求怎么走、去哪找代码、会踩什么。

## 架构

**静态文件优先，没有静态文件的路径才落到边缘函数。** 静态文件由平台直接给，不经过我们的代码，所以页面、前端脚本和文档页都不验密码；要保护的数据都只能从 `/api/` 拿。一个请求按下面的顺序找到归宿：

| 路径 | 谁答 | 说明 |
|---|---|---|
| `/assets/*`、`/wiki/x/` 等有文件的路径 | 平台直接给静态文件 | 来自 `build/dist/` |
| `/api/*` | 边缘函数 | 只有一个入口，放在 `edge-functions/` 最顶层，接住所有没有静态文件的路径；`src/server/edge.ts:33` 按路径分发到 `app` |
| `/wiki/<页>.md` | 同一个边缘函数 | 分发到 `wiki`；`.md` 不上传成静态文件，才轮得到函数 |
| 其余（`/share/…` 等） | 同一个边缘函数回首页 | `src/server/edge.ts:28`，首页是构建时打进包里的；前端读完路径就把网址改回 `/` |

接口内部一层层往下（`src/server/app.ts:23` 起）：

1. 跨域：只读 GET 对所有来源开放
2. 响应默认 `no-store`
3. 检查环境变量，建好这次请求的 `ctx`（元素存储、文件存储、「响应发出后接着做」）
4. 不用登录的路由：登录、退出、名字列表、定时清理（`src/server/routes/auth.ts`）
5. `requireAuth` 认出是谁（`src/server/auth.ts:45`），之后才是白板、元素、文件、快捷指令、AI 的路由
6. 路由只取参数、回状态码，规则都在 `src/server/services/`
7. services 读写两种存储：元素在 EdgeOne Blob（`src/server/repo/db.ts`），文件在 COS（`src/server/storage/files.ts`）

**文件不经过函数**：上传是浏览器拿预签名地址直接 PUT 到 COS，显示和下载是 302 到 COS 的临时地址。只有要读像素的地方走 `?raw=1` 由本站转发（`src/server/routes/files.ts:28`）。

### 后台在做的事

- **每天 04:00 的定时任务**只推一批清理（`src/server/services/cleanup.ts:20`，一批 15 个元素）。剩下的由页面打开时接着调（`src/web/state/cleanup.ts`，每台设备每天一次）
- **响应发出后接着做**：`ctx.defer` 包的是平台的 `waitUntil`（`src/server/edge.ts:22`），失败只记日志
- **接口失败自动上报**（[需求](requirements.md)「失败上报」）：前端所有接口调用都过 `apiFetch`（`src/web/api/client.ts:45`），5xx 和网络不通记在本机，下一次请求成功时报给 `POST /api/faults`，在故障白板上建一张便利贴（`src/server/services/faults.ts:19`）。它在 react-query 的 `retry: 1`（`src/web/main.tsx:11`）下面，重试救回来的那次也记得到

### 容易忽略的行为

- **读白板会写**：`listItems`（`src/server/services/items.ts:194`）顺手把到期的挪进废纸篓、把「上传中」且文件已到的转成正式卡片，一次最多 2 个。备份、AI 读白板、冒烟都会触发
- **快捷指令传文件是先建元素后传**：`/api/share/file` 先存一个 `pending` 的元素再回上传地址（`src/server/routes/share.ts:56`），文件到没到要等下一次读白板才知道
- **聊天记录压缩包是在读白板时拆的**（快捷指令传来的）：拆包失败不抛错，退回成普通文件卡片（`src/server/services/intake.ts:26`），否则下一轮同步会再拆一遍
- **`/api/cron/cleanup` 不用登录**：只做清理，谁调都无害（`src/server/routes/auth.ts:25`）
- **AI 的密码是在 `requireAuth` 里按路径前缀拦的**（`src/server/auth.ts:62`），不是按路由：AI 入口下新挂的路由自动对 AI 的密码开放，包括复用的上传和下载
- **直接 `fetch` 本站接口要用 `apiFetch`**，不然失败记不到。`<img src>` 加载的图片和 COS 直传失败都记不到
- **故障白板是系统白板**（`src/shared/constants.ts:4`）：和废纸篓一样不能删、改名、往上贴；老数据里没有时，第一次读白板列表补上（`src/server/repo/db.ts:24`）。一次上报只读一遍整块白板，挑最早的删、挑空位都用这一份，约 55 个请求
- **`npm run dev` 的 `/api` 连的是线上**（`vite.config.ts:11`）

## 代码地图

| 要找什么 | 在哪 |
|---|---|
| 数据模型、请求体校验 | `src/shared/schema.ts` |
| 上限和常量：一次读几个、白板上限、文件大小、保留时长 | `src/shared/constants.ts:41` 上下 |
| 元素的基础字段和合并规则，前后端共用 | `src/shared/items.ts:19` |
| 便利贴里的引用怎么解析、增删 | `src/shared/refs.ts:25` |
| 存储里的对象布局 | `src/server/repo/db.ts:1` |
| 一次读多个元素（先读一个再并发） | `src/server/repo/db.ts:63` |
| 提醒索引跟着元素写入同步 | `src/server/repo/db.ts:102` |
| 新建、白板满了拒绝 | `src/server/services/items.ts:73`、`:43` |
| 改元素、文字冲突、「原文换新文」 | `src/server/services/items.ts:110`、`:96` |
| 删除进废纸篓、废纸篓修剪 | `src/server/services/items.ts:146`、`:238` |
| 文件变成什么卡片、聊天记录拆包 | `src/server/services/intake.ts:39`、`src/server/services/chat.ts` |
| 新元素自动挑空位 | `src/server/services/place.ts` |
| 接口失败的记录和上报、故障白板 | `src/web/api/client.ts:45`、`src/server/services/faults.ts` |
| 地图 App 的分享链接解成坐标 | `src/server/services/maplink.ts`、`src/shared/geo.ts` |
| 身份：cookie、`密码#名字`、AI 密码的范围 | `src/server/auth.ts:45` |
| 给 AI 的入口，能调的全列在这 | `src/server/routes/ai.ts:24` |
| `/wiki/<页>.md`：原文、占位符替换 | `src/server/wiki.ts:21`、`src/server/md-render.ts` |
| COS 签名 | `src/server/storage/cos-sign.ts` |
| 前端写操作的唯一入口（乐观更新、回滚、撤销） | `src/web/state/actions.ts:40` |
| 前端同步：比 etag、什么时候拉 | `src/web/state/queries.ts:84` |
| 每种卡片能做的事，加新类型从这开始 | `src/web/features/items/itemActions.ts:15` |
| 边缘函数怎么打包 | `scripts/build-edge.ts` |
| 文档站怎么构建、怎么进 `build/` | `deploy.sh`、`scripts/build-docs.ts` |
| 部署相关的固定名字（项目、域名） | `scripts/lib/config.ts:7` |

## 测试

```bash
npm run typecheck
npm test            # vitest，约 110 个用例，不到 1 秒
```

- **测试不连线上**：两种存储都是内存替身（`tests/helpers.ts`），接口直接 `app.request()`；前端的失败记录换掉 `localStorage`、`fetch` 在 node 里跑（`tests/faults-client.test.ts`）
- **要有兄弟目录 `../test-wiki`**（或设 `WIKI_ROOT`）：占位符的共享用例从那里读（`tests/placeholders.test.ts:10`），没有就失败
- **测不到的**：平台的请求额度、真实的 COS 签名、前端界面。这些只有 `npm run smoke` 在线上验，它会写线上数据，见[运维 · 命令](ops.md)
- 新功能简要测即可，不求面面俱到（`plan.md` 定的做法）

## 平台的坑 { #platform }

都是线上实测出来的，本地和测试里复现不了。

- **一次执行大约只能发 62 个请求**（实测 62～64 浮动），读一个元素算一个，超了存储报错。白板上限 50、读白板顺手只做 2 件事、清空废纸篓每次 6 个、清理每批 15 个，全是从这个数倒推的。要加「读的时候顺手做」的事，先数额度（`src/shared/constants.ts:41`）
- **新建的 store 没凭据时并发读，每个读各换一次凭据**，一个元素算两个请求。所以 `getItems` 先单独读一个再并发（`src/server/repo/db.ts:63`），别改回纯并发
- **`BOARD_MAX` 不能大于 `BATCH`**：读白板要一次读完
- **545（响应体是平台的 `Error return from script`）是冷启动被平台掐掉**，跟读多少个、碰不碰存储无关：不读存储的 `/api/names` 一样出，同一批节点上 8 KB 的函数（eo-lock）一次不出，545 全落在最慢的那批冷启动里。冷启动的 CPU 花在解析和执行函数包上，所以**函数包要小**：包里的代码超过 350 KB 构建就失败（`scripts/build-edge.ts:42`；打进来的文档原文和首页是文字，不拖累冷启动，不算）。2026-11-17 实测：包 641 KB 时「静默 30 秒再并发 6 个」一次 24% 失败、一次 1%，起伏很大（可能跟刚部署完没有编译缓存有关，没核实）；改到 291 KB 后同样测法 0/72，钉住两个节点各连发 200 次 0 个（改前 14 个），冷启动那批请求快了 60～90 ms
- **存储偶尔个别请求 504**，和读多少个无关。别在读失败时做不可逆的事；页面下一次同步会再读，失败会报到故障白板
- **函数按文件夹分配请求**：`edge-functions/api/` 下的入口只收得到 `/api/...`，`/wiki/x.md` 没有静态文件也到不了它。一个入口要接住所有路径，放在最顶层 `edge-functions/[[default]].js`。2026-11-18 实测：有静态文件的路径（页面、脚本、文档页、`edgeone.json` 的 301）照样由平台直接给，不进函数；没有静态文件的全部进函数，排在 `edgeone.json` 的 rewrite 前面，所以前端路由要函数自己回首页，原来那条 `/* → /index.html` 走不到，已删。函数读不到本站的静态文件，首页由 `scripts/build-edge.ts` 打进包里，`build:edge` 必须在 `build:web` 之后跑。用 `edgeone.json` 的 rewrite 把 `/wiki/*.md` 转给 `/api/` 下的入口不行：规则命中了，但只去找静态文件，回平台自己的 404 页
- **平台把 `edge-functions/` 下的入口拼进同一个脚本，每个请求都把命中的那个入口整包的顶层代码重跑一遍**（edgeone CLI 1.7.2 的源码，构建日志里 `Compiled edge functions` 那一步）。同一个包放 `/api/`、`/wiki/` 两个入口就是两份拷贝，冷启动两份都要解析（本机照这个方式模拟：两份 53 ms CPU，只留一份 42 ms），所以只放一个；模块顶层的变量活不过一个请求。包里的 `fetch` 是平台按请求给的（`hookCtx.fetch`），别把建好的 app 挂在 `globalThis` 上跨请求复用
- **函数请求自己的域名被平台回 404，请求本站的静态文件回 502**。所以清理没法自己接力，要靠定时任务和页面一次次调；文档原文要打进函数包；占位符背后的接口在进程内调（`src/server/wiki.ts:42`）
- **静态文件盖住函数**：`.md` 一旦传上去，`/wiki/x.md` 就不再走函数。`scripts/build-docs.ts:11` 复制时排除了 `.md`
- **`/wiki/x` 不带斜杠时平台直接给页面、不跳转**，页面里的相对地址全部解析错。每页要一条 301
- **`edgeone.json` 的 headers 规则会盖掉函数自己设的响应头**。`/wiki/*` 的 `no-store` 在 `edgeone.json:18` 和 `src/server/wiki.ts:49` 各写了一遍，两处要一致：带密码读到的是真实数据，不能进缓存
- **平台按字面扫描函数入口**：压缩后的 `export{X as onRequest}` 认不出来，`scripts/build-edge.ts:37` 改写成函数声明。平台的函数包上限是 5 MB，我们自己给代码定的预算是 350 KB
- **边缘运行时的 `URL`、`URLSearchParams` 不全**，现成的签名库跑不起来，COS 签名是手写的
- **边缘运行时一次读不下几 MB 以上的响应**（报 OverSize）：`read` 每次只取 4 MB 再拼（`src/server/storage/files.ts:83`）。聊天记录压缩包超过 10 MB 不拆，是内存装不下
- **边缘节点连不上 OpenStreetMap**：地图缩略图和地名由浏览器取，后端不碰地图服务
- **定时任务最小间隔一天**：提醒只能由开着的页面自己计时
- **没换云函数**：实测云函数没有请求额度的限制，但每个请求慢一倍、冷启动 2～3 秒、往外回数据只有约 170 KB/s

没核实的两件：`waitUntil` 里的后台任务是否占同一份请求额度（`plan.md`）；平台按什么标准掐冷启动 —— 文档写的是一次执行 CPU 200 ms，线上看不到每次用了多少。

## 数据和代码上的坑

- **不做旧数据兼容**：改了 `src/shared/schema.ts` 里元素的必填字段，上线前要清库，见[运维 · 备份和清库](ops.md)
- **没有事务**：换白板是先写新位置再删旧位置，中途失败会短暂多一份。并发时谁盖谁的规则见[需求](requirements.md)「同步与并发」
- **改元素只覆盖带来的字段**，合并规则只有 `src/shared/items.ts:19` 一份，服务端存和前端先改界面都用它。在别处另写一份，界面和存下来的就会不一致
- **`by`、`editedAt` 只在新建和改内容时更新**（[需求](requirements.md)「元素」）：AI 读白板按 `editedAt` 排序靠的就是这条，新加的写操作别顺手更新它
- **聊天记录压缩包在白板快满时拆包可能超出请求额度**，这一点没处理
- **zod 只能写成 `import * as z from 'zod'`**：写成 `import { z }`，esbuild 会把整个命名空间连同几十种语言的报错文案打进函数包（zod 443 KB，整包 641 KB；改了以后 94 KB、291 KB），冷启动慢一截。写回去整包会超过 350 KB 的预算，构建失败并列出 zod 占多少
- **路由别叫 `index`**：`hono/client` 把它当成这一层的根路径（`src/server/routes/items.ts:16`）
- **`tsx` 不认 `?raw` 导入**：`scripts/` 下的脚本别间接引到 `src/server/wiki.ts`（也就是别引 `edge.ts`）。`?raw` 在打包时由 `scripts/build-edge.ts:7` 的插件处理，测试里由 vitest 处理
- **`src/server/md-render.ts` 是从 test-wiki 原样抄来的**：要改先改那边和共享用例，再抄过来
- **仓库里没有 ESLint**，只有 `tsc`

## 改文档 { #wiki }

`docs/` 构建成 `/wiki/` 下的静态站给人看；同一路径的 `/wiki/<页>.md` 由边缘函数返回原文，占位符换成实时数据，给 AI 读。

**加一页 `.md` 要同步三处**，漏了测试或构建会失败：

1. `src/server/wiki.ts:21` 的 `PAGES` 加一行 —— `tests/ai-docs.test.ts:31` 核对 `docs/` 里的 `.md` 都在
2. `edgeone.json` 的 `redirects` 加一条 `/wiki/x → /wiki/x/` 的 301 —— `scripts/build-docs.ts:16` 核对
3. `zensical.toml` 的 `nav` 加一行 —— 主 wiki 收录时照它排顺序

其他规矩：

- **`index.md` 是项目入口**，[requirements.md](requirements.md) 正文归用户管、不代改，给 AI 的接口说明是 [ai-api.md](ai-api.md)。接口报错里指的、页面 i 按钮里写的都是 `/wiki/ai-api.md`，改文件名要一起改（`src/server/auth.ts:62`、`src/server/routes/ai.ts:66`、`src/web/features/dialogs/Guide.tsx`、`scripts/smoke.ts`）
- **`docs/javascripts/live.js` 是构建时从 test-wiki 复制来的**，不进 git，别在这里改
- **`docs/.meta.yml` 是给主 wiki 用的接口地址**，本站用不上，别删
- 本地只构建文档站：`./deploy.sh`，产物在 `site/`，会报出失效的相对链接

### 占位符

文档里可以放实时数据，打开网页或读 `.md` 时才换成真实值。现在只有接口说明里的白板列表一处：

```markdown
{{ api("/api/ai/boards").names }}
```

- **省着用**：一页里所有占位符读存储的次数，都算在读这页 `.md` 那一次函数执行的额度里。**别引用读整块白板的接口**
- 只能取单个值；要列一组，让接口返回拼好的字段（`names` 就是为此加的，`src/server/routes/ai.ts:28`）
- 没登录、没带密码时显示「加载失败」，正文里要写明带密码再读
- 代码块和行内代码里的不替换，用来写示例；占位符别放进标题
- 新增之前先读 `src/server/wiki.ts` 开头的注释
