#!/usr/bin/env python3
"""Prepare a learning note from a folder that agent-io's download scripts and video_read.py filled.

Run `python3 prepare_note.py <folder>`. Standard library only.

Writes <folder>/note/:
    evidence.md      every piece of evidence under its own heading, for reading and for footnotes:
                     P01@00:01:20-00:02:05  subtitle or transcript block (up to 550 chars or 14 lines)
                     KF-P01-03              keyframe from keyframes.json
                     A-001                  block of an article or a post's text
                     IMG-01                 picture of an image post or article
                     C<rpid>                comment, with its replies
    evidence.jsonl   the same, one JSON object per line
    budget.json      how long the note should be and why: content size, granularity, visual dependency,
                     engagement multiplier, recommended chars. Read it before writing.
"""

from __future__ import annotations

import json
import math
import re
import sys
from datetime import datetime, timezone
from pathlib import Path


CLIP_MINUTES = 3
BLOCK_CHARS, BLOCK_LINES = 550, 14


def clock(seconds: float) -> str:
    s = int(seconds or 0)
    return f"{s // 3600:02d}:{s // 60 % 60:02d}:{s % 60:02d}"


def clamp(value: float, low: float, high: float) -> int:
    return int(round(max(low, min(high, value))))


def parse_srt(path: Path) -> list[tuple[float, float, str]]:
    def seconds(stamp: str) -> float:
        h, m, rest = stamp.replace(",", ".").split(":")
        return int(h) * 3600 + int(m) * 60 + float(rest)

    lines = []
    for block in re.split(r"\n\s*\n", path.read_text(encoding="utf-8").strip()):
        rows = block.strip().splitlines()
        timing = next((r for r in rows if "-->" in r), None)
        if not timing:
            continue
        start, end = (seconds(x.strip()) for x in timing.split("-->"))
        text = " ".join(rows[rows.index(timing) + 1:]).strip()
        if text:
            lines.append((start, end, text))
    return lines


def part_text(folder: Path, part: dict) -> tuple[str, Path | None]:
    """Public subtitle first (Chinese if there is one), else the transcript video_read.py wrote."""
    subs = part.get("subtitles") or []
    subs = sorted(subs, key=lambda s: 0 if "zh" in str(s.get("lang")) else 1)
    for sub in subs:
        if (folder / sub["srt"]).exists():
            return f"subtitle {sub.get('lang')}", folder / sub["srt"]
    transcript = folder / f"transcripts/p{int(part['page']):02d}.srt"
    return ("transcript", transcript) if transcript.exists() else ("none", None)


def text_blocks(folder: Path, parts: list[dict]) -> tuple[list[dict], dict]:
    blocks, coverage = [], {}
    for part in parts:
        kind, srt = part_text(folder, part)
        coverage[f"P{int(part['page']):02d}"] = kind
        if not srt:
            continue
        chunk: list[tuple[float, float, str]] = []

        def flush() -> None:
            if chunk:
                bid = f"P{int(part['page']):02d}@{clock(chunk[0][0])}-{clock(chunk[-1][1])}"
                blocks.append({"id": bid, "type": "speech", "source": kind, "page": part["page"], "text": "\n".join(t for _, _, t in chunk)})
                chunk.clear()

        for line in parse_srt(srt):
            chunk.append(line)
            if sum(len(t) for _, _, t in chunk) >= BLOCK_CHARS or len(chunk) >= BLOCK_LINES:
                flush()
        flush()
    return blocks, coverage


def article_blocks(folder: Path, meta: dict) -> list[dict]:
    article = folder / "article.md"
    text = article.read_text(encoding="utf-8") if article.exists() else str(meta.get("desc") or "")
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip() and not p.lstrip().startswith("# ")]
    return [{"id": f"A-{i:03d}", "type": "article", "text": p} for i, p in enumerate(paragraphs, 1)]


def comment_blocks(folder: Path) -> list[dict]:
    path = folder / "comments.json"
    if not path.exists():
        return []
    out = []
    for item in json.loads(path.read_text(encoding="utf-8")).get("items") or []:
        lines = [f"{item.get('user')}（赞 {item.get('like')}）：{item.get('message')}"]
        lines += [f"  └ {c.get('user')}（赞 {c.get('like')}）：{c.get('message')}" for c in item.get("children") or []]
        out.append({"id": f"C{item.get('rpid')}", "type": "comment", "like": item.get("like"), "replies": len(item.get("children") or []), "text": "\n".join(lines)})
    return out


