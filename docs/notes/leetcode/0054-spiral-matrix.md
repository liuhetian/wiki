---
description: "维护上下左右四条边界，一圈走四条边、每走完一条就把那条边界往里收，收过头即停，不用 visited"
---

# 54. 螺旋矩阵

[LeetCode 54](https://leetcode.cn/problems/spiral-matrix/) · 中等 · 矩阵

## 题

给一个 `m × n` 矩阵，按顺时针螺旋顺序（从左上角开始，向右、向下、向左、向上一圈圈往里）返回所有元素。

例：`[[1, 2, 3], [4, 5, 6], [7, 8, 9]]` → `[1, 2, 3, 6, 9, 8, 7, 4, 5]`。

## 一句话

`top/bottom/left/right` 四条边界夹住未访问区域，依次走上边、右边、下边、左边，每走一条收一条边界。

## 关键技巧

**边界即状态。** 未访问的部分永远是一个矩形 `[top, bottom] × [left, right]`。一圈拆成四段：

1. 上边：`top` 行从 `left` 到 `right`，然后 `top += 1`；
2. 右边：`right` 列从 `top` 到 `bottom`，然后 `right -= 1`；
3. 下边：`bottom` 行从 `right` 到 `left`，然后 `bottom -= 1`；
4. 左边：`left` 列从 `bottom` 到 `top`，然后 `left += 1`。

**第 3、4 步前要重新检查。** 走完上边和右边后，矩形可能已经空了——比如只剩一行时，上边走完 `top > bottom`，如果不检查，下边会把同一行倒着再走一遍。所以第 3 步要求 `top <= bottom`，第 4 步要求 `left <= right`。

**对比 visited + 方向数组。** 另一种写法是四个方向轮转、撞墙或撞到访问过的格就右转，需要 $O(mn)$ 的 visited；边界法是 $O(1)$ 额外空间，而且没有「转向」的判断。

## 解

```python
class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        top, bottom = 0, len(matrix) - 1
        left, right = 0, len(matrix[0]) - 1
        res = []
        while top <= bottom and left <= right:
            for j in range(left, right + 1):
                res.append(matrix[top][j])
            top += 1
            for i in range(top, bottom + 1):
                res.append(matrix[i][right])
            right -= 1
            if top <= bottom:
                for j in range(right, left - 1, -1):
                    res.append(matrix[bottom][j])
                bottom -= 1
            if left <= right:
                for i in range(bottom, top - 1, -1):
                    res.append(matrix[i][left])
                left += 1
        return res
```

时间 $O(mn)$，空间 $O(1)$（不计输出）。

## 延伸

- 反向题「螺旋矩阵 II」（[LeetCode 59](https://leetcode.cn/problems/spiral-matrix-ii/)）：按同样的边界法把 `1..n²` 填进去。
- 同为「按层处理矩阵」：[48. 旋转图像](0048-rotate-image.md) 也可以一圈一圈地四元素轮换。
- Python 花式写法 `matrix.pop(0) + spiral(zip(*matrix)[::-1])`（取第一行、剩下的逆时针转 90°）很短，但每次转置是 $O(mn)$，总体 $O(mn \cdot \min(m, n))$。

??? note "自测"

    ```python
    s = Solution()
    assert s.spiralOrder([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) == [1, 2, 3, 6, 9, 8, 7, 4, 5]
    assert s.spiralOrder([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]) == [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
    assert s.spiralOrder([[1]]) == [1]
    assert s.spiralOrder([[1, 2, 3]]) == [1, 2, 3]
    assert s.spiralOrder([[1], [2], [3]]) == [1, 2, 3]
    ```
