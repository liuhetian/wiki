#!/usr/bin/env python3
"""Shared by the per-platform download scripts (xiaohongshu.py, douyin.py, bilibili.py, xiazaitool.py).

Not run on its own. It holds what every platform does the same way:

    the folder each link gets, <platform>_<key>/, where key is the id readable from the link itself,
    or the short-link code; the real id is meta.json's id. The folder holds:
        meta.json          platform, id, url, kind (video / carousel / image / article), title, desc,
                           author, stats, published, duration, topics, parts, files, cost, warnings, error
        raw/               every vendor response, written before parsing
        images/NN.<ext>    pictures; the extension follows the real format, not the URL
        cover.<ext>        videos
        video/pNN.mp4      one file per part; most posts have only p01
    meta.json's parts lists, per part: page, cid, title, duration, video, subtitles, source, referer.

    xiazaitool (the share-link parser for direct video URLs) with retries, and the video download;
    a failed download is a warning, and a rerun finishes it from the URL saved in raw/ for free,
    parsing again (paid) only when that URL has expired.

    the command line: links in, one JSON summary per link out, total cost last, exit code 1 if any
    link failed; a folder with an error-free meta.json is skipped, --force fetches again.

    an author's profile link (short links are followed to see where they land): page through every
    post into <platform>_user_<id>/list.json, then give each post the usual folder beside it, without
    videos unless --video. Posts that cost a call each stop first if the total would pass CONFIRM_USD.
    A rerun pages only until it meets a post the last complete list already had.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Callable


TIKHUB = "https://tikhub-proxy.liuhetian.work"
XIAZAITOOL = "https://xiazaitool-proxy.liuhetian.work/"
# USD per successful call, from the TikHub bill; xiazaitool charges CNY per successful parse.
TIKHUB_PRICE = {
    "/api/v1/douyin/web/get_aweme_id": 0.001,
    "/api/v1/douyin/app/v3/fetch_one_video_v3": 0.001,
    "/api/v1/xiaohongshu/app_v2/get_image_note_detail": 0.01,
    "/api/v1/douyin/app/v3/fetch_user_post_videos": 0.001,
    "/api/v1/xiaohongshu/app_v2/get_user_posted_notes": 0.01,
}
CONFIRM_USD = 1.0  # a profile whose posts would cost more stops after listing until --yes or --limit
XIAZAITOOL_CNY = 0.005
TZ = timezone(timedelta(hours=8))
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
)
MAGIC = ((b"\xff\xd8\xff", ".jpg"), (b"\x89PNG", ".png"), (b"GIF8", ".gif"), (b"RIFF", ".webp"))
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


class Post:
    """One link's folder, metadata and running cost."""

    def __init__(self, url: str, platform: str, key: str, out: Path):
        self.url = url
        self.platform = platform
        self.dir = out / f"{platform}_{key}"
        self.meta: dict = {
            "platform": platform,
            "id": "",
            "url": url,
            "kind": "",
            "title": "",
            "desc": "",
            "author": None,
            "stats": None,
            "published": None,
            "duration": None,
            "ip_location": None,
            "topics": [],
            "parts": [],
            "files": {"images": [], "cover": None, "article": None, "comments": None},
            "cost": {"usd": 0.0, "cny": 0.0},
            "warnings": [],
            "error": None,
        }

    def warn(self, message: str) -> None:
        self.meta["warnings"].append(message)

    def save_raw(self, name: str, obj: object) -> None:
        raw = self.dir / "raw"
        raw.mkdir(parents=True, exist_ok=True)
        (raw / f"{name}.json").write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")

    def tikhub(self, path: str, params: dict, raw_name: str | None = None) -> dict:
        """TikHub now and then answers 400 "please retry", unbilled, so try three times."""
        for attempt in range(3):
            if attempt:
                time.sleep(3)
            try:
                obj = gateway_json(f"{TIKHUB}{path}?{urllib.parse.urlencode(params)}")
            except RuntimeError:
                if attempt == 2:
                    raise
                continue
            self.save_raw(raw_name or "tikhub_" + path.rsplit("/", 1)[-1], obj)
            if obj.get("code") == 200:
                break
            if attempt == 2:
                raise RuntimeError(f"TikHub {path} code={obj.get('code')}: {obj.get('message_zh') or obj.get('message')}")
        self.meta["cost"]["usd"] = round(self.meta["cost"]["usd"] + TIKHUB_PRICE.get(path, 0), 4)
        return obj.get("data")

    def xiazaitool(self, url: str | None = None, raw_name: str = "xiazaitool") -> dict:
        """Failed parses are free and happen now and then, so retry; a success is paid once."""
        last = ""
        for attempt in range(3):
            if attempt:
                time.sleep(3)
            try:
                obj = gateway_json(XIAZAITOOL + "?" + urllib.parse.urlencode({"url": url or self.url}))
            except RuntimeError as exc:
                last = str(exc)
                continue
            self.save_raw(raw_name, obj)
            if obj.get("status") == 200 and isinstance(obj.get("data"), dict):
                self.meta["cost"]["cny"] = round(self.meta["cost"]["cny"] + XIAZAITOOL_CNY, 4)
                return obj["data"]
            last = f"status={obj.get('status')} {obj.get('message')}"
        raise RuntimeError(f"xiazaitool failed 3 times: {last}")

    def download(self, url: str, name: str, referer: str | None = None) -> str:
        dest = self.dir / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        part = dest.with_name(dest.name + ".part")
        headers = {"User-Agent": USER_AGENT, **({"Referer": referer} if referer else {})}
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=120) as resp:
                with part.open("wb") as fh:
                    while chunk := resp.read(1 << 20):
                        fh.write(chunk)
            part.replace(dest)
        finally:
            part.unlink(missing_ok=True)
        # CDNs hand out WebP or PNG under .jpg names (Douyin covers, Bilibili article images): name by content.
        with dest.open("rb") as fh:
            head = fh.read(12)
        real = next((ext for magic, ext in MAGIC if head.startswith(magic) and (ext != ".webp" or head[8:12] == b"WEBP")), None)
        if real and dest.suffix.lower() != real and dest.suffix.lower() in IMAGE_EXTS:
            dest = dest.replace(dest.with_suffix(real))
            name = str(Path(name).with_suffix(real))
        return name

    def video_via_xiazaitool(self, part: dict, url: str | None = None, referer: str | None = None, reuse: bool = False) -> bool:
        """Parse one part with xiazaitool and download it into video/pNN.mp4; warn instead of failing.

        The part remembers its source and referer, so a rerun can finish a failed download: first from
        the direct URL already in raw/ (free), and only if that has expired by parsing again (paid)."""
        page = int(part.get("page") or 1)
        part["source"], part["referer"] = url or self.url, referer
        raw = self.dir / "raw" / f"xiazaitool_p{page:02d}.json"
        if reuse and raw.exists() and (video := video_url(json.loads(raw.read_text(encoding="utf-8")).get("data") or {})):
            try:
                part["video"] = self.download(https(video), f"video/p{page:02d}.mp4", referer)
                return True
            except Exception:  # noqa: BLE001 - expired link: parse again below
                pass
        try:
            data = self.xiazaitool(part["source"], raw_name=f"xiazaitool_p{page:02d}")
        except RuntimeError as exc:
            self.warn(f"P{page}: {exc}")
            return False
        video = video_url(data)
        if not video:
            self.warn(f"P{page}: xiazaitool returned no video URL")
            return False
        if part.get("cid") and str(part["cid"]) not in video:
            self.warn(f"P{page}: the direct URL does not contain cid={part['cid']}; check it is the right part")
        try:
            part["video"] = self.download(https(video), f"video/p{page:02d}.mp4", referer)
        except Exception as exc:  # noqa: BLE001 - disk full, network: rerun finishes it from raw/
            self.warn(f"P{page}: video download failed ({type(exc).__name__}: {exc}); rerun to finish it from raw/ for free")
            return False
        return True


