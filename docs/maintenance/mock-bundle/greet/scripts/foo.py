#!/usr/bin/env python3
"""打招呼：python3 scripts/foo.py <名字>。单文件，不依赖别的文件。"""
import sys


def greet(name: str) -> str:
    return f"你好，{name}！"


if __name__ == "__main__":
    print(greet(sys.argv[1] if len(sys.argv) > 1 else "世界"))
