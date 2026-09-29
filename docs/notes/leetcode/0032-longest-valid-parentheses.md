---
description: "栈里存「最后一个没配上的位置」当分界；每配上一个右括号，当前下标减栈顶就是以它结尾的有效长度"
---

# 32. 最长有效括号

[LeetCode 32](https://leetcode.cn/problems/longest-valid-parentheses/) · 困难 · 动态规划

## 题

给一个只含 `'('` 和 `')'` 的字符串，求其中最长的**连续**且括号匹配合法的子串长度。

例：`s = ")()())"` → `4`（`"()()"`）；`s = "(()"` → `2`。

## 一句话

`dp[i]` = 以 `s[i]` 结尾的最长有效长度；`s[i] = ')'` 时，要么和紧邻的 `'('` 配，要么越过 `dp[i-1]` 那段去和更前面的 `'('` 配，配完再接上前面紧挨着的有效段。

## 关键技巧

**DP：以 i 结尾。** 只有 `')'` 结尾可能有效，`'('` 结尾的 $f(i) = 0$。

- `s[i-1] = '('`：形如 `…()`，$f(i) = f(i-2) + 2$。
- `s[i-1] = ')'`：形如 `…((…))`。以 `s[i-1]` 结尾的有效段长 $f(i-1)$，跳过它看位置 $j = i - f(i-1) - 1$；若 `s[j] = '('`，它和 `s[i]` 配上，$f(i) = f(i-1) + 2 + f(j-1)$。
- 最后那项 $f(j-1)$ 是**关键**——配对完成后，前面紧挨着的有效段要拼进来（如 `"()(())"`）。
- 初值全 0，$i$ 递增，越界项按 0 处理。

**栈：分界点法。** 栈底放一个「最后一个无法匹配的位置」，初始 `-1`。

- 遇 `'('` 压下标。
- 遇 `')'` 先弹栈：弹完栈空，说明这个 `')'` 配不上，它成为新分界，压入；否则 `i - stack[-1]` 就是以 `i` 结尾的有效长度。

**为什么栈顶就是左边界。** 弹掉配对的 `'('` 后，栈顶要么是更早一个还没配上的 `'('`，要么是分界点——两者之间的全部字符都已配平。

**第三种（知道即可）。** 左右各扫一遍计数 `left`、`right`：相等时更新答案，`right > left` 归零（从左扫）；再从右扫一遍处理 `"(()"` 这种左括号多余的情况。$O(1)$ 空间。

## 解

=== "栈"

    ```python
    class Solution:
        def longestValidParentheses(self, s: str) -> int:
            stack, best = [-1], 0  # 栈底是最后一个配不上的位置
            for i, c in enumerate(s):
                if c == "(":
                    stack.append(i)
                else:
                    stack.pop()
                    if not stack:
                        stack.append(i)   # 这个 ')' 成为新分界
                    else:
                        best = max(best, i - stack[-1])
            return best
    ```

    时间 $O(n)$，空间 $O(n)$。

=== "DP"

    ```python
    class Solution2:
        def longestValidParentheses(self, s: str) -> int:
            n = len(s)
            f = [0] * n  # f[i]：以 s[i] 结尾的最长有效长度
            for i in range(1, n):
                if s[i] == ")":
                    j = i - f[i - 1] - 1          # 可能与 s[i] 配对的位置
                    if j >= 0 and s[j] == "(":
                        f[i] = f[i - 1] + 2 + (f[j - 1] if j >= 1 else 0)
            return max(f, default=0)
    ```

    时间 $O(n)$，空间 $O(n)$。`s[i-1] = '('` 时 $f(i-1) = 0$、$j = i-1$，两种情况合成了一个式子。提交时类名改回 `Solution`。

## 延伸

- **只判合法**：[20. 有效的括号](0020-valid-parentheses.md)，栈的基本用法。
- **生成所有合法串**：[22. 括号生成](0022-generate-parentheses.md)，用 `left ≥ right` 的前缀约束剪枝回溯。
- **「栈底放哨兵分界」同一招**：[84. 柱状图中最大的矩形](0084-largest-rectangle-in-histogram.md) 在栈底放 `-1` 求宽度。

??? note "自测"

    ```python
    for S in (Solution, Solution2):
        s = S()
        assert s.longestValidParentheses("(()") == 2
        assert s.longestValidParentheses(")()())") == 4
        assert s.longestValidParentheses("") == 0
        assert s.longestValidParentheses("()(())") == 6
        assert s.longestValidParentheses("())((())") == 4
    ```
