import { QUANTIS_LETTERHEAD, absoluteLetterheadLogoUrl, formatSellerBankBlock, letterheadContact } from './companyLetterhead'
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

const NAVY: [number, number, number] = [27, 54, 93]
const TEXT: [number, number, number] = [17, 24, 39]
const MUTED: [number, number, number] = [75, 85, 99]
const HAIR: [number, number, number] = [209, 213, 219]

function pdfSafe(value: unknown) {
  return String(value ?? '')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\u2212/g, '-')
    .replace(/\u00a0/g, ' ')
}

async function loadLogo(src: string) {
  try {
    const res = await fetch(src)
    if (!res.ok) return null
    const blob = await res.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('logo'))
      reader.readAsDataURL(blob)
    })
    return dataUrl
  } catch {
    return null
  }
}

export async function downloadBillingPdf(record: any, filename: string) {
  const jspdfMod = await import('jspdf')
  const jsPDF = jspdfMod.jsPDF
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  const contentW = pageW - margin * 2
  const bottomLimit = pageH - 18
  const logo = await loadLogo(absoluteLetterheadLogoUrl(record.company_logo_url))
  const contact = letterheadContact()
  const isReceipt = record.document_type === 'receipt' || String(record.invoice_number || '').toUpperCase().startsWith('REC')
  const isQuotation = record.document_type === 'quotation'
  const docTitle = isReceipt ? 'Receipt' : isQuotation ? 'Quotation' : 'Invoice'
  const money = (amount: unknown) => pdfSafe(formatCurrency(amount, invoiceCurrencyOf(record)))

  const drawRule = (y: number) => {
    doc.setFillColor(27, 54, 93)
    doc.rect(margin, y, contentW * 0.62, 0.55, 'F')
    doc.setFillColor(46, 107, 158)
    doc.rect(margin + contentW * 0.62, y, contentW * 0.2, 0.55, 'F')
    doc.setFillColor(196, 165, 116)
    doc.rect(margin + contentW * 0.82, y, contentW * 0.18, 0.55, 'F')
  }

  const drawLetterhead = (y: number) => {
    const lines = contact.lines.map((line) => pdfSafe(line))
    if (logo) {
      doc.addImage(logo, 'PNG', margin, y, 46, 16.4)
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...NAVY)
    let textY = y + 3.2
    doc.text(pdfSafe(contact.legalName), margin + contentW, textY, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    lines.forEach((line) => {
      textY += 3.5
      doc.text(line, margin + contentW, textY, { align: 'right' })
    })
    const ruleY = Math.max(y + 18, textY + 2.2)
    drawRule(ruleY)
    return ruleY + 6
  }

  let y = drawLetterhead(12)

  const newPage = () => {
    doc.addPage()
    y = drawLetterhead(12)
  }

  const ensure = (height: number) => {
    if (y + height > bottomLimit) newPage()
  }

  const write = (text: string, x: number, size: number, style: 'normal' | 'bold' | 'italic' = 'normal', color = TEXT, align: 'left' | 'right' | 'center' = 'left') => {
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
    doc.setTextColor(...color)
    doc.text(pdfSafe(text), x, y, { align })
  }

  const paragraph = (text: string, width: number, size = 9, color = TEXT, style: 'normal' | 'bold' | 'italic' = 'normal') => {
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
    const lines = doc.splitTextToSize(pdfSafe(text), width) as string[]
    ensure(lines.length * (size * 0.45) + 1)
    doc.setTextColor(...color)
    doc.text(lines, margin, y)
    y += lines.length * (size * 0.42) + 1.2
  }

  if (!isReceipt) {
    const balanceDue = getBalanceDue(record)
    const amountPaid = Number(record.amount_paid || 0)
    const dueHeadline = isQuotation
      ? `${money(record.total_amount)} quoted`
      : amountPaid > 0 && balanceDue <= 0.01
        ? `Paid in full - ${money(record.total_amount)}`
        : `${money(balanceDue > 0 ? balanceDue : record.total_amount)} due ${formatDate(record.due_date)}`
    const billingPeriod = formatBillingPeriod(record.billing_period_start, record.billing_period_end)
    const vatRate = getVatRate(record)

    ensure(16)
    write(dueHeadline, margin, 13, 'bold')
    write(docTitle, margin + contentW, 14, 'normal', TEXT, 'right')
    y += 6
    write(pdfSafe(record.invoice_number), margin + contentW, 9, 'normal', MUTED, 'right')
    y += 6
    const subtitle = [record.project?.title, billingPeriod].filter(Boolean).join(' - ')
    if (subtitle) paragraph(subtitle, contentW, 9, MUTED)

    const meta: Array<[string, string]> = [
      [isQuotation ? 'Quote number' : 'Invoice number', record.invoice_number],
      ['Date of issue', formatDate(record.issue_date)],
      [isQuotation ? 'Valid until' : 'Date due', formatDate(record.due_date)],
      ['Billing period', billingPeriod],
      ['Payment terms', formatPaymentTerms(record.payment_terms)],
      ['PO / reference', record.purchase_order],
      ['Project', record.project?.title],
    ].filter((row) => row[1]) as Array<[string, string]>

    meta.forEach(([label, value]) => {
      ensure(5)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...MUTED)
      doc.text(pdfSafe(label), margin, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...TEXT)
      const valueLines = doc.splitTextToSize(pdfSafe(value), 78) as string[]
      doc.text(valueLines, margin + 36, y)
      y += Math.max(4.6, valueLines.length * 4.2)
    })
    y += 4

    const providerLines = [
      record.company_name || QUANTIS_LETTERHEAD.company_name,
      ...(record.company_address || QUANTIS_LETTERHEAD.company_address).split('\n'),
      record.company_email || QUANTIS_LETTERHEAD.company_email,
      record.company_phone || QUANTIS_LETTERHEAD.company_phone,
      String(record.company_website || QUANTIS_LETTERHEAD.company_website).replace(/^https?:\/\//, ''),
      record.company_vat_code ? `VAT: ${record.company_vat_code}` : '',
      record.company_code ? `Company code: ${record.company_code}` : '',
    ].filter(Boolean)
    const contactName = [record.client?.firstName, record.client?.lastName].filter(Boolean).join(' ')
    const billToName = clientDisplayName(record.client)
    const billLines = [
      billToName,
      contactName && contactName !== billToName ? contactName : '',
      ...(record.billing_address ? String(record.billing_address).split('\n') : []),
      record.billing_email || record.client?.email,
      record.billing_phone || record.client?.phone,
      record.buyer_vat_code ? `VAT: ${record.buyer_vat_code}` : '',
      record.buyer_company_code ? `Company code: ${record.buyer_company_code}` : '',
    ].filter(Boolean)

    ensure(8 + Math.max(providerLines.length, billLines.length) * 4.2)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('SERVICE PROVIDER', margin, y)
    doc.text(isQuotation ? 'PREPARED FOR' : 'BILL TO', margin + contentW / 2 + 4, y)
    y += 5
    const blockTop = y
    let leftY = blockTop
    providerLines.forEach((line, index) => {
      doc.setFont('helvetica', index === 0 ? 'bold' : 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...TEXT)
      const wrapped = doc.splitTextToSize(pdfSafe(line), contentW / 2 - 6) as string[]
      doc.text(wrapped, margin, leftY)
      leftY += wrapped.length * 4
    })
    let rightY = blockTop
    billLines.forEach((line, index) => {
      doc.setFont('helvetica', index === 0 ? 'bold' : 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...TEXT)
      const wrapped = doc.splitTextToSize(pdfSafe(line), contentW / 2 - 6) as string[]
      doc.text(wrapped, margin + contentW / 2 + 4, rightY)
      rightY += wrapped.length * 4
    })
    y = Math.max(leftY, rightY) + 6

    const cols = [
      { label: 'Description', x: margin, w: 92, align: 'left' as const },
      { label: 'Qty', x: margin + 94, w: 14, align: 'center' as const },
      { label: 'Unit price', x: margin + 110, w: 24, align: 'right' as const },
      { label: 'VAT', x: margin + 136, w: 16, align: 'center' as const },
      { label: 'Amount', x: margin + 154, w: 28, align: 'right' as const },
    ]
    const header = () => {
      ensure(8)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...MUTED)
      cols.forEach((col) => doc.text(col.label, col.align === 'left' ? col.x : col.x + col.w, y, { align: col.align }))
      y += 2
      doc.setDrawColor(...HAIR)
      doc.line(margin, y, margin + contentW, y)
      y += 4
    }
    header()
    ;(record.items || []).forEach((item: any) => {
      const lineTotal = Number(item.total_price || 0)
      const withVat = lineTotal + (vatRate / 100) * lineTotal
      const desc = pdfSafe(item.description)
      const extra = item.unit && item.unit !== 'ea' ? `Unit: ${item.unit}` : ''
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const descLines = doc.splitTextToSize(desc, cols[0].w) as string[]
      const rowH = (descLines.length + (extra ? 1 : 0)) * 4 + 2
      if (y + rowH > bottomLimit) {
        newPage()
        header()
      }
      doc.setTextColor(...TEXT)
      doc.text(descLines, cols[0].x, y)
      if (extra) {
        doc.setFontSize(8)
        doc.setTextColor(...MUTED)
        doc.text(pdfSafe(extra), cols[0].x, y + descLines.length * 4)
        doc.setFontSize(9)
        doc.setTextColor(...TEXT)
      }
      const mid = y
      doc.text(String(item.quantity ?? ''), cols[1].x + cols[1].w / 2, mid, { align: 'center' })
      doc.text(Number(item.unit_price).toFixed(2), cols[2].x + cols[2].w, mid, { align: 'right' })
      doc.text(vatRate > 0 ? `${vatRate}%` : '-', cols[3].x + cols[3].w / 2, mid, { align: 'center' })
      doc.setFont('helvetica', 'bold')
      doc.text(withVat.toFixed(2), cols[4].x + cols[4].w, mid, { align: 'right' })
      y += rowH
      doc.setDrawColor(243, 244, 246)
      doc.line(margin, y - 1.5, margin + contentW, y - 1.5)
    })
    y += 4

    const totals: Array<[string, string, boolean]> = [
      ['Subtotal', money(record.subtotal), false],
    ]
    if (Number(record.discount_amount) > 0) totals.push(['Discount', `-${money(record.discount_amount)}`, false])
    totals.push([`VAT${vatRate > 0 ? ` (${vatRate}%)` : ''}`, Number(record.tax_amount) > 0 ? money(record.tax_amount) : '-', false])
    totals.push(['Total', money(record.total_amount), true])
    if (!isQuotation && Number(record.amount_paid) > 0) totals.push(['Amount paid', money(record.amount_paid), false])
    if (!isQuotation) totals.push(['Amount due', money(getBalanceDue(record)), true])
    totals.forEach(([label, value, strong]) => {
      ensure(6)
      doc.setFont('helvetica', strong ? 'bold' : 'normal')
      doc.setFontSize(strong ? 11 : 9)
      doc.setTextColor(...(strong ? TEXT : MUTED))
      doc.text(label, margin + contentW - 62, y)
      doc.text(pdfSafe(value), margin + contentW, y, { align: 'right' })
      y += 5
    })
    y += 2
    paragraph(`Amount in words: ${amountInWords(Number(record.total_amount || 0), invoiceCurrencyOf(record))}`, contentW, 9, MUTED, 'italic')

    if (!isQuotation) {
      ensure(8)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...MUTED)
      doc.text('PAYMENT INSTRUCTIONS', margin, y)
      y += 5
      formatSellerBankBlock(record).forEach((line) => paragraph(line, contentW, 9, TEXT))
      paragraph(`Please use invoice number ${record.invoice_number} as the payment reference.`, contentW, 8, MUTED)
    }
    if (record.notes) {
      ensure(8)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...MUTED)
      doc.text('NOTES', margin, y)
      y += 4
      paragraph(record.notes, contentW, 9, TEXT)
    }
    if (record.terms_conditions) {
      ensure(8)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...MUTED)
      doc.text('TERMS', margin, y)
      y += 4
      paragraph(record.terms_conditions, contentW, 9, TEXT)
    }
  } else {
    const vatRate = getVatRate(record.parent_invoice || record)
    const showVat = vatRate > 0.001 && Number(record.tax_amount) > 0
    ensure(12)
    write('Receipt', margin, 16, 'normal')
    y += 8
    paragraph(clientDisplayName(record.client), contentW / 2, 10, TEXT, 'bold')
    if (record.billing_address) paragraph(record.billing_address, contentW / 2, 9, MUTED)
    if (record.billing_email) paragraph(record.billing_email, contentW / 2, 9, MUTED)
    const facts = [
      ['Receipt No', record.invoice_number],
      ['Invoice No', record.payment_reference],
      ['Issue date', formatDate(record.issue_date)],
      ['Payment date', formatDate(record.payment_date)],
      ['Payment method', record.payment_method],
      ['Project', record.project?.title || record.parent_invoice?.project?.title],
    ].filter((row) => row[1]) as Array<[string, string]>
    facts.forEach(([label, value]) => {
      ensure(5)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...MUTED)
      doc.text(label, margin + contentW - 70, y)
      doc.setTextColor(...TEXT)
      doc.text(pdfSafe(value), margin + contentW, y, { align: 'right' })
      y += 4.6
    })
    y += 3
    if (record.notes) paragraph(record.notes, contentW, 9, TEXT)
    ;(record.items || []).forEach((item: any) => {
      ensure(6)
      paragraph(`${item.description}    ${item.quantity} x ${money(item.unit_price)}    ${money(item.total_price)}`, contentW, 9, TEXT)
    })
    ensure(16)
    write(`Subtotal  ${money(record.subtotal)}`, margin + contentW, 9, 'normal', MUTED, 'right')
    y += 5
    write(`VAT  ${showVat ? money(record.tax_amount) : '-'}`, margin + contentW, 9, 'normal', MUTED, 'right')
    y += 5
    write(`Total  ${money(record.total_amount)}`, margin + contentW, 11, 'bold', TEXT, 'right')
    y += 6
  }

  const footerTop = pageH - 18
  if (y > footerTop - 4) newPage()
  doc.setDrawColor(...HAIR)
  doc.setLineWidth(0.2)
  doc.line(margin, footerTop, margin + contentW, footerTop)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text('Thank you for your business.', margin, footerTop + 5)
  const site = String(record.company_website || QUANTIS_LETTERHEAD.company_website).replace(/^https?:\/\//, '')
  doc.text(pdfSafe(`${QUANTIS_LETTERHEAD.company_legal_name} - ${site} - ${record.invoice_number}`), margin, footerTop + 9)

  const name = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`
  doc.save(name)
}
