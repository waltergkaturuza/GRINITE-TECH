'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { productsAPI } from '@/lib/api'
import { 
  PlayIcon, 
  StarIcon, 
  CheckIcon, 
  ArrowLeftIcon,
  CodeBracketIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CloudIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'

interface ProductDetail {
  id: number
  name: string
  description: string
  shortDescription: string
  price: number
  category: string
  images: string[]
  videos: string[]
  gifs: string[]
  specifications: any
  features: string[]
  technologies: string[]
  advantages: string[]
  functionalities: string[]
  costBreakdown: {
    development: number
    design: number
    testing: number
    deployment: number
    maintenance: number
  }
  timeline: {
    planning: number
    development: number
    testing: number
    deployment: number
  }
  teamSize: number
  complexity: 'Low' | 'Medium' | 'High' | 'Enterprise'
  deliverables: string[]
  supportIncluded: boolean
  warrantyMonths: number
  rating: number
  reviews: number
  inStock: boolean
  featured: boolean
  demoUrl?: string
  caseStudies: Array<{
    title: string
    description: string
    image: string
    results: string[]
  }>
  testimonials: Array<{
    name: string
    company: string
    role: string
    content: string
    rating: number
    image?: string
  }>
  createdAt: string
  updatedAt: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedImage, setSelectedImage] = useState(0)
  const [showVideoModal, setShowVideoModal] = useState(false)

  const productId = params.id as string

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await productsAPI.getProduct(productId)
      setProduct(response)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load product')
      console.error('Error loading product:', err)
      // Mock data for demonstration
      setProduct(getMockProductDetail())
    } finally {
      setLoading(false)
    }
  }

  const getMockProductDetail = (): ProductDetail => {
    return {
      id: 1,
      name: "API Development Package",
      description: "Comprehensive RESTful API solution with advanced authentication, database integration, and complete documentation. Perfect for businesses looking to build scalable, secure, and maintainable backend systems.",
      shortDescription: "RESTful API with documentation and authentication",
      price: 2999,
      category: "API Development",
      images: [
        "/api/placeholder/800/600",
        "/api/placeholder/800/600",
        "/api/placeholder/800/600"
      ],
      videos: [
        "https://example.com/demo-video.mp4"
      ],
      gifs: [
        "/api/placeholder/400/300",
        "/api/placeholder/400/300"
      ],
      specifications: {
        framework: "Node.js with Express",
        database: "PostgreSQL with TypeORM",
        authentication: "JWT with refresh tokens",
        documentation: "Swagger/OpenAPI 3.0",
        testing: "Jest with 90%+ coverage"
      },
      features: [
        "Custom REST API endpoints",
        "JWT Authentication & Authorization",
        "Database design & integration",
        "API documentation with Swagger",
        "Rate limiting & security",
        "Error handling & logging"
      ],
      technologies: [
        "Node.js", "Express.js", "TypeScript", "PostgreSQL", 
        "JWT", "Swagger", "Docker", "Redis", "Jest"
      ],
      advantages: [
        "Scalable architecture",
        "Enterprise-grade security",
        "Comprehensive documentation",
        "90%+ test coverage",
        "Performance optimized",
        "Industry best practices"
      ],
      functionalities: [
        "User authentication & management",
        "Role-based access control",
        "Data validation & sanitization",
        "File upload handling",
        "Email notifications",
        "Database migrations",
        "API versioning",
        "Caching layer"
      ],
      costBreakdown: {
        development: 1800,
        design: 400,
        testing: 400,
        deployment: 250,
        maintenance: 149
      },
      timeline: {
        planning: 3,
        development: 14,
        testing: 5,
        deployment: 2
      },
      teamSize: 3,
      complexity: 'Medium',
      deliverables: [
        "Complete API source code",
        "Database schema & migrations",
        "API documentation",
        "Deployment guide",
        "Testing suite",
        "30 days support"
      ],
      supportIncluded: true,
      warrantyMonths: 6,
      rating: 4.6,
      reviews: 15,
      inStock: true,
      featured: true,
      demoUrl: "https://api-demo.granitetech.com",
      caseStudies: [
        {
          title: "E-commerce Platform API",
          description: "Built scalable API for major e-commerce platform handling 10K+ daily transactions",
          image: "/api/placeholder/300/200",
          results: ["40% faster response times", "99.9% uptime", "Reduced server costs by 30%"]
        }
      ],
      testimonials: [
        {
          name: "John Smith",
          company: "TechCorp Inc.",
          role: "CTO",
          content: "Outstanding API development. The team delivered exactly what we needed with excellent documentation.",
          rating: 5,
          image: "/api/placeholder/100/100"
        }
      ],
      createdAt: "2024-01-15",
      updatedAt: "2024-10-01"
    }
  }

  const handleContactSales = () => {
    router.push('/contact')
  }

  const handleRequestDemo = () => {
    if (product?.demoUrl) {
      window.open(product.demoUrl, '_blank')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getTechnologyIcon = (tech: string) => {
    const icons: { [key: string]: any } = {
      'Node.js': CodeBracketIcon,
      'Express.js': CodeBracketIcon,
      'TypeScript': CodeBracketIcon,
      'PostgreSQL': CpuChipIcon,
      'React': DevicePhoneMobileIcon,
      'Docker': CloudIcon,
      'JWT': ShieldCheckIcon,
      default: CpuChipIcon
    }
    const IconComponent = icons[tech] || icons.default
    return <IconComponent className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/products')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-50 to-crimson-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/products')}
            className="flex items-center text-granite-600 hover:text-granite-800 transition-colors mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Products
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-granite-800 mb-2">{product.name}</h1>
              <p className="text-lg text-granite-600 mb-4">{product.shortDescription}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-granite-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
                
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.complexity === 'Low' ? 'bg-green-100 text-green-800' :
                  product.complexity === 'Medium' ? 'bg-amber-200 text-amber-900' :
                  product.complexity === 'High' ? 'bg-orange-100 text-orange-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {product.complexity} Complexity
                </span>
              </div>
            </div>
            
            <div className="flex-shrink-0 lg:ml-8">
              <div className="text-right mb-4">
                <div className="text-3xl font-bold text-granite-800">
                  {formatCurrency(product.price)}
                </div>
                <div className="text-sm text-granite-600">21-day delivery</div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleContactSales}
                  className="bg-crimson-600 hover:bg-crimson-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  Contact Sales
                </button>
                
                {product.demoUrl && (
                  <button
                    onClick={handleRequestDemo}
                    className="border border-granite-300 hover:border-granite-400 text-granite-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <PlayIcon className="h-5 w-5 mr-2" />
                    View Demo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Media Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Main Image/Video */}
              <div className="aspect-video bg-gray-100 relative">
                {product.videos.length > 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="bg-black bg-opacity-50 text-white rounded-full p-4 hover:bg-opacity-70 transition-opacity"
                    >
                      <PlayIcon className="h-12 w-12" />
                    </button>
                    <img
                      src={product.images[selectedImage] || "/api/placeholder/800/450"}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <img
                    src={product.images[selectedImage] || "/api/placeholder/800/450"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-crimson-500' : 'border-gray-200'
                      }`}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  
                  {product.gifs.map((gif, index) => (
                    <button
                      key={`gif-${index}`}
                      className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <img src={gif} alt={`GIF ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabbed Content */}
            <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  {[
                    { key: 'overview', label: 'Overview', icon: DocumentTextIcon },
                    { key: 'features', label: 'Features', icon: CheckIcon },
                    { key: 'technologies', label: 'Technologies', icon: CpuChipIcon },
                    { key: 'cost', label: 'Cost Breakdown', icon: CurrencyDollarIcon },
                    { key: 'testimonials', label: 'Testimonials', icon: UserGroupIcon },
                    { key: 'case-studies', label: 'Case Studies', icon: ChartBarIcon }
                  ].map((tab) => {
                    const IconComponent = tab.icon
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === tab.key
                            ? 'border-crimson-500 text-crimson-600'
                            : 'border-transparent text-granite-600 hover:text-granite-800 hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className="h-4 w-4 mr-2" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-granite-800 mb-3">Product Description</h3>
                      <p className="text-granite-600 leading-relaxed">{product.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-granite-800 mb-3">Key Advantages</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {product.advantages.map((advantage, index) => (
                          <div key={index} className="flex items-center">
                            <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-granite-600">{advantage}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-granite-800 mb-3">Deliverables</h3>
                      <ul className="space-y-2">
                        {product.deliverables.map((deliverable, index) => (
                          <li key={index} className="flex items-start">
                            <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-granite-600">{deliverable}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div>
                    <h3 className="text-lg font-semibold text-granite-800 mb-4">Features & Functionalities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-granite-800 mb-3">Core Features</h4>
                        <ul className="space-y-2">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-granite-600 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-granite-800 mb-3">Functionalities</h4>
                        <ul className="space-y-2">
                          {product.functionalities.map((functionality, index) => (
                            <li key={index} className="flex items-start">
                              <CpuChipIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-granite-600 text-sm">{functionality}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'technologies' && (
                  <div>
                    <h3 className="text-lg font-semibold text-granite-800 mb-4">Technology Stack</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {product.technologies.map((tech, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-3 flex items-center justify-center text-center border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex flex-col items-center">
                            {getTechnologyIcon(tech)}
                            <span className="text-sm font-medium text-granite-700 mt-1">{tech}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {product.specifications && (
                      <div className="mt-6">
                        <h4 className="font-medium text-granite-800 mb-3">Technical Specifications</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <dl className="space-y-2">
                            {Object.entries(product.specifications).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <dt className="font-medium text-granite-700 capitalize">{key}:</dt>
                                <dd className="text-granite-600">{value as string}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'cost' && (
                  <div>
                    <h3 className="text-lg font-semibold text-granite-800 mb-4">Cost Breakdown</h3>
                    <div className="space-y-4">
                      {Object.entries(product.costBreakdown).map(([phase, cost]) => (
                        <div key={phase} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-granite-700 capitalize">{phase}</span>
                          <span className="text-granite-800 font-semibold">{formatCurrency(cost)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span className="text-granite-800">Total Project Cost</span>
                          <span className="text-crimson-600">{formatCurrency(product.price)}</span>
                        </div>
                        <p className="text-sm text-granite-600 mt-2">
                          Includes {product.warrantyMonths} months warranty and {product.supportIncluded ? 'ongoing' : 'basic'} support
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'testimonials' && (
                  <div>
                    <h3 className="text-lg font-semibold text-granite-800 mb-4">Client Testimonials</h3>
                    <div className="space-y-6">
                      {product.testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <img
                              src={testimonial.image || "/api/placeholder/60/60"}
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full mr-4"
                            />
                            <div>
                              <h4 className="font-semibold text-granite-800">{testimonial.name}</h4>
                              <p className="text-sm text-granite-600">{testimonial.role} at {testimonial.company}</p>
                            </div>
                            <div className="ml-auto flex">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-granite-700 italic">"{testimonial.content}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'case-studies' && (
                  <div>
                    <h3 className="text-lg font-semibold text-granite-800 mb-4">Case Studies</h3>
                    <div className="space-y-6">
                      {product.caseStudies.map((study, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={study.image}
                            alt={study.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-6">
                            <h4 className="font-semibold text-granite-800 mb-2">{study.title}</h4>
                            <p className="text-granite-600 mb-4">{study.description}</p>
                            <div>
                              <h5 className="font-medium text-granite-800 mb-2">Key Results:</h5>
                              <ul className="space-y-1">
                                {study.results.map((result, resultIndex) => (
                                  <li key={resultIndex} className="flex items-center text-sm text-granite-600">
                                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                                    {result}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info Sidebar */}
          <div className="space-y-6">
            {/* Key Features */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-granite-800 mb-4 flex items-center">
                <CheckIcon className="h-5 w-5 mr-2 text-green-500" />
                Key Features
              </h3>
              <ul className="space-y-2">
                {product.features.slice(0, 6).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="h-4 w-4 mt-0.5 mr-2 text-green-500 flex-shrink-0" />
                    <span className="text-granite-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technologies */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-granite-800 mb-4 flex items-center">
                <CpuChipIcon className="h-5 w-5 mr-2 text-blue-500" />
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {getTechnologyIcon(tech)}
                    <span className="ml-1">{tech}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Project Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-granite-800 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-orange-500" />
                Timeline
              </h3>
              <div className="space-y-3">
                {Object.entries(product.timeline).map(([phase, days]) => (
                  <div key={phase} className="flex justify-between items-center">
                    <span className="text-granite-600 capitalize text-sm">{phase}</span>
                    <span className="text-granite-800 font-medium text-sm">{days} days</span>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-granite-800">Total</span>
                    <span className="text-granite-800">
                      {Object.values(product.timeline).reduce((a, b) => a + b, 0)} days
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-granite-800 mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-purple-500" />
                Project Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-granite-600">Team Size:</span>
                  <span className="text-granite-800 font-medium">{product.teamSize} developers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-granite-600">Complexity:</span>
                  <span className={`font-medium ${
                    product.complexity === 'Low' ? 'text-green-600' :
                    product.complexity === 'Medium' ? 'text-yellow-600' :
                    product.complexity === 'High' ? 'text-orange-600' :
                    'text-purple-600'
                  }`}>
                    {product.complexity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-granite-600">Support:</span>
                  <span className="text-granite-800 font-medium">
                    {product.supportIncluded ? 'Included' : 'Basic'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-granite-600">Warranty:</span>
                  <span className="text-granite-800 font-medium">{product.warrantyMonths} months</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-4xl w-full mx-4">
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Product Demo</h3>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="aspect-video">
                {product.videos[0] && (
                  <iframe
                    src={product.videos[0]}
                    className="w-full h-full"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}