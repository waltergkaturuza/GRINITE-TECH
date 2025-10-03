'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../components/Navigation'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Service {
  id: string
  title: string
  description: string
  category: string
  price: number
  features: string[]
  icon?: string
  status: 'active' | 'inactive' | 'draft'
  duration?: string
  currency?: string
  keyBenefits?: string[]
  targetMarket?: string[]
  deliverables?: string[]
  setupFee?: number
  monthlyFee?: number
  displayOrder: number
}

interface ServiceFormData {
  title: string
  description: string
  category: string
  price: number
  features: string[]
  icon?: string
  status: 'active' | 'inactive' | 'draft'
  duration?: string
  currency?: string
  keyBenefits?: string[]
  targetMarket?: string[]
  deliverables?: string[]
  setupFee?: number
  monthlyFee?: number
  displayOrder: number
}

const AVAILABLE_ICONS = [
  'ComputerDesktopIcon',
  'BuildingOfficeIcon', 
  'TruckIcon',
  'AcademicCapIcon',
  'HeartIcon',
  'MapIcon',
  'ChartBarIcon',
  'CogIcon',
  'LightBulbIcon',
  'CurrencyDollarIcon',
  'BeakerIcon'
]

const ICON_EMOJIS = {
  'ComputerDesktopIcon': '💻',
  'BuildingOfficeIcon': '🏢',
  'TruckIcon': '🚛',
  'AcademicCapIcon': '🎓',
  'HeartIcon': '❤️',
  'MapIcon': '🗺️',
  'ChartBarIcon': '📊',
  'CogIcon': '⚙️',
  'LightBulbIcon': '💡',
  'CurrencyDollarIcon': '💰',
  'BeakerIcon': '🧪'
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    category: '',
    price: 0,
    features: [],
    status: 'draft',
    currency: 'USD',
    displayOrder: 0
  })
  const [currentFeature, setCurrentFeature] = useState('')
  const [currentKeyBenefit, setCurrentKeyBenefit] = useState('')
  const [currentTargetMarket, setCurrentTargetMarket] = useState('')
  const [currentDeliverable, setCurrentDeliverable] = useState('')

  // Fetch services
  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      const response = await fetch(`${apiUrl}/services`)
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      const data = await response.json()
      if (data.success) {
        setServices(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch services')
      }
    } catch (err) {
      console.error('Error fetching services:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      const response = await fetch(`${apiUrl}/services/categories`)
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      const url = editingService
        ? `${apiUrl}/services/${editingService.id}`
        : `${apiUrl}/services`
      const method = editingService ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to save service')
      }

      const data = await response.json()
      if (data.success) {
        await fetchServices()
        resetForm()
        setShowModal(false)
      } else {
        throw new Error(data.message || 'Failed to save service')
      }
    } catch (err) {
      console.error('Error saving service:', err)
      setError(err instanceof Error ? err.message : 'Failed to save service')
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      const response = await fetch(`${apiUrl}/services/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete service')
      }

      const data = await response.json()
      if (data.success) {
        await fetchServices()
      } else {
        throw new Error(data.message || 'Failed to delete service')
      }
    } catch (err) {
      console.error('Error deleting service:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete service')
    }
  }

  // Handle edit
  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      features: [...service.features],
      icon: service.icon,
      status: service.status,
      duration: service.duration || '',
      currency: service.currency || 'USD',
      keyBenefits: [...(service.keyBenefits || [])],
      targetMarket: [...(service.targetMarket || [])],
      deliverables: [...(service.deliverables || [])],
      setupFee: service.setupFee || 0,
      monthlyFee: service.monthlyFee || 0,
      displayOrder: service.displayOrder
    })
    setShowModal(true)
  }

  // Reset form
  const resetForm = () => {
    setEditingService(null)
    setFormData({
      title: '',
      description: '',
      category: '',
      price: 0,
      features: [],
      status: 'draft',
      currency: 'USD',
      displayOrder: 0
    })
    setCurrentFeature('')
    setCurrentKeyBenefit('')
    setCurrentTargetMarket('')
    setCurrentDeliverable('')
  }

  // Add array item helpers
  const addFeature = () => {
    if (currentFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()]
      }))
      setCurrentFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const addKeyBenefit = () => {
    if (currentKeyBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        keyBenefits: [...(prev.keyBenefits || []), currentKeyBenefit.trim()]
      }))
      setCurrentKeyBenefit('')
    }
  }

  const removeKeyBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyBenefits: (prev.keyBenefits || []).filter((_, i) => i !== index)
    }))
  }

  const addTargetMarket = () => {
    if (currentTargetMarket.trim()) {
      setFormData(prev => ({
        ...prev,
        targetMarket: [...(prev.targetMarket || []), currentTargetMarket.trim()]
      }))
      setCurrentTargetMarket('')
    }
  }

  const removeTargetMarket = (index: number) => {
    setFormData(prev => ({
      ...prev,
      targetMarket: (prev.targetMarket || []).filter((_, i) => i !== index)
    }))
  }

  const addDeliverable = () => {
    if (currentDeliverable.trim()) {
      setFormData(prev => ({
        ...prev,
        deliverables: [...(prev.deliverables || []), currentDeliverable.trim()]
      }))
      setCurrentDeliverable('')
    }
  }

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: (prev.deliverables || []).filter((_, i) => i !== index)
    }))
  }

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || service.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crimson-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
      <Navigation />
      
      <div className="wide-container pt-24">
        <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-granite-900">Services Management</h1>
            <p className="text-granite-600">Manage your enterprise services and offerings</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="inline-flex items-center px-4 py-2 bg-crimson-600 text-white rounded-lg hover:bg-crimson-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Service
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-2 text-red-900 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-granite-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
          >
            <option value="All">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-granite-200">
            <thead className="bg-granite-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-granite-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-granite-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-granite-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-granite-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-granite-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-granite-200">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-granite-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-crimson-500 to-amber-500 rounded-lg flex items-center justify-center text-white text-lg mr-4">
                        {service.icon && ICON_EMOJIS[service.icon as keyof typeof ICON_EMOJIS] || '🚀'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-granite-900">{service.title}</div>
                        <div className="text-sm text-granite-500 truncate max-w-xs">{service.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-granite-100 text-granite-800 rounded-full">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-granite-900">
                    ${service.price.toLocaleString()} {service.currency || 'USD'}
                    {service.duration && <span className="text-granite-500">/{service.duration}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-crimson-600 hover:text-crimson-900 p-1"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-granite-500">No services found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit Service */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-granite-900">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-granite-400 hover:text-granite-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">
                      Service Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-granite-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-3 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="ZWL">ZWL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., month, year, one-time"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">
                      Setup Fee
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.setupFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, setupFee: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Icon and Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">
                      Icon
                    </label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                    >
                      <option value="">Select Icon</option>
                      {AVAILABLE_ICONS.map(icon => (
                        <option key={icon} value={icon}>
                          {ICON_EMOJIS[icon as keyof typeof ICON_EMOJIS]} {icon}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">
                      Status *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'draft' }))}
                      className="w-full px-3 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-granite-700 mb-2">
                    Features
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a feature..."
                        value={currentFeature}
                        onChange={(e) => setCurrentFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        className="flex-1 px-3 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-4 py-2 bg-crimson-600 text-white rounded-lg hover:bg-crimson-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 bg-granite-100 text-granite-800 rounded-full text-sm">
                          {feature}
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="ml-2 text-granite-500 hover:text-granite-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Target Market */}
                <div>
                  <label className="block text-sm font-medium text-granite-700 mb-2">
                    Target Market
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add target market..."
                        value={currentTargetMarket}
                        onChange={(e) => setCurrentTargetMarket(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTargetMarket())}
                        className="flex-1 px-3 py-2 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={addTargetMarket}
                        className="px-4 py-2 bg-crimson-600 text-white rounded-lg hover:bg-crimson-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(formData.targetMarket || []).map((market, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                          {market}
                          <button
                            type="button"
                            onClick={() => removeTargetMarket(index)}
                            className="ml-2 text-amber-600 hover:text-amber-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-granite-300 text-granite-700 rounded-lg hover:bg-granite-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-crimson-600 text-white rounded-lg hover:bg-crimson-700 transition-colors"
                  >
                    {editingService ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}