"""校验骨架（设计蓝图）与当前工作副本（实装）是否对齐。

    uv run python -m scripts.check_skeleton_sync          # 报告不一致，有则 exit 1
    uv run python -m scripts.check_skeleton_sync -v       # 附带全部通过项计数

本脚本母本在 skeleton/scripts/，随骨架复制进每个工作副本；在哪个副本里运行就比对哪个。

对齐规则（详见 CLAUDE.md）：

- 逐 .py 文件比对包根 `custom_iap_backend/`（iap_assets 已上提到仓库根
  shared/iap_assets，单份实码不需要对齐检查）。
- **实码文件**（IMPL_FILES）整文件文本比对：骨架里就是可运行实码，副本原样复制。
- 其余文件做「结构投影」比对（注释天然被 AST 丢弃，只比规约）：
    * 模块 / 类 / 函数 的存在性
        - 骨架有、v2 无            → 报错（规约未实现）
        - v2 有、骨架无且为公共符号 → 报错（plan 外漂移）；`_` 开头私有放行
    * 函数签名（参数 / 注解 / 默认值 / async / 装饰器）逐一致
    * docstring 逐字一致（仅归一化行尾空白）
    * 类属性 / 模块常量的名字 + 注解一致；骨架默认值为 `...` 时跳过值比对
      （stub 占位），否则默认值也须一致（如 schemas 的真实缺省）。
"""

from __future__ import annotations

import ast
import sys
from pathlib import Path

# ── 路径：本脚本随骨架复制进每个工作副本，母本在 skeleton/scripts/ ──
# IMPL_ROOT = 脚本所在的工作副本（v2/v3/…，名字不限）；SKELETON = 固定同级蓝图目录。
IMPL_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = IMPL_ROOT.parent
SKELETON_ROOT = REPO_ROOT / "custom-iap-backend-skeleton"

PACKAGE_ROOTS = ["custom_iap_backend"]

# 整文件文本比对（骨架里即实码，v2 原样复制）
IMPL_FILES = {
    "custom_iap_backend/config.py",
    "custom_iap_backend/packages/models.py",
}


class Finding:
    def __init__(self, file: str, kind: str, detail: str) -> None:
        self.file = file
        self.kind = kind
        self.detail = detail


def _norm_doc(doc: str | None) -> str | None:
    """归一化 docstring：整体 strip + 每行 rstrip（吸收行尾空白差异）。"""
    if doc is None:
        return None
    return "\n".join(line.rstrip() for line in doc.strip().splitlines())


def _sig(fn: ast.FunctionDef | ast.AsyncFunctionDef) -> str:
    prefix = "async " if isinstance(fn, ast.AsyncFunctionDef) else ""
    decos = sorted(ast.unparse(d) for d in fn.decorator_list)
    ret = ast.unparse(fn.returns) if fn.returns else ""
    return f"{prefix}({ast.unparse(fn.args)}) -> {ret} @[{'; '.join(decos)}]"


def _is_ellipsis(node: ast.expr | None) -> bool:
    return isinstance(node, ast.Constant) and node.value is Ellipsis


def project(path: Path) -> dict[str, dict]:
    """把一个 .py 文件投影成 {qualname: {...}} 的规约字典。"""
    tree = ast.parse(path.read_text(encoding="utf-8"))
    out: dict[str, dict] = {"<module>": {"doc": _norm_doc(ast.get_docstring(tree, clean=False))}}

    def rec_attr(prefix: str, name: str, anno: ast.expr | None, value: ast.expr | None) -> None:
        out[f"{prefix}{name}"] = {
            "kind": "attr",
            "anno": ast.unparse(anno) if anno is not None else None,
            "default": None if value is None
            else ("..." if _is_ellipsis(value) else ast.unparse(value)),
        }

    def is_schema_class(node: ast.ClassDef) -> bool:
        # dataclass / pydantic BaseModel / SQLModel —— 纯注解字段是契约
        if any("dataclass" in ast.unparse(d) for d in node.decorator_list):
            return True
        return any(ast.unparse(b).split(".")[-1] in {"BaseModel", "SQLModel"}
                   for b in node.bases)

    def walk(body: list[ast.stmt], prefix: str, schema_ctx: bool) -> None:
        for node in body:
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                # 只记函数本身；函数体内部（嵌套 helper / 局部变量）属实现，不比对
                q = f"{prefix}{node.name}"
                out[q] = {"kind": "func", "sig": _sig(node),
                          "doc": _norm_doc(ast.get_docstring(node, clean=False))}
            elif isinstance(node, ast.ClassDef):
                q = f"{prefix}{node.name}"
                bases = sorted(ast.unparse(b) for b in node.bases)
                out[q] = {"kind": "class", "bases": bases,
                          "doc": _norm_doc(ast.get_docstring(node, clean=False))}
                walk(node.body, q + ".", is_schema_class(node))   # 类体：递归取字段 + 方法
            elif isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name):
                # 常规类里「纯注解无值」是实例属性类型提示（v2 常在 __init__ 赋值），
                # 不算契约；schema 类 / 模块级 / 带值的才纳入。
                if node.value is None and prefix and not schema_ctx:
                    continue
                rec_attr(prefix, node.target.id, node.annotation, node.value)
            elif isinstance(node, ast.Assign):
                # 无注解赋值也按名字纳入（存在性对齐用；注解 None 时不比注解）
                for t in node.targets:
                    if isinstance(t, ast.Name):
                        rec_attr(prefix, t.id, None, node.value)
            elif isinstance(node, (ast.If, ast.Try)):
                # 下探条件/异常分支里的模块/类级定义（如 if/else 里赋的常量）
                for sub in (getattr(node, "body", []) + getattr(node, "orelse", [])
                            + getattr(node, "finalbody", [])):
                    walk([sub], prefix, schema_ctx)
                for h in getattr(node, "handlers", []):
                    walk(h.body, prefix, schema_ctx)

    walk(tree.body, "", False)
    return out


