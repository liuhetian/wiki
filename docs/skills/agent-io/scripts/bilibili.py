#!/usr/bin/env python3
"""Bilibili videos and articles into folders: text, author, counts, parts, subtitles, video, comments.

Run `python3 bilibili.py <link or share text>... --out <dir>`. Standard library only; needs
share_common.py beside it, and MY_API_KEY in the environment for the videos.

Videos (BV...): the public view API for metadata and parts, the player API for public subtitles (most
need a login now, so mostly none), xiazaitool per part for the video (0.005 CNY a part), the WBI-signed
reply API for comments with --comments. Articles (/opus/, /dynamic/, t.bilibili.com): the public page's
__INITIAL_STATE__ for the article, written to article.md with local images. b23.tv short links are
followed once. Everything but the videos is free. Folder layout and shared flags: see share_common.py.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from share_common import TZ, USER_AGENT, Post, cli, host_in, http_json, https, iso, last_segment, media_only  # noqa: E402

BILIBILI = "https://api.bilibili.com"
BILI_REFERER = "https://www.bilibili.com/"
WBI_MIXIN = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39,
    12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63,
    57, 62, 11, 36, 20, 34, 44, 52,
]
DOMAINS = ("bilibili.com", "b23.tv")


def bvid_of(url: str) -> str:
    match = re.search(r"(BV[0-9A-Za-z]{10})", url)
    return match.group(1) if match else ""


def opus_of(url: str) -> str:
    match = re.search(r"(?:/opus/|/dynamic/|t\.bilibili\.com/)(\d{10,})", url)
    return match.group(1) if match else ""


def safe(value: str) -> str:
    return re.sub(r"[^0-9A-Za-z_-]+", "_", value).strip("_") or "x"


def srt_time(seconds: float) -> str:
    ms = max(0, int(round(float(seconds or 0) * 1000)))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def select_parts(spec: str, total: int) -> set[int]:
    """'all', or page numbers and ranges such as 1,3-5."""
    if spec == "all":
        return set(range(1, total + 1))
    wanted: set[int] = set()
    for chunk in filter(None, (c.strip() for c in spec.split(","))):
        lo, _, hi = chunk.partition("-")
        wanted.update(range(int(lo), int(hi or lo) + 1))
    return wanted


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):  # noqa: ANN002, ANN003
        return None


def follow_short_link(url: str) -> str:
    """b23.tv links carry no BV or opus id; read the Location of the first redirect."""
    opener = urllib.request.build_opener(NoRedirect)
    try:
        opener.open(urllib.request.Request(url, headers={"User-Agent": USER_AGENT}), timeout=20)
    except urllib.error.HTTPError as exc:
        if exc.code in (301, 302, 303, 307, 308) and exc.headers.get("Location"):
            return exc.headers["Location"]
    return url


def bili_get(post: Post, path: str, params: dict, raw_name: str) -> dict:
    obj = http_json(f"{BILIBILI}{path}?{urllib.parse.urlencode(params)}", {"Referer": BILI_REFERER})
    post.save_raw(raw_name, obj)
    if obj.get("code") != 0:
        raise RuntimeError(f"Bilibili {path} code={obj.get('code')}: {obj.get('message')}")
    return obj.get("data") or {}


def fetch_bilibili(post: Post, args: argparse.Namespace) -> None:
    url = post.url
    if "b23.tv" in (urllib.parse.urlparse(url).hostname or ""):
        url = follow_short_link(url)
        post.meta["resolved_url"] = url
    if bvid := bvid_of(url):
        fetch_bilibili_video(post, bvid, args)
    elif opus := opus_of(url):
        fetch_bilibili_opus(post, opus, args)
    else:
        media_only(post, args, BILI_REFERER)


def fetch_bilibili_video(post: Post, bvid: str, args: argparse.Namespace) -> None:
    data = bili_get(post, "/x/web-interface/view", {"bvid": bvid}, "bilibili_view")
    owner = data.get("owner") or {}
    stat = data.get("stat") or {}
    post.meta.update(
        id=bvid,
        kind="video",
        title=data.get("title") or "",
        desc=data.get("desc") or "",
        author={"name": owner.get("name"), "id": owner.get("mid")},
        stats={
            "like": stat.get("like"),
            "collect": stat.get("favorite"),
            "comment": stat.get("reply"),
            "share": stat.get("share"),
            "view": stat.get("view"),
            "coin": stat.get("coin"),
            "danmaku": stat.get("danmaku"),
        },
        published=iso(data.get("pubdate")),
        duration=data.get("duration"),
    )
    if data.get("pic"):
        post.meta["files"]["cover"] = post.download(https(data["pic"]), "cover.jpg", BILI_REFERER)
    pages = data.get("pages") or []
    wanted = select_parts(args.parts, len(pages))
    for page in pages:
        n = int(page.get("page") or 1)
        if n not in wanted:
            continue
        part = {"page": n, "cid": page.get("cid"), "title": page.get("part") or "", "duration": page.get("duration"), "video": None, "subtitles": []}
        post.meta["parts"].append(part)
        part["subtitles"] = bilibili_subtitles(post, bvid, part)
        if not args.no_video:
            part_url = f"https://www.bilibili.com/video/{bvid}/" + (f"?p={n}" if n > 1 else "")
            post.video_via_xiazaitool(part, part_url, BILI_REFERER)
    skipped = len(pages) - len(post.meta["parts"])
    if skipped:
        post.warn(f"{skipped} of {len(pages)} parts skipped by --parts {args.parts}")
    if args.comments:
        post.meta["files"]["comments"] = bilibili_comments(post, str(data["aid"]), 1)


def bilibili_subtitles(post: Post, bvid: str, part: dict) -> list[dict]:
    n = part["page"]
    data = bili_get(post, "/x/player/v2", {"bvid": bvid, "cid": part["cid"]}, f"bilibili_player_p{n:02d}")
    tracks = (data.get("subtitle") or {}).get("subtitles") or []
    if not tracks:
        why = "subtitles are only given to logged-in users (need_login_subtitle)" if data.get("need_login_subtitle") else "no subtitles"
        post.warn(f"P{n}: {why}; transcribe the video instead")
    out = []
    for track in tracks:
        lang = str(track.get("lan") or "sub")
        if not track.get("subtitle_url"):
            # ai-zh listed with an empty URL: the AI subtitle exists but is only given to logged-in users.
            post.warn(f"P{n}: subtitle {lang} needs login (empty subtitle_url); transcribe the video instead")
            continue
        payload = http_json(https(track["subtitle_url"]), {"Referer": BILI_REFERER})
        body = payload.get("body") or []
        stem = f"subtitles/p{n:02d}_{safe(lang)}"
        folder = post.dir / "subtitles"
        folder.mkdir(parents=True, exist_ok=True)
        (post.dir / f"{stem}.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        lines = [str(item.get("content") or "").strip() for item in body]
        (post.dir / f"{stem}.txt").write_text("\n".join(line for line in lines if line) + "\n", encoding="utf-8")
        srt = []
        for i, item in enumerate(body, 1):
            if text := str(item.get("content") or "").strip():
                srt += [str(i), f"{srt_time(item.get('from'))} --> {srt_time(item.get('to'))}", text, ""]
        (post.dir / f"{stem}.srt").write_text("\n".join(srt), encoding="utf-8")
        out.append({"lang": lang, "lang_doc": track.get("lan_doc"), "srt": f"{stem}.srt", "txt": f"{stem}.txt", "json": f"{stem}.json", "chars": sum(map(len, lines))})
    return out


def wbi_key(post: Post) -> str:
    obj = http_json(f"{BILIBILI}/x/web-interface/nav", {"Referer": BILI_REFERER})  # code -101 when logged out, keys still there
    wbi = (obj.get("data") or {}).get("wbi_img") or {}
    key = "".join(Path(urllib.parse.urlparse(wbi.get(k, "")).path).stem for k in ("img_url", "sub_url"))
    return "".join(key[i] for i in WBI_MIXIN if i < len(key))[:32]


def wbi_sign(params: dict, mixin: str) -> dict:
    signed = {**params, "wts": int(time.time())}
    cleaned = {k: "".join(ch for ch in str(v) if ch not in "!'()*") for k, v in signed.items()}
    signed["w_rid"] = hashlib.md5((urllib.parse.urlencode(sorted(cleaned.items())) + mixin).encode()).hexdigest()
    return signed


def compact_reply(reply: dict) -> dict:
    content = reply.get("content") or {}
    member = reply.get("member") or {}
    return {
        "rpid": str(reply.get("rpid_str") or reply.get("rpid") or ""),
        "user": member.get("uname") or "",
        "mid": str(member.get("mid") or reply.get("mid") or ""),
        "time": iso(reply.get("ctime")),
        "like": int(reply.get("like") or 0),
        "message": str(content.get("message") or "").replace("\r\n", "\n"),
        "pictures": [p.get("img_src") for p in content.get("pictures") or [] if p.get("img_src")],
        "reply_count": int(reply.get("rcount") or 0),
        "up_liked": bool((reply.get("up_action") or {}).get("like")),
        "children": [],
    }


def bilibili_comments(post: Post, oid: str, kind: int) -> str:
    """Top-level comments through the WBI main API (the plain one returns only a few), then their replies."""
    mixin = wbi_key(post)
    roots: dict[str, dict] = {}
    total = None
    cursor_next = 0
    for page in range(40):
        params = wbi_sign({"type": kind, "oid": oid, "mode": 3, "next": cursor_next, "ps": 20, "web_location": 1315875}, mixin)
        data = bili_get(post, "/x/v2/reply/wbi/main", params, f"bilibili_comments_{page:02d}")
        cursor = data.get("cursor") or {}
        total = cursor.get("all_count", total)
        top = data.get("top") or {}
        pinned = [top.get(k) for k in ("admin", "upper") if isinstance(top.get(k), dict) and top[k].get("rpid")]
        for reply in pinned + (data.get("top_replies") or []) + (data.get("replies") or []):
            item = compact_reply(reply)
            roots.setdefault(item["rpid"], item)
        if cursor.get("is_end") or cursor.get("next") in (None, cursor_next):
            break
        cursor_next = cursor["next"]
        time.sleep(0.25)
    for item in roots.values():
        pn = 1
        while item["reply_count"] and len(item["children"]) < item["reply_count"] and pn <= 20:
            params = {"type": kind, "oid": oid, "root": item["rpid"], "pn": pn, "ps": 20}
            try:
                data = http_json(f"{BILIBILI}/x/v2/reply/reply?{urllib.parse.urlencode(params)}", {"Referer": BILI_REFERER}).get("data") or {}
            except RuntimeError as exc:
                item["children_error"] = str(exc)
                break
            replies = data.get("replies") or []
            if not replies:
                break
            item["children"] += [compact_reply(r) for r in replies]
            pn += 1
            time.sleep(0.2)
    result = {
        "oid": oid,
        "type": kind,
        "total_reported": total,
        "fetched": len(roots) + sum(len(i["children"]) for i in roots.values()),
        "fetched_at": datetime.now(TZ).isoformat(timespec="seconds"),
        "items": list(roots.values()),
    }
    (post.dir / "comments.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return "comments.json"


def initial_state(html: str) -> dict:
    """Cut the JSON object after window.__INITIAL_STATE__= by matching braces outside strings."""
    marker = "window.__INITIAL_STATE__="
    start = html.find(marker)
    if start < 0:
        raise RuntimeError("no window.__INITIAL_STATE__ in the opus page")
    start = html.index("{", start)
    depth, in_string, escaped = 0, False, False
    for i in range(start, len(html)):
        ch = html[i]
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == '"':
                in_string = False
        elif ch == '"':
            in_string = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return json.loads(html[start : i + 1])
    raise RuntimeError("the opus page's initial state JSON never closes")


def nodes_text(nodes: list | None) -> str:
    out = []
    for node in nodes or []:
        if isinstance(node.get("word"), dict):
            out.append(str(node["word"].get("words") or ""))
        elif isinstance(node.get("rich"), dict):
            out.append(str(node["rich"].get("text") or node["rich"].get("orig_text") or ""))
        elif isinstance(node.get("formula"), dict):
            out.append(str(node["formula"].get("latex") or ""))
    return "".join(out)


def render_list(items: list, ordered: bool, level: int = 0) -> list[str]:
    lines = []
    for idx, item in enumerate(items, 1):
        marker = f"{int(item.get('order') or idx)}." if ordered else "-"
        text = " ".join(nodes_text((p.get("text") or {}).get("nodes")).strip() for p in item.get("children") or [] if p.get("text"))
        if text:
            lines.append(f"{'  ' * level}{marker} {text}")
        for p in item.get("children") or []:
            if isinstance(p.get("list"), dict):
                lines += render_list(p["list"].get("children") or [], ordered, level + 1)
    return lines


def render_paragraph(para: dict, images: list[str]) -> str:
    kind = para.get("para_type")
    if kind == 1:
        return nodes_text((para.get("text") or {}).get("nodes")).strip()
    if kind == 8:
        heading = para.get("heading") or {}
        text = nodes_text(heading.get("nodes")).strip()
        return f"{'#' * max(2, min(6, int(heading.get('level') or 2)))} {text}" if text else ""
    if kind == 7:
        code = para.get("code") or {}
        return f"```{code.get('lang') or ''}\n{str(code.get('content') or '').rstrip()}\n```" if code.get("content") else ""
    if kind == 2:
        lines = []
        for pic in (para.get("pic") or {}).get("pics") or []:
            if url := https(str(pic.get("url") or "")):
                images.append(url)
                lines.append(f"![{pic.get('comment') or f'图片 {len(images)}'}]({{IMG{len(images)}}})")
        return "\n".join(lines)
    if kind == 5:
        lst = para.get("list") or {}
        return "\n".join(render_list(lst.get("children") or [], int(lst.get("style") or 0) == 1))
    if kind == 6:
        card = (para.get("link_card") or {}).get("card") or {}
        for key in ("eva3_video", "eva3_opus", "common", "ugc", "opus"):
            if isinstance(card.get(key), dict):
                info = card[key].get("info") if isinstance(card[key].get("info"), dict) else card[key]
                title = info.get("title") or info.get("desc") or key
                link = https(str(info.get("jump_url") or info.get("url") or ""))
                return f"[{title}]({link})" if link else str(title)
    return ""


def fetch_bilibili_opus(post: Post, opus: str, args: argparse.Namespace) -> None:
    """The public page has the whole article; the polymer API often answers -352 to anonymous calls."""
    req = urllib.request.Request(f"https://www.bilibili.com/opus/{opus}", headers={"User-Agent": USER_AGENT, "Referer": BILI_REFERER})
    with urllib.request.urlopen(req, timeout=30) as resp:
        state = initial_state(resp.read().decode("utf-8", errors="replace"))
    post.save_raw("bilibili_opus_state", state)
    detail = state.get("detail") or {}
    modules = {m.get("module_type"): m for m in detail.get("modules") or []}
    author = (modules.get("MODULE_TYPE_AUTHOR") or {}).get("module_author") or {}
    stat = (modules.get("MODULE_TYPE_STAT") or {}).get("module_stat") or {}
    title = ((modules.get("MODULE_TYPE_TITLE") or {}).get("module_title") or {}).get("text") or ""
    paragraphs = ((modules.get("MODULE_TYPE_CONTENT") or {}).get("module_content") or {}).get("paragraphs") or []
    images: list[str] = []
    blocks = [b for b in (render_paragraph(p, images) for p in paragraphs) if b]
    count = lambda key: int(((stat.get(key) or {}).get("count") if isinstance(stat.get(key), dict) else stat.get(key)) or 0)  # noqa: E731
    post.meta.update(
        id=opus,
        kind="article",
        title=title or f"opus {opus}",
        desc="\n\n".join(b for b in blocks if not b.startswith("![")),
        author={"name": author.get("name"), "id": str(author.get("mid") or "")},
        stats={"like": count("like"), "collect": count("favorite"), "comment": count("comment"), "share": count("forward"), "coin": count("coin")},
        published=iso(author.get("pub_ts")),
    )
    markdown = "\n\n".join([f"# {post.meta['title']}", *blocks]) + "\n"
    for i, url in enumerate(images, 1):
        ext = Path(urllib.parse.urlparse(url).path).suffix.lower()
        name = f"images/{i:02d}{ext if ext in ('.jpg', '.jpeg', '.png', '.webp', '.gif') else '.jpg'}"
        post.meta["files"]["images"].append(post.download(url, name, BILI_REFERER))
        markdown = markdown.replace(f"{{IMG{i}}}", name)
    (post.dir / "article.md").write_text(markdown, encoding="utf-8")
    post.meta["files"]["article"] = "article.md"
    if args.comments:
        basic = detail.get("basic") or {}
        # An opus is commented under its own type and id, not type=1 with the opus id.
        post.meta["files"]["comments"] = bilibili_comments(post, str(basic.get("comment_id_str") or ""), int(basic.get("comment_type") or 0))


def add_args(parser) -> None:
    parser.add_argument("--parts", default="all", help="parts to fetch: all (default), or e.g. 1,3-5")
    parser.add_argument("--comments", action="store_true", help="fetch comments and their replies, for every link of this run")


if __name__ == "__main__":
    raise SystemExit(cli(__doc__, "bilibili", lambda u: host_in(u, DOMAINS), lambda u: bvid_of(u) or opus_of(u) or last_segment(u), fetch_bilibili, add_args))