def quality(meta: dict) -> dict:
    """Engagement multiplier 0.85-1.4 from rates per play and per day; 1.0 when the platform hides plays."""
    stats = meta.get("stats") or {}
    view = int(stats.get("view") or 0)
    if not view:
        return {"available": False, "reason": "没有播放量，算不了互动率，倍率取 1.0", "quality_multiplier": 1.0, **stats}
    g = lambda k: int(stats.get(k) or 0)  # noqa: E731
    weighted = g("like") + g("collect") * 1.4 + g("coin") * 2.2 + g("comment") * 1.8 + g("danmaku") * 0.8 + g("share") * 1.5
    published = meta.get("published")
    age = max(1, (datetime.now(timezone.utc) - datetime.fromisoformat(published)).days) if published else None
    log_score = lambda v, ref: max(0.0, min(1.0, math.log1p(v) / math.log1p(ref))) if v > 0 else 0.0  # noqa: E731
    score = (
        log_score(weighted / view * 1000, 80) * 0.28
        + log_score(g("collect") / view * 1000, 50) * 0.18
        + log_score((g("comment") + g("danmaku")) / view * 1000, 20) * 0.12
        + (log_score(view / age, 10000) * 0.20 + log_score(weighted / age, 1000) * 0.22 if age else 0)
    )
    return {
        "available": True,
        "quality_score": round(score, 4),
        "quality_tier": "high" if score >= 0.72 else "medium" if score >= 0.45 else "low",
        "quality_multiplier": round(max(0.85, min(1.4, 0.85 + score * 0.55)), 3),
        "days_since_publish": age,
        **stats,
    }


def visual_dependency(minutes: float, chars: int, blocks: int, parts: int) -> dict:
    density = chars / minutes if minutes else None
    risk, warnings = "low", []
    if minutes >= 25 and chars <= 800:
        risk = "high"
        warnings.append("视频长、字幕或转写很少，核心信息可能在画面、板书、PPT、代码演示里，不要只凭这点文字写完整笔记")
    elif minutes >= 30 and density is not None and density < 120:
        risk = "high"
        warnings.append("长视频每分钟字数偏低，先看关键帧再写详细笔记")
    elif minutes >= 15 and density is not None and density < 180:
        risk = "medium"
        warnings.append("字幕或转写偏少，适合先写有限摘要；要详细笔记就补看关键帧，或写明覆盖范围")
    if minutes > 0 and chars == 0:
        risk = "high" if minutes >= 10 else max(risk, "medium", key=["low", "medium", "high"].index)
        warnings.append("没有字幕也没有转写，标题和简介之外的信息全在声音和画面里：先转写或看关键帧")
    if minutes >= 30 and blocks <= max(1, parts):
        risk = max(risk, "medium", key=["low", "medium", "high"].index)
        warnings.append("长视频只有很少几块文字证据，章节可能覆盖不全")
    return {"risk": risk, "needs_visual_review": risk != "low", "chars_per_minute": round(density, 1) if density is not None else None, "warnings": warnings}


