---
description: "COS 静态站全站上锁、人和 AI 都好进：前端加密、Caddy 302、桶半开放各卡在哪，最后用 EdgeOne Makers 边缘函数验密码、签名读私有 COS —— 浏览器记 30 天登录，AI 带请求头；额度用完打不开但不漏"
---

# COS 静态站全站上锁：绕了三圈，最后用 EdgeOne 边缘函数

昨天做了一个和本 wiki 类似的网站，但是需要全站上锁，就是实现 Caddy `basic_auth` 的体验：打开任意一页都要先输一次密码，之后整站正常访问。而且和本 wiki 一样，这个站也要给 AI 读，AI 得能方便地带上凭证拿到明文。

## 前三圈各卡在哪 { #detours }

第一反应是不用 Caddy，就可以完全脱离服务器，不用担心服务器过期。于是第一版偷懒使用前端加密，用 StatiCrypt[^staticrypt] 做前端加密，一下就弄好了。

第二天发现问题：

1. 它只加密 html，图片、md 这些文件加密不了，知道地址就能直接打开。
2. 每次加密都会随机生成一个初始向量（IV），哪怕内容一个字没改，重新构建后每一页的密文都会变，文件哈希跟着变，每次部署都要全量重新上传。
3. AI 抓到的只是密文，得自己写解密代码才能读。

所以很不爽。

于是 AI 推荐用 EdgeOne，但是看起来是每个月收费的套餐（站点加速个人版 29.9 元/月[^eo-price]），不能像 COS 一样纯按量收费，也很不爽。

推荐的第二个方案是用 Caddy，但是不是反向代理，而是利用 302 重定向：Caddy 验完密码，把请求跳转到 COS 的预签名 URL，这样可以避免流量走一次服务器（这个是红线，服务器的带宽卡得一笔）。
这个方案乍一听挺不错，但是发现问题：

1. Caddy 自己算不了 COS 的签名，处理的小脚本要做成一个 Caddy 插件（因为不想做成一个独立的服务）。
2. html 不能跳转。A 跳转成 COS 地址以后，A 里面用相对路径引用的 B 也会解析成 COS 地址，不带签名直接 403，得把所有链接都改成指向 Caddy 域名的绝对地址；而且 COS 默认域名会强制下载 html，所以 html 只能经服务器转发，只有图片、视频这些能 302。
3. 最致命的：它还是依赖服务器，服务器一过期站就没了，最开始的顾虑一点没解决。

然后想能不能用 COS 桶半开放的方案：入口 index.html 公开，里面放一把被密码锁住的 COS 只读密钥，进来先输密码解开它，之后就能访问私有文件。问题是 COS 没有那种放进 header、带上就能访问所有文件的静态 token，只有签名：每个请求都要用密钥对路径和时间现算一个签名。浏览器这边能靠 Service Worker 给每个请求自动签，但要自己写 Service Worker、要绑自定义域名配 HTTPS，新设备直接点链接看到的是 COS 的 403 报错而不是密码页，AI 还得用 SDK 才能读。能做，但太麻烦，放弃。

## 最后：边缘函数验完密码，签名读私有 COS { #makers }

所以最后还是用 EdgeOne，不过不是前面那套按月付费的站点加速，而是它面向开发者的 Makers（英文文档里还叫 Pages）：免费版含边缘函数 300 万次、CPU 时间 300 万毫秒[^makers-plan]，个人站够用。不要服务器的前提下，能在请求进来时跑代码判断给不给的，基本只有它。它集合了 CDN + Caddy + FastAPI 的好处：有 CDN 的加速，有 Caddy 的反向代理和权限认证，还能跑轻量的逻辑（单次执行 CPU 时间 200 毫秒以内[^eo-limits]）。

整条链路是：请求 → 边缘函数校验密码或 cookie → 用只读子账号的密钥签名读私有桶 → 把文件原样返回。COS 桶保持私有读，能读它的只有函数；流量走 EdgeOne，不经过任何服务器。

!!! warning "私有读不是加密"

    COS 上放的就是能直接解析的 HTML 和 md，私有读只是访问权限，正文并没有变成密文。函数干的是验密码、验 cookie、给读 COS 的请求签名，不是解密。

??? question "免费额度用完，正文会变成免密可读吗？"

    不会。Makers 免费版额度用完后终止函数请求[^makers-billing]，COS 照样私有 —— 丢的是「能读」，站打不开，正文不会漏。记住登录也省不了额度：cookie 只是浏览器自动带上，每个请求照样跑一次鉴权函数。

