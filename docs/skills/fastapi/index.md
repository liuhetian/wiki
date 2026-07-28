# FastAPI 后端开发

用 Python 的最新版本和 FastAPI 的最新语法，使用依赖注入等技术。


## 核心技术

### 项目布局

根据项目规模选择合适的结构，不要过度工程：
- **单文件** — 脚本、demo、原型验证、5 个接口以内，直接一个 `main.py`
- **轻量多文件** — 小型服务、1-2 个业务领域，按职责拆文件但不按领域分包
- **领域分包** — 多业务领域、团队协作的大项目，按领域分文件夹 + 统一文件结构

默认选单文件或轻量多文件。只有用户明确说「规划项目架构」或项目明显涉及多个独立业务领域时，才查阅 [reference/项目布局.md](reference/项目布局.md) 采用领域分包。


### 项目基础结构

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 使用上下文管理器
    yield


app = FastAPI(lifespan=lifespan)
```


### 返回数据

使用泛型 Response 包装所有 API 返回：

``` python
class Response[T](BaseModel):
    code: int = 0
    message: str = "success"
    data: T | dict = {}
    success: bool = True
```

路由中使用：`response_model=Response[ReplyData]`


### 模型定义

需要使用最优雅的 SQLModel 定义模型。
对于复杂的模型，如果有需要的话，需要询问用户是否需要采取优雅方案，也就是：
需要根据输入、数据库存储、返回数据分别定义 base model, input model, output model, model（存入数据库的版本），并使用继承的方式进行定义。

具体范例：

```python
from sqlmodel import SQLModel, Field
from pydantic import BaseModel
from uuid import uuid4, UUID

# 1. Base：共享字段，不建表
class BaseMessage(SQLModel):
    session_id: str
    message: str
    sender: SenderType

# 2. DB Table：继承 Base，加主键/索引/时间戳
class MessageTable(BaseMessage, table=True):
    message_id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    trace_id: str | None = None

# 3. Input：继承 Base + 混入其他 mixin
class ReceivedMessage(BaseMessage, LangFuseRecord, LanggraphConfig):
    """接收参数，可以多继承混入额外字段"""
    pass

# 4. Output：独立定义，与 DB 结构不同
class ReplyData(BaseModel):
    name: str
    detail: str
    is_final: bool = False
    turn_to_human: bool = False
```

你如果读取了以下的参考文件，必须讲「根据xxx文档，xxxx」，让用户知道你的依据


## 其他注意事项

- 使用 loguru 作为日志库，对于报错需要 `logger.exception(e)` 便于调试，不要记录在文件里，输出到控制台即可
- 不要写 README.md 文件，我会自己写
- 不要安装环境，我自己来安装，因为我会使用 uv 来管理环境

## 按需参考

你需要分析项目需求，选择最合适的项目布局，以及需要参考哪些文档。
根据实际项目需求，查阅对应文档：
下面的文章很长，会占用大量上下文，如果不是明确需求，禁止查阅下面的文档

| 场景 | 参考文档 |
|------|----------|
| 异步数据库 (SQLModel) | [reference/数据库.md](reference/数据库.md) |
| RAG / 向量检索 (sqlite-vec / pgvector) | [reference/rag.md](reference/rag.md) |
| mcp 开发 | [reference/mcp.md](reference/mcp.md) |
| 优雅终止 + 流式中断 + 乐观锁(连发消息) | [reference/优雅终止.md](reference/优雅终止.md) |
| 定时任务 (FastScheduler) | [reference/定时任务.md](reference/定时任务.md) |
| 配置管理 (内存缓存+热更新) | [reference/配置管理.md](reference/配置管理.md) |
| 对话前端 (Chainlit) | [reference/对话前端.md](reference/对话前端.md) |
| 运行时补丁 (dowhen) | [reference/运行时补丁.md](reference/运行时补丁.md) |
| 日志管理 | [reference/日志管理.md](reference/日志管理.md) |
| 测试 | [reference/测试.md](reference/测试.md) |
| 部署 | [reference/部署.md](reference/部署.md) |
| 监控 | [reference/监控.md](reference/监控.md) |
| 项目布局（轻量多文件 / 领域分包） | [reference/项目布局.md](reference/项目布局.md) |
| 事后检查（异步/依赖注入/安全/数据库） | [reference/事后检查.md](reference/事后检查.md) |

## 完整内容（折叠阅读）

默认全部收起，点击展开你当下需要的那一块；想跳到独立子页直接点上面表格里的链接。

??? abstract "项目布局：轻量多文件 / 领域分包"

    --8<-- "skills/fastapi/reference/项目布局.md"

??? abstract "异步数据库（SQLModel）"

    --8<-- "skills/fastapi/reference/数据库.md"

??? abstract "RAG / 向量检索（sqlite-vec / pgvector）"

    --8<-- "skills/fastapi/reference/rag.md"

??? abstract "MCP 开发"

    --8<-- "skills/fastapi/reference/mcp.md"

??? abstract "优雅终止 + 流式中断 + 乐观锁（连发消息）"

    --8<-- "skills/fastapi/reference/优雅终止.md"

??? abstract "定时任务（FastScheduler）"

    --8<-- "skills/fastapi/reference/定时任务.md"

??? abstract "配置管理（内存缓存 + 热更新）"

    --8<-- "skills/fastapi/reference/配置管理.md"

??? abstract "对话前端（Chainlit）"

    --8<-- "skills/fastapi/reference/对话前端.md"

??? abstract "运行时补丁（dowhen）"

    --8<-- "skills/fastapi/reference/运行时补丁.md"

??? abstract "日志管理"

    --8<-- "skills/fastapi/reference/日志管理.md"

??? abstract "测试"

    --8<-- "skills/fastapi/reference/测试.md"

??? abstract "部署"

    --8<-- "skills/fastapi/reference/部署.md"

??? abstract "监控"

    --8<-- "skills/fastapi/reference/监控.md"

??? abstract "事后检查（异步 / 依赖注入 / 安全 / 数据库）"

    --8<-- "skills/fastapi/reference/事后检查.md"

