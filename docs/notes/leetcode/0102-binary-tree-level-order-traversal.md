---
description: "BFS 分层的标准手法：每轮先记下 len(queue)，恰好弹这么多个——队列里天然只剩一整层"
---

# 102. 二叉树的层序遍历

[LeetCode 102](https://leetcode.cn/problems/binary-tree-level-order-traversal/) · 中等 · 二叉树

## 题

按从上到下、每层从左到右的顺序返回二叉树的节点值，每层单独一个列表。

例：`root = [3, 9, 20, null, null, 15, 7]` → `[[3], [9, 20], [15, 7]]`。

## 一句话

BFS 用队列；要分层，就在每轮开始时数一下队列长度，只弹这么多个，弹出的就是完整一层。

## 关键技巧

**不变量：每轮开始时，队列里恰好是一整层、且只有这一层。** 初始只有根，成立。假设第 $k$ 轮开始时队列里是第 $k$ 层的全部 $m$ 个节点：这一轮恰好弹 $m$ 个，每弹一个把它的孩子（第 $k+1$ 层）追加到队尾——弹完 $m$ 个后，第 $k$ 层全部出队、第 $k+1$ 层全部入队，不变量保持。

所以关键在 `for _ in range(len(q))`：`len(q)` 在循环开始时求值一次，之后新入队的下一层节点不会混进本轮。

**为什么 BFS 保证从左到右：** 队列先进先出，同层节点按左到右入队，它们的孩子也就按左到右排在下一层。

**DFS 也能做：** 带着深度 `d` 前序遍历，把节点值追加到 `res[d]`。前序保证同层先左后右。

## 解

```python
class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        res, q = [], deque([root] if root else [])
        while q:
            level = []
            for _ in range(len(q)):  # 只弹当前这一层
                node = q.popleft()
                level.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(level)
        return res
```

时间 $O(n)$，空间 $O(w)$，$w$ 为最大层宽，满二叉树时约 $n/2$。

## 延伸

- **同一模板取每层最后一个**就是 [199. 二叉树的右视图](0199-binary-tree-right-side-view.md)；数层数就是 [104. 二叉树的最大深度](0104-maximum-depth-of-binary-tree.md)。
- 锯齿形层序（LeetCode 103）：奇数层把 `level` 反转即可，不必改入队顺序。
- 分层 BFS 在图上同样好用——多源 BFS 按层扩散求步数，见 [994. 腐烂的橘子](0994-rotting-oranges.md)。

??? note "自测"

    ```python
    s = Solution()
    assert s.levelOrder(build_tree([3, 9, 20, None, None, 15, 7])) == [[3], [9, 20], [15, 7]]
    assert s.levelOrder(build_tree([1])) == [[1]]
    assert s.levelOrder(build_tree([])) == []
    assert s.levelOrder(build_tree([1, 2, 3, 4, None, None, 5])) == [[1], [2, 3], [4, 5]]
    ```
