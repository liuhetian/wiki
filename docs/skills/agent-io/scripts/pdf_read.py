# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "pypdfium2==5.13.0",
#     "pillow==12.3.0",
# ]
# ///
"""Read a PDF for an AI agent: the text layer where there is one, document parsing where there is not.

Run with `uv run pdf_read.py <command> <file.pdf> ...` — uv installs the pinned dependencies
from the header above into a cached environment, no manual setup.

Commands:
    read      text in reading order with <!-- Page N --> markers. Pages without a text layer
              (scans) go to document parsing, which returns formulas as LaTeX and tables as HTML;
              --parse sends pages that do have text too, when their formulas or tables come out
              scrambled. Figures are never in the text: each page says where they are.
    render    page images (PNG) to look at figures, or to check a page against the original

Pages are 1-based and written like "1-3,7" or "4-" (page 4 to the end).
Output is capped by --max-chars, and document parsing by --max-parse pages per call; both stop
on a page boundary with a continuation hint, so one call never floods the context or the bill.
Parsed pages are cached in <file>.parsed/ next to the PDF: reading them again is free.

Engines:
    pypdfium2     (Apache-2.0 / BSD-3) Chrome's PDFium: text, image detection, page rendering
    PaddleOCR-VL  Baidu document parsing, billed per page, through the user's gateway
                  (needs MY_API_KEY in the environment)
"""

from __future__ import annotations

import argparse
import base64
import io
import json
import os
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import pypdfium2 as pdfium
import pypdfium2.raw as pdfium_c

GATEWAY = "https://baidu-proxy.liuhetian.work/rest/2.0/brain/online/v2/paddle-vl-parser"
DEFAULT_MAX_CHARS = 30_000
DEFAULT_MAX_PARSE = 10
DEFAULT_MAX_RENDER = 10
MIN_TEXT_CHARS = 10  # a page with fewer non-space characters has no usable text layer
MIN_IMAGE_SHARE = 0.02  # smaller images are logos and bullets, not figures
DENSE_TABLE_CELLS = 300  # parsing can drop the last cells of tables this large
UPLOAD_BYTES = 15_000_000  # raw PDF per parsing task; the API takes 50 MB of base64
PARSED_PAGE_ESTIMATE = 2_000  # chars, to stop before parsing pages that would be cut anyway
SKIP_LAYOUTS = {"number", "aside_text", "header", "footer", "header_image", "footer_image"}
FIGURE_LAYOUTS = {"image", "chart"}


class UsageError(Exception):
    """A problem the caller can fix by changing arguments; printed without a traceback."""


class ParseError(Exception):
    """Document parsing failed; the pages it covered are reported and the rest still prints."""


# ---------------------------------------------------------------- helpers


def parse_pages(spec: str | None, page_count: int) -> list[int]:
    """Parse "1-3,7" / "4-" into sorted unique 1-based pages; None means every page."""
    if spec is None:
        return list(range(1, page_count + 1))
    pages: set[int] = set()
    for part in spec.replace(" ", "").split(","):
        if not part:
            continue
        try:
            if "-" in part:
                start_text, end_text = part.split("-", 1)
                start = int(start_text)
                end = int(end_text) if end_text else page_count
            else:
                start = end = int(part)
        except ValueError:
            raise UsageError(f'bad page spec "{part}": use numbers and ranges like "1-3,7" or "4-"') from None
        if start < 1 or end < start:
            raise UsageError(f'bad page range "{part}": pages start at 1 and ranges go low-high')
        if end > page_count:
            raise UsageError(f"page {end} does not exist: the document has {page_count} pages")
        pages.update(range(start, end + 1))
    if not pages:
        raise UsageError("empty page spec")
    return sorted(pages)


def format_pages(pages: list[int]) -> str:
    """Compress [1,2,3,7] to "1-3, 7"."""
    parts: list[str] = []
    i = 0
    while i < len(pages):
        j = i
        while j + 1 < len(pages) and pages[j + 1] == pages[j] + 1:
            j += 1
        parts.append(str(pages[i]) if i == j else f"{pages[i]}-{pages[j]}")
        i = j + 1
    return ", ".join(parts) if parts else "none"


def page_spec(pages: list[int]) -> str:
    return format_pages(pages).replace(" ", "")


