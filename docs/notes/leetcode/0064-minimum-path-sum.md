---
description: "网格最值 DP：dp[i][j] = grid[i][j] + min(上, 左)，第一行第一列只能单向累加，滚动成一行"
---

# 64. 最小路径和

[LeetCode 64](https://leetcode.cn/problems/minimum-path-sum/) · 中等 · 多维动态规划

## 题

`m × n` 网格每格有一个非负数，从左上走到右下，每步只能向右或向下，求路径上数字之和的最小值。

例：`grid = [[1,3,1],[1,5,1],[4,2,1]]` → `7`（1 → 3 → 1 → 1 → 1）。

## 一句话

到 `(i, j)` 的最优路径，最后一步来自上方或左方中较便宜的那个，再加上本格的数。

## 关键技巧

**计数换成最值，结构不变。** 和 [62. 不同路径](0062-unique-paths.md) 是同一张表：

- 状态：$f(i,j)$ = 从起点到 $(i,j)$ 的最小路径和（含两端）。
- 转移：$f(i,j) = \text{grid}[i][j] + \min\big(f(i-1,j),\ f(i,j-1)\big)$。
- 初值：$f(0,0) = \text{grid}[0][0]$；第一行只能从左来、第一列只能从上来，是前缀和。
- 顺序：逐行、行内从左到右。

**为什么贪心不行。** 每步挑相邻较小的格子会被局部便宜骗进死路（先便宜后昂贵）；DP 在每个格子保留了到它的全局最优，这才满足最优子结构。

**边界用 inf 统一。** 滚动数组初始化为 `inf`、`dp[0] = 0`，则第一行第一列不用特判：`min(inf, x) = x`。

## 解

```python
class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        n = len(grid[0])
        dp = [inf] * n
        dp[0] = 0
        for row in grid:
            dp[0] += row[0]                          # 第一列只能从上来
            for j in range(1, n):
                dp[j] = row[j] + min(dp[j], dp[j - 1])  # 上方（旧值）vs 左方（新值）
        return dp[-1]
```

时间 $O(mn)$，空间 $O(n)$。也可以直接在 `grid` 上原地改，空间 $O(1)$，但会破坏输入。

## 延伸

- **计数版**：[62. 不同路径](0062-unique-paths.md)。
- **能往四个方向走**：DP 的「上、左」顺序就不成立了，要换成 Dijkstra——权值非负是它成立的前提。
- **三角形最小路径和**（LeetCode 120）：自底向上做同样的 `min`，一行滚动。

??? note "自测"

    ```python
    s = Solution()
    assert s.minPathSum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]) == 7
    assert s.minPathSum([[1, 2, 3], [4, 5, 6]]) == 12
    assert s.minPathSum([[5]]) == 5
    assert s.minPathSum([[1], [2], [3]]) == 6
    ```
