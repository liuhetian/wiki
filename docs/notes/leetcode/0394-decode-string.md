---
description: "嵌套的 k[...] 用栈保存「外层上下文」：遇 [ 把当前串和倍数压栈、清空重来，遇 ] 弹出外层拼回去"
---

# 394. 字符串解码

[LeetCode 394](https://leetcode.cn/problems/decode-string/) · 中等 · 栈

## 题

编码规则 `k[s]` 表示 `s` 重复 `k` 次，可以嵌套。给一个合法的编码串，返回解码后的字符串。数字只用来表示重复次数，原文里不含数字。

例：`"3[a]2[bc]"` → `"aaabcbc"`；`"3[a2[c]]"` → `"accaccacc"`。

## 一句话

进入 `[` 就像函数调用——把「外面已经拼好的串」和「这层要重复几次」压栈、开一个新的空串；遇到 `]` 就返回，外层串 + 本层串 × k。

## 关键技巧

**栈存的是上下文，不是字符。** 扫描时只维护两个变量：当前层已解出的 `cur` 和正在读的数字 `num`。

- 数字：`num = num * 10 + d`——倍数可能是多位数，比如 `100[a]`；
- `[`：把 `(cur, num)` 压栈，`cur`、`num` 清零，开始解内层；
- `]`：弹出 `(prev, k)`，`cur = prev + cur * k`——内层解完，拼回外层；
- 字母：接到 `cur` 后面。

**为什么对。** 不变量：栈里第 $d$ 个元素是第 $d$ 层括号外、该层 `[` 之前已经解出的前缀，以及该层的倍数。遇 `]` 时当前层完整，按规则展开后正好是外层的延续。

**递归写法**是同一件事的另一种表达：`[` 调用自己解析内层，`]` 返回——系统调用栈代替显式栈。

**拼接效率**：`cur` 用 list 累积比字符串 `+=` 更稳；这题输出长度有限（$\le 10^5$），直接用 str 也能过。

## 解

```python
class Solution:
    def decodeString(self, s: str) -> str:
        stack = []  # (外层已解出的串, 本层倍数)
        cur, num = "", 0
        for ch in s:
            if ch.isdigit():
                num = num * 10 + int(ch)
            elif ch == "[":
                stack.append((cur, num))
                cur, num = "", 0
            elif ch == "]":
                prev, k = stack.pop()
                cur = prev + cur * k
            else:
                cur += ch
        return cur
```

时间 $O(L)$，$L$ 为输出长度（每个输出字符被拼接的次数受嵌套深度约束，常数级）；空间 $O(L)$。

## 延伸

- 同为「栈保存嵌套上下文」：基本计算器（LeetCode 224）遇 `(` 压入当前结果和符号，遇 `)` 弹出合并——结构与本题一一对应。
- 只需判定嵌套是否合法：[20. 有效的括号](0020-valid-parentheses.md)。
- 坑：数字要累积成多位数；遇 `[` 后 `num` 必须清零，否则内层数字会接在外层数字后面。

??? note "自测"

    ```python
    s = Solution()
    assert s.decodeString("3[a]2[bc]") == "aaabcbc"
    assert s.decodeString("3[a2[c]]") == "accaccacc"
    assert s.decodeString("2[abc]3[cd]ef") == "abcabccdcdcdef"
    assert s.decodeString("abc3[cd]xyz") == "abccdcdcdxyz"
    assert s.decodeString("10[a]") == "a" * 10
    assert s.decodeString("abc") == "abc"
    ```
