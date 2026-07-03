'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDownTrayIcon, ChevronDownIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import { QUANTIS_LETTERHEAD, formatSellerBankBlock } from '../../lib/companyLetterhead'
import {
  formatCurrency,
  formatDate,
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'text-green-600'
      case 'partially_paid': return 'text-amber-600'
      case 'sent': return 'text-blue-600'
      case 'overdue': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const itemVat = (item: any) => {
    const rate = item.tax_rate ?? invoice.tax_rate ?? 0
    const lineTotal = Number(item.total_price || item.quantity * item.unit_price)
    return (rate / 100) * lineTotal
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:bg-white print:p-0">
      <div ref={printRef} id="invoice-print-area" className="bg-white max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl print:max-h-none print:shadow-none">
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

        <div className="p-8 bg-white text-gray-900 print:p-6">
          {/* Letterhead */}
          <div className="mb-6">
            <img src={letterheadUrl} alt="Letterhead" className="w-full max-h-28 object-contain object-left mb-3" />
            <p className="text-center text-xs font-bold tracking-widest uppercase">{QUANTIS_LETTERHEAD.company_legal_name}</p>
          </div>

          {/* Seller / Buyer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 text-sm">
            <div>
              <p className="font-bold text-gray-800 mb-2">Seller:</p>
              <p className="font-semibold">{invoice.company_name || QUANTIS_LETTERHEAD.company_name}</p>
              {invoice.company_code && <p>Company code: {invoice.company_code}</p>}
              {invoice.company_vat_code && <p>VAT code: {invoice.company_vat_code}</p>}
              <p className="whitespace-pre-line text-gray-700 mt-1">{invoice.company_address || QUANTIS_LETTERHEAD.company_address}</p>
              <div className="mt-2 text-gray-700 space-y-0.5">
                <p className="font-semibold text-gray-800">Banking Details:</p>
                {formatSellerBankBlock(invoice).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold text-gray-800 mb-2">Buyer:</p>
              <p className="font-semibold">{clientDisplayName(invoice.client)}</p>
              {invoice.buyer_company_code && <p>Company code: {invoice.buyer_company_code}</p>}
              {invoice.buyer_vat_code && <p>VAT code: {invoice.buyer_vat_code}</p>}
              {invoice.billing_address && <p className="whitespace-pre-line text-gray-700 mt-1">{invoice.billing_address}</p>}
              {(invoice.buyer_bank_name || invoice.buyer_iban) && (
                <p className="mt-2 text-gray-700 bg-sky-50 p-2 rounded border border-sky-100">
                  Bank: {invoice.buyer_bank_name || '—'}
                  {invoice.buyer_swift && ` SWIFT: ${invoice.buyer_swift}`}
                  {invoice.buyer_iban && ` IBAN: ${invoice.buyer_iban}`}
                </p>
              )}
            </div>
          </div>

          {/* Invoice meta row */}
          <div className="grid grid-cols-2 gap-4 mb-6 border-y border-gray-300 py-3 text-sm">
            <div>
              <span className="text-gray-500">{docTitle} No: </span>
              <span className="font-bold">{invoice.invoice_number}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-500">Date: </span>
              <span className="font-medium">{formatDate(invoice.issue_date)}</span>
            </div>
            {!isQuotation && (
              <>
                <div>
                  <span className="text-gray-500">Due Date: </span>
                  <span>{formatDate(invoice.due_date)}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500">Status: </span>
                  <span className={`font-semibold capitalize ${getStatusColor(invoice.status)}`}>
                    {getPaymentStatusLabel(invoice)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Items table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-sky-100">
                  <th className="border border-gray-300 px-2 py-2 text-left w-8">No.</th>
                  <th className="border border-gray-300 px-2 py-2 text-left">Item – service description</th>
                  <th className="border border-gray-300 px-2 py-2 text-center w-14">Unit</th>
                  <th className="border border-gray-300 px-2 py-2 text-center w-14">Quant.</th>
                  <th className="border border-gray-300 px-2 py-2 text-right w-24">Price, USD</th>
                  <th className="border border-gray-300 px-2 py-2 text-center w-16">VAT (%)</th>
                  <th className="border border-gray-300 px-2 py-2 text-right w-20">VAT USD</th>
                  <th className="border border-gray-300 px-2 py-2 text-right w-28">Total with VAT USD</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item: any, index: number) => {
                  const vat = itemVat(item)
                  const lineTotal = Number(item.total_price || 0)
                  const withVat = lineTotal + vat
                  const rate = item.tax_rate ?? invoice.tax_rate ?? 0
                  return (
                    <tr key={index}>
                      <td className="border border-gray-300 px-2 py-2 text-center">{index + 1}</td>
                      <td className="border border-gray-300 px-2 py-2">{item.description}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{item.unit || 'ea'}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-2 py-2 text-right">{Number(item.unit_price).toFixed(2)}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{rate > 0 ? rate : '–'}</td>
                      <td className="border border-gray-300 px-2 py-2 text-right">{vat > 0 ? vat.toFixed(2) : '0.00'}</td>
                      <td className="border border-gray-300 px-2 py-2 text-right font-medium">{withVat.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-72 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">Total amount without VAT, USD</span>
                <span>{Number(invoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Total amount of VAT, USD</span>
                <span>{Number(invoice.tax_amount) > 0 ? Number(invoice.tax_amount).toFixed(2) : '–'}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-400 pt-2">
                <span>TOTAL {docTitle.toUpperCase()} AMOUNT, USD</span>
                <span>{Number(invoice.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <p className="text-sm italic text-gray-700 mb-6 border-t border-gray-200 pt-4">
            Amount in words: {amountInWords(Number(invoice.total_amount))}
          </p>

          {/* Payment tracking (invoices only) */}
          {!isQuotation && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 print:bg-white">
              <h3 className="font-semibold text-gray-800 mb-3">Payment Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Invoice Total</p>
                  <p className="font-bold text-lg">{formatCurrency(Number(invoice.total_amount))}</p>
                </div>
                <div>
                  <p className="text-gray-500">Amount Paid</p>
                  <p className="font-bold text-lg text-green-700">{formatCurrency(amountPaid)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Balance Due</p>
                  <p className={`font-bold text-lg ${balanceDue > 0 ? 'text-red-600' : 'text-green-700'}`}>
                    {formatCurrency(balanceDue)}
                  </p>
                </div>
              </div>

              {receipts.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Linked Receipts</p>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-white">
                        <th className="border border-gray-200 px-2 py-1 text-left">Receipt No</th>
                        <th className="border border-gray-200 px-2 py-1 text-left">Date</th>
                        <th className="border border-gray-200 px-2 py-1 text-right">Amount</th>
                        <th className="border border-gray-200 px-2 py-1 text-left">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipts.map((r: any) => {
                        const invTotal = Number(invoice.total_amount)
                        const isPartial = Number(r.total_amount) < invTotal - 0.01
                        return (
                          <tr key={r.id}>
                            <td className="border border-gray-200 px-2 py-1">{r.invoice_number}</td>
                            <td className="border border-gray-200 px-2 py-1">{formatDate(r.payment_date || r.issue_date)}</td>
                            <td className="border border-gray-200 px-2 py-1 text-right">{formatCurrency(Number(r.total_amount))}</td>
                            <td className="border border-gray-200 px-2 py-1">
                              <span className={isPartial ? 'text-amber-600' : 'text-green-600'}>
                                {isPartial ? 'Partial' : 'Full'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {(invoice.notes || invoice.terms_conditions) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {invoice.notes && (
                <div>
                  <p className="font-semibold mb-1">Notes</p>
                  <p className="whitespace-pre-line text-gray-700">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms_conditions && (
                <div>
                  <p className="font-semibold mb-1">Terms & Conditions</p>
                  <p className="whitespace-pre-line text-gray-700">{invoice.terms_conditions}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; max-width: 100%; }
        }
      `}</style>
    </div>
  )
}
