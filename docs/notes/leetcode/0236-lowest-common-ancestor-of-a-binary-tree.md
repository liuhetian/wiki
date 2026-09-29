---
description: "后序往上报「子树里找到了谁」：左右各报一个的那个节点就是 LCA，只有一边报就原样上传"
---

# 236. 二叉树的最近公共祖先

[LeetCode 236](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/) · 中等 · 二叉树

## 题

给一棵二叉树和其中两个不同节点 `p`、`q`，找它们的最近公共祖先：同时是两者祖先、且深度最大的节点（节点可以是自己的祖先）。

例：`root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 1` → `3`；`p = 5, q = 4` → `5`。

## 一句话

递归问每棵子树「你里面有 `p` 或 `q` 吗，有就把它交上来」；左右都交上来非空，当前节点就是 LCA；只有一边非空，就把那一边的结果继续往上交。

## 关键技巧

**定义返回值：** `f(node)` 返回——

- 子树里 `p`、`q` 都有：返回它们的 LCA；
- 只有其中一个：返回那个节点；
- 都没有：返回 `None`。

**合并规则：**

- `node` 本身是 `p` 或 `q`：直接返回 `node`。若另一个在它子树里，LCA 就是 `node`；若不在，返回它也符合「只有一个」的定义。
- 左右都非空：`p`、`q` 分居两侧，`node` 是第一个把它们合到一起的节点——即 LCA。
- 只一边非空：原样上传。

**为什么上传的一定是正确答案：** LCA 是自底向上第一次出现「两边都有」的地方。在它之下，每棵子树至多含一个目标；在它之上，另一侧子树不含任何目标、返回 `None`，于是 LCA 被原样一路传到根。题目保证 `p`、`q` 都在树中，所以「只找到一个就提前返回」不会出错。

## 解

```python
class Solution:
    def lowestCommonAncestor(self, root: "TreeNode", p: "TreeNode", q: "TreeNode") -> "TreeNode":
        if root is None or root is p or root is q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left and right:  # p、q 分居两侧
            return root
        return left or right
```

时间 $O(n)$，空间 $O(h)$。

## 延伸

- **BST 版**（LeetCode 235）更简单：从根往下，两个值都小就往左、都大就往右，否则当前节点就是 LCA，$O(h)$。
- 带父指针时，等价于求两条链表的交点——见 [160. 相交链表](0160-intersection-of-two-linked-lists.md)。
- 不保证 `p`、`q` 都在树中时，提前返回会出错，要改成完整遍历并统计找到了几个。
- 「子树往上汇报信息、在节点处合并」的同类题：[543. 二叉树的直径](0543-diameter-of-binary-tree.md)、[124. 二叉树中的最大路径和](0124-binary-tree-maximum-path-sum.md)。

??? note "自测"

    ```python
    def find(node, v):
        if not node or node.val == v:
            return node
        return find(node.left, v) or find(node.right, v)

    s = Solution()
    t = build_tree([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])
    assert s.lowestCommonAncestor(t, find(t, 5), find(t, 1)).val == 3
    assert s.lowestCommonAncestor(t, find(t, 5), find(t, 4)).val == 5
    assert s.lowestCommonAncestor(t, find(t, 7), find(t, 8)).val == 3
    assert s.lowestCommonAncestor(t, find(t, 6), find(t, 4)).val == 5
    t = build_tree([1, 2])
    assert s.lowestCommonAncestor(t, find(t, 1), find(t, 2)).val == 1
    ```
