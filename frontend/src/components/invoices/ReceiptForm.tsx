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
import { getBalanceDue, formatCurrency as formatCurrencyAmount, asMoney, getVatRate, toInputDate } from '../../lib/invoiceUtils'
import { invoiceCurrencyOf } from '../../lib/money'

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
  const [invoiceLoadError, setInvoiceLoadError] = useState('')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | ''>('')
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [useSimplePayment, setUseSimplePayment] = useState(true)
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
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

  const [parentInvoice, setParentInvoice] = useState<any>(linkedInvoice || receipt?.parent_invoice || null)

  useEffect(() => {
    loadClients()
    loadOpenInvoices()
  }, [])

  useEffect(() => {
    if (linkedInvoice) setParentInvoice(linkedInvoice)
  }, [linkedInvoice])

  useEffect(() => {
    if (linkedInvoice && !receipt) {
      applyLinkedInvoice(linkedInvoice)
    }
  }, [linkedInvoice, receipt])

  useEffect(() => {
    const parentId = receipt?.parent_invoice_id
    if (!parentId) return
    if (parentInvoice?.id === parentId || linkedInvoice?.id === parentId) return
    if (receipt.parent_invoice?.id === parentId) {
      setParentInvoice(receipt.parent_invoice)
      return
    }
    invoicesAPI.getInvoice(parentId).then(setParentInvoice).catch(() => {})
  }, [receipt?.parent_invoice_id, receipt?.parent_invoice, parentInvoice?.id, linkedInvoice?.id])

  useEffect(() => {
    if (receipt) {
      const amount = asMoney(receipt.total_amount) || asMoney(receipt.subtotal)
      setSelectedInvoiceId(receipt.parent_invoice_id || receipt.parent_invoice?.id || '')
      setPaymentAmount(amount)
      setUseSimplePayment(!(receipt.items?.length > 1))
      setFormData({
        client_id: receipt.client_id || '',
        project_id: receipt.project_id || receipt.project?.id || receipt.parent_invoice?.project_id || '',
        issue_date: toInputDate(receipt.issue_date) || formData.issue_date,
        payment_date: toInputDate(receipt.payment_date) || toInputDate(receipt.due_date) || formData.payment_date,
        payment_reference: receipt.payment_reference || receipt.parent_invoice?.invoice_number || '',
        payment_method: receipt.payment_method || '',
        tax_rate: getVatRate(receipt.parent_invoice || receipt),
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
            quantity: asMoney(item.quantity) || 1,
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
      setInvoiceLoadError('')
      let data: any = await invoicesAPI.getOpenInvoices()
      let list = Array.isArray(data) ? data : data?.invoices || data?.data || []
      if (!list.length) {
        const fallback = await invoicesAPI.getInvoices({ documentType: 'invoice', limit: 200 })
        const all = fallback?.invoices || fallback?.data || []
        list = (Array.isArray(all) ? all : []).filter((inv: any) => {
          const status = String(inv.status || '').toLowerCase()
          if (status === 'cancelled') return false
          if (status === 'paid') return true
          return getBalanceDue(inv) > 0.01
        })
      }
      setOpenInvoices(list)
    } catch (error) {
      console.error('Failed to load open invoices:', error)
      try {
        const fallback = await invoicesAPI.getInvoices({ documentType: 'invoice', limit: 200 })
        const all = fallback?.invoices || fallback?.data || []
        const list = (Array.isArray(all) ? all : []).filter((inv: any) => {
          const status = String(inv.status || '').toLowerCase()
          if (status === 'cancelled') return false
          if (status === 'paid') return true
          return getBalanceDue(inv) > 0.01
        })
        setOpenInvoices(list)
        if (!list.length) setInvoiceLoadError('No invoices were found to link.')
      } catch (fallbackError) {
        console.error('Fallback invoice load failed:', fallbackError)
        setOpenInvoices([])
        setInvoiceLoadError('Could not load invoices to link. Refresh and try again.')
      }
    }
  }

  const applyLinkedInvoice = (inv: any) => {
    const balance = getBalanceDue(inv)
    const recordable = balance > 0.01 ? balance : Number(inv.total_amount) || 0
    const invoiceTax = getVatRate(inv)
    setSelectedInvoiceId(inv.id)
    setPaymentAmount(recordable)
    setFormData((prev) => ({
      ...prev,
      client_id: inv.client_id || '',
      project_id: inv.project_id || inv.project?.id || '',
      payment_reference: inv.invoice_number,
      billing_address: inv.billing_address || prev.billing_address,
      billing_email: inv.billing_email || prev.billing_email,
      billing_phone: inv.billing_phone || prev.billing_phone,
      tax_rate: invoiceTax,
      notes: String(inv.status || '').toLowerCase() === 'paid'
        ? `Payment in full for invoice ${inv.invoice_number}`
        : `Payment for invoice ${inv.invoice_number}`,
    }))
    setUseSimplePayment(true)
    setItems([{
      description: `Payment for ${inv.invoice_number}`,
      quantity: 1,
      unit_price: recordable,
      discount_percent: 0,
      total_price: recordable,
    }])
  }

  const handleInvoiceSelect = (invoiceId: string) => {
    const id = invoiceId ? parseInt(invoiceId, 10) : ''
    setSelectedInvoiceId(id)
    if (!invoiceId) return
    const inv = openInvoices.find((i) => i.id === id)
      || (linkedInvoice?.id === id ? linkedInvoice : null)
      || (parentInvoice?.id === id ? parentInvoice : null)
      || (receipt?.parent_invoice?.id === id ? receipt.parent_invoice : null)
    if (inv) {
      setParentInvoice(inv)
      applyLinkedInvoice(inv)
    }
  }

  const handlePaymentAmountChange = (amount: number) => {
    setPaymentAmount(amount)
    const inv = openInvoices.find((i) => i.id === selectedInvoiceId)
      || linkedInvoice
      || parentInvoice
      || receipt?.parent_invoice
    const invNum = inv?.invoice_number || formData.payment_reference || 'invoice'
    const invoiceTotal = asMoney(inv?.total_amount)
    const alreadyPaid = Math.max(0, asMoney(inv?.amount_paid) - (receipt ? asMoney(receipt.total_amount) : 0))
    const paidAfter = alreadyPaid + amount
    const isFull = invoiceTotal > 0 ? paidAfter >= invoiceTotal - 0.01 : amount > 0
    setFormData((prev) => ({
      ...prev,
      notes: isFull ? `Payment in full for invoice ${invNum}` : `Partial payment for invoice ${invNum}`,
    }))
    if (useSimplePayment) {
      setItems([{
        description: isFull ? `Payment in full – ${invNum}` : `Partial payment – ${invNum}`,
        quantity: 1,
        unit_price: amount,
        discount_percent: 0,
        total_price: amount,
      }])
    }
  }

  const invoiceOptions = (() => {
    const map = new Map<number, any>()
    for (const inv of openInvoices) if (inv?.id) map.set(inv.id, inv)
    if (linkedInvoice?.id) map.set(linkedInvoice.id, linkedInvoice)
    if (parentInvoice?.id) map.set(parentInvoice.id, parentInvoice)
    if (receipt?.parent_invoice?.id) map.set(receipt.parent_invoice.id, receipt.parent_invoice)
    return Array.from(map.values())
  })()
  const selectedInvoice = invoiceOptions.find((i) => i.id === selectedInvoiceId) || null
  const currentReceiptAmount = receipt ? asMoney(receipt.total_amount) : 0
  const formatCurrency = (amount: unknown) =>
    formatCurrencyAmount(amount, invoiceCurrencyOf(selectedInvoice || receipt))
  const balanceDue = selectedInvoice ? getBalanceDue(selectedInvoice) + currentReceiptAmount : null
  const invoiceTotal = selectedInvoice ? asMoney(selectedInvoice.total_amount) : 0
  const alreadyPaid = selectedInvoice
    ? Math.max(0, asMoney(selectedInvoice.amount_paid) - currentReceiptAmount)
    : 0
  const invoiceTaxRate = selectedInvoice ? getVatRate(selectedInvoice) : asMoney(formData.tax_rate)
  const invoiceHasVat = invoiceTaxRate > 0.001
  const paidAfterThisReceipt = alreadyPaid + asMoney(useSimplePayment ? paymentAmount : items.reduce((sum, item) => sum + asMoney(item.total_price), 0))
  const willBeFullyPaid = selectedInvoice ? paidAfterThisReceipt >= invoiceTotal - 0.01 : false
  const nextInvoiceStatus = !selectedInvoice
    ? ''
    : willBeFullyPaid
      ? 'Paid'
      : paidAfterThisReceipt > 0.01
        ? 'Partially paid'
        : String(selectedInvoice.status || 'sent').replace(/_/g, ' ')
  const projectTitle = selectedInvoice?.project?.title
    || receipt?.project?.title
    || receipt?.parent_invoice?.project?.title
    || ''

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
    const subtotal = items.reduce((sum, item) => sum + asMoney(item.total_price), 0)
    // Linked receipts record cash received. Do not add VAT on top, and keep 0% when the invoice had no VAT.
    const taxRate = selectedInvoice ? invoiceTaxRate : asMoney(formData.tax_rate)
    const taxAmount = selectedInvoice || taxRate < 0.001 ? 0 : (taxRate / 100) * subtotal
    return { subtotal, taxAmount, total: subtotal + taxAmount, taxRate }
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
      const remaining = balanceDue ?? 0
      const allowHistoricPaidReceipt = !receipt
        && remaining <= 0.01
        && String(selectedInvoice.status || '').toLowerCase() === 'paid'
        && Number(selectedInvoice.receipt_count ?? 0) === 0
      if (!allowHistoricPaidReceipt || paymentAmount > invoiceTotal + 0.01) {
        alert(`Payment amount cannot exceed balance due (${formatCurrency(remaining > 0.01 ? remaining : invoiceTotal)})`)
        return
      }
    }
    const { subtotal, taxAmount, total, taxRate } = calculateTotals()
    onSubmit({
      ...formData,
      project_id: selectedInvoice?.project_id || formData.project_id || undefined,
      tax_rate: taxRate,
      document_type: 'receipt',
      currency: invoiceCurrencyOf(selectedInvoice || receipt),
      parent_invoice_id: selectedInvoiceId || undefined,
      due_date: formData.payment_date,
      items: items.filter((item) => item.description.trim() !== ''),
      subtotal,
      tax_amount: taxAmount,
      total_amount: total,
    })
  }

  const { subtotal, taxAmount, total, taxRate } = calculateTotals()

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
              {invoiceOptions.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} – {formatCurrency(Number(inv.total_amount))} (balance: {formatCurrency(getBalanceDue(inv) + (receipt?.parent_invoice_id === inv.id ? currentReceiptAmount : 0))})
                  {String(inv.status || '').toLowerCase() === 'paid' && Number(inv.receipt_count || 0) === 0 ? ' · needs receipt' : ''}
                  {inv.status ? ` · ${String(inv.status).replace(/_/g, ' ')}` : ''}
                  {inv.project?.title ? ` · ${inv.project.title}` : ''}
                </option>
              ))}
            </select>
            {invoiceLoadError && <p className="mt-2 text-sm text-amber-400">{invoiceLoadError}</p>}
            {!invoiceLoadError && invoiceOptions.length === 0 && (
              <p className="mt-2 text-sm text-gray-400">
                Draft, sent, overdue, partially paid, and paid invoices that still need a receipt appear here.
              </p>
            )}
            {selectedInvoice && balanceDue != null && (
              <div className="mt-2 p-3 bg-granite-700/50 rounded-md text-sm text-gray-300 grid grid-cols-3 gap-2">
                <div><span className="text-gray-400">Invoice total:</span> {formatCurrency(invoiceTotal)}</div>
                <div><span className="text-gray-400">Already paid:</span> {formatCurrency(alreadyPaid)}</div>
                <div><span className="text-gray-400">Balance due:</span> <strong className="text-amber-400">{formatCurrency(balanceDue)}</strong></div>
                <div className="col-span-3 pt-1 border-t border-granite-600">
                  After this receipt: <strong className={willBeFullyPaid ? 'text-green-400' : 'text-amber-300'}>{nextInvoiceStatus}</strong>
                  {' '}({formatCurrency(paidAfterThisReceipt)} of {formatCurrency(invoiceTotal)})
                </div>
                {projectTitle && (
                  <div className="col-span-3 text-xs text-gray-400">Project: {projectTitle}</div>
                )}
              </div>
            )}
          </div>

          {selectedInvoiceId && useSimplePayment && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
                Payment amount {willBeFullyPaid ? '(full)' : '(partial)'}
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
              {selectedInvoice && (
                <p className={`mt-2 text-sm ${willBeFullyPaid ? 'text-green-400' : 'text-amber-300'}`}>
                  {willBeFullyPaid
                    ? `This ${formatCurrency(paymentAmount)} payment settles the invoice. Status will update to Paid.`
                    : `This ${formatCurrency(paymentAmount)} payment is ${formatCurrency(paidAfterThisReceipt)} of ${formatCurrency(invoiceTotal)}. Status will update to Partially paid.`}
                </p>
              )}
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
              value={selectedInvoice ? invoiceTaxRate : formData.tax_rate}
              onChange={(e) => {
                if (selectedInvoice) return
                setFormData((prev) => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))
              }}
              readOnly={!!selectedInvoice}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 read-only:opacity-70"
            />
            {selectedInvoice && (
              <p className="mt-1 text-xs text-gray-400">
                {invoiceHasVat
                  ? `Copied from the invoice (${invoiceTaxRate}%). The amount received is recorded as-is, without adding VAT again.`
                  : 'This invoice has no VAT, so the receipt stays at 0% and VAT is not added.'}
              </p>
            )}
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
                  <span className="text-sm text-gray-300 pb-1.5">${asMoney(item.total_price).toFixed(2)}</span>
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
            <span>${asMoney(subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>VAT ({taxRate}%):</span>
            <span>${asMoney(taxAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white font-bold text-lg border-t border-granite-600 pt-2">
            <span>Total:</span>
            <span>${asMoney(total).toFixed(2)}</span>
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
