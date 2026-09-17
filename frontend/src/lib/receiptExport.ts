import * as XLSX from 'xlsx'
import { QUANTIS_LETTERHEAD, formatSellerBankBlock, letterheadHtmlInline } from './companyLetterhead'
import { getVatRate } from './invoiceUtils'
import { formatMoney, invoiceCurrencyOf } from './money'

export type ReceiptDocument = {
  invoice_number: string
  status: string
  issue_date: string
  payment_date?: string
  payment_reference?: string
  payment_method?: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  notes?: string
  billing_address?: string
  billing_email?: string
  billing_phone?: string
  company_name?: string
  company_address?: string
  company_email?: string
  company_phone?: string
  company_website?: string
  company_logo_url?: string
  company_bank_name?: string
  company_bank_branch?: string
  company_account_name?: string
  company_usd_account?: string
  company_zig_account?: string
  client?: { firstName?: string; lastName?: string; company?: string; email?: string }
  project?: { title?: string; currency?: string; metadata?: { currency?: string } }
  parent_invoice?: { tax_rate?: number; currency?: string; project?: { title?: string; currency?: string; metadata?: { currency?: string } }; total_amount?: number }
  currency?: string
  items?: Array<{
    description: string
    quantity: number
    unit_price: number
    discount_percent?: number
    total_price: number
  }>
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatCurrency = (amount: number, currency?: string) =>
  formatMoney(amount, currency || QUANTIS_LETTERHEAD.currency)

function money(receipt: ReceiptDocument, amount: number) {
  return formatCurrency(amount, invoiceCurrencyOf(receipt))
}

function vatLine(receipt: ReceiptDocument) {
  const rate = getVatRate(receipt.parent_invoice || receipt)
  const showVat = rate > 0.001 && Number(receipt.tax_amount) > 0
  return {
    label: showVat ? `V.A.T (${rate}%)` : 'V.A.T',
    amount: showVat ? receipt.tax_amount : 0,
    display: showVat ? money(receipt, receipt.tax_amount) : '—',
  }
}

const clientName = (receipt: ReceiptDocument) => {
  const c = receipt.client
  if (!c) return 'Client'
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ')
  return c.company || name || c.email || 'Client'
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportReceiptWord(receipt: ReceiptDocument) {
  const items = receipt.items || []
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="border:1px solid #ccc;padding:8px;">${item.description}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${item.quantity}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:right;">${money(receipt, item.unit_price)}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${item.discount_percent || 0}%</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:right;">${money(receipt, item.total_price)}</td>
      </tr>`
    )
    .join('')

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>Receipt ${receipt.invoice_number}</title></head>
<body style="font-family:Arial,sans-serif;color:#222;">
  ${letterheadHtmlInline(typeof window !== 'undefined' ? window.location.origin : '', receipt.company_logo_url)}
  <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
    <div>
      <h2 style="margin:0 0 8px;">Receipt</h2>
      <p style="margin:0;"><strong>${receipt.company_name || QUANTIS_LETTERHEAD.company_name}</strong></p>
      <p style="margin:4px 0;white-space:pre-line;">${receipt.company_address || QUANTIS_LETTERHEAD.company_address}</p>
      <p style="margin:8px 0 0;font-weight:bold;">Banking Details:</p>
      ${formatSellerBankBlock(receipt).map((line) => `<p style="margin:2px 0;">${line}</p>`).join('')}
    </div>
    <div style="text-align:right;">
      <p><strong>Status:</strong> <span style="color:green;">${receipt.status}</span></p>
      <p><strong>Receipt No:</strong> ${receipt.invoice_number}</p>
      ${receipt.payment_reference ? `<p><strong>Invoice No:</strong> ${receipt.payment_reference}</p>` : ''}
      <p><strong>Issue Date:</strong> ${formatDate(receipt.issue_date)}</p>
      <p><strong>Payment Date:</strong> ${formatDate(receipt.payment_date)}</p>
    </div>
  </div>
  <div style="margin-bottom:24px;">
    <p><strong>Bill to:</strong></p>
    <p>${clientName(receipt)}</p>
    ${receipt.billing_address ? `<p style="white-space:pre-line;">${receipt.billing_address}</p>` : ''}
    ${receipt.billing_email ? `<p>Email: ${receipt.billing_email}</p>` : ''}
  </div>
  ${receipt.notes ? `<p style="margin-bottom:16px;"><strong>Description:</strong> ${receipt.notes}</p>` : ''}
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr style="background:#e8f4fc;">
        <th style="border:1px solid #ccc;padding:8px;text-align:left;">Item</th>
        <th style="border:1px solid #ccc;padding:8px;">Quantity</th>
        <th style="border:1px solid #ccc;padding:8px;text-align:right;">Unit Price</th>
        <th style="border:1px solid #ccc;padding:8px;">Discount (%)</th>
        <th style="border:1px solid #ccc;padding:8px;text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="width:280px;margin-left:auto;">
    <p style="display:flex;justify-content:space-between;"><span>SUB-TOTAL</span><span>${money(receipt, receipt.subtotal)}</span></p>
    <p style="display:flex;justify-content:space-between;"><span>${vatLine(receipt).label}</span><span>${vatLine(receipt).display}</span></p>
    <p style="display:flex;justify-content:space-between;font-weight:bold;font-size:18px;"><span>TOTAL</span><span>${money(receipt, receipt.total_amount)}</span></p>
  </div>
</body></html>`

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
  downloadBlob(blob, `${receipt.invoice_number}.doc`)
}

export function exportReceiptExcel(receipt: ReceiptDocument) {
  const items = receipt.items || []
  const rows: (string | number)[][] = [
    [receipt.company_name || QUANTIS_LETTERHEAD.company_name],
    [receipt.company_address || QUANTIS_LETTERHEAD.company_address],
    [],
    ['Receipt', receipt.invoice_number],
    ['Status', receipt.status],
    ['Issue Date', formatDate(receipt.issue_date)],
    ['Payment Date', formatDate(receipt.payment_date)],
    ...(receipt.payment_reference ? [['Invoice No', receipt.payment_reference]] : []),
    [],
    ['Bill to', clientName(receipt)],
    ...(receipt.billing_address ? [['Address', receipt.billing_address]] : []),
    ...(receipt.notes ? [['Description', receipt.notes]] : []),
    [],
    ['Item', 'Quantity', 'Unit Price', 'Discount (%)', 'Amount'],
    ...items.map((item) => [
      item.description,
      item.quantity,
      item.unit_price,
      item.discount_percent || 0,
      item.total_price,
    ]),
    [],
    ['SUB-TOTAL', '', '', '', receipt.subtotal],
    [vatLine(receipt).label, '', '', '', vatLine(receipt).display],
    ['TOTAL', '', '', '', receipt.total_amount],
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Receipt')
  XLSX.writeFile(wb, `${receipt.invoice_number}.xlsx`)
}

export function exportReceiptPDF() {
  window.print()
}

export { formatDate, clientName }
