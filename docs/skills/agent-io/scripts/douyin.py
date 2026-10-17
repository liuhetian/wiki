#!/usr/bin/env python3
"""Douyin posts into folders: text, author, counts and the original video.

Run `python3 douyin.py <link or share text>... --out <dir>`. Standard library only; needs
share_common.py beside it and MY_API_KEY in the environment.

TikHub get_aweme_id (skipped when the link already has /video/<id>) and fetch_one_video_v3 for the
metadata, 0.001 USD each; xiazaitool for the original video (0.005 CNY). If xiazaitool cannot parse it,
the video comes from the largest of TikHub's play URLs, which change from call to call. Image posts
save the unwatermarked JPEG from url_list. Folder layout and flags: see share_common.py.

A profile link (douyin.com/user/<sec_uid>, or a v.douyin.com short link landing there) pages through
fetch_user_post_videos, 20 posts and 0.001 USD a page; each entry already carries what
fetch_one_video_v3 gives, so the posts cost nothing more.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from share_common import Profile, cli, first_url, host_in, https, iso, last_segment  # noqa: E402

DOMAINS = ("douyin.com", "iesdouyin.com")
USER_POSTS = "/api/v1/douyin/app/v3/fetch_user_post_videos"


def aweme_id(url: str) -> str:
    match = re.search(r"/(?:video|note)/(\d{15,})|modal_id=(\d{15,})", url)
    return next((g for g in match.groups() if g), "") if match else ""


def fetch(post, args) -> None:
    aid = aweme_id(post.url) or str(post.tikhub("/api/v1/douyin/web/get_aweme_id", {"url": post.url}) or "")
    post.meta["id"] = aid
    fill(post, post.tikhub("/api/v1/douyin/app/v3/fetch_one_video_v3", {"aweme_id": aid})["aweme_detail"], args)


def fill(post, detail: dict, args) -> None:
    author = detail.get("author") or {}
    stats = detail.get("statistics") or {}
    desc = detail.get("desc") or ""
    images = detail.get("images") or []
    video = detail.get("video") or {}
    duration = round((detail.get("duration") or video.get("duration") or 0) / 1000, 3) or None
    post.meta.update(
        id=detail.get("aweme_id") or post.meta["id"],
        kind="image" if images else "video",
        title=(detail.get("item_title") or detail.get("preview_title") or desc.split("\n")[0])[:80],
        desc=desc,
        author={"name": author.get("nickname"), "id": author.get("unique_id") or author.get("short_id"), "sec_uid": author.get("sec_uid")},
        stats={
            "like": stats.get("digg_count"),
            "collect": stats.get("collect_count"),
            "comment": stats.get("comment_count"),
            "share": stats.get("share_count"),
        },
        published=iso(detail.get("create_time")),
        duration=duration,
        topics=[t["hashtag_name"] for t in detail.get("text_extra") or [] if t.get("hashtag_name")],
        ip_location=detail.get("ip_attribution"),
    )
    if images:  # url_list leads with HEIC, which browsers can't show; the same-size JPEG comes later in the list
        for i, image in enumerate(images, 1):
            urls = image.get("url_list") or []
            if url := next((u for u in urls if ".heic" not in u.split("?")[0]), first_url(image)):
                post.meta["files"]["images"].append(post.download(https(url), f"images/{i:02d}.jpg"))
        return
    if cover := first_url(video.get("origin_cover")) or first_url(video.get("cover")):
        post.meta["files"]["cover"] = post.download(https(cover), "cover.jpg")
    part = {"page": 1, "title": post.meta["title"], "duration": duration, "video": None}
    post.meta["parts"] = [part]
    if args.no_video or post.video_via_xiazaitool(part):
        return
    offers = [video.get(k) or {} for k in ("play_addr", "play_addr_h264", "play_addr_265")]
    offers += [b.get("play_addr") or {} for b in video.get("bit_rate") or []]
    offers = [o for o in offers if first_url(o)]
    if offers:
        best = max(offers, key=lambda o: (int(o.get("width") or 0) * int(o.get("height") or 0), int(o.get("data_size") or 0)))
        post.warn(f"P1: video came from TikHub's play URL ({best.get('width')}x{best.get('height')}), not xiazaitool's original")
        try:
            part["video"] = post.download(https(first_url(best)), "video/p01.mp4")
        except Exception as exc:  # noqa: BLE001
            post.warn(f"P1: video download failed ({type(exc).__name__}: {exc})")


class DouyinProfile(Profile):
    short = ("v.douyin.com",)

    def user_id(self, url: str) -> str:
        if aweme_id(url):  # a post opened on someone's page: /user/<sec_uid>?modal_id=<id>
            return ""
        match = re.search(r"/user/([\w-]{20,})", url)
        return match.group(1) if match else ""

    def page(self, lister, uid, cursor, n):
        data = lister.tikhub(USER_POSTS, {"sec_user_id": uid, "max_cursor": cursor or 0, "count": 20},
                             raw_name=f"tikhub_fetch_user_post_videos_p{n:02d}") or {}
        return data.get("aweme_list") or [], data.get("max_cursor"), bool(data.get("has_more"))

    def item(self, raw: dict) -> dict:
        stats = raw.get("statistics") or {}
        kind = "image" if raw.get("images") else "video"
        return {
            "id": str(raw.get("aweme_id")),
            "url": f"https://www.douyin.com/{'note' if kind == 'image' else 'video'}/{raw.get('aweme_id')}",
            "title": (raw.get("item_title") or (raw.get("desc") or "").split("\n")[0])[:80],
            "published": iso(raw.get("create_time")),
            "pinned": bool(raw.get("is_top")),
            "kind": kind,
            "stats": {"like": stats.get("digg_count"), "collect": stats.get("collect_count"),
                      "comment": stats.get("comment_count"), "share": stats.get("share_count")},
        }

    def author(self, raw: dict) -> dict:
        author = raw.get("author") or {}
        return {"name": author.get("nickname"), "id": author.get("unique_id") or author.get("short_id"), "sec_uid": author.get("sec_uid")}

    def fetch(self, post, raw, args) -> None:
        if raw is None:
            fetch(post, args)
            return
        post.save_raw("tikhub_fetch_user_post_videos", raw)
        fill(post, raw, args)


if __name__ == "__main__":
    raise SystemExit(cli(__doc__, "douyin", lambda u: host_in(u, DOMAINS), lambda u: aweme_id(u) or last_segment(u), fetch,
                         profile=DouyinProfile()))
