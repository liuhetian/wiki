"""服务端占位符渲染（Python 版），语义与 live.js 保持一致。

Markdown 里的 ``{{ api("/path").a.b }}`` 会被替换成接口返回 JSON 里对应字段的值：
  - 同一文档里相同 URL 只请求一次；
  - ``` / ~~~ 围栏代码块和 `行内代码` 里的占位符保持原样（对应 live.js 跳过 code/pre）；
  - 对象/数组输出紧凑 JSON，null/缺失输出空串，布尔输出 true/false，整数值浮点输出整数；
  - 请求失败或返回非 JSON 时输出「加载失败」。

TypeScript 版是 md-render.ts，两者共用 placeholder_cases.json 做测试。
只依赖标准库，postbuild.py 检查链接时也用它剥代码块。
"""

from __future__ import annotations

import asyncio
import json
import math
import re
from collections.abc import Awaitable, Callable
from typing import Any

# 与 live.js 的 PATTERN 相同。JS 的 \w 只匹配 ASCII，所以这里加 re.ASCII。
PATTERN = re.compile(
    r"""\{\{\s*api\(\s*(["'])(.+?)\1\s*\)((?:\.[\w$]+)*)\s*\}\}""", re.ASCII
)
FENCE_OPEN = re.compile(r"^\s*(`{3,}|~{3,})")
INLINE_CODE = re.compile(r"(?<!`)(`+)(?!`)(.*?)(?<!`)\1(?!`)")
# 只按 \n 切行（保留换行符），与 TS 版一致
LINES = re.compile(r"[^\n]*\n|[^\n]+")
FAILED = "加载失败"

Fetch = Callable[[str], Awaitable[Any]]


def _split_segments(text: str) -> list[tuple[bool, str]]:
    """把 Markdown 切成 (是否可替换, 文本) 片段：代码块和行内代码不可替换。"""
    segments: list[tuple[bool, str]] = []
    fence: tuple[str, int] | None = None  # (围栏字符, 长度)
    for line in LINES.findall(text):
        if fence is not None:
            segments.append((False, line))
            stripped = line.strip()
            char, size = fence
            if stripped and set(stripped) == {char} and len(stripped) >= size:
                fence = None
            continue
        m = FENCE_OPEN.match(line)
        if m:
            fence = (m.group(1)[0], len(m.group(1)))
            segments.append((False, line))
            continue
        last = 0
        for code in INLINE_CODE.finditer(line):
            segments.append((True, line[last : code.start()]))
            segments.append((False, code.group(0)))
            last = code.end()
        segments.append((True, line[last:]))
    return segments


def without_code(text: str) -> str:
    """去掉代码块和行内代码后的文本（postbuild.py 检查链接时用，代码里的示例链接不算）。"""
    return "".join(seg for ok, seg in _split_segments(text) if ok)


def find_placeholders(text: str) -> list[str]:
    """返回文档中（代码块以外）出现的占位符 URL，按出现顺序去重。"""
    urls: list[str] = []
    for replaceable, seg in _split_segments(text):
        if replaceable:
            for m in PATTERN.finditer(seg):
                if m.group(2) not in urls:
                    urls.append(m.group(2))
    return urls


def _get(obj: Any, key: str) -> Any:
    """模拟 JS 的 obj?.[key]。"""
    if isinstance(obj, dict):
        return obj.get(key)
    if isinstance(obj, (list, str)):
        if key == "length":
            return len(obj)
        if key.isdigit() and int(key) < len(obj):
            return obj[int(key)]
    return None


def _normalize(value: Any) -> Any:
    """整数值的浮点数转成 int，让 JSON 输出与 JS 一致（JS 里 3.0 就是 3）。"""
    if isinstance(value, float) and math.isfinite(value) and value.is_integer():
        return int(value)
    if isinstance(value, dict):
        return {k: _normalize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_normalize(v) for v in value]
    return value


def format_value(value: Any) -> str:
    """模拟 live.js：对象 → JSON.stringify，其余 → String(value ?? "")。"""
    value = _normalize(value)
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return str(value)


async def render_markdown(text: str, fetch: Fetch) -> str:
    """把文档里的占位符替换成实时数据。fetch(url) 返回解析后的 JSON，失败时抛异常。"""
    segments = _split_segments(text)
    urls = find_placeholders(text)

    async def safe_fetch(url: str) -> tuple[bool, Any]:
        try:
            return True, await fetch(url)
        except Exception:  # noqa: BLE001 —— 任何失败都显示「加载失败」
            return False, None

    results = dict(zip(urls, await asyncio.gather(*(safe_fetch(u) for u in urls))))

    def replace(m: re.Match[str]) -> str:
        ok, data = results[m.group(2)]
        if not ok:
            return FAILED
        value = data
        for key in filter(None, m.group(3).split(".")):
            value = _get(value, key)
        return format_value(value)

    return "".join(
        PATTERN.sub(replace, seg) if replaceable else seg
        for replaceable, seg in segments
    )
