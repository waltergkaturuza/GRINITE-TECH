'use client'

import { 
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

export default function InvoicesPage() {
  const invoices = [
    {
      id: 'INV-001',
      client: 'TechCorp Solutions',
      amount: '$2,500',
      status: 'Paid',
      date: '2025-09-15',
      dueDate: '2025-10-15'
    },
    {
      id: 'INV-002', 
      client: 'Innovate LLC',
      amount: '$5,000',
      status: 'Pending',
      date: '2025-09-28',
      dueDate: '2025-10-28'
    },
    {
      id: 'INV-003',
      client: 'StartupXYZ',
      amount: '$3,500', 
      status: 'Draft',
      date: '2025-10-01',
      dueDate: '2025-11-01'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="mt-2 text-sm text-gray-300">
            Manage your invoices and billing
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-900 hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-granite-800 overflow-hidden shadow rounded-lg border border-granite-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Total Invoices</dt>
                  <dd className="text-lg font-medium text-white">{invoices.length}</dd>
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
                  <dd className="text-lg font-medium text-white">$11,000</dd>
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
                  <dd className="text-lg font-medium text-white">1</dd>
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
                  <dd className="text-lg font-medium text-white">1</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-white mb-4">Recent Invoices</h3>
          
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-granite-600">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-granite-600">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-granite-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{invoice.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{invoice.client}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{invoice.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === 'Paid' ? 'bg-green-900 text-green-200' :
                        invoice.status === 'Pending' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-gray-700 text-gray-200'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{invoice.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-400 hover:text-blue-300 mr-3">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-green-400 hover:text-green-300 mr-3">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                      <button className="text-yellow-400 hover:text-yellow-300">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}