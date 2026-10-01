'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDownTrayIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import QuantisLetterhead from '../QuantisLetterhead'
import { QUANTIS_LETTERHEAD } from '../../lib/companyLetterhead'
import {
  exportReceiptWord,
  exportReceiptExcel,
  formatCurrency as formatCurrencyAmount,
  formatDate,
  clientName,
} from '../../lib/receiptExport'
import { downloadElementPdf } from '../../lib/documentPdf'
import { getVatRate } from '../../lib/invoiceUtils'
import { invoiceCurrencyOf } from '../../lib/money'

interface ReceiptViewProps {
  receipt: any
  onClose: () => void
  onEdit?: () => void
  /** Start the PDF download as soon as the receipt is shown (list "Download" action). */
  autoDownload?: boolean
}

export default function ReceiptView({ receipt, onClose, onEdit, autoDownload }: ReceiptViewProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const formatCurrency = (amount: number) => formatCurrencyAmount(amount, invoiceCurrencyOf(receipt))

  const handleDownloadPdf = async () => {
    const el = printRef.current
    if (!el || !receipt || downloading) return
    try {
      setDownloading(true)
      setDownloadError('')
      await downloadElementPdf(el, {
        filename: `${receipt.invoice_number || 'Receipt'}.pdf`,
        footerLines: [
          'Thank you for your business.',
          `${QUANTIS_LETTERHEAD.company_legal_name} · ${receipt.invoice_number}`,
        ],
      })
    } catch (err) {
      console.error('PDF download failed', err)
      setDownloadError('Could not build the PDF. Use Print instead.')
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    if (autoDownload && receipt) {
      const t = setTimeout(() => {
        void handleDownloadPdf()
      }, 400)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload, receipt?.id])

  if (!receipt) return null

  const vatRate = getVatRate(receipt.parent_invoice || receipt)
  const showVat = vatRate > 0.001 && Number(receipt.tax_amount) > 0
  const projectTitle = receipt.project?.title || receipt.parent_invoice?.project?.title

  const handleExport = (type: 'print' | 'word' | 'excel') => {
    setShowExportMenu(false)
    if (type === 'print') window.print()
    else if (type === 'word') exportReceiptWord(receipt)
    else exportReceiptExcel(receipt)
  }

  return (
    <div className="qt-print-root fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 print:static print:bg-white print:p-0 print:h-auto print:overflow-visible print:block">
      <div
        ref={printRef}
        id="receipt-print-area"
        className="qt-print-area bg-white w-full max-w-4xl max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-lg shadow-xl print:max-h-none print:shadow-none print:overflow-visible print:rounded-none print:w-full"
      >
        {/* Modal header - hidden when printing */}
        <div data-pdf-hide className="bg-granite-800 text-white p-3 sm:p-4 rounded-t-lg print:hidden flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-base sm:text-xl font-bold min-w-0 truncate">Receipt {receipt.invoice_number}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative inline-flex rounded-md shadow-sm">
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="inline-flex items-center px-4 py-2 bg-purple-700 text-white rounded-l-md hover:bg-purple-600 disabled:opacity-60"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                {downloading ? 'Preparing PDF…' : 'Download PDF'}
              </button>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                aria-label="More download options"
                className="inline-flex items-center px-2 py-2 bg-purple-700 text-white rounded-r-md border-l border-purple-500 hover:bg-purple-600"
              >
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <button onClick={() => handleExport('print')} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">
                    Print
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
        {downloadError && (
          <p data-pdf-hide className="print:hidden px-8 pt-3 text-sm text-red-600">{downloadError}</p>
        )}

        <table className="qt-print-sheet w-full">
          <thead className="hidden print:table-header-group">
            <tr>
              <td>
                <QuantisLetterhead compact logoSrc={receipt.company_logo_url} />
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
        <div className="p-8 bg-white text-gray-900 print:p-0">
          <div className="print:hidden">
            <QuantisLetterhead logoSrc={receipt.company_logo_url} className="mb-6" />
          </div>

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
          <div className="mb-8 overflow-x-auto print:overflow-visible">
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
              </td>
            </tr>
          </tbody>
        </table>

        <div className="qt-print-footer">
          <div className="qt-print-footer-rule" />
          <p>Thank you for your business.</p>
          <p>
            {QUANTIS_LETTERHEAD.company_legal_name} · {receipt.invoice_number}
          </p>
        </div>
      </div>
    </div>
  )
}
