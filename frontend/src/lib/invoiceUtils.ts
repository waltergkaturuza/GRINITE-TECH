import { QUANTIS_LETTERHEAD } from './companyLetterhead'

export const formatCurrency = (amount: number, currency = QUANTIS_LETTERHEAD.currency) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)

export const formatDate = (dateString?: string) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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
