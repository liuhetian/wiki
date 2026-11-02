"""线 1 · 换了 embedding，旧索引不能悄悄被用上。

在临时目录里搭一个知识库「应用统计学」，用 DeepTutor 自己的 index_versioning
走一遍：先用 bge-m3 建好 version-1；换成 OpenAI 的 embedding 后整库重建，
重建期间 version-2 带着 .building.json，还没发布；发布后才被读到。
再造一个重建到一半崩掉的 version-3，看它会不会被当成可用。
LlamaIndex 写的存储文件用占位 json 代替（只为让目录「有输出」），embedding 签名、
目录布局、就绪判定、选版本全是上游函数算的。
"""
import json
import pathlib
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _load import open_clone, out, stub, txt

clone = open_clone()
stub(clone, "deeptutor.services.rag")
from deeptutor.services.rag import index_versioning as iv  # noqa: E402

BGE = iv.EmbeddingSignature(binding="ollama", model="bge-m3", dimension=1024, base_url="http://localhost:11434", api_version="")
OPENAI = iv.EmbeddingSignature(binding="openai", model="text-embedding-3-small", dimension=1536, base_url="https://api.openai.com/v1", api_version="")


def fake_store(d: pathlib.Path) -> None:
    # 只为让目录「有输出」；内容不重要
    for name in ("docstore.json", "index_store.json", "default__vector_store.json"):
        (d / name).write_text("{}", encoding="utf-8")


def snapshot(kb: pathlib.Path) -> list[dict]:
    rows = []
    for e in iv.list_kb_versions(kb):
        rows.append(
            {
                "version": e.get("version"),
                "signature": e.get("signature"),
                "model": e.get("model", "—"),
                "dimension": e.get("dimension", "—"),
                "state": e.get("state", "—"),
                "ready": e.get("ready"),
                "building_flag": (pathlib.Path(e["version_path"]) / ".building.json").exists(),
            }
        )
    return sorted(rows, key=lambda r: r["version"])


def pick(kb: pathlib.Path, sig: iv.EmbeddingSignature):
    m = iv.find_matching_version(kb, sig)
    return m["version"] if m else None


record = {"signatures": {"bge-m3": BGE.hash(), "text-embedding-3-small": OPENAI.hash()}, "stages": []}
lines = [
    "embedding 签名（EmbeddingSignature.hash）",
    f"  bge-m3 · 1024 维                  {BGE.hash()}",
    f"  text-embedding-3-small · 1536 维  {OPENAI.hash()}",
    "",
]


def stage(title: str, kb: pathlib.Path) -> None:
    rows = snapshot(kb)
    picks = {"用 bge-m3 读": pick(kb, BGE), "用 3-small 读": pick(kb, OPENAI)}
    record["stages"].append({"title": title, "versions": rows, "find_matching_version": picks})
    lines.append(f"【{title}】")
    for r in rows:
        flag = " .building.json" if r["building_flag"] else ""
        lines.append(
            f"  {r['version']:<10} 签名 {str(r['signature'])[:16]:<16} 模型 {str(r['model']):<24} "
            f"state={r['state']:<9} ready={str(r['ready']):<5}{flag}"
        )
    lines.append("  find_matching_version → " + "，".join(f"{k}：{v or '没有可用版本'}" for k, v in picks.items()))
    lines.append("")


with tempfile.TemporaryDirectory() as tmp:
    kb = pathlib.Path(tmp) / "应用统计学"
    kb.mkdir()

    # 1. 第一次建库：bge-m3，增量写入路径（不带发布守卫）
    v1 = iv.resolve_storage_dir_for_write(kb, BGE)
    fake_store(v1)
    iv.write_version_meta(kb, BGE, storage_dir=v1)
    stage("用 bge-m3 建好 version-1", kb)

    # 2. 换 embedding 整库重建：拿一个新目录，先写 .building.json
    v2 = iv.resolve_storage_dir_for_rebuild(kb, OPENAI, publication_guard=True)
    fake_store(v2)
    stage("换成 3-small 重建中：version-2 已有输出，还没发布", kb)

    # 3. 核验通过后发布：写 meta.json（带 state=published）
    iv.write_version_meta(kb, OPENAI, storage_dir=v2)
    stage("version-2 发布", kb)

    # 4. 再来一次重建，写到一半进程没了：有输出、有 .building.json、没有 meta.json
    v3 = iv.resolve_storage_dir_for_rebuild(kb, OPENAI, publication_guard=True)
    fake_store(v3)
    stage("version-3 重建到一半中断", kb)

    record["meta_v2"] = json.loads((v2 / "meta.json").read_text(encoding="utf-8"))
    record["meta_v2"]["created_at"] = "（运行时间，略）"

out("knowledge-versions", record)
txt("knowledge-versions", "\n".join(lines))
print("\n".join(lines))
