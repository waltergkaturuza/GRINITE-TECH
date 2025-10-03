'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '../components/Navigation'
import Link from 'next/link'
import { 
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

// Mock products data
const mockProducts = [
  {
    id: '1',
    name: 'Starter Website Package',
    price: 1999,
    deliveryDays: 14
  },
  {
    id: '2',
    name: 'E-commerce Solution',
    price: 4999,
    deliveryDays: 30
  },
  {
    id: '3',
    name: 'Mobile App Development',
    price: 7999,
    deliveryDays: 45
  },
  {
    id: '4',
    name: 'API Development Package',
    price: 2999,
    deliveryDays: 21
  },
  {
    id: '5',
    name: 'Cloud Infrastructure Setup',
    price: 3499,
    deliveryDays: 14
  },
  {
    id: '6',
    name: 'Analytics Dashboard',
    price: 3999,
    deliveryDays: 28
  }
]

interface CartItem {
  productId: string
  quantity: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [formData, setFormData] = useState({
    // Billing Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    
    // Billing Address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    
    // Payment Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // Additional
    specialInstructions: '',
    newsletter: false,
    terms: false
  })

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      const productIds = JSON.parse(savedCart)
      if (productIds.length === 0) {
        router.push('/cart')
        return
      }
      
      // Convert array of product IDs to cart items with quantities
      const itemCounts: { [key: string]: number } = {}
      productIds.forEach((id: string) => {
        itemCounts[id] = (itemCounts[id] || 0) + 1
      })
      
      const items = Object.entries(itemCounts).map(([productId, quantity]) => ({
        productId,
        quantity
      }))
      
      setCartItems(items)
    } else {
      router.push('/cart')
    }
    setIsLoading(false)
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const getProductDetails = (productId: string) => {
    return mockProducts.find(product => product.id === productId)
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const product = getProductDetails(item.productId)
      return total + (product ? product.price * item.quantity : 0)
    }, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.08 // 8% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.terms) {
      alert('Please accept the terms and conditions')
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Here you would integrate with Stripe or another payment processor
      console.log('Processing payment:', { formData, cartItems, total: calculateTotal() })
      
      // Clear cart after successful payment
      localStorage.removeItem('cart')
      setIsCompleted(true)
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
        <Navigation />
        <div className="wide-container px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crimson-900 mx-auto"></div>
            <p className="mt-4 text-granite-600">Loading checkout...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
        <Navigation />
        <div className="wide-container px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-granite-800 mb-6">Order Complete!</h1>
            <p className="text-xl text-granite-600 mb-8">
              Thank you for your purchase. We'll be in touch within 24 hours to discuss your project details.
            </p>
            <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-granite-800 mb-4">What's Next?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div>
                  <div className="bg-crimson-100 p-3 rounded-lg inline-block mb-3">
                    <span className="text-crimson-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-granite-800 mb-2">Project Kickoff</h3>
                  <p className="text-granite-600 text-sm">We'll schedule a call to discuss requirements and timeline</p>
                </div>
                <div>
                  <div className="bg-crimson-100 p-3 rounded-lg inline-block mb-3">
                    <span className="text-crimson-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-granite-800 mb-2">Development</h3>
                  <p className="text-granite-600 text-sm">Our team will begin working on your project with regular updates</p>
                </div>
                <div>
                  <div className="bg-crimson-100 p-3 rounded-lg inline-block mb-3">
                    <span className="text-crimson-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-granite-800 mb-2">Delivery</h3>
                  <p className="text-granite-600 text-sm">We'll deliver your completed project and provide ongoing support</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Link 
                href="/dashboard" 
                className="bg-gradient-to-r from-crimson-900 to-crimson-800 hover:from-crimson-800 hover:to-crimson-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 inline-block"
              >
                View Dashboard
              </Link>
              <br />
              <Link 
                href="/products" 
                className="border-2 border-granite-800 text-granite-800 hover:bg-granite-800 hover:text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 inline-block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
      <Navigation />

      <div className="wide-container px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/cart"
            className="inline-flex items-center text-granite-600 hover:text-granite-800 transition-colors duration-200 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-granite-800">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-8">
            {/* Billing Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6">
              <h2 className="text-xl font-bold text-granite-800 mb-6">Billing Information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-granite-700 mb-2">Company (Optional)</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-granite-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">ZIP</label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6">
              <h2 className="text-xl font-bold text-granite-800 mb-6 flex items-center">
                <CreditCardIcon className="h-6 w-6 mr-2" />
                Payment Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-granite-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    required
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      required
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-granite-700 mb-2">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      required
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-granite-700 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    name="cardName"
                    required
                    value={formData.cardName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-granite-700 mb-2">Special Instructions (Optional)</label>
                  <textarea
                    name="specialInstructions"
                    rows={3}
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-500"
                    placeholder="Any special requirements or notes for your project..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleInputChange}
                      className="rounded border-granite-300 text-crimson-600 focus:ring-crimson-500"
                    />
                    <span className="ml-2 text-sm text-granite-700">Subscribe to our newsletter</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="terms"
                      checked={formData.terms}
                      onChange={handleInputChange}
                      className="rounded border-granite-300 text-crimson-600 focus:ring-crimson-500"
                    />
                    <span className="ml-2 text-sm text-granite-700">
                      I agree to the <Link href="/terms" className="text-crimson-600 hover:text-crimson-700">Terms & Conditions</Link>
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-crimson-900 to-crimson-800 hover:from-crimson-800 hover:to-crimson-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="h-5 w-5 mr-2" />
                      Complete Order - ${calculateTotal().toFixed(2)}
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-granite-500">
                  🔒 Your payment information is secure and encrypted
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-granite-800 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  const product = getProductDetails(item.productId)
                  if (!product) return null

                  return (
                    <div key={item.productId} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-granite-800">{product.name}</h3>
                        <p className="text-sm text-granite-500">Qty: {item.quantity}</p>
                        <p className="text-sm text-granite-500">{product.deliveryDays} days delivery</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-granite-800">
                          ${(product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-granite-200 pt-4 space-y-2">
                <div className="flex justify-between text-granite-600">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-granite-600">
                  <span>Tax (8%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-granite-800 border-t border-granite-200 pt-2">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}