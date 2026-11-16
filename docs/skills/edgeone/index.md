---
description: "用 EdgeOne Makers 发布网站时用：建中国大陆加速的项目并部署、绑备案域名配 HTTPS、给 COS 静态站全站上锁、用 Blob 存数据和文件；每样一页步骤，配脚本"
---

# 使用 EdgeOne

在 EdgeOne Makers（英文文档叫 Pages）上发布网站：静态页加边缘函数，不用服务器。按要做的事读对应一页：

- [建项目与部署](reference/deploy.md) —— 每次都要：建中国大陆加速的项目、写环境变量、部署目录
- [绑域名与 HTTPS](reference/domain.md) —— 大陆加速必须做：绑已备案的域名、过归属校验、配免费证书
- [全站上锁](reference/site-lock.md) —— 静态站放私有 COS，浏览器输密码、AI 带请求头才能看
- [Blob 存储](reference/blob.md) —— 要存数据或用户上传的文件时用，不用另建 COS 桶

脚本在 `scripts/`，依赖写在 `package.json`，先在 skill 目录 `npm install`。
