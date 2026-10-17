#!/usr/bin/env python3
"""数字数：python3 scripts/foo.py <一句话>。

跨目录依赖：借兄弟子 skill greet 的 scripts/foo.py 说话，所以要整包用。
"""
import importlib.util
import sys
from pathlib import Path

GREET = Path(__file__).resolve().parents[2] / "greet" / "scripts" / "foo.py"


def load_greet():
    if not GREET.exists():
        sys.exit(f"找不到 {GREET}：这个脚本依赖兄弟子 skill greet 的 foo.py，下载整包后再跑")
    spec = importlib.util.spec_from_file_location("greet_foo", GREET)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


if __name__ == "__main__":
    text = sys.argv[1] if len(sys.argv) > 1 else ""
    print(load_greet().greet(f"这句 {len(text)} 个字的话"))
