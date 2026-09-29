---
description: "深拷贝的本质是「原节点 → 新节点」的映射；哈希表显式存，或把副本插在原节点身后让 next 充当映射，O(1) 额外空间"
---

# 138. 随机链表的复制

[LeetCode 138](https://leetcode.cn/problems/copy-list-with-random-pointer/) · 中等 · 链表

## 题

链表节点除了 `next` 还有一个 `random` 指针，可以指向链表里任意节点或空。做一份深拷贝：新链表全是新节点，新节点的 `next`、`random` 都只指向新节点，结构和原链表一模一样。

例：`[[7,null],[13,0],[11,4],[10,2],[1,0]]`（每项是 `[值, random 指向的下标]`）→ 复制出同样结构的一份。

## 一句话

难点是 `random` 可能指向还没建出来的节点——先把所有副本建好，再按「原节点 → 副本」的映射连线。

## 关键技巧

**深拷贝 = 建映射 + 按映射连线。** 原节点 `x.random = y`，副本就该是 `copy(x).random = copy(y)`。只要能 $O(1)$ 查到 `copy(·)`，两遍扫描就够：第一遍建所有副本，第二遍连 `next` 和 `random`。哈希表是最直接的映射。

**把映射藏进链表结构里。** 把每个副本插在原节点身后：`A→A'→B→B'→…`。这样 `copy(x)` 就是 `x.next`，于是 `x.next.random = x.random.next`——映射不占额外空间。最后把交织的链拆成两条，原链表恢复原样。

三遍各干一件事：

1. 交织：每个 `x` 后面插入 `x'`；
2. 连 `random`：`x'.random = x.random.next`（`x.random` 为空则为空）；
3. 拆分：`x.next = x'.next`，`x'.next = x'.next.next`。

**第 2、3 步不能合并。** 拆分会破坏 `x.next == x'` 的对应关系，而后面节点的 `random` 可能指向前面已经拆开的节点。

## 解

=== "哈希表"

    ```python
    class Solution:
        def copyRandomList(self, head: Optional[Node]) -> Optional[Node]:
            copy = {None: None}  # 原节点 -> 副本，None 映射到 None 省掉判空
            cur = head
            while cur:
                copy[cur] = Node(cur.val)
                cur = cur.next
            cur = head
            while cur:
                copy[cur].next = copy[cur.next]
                copy[cur].random = copy[cur.random]
                cur = cur.next
            return copy[head]
    ```

    时间 $O(n)$，空间 $O(n)$。

=== "原地交织"

    ```python
    class Solution:
        def copyRandomList(self, head: Optional[Node]) -> Optional[Node]:
            if not head:
                return None
            cur = head
            while cur:  # A->B  =>  A->A'->B
                cur.next = Node(cur.val, cur.next)
                cur = cur.next.next
            cur = head
            while cur:  # copy(x) 就是 x.next
                if cur.random:
                    cur.next.random = cur.random.next
                cur = cur.next.next
            new_head, cur = head.next, head
            while cur:  # 拆开，原链表复原
                dup = cur.next
                cur.next = dup.next
                dup.next = dup.next.next if dup.next else None
                cur = cur.next
            return new_head
    ```

    时间 $O(n)$，空间 $O(1)$（不计输出）。

## 延伸

- **图的深拷贝同理**：[133. 克隆图](https://leetcode.cn/problems/clone-graph/) 用哈希表记「原节点 → 副本」，DFS/BFS 时遇到见过的直接取副本，防止环上无限复制。
- 哈希版里 `{None: None}` 这个小技巧，把 `next`、`random` 为空的判断全省掉了。
- **坑**：交织法的第 3 步必须把原链表也复原；LeetCode 判题会检查原链表没被改动。
- 其他链表基础模块：[206. 反转链表](0206-reverse-linked-list.md)、[21. 合并两个有序链表](0021-merge-two-sorted-lists.md)。

??? note "自测"

    ```python
    class Node:
        def __init__(self, x: int, next: Node = None, random: Node = None):
            self.val = int(x)
            self.next = next
            self.random = random


    def build(pairs):
        nodes = [Node(v) for v, _ in pairs]
        for i, (_, r) in enumerate(pairs):
            if i + 1 < len(nodes):
                nodes[i].next = nodes[i + 1]
            nodes[i].random = nodes[r] if r is not None else None
        return nodes[0] if nodes else None


    def dump(head):
        nodes, cur = [], head
        while cur:
            nodes.append(cur)
            cur = cur.next
        idx = {id(n): i for i, n in enumerate(nodes)}
        return [[n.val, idx[id(n.random)] if n.random else None] for n in nodes], nodes


    s = Solution()
    for pairs in ([[7, None], [13, 0], [11, 4], [10, 2], [1, 0]], [[1, 1], [2, 1]], [[3, None], [3, 0], [3, None]]):
        head = build(pairs)
        before = dump(head)[1]
        got, copied = dump(s.copyRandomList(head))
        assert got == pairs
        assert not {id(n) for n in copied} & {id(n) for n in before}  # 全是新节点
        assert dump(head)[0] == pairs  # 原链表没被改坏
    assert s.copyRandomList(None) is None
    ```
