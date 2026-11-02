#!/usr/bin/env node
/*
 * DeepTutor 仿真 demo 的检查：不开浏览器，靠代码核。
 * 只在改 docs/projects/deeptutor/assets/demos/ 时跑。
 *
 *   node scripts/check-deeptutor-demos.mjs [--locale <DeepTutor>/web/locales/zh/app.json] [--skip-embed] [--only name]
 *
 * 核的东西：
 *   1. 文件齐：三个共用件 + 每个 demo 一个 html
 *   2. head 契约：lang/class、charset、title、dt-height、五个 script 的顺序、样式链接；
 *      src/href 不准指外网，根绝对路径要落在 docs/ 里，相对路径要落在同目录
 *   3. 每段 <script> 和共用 js 过语法
 *   4. 在 vm 沙箱里真加载 /vendor 的 React 18 UMD 和 htm，跑共用件和 demo 脚本，拿到时间线
 *   5. 时间线：只认已知的键，at ≥ 0，label 不重复，估一圈多长
 *   6. 按时间线把每一步的状态算出来，每一步都用 React 的函数组件真渲染一遍元素树
 *      （hooks 打桩，不进 DOM）：抓渲染时抛的错、找不到的图标；
 *      渲染出来的每个 class 都要在 dt-base.css 或 demo 自己的 <style> 里有定义；
 *      scroll 步骤的容器和目标要在那一刻的树里找得到
 *   7. htm 模板标签配平；不准写 className=
 *   8. 嵌入：每个 demo 在 docs/projects/deeptutor/*.md 里恰好嵌一次，iframe 高度等于 dt-height，
 *      同页折叠引它的源码；三个共用件在项目目录里恰好各被引一次（--skip-embed 跳过）
 *   9. --locale：demo 里 T 的值要和 DeepTutor 的中文语言包一致，语言包里没有的键只警告
 *
 * 画出来好不好看，这里核不了，要在浏览器里看。
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const wikiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = path.join(wikiRoot, "docs");
const projectDir = path.join(docsRoot, "projects/deeptutor");
const demoDir = path.join(projectDir, "assets/demos");
const SHARED = ["dt-base.css", "dt-runtime.js", "dt-data.js"];
const VENDOR = ["/vendor/react.production.min.js", "/vendor/react-dom.production.min.js", "/vendor/htm.umd.js"];

const args = process.argv.slice(2);
const argVal = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const localePath = argVal("--locale");
const only = argVal("--only");
const skipEmbed = args.includes("--skip-embed");

const failures = [];
const warnings = [];
const fail = (file, msg) => failures.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

/* ─── 1. 清点 ─── */
for (const f of SHARED) if (!fs.existsSync(path.join(demoDir, f))) fail(f, "共用件不存在");
const demos = fs
  .readdirSync(demoDir)
  .filter((n) => n.endsWith(".html"))
  .filter((n) => !only || n === only || n === only + ".html")
  .sort();
if (!demos.length) fail("demos", "一个 demo 都没有");

const baseCss = fs.readFileSync(path.join(demoDir, "dt-base.css"), "utf8");
const runtimeSrc = fs.readFileSync(path.join(demoDir, "dt-runtime.js"), "utf8");
const dataSrc = fs.readFileSync(path.join(demoDir, "dt-data.js"), "utf8");
for (const [name, src] of [["dt-runtime.js", runtimeSrc], ["dt-data.js", dataSrc]]) {
  try {
    new vm.Script(src, { filename: name });
  } catch (e) {
    fail(name, "语法错误 " + e.message);
  }
}

function cssClasses(css) {
  const out = new Set();
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/url\([^)]*\)/g, "");
  // 只看选择器部分：去掉 { … } 里的声明
  let depth = 0;
  let sel = "";
  for (const ch of clean) {
    if (ch === "{") {
      for (const m of sel.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) out.add(m[1]);
      sel = "";
      depth++;
    } else if (ch === "}") {
      depth--;
      sel = "";
    } else if (ch === ";" ) {
      sel = "";
    } else sel += ch;
  }
  return out;
}
const baseClasses = cssClasses(baseCss);

