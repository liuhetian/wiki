---
description: "旋转数组从任意 mid 切开，总有一半是有序的——只在有序那半里判断 target 在不在，不在就去另一半"
---

# 33. 搜索旋转排序数组

[LeetCode 33](https://leetcode.cn/problems/search-in-rotated-sorted-array/) · 中等 · 二分查找

## 题

一个元素互不相同的升序数组在某个未知位置被旋转过（如 `[0,1,2,4,5,6,7]` 变成 `[4,5,6,7,0,1,2]`）。在里面找 `target`，返回下标，不存在返回 `-1`。要求 $O(\log n)$。

例：`nums = [4, 5, 6, 7, 0, 1, 2], target = 0` → `4`；`target = 3` → `-1`。

## 一句话

每次取 `mid`，先判断左半 `[lo, mid]` 还是右半 `[mid, hi]` 是有序的；target 落在有序那半的值域里就收缩过去，否则去另一半。

## 关键技巧

**旋转数组的结构：两段升序，前段整体大于后段。** 任取 `mid`，`nums[lo] <= nums[mid]` 说明 `[lo, mid]` 没跨过断点、是有序的；否则 `[mid, hi]` 有序。有序区间能用首尾值 $O(1)$ 判断 target 在不在里面——这就是能二分的理由。

**区间不变量**：这里用左闭右闭 $[lo, hi]$，不变量是「若 target 存在，它一定在 $[lo, hi]$ 内」。

- 命中 `nums[mid] == target` 直接返回。
- 左半有序（`nums[lo] <= nums[mid]`）：若 `nums[lo] <= target < nums[mid]`，target 只可能在 $[lo, mid-1]$，否则只可能在 $[mid+1, hi]$。
- 右半有序：若 `nums[mid] < target <= nums[hi]`，去 $[mid+1, hi]$，否则去 $[lo, mid-1]$。

每步排除 `mid` 和另一半，不变量保持，区间严格缩小；`lo > hi` 时区间空，target 不存在。

**为什么用闭区间**：判断有序要读 `nums[hi]`，闭区间下 `hi` 始终是合法下标，比开区间少一次 `-1`。

**判断有序为什么是 `<=`**：`lo == mid` 时（区间只剩一两个元素）左半只有一个数，本身有序，必须归到左半分支。

## 解

```python
class Solution:
    def search(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1  # 闭区间 [lo, hi]
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[lo] <= nums[mid]:  # 左半 [lo, mid] 有序
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:  # 右半 [mid, hi] 有序
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return -1
```

时间 $O(\log n)$，空间 $O(1)$。

## 延伸

- **两步走的写法**：先用 [153. 寻找旋转排序数组中的最小值](0153-find-minimum-in-rotated-sorted-array.md) 找到断点，再在对应那段上跑普通二分——更好记，一样 $O(\log n)$。
- **有重复元素**（LeetCode 81）：`nums[lo] == nums[mid] == nums[hi]` 时分不清哪半有序，只能 `lo += 1; hi -= 1`，最坏退化 $O(n)$。
- 基础模板见 [35. 搜索插入位置](0035-search-insert-position.md)。

??? note "自测"

    ```python
    s = Solution()
    assert s.search([4, 5, 6, 7, 0, 1, 2], 0) == 4
    assert s.search([4, 5, 6, 7, 0, 1, 2], 3) == -1
    assert s.search([1], 0) == -1
    assert s.search([1, 3], 3) == 1
    assert s.search([3, 1], 1) == 1
    assert s.search([5, 1, 3], 5) == 0
    assert all(s.search([4, 5, 6, 7, 0, 1, 2], v) == i for i, v in enumerate([4, 5, 6, 7, 0, 1, 2]))
    ```
