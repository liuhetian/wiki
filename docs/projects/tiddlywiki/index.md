---
description: "TiddlyWiki 粗讲：整个 wiki 可以只是一个 HTML 文件；打开时从文件里的 JSON 读出全部 tiddler，内核和界面也是 tiddler；存盘把模板渲染成新文件，浏览器里兜底是下载副本，写回原文件靠服务器或扩展"
---

# TiddlyWiki：程序和数据装在一个 HTML 里，存盘就是把自己重拼一遍

它是一个人用的非线性笔记本，最小单位叫 tiddler：一条带标题、标签和字段的卡片。能跑成 Node.js 服务，但招牌用法是整个 wiki 就一个 HTML 文件，拷到哪都能打开。

打开时 boot.js 从文件里的 JSON 数组读出全部 tiddler。程序也是 tiddler：内核 `$:/core` 是一条插件，打包几百条影子 tiddler，带 `module-type` 的注册成 JS 模块，界面是 WikiText 模板。按标题取先找普通 tiddler，没有才回落影子 —— 写一条同名的就盖掉原版界面。

存盘是渲染模板 `$:/core/save/all`，把 tiddler 连同 boot.js 拼回整个 HTML，交给优先级最高的 saver[^repo]。网页改不了本地文件，兜底是下载新副本；写回原文件得有人接手：服务器收 WebDAV 的 PUT，浏览器扩展接保存事件，或存进 GitHub。

拼文件、挑 saver、记未存改动归它；文件放哪、谁来写回由用的人选。

[^repo]: [TiddlyWiki/TiddlyWiki5](https://github.com/TiddlyWiki/TiddlyWiki5/tree/999763abb080adc68595dbee7526f315da28a044)，读的是 commit `999763a`，2026-10-26 读。
