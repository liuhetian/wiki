---
description: "测试用 skill：一个 Python 脚本 + 一张 CSV，脚本按相对路径读表，用来验证客户端 AI 会不会自己把两者下载到本地、保持目录结构后运行"
---

# 远程 skill 探针：脚本 + CSV

这是一个**测试用 skill**，内容是虚构的，本身没有实用价值。它用来验证一件事：远程 skill 里的脚本依赖同一 skill 里的数据文件时，客户端 AI 能不能自己把文件下载到本地，并保持目录结构后跑起来。背景见 [skill 怎么收纳](../remote-skill.md) 的第 3 类脚本。

## 任务

用户给出两个驿站名，回答它们之间的直线距离。**答案必须来自运行脚本的输出**，连同脚本打印的「数据指纹」一起回给用户。不要自己读 CSV 心算：指纹只有真正跑过脚本才拿得到，用户靠它判断你是否真的执行了。

## 文件

| 文件 | 作用 |
|---|---|
| [`scripts/route.py`](scripts/route.py) | 计算距离；只用 Python 标准库 |
| [`assets/stations.csv`](assets/stations.csv) | 6 个虚构驿站的平面坐标（km） |

脚本按**自身所在位置**找 `../assets/stations.csv`，所以两份文件要下载到同一个目录下，并保持 `scripts/` 和 `assets/` 的相对位置：

```text
<任意目录>/
├── scripts/route.py
└── assets/stations.csv
```

然后在该目录下运行：

```bash
python3 scripts/route.py 雾港 石钟
```

驿站名写错时，脚本会列出所有可选的名字。

## 源码

??? abstract "`scripts/route.py`"

    ```python
    --8<-- "skills/wiki-guide/remote-skill-probe/scripts/route.py"
    ```

??? abstract "`assets/stations.csv`"

    ```csv
    --8<-- "skills/wiki-guide/remote-skill-probe/assets/stations.csv"
    ```