class Profile:
    """One platform's author page; douyin.py and xiaohongshu.py subclass it."""

    short: tuple[str, ...] = ()  # short-link hosts, followed once to see whether they land on a profile
    detail_usd = 0.0  # paid per post on top of the list pages

    def user_id(self, url: str) -> str:
        """The author id when the link is a profile, else ''."""
        raise NotImplementedError

    def page(self, lister: Post, uid: str, cursor: object, n: int) -> tuple[list[dict], object, bool]:
        """Page n: (raw posts, next cursor, has more)."""
        raise NotImplementedError

    def item(self, raw: dict) -> dict:
        """list.json's entry: id, url, title, published, pinned, kind, stats."""
        raise NotImplementedError

    def author(self, raw: dict) -> dict:
        raise NotImplementedError

    def fetch(self, post: Post, raw: dict | None, args: argparse.Namespace) -> None:
        """Fill one post's folder; raw is its list entry, None when only an earlier run listed it."""
        raise NotImplementedError


def video_url(data: dict) -> str:
    """xiazaitool's videoUrls is a plain string, and for Bilibili sometimes a list."""
    video = data.get("videoUrls") or ""
    return (video[0] if video else "") if isinstance(video, list) else video


def gateway_json(url: str) -> dict:
    key = os.environ.get("MY_API_KEY", "").strip()
    if not key:
        raise SystemExit("MY_API_KEY is not set: run `set -a; . ./.env; set +a` where .env lives")
    return http_json(url, {"Authorization": f"Bearer {key}"}, timeout=90)


