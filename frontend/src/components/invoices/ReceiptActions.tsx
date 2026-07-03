'use client'

import { useState } from 'react'
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { invoicesAPI } from '../../lib/api'

interface ReceiptActionsProps {
  receipt: any
  onEdit: (receipt: any) => void
  onView: (receipt: any) => void
  onDelete: (receiptId: number) => void
  onDownload?: (receipt: any) => void
  className?: string
}

export default function ReceiptActions({
  receipt,
  onEdit,
  onView,
  onDelete,
  onDownload,
  className = '',
}: ReceiptActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDuplicate = async () => {
    setIsLoading(true)
    try {
      const duplicated = await invoicesAPI.duplicateInvoice(receipt.id)
      onEdit(duplicated)
    } catch (error) {
      console.error('Failed to duplicate receipt:', error)
      alert('Failed to duplicate receipt. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
        <CheckCircleIcon className="w-3 h-3 mr-1" />
        {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
      </span>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onView(receipt)}
          className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
          title="View Receipt"
        >
          <EyeIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => onEdit(receipt)}
          className="p-1 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 rounded transition-colors"
          title="Edit Receipt"
        >
          <PencilIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => (onDownload ? onDownload(receipt) : onView(receipt))}
          className="p-1 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded transition-colors"
          title="Download Receipt"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
        </button>

        <button
          onClick={handleDuplicate}
          disabled={isLoading}
          className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 rounded transition-colors disabled:opacity-50"
          title="Duplicate Receipt"
        >
          <DocumentDuplicateIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this receipt?')) {
              onDelete(receipt.id)
            }
          }}
          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
          title="Delete Receipt"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
