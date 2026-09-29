---
description: "树形递归的最小模板：信任子问题的返回值，只写「当前节点怎么合并左右答案」"
---

# 104. 二叉树的最大深度

[LeetCode 104](https://leetcode.cn/problems/maximum-depth-of-binary-tree/) · 简单 · 二叉树

## 题

给一棵二叉树，求根到最远叶子的路径上有多少个节点。

例：`root = [3, 9, 20, null, null, 15, 7]` → `3`。

## 一句话

深度 = 1 + 左右子树深度的较大者，空树深度 0。

## 关键技巧

**只想一层。** 写树递归的正确姿势是：假设 `maxDepth(left)`、`maxDepth(right)` 已经算对了，当前节点只负责合并——$d(\text{node}) = 1 + \max(d(L), d(R))$，再补上基例 $d(\varnothing) = 0$。正确性由结构归纳法保证，不需要在脑子里展开整棵树。

**两种视角。** 这是「自底向上返回值」的写法（后序）；另一种是「自顶向下带参数」——DFS 时带着当前深度走，到节点就更新全局最大值（前序）。前者是分治，后者是遍历，后面很多题要在两者之间选。

**BFS 按层数也行：** 层序遍历走了几层，深度就是几。

## 解

=== "递归（分治）"

    ```python
    class Solution:
        def maxDepth(self, root: Optional[TreeNode]) -> int:
            if not root:
                return 0
            return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))
    ```

=== "BFS（数层）"

    ```python
    class Solution:
        def maxDepth(self, root: Optional[TreeNode]) -> int:
            depth, q = 0, deque([root] if root else [])
            while q:
                depth += 1
                for _ in range(len(q)):
                    node = q.popleft()
                    if node.left:
                        q.append(node.left)
                    if node.right:
                        q.append(node.right)
            return depth
    ```

时间 $O(n)$；空间递归 $O(h)$，BFS $O(w)$（$w$ 为最大层宽）。

## 延伸

- **同一模板加一个全局变量**就是 [543. 二叉树的直径](0543-diameter-of-binary-tree.md)：返回值仍是深度，顺手在每个节点用 `左深 + 右深` 更新答案；再进一步是 [124. 二叉树中的最大路径和](0124-binary-tree-maximum-path-sum.md)。
- BFS 版的「按层切片」就是 [102. 二叉树的层序遍历](0102-binary-tree-level-order-traversal.md)。
- 最小深度（LeetCode 111）有坑：只有一个孩子的节点不是叶子，不能直接 `min(左, 右)`。

??? note "自测"

    ```python
    s = Solution()
    assert s.maxDepth(build_tree([3, 9, 20, None, None, 15, 7])) == 3
    assert s.maxDepth(build_tree([1, None, 2])) == 2
    assert s.maxDepth(build_tree([])) == 0
    assert s.maxDepth(build_tree([1, 2, None, 3, None, 4])) == 4
    ```
