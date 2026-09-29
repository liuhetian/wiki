---
description: "先计数再选 top-k：大小为 k 的堆 O(n log k)；频次上界是 n，按频次分桶倒着捡，O(n)"
---

# 347. 前 K 个高频元素

[LeetCode 347](https://leetcode.cn/problems/top-k-frequent-elements/) · 中等 · 堆

## 题

给一个整数数组和 `k`，返回出现次数最多的 `k` 个元素，顺序任意。保证答案唯一，要求优于 $O(n \log n)$。

例：`nums = [1, 1, 1, 2, 2, 3], k = 2` → `[1, 2]`。

## 一句话

哈希表数频次，然后在「(元素, 频次)」上做 top-k：堆保留频次最大的 k 个，或按频次分桶从高到低收集。

## 关键技巧

**两步拆开：计数 + 选择。** 计数 $O(n)$ 没悬念，难点在从 $m$ 个不同元素里选频次最高的 k 个。

**堆：** 按频次维护大小为 k 的小顶堆，和 [215](0215-kth-largest-element-in-an-array.md) 同一招——堆顶是当前第 k 高的频次，更高的来了就替换。$O(m \log k)$。`heapq.nlargest(k, ...)` 内部就是这么做的。

**桶排序：利用值域有界。** 频次一定落在 $[1, n]$，所以开 $n + 1$ 个桶，`bucket[f]` 放所有频次为 $f$ 的元素，再从 $f = n$ 往下捡，捡够 k 个就停。这是用值域有界绕开比较排序 $\Omega(n \log n)$ 下界的典型手法。

## 解

=== "桶排序"

    ```python
    class Solution:
        def topKFrequent(self, nums: List[int], k: int) -> List[int]:
            bucket = [[] for _ in range(len(nums) + 1)]  # 频次 -> 元素列表
            for x, f in Counter(nums).items():
                bucket[f].append(x)
            res = []
            for f in range(len(nums), 0, -1):
                res.extend(bucket[f])
                if len(res) >= k:        # 答案唯一，恰好凑满 k 个
                    return res[:k]
            return res
    ```

=== "堆"

    ```python
    class Solution:
        def topKFrequent(self, nums: List[int], k: int) -> List[int]:
            cnt = Counter(nums)
            return heapq.nlargest(k, cnt.keys(), key=cnt.__getitem__)
    ```

桶排序：时间 $O(n)$，空间 $O(n)$。堆：时间 $O(n + m \log k)$，空间 $O(m)$，$m$ 为不同元素个数。

## 延伸

- 频次上也能跑快速选择，期望 $O(m)$——做法见 [215. 数组中的第K个最大元素](0215-kth-largest-element-in-an-array.md)。
- 计数用哈希表的更多套路见 [49. 字母异位词分组](0049-group-anagrams.md)。
- 坑：`Counter.most_common(k)` 在 k 小于不同元素数时内部也用堆，能用但面试官通常要你手写。

??? note "自测"

    ```python
    s = Solution()
    assert sorted(s.topKFrequent([1, 1, 1, 2, 2, 3], 2)) == [1, 2]
    assert s.topKFrequent([1], 1) == [1]
    assert sorted(s.topKFrequent([4, 1, -1, 2, -1, 2, 3], 2)) == [-1, 2]
    assert sorted(s.topKFrequent([5, 6, 7], 3)) == [5, 6, 7]  # 频次全相同，k = 全部
    ```
