'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { servicesAPI } from '@/lib/api'
import { formatPrice, parseListField } from '@/lib/catalog'

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
  targetMarket?: string[]
  setupFee?: number
  monthlyFee?: number
  displayOrder: number
}

type ServiceFormData = {
  title: string
  description: string
  category: string
  price: number
  features: string[]
  icon: string
  status: Service['status']
  duration: string
  currency: string
  targetMarket: string[]
  setupFee: number
  monthlyFee: number
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
  'BeakerIcon',
] as const

const ICON_EMOJIS: Record<string, string> = {
  ComputerDesktopIcon: '💻',
  BuildingOfficeIcon: '🏢',
  TruckIcon: '🚛',
  AcademicCapIcon: '🎓',
  HeartIcon: '❤️',
  MapIcon: '🗺️',
  ChartBarIcon: '📊',
  CogIcon: '⚙️',
  LightBulbIcon: '💡',
  CurrencyDollarIcon: '💰',
  BeakerIcon: '🧪',
}

const SUGGESTED_CATEGORIES = [
  'Digital Transformation',
  'Enterprise Solutions',
  'Custom Software',
  'Mobile Apps',
  'Business Automation',
  'E-commerce',
  'Cloud & Infrastructure',
  'Consulting',
]

const emptyForm = (): ServiceFormData => ({
  title: '',
  description: '',
  category: '',
  price: 0,
  features: [],
  icon: 'ComputerDesktopIcon',
  status: 'active',
  duration: '',
  currency: 'USD',
  targetMarket: [],
  setupFee: 0,
  monthlyFee: 0,
  displayOrder: 0,
})

