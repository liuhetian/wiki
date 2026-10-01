import { Service, type Context } from '@deepseek-ai/cordis'
import type { FileSystem } from '@deepseek-ai/dsh-fs'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { PdfDocument, PdfDocumentId, PdfPageText } from './types.js'
import { PdfDocumentId as makePdfDocumentId } from './types.js'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Mounted PDF reader capability. */
    pdfReader: PdfReader
  }
}

/** The replaceable PDF parsing service consumed by the tool plugin. */
export abstract class PdfReader extends Service {
  constructor(ctx: Context) {
    super(ctx, 'pdfReader')
  }

  /** Open a PDF and return stable metadata. */
  abstract open(path: string, signal?: AbortSignal): Promise<PdfDocument>
  /** Extract one inclusive page range. */
  abstract extract(document: PdfDocumentId, fromPage: number, toPage: number, signal?: AbortSignal): Promise<readonly PdfPageText[]>
  /** Resolve a document id to metadata. */
  abstract get(document: PdfDocumentId): PdfDocument | undefined
}

interface LoadedDocument {
  readonly metadata: PdfDocument
  readonly pages: readonly string[]
}

/** Local provider using the harness filesystem seam and pdfjs-dist. */
export class PdfReaderLocal extends PdfReader {
  static inject = ['fs']

  private readonly fs: FileSystem
  private readonly maxPdfBytes: number
  private readonly documents = new Map<PdfDocumentId, LoadedDocument>()

  constructor(ctx: Context, config: { maxPdfBytes?: number } = {}) {
    super(ctx)
    this.fs = ctx.fs
    this.maxPdfBytes = config.maxPdfBytes ?? 128 * 1024 * 1024
    if (!Number.isSafeInteger(this.maxPdfBytes) || this.maxPdfBytes < 1) {
      throw new Error('pdf-reader: maxPdfBytes must be a positive safe integer')
    }
  }

  async open(path: string, signal?: AbortSignal): Promise<PdfDocument> {
    const target = await this.fs.resolve(path, { signal })
    const info = await this.fs.stat(target, signal)
    if (info?.type !== 'file') throw new Error(`PDF file is not a regular file: ${path}`)
    const bytes = await this.fs.readBytes(target, signal, this.maxPdfBytes)
    signal?.throwIfAborted()
    const loadingTask = getDocument({ data: bytes, useSystemFonts: true })
    const pdf = await loadingTask.promise
    const pages: string[] = []
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      signal?.throwIfAborted()
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      pages.push(content.items.map(item => 'str' in item ? item.str : '').join(' ').replace(/\s+/g, ' ').trim())
      page.cleanup()
    }
    const pageCount = pdf.numPages
    pdf.cleanup()
    const id = makePdfDocumentId(`pdf-${stableId(target.displayPath)}`)
    const metadata: PdfDocument = {
      id,
      path: target.displayPath,
      title: basename(target.displayPath),
      pageCount,
      sizeBytes: bytes.byteLength,
    }
    this.documents.set(id, { metadata, pages })
    return metadata
  }

  async extract(document: PdfDocumentId, fromPage: number, toPage: number, signal?: AbortSignal): Promise<readonly PdfPageText[]> {
    const loaded = this.documents.get(document)
    if (loaded === undefined) throw new Error(`PDF document is not open: ${document}`)
    if (!Number.isSafeInteger(fromPage) || !Number.isSafeInteger(toPage) || fromPage < 1 || toPage < fromPage || toPage > loaded.pages.length) {
      throw new Error(`PDF page range must be within 1-${loaded.pages.length}`)
    }
    const result: PdfPageText[] = []
    for (let page = fromPage; page <= toPage; page++) {
      signal?.throwIfAborted()
      result.push({ page, text: loaded.pages[page - 1] ?? '' })
    }
    return result
  }

  get(document: PdfDocumentId): PdfDocument | undefined {
    return this.documents.get(document)?.metadata
  }
}

function basename(path: string): string {
  const name = path.split(/[\\/]/).pop() ?? path
  return name.toLowerCase().endsWith('.pdf') ? name.slice(0, -4) : name
}

function stableId(path: string): string {
  let hash = 2166136261
  for (const char of path) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash >>> 0).toString(36)
}

export default PdfReader
