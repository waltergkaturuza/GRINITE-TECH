'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDownTrayIcon, ChevronDownIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import { QUANTIS_LETTERHEAD, formatSellerBankBlock } from '../../lib/companyLetterhead'
import {
  formatCurrency,
  formatDate,
  formatBillingPeriod,
  formatPaymentTerms,
  clientDisplayName,
  amountInWords,
  getBalanceDue,
  getPaymentStatusLabel,
} from '../../lib/invoiceUtils'

interface InvoiceViewProps {
  invoice: any
  onClose: () => void
  onEdit?: () => void
  onRecordPayment?: (invoice: any) => void
  autoPrint?: boolean
}

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-x-3 text-sm py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  )
}

export default function InvoiceView({ invoice, onClose, onEdit, onRecordPayment, autoPrint }: InvoiceViewProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)

  useEffect(() => {
    if (autoPrint && invoice) {
      const t = setTimeout(() => window.print(), 400)
      return () => clearTimeout(t)
    }
  }, [autoPrint, invoice])

  if (!invoice) return null

  const isQuotation = invoice.document_type === 'quotation'
  const docTitle = isQuotation ? 'Quotation' : 'Invoice'
  const letterheadUrl = invoice.company_logo_url?.startsWith('http')
    ? invoice.company_logo_url
    : `${typeof window !== 'undefined' ? window.location.origin : ''}${invoice.company_logo_url || QUANTIS_LETTERHEAD.company_logo_url}`

  const balanceDue = getBalanceDue(invoice)
  const amountPaid = Number(invoice.amount_paid || 0)
  const receipts = invoice.receipts || []
  const canRecordPayment = !isQuotation && balanceDue > 0.01 && onRecordPayment
  const billingPeriod = formatBillingPeriod(invoice.billing_period_start, invoice.billing_period_end)
  const providerEmail = invoice.company_email || QUANTIS_LETTERHEAD.company_email
  const providerPhone = invoice.company_phone || QUANTIS_LETTERHEAD.company_phone
  const providerWebsite = invoice.company_website || QUANTIS_LETTERHEAD.company_website
  const contactName = [invoice.client?.firstName, invoice.client?.lastName].filter(Boolean).join(' ')
  const billToName = clientDisplayName(invoice.client)
  const showContact = contactName && contactName !== billToName
  const billToLabel = isQuotation ? 'Prepared for' : 'Bill to'
  const dueOrValidLabel = isQuotation ? 'Valid until' : 'Date due'
  const dueHeadline = isQuotation
    ? `${formatCurrency(invoice.total_amount)} quoted`
    : amountPaid > 0 && balanceDue <= 0.01
      ? `Paid in full · ${formatCurrency(invoice.total_amount)}`
      : `${formatCurrency(balanceDue > 0 ? balanceDue : invoice.total_amount)} due ${formatDate(invoice.due_date)}`

  const itemVat = (item: any) => {
    const rate = item.tax_rate ?? invoice.tax_rate ?? 0
    const lineTotal = Number(item.total_price || item.quantity * item.unit_price)
    return (rate / 100) * lineTotal
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:bg-white print:p-0">
      <div ref={printRef} id="invoice-print-area" className="bg-white max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl print:max-h-none print:shadow-none print:rounded-none">
        <div className="bg-granite-800 text-white p-4 rounded-t-lg print:hidden flex justify-between items-center">
          <h2 className="text-xl font-bold">{docTitle} {invoice.invoice_number}</h2>
          <div className="flex items-center gap-2">
            {canRecordPayment && (
              <button
                onClick={() => onRecordPayment(invoice)}
                className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600"
              >
                <BanknotesIcon className="w-4 h-4 mr-2" />
                Record Payment
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-600"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Download
                <ChevronDownIcon className="w-4 h-4 ml-1" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border z-10">
                  <button onClick={() => { setShowExportMenu(false); window.print() }} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">PDF (Print)</button>
                </div>
              )}
            </div>
            {onEdit && (
              <button onClick={onEdit} className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-green-600">Edit</button>
            )}
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Close</button>
          </div>
        </div>

        <div className="p-8 bg-white text-gray-900 print:p-0">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="min-w-0">
              <img src={letterheadUrl} alt="Quantis Technologies" className="h-16 w-auto max-w-[280px] object-contain object-left mb-2" />
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-gray-500">
                {QUANTIS_LETTERHEAD.company_legal_name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-light text-gray-900">{docTitle}</p>
              <p className="text-sm text-gray-500 mt-1">{invoice.invoice_number}</p>
            </div>
          </div>

          <p className="text-2xl font-semibold text-gray-900 mb-1">{dueHeadline}</p>
          {(billingPeriod || invoice.project?.title) && (
            <p className="text-sm text-gray-600 mb-6">
              {[invoice.project?.title, billingPeriod].filter(Boolean).join(' · ')}
            </p>
          )}
          {!billingPeriod && !invoice.project?.title && <div className="mb-6" />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <MetaRow label={isQuotation ? 'Quote number' : 'Invoice number'} value={invoice.invoice_number} />
              <MetaRow label="Date of issue" value={formatDate(invoice.issue_date)} />
              <MetaRow label={dueOrValidLabel} value={formatDate(invoice.due_date)} />
              <MetaRow label="Billing period" value={billingPeriod || undefined} />
              <MetaRow label="Payment terms" value={formatPaymentTerms(invoice.payment_terms)} />
              <MetaRow label="PO / reference" value={invoice.purchase_order} />
              <MetaRow label="Project" value={invoice.project?.title} />
            </div>
            <div className="text-sm print:hidden">
              <p className="text-gray-500">Internal status</p>
              <p className="font-semibold capitalize text-gray-800">{getPaymentStatusLabel(invoice)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Service Provider</p>
              <p className="font-semibold text-gray-900">{invoice.company_name || QUANTIS_LETTERHEAD.company_name}</p>
              <p className="whitespace-pre-line text-gray-700 mt-1">{invoice.company_address || QUANTIS_LETTERHEAD.company_address}</p>
              {providerEmail && <p className="text-gray-700 mt-1">{providerEmail}</p>}
              {providerPhone && <p className="text-gray-700">{providerPhone}</p>}
              {providerWebsite && <p className="text-gray-700">{providerWebsite.replace(/^https?:\/\//, '')}</p>}
              {invoice.company_vat_code && <p className="text-gray-700 mt-1">VAT: {invoice.company_vat_code}</p>}
              {invoice.company_code && <p className="text-gray-700">Company code: {invoice.company_code}</p>}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{billToLabel}</p>
              <p className="font-semibold text-gray-900">{billToName}</p>
              {showContact && <p className="text-gray-700">{contactName}</p>}
              {invoice.billing_address && (
                <p className="whitespace-pre-line text-gray-700 mt-1">{invoice.billing_address}</p>
              )}
              {(invoice.billing_email || invoice.client?.email) && (
                <p className="text-gray-700 mt-1">{invoice.billing_email || invoice.client?.email}</p>
              )}
              {(invoice.billing_phone || invoice.client?.phone) && (
                <p className="text-gray-700">{invoice.billing_phone || invoice.client?.phone}</p>
              )}
              {invoice.buyer_vat_code && <p className="text-gray-700 mt-1">VAT: {invoice.buyer_vat_code}</p>}
              {invoice.buyer_company_code && <p className="text-gray-700">Company code: {invoice.buyer_company_code}</p>}
            </div>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-500">
                  <th className="py-2 pr-3 font-medium">Description</th>
                  <th className="py-2 px-2 font-medium text-center w-16">Qty</th>
                  <th className="py-2 px-2 font-medium text-right w-24">Unit price</th>
                  <th className="py-2 px-2 font-medium text-center w-16">VAT</th>
                  <th className="py-2 pl-2 font-medium text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item: any, index: number) => {
                  const vat = itemVat(item)
                  const lineTotal = Number(item.total_price || 0)
                  const withVat = lineTotal + vat
                  const rate = item.tax_rate ?? invoice.tax_rate ?? 0
                  return (
                    <tr key={index} className="border-b border-gray-100 align-top">
                      <td className="py-3 pr-3">
                        <p className="text-gray-900">{item.description}</p>
                        {item.unit && item.unit !== 'ea' && (
                          <p className="text-xs text-gray-500 mt-0.5">Unit: {item.unit}</p>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center text-gray-800">{item.quantity}</td>
                      <td className="py-3 px-2 text-right text-gray-800">{Number(item.unit_price).toFixed(2)}</td>
                      <td className="py-3 px-2 text-center text-gray-800">{rate > 0 ? `${rate}%` : '—'}</td>
                      <td className="py-3 pl-2 text-right font-medium text-gray-900">{withVat.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {Number(invoice.discount_amount) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>−{formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>VAT</span>
                <span>{Number(invoice.tax_amount) > 0 ? formatCurrency(invoice.tax_amount) : '—'}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-300 pt-2">
                <span>Total</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
              {!isQuotation && amountPaid > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Amount paid</span>
                  <span>{formatCurrency(amountPaid)}</span>
                </div>
              )}
              {!isQuotation && (
                <div className="flex justify-between font-bold text-base pt-1">
                  <span>Amount due</span>
                  <span>{formatCurrency(balanceDue)}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm italic text-gray-600 mb-8">
            Amount in words: {amountInWords(Number(invoice.total_amount))}
          </p>

          {!isQuotation && (
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Payment instructions</p>
              <div className="text-sm text-gray-700 space-y-0.5">
                {formatSellerBankBlock(invoice).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Please use invoice number {invoice.invoice_number} as the payment reference.
              </p>
            </div>
          )}

          {!isQuotation && receipts.length > 0 && (
            <div className="mb-8 print:hidden">
              <p className="text-sm font-semibold text-gray-800 mb-2">Payments received</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-1 font-medium">Receipt</th>
                    <th className="py-1 font-medium">Date</th>
                    <th className="py-1 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((r: any) => (
                    <tr key={r.id} className="border-b border-gray-100">
                      <td className="py-1">{r.invoice_number}</td>
                      <td className="py-1">{formatDate(r.payment_date || r.issue_date)}</td>
                      <td className="py-1 text-right">{formatCurrency(Number(r.total_amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(invoice.notes || invoice.terms_conditions) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-8">
              {invoice.notes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Notes</p>
                  <p className="whitespace-pre-line text-gray-700">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms_conditions && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Terms</p>
                  <p className="whitespace-pre-line text-gray-700">{invoice.terms_conditions}</p>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>Thank you for your business.</p>
            <p>{QUANTIS_LETTERHEAD.company_legal_name} · {providerWebsite.replace(/^https?:\/\//, '')}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { margin: 14mm; size: A4; }
          body * { visibility: hidden; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; max-width: 100%; box-shadow: none; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
