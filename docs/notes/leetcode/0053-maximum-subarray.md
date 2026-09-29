---
description: "Kadane：以 i 结尾的最优只有「接上前面」或「另起炉灶」两种，前面的累计和为负就扔——一维 DP 压成一个变量"
---

# 53. 最大子数组和

[LeetCode 53](https://leetcode.cn/problems/maximum-subarray/) · 中等 · 普通数组

## 题

给一个整数数组，找和最大的连续非空子数组，返回这个最大和。

例：`[-2, 1, -3, 4, -1, 2, 1, -5, 4]` → `6`（`[4, -1, 2, 1]`）。

## 一句话

`cur` = 以当前元素结尾的最大和，`cur = max(x, cur + x)`；全局最大就是所有 `cur` 里最大的。

## 关键技巧

**按「以谁结尾」切分状态。** 令 $f_i$ 为以 $a_i$ 结尾的最大子数组和。这个子数组要么只有 $a_i$ 自己，要么是「以 $a_{i-1}$ 结尾的某个子数组 + $a_i$」，后者取最优就是 $f_{i-1} + a_i$：

$$
f_i = \max(a_i,\ f_{i-1} + a_i) = a_i + \max(f_{i-1}, 0)
$$

答案是 $\max_i f_i$。$f_i$ 只依赖 $f_{i-1}$，一个变量滚动即可。

**直觉：前缀是负债就甩掉。** $f_{i-1} < 0$ 时接上它只会拖后腿，不如从 $a_i$ 重新开始。

**另一视角：前缀和。** 子数组和 $= P_{j} - P_i$，要它最大就是对每个 $j$ 减去之前最小的前缀和——和「买卖股票」一模一样。

## 解

```python
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        cur = best = nums[0]
        for x in nums[1:]:
            cur = max(x, cur + x)
            best = max(best, cur)
        return best
```

时间 $O(n)$，空间 $O(1)$。

## 延伸

- 前缀和视角的同构题：[121. 买卖股票的最佳时机](0121-best-time-to-buy-and-sell-stock.md)，「最大 $P_j - \min_{i<j} P_i$」。
- 乘积版 [152. 乘积最大子数组](0152-maximum-product-subarray.md)：负负得正，要同时维护最大和最小。
- 进阶要求分治：区间最大和 = max(左半、右半、跨中点)，$O(n \log n)$；再给每段维护「总和/最大前缀/最大后缀/最大子段」四元组，就是线段树支持区间查询的写法。
- 坑：`cur`、`best` 初值别设 0——全负数组的答案是最大的那个负数，不是 0。

??? note "自测"

    ```python
    s = Solution()
    assert s.maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == 6
    assert s.maxSubArray([1]) == 1
    assert s.maxSubArray([5, 4, -1, 7, 8]) == 23
    assert s.maxSubArray([-3, -1, -2]) == -1
    ```
