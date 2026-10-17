// 「复制本页 Markdown」按钮：复制的是这一页的 .md 源文件本身，不是从 HTML 转回来的版本——
// 源文件由 AI 写、给 AI 读，原样最好（为什么不用官方 llmstxt 插件、原理和测试，见 posts/wiki-tech/md-copy.md）。
// 源文件地址由 overrides/main.html 写进页头 <link rel="alternate" type="text/markdown">，取自 page.edit_url
// （mkdocs.yml 的 edit_uri 指向站点根，edit_url 就等于源文件地址）。取文件时只用它的路径、按当前站点去拿，
// 本地预览也能用（zensical serve 不出源文件，要先把 .md 镜像进 site/）；改写链接时用它的原始地址，复制出去的链接都指向线上。
// 复制前做这几件事，让贴进对话框的文字自成一体、只剩正文：
//   - 代码块以外的相对链接、图片、HTML 的 src/href 改成绝对地址；代码块和行内代码里举例写的链接不动
//   - --8<-- "路径" 改成真身的绝对地址：先按站点根找（snippet 的 base_path 先 docs），找不到就指向 GitHub 仓库
//   - 去掉 frontmatter：description 之类是给站点用的，粘进对话框是噪音；也不加来源注释
//   - 去掉 <div class="zx-no-copy" markdown> … </div> 整块：维护记录之类，网页上照常显示、读 .md 源的 AI
//     也看得到，只是不进对话框；块里嵌套的 div 按层数配对，代码块里写的不算
//   - 去掉代码以外的 HTML 注释：网页上本来就不显示，对话框里也不要；去掉后留下的连续空行并成一行
//   - 正文里手写的 <input>、<textarea>、<select> 是填空：读者在网页上就地填，复制时标签换成填的值（下拉框取
//     选中项的文字），原样嵌入、不参与链接改写；空着的写成【placeholder】；写了 required 的没填就不复制。
//     网页上第 n 个控件对应源文件代码以外第 n 个标签，数量对不上就报错不复制；标签要写在一行里，单选、复选不算。
//     name 相同的是同一个变量：在一个框里填，别的同名框跟着变
// 打码的密文原样复制，页面上解锁过也一样。页头没有那行 link 就不出按钮。
(function () {
  const REPO = "https://github.com/liuhetian/wiki/blob/main/";
  const SVG = d => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${d}"/></svg>`;
  const ICON_COPY = SVG("M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12V1Z");
  const ICON_DONE = SVG("M21 7 9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59 21 7Z");
  const KEEP = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/|<)/i;        // 已带协议、页内锚点、协议相对、<…> 包着的：不动
  const SNIPPET = /^(\s*)--8<--\s+(["'])(.+?)\2\s*$/;
  const NO_COPY = /^\s*<div\b[^>]*\bclass="[^"]*\bzx-no-copy\b/;
  const divDepth = line => (line.match(/<div\b/gi) || []).length - (line.match(/<\/div>/gi) || []).length;
  const FIELD = /<textarea\b[^>]*>.*?<\/textarea>|<select\b[^>]*>.*?<\/select>|<input\b[^>]*>/gi;
  const NOT_FIELD = /^<input\b[^>]*\btype=["']?(?:radio|checkbox|hidden)\b/i;
  const FIELD_SEL = "input:not([type=radio]):not([type=checkbox]):not([type=hidden]), textarea, select"; // 选项卡底下是隐藏的 radio
  const MARK = "\u0000";

  const abs =(target, base) => (!target || KEEP.test(target) ? target : new URL(target, base).href);

  // 代码块以外的一行：跳过行内代码，改写 [x](y)、![x](y)、[x]: y 和 HTML 的 src/href
  function rewriteLine(line, base) {
    if (/^\s*\[(?!\^)[^\]]+\]:\s*\S/.test(line))            // 链接定义；[^1]: 是脚注，不算
      return line.replace(/^(\s*\[[^\]]+\]:\s*)(\S+)/, (_, head, t) => head + abs(t, base));
    return line.split(/(`[^`]*`)/).map((part, i) => i % 2 ? part : part
      .replace(/(\]\()([^)\s]+)/g, (_, head, t) => head + abs(t, base))
      .replace(/\b(src|href)="([^"]+)"/g, (_, attr, t) => `${attr}="${abs(t, base)}"`)
    ).join("");
  }

  // 代码块以外的一行：填空控件的标签换成记号 \0序号\0，序号就是它在网页上是第几个控件；行内代码里写的不算
  function markFields(line, seen) {
    return line.split(/(`[^`]*`)/).map((part, i) => i % 2 ? part : part.replace(FIELD, tag =>
      NOT_FIELD.test(tag) ? tag : MARK + seen.n++ + MARK)).join("");
  }

  // 控件里填的值；空着就写成【提示】，粘进对话框一看就知道哪里还空着
  function fieldValue(el) {
    const opt = el.tagName === "SELECT" ? el.selectedOptions[0] : null;
    const value = opt ? opt.value && opt.text : el.value;
    return value && value.trim() ? value : `【${(opt ? opt.text : el.placeholder) || ""}】`;
  }

  async function snippetUrl(path, base) {
    const site = new URL(path, new URL("/", base)).href;
    try {
      const r = await fetch(new URL(new URL(site).pathname, location.origin), { method: "HEAD" });
      if (r.ok) return site;
    } catch (e) { /* 取不到就当不在站上 */ }
    return REPO + path;
  }

  // 去掉一行里代码以外的 HTML 注释，行内代码原样跳过；注释跨行时 state.open 记着还没收尾
  function stripComments(line, state) {
    let res = "", i = 0;
    while (i < line.length) {
      if (state.open) {
        const e = line.indexOf("-->", i);
        if (e < 0) return res;
        state.open = false;
        i = e + 3;
        continue;
      }
      const code = line[i] === "`" && line.slice(i).match(/^(`+).*?[^`]\1(?!`)/);
      if (code) { res += code[0]; i += code[0].length; continue; }
      if (line.startsWith("<!--", i)) { state.open = true; i += 4; continue; }
      res += line[i++];
    }
    return res;
  }

  async function build(source, base, fields) {
    let lines = source.split("\n");
    const fm = lines[0] === "---" ? lines.indexOf("---", 1) : -1;
    if (fm > 0) lines = lines.slice(fm + 1);                // 去掉 frontmatter
    let fence = null;                                       // { ch, len }：当前所在代码块的围栏
    const comment = { open: false };
    let skip = 0;                                           // 在 zx-no-copy 块里时：还没配上 </div> 的层数
    const seen = { n: 0 };                                  // 数到第几个填空控件
    const jobs = [];
    const out = lines.map((line, i) => {
      if (!fence && (comment.open || line.includes("<!--"))) {
        const rest = stripComments(line, comment);
        if (!rest.trim()) return null;                      // 整行都是注释：删掉这行
        line = rest;
      }
      const m = line.match(/^\s*(`{3,}|~{3,})/);
      if (m) {
        if (!fence) fence = { ch: m[1][0], len: m[1].length };
        else if (m[1][0] === fence.ch && m[1].length >= fence.len && /^\s*[`~]+\s*$/.test(line)) fence = null;
        return skip ? null : line;
      }
      if (skip) {
        if (!fence) {
          skip += divDepth(line);
          markFields(line, seen);                           // 块里的控件网页上也有，照样占序号
        }
        return null;
      }
      if (!fence && NO_COPY.test(line)) {
        skip = Math.max(divDepth(line), 0);
        return null;
      }
      const s = line.match(SNIPPET);
      if (s) {
        jobs.push(snippetUrl(s[3], base).then(u => { out[i] = `${s[1]}--8<-- "${u}"`; }));
        return line;
      }
      return fence ? line : rewriteLine(markFields(line, seen), base);
    });
    if (seen.n !== fields.length)
      throw new Error(`填空对不上：源文件 ${seen.n} 个，网页上 ${fields.length} 个`);
    await Promise.all(jobs);
    // 删掉的 frontmatter、注释、zx-no-copy 块会留下空行：开头的空行不要，删过东西的地方连着的空行只留一行
    const kept = [];
    let gap = true;
    for (const line of out) {
      if (line === null) { gap = true; continue; }
      if (!line.trim() && gap && !(kept.length && kept[kept.length - 1].trim())) continue;
      if (line.trim()) gap = false;
      kept.push(line);
    }
    return kept.join("\n").replace(new RegExp(`${MARK}(\\d+)${MARK}`, "g"), (_, i) => fieldValue(fields[i]));
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
      const fields = [...inner.querySelectorAll(FIELD_SEL)];
      const missing = fields.find(el => !el.checkValidity());
      if (missing) {                                        // required 没填：不复制，展开折叠块、用浏览器的气泡指过去
        for (let d = missing.closest("details"); d; d = d.parentElement.closest("details")) d.open = true;
        missing.reportValidity();
        return;
      }
      try {
        const r = await fetch(fetchUrl);
        if (!r.ok) throw new Error(`取源文件失败：${r.status}`);
        if ((r.headers.get("content-type") || "").includes("text/html"))  // zensical serve 把 /x.md 路由到网页 /x/
          throw new Error("取到的是网页不是源文件：本地预览要先把 .md 镜像进 site/");
        await writeClipboard(await build(await r.text(), base, fields));
        btn.innerHTML = ICON_DONE;
        btn.title = "已复制";
      } catch (e) {
        btn.title = "复制失败：" + e.message;
      }
      setTimeout(() => { btn.innerHTML = ICON_COPY; btn.title = "复制本页 Markdown 源"; }, 1500);
    });
    inner.prepend(btn);

    // 同名的填空是同一个变量：在一个框里填，别的同名框同步；只挂一个监听，不扫页面
    inner.addEventListener("input", e => {
      const el = e.target;
      if (!el.name || !el.matches(FIELD_SEL)) return;
      for (const other of inner.querySelectorAll(FIELD_SEL))
        if (other !== el && other.name === el.name) other.value = el.value;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
