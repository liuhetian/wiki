---
description: "三次翻转实现原地轮转：(AB)ᴿ = BᴿAᴿ，整体反转后两段各自翻回就是 BA，O(1) 空间"
---

# 189. 轮转数组

[LeetCode 189](https://leetcode.cn/problems/rotate-array/) · 中等 · 普通数组

## 题

把数组整体向右轮转 `k` 步（末尾的元素绕回开头），原地修改。`k` 可能大于数组长度。

例：`nums = [1, 2, 3, 4, 5, 6, 7], k = 3` → `[5, 6, 7, 1, 2, 3, 4]`。

## 一句话

`k %= n` 后：反转整个数组，再分别反转前 `k` 个和后 `n - k` 个。

## 关键技巧

**轮转 = 交换两个块的位置。** 把数组看成 $A B$，$B$ 是最后 $k$ 个。右轮转 $k$ 步就是要得到 $B A$。

**翻转的代数。** 记 $X^R$ 为 $X$ 的反转，有 $(XY)^R = Y^R X^R$。于是

$$
(AB)^R = B^R A^R, \quad \text{再各自翻回：} (B^R)^R (A^R)^R = BA
$$

三次原地翻转，每次双指针交换，总共 $O(n)$ 时间、$O(1)$ 空间。

**先 `k %= n`。** 轮转 $n$ 步等于没转；不取模的话 `k > n` 时下标越界。

## 解

=== "三次翻转"

    ```python
    class Solution:
        def rotate(self, nums: List[int], k: int) -> None:
            n = len(nums)
            k %= n

            def rev(i, j):
                while i < j:
                    nums[i], nums[j] = nums[j], nums[i]
                    i += 1
                    j -= 1

            rev(0, n - 1)
            rev(0, k - 1)
            rev(k, n - 1)
    ```

    时间 $O(n)$，空间 $O(1)$。

=== "切片（非 O(1)）"

    ```python
    class Solution2:
        def rotate(self, nums: List[int], k: int) -> None:
            k %= len(nums)
            nums[:] = nums[-k:] + nums[:-k] if k else nums
    ```

    时间 $O(n)$，空间 $O(n)$。能过，但不满足原题进阶的 $O(1)$ 额外空间；注意必须 `nums[:] =`，直接 `nums =` 只是改了局部变量。

## 延伸

- 另一种 $O(1)$ 空间解法是「环状替换」：从 0 出发把元素挪到 `(i + k) % n`，一共 $\gcd(n, k)$ 个环。正确但下标容易写错。
- 同一个「块交换 = 三次翻转」的招：翻转字符串里的单词（整体翻转、再逐词翻转）。
- 坑：切片写法里 `k == 0` 时 `-k` 就是 `0`，`nums[-0:]` 取到整个数组、`nums[:-0]` 是空——结果碰巧没错，但这是巧合，别依赖负零下标，显式判 `k` 更清楚。

??? note "自测"

    ```python
    for S in (Solution, Solution2):
        s = S()
        for arr, k, want in [
            ([1, 2, 3, 4, 5, 6, 7], 3, [5, 6, 7, 1, 2, 3, 4]),
            ([-1, -100, 3, 99], 2, [3, 99, -1, -100]),
            ([1, 2], 3, [2, 1]),
            ([1], 0, [1]),
            ([1, 2, 3], 3, [1, 2, 3]),
        ]:
            s.rotate(arr, k)
            assert arr == want, (S, arr, k)
    ```