def _extra_allowed(qualname: str) -> bool:
    # v2 多出的下划线/dunder 成员（私有 helper、__init__ 等）属实现自由，放行
    return qualname.split(".")[-1].startswith("_")


def check_structural(rel: str, findings: list[Finding], ok: list[str]) -> None:
    sk = project(SKELETON_ROOT / rel)
    v2 = project(IMPL_ROOT / rel)

    for q in sk:
        if q not in v2:
            findings.append(Finding(rel, "缺失", f"骨架定义了 `{q}`，v2 缺失（规约未实现）"))
            continue
        s, v = sk[q], v2[q]
        if s.get("sig") is not None and s.get("sig") != v.get("sig"):
            findings.append(Finding(rel, "签名不一致",
                f"`{q}`\n      骨架: {s['sig']}\n      v2:   {v.get('sig')}"))
        if s.get("kind") == "class" and s.get("bases") != v.get("bases"):
            findings.append(Finding(rel, "基类不一致",
                f"`{q}` 骨架 {s['bases']} vs v2 {v.get('bases')}"))
        if s.get("doc") != v.get("doc"):
            findings.append(Finding(rel, "docstring 不一致",
                f"`{q}`\n      骨架: {s.get('doc')!r}\n      v2:   {v.get('doc')!r}"))
        if s.get("kind") == "attr":
            # 注解仅在两边都显式声明时才比（v2 省注解不算规约违背）
            if s.get("anno") is not None and v.get("anno") is not None \
                    and s.get("anno") != v.get("anno"):
                findings.append(Finding(rel, "属性注解不一致",
                    f"`{q}` 骨架 {s.get('anno')} vs v2 {v.get('anno')}"))
            # 骨架默认值为 `...` 是 stub 占位，值不比；否则须一致
            if s.get("default") not in (None, "...") and s.get("default") != v.get("default"):
                findings.append(Finding(rel, "属性默认值不一致",
                    f"`{q}` 骨架 {s.get('default')} vs v2 {v.get('default')}"))
        ok.append(f"{rel}::{q}")

    for q in v2:
        if q not in sk and q != "<module>" and not _extra_allowed(q):
            findings.append(Finding(rel, "多出", f"v2 有公共符号 `{q}`，骨架未声明（plan 外漂移）"))


def check_impl_file(rel: str, findings: list[Finding], ok: list[str]) -> None:
    sk = (SKELETON_ROOT / rel).read_text(encoding="utf-8")
    v2 = (IMPL_ROOT / rel).read_text(encoding="utf-8")
    if sk != v2:
        # 给出首个差异行号，便于定位
        sk_lines, v2_lines = sk.splitlines(), v2.splitlines()
        diff_at = next((i + 1 for i, (a, b) in enumerate(zip(sk_lines, v2_lines)) if a != b),
                       min(len(sk_lines), len(v2_lines)) + 1)
        findings.append(Finding(rel, "实码文件整文件不一致",
            f"首个差异在第 {diff_at} 行（实码文件须逐字一致）"))
    else:
        ok.append(f"{rel} (实码整文件)")


def iter_py_files(root: Path) -> set[str]:
    files: set[str] = set()
    for pkg in PACKAGE_ROOTS:
        base = root / pkg
        if not base.exists():
            continue
        for p in base.rglob("*.py"):
            if "__pycache__" in p.parts:
                continue
            files.add(str(p.relative_to(root)))
    return files


def main() -> int:
    verbose = "-v" in sys.argv

    if IMPL_ROOT == SKELETON_ROOT:
        print("ℹ️ 在骨架目录内无需自检——请在工作副本（custom-iap-backend-vN）里运行。")
        return 0
    if not SKELETON_ROOT.exists():
        print(f"❌ 找不到骨架目录 {SKELETON_ROOT}")
        return 2

    findings: list[Finding] = []
    ok: list[str] = []

    sk_files = iter_py_files(SKELETON_ROOT)
    v2_files = iter_py_files(IMPL_ROOT)

    for rel in sorted(sk_files - v2_files):
        findings.append(Finding(rel, "文件缺失", "骨架有此文件，v2 缺失"))
    for rel in sorted(v2_files - sk_files):
        findings.append(Finding(rel, "文件多出", "v2 有此文件，骨架未声明"))

    for rel in sorted(sk_files & v2_files):
        if rel in IMPL_FILES:
            check_impl_file(rel, findings, ok)
        else:
            check_structural(rel, findings, ok)

    if not findings:
        print(f"✅ 骨架与 v2 已对齐（比对 {len(sk_files & v2_files)} 个文件，{len(ok)} 项检查通过）")
        return 0

    by_file: dict[str, list[Finding]] = {}
    for f in findings:
        by_file.setdefault(f.file, []).append(f)

    print(f"❌ 发现 {len(findings)} 处不一致，涉及 {len(by_file)} 个文件：\n")
    for file in sorted(by_file):
        print(file)
        for f in by_file[file]:
            print(f"  ✗ [{f.kind}] {f.detail}")
        print()

    if verbose:
        print(f"（另有 {len(ok)} 项检查通过）")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
