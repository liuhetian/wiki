---
description: "只从「序列起点」（x-1 不在集合里）往后数，每个数至多被走两次，不排序也能 O(n)"
---

# 128. 最长连续序列

[LeetCode 128](https://leetcode.cn/problems/longest-consecutive-sequence/) · 中等 · 哈希

## 题

给一个未排序的整数数组，求数值上连续的数字（不要求在数组里相邻）最长能连成多长。要求 $O(n)$。

例：`[100, 4, 200, 1, 3, 2]` → `4`（`1, 2, 3, 4`）。

## 一句话

丢进 set，只在 `x - 1` 不存在时从 `x` 开始往上数——每条连续段只被数一遍。

## 关键技巧

**排序是 $O(n \log n)$，题目卡死了 $O(n)$，所以只能靠哈希的 $O(1)$ 查询。** 最朴素的想法是对每个 `x` 都往上查 `x+1, x+2, …`，但段内每个数都当一次起点，最坏退化到 $O(n^2)$（比如 `1..n`）。

**只从起点出发。** `x` 是某条连续段的起点，当且仅当 `x - 1` 不在集合里。只对起点往上数，那么每条段恰好被完整走一次，所有段长之和 $\le n$；加上外层对每个数做一次 $O(1)$ 的起点判断，总共 $O(n)$。

**遍历 set 而不是原数组。** 原数组有重复值时，同一个起点会被重复展开——`[1, 1, 1, …, 1, 2, 3, …]` 这种输入会让遍历数组退化；遍历去重后的 set 就没有这个问题。

## 解

```python
class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        s = set(nums)
        best = 0
        for x in s:
            if x - 1 in s:  # 不是起点，交给起点去数
                continue
            y = x
            while y + 1 in s:
                y += 1
            best = max(best, y - x + 1)
        return best
```

时间 $O(n)$，空间 $O(n)$。

## 延伸

- 和 [1. 两数之和](0001-two-sum.md) 同骨架：都是「查某个值在不在集合里」，这里查的是 `x - 1` 和 `x + 1`。
- 另一种写法是并查集，把 `x` 和 `x + 1` 合并，最后取最大分量；同样近似 $O(n)$，但常数大、代码长。
- 若要支持**动态插入**，可以用哈希表只在段的两个端点存段长：插入 `x` 时读 `left = len[x-1]`、`right = len[x+1]`，新段长 `left + right + 1` 写回两端。

??? note "自测"

    ```python
    s = Solution()
    assert s.longestConsecutive([100, 4, 200, 1, 3, 2]) == 4
    assert s.longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]) == 9
    assert s.longestConsecutive([1, 0, 1, 2]) == 3
    assert s.longestConsecutive([]) == 0
    assert s.longestConsecutive([-1, -2, 5]) == 2
    ```
