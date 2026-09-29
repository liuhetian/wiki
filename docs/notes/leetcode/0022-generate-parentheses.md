---
description: "只生成合法前缀：左括号没用完就能放左，右括号少于左括号才能放右——剪枝条件就是合法性的不变量"
---

# 22. 括号生成

[LeetCode 22](https://leetcode.cn/problems/generate-parentheses/) · 中等 · 回溯

## 题

给整数 `n`，生成所有由 `n` 对括号组成的有效括号串，顺序任意。

例：`n = 3` → `["((()))","(()())","(())()","()(())","()()()"]`。

## 一句话

边生成边保证前缀合法——`open < n` 才放 `(`，`close < open` 才放 `)`，走到长度 $2n$ 的每条路径都是答案，不用事后校验。

## 关键技巧

**合法括号串的判定 = 前缀里右括号永远不多于左括号，且最终相等。** 把这个判定拆成两条局部规则挂在每次选择上：

- 放 `(` 的前提：`open < n`（总共只有 $n$ 个）；
- 放 `)` 的前提：`close < open`（放完后前缀仍然合法）。

**为什么对。** 两条规则维持不变量 $close \le open \le n$。长度到 $2n$ 时必有 $open = close = n$，且每个前缀都满足 $close \le open$——正是合法串的定义。反过来，任何合法串的每一步都满足这两条，所以一个不漏。

**比暴力好在哪。** 暴力枚举 $2^{2n}$ 个串再逐一检查；剪枝后只走合法前缀，叶子数就是答案数——第 $n$ 个 Catalan 数 $C_n = \frac{1}{n+1}\binom{2n}{n} \sim \frac{4^n}{n^{3/2}}$。

## 解

```python
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        res, path = [], []

        def dfs(open_, close):
            if len(path) == 2 * n:
                res.append("".join(path))
                return
            if open_ < n:
                path.append("(")
                dfs(open_ + 1, close)
                path.pop()
            if close < open_:
                path.append(")")
                dfs(open_, close + 1)
                path.pop()

        dfs(0, 0)
        return res
```

时间 $O(\frac{4^n}{\sqrt n})$（Catalan 数个结果，每个长 $2n$），空间 $O(n)$（不计输出）。

## 延伸

- 判定一个串是否合法用计数或栈——见 [20. 有效的括号](0020-valid-parentheses.md)；本题的 `close < open` 就是那个计数器不许变负。
- **最长的合法子串**是另一个方向——[32. 最长有效括号](0032-longest-valid-parentheses.md)，用栈或 DP。
- 另一种构造：合法串一定能唯一写成 `(A)B`，A、B 也合法——按 A 的对数枚举，得到 Catalan 的递推式，可以做记忆化。

??? note "自测"

    ```python
    s = Solution()
    assert sorted(s.generateParenthesis(3)) == sorted(["((()))", "(()())", "(())()", "()(())", "()()()"])
    assert s.generateParenthesis(1) == ["()"]
    assert len(s.generateParenthesis(8)) == 1430  # C_8
    ```
