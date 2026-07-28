# 用量上报接口：交接文档

!!! abstract "这是给上报方看的一页"
    本篇是[《让 Kindle 常显一块 Token 看板》](../index.md)的接口交接文档 —— 主文讲了[为什么额度靠上报而不靠拉取](../index.md#上报)，这一页是接入方真正要照着做的东西，可以整页发给对方。

    真实口令与内网地址已替换成占位符 `<口令>` / `<看板地址>`，照抄时换成自己的。

    [← 回到主文：设计](../index.md)

把一台机器上的额度数据发给 Token 看板（跑在树莓派上）。看板每分钟采样一次，收到的数据会在下一个周期（≤60 秒）显示到 Kindle 墨水屏上。

Codex、Claude Code、以及以后任何新工具，**都走这同一个接口、同一套格式**。区别只在于 `limits` 里报几条、`key` 叫什么。

## 零、先测连通性

```bash
curl -sS -m 5 http://<看板地址>:8000/api/report/status | head -c 200
```

有 JSON 输出就说明网络通了。不通的话先解决网络，别急着调上报。

## 一、接口

```text
POST http://<看板地址>:8000/api/report
Header: X-Report-Token: <口令>
Header: Content-Type: application/json
```

收到上报后**默认不立即刷新**，等下一个采样周期（≤60 秒）自然上屏就行 —— 自动上报没必要每次都催一遍。

只有**手动敲命令、想马上看到结果**时才加 `?refresh=1`，看板会立刻采样一轮，数秒内上屏。连着催也刷不爆：两轮采样之间强制至少隔 5 秒，而且数据没变时本来就不会推送。

## 二、请求体

```json
{
  "source": "codex",
  "host": "codex-01",
  "reported_at": "2026-07-26T09:41:32+0800",
  "limits": [
    { "key": "session_5h", "available": false },
    { "key": "week", "available": true, "used_percent": 1.0,
      "resets_at": "2026-08-02T09:41:32+0800" }
  ],
  "meta": { "plan_type": "plus", "credits": { "balance": "0" } }
}
```

| 字段 | 必要性 | 说明 |
|---|---|---|
| `source` | 必填 | `codex` 或 `claude_code`。决定进哪一张环卡 |
| `host` | 必填 | 能认出这台机器的名字，通常 `$(hostname)`。多机上报时靠它分辨谁是谁 |
| `reported_at` | 可选 | 上报机自己的时钟，ISO 8601。仅随原始留档保存、不参与任何逻辑，数据时刻一律用看板收到的时刻 |
| `limits[]` | 至少一条 | 额度维度列表，见下 |
| `meta` | 可选 | 任何附加信息，原样存档、暂不显示。以后要显示时历史数据已经在库里了 |

### `limits[]` 里的每一项

| 字段 | 必要性 | 说明 |
|---|---|---|
| `key` | 必填 | 维度标识，见下表 |
| `available` | 默认 `true` | `false` 表示这个窗口没有数据，按 **0%** 记（"这 5 小时还没用过"） |
| `used_percent` | `available` 时必填 | 已用百分比 `0~100`。**一律报"已用"**，"显示已用还是显示余额"是看板的展示决策 |
| `resets_at` | 强烈建议 | 额度重置时刻，带时区的 ISO 8601。见「三」 |

### 认哪些 `key`

| `key` | 含义 | 谁在用 |
|---|---|---|
| `session_5h` | 5 小时时段限额 | Codex / Claude Code |
| `week` | 周限额 | Codex / Claude Code |
| `week_fable` | 周限额（Fable 模型单独额度） | Claude Code |

报了表里没有的 `key` **不会报错**，会被记进返回值的 `skipped` 里 —— 说明看板还没给那个维度留位置，可以找维护者加。

`limits` 数组的**先后顺序无关紧要** —— 环画在外圈还是内圈、叫什么名字、显示已用还是余额，都是看板那边定的（理由见主文[维度声明表](../index.md#维度表)），按 `key` 匹配，跟你怎么排没关系。

某个维度**不再上报**（比如那个额度取消了）就直接从 `limits` 里去掉，看板过几分钟会自动不画那个环，不需要通知维护者。

当前认哪些 key 可以查（看每个源的 `accepted_keys` 字段）：

```bash
curl -s http://<看板地址>:8000/api/report/status | python3 -m json.tool
```

## 三、`resets_at` 为什么重要

看板**不做**"多久没上报就算掉线"的判定 —— 手动上报、只在有用量时才报，都完全没问题，静默几小时是正常状态。

真正让一份数据失效的是**额度自己重置**：一份 4 小时前报的 `session 37%`，如果它的重置时刻已经过去，那 37% 就不再成立（窗口已归零）。看板靠 `resets_at` 判断这件事，过期后自动把该维度归 0，并把说明文字改成「已重置 · 待上报」。

不给这个字段也能用，但过期的数据会一直挂在屏幕上，直到下次上报。

## 四、完整例子

### Codex

假设取数命令产出的是这样一段原始 JSON：

```json
{
  "session_5h": {"available": false, "used_percent": null, "remaining_percent": null},
  "week": {"available": true, "used_percent": 1.0, "remaining_percent": 99.0,
           "resets_at_iso": "2026-08-02T09:41:32+0800"},
  "credits": {"has_credits": false, "unlimited": false, "balance": "0"},
  "plan_type": "plus"
}
```

转换成上报格式（这段放上报方脚本里，字段名对不上就在这里改）：

```python
#!/usr/bin/env python3
"""codex 用量 → 看板上报。用法: 你的取数命令 | python3 report.py"""
import json, socket, sys, urllib.request

TOKEN = "<口令>"
URL = "http://<看板地址>:8000/api/report"

raw = json.load(sys.stdin)
limits = []
for block_name, key in (("session_5h", "session_5h"), ("week", "week")):
    block = raw.get(block_name)
    if not isinstance(block, dict):
        continue
    used = block.get("used_percent")
    if used is None and block.get("remaining_percent") is not None:
        used = 100.0 - float(block["remaining_percent"])   # 只有余额时换算回已用
    limits.append({
        "key": key,
        "available": bool(block.get("available")),
        "used_percent": used,
        "resets_at": block.get("resets_at_iso"),
    })

body = json.dumps({
    "source": "codex",
    "host": socket.gethostname(),
    "limits": limits,
    "meta": {k: v for k, v in raw.items() if k not in ("session_5h", "week")},
}).encode()

req = urllib.request.Request(URL, data=body, method="POST", headers={
    "Content-Type": "application/json", "X-Report-Token": TOKEN,
})
print(urllib.request.urlopen(req, timeout=10).read().decode())
```

挂 cron（频率随意，10 分钟、1 小时都行，手动跑也可以）：

```cron
*/10 * * * * 你的取数命令 | /usr/bin/python3 /path/to/report.py
```

### Claude Code

CC 的用量输出是给人看的纯文本，没法用纯 curl 转成 JSON，所以额外开了一个**文本捷径端点**（只是省掉上报端的解析，最终进的是同一个格式、同一条通路）：

```bash
claude -p '/usage' | curl -sS -X POST --data-binary @- \
  -H "X-Report-Token: <口令>" \
  "http://<看板地址>:8000/api/report/claude_code/raw?host=$(hostname)"
```

!!! warning "不要给它挂 cron"
    `claude -p '/usage'` 每跑一次自己就要起一个非交互会话、吃掉一点额度，定时跑等于"为了看用量而制造用量"，**观测本身污染了被观测的数字**。想看最新的就手动敲一次，看板不做保鲜期判定，隔多久报都行。

能自己产 JSON 的源不要照着这个加端点，一律走 `POST /api/report`。

## 五、怎么确认成功

成功返回 `200`，body 里写明采纳了哪些值：

```json
{
  "ok": true,
  "source": "codex",
  "host": "codex-01",
  "accepted": { "codex_session_pct": 0.0, "codex_week_pct": 1.0 },
  "skipped": [],
  "note": "下一个采样周期(≤60s)上屏"
}
```

## 六、错误码

| 码 | 含义 | 怎么办 |
|---|---|---|
| `401` | 口令不对 | 检查 `X-Report-Token` |
| `503` | 看板还没配口令 | 找维护者配 `MONITOR_REPORT_TOKEN` |
| `409` | 这个 `source` 当前不收上报（还在 mock 模式） | 找维护者把对应的 `MONITOR_MOCK_*_LIMITS` 置 `false` 并重启 |
| `422` | 请求体字段不对 | 看返回的 `detail`，对照「二」 |
| `400` | 文本端点解析失败 | 原始内容已在看板留档，可让维护者查 |

## 七、看板侧排查

```bash
curl -s http://<看板地址>:8000/api/report/status | python3 -m json.tool
```

列出每个源最后收到什么、哪台机器报的、哪些 key 没被采纳、最近 10 条原始留档 —— **解析失败的也留档**，能看到上报方当时到底发了什么。
