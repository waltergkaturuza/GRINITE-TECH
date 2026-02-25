'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bars3Icon, XMarkIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import LoginModal from '@/components/LoginModal'
import SignupModal from '@/components/SignupModal'
import SearchCommand from '@/components/SearchCommand'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    router.push('/')
  }

  const openLoginModal = () => {
    setIsLoginModalOpen(true)
    setIsSignupModalOpen(false)
    setIsMenuOpen(false)
  }

  const openSignupModal = () => {
    setIsSignupModalOpen(true)
    setIsLoginModalOpen(false)
    setIsMenuOpen(false)
  }

  const closeModals = () => {
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(false)
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-granite-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Quantis Technologies logo"
                  fill
                  sizes="56px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-granite-800 to-crimson-900 bg-clip-text text-transparent">
                Quantis Technologies
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-granite-500 hover:text-crimson-900 transition-colors duration-200 flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-granite-100"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span className="text-xs text-granite-500">Search</span>
            </button>
            <div
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button
                className="inline-flex items-center text-granite-700 hover:text-crimson-900 transition-colors duration-200"
              >
                <span>Services</span>
                <svg
                  className="ml-1 h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.5 7.5L10 12L14.5 7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {isServicesOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-xl shadow-lg bg-white border border-granite-200 py-2 z-50">
                  <Link
                    href="/services"
                    className="block px-4 py-2 text-sm text-granite-700 hover:bg-granite-50 hover:text-crimson-900"
                  >
                    All services
                  </Link>
                  <div className="my-1 h-px bg-granite-100" />
                  <Link
                    href="/services/custom-software"
                    className="block px-4 py-2 text-sm text-granite-700 hover:bg-granite-50 hover:text-crimson-900"
                  >
                    Custom software
                  </Link>
                  <Link
                    href="/services/mobile-apps"
                    className="block px-4 py-2 text-sm text-granite-700 hover:bg-granite-50 hover:text-crimson-900"
                  >
                    Mobile apps
                  </Link>
                  <Link
                    href="/services/business-automation"
                    className="block px-4 py-2 text-sm text-granite-700 hover:bg-granite-50 hover:text-crimson-900"
                  >
                    Business automation
                  </Link>
                  <Link
                    href="/services/ecommerce"
                    className="block px-4 py-2 text-sm text-granite-700 hover:bg-granite-50 hover:text-crimson-900"
                  >
                    E‑commerce & digital products
                  </Link>
                </div>
              )}
            </div>
            <Link href="/products" className="text-granite-700 hover:text-crimson-900 transition-colors duration-200">
              Products
            </Link>
            <Link href="/about" className="text-granite-700 hover:text-crimson-900 transition-colors duration-200">
              About
            </Link>
            <Link href="/contact" className="text-granite-700 hover:text-crimson-900 transition-colors duration-200">
              Contact
            </Link>
            <Link href="/track-request" className="text-granite-700 hover:text-crimson-900 transition-colors duration-200">
              Track Request
            </Link>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-granite-700 hover:text-crimson-900 transition-colors duration-200 flex items-center">
                  <UserIcon className="h-5 w-5 mr-1" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-granite-700 hover:text-crimson-900 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={openSignupModal}
                  className="bg-gradient-to-r from-crimson-900 to-crimson-800 hover:from-crimson-800 hover:to-crimson-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-granite-700 hover:text-crimson-900 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-granite-200">
              <Link 
                href="/services" 
                className="block px-3 py-2 text-granite-700 hover:text-crimson-900 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/products" 
                className="block px-3 py-2 text-granite-700 hover:text-crimson-900 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/about" 
                className="block px-3 py-2 text-granite-700 hover:text-crimson-900 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="block px-3 py-2 text-granite-700 hover:text-crimson-900 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/track-request" 
                className="block px-3 py-2 text-granite-700 hover:text-crimson-900 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Track Request
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block px-3 py-2 text-granite-700 hover:text-crimson-900 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-granite-700 hover:text-crimson-900 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={openSignupModal}
                    className="block px-3 py-2 bg-gradient-to-r from-crimson-900 to-crimson-800 text-white rounded-lg font-medium mx-3"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search overlay */}
      <SearchCommand isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        closeModal={closeModals} 
        openSignupModal={openSignupModal}
      />
      <SignupModal 
        isOpen={isSignupModalOpen} 
        closeModal={closeModals} 
        openLoginModal={openLoginModal}
      />
    </nav>
  )
}