#!/usr/bin/env python3
"""WeChat official-account (公众号) articles into folders: text as article.md, author, original images.

Run `python3 wechat_mp.py <article link>... --out <dir>` for articles, `--account <name, gh_ id or an
article link> --limit N` for an account's newest N articles (20 by default). Standard library only;
needs share_common.py beside it, and MY_API_KEY in the environment for the paid calls.

An article comes from its public page, free: the account, writer and time from the page's variables,
the body (#js_content) written to article.md with every image saved as the original (/640 -> /0).
When the page has no body (a verification page, or a layout this script does not know), TikHub
fetch_article_detail_h5 gives the same body for 0.01 USD. --stats adds read, like, wow (在看), share,
collect and comment counts from fetch_article_stats, 0.01 USD an article.

An account has no profile link to share, so --account takes it: a gh_ id as is, an article link read
for its gh_ id (free), anything else searched by name with fetch_search (0.01 USD, exact name only)
and remembered in wechat_mp_accounts/accounts.json. Its list pages through fetch_account_articles,
about 25 articles and 0.01 USD a page, newest first; then each article as above, a second apart.
--limit 0 lists the whole account and needs --yes. Folder layout and reruns: see share_common.py.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from share_common import USER_AGENT, Post, Profile, finish, host_in, https, iso, last_segment, run, run_profile  # noqa: E402

PLATFORM = "wechat_mp"
SEARCH = "/api/v1/wechat_search/v2/fetch_search"
ARTICLES = "/api/v1/wechat_mp/v2/fetch_account_articles"
STATS = "/api/v1/wechat_mp/v2/fetch_article_stats"
DETAIL = "/api/v1/wechat_mp/v2/fetch_article_detail_h5"
GONE = ("已被发布者删除", "此内容因违规无法查看", "此内容被多人投诉", "该公众号已迁移", "内容已删除")
KINDS = {"5": "video", "7": "audio", "8": "image"}  # item_show_type; 0 and 10 are articles


def matches(url: str) -> bool:
    return host_in(url, ("mp.weixin.qq.com",)) and urllib.parse.urlparse(url).path.startswith("/s")


def article_key(url: str) -> str:
    """__biz_mid_idx for a long link, the code for /s/<code>."""
    q = urllib.parse.parse_qs(urllib.parse.urlparse(html.unescape(url)).query)
    if q.get("__biz") and q.get("mid"):
        return f"{q['__biz'][0].rstrip('=')}_{q['mid'][0]}_{(q.get('idx') or ['1'])[0]}"
    match = re.search(r"/s/([\w-]{6,})", url)
    return match.group(1) if match else last_segment(url)


def original(url: str) -> str:
    """mmbiz images end in /640 (1080 wide at most); /0 is the uploaded original."""
    parts = urllib.parse.urlsplit(https(html.unescape(url)))
    if (parts.hostname or "").endswith("qpic.cn"):
        parts = parts._replace(path=re.sub(r"/\d+$", "/0", parts.path))
    return urllib.parse.urlunsplit(parts)


class Body(HTMLParser):
    """#js_content to markdown blocks; images become {IMGn} placeholders."""

    BLOCK = {"p", "div", "section", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol", "blockquote",
             "figure", "figcaption", "table", "tr", "hr", "pre"}
    SKIP = {"script", "style", "svg", "mp-style-type"}
    VOID = {"br", "img", "hr", "input", "meta", "link", "source", "wbr", "col"}
    MEDIA = {"iframe": "[视频]", "mpvideo": "[视频]", "mp-common-videosnap": "[视频号视频]",
             "mpvoice": "[音频]", "mp-common-mpaudio": "[音频]"}

    def __init__(self, inside: bool = False):
        super().__init__(convert_charrefs=True)
        self.depth = 1 if inside else 0  # > 0 while inside #js_content
        self.skip = 0
        self.blocks: list[str] = []
        self.line: list[str] = []
        self.images: list[str] = []
        self.links: list[tuple[int, str]] = []
        self.heading = 0
        self.bullet = False
        self.quote = 0
        self.code: list[str] | None = None
        self.end: tuple[int, int] | None = None

    def flush(self) -> None:
        text = "".join(self.line)
        self.line.clear()
        if text.count("**") % 2:  # a bold that spans blocks: drop it rather than leave one side open
            text = text.replace("**", "")
        # Pair them up; spaces inside a pair move outside it, an empty pair goes.
        text = re.sub(r"\*\*(\s*)(.*?)(\s*)\*\*", lambda m: f"{m[1]}**{m[2]}**{m[3]}" if m[2] else m[1] + m[3], text, flags=re.S)
        lines = [re.sub(r"\s+", " ", ln).strip() for ln in text.split("\n")]
        text = "\n".join(ln for ln in lines if ln)
        if not text:
            return
        prefix = "#" * min(6, self.heading + 1) + " " if self.heading else "- " if self.bullet else ""
        if self.quote:
            text = "\n".join("> " + ln for ln in text.split("\n"))
        self.blocks.append(prefix + text)

    def handle_starttag(self, tag: str, attrs: list) -> None:
        a = dict(attrs)
        if not self.depth:
            if a.get("id") == "js_content":
                self.depth = 1
            return
        if tag not in self.VOID:
            self.depth += 1
        if self.skip or tag in self.SKIP:
            self.skip += tag not in self.VOID
            return
        if self.code is not None:
            if tag == "br":
                self.code.append("\n")
            return
        if tag == "img":
            url = a.get("data-src") or a.get("src") or ""
            if url.startswith(("http", "//")):
                self.flush()
                self.images.append(original(url))
                self.blocks.append(f"![]({{IMG{len(self.images)}}})")
        elif tag == "br":
            self.line.append("\n")
        elif tag in self.MEDIA:
            self.flush()
            self.blocks.append(self.MEDIA[tag])
        elif tag == "pre":
            self.flush()
            self.code = []  # data-lang is the editor's guess (apache, makefile for shell), so leave it out
        elif tag in self.BLOCK:
            self.flush()
            if tag[0] == "h" and tag[1:].isdigit():
                self.heading = int(tag[1:])
            elif tag == "li":
                self.bullet = True
            elif tag == "blockquote":
                self.quote += 1
        elif tag in ("strong", "b"):
            self.line.append("**")
        elif tag in ("td", "th") and self.line:
            self.line.append(" | ")
        elif tag == "a":
            self.links.append((len(self.line), a.get("href") or ""))

    def handle_endtag(self, tag: str) -> None:
        if not self.depth or tag in self.VOID:
            return
        self.depth -= 1
        if self.skip:
            self.skip -= 1
            return
        if not self.depth:
            self.flush()
            self.end = self.getpos()
            return
        if self.code is not None:
            if tag == "code":
                self.code.append("\n")
            elif tag == "pre":
                code = re.sub(r"\n{3,}", "\n\n", "".join(self.code).replace(" ", " ")).strip("\n")
                if code.strip():
                    self.blocks.append(f"```\n{code}\n```")
                self.code = None
            return
        if tag in ("strong", "b"):
            self.line.append("**")
        elif tag == "a" and self.links:
            start, href = self.links.pop()
            text = "".join(self.line[start:]).strip()
            if text and href.startswith("http") and "\n" not in text:
                self.line[start:] = [f"[{text}]({href})"]
        elif tag in self.BLOCK:
            self.flush()
            if tag[0] == "h" and tag[1:].isdigit():
                self.heading = 0
            elif tag == "li":
                self.bullet = False
            elif tag == "blockquote":
                self.quote = max(0, self.quote - 1)

    def handle_data(self, data: str) -> None:
        if not self.depth or self.skip:
            return
        if self.code is not None:
            self.code.append(data)
        else:
            self.line.append(data.replace(" ", " "))


