---
description: "所有二分都写成「找第一个满足条件的位置」——左闭右开 [lo, hi)，循环结束 lo 就是答案，插入位置、lower_bound 一套模板"
---

# 35. 搜索插入位置

[LeetCode 35](https://leetcode.cn/problems/search-insert-position/) · 简单 · 二分查找

## 题

给一个无重复元素的升序数组和目标值，找到就返回下标，找不到就返回它按顺序应插入的位置。要求 $O(\log n)$。

例：`nums = [1, 3, 5, 6], target = 5` → `2`；`target = 2` → `1`；`target = 7` → `4`。

## 一句话

答案就是「第一个 `>= target` 的下标」——找到和插入是同一个问题，一个 lower_bound 全包。

## 关键技巧

**把二分问题统一改写成「单调谓词的分界点」。** 谓词 $P(i) = [nums_i \ge target]$ 在升序数组上是 `F F F T T T`，要找第一个 `T`。不管是「找目标」「找插入点」还是「找左边界」，都是这一句。

**左闭右开的不变量**（本站二分统一用这套）：

- $[0, lo)$ 里全是 `F`，$[hi, n)$ 里全是 `T`，未知区间是 $[lo, hi)$；
- 初始 `lo = 0, hi = n`——两侧已知区间为空，不变量平凡成立；`hi = n` 表示「全是 F 时答案为 n」。
- 取 `mid = (lo + hi) // 2`，$mid \in [lo, hi)$ 一定在未知区间里：
    - $P(mid)$ 为 `T` → `hi = mid`（mid 及右侧已知为 T）；
    - 否则 → `lo = mid + 1`（mid 及左侧已知为 F）。
- 每轮未知区间严格缩小，`lo == hi` 时未知区间为空，分界点就是 `lo`。

**不会死循环的理由**：`mid < hi` 恒成立，所以 `hi = mid` 一定让区间变小；`lo = mid + 1` 也一定变小。开闭一致，边界就不用猜。

## 解

```python
class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums)  # 未知区间 [lo, hi)
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] >= target:
                hi = mid
            else:
                lo = mid + 1
        return lo
```

时间 $O(\log n)$，空间 $O(1)$。Python 里等价于 `bisect.bisect_left(nums, target)`。

## 延伸

- **「最后一个 `<= target`」** = 「第一个 `> target`」减一——换个谓词，模板不动。[34. 在排序数组中查找元素的第一个和最后一个位置](0034-find-first-and-last-position-of-element-in-sorted-array.md) 就是两次调用这个模板。
- 同一模板套到二维：[74. 搜索二维矩阵](0074-search-a-2d-matrix.md)；套到非全序但谓词仍单调的数组：[153. 寻找旋转排序数组中的最小值](0153-find-minimum-in-rotated-sorted-array.md)。
- 坑：其他语言里 `(lo + hi) / 2` 会溢出，写 `lo + (hi - lo) / 2`；Python 整数无界，无此问题。

??? note "自测"

    ```python
    s = Solution()
    assert s.searchInsert([1, 3, 5, 6], 5) == 2
    assert s.searchInsert([1, 3, 5, 6], 2) == 1
    assert s.searchInsert([1, 3, 5, 6], 7) == 4
    assert s.searchInsert([1, 3, 5, 6], 0) == 0
    assert s.searchInsert([1], 1) == 0
    ```
