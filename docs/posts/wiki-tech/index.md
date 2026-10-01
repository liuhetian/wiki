---
description: "这个 wiki 自己用到的技术，一项一页：对象存储部署与双产物、自建 git-lfs 后端、打码；做了一项写一页，没做的不占坑"
---

# 本 wiki 用到的技术

这个 wiki 自己用到的技术，一项一页。每页讲清楚这项技术是什么、为什么这么选、换到别的站要改哪里。写作时怎么用这些机制是写作规矩，在[写作规范](../../skills/wiki-guide/mkdocs-wiki/index.md)里。

- [用对象存储部署 AI 友好的个人知识库](cos-deploy/index.md) —— 总纲：什么算对 AI 友好、同一份 markdown 双发布、为什么是对象存储而不是服务器；附[部署实操手册](cos-deploy/reference/deploy.md)
- [用自己的对象存储做 git-lfs 后端](git-lfs.md) —— standalone custom transfer agent：140 行脚本替掉整个 LFS 服务，协议、坑和换存储的改法
- [打码：key 和小字都以密文写进 wiki](age-mosaic.md) —— API key、服务器地址用 age 公钥加密后写进 markdown，浏览器里显示成马赛克，解锁后还原；六种存法的比较、对称与非对称加密、scrypt 为什么撑得住短口令，以及 encryptcontent 这类插件为什么在本站会漏

还没单独成篇的：`check-links.py` 这道闸门（现在写在总纲的[闸门一节](cos-deploy/index.md#link-check)）、vendor 本地化与按需加载、中文字体子集化。哪项值得单独讲了再拆出来。
