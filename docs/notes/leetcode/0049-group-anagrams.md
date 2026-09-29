---
description: "给「等价类」造一个规范形当哈希键——排序串或 26 维计数元组，同类必同键、异类必异键"
---

# 49. 字母异位词分组

[LeetCode 49](https://leetcode.cn/problems/group-anagrams/) · 中等 · 哈希

## 题

给一组小写字母组成的字符串，把互为字母异位词（字母种类和个数完全相同、只是顺序不同）的放进同一组，组的顺序和组内顺序都随意。

例：`["eat", "tea", "tan", "ate", "nat", "bat"]` → `[["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]`。

## 一句话

给每个串算一个「与顺序无关」的指纹当 key，同 key 的串扔进同一个桶。

## 关键技巧

**分组题 = 找规范形（canonical form）。** 「互为异位词」是等价关系，要做的是给每个等价类选一个唯一代表。只要映射 $f$ 满足 $f(a) = f(b) \iff a \sim b$，就能直接 `groups[f(s)].append(s)`，一遍扫完。

两种规范形：

- **排序后的串**：`"eat" → "aet"`。异位词排序结果必相同，非异位词必不同。代价 $O(k \log k)$，$k$ 为串长。
- **26 维计数元组**：`(1, 0, 0, 0, 1, …, 1, …)`。只含小写字母时是 $O(k)$，而且对长串更划算。要用 `tuple`——`list` 不可哈希。

**计数转字符串当键时必须加分隔符。** 计数 `[1, 11]` 和 `[11, 1]` 直接拼接都是 `"111"`，会撞键；元组或 `"1,11"` 这种带分隔的写法没有这个问题。

## 解

=== "计数元组"

    ```python
    class Solution:
        def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
            groups = defaultdict(list)
            for s in strs:
                cnt = [0] * 26
                for c in s:
                    cnt[ord(c) - 97] += 1
                groups[tuple(cnt)].append(s)
            return list(groups.values())
    ```

    时间 $O(nk)$，空间 $O(nk)$。

=== "排序串"

    ```python
    class Solution2:
        def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
            groups = defaultdict(list)
            for s in strs:
                groups["".join(sorted(s))].append(s)
            return list(groups.values())
    ```

    时间 $O(nk \log k)$，空间 $O(nk)$。写起来最短，面试首选。

## 延伸

- **同一个「计数当指纹」的招**用在滑动窗口上：[438. 找到字符串中所有字母异位词](0438-find-all-anagrams-in-a-string.md) 维护窗口的 26 维计数，和目标比较。
- 字符集大（Unicode）时计数数组不再是常数，改用 `frozenset(Counter(s).items())` 或直接排序串。
- 规范形思路还能用在「同构字符串」「循环移位分组」等题——把每个串映射到它的「首次出现下标序列」或「最小循环移位」。

??? note "自测"

    ```python
    def norm(groups):
        return sorted(sorted(g) for g in groups)

    for S in (Solution, Solution2):
        s = S()
        assert norm(s.groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])) == norm(
            [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]
        )
        assert s.groupAnagrams([""]) == [[""]]
        assert s.groupAnagrams(["a"]) == [["a"]]
        assert norm(s.groupAnagrams(["ab", "ba", "abc"])) == [["ab", "ba"], ["abc"]]
    ```
