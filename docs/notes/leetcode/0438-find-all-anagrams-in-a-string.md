---
description: "定长滑动窗口 + 计数差：进一个出一个只改两格，用「不匹配字母数」O(1) 判等，不必每步比 26 格"
---

# 438. 找到字符串中所有字母异位词

[LeetCode 438](https://leetcode.cn/problems/find-all-anagrams-in-a-string/) · 中等 · 滑动窗口

## 题

给字符串 `s` 和 `p`（都是小写字母），找出 `s` 中所有是 `p` 的字母异位词的子串，返回它们的起始下标。

例：`s = "cbaebabacd", p = "abc"` → `[0, 6]`（`"cba"` 和 `"bac"`）。

## 一句话

在 `s` 上滑一个长度为 `len(p)` 的窗口，维护「窗口计数 − `p` 计数」的差数组，差全为 0 就记下起点。

## 关键技巧

**异位词判等 = 计数向量相等。** 和 [49. 字母异位词分组](0049-group-anagrams.md) 同一个指纹。窗口长度固定为 $m = |p|$，每右移一格只有一个字符进、一个字符出，计数向量只变两格。

**维护差数组和「非零格数」。** 令 `diff[c] = 窗口里 c 的个数 − p 里 c 的个数`，`bad = diff 中非零格的个数`。进出字符时只更新对应格，并看它是否在 0 和非 0 之间切换来增减 `bad`。`bad == 0` 就是异位词。

这样每步严格 $O(1)$，与字符集大小无关；直接每步比较两个 26 维数组是 $O(26n)$，对本题也能过，但字符集一大就不行了。

## 解

```python
class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        m, n = len(p), len(s)
        if m > n:
            return []
        diff = defaultdict(int)
        for c in p:
            diff[c] -= 1
        bad = len(diff)

        def add(c, d):
            nonlocal bad
            if diff[c] == 0:
                bad += 1
            diff[c] += d
            if diff[c] == 0:
                bad -= 1

        res = []
        for r, c in enumerate(s):
            add(c, 1)
            if r >= m:
                add(s[r - m], -1)  # 窗口左端出去
            if r >= m - 1 and bad == 0:
                res.append(r - m + 1)
        return res
```

时间 $O(n + m)$，空间 $O(|\Sigma|)$。

## 延伸

- 判定版「字符串的排列」（[LeetCode 567](https://leetcode.cn/problems/permutation-in-string/)）一模一样，找到第一个就返回 True。
- 可变长窗口 + 覆盖计数见 [76. 最小覆盖子串](0076-minimum-window-substring.md)，那里的 `need` 计数器就是这里 `bad` 的变体。
- 坑：窗口先进后出、判定放在「窗口长度恰好为 $m$」之后；顺序写乱会少判第一个窗口或多判一个长度 $m+1$ 的窗口。

??? note "自测"

    ```python
    s = Solution()
    assert s.findAnagrams("cbaebabacd", "abc") == [0, 6]
    assert s.findAnagrams("abab", "ab") == [0, 1, 2]
    assert s.findAnagrams("a", "ab") == []
    assert s.findAnagrams("aaa", "a") == [0, 1, 2]
    assert s.findAnagrams("abc", "d") == []
    ```
