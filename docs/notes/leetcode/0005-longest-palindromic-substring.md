---
description: "回文由中心向外对称生长：枚举 2n-1 个中心各扩一次，O(n²) 时间 O(1) 空间，比区间 DP 省表"
---

# 5. 最长回文子串

[LeetCode 5](https://leetcode.cn/problems/longest-palindromic-substring/) · 中等 · 多维动态规划

## 题

给字符串 `s`，返回其中最长的回文子串（连续、正读反读一样）。有多个同长的，返回任意一个。

例：`s = "babad"` → `"bab"`（`"aba"` 也对）；`s = "cbbd"` → `"bb"`。

## 一句话

每个回文都有中心——单字符或两字符之间；枚举所有中心向两边扩，扩不动时记录长度。

## 关键技巧

**区间 DP：状态是区间两端。**

- 状态：$f(i,j)$ = `s[i..j]` 是否回文。
- 转移：$f(i,j) = (s_i = s_j) \wedge \big(j - i < 2 \vee f(i+1,j-1)\big)$。
- 初值：长度 1 为真；长度 2 看两字符是否相等（已含在 $j - i < 2$ 里）。
- 顺序：$f(i,j)$ 依赖 $f(i+1,j-1)$——**左下角**，所以 $i$ 从大到小、$j$ 从小到大，或按区间长度递增。遍历顺序由依赖方向决定，这是区间 DP 最容易写错的地方。

**中心扩展：同样的依赖，换个方向走。** DP 表里 $f(i,j)$ 只依赖 $f(i+1,j-1)$，依赖链是一条条从中心往外的斜线。沿斜线从中心出发往外走，一旦不等就停——后面的更长区间不可能是回文。每条斜线独立，所以不需要存表。

- 中心有 $2n - 1$ 个：$n$ 个单字符（奇数长）+ $n - 1$ 个缝隙（偶数长）。
- 用 `expand(l, r)` 统一两种：奇数传 `(i, i)`，偶数传 `(i, i+1)`。

**更快（知道即可）。** Manacher 算法利用已知回文的对称性复用半径，$O(n)$。

## 解

=== "中心扩展"

    ```python
    class Solution:
        def longestPalindrome(self, s: str) -> str:
            def expand(l: int, r: int) -> tuple[int, int]:
                while l >= 0 and r < len(s) and s[l] == s[r]:
                    l, r = l - 1, r + 1
                return l + 1, r  # 回文是 s[l+1:r]

            lo, hi = 0, 1
            for i in range(len(s)):
                for l, r in (expand(i, i), expand(i, i + 1)):  # 奇、偶两种中心
                    if r - l > hi - lo:
                        lo, hi = l, r
            return s[lo:hi]
    ```

    时间 $O(n^2)$，空间 $O(1)$。

=== "区间 DP"

    ```python
    class Solution2:
        def longestPalindrome(self, s: str) -> str:
            n = len(s)
            f = [[False] * n for _ in range(n)]
            lo, hi = 0, 1
            for i in range(n - 1, -1, -1):      # i 倒序：f[i][j] 依赖 f[i+1][j-1]
                for j in range(i, n):
                    if s[i] == s[j] and (j - i < 2 or f[i + 1][j - 1]):
                        f[i][j] = True
                        if j + 1 - i > hi - lo:
                            lo, hi = i, j + 1
            return s[lo:hi]
    ```

    时间 $O(n^2)$，空间 $O(n^2)$。提交时类名改回 `Solution`。

## 延伸

- **回文判定表复用**：[131. 分割回文串](0131-palindrome-partitioning.md) 先建同一张 $f(i,j)$ 表，再回溯切分。
- **回文子序列**（LeetCode 516）：不要求连续，转移变成 $s_i = s_j$ 时 $f(i+1,j-1) + 2$，否则 $\max(f(i+1,j), f(i,j-1))$——等价于 `s` 与 `reverse(s)` 的 [1143. 最长公共子序列](1143-longest-common-subsequence.md)。
- **坑**：别用「`s` 与反转串的最长公共子串」——`"abacdfgdcaba"` 会得到不是回文的 `"abacd"`。

??? note "自测"

    ```python
    for S in (Solution, Solution2):
        s = S()
        assert s.longestPalindrome("babad") in ("bab", "aba")
        assert s.longestPalindrome("cbbd") == "bb"
        assert s.longestPalindrome("a") == "a"
        assert s.longestPalindrome("ac") in ("a", "c")
        assert s.longestPalindrome("forgeeksskeegfor") == "geeksskeeg"
    ```
