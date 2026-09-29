---
description: "多组候选的笛卡尔积——第 i 层只从第 i 组里挑，回溯的层数由输入长度决定，不用 used 也不用 start"
---

# 17. 电话号码的字母组合

[LeetCode 17](https://leetcode.cn/problems/letter-combinations-of-a-phone-number/) · 中等 · 回溯

## 题

给一串只含 `2`–`9` 的数字，按手机九宫格（2→abc，3→def，…，7→pqrs，9→wxyz）把每位换成一个字母，返回所有可能拼出的字符串，顺序任意。空串返回空列表。

例：`digits = "23"` → `["ad","ae","af","bd","be","bf","cd","ce","cf"]`。

## 一句话

第 $i$ 层从第 $i$ 个数字的字母里挑一个，走到第 $n$ 层收答案——就是若干集合的笛卡尔积。

## 关键技巧

**每层的候选集互相独立。** 和排列、组合不同，这里第 $i$ 层能选什么只取决于 `digits[i]`，与之前选了什么无关——所以不需要 `used`、不需要 `start`，递归参数只要一个层号 `i`。

**为什么对。** 树的第 $i$ 层分叉数是 $|S_i|$，叶子数 $\prod |S_i|$，每条路径恰是一种选法，天然不重不漏。

**迭代版**：从 `[""]` 出发，每读一个数字，把当前所有前缀各自接上该数字的每个字母——BFS 式逐层展开，和 `itertools.product` 等价。

**坑**：空输入要返回 `[]` 而不是 `[""]`——回溯版里 `i == len(digits) == 0` 会收进一个空串，需要特判。

## 解

=== "回溯"

    ```python
    class Solution:
        def letterCombinations(self, digits: str) -> List[str]:
            if not digits:
                return []
            pad = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",
                   "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
            res, path = [], []

            def dfs(i):
                if i == len(digits):
                    res.append("".join(path))
                    return
                for ch in pad[digits[i]]:
                    path.append(ch)
                    dfs(i + 1)
                    path.pop()

            dfs(0)
            return res
    ```

=== "逐层展开"

    ```python
    class Solution:
        def letterCombinations(self, digits: str) -> List[str]:
            if not digits:
                return []
            pad = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",
                   "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
            res = [""]
            for d in digits:
                res = [p + ch for p in res for ch in pad[d]]
            return res
    ```

时间 $O(n \cdot 4^n)$（最多 $4^n$ 个结果，每个长 $n$），空间 $O(n)$（不计输出）。

## 延伸

- 回溯三种「候选从哪来」对照：本题按层号取独立集合；[78. 子集](0078-subsets.md) 从 `start` 往后；[46. 全排列](0046-permutations.md) 取没用过的。
- [22. 括号生成](0022-generate-parentheses.md) 也是每层只在 `(` / `)` 两个字符里挑，但多了合法性剪枝——候选集会随路径状态变化。

??? note "自测"

    ```python
    s = Solution()
    assert sorted(s.letterCombinations("23")) == ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]
    assert s.letterCombinations("") == []
    assert sorted(s.letterCombinations("2")) == ["a", "b", "c"]
    assert len(s.letterCombinations("79")) == 16
    ```
