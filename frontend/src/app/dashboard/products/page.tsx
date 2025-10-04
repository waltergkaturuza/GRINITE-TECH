'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingCartIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  TagIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'
import { productsAPI } from '@/lib/api'

interface Product {
  id: string
  name: string
  description: string
  price: number
  type: 'digital' | 'service' | 'subscription' | 'physical'
  status: 'active' | 'inactive' | 'archived'
  features?: string
  digitalFiles?: string
  recurringInterval?: string
  createdAt: string
  updatedAt: string
}

type ViewMode = 'grid' | 'list'
type SortField = 'name' | 'price' | 'createdAt' | 'status'
type SortOrder = 'asc' | 'desc'

export default function ProductsPage() {
  // State Management
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    type: 'service' as Product['type'],
    status: 'active' as Product['status'],
    features: '',
    digitalFiles: '',
    recurringInterval: ''
  })

  // Load Products
  useEffect(() => {
    loadProducts()
  }, [])

  // Filter and Sort Products
  useEffect(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(product => product.type === selectedType)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(product => product.status === selectedStatus)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (sortField === 'price') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [products, searchQuery, selectedType, selectedStatus, sortField, sortOrder])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productsAPI.getAll()
      setProducts(data)
    } catch (err: any) {
      setError('Failed to load products')
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async () => {
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        features: formData.features || undefined,
        digitalFiles: formData.digitalFiles || undefined,
        recurringInterval: formData.recurringInterval || undefined
      }
      
      await productsAPI.create(productData)
      await loadProducts()
      setIsCreateModalOpen(false)
      resetForm()
    } catch (err: any) {
      setError('Failed to create product')
      console.error('Error creating product:', err)
    }
  }

  const handleEditProduct = async () => {
    if (!selectedProduct) return
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        features: formData.features || undefined,
        digitalFiles: formData.digitalFiles || undefined,
        recurringInterval: formData.recurringInterval || undefined
      }
      
      await productsAPI.update(selectedProduct.id, productData)
      await loadProducts()
      setIsEditModalOpen(false)
      setSelectedProduct(null)
      resetForm()
    } catch (err: any) {
      setError('Failed to update product')
      console.error('Error updating product:', err)
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return
    
    try {
      await productsAPI.delete(selectedProduct.id)
      await loadProducts()
      setIsDeleteModalOpen(false)
      setSelectedProduct(null)
    } catch (err: any) {
      setError('Failed to delete product')
      console.error('Error deleting product:', err)
    }
  }

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const duplicateData = {
        name: `${product.name} (Copy)`,
        description: product.description,
        price: product.price,
        type: product.type,
        status: 'inactive' as Product['status'],
        features: product.features,
        digitalFiles: product.digitalFiles,
        recurringInterval: product.recurringInterval
      }
      
      await productsAPI.create(duplicateData)
      await loadProducts()
    } catch (err: any) {
      setError('Failed to duplicate product')
      console.error('Error duplicating product:', err)
    }
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      type: product.type,
      status: product.status,
      features: product.features || '',
      digitalFiles: product.digitalFiles || '',
      recurringInterval: product.recurringInterval || ''
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      type: 'service',
      status: 'active',
      features: '',
      digitalFiles: '',
      recurringInterval: ''
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900 text-green-200'
      case 'inactive': return 'bg-yellow-900 text-yellow-200'
      case 'archived': return 'bg-gray-700 text-gray-200'
      default: return 'bg-gray-700 text-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'digital': return '💾'
      case 'service': return '🛠️'
      case 'subscription': return '🔄'
      case 'physical': return '📦'
      default: return '🛍️'
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    totalValue: products.reduce((sum, p) => sum + p.price, 0),
    avgPrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0
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
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="mt-2 text-sm text-gray-300">
            Manage your products and services with advanced tools
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-900 hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Product
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
                <ShoppingCartIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-100 truncate">Total Products</dt>
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
                <TagIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-green-100 truncate">Active Products</dt>
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
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-purple-100 truncate">Total Value</dt>
                  <dd className="text-lg font-medium text-white">{formatPrice(stats.totalValue)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-yellow-100 truncate">Avg. Price</dt>
                  <dd className="text-lg font-medium text-white">{formatPrice(stats.avgPrice)}</dd>
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
                  placeholder="Search products..."
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
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-granite-600 rounded-md text-sm bg-granite-700 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="all">All Types</option>
                <option value="digital">Digital</option>
                <option value="service">Service</option>
                <option value="subscription">Subscription</option>
                <option value="physical">Physical</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-granite-600 rounded-md text-sm bg-granite-700 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
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
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low-High</option>
                <option value="price-desc">Price High-Low</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-granite-600 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'list'
                      ? 'bg-yellow-900 text-white'
                      : 'bg-granite-700 text-gray-300 hover:bg-granite-600'
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'grid'
                      ? 'bg-yellow-900 text-white'
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

      {/* Products List/Grid */}
      <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-white mb-4">
            Product List ({filteredProducts.length})
          </h3>
          
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-granite-600">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-granite-600">
                {currentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-granite-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{getTypeIcon(product.type)}</span>
                        <div>
                          <div className="text-sm font-medium text-white">{product.name}</div>
                          <div className="text-sm text-gray-400 max-w-xs truncate">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{formatPrice(product.price)}</div>
                      {product.recurringInterval && (
                        <div className="text-xs text-blue-300">per {product.recurringInterval}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300 capitalize">{product.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateProduct(product)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
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
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-white">No products found</h3>
              <p className="mt-1 text-sm text-gray-400">
                {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first product.'}
              </p>
              {(!searchQuery && selectedType === 'all' && selectedStatus === 'all') && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-900 hover:bg-yellow-800"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add Product
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Simple Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-granite-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white">Create New Product</h3>
              <div className="mt-4 space-y-4">
                <input
                  type="text"
                  placeholder="Product name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white"
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white"
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Product['type'] }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white"
                >
                  <option value="service">Service</option>
                  <option value="digital">Digital</option>
                  <option value="subscription">Subscription</option>
                  <option value="physical">Physical</option>
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateProduct}
                    className="flex-1 bg-yellow-900 hover:bg-yellow-800 text-white py-2 px-4 rounded"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(false)
                      resetForm()
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Edit Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-granite-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white">Edit Product</h3>
              <div className="mt-4 space-y-4">
                <input
                  type="text"
                  placeholder="Product name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white"
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white"
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Product['type'] }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white"
                >
                  <option value="service">Service</option>
                  <option value="digital">Digital</option>
                  <option value="subscription">Subscription</option>
                  <option value="physical">Physical</option>
                </select>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Product['status'] }))}
                  className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditProduct}
                    className="flex-1 bg-yellow-900 hover:bg-yellow-800 text-white py-2 px-4 rounded"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false)
                      setSelectedProduct(null)
                      resetForm()
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Delete Modal */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-granite-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white">Delete Product</h3>
              <p className="mt-2 text-sm text-gray-300">
                Are you sure you want to delete "{selectedProduct.name}"? This action cannot be undone.
              </p>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={handleDeleteProduct}
                  className="flex-1 bg-red-900 hover:bg-red-800 text-white py-2 px-4 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setSelectedProduct(null)
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}