def normalize(text: str) -> str:
    """Map Kangxi radicals (U+2F00-U+2FDF) to ordinary CJK characters.

    Some PDF producers map glyphs such as 人 to the radical ⼈ in their ToUnicode table:
    the page looks right but the extracted text does not match searches. NFKC fixes exactly
    this range; applying NFKC to the whole text would also rewrite full-width punctuation.
    """
    if not any(0x2F00 <= ord(ch) <= 0x2FDF for ch in text):
        return text
    return "".join(unicodedata.normalize("NFKC", ch) if 0x2F00 <= ord(ch) <= 0x2FDF else ch for ch in text)


def open_pdf(path: Path, password: str | None) -> pdfium.PdfDocument:
    if not path.is_file():
        raise UsageError(f"not a file: {path}")
    try:
        return pdfium.PdfDocument(str(path), password=password)
    except pdfium.PdfiumError as error:
        message = str(error)
        if "password" in message.lower():
            raise UsageError(f"{path} is encrypted: pass --password") from None
        raise UsageError(f"cannot open {path} as PDF: {message}") from None


def page_text(document: pdfium.PdfDocument, page_number: int) -> str:
    page = document[page_number - 1]
    try:
        textpage = page.get_textpage()
        try:
            text = textpage.get_text_bounded()
        finally:
            textpage.close()
    finally:
        page.close()
    return normalize(text.replace("\r\n", "\n").replace("\r", "\n")).strip()


def has_text(text: str) -> bool:
    return len("".join(text.split())) >= MIN_TEXT_CHARS


def page_images(document: pdfium.PdfDocument, page_number: int) -> list[float]:
    """Area shares of the embedded raster images big enough to be figures, largest first.

    Vector drawings are paths, indistinguishable from table rules, so they are not counted.
    """
    page = document[page_number - 1]
    try:
        width, height = page.get_size()
        shares = []
        for obj in page.get_objects(filter=[pdfium_c.FPDF_PAGEOBJ_IMAGE]):
            left, bottom, right, top = obj.get_bounds()
            share = (right - left) * (top - bottom) / (width * height)
            if share >= MIN_IMAGE_SHARE:
                shares.append(min(share, 1.0))
    finally:
        page.close()
    return sorted(shares, reverse=True)


def emit_capped(chunks: list[tuple[int, str]], max_chars: int, total_pages: int, rest: list[int], reason: str) -> None:
    """Print page chunks until max_chars; stop on a page boundary and say how to continue."""
    used = 0
    shown: list[int] = []
    for index, (page_number, chunk) in enumerate(chunks):
        if shown and used + len(chunk) > max_chars:
            rest = [number for number, _ in chunks[index:]] + rest
            reason = f"Output capped at {max_chars} chars"
            break
        if not shown and len(chunk) > max_chars:
            print(chunk[:max_chars])
            print(f"\n(Page {page_number} alone exceeds {max_chars} chars and was truncated. Raise --max-chars.)")
            shown.append(page_number)
            used = max_chars
            continue
        print(chunk)
        shown.append(page_number)
        used += len(chunk)
    summary = f"Showing pages {format_pages(shown)} of {total_pages}."
    if rest:
        summary = f"{reason}. {summary} Continue with --pages {page_spec(rest)}."
    print(f"\n({summary})")


# ---------------------------------------------------------------- document parsing


class ParseCache:
    """Parsed pages as page-NNN.md next to their figure crops; dropped when the PDF changes."""

    def __init__(self, directory: Path, source: Path):
        self.directory = directory
        stat = source.stat()
        self.stamp = f"{stat.st_size}:{stat.st_mtime_ns}"
        self.checked = False

    def _check(self) -> None:
        if self.checked:
            return
        self.checked = True
        marker = self.directory / ".source"
        if not self.directory.is_dir() or (marker.is_file() and marker.read_text() == self.stamp):
            return
        for path in [*self.directory.glob("page-*.md"), *self.directory.glob("page-*-fig-*")]:
            path.unlink()

    def get(self, page_number: int) -> str | None:
        self._check()
        path = self.directory / f"page-{page_number:03d}.md"
        return path.read_text() if path.is_file() else None

    def put(self, page_number: int, text: str) -> None:
        self._check()
        self.directory.mkdir(parents=True, exist_ok=True)
        (self.directory / ".source").write_text(self.stamp)
        (self.directory / f"page-{page_number:03d}.md").write_text(text)


