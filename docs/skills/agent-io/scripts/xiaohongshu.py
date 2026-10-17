#!/usr/bin/env python3
"""Xiaohongshu notes into folders: text, author, counts and every original image; video for real videos.

Run `python3 xiaohongshu.py <link or share text>... --out <dir>`. Standard library only; needs
share_common.py beside it and MY_API_KEY in the environment.

TikHub get_image_note_detail once per note (0.01 USD): text, author, counts, topics, original images.
A real video (one cover under spectrum/) then calls xiazaitool for the video (0.005 CNY); a carousel
(pictures stitched into a video) already has its originals, so it gets no video. If TikHub fails the
note falls back to xiazaitool: title and media only. Folder layout and flags: see share_common.py.

A profile link (xiaohongshu.com/user/profile/<id>, or a short link landing there) pages through
get_user_posted_notes, 20 notes and 0.01 USD a page. Its entries cut the text at 100 characters and
carry no originals, so every note still costs one get_image_note_detail.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from share_common import Profile, cli, host_in, https, iso, last_segment, media_only  # noqa: E402

DOMAINS = ("xiaohongshu.com", "xhslink.cn", "xhslink.com")
USER_NOTES = "/api/v1/xiaohongshu/app_v2/get_user_posted_notes"


def note_id(url: str) -> str:
    match = re.search(r"/(?:explore|item)/([0-9a-f]{24})", url)
    return match.group(1) if match else ""


def fetch(post, args) -> None:
    nid = note_id(post.url)
    params = {"note_id": nid} if nid else {"share_text": post.url}
    try:
        note = post.tikhub("/api/v1/xiaohongshu/app_v2/get_image_note_detail", params)["data"][0]["note_list"][0]
    except (RuntimeError, KeyError, IndexError, TypeError) as exc:
        post.warn(f"TikHub failed, fell back to xiazaitool (no text, author or counts): {exc}")
        media_only(post, args)
        return
    images = note.get("images_list") or []
    first = str((images[0] if images else {}).get("original") or "")
    if note.get("type") != "video":
        kind = "image"
    elif len(images) <= 1 or "/spectrum/" in first:
        kind = "video"  # a real video carries just its cover, stored under spectrum/
    else:
        kind = "carousel"  # several pictures stitched into a video; the originals are all here
    user = note.get("user") or {}
    post.meta.update(
        id=note.get("id") or nid,
        kind=kind,
        title=note.get("title") or "",
        desc=note.get("desc") or "",
        author={"name": user.get("nickname") or user.get("name"), "id": user.get("userid") or user.get("id"), "red_id": user.get("red_id")},
        stats={
            "like": note.get("liked_count"),
            "collect": note.get("collected_count"),
            "comment": note.get("comments_count"),
            "share": note.get("shared_count"),
        },
        published=iso(note.get("time")),
        topics=[t["name"] for t in note.get("hash_tag") or [] if t.get("name")],
        ip_location=note.get("ip_location"),
    )
    for i, image in enumerate(images, 1):
        url = str(image.get("original") or image.get("url_size_large") or image.get("url") or "")
        if not url:
            continue
        # The signature does not cover the format step, so ask the CDN for JPEG instead of WebP.
        url = https(url).replace("format/webp", "format/jpg")
        if kind == "video":
            post.meta["files"]["cover"] = post.download(url, "cover.jpg")
        else:
            post.meta["files"]["images"].append(post.download(url, f"images/{i:02d}.jpg"))
    if kind == "video":
        part = {"page": 1, "title": post.meta["title"], "video": None}
        post.meta["parts"] = [part]
        if not args.no_video:
            post.video_via_xiazaitool(part)


class XiaohongshuProfile(Profile):
    short = ("xhslink.cn", "xhslink.com")
    detail_usd = 0.01

    def user_id(self, url: str) -> str:
        match = re.search(r"/user/profile/([0-9a-f]{24})", url)
        return match.group(1) if match else ""

    def page(self, lister, uid, cursor, n):
        params = {"user_id": uid, **({"cursor": cursor} if cursor else {})}
        data = (lister.tikhub(USER_NOTES, params, raw_name=f"tikhub_get_user_posted_notes_p{n:02d}") or {}).get("data")
        if not isinstance(data, dict) or "notes" not in data:  # a wrong user_id lands here, and is still billed
            raise ValueError(f"no notes in the reply: {str(data)[:200]}")
        notes = data.get("notes") or []
        last = notes[-1] if notes else {}
        return notes, last.get("cursor") or last.get("id"), bool(data.get("has_more"))

    def item(self, raw: dict) -> dict:
        return {
            "id": raw.get("id"),
            "url": f"https://www.xiaohongshu.com/explore/{raw.get('id')}",
            "title": raw.get("title") or raw.get("display_title") or "",
            "published": iso(raw.get("create_time")),
            "pinned": bool(raw.get("sticky")),
            "kind": "image" if raw.get("type") == "normal" else "video",
            "stats": {"like": raw.get("likes"), "collect": raw.get("collected_count"),
                      "comment": raw.get("comments_count"), "share": raw.get("share_count")},
        }

    def author(self, raw: dict) -> dict:
        user = raw.get("user") or {}
        return {"name": user.get("nickname") or user.get("name"), "id": user.get("userid") or user.get("id")}

    def fetch(self, post, raw, args) -> None:
        fetch(post, args)


if __name__ == "__main__":
    raise SystemExit(cli(__doc__, "xiaohongshu", lambda u: host_in(u, DOMAINS), lambda u: note_id(u) or last_segment(u), fetch,
                         profile=XiaohongshuProfile()))
