---
description: "负数会让最小变最大，所以以 i 结尾同时维护最大积和最小积两个状态，遇到负数二者互换角色"
---

# 152. 乘积最大子数组

[LeetCode 152](https://leetcode.cn/problems/maximum-product-subarray/) · 中等 · 动态规划

## 题

给整数数组 `nums`（可含负数和 0），找乘积最大的非空连续子数组，返回这个乘积。

例：`nums = [2, 3, -2, 4]` → `6`（`[2, 3]`）；`nums = [-2, 3, -4]` → `24`（整个数组）。

## 一句话

以 `i` 结尾的最大积，可能来自之前的最大积 × `x`，也可能来自之前的**最小**积 × `x`（`x` 为负时），或者 `x` 自己另起。

## 关键技巧

**最值 DP 在乘法下不满足「最优子结构」，补一个状态。** 加法版 [53. 最大子数组和](0053-maximum-subarray.md) 只要记以 $i$ 结尾的最大和；乘法下，一个很负的积乘上负数会翻成很大的正数——光记最大值会丢掉未来的最优。所以同时记最大和最小：

- 状态：$\text{hi}(i)$、$\text{lo}(i)$ = 以 `nums[i]` 结尾的子数组的最大积、最小积。
- 转移：候选集合 $\{x,\ \text{hi}(i-1)\cdot x,\ \text{lo}(i-1)\cdot x\}$，取 max 得 $\text{hi}(i)$，取 min 得 $\text{lo}(i)$。
- 初值：$\text{hi}(0) = \text{lo}(0) = \text{nums}[0]$。
- 答案：$\max_i \text{hi}(i)$。

**0 的处理是自动的。** 遇到 0，三个候选里有 0 和 `x` 本身（也是 0），下一步的「`x` 自己另起」就等于从 0 之后重新开始。

**另一种思路（知道即可）。** 不含 0 的一段里，最大积要么是整段，要么是去掉最左或最右第一个负数之后的部分——所以前缀积和后缀积各扫一遍取最大，遇 0 重置为 1。

## 解

```python
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        hi = lo = best = nums[0]
        for x in nums[1:]:
            cand = (x, hi * x, lo * x)
            hi, lo = max(cand), min(cand)  # 同时更新，别用改过的 hi 算 lo
            best = max(best, hi)
        return best
```

时间 $O(n)$，空间 $O(1)$。

## 延伸

- **加法版**：[53. 最大子数组和](0053-maximum-subarray.md)，只需一个状态。
- **「一个状态不够就补一个」**：[121. 买卖股票的最佳时机](0121-best-time-to-buy-and-sell-stock.md) 的状态机版本是持股 / 不持股两个状态，思路同源。
- **坑**：`hi`、`lo` 必须用旧值同时算，先改 `hi` 再用新 `hi` 算 `lo` 会出错。

??? note "自测"

    ```python
    s = Solution()
    assert s.maxProduct([2, 3, -2, 4]) == 6
    assert s.maxProduct([-2, 0, -1]) == 0
    assert s.maxProduct([-2, 3, -4]) == 24
    assert s.maxProduct([-2]) == -2
    assert s.maxProduct([0, 2]) == 2
    ```
