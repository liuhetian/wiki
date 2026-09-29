---
description: "快慢指针找中点 + 反转后半段 + 双指针对比，三个链表模块拼出 O(1) 空间；单链表不能倒着走，就把后半段翻过来"
---

# 234. 回文链表

[LeetCode 234](https://leetcode.cn/problems/palindrome-linked-list/) · 简单 · 链表

## 题

判断一条单链表的值序列正读反读是否一样。

例：`1→2→2→1` → `true`；`1→2` → `false`。

进阶要求：时间 $O(n)$，空间 $O(1)$。

## 一句话

找到中点，把后半段原地反转，然后从两头往中间逐个比。

## 关键技巧

**回文判断需要「从尾往前走」，单链表没有 `prev`——那就把后半段反过来。** 数组的做法是首尾双指针相向而行；链表只能单向走，于是把后半段反转，尾巴变成新头，两个指针就都能「向中间」走了。

**快慢指针找中点。** `fast` 一次两步、`slow` 一次一步，`fast` 走不动时 `slow` 在中间：长度为偶数时停在后半段第一个，奇数时停在正中间。正中间那个归到后半段无所谓——它和自己比，必然相等。

**比较以后半段为准。** 反转后，前半段的最后一个节点仍然指着原来的中间节点（它的 `next` 没改过），所以前半段不会先走完；以 `q`（后半段）走到 `None` 为止。

偷懒版是把值拷进数组再 `vals == vals[::-1]`，$O(n)$ 空间，面试时先说这个再给进阶版。

## 解

```python
class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow, fast = slow.next, fast.next.next
        # 反转以 slow 开头的后半段
        prev = None
        while slow:
            nxt = slow.next
            slow.next = prev
            prev, slow = slow, nxt
        p, q = head, prev
        while q:
            if p.val != q.val:
                return False
            p, q = p.next, q.next
        return True
```

时间 $O(n)$，空间 $O(1)$。

## 延伸

- **坑**：这个解改动了输入链表。生产代码或题目要求不修改时，比较完再把后半段反转回去接上。
- 用到的两个模块：[206. 反转链表](0206-reverse-linked-list.md)（反转）、[141. 环形链表](0141-linked-list-cycle.md)（快慢指针）；[148. 排序链表](0148-sort-list.md) 的归并也用快慢指针切中点。
- 字符串版的回文见 [5. 最长回文子串](0005-longest-palindromic-substring.md)，那里是中心扩展，思路反过来：从中间往两边走。

??? note "自测"

    ```python
    s = Solution()
    assert s.isPalindrome(build_list([1, 2, 2, 1])) is True
    assert s.isPalindrome(build_list([1, 2])) is False
    assert s.isPalindrome(build_list([1, 2, 3, 2, 1])) is True
    assert s.isPalindrome(build_list([1, 2, 3, 1])) is False
    assert s.isPalindrome(build_list([1])) is True
    ```