export default function DashboardServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<ServiceFormData>(emptyForm())
  const [currentFeature, setCurrentFeature] = useState('')
  const [currentTargetMarket, setCurrentTargetMarket] = useState('')

  const fetchServices = async () => {
    try {
      setLoading(true)
      const data = await servicesAPI.getAll()
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      setServices(list)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const categories = useMemo(() => {
    const fromApi = services.map((service) => service.category).filter(Boolean)
    return Array.from(new Set([...SUGGESTED_CATEGORIES, ...fromApi])).sort()
  }, [services])

  const filteredServices = services.filter((service) => {
    const haystack = `${service.title} ${service.description}`.toLowerCase()
    const matchesSearch = haystack.includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || service.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const resetForm = () => {
    setEditingService(null)
    setFormData(emptyForm())
    setCurrentFeature('')
    setCurrentTargetMarket('')
  }

  const openCreate = () => {
    resetForm()
    setFormData((prev) => ({ ...prev, displayOrder: services.length + 1 }))
    setShowModal(true)
  }

  const openEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      price: Number(service.price) || 0,
      features: parseListField(service.features),
      icon: service.icon || 'ComputerDesktopIcon',
      status: service.status,
      duration: service.duration || '',
      currency: service.currency || 'USD',
      targetMarket: parseListField(service.targetMarket),
      setupFee: Number(service.setupFee) || 0,
      monthlyFee: Number(service.monthlyFee) || 0,
      displayOrder: Number(service.displayOrder) || 0,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (editingService) {
        await servicesAPI.update(editingService.id, formData)
      } else {
        await servicesAPI.create(formData)
      }
      await fetchServices()
      setShowModal(false)
      resetForm()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service from the public catalog?')) return
    try {
      await servicesAPI.delete(id)
      await fetchServices()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete service')
    }
  }

  const addFeature = () => {
    if (!currentFeature.trim()) return
    setFormData((prev) => ({ ...prev, features: [...prev.features, currentFeature.trim()] }))
    setCurrentFeature('')
  }

  const addTargetMarket = () => {
    if (!currentTargetMarket.trim()) return
    setFormData((prev) => ({
      ...prev,
      targetMarket: [...prev.targetMarket, currentTargetMarket.trim()],
    }))
    setCurrentTargetMarket('')
  }

  const statusClass = (status: string) => {
    if (status === 'active') return 'bg-green-900 text-green-200'
    if (status === 'draft') return 'bg-amber-800 text-amber-200'
    return 'bg-gray-700 text-gray-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Services</h1>
          <p className="mt-2 text-sm text-gray-300">
            These cards appear on the public Services page. Active items are visible to visitors.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-amber-800 hover:bg-green-600"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Service
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 text-red-200 px-4 py-3 rounded-lg flex justify-between gap-3">
          <p className="text-sm">{error}</p>
          <button onClick={() => setError(null)} className="text-red-300">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="bg-granite-800 shadow rounded-lg border border-granite-700 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-10 pr-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
        >
          <option value="All">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-granite-800 shadow rounded-lg border border-granite-700 overflow-x-auto">
        <table className="min-w-full divide-y divide-granite-700">
          <thead className="bg-granite-900/60">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-granite-700">
            {filteredServices.map((service) => (
              <tr key={service.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-crimson-500 to-amber-500 flex items-center justify-center text-lg">
                      {ICON_EMOJIS[service.icon || ''] || '🚀'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{service.title}</div>
                      <div className="text-sm text-gray-400 truncate max-w-xs">{service.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">{service.category}</td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  {formatPrice(service.price, service.currency || 'USD')}
                  {service.duration ? <span className="text-gray-400"> / {service.duration}</span> : null}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass(service.status)}`}>
                    {service.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(service)} className="text-yellow-400 hover:text-yellow-300 p-1">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="text-red-400 hover:text-red-300 p-1 ml-2">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredServices.length === 0 && (
          <div className="text-center py-12 text-gray-400">No services match these filters.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-granite-800 border border-granite-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingService ? 'Edit service' : 'Add service'}
                </h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-gray-400">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-sm text-gray-300">
                  Title
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
                  />
                </label>
                <label className="text-sm text-gray-300">
                  Category
                  <input
                    required
                    list="service-categories"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="Type a new category if needed"
                    className="mt-1 w-full px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
                  />
                  <datalist id="service-categories">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </label>
              </div>

              <label className="block text-sm text-gray-300">
                Description
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
                />
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="text-sm text-gray-300">
                  Price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
                  />
                </label>
                <label className="text-sm text-gray-300">
                  Currency
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="ZWL">ZWL</option>
                  </select>
                </label>
                <label className="text-sm text-gray-300">
                  Duration
                  <input
                    value={formData.duration}
                    onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                    placeholder="4-6 weeks"
                    className="mt-1 w-full px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
                  />
                </label>
                <label className="text-sm text-gray-300">
                  Setup fee
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.setupFee}
                    onChange={(e) => setFormData((prev) => ({ ...prev, setupFee: Number(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <label className="text-sm text-gray-300">
                  Icon
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
                  >
                    {AVAILABLE_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {ICON_EMOJIS[icon]} {icon.replace('Icon', '')}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-gray-300">
                  Status
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as Service['status'] }))}
                    className="mt-1 w-full px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <label className="text-sm text-gray-300">
                  Display order
                  <input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
                  />
                </label>
                <label className="text-sm text-gray-300">
                  Monthly fee
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData((prev) => ({ ...prev, monthlyFee: Number(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
                  />
                </label>
              </div>

              <div>
                <p className="text-sm text-gray-300 mb-2">Key features</p>
                <div className="flex gap-2">
                  <input
                    value={currentFeature}
                    onChange={(e) => setCurrentFeature(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    placeholder="Add a feature"
                    className="flex-1 px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
                  />
                  <button type="button" onClick={addFeature} className="px-4 py-2 rounded-md bg-amber-800 text-white">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.features.map((feature, index) => (
                    <span key={`${feature}-${index}`} className="px-3 py-1 rounded-full bg-granite-700 text-sm text-gray-200">
                      {feature}
                      <button
                        type="button"
                        className="ml-2 text-gray-400"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            features: prev.features.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-300 mb-2">Ideal for</p>
                <div className="flex gap-2">
                  <input
                    value={currentTargetMarket}
                    onChange={(e) => setCurrentTargetMarket(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTargetMarket())}
                    placeholder="SMEs, hospitals, schools..."
                    className="flex-1 px-3 py-2 rounded-md bg-granite-700 border border-granite-600 text-white"
                  />
                  <button type="button" onClick={addTargetMarket} className="px-4 py-2 rounded-md bg-amber-800 text-white">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.targetMarket.map((market, index) => (
                    <span key={`${market}-${index}`} className="px-3 py-1 rounded-full bg-amber-900/40 text-sm text-amber-200">
                      {market}
                      <button
                        type="button"
                        className="ml-2 text-amber-300"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            targetMarket: prev.targetMarket.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-granite-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md bg-granite-700 text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-amber-800 text-white disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingService ? 'Update service' : 'Create service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
