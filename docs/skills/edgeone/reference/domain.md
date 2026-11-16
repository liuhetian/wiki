---
description: "中国大陆加速的 Makers 项目必须绑已备案域名：查空闲、一条脚本走完加域名、TXT 归属校验、CNAME、免费证书，再把 HTTP 跳到 HTTPS"
---

# 绑域名与 HTTPS

1. 问用户绑哪个已备案域名下的哪个子域名；查它是否空闲只问权威 DNS（`dig @<NS 服务器>`），别用本机解析，本机会缓存「不存在」
2. `node scripts/domain.mjs <项目名> <域名>`：加域名、TXT 归属校验、CNAME、`eofreecert` 免费证书一次走完，每步轮询到位，可重跑；DNS 在本账号 DNSPod 时自动加记录，不在时退出码 2 并打印记录，交给用户加完再重跑
3. 有兜底函数的，在函数开头把 `http:` 请求 308 到 `https:` —— SDK 没有开强制跳转的接口
4. TXT 和 CNAME 记录都留着；证书 90 天，到期前 15 天平台自动续
5. 本机 curl 解析失败时用 `--resolve <域名>:443:<IP>` 钉住，IP 用 `dig` 查平台给的 CNAME
