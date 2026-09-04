---
description: "默认落点是仓库名，要落到别处就得自己指定"
---

# clone 到指定目录：最后那个参数不是可选装饰

> 目标：控制克隆的落点，而不是接受默认目录名。原关卡 `0-0-1`。

## 场景

要做代码审查，规矩是把项目放在 `work/projects/cal-review/` 下，而不是默认的 `work/cal/`。`work/projects/` 已经建好了。

## 搭环境

```bash
bash docs/courses/git/assets/clone-into-dir/init.sh
```

环境建在 `~/courses/git/clone-into-dir/`（改 `COURSE_ROOT` 可换位置），重跑即重置。远程是同目录下的一个裸仓库，走 `file://`。脚本不碰你的 `~/.gitconfig`。

??? abstract "`init.sh` —— 造出这个现场的脚本"

    ```bash
    --8<-- "courses/git/assets/clone-into-dir/init.sh"
    ```

## 任务

- 把项目克隆到 `work/projects/cal-review`，一步到位，不要先克隆再改名。

## 验收

- `work/projects/cal-review/.git` 存在
- `work/cal` **不存在**（没有克隆到默认位置）
- `README.md`、`calc.py`、`tests/test_calc.py`、`docs/guide.md` 都在

## 提问

```conflict
<<<<<<< courses/git/clone-into-dir
Q1 起点
环境刚建好时，`git log --oneline --graph --all --decorate` 和 `git status` 分别输出什么？贴原文，并说出这个现场里「已经发生过什么」。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-into-dir
Q2 目录参数的位置
你用的完整命令是什么？那个目录参数写在哪个位置、能不能省略中间的仓库地址？如果目标目录已经存在且非空，git 会怎么反应（可以真的试一次）？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-into-dir
Q3 你敲了什么
按顺序贴出你真正执行过的命令。哪一条是关键的一条，为什么？
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-into-dir
Q4 终点
完成后 `git log --oneline --graph --all --decorate -6` 和 `git status` 分别是什么？贴原文，并指出与「起点」那题相比变了哪些地方。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-into-dir
一句话
用一句话说清这一课。说的应该是这类问题的普遍形状，不是这次的具体操作步骤。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-into-dir
心智模型
画出或写出你现在对这件事的心智模型：涉及哪几个东西、它们之间是什么关系、为什么按这个模型推，命令的行为就是可预期的。
=======
>>>>>>> notes
```

```conflict
<<<<<<< courses/git/clone-into-dir
坑
这一课你踩到或差点踩到的坑，一条一行。
=======
>>>>>>> notes
```
