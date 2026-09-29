---
description: "每行两端是 1，中间每个数等于上一行肩上两数之和——最朴素的「由上一行推下一行」的 DP"
---

# 118. 杨辉三角

[LeetCode 118](https://leetcode.cn/problems/pascals-triangle/) · 简单 · 动态规划

## 题

给行数 `numRows`，生成杨辉三角的前这么多行：每行首尾是 1，中间每个数是它左上和右上两个数之和。

例：`numRows = 5` → `[[1], [1,1], [1,2,1], [1,3,3,1], [1,4,6,4,1]]`。

## 一句话

第 `i` 行第 `j` 个数 `= row[i-1][j-1] + row[i-1][j]`，两端固定为 1。

## 关键技巧

**状态就是格子本身。** $C(i, j)$ 表示第 $i$ 行第 $j$ 个数（从 0 数），转移 $C(i,j) = C(i-1,j-1) + C(i-1,j)$，边界 $C(i,0) = C(i,i) = 1$。它正是组合数 $\binom{i}{j}$ 的递推式——从 $i$ 个里选 $j$ 个，按第 $i$ 个选不选分两类。

**错位相加的写法。** 上一行 `prev` 前面补 0 和后面补 0 逐位相加，就得到下一行：`[0]+prev` 与 `prev+[0]` zip 起来。首尾的 1 自然出来，不用特判。

## 解

```python
class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        res = [[1]]
        for _ in range(numRows - 1):
            prev = res[-1]
            res.append([a + b for a, b in zip([0] + prev, prev + [0])])
        return res
```

时间 $O(n^2)$，空间 $O(1)$（不计输出）。

## 延伸

- **只要第 k 行**（LeetCode 119）：一维数组从右往左原地更新 `row[j] += row[j-1]`——倒序是为了不覆盖还没用的旧值，与 [416. 分割等和子集](0416-partition-equal-subset-sum.md) 的 0-1 背包倒序同理。
- **网格路径计数**：[62. 不同路径](0062-unique-paths.md) 的 DP 表斜着看就是杨辉三角，答案是组合数。

??? note "自测"

    ```python
    s = Solution()
    assert s.generate(5) == [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]
    assert s.generate(1) == [[1]]
    assert s.generate(2) == [[1], [1, 1]]
    ```
