# RAG 向量检索

提供两套方案进行选择，需要主动询问用户使用哪一种，一种是使用sqlite，一种是使用pgvector，默认选择sqlite


## 方案一：SQLite + sqlite-vec（推荐轻量部署）

### 依赖

```bash
uv add sqlmodel sqlite-vec-sqlalchemy
```

### 数据库引擎设置

FAQ 向量库使用**同步引擎**（sqlite-vec 不支持异步），与主业务的异步引擎分开：

```python
from sqlmodel import create_engine, Session
from sqlite_vec_sqlalchemy import enable_sqlite_vec

# FAQ 向量库 - 同步引擎
engine_faq = create_engine("sqlite:///volume/dbs/faq.db")
enable_sqlite_vec(engine_faq)  # 必须调用，加载 sqlite-vec 扩展

# 依赖注入
def get_session_faq() -> Session:
    with Session(engine_faq) as session:
        yield session
```

### 模型定义

采用继承方式，分离 Base / DB Table / 查询结果：

```python
from sqlmodel import SQLModel, Field, Column, JSON
from sqlite_vec_sqlalchemy import Vector

length = 3072  # embedding 维度，根据模型调整

# 1. Base：共享业务字段
class BaseFAQ(SQLModel):
    id: int = Field(primary_key=True)
    question: str
    answer: str
    image_urls: list[str] = Field(default=[], sa_column=Column(JSON))

# 2. DB Table：带向量列，用于建表和写入
class FAQ_CREATE(BaseFAQ, table=True):
    __tablename__ = 'faq'
    embedding1: list[float] = Field(sa_column=Column(Vector(length)))  # 问题向量
    embedding2: list[float] = Field(sa_column=Column(Vector(length)))  # 答案向量

# 3. 查询结果：带距离字段，不建表
class FAQ_RES(BaseFAQ):
    distance: float | None = None
    @classmethod
    def model_validate2(cls, data: tuple):
        faq, distance = data
        a = cls.model_validate(faq)
        a.distance = distance
        return a

# 4. 未命中记录表（可选）
class FAQ_NO_ANSWER(SQLModel, table=True):
    __tablename__ = 'faq_no_answer'
    id: int = Field(primary_key=True)
    question: str
    created_at: datetime = Field(default_factory=datetime.now)
    created_date: date = Field(default_factory=lambda: datetime.now().date(), index=True)
```

### 建表

```python
from sqlmodel import SQLModel
SQLModel.metadata.create_all(engine_faq, tables=[FAQ_CREATE.__table__, FAQ_NO_ANSWER.__table__])
```

注意：如果同时存在异步引擎的 `create_all`，需要用 `tables=` 参数指定具体的表，避免在错误的数据库中建表。

### 向量检索

使用 `vec_distance_cosine` 计算距离（值越小越相似）：

```python
from sqlite_vec_sqlalchemy import vec_distance_cosine
from sqlmodel import select, Session

def search_faq(question_embedding: list[float], top_k: int = 8) -> list[FAQ_RES]:
    with Session(engine_faq, expire_on_commit=False) as session:
        # 搜问题向量
        dist1 = vec_distance_cosine(FAQ_CREATE.embedding1, question_embedding).label("distance")
        stmt1 = select(FAQ_CREATE, dist1).order_by(dist1).limit(top_k)
        res1 = session.exec(stmt1).all()
        
        # 搜答案向量
        dist2 = vec_distance_cosine(FAQ_CREATE.embedding2, question_embedding).label("distance")
        stmt2 = select(FAQ_CREATE, dist2).order_by(dist2).limit(top_k)
        res2 = session.exec(stmt2).all()

    # 合并去重
    seen = set()
    results = []
    for item in [FAQ_RES.model_validate2(i) for i in res1 + res2]:
        if item.id not in seen:
            seen.add(item.id)
            results.append(item)
    return results
```

### FAQ 写入（单条）

embedding 生成 + 写入数据库：

```python
from langchain_openai import OpenAIEmbeddings

model_embedding = OpenAIEmbeddings(model='text-embedding-3-large')

async def create_faq(q: str, a: str, image_urls: list[str] = []) -> FAQ_CREATE:
    faq = FAQ_CREATE(question=q, answer=a, image_urls=image_urls)
    embeddings = await model_embedding.aembed_documents([faq.question, faq.answer])
    faq.embedding1 = embeddings[0]
    faq.embedding2 = embeddings[1]
    return faq
```

