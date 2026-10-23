---
description: "酒馆怎么让同一份内容喂给几十种模型：前端只产出 OpenAI 格式的消息数组，服务端按供应商改写，未知端点给 merge/semi/strict/single 几档后处理；回复被截断用 continue 接着写，impersonate 替用户起草；预设把参数、条目和顺序打成一个 JSON；Text Completion 由前端按模板拼一整条字符串"
---

# 一份内容喂各种模型

网页版 ChatGPT 只对接一家厂商、一种消息格式。换个模型，规矩全变：system 放哪、能不能连着两条 user、能不能替模型预填回复的开头、回复被截断了怎么办。酒馆的做法是前端只产出一种标准格式，差异都收到服务端去改写；再加几个让用户替模型起笔的功能。下面的消息数组都来自扮演主线的真实请求，转换函数是服务端 `src/prompt-converters.js` 里的原函数。

## 前端只产出标准格式，服务端按供应商改写 { #providers }

**问题**：同一份 prompt，Claude 要求 system 单独放、user 和 assistant 严格交替；Gemini 的 assistant 叫 `model`，system 另放一个字段。前端为每家各拼一份，就有几十份拼法要维护。

**功能**：前端永远拼 OpenAI 格式的消息数组。服务端收到后，先按用户选的后处理档位统一改写一遍，再按供应商分发，各家有自己的转换函数：

```js title="模版 · src/endpoints/backends/chat-completions.js:2246-2266"
--8<-- "projects/sillytavern/assets/st-src/src/endpoints/backends/chat-completions.js:2246:2266"
```

Claude 的转换把开头连续的 system 收进 `system` 字段，后面的 system 一律改成 user：

```js title="模版 · src/prompt-converters.js:199-220"
--8<-- "projects/sillytavern/assets/st-src/src/prompt-converters.js:199:220"
```

**效果**：扮演主线第二轮前端拼好的消息数组，交给两个转换函数（只跑转换，没有真的发给 Claude 和 Gemini）：

```text title="效果 · convertClaudeMessages"
--8<-- "projects/sillytavern/assets/sim/txt/ad-claude.txt"
```

```text title="效果 · convertGooglePrompt"
--8<-- "projects/sillytavern/assets/sim/txt/ad-gemini.txt"
```

## 不认识的端点：几档通用后处理 { #postprocess }

**问题**：自己搭的 vLLM、各种中转站，有的只收一条 system，有的要求严格交替，连着两条 user 就报 400；酒馆不可能认识每一家。

**功能**：后处理分几档，用户按端点的要求选：

- **merge**：合并连续的同角色消息
- **semi**：再把开头以外的 system 改成 user
- **strict**：再在开头补一条占位的 user，保证 system 后面紧跟 user
- **single**：整个对话压成一条 user

```js title="模版 · src/prompt-converters.js:85-105"
--8<-- "projects/sillytavern/assets/st-src/src/prompt-converters.js:85:105"
```

strict 档补占位消息的那几行，占位文字取 `config.yaml` 的 `promptPlaceholder`，新装酒馆是 `[Start a new chat]`：

```js title="模版 · src/prompt-converters.js:936-950"
--8<-- "projects/sillytavern/assets/st-src/src/prompt-converters.js:936:950"
```

有的供应商不让用户选，服务端直接定死。DeepSeek 固定走 semi：

```js title="模版 · src/endpoints/backends/chat-completions.js:1119"
--8<-- "projects/sillytavern/assets/st-src/src/endpoints/backends/chat-completions.js:1119:1119"
```

**效果**：同一份第二轮的消息数组过几档，每行是一档的角色序列：

```text title="效果 · 几档后处理"
--8<-- "projects/sillytavern/assets/sim/txt/ad-postprocess.txt"
```

主线第一轮实际发给 DeepSeek 的请求：前端拼了 6 条，开头 4 条 system 被合成一条，最后剩 3 条：

```text title="效果 · 第一轮的真实请求"
--8<-- "projects/sillytavern/assets/sim/txt/ad-r1-request.txt"
```

参数全是出厂值：温度 1、回复上限 300、思考开着。

## 回复被截断：continue 接着写 { #continue }

**问题**：回复顶到 `max_tokens` 被截断。baseline 只能再发一句「继续」，这就多了一条 user，模型往往重起一段，叙事断开。

**功能**：continue 把被截断的那条从历史里拿出来，接在最后，有两种写法。出厂是「续写提示」：被续写的消息后面跟一条 system，「继续写，别重复」：

