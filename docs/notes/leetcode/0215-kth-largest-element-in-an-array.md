---
description: "Top-k 两把刀：大小为 k 的小顶堆 O(n log k)，快速选择平均 O(n)；三路划分防住大量重复元素的退化"
---

# 215. 数组中的第K个最大元素

[LeetCode 215](https://leetcode.cn/problems/kth-largest-element-in-an-array/) · 中等 · 堆

## 题

给一个整数数组和 `k`，返回排序后第 `k` 大的元素（按位置算，重复值各占一位，不是第 k 个不同的值）。要求期望时间优于排序。

例：`nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4` → `4`。

## 一句话

维护一个只装 k 个元素的小顶堆，堆顶就是「目前第 k 大」；或者用快速选择，只递归包含第 k 大的那一侧。

## 关键技巧

**小顶堆找第 k 大——反直觉但对。** 堆里始终保留见过的最大的 k 个数，堆顶是这 k 个里最小的，也就是第 k 大。新数 `x` 比堆顶大就替换堆顶，否则丢弃。不变量：扫完前缀后，堆 = 前缀里最大的 k 个。$O(n \log k)$，适合数据流、k 远小于 n。

**快速选择 = 只走一边的快排。** 按 pivot 划分后，pivot 的最终位置确定了；目标下标在哪边就只处理哪边。期望规模每次减半：$n + n/2 + n/4 + \cdots = O(n)$。

**两个退化点必须防住：**

- **有序输入**：固定选首元素当 pivot，每次只切掉一个，$O(n^2)$——随机选 pivot。
- **大量重复值**（如全相同）：二路划分会把相等元素都丢到一边，同样 $O(n^2)$——用**三路划分**，把数组分成 `> pivot | == pivot | < pivot`，目标落在中段直接返回。

## 解

=== "快速选择（三路划分）"

    ```python
    class Solution:
        def findKthLargest(self, nums: List[int], k: int) -> int:
            while True:
                pivot = random.choice(nums)
                big = [x for x in nums if x > pivot]
                eq = [x for x in nums if x == pivot]
                if k <= len(big):
                    nums = big                   # 第 k 大在「更大」那一段
                elif k <= len(big) + len(eq):
                    return pivot                 # 落在等于 pivot 的中段
                else:
                    k -= len(big) + len(eq)
                    nums = [x for x in nums if x < pivot]
    ```

=== "小顶堆"

    ```python
    class Solution:
        def findKthLargest(self, nums: List[int], k: int) -> int:
            heap = nums[:k]
            heapq.heapify(heap)
            for x in nums[k:]:
                if x > heap[0]:              # 比当前第 k 大还大，替换进来
                    heapq.heapreplace(heap, x)
            return heap[0]
    ```

快速选择：期望时间 $O(n)$，空间 $O(n)$（这里为了清晰用了新列表；原地划分可做到 $O(1)$）。小顶堆：时间 $O(n \log k)$，空间 $O(k)$。

## 延伸

- 频次版 top-k 见 [347. 前 K 个高频元素](0347-top-k-frequent-elements.md)；动态维护中位数用两个堆，见 [295. 数据流的中位数](0295-find-median-from-data-stream.md)。
- 值域小（如 $[-10^4, 10^4]$）时计数排序从大往小累加也是 $O(n + V)$。
- 三路划分就是荷兰国旗问题，见 [75. 颜色分类](0075-sort-colors.md)。
- 有序结构里的第 k 小见 [230. 二叉搜索树中第 K 小的元素](0230-kth-smallest-element-in-a-bst.md)。

??? note "自测"

    ```python
    s = Solution()
    assert s.findKthLargest([3, 2, 1, 5, 6, 4], 2) == 5
    assert s.findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) == 4
    assert s.findKthLargest([1], 1) == 1
    assert s.findKthLargest([7] * 1000, 500) == 7          # 全重复
    assert s.findKthLargest(list(range(10000)), 1) == 9999  # 有序输入
    ```
