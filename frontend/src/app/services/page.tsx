'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import { 
  ArrowRightIcon,
  CheckIcon,
  FunnelIcon,
  MagnifyingGlassIcon
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

const ICON_COMPONENTS = {
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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All Services')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
        const response = await fetch(`${apiUrl}/services?status=active`)
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

    fetchServices()
  }, [])

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
        const response = await fetch(`${apiUrl}/services/categories`)
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
        if (data.success) {
          setCategories(['All Services', ...data.data])
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }

    fetchCategories()
  }, [])

  // Filter services based on category and search
  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'All Services' || service.category === selectedCategory
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crimson-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-granite-800 mb-4">Failed to Load Services</h2>
            <p className="text-granite-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-crimson-600 text-white px-6 py-2 rounded-lg hover:bg-crimson-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
      <Navigation />

      {/* Header Section */}
      <section className="pt-32 pb-16">
        <div className="wide-container">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-granite-900 mb-6">
              Enterprise Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson-600 to-amber-500">Solutions</span>
            </h1>
            <p className="text-xl text-granite-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive digital transformation services designed for Zimbabwe's growing business landscape. 
              From system digitalization to advanced analytics - we help enterprises thrive in the digital age.
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-12">
            {/* Search Bar */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-granite-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-granite-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-granite-200 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent bg-white min-w-[200px]"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8">
            <p className="text-granite-600">
              Showing {filteredServices.length} of {services.length} services
              {selectedCategory !== 'All Services' && (
                <span className="ml-2 px-2 py-1 bg-crimson-100 text-crimson-700 rounded-full text-sm">
                  {selectedCategory}
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-20">
        <div className="wide-container">
          {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-granite-600">No services found matching your criteria.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All Services')
                  setSearchQuery('')
                }}
                className="mt-4 text-crimson-600 hover:text-crimson-700 underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-granite-100"
                >
                  <div className="p-8">
                    {/* Service Icon and Category */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-crimson-500 to-amber-500 rounded-xl flex items-center justify-center text-white text-2xl">
                          {service.icon && ICON_COMPONENTS[service.icon as keyof typeof ICON_COMPONENTS] || '🚀'}
                        </div>
                        <span className="px-3 py-1 bg-granite-100 text-granite-700 text-sm rounded-full font-medium">
                          {service.category}
                        </span>
                      </div>
                    </div>

                    {/* Service Title and Description */}
                    <h3 className="text-xl font-bold text-granite-900 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-granite-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Pricing */}
                    <div className="mb-6">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-granite-900">
                          ${service.price.toLocaleString()}
                        </span>
                        <span className="text-granite-500">
                          {service.currency || 'USD'}
                        </span>
                        {service.duration && (
                          <span className="text-granite-500">/{service.duration}</span>
                        )}
                      </div>
                      {service.setupFee && (
                        <p className="text-sm text-granite-500 mt-1">
                          Setup fee: ${service.setupFee.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Key Features */}
                    <div className="mb-8">
                      <h4 className="font-semibold text-granite-900 mb-3">Key Features:</h4>
                      <ul className="space-y-2">
                        {service.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-granite-600 text-sm">{feature}</span>
                          </li>
                        ))}
                        {service.features.length > 4 && (
                          <li className="text-granite-500 text-sm ml-7">
                            +{service.features.length - 4} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Target Market */}
                    {service.targetMarket && service.targetMarket.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-granite-900 mb-2">Ideal For:</h4>
                        <div className="flex flex-wrap gap-2">
                          {service.targetMarket.slice(0, 3).map((market, index) => (
                            <span key={index} className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                              {market}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <Link 
                      href="/contact" 
                      className="inline-flex items-center justify-center w-full bg-gradient-to-r from-crimson-600 to-amber-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-crimson-700 hover:to-amber-600 transition-all duration-300 group"
                    >
                      Get Started
                      <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-granite-900 to-granite-800">
        <div className="wide-container text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-granite-300 mb-8 max-w-2xl mx-auto">
            Let's discuss how our enterprise solutions can drive your digital transformation journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center bg-gradient-to-r from-crimson-600 to-amber-500 text-white font-semibold py-4 px-8 rounded-xl hover:from-crimson-700 hover:to-amber-600 transition-all duration-300"
            >
              Schedule Consultation
            </Link>
            <Link 
              href="/products" 
              className="inline-flex items-center justify-center border-2 border-white text-white font-semibold py-4 px-8 rounded-xl hover:bg-white hover:text-granite-900 transition-all duration-300"
            >
              View Our Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}