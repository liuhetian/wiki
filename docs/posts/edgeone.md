---
description: "EdgeOne 不只是 CDN：一半是挡在你服务器前面的加速和防护，一半是连服务器都替你出的托管平台 Makers，静态文件、边缘函数、云函数、存储都在里面；逐样对上自己搭一套时的 nginx、后端进程、Redis、对象存储，再讲和自己起服务差在哪、什么情况用哪一半"
---

<figure markdown>
![EdgeOne 的两半：安全加速挡在你的服务器前面，Makers 没有服务器、平台就是源站](assets/edgeone/two-halves-infographic.png)
</figure>

# EdgeOne 不只是 CDN：加速防护和免服务器托管装在一个产品里

把 EdgeOne 当成「加强版 CDN」只对了一半。它有两半，区别在**源站是谁的**：

- **安全加速**：服务器是你的，EdgeOne 挡在前面做缓存、加速、防攻击 —— 这一半是 CDN 的加强版
- **Makers**（英文文档叫 Pages）：没有你的服务器，文件和代码交给平台，平台自己就是源站 —— 这一半是托管平台，和 Vercel、Cloudflare Pages 是一类东西

官方的说法是「一站式边缘安全加速平台」，列出来的能力有动静态 CDN 加速、DDoS 防护、Web 防护、Bot 管理、四层代理、边缘函数、Makers、媒体服务、DNS 记录管理[^overview]。本站只用过 Makers 这一半，下面讲得细的也是这一半；安全加速那一半只照文档讲它是什么。

## 两半各是什么

```text
                     ┌─ 安全加速：你有服务器，它站在前面
                     │    缓存与加速 / DDoS、WAF、Bot / 四层代理（TCP、UDP）/ 规则引擎
EdgeOne（边缘节点）──┤
                     │
                     └─ Makers：没有服务器，它就是源站
                          静态文件 / 边缘函数 / 云函数 / KV、Blob 存储 / 域名与证书
```

**安全加速**要先把域名接进来：改 NS 把整个域名的解析交给它，或者每个子域名加一条 CNAME[^access]。接进来以后，请求先到边缘节点，静态内容从节点的缓存里给，动态请求由它转回你的服务器，恶意请求在节点上就拦掉。

**Makers** 不用源站：传一个目录上去，里面的静态文件由平台直接给，`edge-functions/`、`cloud-functions/` 下的文件按路径变成接口。域名、证书、存储都在平台里配。

## 逐样对上自己搭的一套

<figure markdown>
![Makers 里带的东西：静态文件托管、边缘函数、云函数、路由、KV 存储、Blob 存储、域名与证书](assets/edgeone/makers-parts-infographic.png)
</figure>

自己在一台服务器上搭网站，要凑齐下面左边这些；用 Makers，右边每一样平台都带了：

| 自己搭 | Makers 里对应的 | 差别 |
|---|---|---|
| nginx 给静态文件 | 静态文件托管 | 平台直接给，不经过你的代码 |
| 后端进程（FastAPI、Express） | 边缘函数、云函数 | 没有常驻进程，有请求才启动，跑完就没了 |
| nginx 的 `location`、`rewrite` | 文件路径即路由，加 `edgeone.json` | 路由是平台的，不是你写的 |
| Redis | KV 存储 | 没试过 |
| 磁盘、对象存储 | Blob 存储 | 匿名读不到，只能经函数读 |
| certbot、备案域名的解析 | 绑域名、免费证书自动续 | 中国大陆加速必须绑已备案的域名 |
| CDN | 本来就在边缘节点上 | 不用另接 |

函数有两种，差在跑在哪[^functions]：

| | 边缘函数 | 云函数 |
|---|---|---|
| 跑在哪 | 边缘节点 | 云端的服务器 |
| 运行时 | 平台自己的 Edge Runtime，只有 Web 标准接口 | Node.js、Python、Go |
| 冷启动（文档） | 毫秒级 | 百毫秒级 |
| 限制 | 一次执行 CPU 约 200 ms、函数包 5 MB、请求体 1 MB | 代码包 128 MB、请求体 6 MB、最长跑 120 秒[^cloud] |
| 本站实测 | 整包 641 KB 时冷启动会被平台掐掉；一次执行约 62 个请求 | 每个请求慢一倍，冷启动 2～3 秒，往外回数据约 170 KB/s |

## 和自己起一个服务差在哪

<figure markdown>
![在 Makers 上请求怎么走：平台的路由先看有没有静态文件，有就直接返回，没有才按路径交给函数](assets/edgeone/request-path-infographic.png)
</figure>

最容易想错的是这一条：**最前面站着的是平台的路由，不是你的代码**。FastAPI 挂上 `StaticFiles` 以后，页面和接口都是同一个进程给的；在 Makers 上，页面是平台给的，只有没对上静态文件的请求才落到函数。由此带出几件事：