??? question "那什么情况下，函数停了还能免密看到正文？"

    只有一种：另有一条路能直接返回原文，函数失效后请求又被放到了那条路上 —— 公开的 COS、公开的静态副本都算。这和函数做的是加密还是解密没关系。前面站点加速那套就可能落进这种情况：国内站文档写免费版超出 300 万次后边缘函数规则失效[^eo-free]，规则一失效，请求就绕过函数直接回源，回源要是开了私有访问授权，正文就免密出去了（按文档推的，没实测）。

??? question "要是 COS 存的是密文呢？"

    不管解密放在函数里还是客户端，解密那一环停了只是拿不到明文，密文不会自己变成明文；放在浏览器或 AI 那边解（StatiCrypt 那条路），还不耗函数的 CPU 额度。

Caddy 的 `basic_auth` 只是 baseline，体验还能做得更好：

- 浏览器：没登录就给一个输密码的页面，输对一次，签发一个 30 天有效的签名 cookie，之后刷新、跳页都自动放行。
- AI：不给登录页，返回 401 和一段文字，提醒它从环境变量 `WIKI_PASSWORD` 读密码，放进 `X-Password` 请求头重试；带上之后，所有页面和 md 都直接拿到明文。返回的 cookie 也能存进 cookie 文件或 HTTP session 复用。只会抓网页、带不了请求头的 AI 工具还是读不了。
- HTTPS：密码和 cookie 都在请求里，明文 HTTP 等于白锁。EdgeOne 绑自定义域名、CNAME 生效后申请免费证书，HTTP 入口一律跳 HTTPS。

给 AI 的文字大致是：

```text
此站点需要访问密码。
请从运行环境读取 WIKI_PASSWORD，并将其值放入 X-Password 请求头后重试。
如果环境变量尚未设置，请向使用者获取访问密码。
```

AI 照做就是：

```bash
curl -H "X-Password: $WIKI_PASSWORD" https://<站点域名>/llms.txt
```

环境变量在 AI 自己的运行环境里，服务器只看得到请求头 —— 提示里说「读环境变量」是写给 AI 的指令，不是服务器去读。

给登录页还是给文字，看请求要什么，不猜它是谁：`Accept` 里声明要 `text/html` 的给登录页，没声明的（curl 默认发 `Accept: */*`）一律给文字提示，不靠 User-Agent 猜是不是 AI。这个判断只决定给哪种提示，两条路都得有正确的密码或 cookie 才放行，被伪造也不影响安全。

### 从零搭一遍：人只做两步 { #steps }

11-12 照这篇另起一个项目从零复现了一遍，验收全过。人只在动手前做两步，其余全交给 AI；复现时唯一卡住的，就是子账号没提前建好。最早那个站还没补上给 AI 的文字提示。

人做：

1. 建一个私有读的 COS 桶。
2. 在 CAM 建一个只开编程访问的子账号，自定义策略只给这个桶的 `cos:GetObject`、`cos:HeadObject`，把它的密钥交给 AI。

AI 做的部分 —— 传内容、建中国大陆加速的项目、部署函数、绑域名配证书、跑验收 —— 写成了 skill：[使用 EdgeOne](../../skills/edgeone/index.md) 的[全站上锁](../../skills/edgeone/reference/site-lock.md)。

## 自带 CDN 不等于正文能进缓存 { #no-cache }

EdgeOne 自带 CDN，但不代表文件得公开：任何能返回正文的入口都得先过函数。怕的是已登录用户读过的正文被 CDN 缓存，匿名访客再请求同一个 URL，直接命中缓存拿走。

- 函数返回 `Cache-Control: private, no-store, max-age=0` 和 `CDN-Cache-Control: no-store`，不用 Cache API 存受保护的响应，也别加会覆盖这两个头的强制缓存规则
- Makers 只部署函数和配置，HTML、md、附件、索引全留在私有 COS；项目默认域名、预览链接、别的 CDN 域名上都不能有绕过函数的正文副本
- 以后真要缓存正文，先验凭据再读缓存；只加 `Vary: X-Password, Cookie` 代替不了校验
- 用匿名请求验收：带密码读一个文件，再用不带 cookie、不带密码头的新请求读同一个 URL，应该 401 且不含正文；直连私有 COS 的地址应该 403。11-12 拿 `/raw/examples/b.md` 测过：带密码 200，匿名 401、无正文。改了路由或缓存配置要再测一次
- 以前要是公开缓存过正文，修好访问路径后清一次缓存

## 证书 90 天一换，验证记录别删 { #cert }

用的是 EdgeOne 免费证书，有效期 90 天，到期前 15 天平台自动续期[^cert]。最早那个站走 DNS 委派验证，续期不用为了让 CA 读验证文件开一个免密入口；复现时 CNAME 已指向 EdgeOne，直接用 `eofreecert` 自动验证，函数挡着全站也一次签下。下面几条说的是最早那个站。

