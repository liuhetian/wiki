---
description: "隐式 BFS：当前跳数能覆盖的区间是一层，走到层边界才加一跳，下一层边界取层内最远可达"
---

# 45. 跳跃游戏 II

[LeetCode 45](https://leetcode.cn/problems/jump-game-ii/) · 中等 · 贪心算法

## 题

数组 `nums` 里每个数是在该位置最多能往前跳几步，从下标 0 出发，保证能到最后一个下标，求最少跳几次。

例：`nums = [2, 3, 1, 1, 4]` → `2`（0 → 1 → 4）。

## 一句话

`k` 跳能到的位置是一段连续区间；扫到当前区间的右边界 `end` 时，必须再跳一次，新边界是区间内所有位置能到的最远处 `far`。

## 关键技巧

**把 BFS 的「层」压成区间。** 从 0 出发做 BFS，第 `k` 层就是恰好 `k` 跳首次到达的位置。由 [55. 跳跃游戏](0055-jump-game.md) 的结论，可达集合总是前缀，所以每一层是一段连续区间 `[start, end]`——不用队列，两个指针就能表示一层。

**层内扫描求下一层边界。** 扫第 `k` 层时，用 `far = max(far, i + nums[i])` 记录下一层的右端；`i` 走到 `end` 就「出层」：`jumps += 1`，`end = far`。

**为什么贪心不亏。** 它就是 BFS，BFS 按层扩展天然给出最短步数；「贪心」只体现在不去关心具体跳到层里哪个点——层内任何点都只花 `k` 跳，谁能跳得最远就让谁定义下一层。

**循环只到 `n - 2`。** 站在最后一格不需要再跳；若扫到 `n - 1`，恰好 `i == end` 时会多算一跳。

## 解

```python
class Solution:
    def jump(self, nums: List[int]) -> int:
        jumps = end = far = 0
        for i in range(len(nums) - 1):  # 终点不用再起跳
            far = max(far, i + nums[i])
            if i == end:                # 当前层扫完，必须再跳一次
                jumps += 1
                end = far
        return jumps
```

时间 $O(n)$，空间 $O(1)$。

## 延伸

- **只问能不能到**：[55. 跳跃游戏](0055-jump-game.md)，同一个 `far`，不分层。
- **显式 BFS 的原型**：[102. 二叉树的层序遍历](0102-binary-tree-level-order-traversal.md)、[994. 腐烂的橘子](0994-rotting-oranges.md)——按层计数的套路相同，这里只是层恰好连续。
- **DP 写法** `dp[i] = min(dp[j] + 1)` 是 $O(n^2)$，能过但没必要。

??? note "自测"

    ```python
    s = Solution()
    assert s.jump([2, 3, 1, 1, 4]) == 2
    assert s.jump([2, 3, 0, 1, 4]) == 2
    assert s.jump([0]) == 0
    assert s.jump([1, 1, 1, 1]) == 3
    ```
