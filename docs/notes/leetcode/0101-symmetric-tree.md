---
description: "一棵树的性质改写成两棵树的关系：双指针同时下行，外侧配外侧、内侧配内侧"
---

# 101. 对称二叉树

[LeetCode 101](https://leetcode.cn/problems/symmetric-tree/) · 简单 · 二叉树

## 题

判断一棵二叉树是否沿中轴左右对称（结构和值都镜像相等）。

例：`root = [1, 2, 2, 3, 4, 4, 3]` → `true`；`root = [1, 2, 2, null, 3, null, 3]` → `false`。

## 一句话

对称 ⇔ 左子树和右子树互为镜像；写一个 `mirror(a, b)` 同时走两棵树，`a.left` 对 `b.right`、`a.right` 对 `b.left`。

## 关键技巧

**单树问题升维成双树问题。** 对「根」本身问「对称吗」没法递归——子树对称不等于整棵树对称。换成两棵树的关系 `mirror(a, b)` 就能递归了：

$$\text{mirror}(a, b) \iff a.val = b.val \land \text{mirror}(a.l, b.r) \land \text{mirror}(a.r, b.l)$$

基例：两个都空为真，只有一个空为假。

**迭代版把「一对节点」当成队列元素。** 每次取出一对比较，再按外侧 `(a.left, b.right)`、内侧 `(a.right, b.left)` 成对入队。成对入队是关键——单个节点入队就丢了配对关系。

## 解

=== "递归"

    ```python
    class Solution:
        def isSymmetric(self, root: Optional[TreeNode]) -> bool:
            def mirror(a, b):
                if not a or not b:
                    return a is b          # 都空才对称
                return a.val == b.val and mirror(a.left, b.right) and mirror(a.right, b.left)

            return mirror(root.left, root.right) if root else True
    ```

=== "迭代（成对入队）"

    ```python
    class Solution:
        def isSymmetric(self, root: Optional[TreeNode]) -> bool:
            if not root:
                return True
            q = deque([(root.left, root.right)])
            while q:
                a, b = q.popleft()
                if not a and not b:
                    continue
                if not a or not b or a.val != b.val:
                    return False
                q.append((a.left, b.right))
                q.append((a.right, b.left))
            return True
    ```

时间 $O(n)$；空间递归 $O(h)$，迭代 $O(w)$。

## 延伸

- 「判断两棵树相同」（LeetCode 100）是同一个模板，只是配对改成 `left` 对 `left`。
- 与 [226. 翻转二叉树](0226-invert-binary-tree.md) 的关系：树对称 ⇔ 树等于自己翻转后的结果，但那样要改树或复制树，不如直接双指针比。

??? note "自测"

    ```python
    s = Solution()
    assert s.isSymmetric(build_tree([1, 2, 2, 3, 4, 4, 3])) is True
    assert s.isSymmetric(build_tree([1, 2, 2, None, 3, None, 3])) is False
    assert s.isSymmetric(build_tree([1])) is True
    assert s.isSymmetric(build_tree([1, 2, 2, 2, None, 2])) is False
    ```
