---
description: "逆序存储就是竖式加法的天然顺序：逐位相加带进位，循环条件写成 l1 or l2 or carry，长度不等和最高位进位一并处理"
---

# 2. 两数相加

[LeetCode 2](https://leetcode.cn/problems/add-two-numbers/) · 中等 · 链表

## 题

两个非负整数各用一条链表表示，每个节点存一位数字，**低位在前**。返回它们的和，同样格式。除了 0 本身，数字没有前导零。

例：`2→4→3`（342）+ `5→6→4`（465）→ `7→0→8`（807）。

## 一句话

模拟竖式加法：同时走两条链，每位算 `x + y + carry`，个位落下、十位进上去。

## 关键技巧

**低位在前正好是加法的计算顺序**，从头走就是从个位算起，不用反转、不用栈。

**一个循环条件吃掉所有边界。** 写成 `while l1 or l2 or carry`：

- 一条先走完——缺的那位当 0；
- 两条都走完但还有进位（如 `5 + 5 = 10`）——多出一个节点 `1`。

三种情况不用分开写收尾代码。`divmod(s, 10)` 一次拿到进位和本位。

**进位最大是 1。** 每位最多 $9 + 9 + 1 = 19$，所以 `carry` 只会是 0 或 1，不会溢出到下下位。

## 解

```python
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = tail = ListNode()
        carry = 0
        while l1 or l2 or carry:
            s = carry + (l1.val if l1 else 0) + (l2.val if l2 else 0)
            carry, digit = divmod(s, 10)
            tail.next = ListNode(digit)
            tail = tail.next
            l1 = l1.next if l1 else None
            l2 = l2.next if l2 else None
        return dummy.next
```

时间 $O(\max(m, n))$，空间 $O(1)$（不计输出）。

## 延伸

- **高位在前**：[445. 两数相加 II](https://leetcode.cn/problems/add-two-numbers-ii/)，要么先 [206. 反转链表](0206-reverse-linked-list.md)，要么两条链各压栈再弹出相加，结果用头插法建。
- 同样用 dummy + 尾指针建新链：[21. 合并两个有序链表](0021-merge-two-sorted-lists.md)。
- **坑**：别想着把链表转成整数相加再转回来——Python 能过，但换了语言会溢出，也不是这题要考的。

??? note "自测"

    ```python
    s = Solution()
    assert list_vals(s.addTwoNumbers(build_list([2, 4, 3]), build_list([5, 6, 4]))) == [7, 0, 8]
    assert list_vals(s.addTwoNumbers(build_list([0]), build_list([0]))) == [0]
    assert list_vals(s.addTwoNumbers(build_list([9] * 7), build_list([9] * 4))) == [8, 9, 9, 9, 0, 0, 0, 1]
    assert list_vals(s.addTwoNumbers(build_list([5]), build_list([5]))) == [0, 1]
    ```