- **认证写在函数里，只锁得住接口，锁不住页面**：静态文件的请求不经过函数。要把整站锁起来，就别让平台托管页面 —— 页面放私有的对象存储，全部请求交给函数验了密码再去读，活例是本站的[全站上锁](../projects/wiki/static-site-lock.md)
- **函数按文件夹分配请求，不是「没有静态文件就都给后端」**：下一节用一个例子走一遍
- **没有内存里的状态**：每个请求都从头执行一遍代码，缓存、连接池、定时器都留不住；状态只能放存储里
- **没有后台任务**：定时任务最小间隔一天，长任务要拆成多次请求接力
- **代码要小**：函数包大了冷启动变慢，慢过头直接报错。活例是[牛牛便利贴](../projects/clipboard/dev.md)的 545

文档里还有一层中间件，在请求到路由之前先跑一段代码；它和静态文件谁先谁后、有什么限制，文档没写，本站没试过。

## 一个请求怎么找到函数

拿[牛牛便利贴](../projects/clipboard/dev.md)的文档举例。每篇文档有两个地址：`/wiki/dev/` 是给人读的页面，上传成了静态文件；`/wiki/dev.md` 是给 AI 读的原文，里面有要后端现查数据的占位符，所以故意不上传，留给函数答。

人打开 `/wiki/dev/`：

1. 平台找静态文件，有 `wiki/dev/index.html`
2. 直接返回，函数没启动

AI 读 `/wiki/dev.md`：

1. 平台找静态文件，没有
2. 回退去找函数，**找法是拿网址的开头去对文件夹**：网址是 `/wiki/...`，就看 `edge-functions/wiki/` 里有没有函数
3. 有就交给它；没有就回 404 —— 它不会去 `edge-functions/api/` 里找，因为网址不是 `/api/` 开头

便利贴的后端一开始放在 `edge-functions/api/` 里，走到第 3 步就是 404。当时的补法是往 `edge-functions/wiki/` 里再放一个函数；这个函数要替换占位符，得读后端的数据，而函数不能请求自己的域名，只能把后端的代码自己带一份。结果同一个后端打包了两次，每次冷启动两份都要解析。

后来改成只放一个 `edge-functions/[[default]].js`：放在最顶层，什么开头的网址都归它，函数里再按路径分。实测有静态文件的路径照样在第 1 步由平台答，不进函数；没有静态文件的全部落到它，连 `edgeone.json` 里「找不到就回首页」的 rewrite 也排在它后面，要它自己回首页。

### 动手前先定放几个函数

- **函数之间共用代码，就是一个服务**：放最顶层一个入口，函数里按路径分。拆到几个文件夹里，共用的部分每个入口各打包一份
- **函数之间完全独立，才分文件夹放多个**：各自很小，互不引用
- **顶层已经有兜底函数，以后再加一个独立的 `edge-functions/foo.js`**：文档的例子里，`api/users/list.js` 和 `api/[[default]].js` 放在一起时，`/api/users/list` 归前者[^edge]，照此更具体的文件优先，`/foo` 应该归 `foo.js`。文档没有明说优先级，本站没试过，用之前先部署一次验证

## 什么情况用哪一半

| 手里有什么 | 用什么 | 活例 |
|---|---|---|
| 公开的静态站 | 对象存储的静态网站就够，不需要 EdgeOne | [本 wiki 的对象存储部署](../projects/wiki/cos-deploy/index.md) |
| 静态站，但要输密码才能看 | Makers 只放一个函数，页面放私有对象存储 | [全站上锁](../projects/wiki/static-site-lock.md) |
| 几个人用的小应用：页面加接口加一点数据 | Makers 全套：静态文件 + 边缘函数 + Blob | [牛牛便利贴](../projects/clipboard/index.md) |
| 已经有服务器，嫌慢或者怕被打 | 安全加速，把域名接进去 | 本站没试过 |
| 长连接、长任务、依赖很重、要用数据库 | 自己的服务器；需要时前面再接安全加速 | — |

选 Makers 之前先看三条够不够：一次请求 CPU 约 200 ms 内做得完、函数包压得进几百 KB、数据用对象存储那种「整个读、整个写」放得下。有一条不够，边缘函数就不合适，改用云函数或者自己的服务器。

照着做的步骤和实测出来的限制在 skill [使用 EdgeOne](../skills/edgeone/index.md)。

[^overview]: EdgeOne 文档「选择业务场景」，<https://edgeone.ai/zh/document/69865>，读于 2026-11-18。
[^access]: EdgeOne 文档「接入模式」，<https://edgeone.ai/zh/document/46435>，读于 2026-11-18。
[^functions]: EdgeOne Makers 文档「Functions 概览」，<https://pages.edgeone.ai/zh/document/pages-functions-overview>，读于 2026-11-18。
[^cloud]: EdgeOne Makers 文档「Cloud Functions」，<https://pages.edgeone.ai/zh/document/cloud-functions>，读于 2026-11-18。
[^edge]: EdgeOne Makers 文档「Edge Functions」，<https://pages.edgeone.ai/zh/document/edge-functions>，读于 2026-11-18。
