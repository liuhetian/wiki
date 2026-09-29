---
description: "切割问题 = 枚举下一刀切在哪；先用区间 DP 把「s[i..j] 是否回文」打成表，回溯时判回文降到 O(1)"
---

# 131. 分割回文串

[LeetCode 131](https://leetcode.cn/problems/palindrome-partitioning/) · 中等 · 回溯

## 题

把字符串切成若干段，要求每一段都是回文，返回所有切法。

例：`s = "aab"` → `[["a","a","b"],["aa","b"]]`。

## 一句话

从位置 `start` 出发，枚举这一段的结尾 `end`，`s[start..end]` 是回文才往下切；判回文用预处理好的 DP 表。

## 关键技巧

**把切割翻译成组合。** 长度 $n$ 的串有 $n-1$ 个缝，每种切法就是缝的一个子集——于是套「从 `start` 往后挑」的回溯：本层决定第一段到哪结束，剩下的交给下一层。

**回文表预处理。** 回溯里会反复问同一个区间是否回文，每次 $O(n)$ 判太浪费。区间 DP：

$$
pal[i][j] = (s_i = s_j) \land (j - i < 2 \lor pal[i+1][j-1])
$$

$pal[i][j]$ 依赖 $pal[i+1][\cdot]$，所以 `i` 从大到小填。$O(n^2)$ 建表后每次查询 $O(1)$。

**剪枝就在判回文。** 不是回文的前缀直接跳过，不展开子树。

## 解

```python
class Solution:
    def partition(self, s: str) -> List[List[str]]:
        n = len(s)
        pal = [[False] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):
            for j in range(i, n):
                pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])

        res, path = [], []

        def dfs(start):
            if start == n:
                res.append(path[:])
                return
            for end in range(start, n):
                if pal[start][end]:
                    path.append(s[start:end + 1])
                    dfs(end + 1)
                    path.pop()

        dfs(0)
        return res
```

时间 $O(n \cdot 2^n)$（最坏全同字符，$2^{n-1}$ 种切法，每种拷贝 $O(n)$），空间 $O(n^2)$ 回文表。

## 延伸

- **只要最少切几刀**（LeetCode 132）：不要枚举方案，改成一维 DP `cut[j] = min(cut[i-1] + 1 for pal[i][j])`，$O(n^2)$。
- 回文表同款 DP 见 [5. 最长回文子串](0005-longest-palindromic-substring.md)；那题还能用中心扩展把空间降到 $O(1)$。
- 「枚举下一段的结尾」这个切法骨架与 [139. 单词拆分](0139-word-break.md) 相同——那题只问可行性，于是可以 DP 掉。

??? note "自测"

    ```python
    s = Solution()
    norm = lambda xs: sorted(xs)
    assert norm(s.partition("aab")) == norm([["a", "a", "b"], ["aa", "b"]])
    assert s.partition("a") == [["a"]]
    assert norm(s.partition("aaa")) == norm([["a", "a", "a"], ["a", "aa"], ["aa", "a"], ["aaa"]])
    assert s.partition("ab") == [["a", "b"]]
    ```
