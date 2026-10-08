function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function collectedStyles() {
  return Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => {
      if (node instanceof HTMLLinkElement) {
        return `<link rel="stylesheet" href="${escapeHtml(node.href)}" />`
      }
      return `<style>${node.textContent || ''}</style>`
    })
    .join('\n')
}

const printFrameCss = `
  @page { size: A4; margin: 16mm 14mm 18mm; }
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    height: auto;
    overflow: visible;
  }
  #invoice-print-area,
  #receipt-print-area,
  .invoice-print-backdrop {
    position: static !important;
    inset: auto !important;
    overflow: visible !important;
    max-height: none !important;
    height: auto !important;
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    background: #fff !important;
  }
  .no-print { display: none !important; }
  .invoice-letterhead,
  .invoice-closing,
  .invoice-keep,
  table tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .invoice-letterhead {
    break-after: avoid;
    page-break-after: avoid;
  }
`

function waitForImages(root: ParentNode) {
  const images = Array.from(root.querySelectorAll('img'))
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) return resolve()
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
          setTimeout(() => resolve(), 1500)
        }),
    ),
  )
}

function cropCanvas(source: HTMLCanvasElement, sourceY: number, sourceHeight: number) {
  const height = Math.max(1, Math.round(sourceHeight))
  const out = document.createElement('canvas')
  out.width = source.width
  out.height = height
  const ctx = out.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, out.width, out.height)
  const srcY = Math.max(0, Math.round(sourceY))
  const srcH = Math.min(height, source.height - srcY)
  if (srcH > 0) {
    ctx.drawImage(source, 0, srcY, source.width, srcH, 0, 0, source.width, srcH)
  }
  return out
}

type PdfLike = {
  addPage: () => void
  addImage: (data: string, format: string, x: number, y: number, w: number, h: number) => void
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } }
}

/** Draw the sheet across A4 pages, repeating the letterhead at the top of each page after the first. */
export function paintElementPages(pdf: PdfLike, canvas: HTMLCanvasElement, root: HTMLElement) {
  const marginX = 10
  const marginY = 12
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const contentWidth = pageWidth - marginX * 2
  const contentHeight = pageHeight - marginY * 2
  const total = Math.max(root.offsetHeight, 1)
  const scale = canvas.height / total
  const pageCss = (contentHeight / contentWidth) * (canvas.width / scale)
  const gapCss = 4 * (pageCss / contentHeight)

  const rootTop = root.getBoundingClientRect().top
  const letterhead = root.querySelector('.invoice-letterhead') as HTMLElement | null
  let letterheadCanvas: HTMLCanvasElement | null = null
  let letterheadCss = 0
  if (letterhead) {
    const top = letterhead.getBoundingClientRect().top - rootTop
    const marginBottom = Number.parseFloat(getComputedStyle(letterhead).marginBottom) || 0
    letterheadCss = letterhead.offsetHeight + marginBottom
    letterheadCanvas = cropCanvas(canvas, top * scale, letterheadCss * scale)
  }

  const bottoms = Array.from(
    root.querySelectorAll('tr, .invoice-letterhead, .invoice-closing, .invoice-keep, p, li, h1, h2'),
  )
    .map((node) => node.getBoundingClientRect().bottom - rootTop)
    .filter((bottom) => bottom > 8)
    .sort((a, b) => a - b)

  let cssY = 0
  let pageIndex = 0
  while (cssY < total - 1 && pageIndex < 40) {
    const reserve = pageIndex > 0 && letterheadCanvas ? letterheadCss + gapCss : 0
    const available = Math.max(pageCss - reserve, pageCss * 0.45)
    let end = Math.min(total, cssY + available)
    if (end < total - 4) {
      const snap = bottoms.filter((bottom) => bottom > cssY + available * 0.45 && bottom <= end + 0.5)
      if (snap.length) end = snap[snap.length - 1]
    }
    if (end <= cssY + 1) end = Math.min(total, cssY + Math.max(available, 24))

    const slice = cropCanvas(canvas, cssY * scale, (end - cssY) * scale)
    if (!slice) break
    if (pageIndex > 0) pdf.addPage()

    let yMm = marginY
    if (pageIndex > 0 && letterheadCanvas) {
      const letterheadMm = (letterheadCss / pageCss) * contentHeight
      pdf.addImage(letterheadCanvas.toDataURL('image/png'), 'PNG', marginX, yMm, contentWidth, letterheadMm)
      yMm += letterheadMm + 4
    }
    const sliceMm = ((end - cssY) / pageCss) * contentHeight
    pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', marginX, yMm, contentWidth, sliceMm)

    cssY = end
    pageIndex += 1
  }
}

/** Save the rendered sheet as a PDF file. Pages break between blocks so the letterhead is not sliced. */
export async function downloadElementPdf(element: HTMLElement, filename: string) {
  const html2canvasMod = await import('html2canvas')
  const html2canvas = (html2canvasMod as any).default || html2canvasMod
  const jspdfMod = await import('jspdf')
  const jsPDF = jspdfMod.jsPDF

  const clone = element.cloneNode(true) as HTMLElement
  clone.querySelectorAll('.no-print').forEach((node) => node.remove())
  clone.style.cssText = 'width:794px;max-width:794px;max-height:none;height:auto;overflow:visible;box-shadow:none;border-radius:0;background:#fff;'

  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText = 'position:fixed;left:-12000px;top:0;width:794px;background:#fff;z-index:-1;'
  host.appendChild(clone)
  document.body.appendChild(host)

  try {
    await waitForImages(clone)
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
    })

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    paintElementPages(pdf, canvas, clone)

    const name = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`
    pdf.save(name)
  } finally {
    host.remove()
  }
}

/** Print a rendered sheet in its own frame so page 2 is normal flow, not a clipped modal. */
export function printHtmlElement(element: HTMLElement, title: string) {
  const clone = element.cloneNode(true) as HTMLElement
  clone.querySelectorAll('.no-print').forEach((node) => node.remove())

  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
  document.body.appendChild(iframe)

  const frame = iframe.contentDocument
  const win = iframe.contentWindow
  if (!frame || !win) {
    iframe.remove()
    window.print()
    return
  }

  frame.open()
  frame.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <base href="${escapeHtml(`${window.location.origin}/`)}" />
  <title>${escapeHtml(title)}</title>
  ${collectedStyles()}
  <style>${printFrameCss}</style>
</head>
<body>${clone.outerHTML}</body>
</html>`)
  frame.close()

  let printed = false
  const run = () => {
    if (printed) return
    printed = true
    win.focus()
    win.print()
    win.addEventListener('afterprint', () => iframe.remove(), { once: true })
  }

  const images = Array.from(frame.images)
  if (!images.length) {
    setTimeout(run, 200)
    return
  }

  let pending = images.length
  const mark = () => {
    pending -= 1
    if (pending <= 0) setTimeout(run, 150)
  }
  images.forEach((img) => {
    if (img.complete) mark()
    else {
      img.addEventListener('load', mark, { once: true })
      img.addEventListener('error', mark, { once: true })
    }
  })
  setTimeout(run, 1200)
}
