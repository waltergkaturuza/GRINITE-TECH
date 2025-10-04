'use client'

import { useState } from 'react'
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { invoicesAPI } from '../../lib/api'

interface InvoiceActionsProps {
  invoice: any
  onEdit: (invoice: any) => void
  onView: (invoice: any) => void
  onDelete: (invoiceId: number) => void
  onStatusUpdate: (invoiceId: number, status: string) => void
  className?: string
}

export default function InvoiceActions({ 
  invoice, 
  onEdit, 
  onView, 
  onDelete, 
  onStatusUpdate,
  className = ''
}: InvoiceActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSendInvoice = async () => {
    if (invoice.status !== 'draft') return
    
    setIsLoading(true)
    try {
      await invoicesAPI.sendInvoice(invoice.id)
      onStatusUpdate(invoice.id, 'sent')
    } catch (error) {
      console.error('Failed to send invoice:', error)
      alert('Failed to send invoice. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDuplicate = async () => {
    setIsLoading(true)
    try {
      const duplicatedInvoice = await invoicesAPI.duplicateInvoice(invoice.id)
      // Navigate to edit the duplicated invoice
      onEdit(duplicatedInvoice)
    } catch (error) {
      console.error('Failed to duplicate invoice:', error)
      alert('Failed to duplicate invoice. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsPaid = async () => {
    setIsLoading(true)
    try {
      await invoicesAPI.updateInvoiceStatus(invoice.id, {
        status: 'paid',
        payment_date: new Date().toISOString(),
        payment_method: 'Manual Entry'
      })
      onStatusUpdate(invoice.id, 'paid')
    } catch (error) {
      console.error('Failed to mark invoice as paid:', error)
      alert('Failed to update invoice status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    // In a real implementation, this would generate and download a PDF
    // For now, we'll just show an alert
    alert('PDF download functionality would be implemented here')
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

  const canEdit = invoice.status === 'draft'
  const canSend = invoice.status === 'draft'
  const canMarkPaid = invoice.status === 'sent' || invoice.status === 'overdue'
  const canDelete = invoice.status !== 'paid'

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Status Badge */}
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
        {invoice.status === 'paid' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
        {invoice.status === 'sent' && <ClockIcon className="w-3 h-3 mr-1" />}
        {invoice.status === 'overdue' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
      </span>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1">
        {/* View Button */}
        <button
          onClick={() => onView(invoice)}
          className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
          title="View Invoice"
        >
          <EyeIcon className="w-4 h-4" />
        </button>

        {/* Edit Button */}
        {canEdit && (
          <button
            onClick={() => onEdit(invoice)}
            className="p-1 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 rounded transition-colors"
            title="Edit Invoice"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        )}

        {/* Send Button */}
        {canSend && (
          <button
            onClick={handleSendInvoice}
            disabled={isLoading}
            className="p-1 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded transition-colors disabled:opacity-50"
            title="Send Invoice"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        )}

        {/* Mark as Paid Button */}
        {canMarkPaid && (
          <button
            onClick={handleMarkAsPaid}
            disabled={isLoading}
            className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 rounded transition-colors disabled:opacity-50"
            title="Mark as Paid"
          >
            <CheckCircleIcon className="w-4 h-4" />
          </button>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="p-1 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded transition-colors"
          title="Download PDF"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
        </button>

        {/* Duplicate Button */}
        <button
          onClick={handleDuplicate}
          disabled={isLoading}
          className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 rounded transition-colors disabled:opacity-50"
          title="Duplicate Invoice"
        >
          <DocumentDuplicateIcon className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        {canDelete && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this invoice?')) {
                onDelete(invoice.id)
              }
            }}
            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
            title="Delete Invoice"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Quick Status Update Component
interface QuickStatusUpdateProps {
  invoice: any
  onStatusUpdate: (invoiceId: number, status: string) => void
}

export function QuickStatusUpdate({ invoice, onStatusUpdate }: QuickStatusUpdateProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)
    try {
      await invoicesAPI.updateInvoiceStatus(invoice.id, {
        status: newStatus as any,
        payment_date: newStatus === 'paid' ? new Date().toISOString() : undefined,
      })
      onStatusUpdate(invoice.id, newStatus)
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update invoice status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <select
      value={invoice.status}
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={isLoading}
      className="text-xs border-none bg-transparent focus:ring-0 focus:outline-none disabled:opacity-50"
    >
      <option value="draft">Draft</option>
      <option value="sent">Sent</option>
      <option value="paid">Paid</option>
      <option value="overdue">Overdue</option>
      <option value="cancelled">Cancelled</option>
    </select>
  )
}