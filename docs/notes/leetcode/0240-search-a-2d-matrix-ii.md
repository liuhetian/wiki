---
description: "从右上角出发：它是行最大、列最小，每比一次就能删掉一整行或一整列，O(m+n)"
---

# 240. 搜索二维矩阵 II

[LeetCode 240](https://leetcode.cn/problems/search-a-2d-matrix-ii/) · 中等 · 矩阵

## 题

`m × n` 矩阵每行从左到右升序、每列从上到下升序（但下一行开头不一定大于上一行结尾）。判断 `target` 在不在里面。

例：

```text
[[ 1,  4,  7, 11, 15],
 [ 2,  5,  8, 12, 19],
 [ 3,  6,  9, 16, 22],
 [10, 13, 14, 17, 24],
 [18, 21, 23, 26, 30]]
```

`target = 5` → `True`；`target = 20` → `False`。

## 一句话

站在右上角：比 `target` 大就左移（删这一列），比 `target` 小就下移（删这一行），相等就找到。

## 关键技巧

**找一个「一大一小」的角。** 右上角元素 `x` 是它所在行的最大值、所在列的最小值：

- `x > target`：这一列 `x` 以下都 $\ge x > $ target，整列可以删——左移；
- `x < target`：这一行 `x` 以左都 $\le x < $ target，整行可以删——下移。

**每步删一行或一列，最多 $m + n$ 步。** 未搜索区域始终是以当前位置为右上角的子矩阵，不变量是「target 若存在，一定在这个子矩阵里」。

**左上角和右下角不行。** 左上角是行最小、列最小，`x < target` 时往右往下都可能——没法排除。左下角对称，也可以用。

本质上它和 [11. 盛最多水的容器](0011-container-with-most-water.md) 是同一个招：在二维候选空间里每步砍掉一整行/列。

## 解

```python
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        i, j = 0, n - 1
        while i < m and j >= 0:
            x = matrix[i][j]
            if x == target:
                return True
            if x > target:
                j -= 1
            else:
                i += 1
        return False
```

时间 $O(m + n)$，空间 $O(1)$。

## 延伸

- 对比 [74. 搜索二维矩阵](0074-search-a-2d-matrix.md)：那题整体有序（下一行开头大于上一行结尾），直接当一维数组二分，$O(\log mn)$。这题只有行列各自有序，不能整体二分。
- 每行二分一次是 $O(m \log n)$，行少列多时反而更快。
- 同样的「杨氏矩阵阶梯走法」可以数「矩阵中 $\le x$ 的元素个数」，是「有序矩阵中第 K 小的元素」（[LeetCode 378](https://leetcode.cn/problems/kth-smallest-element-in-a-sorted-matrix/)）的二分判定函数。

??? note "自测"

    ```python
    s = Solution()
    M = [
        [1, 4, 7, 11, 15],
        [2, 5, 8, 12, 19],
        [3, 6, 9, 16, 22],
        [10, 13, 14, 17, 24],
        [18, 21, 23, 26, 30],
    ]
    assert s.searchMatrix(M, 5) is True
    assert s.searchMatrix(M, 20) is False
    assert s.searchMatrix(M, 1) is True
    assert s.searchMatrix(M, 30) is True
    assert s.searchMatrix(M, 0) is False
    assert s.searchMatrix([[-5]], -5) is True
    assert s.searchMatrix([[1, 3]], 2) is False
    ```
