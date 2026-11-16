---
description: "使用 EdgeOne 的第一步：确认主账号密钥和 Makers 已开通，摆好部署目录，用脚本建中国大陆加速的项目、写环境变量、部署"
---

# 建项目与部署

1. 确认本机有主账号密钥 `TENCENTCLOUD_SECRET_ID`、`TENCENTCLOUD_SECRET_KEY`，账号已开通 EdgeOne Makers；没开通就请用户去控制台开通
2. 摆部署目录：边缘函数放 `edge-functions/`，按文件路径路由；`[[default]].js` 兜住所有子路径但管不到 `/`，根路径另写一个转发同一处理函数的 `index.js`
3. 有静态页或 npm 依赖时，目录根放 `package.json` 和 `edgeone.json`：`installCommand` 写 `npm install`，`buildCommand` 写空串，`outputDirectory` 指静态页目录，缓存在 `headers` 里配
4. `node scripts/deploy.mjs <项目名> <目录> [环境变量名…]`：没有项目就建一个加速区域为中国大陆的；列出的变量从本机环境读出写进项目，建项目时另随机生成一次 `COOKIE_SECRET`；已有项目只改列出的变量；然后部署目录，等到成功
5. 部署成功后等几十秒再测，太快会测到旧版本
6. 大陆加速的默认域名 `*.edgeone.cool` 只回平台自己的 401，接着做[绑域名与 HTTPS](domain.md)