def http_json(url: str, headers: dict | None = None, timeout: int = 30) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")[:300]
        raise RuntimeError(f"HTTP {exc.code} from {url.split('?')[0]}: {body}") from exc
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"{type(exc).__name__} from {url.split('?')[0]}: {exc}") from exc


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):  # noqa: ANN002, ANN003
        return None


def resolve_short(url: str) -> str:
    """Where a short link points, read from its redirect without fetching the page; the link itself on failure."""
    opener = urllib.request.build_opener(_NoRedirect)
    try:
        with opener.open(urllib.request.Request(url, headers={"User-Agent": USER_AGENT}), timeout=20):
            return url
    except urllib.error.HTTPError as exc:
        return urllib.parse.urljoin(url, exc.headers.get("Location") or "") if 300 <= exc.code < 400 else url
    except (urllib.error.URLError, TimeoutError):
        return url


def extract_url(text: str) -> str:
    """Share text wraps the link in a title and emoji; keep only the URL."""
    match = re.search(r"https?://[^\s，。！？、；：“”‘’「」『』（）()<>]+", text)
    if not match:
        raise ValueError(f"no http(s) link in: {text[:80]}")
    return match.group(0)


def host_in(url: str, domains: tuple[str, ...]) -> bool:
    host = (urllib.parse.urlparse(url).hostname or "").lower()
    return any(host == d or host.endswith("." + d) for d in domains)


def last_segment(url: str) -> str:
    segments = [s for s in urllib.parse.urlparse(url).path.split("/") if s]
    return re.sub(r"[^0-9A-Za-z_-]+", "", segments[-1] if segments else "")[:40] or "link"


def https(url: str) -> str:
    return "https:" + url if url.startswith("//") else url.replace("http://", "https://", 1)


def iso(ts: object) -> str | None:
    try:
        return datetime.fromtimestamp(int(ts), TZ).isoformat() if ts else None
    except (TypeError, ValueError, OSError):
        return None


def first_url(obj: dict | None) -> str:
    return ((obj or {}).get("url_list") or [""])[0]


def media_only(post: Post, args: argparse.Namespace, referer: str | None = None) -> None:
    """xiazaitool alone: title and media, no text or author. Used by xiazaitool.py and as a fallback."""
    data = post.xiazaitool()
    post.meta.update(id=post.meta["id"] or last_segment(post.url), title=str(data.get("title") or ""))
    if not data.get("isVideo"):
        post.meta["kind"] = "image"
        for i, url in enumerate([u for u in data.get("pics") or [] if u], 1):
            post.meta["files"]["images"].append(post.download(https(url), f"images/{i:02d}.jpg", referer))
        return
    post.meta["kind"] = "video"
    cover = data.get("coverUrls")
    if isinstance(cover, str) and cover:
        post.meta["files"]["cover"] = post.download(https(cover), "cover.jpg", referer)
    part = {"page": 1, "title": post.meta["title"], "video": None, "source": post.url, "referer": referer}
    post.meta["parts"] = [part]
    if (video := video_url(data)) and not args.no_video:
        try:
            part["video"] = post.download(https(video), "video/p01.mp4", referer)
        except Exception as exc:  # noqa: BLE001
            post.warn(f"P1: video download failed ({type(exc).__name__}: {exc}); rerun to finish it from raw/ for free")


