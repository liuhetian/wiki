// 全站打码：源文件里写的就是 age 密文，浏览器里显示成马赛克，解锁后就地还原。
// 两种写法（规矩见 skills/wiki-guide/mkdocs-wiki/index.md 的「打码」一节）：
//   - 小字：反引号里写 `age:<整个 age 文件的 base64>`，行内代码和代码块里都认（scripts/age-seal.sh 生成）
//   - 大段：```age 代码块里放 age -a 的 armor 文本，superfences 输出为 <pre class="age"><code>…</code></pre>
// 密文都是用 wiki 专用公钥加密的（age -r）。解锁框认两种输入：
//   - AGE-SECRET-KEY-1… 开头：当私钥直接用
//   - 其他：当口令，先解开下面内嵌的 WIKI_KEY_AGE（用口令锁住的 wiki 私钥，跑一次 scrypt）
// 解开的私钥存进 sessionStorage，同一个标签页里翻到别的页面自动还原，关掉标签页就忘；
// 右下角「锁上」清掉它。页面上没有密文就直接返回，不加载 age-core.js。
(function () {
  // 前缀是「age-encryption.org/v1」的 base64，普通文字里的 usage: 之类不会误伤
  const TOKEN = /age:YWdlLWVuY3J5cHRpb24ub3JnL3Yx[A-Za-z0-9+/]*={0,2}/g;
  const STORE = "age-wiki-identity";
  const MOSAIC = "▒▒▒▒▒▒▒▒";                              // 固定长度，不暴露明文多长

  // 用口令锁住的 wiki 私钥（age -p -a）。换钥匙对时整段替换，同时改 scripts/age-seal.sh 里的公钥
  const WIKI_KEY_AGE = `-----BEGIN AGE ENCRYPTED FILE-----
YWdlLWVuY3J5cHRpb24ub3JnL3YxCi0+IHNjcnlwdCBaSGpYY21jQUpIaTgvczJz
UzJ1RkRBIDE4ClNRaGdOVEszTVk0bVRkdVBiRmF2cnIyVmMwS2NlMjdSTlk0bXBK
N20vUFEKLS0tIHJIU1ZZZ0l5RnZLNFZTWW5ZM2FWQmJqL1FCeDNFUVk0d1p6Tm1U
OG13UzgKFkIXemS07QhXSJjqXQ4E5d+A6jq0rCIZrdk7bjGHEZ66NLNq1Ey6rA4v
R/odlXlx/piSQFxdFvi7obZe8Wkx4IeoiK4NQqPVlMvoUDUhe7sn3WQjsU8Xxva7
t9bv/SyWYfWjvJLnzJBPP4vXJmt9vB/iGszFYKNByWwqNsdK4sLgs7fJg76YLMb7
pw0glpBLtnv1PHQt20HEreCWRSzNYaROwcnNt4BmLDv+xYoNEGWdfBmjrXjFPLYS
1mb9Gb5L8GZEAo6Gj4RdAZns0RBgW6iLOmfVKYiPdx9xX7o=
-----END AGE ENCRYPTED FILE-----`;

  const items = [];                                       // { el, token? , armor?, block }
  let dialog = null;

  // ---------- 扫描：把密文换成马赛克 ----------
  function mosaic(tag, block) {
    const el = document.createElement(tag);
    el.className = "age-mosaic" + (block ? " age-mosaic--block" : "");
    el.textContent = block ? "🔒 加密内容，点击解锁" : MOSAIC;
    el.title = "加密内容，点击解锁";
    el.setAttribute("role", "button");
    el.tabIndex = 0;
    el.addEventListener("click", onMosaicClick);
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onMosaicClick(); } });
    return el;
  }

  // 代码块被 Pygments 拆成了很多个 span，一段密文可能横跨好几个文字节点：
  // 先把文字节点拼起来找位置，再用 Range 跨节点删掉、塞进马赛克
  function scanCode(code) {
    const nodes = [];
    let text = "";
    const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode()); ) { nodes.push({ node: n, start: text.length }); text += n.data; }
    const locate = pos => {
      for (let i = nodes.length - 1; i >= 0; i--) if (nodes[i].start <= pos) return [nodes[i].node, pos - nodes[i].start];
    };
    const matches = [...text.matchAll(TOKEN)].reverse();  // 从后往前换，前面的偏移不受影响
    for (const m of matches) {
      const range = document.createRange();
      range.setStart(...locate(m.index));
      range.setEnd(...locate(m.index + m[0].length));
      range.deleteContents();
      const el = mosaic("span", false);
      range.insertNode(el);
      items.push({ el, token: m[0], block: false });
    }
  }

  function scan() {
    document.querySelectorAll(".md-typeset pre.age").forEach(pre => {
      const el = mosaic("div", true);
      items.push({ el, armor: pre.textContent, block: true });
      pre.replaceWith(el);
    });
    document.querySelectorAll(".md-typeset code").forEach(code => {
      if (code.textContent.includes("age:YWdl")) scanCode(code);
    });
  }

  // ---------- 解密 ----------
  function loadCore() {
    if (globalThis.AgeCore) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "/vendor/age-core.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("age-core.js 加载失败"));
      document.head.appendChild(s);
    });
  }

  // 输入 → 私钥字符串。口令要先解开内嵌的 WIKI_KEY_AGE
  async function toIdentity(input, onProgress) {
    if (AgeCore.isIdentity(input)) { AgeCore.parseIdentity(input); return input.trim(); }
    const { plaintext } = await AgeCore.ageDecrypt(AgeCore.dearmor(WIKI_KEY_AGE), { passphrase: input }, undefined, onProgress);
    return AgeCore.findIdentity(new TextDecoder().decode(plaintext));
  }

  async function revealAll(identityStr) {
    const identity = AgeCore.parseIdentity(identityStr);
    for (const it of items) {
      if (it.done) continue;
      try {
        const file = it.block ? AgeCore.dearmor(it.armor) : AgeCore.decodeToken(it.token);
        const { plaintext } = await AgeCore.ageDecrypt(file, { identity });
        const text = new TextDecoder("utf-8", { fatal: true }).decode(plaintext);
        if (it.block) {
          const pre = document.createElement("pre"), code = document.createElement("code");
          code.textContent = text.replace(/\n$/, "");
          pre.append(code);
          it.el.replaceWith(pre);
        } else {
          it.el.replaceWith(document.createTextNode(text.replace(/\n$/, "")));
        }
        it.done = true;
      } catch (e) {
        it.el.classList.add("age-mosaic--error");
        it.el.title = "解不开：" + e.message;
      }
    }
    showLockButton();
  }

  // ---------- 界面：解锁框、锁上按钮 ----------
  function buildDialog() {
    dialog = document.createElement("dialog");
    dialog.className = "age-unlock";
    dialog.innerHTML = `
      <form method="dialog">
        <p class="age-unlock__title">解锁打码内容</p>
        <input type="password" autocomplete="off" spellcheck="false" placeholder="口令，或粘贴 AGE-SECRET-KEY-1…">
        <p class="age-unlock__status">解锁后，这个标签页里所有页面的打码都会还原；关掉标签页就忘。</p>
        <div class="age-unlock__buttons">
          <button type="button" value="cancel">取消</button>
          <button type="submit" value="ok">解锁</button>
        </div>
      </form>`;
    const input = dialog.querySelector("input"), status = dialog.querySelector(".age-unlock__status");
    const [cancel, ok] = dialog.querySelectorAll("button");
    cancel.onclick = () => dialog.close();
    dialog.querySelector("form").onsubmit = async e => {
      e.preventDefault();
      if (!input.value) return;
      ok.disabled = true;
      status.classList.remove("age-unlock__status--error");
      status.textContent = "解锁中…";
      try {
        await loadCore();
        const id = await toIdentity(input.value, f => (status.textContent = `scrypt 计算中… ${Math.round(f * 100)}%`));
        sessionStorage.setItem(STORE, id);
        input.value = "";
        dialog.close();
        await revealAll(id);
      } catch (err) {
        status.classList.add("age-unlock__status--error");
        status.textContent = "✗ " + (err instanceof RangeError ? "浏览器分不出 scrypt 要的内存" : err.message);
      } finally {
        ok.disabled = false;
      }
    };
    document.body.appendChild(dialog);
  }

  function onMosaicClick() {
    if (sessionStorage.getItem(STORE)) return;            // 已解锁还标红的那段，原因写在 title 里
    if (!dialog) buildDialog();
    dialog.showModal();
    dialog.querySelector("input").focus();
  }

  function showLockButton() {
    if (document.querySelector(".age-lock")) return;
    const btn = document.createElement("button");
    btn.className = "age-lock";
    btn.textContent = "🔒 锁上打码";
    btn.title = "清掉这个标签页记住的私钥，打码内容重新遮住";
    btn.onclick = () => { sessionStorage.removeItem(STORE); location.reload(); };
    document.body.appendChild(btn);
  }

  async function init() {
    scan();
    if (!items.length) return;
    const saved = sessionStorage.getItem(STORE);
    if (!saved) return;
    try {
      await loadCore();
      await revealAll(saved);
    } catch (e) {
      sessionStorage.removeItem(STORE);                   // 存的私钥坏了就忘掉，下次重新解锁
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
