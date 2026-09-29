---
description: "固定卖出日，买入日只需是前缀最小值——一遍扫描维护「至今最低价」，O(n) O(1)"
---

# 121. 买卖股票的最佳时机

[LeetCode 121](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/) · 简单 · 贪心算法

## 题

给一串每日股价 `prices`，只允许买一次、之后某天卖一次，求最大利润；赚不到钱就返回 0。

例：`prices = [7, 1, 5, 3, 6, 4]` → `5`（第 2 天 1 块买，第 5 天 6 块卖）。

## 一句话

枚举卖出日 `j`，最优买入价就是 `prices[0..j-1]` 的最小值——边扫边记最低价，利润一减就出来。

## 关键技巧

**枚举一端，另一端用前缀信息秒答。** 暴力是枚举 `(i, j)` 数对，$O(n^2)$。固定卖出日 `j` 后，要最大化 `prices[j] - prices[i]`，只需 `prices[i]` 最小——这是前缀最小值，扫描时顺手维护即可。

**为什么贪心不亏。** 对每个 `j`，「前缀最低价买入」是它的最优买入；所有 `j` 的最优取最大，就是全局最优——没有遗漏任何数对，只是把对 `i` 的枚举压缩成了一个变量。

**先更新答案还是先更新最低价都行。** 同一天买卖利润为 0，不会让答案变坏；答案初值 0 也自然处理了「一路下跌」的情况。

## 解

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        low, best = float("inf"), 0
        for p in prices:
            low = min(low, p)        # 至今最低买入价
            best = max(best, p - low)  # 今天卖出的最好结果
        return best
```

时间 $O(n)$，空间 $O(1)$。

## 延伸

- **同构题**：这是「差值最大」版的 [53. 最大子数组和](0053-maximum-subarray.md)——把价格做差分，利润就是差分数组的最大子段和。
- **股票系列的变体**（不限次数 122、最多两次 123、含冷冻期 309、含手续费 714）都不在热题 100 里，但统一解法是状态机 DP：`hold[i]` / `free[i]` 两个状态互相转移。
- **坑**：别先找全局最低点再往后找最高点——最低点可能在最后一天。

??? note "自测"

    ```python
    s = Solution()
    assert s.maxProfit([7, 1, 5, 3, 6, 4]) == 5
    assert s.maxProfit([7, 6, 4, 3, 1]) == 0
    assert s.maxProfit([5]) == 0
    assert s.maxProfit([2, 4, 1]) == 2
    ```
