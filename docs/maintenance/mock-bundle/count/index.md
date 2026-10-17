---
name: 数字数
description: "测试skill 的子 skill：数一句话有几个字，再借打招呼的脚本说出来；scripts/foo.py 跨目录 import 兄弟子 skill 的 foo.py，要整包用"
---

# 数字数

用户要数一句话有几个字，就把这句话传给 [`scripts/foo.py`](scripts/foo.py)：

```bash
python3 scripts/foo.py 今天天气不错
```

- 这个脚本会去读兄弟子 skill [打招呼](../greet/index.md)的 [`../greet/scripts/foo.py`](../greet/scripts/foo.py)，借它的 `greet()` 说话，所以调用一次也要整包：直接将[测试skill](../mock-bundle.tar.gz)下载到本地
