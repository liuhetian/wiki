---
description: "递归改迭代的通用手法：显式栈模拟调用栈，「一路向左压栈，弹出即访问，转向右子树」"
---

# 94. 二叉树的中序遍历

[LeetCode 94](https://leetcode.cn/problems/binary-tree-inorder-traversal/) · 简单 · 二叉树

## 题

给一棵二叉树的根，按「左子树 → 根 → 右子树」的顺序返回所有节点值。

例：`root = [1, null, 2, 3]` → `[1, 3, 2]`。

## 一句话

递归三行就完；面试要的是迭代版——用栈把「还没访问的祖先」存起来，一路向左压栈，弹出一个就访问它，再转去它的右子树。

## 关键技巧

**显式栈 = 手写调用栈。** 递归版里，调用 `dfs(node)` 时先递归左边，`node` 本身挂在调用栈上等着。迭代版把这件事摊开：栈里存的恰好是「左子树还没走完、自己还没被访问」的祖先链。

**循环不变量：** 每轮开始时，`cur` 是下一个待处理子树的根，栈里是从根到 `cur` 路径上所有「接下来要被访问」的祖先，自顶向下排列。

- `cur` 非空——压栈，走左边。左子树必须先于 `cur` 访问，所以 `cur` 进栈等待；
- `cur` 为空——左边走到头了，栈顶就是当前最左的未访问节点，弹出、访问，然后它的左子树已完成、自身已访问，只剩右子树，令 `cur = node.right`。

每个节点恰好进栈一次、出栈一次，所以 $O(n)$。

**Morris 遍历**能做到 $O(1)$ 额外空间：把当前节点挂到它左子树最右节点（中序前驱）的 `right` 上当回程线索，第二次走到时再拆掉。代价是临时改树，面试提一句即可。

## 解

=== "迭代（栈）"

    ```python
    class Solution:
        def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
            res, stack, cur = [], [], root
            while cur or stack:
                while cur:            # 一路向左，祖先入栈等待
                    stack.append(cur)
                    cur = cur.left
                node = stack.pop()    # 最左的未访问节点
                res.append(node.val)
                cur = node.right      # 转向右子树
            return res
    ```

=== "递归"

    ```python
    class Solution:
        def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
            res = []

            def dfs(node):
                if node:
                    dfs(node.left)
                    res.append(node.val)
                    dfs(node.right)

            dfs(root)
            return res
    ```

时间 $O(n)$，空间 $O(h)$，$h$ 为树高，最坏（链状）$O(n)$。

## 延伸

- **BST 的中序是升序序列**——这是一整类题的钥匙：[98. 验证二叉搜索树](0098-validate-binary-search-tree.md) 检查中序是否严格递增，[230. 二叉搜索树中第 K 小的元素](0230-kth-smallest-element-in-a-bst.md) 就是迭代中序走到第 k 个停下。
- 前序迭代更简单：弹出即访问，先压右再压左。后序可以做「根右左」前序再反转。
- 中序 + 前序可以唯一确定一棵树（值互不相同时）——见 [105. 从前序与中序遍历序列构造二叉树](0105-construct-binary-tree-from-preorder-and-inorder-traversal.md)。

??? note "自测"

    ```python
    s = Solution()
    assert s.inorderTraversal(build_tree([1, None, 2, 3])) == [1, 3, 2]
    assert s.inorderTraversal(build_tree([])) == []
    assert s.inorderTraversal(build_tree([1])) == [1]
    assert s.inorderTraversal(build_tree([4, 2, 6, 1, 3, 5, 7])) == [1, 2, 3, 4, 5, 6, 7]
    ```
