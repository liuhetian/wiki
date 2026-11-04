#!/usr/bin/env python3
"""YouTube videos into folders: text, channel, counts, chapters and subtitles; no video yet.

Run `python3 youtube.py <link>... --out <dir>`. Standard library only; needs share_common.py beside it
and MY_API_KEY in the environment.

TikHub get_video_info_v2 for the metadata (0.001 USD) and get_video_captions for one subtitle track
(0.008 USD a track, the caption text itself comes back through TikHub, nothing is fetched from YouTube).
Without --subs the track is the one in the spoken language: a manual track in the language of the
auto-generated (asr) one if there is one, else the asr track. --subs ja,en takes those, --subs none none.

The video is not downloaded: TikHub's stream URLs carry TikHub's own exit IP in the signature, so they
only download from there; get_video_streams_v3 hands out URLs bound to a proxy of ours, and we have none
yet. The cover sits on YouTube's image CDN, not fetched either. Folder layout and flags: see share_common.py.
"""

from __future__ import annotations

import argparse
import re
import sys
import time
import urllib.parse
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from share_common import TZ, cli, host_in, last_segment  # noqa: E402

DOMAINS = ("youtube.com", "youtu.be", "youtube-nocookie.com")
INFO = "/api/v1/youtube/web_v2/get_video_info_v2"
CAPTIONS = "/api/v1/youtube/web_v2/get_video_captions"
CAPTIONS_RESULT = "/api/v1/youtube/web_v2/get_video_captions_result"
SRT_TIME = re.compile(r"^\d{2}:\d{2}:\d{2}[,.]\d{3} --> ")


def video_id(url: str) -> str:
    """watch?v=, youtu.be/, /shorts/, /live/, /embed/, /v/: the 11-character id, else ''."""
    parsed = urllib.parse.urlparse(url)
    candidates = urllib.parse.parse_qs(parsed.query).get("v", [])
    path = [s for s in parsed.path.split("/") if s]
    if (parsed.hostname or "").endswith("youtu.be") and path:
        candidates.append(path[0])
    if len(path) >= 2 and path[0] in ("shorts", "live", "embed", "v"):
        candidates.append(path[1])
    return next((c for c in candidates if re.fullmatch(r"[A-Za-z0-9_-]{11}", c)), "")


def number(value: object) -> int | None:
    try:
        return int(str(value).replace(",", ""))
    except (TypeError, ValueError):
        return None


def local_time(value: object) -> str | None:
    """2026-08-24T20:03:52-07:00 into +08:00 like the other platforms."""
    try:
        return datetime.fromisoformat(str(value)).astimezone(TZ).isoformat()
    except (TypeError, ValueError):
        return None


def fetch(post, args) -> None:
    vid = video_id(post.url)
    if not vid:
        raise ValueError("no video id in the link (watch?v=, youtu.be/, /shorts/, /live/ or /embed/)")
    # Now and then the player half comes back LOGIN_REQUIRED, billed: no duration, counts or caption list.
    # The next call is usually fine, so try three times.
    for attempt in range(3):
        info = post.tikhub(INFO, {"video_id": vid}, raw_name=f"tikhub_get_video_info_v2_{attempt + 1}") or {}
        if info.get("playability_status") == "OK":
            break
    else:
        post.warn(f"playability_status={info.get('playability_status')} 3 times: no duration, counts or caption list; "
                  "pass --subs <language> to fetch subtitles anyway")
    duration = number(info.get("length_seconds"))
    post.meta.update(
        id=vid,
        kind="video",
        title=info.get("title") or "",
        desc=info.get("description") or "",
        author={"name": info.get("author"), "id": info.get("channel_handle"), "channel_id": info.get("channel_id")},
        stats={"view": number(info.get("view_count")), "like": number(info.get("like_count")),
               "comment": number(info.get("comment_count"))},
        published=local_time(info.get("publish_date") or info.get("upload_date")),
        duration=duration,
        topics=list(info.get("keywords") or []),
    )
    if info.get("chapters"):
        post.meta["chapters"] = info["chapters"]
    part = {"page": 1, "title": post.meta["title"], "duration": duration, "video": None, "subtitles": [],
            "time_url": f"https://www.youtube.com/watch?v={vid}&t="}
    post.meta["parts"] = [part]
    tracks = info.get("captions") or []
    for track in pick_tracks(tracks, args.subs):
        if sub := subtitle(post, vid, track):
            part["subtitles"].append(sub)
    if not tracks and info.get("playability_status") == "OK":
        post.warn("no subtitles on this video; with no video either, there is nothing to transcribe yet")
    if not args.no_video:
        post.warn("video not downloaded: TikHub's stream URLs only download from TikHub's own exit IP (see youtube.md#video)")


