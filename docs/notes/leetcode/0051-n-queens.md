---
description: "一行放一个皇后把二维搜索压成排列；列、主对角线 r-c、副对角线 r+c 各一个集合，冲突判定 O(1)"
---

# 51. N 皇后

[LeetCode 51](https://leetcode.cn/problems/n-queens/) · 困难 · 回溯

## 题

在 $n \times n$ 棋盘上放 $n$ 个皇后，任意两个不在同一行、同一列、同一条斜线上。返回所有摆法，每种用字符串列表表示（`Q` 是皇后，`.` 是空）。

例：`n = 4` → `[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]`。

## 一句话

按行递归，每行选一列；用三个集合记下已占的列、`r - c`、`r + c`，新皇后三者都不撞才放。

## 关键技巧

**「每行恰好一个」把行冲突消灭在建模里。** 状态从「在 $n^2$ 个格子里选 $n$ 个」降为「给每行选一列」——本质是列号的一个排列，外加对角线约束。

**对角线的不变量。** 同一条主对角线（左上到右下）上 $r - c$ 恒定，同一条副对角线上 $r + c$ 恒定。于是两个格子斜向相撞 $\iff$ 它们的 $r-c$ 或 $r+c$ 相等——每条线一个整数 ID，放进集合即可 $O(1)$ 判冲突。

**为什么剪枝有效。** 冲突在放下的那一刻就被拒绝，不会等到放满再检查；实际搜索量远小于 $n!$（$n=8$ 时只访问约 2000 个节点）。

**位运算加速**（选学）：用三个整数的位表示可用列，`avail = ~(cols | d1 | d2) & ((1<<n)-1)`，`avail & -avail` 取最低位——每层 $O(1)$ 拿到下一个可放位置。

## 解

```python
class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:
        res, queens = [], []  # queens[r] = 第 r 行皇后所在列
        cols, diag1, diag2 = set(), set(), set()

        def dfs(r):
            if r == n:
                res.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
                return
            for c in range(n):
                if c in cols or r - c in diag1 or r + c in diag2:
                    continue
                cols.add(c); diag1.add(r - c); diag2.add(r + c)
                queens.append(c)
                dfs(r + 1)
                queens.pop()
                cols.remove(c); diag1.remove(r - c); diag2.remove(r + c)

        dfs(0)
        return res
```

时间 $O(n!)$ 上界（第 $r$ 行最多 $n-r$ 个可选列），空间 $O(n)$（不计输出）。

## 延伸

- **只求方案数**（LeetCode 52）：同一份代码把收集改成计数；位运算版最快。
- 骨架是 [46. 全排列](0046-permutations.md) 加额外约束——`cols` 就是全排列里的 `used`，多出来的只是两条对角线。
- 同类「约束满足」回溯：数独（LeetCode 37），每格的行/列/宫三个集合，思路一模一样。

??? note "自测"

    ```python
    s = Solution()
    assert sorted(s.solveNQueens(4)) == sorted([[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]])
    assert s.solveNQueens(1) == [["Q"]]
    assert s.solveNQueens(2) == [] and s.solveNQueens(3) == []
    assert len(s.solveNQueens(8)) == 92
    ```
