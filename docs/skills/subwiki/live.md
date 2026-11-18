---
name: 动态数据
description: "子 wiki 的文档里要嵌接口实时数据时读：占位符怎么写、浏览器和服务端两处替换怎么保持一致、被主 wiki 吸纳后怎么取数，以及主 wiki 上的 .md 不替换这个已知限制"
---

# 动态数据

文档里写占位符，读的时候换成接口当前返回的值。先照 [wiki 部署约定](index.md#site)把 wiki 挂出来。

```markdown
今天已调用 {{ api("/api/stats").total_calls }} 次。
```

- 引号里是接口路径，后面是要取的返回字段，可以多级：`.data.items.0.name`
- **接口要支持 GET 并返回 JSON**
- **占位符不进标题**：搜索索引和页面目录里会出现占位符原文
- **示例写在代码块或行内代码里**：那里的占位符不替换

## 两处替换，规则必须一致

| 谁读 | 在哪替换 | 用什么 |
|---|---|---|
| 人读 HTML | 浏览器 | [`live.js`](scripts/live.js)，构建脚本把它复制进 `docs/javascripts/`，`zensical.toml` 写 `extra_javascript = ["javascripts/live.js"]` |
| AI 读 `/wiki/x.md` | 服务端，返回前替换 | Python 用 [`placeholders.py`](scripts/placeholders.py)，TypeScript 用 [`md-render.ts`](scripts/md-render.ts) |

- **服务端在进程内调用自己的接口，不走网络**：FastAPI 用 `httpx.ASGITransport(app=app)`，Hono 用 `app.request(url)`
- **用别的语言重写，要跑通[共享用例](scripts/placeholder_cases.json)**：同一 URL 一页只请求一次，失败输出「加载失败」，对象输出紧凑 JSON，整数值的浮点数按整数输出

## 被主 wiki 吸纳之后

主 wiki 是纯静态站，页面里的占位符由浏览器跨域向子服务取数：

- **`docs/.meta.yml` 写一行接口地址**，不带末尾斜杠。主 wiki 见到它才给这些页面引入 `live.js`；项目自己的站点和接口同源，用不上它

    ```yaml title="docs/.meta.yml"
    api_base: "https://calc.example.com"
    ```

- **服务打开 CORS**：接口是只读的 GET，默认对所有来源开放，服务不需要知道主 wiki 的地址
- **主 wiki 是 https，接口也得是 https**：https 页面向 http 接口取数会被浏览器拦掉
- **主 wiki 上的 `.md` 是源文件原文，占位符不替换**：主 wiki 没有后端。在 `docs/index.md` 写一句本服务 wiki 的地址，AI 要实时值就去读那里的 `/wiki/x.md`