def gateway_request(path: str, fields: dict, key: str) -> dict:
    request = urllib.request.Request(
        GATEWAY + path,
        data=urllib.parse.urlencode(fields).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/x-www-form-urlencoded"},
    )
    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            return json.loads(response.read())
    except urllib.error.HTTPError as error:
        hint = ": check MY_API_KEY" if error.code in (401, 403) else ""
        raise ParseError(f"gateway returned HTTP {error.code}{hint}") from None
    except (urllib.error.URLError, OSError) as error:
        raise ParseError(f"cannot reach the gateway: {error}") from None


def gateway_post(path: str, fields: dict, key: str) -> dict:
    result = gateway_request(path, fields, key)
    if result.get("error_code"):  # Baidu reports failures inside HTTP 200
        raise ParseError(f"Baidu error {result['error_code']}: {result.get('error_msg')}")
    return result["result"]


def check_token(key: str) -> None:
    """A tiny free request first: with a wrong token the gateway answers 401 before reading
    an upload and drops the connection, which would look like a network failure."""
    gateway_request("/task/query", {"task_id": "token-check"}, key)


def plural(pages: list[int]) -> str:
    return f"Page {pages[0]}" if len(pages) == 1 else f"Pages {format_pages(pages)}"


def download(url: str) -> bytes:
    try:
        with urllib.request.urlopen(url, timeout=120) as response:
            return response.read()
    except (urllib.error.URLError, TimeoutError) as error:
        raise ParseError(f"cannot download the parse result: {error}") from None


def subset_pdf(document: pdfium.PdfDocument, pages: list[int]) -> bytes:
    subset = pdfium.PdfDocument.new()
    try:
        subset.import_pages(document, [page - 1 for page in pages])
        buffer = io.BytesIO()
        subset.save(buffer)
    finally:
        subset.close()
    return buffer.getvalue()


def split_for_upload(document: pdfium.PdfDocument, pages: list[int]) -> list[tuple[list[int], bytes]]:
    data = subset_pdf(document, pages)
    if len(data) <= UPLOAD_BYTES or len(pages) == 1:
        return [(pages, data)]
    middle = len(pages) // 2
    return split_for_upload(document, pages[:middle]) + split_for_upload(document, pages[middle:])


def wait_for(task_id: str, key: str) -> dict:
    deadline = time.time() + 900
    time.sleep(5)
    while True:
        result = gateway_post("/task/query", {"task_id": task_id}, key)
        if result["status"] == "success":
            return result
        if result["status"] == "failed":
            raise ParseError(f"parsing task failed: {result.get('task_error')}")
        if time.time() > deadline:
            raise ParseError(f"parsing task {task_id} still {result['status']} after 15 minutes")
        time.sleep(3)


def figure_line(page_number: int, index: int, url: str | None, cache: ParseCache) -> str:
    if url:
        suffix = Path(urllib.parse.urlparse(url).path).suffix or ".jpg"
        target = cache.directory / f"page-{page_number:03d}-fig-{index}{suffix}"
        try:
            cache.directory.mkdir(parents=True, exist_ok=True)
            target.write_bytes(download(url))
            return f"[Figure {index} of page {page_number}: {target} (not in the text; open it with your image tool)]"
        except ParseError:
            pass
    return f"[Figure {index} of page {page_number}: not downloaded; render --pages {page_number} to see it]"


