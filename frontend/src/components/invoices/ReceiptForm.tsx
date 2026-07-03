'use client'

import { useState, useEffect } from 'react'
import {
  PlusIcon,
  TrashIcon,
  CalendarDaysIcon,
  UserIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import { usersAPI, invoicesAPI } from '../../lib/api'
import { QUANTIS_LETTERHEAD } from '../../lib/companyLetterhead'
import { getBalanceDue, formatCurrency } from '../../lib/invoiceUtils'

interface ReceiptItem {
  description: string
  quantity: number
  unit_price: number
  discount_percent: number
  total_price: number
}

interface ReceiptFormProps {
  receipt?: any
  linkedInvoice?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ReceiptForm({ receipt, linkedInvoice, onSubmit, onCancel, isLoading = false }: ReceiptFormProps) {
  const [clients, setClients] = useState<any[]>([])
  const [openInvoices, setOpenInvoices] = useState<any[]>([])
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | ''>('')
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [useSimplePayment, setUseSimplePayment] = useState(true)
  const [formData, setFormData] = useState({
    client_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    payment_date: new Date().toISOString().split('T')[0],
    payment_reference: '',
    payment_method: '',
    tax_rate: 0,
    notes: '',
    billing_address: '',
    billing_email: '',
    billing_phone: '',
    company_name: QUANTIS_LETTERHEAD.company_name,
    company_logo_url: QUANTIS_LETTERHEAD.company_logo_url,
    company_address: QUANTIS_LETTERHEAD.company_address,
    company_email: QUANTIS_LETTERHEAD.company_email,
    company_phone: QUANTIS_LETTERHEAD.company_phone,
    company_website: QUANTIS_LETTERHEAD.company_website,
  })
  const [items, setItems] = useState<ReceiptItem[]>([
    { description: '', quantity: 1, unit_price: 0, discount_percent: 0, total_price: 0 },
  ])

  useEffect(() => {
    loadClients()
    loadOpenInvoices()
  }, [])

  useEffect(() => {
    if (linkedInvoice && !receipt) {
      applyLinkedInvoice(linkedInvoice)
    }
  }, [linkedInvoice, receipt])

  useEffect(() => {
    if (receipt) {
      setSelectedInvoiceId(receipt.parent_invoice_id || '')
      setFormData({
        client_id: receipt.client_id || '',
        issue_date: receipt.issue_date ? new Date(receipt.issue_date).toISOString().split('T')[0] : formData.issue_date,
        payment_date: receipt.payment_date
          ? new Date(receipt.payment_date).toISOString().split('T')[0]
          : formData.payment_date,
        payment_reference: receipt.payment_reference || '',
        payment_method: receipt.payment_method || '',
        tax_rate: receipt.tax_rate || 0,
        notes: receipt.notes || '',
        billing_address: receipt.billing_address || '',
        billing_email: receipt.billing_email || '',
        billing_phone: receipt.billing_phone || '',
        company_name: receipt.company_name || QUANTIS_LETTERHEAD.company_name,
        company_logo_url: receipt.company_logo_url || QUANTIS_LETTERHEAD.company_logo_url,
        company_address: receipt.company_address || QUANTIS_LETTERHEAD.company_address,
        company_email: receipt.company_email || QUANTIS_LETTERHEAD.company_email,
        company_phone: receipt.company_phone || QUANTIS_LETTERHEAD.company_phone,
        company_website: receipt.company_website || QUANTIS_LETTERHEAD.company_website,
      })
      if (receipt.items?.length) {
        setItems(
          receipt.items.map((item: any) => ({
            description: item.description || '',
            quantity: item.quantity || 1,
            unit_price: Number(item.unit_price) || 0,
            discount_percent: Number(item.discount_percent) || 0,
            total_price: Number(item.total_price) || 0,
          }))
        )
      }
    }
  }, [receipt])

  const loadOpenInvoices = async () => {
    try {
      const data = await invoicesAPI.getOpenInvoices()
      setOpenInvoices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load open invoices:', error)
    }
  }

  const applyLinkedInvoice = (inv: any) => {
    const balance = getBalanceDue(inv)
    setSelectedInvoiceId(inv.id)
    setPaymentAmount(balance)
    setFormData((prev) => ({
      ...prev,
      client_id: inv.client_id || '',
      payment_reference: inv.invoice_number,
      billing_address: inv.billing_address || prev.billing_address,
      billing_email: inv.billing_email || prev.billing_email,
      billing_phone: inv.billing_phone || prev.billing_phone,
      tax_rate: inv.tax_rate || 0,
      notes: balance < Number(inv.total_amount) - 0.01
        ? `Partial payment for invoice ${inv.invoice_number}`
        : `Payment for invoice ${inv.invoice_number}`,
    }))
    setUseSimplePayment(true)
    setItems([{
      description: `Payment for ${inv.invoice_number}`,
      quantity: 1,
      unit_price: balance,
      discount_percent: 0,
      total_price: balance,
    }])
  }

  const handleInvoiceSelect = (invoiceId: string) => {
    const id = invoiceId ? parseInt(invoiceId, 10) : ''
    setSelectedInvoiceId(id)
    if (!invoiceId) return
    const inv = openInvoices.find((i) => i.id === id) || (linkedInvoice?.id === id ? linkedInvoice : null)
    if (inv) applyLinkedInvoice(inv)
  }

  const handlePaymentAmountChange = (amount: number) => {
    setPaymentAmount(amount)
    const inv = openInvoices.find((i) => i.id === selectedInvoiceId) || linkedInvoice
    const invNum = inv?.invoice_number || formData.payment_reference || 'invoice'
    const balance = inv ? getBalanceDue(inv) : amount
    const isPartial = amount < balance - 0.01
    setFormData((prev) => ({
      ...prev,
      notes: isPartial ? `Partial payment for invoice ${invNum}` : `Payment for invoice ${invNum}`,
    }))
    if (useSimplePayment) {
      setItems([{
        description: isPartial ? `Partial payment – ${invNum}` : `Payment for ${invNum}`,
        quantity: 1,
        unit_price: amount,
        discount_percent: 0,
        total_price: amount,
      }])
    }
  }

  const selectedInvoice = openInvoices.find((i) => i.id === selectedInvoiceId) || (linkedInvoice?.id === selectedInvoiceId ? linkedInvoice : null)
  const balanceDue = selectedInvoice ? getBalanceDue(selectedInvoice) : null

  const loadClients = async () => {
    try {
      const response = await usersAPI.getUsers({ role: 'client' })
      const list = Array.isArray(response) ? response : response?.users || response?.data || []
      setClients(list.filter((u: any) => (u.role || '').toLowerCase() === 'client'))
    } catch (error) {
      console.error('Failed to load clients:', error)
    }
  }

  const calcLineTotal = (quantity: number, unitPrice: number, discountPercent: number) => {
    const gross = quantity * unitPrice
    return gross * (1 - discountPercent / 100)
  }

  const updateItem = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    if (field === 'quantity' || field === 'unit_price' || field === 'discount_percent') {
      newItems[index].total_price = calcLineTotal(
        newItems[index].quantity,
        newItems[index].unit_price,
        newItems[index].discount_percent
      )
    }
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, discount_percent: 0, total_price: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
    const taxAmount = (formData.tax_rate / 100) * subtotal
    return { subtotal, taxAmount, total: subtotal + taxAmount }
  }

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    setFormData((prev) => ({
      ...prev,
      client_id: clientId,
      billing_address: client?.billingAddress || client?.address || prev.billing_address,
      billing_email: client?.email || prev.billing_email,
      billing_phone: client?.phone || prev.billing_phone,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedInvoice && paymentAmount > (balanceDue ?? paymentAmount) + 0.01) {
      alert(`Payment amount cannot exceed balance due (${formatCurrency(balanceDue ?? 0)})`)
      return
    }
    const { subtotal, taxAmount, total } = calculateTotals()
    onSubmit({
      ...formData,
      document_type: 'receipt',
      parent_invoice_id: selectedInvoiceId || undefined,
      due_date: formData.payment_date,
      items: items.filter((item) => item.description.trim() !== ''),
      subtotal,
      tax_amount: taxAmount,
      total_amount: total,
    })
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <div className="max-w-4xl mx-auto bg-granite-800 shadow-xl rounded-lg border border-granite-700">
      <div className="px-6 py-4 border-b border-granite-700">
        <h3 className="text-lg font-medium text-white">
          {receipt ? 'Edit Receipt' : 'Create New Receipt'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Letterhead preview */}
        <div className="bg-white rounded-lg p-4 border border-granite-600">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Letterhead preview</p>
          <img
            src={formData.company_logo_url}
            alt="Company letterhead"
            className="w-full max-h-32 object-contain object-left"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Link to invoice</label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">No linked invoice (standalone receipt)</option>
              {openInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} – {formatCurrency(Number(inv.total_amount))} (balance: {formatCurrency(getBalanceDue(inv))})
                </option>
              ))}
            </select>
            {selectedInvoice && balanceDue != null && (
              <div className="mt-2 p-3 bg-granite-700/50 rounded-md text-sm text-gray-300 grid grid-cols-3 gap-2">
                <div><span className="text-gray-400">Invoice total:</span> {formatCurrency(Number(selectedInvoice.total_amount))}</div>
                <div><span className="text-gray-400">Already paid:</span> {formatCurrency(Number(selectedInvoice.amount_paid || 0))}</div>
                <div><span className="text-gray-400">Balance due:</span> <strong className="text-amber-400">{formatCurrency(balanceDue)}</strong></div>
              </div>
            )}
          </div>

          {selectedInvoiceId && useSimplePayment && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
                Payment amount {balanceDue != null && paymentAmount < balanceDue - 0.01 ? '(partial)' : '(full)'}
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                max={balanceDue ?? undefined}
                value={paymentAmount}
                onChange={(e) => handlePaymentAmountChange(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <UserIcon className="w-4 h-4 inline mr-2" />
              Client (To)
            </label>
            <select
              value={formData.client_id}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName} {client.company ? `(${client.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Invoice reference</label>
            <input
              type="text"
              value={formData.payment_reference}
              onChange={(e) => setFormData((prev) => ({ ...prev, payment_reference: e.target.value }))}
              placeholder="Auto-filled when linked"
              readOnly={!!selectedInvoiceId}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 read-only:opacity-70"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
              Issue date
            </label>
            <input
              type="date"
              value={formData.issue_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, issue_date: e.target.value }))}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
              Payment date
            </label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, payment_date: e.target.value }))}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Payment method</label>
            <input
              type="text"
              value={formData.payment_method}
              onChange={(e) => setFormData((prev) => ({ ...prev, payment_method: e.target.value }))}
              placeholder="Bank transfer, cash, etc."
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
              VAT rate (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.tax_rate}
              onChange={(e) => setFormData((prev) => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Billing address</label>
          <textarea
            value={formData.billing_address}
            onChange={(e) => setFormData((prev) => ({ ...prev, billing_address: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Client address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description / notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Payment for services rendered..."
          />
        </div>

        {/* Line items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-white">Items</h4>
            <div className="flex gap-2">
              {selectedInvoiceId && (
                <button
                  type="button"
                  onClick={() => setUseSimplePayment(!useSimplePayment)}
                  className="text-xs px-2 py-1 border border-granite-600 rounded text-gray-400 hover:text-white"
                >
                  {useSimplePayment ? 'Detailed items' : 'Simple payment'}
                </button>
              )}
              {!useSimplePayment && (
                <button type="button" onClick={addItem} className="inline-flex items-center px-3 py-1 border border-granite-600 rounded-md text-sm text-gray-300 hover:bg-granite-700">
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add item
                </button>
              )}
            </div>
          </div>

          {useSimplePayment && selectedInvoiceId ? (
            <p className="text-sm text-gray-400 italic">Payment line auto-generated from payment amount above.</p>
          ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end bg-granite-700/50 p-3 rounded-lg">
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-xs text-gray-400 mb-1">Item</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full px-2 py-1.5 bg-granite-700 border border-granite-600 rounded text-white text-sm"
                    placeholder="Description"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1.5 bg-granite-700 border border-granite-600 rounded text-white text-sm"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Unit price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-granite-700 border border-granite-600 rounded text-white text-sm"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.discount_percent}
                    onChange={(e) => updateItem(index, 'discount_percent', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-granite-700 border border-granite-600 rounded text-white text-sm"
                  />
                </div>
                <div className="col-span-8 md:col-span-1 flex items-end">
                  <span className="text-sm text-gray-300 pb-1.5">${item.total_price.toFixed(2)}</span>
                </div>
                <div className="col-span-4 md:col-span-1 flex items-end justify-end">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Totals */}
        <div className="bg-granite-700/50 rounded-lg p-4 space-y-2 text-right max-w-xs ml-auto">
          <div className="flex justify-between text-gray-300">
            <span>Sub-total:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>VAT ({formData.tax_rate}%):</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white font-bold text-lg border-t border-granite-600 pt-2">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-granite-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-granite-600 rounded-md text-gray-300 hover:bg-granite-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-amber-800 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : receipt ? 'Update Receipt' : 'Create Receipt'}
          </button>
        </div>
      </form>
    </div>
  )
}
