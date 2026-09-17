import { QUANTIS_LETTERHEAD, formatSellerBankBlock, letterheadCss, letterheadHtml } from './companyLetterhead'
import {
  amountInWords,
  clientDisplayName,
  formatBillingPeriod,
  formatCurrency,
  formatDate,
  formatPaymentTerms,
  getBalanceDue,
  getVatRate,
} from './invoiceUtils'
import { invoiceCurrencyOf } from './money'

export type ComposeAttachment = {
  key: string
  group: string
  label: string
  href?: string
  mimeType?: string
  originalName?: string
  kind: 'file' | 'invoice' | 'quotation' | 'receipt'
  recordId?: string | number
  record?: any
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function originOf() {
  return typeof window !== 'undefined' ? window.location.origin : ''
}

function isPdfBytes(bytes: Uint8Array) {
  return bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46
}

function looksPdf(att: ComposeAttachment) {
  const mime = (att.mimeType || '').toLowerCase()
  const href = att.href || att.originalName || ''
  return mime.includes('pdf') || /\.pdf(\?|$)/i.test(href)
}

function looksImage(att: ComposeAttachment) {
  const mime = (att.mimeType || '').toLowerCase()
  const href = att.href || att.originalName || ''
  return mime.startsWith('image/') || /\.(png|jpe?g|gif|webp)(\?|$)/i.test(href)
}

function looksHtml(att: ComposeAttachment) {
  const mime = (att.mimeType || '').toLowerCase()
  const href = att.href || att.originalName || ''
  return mime.includes('html') || /\.html?(\?|$)/i.test(href)
}

function wrapSheet(inner: string, extraCss = '') {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #111827; margin: 0; }
    .sheet { max-width: 800px; margin: 0 auto; }
    table { border-collapse: collapse; width: 100%; }
    ${letterheadCss()}
    ${extraCss}
  </style>
</head>
<body>
  <div class="sheet">${inner}</div>
</body>
</html>`
}

export function billingDocumentHtml(record: any, origin = originOf()) {
  if (!record) return ''
  const kind = String(record.document_type || '').toLowerCase()
  const isReceipt = kind === 'receipt' || String(record.invoice_number || '').toUpperCase().startsWith('REC')
  const isQuotation = kind === 'quotation'
  const docTitle = isReceipt ? 'Receipt' : isQuotation ? 'Quotation' : 'Invoice'
  const money = (amount: unknown) => formatCurrency(amount, invoiceCurrencyOf(record))
  const vatRate = getVatRate(record.parent_invoice || record)
  const items = Array.isArray(record.items) ? record.items : []
  const rows = items
    .map((item: any) => {
      const line = Number(item.total_price || 0)
      return `<tr>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;">${escapeHtml(String(item.description || ''))}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:center;">${escapeHtml(String(item.quantity ?? ''))}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:right;">${money(item.unit_price)}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:right;">${money(line)}</td>
      </tr>`
    })
    .join('')
  const billTo = clientDisplayName(record.client)
  const balance = getBalanceDue(record)
  const billingPeriod = formatBillingPeriod(record.billing_period_start, record.billing_period_end)
  return `
    ${letterheadHtml(origin, record.company_logo_url)}
    <div style="display:flex;justify-content:space-between;gap:24px;margin:0 0 20px;">
      <div>
        <p style="font-size:22px;font-weight:600;margin:0 0 8px;">${escapeHtml(docTitle)}</p>
        <p style="margin:0;color:#4b5563;">${escapeHtml(record.invoice_number || '')}</p>
        ${record.payment_reference ? `<p style="margin:4px 0 0;color:#4b5563;">Invoice ${escapeHtml(record.payment_reference)}</p>` : ''}
      </div>
      <div style="text-align:right;font-size:13px;color:#374151;">
        <p style="margin:0;"><strong>Date:</strong> ${escapeHtml(formatDate(record.issue_date))}</p>
        ${record.due_date && !isReceipt ? `<p style="margin:4px 0 0;"><strong>${isQuotation ? 'Valid until' : 'Due'}:</strong> ${escapeHtml(formatDate(record.due_date))}</p>` : ''}
        ${record.payment_date ? `<p style="margin:4px 0 0;"><strong>Paid:</strong> ${escapeHtml(formatDate(record.payment_date))}</p>` : ''}
        ${record.project?.title ? `<p style="margin:4px 0 0;">${escapeHtml(record.project.title)}</p>` : ''}
        ${billingPeriod ? `<p style="margin:4px 0 0;">${escapeHtml(billingPeriod)}</p>` : ''}
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;gap:32px;margin:0 0 22px;font-size:13px;">
      <div>
        <p style="text-transform:uppercase;letter-spacing:0.06em;font-size:11px;color:#6b7280;margin:0 0 6px;">From</p>
        <p style="margin:0;font-weight:600;">${escapeHtml(record.company_name || QUANTIS_LETTERHEAD.company_name)}</p>
        <p style="margin:4px 0 0;white-space:pre-line;">${escapeHtml(record.company_address || QUANTIS_LETTERHEAD.company_address)}</p>
      </div>
      <div>
        <p style="text-transform:uppercase;letter-spacing:0.06em;font-size:11px;color:#6b7280;margin:0 0 6px;">${isQuotation ? 'Prepared for' : 'Bill to'}</p>
        <p style="margin:0;font-weight:600;">${escapeHtml(billTo)}</p>
        ${record.billing_address ? `<p style="margin:4px 0 0;white-space:pre-line;">${escapeHtml(record.billing_address)}</p>` : ''}
        ${record.billing_email ? `<p style="margin:4px 0 0;">${escapeHtml(record.billing_email)}</p>` : ''}
      </div>
    </div>
    ${record.notes && isReceipt ? `<p style="font-size:13px;margin:0 0 16px;"><strong>Description:</strong> ${escapeHtml(record.notes)}</p>` : ''}
    <table style="font-size:13px;margin-bottom:16px;">
      <thead>
        <tr style="border-bottom:1px solid #d1d5db;color:#6b7280;text-align:left;">
          <th style="padding:8px 6px;">Description</th>
          <th style="padding:8px 6px;text-align:center;">Qty</th>
          <th style="padding:8px 6px;text-align:right;">Unit</th>
          <th style="padding:8px 6px;text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="4" style="padding:12px 6px;color:#6b7280;">No line items</td></tr>`}</tbody>
    </table>
    <div style="width:260px;margin-left:auto;font-size:13px;">
      <p style="display:flex;justify-content:space-between;margin:4px 0;"><span>Subtotal</span><span>${money(record.subtotal)}</span></p>
      <p style="display:flex;justify-content:space-between;margin:4px 0;"><span>VAT${vatRate > 0 ? ` (${vatRate}%)` : ''}</span><span>${Number(record.tax_amount) > 0 ? money(record.tax_amount) : '—'}</span></p>
      <p style="display:flex;justify-content:space-between;margin:8px 0 0;font-weight:700;border-top:1px solid #d1d5db;padding-top:8px;"><span>Total</span><span>${money(record.total_amount)}</span></p>
      ${!isReceipt && !isQuotation ? `<p style="display:flex;justify-content:space-between;margin:4px 0;"><span>Amount due</span><span>${money(balance)}</span></p>` : ''}
    </div>
    <p style="font-size:12px;font-style:italic;color:#4b5563;margin:20px 0;">Amount in words: ${escapeHtml(amountInWords(Number(record.total_amount || 0), invoiceCurrencyOf(record)))}</p>
    ${
      !isQuotation && !isReceipt
        ? `<div style="font-size:12px;color:#374151;">
            <p style="text-transform:uppercase;letter-spacing:0.06em;font-size:11px;color:#6b7280;">Payment instructions</p>
            ${formatSellerBankBlock(record).map((line) => `<p style="margin:2px 0;">${escapeHtml(line)}</p>`).join('')}
            ${formatPaymentTerms(record.payment_terms) ? `<p style="margin:8px 0 0;">Terms: ${escapeHtml(formatPaymentTerms(record.payment_terms))}</p>` : ''}
          </div>`
        : ''
    }
  `
}

export function enclosurePlaceholderHtml(label: string, href?: string) {
  return `
    ${letterheadHtml(originOf())}
    <h1 style="font-size:18px;letter-spacing:0.08em;text-transform:uppercase;">Enclosure</h1>
    <p style="font-size:15px;">${escapeHtml(label)}</p>
    ${href ? `<p style="font-size:13px;color:#4b5563;word-break:break-all;">${escapeHtml(href)}</p>` : ''}
    <p style="font-size:13px;color:#6b7280;">This file could not be converted automatically. Open the original from the documents library.</p>
  `
}

async function htmlToPdfBytes(html: string): Promise<Uint8Array> {
  const html2canvasMod = await import('html2canvas')
  const html2canvas = (html2canvasMod as any).default || html2canvasMod
  const jspdfMod = await import('jspdf')
  const jsPDF = jspdfMod.jsPDF
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText = 'position:fixed;left:-14000px;top:0;width:794px;background:#fff;z-index:-1;'
  const style = document.createElement('style')
  style.textContent = Array.from(parsed.querySelectorAll('style'))
    .map((node) => node.textContent || '')
    .join('\n')
  const wrap = document.createElement('div')
  wrap.style.cssText = 'width:794px;padding:40px 48px;box-sizing:border-box;background:#fff;color:#111827;'
  wrap.innerHTML = parsed.body.innerHTML
  host.appendChild(style)
  host.appendChild(wrap)
  document.body.appendChild(host)
  try {
    await Promise.all(
      Array.from(wrap.querySelectorAll('img')).map(
        (node) =>
          new Promise<void>((resolve) => {
            const img = node as HTMLImageElement
            if (img.complete) return resolve()
            img.onload = () => resolve()
            img.onerror = () => resolve()
            setTimeout(() => resolve(), 1500)
          }),
      ),
    )
    const canvas = await html2canvas(wrap, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
    })
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const imgData = canvas.toDataURL('image/jpeg', 0.86)
    let heightLeft = imgHeight
    let position = 0
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    while (heightLeft > 0.5) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    return new Uint8Array(pdf.output('arraybuffer'))
  } finally {
    host.remove()
  }
}

async function fetchBytes(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Could not fetch ${url}`)
  return new Uint8Array(await res.arrayBuffer())
}

