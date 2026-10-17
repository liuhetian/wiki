"""One-command Bili Note extraction runner.

This script orchestrates the stable, non-LLM parts of the workflow:
metadata, subtitles, gateway transcripts, comments, archive, and evidence
indexes. It intentionally does not write the final analytical summary; the
agent should read the archive and write the user-facing Markdown note.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


SCRIPT_DIR = Path(__file__).resolve().parent
EXTRACT_SCRIPT = SCRIPT_DIR / "extract_bilibili.py"
EXTRACT_OPUS_SCRIPT = SCRIPT_DIR / "extract_bilibili_opus.py"
KEYFRAME_SCRIPT = SCRIPT_DIR / "extract_video_keyframes.py"
ARCHIVE_SCRIPT = SCRIPT_DIR / "archive_bili_materials.py"


def configure_stdout() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")


configure_stdout()


def safe_slug(value: str, default: str = "video") -> str:
    value = re.sub(r"[^\w\u4e00-\u9fff.-]+", "_", value, flags=re.UNICODE).strip("_")
    return value[:90] or default


def find_bvid(source: str) -> str:
    match = re.search(r"BV[0-9A-Za-z]+", source)
    return match.group(0) if match else safe_slug(source, "bili")


def source_kind(source: str) -> str:
    if re.search(r"(?:opus|dynamic)/\d+", source) or re.fullmatch(r"\d{12,}", source.strip()):
        return "opus"
    return "video"


def find_source_id(source: str) -> str:
    if source_kind(source) == "opus":
        match = re.search(r"(?:opus|dynamic)/(\d+)", source)
        if not match:
            match = re.search(r"\b(\d{12,})\b", source)
        return match.group(1) if match else safe_slug(source, "opus")
    return find_bvid(source)


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def run_cmd(cmd: list[str], *, dry_run: bool = False) -> dict[str, Any]:
    if dry_run:
        return {"cmd": cmd, "returncode": 0, "skipped": True, "reason": "dry_run"}
    env = os.environ.copy()
    env.setdefault("PYTHONIOENCODING", "utf-8")
    result = subprocess.run(cmd, text=True, capture_output=True, encoding="utf-8", errors="replace", env=env)
    return {
        "cmd": cmd,
        "returncode": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }


def command_text(cmd: list[str]) -> str:
    return " ".join(f'"{part}"' if " " in part else part for part in cmd)


def public_subtitle_count(work_dir: Path) -> int:
    path = work_dir / "subtitle_manifest.json"
    if not path.exists() or path.stat().st_size <= 2:
        return 0
    try:
        data = read_json(path)
    except json.JSONDecodeError:
        return 0
    return len(data) if isinstance(data, list) else 0


def transcript_parts(work_dir: Path) -> int:
    path = work_dir / "transcript_manifest.json"
    if not path.exists():
        return 0
    try:
        data = read_json(path)
    except json.JSONDecodeError:
        return 0
    return len(data.get("outputs") or []) if isinstance(data, dict) else 0


def comments_available(work_dir: Path) -> bool:
    return (work_dir / "comments_raw.json").exists()


def metadata_available(work_dir: Path) -> bool:
    return (work_dir / "metadata.json").exists()


def _local_output_path(work_dir: Path, value: Any) -> Path | None:
    if not value:
        return None
    raw = Path(str(value))
    candidate = raw if raw.is_absolute() else work_dir / raw
    try:
        candidate.resolve().relative_to(work_dir.resolve())
    except ValueError:
        return None
    return candidate if candidate.is_file() else None


def _subtitle_file_chars(path: Path) -> int:
    try:
        if path.suffix.lower() == ".json":
            payload = read_json(path)
            segments = payload.get("body") or payload.get("segments") or []
            total = 0
            for segment in segments:
                if not isinstance(segment, dict):
                    continue
                total += len(str(segment.get("content") or segment.get("text") or "").strip())
            return total
        return sum(len(line.strip()) for line in path.read_text(encoding="utf-8", errors="replace").splitlines())
    except (OSError, UnicodeError, json.JSONDecodeError, TypeError, AttributeError):
        return 0


def _subtitle_records(work_dir: Path) -> tuple[str | None, list[dict[str, Any]]]:
    for name in ("subtitle_manifest.json", "transcript_manifest.json"):
        path = work_dir / name
        if not path.exists() or path.stat().st_size <= 2:
            continue
        try:
            payload = read_json(path)
        except (OSError, json.JSONDecodeError):
            continue
        if isinstance(payload, list):
            outputs = payload
        elif isinstance(payload, dict):
            outputs = payload.get("outputs") or []
        else:
            outputs = []
        records: list[dict[str, Any]] = []
        for item in outputs:
            if not isinstance(item, dict):
                continue
            files = item.get("files") or {
                key: item.get(key)
                for key in ("txt", "json", "srt")
                if item.get(key)
            }
            chars = 0
            for key in ("txt", "json"):
                subtitle_path = _local_output_path(work_dir, files.get(key))
                if subtitle_path:
                    chars = _subtitle_file_chars(subtitle_path)
                    if chars:
                        break
            records.append(
                {
                    "page": item.get("page"),
                    "chars": chars,
                    "has_text": chars > 0,
                }
            )
        if any(item["has_text"] for item in records):
            return name, records

    return None, []


def _selected_page_summary(work_dir: Path, parts: str) -> tuple[float, int]:
    metadata_path = work_dir / "metadata.json"
    if not metadata_path.exists():
        return 0.0, 0
    try:
        payload = read_json(metadata_path)
    except (OSError, json.JSONDecodeError):
        return 0.0, 0
    data = payload.get("data") if isinstance(payload, dict) else {}
    if not isinstance(data, dict):
        data = {}
    pages = data.get("pages") or []
    if not isinstance(pages, list):
        pages = []

    selected_keys: set[tuple[str, str]] = set()
    summary_path = work_dir / "run_summary.json"
    if summary_path.exists():
        try:
            summary = read_json(summary_path)
            for item in summary.get("parts_selected") or []:
                if isinstance(item, dict):
                    selected_keys.add((str(item.get("page")), str(item.get("cid"))))
        except (OSError, json.JSONDecodeError, AttributeError):
            pass

    if selected_keys:
        selected = [
            page
            for page in pages
            if (str(page.get("page")), str(page.get("cid"))) in selected_keys
        ]
    elif parts == "all":
        selected = pages
    elif parts and parts != "key":
        try:
            wanted = {int(value.strip()) for value in parts.split(",") if value.strip()}
        except ValueError:
            wanted = set()
        selected = [page for page in pages if int(page.get("page") or 0) in wanted]
    else:
        selected = pages[:1]

    duration = sum(float(page.get("duration") or 0) for page in selected)
    if not duration:
        duration = float(data.get("duration") or 0)
    return duration, len(selected) or int(data.get("videos") or 0)


def visual_preflight(work_dir: Path, parts: str) -> dict[str, Any]:
    duration_seconds, part_count = _selected_page_summary(work_dir, parts)
    manifest_name, records = _subtitle_records(work_dir)
    chars_by_page: dict[str, int] = {}
    for item in records:
        page = str(item.get("page") or len(chars_by_page) + 1)
        chars_by_page[page] = max(chars_by_page.get(page, 0), int(item.get("chars") or 0))
    subtitle_chars = sum(chars_by_page.values())
    duration_minutes = duration_seconds / 60 if duration_seconds else 0.0
    density = subtitle_chars / duration_minutes if duration_minutes else None
    estimated_evidence_blocks = (subtitle_chars + 549) // 550 if subtitle_chars else 0

    risk = "low"
    reasons: list[str] = []
    if duration_minutes >= 25 and subtitle_chars <= 800:
        risk = "high"
        reasons.append("long_video_sparse_subtitles")
    elif duration_minutes >= 30 and density is not None and density < 120:
        risk = "high"
        reasons.append("low_subtitle_density")
    elif duration_minutes >= 15 and density is not None and density < 180:
        risk = "medium"
        reasons.append("medium_subtitle_density")
    elif duration_minutes >= 10 and subtitle_chars == 0:
        risk = "high"
        reasons.append("no_subtitles")
    elif duration_minutes >= 30 and estimated_evidence_blocks <= max(1, part_count):
        risk = "medium"
        reasons.append("few_text_blocks_for_duration")

    if not metadata_available(work_dir):
        status = "unknown"
        recommendation = "无法完成预检；如果视频主要依赖 PPT、代码、界面或板书，建议开启。"
    elif not manifest_name:
        status = "partial"
        recommendation = "当前没有可统计字幕；如果画面承担主要信息，建议开启。"
    elif risk in {"medium", "high"}:
        status = "ok"
        recommendation = "建议开启，字幕覆盖可能不足以支撑完整理解。"
    else:
        status = "ok"
        recommendation = "可以关闭，以节省视觉输入；如果视频以 PPT、代码、界面或板书为主，建议开启。"

    return {
        "status": status,
        "parts": part_count,
        "duration_seconds": round(duration_seconds, 3),
        "duration_minutes": round(duration_minutes, 3),
        "subtitle_source": manifest_name,
        "subtitle_parts": sum(1 for value in chars_by_page.values() if value > 0),
        "subtitle_chars": subtitle_chars,
        "subtitle_chars_per_minute": round(density, 3) if density is not None else None,
        "estimated_evidence_blocks": estimated_evidence_blocks,
        "risk": risk,
        "reasons": reasons,
        "recommendation": recommendation,
    }


def print_visual_preflight(preflight: dict[str, Any]) -> None:
    duration = preflight.get("duration_minutes")
    density = preflight.get("subtitle_chars_per_minute")
    duration_text = f"{duration} 分钟" if duration else "未知"
    density_text = f"{density} 字/分钟" if density is not None else "未知"
    source = preflight.get("subtitle_source") or "无可用字幕文件"
    print("轻量预检（尚未下载视频）：")
    print(f"- 时长：{duration_text}；分P：{preflight.get('parts') or '未知'}")
    print(f"- 字幕：{preflight.get('subtitle_chars', 0)} 字；密度：{density_text}；来源：{source}")
    print(f"- 画面依赖风险：{preflight.get('risk', 'unknown')}")
    print(f"- 建议：{preflight.get('recommendation', '请按内容是否依赖画面决定。')}")


def safe_relative_path(value: Any) -> Path | None:
    if not value:
        return None
    path = Path(str(value))
    if path.is_absolute() or ".." in path.parts:
        return None
    return path


def keyframe_manifest_signature(path: Path) -> tuple[Any, ...] | None:
    if not path.exists():
        return None
    try:
        manifest = read_json(path)
    except (OSError, json.JSONDecodeError):
        return None
    frames = tuple(
        (item.get("evidence_id"), item.get("page"), item.get("cid"), item.get("timestamp_seconds"), item.get("file"))
        for item in manifest.get("frames") or []
        if isinstance(item, dict)
    )
    return (
        manifest.get("bvid"),
        manifest.get("parts"),
        manifest.get("requested_video_source"),
        manifest.get("frame_count"),
        frames,
    )


def archive_available(
    archive_dir: Path | None,
    *,
    require_keyframes: bool = False,
    keyframe_manifest_path: Path | None = None,
    visual_review: str | None = None,
) -> bool:
    if not archive_dir:
        return False
    if not (archive_dir / "indexes" / "证据索引.jsonl").exists():
        return False
    if visual_review == "off" and (archive_dir / "metadata" / "keyframes_manifest.json").exists():
        return False
    if not require_keyframes:
        return True
    manifest_path = archive_dir / "metadata" / "keyframes_manifest.json"
    if keyframe_manifest_path:
        archive_signature = keyframe_manifest_signature(manifest_path)
        work_signature = keyframe_manifest_signature(keyframe_manifest_path)
        if not work_signature or archive_signature != work_signature:
            return False
    if not manifest_path.exists():
        return False
    try:
        manifest = read_json(manifest_path)
    except (OSError, json.JSONDecodeError):
        return False
    frames = manifest.get("frames") or []
    if manifest.get("status") != "ok" or manifest.get("frame_count") != len(frames):
        return False
    sheet = safe_relative_path(manifest.get("sheet"))
    if not sheet or not (archive_dir / sheet).is_file():
        return False
    for item in frames:
        if not isinstance(item, dict):
            return False
        image = safe_relative_path(item.get("file"))
        if not image or not (archive_dir / image).is_file():
            return False
    return bool(frames)


def keyframes_available(
    work_dir: Path,
    *,
    source: str | None = None,
    parts: str | None = None,
    count: int | None = None,
) -> bool:
    manifest_path = work_dir / "keyframes_manifest.json"
    sheet_path = work_dir / "keyframes" / "contact_sheet.png"
    if not manifest_path.exists() or not sheet_path.exists():
        return False
    try:
        manifest = read_json(manifest_path)
    except json.JSONDecodeError:
        return False
    frames = manifest.get("frames") or []
    if manifest.get("status") != "ok" or not frames:
        return False
    if manifest.get("frame_count") != len(frames):
        return False
    if source and manifest.get("bvid") != find_bvid(source):
        return False
    if parts is not None and manifest.get("parts") != parts:
        return False
    if count is not None and manifest.get("frame_count") != count:
        return False
    for item in frames:
        if not isinstance(item, dict):
            return False
        relative = safe_relative_path(item.get("file"))
        if not relative or not (work_dir / relative).is_file():
            return False
    return True


def article_available(work_dir: Path) -> bool:
    return (work_dir / "article_content.md").exists() and (work_dir / "article_evidence.jsonl").exists()


def summarize_outputs(
    work_dir: Path,
    archive_dir: Path | None,
    *,
    visual_review: str | None = None,
) -> dict[str, Any]:
    public_subtitles = public_subtitle_count(work_dir)
    keyframes_enabled = visual_review != "off" and keyframes_available(work_dir)
    summary: dict[str, Any] = {
        "work_dir": str(work_dir),
        "metadata": metadata_available(work_dir),
        "public_subtitle_tracks": public_subtitles,
        "transcript_parts": transcript_parts(work_dir),
        "article_content": article_available(work_dir),
        "images_manifest": (work_dir / "images_manifest.json").exists(),
        "comments": comments_available(work_dir),
        "keyframes": {
            "enabled": keyframes_enabled,
            "manifest": str(work_dir / "keyframes_manifest.json") if keyframes_enabled else None,
            "contact_sheet": str(work_dir / "keyframes" / "contact_sheet.png") if keyframes_enabled else None,
            "visual_review": visual_review,
        },
    }
    if archive_dir:
        summary["archive_dir"] = str(archive_dir)
        for rel in (
            "indexes/图文全集.jsonl",
            "indexes/图文证据索引.jsonl",
            "indexes/字幕全集.jsonl",
            "indexes/字幕证据索引.jsonl",
            "indexes/评论全集.jsonl",
            "indexes/证据索引.jsonl",
        ):
            path = archive_dir / rel
            if path.exists():
                summary[rel] = {
                    "path": str(path),
                    "lines": sum(1 for _ in path.open(encoding="utf-8")),
                }
    return summary


def write_report(work_dir: Path, archive_dir: Path | None, steps: list[dict[str, Any]], summary: dict[str, Any]) -> None:
    report = {
        "steps": steps,
        "summary": summary,
    }
    write_json(work_dir / "bili_note_run_report.json", report)
    md = ["# Bili Note Run Report", "", "## Summary", ""]
    for key, value in summary.items():
        md.append(f"- {key}: {value}")
    md.extend(["", "## Steps", ""])
    for step in steps:
        status = "skipped" if step.get("skipped") else ("ok" if step.get("returncode") == 0 else "failed")
        md.append(f"### {step.get('name', 'step')} - {status}")
        if step.get("reason"):
            md.append(f"- reason: {step['reason']}")
        if step.get("cmd"):
            md.append(f"- command: `{command_text(step['cmd'])}`")
        if step.get("returncode") not in (None, 0):
            md.append(f"- returncode: {step['returncode']}")
        md.append("")
    if archive_dir:
        md.extend(
            [
                "## Next",
                "",
                "Use the evidence index when writing the final note:",
                "",
                f"- `{archive_dir / 'indexes' / '证据索引.jsonl'}`",
                f"- `{archive_dir / 'indexes' / '字幕全集.md'}`",
                "",
            ]
        )
    (work_dir / "bili_note_run_report.md").write_text("\n".join(md), encoding="utf-8")


def append_step(steps: list[dict[str, Any]], name: str, result: dict[str, Any]) -> None:
    result = {"name": name, **result}
    steps.append(result)
    status = "SKIP" if result.get("skipped") else ("OK" if result.get("returncode") == 0 else "FAIL")
    print(f"[{status}] {name}", flush=True)
    if result.get("returncode") not in (None, 0):
        if result.get("stderr"):
            print(result["stderr"], file=sys.stderr)
        raise SystemExit(result["returncode"])


def resolve_visual_review(mode: str, preflight: dict[str, Any] | None = None) -> str:
    if mode in {"on", "off"}:
        return mode
    if preflight:
        print_visual_preflight(preflight)
    print("本次视频运行是否开启关键帧视觉理解？")
    print("开启：抽取最多 12 帧，先拼成 4×3 联系图，可能增加视觉输入 tokens。")
    print("关闭：只使用字幕、转写、评论和元数据，节省视觉输入 tokens。")
    print("请输入 on/off：", end="", flush=True)
    try:
        answer = input().strip().lower()
    except EOFError as exc:
        raise SystemExit("没有收到关键帧理解选择；请明确传入 --visual-review on 或 --visual-review off。") from exc
    if answer in {"on", "yes", "y", "1", "开启", "开"}:
        return "on"
    if answer in {"off", "no", "n", "0", "关闭", "关"}:
        return "off"
    raise SystemExit("关键帧理解选择无效；请使用 on/off。")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Bili Note extraction, archive, and evidence indexing")
    parser.add_argument("source", help="Bilibili video/opus URL, BVID, or opus id")
    parser.add_argument("--work-dir", help="Temporary extraction directory")
    parser.add_argument("--archive-dir", help="Permanent archive directory")
    parser.add_argument("--parts", default="all", help="'all', 'key', or comma-separated page numbers")
    parser.add_argument("--comments", action="store_true", help="Fetch comments")
    parser.add_argument(
        "--download-images",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Download opus/article images when source is a Bilibili opus page",
    )
    parser.add_argument("--subtitle-mode", choices=["auto", "public", "none"], default="auto")
    parser.add_argument(
        "--transcribe",
        action="store_true",
        help="When no public subtitle track exists, download via the share-link gateway and transcribe with MAI-Transcribe-2",
    )
    parser.add_argument("--asr-language", help="Language code for transcription such as zh or en; omit to auto-detect")
    parser.add_argument(
        "--visual-review",
        choices=["ask", "on", "off"],
        default="ask",
        help="Video keyframe visual review; ask is the mandatory default",
    )
    parser.add_argument("--keyframe-count", type=int, default=12, help="Representative frames when visual review is on (1-12)")
    parser.add_argument("--archive", action=argparse.BooleanOptionalAction, default=True, help="Archive materials when archive-dir is set")
    parser.add_argument("--force", action="store_true", help="Re-run stages even if outputs exist")
    parser.add_argument("--dry-run", action="store_true", help="Print planned stages without running them")
    args = parser.parse_args()

    source_id = find_source_id(args.source)
    work_dir = (Path(args.work_dir) if args.work_dir else Path.cwd() / f"tmp_bili_note_{safe_slug(source_id)}").resolve()
    archive_dir = Path(args.archive_dir).resolve() if args.archive_dir else None
    work_dir.mkdir(parents=True, exist_ok=True)
    steps: list[dict[str, Any]] = []
    kind = source_kind(args.source)

    if kind == "opus":
        need_extract = args.force or not article_available(work_dir)
        if need_extract:
            cmd = [sys.executable, str(EXTRACT_OPUS_SCRIPT), args.source, "--out", str(work_dir)]
            if not args.download_images:
                cmd.append("--no-download-images")
            if args.comments:
                cmd.append("--comments")
            if args.force:
                cmd.append("--force")
            append_step(steps, "opus_content_images", run_cmd(cmd, dry_run=args.dry_run))
        else:
            append_step(
                steps,
                "opus_content_images",
                {"skipped": True, "reason": "article content already available", "returncode": 0},
            )
        if args.archive and archive_dir:
            if args.force or not archive_available(archive_dir):
                cmd = [
                    sys.executable,
                    str(ARCHIVE_SCRIPT),
                    "--extract-dir",
                    str(work_dir),
                    "--archive-dir",
                    str(archive_dir),
                ]
                append_step(steps, "archive_materials", run_cmd(cmd, dry_run=args.dry_run))
            else:
                append_step(
                    steps,
                    "archive_materials",
                    {"skipped": True, "reason": "archive evidence index already exists", "returncode": 0},
                )
        elif args.archive and not archive_dir:
            append_step(
                steps,
                "archive_materials",
                {"skipped": True, "reason": "no --archive-dir provided", "returncode": 0},
            )

        summary = summarize_outputs(work_dir, archive_dir)
        summary["kind"] = "opus"
        write_report(work_dir, archive_dir, steps, summary)
        print(json.dumps(summary, ensure_ascii=False, indent=2), flush=True)
        return 0

    need_extract = args.force or not metadata_available(work_dir)
    need_public_subtitles = args.subtitle_mode in ("auto", "public") and (args.force or public_subtitle_count(work_dir) == 0)
    need_comments = args.comments and (args.force or not comments_available(work_dir))

    if need_extract or need_public_subtitles or need_comments:
        cmd = [sys.executable, str(EXTRACT_SCRIPT), args.source, "--out", str(work_dir), "--parts", args.parts]
        if args.subtitle_mode in ("auto", "public"):
            cmd.append("--download-subtitles")
        if args.comments:
            cmd.append("--comments")
        if args.force:
            cmd.append("--force")
        append_step(steps, "metadata_public_subtitles_comments", run_cmd(cmd, dry_run=args.dry_run))
    else:
        append_step(
            steps,
            "metadata_public_subtitles_comments",
            {"skipped": True, "reason": "metadata/subtitles/comments already available", "returncode": 0},
        )

    public_tracks = public_subtitle_count(work_dir)
    if not args.transcribe:
        append_step(
            steps,
            "audio_transcription",
            {"skipped": True, "reason": f"--transcribe not given; public_tracks={public_tracks}", "returncode": 0},
        )
    elif public_tracks > 0 and args.subtitle_mode != "none":
        append_step(
            steps,
            "audio_transcription",
            {"skipped": True, "reason": f"public subtitles available; public_tracks={public_tracks}", "returncode": 0},
        )
    elif not args.force and transcript_parts(work_dir) > 0:
        append_step(
            steps,
            "audio_transcription",
            {"skipped": True, "reason": "transcripts already available", "returncode": 0},
        )
    else:
        cmd = [sys.executable, str(EXTRACT_SCRIPT), args.source, "--out", str(work_dir), "--parts", args.parts, "--transcribe"]
        if args.asr_language:
            cmd.extend(["--asr-language", args.asr_language])
        if args.force:
            cmd.append("--force")
        append_step(steps, "audio_transcription", run_cmd(cmd, dry_run=args.dry_run))

    preflight = visual_preflight(work_dir, args.parts)
    write_json(work_dir / "visual_preflight.json", preflight)
    append_step(
        steps,
        "visual_preflight",
        {
            "returncode": 0,
            "preflight": preflight,
            "reason": "metadata and text coverage inspected before keyframe choice",
        },
    )
    visual_review = resolve_visual_review(args.visual_review, preflight)
    write_json(
        work_dir / "visual_review_choice.json",
        {"visual_review": visual_review, "source": args.source, "parts": args.parts},
    )
    append_step(
        steps,
        "visual_review_choice",
        {
            "returncode": 0,
            "visual_review": visual_review,
            "skipped": visual_review == "off",
            "reason": "user disabled keyframe visual review" if visual_review == "off" else None,
        },
    )

    if visual_review == "on":
        if args.force or not keyframes_available(
            work_dir,
            source=args.source,
            parts=args.parts,
            count=args.keyframe_count,
        ):
            cmd = [
                sys.executable,
                str(KEYFRAME_SCRIPT),
                args.source,
                "--out",
                str(work_dir),
                "--parts",
                args.parts,
                "--count",
                str(args.keyframe_count),
            ]
            if args.force:
                cmd.append("--force")
            append_step(steps, "keyframe_extraction", run_cmd(cmd, dry_run=args.dry_run))
        else:
            append_step(
                steps,
                "keyframe_extraction",
                {"skipped": True, "reason": "keyframe manifest and contact sheet already available", "returncode": 0},
            )
    elif visual_review == "off":
        append_step(
            steps,
            "keyframe_extraction",
            {"skipped": True, "reason": "user disabled keyframe visual review", "returncode": 0},
        )

    if args.archive and archive_dir:
        archive_matches_run = archive_available(
            archive_dir,
            require_keyframes=visual_review == "on",
            keyframe_manifest_path=work_dir / "keyframes_manifest.json" if visual_review == "on" else None,
            visual_review=visual_review,
        )
        if args.force or not archive_matches_run:
            cmd = [
                sys.executable,
                str(ARCHIVE_SCRIPT),
                "--extract-dir",
                str(work_dir),
                "--archive-dir",
                str(archive_dir),
            ]
            append_step(steps, "archive_materials", run_cmd(cmd, dry_run=args.dry_run))
        else:
            append_step(
                steps,
                "archive_materials",
                {"skipped": True, "reason": "archive evidence index already exists", "returncode": 0},
            )
    elif args.archive and not archive_dir:
        append_step(
            steps,
            "archive_materials",
            {"skipped": True, "reason": "no --archive-dir provided", "returncode": 0},
        )

    summary = summarize_outputs(work_dir, archive_dir, visual_review=visual_review)
    summary["visual_review"] = visual_review
    summary["visual_preflight"] = preflight
    write_report(work_dir, archive_dir, steps, summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
