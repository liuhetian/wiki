---
description: "边扫边查「补数见过没」，一遍哈希 O(n)；先查后存，天然避开同一元素用两次"
---

# 1. 两数之和

[LeetCode 1](https://leetcode.cn/problems/two-sum/) · 简单 · 哈希

## 题

给一个整数数组 `nums` 和目标值 `target`，找出和为 `target` 的两个元素，返回它们的下标。保证恰好有一组解，同一个元素不能用两次。

例：`nums = [2, 7, 11, 15], target = 9` → `[0, 1]`。

## 一句话

扫到 `x` 时只问一件事——`target - x` 之前出现过没有；哈希表把这个问题从 $O(n)$ 降到 $O(1)$。

## 关键技巧

**把「找一对」改写成「对每个元素找它的补数」。** 暴力双循环是在枚举数对，$O(n^2)$；换个问法，固定右端点 `j`，要找的左端点只有一个值 `target - nums[j]`，于是问题退化成「查某个值在不在已扫过的前缀里」——这正是哈希表的活。

**先查后存。** 扫到 `j` 时先查补数、再把 `nums[j]` 存进表：表里此刻只有 `j` 之前的元素，同一个元素用两次的情况（`target = 2x` 且 `x` 只出现一次）自动排除，不用特判。

## 解

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}  # 值 -> 下标，只存扫过的前缀
        for j, x in enumerate(nums):
            if target - x in seen:
                return [seen[target - x], j]
            seen[x] = j
        return []
```

时间 $O(n)$，空间 $O(n)$。

## 延伸

- **数组有序时**用双指针，空间降到 $O(1)$——见 [15. 三数之和](0015-3sum.md)，它就是外层固定一个数、内层跑有序两数之和。
- **「前缀里查某个值」是一整类题的骨架**：[560. 和为 K 的子数组](0560-subarray-sum-equals-k.md) 查的是前缀和 `s - k`，[128. 最长连续序列](0128-longest-consecutive-sequence.md) 查的是 `x - 1`。

??? note "自测"

    ```python
    s = Solution()
    assert s.twoSum([2, 7, 11, 15], 9) == [0, 1]
    assert s.twoSum([3, 2, 4], 6) == [1, 2]
    assert s.twoSum([3, 3], 6) == [0, 1]
    ```
