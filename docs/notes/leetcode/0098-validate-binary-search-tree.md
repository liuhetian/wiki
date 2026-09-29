---
description: "只比父子是错的——BST 约束是整棵子树的上下界，递归时把 (lo, hi) 开区间往下传"
---

# 98. 验证二叉搜索树

[LeetCode 98](https://leetcode.cn/problems/validate-binary-search-tree/) · 中等 · 二叉树

## 题

判断一棵二叉树是不是有效的二叉搜索树：任一节点的左子树所有值都**严格小于**它，右子树所有值都**严格大于**它，且左右子树本身也是 BST。

例：`root = [2, 1, 3]` → `true`；`root = [5, 1, 4, null, null, 3, 6]` → `false`（4 在 5 的右边却比 5 小）。

## 一句话

每个节点都活在一个由祖先决定的开区间 `(lo, hi)` 里；往左走收紧上界，往右走收紧下界，出界就不是 BST。

## 关键技巧

**经典错误：只比较 `node.left.val < node.val < node.right.val`。** 反例 `[5, 4, 6, null, null, 3, 7]`：每对父子都满足，但 3 在 5 的右子树里却小于 5。BST 是**子树级**约束，不是父子级。

**把约束变成参数往下传。** 从根出发，节点 `x` 的合法范围是 $(lo, hi)$：

- 进左子树：所有值必须 $< x$，范围变为 $(lo, x)$；
- 进右子树：所有值必须 $> x$，范围变为 $(x, hi)$。

区间始终是从根到当前节点路径上所有「拐弯」给出的界的交集——这恰好就是 BST 定义展开后对该节点的全部约束，所以既必要又充分。

**另一条路：中序严格递增。** BST ⇔ 中序遍历严格递增。迭代中序，记住上一个值 `prev`，出现 `cur <= prev` 立刻返回假。

## 解

=== "上下界递归"

    ```python
    class Solution:
        def isValidBST(self, root: Optional[TreeNode]) -> bool:
            def ok(node, lo, hi):  # node 的所有值须落在开区间 (lo, hi)
                if not node:
                    return True
                if not lo < node.val < hi:
                    return False
                return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)

            return ok(root, -inf, inf)
    ```

=== "中序递增"

    ```python
    class Solution:
        def isValidBST(self, root: Optional[TreeNode]) -> bool:
            stack, cur, prev = [], root, -inf
            while cur or stack:
                while cur:
                    stack.append(cur)
                    cur = cur.left
                cur = stack.pop()
                if cur.val <= prev:
                    return False
                prev = cur.val
                cur = cur.right
            return True
    ```

时间 $O(n)$，空间 $O(h)$。

## 延伸

- 用 `-inf / inf` 当初始界，避开节点值恰好等于 `INT_MIN / INT_MAX` 的坑（C++/Java 里常用 `long` 或传 `null`）。
- 中序写法的模板见 [94. 二叉树的中序遍历](0094-binary-tree-inorder-traversal.md)；同样利用「BST 中序有序」的还有 [230. 二叉搜索树中第 K 小的元素](0230-kth-smallest-element-in-a-bst.md)。

??? note "自测"

    ```python
    s = Solution()
    assert s.isValidBST(build_tree([2, 1, 3])) is True
    assert s.isValidBST(build_tree([5, 1, 4, None, None, 3, 6])) is False
    assert s.isValidBST(build_tree([5, 4, 6, None, None, 3, 7])) is False  # 只比父子会误判
    assert s.isValidBST(build_tree([2, 2, 2])) is False                    # 严格小于/大于
    assert s.isValidBST(build_tree([1])) is True
    assert s.isValidBST(build_tree([-2**31, None, 2**31 - 1])) is True
    ```
