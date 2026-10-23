---
description: "Pyodide 粗讲：不是把 Python 翻译成 JS，是把 CPython 解释器编译成 WebAssembly；Python 的 import 是同步的、下载只能异步，所以包要先 loadPackage 解进内存文件系统，.so 提前 dlopen"
---

# Pyodide：编译成 WebAssembly 的 CPython

它不是把 Python 翻译成 JS，而是把 CPython 解释器本身编译成 WebAssembly，连同 numpy、scipy 这类带 C 扩展的包一起搬进浏览器和 Node.js。用它的是想在网页里跑真 Python、又不想架后端的人。

难处在 Python 的 import 是同步的，网络下载只能异步，所以装包得提前做。loadPyodide 拉来解释器的 wasm，把标准库 zip 解进内存文件系统，读入包清单 pyodide-lock.json；loadPackage 照清单解依赖、校验 sha256、并行下 wheel，解进内存里的 site-packages，再把编成 wasm 的 .so 提前 dlopen。之后 import numpy 只是读本地文件；没装就 import，只报错提示去装，不会自动下载[^repo]。

两边对象靠 proxy 互通：Python 里 `from js import document` 拿到 JsProxy，JS 拿到的 Python 对象是 PyProxy。wasm 变量只能存数字，JS 对象就放进 hiwire 侧表按编号引用。core 最近的提交集中在两处：FFI 的转换性能和引用计数，以及 stack switching —— 让 Python 同步等 JS 的 Promise，仍是实验特性。

它管解释器移植、类型转换和装包；包的编译配方已拆到 pyodide-recipes 仓库，纯 Python 包由 micropip 从 PyPI 装。装哪些包、文件放哪托管、JS 拿到的 PyProxy 用完 destroy，都留给用的人。

[^repo]: [pyodide/pyodide](https://github.com/pyodide/pyodide/tree/312100cc6819f0ac8aaae77bcba68e6870704d57)，读的是 commit `312100c`，2026-10-20 读。
