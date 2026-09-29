---
description: "有序数组取中点当根、两半递归建子树——BST 性质来自有序，平衡来自两半大小差不超过 1"
---

# 108. 将有序数组转换为二叉搜索树

[LeetCode 108](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/) · 简单 · 二叉树

## 题

给一个严格升序的整数数组，把它构造成一棵**高度平衡**的二叉搜索树（每个节点左右子树高度差不超过 1）。答案不唯一。

例：`nums = [-10, -3, 0, 5, 9]` → `[0, -3, 9, -10, null, 5]`（之一）。

## 一句话

中点当根，左半段建左子树、右半段建右子树，递归下去。

## 关键技巧

**两个性质各有来源。**

- **BST**：数组有序，中点左边都比它小、右边都比它大，递归建出的左右子树分别只含这两段——BST 定义直接满足。换个角度，这是在把「中序遍历」倒过来：BST 的中序就是这个有序数组。
- **平衡**：区间 `[lo, hi]` 取 `mid = (lo + hi) // 2`，左右两段长度差 ≤ 1。归纳可证：长度为 $n$ 的区间建出的树高为 $\lceil \log_2(n+1) \rceil$，这个函数单调，两段长度差 ≤ 1 时高度差也 ≤ 1。

**用下标不用切片。** `nums[:mid]` 每层复制数组，总代价 $O(n \log n)$；传 `lo, hi` 下标是 $O(n)$。

## 解

```python
class Solution:
    def sortedArrayToBST(self, nums: List[int]) -> Optional[TreeNode]:
        def build(lo, hi):  # 闭区间 [lo, hi]
            if lo > hi:
                return None
            mid = (lo + hi) // 2
            return TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi))

        return build(0, len(nums) - 1)
```

时间 $O(n)$，空间 $O(\log n)$（递归栈，不计输出）。

## 延伸

- **「选根 → 切分区间 → 递归」是建树题的共同骨架**：[105. 从前序与中序遍历序列构造二叉树](0105-construct-binary-tree-from-preorder-and-inorder-traversal.md) 的根由前序给出，切分点在中序里查。
- 反过来验证：对结果做中序遍历应该还原出原数组，见 [98. 验证二叉搜索树](0098-validate-binary-search-tree.md)。
- 有序链表版（LeetCode 109）没有随机访问，可以用快慢指针找中点，或按中序顺序边建边移动链表指针做到 $O(n)$。

??? note "自测"

    ```python
    s = Solution()

    def inorder(node):
        return inorder(node.left) + [node.val] + inorder(node.right) if node else []

    def height(node):  # 不平衡时返回 -1
        if not node:
            return 0
        l, r = height(node.left), height(node.right)
        return -1 if l < 0 or r < 0 or abs(l - r) > 1 else 1 + max(l, r)

    for nums in ([-10, -3, 0, 5, 9], [1, 3], [0], list(range(100))):
        t = s.sortedArrayToBST(nums)
        assert inorder(t) == nums and height(t) >= 1
    assert tree_vals(s.sortedArrayToBST([-10, -3, 0, 5, 9])) == [0, -10, 5, None, -3, None, 9]
    ```
