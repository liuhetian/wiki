---
description: "领域建模的 GLOSSARY.md 格式：术语表的结构、四条收词规矩，单上下文与多上下文仓库怎么摆"
---

# GLOSSARY.md 格式

## 结构

```md
# {上下文名称}

{一两句话说明这个上下文是什么、为什么存在。}

## 术语

**订单（Order）**：
{一两句话描述这个术语}
_避免_：购买、交易

**发票（Invoice）**：
交货后发给客户的付款请求。
_避免_：账单、付款请求

**客户（Customer）**：
下订单的个人或组织。
_避免_：主顾、买家、账户
```

## 规矩

- **要有主见。** 同一个概念有多个叫法时，挑最好的那个，其余列在 `_避免_` 下。
- **定义要紧。** 最多一两句。定义它*是*什么，不是它*做*什么。
- **只收本项目上下文特有的术语。** 通用编程概念（超时、错误类型、工具函数模式）即使项目里大量使用也不收。加一个术语之前先问：这是本上下文独有的概念，还是通用编程概念？只有前者该收。
- **自然成簇时用小标题分组。** 所有术语都属于同一个内聚的领域，平铺列表就行。

## 单上下文与多上下文仓库

**单上下文（大多数仓库）：** 仓库根目录一个 `GLOSSARY.md`。

**多上下文：** 仓库根目录放一个 `GLOSSARY-MAP.md`，列出各个上下文、它们在哪、彼此什么关系：

```md
# 术语表地图

## 上下文

- [Ordering](./src/ordering/GLOSSARY.md)：接收并跟踪客户订单
- [Billing](./src/billing/GLOSSARY.md)：生成发票、处理付款
- [Fulfillment](./src/fulfillment/GLOSSARY.md)：管理仓库拣货和发货

## 关系

- **Ordering → Fulfillment**：Ordering 发出 `OrderPlaced` 事件；Fulfillment 消费它，开始拣货
- **Fulfillment → Billing**：Fulfillment 发出 `ShipmentDispatched` 事件；Billing 消费它，生成发票
- **Ordering ↔ Billing**：共享 `CustomerId` 和 `Money` 类型
```

按下面推断适用哪种结构：

- 有 `GLOSSARY-MAP.md`，读它找到各个上下文
- 只有根目录一个 `GLOSSARY.md`，就是单上下文
- 两个都没有，在第一个术语定下来时，按需在根目录建 `GLOSSARY.md`

有多个上下文时，推断当前话题属于哪一个。拿不准就问。