def run(source: str, out: Path, args: argparse.Namespace, platform: str, matches: Callable[[str], bool],
        key_of: Callable[[str], str], fetch: Callable[[Post, argparse.Namespace], None]) -> dict:
    try:
        url = extract_url(source)
    except ValueError as exc:
        return {"source": source[:80], "error": str(exc)}
    if not matches(url):
        return {"source": url, "error": f"not a {platform} link; use the script for its platform (or xiazaitool.py)"}
    post = Post(url, platform, key_of(url), out)
    meta_path = post.dir / "meta.json"
    if meta_path.exists() and not args.force:
        cached = json.loads(meta_path.read_text(encoding="utf-8"))
        if not cached.get("error"):
            missing = [p for p in cached.get("parts") or [] if not p.get("video") and p.get("source")]
            if not missing or args.no_video:
                return summary(post.dir, cached, cached_run=True)
            # Finish downloads a previous run lost (disk full, network); only re-parsing costs anything.
            post.meta = cached
            before = dict(cached["cost"])
            for part in missing:
                post.video_via_xiazaitool(part, part["source"], part.get("referer"), reuse=True)
            meta_path.write_text(json.dumps(post.meta, ensure_ascii=False, indent=2), encoding="utf-8")
            result = summary(post.dir, post.meta)
            result["cost"] = {k: round(post.meta["cost"][k] - before.get(k, 0), 4) for k in ("usd", "cny")}
            return result
    post.dir.mkdir(parents=True, exist_ok=True)
    try:
        fetch(post, args)
    except Exception as exc:  # keep going with the other links; raw/ has what the vendor said
        post.meta["error"] = f"{type(exc).__name__}: {exc}"
    post.meta["fetched_at"] = datetime.now(TZ).isoformat(timespec="seconds")
    meta_path.write_text(json.dumps(post.meta, ensure_ascii=False, indent=2), encoding="utf-8")
    return summary(post.dir, post.meta)


def profile_link(source: str, matches: Callable[[str], bool], profile: Profile) -> tuple[str, str] | None:
    """(link, author id) when the source is a profile link, else None and it goes to run()."""
    try:
        url = extract_url(source)
    except ValueError:
        return None
    if not matches(url):
        return None
    uid = profile.user_id(resolve_short(url) if host_in(url, profile.short) else url)
    return (url, uid) if uid else None


def run_profile(url: str, uid: str, out: Path, args: argparse.Namespace, platform: str, matches: Callable[[str], bool],
                key_of: Callable[[str], str], profile: Profile) -> dict:
    lister = Post(url, platform, "user_" + uid, out)
    lister.dir.mkdir(parents=True, exist_ok=True)
    list_path = lister.dir / "list.json"
    old = json.loads(list_path.read_text(encoding="utf-8")) if list_path.exists() and not args.force else {}
    # Posts come newest first, so meeting one a complete earlier list had means the rest is known too.
    # Pinned posts sit on top whatever their age, so they never count as that meeting point.
    known = {i["id"] for i in old.get("items") or []} if old.get("complete") else set()
    listed: dict[str, dict] = {}
    raws: dict[str, dict] = {}
    cursor, more, reached, error, n = None, True, False, None, 0
    while more and not reached and not (args.limit and len(listed) >= args.limit):
        n += 1
        try:
            batch, cursor, more = profile.page(lister, uid, cursor, n)
        except Exception as exc:  # noqa: BLE001 - keep what was listed; a rerun pages from the top again
            error = f"listing stopped at page {n}: {type(exc).__name__}: {exc}"
            break
        for raw in batch:
            item = profile.item(raw)
            listed.setdefault(item["id"], item)
            raws.setdefault(item["id"], raw)
            reached = reached or (item["id"] in known and not item["pinned"])
        if not batch:
            break
    complete = error is None and (not more or reached)
    items = list(listed.values())
    if reached or not complete:
        items += [i for i in old.get("items") or [] if i["id"] not in listed]
    author = next((profile.author(r) for r in raws.values()), old.get("author"))
    todo = items[: args.limit] if args.limit else items

    def folder(item: dict) -> Path:
        return out / f"{platform}_{key_of(item['url'])}"

    def done(item: dict) -> bool:
        meta = folder(item) / "meta.json"
        return meta.exists() and not args.force and not json.loads(meta.read_text(encoding="utf-8")).get("error")

    def save() -> None:
        for item in items:
            item["dir"] = folder(item).name if (folder(item) / "meta.json").exists() else None
        list_path.write_text(json.dumps({
            "platform": platform, "user_id": uid, "url": url, "author": author, "complete": complete,
            "listed_at": datetime.now(TZ).isoformat(timespec="seconds"), "items": items,
        }, ensure_ascii=False, indent=2), encoding="utf-8")

    results: list[dict] = []
    need = sum(1 for i in todo if not done(i))
    estimate = round(need * profile.detail_usd, 4)
    if estimate > CONFIRM_USD and not args.yes:
        stop = (f"stopped after listing: {need} of {len(todo)} posts need a call each, about {estimate} USD, "
                f"over {CONFIRM_USD}; rerun with --yes, or --limit N for the first N")
        error = f"{error}; {stop}" if error else stop
    else:
        item_args = argparse.Namespace(**{**vars(args), "no_video": args.no_video or not args.video})
        for item in todo:
            raw = raws.get(item["id"])
            results.append(run(item["url"], out, item_args, platform, matches, key_of,
                               lambda post, a, raw=raw: profile.fetch(post, raw, a)))
    save()
    failed = [{"dir": r.get("dir"), "error": r["error"]} for r in results if r.get("error")]
    if failed and error is None:
        error = f"{len(failed)} of {len(results)} posts failed; see failed"
    cost = dict(lister.meta["cost"])
    for r in results:
        for k in cost:
            cost[k] = round(cost[k] + ((r.get("cost") or {}).get(k) or 0), 4)
    return {
        "dir": str(lister.dir),
        "platform": platform,
        "kind": "profile",
        "author": (author or {}).get("name"),
        "listed": len(items),
        "complete": complete,
        "posts": len(results),
        "cached": sum(1 for r in results if r.get("cached")),
        "images": sum(r.get("images") or 0 for r in results),
        "videos": sum(r.get("videos") or 0 for r in results),
        "estimate_usd": estimate,
        "cost": cost,
        "warnings": [f"{Path(r['dir']).name}: {w}" for r in results for w in r.get("warnings") or []],
        "failed": failed,
        "error": error,
    }


