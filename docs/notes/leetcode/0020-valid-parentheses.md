---
description: "嵌套结构的匹配靠栈：左括号入栈，右括号必须和栈顶配对；最后栈空才算合法，别漏了只有左括号的情况"
---

# 20. 有效的括号

[LeetCode 20](https://leetcode.cn/problems/valid-parentheses/) · 简单 · 栈

## 题

给一个只含 `()[]{}` 的字符串，判断括号是否正确闭合：每个右括号都要对应同类型、最近未闭合的左括号，且所有左括号最终都被闭合。

例：`"()[]{}"` → `true`；`"(]"` → `false`；`"([)]"` → `false`；`"{[]}"` → `true`。

## 一句话

最后打开的最先关闭——这就是栈的 LIFO；遇右括号看栈顶是不是它的另一半，扫完栈必须为空。

## 关键技巧

**「最近未闭合」= 栈顶。** 嵌套结构里，任何时刻能被关闭的只有最内层那一个，即最后压入的左括号。所以不变量是：栈里从底到顶是当前所有未闭合的左括号，按打开顺序排列。

**三种失败，一个都不能漏。**

1. 右括号来了但栈空——没有可配对的；
2. 栈顶类型不匹配——`([)]` 这种交叉；
3. 扫完栈不空——还有左括号没关，如 `"(("`。

**映射表写成「右 → 左」。** 遇到右括号查表得到期望的左括号，和栈顶比；不在表里的就是左括号，入栈。

**长度为奇数直接 `False`**——一个小剪枝。

## 解

```python
class Solution:
    def isValid(self, s: str) -> bool:
        if len(s) % 2:
            return False
        pair = {")": "(", "]": "[", "}": "{"}
        stack = []
        for ch in s:
            if ch in pair:
                if not stack or stack.pop() != pair[ch]:
                    return False
            else:
                stack.append(ch)
        return not stack
```

时间 $O(n)$，空间 $O(n)$。

## 延伸

- **只有一种括号**时栈退化成计数器：`(` 加一、`)` 减一，中途不许为负，结尾为零——[22. 括号生成](0022-generate-parentheses.md) 的剪枝正是这条规则。
- **最长有效括号子串**：栈里存下标而不是字符，用「最后一个没匹配上的位置」当分隔——见 [32. 最长有效括号](0032-longest-valid-parentheses.md)。
- 栈处理嵌套结构的更复杂形态：[394. 字符串解码](0394-decode-string.md)，遇 `]` 时弹出一整层上下文。

??? note "自测"

    ```python
    s = Solution()
    assert s.isValid("()") is True
    assert s.isValid("()[]{}") is True
    assert s.isValid("(]") is False
    assert s.isValid("([)]") is False
    assert s.isValid("{[]}") is True
    assert s.isValid("((") is False
    assert s.isValid("){") is False
    assert s.isValid("([") is False
    ```
