---
description: "可变长滑动窗口的母题：右端贪心扩、违规就收左端；记下标可让左端直接跳，不必一步步挪"
---

# 3. 无重复字符的最长子串

[LeetCode 3](https://leetcode.cn/problems/longest-substring-without-repeating-characters/) · 中等 · 滑动窗口

## 题

给一个字符串，求其中不含重复字符的最长**连续**子串的长度。

例：`"abcabcbb"` → `3`（`"abc"`）；`"pwwkew"` → `3`（`"wke"`，`"pwke"` 不连续不算）。

## 一句话

窗口 `[l, r]` 始终无重复；右端每进一个字符，若它上次出现在窗口里，左端直接跳到那次出现的下一位。

## 关键技巧

**为什么能用滑窗：性质对子串「单调」。** 一个子串无重复，它的所有子串也无重复；一个子串有重复，包含它的所有串也有重复。于是对每个右端点 `r`，合法左端点是一段连续区间 `[L(r), r]`，而且 `L(r)` 随 `r` 单调不减——左指针永远不用回头，两指针各走 $n$ 步。

**记「最后出现位置」让左端一次跳到位。** 用 `last[c]` 存字符 `c` 最后出现的下标。新字符 `c` 进窗口时：

- 若 `last[c] >= l`，说明它在窗口里，把 `l` 设为 `last[c] + 1`；
- 若 `last[c] < l`，它在窗口外，是早已失效的旧记录，不动 `l`。

**第二条是常见坑。** 写成 `l = last[c] + 1` 不加判断，会让左端**往回跳**——比如 `"abba"` 在最后一个 `a` 时会把 `l` 从 2 拉回 1。等价写法是 `l = max(l, last[c] + 1)`。

## 解

```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last = {}
        l = best = 0
        for r, c in enumerate(s):
            if last.get(c, -1) >= l:
                l = last[c] + 1
            last[c] = r
            best = max(best, r - l + 1)
        return best
```

时间 $O(n)$，空间 $O(|\Sigma|)$，$\Sigma$ 为字符集。

## 延伸

- 可变长窗口的通用模板：「右端扩一格 → while 不合法就收左端 → 更新答案」。求最短合法窗口的版本见 [76. 最小覆盖子串](0076-minimum-window-substring.md)。
- 定长窗口版本见 [438. 找到字符串中所有字母异位词](0438-find-all-anagrams-in-a-string.md)。
- 变体「最多包含 k 种不同字符的最长子串」：窗口内维护计数和种类数，种类数 > k 时收左端——同一模板，只是不能跳、只能一步步挪。

??? note "自测"

    ```python
    s = Solution()
    assert s.lengthOfLongestSubstring("abcabcbb") == 3
    assert s.lengthOfLongestSubstring("bbbbb") == 1
    assert s.lengthOfLongestSubstring("pwwkew") == 3
    assert s.lengthOfLongestSubstring("") == 0
    assert s.lengthOfLongestSubstring("abba") == 2
    assert s.lengthOfLongestSubstring(" ") == 1
    ```
