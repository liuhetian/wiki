"""实跑脚本共用：只加载 DeepTutor 的单个模块，不执行它所在包的 __init__。

DeepTutor 的不少包一导入就把整个应用拉起来——services/memory/__init__ 会一路
导到 openai 客户端，reading/__init__ 会导 PyMuPDF。要跑的只是里面几个纯函数，
所以先把父包登记成空壳（带 __path__ 的空模块），再 import 目标模块：Python
只执行目标文件本身和它真正 import 的东西。

用法：
    import sys, pathlib
    sys.path.insert(0, str(pathlib.Path(__file__).parent))
    from _load import open_clone, stub, out, txt
    clone = open_clone()                      # 克隆路径取自 argv[1]
    stub(clone, "deeptutor.services.memory")  # 父包登记成空壳
    from deeptutor.services.memory import document
"""
from __future__ import annotations

import json
import pathlib
import subprocess
import sys
import types

HARNESS = pathlib.Path(__file__).resolve().parent
SIM = HARNESS.parent
PINNED = "a31d82624c27d75f4e771d4fcb78dce16470b383"


def open_clone() -> pathlib.Path:
    if len(sys.argv) < 2:
        sys.exit("用法：python3 -I <脚本> <DeepTutor 克隆路径>")
    clone = pathlib.Path(sys.argv[1]).resolve()
    head = subprocess.run(["git", "-C", str(clone), "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip()
    if head != PINNED:
        sys.exit(f"克隆的 HEAD 是 {head or '?'}，这些脚本对的是 {PINNED[:7]}")
    if str(clone) not in sys.path:
        sys.path.insert(0, str(clone))
    return clone


def stub(clone: pathlib.Path, *packages: str) -> None:
    """把每个点分包名及其各级父包登记成空壳。"""
    for dotted in packages:
        parts = dotted.split(".")
        for i in range(1, len(parts) + 1):
            name = ".".join(parts[:i])
            if name in sys.modules:
                continue
            mod = types.ModuleType(name)
            mod.__path__ = [str(clone.joinpath(*parts[:i]))]
            mod.__package__ = name
            sys.modules[name] = mod
            if i > 1:
                setattr(sys.modules[".".join(parts[: i - 1])], parts[i - 1], mod)


def out(name: str, obj) -> None:
    """原始输出：sim/out/<name>.json"""
    path = SIM / "out" / f"{name}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2, default=str) + "\n", encoding="utf-8")


def txt(name: str, text: str) -> None:
    """效果块引用的文本：sim/txt/<name>.txt"""
    path = SIM / "txt" / f"{name}.txt"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.rstrip() + "\n", encoding="utf-8")