def page_var(page: str, *patterns: str) -> str:
    for pattern in patterns:
        if match := re.search(pattern, page):
            return html.unescape(match.group(1)).strip()
    return ""


def js_or(page: str, name: str) -> str:
    """The first non-empty value of `var name = "" || "x" || "";`, the page's way of writing defaults."""
    match = re.search(rf'var {name} = ((?:"[^"]*"\s*\|\|\s*)*"[^"]*")', page)
    return next((v for v in re.findall(r'"([^"]*)"', match.group(1)) if v), "") if match else ""


def read_page(post: Post) -> dict | None:
    """The public page's fields and body; None when it has no body to read."""
    req = urllib.request.Request(https(post.url), headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        page = resp.read().decode("utf-8", errors="replace")
    start = page.find('id="js_content"')
    if start < 0:
        if gone := next((g for g in GONE if g in page), None):
            raise RuntimeError(f"the page says {gone}")
        title = page_var(page, r"<title>\s*([^<]*?)\s*</title>") or "no title"
        post.warn(f"the page has no #js_content ({title}); fell back to TikHub fetch_article_detail_h5")
        return None
    start = page.rfind("<", 0, start)
    begin = page.find(">", start) + 1
    body = Body(inside=True)
    for at in range(begin, len(page), 1 << 16):  # stop at the body's end; the rest of the page is megabytes of script
        body.feed(page[at:at + (1 << 16)])
        if body.end:
            break
    if body.end:
        lines = page[begin:].split("\n", body.end[0] - 1)
        end = begin + sum(len(ln) + 1 for ln in lines[: body.end[0] - 1]) + body.end[1]
    else:
        body.close()
        body.flush()
        post.warn("could not find where #js_content ends; article.md may carry page text after the article")
        end = len(page)
    if not body.blocks:
        post.warn("#js_content is empty; fell back to TikHub fetch_article_detail_h5")
        return None
    fields = {
        "title": page_var(page, r'property="og:title" content="([^"]*)"', r"var msg_title = '([^']*)'"),
        "desc": page_var(page, r'property="og:description" content="([^"]*)"', r'var msg_desc = htmlDecode\("([^"]*)"\)'),
        "account": page_var(page, r'var nickname = htmlDecode\("([^"]*)"\)', r"nick_name: '([^']*)'"),
        "account_id": page_var(page, r'var user_name = "([^"]*)"', r"user_name: '([^']*)'"),
        "writer": page_var(page, r'var author = "([^"]*)"', r'<meta name="author" content="([^"]*)"'),
        "time": page_var(page, r'var create_time = "(\d+)"', r"create_time: '(\d+)'"),
        "cover": page_var(page, r'var msg_cdn_url = "([^"]*)"', r'property="og:image" content="([^"]*)"'),
        "ip": page_var(page, r"ip_wording: \{[^}]*?province_name: '([^']*)'", r"ip_wording: \{[^}]*?country_name: '([^']*)'"),
        "show_type": page_var(page, r'var item_show_type = "(\d+)"'),
        "id": "_".join((js_or(page, "biz").rstrip("="), js_or(page, "mid"), js_or(page, "idx"))).strip("_"),
        "paid": "appmsg_needpay" in page and bool(re.search(r"appmsg_needpay\s*[:=]\s*['\"]?1", page)),
    }
    post.save_raw("page", {**fields, "content_html": page[start:end]})
    return {**fields, "blocks": body.blocks, "images": body.images}


def read_tikhub(post: Post) -> dict:
    content = (post.tikhub(DETAIL, {}, body={"url": https(post.url), "raw": True}) or {}).get("content") or {}
    body = Body(inside=True)
    body.feed(str(content.get("content_noencode") or ""))
    body.close()
    body.flush()
    if not body.blocks:
        raise RuntimeError("TikHub gave no body either")
    ip = content.get("ip_wording") or {}
    return {
        "title": content.get("title") or "",
        "desc": content.get("desc") or "",
        "account": content.get("nick_name") or "",
        "account_id": content.get("user_name") or "",
        "writer": content.get("author") or "",
        "time": content.get("create_timestamp") or content.get("ori_create_time"),
        "cover": content.get("cdn_url") or "",
        "ip": ip.get("province_name") or ip.get("country_name") if isinstance(ip, dict) else None,
        "show_type": str(content.get("item_show_type") or "0"),
        "id": "",
        "paid": bool(content.get("appmsg_needpay")),
        "blocks": body.blocks,
        "images": body.images,
    }


def fetch(post: Post, args: argparse.Namespace) -> None:
    info = read_page(post) or read_tikhub(post)
    post.meta.update(
        id=info["id"] or article_key(post.url),
        kind=KINDS.get(info["show_type"], "article"),
        title=info["title"],
        desc=info["desc"],
        author={"name": info["account"], "id": info["account_id"], "writer": info["writer"] or None},
        published=iso(info["time"]),
        ip_location=info["ip"] or None,
    )
    if info["paid"]:
        post.warn("a paid article: the page shows only the free part")
    markdown = "\n\n".join([
        f"# {info['title']}",
        " · ".join(filter(None, (info["account"], info["writer"], (post.meta["published"] or "")[:16].replace("T", " "),
                                 f"[原文]({https(post.url)})"))),
        *info["blocks"],
    ]) + "\n"
    for i, url in enumerate(info["images"], 1):
        name = url
        if not args.no_images:
            try:
                name = post.download(url, f"images/{i:02d}.jpg")
                post.meta["files"]["images"].append(name)
            except Exception as exc:  # noqa: BLE001 - keep the remote URL in article.md
                post.warn(f"image {i}: download failed ({type(exc).__name__}: {exc}); article.md keeps its URL")
        markdown = markdown.replace(f"{{IMG{i}}}", name)
    (post.dir / "article.md").write_text(markdown, encoding="utf-8")
    post.meta["files"]["article"] = "article.md"
    if info["cover"] and not args.no_images:
        try:
            post.meta["files"]["cover"] = post.download(https(info["cover"]), "cover.jpg")
        except Exception as exc:  # noqa: BLE001
            post.warn(f"cover: download failed ({type(exc).__name__}: {exc})")
    if args.stats:
        s = post.tikhub(STATS, {}, body={"url": https(post.url), "raw": False}) or {}
        post.meta["stats"] = {"read": s.get("read_num"), "like": s.get("like_count"), "wow": s.get("old_like_count"),
                              "share": s.get("share_count"), "collect": s.get("collect_count"), "comment": s.get("comment_count")}


class WechatProfile(Profile):
    """An account's article list; the account itself comes from --account, not from a link."""

    def __init__(self, args: argparse.Namespace):
        self.detail_usd = 0.01 if args.stats else 0.0
        self.who: dict = {}

    def user_id(self, url: str) -> str:
        return ""

    def page(self, lister, uid, cursor, n):
        data = lister.tikhub(ARTICLES, {}, raw_name=f"tikhub_fetch_account_articles_p{n:02d}",
                             body={"username": uid, "offset": cursor or "", "raw": False}) or {}
        if "articles" not in data:
            raise ValueError(f"no articles in the reply: {str(data)[:200]}")
        return data["articles"] or [], data.get("next_offset"), not data.get("is_end") and bool(data.get("next_offset"))

    def item(self, raw: dict) -> dict:
        url = https(html.unescape(str(raw.get("url") or "")))
        return {
            "id": article_key(url),
            "url": url,
            "title": raw.get("title") or "",
            "published": iso(raw.get("create_time")),
            "pinned": False,
            "kind": KINDS.get(str(raw.get("item_show_type") or 0), "article"),
            "stats": None,
            "digest": raw.get("digest") or "",
        }

    def author(self, raw: dict) -> dict:
        return self.who

    def fetch(self, post, raw, args) -> None:
        time.sleep(1)  # one account's pages back to back; a second apart keeps clear of the verification page
        fetch(post, args)
        if raw and not post.meta["desc"]:
            post.meta["desc"] = raw.get("digest") or ""
        if not self.who.get("name"):  # a bare gh_ id: list.json's author gets the name from the first article
            self.who["name"] = post.meta["author"]["name"]


def find_account(source: str, finder: Post) -> tuple[str, str]:
    """(gh_ id, name) for --account; a name is searched once and remembered. finder keeps the cost."""
    cache_path = finder.dir / "accounts.json"
    cache = json.loads(cache_path.read_text(encoding="utf-8")) if cache_path.exists() else {}
    if source.startswith("gh_"):
        return source, cache.get(source, {}).get("name") or ""
    if hit := cache.get(source):
        return hit["id"], hit["name"]
    if source.startswith("http"):
        if not matches(source):
            raise ValueError("not a mp.weixin.qq.com article link")
        info = read_page(finder)
        if not info or not info["account_id"]:
            raise ValueError("no gh_ id on that article's page")
        found = {"id": info["account_id"], "name": info["account"]}
    else:
        safe = re.sub(r"[^\w-]+", "_", source)[:40]
        data = finder.tikhub(SEARCH, {}, raw_name=f"tikhub_fetch_search_{safe}",
                             body={"keyword": source, "business_type": "account", "raw": False}) or {}
        hits = [{"id": (i.get("jumpInfo") or {}).get("userName") or "", "name": re.sub(r"<[^>]+>", "", i.get("title") or "")}
                for i in data.get("items") or [] if isinstance(i.get("jumpInfo"), dict)]
        hits = [h for h in hits if h["id"].startswith("gh_")]  # @finder ids are Channels accounts
        exact = [h for h in hits if h["name"] == source]
        if not exact:
            raise ValueError(f"no account named exactly {source!r}; search gave {[(h['name'], h['id']) for h in hits[:5]]}")
        found = exact[0]
        if len(exact) > 1:
            print(f"warning: {len(exact)} accounts named {source!r}, took {found['id']}", file=sys.stderr)
    cache[source] = found
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    return found["id"], found["name"]


def account(source: str, out: Path, args: argparse.Namespace) -> dict:
    if args.limit == 0 and not args.yes:
        return {"source": source, "kind": "profile", "error": "--limit 0 pages the whole account, often hundreds of "
                "pages at 0.01 USD each; add --yes, or give --limit N"}
    finder = Post(source, PLATFORM, "accounts", out)
    try:
        uid, name = find_account(source, finder)
    except Exception as exc:  # noqa: BLE001
        return {"source": source, "kind": "profile", "cost": finder.meta["cost"], "error": f"{type(exc).__name__}: {exc}"}
    profile = WechatProfile(args)
    profile.who = {"name": name or None, "id": uid}
    result = run_profile(source, uid, out, args, PLATFORM, matches, article_key, profile)
    result["cost"]["usd"] = round(result["cost"]["usd"] + finder.meta["cost"]["usd"], 4)
    return result


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("links", nargs="*", help="article links, or whole share texts containing one")
    parser.add_argument("--account", action="append", default=[], help="an account: its name, gh_ id, or one of its article links")
    parser.add_argument("--out", required=True, help="output directory; one subfolder per article")
    parser.add_argument("--limit", type=int, default=20, help="--account: the newest N articles (default 20); 0 = all, needs --yes")
    parser.add_argument("--yes", action="store_true", help="--account: go on with --limit 0, or when --stats would pass 1 USD")
    parser.add_argument("--stats", action="store_true", help="read, like, wow, share, collect, comment counts; 0.01 USD an article")
    parser.add_argument("--no-images", action="store_true", help="keep image URLs in article.md instead of downloading them")
    parser.add_argument("--force", action="store_true", help="fetch again even if meta.json exists; pays again")
    parser.set_defaults(no_video=True, video=False)  # run() and run_profile() read these; articles have no video
    args = parser.parse_args()
    if not args.links and not args.account:
        parser.error("give article links, --account, or both")
    out = Path(args.out).resolve()
    results = [account(source, out, args) for source in args.account]
    results += [run(link, out, args, PLATFORM, matches, article_key, fetch) for link in args.links]
    return finish(results)


if __name__ == "__main__":
    raise SystemExit(main())