def pick_tracks(tracks: list[dict], subs: str) -> list[dict]:
    if subs == "none":
        return []
    if subs:
        wanted = [s.strip() for s in subs.split(",") if s.strip()]
        by_code = {t.get("language_code"): t for t in tracks}
        return [by_code.get(code) or {"language_code": code} for code in wanted]
    if not tracks:
        return []
    asr = next((t for t in tracks if t.get("kind") == "asr"), None)
    manual = [t for t in tracks if t.get("kind") != "asr"]
    spoken = (asr or {}).get("language_code")
    return [next((t for t in manual if t.get("language_code") == spoken), None) or asr or manual[0]]


def subtitle(post, vid: str, track: dict) -> dict | None:
    lang = str(track.get("language_code") or "")
    stem = f"subtitles/p01_{re.sub(r'[^0-9A-Za-z_.-]+', '_', lang) or 'sub'}"
    data = post.tikhub(CAPTIONS, {"video_id": vid, "language_code": lang, "format": "srt"}, raw_name=f"tikhub_get_video_captions_{lang}") or {}
    if data.get("status") in ("processing", "queued", "active") and data.get("job_id"):
        data = wait_for_job(post, str(data["job_id"]), lang)
    content = str(data.get("content") or "")
    if not content.strip():
        post.warn(f"subtitle {lang}: {data.get('message') or 'empty'}")
        return None
    folder = post.dir / "subtitles"
    folder.mkdir(parents=True, exist_ok=True)
    (post.dir / f"{stem}.srt").write_text(content, encoding="utf-8")
    lines = [ln.strip() for ln in content.splitlines() if ln.strip() and not ln.strip().isdigit() and not SRT_TIME.match(ln.strip())]
    (post.dir / f"{stem}.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return {"lang": lang, "lang_doc": track.get("language_name") or data.get("language_name"), "kind": track.get("kind") or "",
            "srt": f"{stem}.srt", "txt": f"{stem}.txt", "chars": sum(map(len, lines))}


def wait_for_job(post, job_id: str, lang: str) -> dict:
    """Long videos turn into a job; polling it is free, the docs ask for 2 to 5 seconds between polls."""
    for n in range(60):
        time.sleep(4)
        data = post.tikhub(CAPTIONS_RESULT, {"job_id": job_id, "format": "srt"}, raw_name=f"tikhub_get_video_captions_result_{lang}") or {}
        if data.get("status") == "completed" or data.get("content"):
            return data
        if data.get("status") not in ("queued", "active", "processing"):
            break
    post.warn(f"subtitle {lang}: caption job {job_id} not finished after {n + 1} polls; rerun with --force")
    return {}


def add_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--subs", default="", help="subtitle languages, e.g. ja,en (0.008 USD each); none for none; "
                                                   "default one track in the spoken language")


if __name__ == "__main__":
    raise SystemExit(cli(__doc__, "youtube", lambda u: host_in(u, DOMAINS), lambda u: video_id(u) or last_segment(u), fetch,
                         add_args=add_args))