- 留着验证记录：`_dnsauth.<域名>` 指向 `<域名>.eoacme0.com` 的 CNAME，续期靠它验证，别当成申请完就能删的临时记录
- 网站主域名的 CNAME 目前还指向某次部署的地址，清理那次部署前，先换成正式 CNAME 并确认能访问
- 接口里证书模式显示 `eofreecert_manual`，别读成「要手动续期」：SDK 文档里它指部署通过 `applyFreeCertificate` 申请并已签发的免费证书[^cert-mode]，没说续不续期，以控制台状态为准
- 当前证书 2027-02-09 07:59:59（北京时间）到期，2027-01-25 前后进续期窗口，去控制台「项目 → 域名管理 → HTTPS 配置」看状态和新到期时间，再确认网站实际返回的是新证书。还没经历过一次真的自动续期
- 续期没成：先查验证 CNAME 是否生效、CAA 是否允许 TrustAsia 和 Let's Encrypt 签发、DNSSEC 配置，再在同一个入口重新申请、完成 DNS 委派验证并保存部署

## 四种方案一张表 { #compare }

| 方案 | 怎么做 | 卡在哪 |
| --- | --- | --- |
| StatiCrypt 前端加密 | 正文加密成密文传 COS，浏览器或 AI 拿密码自己解 | 只加密 HTML；IV 随机，每次全量重传；AI 得自己写解密 |
| Caddy 302 | Caddy 验完密码，跳到短期有效的 COS 签名 URL，流量不过服务器 | 签名要做成插件；HTML 跳不了；签名 URL 有效期内谁拿到谁能读；还是依赖服务器 |
| COS 桶半开放 | 入口公开，里面放一把被密码锁住的只读密钥，Service Worker 给每个请求签名 | 要写 Service Worker、绑域名；新设备先看到 403；AI 得用 SDK |
| Makers 边缘函数（在用） | 函数验密码或 cookie，签名读私有 COS，原样返回 | 免费额度用完就打不开；正文不能进缓存；证书续期得盯 |

[^staticrypt]: [robinmoisson/staticrypt](https://github.com/robinmoisson/staticrypt) —— 把 HTML 整页加密成「密码框 + 密文」：口令经三轮 PBKDF2（共 60 万次）推出密钥，AES-256-CBC 加密、HMAC-SHA256 校验口令；IV 随机见它注入页面的 `encrypt` 函数（`crypto.getRandomValues`），2026-11-11 读。
[^eo-price]: [EdgeOne 套餐选型对比](https://cloud.tencent.com/document/product/1552/94165)，国内站，2026-11-11 读：个人版 29.9 元/月，含 50 GB 流量、300 万次请求；基础版 399 元/月，标准版 3800 元/月。
[^makers-plan]: [EdgeOne Makers 套餐选型对比](https://edgeone.ai/zh/document/226536160249049088)，2026-11-12 读：免费版 Edge Functions 执行 300 万次、CPU 时间 300 万毫秒，专业版各 1000 万、超量后付费；免费版额度用完「相应功能受到限制，不产生费用」。中文文档导航叫 Makers，英文叫 Pages。
[^eo-limits]: [EdgeOne 边缘函数使用限制](https://edgeone.ai/zh/document/53372)，2026-11-11 读：单次执行 CPU 时间 200 ms，内存 128 MB，代码包 5 MB，只支持 JavaScript。Makers 的资源计费说明写 Edge Functions「沿用 EdgeOne 计量方式」。
[^makers-billing]: [EdgeOne Makers 资源计费说明](https://edgeone.ai/zh/document/226481030174838784)，2026-11-12 读：「免费版额度用完后，函数请求会被终止，不产生费用。」
[^eo-free]: [EdgeOne 套餐选型对比](https://cloud.tencent.com/document/product/1552/94165)，国内站，2026-11-11 读：免费版「超出 300 万次后边缘函数规则失效」，限量内测、需兑换码；国际站的免费版写的是不限边缘函数请求，两边说法不一。
[^cert]: [申请免费证书](https://pages.edgeone.ai/zh/document/apply-for-free-certificate)，2026-11-12 读：「证书有效期为 90 天，到期前 15 天平台将自动为您申请续期」，由 TrustAsia 和 Let's Encrypt 签发；「常见原因」一节列的 CAA、DNSSEC、DNS 未生效等是申请失败的排查项，没单讲续期失败。
[^cert-mode]: [Makers SDK · Domain](https://edgeone.ai/document/226351994856046592)，英文，2026-11-12 读：`eofreecert` 是申请并部署免费证书、CNAME 指向 EdgeOne 后自动验证；`eofreecert_manual` 是部署经 `applyFreeCertificate` 申请并已签发的免费证书，证书没签发就报 `InvalidParameter.CertificateNotApplied`。
