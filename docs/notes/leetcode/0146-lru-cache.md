---
description: "哈希表管「O(1) 找到」，双向链表管「O(1) 挪位和淘汰」，两者存同一个节点；哨兵头尾让插入删除零特判"
---

# 146. LRU 缓存

[LeetCode 146](https://leetcode.cn/problems/lru-cache/) · 中等 · 链表

## 题

设计一个容量固定的缓存类 `LRUCache`：

- `get(key)`：有就返回值，没有返回 `-1`；
- `put(key, value)`：写入或更新；写入后超出容量，就踢掉**最久没被用过**的那个键。

`get` 和 `put` 都算「用过」。两个操作都要求平均 $O(1)$。

例：容量 2，`put(1,1) put(2,2) get(1)→1 put(3,3)`（踢掉 2）`get(2)→-1`。

## 一句话

哈希表 `key → 节点`，节点串在一条按「最近使用」排序的双向链表里；用到就挪到表头，满了就删表尾。

## 关键技巧

**两个需求各要一种结构，而且得是同一批节点。**

- 按 key 查找要 $O(1)$ → 哈希表；
- 维护「使用先后顺序」，并能 $O(1)$ 把任意元素挪到最前、删掉最后 → 链表。单链表删节点要知道前驱，查前驱是 $O(n)$，所以要**双向**。

哈希表的值直接存链表节点，查到就能原地摘下；节点里还要存 `key`，因为淘汰表尾时要反查回哈希表把它删掉。

**哨兵头尾。** 放一个假头 `head`、假尾 `tail`，真实节点永远夹在中间。于是「摘下节点」「插到最前」都不用判断是不是空表、是不是边界节点——四行指针操作通吃。

**操作全拆成两个原语**：`_remove(node)` 和 `_push_front(node)`。`get` 命中 = 摘下 + 插前；`put` 更新 = 改值 + 摘下 + 插前；`put` 新键满了 = 摘 `tail.prev` + 从哈希表删 + 新节点插前。

## 解

=== "OrderedDict"

    ```python
    class LRUCache:
        def __init__(self, capacity: int):
            self.cap = capacity
            self.od = OrderedDict()  # 末尾 = 最近使用

        def get(self, key: int) -> int:
            if key not in self.od:
                return -1
            self.od.move_to_end(key)
            return self.od[key]

        def put(self, key: int, value: int) -> None:
            if key in self.od:
                self.od.move_to_end(key)
            self.od[key] = value
            if len(self.od) > self.cap:
                self.od.popitem(last=False)  # 弹最久未用
    ```

    `OrderedDict` 内部就是哈希表 + 双向链表，面试时一般要求手写下面那版。

=== "哈希表 + 双向链表"

    ```python
    class DNode:
        __slots__ = ("key", "val", "prev", "next")

        def __init__(self, key=0, val=0):
            self.key, self.val = key, val
            self.prev = self.next = None


    class LRUCache:
        def __init__(self, capacity: int):
            self.cap = capacity
            self.map = {}
            self.head, self.tail = DNode(), DNode()  # 哨兵：head 后是最近使用，tail 前是最久未用
            self.head.next, self.tail.prev = self.tail, self.head

        def _remove(self, node):
            node.prev.next, node.next.prev = node.next, node.prev

        def _push_front(self, node):
            node.prev, node.next = self.head, self.head.next
            self.head.next.prev = node
            self.head.next = node

        def get(self, key: int) -> int:
            node = self.map.get(key)
            if not node:
                return -1
            self._remove(node)
            self._push_front(node)
            return node.val

        def put(self, key: int, value: int) -> None:
            if key in self.map:
                node = self.map[key]
                node.val = value
                self._remove(node)
                self._push_front(node)
                return
            if len(self.map) == self.cap:
                lru = self.tail.prev
                self._remove(lru)
                del self.map[lru.key]  # 节点里存 key 就是为了这一步
            node = DNode(key, value)
            self.map[key] = node
            self._push_front(node)
    ```

时间：`get`、`put` 均 $O(1)$；空间 $O(\text{capacity})$。

## 延伸

- **淘汰策略换成「最不常用」**：[460. LFU 缓存](https://leetcode.cn/problems/lfu-cache/)，按频次分桶，每个桶是一条这题的双向链表，再记一个当前最小频次。
- 双向链表的基本操作可以对照单链表的 [206. 反转链表](0206-reverse-linked-list.md)、[19. 删除链表的倒数第 N 个结点](0019-remove-nth-node-from-end-of-list.md)——单链表删除要找前驱，这里 `prev` 指针把它变成了 $O(1)$。
- 同是「设计一个数据结构、每个操作 $O(1)$」：[155. 最小栈](0155-min-stack.md)。
- **坑**：`put` 已存在的键时要算「使用」，也要挪到最前；只改值不挪位是常见错误。容量满时先淘汰再插入，别反过来把刚插入的踢掉。

??? note "自测"

    ```python
    c = LRUCache(2)
    c.put(1, 1)
    c.put(2, 2)
    assert c.get(1) == 1
    c.put(3, 3)          # 淘汰 2
    assert c.get(2) == -1
    c.put(4, 4)          # 淘汰 1
    assert c.get(1) == -1
    assert c.get(3) == 3
    assert c.get(4) == 4

    c = LRUCache(1)
    c.put(2, 1)
    assert c.get(2) == 1
    c.put(3, 2)
    assert c.get(2) == -1
    assert c.get(3) == 2

    c = LRUCache(2)      # 更新已有键也算使用
    c.put(1, 1)
    c.put(2, 2)
    c.put(1, 10)
    c.put(3, 3)          # 淘汰 2 而不是 1
    assert c.get(1) == 10
    assert c.get(2) == -1
    ```
