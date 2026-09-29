---
description: "按「最后一间抢不抢」分两类：dp[i] = max(dp[i-1], dp[i-2] + nums[i])，选或不选型 DP 的原型"
---

# 198. 打家劫舍

[LeetCode 198](https://leetcode.cn/problems/house-robber/) · 中等 · 动态规划

## 题

一排房子各有金额 `nums`，不能同时偷相邻的两间，求能偷到的最大总额。

例：`nums = [2, 7, 9, 3, 1]` → `12`（偷第 1、3、5 间：2 + 9 + 1）。

## 一句话

看前 `i` 间的最优：第 `i` 间不偷，就是前 `i-1` 间的最优；偷，就只能接前 `i-2` 间的最优——两者取大。

## 关键技巧

**选或不选，按最后一个元素分类。** 这是子序列类最值 DP 的基本型。

- 状态：$f(i)$ = 只考虑前 $i$ 间房能偷到的最大金额。
- 转移：$f(i) = \max\big(f(i-1),\ f(i-2) + \text{nums}[i-1]\big)$。
- 初值：$f(0) = 0$，$f(1) = \text{nums}[0]$；用「前 $i$ 间」而不是「以第 $i$ 间结尾」定义，$f(-1)$ 这种越界就不会出现。
- 顺序：$i$ 递增。

**为什么状态定义成「前 i 间」而非「偷第 i 间」。** 「前 i 间最优」天然单调不减，转移只看两个前驱；若定义成「必须偷第 i 间」，前驱可能是 $i-2, i-3, \dots$ 任意一个，转移变贵。

**滚动两个变量。** 只依赖 $f(i-1), f(i-2)$。

## 解

```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        prev, cur = 0, 0  # f(i-2), f(i-1)
        for x in nums:
            prev, cur = cur, max(cur, prev + x)
        return cur
```

时间 $O(n)$，空间 $O(1)$。

## 延伸

- **环形排列**（LeetCode 213）：首尾不能同偷，拆成「去掉首」「去掉尾」两次线性 DP 取大。
- **树形排列**（LeetCode 337）：每个节点返回（偷、不偷）两个值，后序遍历合并——树形 DP 的入门题，思路同 [124. 二叉树中的最大路径和](0124-binary-tree-maximum-path-sum.md) 的「子树返回值」。
- **同形转移**：[70. 爬楼梯](0070-climbing-stairs.md) 是求和版，这里是最值版。

??? note "自测"

    ```python
    s = Solution()
    assert s.rob([1, 2, 3, 1]) == 4
    assert s.rob([2, 7, 9, 3, 1]) == 12
    assert s.rob([5]) == 5
    assert s.rob([2, 1, 1, 2]) == 4
    ```
