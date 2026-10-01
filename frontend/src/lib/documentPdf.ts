import { downloadPdfBytes } from './composePdf'

/** A4 portrait, millimetres. */
const PAGE_WIDTH_MM = 210
const PAGE_HEIGHT_MM = 297
const MARGIN_X_MM = 10
const MARGIN_TOP_MM = 10
const FOOTER_HEIGHT_MM = 14
const MARGIN_BOTTOM_MM = 6

/** A4 width at 96dpi; keeps Tailwind `md:` layouts (two-column grids) active while rendering. */
const CAPTURE_WIDTH_PX = 794
const CAPTURE_SCALE = 2

const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - MARGIN_X_MM * 2
const CONTENT_HEIGHT_MM = PAGE_HEIGHT_MM - MARGIN_TOP_MM - FOOTER_HEIGHT_MM - MARGIN_BOTTOM_MM
const PX_TO_MM = CONTENT_WIDTH_MM / CAPTURE_WIDTH_PX
const PAGE_CONTENT_HEIGHT_PX = CONTENT_HEIGHT_MM / PX_TO_MM

/** Elements that must never be split across two pages. */
const ATOMIC_SELECTOR =
  'table:not(.qt-print-sheet) tr, p, li, h1, h2, h3, h4, img, .qt-print-closing, [data-pdf-atomic]'

export type DocumentPdfOptions = {
  filename: string
  /** Lines printed at the bottom of every page, before the page counter. */
  footerLines?: string[]
}

type Interval = { top: number; bottom: number }

function collectBreakHints(root: HTMLElement) {
  const rootTop = root.getBoundingClientRect().top
  const intervals: Interval[] = []
  const candidates = new Set<number>()
  root.querySelectorAll<HTMLElement>(ATOMIC_SELECTOR).forEach((el) => {
    const rect = el.getBoundingClientRect()
    if (rect.height <= 0) return
    const top = rect.top - rootTop
    const bottom = rect.bottom - rootTop
    if (bottom - top > PAGE_CONTENT_HEIGHT_PX) return
    intervals.push({ top, bottom })
    candidates.add(top)
    candidates.add(bottom)
  })
  return { intervals, candidates: Array.from(candidates).sort((a, b) => a - b) }
}

/** Split [0, totalHeight) into page slices whose edges avoid cutting through atomic elements. */
function paginate(totalHeight: number, hints: { intervals: Interval[]; candidates: number[] }) {
  const pages: Array<{ start: number; end: number }> = []
  let start = 0
  const insideAtom = (y: number) => hints.intervals.some((i) => y > i.top + 0.5 && y < i.bottom - 0.5)
  while (totalHeight - start > 0.5) {
    const limit = start + PAGE_CONTENT_HEIGHT_PX
    if (limit >= totalHeight) {
      pages.push({ start, end: totalHeight })
      break
    }
    const minFill = start + PAGE_CONTENT_HEIGHT_PX * 0.35
    let end = limit
    if (insideAtom(limit)) {
      for (let i = hints.candidates.length - 1; i >= 0; i -= 1) {
        const y = hints.candidates[i]
        if (y > limit) continue
        if (y < minFill) break
        if (!insideAtom(y)) {
          end = y
          break
        }
      }
    }
    pages.push({ start, end })
    start = end
  }
  return pages
}

async function waitForAssets(root: HTMLElement) {
  const fonts = (document as any).fonts
  const fontsReady: Promise<unknown> = fonts?.ready ? fonts.ready : Promise.resolve()
  const images = Array.from(root.querySelectorAll('img')).map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete) return resolve()
        img.onload = () => resolve()
        img.onerror = () => resolve()
        setTimeout(resolve, 2000)
      }),
  )
  await Promise.all([fontsReady, ...images])
}

/**
 * Render an on-screen document (invoice, quotation, receipt) to A4 portrait PDF bytes.
 * Elements marked `data-pdf-hide` (toolbars, internal status) are left out.
 */
export async function elementToPdfBytes(element: HTMLElement, options: DocumentPdfOptions): Promise<Uint8Array> {
  const html2canvasMod = await import('html2canvas')
  const html2canvas = (html2canvasMod as any).default || html2canvasMod
  const { jsPDF } = await import('jspdf')

  await waitForAssets(element)

  let hints = { intervals: [] as Interval[], candidates: [] as number[] }
  const canvas: HTMLCanvasElement = await html2canvas(element, {
    scale: CAPTURE_SCALE,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: CAPTURE_WIDTH_PX,
    scrollX: 0,
    scrollY: 0,
    ignoreElements: (node: Element) => node.hasAttribute('data-pdf-hide'),
    onclone: (doc: Document, cloned: HTMLElement) => {
      cloned.classList.add('qt-pdf-capture')
      // Flatten the modal/layout chain and drop everything beside it so only the document is laid out.
      let child: HTMLElement = cloned
      let parent = cloned.parentElement
      while (parent) {
        parent.classList.add('qt-pdf-capture-ancestor')
        Array.from(parent.children).forEach((sibling) => {
          if (sibling !== child && sibling.tagName !== 'STYLE' && sibling.tagName !== 'LINK' && sibling.tagName !== 'HEAD') {
            sibling.classList.add('qt-pdf-capture-hidden')
          }
        })
        child = parent
        parent = parent.parentElement
        if (child === doc.body) break
      }
      hints = collectBreakHints(cloned)
    },
  })

  const totalHeightPx = canvas.height / CAPTURE_SCALE
  const pages = paginate(totalHeightPx, hints)

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
  const slice = document.createElement('canvas')
  const ctx = slice.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  pages.forEach((page, index) => {
    if (index > 0) pdf.addPage('a4', 'portrait')
    const sliceHeight = Math.max(1, Math.round((page.end - page.start) * CAPTURE_SCALE))
    slice.width = canvas.width
    slice.height = sliceHeight
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, slice.width, slice.height)
    ctx.drawImage(
      canvas,
      0,
      Math.round(page.start * CAPTURE_SCALE),
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    )
    const heightMm = (sliceHeight / CAPTURE_SCALE) * PX_TO_MM
    pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', MARGIN_X_MM, MARGIN_TOP_MM, CONTENT_WIDTH_MM, heightMm)
    drawFooter(pdf, index + 1, pages.length, options.footerLines || [])
  })

  return new Uint8Array(pdf.output('arraybuffer'))
}

function drawFooter(pdf: any, pageNumber: number, pageCount: number, lines: string[]) {
  const top = PAGE_HEIGHT_MM - MARGIN_BOTTOM_MM - FOOTER_HEIGHT_MM
  pdf.setDrawColor(27, 54, 93)
  pdf.setLineWidth(0.6)
  pdf.line(MARGIN_X_MM, top, PAGE_WIDTH_MM - MARGIN_X_MM, top)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(107, 114, 128)
  lines.slice(0, 2).forEach((line, i) => {
    pdf.text(line, MARGIN_X_MM, top + 4 + i * 3.6)
  })
  pdf.text(`Page ${pageNumber} of ${pageCount}`, PAGE_WIDTH_MM - MARGIN_X_MM, top + 4, { align: 'right' })
}

export async function downloadElementPdf(element: HTMLElement, options: DocumentPdfOptions) {
  const bytes = await elementToPdfBytes(element, options)
  downloadPdfBytes(bytes, options.filename)
}
