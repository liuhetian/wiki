---
description: "每个元素入栈时顺手记下「截至此刻的最小值」；栈只在顶端变动，所以历史最小值跟着一起弹就永远正确"
---

# 155. 最小栈

[LeetCode 155](https://leetcode.cn/problems/min-stack/) · 中等 · 栈

## 题

设计一个栈，支持 `push`、`pop`、`top`，以及在常数时间内返回栈中最小元素的 `getMin`。`pop`/`top`/`getMin` 只会在非空栈上调用。

例：`push(-2), push(0), push(-3), getMin() → -3, pop(), top() → 0, getMin() → -2`。

## 一句话

栈里存 `(值, 截至该层的最小值)` 二元组，`getMin` 就是看栈顶的第二个分量。

## 关键技巧

**把「全局最小值」变成「前缀最小值」。** 栈只在顶部增删，某一层以下的内容在它存活期间不会变——所以「从栈底到第 $k$ 层的最小值」一旦算出就永远有效。入栈时算 $\min(x, \text{下一层的前缀最小})$ 存起来，$O(1)$。

**为什么不能只维护一个 `min` 变量**：弹出当前最小值后，不知道次小值是谁，只能 $O(n)$ 重扫。前缀最小值等于把「每个历史时刻的答案」都存了下来，弹栈就是回到上一个时刻。

**辅助栈写法**：另开一个栈只在 `x <= 当前最小` 时压入，弹出时若值相等一起弹——省空间（相等时也必须压，否则重复最小值弹一个就丢了）。复杂度同阶，二元组写法更不易错。

## 解

=== "二元组"

    ```python
    class MinStack:
        def __init__(self):
            self.stack = []  # (val, 截至该层的最小值)

        def push(self, val: int) -> None:
            cur_min = min(val, self.stack[-1][1]) if self.stack else val
            self.stack.append((val, cur_min))

        def pop(self) -> None:
            self.stack.pop()

        def top(self) -> int:
            return self.stack[-1][0]

        def getMin(self) -> int:
            return self.stack[-1][1]
    ```

=== "辅助栈"

    ```python
    class MinStack:
        def __init__(self):
            self.stack, self.mins = [], []

        def push(self, val: int) -> None:
            self.stack.append(val)
            if not self.mins or val <= self.mins[-1]:  # 相等也要压
                self.mins.append(val)

        def pop(self) -> None:
            if self.stack.pop() == self.mins[-1]:
                self.mins.pop()

        def top(self) -> int:
            return self.stack[-1]

        def getMin(self) -> int:
            return self.mins[-1]
    ```

所有操作时间 $O(1)$，空间 $O(n)$。

## 延伸

- **最小队列**不能照搬——队列两端都动，前缀最小值会失效。用单调队列（[239. 滑动窗口最大值](0239-sliding-window-maximum.md)）或「两个最小栈拼一个队列」。
- 「在数据结构里预存每个时刻的聚合值」是通用招：前缀和（[560. 和为 K 的子数组](0560-subarray-sum-equals-k.md)）是同一思路在数组上的版本。
- 另一种 $O(1)$ 额外空间的写法：栈里存 `val - min` 的差值，负差值表示「这里更新过最小值」——能用，但易溢出（其他语言里）且难读，面试不推荐。

??? note "自测"

    ```python
    ms = MinStack()
    ms.push(-2); ms.push(0); ms.push(-3)
    assert ms.getMin() == -3
    ms.pop()
    assert ms.top() == 0
    assert ms.getMin() == -2

    ms = MinStack()
    ms.push(1); ms.push(1); ms.push(2)
    ms.pop(); ms.pop()
    assert ms.getMin() == 1 and ms.top() == 1  # 重复最小值
    ```