const locale = localePath ? JSON.parse(fs.readFileSync(localePath, "utf8")) : null;

/* ─── 沙箱 ─── */
const vendorCode = Object.fromEntries(
  VENDOR.filter((v) => !v.includes("react-dom")).map((v) => [v, fs.readFileSync(path.join(docsRoot, v), "utf8")])
);

function makeSandbox() {
  const noop = () => {};
  const fakeEl = { addEventListener: noop, removeEventListener: noop, querySelectorAll: () => [], querySelector: () => null };
  const ctx = {
    console,
    Intl,
    Math,
    JSON,
    Date,
    Promise,
    setTimeout: noop,
    clearTimeout: noop,
    setInterval: () => 0,
    clearInterval: noop,
    requestAnimationFrame: noop,
    performance: { now: () => 0 },
    location: { search: "" },
    navigator: { userAgent: "node" },
    matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
    IntersectionObserver: class {
      observe() {}
      disconnect() {}
    },
    document: Object.assign({}, fakeEl, {
      visibilityState: "visible",
      getElementById: () => fakeEl,
      body: fakeEl,
      documentElement: fakeEl,
      createElement: () => Object.assign({ style: {}, setAttribute: noop, appendChild: noop }, fakeEl),
    }),
    __DT_CHECK: true,
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const code of Object.values(vendorCode)) vm.runInContext(code, ctx);
  ctx.ReactDOM = { createRoot: () => ({ render: noop }) };
  return ctx;
}

/* ─── 无 DOM 渲染：真调函数组件，hooks 打桩 ─── */
function renderTree(ctx, element) {
  const React = ctx.React;
  const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  const dispatcher = {
    useState: (init) => [typeof init === "function" ? init() : init, () => {}],
    useReducer: (r, init, f) => [f ? f(init) : init, () => {}],
    useRef: (v) => ({ current: v === undefined ? null : v }),
    useEffect: () => {},
    useLayoutEffect: () => {},
    useInsertionEffect: () => {},
    useMemo: (f) => f(),
    useCallback: (f) => f,
    useContext: (c) => c._currentValue,
    useId: () => ":r0:",
    useImperativeHandle: () => {},
    useDebugValue: () => {},
    useDeferredValue: (v) => v,
    useTransition: () => [false, (f) => f()],
    useSyncExternalStore: (s, g) => g(),
  };
  const nodes = [];
  const prev = internals.ReactCurrentDispatcher.current;
  internals.ReactCurrentDispatcher.current = dispatcher;
  function walk(el, parent) {
    if (el === null || el === undefined || el === false || el === true) return;
    if (Array.isArray(el)) return el.forEach((c) => walk(c, parent));
    if (typeof el === "string" || typeof el === "number") {
      parent.text.push(String(el));
      return;
    }
    if (typeof el !== "object" || !el.$$typeof) throw new Error("渲染出了不是元素的东西：" + String(el).slice(0, 60));
    const { type, props } = el;
    if (typeof type === "function") return walk(type(props || {}), parent);
    if (typeof type === "object" && type && type.render) return walk(type.render(props || {}, null), parent);
    if (typeof type === "object" && type && type.type) return walk({ ...el, type: type.type }, parent);
    if (typeof type === "symbol") return walk(props && props.children, parent);
    if (typeof type === "string") {
      const node = { tag: type, attrs: props || {}, children: [], text: [], parent };
      parent.children.push(node);
      nodes.push(node);
      if (props && props.className !== undefined) throw new Error("<" + type + "> 用了 className，htm 里写 class");
      walk(props && props.children, node);
      return;
    }
    throw new Error("不认识的元素类型 " + String(type));
  }
  const root = { tag: "#root", attrs: {}, children: [], text: [], parent: null };
  try {
    walk(element, root);
  } finally {
    internals.ReactCurrentDispatcher.current = prev;
  }
  return { root, nodes };
}

function classList(node) {
  const c = node.attrs.class;
  if (typeof c !== "string") return [];
  return c.split(/\s+/).filter(Boolean);
}

