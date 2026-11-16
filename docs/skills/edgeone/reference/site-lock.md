---
description: "COS 上的静态站全站上锁：人先建私有桶和只读子账号，AI 传内容、部署验密码再签名读 COS 的边缘函数、绑域名、跑验收；浏览器输一次密码记 30 天，AI 带 X-Password 请求头"
---

# 全站上锁

前两步只能人做，缺哪样就停下来找用户要，不要自己建：

1. 一个私有读的 COS 桶，问清桶名和地域
2. 一个只开编程访问的 CAM 子账号的 SecretId 和 SecretKey，自定义策略只给这个桶的读权限：

```json
{
  "version": "2.0",
  "statement": [{
    "effect": "allow",
    "action": ["name/cos:GetObject", "name/cos:HeadObject"],
    "resource": ["qcs::cos:<地域>:uid/<APPID>:<桶名>/*"]
  }]
}
```

其余 AI 做：

3. 站点文件传进桶，ACL 保持私有；匿名直连应回 403
4. 部署目录只放函数：[`assets/lock.js`](../assets/lock.js) 拷成 `edge-functions/[[default]].js`，再加转发它的 `index.js`；正文全留在桶里
5. 本机环境备好 `SITE_PASSWORD`（用户没指定就用 `.env` 的 `MY_API_KEY`）、`READER_SECRET_ID`、`READER_SECRET_KEY`、`COS_HOST`（`<桶名>.cos.<地域>.myqcloud.com`），跑 `node scripts/deploy.mjs <项目名> <目录> SITE_PASSWORD READER_SECRET_ID READER_SECRET_KEY COS_HOST`
6. 照[绑域名与 HTTPS](domain.md)绑域名，`lock.js` 已经带了 HTTP 跳转
7. `bash scripts/check.sh <域名> <COS_HOST> [一个存在的路径]`：11 项全 ✅ 才算完

改内容只重传桶；改密码就改 `SITE_PASSWORD` 重跑第 5 步，旧 cookie 全部失效。`lock.js` 给 AI 的提示让它读 `WIKI_PASSWORD` 环境变量，读的那一方用别的名字就改 `AI_HINT`。
