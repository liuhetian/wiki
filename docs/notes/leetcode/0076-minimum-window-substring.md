---
description: "求最短合法窗口：右端扩到刚好覆盖，再尽量收左端；用「还缺几个字符」一个整数 O(1) 判覆盖"
---

# 76. 最小覆盖子串

[LeetCode 76](https://leetcode.cn/problems/minimum-window-substring/) · 困难 · 子串

## 题

给字符串 `s` 和 `t`，找 `s` 中最短的连续子串，使它包含 `t` 的所有字符（含重复次数）。不存在就返回空串，题目保证答案唯一。

例：`s = "ADOBECODEBANC", t = "ABC"` → `"BANC"`。

## 一句话

右指针扩张直到窗口覆盖 `t`，然后左指针能收就收、每收一步更新答案，收到不覆盖为止，再扩右边。

## 关键技巧

**为什么能滑窗：覆盖性对窗口单调。** 窗口覆盖了 `t`，扩大后仍然覆盖；不覆盖，缩小后仍不覆盖。所以对每个右端 `r`，能覆盖的左端是一段前缀 `[0, L(r)]`，`L(r)` 随 `r` 单调不减——左指针不回头，总共 $O(|s|)$ 步。

**用一个整数判覆盖。** `need[c]` 记「窗口还欠 `c` 几个」，初值是 `t` 的计数；`missing` 记还欠的总字符数。

- 右端进 `c`：若 `need[c] > 0` 说明这是「有用的」字符，`missing -= 1`；然后 `need[c] -= 1`（可以减成负数，表示富余）。
- 左端出 `c`：`need[c] += 1`；若加完后 `> 0`，说明丢掉的是必需字符，`missing += 1`。

`missing == 0` 即完全覆盖，不必每步比较两个计数表。

**和 [3. 无重复字符的最长子串](0003-longest-substring-without-repeating-characters.md) 的区别**：求最长时在「合法」状态下扩右边、违规才收；求最短时在「合法」状态下收左边、不合法才扩。模板相同，更新答案的位置不同。

## 解

```python
class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        missing = len(t)
        l = 0
        best = (0, 0)  # [start, end)
        for r, c in enumerate(s):
            if need[c] > 0:
                missing -= 1
            need[c] -= 1
            while missing == 0:
                if best == (0, 0) or r + 1 - l < best[1] - best[0]:
                    best = (l, r + 1)
                d = s[l]
                need[d] += 1
                if need[d] > 0:
                    missing += 1
                l += 1
        return s[best[0]:best[1]]
```

时间 $O(|s| + |t|)$，空间 $O(|\Sigma|)$。

## 延伸

- 定长窗口 + 计数差的版本：[438. 找到字符串中所有字母异位词](0438-find-all-anagrams-in-a-string.md)。
- 「长度最小的子数组」（[LeetCode 209](https://leetcode.cn/problems/minimum-size-subarray-sum/)）是数值版：和 `>= target` 就收左端，前提是全为正数。
- 坑：`best` 的初值要能区分「没找到」；这里用空区间 `(0, 0)` 做哨兵，因为合法窗口长度至少为 `len(t) >= 1`。

??? note "自测"

    ```python
    s = Solution()
    assert s.minWindow("ADOBECODEBANC", "ABC") == "BANC"
    assert s.minWindow("a", "a") == "a"
    assert s.minWindow("a", "aa") == ""
    assert s.minWindow("ab", "b") == "b"
    assert s.minWindow("aaflslflsldkalskaaa", "aaa") == "aaa"
    ```
