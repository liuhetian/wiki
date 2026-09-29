---
description: "「除自己以外」= 左前缀积 × 右后缀积；输出数组先存前缀，再倒着乘一个滚动后缀，不用除法、O(1) 额外空间"
---

# 238. 除了自身以外数组的乘积

[LeetCode 238](https://leetcode.cn/problems/product-of-array-except-self/) · 中等 · 普通数组

## 题

给一个整数数组，返回数组 `answer`，其中 `answer[i]` 是除 `nums[i]` 以外所有元素的乘积。**不许用除法**，要求 $O(n)$。

例：`[1, 2, 3, 4]` → `[24, 12, 8, 6]`。

## 一句话

`answer[i] = (nums[0..i-1] 的积) × (nums[i+1..n-1] 的积)`，正扫一遍填左积，反扫一遍乘右积。

## 关键技巧

**把「挖掉一个」拆成左右两段。** 令 $L_i = \prod_{j<i} a_j$，$R_i = \prod_{j>i} a_j$，则答案是 $L_i \cdot R_i$。两组都能一遍线性递推：$L_{i+1} = L_i \cdot a_i$，$R_{i-1} = R_i \cdot a_i$，空的积为 1。

**为什么不用除法。** 总积除以 $a_i$ 碰到 0 就炸：一个 0 时只有那一位非零，两个以上 0 时全为 0，要分情况讨论。前后缀积天然处理 0，没有特判。

**省掉额外数组。** 输出数组不算额外空间：先把 $L$ 直接写进 `answer`，再从右往左用一个变量 `r` 滚动维护 $R_i$ 并乘进去。

「前缀 × 后缀」是一类通用招：凡是「除去第 $i$ 个之外的某种聚合」，且聚合满足结合律（积、和、max、gcd、OR……），都能这样 $O(n)$ 求出来。

## 解

```python
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        ans = [1] * n
        for i in range(1, n):
            ans[i] = ans[i - 1] * nums[i - 1]  # 左积
        r = 1
        for i in range(n - 1, -1, -1):
            ans[i] *= r
            r *= nums[i]  # 右积
        return ans
```

时间 $O(n)$，空间 $O(1)$（不计输出）。

## 延伸

- 前后缀分解的同类：[42. 接雨水](0042-trapping-rain-water.md) 的左最高、右最高数组。
- 「删掉一个元素后的最大子数组和」「去掉一个数后的 gcd」都是同一个套路：前缀聚合 + 后缀聚合，拼在断点两侧。
- 坑：LeetCode 保证乘积在 32 位范围内；其他语言要当心溢出，Python 不用管。

??? note "自测"

    ```python
    s = Solution()
    assert s.productExceptSelf([1, 2, 3, 4]) == [24, 12, 8, 6]
    assert s.productExceptSelf([-1, 1, 0, -3, 3]) == [0, 0, 9, 0, 0]
    assert s.productExceptSelf([0, 0]) == [0, 0]
    assert s.productExceptSelf([2, 3]) == [3, 2]
    ```
