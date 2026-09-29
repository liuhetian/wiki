---
description: "子数组和 = 两个前缀和之差；边扫边查「前缀 s−k 出现过几次」，有负数时滑窗失效就靠它"
---

# 560. 和为 K 的子数组

[LeetCode 560](https://leetcode.cn/problems/subarray-sum-equals-k/) · 中等 · 子串

## 题

给一个整数数组（可能有负数）和整数 `k`，统计和恰好为 `k` 的连续非空子数组个数。

例：`nums = [1, 2, 3], k = 3` → `2`（`[1, 2]` 和 `[3]`）。

## 一句话

`sum(i..j) = P[j+1] - P[i]`；扫到前缀和 `s` 时，答案加上「之前出现过多少次前缀和 `s - k`」。

## 关键技巧

**区间和转成两点差。** 令 $P_0 = 0$、$P_{j+1} = P_j + a_j$，则

$$
\sum_{t=i}^{j} a_t = P_{j+1} - P_i = k \iff P_i = P_{j+1} - k
$$

固定右端点，问题变成「前面有多少个前缀和等于某个值」——这就是 [1. 两数之和](0001-two-sum.md) 的「边扫边查」，只是查的对象换成前缀和、存的是出现次数而不是下标。

**`cnt[0] = 1` 不能漏。** 它代表空前缀 $P_0$，对应「从数组开头算起」的子数组。

**为什么不能用滑动窗口。** 滑窗依赖单调性——窗口扩大和变大、缩小和变小。有负数时这条不成立，左端该不该收说不清；前缀和 + 哈希不依赖符号。

## 解

```python
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        cnt = defaultdict(int)
        cnt[0] = 1  # 空前缀
        s = res = 0
        for x in nums:
            s += x
            res += cnt[s - k]  # 先查后存
            cnt[s] += 1
        return res
```

时间 $O(n)$，空间 $O(n)$。

## 延伸

- 前缀和搬到树上：[437. 路径总和 III](0437-path-sum-iii.md)，DFS 下行时存、回溯时删。
- 「和能被 k 整除的子数组」（[LeetCode 974](https://leetcode.cn/problems/subarray-sums-divisible-by-k/)）：查的是前缀和**模 k 相同**的个数，注意 Python 的 `%` 对负数已经返回非负。
- 求「最长」而不是「个数」时，哈希表存每个前缀和**第一次**出现的下标。
- 全是非负数时才能用滑窗，空间降到 $O(1)$。

??? note "自测"

    ```python
    s = Solution()
    assert s.subarraySum([1, 1, 1], 2) == 2
    assert s.subarraySum([1, 2, 3], 3) == 2
    assert s.subarraySum([1], 0) == 0
    assert s.subarraySum([1, -1, 0], 0) == 3
    assert s.subarraySum([0, 0, 0], 0) == 6
    ```
