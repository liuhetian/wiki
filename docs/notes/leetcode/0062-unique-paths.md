---
description: "网格计数 DP：每格路径数 = 上方 + 左方，一行滚动数组就够；本质是组合数 C(m+n-2, m-1)"
---

# 62. 不同路径

[LeetCode 62](https://leetcode.cn/problems/unique-paths/) · 中等 · 多维动态规划

## 题

`m × n` 网格，机器人从左上角出发，每步只能向右或向下，问走到右下角有多少条不同路径。

例：`m = 3, n = 7` → `28`；`m = 3, n = 2` → `3`。

## 一句话

到 `(i, j)` 的最后一步不是从上面下来就是从左边过来，`dp[i][j] = dp[i-1][j] + dp[i][j-1]`。

## 关键技巧

**二维网格 DP 的原型。**

- 状态：$f(i,j)$ = 从起点到 $(i,j)$ 的路径数。
- 转移：$f(i,j) = f(i-1,j) + f(i,j-1)$。
- 初值：第一行、第一列都是 1——只有一条直路。
- 顺序：逐行、行内从左到右，保证用到的上方和左方都已算好。

**滚动成一行。** 按行扫时，`dp[j]` 更新前存的是上一行的 $f(i-1,j)$，`dp[j-1]` 已是本行的 $f(i,j-1)$，所以 `dp[j] += dp[j-1]` 一步到位，**正序**。

**组合数直接算。** 任意一条路径都是 $m-1$ 次「下」和 $n-1$ 次「右」的排列，路径数 $= \binom{m+n-2}{m-1}$——Python 的 `math.comb` 一行搞定。

## 解

=== "滚动数组"

    ```python
    class Solution:
        def uniquePaths(self, m: int, n: int) -> int:
            dp = [1] * n  # 第一行全是 1
            for _ in range(1, m):
                for j in range(1, n):
                    dp[j] += dp[j - 1]  # 上方（旧值）+ 左方（新值）
            return dp[-1]
    ```

    时间 $O(mn)$，空间 $O(n)$。

=== "组合数"

    ```python
    class Solution2:
        def uniquePaths(self, m: int, n: int) -> int:
            return comb(m + n - 2, m - 1)
    ```

    时间 $O(\min(m, n))$，空间 $O(1)$。提交时类名改回 `Solution`。

## 延伸

- **带权最值版**：[64. 最小路径和](0064-minimum-path-sum.md)，`+` 换成 `min`、再加上格子权值。
- **带障碍**（LeetCode 63）：障碍格 `dp = 0`，其余不变——此时组合数公式失效，DP 通用。
- **斜着看是杨辉三角**：[118. 杨辉三角](0118-pascals-triangle.md)。

??? note "自测"

    ```python
    for S in (Solution, Solution2):
        s = S()
        assert s.uniquePaths(3, 7) == 28
        assert s.uniquePaths(3, 2) == 3
        assert s.uniquePaths(1, 1) == 1
        assert s.uniquePaths(1, 5) == 1
    ```
