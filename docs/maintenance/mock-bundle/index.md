---
name: 测试skill
description: "mock 抽象 skill，演示带脚本的 skill 怎么远程用、怎么整包用：两个子 skill 各带一个 foo.py、互相引用，其中一个脚本跨目录 import 另一个；改打包流水线或写带脚本的 skill 时拿来对照"
---

# 测试skill

这是一个 mock 的抽象 skill，没有实际用途，只演示带脚本的 skill 在本站怎么用。如果要调用 2 次以上本 skill 中的脚本，直接将[本 skill](mock-bundle.tar.gz)下载到本地。

下面两个子 skill 各带一个 `scripts/foo.py`，页面互相引用：

- [打招呼](greet/index.md) —— 给一个名字打招呼；脚本是单文件，远程取一个文件就能跑
- [数字数](count/index.md) —— 数一句话有几个字，再借打招呼的脚本说出来；脚本跨目录 import 打招呼的 `foo.py`，要整包用
