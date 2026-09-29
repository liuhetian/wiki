---
description: "前序给根，中序按根切成左右两段，段长反推前序的切分——哈希表存中序下标，建树 O(n)"
---

# 105. 从前序与中序遍历序列构造二叉树

[LeetCode 105](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) · 中等 · 二叉树

## 题

给出同一棵二叉树的前序遍历和中序遍历（节点值互不相同），还原这棵树。

例：`preorder = [3, 9, 20, 15, 7], inorder = [9, 3, 15, 20, 7]` → `[3, 9, 20, null, null, 15, 7]`。

## 一句话

前序第一个是根；在中序里找到根，左边是左子树、右边是右子树；左子树有几个节点，前序里根后面就跟几个左子树节点——递归两段。

## 关键技巧

**两种遍历各提供一半信息。** 前序是 `[根 | 左子树 | 右子树]`，告诉你根是谁，但不知道左右分界；中序是 `[左子树 | 根 | 右子树]`，知道根就能切出分界。合起来：

- 根 = `preorder[pl]`；
- 在中序里定位根的下标 `k`，左子树大小 $s = k - il$；
- 左子树：前序 `[pl+1, pl+s]`，中序 `[il, k-1]`；
- 右子树：前序 `[pl+s+1, pr]`，中序 `[k+1, ir]`。

**值互不相同是前提**——否则中序里根的位置不唯一，树也不唯一。

**哈希表把定位降到 $O(1)$。** 每层线性扫中序找根，退化成链时 $O(n^2)$；预存 `值 → 中序下标`，总共 $O(n)$。

**更省的写法：** 按前序顺序依次消费节点（全局指针 `i`），递归只传中序的区间。因为前序正好是「根 → 整个左子树 → 整个右子树」，先递归左边就会恰好消费掉左子树的所有节点。

## 解

```python
class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        pos = {v: i for i, v in enumerate(inorder)}
        it = iter(preorder)  # 按前序顺序依次取根

        def build(lo, hi):   # 用中序 [lo, hi] 这段建树
            if lo > hi:
                return None
            root = TreeNode(next(it))
            k = pos[root.val]
            root.left = build(lo, k - 1)   # 必须先左后右，和前序消费顺序一致
            root.right = build(k + 1, hi)
            return root

        return build(0, len(inorder) - 1)
```

时间 $O(n)$，空间 $O(n)$（哈希表，递归栈 $O(h)$）。

## 延伸

- 后序 + 中序（LeetCode 106）：后序最后一个是根，从后往前消费、**先建右子树**。
- 前序 + 后序不能唯一确定树（只有一个孩子时分不清左右）。
- 「选根 → 切区间 → 递归」的另一个例子是 [108. 将有序数组转换为二叉搜索树](0108-convert-sorted-array-to-binary-search-tree.md)；中序的写法见 [94. 二叉树的中序遍历](0094-binary-tree-inorder-traversal.md)。

??? note "自测"

    ```python
    s = Solution()
    assert tree_vals(s.buildTree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])) == [3, 9, 20, None, None, 15, 7]
    assert tree_vals(s.buildTree([-1], [-1])) == [-1]
    assert tree_vals(s.buildTree([1, 2, 3], [3, 2, 1])) == [1, 2, None, 3]   # 左链
    assert tree_vals(s.buildTree([1, 2, 3], [1, 2, 3])) == [1, None, 2, None, 3]  # 右链
    ```
