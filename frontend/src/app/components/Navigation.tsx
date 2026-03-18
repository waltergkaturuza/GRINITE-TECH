'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
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
  const servicesMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  useEffect(() => {
    if (!isServicesOpen) return
    const onMouseDown = (e: MouseEvent) => {
      const el = servicesMenuRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) {
        setIsServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [isServicesOpen])

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
    <nav className="bg-emerald-950 shadow-lg border-b border-emerald-900/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem] flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Quantis Technologies logo"
                  fill
                  sizes="72px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="hidden sm:inline text-xl sm:text-2xl font-bold text-white">
                Quantis Technologies
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-emerald-50/90 hover:text-white transition-colors duration-200 flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-white/10"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span className="text-xs text-emerald-50/80">Search</span>
            </button>
            <div className="relative" ref={servicesMenuRef}>
              <button
                onClick={() => setIsServicesOpen((v) => !v)}
                className="inline-flex items-center text-emerald-50/90 hover:text-white transition-colors duration-200"
                aria-haspopup="menu"
                aria-expanded={isServicesOpen}
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
                <div className="absolute left-0 mt-2 w-64 rounded-xl shadow-lg bg-emerald-950 border border-emerald-900/40 py-2 z-50">
                  <Link
                    href="/services"
                    className="block px-4 py-2 text-sm text-emerald-50/90 hover:bg-white/10 hover:text-white"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    All services
                  </Link>
                  <div className="my-1 h-px bg-white/10" />
                  <Link
                    href="/services/custom-software"
                    className="block px-4 py-2 text-sm text-emerald-50/90 hover:bg-white/10 hover:text-white"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    Custom software
                  </Link>
                  <Link
                    href="/services/mobile-apps"
                    className="block px-4 py-2 text-sm text-emerald-50/90 hover:bg-white/10 hover:text-white"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    Mobile apps
                  </Link>
                  <Link
                    href="/services/business-automation"
                    className="block px-4 py-2 text-sm text-emerald-50/90 hover:bg-white/10 hover:text-white"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    Business automation
                  </Link>
                  <Link
                    href="/services/ecommerce"
                    className="block px-4 py-2 text-sm text-emerald-50/90 hover:bg-white/10 hover:text-white"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    E‑commerce & digital products
                  </Link>
                </div>
              )}
            </div>
            <Link href="/products" className="text-emerald-50/90 hover:text-white transition-colors duration-200">
              Products
            </Link>
            <Link href="/portfolio" className="text-emerald-50/90 hover:text-white transition-colors duration-200">
              Portfolio
            </Link>
            <Link href="/about" className="text-emerald-50/90 hover:text-white transition-colors duration-200">
              About
            </Link>
            <Link href="/contact" className="text-emerald-50/90 hover:text-white transition-colors duration-200">
              Contact
            </Link>
            <Link href="/track-request" className="text-emerald-50/90 hover:text-white transition-colors duration-200">
              Track Request
            </Link>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-emerald-50/90 hover:text-white transition-colors duration-200 flex items-center">
                  <UserIcon className="h-5 w-5 mr-1" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-emerald-50/90 hover:text-white transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={openSignupModal}
                  className="bg-white text-emerald-950 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
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
              className="text-emerald-50/90 hover:text-white transition-colors duration-200"
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-emerald-950 border-t border-emerald-900/40">
              <Link 
                href="/services" 
                className="block px-3 py-2 text-emerald-50/90 hover:text-white transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/products" 
                className="block px-3 py-2 text-emerald-50/90 hover:text-white transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/portfolio" 
                className="block px-3 py-2 text-emerald-50/90 hover:text-white transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link 
                href="/about" 
                className="block px-3 py-2 text-emerald-50/90 hover:text-white transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="block px-3 py-2 text-emerald-50/90 hover:text-white transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/track-request" 
                className="block px-3 py-2 text-emerald-50/90 hover:text-white transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Track Request
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block px-3 py-2 text-emerald-50/90 hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-emerald-50/90 hover:text-white transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={openSignupModal}
                    className="block px-3 py-2 bg-white text-emerald-950 rounded-lg font-medium mx-3"
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