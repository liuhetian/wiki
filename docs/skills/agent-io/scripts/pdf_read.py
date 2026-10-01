# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "pypdfium2==5.13.0",
#     "pdf-inspector==1.25.2",
#     "pillow==12.3.0",
# ]
# ///
"""Read a PDF for an AI agent: facts first, then text, then page images where text is not enough.

Run with `uv run pdf_read.py <command> <file.pdf> ...` — uv installs the pinned dependencies
from the header above into a cached environment, no manual setup.

Commands:
    info      page count, text-based vs scanned, pages without text, pages with tables/columns
    text      plain text in reading order (pdfium), with <!-- Page N --> markers
    markdown  structured Markdown (pdf-inspector): headings and tables, but see the CJK caveat
    render    page images (PNG) for pages whose text layer is missing or not enough

Pages are 1-based and written like "1-3,7" or "4-" (page 4 to the end).
Output is capped by --max-chars and always stops on a page boundary with a continuation hint,
so one call never floods the model context.

Engines:
    pypdfium2     (Apache-2.0 / BSD-3) Chrome's PDFium: reading-order text and page rendering
    pdf-inspector (MIT, firecrawl) classification and Markdown; the engine of the dsh-document plugin
"""

from __future__ import annotations

import argparse
import sys
import unicodedata
from pathlib import Path

import pdf_inspector
import pypdfium2 as pdfium

DEFAULT_MAX_CHARS = 30_000
DEFAULT_MAX_RENDER = 10


class UsageError(Exception):
    """A problem the caller can fix by changing arguments; printed without a traceback."""


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
            raise UsageError(f'page {end} does not exist: the document has {page_count} pages')
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


def emit_capped(chunks: list[tuple[int, str]], max_chars: int, total_pages: int) -> None:
    """Print page chunks until max_chars; stop on a page boundary and say how to continue."""
    used = 0
    shown: list[int] = []
    for index, (page_number, chunk) in enumerate(chunks):
        if shown and used + len(chunk) > max_chars:
            rest = [number for number, _ in chunks[index:]]
            print(
                f"\n(Output capped at {max_chars} chars. Showing pages {format_pages(shown)} of {total_pages}. "
                f"Continue with --pages {format_pages(rest).replace(' ', '')}.)"
            )
            return
        if not shown and len(chunk) > max_chars:
            print(chunk[:max_chars])
            print(
                f"\n(Page {page_number} alone exceeds {max_chars} chars and was truncated. "
                f"Raise --max-chars or render the page.)"
            )
            shown.append(page_number)
            used = max_chars
            continue
        print(chunk)
        shown.append(page_number)
        used += len(chunk)
    print(f"\n(Showing pages {format_pages(shown)} of {total_pages}.)")


# ---------------------------------------------------------------- commands


def cmd_info(args: argparse.Namespace) -> None:
    document = open_pdf(args.file, args.password)
    page_count = len(document)
    metadata = {key: value for key, value in document.get_metadata_dict().items() if value}
    document.close()
    print(f"file: {args.file}")
    print(f"pages: {page_count}")
    for key in ("Title", "Author", "Subject", "Creator", "Producer", "CreationDate"):
        if key in metadata:
            print(f"{key.lower()}: {metadata[key]}")
    if args.password is not None:
        print("classification: skipped (encrypted PDF; pdf-inspector cannot take a password here)")
        return
    classification = pdf_inspector.classify_pdf(str(args.file))
    layout = pdf_inspector.extract_pages_markdown(str(args.file))
    no_text = sorted(page + 1 for page in classification.pages_needing_ocr)
    tables = sorted(page + 1 for page in layout.pages_with_tables)
    columns = sorted(page + 1 for page in layout.pages_with_columns)
    print(f"type: {classification.pdf_type} (confidence {classification.confidence:.2f})")
    print(f"pages without usable text: {format_pages(no_text)}")
    print(f"pages with tables: {format_pages(tables)}")
    print(f"pages with columns: {format_pages(columns)}")
    hints = []
    if no_text:
        hints.append(f"render {format_pages(no_text).replace(' ', '')} and look at the images (no text layer)")
    if tables:
        hints.append(f"use markdown or render for {format_pages(tables).replace(' ', '')} (tables)")
    if len(no_text) < page_count:
        hints.append("use text for everything else" if hints else "use text")
    print("next: " + "; ".join(hints))


def cmd_text(args: argparse.Namespace) -> None:
    document = open_pdf(args.file, args.password)
    page_count = len(document)
    pages = parse_pages(args.pages, page_count)
    chunks: list[tuple[int, str]] = []
    empty: list[int] = []
    for page_number in pages:
        text = page_text(document, page_number)
        if text:
            chunks.append((page_number, f"<!-- Page {page_number} -->\n{text}\n"))
        else:
            empty.append(page_number)
            chunks.append((page_number, f"<!-- Page {page_number}: no text layer, use render -->\n"))
    document.close()
    if empty:
        print(
            f"<warning>Pages {format_pages(empty)} have no extractable text (scanned or image-only). "
            f"Their content is missing below; render them to read.</warning>\n"
        )
    emit_capped(chunks, args.max_chars, page_count)


def cmd_markdown(args: argparse.Namespace) -> None:
    document = open_pdf(args.file, args.password)
    page_count = len(document)
    document.close()
    if args.password is not None:
        raise UsageError("markdown does not support encrypted PDFs; use text or render")
    pages = parse_pages(args.pages, page_count)
    result = pdf_inspector.extract_pages_markdown(str(args.file), [page - 1 for page in pages])
    chunks: list[tuple[int, str]] = []
    empty: list[int] = []
    for page in result.pages:
        page_number = page.page + 1
        markdown = normalize(page.markdown).strip()
        if not markdown or page.needs_ocr:
            empty.append(page_number)
        chunks.append((page_number, f"<!-- Page {page_number} -->\n{markdown}\n"))
    print(
        "<note>pdf-inspector rebuilds headings and tables, but in Chinese/Japanese paragraphs it can move "
        "Latin words and numbers to the start of a line. Check prose against the text command.</note>\n"
    )
    if empty:
        print(f"<warning>Pages {format_pages(empty)} need OCR; render them to read.</warning>\n")
    emit_capped(chunks, args.max_chars, page_count)


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

    add("info", "page count, type, pages without text, tables, columns")
    for name, help_text in (("text", "reading-order text"), ("markdown", "structured Markdown")):
        command = add(name, help_text)
        command.add_argument("--pages", help='1-based pages like "1-3,7" or "4-"; default all')
        command.add_argument("--max-chars", type=int, default=DEFAULT_MAX_CHARS, help="output cap per call")
    render = add("render", "page images as PNG")
    render.add_argument("--pages", help='1-based pages like "3" or "1-2,5"; required')
    render.add_argument("--dpi", type=int, default=150, help="resolution; 150 reads body text, 200+ for small print")
    render.add_argument("--out", type=Path, help="output directory; default <file>.pages/ next to the PDF")
    render.add_argument("--max-pages", type=int, default=DEFAULT_MAX_RENDER, help="refuse larger batches")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    handlers = {"info": cmd_info, "text": cmd_text, "markdown": cmd_markdown, "render": cmd_render}
    try:
        handlers[args.command](args)
    except UsageError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