/* 极小的选择器：tag、#id、.class、[attr]、[attr="v"]，空格是后代 */
function parseCompound(s) {
  const out = { tag: null, id: null, classes: [], attrs: [] };
  const re = /([a-zA-Z][\w-]*)|#([\w-]+)|\.([\w-]+)|\[([\w-]+)(?:=["']?([^"'\]]*)["']?)?\]/g;
  let m;
  let consumed = "";
  while ((m = re.exec(s))) {
    consumed += m[0];
    if (m[1]) out.tag = m[1];
    else if (m[2]) out.id = m[2];
    else if (m[3]) out.classes.push(m[3]);
    else if (m[4]) out.attrs.push([m[4], m[5]]);
  }
  if (consumed.length !== s.length) throw new Error("选择器超出检查脚本能认的范围：" + s);
  return out;
}
function matchCompound(node, c) {
  if (c.tag && node.tag !== c.tag) return false;
  if (c.id && node.attrs.id !== c.id) return false;
  const cl = classList(node);
  if (c.classes.some((k) => !cl.includes(k))) return false;
  for (const [k, v] of c.attrs) {
    const val = node.attrs[k];
    if (val === undefined || val === null || val === false) return false;
    if (v !== undefined && String(val) !== v) return false;
  }
  return true;
}
function querySelectorAll(scopeNodes, sel) {
  const parts = sel.trim().split(/\s+/).map(parseCompound);
  return scopeNodes.filter((n) => {
    if (!matchCompound(n, parts[parts.length - 1])) return false;
    let i = parts.length - 2;
    let p = n.parent;
    while (i >= 0 && p) {
      if (p.tag !== "#root" && matchCompound(p, parts[i])) i--;
      p = p.parent;
    }
    return i < 0;
  });
}
function descendants(node) {
  const out = [];
  (function rec(n) {
    for (const c of n.children) {
      out.push(c);
      rec(c);
    }
  })(node);
  return out;
}

/* ─── htm 模板配平 ─── */
const VOID = new Set(["br", "hr", "img", "input", "meta", "link", "source", "col", "area", "wbr"]);
function lintHtm(src, file) {
  let i = 0;
  while ((i = src.indexOf("html`", i)) >= 0) {
    const start = i + 5;
    let j = start;
    let depth = 0;
    let out = "";
    while (j < src.length) {
      const ch = src[j];
      if (depth === 0 && ch === "`") break;
      if (depth === 0 && ch === "$" && src[j + 1] === "{") {
        depth = 1;
        out += "§";
        j += 2;
        // 跳过 ${ … }，里面可能有嵌套模板和字符串
        let inStr = null;
        let tpl = 0;
        while (j < src.length && depth > 0) {
          const c = src[j];
          if (inStr) {
            if (c === "\\") j++;
            else if (c === inStr) inStr = null;
          } else if (tpl > 0) {
            if (c === "`") tpl--;
            else if (c === "\\") j++;
          } else if (c === "'" || c === '"') inStr = c;
          else if (c === "`") tpl++;
          else if (c === "{") depth++;
          else if (c === "}") depth--;
          j++;
        }
        continue;
      }
      out += ch;
      j++;
    }
    const line = src.slice(0, i).split("\n").length;
    const stack = [];
    const tagRe = /<(\/?)(§|[a-zA-Z][\w.-]*|\/)?([^<>]*?)(\/?)>/g;
    let m;
    while ((m = tagRe.exec(out))) {
      const [, close, name0, , selfClose] = m;
      if (m[0].startsWith("<!--")) continue;
      if (m[0] === "<//>") {
        if (!stack.length) fail(file, `第 ${line} 行起的模板：多出一个 <//>`);
        else stack.pop();
        continue;
      }
      const name = name0 || "";
      if (close) {
        const top = stack.pop();
        if (top === undefined) fail(file, `第 ${line} 行起的模板：多出 </${name}>`);
        else if (top !== name && top !== "§") fail(file, `第 ${line} 行起的模板：<${top}> 被 </${name}> 关上`);
        continue;
      }
      if (selfClose || VOID.has(name.toLowerCase())) continue;
      stack.push(name);
    }
    if (stack.length) fail(file, `第 ${line} 行起的模板：没关上 ${stack.map((s) => "<" + s + ">").join(" ")}`);
    // 从模板开头往后接着找：嵌在 ${ … } 里的模板也要各自配平
    i = start;
  }
  const cn = src.match(/className=/g);
  if (cn) fail(file, "htm 模板里写了 className=，改成 class=");
}

