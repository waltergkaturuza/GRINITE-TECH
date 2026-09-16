import { QUANTIS_LETTERHEAD } from './companyLetterhead'

export function asMoney(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

export function toInputDate(value?: string | Date | null): string {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Invoice-level VAT is the source of truth, including 0%. Line rates are only a fallback. */
export function getVatRate(
  invoice?: { tax_rate?: unknown } | null,
  item?: { tax_rate?: unknown } | null,
): number {
  if (invoice?.tax_rate !== undefined && invoice?.tax_rate !== null && invoice.tax_rate !== '') {
    return asMoney(invoice.tax_rate)
  }
  if (item?.tax_rate !== undefined && item?.tax_rate !== null && item.tax_rate !== '') {
    return asMoney(item.tax_rate)
  }
  return 0
}

export function normalizeInvoice(invoice: any) {
  if (!invoice || typeof invoice !== 'object') return invoice
  const taxRate = asMoney(invoice.tax_rate)
  return {
    ...invoice,
    tax_rate: taxRate,
    discount_amount: asMoney(invoice.discount_amount),
    subtotal: asMoney(invoice.subtotal),
    tax_amount: asMoney(invoice.tax_amount),
    total_amount: asMoney(invoice.total_amount),
    amount_paid: asMoney(invoice.amount_paid),
    items: Array.isArray(invoice.items)
      ? invoice.items.map((item: any) => ({
          ...item,
          quantity: asMoney(item.quantity) || 1,
          unit_price: asMoney(item.unit_price),
          tax_rate: invoice.tax_rate !== undefined && invoice.tax_rate !== null ? taxRate : asMoney(item.tax_rate),
          total_price: asMoney(item.total_price),
          discount_percent: asMoney(item.discount_percent),
        }))
      : invoice.items,
  }
}

export const formatCurrency = (amount: unknown, currency = QUANTIS_LETTERHEAD.currency) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(asMoney(amount))

export const formatDate = (dateString?: string | Date) => {
  if (!dateString) return '—'
  const raw = typeof dateString === 'string' ? dateString : dateString.toISOString()
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.slice(0, 10)) && raw.length <= 10) {
    const [year, month, day] = raw.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatBillingPeriod(start?: string | Date, end?: string | Date) {
  if (!start && !end) return ''
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`
  return formatDate(start || end)
}

export function formatPaymentTerms(terms?: string) {
  switch ((terms || '').toLowerCase()) {
    case 'due_on_receipt':
      return 'Due on receipt'
    case 'net_15':
      return 'Net 15'
    case 'net_30':
      return 'Net 30'
    case 'net_45':
      return 'Net 45'
    case 'net_60':
      return 'Net 60'
    default:
      return terms?.replace(/_/g, ' ') || ''
  }
}

export const getBalanceDue = (invoice: { total_amount?: number; amount_paid?: number; balance_due?: number }) => {
  if (invoice.balance_due != null) return Number(invoice.balance_due)
  const total = Number(invoice.total_amount || 0)
  const paid = Number(invoice.amount_paid || 0)
  return Math.max(0, total - paid)
}

export const clientDisplayName = (client?: { firstName?: string; lastName?: string; company?: string; email?: string }) => {
  if (!client) return 'Client'
  if (client.company) return client.company
  const name = [client.firstName, client.lastName].filter(Boolean).join(' ')
  return name || client.email || 'Client'
}

const BELOW_TWENTY = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
]
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
const SCALES = ['', 'Thousand', 'Million', 'Billion']

function chunkToWords(n: number): string {
  if (n === 0) return ''
  if (n < 20) return BELOW_TWENTY[n]
  if (n < 100) {
    const t = Math.floor(n / 10)
    const r = n % 10
    return r ? `${TENS[t]}-${BELOW_TWENTY[r].toLowerCase()}` : TENS[t]
  }
  const h = Math.floor(n / 100)
  const r = n % 100
  return r ? `${BELOW_TWENTY[h]} Hundred ${chunkToWords(r)}` : `${BELOW_TWENTY[h]} Hundred`
}

function numberToWords(n: number): string {
  if (n === 0) return 'Zero'
  let num = Math.floor(n)
  let scale = 0
  const parts: string[] = []
  while (num > 0) {
    const chunk = num % 1000
    if (chunk) {
      const words = chunkToWords(chunk)
      parts.unshift(scale ? `${words} ${SCALES[scale]}` : words)
    }
    num = Math.floor(num / 1000)
    scale++
  }
  return parts.join(' ')
}

export function amountInWords(amount: number, currency = 'USD'): string {
  const dollars = Math.floor(amount)
  const cents = Math.round((amount - dollars) * 100)
  const dollarWords = numberToWords(dollars)
  const centPart = cents > 0 ? ` and ${cents}/100` : ', 00ct'
  return `${dollarWords} ${currency}${centPart}.`
}

export function getPaymentStatusLabel(invoice: { status?: string; total_amount?: number; amount_paid?: number }) {
  const balance = getBalanceDue(invoice)
  const total = Number(invoice.total_amount || 0)
  const paid = Number(invoice.amount_paid || 0)
  if (balance <= 0.01 && paid > 0) return 'Fully Paid'
  if (paid > 0 && balance > 0.01) return 'Partially Paid'
  return invoice.status?.replace('_', ' ') || 'Unpaid'
}
