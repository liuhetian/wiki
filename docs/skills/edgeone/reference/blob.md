---
description: "Makers 自带的 Blob 存储：不用另建 COS 桶和子账号；装依赖、强一致读、读改写排队、文件走预签名直传、函数代读、只让位图内联"
---

# Blob 存储

1. 部署目录的 `package.json` 依赖 `@edgeone/pages-blob`，`edgeone.json` 的 `installCommand` 写 `npm install`
2. 函数里 `getStore({ name, consistency: 'strong' })`；要写完马上读到就用 strong
3. 没有条件写：同一个对象的读改写会互相覆盖，客户端把写操作排队串行
4. 文件不经函数：函数请求体上限 1 MB，用 `createUploadUrl(key)` 签预签名 PUT，浏览器直接传（跨域已放行），传完再把元数据写进 JSON
5. 读文件由函数 `get(key, { type: 'arrayBuffer' })` 后返回；`get` 会把整个对象读进内存，单个对象上限 25 MB
6. 对象匿名访问回 403，只能经函数读；返回文件时只有常见位图用 `inline`，其余一律 `attachment` 加 `application/octet-stream`，防止上传的 HTML 在本域名下执行
7. 免费版 1 GB；领了上传地址没传完的会留下孤儿对象，按需清理
