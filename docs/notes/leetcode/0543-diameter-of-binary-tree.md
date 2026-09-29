---
description: "返回值与答案分离：递归返回「往下单边能走多深」，答案在每个拐点用「左深 + 右深」顺手更新"
---

# 543. 二叉树的直径

[LeetCode 543](https://leetcode.cn/problems/diameter-of-binary-tree/) · 简单 · 二叉树

## 题

求二叉树中任意两个节点之间最长路径的**边数**。这条路径不一定经过根。

例：`root = [1, 2, 3, 4, 5]` → `3`（路径 `4 → 2 → 1 → 3` 或 `5 → 2 → 1 → 3`）。

## 一句话

任何路径都有唯一的最高点；以 `node` 为最高点的最长路径长 = 左子树深度 + 右子树深度，对每个节点取最大。

## 关键技巧

**按「最高点」给路径分类。** 树上任意一条路径，往上走到某个节点再往下，这个拐点唯一。所以枚举拐点 `node`，最长的那条就是从 `node` 往左下走到底加上往右下走到底：$L(\text{node}) + R(\text{node})$，$L$、$R$ 是子树深度（节点数）。

**递归返回的不是答案。** 父节点要用的是「从我往下最多走几个节点」（单边深度），而题目要的是「以我为拐点的双边长度」。两者不同，所以：

- 返回值：$1 + \max(L, R)$——单边，因为父节点只能从一边接上来；
- 全局答案：$\max(\text{ans}, L + R)$——双边，在当前节点结算。

这是树形 DP 最常见的形态——**返回给父亲的量** ≠ **在本节点结算的量**。

## 解

```python
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        ans = 0

        def depth(node):  # 以 node 为顶、单边向下的最长链的节点数
            nonlocal ans
            if not node:
                return 0
            l, r = depth(node.left), depth(node.right)
            ans = max(ans, l + r)  # 以 node 为拐点，边数 = 两侧节点数之和
            return 1 + max(l, r)

        depth(root)
        return ans
```

时间 $O(n)$，空间 $O(h)$。

## 延伸

- **节点带权、可以为负**就是 [124. 二叉树中的最大路径和](0124-binary-tree-maximum-path-sum.md)——同一骨架，多一步「负贡献就不接」。
- 单边深度本身是 [104. 二叉树的最大深度](0104-maximum-depth-of-binary-tree.md)。
- 边数与节点数差 1，是这题最常见的错；这里 `depth` 数节点、`l + r` 恰好是边数。

??? note "自测"

    ```python
    s = Solution()
    assert s.diameterOfBinaryTree(build_tree([1, 2, 3, 4, 5])) == 3
    assert s.diameterOfBinaryTree(build_tree([1, 2])) == 1
    assert s.diameterOfBinaryTree(build_tree([1])) == 0
    # 最长路径不经过根：左子树内部拐弯
    assert s.diameterOfBinaryTree(build_tree([1, 2, None, 3, 4, 5, None, None, 6, 7, None, None, 8])) == 6
    ```
