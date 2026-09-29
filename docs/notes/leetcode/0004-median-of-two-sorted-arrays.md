---
description: "不二分值，二分「短数组切在哪」：左半凑够一半元素后，切口合法等价于交叉比较两对边界，这个条件对切口位置单调"
---

# 4. 寻找两个正序数组的中位数

[LeetCode 4](https://leetcode.cn/problems/median-of-two-sorted-arrays/) · 困难 · 二分查找

## 题

给两个升序数组 `A`（长 $m$）、`B`（长 $n$），返回两者合并后的中位数。要求 $O(\log(m+n))$。

例：`A = [1, 3], B = [2]` → `2.0`；`A = [1, 2], B = [3, 4]` → `2.5`。

## 一句话

在 `A` 里切一刀 `i`，`B` 里的切口 `j` 由「左边共 $k = \lceil (m+n)/2 \rceil$ 个」唯一确定；二分 `i` 找到使左半全部 `<=` 右半的那一刀，中位数就从四个边界值里取。

## 关键技巧

**中位数 = 一条把合并数组分成左右两半的切线。** 不必真合并，只要知道左半的最大值和右半的最小值。在 `A` 切在 `i`（左边 `A[0..i)`）、`B` 切在 `j`（左边 `B[0..j)`），约束 $i + j = k$，其中 $k = \lfloor (m+n+1)/2 \rfloor$——总数为奇时左半多一个，中位数就是左半最大值。

**切口合法的条件**：两个数组各自有序，所以只需交叉比较

$$
A_{i-1} \le B_j \quad\text{且}\quad B_{j-1} \le A_i
$$

（越界的一侧视为 $-\infty$ / $+\infty$）。

**为什么能二分——找单调谓词。** 定义 $P(i) = [\,B_{k-i-1} \le A_i\,]$。`i` 增大时 $A_i$ 变大、$j = k - i$ 变小使 $B_{j-1}$ 变小，所以 $P$ 形如 `F…F T…T`；取第一个 `T` 的 `i`：

- $P(i)$ 为真 → $B_{j-1} \le A_i$，第二个条件满足；
- $P(i-1)$ 为假 → $B_{(j+1)-1} > A_{i-1}$，即 $A_{i-1} < B_j$，第一个条件也满足。

于是「找合法切口」化为 lower_bound，用左闭右开 $[lo, hi)$ 模板（见 [35. 搜索插入位置](0035-search-insert-position.md)），$i \in [0, m]$，$P(m)$ 视 $A_m = +\infty$ 恒真，所以 `hi = m` 起步。

**为什么在短数组上二分。** 令 $m \le n$，则 $j = k - i \in [k - m, k] \subseteq [0, n]$，`j` 永不越界；循环内 `mid < m` 故 $j \ge 1$，`A[mid]`、`B[j-1]` 都合法，连哨兵都不用。复杂度是 $O(\log \min(m, n))$，比要求的更好。

**取答案**：左半最大 $L = \max(A_{i-1}, B_{j-1})$，右半最小 $R = \min(A_i, B_j)$；奇数返回 $L$，偶数返回 $(L+R)/2$。

## 解

```python
class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        A, B = nums1, nums2
        if len(A) > len(B):
            A, B = B, A  # 在短数组上二分
        m, n = len(A), len(B)
        k = (m + n + 1) // 2  # 左半元素个数

        lo, hi = 0, m  # 找第一个满足 B[k-i-1] <= A[i] 的 i，[lo, hi) 左闭右开
        while lo < hi:
            i = (lo + hi) // 2
            if B[k - i - 1] <= A[i]:
                hi = i
            else:
                lo = i + 1

        i, j = lo, k - lo
        inf = float("inf")
        left = max(A[i - 1] if i > 0 else -inf, B[j - 1] if j > 0 else -inf)
        if (m + n) % 2:
            return float(left)
        right = min(A[i] if i < m else inf, B[j] if j < n else inf)
        return (left + right) / 2
```

时间 $O(\log \min(m, n))$，空间 $O(1)$。

## 延伸

- **第 k 小元素的递归解**：每次比较 `A[k/2-1]` 与 `B[k/2-1]`，较小者连同它前面的 $k/2$ 个一定不是第 $k$ 小，整体丢掉，$k$ 减半——$O(\log(m+n))$，更通用（任意 $k$ 都能求）。
- **流式数据的中位数**换成双堆维护左右两半——见 [295. 数据流的中位数](0295-find-median-from-data-stream.md)，「左半最大 / 右半最小」的思路一脉相承。
- 「二分的对象不一定是值，也可以是位置、切口、答案」——与 [153. 寻找旋转排序数组中的最小值](0153-find-minimum-in-rotated-sorted-array.md) 同属「找单调谓词」一类。
- 坑：先合并再取中位数是 $O(m+n)$，能过但不满足题目要求。

??? note "自测"

    ```python
    s = Solution()
    assert s.findMedianSortedArrays([1, 3], [2]) == 2.0
    assert s.findMedianSortedArrays([1, 2], [3, 4]) == 2.5
    assert s.findMedianSortedArrays([], [1]) == 1.0
    assert s.findMedianSortedArrays([2], []) == 2.0
    assert s.findMedianSortedArrays([1, 1], [1, 1]) == 1.0
    random.seed(0)
    for _ in range(500):
        a = sorted(random.randint(-20, 20) for _ in range(random.randint(0, 8)))
        b = sorted(random.randint(-20, 20) for _ in range(random.randint(0 if a else 1, 8)))
        c = sorted(a + b); t = len(c)
        assert s.findMedianSortedArrays(a, b) == (c[(t - 1) // 2] + c[t // 2]) / 2
    ```
