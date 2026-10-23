---
description: "酒馆怎么对付聊久了：历史按预算从最旧的开始掉，界面上标出截断线；摘要扩展每 10 条带着完整上下文写一次增量摘要，作为一段注入紧跟主提示，并挂在消息上随删改回退；摘要不删原文，要配合 /hide；向量召回把相关的旧原文挪回本轮 prompt。实跑出厂设置下摘要被回复长度截断"
---

# 聊久了

网页版 ChatGPT 全量回放历史，超出窗口就从最早的开始丢，开头说好的事，聊到后面模型就不知道了。酒馆的主线是[预算](assembly.md#budget)：固定部分必放，历史从新往旧填，放不下的旧消息不发，界面上标出截断线。在这之上，长期记忆交给扩展，都通过同一张注入表把一段文字插进 prompt：摘要扩展写摘要，向量扩展按语义把旧原文召回来。下面的摘要用的是扮演主线前五轮的真实聊天。

## 摘要：每 10 条写一次，紧跟主提示 { #summary }

**问题**：聊到第 200 条，开头那句「三天后在码头见」早被挤出窗口。

**功能**：摘要扩展的出厂设置——提示词、模板、放的位置、隔几条摘一次：

```js title="模版 · public/scripts/extensions/memory/index.js:105-125"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/extensions/memory/index.js:105:125"
```

每条 AI 回复渲染完检查一次：从最新往回数，数到上一次摘要挂的那条为止，满 10 条才摘：

```js title="模版 · public/scripts/extensions/memory/index.js:596-618"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/extensions/memory/index.js:596:618"
```

出厂的「Classic, blocking」写法不另拼 prompt，就是带着完整上下文做一次后台生成，摘要指令放在最后：

```js title="模版 · public/scripts/extensions/memory/index.js:692-700"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/extensions/memory/index.js:692:700"
```

摘好的文字按模板包成 `[Summary: …]` 登记进注入表，同时挂在倒数第二条消息的 `extra.memory` 上：

```js title="模版 · public/scripts/extensions/memory/index.js:964-985"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/extensions/memory/index.js:964:985"
```

位置是「主提示后」，拼装时插在 `main` 槽后面：

```js title="模版 · public/scripts/openai.js:1265-1268"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:1265:1268"
```

**效果**：主线第五轮之后聊天正好 11 条，满足条件。出厂的摘要来源是早已废弃的 Extras，没装就什么也不做，先在扩展里切到主模型。发出去的请求最后两条：

```text title="效果 · 摘要请求的结尾"
--8<-- "projects/sillytavern/assets/sim/txt/mem-request-tail.txt"
```

摘要的回复长度出厂跟主回复一样是 300，思考开着，DeepSeek 的回复上限把思考也算在内：

```text title="效果 · 出厂设置下的摘要"
--8<-- "projects/sillytavern/assets/sim/txt/mem-summary-factory.txt"
```

写到一半就断了。摘要扩展有一个「覆盖回复长度」的设置，生成时临时改掉主回复长度、生成完还原（`public/script.js:4166-4200`）。调到 1024 再摘一次：

```text title="效果 · 覆盖回复长度 1024"
--8<-- "projects/sillytavern/assets/sim/txt/mem-summary.txt"
```

这次写完了，但用的是英文：摘要指令本身是英文，模型跟着用了英文写；出厂那次用的是中文。提示词在扩展设置里可以改。存进去之后，下一轮拼成：

```text title="效果 · 摘要之后的下一轮（dry run）"
--8<-- "projects/sillytavern/assets/sim/txt/mem-r6.txt"
```

摘要占了 `main` 后面的一格。这一轮最近两条没提到任何关键词，世界书是空的。

## 摘要挂在消息上，删改自动回退 { #on-message }

**问题**：摘要存成一份全局状态，删掉几条消息、重新生成最后一条以后，摘要里还写着已经不存在的情节。

**功能**：摘要挂在它摘到的那条消息上。删了消息，就回退到前面还在的最新一份摘要；最后一条被编辑或重新生成，挂在上面的摘要作废；分支复制前缀时，摘要跟着消息一起复制：

```js title="模版 · public/scripts/extensions/memory/index.js:450-463"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/extensions/memory/index.js:450:463"
```

这一节只贴模版：扩展的事件监听要整个前端，实跑里摘要是手动触发的。

## 摘要不删原文：配合 /hide { #hide }

**问题**：摘要覆盖了前 50 条，可这 50 条原文还在上下文里，token 没省下来。

**功能**：摘要只是多插一段，原文照常按预算从最旧的开始掉。想真正省 token，用 `/hide` 把摘要过的原文从 prompt 里拿掉，界面上还看得见（见[隐藏](branch.md#hide)）。

**效果**：摘要之后再 `/hide 0-4`：

```text title="效果 · 隐藏前五条"
--8<-- "projects/sillytavern/assets/sim/txt/br-hide.txt"
```

## 向量召回：把相关的旧原文挪回来 { #vectors }

**问题**：摘要必然丢细节。第 300 条问「还记得那把银匕首吗」，第 37 条的原话早不在窗口里了。

**功能**：向量扩展把每条消息存进本地向量库；每次生成前，作为生成拦截器拿最近 2 条当查询，取最相关的 3 条旧消息，从本次发出的副本里挪走，按 `Past events:` 模板插回 prompt，真实的聊天记录不动：

```js title="模版 · public/scripts/extensions/vectors/index.js:836-854"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/extensions/vectors/index.js:836:854"
```

Data Bank 是同一套机制管外部文件：把资料切块入库，按最近的消息检索，插进 prompt。这一节没跑：要另起一个 embedding 服务。召回结果每轮不同，会让 prompt 前缀变化，文档自己提醒它和前缀缓存互相冲突。

## 谁管什么 { #split }

- **程序**：历史按预算截断、标出截断线、什么时候触发摘要、摘要挂在哪条消息上、删改时回退、召回的消息挪到哪
- **用户**：开不开摘要和向量、摘要用哪个模型、隔几条摘、回复给多长、提示词怎么写、哪些原文藏起来
- **模型**：摘要也是模型写的：读完整个上下文，按指令写一段摘要，写什么、用什么语言由它决定

## 实跑原件 { #sim-files }

??? abstract "两次摘要的请求和回包"

    ```json
    --8<-- "projects/sillytavern/assets/sim/out/summary-record.json"
    ```
