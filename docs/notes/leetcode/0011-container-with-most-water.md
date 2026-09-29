---
description: "双指针从两端收缩，每次挪矮的那边——矮边在当前宽度下已取到最优，丢掉它不会错过答案"
---

# 11. 盛最多水的容器

[LeetCode 11](https://leetcode.cn/problems/container-with-most-water/) · 中等 · 双指针

## 题

数组 `height[i]` 是第 `i` 根竖线的高度。任选两根线和 x 轴围成容器，求能装的最多水量（面积 = 两线间距 × 较矮那根的高度）。

例：`[1, 8, 6, 2, 5, 4, 8, 3, 7]` → `49`（下标 1 和 8，宽 7、高 7）。

## 一句话

左右指针从两端往里走，谁矮谁动；途中记录最大面积。

## 关键技巧

**每一步排除一整行候选，而不是一个。** 设当前 `l < r`，且 `height[l] <= height[r]`。考虑所有以 `l` 为左端的容器 `(l, r')`，`r' < r`：

$$
\text{area}(l, r') = (r' - l) \cdot \min(h_l, h_{r'}) \le (r' - l) \cdot h_l < (r - l) \cdot h_l = \text{area}(l, r)
$$

宽度变小，高度又被 $h_l$ 封顶——**`l` 和它右边任何线组成的容器都不会比现在更大**。所以 `l` 可以永久丢掉，`l += 1`。

这就是「双指针收缩」的正确性模板：每步证明被丢掉的那一端「剩下的所有搭配都不优于已记录值」。$n^2$ 个候选对被按行/列成批剪掉，只走 $n$ 步。

**相等时挪哪边都行。** `h_l == h_r` 时上面的不等式对两边都成立，两边都能丢。

## 解

```python
class Solution:
    def maxArea(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1
        best = 0
        while l < r:
            if height[l] <= height[r]:
                best = max(best, (r - l) * height[l])
                l += 1
            else:
                best = max(best, (r - l) * height[r])
                r -= 1
        return best
```

时间 $O(n)$，空间 $O(1)$。

## 延伸

- 容易和 [42. 接雨水](0042-trapping-rain-water.md) 混：那题算的是**所有**柱子之间积的水总量，这题只选两根线、中间的柱子不挡水。两题都用「矮的那边先动」，理由不同。
- 「从两端收缩 + 证明丢掉一端安全」的同类：[15. 三数之和](0015-3sum.md) 内层的有序两数之和。
- 坑：别只挪「高度更小的下一根」做剪枝然后漏掉等高的情况——按上面的写法每次只动一步最稳。

??? note "自测"

    ```python
    s = Solution()
    assert s.maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]) == 49
    assert s.maxArea([1, 1]) == 1
    assert s.maxArea([4, 3, 2, 1, 4]) == 16
    assert s.maxArea([0, 0]) == 0
    ```
