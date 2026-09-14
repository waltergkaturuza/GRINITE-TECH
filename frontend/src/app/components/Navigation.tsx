'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bars3Icon, XMarkIcon, UserIcon, MagnifyingGlassIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import LoginModal from '@/components/LoginModal'
import SignupModal from '@/components/SignupModal'
import SearchCommand from '@/components/SearchCommand'
import { useLanguage } from '@/i18n/LanguageProvider'
import { t } from '@/i18n/config'
import { QUANTIS_LOGO_URL } from '@/constants/company'
import { useTheme } from '@/theme/ThemeProvider'
import type { Lang } from '@/i18n/config'

const LANGUAGES: { code: Lang; region: string; label: string; name: string }[] = [
  { code: 'en', region: 'GB', label: 'EN', name: 'English' },
  { code: 'fr', region: 'FR', label: 'FR', name: 'Français' },
  { code: 'sn', region: 'ZW', label: 'SN', name: 'ChiShona' },
  { code: 'zh', region: 'CN', label: 'ZH', name: '中文' },
  { code: 'pt', region: 'PT', label: 'PT', name: 'Português' },
  { code: 'ja', region: 'JP', label: 'JA', name: '日本語' },
  { code: 'ru', region: 'RU', label: 'RU', name: 'Русский' },
  { code: 'el', region: 'GR', label: 'EL', name: 'Ελληνικά' },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex items-center gap-1.5 rounded-md border border-emerald-800/30 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800 hover:bg-emerald-50"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
      <span>{isDark ? 'Dark' : 'Light'}</span>
    </button>
  )
}

function LanguageMenu() {
  const { lang, setLang } = useLanguage()
  const [isLangOpen, setIsLangOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLangOpen) return
    const onMouseDown = (e: MouseEvent) => {
      const el = langMenuRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) {
        setIsLangOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [isLangOpen])

  const pill = (code: Lang, label: string) => (
    <button
      key={code}
      type="button"
      onClick={() => setLang(code)}
      className={`px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
        lang === code
          ? 'bg-emerald-800 text-white'
          : 'bg-white text-emerald-800 hover:bg-emerald-50'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="relative flex items-stretch overflow-hidden rounded-md border border-emerald-800/30" ref={langMenuRef}>
      {pill('en', 'EN')}
      {pill('fr', 'FR')}
      <button
        type="button"
        onClick={() => setIsLangOpen((v) => !v)}
        className="border-l border-emerald-800/30 bg-white px-2 text-emerald-800 hover:bg-emerald-50"
        aria-label="More languages"
        aria-expanded={isLangOpen}
      >
        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="none">
          <path d="M5.5 7.5L10 12L14.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {isLangOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-granite-200 bg-white py-2 shadow-xl z-50">
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLang(item.code)
                setIsLangOpen(false)
              }}
              className="flex w-full items-center justify-between px-4 py-2 text-xs text-emerald-900 hover:bg-emerald-50"
            >
              <span className="flex items-center gap-2">
                <span className="font-semibold">{item.label}</span>
                <span>{item.name}</span>
              </span>
              {lang === item.code && <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const { lang } = useLanguage()
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

  const linkClass =
    'text-sm font-medium text-emerald-800 hover:text-emerald-950 transition-colors duration-200'
  const mobileLinkClass =
    'block px-3 py-2 text-emerald-800 hover:text-emerald-950'

  return (
    <nav className="bg-white shadow-sm border-b border-granite-200 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-[5.5rem] gap-4">
          {/* Far left: logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img
              src={QUANTIS_LOGO_URL}
              alt="Quantis Technologies logo"
              className="h-12 sm:h-16 w-auto max-w-[min(55vw,260px)] object-contain object-left"
            />
          </Link>

          {/* Center: About and other links */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8 min-w-0">
            <Link href="/" className={linkClass}>
              {t(lang, 'nav.home')}
            </Link>
            <div className="relative" ref={servicesMenuRef}>
              <button
                onClick={() => setIsServicesOpen((v) => !v)}
                className={`inline-flex items-center ${linkClass}`}
                aria-haspopup="menu"
                aria-expanded={isServicesOpen}
              >
                <span>{t(lang, 'nav.services')}</span>
                <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="none">
                  <path d="M5.5 7.5L10 12L14.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {isServicesOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl shadow-lg bg-white border border-granite-200 py-2 z-50">
                  <Link
                    href="/services"
                    className="block px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-50"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    {t(lang, 'nav.services')}
                  </Link>
                  <div className="my-1 h-px bg-granite-200" />
                  <Link
                    href="/services/custom-software"
                    className="block px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-50"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    Custom software
                  </Link>
                  <Link
                    href="/services/fuel-management-system-africa"
                    className="block px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-50"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    Fuel management systems
                  </Link>
                  <Link
                    href="/services/mobile-apps"
                    className="block px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-50"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    Mobile apps
                  </Link>
                  <Link
                    href="/services/business-automation"
                    className="block px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-50"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    Business automation
                  </Link>
                  <Link
                    href="/services/ecommerce"
                    className="block px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-50"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    E‑commerce & digital products
                  </Link>
                </div>
              )}
            </div>
            <Link href="/products" className={linkClass}>
              {t(lang, 'nav.products')}
            </Link>
            <Link href="/portfolio" className={linkClass}>
              {t(lang, 'nav.portfolio')}
            </Link>
            <Link href="/about" className={linkClass}>
              {t(lang, 'nav.about')}
            </Link>
            <Link href="/contact" className={linkClass}>
              {t(lang, 'nav.contact')}
            </Link>
            {isLoggedIn && (
              <>
                <Link href="/dashboard" className={`${linkClass} inline-flex items-center`}>
                  <UserIcon className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className={linkClass}>
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Far right: search, theme, language */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-md text-emerald-800 hover:bg-emerald-50"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <ThemeToggle />
            <LanguageMenu />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-emerald-800 hover:text-emerald-950 p-1"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-granite-200 bg-white">
              <Link href="/" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>
                {t(lang, 'nav.home')}
              </Link>
              <Link href="/services" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>
                {t(lang, 'nav.services')}
              </Link>
              <Link href="/products" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>
                {t(lang, 'nav.products')}
              </Link>
              <Link href="/portfolio" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>
                {t(lang, 'nav.portfolio')}
              </Link>
              <Link href="/about" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>
                {t(lang, 'nav.about')}
              </Link>
              <Link href="/contact" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>
                {t(lang, 'nav.contact')}
              </Link>
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className={`${mobileLinkClass} w-full text-left`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={openSignupModal}
                  className="block px-3 py-2 bg-emerald-900 text-white rounded-lg font-medium mx-3"
                >
                  Get Started
                </button>
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