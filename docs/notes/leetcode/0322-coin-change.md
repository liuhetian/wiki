---
description: "完全背包求最值：dp[a] = 1 + min(dp[a - c])，用 amount+1 当「凑不出」的哨兵，省掉无穷大判断"
---

# 322. 零钱兑换

[LeetCode 322](https://leetcode.cn/problems/coin-change/) · 中等 · 动态规划

## 题

给若干种硬币面额 `coins`（每种无限个）和目标金额 `amount`，求凑出该金额最少要几枚硬币；凑不出返回 -1。

例：`coins = [1, 2, 5], amount = 11` → `3`（5 + 5 + 1）；`coins = [2], amount = 3` → `-1`。

## 一句话

枚举最后一枚硬币 `c`：`dp[a] = min(dp[a - c]) + 1`，金额从小到大填表。

## 关键技巧

**完全背包，最值型。**

- 状态：$f(a)$ = 凑出金额 $a$ 的最少硬币数。
- 转移：$f(a) = 1 + \min_{c \in \text{coins},\, c \le a} f(a - c)$。
- 初值：$f(0) = 0$；其余设为「不可达」。
- 顺序：$a$ 递增。外层金额、内层硬币，或外层硬币、内层金额正序，求最值时两种都对。

**哨兵代替无穷大。** 硬币面额至少为 1，所以任何可行解不超过 `amount` 枚。把「不可达」设为 `amount + 1`，`+1` 后仍比任何可行解大，`min` 自动排除它；最后看 `dp[amount]` 是否还等于哨兵即可。

**为什么贪心不行。** 面额 `[1, 3, 4]` 凑 6：贪心取 4 + 1 + 1 要 3 枚，最优 3 + 3 只要 2 枚。只有特殊面额体系（如人民币）贪心才对。

**外层循环的顺序只在「计数」时要紧。** 求方案数时，外层硬币 = 组合数（LeetCode 518），外层金额 = 排列数（LeetCode 377）；求最值不区分。

## 解

```python
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        INF = amount + 1               # 任何可行解都 ≤ amount
        dp = [0] + [INF] * amount
        for c in coins:                # 完全背包：金额正序，同一枚可重复用
            for a in range(c, amount + 1):
                dp[a] = min(dp[a], dp[a - c] + 1)
        return dp[amount] if dp[amount] < INF else -1
```

时间 $O(n \cdot \text{amount})$，$n$ 为面额种数；空间 $O(\text{amount})$。

## 延伸

- **换皮题**：[279. 完全平方数](0279-perfect-squares.md)，硬币是平方数、必有解。
- **0-1 背包对照**：[416. 分割等和子集](0416-partition-equal-subset-sum.md) 每件物品只能用一次，内层要**倒序**；这里可重复用，内层**正序**——一个方向之差。
- **求方案数**：LeetCode 518 零钱兑换 II，`min` 换成 `+`，初值 `dp[0] = 1`。

??? note "自测"

    ```python
    s = Solution()
    assert s.coinChange([1, 2, 5], 11) == 3
    assert s.coinChange([2], 3) == -1
    assert s.coinChange([1], 0) == 0
    assert s.coinChange([1, 3, 4], 6) == 2
    assert s.coinChange([186, 419, 83, 408], 6249) == 20
    ```
