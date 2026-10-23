---
name: 粗讲项目
description: "想几句话弄懂一个仓库或项目在干什么时用：先读源码再讲，三四段大白话说清它是什么、解决什么问题、主路径怎么跑通；写了原来的理解就先纠正它，写了最想知道什么就围绕它讲"
---

# 粗讲项目

用几句话给我粗讲一下<input placeholder="仓库地址或本地路径">在干什么。

<div class="zx-no-copy" markdown>

讲完要不要收纳进本 wiki：<select name="收纳"><option>是</option><option>否</option></select>

</div>

<div data-when="理解" markdown>

我原来以为它是：<input name="理解" placeholder="可选：你现在的理解，讲的时候先纠正它">

讲的时候第一句先纠正这个理解。

</div>

<div data-when="想知道" markdown>

我最想知道：<input name="想知道" placeholder="可选，比如：能不能接进我的项目 / 它怎么做到 xxx / 和 yyy 比怎么样">

讲的时候围绕这个问题挑重点。

</div>

讲之前先读源码，README 只当线索：

- 哪条是默认走的主路径、哪些只是兜底或可选开关，以代码为准
- 哪部分要紧不按代码量判断 —— 代码多可能只是那块坑多

读完直接讲，不用先把项目全摸一遍，也不用先问我。

讲的时候：

- 三四段话，400 字以内；不分标题、不列清单、不画目录树、不贴命令
- 说清它是什么、解决谁的什么问题
- 主路径怎么跑通，用一个具体机制说明，不用形容词撑
- 说清分工：哪些是它做的，哪些留给用的人或模型
- 技术词保留原形，其余用大白话

<div data-when="收纳=是" markdown>

讲完把这几段收纳进本 wiki：你当前的工作区就是本 wiki 的仓库，动笔前先读仓库里的 `docs/skills/wiki-guide/index.md`，照它的写作流程写进仓库，和上面冲突的按上面。

</div>
