'use client'

interface InvoiceViewProps {
  invoice: any
  onClose: () => void
  onEdit?: () => void
}

export default function InvoiceView({ invoice, onClose, onEdit }: InvoiceViewProps) {
  if (!invoice) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl">
        {/* Header */}
        <div className="bg-granite-800 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Invoice {invoice.invoice_number}</h2>
              <p className="text-gray-300 mt-1">
                Created on {formatDate(invoice.created_at)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
              <div className="flex space-x-2">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 bg-white text-gray-900">
          {/* Company Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-granite-800">
              {invoice.company_name || 'Granite Tech Solutions'}
            </h1>
            {invoice.company_address && (
              <p className="text-gray-600 mt-2">{invoice.company_address}</p>
            )}
            <div className="flex justify-center space-x-4 mt-2 text-sm text-gray-600">
              {invoice.company_email && <span>Email: {invoice.company_email}</span>}
              {invoice.company_phone && <span>Phone: {invoice.company_phone}</span>}
              {invoice.company_website && <span>Web: {invoice.company_website}</span>}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Bill To */}
            <div>
              <h3 className="text-lg font-semibold text-granite-800 mb-3">Bill To:</h3>
              <div className="text-gray-700">
                <p className="font-medium">
                  {invoice.client?.firstName} {invoice.client?.lastName}
                </p>
                {invoice.client?.company && (
                  <p>{invoice.client.company}</p>
                )}
                {invoice.billing_address && (
                  <div className="mt-2 whitespace-pre-line">
                    {invoice.billing_address}
                  </div>
                )}
                {invoice.billing_email && (
                  <p className="mt-2">Email: {invoice.billing_email}</p>
                )}
                {invoice.billing_phone && (
                  <p>Phone: {invoice.billing_phone}</p>
                )}
              </div>
            </div>

            {/* Invoice Info */}
            <div>
              <h3 className="text-lg font-semibold text-granite-800 mb-3">Invoice Details:</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Invoice Number:</span>
                  <span className="font-medium">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Issue Date:</span>
                  <span>{formatDate(invoice.issue_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Date:</span>
                  <span>{formatDate(invoice.due_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Terms:</span>
                  <span className="capitalize">
                    {invoice.payment_terms.replace('_', ' ')}
                  </span>
                </div>
                {invoice.payment_date && (
                  <div className="flex justify-between">
                    <span>Payment Date:</span>
                    <span>{formatDate(invoice.payment_date)}</span>
                  </div>
                )}
                {invoice.payment_method && (
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>{invoice.payment_method}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-granite-800 mb-4">Items:</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left">Description</th>
                    <th className="border border-gray-300 px-4 py-3 text-center">Qty</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">Unit Price</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3">
                        {item.description}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-1/2">
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.tax_rate > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({invoice.tax_rate}%):</span>
                    <span>{formatCurrency(invoice.tax_amount)}</span>
                  </div>
                )}
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(invoice.discount_amount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {(invoice.notes || invoice.terms_conditions) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {invoice.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-granite-800 mb-3">Notes:</h3>
                  <div className="text-gray-700 whitespace-pre-line">
                    {invoice.notes}
                  </div>
                </div>
              )}

              {invoice.terms_conditions && (
                <div>
                  <h3 className="text-lg font-semibold text-granite-800 mb-3">Terms & Conditions:</h3>
                  <div className="text-gray-700 whitespace-pre-line">
                    {invoice.terms_conditions}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Information */}
          {invoice.status === 'sent' && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Payment Information</h3>
              <p className="text-blue-700">
                This invoice is due on {formatDate(invoice.due_date)}. 
                Please remit payment according to the terms specified above.
              </p>
            </div>
          )}

          {invoice.status === 'overdue' && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Payment Overdue</h3>
              <p className="text-red-700">
                This invoice was due on {formatDate(invoice.due_date)} and is now overdue. 
                Please contact us immediately to arrange payment.
              </p>
            </div>
          )}

          {invoice.status === 'paid' && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Received</h3>
              <p className="text-green-700">
                Thank you! Payment was received on {formatDate(invoice.payment_date)}.
                {invoice.payment_reference && ` Reference: ${invoice.payment_reference}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}