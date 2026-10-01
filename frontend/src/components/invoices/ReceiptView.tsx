'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDownTrayIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import QuantisLetterhead from '../QuantisLetterhead'
import {
  exportReceiptWord,
  exportReceiptExcel,
  formatCurrency as formatCurrencyAmount,
  formatDate,
  clientName,
} from '../../lib/receiptExport'
import { getVatRate } from '../../lib/invoiceUtils'
import { invoiceCurrencyOf } from '../../lib/money'
import { downloadElementPdf } from '../../lib/printDocument'

interface ReceiptViewProps {
  receipt: any
  onClose: () => void
  onEdit?: () => void
  autoDownload?: boolean
}

export default function ReceiptView({ receipt, onClose, onEdit, autoDownload }: ReceiptViewProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const formatCurrency = (amount: number) => formatCurrencyAmount(amount, invoiceCurrencyOf(receipt))

  const downloadReceipt = async () => {
    const node = printRef.current
    if (!node || !receipt || downloading) return
    setDownloading(true)
    try {
      await downloadElementPdf(node, `Receipt ${receipt.invoice_number}.pdf`)
    } catch (error) {
      console.error(error)
      alert('Could not create the PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    if (autoDownload && receipt) {
      const t = setTimeout(() => {
        void downloadReceipt()
      }, 400)
      return () => clearTimeout(t)
    }
  }, [autoDownload, receipt])

  if (!receipt) return null

  const vatRate = getVatRate(receipt.parent_invoice || receipt)
  const showVat = vatRate > 0.001 && Number(receipt.tax_amount) > 0
  const projectTitle = receipt.project?.title || receipt.parent_invoice?.project?.title

  const handleExport = (type: 'pdf' | 'word' | 'excel') => {
    setShowExportMenu(false)
    if (type === 'pdf') void downloadReceipt()
    else if (type === 'word') exportReceiptWord(receipt)
    else exportReceiptExcel(receipt)
  }

  return (
    <div className="invoice-print-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 print:bg-white print:p-0">
      <div
        ref={printRef}
        id="receipt-print-area"
        className="bg-white w-full max-w-4xl max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-lg shadow-xl print:max-h-none print:shadow-none print:overflow-visible"
      >
        {/* Modal header - hidden when printing */}
        <div className="no-print bg-granite-800 text-white p-3 sm:p-4 rounded-t-lg print:hidden flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-base sm:text-xl font-bold min-w-0 truncate">Receipt {receipt.invoice_number}</h2>
          <div className="flex flex-wrap items-center gap-2">
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
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <button onClick={() => handleExport('pdf')} disabled={downloading} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm disabled:opacity-60">
                    {downloading ? 'Saving PDF…' : 'PDF'}
                  </button>
                  <button onClick={() => handleExport('word')} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">
                    Word (.doc)
                  </button>
                  <button onClick={() => handleExport('excel')} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">
                    Excel (.xlsx)
                  </button>
                </div>
              )}
            </div>
            {onEdit && (
              <button onClick={onEdit} className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-green-600">
                Edit
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              Close
            </button>
          </div>
        </div>

        {/* Receipt body */}
        <div className="p-8 bg-white text-gray-900 print:p-6">
          <QuantisLetterhead logoSrc={receipt.company_logo_url} className="mb-6" />

          {/* Title row */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-light text-gray-800 mb-4">Receipt</h1>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Bill to</p>
                <p className="font-medium">{clientName(receipt)}</p>
                {receipt.billing_address && (
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{receipt.billing_address}</p>
                )}
                {receipt.billing_email && <p className="text-sm text-gray-600">{receipt.billing_email}</p>}
              </div>
            </div>
            <div className="text-right text-sm space-y-1">
              <p>
                <span className="text-gray-500">Status: </span>
                <span className="text-green-600 font-semibold capitalize">{receipt.status}</span>
              </p>
              <p>
                <span className="text-gray-500">Receipt No: </span>
                <span className="font-medium">{receipt.invoice_number}</span>
              </p>
              {receipt.payment_reference && (
                <p>
                  <span className="text-gray-500">Invoice No: </span>
                  <span>{receipt.payment_reference}</span>
                  {receipt.parent_invoice && (
                    <span className="ml-2 text-xs text-amber-600">
                      ({Number(receipt.total_amount) < Number(receipt.parent_invoice.total_amount) - 0.01 ? 'Partial payment' : 'Full payment'})
                    </span>
                  )}
                </p>
              )}
              <p>
                <span className="text-gray-500">Issue Date: </span>
                <span>{formatDate(receipt.issue_date)}</span>
              </p>
              <p>
                <span className="text-gray-500">Payment Date: </span>
                <span>{formatDate(receipt.payment_date)}</span>
              </p>
              {receipt.payment_method && (
                <p>
                  <span className="text-gray-500">Payment Method: </span>
                  <span>{receipt.payment_method}</span>
                </p>
              )}
              {projectTitle && (
                <p>
                  <span className="text-gray-500">Project: </span>
                  <span>{projectTitle}</span>
                </p>
              )}
            </div>
          </div>

          {receipt.notes && (
            <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm font-semibold text-gray-600 mb-1">Description</p>
              <p className="text-gray-800 whitespace-pre-line">{receipt.notes}</p>
            </div>
          )}

          {/* Items table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-sky-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Item</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Quantity</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Unit Price</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Discount (%)</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items?.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-3">{item.description}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right">{formatCurrency(Number(item.unit_price))}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{item.discount_percent || 0}%</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-medium">{formatCurrency(Number(item.total_price))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">SUB-TOTAL</span>
                <span>{formatCurrency(Number(receipt.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">V.A.T {showVat ? `(${vatRate}%)` : ''}</span>
                <span>{showVat ? formatCurrency(Number(receipt.tax_amount)) : '—'}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-400 pt-2">
                <span>TOTAL</span>
                <span>{formatCurrency(Number(receipt.total_amount))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 16mm 14mm 18mm; }
          html, body { background: #fff !important; height: auto !important; overflow: visible !important; }
          .invoice-print-backdrop {
            position: static !important;
            inset: auto !important;
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            background: #fff !important;
          }
          #receipt-print-area {
            position: static !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
          .invoice-letterhead, #receipt-print-area tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
