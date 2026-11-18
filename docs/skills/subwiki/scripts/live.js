/**
 * 页面打开时把占位符换成接口当前的返回值。
 *
 * Markdown 里写：{{ api("/api/today").date }}
 *   - "/api/today" 是接口路径，拼在 <meta name="api-base"> 给出的地址后面；
 *     没有这个 meta 时请求当前站点（子服务自己的 wiki 和接口同源，不用写）
 *   - .date 是要取的返回字段，可以多级，如 .data.items.0.name
 * code / pre 里的占位符不替换，用来写示例。
 *
 * 服务端返回 .md 时用同样的规则替换：placeholders.py、md-render.ts，
 * 三处共用 placeholder_cases.json 的用例。
 */
(() => {
  // {{ api("url").a.b }}，引号可单可双
  const PATTERN = /\{\{\s*api\(\s*(["'])(.+?)\1\s*\)((?:\.[\w$]+)*)\s*\}\}/g;
  const SKIP = "code, pre, script, style, textarea";

  /** 接口地址：页头的 <meta name="api-base">，没有就是当前站点 */
  function resolveApiBase() {
    const meta = document.querySelector('meta[name="api-base"]');
    return (meta?.content ?? "").replace(/\/$/, "");
  }

  /** 把正文里的占位符替换成 <span>，返回待填充的列表 */
  function collectSlots(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        node.nodeValue.includes("{{") && !node.parentElement.closest(SKIP)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT,
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    const slots = [];
    for (const node of nodes) {
      const text = node.nodeValue;
      const frag = document.createDocumentFragment();
      let last = 0;
      for (const m of text.matchAll(PATTERN)) {
        const span = document.createElement("span");
        span.className = "live";
        span.textContent = "…";
        span.title = m[0]; // 鼠标悬停可看到原始占位符，方便排查
        frag.append(text.slice(last, m.index), span);
        slots.push({ span, url: m[2], keys: m[3].split(".").filter(Boolean) });
        last = m.index + m[0].length;
      }
      if (last === 0) continue; // 这个文本节点里没有合法占位符
      frag.append(text.slice(last));
      node.replaceWith(frag);
    }
    return slots;
  }

  /** 扫描页面、请求接口、填充结果 */
  function render() {
    const root = document.querySelector("article") ?? document.body;
    const apiBase = resolveApiBase();
    const requests = new Map(); // 同一页面里相同 URL 只请求一次

    for (const { span, url, keys } of collectSlots(root)) {
      if (!requests.has(url)) {
        requests.set(
          url,
          fetch(apiBase + url, { cache: "no-store" }).then((resp) => {
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return resp.json();
          })
        );
      }
      requests
        .get(url)
        .then((data) => {
          const value = keys.reduce((obj, key) => obj?.[key], data);
          // 用 textContent 填充，接口返回的内容不会被当作 HTML 执行
          span.textContent =
            value !== null && typeof value === "object"
              ? JSON.stringify(value)
              : String(value ?? "");
        })
        .catch((err) => {
          span.textContent = "加载失败";
          span.title = `${url}: ${err.message}`;
        });
    }
  }

  if (typeof window.document$ !== "undefined") {
    // zensical / Material 主题：首次加载以及 navigation.instant 无刷新切页后都会触发
    window.document$.subscribe(render);
  } else if (document.readyState === "loading") {
    // 其他静态站点：DOM 解析完成后执行一次
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
