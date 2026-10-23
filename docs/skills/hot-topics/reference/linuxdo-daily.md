---
description: "linux.do 日报的音频版：小宇宙节目「ai早知道」，每天一集回顾 linux.do 社区的 AI 热点；GET 节目页，取 __NEXT_DATA__ 里最新一集的 enclosure.url，直接下载 m4a，不用登录"
---

# linux.do 日报

linux.do 日报的音频版是小宇宙节目「ai早知道」，GET `https://www.xiaoyuzhoufm.com/podcast/6a6e4a2ec654846ef0ee0795`，页面里 `__NEXT_DATA__` 的 `props.pageProps.podcast.episodes[0]` 是最新一集（页面只给最近 15 集）。它的 `enclosure.url` 是 `media.xyzcdn.net` 上的 m4a 直链，`curl -L` 直接下载，不用登录、不用 token。
