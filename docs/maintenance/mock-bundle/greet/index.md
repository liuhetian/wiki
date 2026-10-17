---
name: 打招呼
description: "测试skill 的子 skill：给一个名字打招呼；脚本 scripts/foo.py 是单文件，远程取一个文件就能跑"
---

# 打招呼

用户要跟谁打招呼，就把名字传给 [`scripts/foo.py`](scripts/foo.py)：

```bash
python3 scripts/foo.py 小明
```

- 这个脚本不依赖别的文件，单独取下来就能跑
- 要数一句话有几个字，用兄弟子 skill [数字数](../count/index.md)；它的脚本会借用本 skill 的 `foo.py`