```js title="模版 · public/scripts/openai.js:905-927"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:905:927"
```

打开 `continue_prefill`，被续写的消息就以 assistant 身份放在最后、不加提示，让支持预填的 API 真正逐字往下写：

```js title="模版 · public/scripts/openai.js:1318-1331"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:1318:1331"
```

DeepSeek 认最后一条 assistant 上的 `prefix: true`，服务端顺手打上：

```js title="模版 · src/prompt-converters.js:67-76"
--8<-- "projects/sillytavern/assets/st-src/src/prompt-converters.js:67:76"
```

**效果**：主线第四轮回复顶到了 300 token，点「继续」：

```text title="效果 · 第四轮被截断，continue 之后"
--8<-- "projects/sillytavern/assets/sim/txt/ad-r4-continue.txt"
```

同一处续写，两种写法发出去的结尾：

```text title="效果 · 续写提示 / continue_prefill（dry run）"
--8<-- "projects/sillytavern/assets/sim/txt/ad-continue.txt"
```

被续写的那条前面多了 `<think>……</think>`：续写时，酒馆把这条消息存下的思考作为前缀拼回去，接上之后再按长度切掉（`public/scripts/reasoning.js:744-799`）。续写提示是 system，到了 DeepSeek 那边被 semi 改成了 user。

## 替用户起草：impersonate { #impersonate }

**问题**：baseline 只能让模型说它自己的话；用户想照着当前的文风让模型替自己写一句，再改改发出去，没有办法。

**功能**：impersonate 在最后加一条控制指令「从 `{{user}}` 的视角写下一句」，生成的结果写回输入框，不进聊天：

```js title="模版 · public/scripts/openai.js:1224-1225"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:1224:1225"
```

**效果**：主线第四轮先点 impersonate，再把它写的这句原样发出去：

```text title="效果 · impersonate 的请求结尾和回包"
--8<-- "projects/sillytavern/assets/sim/txt/ad-impersonate.txt"
```

## 预设：把整套打包带走 { #preset }

**问题**：baseline 里调好的 system prompt 和参数只是一段文字，带不走条目的顺序、开关、深度、后处理档位；换个模型要重新调一遍。

**功能**：预设是一个 JSON：采样参数、全部提示词条目、条目顺序、续写和 impersonate 这些控制提示词，换模型就换一份预设。随包的 Default 预设开头：

```json title="模版 · default/content/presets/openai/Default.json:25-58"
--8<-- "projects/sillytavern/assets/st-src/default/content/presets/openai/Default.json:25:58"
```

预设是拿来分享的，导出时检查反代地址、密码这些字段，问用户要不要剔掉：

```js title="模版 · public/scripts/openai.js:4855-4872"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/openai.js:4855:4872"
```

这一节只贴模版：导入导出是界面操作，没有可跑的效果。

## Text Completion 一瞥 { #text-completion }

**问题**：本地模型的 completion 接口只收一整条字符串，没有角色；不按模型训练时的 chat template 拼，质量就掉，模型写完自己那句还会接着替用户说话。

**功能**：前端按 instruct 模板替模型套 chat template：每条消息按角色包上前后缀，同一组前缀兼作停止串：

```js title="模版 · public/scripts/instruct-mode.js:450-456"
--8<-- "projects/sillytavern/assets/st-src/public/scripts/instruct-mode.js:450:456"
```

**效果**：同一段聊天按随包的 ChatML 模板（`default/content/presets/instruct/ChatML.json`）拼：

```text title="效果 · ChatML 拼出的字符串（开头和结尾）"
--8<-- "projects/sillytavern/assets/sim/txt/ad-tc.txt"
```

最后一行停在 `<|im_start|>assistant`，模型从这里接着写；写到下一个 `<|im_start|>user` 就被停止串截住。

## 谁管什么 { #split }

- **程序**：前端统一格式、服务端按供应商改写、后处理档位的规则、续写和 impersonate 的拼法
- **用户**：选供应商和后处理档位、续写用哪种写法、选哪份预设和模板
- **预设作者**：参数、条目和顺序、控制提示词的措辞
- **模型**：拿到改写后的格式，在给定的开头上接着写

## 实跑原件 { #sim-files }

??? abstract "各供应商转换和几档后处理的完整输出"

    ```json
    --8<-- "projects/sillytavern/assets/sim/out/adapt-providers.json"
    ```

    ```json
    --8<-- "projects/sillytavern/assets/sim/out/adapt-postprocess.json"
    ```
