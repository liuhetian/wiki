// 「复制本页 Markdown」按钮：复制的是这一页的 .md 源文件本身，不是从 HTML 转回来的版本——
// 源文件由 AI 写、给 AI 读，原样最好（为什么不用官方 llmstxt 插件、原理和测试，见 posts/wiki-tech/md-copy.md）。
// 源文件地址由 overrides/main.html 写进页头 <link rel="alternate" type="text/markdown">，取自 page.edit_url
// （mkdocs.yml 的 edit_uri 指向站点根，edit_url 就等于源文件地址）。取文件时只用它的路径、按当前站点去拿，
// 本地预览也能用；改写链接时用它的原始地址，复制出去的链接都指向线上。
// 复制前做两件事，让贴进对话框的文字自成一体：
//   - 代码块以外的相对链接、图片、HTML 的 src/href 改成绝对地址；代码块和行内代码里举例写的链接不动
//   - --8<-- "路径" 改成真身的绝对地址：先按站点根找（snippet 的 base_path 先 docs），找不到就指向 GitHub 仓库
// 打码的密文原样复制，页面上解锁过也一样。页头没有那行 link 就不出按钮。
(function () {
  const REPO = "https://github.com/liuhetian/wiki/blob/main/";
  const SVG = d => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${d}"/></svg>`;
  const ICON_COPY = SVG("M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12V1Z");
  const ICON_DONE = SVG("M21 7 9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59 21 7Z");
  const KEEP = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/|<)/i;        // 已带协议、页内锚点、协议相对、<…> 包着的：不动
  const SNIPPET = /^(\s*)--8<--\s+(["'])(.+?)\2\s*$/;

  const abs = (target, base) => (!target || KEEP.test(target) ? target : new URL(target, base).href);

  // 代码块以外的一行：跳过行内代码，改写 [x](y)、![x](y)、[x]: y 和 HTML 的 src/href
  function rewriteLine(line, base) {
    if (/^\s*\[(?!\^)[^\]]+\]:\s*\S/.test(line))            // 链接定义；[^1]: 是脚注，不算
      return line.replace(/^(\s*\[[^\]]+\]:\s*)(\S+)/, (_, head, t) => head + abs(t, base));
    return line.split(/(`[^`]*`)/).map((part, i) => i % 2 ? part : part
      .replace(/(\]\()([^)\s]+)/g, (_, head, t) => head + abs(t, base))
      .replace(/\b(src|href)="([^"]+)"/g, (_, attr, t) => `${attr}="${abs(t, base)}"`)
    ).join("");
  }

  async function snippetUrl(path, base) {
    const site = new URL(path, new URL("/", base)).href;
    try {
      const r = await fetch(new URL(new URL(site).pathname, location.origin), { method: "HEAD" });
      if (r.ok) return site;
    } catch (e) { /* 取不到就当不在站上 */ }
    return REPO + path;
  }

  async function build(source, base) {
    const lines = source.split("\n");
    let fence = null;                                       // { ch, len }：当前所在代码块的围栏
    const jobs = [];
    const out = lines.map((line, i) => {
      const m = line.match(/^\s*(`{3,}|~{3,})/);
      if (m) {
        if (!fence) fence = { ch: m[1][0], len: m[1].length };
        else if (m[1][0] === fence.ch && m[1].length >= fence.len && /^\s*[`~]+\s*$/.test(line)) fence = null;
        return line;
      }
      const s = line.match(SNIPPET);
      if (s) {
        jobs.push(snippetUrl(s[3], base).then(u => { out[i] = `${s[1]}--8<-- "${u}"`; }));
        return line;
      }
      return fence ? line : rewriteLine(line, base);
    });
    await Promise.all(jobs);
    // 来源写在最前面；有 frontmatter 就放在它后面，不破坏它
    const note = `<!-- 来源：${base} -->`;
    const fm = out[0] === "---" ? out.indexOf("---", 1) : -1;
    if (fm > 0) out.splice(fm + 1, 0, note); else out.unshift(note, "");
    return out.join("\n");
  }

  async function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const ta = document.createElement("textarea");           // 非 https 的预览站没有 clipboard API
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    if (!ok) throw new Error("浏览器不让写剪贴板");
  }

  function init() {
    const link = document.querySelector('link[rel="alternate"][type="text/markdown"]');
    const inner = document.querySelector(".md-content__inner");
    if (!link || !inner) return;
    const base = link.href;                                 // 线上地址：改写链接用
    const fetchUrl = new URL(new URL(base).pathname, location.origin); // 当前站点：取文件用

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "md-content__button md-icon zx-md-copy";
    btn.title = "复制本页 Markdown 源";
    btn.setAttribute("aria-label", btn.title);
    btn.innerHTML = ICON_COPY;
    btn.addEventListener("click", async () => {
      try {
        const r = await fetch(fetchUrl);
        if (!r.ok) throw new Error(`取源文件失败：${r.status}`);
        await writeClipboard(await build(await r.text(), base));
        btn.innerHTML = ICON_DONE;
        btn.title = "已复制";
      } catch (e) {
        btn.title = "复制失败：" + e.message;
      }
      setTimeout(() => { btn.innerHTML = ICON_COPY; btn.title = "复制本页 Markdown 源"; }, 1500);
    });
    inner.prepend(btn);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
