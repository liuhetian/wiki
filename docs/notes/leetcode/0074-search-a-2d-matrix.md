---
description: "逐行有序且首尾相接的矩阵就是一条拉平的有序数组；下标 k 映射回 (k // n, k % n)，一次二分搞定"
---

# 74. 搜索二维矩阵

[LeetCode 74](https://leetcode.cn/problems/search-a-2d-matrix/) · 中等 · 二分查找

## 题

给一个 $m \times n$ 整数矩阵：每行从左到右非降序，且每行第一个数大于上一行最后一个数。判断 `target` 是否在矩阵里。

例：`matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3` → `true`；`target = 13` → `false`。

## 一句话

两条性质合起来说明按行读出来整体升序——把矩阵当成长 $mn$ 的虚拟数组，第 $k$ 个元素是 `matrix[k // n][k % n]`，直接二分。

## 关键技巧

**识别「虚拟有序数组」。** 「行内有序」+「下一行首 > 上一行尾」$\iff$ 行优先展开后全局有序。不需要真的拉平（那是 $O(mn)$），只需要下标映射：

$$
k \mapsto (\lfloor k / n \rfloor,\ k \bmod n)
$$

**二分模板不变**：左闭右开 $[lo, hi)$ 找第一个 `>= target` 的位置 `lo`，最后检查 `lo < mn` 且那个位置等于 `target`。不变量与 [35. 搜索插入位置](0035-search-insert-position.md) 完全一致。

**另一种写法**：先二分找「最后一个行首 `<= target`」的行，再在该行内二分——两次 $O(\log m) + O(\log n)$，总量一样是 $O(\log mn)$，代码多一截，好处是不做除法。

## 解

```python
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        lo, hi = 0, m * n  # 虚拟数组上的 [lo, hi)
        while lo < hi:
            mid = (lo + hi) // 2
            if matrix[mid // n][mid % n] >= target:
                hi = mid
            else:
                lo = mid + 1
        return lo < m * n and matrix[lo // n][lo % n] == target
```

时间 $O(\log mn)$，空间 $O(1)$。

## 延伸

- **只有行有序、列有序，没有首尾相接**：拉不平，二分失效。改用从右上角出发的「阶梯走法」，每步排除一行或一列，$O(m+n)$——见 [240. 搜索二维矩阵 II](0240-search-a-2d-matrix-ii.md)。本题当然也能用阶梯法，但浪费了更强的条件。
- 二维下标与一维下标的互换在 [54. 螺旋矩阵](0054-spiral-matrix.md)、[48. 旋转图像](0048-rotate-image.md) 这类矩阵题里也常用。

??? note "自测"

    ```python
    s = Solution()
    M = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]]
    assert s.searchMatrix(M, 3) is True
    assert s.searchMatrix(M, 13) is False
    assert s.searchMatrix(M, 60) is True and s.searchMatrix(M, 61) is False
    assert s.searchMatrix(M, 0) is False
    assert s.searchMatrix([[1]], 1) is True
    ```
