'use client'

import { useState } from 'react'
import { 
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

export default function ClientsPage() {
  const [clients, setClients] = useState([
    {
      id: 1,
      name: 'TechCorp Solutions',
      contact: 'John Smith',
      email: 'john@techcorp.com',
      phone: '+1 (555) 123-4567',
      projects: 3,
      status: 'Active',
      lastContact: '2025-10-01'
    },
    {
      id: 2,
      name: 'Innovate LLC',
      contact: 'Sarah Johnson',
      email: 'sarah@innovate.com',
      phone: '+1 (555) 234-5678',
      projects: 2,
      status: 'Active',
      lastContact: '2025-09-28'
    },
    {
      id: 3,
      name: 'StartupXYZ',
      contact: 'Mike Chen',
      email: 'mike@startupxyz.com',
      phone: '+1 (555) 345-6789',
      projects: 1,
      status: 'Prospect',
      lastContact: '2025-09-25'
    }
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="mt-2 text-sm text-gray-300">
            Manage your client relationships
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-900 hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Client
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-granite-800 overflow-hidden shadow rounded-lg border border-granite-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Total Clients</dt>
                  <dd className="text-lg font-medium text-white">{clients.length}</dd>
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
                  <dt className="text-sm font-medium text-gray-300 truncate">Active</dt>
                  <dd className="text-lg font-medium text-white">2</dd>
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
                  <dt className="text-sm font-medium text-gray-300 truncate">Prospects</dt>
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
                  <dt className="text-sm font-medium text-gray-300 truncate">Total Projects</dt>
                  <dd className="text-lg font-medium text-white">6</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <h3 className="text-lg leading-6 font-medium text-white">Client List</h3>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="block w-full pl-10 pr-3 py-2 border border-granite-600 rounded-md leading-5 bg-granite-700 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-granite-600">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Projects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-granite-600">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-granite-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{client.name}</div>
                        <div className="text-sm text-gray-400">{client.contact}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          {client.email}
                        </div>
                        <div className="flex items-center mt-1">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{client.projects}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        client.status === 'Active' ? 'bg-green-900 text-green-200' : 'bg-blue-900 text-blue-200'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{client.lastContact}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-yellow-400 hover:text-yellow-300 mr-3">Edit</button>
                      <button className="text-blue-400 hover:text-blue-300 mr-3">Contact</button>
                      <button className="text-red-400 hover:text-red-300">Archive</button>
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