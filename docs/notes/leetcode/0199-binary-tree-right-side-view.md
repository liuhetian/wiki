---
description: "每层取最后一个：BFS 分层取队尾；DFS 先右后左，每个深度第一次到达的节点就是右视图"
---

# 199. 二叉树的右视图

[LeetCode 199](https://leetcode.cn/problems/binary-tree-right-side-view/) · 中等 · 二叉树

## 题

站在二叉树右侧往左看，从上到下返回每层能看到的节点值——也就是每层最右边的那个。

例：`root = [1, 2, 3, null, 5, null, 4]` → `[1, 3, 4]`。

## 一句话

右视图 = 每层最右的节点；BFS 分层取每层最后一个，或 DFS 先走右子树、每个深度第一次到达时记下。

## 关键技巧

**坑：不是「一路往右走」。** 右子树比左子树矮时，更深的层只有左边有节点，它也能被看到。例 `[1, 2, 3, 4]`：答案 `[1, 3, 4]`，4 在左子树里。

**BFS：** 套 [102](0102-binary-tree-level-order-traversal.md) 的分层模板，每层弹到最后一个时记录。

**DFS：先右后左的前序，深度首次出现即答案。** 前序「根 → 右 → 左」保证同一深度里最右的节点最先被访问。用 `len(res) == depth` 判断「这个深度第一次到达」——`res` 的长度恰好是已经见过的最大深度 + 1，不需要额外的集合。

## 解

=== "DFS（先右后左）"

    ```python
    class Solution:
        def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
            res = []

            def dfs(node, depth):
                if not node:
                    return
                if depth == len(res):  # 这个深度第一次到达，必是最右
                    res.append(node.val)
                dfs(node.right, depth + 1)
                dfs(node.left, depth + 1)

            dfs(root, 0)
            return res
    ```

=== "BFS（取每层队尾）"

    ```python
    class Solution:
        def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
            res, q = [], deque([root] if root else [])
            while q:
                res.append(q[-1].val)  # 本层入队完毕时，队尾就是最右
                for _ in range(len(q)):
                    node = q.popleft()
                    if node.left:
                        q.append(node.left)
                    if node.right:
                        q.append(node.right)
            return res
    ```

时间 $O(n)$；空间 DFS $O(h)$，BFS $O(w)$。

## 延伸

- 左视图：DFS 改成先左后右，BFS 改取 `q[0]`。
- 分层模板的其他用法见 [102. 二叉树的层序遍历](0102-binary-tree-level-order-traversal.md)、[104. 二叉树的最大深度](0104-maximum-depth-of-binary-tree.md)。

??? note "自测"

    ```python
    s = Solution()
    assert s.rightSideView(build_tree([1, 2, 3, None, 5, None, 4])) == [1, 3, 4]
    assert s.rightSideView(build_tree([1, None, 3])) == [1, 3]
    assert s.rightSideView(build_tree([])) == []
    assert s.rightSideView(build_tree([1, 2, 3, 4])) == [1, 3, 4]  # 左子树更深
    ```
