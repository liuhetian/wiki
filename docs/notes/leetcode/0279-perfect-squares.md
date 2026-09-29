---
description: "完全平方数当硬币、n 当金额，就是「凑出 n 的最少硬币数」——完全背包求最值"
---

# 279. 完全平方数

[LeetCode 279](https://leetcode.cn/problems/perfect-squares/) · 中等 · 动态规划

## 题

给正整数 `n`，把它写成若干个完全平方数（1, 4, 9, 16, …）之和，求最少需要几个。

例：`n = 12` → `3`（4 + 4 + 4）；`n = 13` → `2`（4 + 9）。

## 一句话

`dp[i] = 1 + min(dp[i - j²])`：枚举最后用的那个平方数 `j²`，剩下的 `i - j²` 已经算好了。

## 关键技巧

**识别成完全背包。** 物品是 $1^2, 2^2, \dots, \lfloor\sqrt n\rfloor^2$，每种可用无限次，求凑满容量 $n$ 的最少物品数——和 [322. 零钱兑换](0322-coin-change.md) 是同一道题换了皮。

- 状态：$f(i)$ = 和为 $i$ 最少需要几个平方数。
- 转移：$f(i) = 1 + \min_{j^2 \le i} f(i - j^2)$。
- 初值：$f(0) = 0$。任何 $i$ 都能用全 1 凑出来，所以不会无解。
- 顺序：$i$ 递增。

**为什么贪心不行。** 每次取不超过余量的最大平方数：`12 → 9 + 1 + 1 + 1` 要 4 个，而最优是 `4 + 4 + 4`。局部最大不保证全局最少，所以要 DP 枚举所有「最后一块」。

**数学捷径（知道即可）。** 四平方和定理：任何正整数至多 4 个平方数之和；且 $n = 4^a(8b+7)$ 时恰好要 4 个。据此可以 $O(\sqrt n)$ 判答案是 1、2、3、4 中的哪个。

## 解

```python
class Solution:
    def numSquares(self, n: int) -> int:
        squares = [j * j for j in range(1, isqrt(n) + 1)]
        dp = [0] + [n] * n  # 全 1 凑法是上界
        for i in range(1, n + 1):
            for sq in squares:
                if sq > i:
                    break
                dp[i] = min(dp[i], dp[i - sq] + 1)
        return dp[n]
```

时间 $O(n\sqrt n)$，空间 $O(n)$。

## 延伸

- **同构**：[322. 零钱兑换](0322-coin-change.md)，硬币面额任意、可能无解，要多一个「凑不出」的哨兵。
- **BFS 视角**：从 `n` 出发，每步减一个平方数，求到 0 的最少步数——层序 BFS 同样正确，思路见 [45. 跳跃游戏 II](0045-jump-game-ii.md)。
- **Python 超时的坑**：LeetCode 上 Python 跑 $O(n\sqrt n)$ 偏慢，可以把 `dp` 做成类级别缓存让多个用例共享。

??? note "自测"

    ```python
    s = Solution()
    assert s.numSquares(12) == 3
    assert s.numSquares(13) == 2
    assert s.numSquares(1) == 1
    assert s.numSquares(7) == 4
    ```
