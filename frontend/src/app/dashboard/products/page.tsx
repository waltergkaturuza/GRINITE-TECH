'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingCartIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

export default function ProductsPage() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Website Development Package',
      price: '$2,500',
      category: 'Web Development',
      status: 'Active',
      description: 'Complete website development with modern design',
      sales: 12
    },
    {
      id: 2,
      name: 'Mobile App Development',
      price: '$5,000',
      category: 'Mobile Development',
      status: 'Active',
      description: 'Cross-platform mobile application development',
      sales: 8
    },
    {
      id: 3,
      name: 'E-commerce Solution',
      price: '$3,500',
      category: 'E-commerce',
      status: 'Active',
      description: 'Full e-commerce platform with payment integration',
      sales: 15
    }
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="mt-2 text-sm text-gray-300">
            Manage your products and services
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-900 hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-granite-800 overflow-hidden shadow rounded-lg border border-granite-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCartIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Total Products</dt>
                  <dd className="text-lg font-medium text-white">{products.length}</dd>
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
                  <dt className="text-sm font-medium text-gray-300 truncate">Total Sales</dt>
                  <dd className="text-lg font-medium text-white">35</dd>
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
                  <dt className="text-sm font-medium text-gray-300 truncate">Revenue</dt>
                  <dd className="text-lg font-medium text-white">$87,500</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <h3 className="text-lg leading-6 font-medium text-white">Product List</h3>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <div className="flex space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="block w-full pl-10 pr-3 py-2 border border-granite-600 rounded-md leading-5 bg-granite-700 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <button className="inline-flex items-center px-3 py-2 border border-granite-600 rounded-md text-sm font-medium text-gray-300 bg-granite-700 hover:bg-granite-600">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-granite-600">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-granite-600">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-granite-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{product.name}</div>
                        <div className="text-sm text-gray-400">{product.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{product.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{product.sales}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-900 text-green-200">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-yellow-400 hover:text-yellow-300 mr-3">Edit</button>
                      <button className="text-red-400 hover:text-red-300">Delete</button>
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