/* ─── 嵌入 ─── */
const projectMds = fs.existsSync(projectDir)
  ? fs.readdirSync(projectDir).filter((n) => n.endsWith(".md")).map((n) => [n, fs.readFileSync(path.join(projectDir, n), "utf8")])
  : [];

if (!skipEmbed) {
  for (const f of SHARED) {
    const ref = `--8<-- "projects/deeptutor/assets/demos/${f}"`;
    const count = projectMds.reduce((a, [, s]) => a + s.split(ref).length - 1, 0);
    if (count !== 1) fail(f, `共用件应在项目页里折叠引一次，实际 ${count} 次`);
  }
}

/* ─── 逐个 demo ─── */
const summary = [];
for (const file of demos) {
  const full = path.join(demoDir, file);
  const src = fs.readFileSync(full, "utf8");

  // 2. head 契约
  if (!/<html lang="zh" class="theme-snow">/.test(src)) fail(file, '要写 <html lang="zh" class="theme-snow">');
  if (!/<meta charset="utf-8">/.test(src)) fail(file, "缺 <meta charset>");
  if (!/<title>[^<]+<\/title>/.test(src)) fail(file, "缺 <title>");
  const hm = src.match(/<meta name="dt-height" content="(\d+)">/);
  const height = hm ? Number(hm[1]) : null;
  if (!height) fail(file, '缺 <meta name="dt-height" content="数字">');
  if (!/<link rel="stylesheet" href="dt-base.css">/.test(src)) fail(file, "没引 dt-base.css");
  const scripts = [...src.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  const want = [...VENDOR, "dt-runtime.js", "dt-data.js"];
  const extra = scripts.slice(want.length);
  if (JSON.stringify(scripts.slice(0, want.length)) !== JSON.stringify(want))
    fail(file, "script 顺序应为 " + want.join(" → ") + "，实际 " + scripts.join(" → "));
  for (const m of src.matchAll(/\s(?:src|href)=["']([^"']+)["']/g)) {
    const ref = m[1];
    if (/^(https?:)?\/\//.test(ref)) fail(file, "引了外网 " + ref);
    else if (ref.startsWith("#") || ref.startsWith("data:")) continue;
    else if (ref.startsWith("/")) {
      if (!fs.existsSync(path.join(docsRoot, ref))) fail(file, "根路径不存在 " + ref);
    } else if (!fs.existsSync(path.join(demoDir, ref))) fail(file, "相对路径不存在 " + ref);
  }
  for (const e of extra) if (!e.startsWith("/vendor/")) fail(file, "额外的 script 只准来自 /vendor/：" + e);
  const ids = [...src.matchAll(/\sid="([^"$]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((x, k) => ids.indexOf(x) !== k);
  if (dup.length) fail(file, "id 重复 " + [...new Set(dup)].join(", "));

  // 3. 语法
  const inline = [...src.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (inline.length !== 1) fail(file, `应恰有一段内联 <script>，实际 ${inline.length}`);
  const styles = [...src.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
  const known = new Set([...baseClasses, ...cssClasses(styles)]);
  let ok = true;
  for (const code of inline) {
    try {
      new vm.Script(code, { filename: file });
    } catch (e) {
      fail(file, "语法错误 " + e.message);
      ok = false;
    }
  }
  if (!ok || !inline.length) continue;

  // 7. htm
  lintHtm(inline[0], file);
  lintHtm(runtimeSrc, "dt-runtime.js");

  // 4. 沙箱执行
  let ctx;
  try {
    ctx = makeSandbox();
    // 图表库不在沙箱里跑（它们一加载就摸 DOM），换成桩；demo 只能在 useEffect 里调它们，检查时不会走到
    if (extra.some((e) => e.includes("chart"))) ctx.Chart = function Chart() { return { destroy() {}, update() {} }; };
    if (extra.some((e) => e.includes("mermaid"))) ctx.mermaid = { initialize() {}, render: async () => ({ svg: "" }), run: async () => {} };
    if (extra.some((e) => e.includes("echarts"))) ctx.echarts = { init: () => ({ setOption() {}, dispose() {}, resize() {} }) };
    vm.runInContext(runtimeSrc, ctx, { filename: "dt-runtime.js" });
    vm.runInContext(dataSrc, ctx, { filename: "dt-data.js" });
    vm.runInContext(inline[0], ctx, { filename: file });
  } catch (e) {
    fail(file, "沙箱里执行出错 " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join(" | ") : e));
    continue;
  }
  const demo = ctx.__DT_DEMO;
  if (!demo || typeof demo.render !== "function") {
    fail(file, "没有调用 DT.run({ … render })");
    continue;
  }
  const { initial, steps, options } = demo;
  const T = ctx.__DT_T || {};

  // 5. 时间线
  const labels = new Set();
  let est = 0;
  const known_keys = new Set(ctx.DT.STEP_KEYS);
  const seenKeys = new Set(Object.keys(initial || {}));
  steps.forEach((st, k) => {
    for (const key of Object.keys(st)) if (!known_keys.has(key)) fail(file, `第 ${k} 步有不认识的键 ${key}`);
    if (st.at !== undefined && !(typeof st.at === "number" && st.at >= 0)) fail(file, `第 ${k} 步 at 不是非负数`);
    if (st.label) {
      if (labels.has(st.label)) fail(file, `label 重复 ${st.label}`);
      labels.add(st.label);
    }
    est += st.at || 0;
    const sp = st.type || st.stream;
    if (sp) {
      if (!sp.key || typeof sp.text !== "string" || !sp.text) fail(file, `第 ${k} 步 type/stream 缺 key 或 text`);
      if (!seenKeys.has(sp.key)) fail(file, `第 ${k} 步往 ${sp.key} 里写字，但 initial 里没有这个键`);
      const n = ctx.DT.graphemes(sp.text).length;
      est += st.type ? (n * 1000) / (sp.cps || 18) : (n / 2.5) * 32;
    }
    if (st.set && typeof st.set === "object") Object.keys(st.set).forEach((x) => seenKeys.add(x));
    if (st.scroll) est += st.scroll.ms || 420;
  });
  const loopDelay = (options && options.loopDelay) || 2500;
  const total = (est + loopDelay) / 1000;
  if (total > 50) fail(file, `一圈约 ${total.toFixed(1)}s，太长（上限 50s）`);
  if (total < 6) fail(file, `一圈约 ${total.toFixed(1)}s，太短`);

  // 6. 每一步渲染一遍
  const tlStub = { playing: true, index: 0, round: 0, total: steps.length, labels: [], replay() {}, pause() {}, play() {} };
  let state = Object.assign({}, initial);
  const usedClasses = new Set();
  const allText = [];
  let renders = 0;
  let renderErrors = 0;
  const DT = ctx.DT;
  const renderAt = (s, k) => {
    try {
      // 和浏览器里一样，render 在一个组件里调，render 本身也能用 hook
      const tl = Object.assign({}, tlStub, { index: k });
      const el = ctx.React.createElement(function DemoRoot() {
        return demo.render(s, tl);
      });
      const out = renderTree(ctx, el);
      renders++;
      for (const n of out.nodes) for (const c of classList(n)) usedClasses.add(c);
      for (const n of out.nodes) allText.push(n.text.join(""));
      return out;
    } catch (e) {
      renderErrors++;
      if (renderErrors <= 3)
        fail(file, `第 ${k} 步${steps[k - 1] && steps[k - 1].label ? "（" + steps[k - 1].label + " 之后）" : ""}渲染出错：${e && e.message}`);
      else if (renderErrors === 4) fail(file, "后面还有渲染错误，先修上面几条");
      return null;
    }
  };
  let tree = renderAt(state, 0);
  for (let k = 0; k < steps.length; k++) {
    const st = steps[k];
    if (st.scroll && tree) {
      const boxes = querySelectorAll(tree.nodes, st.scroll.sel);
      if (!boxes.length) fail(file, `第 ${k} 步滚动容器 ${st.scroll.sel} 在那一刻的界面里找不到`);
      else if (!boxes[0].attrs["data-dt-scroll"] && boxes[0].attrs["data-dt-scroll"] !== "")
        warn(file, `第 ${k} 步滚动容器 ${st.scroll.sel} 没标 data-dt-scroll，重播时不会回到顶部`);
      if (st.scroll.to && boxes.length) {
        let hit = [];
        try {
          hit = querySelectorAll(descendants(boxes[0]), st.scroll.to);
        } catch (e) {
          fail(file, e.message);
        }
        if (!hit.length) fail(file, `第 ${k} 步滚动目标 ${st.scroll.to} 不在 ${st.scroll.sel} 里`);
      }
    }
    try {
      state = DT.applyInstant(state, st);
    } catch (e) {
      fail(file, `第 ${k} 步算状态出错：${e.message}`);
      break;
    }
    if (st.set || st.type || st.stream || st.advance) tree = renderAt(state, k + 1) || tree;
    // 吐字吐到一半的样子也要渲染得出来
    const sp = st.type || st.stream;
    if (sp && sp.text.length > 6) {
      const half = Object.assign({}, state, { [sp.key]: (sp.append ? "" : "") + sp.text.slice(0, Math.floor(sp.text.length / 2)) });
      renderAt(half, k + 1);
    }
  }

  for (const c of usedClasses) if (!known.has(c) && !c.startsWith("js-")) fail(file, `class「${c}」在 dt-base.css 和本页 <style> 里都没有定义`);

  // 9. 文案
  if (locale) {
    let missing = 0;
    for (const [k, v] of Object.entries(T)) {
      if (!(k in locale)) {
        missing++;
        continue;
      }
      if (locale[k] !== v) fail(file, `T["${k}"] 是「${v}」，语言包里是「${locale[k]}」`);
    }
    if (missing) warn(file, `T 里有 ${missing} 个键语言包里没有（上游写在代码里的 { zh, en } 对象，或演示自拟）`);
  }

  // 8. 嵌入
  if (!skipEmbed) {
    const iframeRe = new RegExp(`<iframe src="/projects/deeptutor/assets/demos/${file.replace(/\./g, "\\.")}"[^>]*>`, "g");
    const hits = projectMds.flatMap(([n, s]) => [...s.matchAll(iframeRe)].map((m) => [n, m[0], s]));
    if (hits.length !== 1) fail(file, `应在项目页里恰好嵌一次，实际 ${hits.length} 次`);
    else {
      const [mdName, tag, mdSrc] = hits[0];
      const h = tag.match(/height:(\d+)px/);
      if (!h || Number(h[1]) !== height) fail(file, `${mdName} 里 iframe 高 ${h ? h[1] : "?"}，dt-height 是 ${height}`);
      if (!/loading="lazy"/.test(tag)) fail(file, `${mdName} 里的 iframe 没写 loading="lazy"`);
      if (!/title="[^"]+"/.test(tag)) fail(file, `${mdName} 里的 iframe 没写 title`);
      if (!mdSrc.includes(`--8<-- "projects/deeptutor/assets/demos/${file}"`)) fail(file, `${mdName} 没有折叠引它的源码`);
    }
  }

  summary.push(`  ${file.padEnd(26)} ${String(steps.length).padStart(3)} 步  一圈约 ${total.toFixed(1).padStart(4)}s  渲染 ${renders} 次  class ${usedClasses.size} 个  高 ${height}`);
}

console.log(`检查了 ${demos.length} 个 demo：`);
for (const l of summary) console.log(l);
if (warnings.length) {
  console.log(`\n警告 ${warnings.length} 条：`);
  for (const w of warnings) console.log("  - " + w);
}
if (failures.length) {
  console.log(`\n失败 ${failures.length} 条：`);
  for (const f of failures) console.log("  - " + f);
  process.exit(1);
}
console.log("\n全部通过。");