def page_markdown(page: dict, page_number: int, cache: ParseCache) -> str:
    """Rebuild one parsed page from its layout blocks.

    Unlike the API's own Markdown this keeps equation numbers (as \\tag), points figures at
    local crops instead of expiring URLs, drops running headers and page numbers, and keeps
    tables as bare HTML.
    """
    crops = {image["layout_id"]: image.get("data_url") for image in page.get("images") or []}
    page_area = page["meta"]["page_width"] * page["meta"]["page_height"]
    blocks: list[str] = []
    printed = None
    figures = 0
    for layout in page["layouts"]:
        kind = layout["type"]
        text = (layout.get("text") or "").strip()
        if kind == "number":
            printed = text or printed
            continue
        if kind in SKIP_LAYOUTS:
            continue
        if kind in FIGURE_LAYOUTS:
            _, _, width, height = layout["position"]
            if width * height >= MIN_IMAGE_SHARE * page_area:
                figures += 1
                blocks.append(figure_line(page_number, figures, crops.get(layout["layout_id"]), cache))
            continue
        if kind == "formula_number" and blocks:  # the API's Markdown drops these
            if blocks[-1].endswith("$$"):
                blocks[-1] = blocks[-1][:-2].rstrip() + f" \\tag{{{text.strip('()（） ')}}} $$"
            else:
                blocks[-1] += f" {text}"
            continue
        if not text:
            continue
        if kind in ("doc_title", "paragraph_title"):
            text = "# " + text
        blocks.append(normalize(text))
        if kind == "table" and text.count("<td") > DENSE_TABLE_CELLS:
            blocks.append(
                f"[Page {page_number}: this table has {text.count('<td')} cells; parsing can drop the last cells "
                f"of very dense tables, check them with render --pages {page_number}]"
            )
    label = f"printed {printed}, parsed" if printed else "parsed"
    return f"<!-- Page {page_number} ({label}) -->\n" + "\n\n".join(blocks) + "\n"


def parse_remote(document: pdfium.PdfDocument, pages: list[int], key: str, cache: ParseCache) -> list[str]:
    """Parse pages into the cache; return one warning per failed batch."""
    try:
        check_token(key)
    except ParseError as error:
        return [f"{plural(pages).lower()}: {error}"]
    failures: list[str] = []
    tasks: list[tuple[list[int], str]] = []
    for batch, data in split_for_upload(document, pages):
        print(f"parsing {plural(batch).lower()} ({len(data) / 1e6:.1f} MB)...", file=sys.stderr)
        try:
            fields = {"file_data": base64.b64encode(data).decode(), "file_name": "pages.pdf"}
            tasks.append((batch, gateway_post("/task", fields, key)["task_id"]))
        except ParseError as error:
            failures.append(f"{plural(batch).lower()}: {error}")
    for batch, task_id in tasks:
        started = time.time()
        try:
            result = wait_for(task_id, key)
            parsed = json.loads(download(result["parse_result_url"]))
            for page in parsed["pages"]:
                page_number = batch[page["page_num"]]
                cache.put(page_number, page_markdown(page, page_number, cache))
            print(f"{plural(batch).lower()} parsed in {time.time() - started:.0f}s", file=sys.stderr)
        except (ParseError, KeyError, IndexError, ValueError) as error:
            failures.append(f"{plural(batch).lower()}: {error}")
    return failures


# ---------------------------------------------------------------- commands


