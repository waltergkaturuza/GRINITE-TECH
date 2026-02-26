'use client'

import { useState, useEffect } from 'react'
import { 
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  UserCircleIcon,
  BriefcaseIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usersAPI, projectsAPI, invoicesAPI } from '@/lib/api'

interface Client {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  company?: string
  companyAddress?: string
  billingAddress?: string
  taxId?: string
  website?: string
  jobTitle?: string
  role: string
  status: string
  avatar?: string
  emailVerified: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  projects?: any[]
  payments?: any[]
}

type ViewMode = 'grid' | 'list'
type SortField = 'firstName' | 'lastName' | 'company' | 'createdAt' | 'status'
type SortOrder = 'asc' | 'desc'

export default function ClientsPage() {
  // State Management
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('firstName')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [viewModalProjects, setViewModalProjects] = useState<any[]>([])
  const [viewModalRevenue, setViewModalRevenue] = useState<{ totalRevenue: number; paidCount: number; pendingAmount: number } | null>(null)
  const [viewModalLoading, setViewModalLoading] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    companyAddress: '',
    billingAddress: '',
    taxId: '',
    website: '',
    jobTitle: '',
    role: 'client',
    status: 'active',
    password: '',
    confirmPassword: ''
  })

  // Load Clients
  useEffect(() => {
    loadClients()
  }, [])

  // Filter and Sort Clients
  useEffect(() => {
    let filtered = [...clients]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(client =>
        (client.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.company || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(client => client.status === selectedStatus)
    }

    // Role filter  
    if (selectedRole !== 'all') {
      filtered = filtered.filter(client => client.role === selectedRole)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField] || ''
      let bValue: any = b[sortField] || ''

      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredClients(filtered)
    setCurrentPage(1)
  }, [clients, searchQuery, selectedStatus, selectedRole, sortField, sortOrder])

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await usersAPI.getUsers()
      // Filter only clients and exclude admin users
      const clientUsers = data.filter((user: Client) => user.role === 'client' || user.role === 'developer')
      setClients(clientUsers)
    } catch (err: any) {
      setError('Failed to load clients')
      console.error('Error loading clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async () => {
    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }

      const clientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || '',
        company: formData.company || '',
        companyAddress: formData.companyAddress || undefined,
        billingAddress: formData.billingAddress || undefined,
        taxId: formData.taxId || undefined,
        website: formData.website || undefined,
        jobTitle: formData.jobTitle || undefined,
        role: formData.role,
        status: formData.status,
        password: formData.password
      }
      
      await usersAPI.create(clientData)
      await loadClients()
      setIsCreateModalOpen(false)
      resetForm()
    } catch (err: any) {
      setError('Failed to create client')
      console.error('Error creating client:', err)
    }
  }

  const handleEditClient = async () => {
    if (!selectedClient) return
    
    try {
      const clientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || '',
        company: formData.company || '',
        companyAddress: formData.companyAddress || undefined,
        billingAddress: formData.billingAddress || undefined,
        taxId: formData.taxId || undefined,
        website: formData.website || undefined,
        jobTitle: formData.jobTitle || undefined,
        role: formData.role,
        status: formData.status
      }
      
      await usersAPI.update(selectedClient.id, clientData)
      await loadClients()
      setIsEditModalOpen(false)
      setSelectedClient(null)
      resetForm()
    } catch (err: any) {
      setError('Failed to update client')
      console.error('Error updating client:', err)
    }
  }

  const handleDeleteClient = async () => {
    if (!selectedClient) return
    
    try {
      await usersAPI.delete(selectedClient.id)
      await loadClients()
      setIsDeleteModalOpen(false)
      setSelectedClient(null)
    } catch (err: any) {
      setError('Failed to delete client')
      console.error('Error deleting client:', err)
    }
  }

  const openEditModal = (client: Client) => {
    setSelectedClient(client)
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      companyAddress: client.companyAddress || '',
      billingAddress: client.billingAddress || '',
      taxId: client.taxId || '',
      website: client.website || '',
      jobTitle: client.jobTitle || '',
      role: client.role,
      status: client.status,
      password: '',
      confirmPassword: ''
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (client: Client) => {
    setSelectedClient(client)
    setIsDeleteModalOpen(true)
  }

  const openViewModal = (client: Client) => {
    setSelectedClient(client)
    setViewModalProjects([])
    setViewModalRevenue(null)
    setIsViewModalOpen(true)
  }

  // Load projects and revenue when View modal opens
  useEffect(() => {
    if (!isViewModalOpen || !selectedClient?.id) return
    let cancelled = false
    setViewModalLoading(true)
    Promise.all([
      projectsAPI.getProjects({ clientId: selectedClient.id, limit: 50 }),
      invoicesAPI.getClientRevenue(selectedClient.id).catch(() => ({ totalRevenue: 0, paidCount: 0, pendingAmount: 0 }))
    ]).then(([projectsRes, revenue]) => {
      if (cancelled) return
      const projects = projectsRes?.data ?? projectsRes?.projects ?? (Array.isArray(projectsRes) ? projectsRes : [])
      setViewModalProjects(Array.isArray(projects) ? projects : [])
      setViewModalRevenue(revenue as { totalRevenue: number; paidCount: number; pendingAmount: number })
      setViewModalLoading(false)
    }).catch(() => {
      if (!cancelled) setViewModalLoading(false)
    })
    return () => { cancelled = true }
  }, [isViewModalOpen, selectedClient?.id])

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      companyAddress: '',
      billingAddress: '',
      taxId: '',
      website: '',
      jobTitle: '',
      role: 'client',
      status: 'active',
      password: '',
      confirmPassword: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900 text-green-200'
      case 'inactive': return 'bg-amber-800 text-amber-200'
      case 'suspended': return 'bg-red-900 text-red-200'
      default: return 'bg-gray-700 text-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client': return '👤'
      case 'developer': return '👨‍💻'
      case 'admin': return '👑'
      default: return '👤'
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentClients = filteredClients.slice(startIndex, endIndex)

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    companies: new Set(clients.filter(c => c.company).map(c => c.company)).size,
    verified: clients.filter(c => c.emailVerified).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Client Management</h1>
          <p className="mt-2 text-sm text-gray-300">
            Manage your clients with comprehensive contact and project tracking
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-800 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors active:bg-green-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Client
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-900/20 border border-red-900/50 text-red-200 px-4 py-3 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-100 truncate">Total Clients</dt>
                  <dd className="text-lg font-medium text-white">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-green-100 truncate">Active Clients</dt>
                  <dd className="text-lg font-medium text-white">{stats.active}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-purple-100 truncate">Companies</dt>
                  <dd className="text-lg font-medium text-white">{stats.companies}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EnvelopeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-yellow-100 truncate">Verified</dt>
                  <dd className="text-lg font-medium text-white">{stats.verified}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-granite-600 rounded-md leading-5 bg-granite-700 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-granite-600 rounded-md text-sm bg-granite-700 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="all">All Roles</option>
                <option value="client">Client</option>
                <option value="developer">Developer</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-granite-600 rounded-md text-sm bg-granite-700 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>

              {/* Sort */}
              <select
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortField(field as SortField)
                  setSortOrder(order as SortOrder)
                }}
                className="px-3 py-2 border border-granite-600 rounded-md text-sm bg-granite-700 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="firstName-asc">First Name A-Z</option>
                <option value="firstName-desc">First Name Z-A</option>
                <option value="lastName-asc">Last Name A-Z</option>
                <option value="lastName-desc">Last Name Z-A</option>
                <option value="company-asc">Company A-Z</option>
                <option value="company-desc">Company Z-A</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-granite-600 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'list'
                      ? 'bg-green-600 text-white'
                      : 'bg-granite-700 text-gray-300 hover:bg-granite-600'
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'grid'
                      ? 'bg-green-600 text-white'
                      : 'bg-granite-700 text-gray-300 hover:bg-granite-600'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clients List/Grid */}
      <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-white mb-4">
            Client List ({filteredClients.length})
          </h3>
          
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-granite-600">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-granite-600">
                {currentClients.map((client) => (
                  <tr key={client.id} className="hover:bg-granite-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {client.avatar ? (
                            <img className="h-10 w-10 rounded-full" src={client.avatar} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-amber-800 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {client.firstName} {client.lastName}
                          </div>
                          <div className="text-sm text-gray-400">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{client.phone || 'N/A'}</div>
                      <div className="text-xs text-gray-400">
                        {client.emailVerified ? '✅ Verified' : '❌ Unverified'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{client.company || 'Independent'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getRoleIcon(client.role)}</span>
                        <span className="text-sm text-gray-300 capitalize">{client.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openViewModal(client)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(client)}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(client)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-white">No clients found</h3>
              <p className="mt-1 text-sm text-gray-400">
                {searchQuery || selectedRole !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by adding your first client.'}
              </p>
              {(!searchQuery && selectedRole === 'all' && selectedStatus === 'all') && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-800 hover:bg-green-600 active:bg-green-700 transition-colors"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add Client
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Client Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center py-10">
          <div className="relative w-full max-w-2xl mx-auto p-6 border border-granite-600 shadow-xl rounded-lg bg-granite-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Client</h3>
              <button onClick={() => { setIsCreateModalOpen(false); resetForm() }} className="text-gray-400 hover:text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First name *"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Last name *"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email address *"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Business / invoicing details</label>
                <div className="space-y-4 border border-granite-600 rounded-lg p-4 bg-granite-900/50">
                  <input
                    type="text"
                    placeholder="Company name"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                  />
                  <textarea
                    placeholder="Company address"
                    rows={2}
                    value={formData.companyAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                    className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                  />
                  <textarea
                    placeholder="Billing address (for invoices/quotations)"
                    rows={2}
                    value={formData.billingAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, billingAddress: e.target.value }))}
                    className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Tax ID / VAT number"
                      value={formData.taxId}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                      className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                    />
                    <input
                      type="url"
                      placeholder="Website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                    />
                  </div>
                  {formData.role === 'developer' && (
                    <input
                      type="text"
                      placeholder="Job title / role"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white"
                >
                  <option value="client">Client</option>
                  <option value="developer">Developer</option>
                </select>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="Password *"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                />
                <input
                  type="password"
                  placeholder="Confirm password *"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateClient}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  Create Client
                </button>
                <button
                  onClick={() => { setIsCreateModalOpen(false); resetForm() }}
                  className="flex-1 bg-granite-600 hover:bg-granite-500 text-white py-2.5 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center py-10">
          <div className="relative w-full max-w-2xl mx-auto p-6 border border-granite-600 shadow-xl rounded-lg bg-granite-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Client</h3>
              <button onClick={() => { setIsEditModalOpen(false); setSelectedClient(null); resetForm() }} className="text-gray-400 hover:text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First name *"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Last name *"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email address *"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Business / invoicing details</label>
                <div className="space-y-4 border border-granite-600 rounded-lg p-4 bg-granite-900/50">
                  <input
                    type="text"
                    placeholder="Company name"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                  />
                  <textarea
                    placeholder="Company address"
                    rows={2}
                    value={formData.companyAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                    className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                  />
                  <textarea
                    placeholder="Billing address (for invoices/quotations)"
                    rows={2}
                    value={formData.billingAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, billingAddress: e.target.value }))}
                    className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Tax ID / VAT number"
                      value={formData.taxId}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                      className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                    />
                    <input
                      type="url"
                      placeholder="Website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                    />
                  </div>
                  {formData.role === 'developer' && (
                    <input
                      type="text"
                      placeholder="Job title / role"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white"
                >
                  <option value="client">Client</option>
                  <option value="developer">Developer</option>
                </select>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEditClient}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  Update Client
                </button>
                <button
                  onClick={() => { setIsEditModalOpen(false); setSelectedClient(null); resetForm() }}
                  className="flex-1 bg-granite-600 hover:bg-granite-500 text-white py-2.5 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Client Modal */}
      {isDeleteModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-granite-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white">Delete Client</h3>
              <p className="mt-2 text-sm text-gray-300">
                Are you sure you want to delete "{selectedClient.firstName} {selectedClient.lastName}"? This action cannot be undone.
              </p>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={handleDeleteClient}
                  className="flex-1 bg-red-900 hover:bg-red-800 text-white py-2 px-4 rounded transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setSelectedClient(null)
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {isViewModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-gray-900/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center py-10">
          <div className="relative w-full max-w-3xl mx-auto p-6 border border-granite-600 shadow-xl rounded-lg bg-granite-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Client Profile</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
              {/* Header: Avatar, name, role, status */}
              <div className="flex items-center gap-4 pb-4 border-b border-granite-600">
                <div className="flex-shrink-0">
                  {selectedClient.avatar ? (
                    <img className="h-16 w-16 rounded-full object-cover" src={selectedClient.avatar} alt="" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-amber-700 flex items-center justify-center">
                      <span className="text-white text-xl font-semibold">
                        {selectedClient.firstName?.charAt(0)}{selectedClient.lastName?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white">
                    {selectedClient.firstName} {selectedClient.lastName}
                  </h4>
                  <p className="text-gray-300">{selectedClient.email}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(selectedClient.status)}`}>
                      {selectedClient.status}
                    </span>
                    <span className="text-sm text-gray-400">
                      {getRoleIcon(selectedClient.role)} {selectedClient.role}
                    </span>
                    {selectedClient.jobTitle && (
                      <span className="text-sm text-amber-400">• {selectedClient.jobTitle}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Revenue & Projects summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-granite-700/80 border border-granite-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ChartBarIcon className="h-5 w-5 text-amber-400" />
                    <h5 className="text-sm font-medium text-gray-300">Revenue Overview</h5>
                  </div>
                  {viewModalLoading ? (
                    <p className="text-sm text-gray-500">Loading…</p>
                  ) : viewModalRevenue ? (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Revenue</span>
                        <span className="text-white font-medium">
                          $ {Number(viewModalRevenue.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Paid Invoices</span>
                        <span className="text-green-400">{viewModalRevenue.paidCount ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pending Amount</span>
                        <span className="text-amber-400">
                          $ {Number(viewModalRevenue.pendingAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No revenue data</p>
                  )}
                </div>
                <div className="bg-granite-700/80 border border-granite-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BriefcaseIcon className="h-5 w-5 text-amber-400" />
                    <h5 className="text-sm font-medium text-gray-300">Projects</h5>
                  </div>
                  {viewModalLoading ? (
                    <p className="text-sm text-gray-500">Loading…</p>
                  ) : (
                    <>
                      <p className="text-white font-medium">{viewModalProjects.length} project{viewModalProjects.length !== 1 ? 's' : ''}</p>
                      {viewModalProjects.length > 0 && (
                        <Link
                          href="/dashboard/projects"
                          className="text-sm text-amber-400 hover:text-amber-300 mt-2 inline-block"
                        >
                          View all projects →
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Projects list */}
              {viewModalProjects.length > 0 && (
                <div className="bg-granite-700/50 border border-granite-600 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <DocumentDuplicateIcon className="h-4 w-4" />
                    Associated Projects
                  </h5>
                  <ul className="space-y-2">
                    {viewModalProjects.slice(0, 8).map((p: any) => (
                      <li key={p.id} className="flex items-center justify-between py-2 border-b border-granite-600 last:border-0">
                        <Link href={`/dashboard/projects/${p.id}`} className="text-white hover:text-amber-400 truncate">
                          {p.title}
                        </Link>
                        <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'active' ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                          {p.status ?? 'N/A'}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {viewModalProjects.length > 8 && (
                    <Link href="/dashboard/projects" className="text-sm text-amber-400 hover:text-amber-300 mt-2 inline-block">
                      +{viewModalProjects.length - 8} more
                    </Link>
                  )}
                </div>
              )}

              {/* Contact & Business info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-granite-700/80 border border-granite-600 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <UserCircleIcon className="h-4 w-4" />
                    Contact
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-white">{selectedClient.email}</span>
                      {selectedClient.emailVerified && <span className="text-green-400 text-xs">✓</span>}
                    </div>
                    {selectedClient.phone && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-white">{selectedClient.phone}</span>
                      </div>
                    )}
                    {selectedClient.website && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 flex-shrink-0">Web</span>
                        <a href={selectedClient.website} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline truncate">
                          {selectedClient.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-granite-700/80 border border-granite-600 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <BuildingOfficeIcon className="h-4 w-4" />
                    Business
                  </h5>
                  <div className="space-y-2 text-sm">
                    {selectedClient.company && <p className="text-white">{selectedClient.company}</p>}
                    {selectedClient.companyAddress && <p className="text-gray-300">{selectedClient.companyAddress}</p>}
                    {selectedClient.billingAddress && (
                      <p className="text-gray-400 text-xs">
                        <span className="text-gray-500">Billing:</span> {selectedClient.billingAddress}
                      </p>
                    )}
                    {selectedClient.taxId && (
                      <p className="text-gray-400">
                        <span className="text-gray-500">Tax ID:</span> {selectedClient.taxId}
                      </p>
                    )}
                    {!selectedClient.company && !selectedClient.companyAddress && !selectedClient.billingAddress && !selectedClient.taxId && (
                      <p className="text-gray-500">No business details</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account info */}
              <div className="bg-granite-700/50 border border-granite-600 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Account
                </h5>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span><span className="text-gray-500">Joined:</span> {new Date(selectedClient.createdAt).toLocaleDateString()}</span>
                  <span><span className="text-gray-500">Updated:</span> {new Date(selectedClient.updatedAt).toLocaleDateString()}</span>
                  {selectedClient.lastLoginAt && <span><span className="text-gray-500">Last login:</span> {new Date(selectedClient.lastLoginAt).toLocaleDateString()}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setIsViewModalOpen(false); openEditModal(selectedClient) }}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  Edit Client
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="flex-1 bg-granite-600 hover:bg-granite-500 text-white py-2.5 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}