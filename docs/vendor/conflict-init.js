// ```conflict 代码块渲染器：课程页的提问写成 git 冲突标记的形状，
// 上半是课程的问、下半是我的答，答案为空就等于「未合并」。
// fence 由 pymdownx.superfences 输出为 <pre class="conflict"><code>原文</code></pre>，
// 这里只按三个标记行把 <code> 内部重排成 span，不替换 <pre> —— 复制按钮、
// 选中复制、以及「脚本没加载就退化成普通代码块」全都照旧，内容一行不丢。
// 解析规则与 scripts/course.py 的状态机必须一致：三种标记各占一整行。
(function () {
  var OPEN = /^<{7} /;
  var SEP = /^={7}\s*$/;
  var CLOSE = /^>{7} /;

  function block(cls, text) {
    var el = document.createElement("span");
    el.className = cls;
    el.textContent = text;
    return el;
  }

  function render() {
    var blocks = document.querySelectorAll("pre.conflict");
    if (!blocks.length) return;
    blocks.forEach(function (pre) {
      var code = pre.querySelector("code") || pre;
      var lines = code.textContent.replace(/\n$/, "").split("\n");
      var open = -1, sep = -1, close = -1;
      lines.forEach(function (line, i) {
        if (open < 0 && OPEN.test(line)) open = i;
        else if (open >= 0 && sep < 0 && SEP.test(line)) sep = i;
        else if (sep >= 0 && close < 0 && CLOSE.test(line)) close = i;
      });
      // 三个标记不齐就原样留着：宁可显示成普通代码块，也不吞内容
      if (open < 0 || sep < 0 || close < 0) return;

      var question = lines.slice(open + 1, sep).join("\n");
      var answer = lines.slice(sep + 1, close).join("\n").replace(/^\n+|\n+$/g, "");
      var frag = document.createDocumentFragment();
      frag.appendChild(block("conflict__mark", lines[open]));
      frag.appendChild(block("conflict__q", question));
      frag.appendChild(block("conflict__mark", lines[sep]));
      frag.appendChild(
        answer
          ? block("conflict__a", answer)
          : block("conflict__a conflict__a--empty", "（未作答）")
      );
      frag.appendChild(block("conflict__mark", lines[close]));
      code.textContent = "";
      code.appendChild(frag);
      if (!answer) pre.classList.add("conflict--unresolved");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
