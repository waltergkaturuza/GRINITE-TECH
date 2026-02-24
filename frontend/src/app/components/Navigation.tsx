'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'
import LoginModal from '@/components/LoginModal'
import SignupModal from '@/components/SignupModal'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
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
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-granite-800 to-crimson-900 bg-clip-text text-transparent">
              QUANTIS TECHNOLOGIES
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/services" className="text-granite-700 hover:text-crimson-900 transition-colors duration-200">
              Services
            </Link>
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