---
description: "每个节点交换左右孩子，访问顺序无所谓——前序、后序、层序都对，唯独中序会换两次"
---

# 226. 翻转二叉树

[LeetCode 226](https://leetcode.cn/problems/invert-binary-tree/) · 简单 · 二叉树

## 题

把一棵二叉树左右镜像：每个节点的左右子树互换，返回新根。

例：`root = [4, 2, 7, 1, 3, 6, 9]` → `[4, 7, 2, 9, 6, 3, 1]`。

## 一句话

镜像 = 每个节点都把左右孩子对调一次；递归地翻转两棵子树，再交换它们。

## 关键技巧

**全局操作拆成逐点操作。** 「整棵树镜像」听起来是全局变换，但它等价于「每个节点各自交换一次左右指针」——因为节点 `x` 在镜像后的位置只取决于从根到它路径上每一步的左右方向全部取反，而这正是每个祖先各交换一次的效果。

**访问顺序随意，但每个节点只能交换一次。** 前序（先换再递归）、后序（先递归再换）、BFS 都对。中序是坑：递归左子树 → 交换 → 再递归「右子树」，可此时的右子树是刚翻完的原左子树，它被翻了两次、原右子树一次没翻。非要中序，第二次递归也写 `left`。

## 解

=== "递归"

    ```python
    class Solution:
        def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
            if root:
                root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
            return root
    ```

=== "BFS"

    ```python
    class Solution:
        def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
            q = deque([root] if root else [])
            while q:
                node = q.popleft()
                node.left, node.right = node.right, node.left
                for child in (node.left, node.right):
                    if child:
                        q.append(child)
            return root
    ```

时间 $O(n)$；空间递归 $O(h)$，BFS $O(w)$。

## 延伸

- 判断一棵树是否等于自己的镜像，不必真翻——见 [101. 对称二叉树](0101-symmetric-tree.md)，同时走两棵子树、方向相反地比较。
- Python 元组赋值右侧先全部求值，所以一行写法里两个递归都拿到的是原孩子，不会串。

??? note "自测"

    ```python
    s = Solution()
    assert tree_vals(s.invertTree(build_tree([4, 2, 7, 1, 3, 6, 9]))) == [4, 7, 2, 9, 6, 3, 1]
    assert tree_vals(s.invertTree(build_tree([2, 1, 3]))) == [2, 3, 1]
    assert s.invertTree(None) is None
    assert tree_vals(s.invertTree(build_tree([1, 2]))) == [1, None, 2]
    ```
