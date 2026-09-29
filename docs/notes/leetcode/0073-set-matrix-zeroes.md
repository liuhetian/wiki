---
description: "拿第一行第一列当标记数组省掉 O(m+n) 空间；先单独记下它们自己要不要清零，最后再处理"
---

# 73. 矩阵置零

[LeetCode 73](https://leetcode.cn/problems/set-matrix-zeroes/) · 中等 · 矩阵

## 题

给一个 `m × n` 矩阵，只要某个元素是 0，就把它所在的整行和整列都设成 0。原地修改。

例：`[[1, 1, 1], [1, 0, 1], [1, 1, 1]]` → `[[1, 0, 1], [0, 0, 0], [1, 0, 1]]`。

## 一句话

先扫一遍，把「第 `i` 行要清」记在 `M[i][0]`、「第 `j` 列要清」记在 `M[0][j]`；再按标记清零；第一行第一列自己的状态提前用两个布尔量存好。

## 关键技巧

**不能边扫边清。** 清掉的 0 会被后续扫描当成原始 0，一路连锁把整个矩阵清空。所以必须两阶段：先收集、再修改。

**标记数组放进矩阵本身。** 朴素做法是 `rows[m]`、`cols[n]` 两个布尔数组，$O(m+n)$ 空间。观察到：如果第 `i` 行要清，`M[i][0]` 最终也会变 0——提前把它写成 0 不影响结果，于是**第一列可以充当 `rows`，第一行充当 `cols`**。

**第一行、第一列要自保。** 它们被借来当标记后，原本有没有 0 就分不清了。所以在借用之前先记下 `row0 = 第一行有 0`、`col0 = 第一列有 0`，最后再单独清。

**顺序：先清内部 `[1:, 1:]`，最后清第一行第一列。** 反过来的话，标记会先被抹掉。

## 解

```python
class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        row0 = any(matrix[0][j] == 0 for j in range(n))
        col0 = any(matrix[i][0] == 0 for i in range(m))
        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][j] == 0:
                    matrix[i][0] = matrix[0][j] = 0
        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][0] == 0 or matrix[0][j] == 0:
                    matrix[i][j] = 0
        if row0:
            for j in range(n):
                matrix[0][j] = 0
        if col0:
            for i in range(m):
                matrix[i][0] = 0
```

时间 $O(mn)$，空间 $O(1)$。

## 延伸

- 「借输入本身存状态」的同类招：[41. 缺失的第一个正数](0041-first-missing-positive.md) 用数组下标当哈希表；「生命游戏」（[LeetCode 289](https://leetcode.cn/problems/game-of-life/)）用高位比特存下一状态。
- 可以只用一个 `col0` 变量（`M[0][0]` 兼任第一行标记），但顺序更绕，两个变量更不容易错。
- 坑：别用「把要清的元素先改成一个特殊值（如 `None`）」——元素取值范围是整个 int，挑不出安全的哨兵，而且还得多扫一遍。

??? note "自测"

    ```python
    s = Solution()
    for mat, want in [
        ([[1, 1, 1], [1, 0, 1], [1, 1, 1]], [[1, 0, 1], [0, 0, 0], [1, 0, 1]]),
        ([[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]], [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]),
        ([[1]], [[1]]),
        ([[0]], [[0]]),
        ([[1, 0]], [[0, 0]]),
        ([[1], [0]], [[0], [0]]),
    ]:
        s.setZeroes(mat)
        assert mat == want
    ```
