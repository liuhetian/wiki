// ```{.js .run} 代码块的运行器：把 Pygments 高亮好的静态代码块升级成能改、能跑的 playground。
//
// 抓手是 superfences 的属性语法 —— ```{.js .run} 让 zensical 产出
// <div class="language-js run highlight">，Pygments 高亮和右上角的复制按钮（modern 里是
// .md-code__nav，不是 Material 的 .md-clipboard）全都原样保留。这里只在代码块**下方**挂工具条
// 和输出面板，不改代码块自身的 DOM —— 所以「可运行」是纯增量的：脚本挂掉或被拦，页面退化成
// 普通高亮代码块，内容一行不丢。
//
// 为什么执行放 Web Worker 而不是 iframe：
// iframe（srcdoc）在 Chrome 通常与父页共用渲染主线程，读者手抖写个 while(true) 会把整个 wiki
// 页面卡死，连「停止」按钮都点不动，只能强杀标签页。Worker 是独立线程，死循环只烧一个核，
// terminate() 能硬杀 —— TIMEOUT_MS 那道保护只有在 Worker 里才是真的。代价是 Worker 里没有
// document / window / requestAnimationFrame，要摸 DOM 的例子得另走 iframe 通道（未实现，
// 将来给 ```{.js .run .dom} 加分支，届时那类例子要接受「死循环需强杀标签页」）。
//
// 零外部依赖，也不动代码块本身：读者只「运行」，不在页面上改代码。曾做过 textarea 编辑态，
// 实测下来不值得 —— 换成 textarea 就丢了 Pygments 高亮（零依赖下没法重新上色），为一个
// 顺手改两行的场景牺牲整块代码的可读性；真要改，浏览器控制台比这里好用。
(function () {
  "use strict";

  // 从点「运行」开始算的总预算，不随输出刷新。同步死循环、微任务饿死宏任务、setInterval、
  // 永不 resolve 的 await 全靠它收场；代价是合法的长等待（await sleep(10000)）也会被砍。
  var TIMEOUT_MS = 5000;
  var MAX_LINES = 500;     // 输出面板的行数上限，防 for(;;) console.log 把主线程刷爆

  // ---------------------------------------------------------------------------
  // Worker 侧源码。整段以字符串注入 blob，格式保持规整、不压缩 —— 线上有独立 URL，
  // AI 顺 /vendor/js-runner.js 读得到实现。
  //
  // 三件事在这里做，且只能在这里做：
  // 1. 值格式化（inspect）。函数、Symbol、循环引用都过不了 structuredClone，必须在 Worker 内
  //    序列化成字符串再 postMessage，否则 console.log(function(){}) 直接抛 DataCloneError。
  // 2. 行号偏移探测。new Function 把代码包进 "function anonymous(\n) {\n<code>\n}"，栈里的行号
  //    因此比读者看到的多几行。偏移量随引擎实现变，所以运行时探一次而不是写死 2。
  // 3. 顶层 await。代码统一包进 AsyncFunction，await 才能直接写在最外层。
  // ---------------------------------------------------------------------------
  var WORKER_SRC = [
    '"use strict";',
    '',
    'var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;',
    '',
    '// 从栈里取「读者代码」的位置。两处坑：',
    '// 1. V8 的 eval 帧形如 at eval (eval at f (outer:120:10), <anonymous>:3:16) —— 外层位置排在',
    '//    前面、真实位置在后，所以取一帧里的**最后**一组 :行:列，不能拿正则扫到的第一组。',
    '// 2. 引擎之间不一致：Chrome 把 new Function 的代码记成 <anonymous>，行号含包装偏移；',
    '//    Firefox 记成 "... line N > Function"，行号已经是相对函数体的。所以偏移不写死，',
    '//    而是拿同一个提取函数探一次 —— 探测与实际走完全相同的路径，减法后自动对上。',
    'function rawPos(stack) {',
    '  var frames = String(stack || "").split("\\n");',
    '  var fallback = null;',
    '  for (var i = 0; i < frames.length; i++) {',
    '    var all = frames[i].match(/:(\\d+):(\\d+)/g);',
    '    if (!all) continue;',
    '    var m = /:(\\d+):(\\d+)/.exec(all[all.length - 1]);',
    '    var pos = { line: Number(m[1]), col: Number(m[2]) };',
    '    if (frames[i].indexOf("<anonymous>") !== -1) return pos;',
    '    if (!fallback) fallback = pos;',
    '  }',
    '  return fallback;',
    '}',
    '',
    'var LINE_OFFSET = (function () {',
    '  try {',
    '    new Function("throw new Error(0)")();',
    '  } catch (e) {',
    '    var pos = rawPos(e.stack);',
    '    if (pos) return Math.max(0, pos.line - 1);',
    '  }',
    '  return 2;',
    '})();',
    '',
    'function typeTag(v) {',
    '  return Object.prototype.toString.call(v).slice(8, -1);',
    '}',
    '',
    '// console 的值渲染。深度和长度都设了上限：读者随手 log 一个自引用的大对象是常态，',
    '// 面板要给出「看得懂的概览」而不是把浏览器拖死。',
    'function inspect(v, depth, seen) {',
    '  depth = depth || 0;',
    '  seen = seen || [];',
    '  var t = typeof v;',
    '  if (v === null) return "null";',
    '  if (t === "undefined") return "undefined";',
    '  if (t === "number") return Object.is(v, -0) ? "-0" : String(v);',
    '  if (t === "boolean") return String(v);',
    '  if (t === "bigint") return String(v) + "n";',
    '  if (t === "symbol") return v.toString();',
    '  if (t === "string") return depth === 0 ? v : JSON.stringify(v);',
    '  if (t === "function") {',
    '    if (/^class[\\s{]/.test(String(v))) return v.name ? "[class " + v.name + "]" : "[class (anonymous)]";',
    '    return v.name ? "[Function: " + v.name + "]" : "[Function (anonymous)]";',
    '  }',
    '  if (seen.indexOf(v) !== -1) return "[Circular]";',
    '',
    '  var tag = typeTag(v);',
    '  if (tag === "Error" || v instanceof Error) {',
    '    return v.name + ": " + v.message;',
    '  }',
    '  if (tag === "Date") return isNaN(v.getTime()) ? "Invalid Date" : v.toISOString();',
    '  if (tag === "RegExp") return String(v);',
    '  if (tag === "Promise") return "Promise { <state unknown> }";',
    '',
    '  if (depth > 4) return Array.isArray(v) ? "[Array]" : "[Object]";',
    '  seen = seen.concat([v]);',
    '  var i, parts = [];',
    '',
    '  if (Array.isArray(v)) {',
    '    for (i = 0; i < v.length && i < 100; i++) {',
    '      parts.push(i in v ? inspect(v[i], depth + 1, seen) : "<empty>");',
    '    }',
    '    if (v.length > 100) parts.push("… " + (v.length - 100) + " more");',
    '    return "[" + parts.join(", ") + "]";',
    '  }',
    '  if (tag === "Map") {',
    '    v.forEach(function (val, key) {',
    '      if (parts.length < 100) parts.push(inspect(key, depth + 1, seen) + " => " + inspect(val, depth + 1, seen));',
    '    });',
    '    return "Map(" + v.size + ") {" + (parts.length ? " " + parts.join(", ") + " " : "") + "}";',
    '  }',
    '  if (tag === "Set") {',
    '    v.forEach(function (val) {',
    '      if (parts.length < 100) parts.push(inspect(val, depth + 1, seen));',
    '    });',
    '    return "Set(" + v.size + ") {" + (parts.length ? " " + parts.join(", ") + " " : "") + "}";',
    '  }',
    '  if (/Array$/.test(tag) && typeof v.length === "number") {   // Int8Array 等 TypedArray',
    '    for (i = 0; i < v.length && i < 100; i++) parts.push(String(v[i]));',
    '    return tag + "(" + v.length + ") [" + parts.join(", ") + "]";',
    '  }',
    '',
    '  var keys = Object.keys(v);',
    '  for (i = 0; i < keys.length && i < 100; i++) {',
    '    // 中文等非 ASCII 标识符在 JS 里是合法的 key，别给它套引号（\\u00a1 以上一律放行）',
    '    var k = /^[A-Za-z_$\\u00a1-\\uffff][\\w$\\u00a1-\\uffff]*$/.test(keys[i]) ? keys[i] : JSON.stringify(keys[i]);',
    '    parts.push(k + ": " + inspect(v[keys[i]], depth + 1, seen));',
    '  }',
    '  if (keys.length > 100) parts.push("… " + (keys.length - 100) + " more");',
    '  // 自定义 class 的实例带上构造函数名，"Point { x: 1 }" 比 "{ x: 1 }" 有信息量',
    '  var ctor = v.constructor && v.constructor.name;',
    '  var prefix = ctor && ctor !== "Object" ? ctor + " " : "";',
    '  return prefix + "{" + (parts.length ? " " + parts.join(", ") + " " : "") + "}";',
    '}',
    '',
    'function emit(level, args) {',
    '  var text = [];',
    '  for (var i = 0; i < args.length; i++) text.push(inspect(args[i], 0, []));',
    '  postMessage({ kind: "out", level: level, text: text.join(" ") });',
    '}',
    '',
    '["log", "info", "warn", "error", "debug", "trace", "dir"].forEach(function (level) {',
    '  console[level] = function () { emit(level === "dir" ? "log" : level, arguments); };',
    '});',
    '',
    '// console.table 不做表格渲染，退化成逐行 log —— 面板是纯文本的，硬做表格只会更难读',
    'console.table = function (data) { emit("log", [data]); };',
    '',
    '// 未捕获的 reject 在 Worker 里不会走 onerror，单独接一手，否则 async 例子出错时面板一片空白',
    'self.addEventListener("unhandledrejection", function (ev) {',
    '  ev.preventDefault();',
    '  postMessage({ kind: "err", text: "Uncaught (in promise) " + inspect(ev.reason, 0, []) });',
    '});',
    '',
    '// 读者代码的报错行号：扣掉包装偏移，让它对上代码块左边看到的行',
    'function firstUserLine(stack) {',
    '  var pos = rawPos(stack);',
    '  if (!pos) return null;',
    '  var line = pos.line - LINE_OFFSET;',
    '  return line >= 1 ? { line: line, col: pos.col } : null;',
    '}',
    '',
    '// 什么时候算「跑完了」—— 这里踩过一次坑：最初拿 AsyncFunction 的 promise resolve 当完成信号，',
    '// 结果把还在排队的 setTimeout 回调、以及微任务链的尾巴一起砍了（.then 链只出得到第一环）。',
    '// 主体代码 return 只说明「同步部分和 await 链走完」，不代表事件循环空了。',
    '//',
    '// 改成两个条件同时成立才算空闲：',
    '// 1. settled —— 主体 promise 已 settle；',
    '// 2. 没有活着的定时器 —— 所以下面把 setTimeout / setInterval 接管过来做引用计数。',
    '// 两条都满足后再排一个**哨兵宏任务**，哨兵跑到时才真正上报 idle：宏任务永远排在微任务全部',
    '// 清空之后，所以哨兵能兜住「微任务链尾部又新排了定时器」这种情况。这正是本篇笔记讲的规则，',
    '// 反过来用一次。',
    'var nSetTimeout = self.setTimeout.bind(self);',
    'var nClearTimeout = self.clearTimeout.bind(self);',
    'var nSetInterval = self.setInterval.bind(self);',
    'var nClearInterval = self.clearInterval.bind(self);',
    'var timers = {};',
    'var pending = 0;',
    'var settled = false;',
    'var probing = false;',
    '',
    'function track(id) { if (!(id in timers)) { timers[id] = 1; pending++; } return id; }',
    'function untrack(id) { if (id in timers) { delete timers[id]; pending--; } }',
    '',
    'function maybeIdle() {',
    '  if (!settled || pending > 0 || probing) return;',
    '  probing = true;',
    '  nSetTimeout(function () {',
    '    probing = false;',
    '    if (settled && pending === 0) postMessage({ kind: "idle" });',
    '  }, 0);',
    '}',
    '',
    'self.setTimeout = function (fn, ms) {',
    '  if (typeof fn !== "function") return nSetTimeout(fn, ms);   // 字符串形式不追踪，交给原生',
    '  var args = Array.prototype.slice.call(arguments, 2);',
    '  var id = nSetTimeout(function () {',
    '    untrack(id);',
    '    try { fn.apply(null, args); } finally { maybeIdle(); }',
    '  }, ms);',
    '  return track(id);',
    '};',
    '// setInterval 不 untrack：它本来就不会自己停，pending 永远 > 0，只能由 clearInterval',
    '// 或主线程的超时保护收场 —— 这跟真实语义一致，不要为了「早点显示完成」骗它归零',
    'self.setInterval = function (fn, ms) {',
    '  if (typeof fn !== "function") return nSetInterval(fn, ms);',
    '  var args = Array.prototype.slice.call(arguments, 2);',
    '  return track(nSetInterval(function () { fn.apply(null, args); }, ms));',
    '};',
    'self.clearTimeout = function (id) { untrack(id); nClearTimeout(id); maybeIdle(); };',
    'self.clearInterval = function (id) { untrack(id); nClearInterval(id); maybeIdle(); };',
    '',
    'self.onmessage = function (ev) {',
    '  var fn;',
    '  try {',
    '    fn = new AsyncFunction(ev.data.code);',
    '  } catch (e) {',
    '    // 语法错误在构造期就抛，此时还没执行；栈里没有可用行号，只报 message',
    '    postMessage({ kind: "err", text: e.name + ": " + e.message });',
    '    settled = true;',
    '    maybeIdle();',
    '    return;',
    '  }',
    '  fn().then(null, function (e) {',
    '    var text = e instanceof Error ? e.name + ": " + e.message : "Uncaught " + inspect(e, 0, []);',
    '    var at = e instanceof Error ? firstUserLine(e.stack) : null;',
    '    postMessage({ kind: "err", text: text, line: at && at.line, col: at && at.col });',
    '  }).then(function () {',
    '    settled = true;',
    '    maybeIdle();',
    '  });',
    '};'
  ].join("\n");

  var workerURL = null;
  function getWorkerURL() {
    if (!workerURL) {
      workerURL = URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }));
    }
    return workerURL;   // blob 只建一次，之后每次运行 new Worker 复用同一个 URL
  }

  // ---------------------------------------------------------------------------
  // 主线程：一个代码块一个 Runner
  // ---------------------------------------------------------------------------
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function setup(highlight) {
    var code = highlight.querySelector("pre > code");
    if (!code) return;

    // anchor_linenums 插进来的 <a> 是空元素，textContent 取到的就是干净源码
    var src = code.textContent.replace(/\n+$/, "");

    var wrap = el("div", "js-run");
    highlight.parentNode.insertBefore(wrap, highlight);
    wrap.appendChild(highlight);

    var out = el("div", "js-run__out");
    out.hidden = true;
    wrap.appendChild(out);

    // 按钮塞进 .highlight 内部（pre 之外）绝对定位到右下角，跟自带的复制按钮左右对称。
    // 放在 pre 外面是关键：代码超宽时 pre 会横向滚动，挂在 pre 里的按钮会跟着滚走。
    var runBtn = el("button", "js-run__btn", "\u25b6 \u8fd0\u884c");
    runBtn.type = "button";
    highlight.appendChild(runBtn);

    var worker = null;
    var timer = null;
    var lines = 0;
    var truncated = false;

    function print(level, text) {
      if (lines >= MAX_LINES) {
        if (!truncated) {
          truncated = true;
          out.appendChild(el("div", "js-run__line js-run__line--sys",
            "\u2026 \u8f93\u51fa\u8d85\u8fc7 " + MAX_LINES + " \u884c\uff0c\u540e\u7eed\u5df2\u7701\u7565"));
        }
        return;
      }
      lines++;
      out.hidden = false;
      out.appendChild(el("div", "js-run__line js-run__line--" + level, text));
    }

    function stop(reason) {
      if (timer) { clearTimeout(timer); timer = null; }
      if (worker) { worker.terminate(); worker = null; }
      runBtn.textContent = "\u25b6 \u8fd0\u884c";
      runBtn.classList.remove("js-run__btn--stop");
      if (reason) print("sys", reason);
    }

    function run() {
      if (worker) { stop("\u5df2\u624b\u52a8\u505c\u6b62"); return; }

      out.textContent = "";
      out.hidden = true;
      lines = 0;
      truncated = false;

      try {
        worker = new Worker(getWorkerURL());
      } catch (e) {
        // file:// 下打开时 blob Worker 会被拦；说清楚原因，别让读者以为是自己代码错了
        print("err", "\u65e0\u6cd5\u521b\u5efa Worker\uff1a" + e.message +
          "\uff08\u672c\u5730\u76f4\u63a5\u6253\u5f00 HTML \u65f6\u4f1a\u88ab\u6d4f\u89c8\u5668\u62e6\u4e0b\uff0c\u7528 http \u8bbf\u95ee\u5373\u53ef\uff09");
        worker = null;
        return;
      }

      runBtn.textContent = "\u25a0 \u505c\u6b62";
      runBtn.classList.add("js-run__btn--stop");

      worker.onmessage = function (ev) {
        var msg = ev.data;
        if (msg.kind === "out") {
          print(msg.level, msg.text);
        } else if (msg.kind === "err") {
          print("err", msg.line ? msg.text + "  \uff08\u7b2c " + msg.line + " \u884c\uff09" : msg.text);
        } else if (msg.kind === "idle") {
          // Worker 自己判定事件循环空了（主体 settle + 无活着的定时器 + 哨兵宏任务已过）。
          // 主线程绝不能提前 terminate：排队中的 setTimeout 和微任务链尾巴都会被一起砍掉。
          stop(null);
          if (!lines) print("sys", "\u6267\u884c\u5b8c\u6bd5\uff0c\u6ca1\u6709\u8f93\u51fa\uff08\u503c\u8981\u7528 console.log \u6253\u51fa\u6765\u624d\u770b\u5f97\u5230\uff09");
        }
      };
      worker.onerror = function (ev) {
        print("err", ev.message || "Worker \u5185\u90e8\u9519\u8bef");
        stop(null);
      };

      // 死循环保护。Worker 被同步代码占死时收不到任何消息，只有 terminate 能救；
      // 合法的长时间 await 也会被这一刀砍掉，所以文案要点明是「保护」而不是「你的代码错了」。
      timer = setTimeout(function () {
        stop("\u6267\u884c\u8d85\u8fc7 " + (TIMEOUT_MS / 1000) +
          " \u79d2\uff0c\u5df2\u5f3a\u5236\u7ec8\u6b62\uff08\u9632\u6b7b\u5faa\u73af / \u6c38\u4e0d\u7ed3\u675f\u7684\u7b49\u5f85\uff09");
      }, TIMEOUT_MS);

      worker.postMessage({ code: src });
    }

    runBtn.addEventListener("click", run);
  }

  function init() {
    // .highlight.run —— superfences 的 ```{.js .run} 产出 class="language-js run highlight"。
    // 没有可运行块的页面在这里就返回，一个 Worker 都不建、blob 都不生成，零开销。
    var blocks = document.querySelectorAll(".highlight.run");
    for (var i = 0; i < blocks.length; i++) setup(blocks[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
