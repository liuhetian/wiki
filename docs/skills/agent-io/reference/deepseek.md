---
description: "Agent 调 DeepSeek：请求走自家 API 中转，网关 token 由用户写在 .env 的 MY_API_KEY，AI 需要时直接调；models 看可用模型，chat 流式输出、附文件、可开思考和 JSON，balance 查余额；默认关思考，又快又便宜"
---

# 调用 DeepSeek

要另一个模型帮忙时，比如复核结论、批量摘要、改写中文，就用这个脚本调 DeepSeek。**请求走[自家 API 中转](../../../posts/ai-assistant/api-gateway.md)：Agent 只拿网关 token，DeepSeek 的 key 只存在中转机上。token 用户已经配好，AI 直接调用，不用先问。**

- [什么时候用](#when)
- [配置：用户已经写好，直接调](#setup)
- [脚本用法](#usage)
- [报错怎么办](#errors)
- [没做的](#not-done)

## 什么时候用 { #when }

碰到下面这些情况，直接调，不用先问用户：

- 要第二意见：把自己的结论交给另一个模型复核，两边对不上的地方再细看
- 批量的便宜活：几十份文本逐份摘要、分类、抽字段。默认 `deepseek-flash` 关思考，一次几秒
- 材料很长：上下文 1M token，整份文档直接附上去问

Agent 自己就跑在 DeepSeek 上（比如 DSH）时，不用绕这一圈，直接自己答。

## 配置：用户已经写好，直接调 { #setup }

**网关 token 由用户手动写在 `.env` 的 `MY_API_KEY` 里。AI 不用问，需要时直接跑脚本。** 脚本先看环境变量，没有的话，从当前目录往上找最近的一个 `.env`，读其中的 `MY_API_KEY`。

- 不要把 token 打印出来，也不要写进日志或回复；不要 `cat .env`。
- 找不到 `MY_API_KEY` 时，脚本以退出码 2 退出。这时才去告诉用户，请用户在 `.env` 里加一行 `MY_API_KEY=<网关 token>`。
- `MY_API_KEY` 是网关 token，不是 DeepSeek 的 key：中转只认网关 token，直接传厂商 key 也返回 401。
- 中转地址不用配，默认是 `https://deepseek-proxy.liuhetian.work/v1`；中转换了地址，才需要设 `DEEPSEEK_BASE_URL`。
- 用 OpenAI SDK 的程序也能直接接中转：`base_url` 填上面的地址，`api_key` 填同一个 token。

## 脚本用法 { #usage }

脚本：[scripts/deepseek.py](../scripts/deepseek.py)。只用标准库，`uv run` 和 `python3` 都能跑，不从 PyPI 装任何包。

```bash
curl -fsSO https://wiki.liuhetian.work/skills/agent-io/scripts/deepseek.py

uv run deepseek.py models
uv run deepseek.py chat "把这段话改成书面语：……"
uv run deepseek.py chat "这份日志里有哪些报错？逐条列出" --file app.log
git diff | uv run deepseek.py chat "审一下这个 diff，只说可能的 bug" --effort high
uv run deepseek.py chat '用 json 返回 {"title": "...", "tags": ["..."]}' --file post.md --json
uv run deepseek.py balance
```

| 参数 | 作用 |
|---|---|
| `--effort` | `none` / `low` / `high` / `max`。默认 `none`，关掉思考，又快又便宜；难题再调高。DeepSeek 接口本身的默认是开思考、`high` |
| `--model` | 默认 `deepseek-flash`；`deepseek-v4-pro` 只收文本，先跑 `models` 看当前有哪些 |
| `--file PATH` | 附一个 UTF-8 文本文件，可以重复。内容包在 `<file path="…">` 里，接在 prompt 后面 |
| `--system` | system 消息 |
| `--max-tokens` | 输出上限，思考的 token 也算在内 |
| `--json` | 要求返回 JSON 对象。prompt 或 `--system` 里必须写到 json 并给出格式，否则脚本直接退出 |
| `--show-reasoning` | 思考过程流到 stderr，夹在 `<reasoning>` 标签里 |
| `--temperature` | 0–2，开思考时不起作用 |

- 回答流式写到 stdout。结束时 stderr 打一行用量：`[deepseek-flash] finish=stop · prompt 36 (cache hit 0) · completion 1`，开了思考还会单独标出思考 token。
- `finish=length` 表示回答被 `--max-tokens` 截断了，stderr 会提示加大上限再问。
- 不传 prompt 或传 `-`，就从 stdin 读。
- 环境里的 SOCKS 代理（`ALL_PROXY=socks5h://…`）会被跳过：urllib 不支持 SOCKS，中转也不需要代理。http(s) 代理照常使用。
- 中转只记请求次数，不记 token。用了多少 token 看 stderr 那一行，花了多少钱看 `balance`。

`models` 在 2026-10-01 的输出：

```text
deepseek-flash  DeepSeek-V4.1-Flash  context 1,048,576  max output 393,216  input text+image  effort low/high/max
deepseek-v4-pro  DeepSeek-V4-Pro  context 1,048,576  max output 393,216  input text  effort low/high/max
```

2026-10-01 在中转机上实测过这些情况：`models`；关思考、`low` 思考、`--json`、stdin 加 `--file`、被 `--max-tokens` 截断；`balance`；从上级目录的 `.env` 读到 token；错 token、找不到 token、写错模型名、文件不存在；环境里有 SOCKS 代理。实际表现都和这一页写的一致。

## 报错怎么办 { #errors }

退出码 2 表示参数或配置有问题，1 表示中转或 DeepSeek 出了问题。stderr 用一行写出原因和改法。

| 报错 | 原因 | 怎么办 |
|---|---|---|
| `MY_API_KEY not found …` | 环境变量和 `.env` 里都没有 | 请用户在 `.env` 里加一行 `MY_API_KEY=<网关 token>` |
| `HTTP 401: A valid gateway token is required.` | token 不对、已经换过，或者填成了 DeepSeek 的 key | 请用户检查 `.env` 里的 `MY_API_KEY` |
| `HTTP 401` 但没提 gateway | 中转机上存的 DeepSeek key 失效了 | 告诉用户，Agent 这边修不了 |
| `HTTP 402` | DeepSeek 余额用完了 | 告诉用户充值，重试没用 |
| `HTTP 400: The supported API model names are …` | 模型名写错了 | 先跑 `models` |
| `HTTP 429`、`5xx` | 限流，或者 DeepSeek 太忙 | 等一会儿再试 |
| `cannot reach …` | 网络不通，或者中转挂了 | 告诉用户；排查方法见 API 中转的[排障一节](../../../posts/ai-assistant/api-gateway.md#dns) |

## 没做的 { #not-done }

- **多轮对话**：每次只有一问一答，没有传历史消息的参数。
- **看图**：`models` 显示 `deepseek-flash` 能收图片输入，但脚本没接，也没测。
- 工具调用、FIM 补全、Anthropic 格式的接口都没接。
- **每个 Agent 一个 token** 还没做：现在所有调用方共用 `personal` 一个 token，见 API 中转的[还没做](../../../posts/ai-assistant/api-gateway.md#todo)。

??? abstract "完整脚本 `scripts/deepseek.py`"

    ```python
    --8<-- "skills/agent-io/scripts/deepseek.py"
    ```
