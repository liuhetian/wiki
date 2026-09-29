---
description: "dp[i] 表示前缀 s[:i] 能否拆完；枚举最后一个单词的起点 j，只要 dp[j] 且 s[j:i] 在字典里就成"
---

# 139. 单词拆分

[LeetCode 139](https://leetcode.cn/problems/word-break/) · 中等 · 动态规划

## 题

给字符串 `s` 和一个单词字典 `wordDict`，问 `s` 能否被切成若干段、每段都是字典里的词（词可重复使用）。

例：`s = "applepenapple", wordDict = ["apple", "pen"]` → `true`；`s = "catsandog", wordDict = ["cats", "dog", "sand", "and", "cat"]` → `false`。

## 一句话

前缀 `s[:i]` 可拆，当且仅当存在切点 `j`，使 `s[:j]` 可拆且 `s[j:i]` 是一个单词。

## 关键技巧

**前缀型 DP，按「最后一段」分类。**

- 状态：$f(i)$ = 前 $i$ 个字符能否拆完。
- 转移：$f(i) = \bigvee_{j} \big(f(j) \wedge s[j:i] \in D\big)$。
- 初值：$f(0) = \text{True}$，空串不需要任何单词。
- 顺序：$i$ 递增。

**把枚举范围收窄到字典里的词长。** 最后一段长度只可能是字典里出现过的长度，内层不必从 0 扫到 $i$，只枚举 `i - L`（$L$ 取字典里的不同词长）。字典转 `set` 让查询 $O(L)$。

**为什么贪心 / 暴力回溯不行。** 贪心取最长匹配会走错（`"aaaaaaa"`，字典 `["aaaa", "aaa"]`）；裸回溯在 `"aaaa…ab"` 这类输入上指数爆炸——DP 的本质是给回溯加了「这个后缀拆不拆得动」的记忆。

## 解

```python
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        lens = {len(w) for w in words}
        n = len(s)
        dp = [True] + [False] * n
        for i in range(1, n + 1):
            dp[i] = any(L <= i and dp[i - L] and s[i - L:i] in words for L in lens)
        return dp[n]
```

时间 $O(n \cdot k \cdot L)$，$k$ 为不同词长个数、$L$ 为最大词长（切片和哈希的代价）；空间 $O(n)$。

## 延伸

- **Trie 优化**：从每个可达的 `j` 出发沿 [208. 实现 Trie (前缀树)](0208-implement-trie-prefix-tree.md) 往后走，一次遍历找到所有能接的词，省掉重复切片。
- **求所有拆法**（LeetCode 140）：先用本题的 DP 剪枝，再回溯枚举——和 [131. 分割回文串](0131-palindrome-partitioning.md) 一个模子。
- **同类骨架**：「前缀能否 / 最少几段」都是这种 `dp[i]` 由某个 `dp[j]` 转来，如 [279. 完全平方数](0279-perfect-squares.md)。

??? note "自测"

    ```python
    s = Solution()
    assert s.wordBreak("leetcode", ["leet", "code"]) is True
    assert s.wordBreak("applepenapple", ["apple", "pen"]) is True
    assert s.wordBreak("catsandog", ["cats", "dog", "sand", "and", "cat"]) is False
    assert s.wordBreak("aaaaaaa", ["aaaa", "aaa"]) is True
    assert s.wordBreak("a", ["b"]) is False
    ```
