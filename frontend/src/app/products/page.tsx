'use client'

import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import Link from 'next/link'
import { productsAPI } from '../../lib/api'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingCartIcon,
  StarIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

// Interface for products from backend
interface Product {
  id: string
  name: string
  description?: string
  shortDescription?: string
  price: number
  category: string
  images?: string[]
  features?: string[]
  technologies?: string[]
  advantages?: string[]
  functionalities?: string[]
  costBreakdown?: any
  timeline?: any
  teamSize?: number
  complexity?: string
  deliverables?: string[]
  supportIncluded?: boolean
  warrantyMonths?: number
  inStock?: boolean
  featured?: boolean
  demoUrl?: string
  caseStudies?: any[]
  testimonials?: any[]
  // Optional fields for display compatibility
  rating?: number
  reviews?: number
  deliveryDays?: number
  image?: string
  type?: string
  createdAt: string
  updatedAt: string
}

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'website', name: 'Websites' },
  { id: 'ecommerce', name: 'E-commerce' },
  { id: 'mobile', name: 'Mobile Apps' },
  { id: 'api', name: 'APIs' },
  { id: 'cloud', name: 'Cloud Solutions' },
  { id: 'analytics', name: 'Analytics' }
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [cart, setCart] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await productsAPI.getProducts()
        const productsData = response.products || response.data || response
        setProducts(productsData)
        setFilteredProducts(productsData)
      } catch (err) {
        console.error('Failed to load products:', err)
        setError('Failed to load products. Please try again later.')
        // Fallback to empty array instead of mock data
        setProducts([])
        setFilteredProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredProducts(filtered)
  }, [products, selectedCategory, searchQuery, sortBy])

  const addToCart = (productId: string) => {
    const newCart = [...cart, productId]
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(id => id !== productId)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const isInCart = (productId: string) => {
    return cart.includes(productId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-granite-800 via-granite-700 to-crimson-900 text-white py-20">
        <div className="wide-container px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-peach-400">Products</span>
          </h1>
          <p className="text-xl md:text-2xl text-granite-200 mb-8 max-w-3xl mx-auto">
            Ready-to-deploy solutions and packages to accelerate your digital transformation
          </p>
          <Link 
            href="/cart" 
            className="inline-flex items-center bg-gradient-to-r from-crimson-600 to-crimson-500 hover:from-crimson-500 hover:to-crimson-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            View Cart ({cart.length})
          </Link>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white border-b border-granite-200">
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-granite-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-crimson-900 text-white'
                      : 'bg-granite-100 text-granite-700 hover:bg-granite-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-granite-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-granite-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-granite-600 mb-2">No products found</h3>
              <p className="text-granite-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg border border-granite-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105"
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gradient-to-br from-granite-100 to-granite-200 flex items-center justify-center">
                    <div className="text-granite-400 text-6xl font-bold">{product.name.charAt(0)}</div>
                  </div>

                  <div className="p-6">
                    {/* Product Header */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-granite-800 mb-2">{product.name}</h3>
                      <p className="text-granite-600 text-sm mb-3">{product.description}</p>
                      
                      {/* Rating */}
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating || 0) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-granite-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-granite-500">
                          {(product.rating || 0).toFixed(1)} ({product.reviews || 0} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-granite-800 mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {product.features && product.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-granite-600">
                            <CheckIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                        {product.features && product.features.length > 4 && (
                          <li className="text-sm text-granite-500">
                            +{product.features.length - 4} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Price and CTA */}
                    <div className="border-t border-granite-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-2xl font-bold text-granite-800">
                            ${product.price.toLocaleString()}
                          </p>
                          <p className="text-sm text-granite-500">
                            {product.deliveryDays || 30}-day delivery
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {isInCart(product.id) ? (
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all duration-200 font-medium"
                          >
                            Remove from Cart
                          </button>
                        ) : (
                          <button
                            onClick={() => addToCart(product.id)}
                            className="w-full bg-gradient-to-r from-crimson-900 to-crimson-800 hover:from-crimson-800 hover:to-crimson-700 text-white py-2 px-4 rounded-lg transition-all duration-200 font-medium"
                          >
                            Add to Cart
                          </button>
                        )}
                        <Link 
                          href={`/products/${product.id}`}
                          className="w-full border-2 border-granite-800 text-granite-800 hover:bg-granite-800 hover:text-white py-2 px-4 rounded-lg transition-all duration-200 font-medium text-center block"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-granite-800 to-crimson-900 text-white py-16">
        <div className="wide-container px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Need Something Custom?
          </h2>
          <p className="text-xl text-granite-200 mb-8">
            Don't see exactly what you're looking for? We create custom solutions tailored to your specific needs.
          </p>
          <Link 
            href="/services" 
            className="bg-gradient-to-r from-yellow-400 to-peach-400 text-granite-800 px-8 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105"
          >
            Explore Custom Services
          </Link>
        </div>
      </section>
    </div>
  )
}