### FAQ 批量同步（从外部数据源）

增量同步模式：对比新旧数据，只增删改变化部分，避免全量重建。

核心思路：以 `(question, answer)` 作为唯一键，比较新旧数据集，分为三种变化：
- **删除**：旧有新无 → 从数据库删除
- **新增**：新有旧无 → 生成 embedding 后写入
- **更新**：键相同但附属字段（如 image_urls）变化 → 只更新字段，无需重新生成 embedding

```python
from langchain_core.runnables import RunnableLambda
from tqdm import tqdm

# 用 RunnableLambda 包装，便于 abatch 并行调用
@RunnableLambda
async def add_faq(foo):
    faq = FAQ_CREATE(question=foo['q'], answer=foo['a'], image_urls=foo.get('image_urls', []))
    embeddings = await model_embedding.aembed_documents([faq.question, faq.answer])
    faq.embedding1 = embeddings[0]
    faq.embedding2 = embeddings[1]
    return faq


async def sync_faq(session: Session, new_data: list[dict]):
    """
    new_data: [{'q': str, 'a': str, 'image_urls': list[str]}, ...]
    """
    import pandas as pd
    
    # 1. 读取现有数据
    df_old = pd.read_sql('faq', engine_faq)
    
    # 2. 构建新旧映射 (q, a) -> image_urls
    now_values = {(d['q'], d['a']): d.get('image_urls', []) for d in new_data}
    old_values = {(row['question'], row['answer']): row.get('image_urls', []) 
                  for _, row in df_old.iterrows()}
    
    # 3. 删除：旧有新无
    delete_ids = [
        row['id'] for _, row in df_old.iterrows() 
        if (row['question'], row['answer']) not in now_values
    ]
    if delete_ids:
        logger.debug(f'删除 {len(delete_ids)} 条FAQ')
        result = session.exec(select(FAQ_CREATE).where(FAQ_CREATE.id.in_(delete_ids)))
        for faq in result.all():
            session.delete(faq)
        session.commit()
    
    # 4. 新增：新有旧无
    add_list = [d for d in new_data if (d['q'], d['a']) not in old_values]
    
    # 5. 批量写入（每10条一批，abatch 并行生成 embedding）
    logger.debug(f'添加 {len(add_list)} 条FAQ')
    for i in tqdm(range(0, len(add_list), 10)):
        batch = add_list[i:i+10]
        faqs = await add_faq.abatch(batch)
        session.add_all(faqs)
        session.commit()
    
    # 6. 更新：键相同但附属字段变化（无需重新 embedding）
    update_list = [
        {'q': q, 'a': a, 'image_urls': urls}
        for (q, a), urls in now_values.items()
        if (q, a) in old_values and sorted(urls) != sorted(old_values[(q, a)])
    ]
    if update_list:
        logger.debug(f'更新 {len(update_list)} 条FAQ的附属字段')
        from sqlmodel import and_
        for item in tqdm(update_list):
            result = session.exec(
                select(FAQ_CREATE).where(
                    and_(FAQ_CREATE.question == item['q'], FAQ_CREATE.answer == item['a'])
                )
            )
            faq = result.first()
            if faq:
                faq.image_urls = item['image_urls']
                session.add(faq)
        session.commit()
```

将同步逻辑挂载为 FastAPI 端点：

```python
@router.put("/sync_faq")
async def sync_faq_endpoint(session: Annotated[Session, Depends(get_session_faq)]):
    try:
        new_data = load_from_external_source()  # 从外部数据源读取
        await sync_faq(session, new_data)
        return {'status': 'ok'}
    except Exception as e:
        logger.exception(e)
        # 可选：发送异常通知（钉钉/飞书/Slack 等）
        raise
```

### FAQ 匹配：双路粗召 + LLM 精排

完整的 FAQ 匹配流程分三步：
1. **双路粗召**：分别用 embedding1（问题向量）和 embedding2（答案向量）各召回 top_k 条，合并去重
2. **LLM 精排**：将粗召结果 + 对话历史交给大模型，用 JSON mode 输出最相关的 FAQ 编号
3. **结果输出**：根据编号过滤出最终 FAQ，未命中则记录到 `faq_no_answer` 表

#### Rerank Prompt（单条/多条两种模式）

