#!/usr/bin/env python3
"""Check a written note against the budget prepare_note.py wrote: length, compression, evidence used.

Run `python3 score_note.py <folder> <note.md>`. Standard library only.
Prints the score and writes it to <folder>/note/score.json.

status is too_short, ok or too_long against recommended_note_chars_min..max. Visible chars skip the
frontmatter, code blocks, HTML tags (their text stays), attribute lists, link targets, link and
footnote definitions, Markdown marks and whitespace: figures, grids and footnotes cost nothing.
An evidence reference is any id from note/evidence.jsonl (P01@..., KF-P01-03, A-001, IMG-01, C<rpid>)
that appears anywhere in the note, footnotes included; a range such as KF-P01-03～KF-P01-06 or
A-002～005 counts every id in it.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


def visible_chars(markdown: str) -> int:
    text = re.sub(r"\A---\n.*?\n---\n", "", markdown, flags=re.S)
    text = re.sub(r"```.*?```", "", text, flags=re.S)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\{\s*[:#.\w][^}\n]*\}", "", text)
    text = re.sub(r"^[ \t]*\[[^\]]+\]:\s+\S+.*$", "", text, flags=re.M)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"!?\[([^\]]*)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"^[#>\-\*\|\s:]+", "", text, flags=re.M)
    return len(re.sub(r"\s+", "", text))


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) != 3 or sys.argv[1] in ("-h", "--help"):
        print(__doc__)
        return 2
    folder, note_path = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
    budget = json.loads((folder / "note" / "budget.json").read_text(encoding="utf-8"))
    ids = [json.loads(line)["id"] for line in (folder / "note" / "evidence.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    note = note_path.read_text(encoding="utf-8")
    chars = visible_chars(note)
    low, high = budget["recommended_note_chars_min"], budget["recommended_note_chars_max"]
    mentioned = set(re.findall(r"[A-Z]+-?[A-Z0-9]*-\d+|P\d{2}@[\d:]+-[\d:]+|C\d+", note))
    for prefix, lo, hi in re.findall(r"\b((?:KF-P\d{2}|A|IMG)-)(\d+)\s*[～~–—]\s*(?:(?:KF-P\d{2}|A|IMG)-)?(\d+)", note):
        mentioned |= {f"{prefix}{n:0{len(lo)}d}" for n in range(int(lo), int(hi) + 1)}
    used = sorted({i for i in ids if i in note or i in mentioned})
    minutes = budget.get("duration_minutes") or 0
    score = {
        "note": str(note_path),
        "status": "too_short" if chars < low else "too_long" if chars > high else "ok",
        "note_chars": chars,
        "recommended_note_chars": [low, high],
        "compression_ratio": round(chars / budget["content_chars"], 3) if budget.get("content_chars") else None,
        "note_chars_per_minute": round(chars / minutes, 1) if minutes else None,
        "evidence_used": len(used),
        "evidence_total": len(ids),
        "keyframes_used": sum(1 for i in used if i.startswith("KF-")),
        "granularity": budget.get("granularity"),
        "visual_dependency": budget.get("visual_dependency"),
    }
    (folder / "note" / "score.json").write_text(json.dumps(score, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(score, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
