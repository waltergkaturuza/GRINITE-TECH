'use client'

import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { invoicesAPI } from '../../../lib/api'
import InvoiceForm from '../../../components/invoices/InvoiceForm'
import InvoiceView from '../../../components/invoices/InvoiceView'
import InvoiceActions from '../../../components/invoices/InvoiceActions'

interface InvoiceStats {
  total_invoices: number
  total_revenue: number
  paid_invoices: number
  pending_invoices: number
  draft_invoices: number
  overdue_invoices: number
  monthly_revenue: number
  monthly_growth: number
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [stats, setStats] = useState<InvoiceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showView, setShowView] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [openForPrint, setOpenForPrint] = useState(false)
  const [activeTab, setActiveTab] = useState<'invoices' | 'quotations'>('invoices')
  
  // Filters and pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  useEffect(() => {
    loadInvoices()
    loadStats()
  }, [currentPage, statusFilter, activeTab, searchTerm])

  const loadInvoices = async () => {
    setIsLoading(true)
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        documentType: activeTab === 'quotations' ? 'quotation' : 'invoice'
      }
      
      if (statusFilter) params.status = statusFilter
      if (searchTerm.trim()) params.search = searchTerm.trim()

      const response = await invoicesAPI.getInvoices(params)
      setInvoices(response.invoices || [])
      setTotalCount(response.total || 0)
    } catch (error) {
      console.error('Failed to load invoices:', error)
      setInvoices([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await invoicesAPI.getInvoiceStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleCreateInvoice = async (invoiceData: any) => {
    setIsFormLoading(true)
    try {
      await invoicesAPI.createInvoice(invoiceData)
      setShowForm(false)
      setSelectedInvoice(null)
      loadInvoices()
      loadStats()
    } catch (error) {
      console.error('Failed to create invoice:', error)
      alert('Failed to create invoice. Please try again.')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleUpdateInvoice = async (invoiceData: any) => {
    if (!selectedInvoice) return
    
    setIsFormLoading(true)
    try {
      await invoicesAPI.updateInvoice(selectedInvoice.id, invoiceData)
      setShowForm(false)
      setSelectedInvoice(null)
      loadInvoices()
      loadStats()
    } catch (error) {
      console.error('Failed to update invoice:', error)
      alert('Failed to update invoice. Please try again.')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleDeleteInvoice = async (invoiceId: number) => {
    try {
      await invoicesAPI.deleteInvoice(invoiceId)
      loadInvoices()
      loadStats()
    } catch (error) {
      console.error('Failed to delete invoice:', error)
      alert('Failed to delete invoice. Please try again.')
    }
  }

  const handleStatusUpdate = (invoiceId: number, newStatus: string) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? { ...invoice, status: newStatus }
        : invoice
    ))
    loadStats()
  }

  const handleEditInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setShowForm(true)
  }

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setShowView(true)
  }

  const filteredInvoices = invoices

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handleDownloadPDF = (inv: any) => {
    setSelectedInvoice(inv)
    setOpenForPrint(true)
    setShowView(true)
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <InvoiceForm
          invoice={selectedInvoice}
          onSubmit={selectedInvoice ? handleUpdateInvoice : handleCreateInvoice}
          onCancel={() => {
            setShowForm(false)
            setSelectedInvoice(null)
          }}
          isLoading={isFormLoading}
          documentType={selectedInvoice?.document_type || (activeTab === 'quotations' ? 'quotation' : 'invoice')}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices & Quotations</h1>
          <p className="mt-2 text-sm text-gray-300">
            Manage invoices, quotations and billing
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button 
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-800 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 active:bg-green-700 transition-colors duration-200"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            {activeTab === 'quotations' ? 'Create Quotation' : 'Create Invoice'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-granite-600">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => { setActiveTab('invoices'); setCurrentPage(1) }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Invoice History
          </button>
          <button
            onClick={() => { setActiveTab('quotations'); setCurrentPage(1) }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quotations'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Quotations
          </button>
        </nav>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-granite-800 overflow-hidden shadow rounded-lg border border-granite-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-300 truncate">Total Invoices</dt>
                    <dd className="text-lg font-medium text-white">{stats.total_invoices}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-granite-800 overflow-hidden shadow rounded-lg border border-granite-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-300 truncate">Total Revenue</dt>
                    <dd className="text-lg font-medium text-white">{formatCurrency(stats.total_revenue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-granite-800 overflow-hidden shadow rounded-lg border border-granite-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-300 truncate">Paid</dt>
                    <dd className="text-lg font-medium text-white">{stats.paid_invoices}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-granite-800 overflow-hidden shadow rounded-lg border border-granite-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-300 truncate">Pending</dt>
                    <dd className="text-lg font-medium text-white">{stats.pending_invoices}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-granite-800 shadow rounded-lg border border-granite-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="flex gap-2 md:col-span-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search by number, client...`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearchTerm(searchInput)}
                className="w-full pl-10 pr-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <button
              onClick={() => setSearchTerm(searchInput)}
              className="px-4 py-2 bg-granite-600 hover:bg-granite-500 text-white rounded-md"
            >
              Search
            </button>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-granite-700 border border-granite-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center text-gray-300">
            <span className="text-sm">
              Showing {filteredInvoices.length} of {totalCount} {activeTab}
            </span>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-white mb-4">
            {statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} ` : 'All '}
            {activeTab === 'quotations' ? 'Quotations' : 'Invoices'}
          </h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="text-gray-300 mt-2">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No {activeTab} found</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-800 hover:bg-green-600 active:bg-green-700 transition-colors duration-200"
              >
                <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                Create {activeTab === 'quotations' ? 'Your First Quotation' : 'Your First Invoice'}
              </button>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-granite-600">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Issue Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-granite-600">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-granite-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div>
                          <div className="font-medium">
                            {invoice.client?.firstName} {invoice.client?.lastName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {invoice.client?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 hidden md:table-cell">
                        {invoice.project?.title || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(invoice.issue_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(invoice.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <InvoiceActions
                          invoice={invoice}
                          onEdit={handleEditInvoice}
                          onView={handleViewInvoice}
                          onDelete={handleDeleteInvoice}
                          onStatusUpdate={handleStatusUpdate}
                          onDownloadPDF={handleDownloadPDF}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-granite-600 pt-6 mt-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-granite-600 text-sm font-medium rounded-md text-gray-300 bg-granite-800 hover:bg-granite-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-granite-600 text-sm font-medium rounded-md text-gray-300 bg-granite-800 hover:bg-granite-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    Showing{' '}
                    <span className="font-medium">
                      {((currentPage - 1) * itemsPerPage) + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalCount)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{totalCount}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-granite-600 bg-granite-800 text-sm font-medium text-gray-300 hover:bg-granite-700 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1
                      if (page === currentPage || Math.abs(page - currentPage) <= 2) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-green-600 border-green-600 text-white'
                                : 'bg-granite-800 border-granite-600 text-gray-300 hover:bg-granite-700'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      }
                      return null
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-granite-600 bg-granite-800 text-sm font-medium text-gray-300 hover:bg-granite-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice View Modal */}
      {showView && selectedInvoice && (
        <InvoiceView
          invoice={selectedInvoice}
          autoPrint={openForPrint}
          onClose={() => {
            setShowView(false)
            setSelectedInvoice(null)
            setOpenForPrint(false)
          }}
          onEdit={() => {
            setShowView(false)
            setShowForm(true)
            setOpenForPrint(false)
          }}
        />
      )}
    </div>
  )
}