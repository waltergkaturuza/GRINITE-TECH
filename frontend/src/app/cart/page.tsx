'use client'

import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import Link from 'next/link'
import { 
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'

// Mock products data - same as products page
const mockProducts = [
  {
    id: '1',
    name: 'Starter Website Package',
    description: 'Perfect for small businesses and startups looking to establish their online presence',
    price: 1999,
    deliveryDays: 14
  },
  {
    id: '2',
    name: 'E-commerce Solution',
    description: 'Complete online store with payment processing and inventory management',
    price: 4999,
    deliveryDays: 30
  },
  {
    id: '3',
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application for iOS and Android',
    price: 7999,
    deliveryDays: 45
  },
  {
    id: '4',
    name: 'API Development Package',
    description: 'RESTful API with documentation and authentication',
    price: 2999,
    deliveryDays: 21
  },
  {
    id: '5',
    name: 'Cloud Infrastructure Setup',
    description: 'Complete cloud infrastructure with monitoring and backup',
    price: 3499,
    deliveryDays: 14
  },
  {
    id: '6',
    name: 'Analytics Dashboard',
    description: 'Custom analytics dashboard with real-time data visualization',
    price: 3999,
    deliveryDays: 28
  }
]

interface CartItem {
  productId: string
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      const productIds = JSON.parse(savedCart)
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
    }
    setIsLoading(false)
  }, [])

  const updateCart = (newCartItems: CartItem[]) => {
    setCartItems(newCartItems)
    
    // Convert back to array of product IDs for localStorage
    const productIds: string[] = []
    newCartItems.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        productIds.push(item.productId)
      }
    })
    
    localStorage.setItem('cart', JSON.stringify(productIds))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const updatedItems = cartItems.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    )
    updateCart(updatedItems)
  }

  const removeFromCart = (productId: string) => {
    const updatedItems = cartItems.filter(item => item.productId !== productId)
    updateCart(updatedItems)
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
        <Navigation />
        <div className="wide-container px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crimson-900 mx-auto"></div>
            <p className="mt-4 text-granite-600">Loading cart...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-granite-800 mb-2">Shopping Cart</h1>
          <p className="text-granite-600">Review your selected products and proceed to checkout</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBagIcon className="h-24 w-24 text-granite-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-granite-600 mb-4">Your cart is empty</h2>
            <p className="text-granite-500 mb-8">Start shopping to add products to your cart</p>
            <Link 
              href="/products" 
              className="bg-gradient-to-r from-crimson-900 to-crimson-800 hover:from-crimson-800 hover:to-crimson-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-granite-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-granite-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-granite-800">Cart Items</h2>
                  <button
                    onClick={clearCart}
                    className="text-crimson-600 hover:text-crimson-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-granite-200">
                  {cartItems.map((item) => {
                    const product = getProductDetails(item.productId)
                    if (!product) return null

                    return (
                      <div key={item.productId} className="p-6">
                        <div className="flex items-start space-x-4">
                          {/* Product Image Placeholder */}
                          <div className="w-20 h-20 bg-gradient-to-br from-granite-100 to-granite-200 rounded-lg flex items-center justify-center">
                            <span className="text-granite-400 text-2xl font-bold">{product.name.charAt(0)}</span>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-granite-800 mb-1">{product.name}</h3>
                            <p className="text-granite-600 text-sm mb-2">{product.description}</p>
                            <p className="text-granite-500 text-sm">{product.deliveryDays}-day delivery</p>
                          </div>

                          {/* Quantity and Price */}
                          <div className="text-right">
                            <p className="text-xl font-bold text-granite-800 mb-3">
                              ${(product.price * item.quantity).toLocaleString()}
                            </p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2 mb-3">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="w-8 h-8 rounded-full border border-granite-300 flex items-center justify-center hover:bg-granite-100 transition-colors duration-200"
                              >
                                <MinusIcon className="h-4 w-4 text-granite-600" />
                              </button>
                              <span className="w-8 text-center font-medium text-granite-800">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="w-8 h-8 rounded-full border border-granite-300 flex items-center justify-center hover:bg-granite-100 transition-colors duration-200"
                              >
                                <PlusIcon className="h-4 w-4 text-granite-600" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="text-crimson-600 hover:text-crimson-700 text-sm flex items-center"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6 sticky top-4">
                <h2 className="text-xl font-bold text-granite-800 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-granite-600">
                    <span>Subtotal</span>
                    <span>${calculateSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-granite-600">
                    <span>Tax (8%)</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="border-t border-granite-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-granite-800">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="w-full bg-gradient-to-r from-crimson-900 to-crimson-800 hover:from-crimson-800 hover:to-crimson-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                  >
                    <CreditCardIcon className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </Link>
                  <Link
                    href="/products"
                    className="w-full border-2 border-granite-800 text-granite-800 hover:bg-granite-800 hover:text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 text-center block"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-granite-200">
                  <div className="flex items-center justify-center text-granite-500 text-sm">
                    <span className="mr-2">🔒</span>
                    Secure checkout with SSL encryption
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}