---
description: "不是心智模型深挖，是查表：类型系统、解构、异步、?./??/as/satisfies 这类符号，以及 deepseek-harness 仓库自己的高频写法（ctx.effect、waterfall next()、Branded）"
---

# Python 后端读 TS 仓库：暴力语法对照表

## 这仓库是什么

[deepseek-harness](https://github.com/deepseek-ai/deepseek-harness/tree/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e) 是 **TypeScript**，不是纯 JS：`git ls-files '*.ts' | wc -l` 数出 2472 个，`.js` 基本是构建产物/脚本壳。`package.json` 里 `"type": "module"`，即 **ESM**（`import`/`export`），不是 CommonJS（`require`）。跑源码用 `tsx`（TS 版 `ts-node`），编译用 `tsc` + `tsdown`。

下面所有行号和引用都钉在 `b150a551b8`（2026-08-21）上，上游改了也不影响这篇能不能复核。

这篇不是教你学 TS，是给已经会写 Python 的人一张**查表**：看到一个语法认不出来，来这翻，翻到了继续读代码，别在这停留太久。骨架是**逐类对照**，不是心智模型深挖——想理解某个机制"为什么这么设计"，去看仓库自己的 `docs/architecture.md` 和 `docs/glossary.md`。

!!! tip "读的姿势"
    不用从头到尾看完。带着当前卡住的那行代码来，Ctrl+F 找关键符号（比如 `?.`、`as`、`satisfies`）或关键字（`interface`、`readonly`），对完表继续读源码。

## 基础语法：一一对应

| 干什么 | Python | TS/JS |
|---|---|---|
| 打印 | `print(x)` | `console.log(x)` |
| 变量 | `x = 1` | `let x = 1`（会变）/ `const x = 1`（不会变，**默认选这个**） |
| 字符串插值 | `f"hello {name}"` | `` `hello ${name}` `` （反引号，模板字符串） |
| 多行字符串 | `"""..."""` | `` `...` `` （反引号天然支持换行） |
| 空值 | `None` | `null`（显式"没有"）或 `undefined`（未赋值/无此属性），仓库里两个都会遇到 |
| 布尔 | `True` / `False` | `true` / `false`（小写） |
| 注释 | `# ...` | `// ...` 单行，`/* ... */` 多行，`/** ... */` 是 JSDoc（见下文） |
| 相等比较 | `==` | **永远用 `===`**，`==` 会做隐式类型转换，是坑；仓库 lint 会拦 |
| 三元表达式 | `a if cond else b` | `cond ? a : b` |
| 空值兜底 | `x or default` | `x ?? default`（`??` 只在 `null`/`undefined` 时兜底，不像 `or` 连 `0`/`""` 都兜） |
| 链式取值防报错 | `x.get("a", {}).get("b")` 或 `getattr` 链 | `x?.a?.b`（可选链，中间任意一环是 `null`/`undefined` 就整体短路成 `undefined`） |
| 逻辑与/或 | `and` / `or` | `&&` / `\|\|` |
| f-string 格式化数字 | `f"{x:.2f}"` | `x.toFixed(2)` |

```ts
// 条件
if (cond) {
  doA()
} else if (other) {
  doB()
} else {
  doC()
}

// 循环：for...of 遍历值（≈ Python 的 for x in list），for...in 遍历 key（少用，行为坑多）
for (const item of items) { ... }

// while 一样
while (cond) { ... }
```

## 函数

=== "Python"
    ```python
    def add(a: int, b: int = 0) -> int:
        return a + b

    add_lambda = lambda a, b: a + b
    ```

=== "TS"
    ```ts
    function add(a: number, b: number = 0): number {
      return a + b
    }

    // 箭头函数 —— 仓库里出现频率远高于 function 声明，尤其是回调
    const add = (a: number, b: number): number => a + b

    // 单表达式可以省 {} 和 return
    const double = (x: number) => x * 2
    ```

**箭头函数最重要的区别不是写法短，是 `this` 绑定**——箭头函数不创建自己的 `this`，继承外层的。这仓库大量用箭头函数正是为了避免 `this` 指向漂移（回调、事件处理器里传方法引用时尤其容易踩）。读到 `.bind(this)` 或箭头函数包一层，多半是在处理这个问题。

## 类型系统：Python type hints → TypeScript

Python 的类型注解是**建议**，运行时不强制（除非上 `pydantic`/`mypy --strict` 卡 CI）。TypeScript 的类型是**编译期强制**——类型不对，`tsc` 直接不给过，这也是本仓库 `strict: true` + `noImplicitAny` 的含义：每个变量都必须能推导出或标注出类型。

| Python | TypeScript | 备注 |
|---|---|---|
| `x: int` | `x: number` | TS 没有 int/float 区分，统一 `number` |
| `x: str` | `x: string` | |
| `x: bool` | `x: boolean` | |
| `x: list[int]` | `x: number[]` 或 `x: Array<number>` | |
| `x: dict[str, int]` | `x: Record<string, number>` 或 `Map<string, number>` | `Record` 是普通对象；`Map` 是真的哈希表，有 `.get/.set/.has` |
| `x: tuple[int, str]` | `x: [number, string]` | 元组类型，长度和每个位置类型都固定 |
| `x: Optional[int]` / `int \| None` | `x: number \| null` 或 `x?: number` | `?` 用在参数/属性上表示"可以不传"，语义更接近 `Optional` |
| `x: int \| str` | `x: number \| string` | 联合类型，写法几乎一样 |
| `Any` | `any` | **少用**，本仓库要求每个 `any` 写注释解释为什么没法收窄类型 |
| 不知道类型但想强制标注 | — | `unknown`：比 `any` 安全，用前必须先做类型收窄（`typeof`/`instanceof` 判断），本仓库遇到外部输入优先用它 |
| `class Foo(Protocol): ...` | `interface Foo { ... }` | 结构化类型，鸭子类型，不需要显式实现声明 |
| `TypeVar` / 泛型函数 | `function f<T>(x: T): T` | 尖括号里的就是类型参数 |
| `NewType("UserId", str)` | `type UserId = Branded<'UserId'>`（见下文） | Python 的 NewType 只在类型检查时区分；TS 也是，本仓库统一走一个叫 `Branded` 的工具类型 |
| `Literal["a", "b"]` | `'a' \| 'b'` | 字符串字面量联合类型，等价于枚举但更轻量 |
| `dataclass(frozen=True)` | `readonly` 字段 + `interface` | 见下文 readonly |
| `assert_never(x)`（穷尽性检查） | `assertNever(x)` | 见下文"判别式联合" |

```ts
// interface：描述一个对象"长什么样"，本仓库里最常见的类型声明形式
interface UserMessage {
  readonly id: string
  readonly content: string
  timestamp?: number   // 加 ? 表示这个字段可选
}

// type：类型别名，能表达 interface 表达不了的（联合类型、映射类型等）
type Status = 'pending' | 'running' | 'done' | 'failed'

// 泛型：函数/类型带类型参数，读到尖括号 <T> 就是这个
function first<T>(items: T[]): T | undefined {
  return items[0]
}
```

!!! note "interface vs type，选哪个"
    描述对象结构、可能被别处 `extends`/合并，用 `interface`；要表达联合类型、元组、映射类型，或者不是对象，用 `type`。本仓库两个都大量用，看具体语义而非死规则。

### 判别式联合（discriminated union）+ `assertNever`

Python 里对应的写法通常是 `match` 语句配 `Enum`，或者干脆没有编译期穷尽性检查。TS 这个模式在仓库里**极其高频**，值得单独记住：

```ts
type WebFetchBody =
  | { readonly kind: 'html'; readonly content: string }
  | { readonly kind: 'text'; readonly content: string }

function render(body: WebFetchBody) {
  switch (body.kind) {
    case 'html':
      return renderHtml(body.content)
    case 'text':
      return renderText(body.content)
    default:
      return assertNever(body)   // 编译期保证：漏了一个 kind 分支，这里就编译不过
  }
}
```

`kind` 是"判别字段"（discriminant tag），`switch` 每加一个新 `kind` 就必须补一个 `case`，不然 `default` 分支的 `assertNever(body)` 类型对不上，`tsc` 直接报错。这是 TS 没有 Python `Enum` + `match` 强制穷尽检查时，用类型系统硬做出来的等价物——仓库 [CLAUDE.md 第 106 行](https://github.com/deepseek-ai/deepseek-harness/blob/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e/CLAUDE.md#L106) 那条 **Switch on discriminant tags** 说的就是这个：「Closed unions end in `assertNever`」。

## 集合操作：推导式 → 数组方法

Python 的列表推导式/生成器表达式，在 TS 里对应链式数组方法，没有推导式语法：

| Python | TS |
|---|---|
| `[f(x) for x in xs]` | `xs.map(x => f(x))` |
| `[x for x in xs if cond(x)]` | `xs.filter(x => cond(x))` |
| `any(cond(x) for x in xs)` | `xs.some(x => cond(x))` |
| `all(cond(x) for x in xs)` | `xs.every(x => cond(x))` |
| `functools.reduce(f, xs, init)` | `xs.reduce((acc, x) => f(acc, x), init)` |
| `sum(xs)` | `xs.reduce((a, b) => a + b, 0)`（没有内建 `sum`） |
| `sorted(xs, key=...)` | `xs.toSorted((a, b) => ...)`（或旧写法 `[...xs].sort(...)`，`.sort()` 原地修改要小心） |
| `x in xs` | `xs.includes(x)`（数组）/ `x in obj`（对象 key）/ `set.has(x)`（Set） |
| `len(xs)` | `xs.length`（注意是属性不是方法，没有括号） |
| `dict.items()` | `Object.entries(obj)` |
| `dict.keys()` | `Object.keys(obj)` |
| `dict.values()` | `Object.values(obj)` |
| `{k: v for k, v in items}` | `Object.fromEntries(items)` |
| `set()` | `new Set()` |
| 有序去重 dict（3.7+ 内建） | `Map`（保证插入顺序，`Object` 的顺序保证有历史包袱，跨边界数据优先用 `Map`） |

```ts
const active = users
  .filter(u => u.status === 'running')
  .map(u => u.name)
  .join(', ')   // 相当于 Python 的 ", ".join(...)，但 join 是数组的方法，不是字符串的方法——顺序反过来了
```

## 解构与展开：对应 Python 的解包

```python
a, b = 1, 2
a, *rest = [1, 2, 3]
d = {"x": 1, "y": 2}
x, y = d["x"], d["y"]
merged = {**d1, **d2}
```

```ts
const [a, b] = [1, 2]
const [a, ...rest] = [1, 2, 3]

const d = { x: 1, y: 2 }
const { x, y } = d               // 按 key 名解构，不是按位置
const { x: renamed } = d         // 解构时重命名
const { x, ...restObj } = d      // 剩余属性，对应 Python dict 的 **rest 没有直接等价，这是 TS 侧的写法

const merged = { ...d1, ...d2 }  // 展开合并，跟 Python 的 **d1, **d2 几乎一样
const combined = [...arr1, ...arr2]  // 数组展开，对应 Python 的 [*a, *b]
```

函数参数上的解构在仓库里非常常见，本质是"关键字参数"的平替：

```ts
function connect({ host, port, timeout = 3000 }: { host: string; port: number; timeout?: number }) {
  ...
}
// 调用方看起来就像 Python 的关键字参数
connect({ host: 'localhost', port: 8080 })
```

## 模块系统：import/export

Python 的 `import` 找的是包名/模块路径，是否加后缀无所谓。TS/ESM 不一样：

```python
# Python
from mypkg.utils import helper
import mypkg.utils as utils
```

```ts
// TS —— 具名导入
import { helper } from '@deepseek-ai/dsh-utils'
// 默认导出（本仓库很少用，几乎全是具名导出，别指望到处找 export default）
import helper from './helper.ts'
// 只导类型，编译后会被完全擦除，运行时不存在
import type { Session } from '@deepseek-ai/dsh-session'

export function helper() { ... }
export const CONST = 1
export type { Session }
```

!!! warning "本仓库的特殊约定：相对导入要写 `.ts` 后缀"
    正常 TS 项目相对导入通常不写扩展名（`import { x } from './foo'`），但这个仓库的源码直接跑（`tsx`）用的是原生 ESM 解析规则，要求写扩展名：`import { x } from './foo.ts'`。包之间的导入走包名（`@deepseek-ai/dsh-xxx`），不写路径。见 [CLAUDE.md 第 102 行](https://github.com/deepseek-ai/deepseek-harness/blob/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e/CLAUDE.md#L102)：「Use package names across packages and `.ts` in local relative imports」。

Python 的 `if __name__ == "__main__"` 在 ESM 里没有直接对应写法，判断"是不是被直接运行"要用 `import.meta.url` 比对，仓库里入口文件（`packages/*/bin/*.ts` 之类）会看到这种写法。

## 类与面向对象

```python
class Agent:
    def __init__(self, name: str, session: Session):
        self.name = name
        self._session = session  # 约定俗成的"私有"，其实访问不受限

    @property
    def session_id(self) -> str:
        return self._session.id

    def run(self) -> None:
        ...
```

```ts
class Agent {
  readonly name: string
  private readonly session: Session   // private 是编译期检查，真私有用 #

  constructor(name: string, session: Session) {
    this.name = name
    this.session = session
  }

  get sessionId(): string {           // getter，调用方写 agent.sessionId，不加括号
    return this.session.id
  }

  run(): void {
    ...
  }
}
```

**构造函数参数属性**是仓库里最常见的简写，等价于"参数赋值给同名字段"这一步自动做掉：

```ts
class Inbox {
  constructor(
    private readonly session: Session,
    private readonly notifications: InboxNotifications,
  ) {}   // 空函数体——两个参数已经自动变成 this.session / this.notifications
}
```

真正的私有字段（外部完全访问不到，不只是编译期约束）用 `#` 前缀：`#state = {}`，对应 Python 里"没有语言层面强制，全靠下划线加自觉"的私有——TS 的 `#` 是运行时真隔离。

## 异步编程：async/await 几乎是抄的，但底层模型不同

写法上 Python 的 `asyncio` 和 TS 的 `Promise` 几乎一比一对应：

| Python (`asyncio`) | TS |
|---|---|
| `async def f(): ...` | `async function f() { ... }` / `const f = async () => { ... }` |
| `await coro()` | `await promise()` |
| `asyncio.gather(a(), b())` | `Promise.all([a(), b()])` |
| `asyncio.gather(..., return_exceptions=True)` | `Promise.allSettled([...])` |
| `asyncio.wait_for(coro(), timeout)` | 没有内建，通常手写 `Promise.race([p, timeoutPromise])` |
| `asyncio.Future` | `Promise` |
| `try/except` 包 `await` | `try/catch` 包 `await`，写法一样 |
| `asyncio.Lock()` | 没有直接等价——JS 单线程事件循环下，大部分"锁"场景换成排队/串行 await 就够了 |

关键心智差异：Python 的 `asyncio` 需要显式跑在事件循环里（`asyncio.run(...)`），普通函数和协程是两个世界，混用会报错。**JS 天生只有一个事件循环**，任何地方都能 `await`（顶层 `await` 在 ESM 模块里也合法），`async function` 调用永远返回一个 `Promise`，不需要额外的 loop.run 包一层。

```ts
async function loadSession(id: string): Promise<Session> {
  const raw = await fetchRaw(id)
  return parseSession(raw)
}

// 不 await，拿到的是 Promise 对象本身，不是结果——这是新手最容易踩的坑
const p = loadSession(id)        // p 是 Promise<Session>，不是 Session
const session = await loadSession(id)  // 这样才是 Session
```

## TS 特有符号速查表

这些在 Python 里没有直接对应，是读源码时最容易卡住的地方：

| 符号 | 叫什么 | 干什么 |
|---|---|---|
| `?.` | 可选链 | `a?.b?.c`，链上任意一环是 `null`/`undefined` 就整体短路返回 `undefined`，不报错 |
| `??` | 空值合并 | `a ?? b`，`a` 是 `null`/`undefined` 才取 `b`（区别于 `\|\|`，见前面的表） |
| `??=` | 空值合并赋值 | `a ??= b` 等价于 `a = a ?? b` |
| `!` （表达式后） | 非空断言 | `x!.foo`，跟编译器说"我保证这里不是 null/undefined，别报错"，是个断言不是运行时检查，用错会真崩 |
| `as` | 类型断言 | `x as Foo`，跟编译器说"按 Foo 的类型处理它"，同样不做运行时检查，对应 Python 里"不检查直接假设类型对"的裸信任，本仓库规则里明确只在真正跨边界（解析结果、外部输入）才允许，同进程内的值应该让 TS 自己推导 |
| `satisfies` | 类型校验不改变推导 | `const x = {...} satisfies Foo`，校验 `x` 符合 `Foo` 但保留原始更精确的类型（比 `: Foo` 标注更松） |
| `readonly` | 只读修饰 | 字段/数组前加，赋值后不能改，编译期检查，对应 Python `dataclass(frozen=True)`/`Final` 的意图但更细粒度 |
| `keyof` | 取键名联合类型 | `keyof Foo` 得到 `Foo` 所有字段名组成的字符串字面量联合类型 |
| `typeof x`（类型位置） | 取值的类型 | 在类型标注处写 `typeof someValue`，拿到那个值的类型，而不是运行时判断类型（运行时判断用的也是 `typeof`，看上下文区分） |
| `in` （类型位置） | 类型收窄 | `if ('kind' in obj)`，配合联合类型做运行时窄化 |
| `is`（返回值位置） | 类型谓词 | `function isFoo(x: unknown): x is Foo { ... }`，自定义类型收窄函数，调用后 TS 会在分支里把类型收窄成 `Foo` |
| `&` （类型位置） | 交叉类型 | `A & B`，同时满足 A 和 B 的形状，不是布尔运算 |
| `\|` （类型位置） | 联合类型 | `A \| B`，是 A 或是 B，跟前面表里的 `Optional`/`Literal` 是同一个语法 |
| `<T>` | 泛型参数 | 出现在函数名/类名/类型名后面，是类型层面的参数，跟 Python 的 `TypeVar` 对应 |

## 这个仓库里的几个高频"自造"写法

这些不是标准 JS/TS，是这个仓库（基于 Cordis 插件框架）的约定写法，第一次见会卡住：

**`ctx.effect(...)` / `ctx.on(...)`**：注册一个副作用/监听器，返回值是"撤销这次注册"的函数（disposer）。约等于 Python 里"注册回调并拿到一个 `unregister()` 闭包"，但仓库强制所有副作用都走这条路径，方便统一生命周期管理：

```ts
ctx.effect(() => {
  const timer = setInterval(tick, 1000)
  return () => clearInterval(timer)   // 这个返回的函数就是清理逻辑，插件卸载时自动调用
}, 'myPlugin.tick()')
```

**waterfall 监听器必须调用 `next()`**：一种责任链模式，每个监听器拿到 `next` 函数，不调用就等于"截断"整条链，后面的监听器全部不执行。忘记调用 `next()` 是这类代码最常见的 bug：

```ts
ctx.on('some/waterfall/event', (payload, next) => {
  const transformed = doSomething(payload)
  return next(transformed)   // 忘了这行，链条到这里就断了
})
```

**`Branded<B>` / 品牌类型**：给结构上就是 `string` 的 id 打一个编译期专属标签，防止 `SessionId` 和 `CallId` 互相传错，对应 Python 的 `typing.NewType`，但运行时也是零开销：

```ts
declare const BRAND: unique symbol
type Branded<B extends string> = string & { readonly [BRAND]: B }
type SessionId = Branded<'SessionId'>
// 构造只能在拥有该 id 的包内部做一次强制转换，其他地方拿到的 SessionId
// 不能直接塞一个普通 string 进去，tsc 会拦
```

**`/** ... *​/` JSDoc 注释**：不是普通注释，是文档+类型信息的结合体，编辑器悬浮提示看到的说明基本都来自这里。仓库要求每个导出都有 JSDoc，函数类导出还要有 `@param`/`@returns`，读源码时优先看这段，往往比读实现更快理解意图：

```ts
/**
 * 增量投影 durable inbox 事件。
 * @param session - 提供事件流的会话。
 * @returns 尚未被消费的用户消息。
 */
```

## 读源码建议顺序

1. 先看 `package.json` 的 `scripts`，知道怎么跑测试/类型检查，别一上来就啃实现。
2. 一个包先看它的 `src/index.ts`（对应 Python 的 `__init__.py`，是这个包对外暴露的全部东西），再顺着导出的类型/函数往下挖。
3. 类型定义（`interface`/`type`）比实现函数信息密度更高——TS 里类型基本等价于"这个东西的契约"，Python 项目里同等信息往往要读 docstring + 猜。
4. 卡在符号看不懂就回这张表查，卡在"这个模式为什么这么设计"就去翻 `docs/architecture.md` 和 `docs/glossary.md`。
