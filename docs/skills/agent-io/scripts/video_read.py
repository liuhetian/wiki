#!/usr/bin/env python3
"""Read a video for an AI agent: keyframes to look at and a transcript to read.

Run `python3 video_read.py <folder or video file>...`. Standard library plus ffmpeg and ffprobe;
transcription needs MY_API_KEY in the environment.

Input:
    a download folder             from xiaohongshu.py, douyin.py, bilibili.py or xiazaitool.py: reads
                                  meta.json's parts and writes into the same folder
    a video file                  writes into <file name without extension>_read/ beside it

Writes:
    keyframes/NN.jpg              each frame alone, long side at most 1920: read UI text and code here
    keyframes/contact_sheet_NN.jpg  12 frames a sheet, numbered like keyframes/, read row by row;
                                  look at these first
    keyframes.json                per frame: id (KF-P01-03), part, time, sheet, row, column, file,
                                  and the scene-change score when frames follow scene changes
    images_sheet_NN.jpg           posts with pictures: 12 per sheet, numbered in the order of images/
    transcripts/pNN.txt|.srt|.json  speech to text, one line per sentence; word timestamps in .json
    read.json                     per part: duration, size, loudness, subtitle and transcript chars;
                                  text chars per minute, frame mode, transcription cost, warnings

Frames: videos up to 3 minutes follow scene changes, the biggest changes first, up to 24 frames,
each taken just before the next cut: short tutorials flash a prompt or a settings screen for a few
seconds, which evenly spaced frames miss, and type it out, which a frame right after the cut cuts off.
Gaps of more than 6 s without a cut (a slowly scrolling screen recording) get a frame every 4 s.
Longer videos get 12 frames evenly spaced, at least one per part. --frames and --mode override;
--at adds frames at given times, for a span the automatic picks missed.
--transcribe auto (default) transcribes parts that have a video, no subtitle and audible sound;
always / never override that. A silent track (max volume under -50 dB) is never sent: it is billed
and comes back empty. MAI-Transcribe-2 costs about 0.1 USD an hour; read.json adds up usage.cost.
Temporary files go inside the output folder, not the system temp directory.
Outputs that already exist are kept; --force redoes keyframes and sheets, --retranscribe the transcripts.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path


TRANSCRIBE = "https://openrouter.reverse-pro.xyz/api/v1/audio/transcriptions"
MODEL = "microsoft/mai-transcribe-2"
COLUMNS, ROWS = 4, 3
PER_SHEET = COLUMNS * ROWS
LANDSCAPE_CELL, PORTRAIT_CELL, IMAGE_CELL = (320, 180), (180, 320), (300, 400)
CLIP_SECONDS = 180
SCENE_THRESHOLD = 0.15
SILENT_DB = -50.0
SENTENCE_ENDS = set("。！？!?；;…")
SOFT_BREAKS = set("，,、：:")


def ffmpeg(*args: str) -> subprocess.CompletedProcess:
    try:
        return subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", *args], check=True, capture_output=True, text=True)
    except FileNotFoundError as exc:
        raise SystemExit("video_read.py needs ffmpeg and ffprobe on PATH") from exc


def probe(video: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height:format=duration", "-of", "json", str(video)],
        check=True, capture_output=True, text=True,
    ).stdout
    info = json.loads(out or "{}")
    streams = info.get("streams") or []
    v = next((s for s in streams if s.get("codec_type") == "video"), {})
    return {
        "duration": round(float((info.get("format") or {}).get("duration") or 0), 3),
        "width": int(v.get("width") or 0),
        "height": int(v.get("height") or 0),
        "has_audio": any(s.get("codec_type") == "audio" for s in streams),
    }


def max_volume(video: Path) -> float | None:
    """Loudest sample of the audio track in dB; -91 means digital silence."""
    result = ffmpeg("-i", str(video), "-vn", "-af", "volumedetect", "-f", "null", "-")
    match = re.search(r"max_volume:\s*(-?[\d.]+|-inf) dB", result.stderr)
    if not match:
        return None
    return -91.0 if match.group(1) == "-inf" else float(match.group(1))


def clock(seconds: float) -> str:
    s = int(round(seconds))
    return f"{s // 3600:02d}:{s // 60 % 60:02d}:{s % 60:02d}"


def srt_time(seconds: float) -> str:
    ms = max(0, int(round(float(seconds or 0) * 1000)))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


# ---------------------------------------------------------------- frames

def uniform_points(parts: list[dict], count: int) -> list[tuple[dict, float, None, str]]:
    """Evenly spaced over the total duration, then every part that got none takes one in its middle."""
    durations = [max(1.0, float(p["duration"] or 0)) for p in parts]
    starts = [sum(durations[:i]) for i in range(len(parts))]
    total = sum(durations)
    owner = lambda mark: max(i for i, s in enumerate(starts) if s <= mark)  # noqa: E731
    marks = [(i + 0.5) / count * total for i in range(count)]
    for missing in [i for i in range(len(parts)) if not any(owner(m) == i for m in marks)][: count]:
        crowded = max(range(len(parts)), key=lambda i: sum(owner(m) == i for m in marks))
        marks.remove(max(m for m in marks if owner(m) == crowded))
        marks.append(starts[missing] + durations[missing] / 2)
    return [(parts[owner(m)], m - starts[owner(m)], None, "uniform") for m in sorted(marks)]


def scene_points(parts: list[dict], limit: int) -> list[tuple[dict, float, float | None, str]]:
    """The biggest scene changes, each shown just before the next cut: a prompt typed out letter by letter
    or a menu that unfolds is complete by then, half-drawn right after the cut."""
    total = sum(max(1.0, float(p["duration"] or 0)) for p in parts)
    points: list[tuple[dict, float, float | None, str]] = []
    for part in parts:
        duration = max(1.0, float(part["duration"] or 0))
        share = max(1, round(limit * duration / total))
        result = ffmpeg("-i", str(part["path"]), "-an", "-vf", f"scale=320:-2,select='gt(scene,{SCENE_THRESHOLD})',metadata=print:file=-", "-f", "null", "-")
        cuts, t = [], None
        for line in result.stdout.splitlines():
            if m := re.search(r"pts_time:([\d.]+)", line):
                t = float(m.group(1))
            elif (m := re.search(r"lavfi\.scene_score=([\d.]+)", line)) and t is not None:
                cuts.append((t, float(m.group(1))))
        chosen = [(0.0, None)]  # the opening frame, before any cut
        for t, score in sorted(cuts, key=lambda c: -c[1]):
            if len(chosen) >= share:
                break
            if all(abs(t - c) > 0.5 for c, _ in chosen):
                chosen.append((t, score))
        cut_times = sorted(c for c, _ in cuts)
        mine = []
        for t, score in sorted(chosen):
            following = next((c for c in cut_times if c > t + 0.05), duration)
            mine.append((min(duration - 0.1, max(t + 0.2, following - 0.3)), score, "scene"))
        # A screen recording that scrolls slowly has no cut for many seconds; put a frame every 4 s there.
        edges = [0.0] + [t for t, _, _ in mine] + [duration]
        for a, b in zip(edges, edges[1:]):
            if b - a > max(6.0, duration / 8):
                n = int((b - a) // 4)
                mine += [(a + (b - a) * k / (n + 1), None, "fill") for k in range(1, n + 1)]
        points += [(part, t, score, how) for t, score, how in sorted(mine)]
    return points


def keyframes(folder: Path, parts: list[dict], args: argparse.Namespace) -> dict:
    manifest_path = folder / "keyframes.json"
    if manifest_path.exists() and not args.force and not args.at:
        return json.loads(manifest_path.read_text(encoding="utf-8"))
    kf_dir = folder / "keyframes"
    kf_dir.mkdir(parents=True, exist_ok=True)
    for stale in kf_dir.glob("*.jpg"):
        stale.unlink()
    total = sum(float(p["duration"] or 0) for p in parts)
    mode = args.mode if args.mode != "auto" else ("scenes" if total <= CLIP_SECONDS else "uniform")
    if mode == "scenes":
        points = scene_points(parts, args.frames or 2 * PER_SHEET)
        if len(points) < 6:  # hardly any cuts: a talking head or a static screen
            points = uniform_points(parts, args.frames or PER_SHEET)
            mode = "uniform"
    else:
        points = uniform_points(parts, args.frames or PER_SHEET)
    by_page = {int(p["page"]): p for p in parts}
    for spec in filter(None, (x.strip() for x in (args.at or "").split(","))):
        page, _, seconds = spec.rpartition("@")
        part = by_page.get(int(page or parts[0]["page"]))
        if part:  # frames asked for by hand: a span the automatic picks missed
            points.append((part, min(float(seconds), float(part["duration"] or 0) - 0.1), None, "at"))
    order = {int(p["page"]): i for i, p in enumerate(parts)}
    points.sort(key=lambda pt: (order[int(pt[0]["page"])], pt[1]))
    frames, files = [], []
    for i, (part, t, score, how) in enumerate(points, 1):
        name = f"keyframes/{i:02d}.jpg"
        # Seek before -i: decoding from 00:00 to every point made 12 frames of a 50-minute lecture take 21 minutes.
        ffmpeg("-y", "-ss", f"{t:.3f}", "-i", str(part["path"]), "-frames:v", "1",
               "-vf", "scale='min(1920,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease", "-q:v", "2", str(folder / name))
        n = (i - 1) % PER_SHEET
        frames.append({
            "id": f"KF-P{part['page']:02d}-{i:02d}",
            "page": part["page"],
            "time": clock(t),
            "seconds": round(t, 3),
            "sheet": f"keyframes/contact_sheet_{(i - 1) // PER_SHEET + 1:02d}.jpg",
            "row": n // COLUMNS + 1,
            "column": n % COLUMNS + 1,
            "file": name,
            "how": how,
            **({"scene_score": round(score, 3)} if score else {}),
        })
        files.append(folder / name)
    cell = PORTRAIT_CELL if parts[0]["height"] > parts[0]["width"] else LANDSCAPE_CELL
    sheets = tile(folder, files, "keyframes/contact_sheet", cell)
    manifest = {"mode": mode, "sheets": sheets, "frames": frames}
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return manifest


def tile(folder: Path, files: list[Path], prefix: str, cell: tuple[int, int]) -> list[str]:
    """12 a sheet, numbered. Each picture is fitted into its cell first: tiling mixed sizes straight
    away silently drops some, and a short last sheet gets fewer rows instead of blank cells."""
    w, h = cell
    fit = f"scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:color=white"
    names = []
    with tempfile.TemporaryDirectory(dir=folder, prefix=".tmp-") as tmp:
        for i, src in enumerate(files, 1):
            out = str(Path(tmp) / f"{i:03d}.png")
            try:
                ffmpeg("-y", "-i", str(src), "-frames:v", "1", "-vf",
                       f"{fit},drawtext=text='{i}':x=6:y=6:fontsize=24:fontcolor=red:box=1:boxcolor=white", out)
            except subprocess.CalledProcessError:  # ffmpeg built without fonts: no number, same order
                ffmpeg("-y", "-i", str(src), "-frames:v", "1", "-vf", fit, out)
        for n in range(0, len(files), PER_SHEET):
            count = min(PER_SHEET, len(files) - n)
            cols = min(COLUMNS, count)
            name = f"{prefix}_{n // PER_SHEET + 1:02d}.jpg"
            ffmpeg("-y", "-framerate", "1", "-start_number", str(n + 1), "-i", str(Path(tmp) / "%03d.png"), "-frames:v", "1",
                   "-vf", f"tile={cols}x{-(-count // cols)}:padding=4:margin=4:color=white", "-q:v", "3", str(folder / name))
            names.append(name)
    return names


def image_sheets(folder: Path, images: list[str], force: bool) -> list[str]:
    if not images:
        return []
    names = [f"images_sheet_{n + 1:02d}.jpg" for n in range(-(-len(images) // PER_SHEET))]
    if all((folder / n).exists() for n in names) and not force:
        return names
    return tile(folder, [folder / i for i in images], "images_sheet", IMAGE_CELL)


# ---------------------------------------------------------------- transcription

def transcribe_request(audio: Path, language: str | None) -> dict:
    key = os.environ.get("MY_API_KEY", "").strip()
    if not key:
        raise SystemExit("MY_API_KEY is not set: run `set -a; . ./.env; set +a` where .env lives")
    body = {
        "model": MODEL,
        "input_audio": {"data": base64.b64encode(audio.read_bytes()).decode("ascii"), "format": "mp3"},
        "response_format": "verbose_json",
        "timestamp_granularities": ["word"],
        # Segment start and end only follow real speech when diarization is on.
        "provider": {"options": {"azure": {"diarization": {"enabled": True}}}},
    }
    if language:
        body["language"] = language
    req = urllib.request.Request(TRANSCRIBE, data=json.dumps(body).encode(), headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    last = ""
    for attempt in range(2):
        if attempt:
            time.sleep(3)
        try:
            with urllib.request.urlopen(req, timeout=600) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            last = f"HTTP {exc.code}: {exc.read().decode('utf-8', errors='replace')[:300]}"
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            last = f"{type(exc).__name__}: {exc}"
    raise RuntimeError(f"transcription failed for {audio.name}: {last}")


def join(tokens: list[str]) -> str:
    text = ""
    for token in tokens:
        if text and text[-1].isascii() and text[-1].isalnum() and token[:1].isascii() and token[:1].isalnum():
            text += " "
        text += token
    return text


def lines_from_words(words: list[dict], offset: float, max_chars: int = 40, max_gap: float = 1.5) -> list[dict]:
    """One speaker comes back as one segment per request; rebuild subtitle-sized lines from word timestamps."""
    lines: list[dict] = []
    current: list[dict] = []

    def flush() -> None:
        if current and (text := join([w["word"] for w in current]).strip()):
            lines.append({
                "start": round(float(current[0].get("start") or 0) + offset, 3),
                "end": round(float(current[-1].get("end") or 0) + offset, 3),
                "text": text,
                "speaker": current[0].get("speaker"),
            })
        current.clear()

    for word in words:
        token = str(word.get("word") or "").strip()
        if not token:
            continue
        punct = token in SOFT_BREAKS or token in SENTENCE_ENDS
        if current and not punct:
            gap = float(word.get("start") or 0) - float(current[-1].get("end") or 0)
            if gap > max_gap or word.get("speaker") != current[0].get("speaker"):
                flush()
        current.append({**word, "word": token})
        length = len(join([w["word"] for w in current]))
        if token[-1] in SENTENCE_ENDS or (token[-1] in SOFT_BREAKS and length >= max_chars) or length >= max_chars * 2:
            flush()
    flush()
    return lines


def transcribe_part(folder: Path, part: dict, language: str | None, chunk_seconds: float) -> dict:
    stem = f"transcripts/p{part['page']:02d}"
    (folder / "transcripts").mkdir(exist_ok=True)
    segments, texts, cost, detected = [], [], 0.0, None
    with tempfile.TemporaryDirectory(dir=folder, prefix=".tmp-") as tmp:
        # 16 kHz mono 32 kbps mp3 in chunks, so one request never carries a whole long lecture.
        args = ["-y", "-i", str(part["path"]), "-vn", "-ac", "1", "-ar", "16000", "-b:a", "32k"]
        if chunk_seconds > 0:
            args += ["-f", "segment", "-segment_time", str(chunk_seconds), "-reset_timestamps", "1", str(Path(tmp) / "%03d.mp3")]
        else:
            args.append(str(Path(tmp) / "000.mp3"))
        ffmpeg(*args)
        for i, chunk in enumerate(sorted(Path(tmp).glob("*.mp3"))):
            offset = i * chunk_seconds if chunk_seconds > 0 else 0.0
            result = transcribe_request(chunk, language)
            cost += float((result.get("usage") or {}).get("cost") or 0)
            detected = detected or result.get("language")
            texts.append(str(result.get("text") or "").strip())
            if result.get("words"):
                segments += lines_from_words(result["words"], offset)
            else:
                segments += [
                    {"start": round(float(s.get("start") or 0) + offset, 3), "end": round(float(s.get("end") or 0) + offset, 3),
                     "text": str(s.get("text") or "").strip(), "speaker": s.get("speaker")}
                    for s in result.get("segments") or [] if str(s.get("text") or "").strip()
                ]
    payload = {"model": MODEL, "language": language or detected, "text": "\n".join(t for t in texts if t), "segments": segments, "cost_usd": round(cost, 5)}
    (folder / f"{stem}.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    (folder / f"{stem}.txt").write_text("\n".join(s["text"] for s in segments) + "\n", encoding="utf-8")
    srt = []
    for i, s in enumerate(segments, 1):
        srt += [str(i), f"{srt_time(s['start'])} --> {srt_time(s['end'])}", s["text"], ""]
    (folder / f"{stem}.srt").write_text("\n".join(srt), encoding="utf-8")
    return {"txt": f"{stem}.txt", "srt": f"{stem}.srt", "json": f"{stem}.json", "chars": sum(len(s["text"]) for s in segments), "cost_usd": round(cost, 5)}


# ---------------------------------------------------------------- driver

def load(source: Path) -> tuple[Path, list[dict], list[str]]:
    """Folder from a download script, or a bare video file treated as a one-part folder."""
    if source.is_dir():
        meta = json.loads((source / "meta.json").read_text(encoding="utf-8"))
        parts = [
            {**p, "path": source / p["video"], "subtitle_chars": sum(int(s.get("chars") or 0) for s in p.get("subtitles") or [])}
            for p in meta.get("parts") or [] if p.get("video")
        ]
        return source, parts, list((meta.get("files") or {}).get("images") or [])
    folder = source.with_name(source.stem + "_read")
    folder.mkdir(exist_ok=True)
    return folder, [{"page": 1, "video": str(source.resolve()), "path": source.resolve(), "subtitle_chars": 0}], []


def read(source: Path, args: argparse.Namespace) -> dict:
    folder, parts, images = load(source)
    report: dict = {"folder": str(folder), "parts": [], "keyframes": None, "image_sheets": [], "cost": {"usd": 0.0}, "warnings": []}
    for part in parts:
        part.update(probe(part["path"]))
        part["max_volume_db"] = max_volume(part["path"]) if part["has_audio"] else None
    for part in parts:
        entry = {k: part.get(k) for k in ("page", "video", "duration", "width", "height", "has_audio", "max_volume_db", "subtitle_chars")}
        silent = part["max_volume_db"] is None or part["max_volume_db"] < SILENT_DB
        done = folder / f"transcripts/p{part['page']:02d}.json"
        want = args.transcribe == "always" or (args.transcribe == "auto" and not part["subtitle_chars"])
        if done.exists() and not args.retranscribe:
            cached = json.loads(done.read_text(encoding="utf-8"))
            stem = f"transcripts/p{part['page']:02d}"
            entry["transcript"] = {"txt": f"{stem}.txt", "srt": f"{stem}.srt", "json": f"{stem}.json", "chars": sum(len(s["text"]) for s in cached["segments"]), "cost_usd": 0.0}
        elif want and silent:
            entry["transcript"] = None
            report["warnings"].append(f"P{part['page']}: silent audio (max {part['max_volume_db']} dB), not transcribed")
        elif want:
            entry["transcript"] = transcribe_part(folder, part, args.language, args.chunk_seconds)
            report["cost"]["usd"] = round(report["cost"]["usd"] + entry["transcript"]["cost_usd"], 5)
            if not entry["transcript"]["chars"]:
                report["warnings"].append(f"P{part['page']}: transcript is empty; the sound is probably music only")
        else:
            entry["transcript"] = None
        report["parts"].append(entry)
    if parts:
        report["keyframes"] = keyframes(folder, parts, args)
    report["image_sheets"] = image_sheets(folder, images, args.force)
    minutes = sum(p["duration"] or 0 for p in parts) / 60
    chars = sum((p.get("subtitle_chars") or 0) + ((p.get("transcript") or {}).get("chars") or 0) for p in report["parts"])
    report["text_chars"] = chars
    report["chars_per_minute"] = round(chars / minutes, 1) if minutes else None
    if minutes >= 3 and (report["chars_per_minute"] or 0) < 80:
        report["warnings"].append("little speech for the length: the content is probably on screen, read the keyframes")
    (folder / "read.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return report


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("sources", nargs="+", help="folders written by the download scripts, or video files")
    parser.add_argument("--frames", type=int, help="how many keyframes (default 24 by scene changes, 12 evenly spaced)")
    parser.add_argument("--mode", choices=("auto", "scenes", "uniform"), default="auto",
                        help="auto: scene changes up to 3 minutes, evenly spaced beyond (default)")
    parser.add_argument("--transcribe", choices=("auto", "always", "never"), default="auto",
                        help="auto: parts without subtitles and with audible sound (default)")
    parser.add_argument("--language", help="language code such as zh or en; omit to auto-detect")
    parser.add_argument("--chunk-seconds", type=float, default=600.0, help="audio per transcription request; 0 sends it whole")
    parser.add_argument("--at", help="extra frames at these times, e.g. 20,22.5 (part 1) or 2@30 (part 2); redoes the keyframes")
    parser.add_argument("--force", action="store_true", help="redo keyframes and sheets (transcripts are kept)")
    parser.add_argument("--retranscribe", action="store_true", help="transcribe again (pays again)")
    args = parser.parse_args()
    failed = False
    total = 0.0
    for source in args.sources:
        try:
            report = read(Path(source), args)
            total += report["cost"]["usd"]
            parts = report["parts"]
            print(json.dumps({
                "folder": report["folder"],
                "parts": len(parts),
                "frames": len((report["keyframes"] or {}).get("frames") or []),
                "frame_mode": (report["keyframes"] or {}).get("mode"),
                "sheets": (report["keyframes"] or {}).get("sheets"),
                "image_sheets": report["image_sheets"],
                "transcripts": sum(1 for p in parts if p.get("transcript")),
                "text_chars": report["text_chars"],
                "chars_per_minute": report["chars_per_minute"],
                "cost": report["cost"],
                "warnings": report["warnings"],
                "error": None,
            }, ensure_ascii=False))
        except Exception as exc:  # keep going with the other inputs
            failed = True
            print(json.dumps({"folder": source, "error": f"{type(exc).__name__}: {exc}"}, ensure_ascii=False))
    print(json.dumps({"total_cost": {"usd": round(total, 5)}}, ensure_ascii=False))
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
