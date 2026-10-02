---
description: "只给自己用的 AI 接口中转：Caddy 验网关 token、换成真实 key、其余原样转发，配置全在 /etc/caddy；DeepSeek、AutoDL 已在国内机上线，CodeProxy、OpenRouter 在海外机；记录我们的决策和踩过的坑"
---

# 调 AI 接口不需要 new-api：Caddy 换个 header 就够了

**Agent 只拿一个网关 token，真实 key 只存在中转机上。** 2026-10-01 在国内机上接好了 DeepSeek 和 AutoDL，2026-10-02 在海外机上接好了 CodeProxy（图片生成）和 OpenRouter（网络搜索、音频转录、音乐生成、Jev 结构化判断），其余厂商还没接。Agent 端用法见[调用 DeepSeek](../../skills/agent-io/reference/deepseek.md)、[网络搜索](../../skills/agent-io/reference/web-search.md)、[生成特定音色语音](../../skills/agent-io/reference/tts.md)、[生成视频](../../skills/agent-io/reference/video/index.md)、[生成、编辑图片](../../skills/agent-io/reference/image.md)、[转录音频](../../skills/agent-io/reference/transcribe.md)、[生成音乐](../../skills/agent-io/reference/music.md)和[结构化判断](../../skills/agent-io/reference/jev.md)。

## 决策 { #decisions }

- 只做透明转发：验 token，换 `Authorization`，其余原样转发。Agent 照官方 SDK 用，只换 base URL 和 key。
- 用 Caddy，版本必须 ≥ 2.11，`caddy version` 确认：SSE、WebSocket、长连接默认就能用，证书自动签。不用 nginx，因为这些都要手配；不用 new-api，可以但没必要。
- 国内机接国内厂商，海外机接 OpenAI、Anthropic、Gemini。一家厂商一个子域名、一个 `.caddy` 文件。DeepSeek 是 `https://deepseek-proxy.liuhetian.work`，AutoDL 是 `https://autodl-proxy.liuhetian.work`；海外机上的 CodeProxy 是 `https://codeproxy.reverse-pro.xyz`，OpenRouter 是 `https://openrouter.reverse-pro.xyz`。
- token 由用户自己定，四家用同一个。Agent 端写在 `.env` 的 `MY_API_KEY` 里。
- 日志只留时间和状态码，请求头、URL、IP、聊天内容都不记。
- 要签名或者令牌会过期的厂商（即梦、Bedrock、腾讯云 TC3、可灵、Vertex），Caddy 做不了，改用这家有 Bearer key 的 OpenAI 兼容接口。
- **配置全放 `/etc/caddy`**，唯一的例外是 systemd drop-in：

| 文件 | 内容 |
|---|---|
| `/etc/caddy/Caddyfile` | 原有的静态站，末尾 `import /etc/caddy/sites-enabled/*.caddy` |
| `/etc/caddy/sites-enabled/deepseek.caddy`、`autodl.caddy` | 一家一个：验 token、换 key、转发、过滤日志 |
| `/etc/caddy/gateway.env` | 每家两行 `<厂商>_API_KEY`、`<厂商>_GATEWAY_TOKEN`，root 所有，0600 |
| `/etc/systemd/system/caddy.service.d/gateway.conf` | 读 env 文件，去掉 `--environ` |

??? abstract "`assets/gateway/deepseek.caddy`"

    ```text
    --8<-- "posts/ai-assistant/assets/gateway/deepseek.caddy"
    ```

??? abstract "`assets/gateway/autodl.caddy`"

    ```text
    --8<-- "posts/ai-assistant/assets/gateway/autodl.caddy"
    ```

??? abstract "`assets/gateway/gateway.conf`"

    ```ini
    --8<-- "posts/ai-assistant/assets/gateway/gateway.conf"
    ```

脚本不放在服务器上，要用的时候下载，用 `sudo python3` 跑：[`verify.py`](assets/gateway/verify.py) 做验收（只验 DeepSeek），[`stats.py`](assets/gateway/stats.py) 统计每日次数，[`audit.py`](assets/gateway/audit.py) 检查 journal 里有没有漏出 key。

## 踩过的坑 { #pitfalls }

- **改完先校验，通过了再 `reload`**。改过 env 文件要 `restart`，加了 drop-in 要先 `daemon-reload`：

    ```bash
    sudo -u caddy env -i HOME=/var/lib/caddy PATH=/usr/bin:/bin \
        caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
    ```

    要用 caddy 用户跑：用 root 跑，会建出 root 属主的日志文件，Caddy 就写不进去了。`env -i` 让报错信息里带不出 key。
- **官方 unit 的 `--environ` 会把 key 打进 journal**：所以 drop-in 里去掉了它。
- **`autosave.json` 里是明文 key**：`/var/lib/caddy/.config/caddy/autosave.json` 存的是展开后的配置。保持 0600，管理 API 只监听本机，配置导出来别往外贴。
- **中转只认 `Authorization: Bearer`**：Anthropic 兼容端点 `/anthropic` 也会原样转发，但 Anthropic SDK 默认把 key 放进 `x-api-key`，这样会 401，要改用 `auth_token=`。
- **AutoDL 的真实令牌前面不带 `Bearer`**：所以 `autodl.caddy` 写的是 `header_up Authorization "{$AUTODL_API_KEY}"`。Agent 那边照样发 `Bearer <网关 token>`。
- **改了 token 要同步改每个 Agent 的 `.env`**：旧 token 马上就是 401。
- **验收要发真实请求**：`systemctl is-active` 只能说明进程活着，要跑 `verify.py`。浏览器直接打开地址看到 401 是正常的，因为浏览器没带 token。
- **换了域名，服务器正常、电脑打不开**：本机还缓存着旧 IP。比较三处：本机解析、权威 DNS、curl 实际连上的 IP。

## key 放哪 { #keys }

厂商 key 和网关 token 用 `scripts/age-seal.sh` 加密成 `age:…`，打码写在这一节，一个 key 一行，写成 `DEEPSEEK_API_KEY=age:…` 的样子。写进来之前，先在厂商控制台给 key 设好用量上限。为什么能公开放，见[打码](../wiki-tech/age-mosaic.md)。

DeepSeek 的 key 还没写进来。

## 还没做 { #todo }

- 多调用方：每个调用方一个 token、单独撤销、分别统计。现在只有一个调用方 `personal`，日志也分不出请求来自谁。
- 统计只有请求次数和状态码，不是 token 用量，也不是账单。账单看 DeepSeek 余额（`/user/balance`）。
- 海外机 2026-10-02 重装过，本机的 SSH 公钥还没装回去：CodeProxy、OpenRouter 的中转配置没同步进 `assets/gateway/`，上面的文件表也只对应国内机，验收脚本没在海外机上跑过。
- 没定的事：每项能力用哪家，语音要不要实时（实时就走 WebSocket），每个调用方能用哪些厂商。