def summary(folder: Path, meta: dict, cached_run: bool = False) -> dict:
    files = meta.get("files") or {}
    parts = meta.get("parts") or []
    return {
        "dir": str(folder),
        "platform": meta.get("platform"),
        "kind": meta.get("kind"),
        "title": meta.get("title"),
        "author": (meta.get("author") or {}).get("name"),
        "images": len(files.get("images") or []),
        "parts": len(parts),
        "videos": sum(1 for p in parts if p.get("video")),
        "subtitles": sum(len(p.get("subtitles") or []) for p in parts),
        "comments": bool(files.get("comments")),
        "cost": {"usd": 0.0, "cny": 0.0} if cached_run else meta.get("cost"),
        "cached": cached_run,
        "warnings": meta.get("warnings") or [],
        "error": meta.get("error"),
    }


def cli(doc: str, platform: str, matches: Callable[[str], bool], key_of: Callable[[str], str],
        fetch: Callable[[Post, argparse.Namespace], None], add_args: Callable[[argparse.ArgumentParser], None] | None = None,
        profile: Profile | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=doc, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("links", nargs="+", help="links, or whole share texts containing one")
    parser.add_argument("--out", required=True, help="output directory; one subfolder per link")
    parser.add_argument("--no-video", action="store_true", help="skip video downloads (and their xiazaitool calls)")
    parser.add_argument("--force", action="store_true", help="fetch again even if meta.json exists; pays again")
    if profile:
        parser.add_argument("--limit", type=int, default=0, help="profile links: only the first N posts, pinned ones first")
        parser.add_argument("--video", action="store_true", help="profile links: download videos too (off by default there)")
        parser.add_argument("--yes", action="store_true", help=f"profile links: go on even when the posts cost over {CONFIRM_USD} USD")
    if add_args:
        add_args(parser)
    args = parser.parse_args()
    out = Path(args.out).resolve()
    results = []
    for link in args.links:
        if profile and (found := profile_link(link, matches, profile)):
            results.append(run_profile(*found, out, args, platform, matches, key_of, profile))
        else:
            results.append(run(link, out, args, platform, matches, key_of, fetch))
    for item in results:
        print(json.dumps(item, ensure_ascii=False))
    total_usd = round(sum((r.get("cost") or {}).get("usd", 0) for r in results), 4)
    total_cny = round(sum((r.get("cost") or {}).get("cny", 0) for r in results), 4)
    print(json.dumps({"total_cost": {"usd": total_usd, "cny": total_cny}}, ensure_ascii=False))
    return 1 if any(r.get("error") for r in results) else 0
