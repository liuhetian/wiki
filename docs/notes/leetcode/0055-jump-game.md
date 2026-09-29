---
description: "只维护「最远能到哪」一个数：可达区间必然连续，扫到够不着的位置就失败"
---

# 55. 跳跃游戏

[LeetCode 55](https://leetcode.cn/problems/jump-game/) · 中等 · 贪心算法

## 题

数组 `nums` 里每个数是在该位置最多能往前跳几步。从下标 0 出发，问能不能到达最后一个下标。

例：`nums = [2, 3, 1, 1, 4]` → `true`；`nums = [3, 2, 1, 0, 4]` → `false`（都会卡在下标 3 的 0 上）。

## 一句话

从左往右扫，维护最远可达下标 `reach`；某个 `i > reach` 说明 `i` 根本到不了，失败，否则用 `i + nums[i]` 刷新 `reach`。

## 关键技巧

**可达集合是一段前缀。** 能到 `i` 就能到 `i` 之前的所有位置——从 0 出发跳到 `i` 的路上，每一跳都能少跳几步停在中间。所以「哪些位置可达」这个集合不用存，一个右端点 `reach` 就够描述。

**为什么贪心不亏。** 不需要决定每步具体跳到哪；只要 `i` 在可达前缀里，它能扩展到的 `i + nums[i]` 就都可达。扫一遍把所有可达位置的扩展取最大，就是精确的可达范围，没有任何取舍。

**提前结束。** `reach >= n - 1` 即可返回；遇到 `i > reach` 即可返回失败——后面的位置更远，更到不了。

## 解

```python
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        reach = 0
        for i, step in enumerate(nums):
            if i > reach:           # 这一格已经够不着
                return False
            reach = max(reach, i + step)
            if reach >= len(nums) - 1:
                return True
        return True
```

时间 $O(n)$，空间 $O(1)$。

## 延伸

- **求最少跳几次**：[45. 跳跃游戏 II](0045-jump-game-ii.md)，把同一个 `reach` 按「跳数」分层，就是隐式 BFS。
- **区间覆盖的视角**：每个位置给出区间 `[i, i + nums[i]]`，问从 0 起的区间能否连成一片覆盖到末尾——与 [56. 合并区间](0056-merge-intervals.md) 同源。
- **坑**：只有一个元素时直接可达，`nums[0] = 0` 也返回 `true`。

??? note "自测"

    ```python
    s = Solution()
    assert s.canJump([2, 3, 1, 1, 4]) is True
    assert s.canJump([3, 2, 1, 0, 4]) is False
    assert s.canJump([0]) is True
    assert s.canJump([0, 1]) is False
    ```