async function imageBytesToPdf(bytes: Uint8Array, mime: string) {
  const { PDFDocument } = await import('pdf-lib')
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595.28, 841.89])
  const image = mime.includes('png')
    ? await pdf.embedPng(bytes)
    : await pdf.embedJpg(bytes)
  const maxW = 515
  const maxH = 761
  const scale = Math.min(maxW / image.width, maxH / image.height, 1)
  const w = image.width * scale
  const h = image.height * scale
  page.drawImage(image, {
    x: (595.28 - w) / 2,
    y: (841.89 - h) / 2,
    width: w,
    height: h,
  })
  return pdf.save()
}

async function attachmentToPdf(att: ComposeAttachment): Promise<Uint8Array> {
  if (att.kind !== 'file' && att.record) {
    return htmlToPdfBytes(wrapSheet(billingDocumentHtml(att.record)))
  }
  if (!att.href) {
    return htmlToPdfBytes(wrapSheet(enclosurePlaceholderHtml(att.label)))
  }
  try {
    if (looksHtml(att)) {
      const html = await (await fetch(att.href)).text()
      return htmlToPdfBytes(html.includes('<html') ? html : wrapSheet(html))
    }
    const bytes = await fetchBytes(att.href)
    if (isPdfBytes(bytes) || looksPdf(att)) return bytes
    if (looksImage(att)) {
      const mime = (att.mimeType || '').toLowerCase()
      try {
        return await imageBytesToPdf(bytes, mime || 'image/jpeg')
      } catch {
        return htmlToPdfBytes(
          wrapSheet(
            `${letterheadHtml(originOf())}<img src="${escapeHtml(att.href)}" style="max-width:100%;height:auto;" alt="${escapeHtml(att.label)}" />`,
          ),
        )
      }
    }
    if (looksPdf(att)) return bytes
  } catch (err) {
    console.warn('Attachment PDF conversion failed', att.label, err)
  }
  return htmlToPdfBytes(wrapSheet(enclosurePlaceholderHtml(att.label, att.href)))
}

