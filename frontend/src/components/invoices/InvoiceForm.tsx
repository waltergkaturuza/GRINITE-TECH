'use client'

import { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  TrashIcon, 
  CalendarDaysIcon,
  UserIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { usersAPI, invoicesAPI } from '../../lib/api'

interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  total_price: number
}

interface InvoiceFormProps {
  invoice?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function InvoiceForm({ invoice, onSubmit, onCancel, isLoading = false }: InvoiceFormProps) {
  const [clients, setClients] = useState<any[]>([])
  const [formData, setFormData] = useState({
    client_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_terms: 'net_30' as const,
    tax_rate: 10,
    discount_amount: 0,
    notes: '',
    terms_conditions: 'Payment is due within the specified payment terms. Late payments may incur additional charges.',
    billing_address: '',
    billing_email: '',
    billing_phone: '',
  })
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 10,
      total_price: 0
    }
  ])

  // Load clients on component mount
  useEffect(() => {
    loadClients()
  }, [])

  // Populate form when editing existing invoice
  useEffect(() => {
    if (invoice) {
      setFormData({
        client_id: invoice.client_id || '',
        issue_date: invoice.issue_date ? new Date(invoice.issue_date).toISOString().split('T')[0] : formData.issue_date,
        due_date: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : formData.due_date,
        payment_terms: invoice.payment_terms || 'net_30',
        tax_rate: invoice.tax_rate || 10,
        discount_amount: invoice.discount_amount || 0,
        notes: invoice.notes || '',
        terms_conditions: invoice.terms_conditions || formData.terms_conditions,
        billing_address: invoice.billing_address || '',
        billing_email: invoice.billing_email || '',
        billing_phone: invoice.billing_phone || '',
      })
      
      if (invoice.items && invoice.items.length > 0) {
        setItems(invoice.items.map((item: any) => ({
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          tax_rate: item.tax_rate || 10,
          total_price: item.total_price || 0
        })))
      }
    }
  }, [invoice])

  const loadClients = async () => {
    try {
      const response = await usersAPI.getUsers({ role: 'client', limit: 100 })
      setClients(response.users || response.data || [])
    } catch (error) {
      console.error('Failed to load clients:', error)
    }
  }

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Recalculate total price for this item
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total_price = calculateItemTotal(
        newItems[index].quantity,
        newItems[index].unit_price
      )
    }
    
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, {
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: formData.tax_rate,
      total_price: 0
    }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
    const taxAmount = (formData.tax_rate / 100) * subtotal
    const total = subtotal + taxAmount - formData.discount_amount
    
    return {
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const totals = calculateTotals()
    const invoiceData = {
      ...formData,
      items: items.filter(item => item.description.trim() !== ''),
      subtotal: parseFloat(totals.subtotal),
      tax_amount: parseFloat(totals.taxAmount),
      total_amount: parseFloat(totals.total)
    }
    
    onSubmit(invoiceData)
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <div className="max-w-4xl mx-auto bg-granite-800 shadow-xl rounded-lg border border-granite-700">
      <div className="px-6 py-4 border-b border-granite-700">
        <h3 className="text-lg font-medium text-white">
          {invoice ? 'Edit Invoice' : 'Create New Invoice'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Client and Dates Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <UserIcon className="w-4 h-4 inline mr-2" />
              Client
            </label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName} ({client.email})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Terms
            </label>
            <select
              value={formData.payment_terms}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value as any }))}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="due_on_receipt">Due on Receipt</option>
              <option value="net_15">Net 15 Days</option>
              <option value="net_30">Net 30 Days</option>
              <option value="net_45">Net 45 Days</option>
              <option value="net_60">Net 60 Days</option>
            </select>
          </div>

          {/* Issue Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
              Issue Date
            </label>
            <input
              type="date"
              value={formData.issue_date}
              onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
              Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
        </div>

        {/* Billing Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Billing Email
            </label>
            <input
              type="email"
              value={formData.billing_email}
              onChange={(e) => setFormData(prev => ({ ...prev, billing_email: e.target.value }))}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="client@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Billing Phone
            </label>
            <input
              type="tel"
              value={formData.billing_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, billing_phone: e.target.value }))}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.tax_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Billing Address
          </label>
          <textarea
            value={formData.billing_address}
            onChange={(e) => setFormData(prev => ({ ...prev, billing_address: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Street address, City, State, ZIP Code"
          />
        </div>

        {/* Invoice Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-white">Invoice Items</h4>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-amber-800 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 active:bg-green-700 transition-colors duration-200"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end p-4 bg-granite-700 rounded-lg border border-granite-600">
                <div className="col-span-5">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full px-2 py-1 bg-granite-600 border border-granite-500 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    placeholder="Service or product description"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 bg-granite-600 border border-granite-500 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-granite-600 border border-granite-500 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Total
                  </label>
                  <div className="px-2 py-1 bg-granite-600 border border-granite-500 rounded text-white text-sm font-medium">
                    ${item.total_price.toFixed(2)}
                  </div>
                </div>

                <div className="col-span-1">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1 text-red-400 hover:text-red-300 focus:outline-none"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <div className="bg-granite-700 rounded-lg p-4 border border-granite-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Discount Amount
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-10 pr-3 py-2 bg-granite-600 border border-granite-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax ({formData.tax_rate}%):</span>
                <span>${taxAmount}</span>
              </div>
              {formData.discount_amount > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Discount:</span>
                  <span>-${formData.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-lg border-t border-granite-600 pt-2">
                <span>Total:</span>
                <span>${total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Additional notes for the client..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Terms & Conditions
            </label>
            <textarea
              value={formData.terms_conditions}
              onChange={(e) => setFormData(prev => ({ ...prev, terms_conditions: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Payment terms and conditions..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-granite-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-granite-600 rounded-md text-gray-300 hover:text-white hover:border-granite-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed active:bg-green-700 transition-colors duration-200"
          >
            {isLoading ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
          </button>
        </div>
      </form>
    </div>
  )
}