def cmd_read(args: argparse.Namespace) -> None:
    document = open_pdf(args.file, args.password)
    page_count = len(document)
    selected = parse_pages(args.pages, page_count)
    key = os.environ.get("MY_API_KEY", "").strip()
    if args.parse and not key:
        raise UsageError("--parse needs MY_API_KEY in the environment (the gateway token)")
    cache = ParseCache(args.out or args.file.with_name(f"{args.file.stem}.parsed"), args.file)

    # Walk the pages once to decide where each comes from: the parse cache, the text layer,
    # document parsing, or nowhere (no text and no token). Stop early at either cap.
    plan: list[int] = []
    texts: dict[int, str] = {}
    to_parse: list[int] = []
    no_text: list[int] = []
    estimate = 0
    reason = ""
    for page_number in selected:
        if estimate >= args.max_chars:
            reason = f"Output capped at {args.max_chars} chars"
            break
        cached = cache.get(page_number)
        text = cached if cached is not None else page_text(document, page_number)
        if cached is not None or (has_text(text) and not args.parse):
            texts[page_number] = text
            estimate += len(text)
        elif key:
            if len(to_parse) == args.max_parse:
                reason = f"Document parsing capped at {args.max_parse} pages per call (--max-parse)"
                break
            to_parse.append(page_number)
            estimate += PARSED_PAGE_ESTIMATE
        else:
            no_text.append(page_number)
        plan.append(page_number)
    rest = selected[len(plan) :]

    failures = parse_remote(document, to_parse, key, cache) if to_parse else []
    chunks: list[tuple[int, str]] = []
    for page_number in plan:
        if page_number in to_parse or page_number in no_text:
            parsed = cache.get(page_number) if page_number in to_parse else None
            chunks.append((page_number, parsed or f"<!-- Page {page_number}: not read, render it -->\n"))
            continue
        text = texts[page_number]
        if text.startswith("<!-- Page"):  # from the parse cache, already a full chunk
            chunks.append((page_number, text))
            continue
        chunk = f"<!-- Page {page_number} -->\n{text}\n"
        shares = page_images(document, page_number)
        if shares:
            sizes = ", ".join(f"{share:.0%}" for share in shares)
            chunk += (
                f"[Page {page_number} has {len(shares)} image(s) not in the text ({sizes} of the page): "
                f"render --pages {page_number} to see them]\n"
            )
        chunks.append((page_number, chunk))
    document.close()

    parsed_now = [page for page in to_parse if cache.get(page) is not None]
    if parsed_now:
        print(
            f"<note>{plural(parsed_now)} read by document parsing, {len(parsed_now)} billed; cached in "
            f"{cache.directory}, reading again is free. Formulas are LaTeX, tables are HTML.</note>\n"
        )
    for failure in failures:
        print(f"<warning>Document parsing failed for {failure}. Render those pages instead.</warning>\n")
    if no_text:
        print(
            f"<warning>{plural(no_text)}: no text layer, and MY_API_KEY is not set so document parsing "
            f"was skipped. Load the gateway token, or render them.</warning>\n"
        )
    emit_capped(chunks, args.max_chars, page_count, rest, reason)


def cmd_render(args: argparse.Namespace) -> None:
    document = open_pdf(args.file, args.password)
    page_count = len(document)
    if args.pages is None:
        raise UsageError('render needs --pages, e.g. --pages 3 or --pages "1-2,5"')
    pages = parse_pages(args.pages, page_count)
    if len(pages) > args.max_pages:
        raise UsageError(
            f"{len(pages)} pages requested, limit is {args.max_pages}: render fewer pages or raise --max-pages"
        )
    out = args.out or args.file.with_name(f"{args.file.stem}.pages")
    out.mkdir(parents=True, exist_ok=True)
    for page_number in pages:
        page = document[page_number - 1]
        try:
            image = page.render(scale=args.dpi / 72).to_pil()
        finally:
            page.close()
        target = out / f"page-{page_number:03d}.png"
        image.save(target, optimize=True)
        print(f"{target}  ({image.width}x{image.height})")
    document.close()
    print(f"\n(Rendered {len(pages)} of {page_count} pages at {args.dpi} dpi. Open the PNGs with your image tool.)")


# ---------------------------------------------------------------- entry


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="pdf_read.py", description=__doc__.split("\n\n")[0])
    sub = parser.add_subparsers(dest="command", required=True)

    def add(name: str, help_text: str) -> argparse.ArgumentParser:
        command = sub.add_parser(name, help=help_text)
        command.add_argument("file", type=Path, help="path to the PDF")
        command.add_argument("--password", help="password for an encrypted PDF")
        return command

    read = add("read", "text, with document parsing for pages that have none")
    read.add_argument("--pages", help='1-based pages like "1-3,7" or "4-"; default all')
    read.add_argument("--parse", action="store_true", help="send pages that have text to document parsing too")
    read.add_argument("--max-chars", type=int, default=DEFAULT_MAX_CHARS, help="output cap per call")
    read.add_argument("--max-parse", type=int, default=DEFAULT_MAX_PARSE, help="pages sent to parsing per call")
    read.add_argument("--out", type=Path, help="parse cache directory; default <file>.parsed/ next to the PDF")
    render = add("render", "page images as PNG")
    render.add_argument("--pages", help='1-based pages like "3" or "1-2,5"; required')
    render.add_argument("--dpi", type=int, default=150, help="resolution; 150 reads body text, 200+ for small print")
    render.add_argument("--out", type=Path, help="output directory; default <file>.pages/ next to the PDF")
    render.add_argument("--max-pages", type=int, default=DEFAULT_MAX_RENDER, help="refuse larger batches")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    handlers = {"read": cmd_read, "render": cmd_render}
    try:
        handlers[args.command](args)
    except UsageError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
