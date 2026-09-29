---
description: "BST 中序即升序，迭代中序数到第 k 个就停；频繁查询时给节点记子树大小，按排名二分下行"
---

# 230. 二叉搜索树中第 K 小的元素

[LeetCode 230](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/) · 中等 · 二叉树

## 题

给一棵二叉搜索树和整数 `k`，返回树中第 `k` 小的值（`k` 从 1 开始，保证合法）。

例：`root = [3, 1, 4, null, 2], k = 1` → `1`。

## 一句话

BST 的中序遍历是升序序列，第 k 个出栈的节点就是答案——迭代中序可以提前停，不用走完整棵树。

## 关键技巧

**把「第 k 小」翻译成「中序第 k 个」。** BST 中序严格递增，所以排名和中序位置一一对应。

**迭代比递归好在能早停。** 迭代中序先一路向左压栈（$O(h)$），之后每弹一个节点就是下一个更大的值。弹到第 k 个直接返回，总代价 $O(h + k)$，而不是 $O(n)$。

**进阶：树会频繁增删、反复查询。** 给每个节点维护子树大小 `size`。在节点 `x` 处设左子树大小为 $s$：

- $k \le s$：答案在左子树，往左走；
- $k = s + 1$：就是 `x`；
- $k > s + 1$：往右走，$k \leftarrow k - s - 1$。

每次查询 $O(h)$，配合平衡树就是 $O(\log n)$——这就是「顺序统计树」。

## 解

```python
class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        stack, cur = [], root
        while True:
            while cur:
                stack.append(cur)
                cur = cur.left
            cur = stack.pop()
            k -= 1
            if k == 0:  # 第 k 个出栈的就是第 k 小
                return cur.val
            cur = cur.right
```

时间 $O(h + k)$，空间 $O(h)$。

## 延伸

- 迭代中序模板见 [94. 二叉树的中序遍历](0094-binary-tree-inorder-traversal.md)；同样靠「中序有序」的还有 [98. 验证二叉搜索树](0098-validate-binary-search-tree.md)。
- 数组里的第 k 大不需要有序结构，用堆或快速选择——见 [215. 数组中的第K个最大元素](0215-kth-largest-element-in-an-array.md)。
- 求第 k 大：反向中序（右 → 根 → 左）即可。

??? note "自测"

    ```python
    s = Solution()
    assert s.kthSmallest(build_tree([3, 1, 4, None, 2]), 1) == 1
    assert s.kthSmallest(build_tree([5, 3, 6, 2, 4, None, None, 1]), 3) == 3
    assert s.kthSmallest(build_tree([1]), 1) == 1
    t = build_tree([4, 2, 6, 1, 3, 5, 7])
    assert [s.kthSmallest(t, k) for k in range(1, 8)] == [1, 2, 3, 4, 5, 6, 7]
    ```
