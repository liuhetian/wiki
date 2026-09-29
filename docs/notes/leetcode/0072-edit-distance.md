---
description: "双前缀 DP：末字符相等就免费走对角线，否则在增、删、改三个方向里取最小 +1；空串那行列是初值"
---

# 72. 编辑距离

[LeetCode 72](https://leetcode.cn/problems/edit-distance/) · 中等 · 多维动态规划

## 题

给两个单词 `word1`、`word2`，每次可以对 `word1` 插入、删除或替换一个字符，求把 `word1` 变成 `word2` 的最少操作数。

例：`word1 = "horse", word2 = "ros"` → `3`（horse → rorse → rose → ros）。

## 一句话

只看两个前缀的最后一个字符：相等就不用动，`dp[i-1][j-1]`；不等就三选一——删 `a_i`、插 `b_j`、把 `a_i` 改成 `b_j`，取最便宜的再 +1。

## 关键技巧

**状态：两个前缀。**

- 状态：$f(i,j)$ = 把 `word1[:i]` 变成 `word2[:j]` 的最少操作数。
- 转移：
    - $a_i = b_j$：$f(i,j) = f(i-1,j-1)$；
    - 否则：$f(i,j) = 1 + \min\big(f(i-1,j),\ f(i,j-1),\ f(i-1,j-1)\big)$，三项依次是**删** $a_i$、**插** $b_j$、**改** $a_i \to b_j$。
- 初值：$f(i,0) = i$（全删），$f(0,j) = j$（全插）。
- 顺序：逐行、行内从左到右。

**为什么只看末字符就够。** 任何一个最优编辑序列里，`word2` 的最后一个字符 $b_j$ 要么来自 $a_i$（相等时保留、不等时替换），要么是新插入的；$a_i$ 要么被用上，要么被删掉。这几种情况穷尽了所有可能，每种都把问题缩成更短的前缀。

**三个方向怎么记。** $f(i-1,j)$：`word1` 少一个字符就已经能变成 `word2[:j]`，那多出的 $a_i$ 删掉；$f(i,j-1)$：先变成 `word2[:j-1]`，再在末尾插 $b_j$；对角线：两边都往前退一步，末尾改一下。

**滚动数组。** 和 [1143. 最长公共子序列](1143-longest-common-subsequence.md) 一样，用 `diag` 暂存左上角；本行首格 `dp[0] = i`。

## 解

```python
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        n = len(word2)
        dp = list(range(n + 1))          # f(0, j) = j
        for i, a in enumerate(word1, 1):
            diag, dp[0] = dp[0], i       # diag = f(i-1, 0)，本行首格 f(i, 0) = i
            for j in range(1, n + 1):
                if a == word2[j - 1]:
                    new = diag
                else:
                    new = 1 + min(dp[j], dp[j - 1], diag)  # 删、插、改
                diag, dp[j] = dp[j], new
        return dp[n]
```

时间 $O(mn)$，空间 $O(n)$。

## 延伸

- **母题**：[1143. 最长公共子序列](1143-longest-common-subsequence.md)，同一张双前缀表。只允许插入和删除时，编辑距离 $= m + n - 2\cdot\text{LCS}$。
- **两个字符串的删除操作**（LeetCode 583）、**最小 ASCII 删除和**（LeetCode 712）：去掉「替换」方向或给操作加权即可。
- **坑**：相等时别写成 `1 + min(三个方向)`——对角线那一项不该 +1；滚动写法里 `diag` 必须在覆盖 `dp[j]` 之前取出。

??? note "自测"

    ```python
    s = Solution()
    assert s.minDistance("horse", "ros") == 3
    assert s.minDistance("intention", "execution") == 5
    assert s.minDistance("", "abc") == 3
    assert s.minDistance("abc", "") == 3
    assert s.minDistance("same", "same") == 0
    ```