```python
from jinja2 import Template

# 单条模式：只返回最贴近的一条
rerank_system_single = r"""
你是一个专业助手，正在筛选能解答用户问题的FAQ。

请使用json输出FAQ的id，不要输出其他信息，格式为{"faq_id": int}，
如果有多条能解答用户提问的FAQ也只输出最贴近的一条的id，
如果没有能回答提问的FAQ，请输出{"faq_id": -1}。

筛选必须严格，禁止答非所问，禁止货不对板（例如用户问a产品，但是回答的是b产品）
"""

# 多条模式：返回所有能回答的
rerank_system_multi = r"""
你是一个专业助手，正在筛选能解答用户问题的FAQ。

请使用json输出FAQ的id，不要输出其他信息，格式为{"faq_id": list[int]}，
如果有多条能解答用户提问的FAQ就要全部输出，
如果没有能回答提问的FAQ，请输出{"faq_id": []}。

筛选必须严格，禁止答非所问，禁止货不对板（例如用户问a产品，但是回答的是b产品）
"""

# 粗召结果模板
rerank_human_template = Template(r"""
粗召到的FAQ有:
{% for faq in faqs %}
faq_id: {{ faq.id }}:
问题: `{{ faq.question }}`
回答: `{{ faq.answer }}`
---
{% endfor %}
""")
```

#### 完整匹配函数

```python
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, BaseMessage

async def query_faq(question: str, history: list[BaseMessage], model, count: int = 1) -> list[FAQ_RES]:
    """
    FAQ 匹配主函数
    
    Args:
        question: 用户问题
        history: 对话历史（用于给 LLM 更多上下文）
        model: 用于精排的 LLM
        count: 最多返回几条（1=单条模式，>1=多条模式）
    
    Returns:
        匹配到的 FAQ 列表，空列表表示未命中
    """
    # ── 1. 双路粗召 ──
    emb = model_embedding.embed_query(question)
    candidates = search_faq(emb, top_k=8)  # 复用前面定义的 search_faq
    
    logger.debug(f'粗召到 {len(candidates)} 条FAQ')
    
    # ── 2. LLM 精排 ──
    rendered = rerank_human_template.render(faqs=[i.model_dump() for i in candidates])
    
    # 过滤对话历史：只保留 Human/AI 文本消息，排除 tool_calls
    filtered_history = [
        m for m in history 
        if isinstance(m, (HumanMessage, AIMessage))
        and not (isinstance(m, AIMessage) and m.tool_calls)
    ]
    
    system_prompt = rerank_system_single if count == 1 else rerank_system_multi
    messages = [
        SystemMessage(content=system_prompt),
        *filtered_history,
        HumanMessage(content=rendered),
    ]
    
    result = await model.with_structured_output(method='json_mode').ainvoke(messages)
    faq_id = result['faq_id']
    
    # 统一为列表
    faq_id_list = [faq_id] if isinstance(faq_id, int) else faq_id
    
    # ── 3. 过滤输出 ──
    matched = [f for f in candidates if f.id in faq_id_list][:count]
    
    if not matched:
        # 记录未命中，便于后续分析 FAQ 覆盖率
        with Session(engine_faq, expire_on_commit=False) as session:
            session.add(FAQ_NO_ANSWER(question=question))
            session.commit()
    
    return matched
```

#### 从对话历史中提取问题（可选）

当用户消息不是直接的问题（如 "帮我看看这个"），可以先用小模型从对话历史中提取出真正的问题：

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from operator import itemgetter

prompt_extract_question = ChatPromptTemplate.from_messages([
    ("system", "用一句话总结用户现在的问题。不要思考太多, 思考控制在50字以内。请使用json输出，格式为{\"question\": str}"),
    MessagesPlaceholder(variable_name='history'),
    ("human", "请提取出用户的问题，输出json"),
], template_format='jinja2')

chain_extract_question = (
    prompt_extract_question 
    | model_small.with_structured_output(method='json_mode')
    | itemgetter('question')
)

# 使用：question = await chain_extract_question.ainvoke({'history': messages})
```

## 方案二：PostgreSQL + pgvector

### 依赖

```bash
uv add sqlmodel asyncpg pgvector sqlalchemy-pgvector
```

### 要点

- 使用异步引擎 `postgresql+asyncpg://`
- Vector 类型来自 `pgvector.sqlalchemy`
- 支持 IVFFlat / HNSW 索引，适合大规模数据
- 其余模型定义和查询逻辑与 sqlite-vec 类似，主要区别是距离函数用法

如果用户选择 pgvector，需根据具体场景调整索引策略和连接池配置。