export async function mergePdfBytes(parts: Uint8Array[]) {
  const { PDFDocument } = await import('pdf-lib')
  const merged = await PDFDocument.create()
  for (const part of parts) {
    if (!part?.byteLength) continue
    const doc = await PDFDocument.load(part, { ignoreEncryption: true })
    const pages = await merged.copyPages(doc, doc.getPageIndices())
    pages.forEach((page) => merged.addPage(page))
  }
  return merged.save()
}

export async function buildComposedPdf(letterHtml: string, attachments: ComposeAttachment[]) {
  const parts: Uint8Array[] = [await htmlToPdfBytes(letterHtml)]
  for (const att of attachments) {
    parts.push(await attachmentToPdf(att))
  }
  return mergePdfBytes(parts)
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string) {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  const blob = new Blob([copy], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function attachmentPrintPages(attachments: ComposeAttachment[], origin = originOf()) {
  return attachments
    .map((att) => {
      const inner =
        att.kind !== 'file' && att.record
          ? billingDocumentHtml(att.record, origin)
          : looksImage(att) && att.href
            ? `${letterheadHtml(origin)}<p style="font-size:13px;margin:0 0 12px;"><strong>Enclosure:</strong> ${escapeHtml(att.label)}</p><img src="${escapeHtml(att.href)}" alt="${escapeHtml(att.label)}" style="max-width:100%;height:auto;" />`
            : enclosurePlaceholderHtml(att.label, att.href)
      return `<div style="page-break-before:always;">${inner}</div>`
    })
    .join('')
}

export { wrapSheet }
