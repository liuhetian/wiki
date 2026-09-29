---
description: "O(n²) 的 dp[i] 以 i 结尾；O(n log n) 换个状态——tails[k] 存长度 k+1 的递增子序列的最小结尾，二分替换"
---

# 300. 最长递增子序列

[LeetCode 300](https://leetcode.cn/problems/longest-increasing-subsequence/) · 中等 · 动态规划

## 题

给整数数组 `nums`，求最长**严格**递增子序列的长度。子序列不要求连续，但要保持原顺序。

例：`nums = [10, 9, 2, 5, 3, 7, 101, 18]` → `4`（如 `[2, 3, 7, 101]`）。

## 一句话

要么以每个位置结尾做 $O(n^2)$ DP；要么维护「每个长度的最小结尾」数组，它单调递增，每来一个数二分找位置替换。

## 关键技巧

**解法一：以 i 结尾的 DP。** 子序列问题的标准状态是「以第 $i$ 个元素结尾」——这样转移时知道结尾是谁，能判断能不能接。

- 状态：$f(i)$ = 以 `nums[i]` 结尾的 LIS 长度。
- 转移：$f(i) = 1 + \max\{f(j) : j < i,\ \text{nums}[j] < \text{nums}[i]\}$，没有可接的就是 1。
- 答案：$\max_i f(i)$，**不是** $f(n-1)$。

**解法二：换状态——贪心 + 二分。** 定义 `tails[k]` = 所有长度为 $k+1$ 的递增子序列里，**最小的结尾值**。

- **为什么结尾越小越好**：同样长度，结尾小的更容易被后面的数接上——保留最小结尾不亏。
- **为什么 tails 严格递增**：长度 $k+1$ 的序列去掉末尾就是长度 $k$ 的序列，其结尾更小，所以 `tails[k-1] < tails[k]`。
- **更新**：新数 `x` 来了，找第一个 `tails[k] >= x` 的位置——`x` 能接在长度 $k$ 的序列后面，形成更小结尾的长度 $k+1$，于是 `tails[k] = x`；找不到就追加，LIS 变长。
- `bisect_left` 找 `>= x` 的位置，对应**严格**递增；非严格递增改用 `bisect_right`。

**tails 不是一个真实的 LIS。** 它只保证长度对；具体序列要另存前驱指针还原。

## 解

=== "贪心 + 二分"

    ```python
    class Solution:
        def lengthOfLIS(self, nums: List[int]) -> int:
            tails = []  # tails[k]：长度 k+1 的递增子序列的最小结尾
            for x in nums:
                k = bisect_left(tails, x)
                if k == len(tails):
                    tails.append(x)
                else:
                    tails[k] = x
            return len(tails)
    ```

    时间 $O(n \log n)$，空间 $O(n)$。

=== "O(n²) DP"

    ```python
    class Solution2:
        def lengthOfLIS(self, nums: List[int]) -> int:
            f = [1] * len(nums)  # f[i]：以 nums[i] 结尾的 LIS 长度
            for i in range(len(nums)):
                for j in range(i):
                    if nums[j] < nums[i]:
                        f[i] = max(f[i], f[j] + 1)
            return max(f)
    ```

    时间 $O(n^2)$，空间 $O(n)$。提交时把类名改回 `Solution`。

## 延伸

- **二维版**：俄罗斯套娃信封（LeetCode 354）——按宽升序、宽相同按高降序排，再对高做 LIS。
- **「以 i 结尾」是子数组 / 子序列 DP 的通用状态**：[53. 最大子数组和](0053-maximum-subarray.md)、[152. 乘积最大子数组](0152-maximum-product-subarray.md) 同样如此；两个序列的版本见 [1143. 最长公共子序列](1143-longest-common-subsequence.md)。
- **二分找边界**的写法细节见 [35. 搜索插入位置](0035-search-insert-position.md)——`bisect_left` 就是它。

??? note "自测"

    ```python
    for S in (Solution, Solution2):
        s = S()
        assert s.lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]) == 4
        assert s.lengthOfLIS([0, 1, 0, 3, 2, 3]) == 4
        assert s.lengthOfLIS([7, 7, 7, 7, 7, 7, 7]) == 1
        assert s.lengthOfLIS([5]) == 1
        assert s.lengthOfLIS([4, 10, 4, 3, 8, 9]) == 3
    ```