def budget(meta: dict, read: dict, speech: list, article: list, comments: list, frames: int, images: int) -> dict:
    is_article = meta.get("kind") in ("article", "image", "carousel") or not read.get("parts")
    minutes = sum(float(p.get("duration") or 0) for p in read.get("parts") or []) / 60
    speech_chars = sum(len(b["text"]) for b in speech)
    article_chars = sum(len(b["text"]) for b in article)
    n_comments = len(comments) + sum(b["replies"] for b in comments)
    q = quality(meta)
    clip = not is_article and 0 < minutes < CLIP_MINUTES
    if is_article:
        content_chars, blocks = article_chars, len(article)
        if article_chars < 1500:  # a short post: the note should not outgrow the post itself
            base = clamp(200 + article_chars * 0.5 + images * 40 + min(n_comments, 100) * 3, 300, 1500)
        else:
            base = clamp(700 + article_chars / 450 * 25 + article_chars * 0.06 + blocks * 6 + images * 30 + min(n_comments, 300) * 3, 1200, 45000)
    elif clip:
        # A clip carries one idea, much of it on screen; a 1200-char floor would force padding.
        content_chars, blocks = speech_chars, len(speech)
        base = clamp(250 + minutes * 120 + speech_chars * 0.3 + frames * 30 + min(n_comments, 100) * 3, 400, 1200)
    else:
        content_chars, blocks = speech_chars, len(speech)
        base = clamp(600 + minutes * 35 + speech_chars * 0.025 + blocks * 8 + min(n_comments, 300) * 3, 1200, 45000)
    low = clamp(base * q["quality_multiplier"], 300 if is_article and article_chars < 1500 else 400 if clip else 1200, 65000)
    high = clamp(low * 1.45, 600 if low < 1200 else 1800, 65000)
    parts = len(read.get("parts") or [])
    if is_article:
        granularity = "long_article" if article_chars >= 12000 else "medium_article" if article_chars >= 4000 else "short_article"
        guidance = {
            "long_article": "按文章章节写学习型笔记，保留概念、方案对比、代码块、图片结论和选择建议",
            "medium_article": "保留文章结构、核心概念、关键图示和实践建议",
            "short_article": "提炼核心观点和关键图片信息，避免过度扩写",
        }[granularity]
        visual = {"risk": "not_applicable", "needs_visual_review": False, "warnings": [] if not images else ["图片里的信息要看 images_sheet_NN.jpg，看不了图就写明没覆盖"]}
    else:
        visual = visual_dependency(minutes, speech_chars, blocks, parts)
        if minutes >= 120 or parts >= 10:
            granularity, guidance = "long_course", "按模块或分P写，保留逐P表；不要压成短视频式摘要"
        elif minutes >= 25:
            granularity, guidance = "medium_deep_dive", "保留章节结构、关键论点、方法步骤和代表证据"
        elif clip:
            granularity, guidance = "clip", "按短视频的精简结构写：一个核心观点或一套操作，配画面里的关键信息，不展开成课程笔记"
        else:
            granularity, guidance = "short_video", "以核心观点、证据和少量实践建议为主，避免过度扩写"
    return {
        "content_type": "article" if is_article else "video",
        "duration_minutes": round(minutes, 2),
        "parts": parts,
        "content_chars": content_chars,
        "speech_chars": speech_chars,
        "article_chars": article_chars,
        "text_blocks": blocks,
        "keyframes": frames,
        "images": images,
        "comments": n_comments,
        "visual_dependency": visual,
        "quality": q,
        "recommended_note_chars_min": low,
        "recommended_note_chars_max": high,
        "quick_note_chars": clamp(low * 0.45, 200 if clip else 800, 12000),
        "granularity": granularity,
        "writing_guidance": guidance,
    }


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) != 2 or sys.argv[1] in ("-h", "--help"):
        print(__doc__)
        return 2
    folder = Path(sys.argv[1]).resolve()
    meta = json.loads((folder / "meta.json").read_text(encoding="utf-8"))
    read_path = folder / "read.json"
    if meta.get("parts") and not read_path.exists():
        raise SystemExit(f"{folder} has video but no read.json: run agent-io's video_read.py on it first")
    read = json.loads(read_path.read_text(encoding="utf-8")) if read_path.exists() else {}
    parts = [p for p in meta.get("parts") or [] if p.get("video") or p.get("subtitles")]
    speech, coverage = text_blocks(folder, parts)
    article = article_blocks(folder, meta) if meta.get("kind") in ("article", "image", "carousel") else []
    images = list((meta.get("files") or {}).get("images") or [])
    frames = (json.loads((folder / "keyframes.json").read_text(encoding="utf-8")).get("frames") or []) if (folder / "keyframes.json").exists() else []
    comments = comment_blocks(folder)
    evidence = (
        speech
        + [{"id": f["id"], "type": "keyframe", "page": f["page"], "text": f"{f['time']}，{f.get('sheet', '联系图')} 第 {f['row']} 行第 {f['column']} 列，单帧 {f['file']}"} for f in frames]
        + article
        + [{"id": f"IMG-{i:02d}", "type": "image", "text": name} for i, name in enumerate(images, 1)]
        + comments
    )
    out = folder / "note"
    out.mkdir(exist_ok=True)
    (out / "evidence.jsonl").write_text("".join(json.dumps(e, ensure_ascii=False) + "\n" for e in evidence), encoding="utf-8")
    md = [f"# 证据索引：{meta.get('title')}", "", f"来源：{meta.get('url')}", ""]
    for e in evidence:
        md += [f"## {e['id']}", "", e["text"], ""]
    (out / "evidence.md").write_text("\n".join(md), encoding="utf-8")
    plan = budget(meta, read, speech, article, comments, len(frames), len(images))
    plan["text_coverage"] = coverage
    plan["evidence_total"] = len(evidence)
    (out / "budget.json").write_text(json.dumps(plan, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({
        "folder": str(folder),
        "evidence": len(evidence),
        "granularity": plan["granularity"],
        "recommended_note_chars": [plan["recommended_note_chars_min"], plan["recommended_note_chars_max"]],
        "visual_dependency": plan["visual_dependency"]["risk"],
        "warnings": plan["visual_dependency"]["warnings"],
        "text_coverage": coverage,
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
