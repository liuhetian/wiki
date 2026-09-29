---
description: "拿末尾元素当标尺，「nums[i] <= nums[-1]」在旋转数组上是单调谓词 F…FT…T，最小值就是第一个 T"
---

# 153. 寻找旋转排序数组中的最小值

[LeetCode 153](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/) · 中等 · 二分查找

## 题

一个元素互不相同的升序数组被旋转了若干次（如 `[0,1,2,4,5,6,7]` 变成 `[4,5,6,7,0,1,2]`，也可能转回原样），返回其中的最小值。要求 $O(\log n)$。

例：`nums = [3, 4, 5, 1, 2]` → `1`；`nums = [11, 13, 15, 17]` → `11`。

## 一句话

后段每个数都 `<= nums[-1]`，前段每个数都 `> nums[-1]`——这个谓词单调，最小值就是后段的起点，一个 lower_bound 找出来。

## 关键技巧

**二分不需要数组有序，只需要谓词单调。** 旋转数组 = 大的前段 + 小的后段，后段以 `nums[-1]` 结尾。定义

$$
P(i) = [\,nums_i \le nums_{n-1}\,]
$$

前段所有元素都大于后段所有元素，自然大于 $nums_{n-1}$，所以前段全 `F`；后段升序且以 $nums_{n-1}$ 收尾，全 `T`。谓词形如 `F…F T…T`，第一个 `T` 就是最小值。没旋转时整个数组都是后段，答案是下标 0，同样成立。

**区间不变量**：左闭右开 $[lo, hi)$，$[0, lo)$ 全 `F`，$[hi, n)$ 全 `T`。因为 $P(n-1)$ 一定为 `T`，可以直接从 `hi = n - 1` 开始（下标 $n-1$ 已知为 T），循环结束 `lo` 就是答案，且一定合法。

**为什么和 `nums[-1]` 比而不是 `nums[0]`**：和 `nums[0]` 比，没旋转的数组会全是 `T`（`>= nums[0]`），分界点跑到 $n$，要特判。末尾元素在两种情况下都属于后段，无需特判。

## 解

```python
class Solution:
    def findMin(self, nums: List[int]) -> int:
        lo, hi = 0, len(nums) - 1  # [lo, hi) 未知；下标 n-1 已知满足谓词
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] <= nums[-1]:
                hi = mid
            else:
                lo = mid + 1
        return nums[lo]
```

时间 $O(\log n)$，空间 $O(1)$。

## 延伸

- **有重复元素**（LeetCode 154）：谓词不再单调（`[1,1,0,1]` 前后都有等于末尾的），改为与 `nums[hi]` 比，相等时 `hi -= 1`，最坏 $O(n)$。
- 找到最小值下标就是断点，再按 target 与 `nums[-1]` 的大小决定去前段还是后段做普通二分——这是 [33. 搜索旋转排序数组](0033-search-in-rotated-sorted-array.md) 的两步解法。
- 同一个「谓词单调即可二分」的思想：[34. 在排序数组中查找元素的第一个和最后一个位置](0034-find-first-and-last-position-of-element-in-sorted-array.md)、[4. 寻找两个正序数组的中位数](0004-median-of-two-sorted-arrays.md)（在切分位置上二分）。

??? note "自测"

    ```python
    s = Solution()
    assert s.findMin([3, 4, 5, 1, 2]) == 1
    assert s.findMin([4, 5, 6, 7, 0, 1, 2]) == 0
    assert s.findMin([11, 13, 15, 17]) == 11
    assert s.findMin([1]) == 1
    assert s.findMin([2, 1]) == 1
    base = list(range(10))
    assert all(s.findMin(base[k:] + base[:k]) == 0 for k in range(10))
    ```
