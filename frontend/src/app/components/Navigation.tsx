'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide ${
        isDark
          ? 'border-emerald-900 bg-emerald-800 text-white hover:bg-emerald-900'
          : 'border-emerald-800/30 bg-white text-emerald-800 hover:bg-emerald-50'
      }`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
    >
      {isDark ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
      <span className="hidden xl:inline">{isDark ? 'Dark' : 'Light'}</span>
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

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  return (
    <div className="relative overflow-visible notranslate" ref={langMenuRef} translate="no">
      <button
        type="button"
        onClick={() => setIsLangOpen((v) => !v)}
        className="inline-flex items-stretch overflow-hidden rounded-md border border-emerald-800/30"
        aria-label={`Language: ${current.name}`}
        aria-expanded={isLangOpen}
      >
        <span className="bg-emerald-800 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white">
          {current.label}
        </span>
        <span className="inline-flex items-center bg-white px-2 text-emerald-800 hover:bg-emerald-50">
          <svg className={`h-3 w-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none">
            <path d="M5.5 7.5L10 12L14.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {isLangOpen && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-granite-200 bg-white py-2 shadow-xl z-[70]">
          <p className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            Languages
          </p>
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLang(item.code)
                setIsLangOpen(false)
              }}
              className={`flex w-full items-center justify-between px-4 py-2 text-xs hover:bg-emerald-50 ${
                lang === item.code ? 'bg-emerald-50 text-emerald-950 font-semibold' : 'text-emerald-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-6 font-bold">{item.label}</span>
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

function GrooveChevron({ open = false }: { open?: boolean }) {
  return (
    <svg
      className={`mt-0.5 h-3 w-3 text-slate-700 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M5.5 7.5L10 12L14.5 7.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function grooveItemClass(active: boolean) {
  return `flex w-full flex-col items-start gap-0.5 px-5 py-3.5 text-left text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-800 ${
    active
      ? 'rounded-[1.15rem] border border-sky-100 bg-sky-100 shadow-[inset_0_1px_3px_rgba(15,23,42,0.05)]'
      : 'rounded-[1.15rem] border border-white bg-slate-100 shadow-[inset_0_2px_6px_rgba(15,23,42,0.07),0_1px_0_rgba(255,255,255,0.95)]'
  }`
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false)
  const [mobileAccordion, setMobileAccordion] = useState<'services' | 'portfolio' | null>(null)
  const { lang } = useLanguage()
  const servicesMenuRef = useRef<HTMLDivElement>(null)
  const portfolioMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) setMobileAccordion(null)
  }, [isMenuOpen])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!isServicesOpen && !isPortfolioOpen) return
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target
      if (!(target instanceof Node)) return
      if (isServicesOpen && servicesMenuRef.current && !servicesMenuRef.current.contains(target)) {
        setIsServicesOpen(false)
      }
      if (isPortfolioOpen && portfolioMenuRef.current && !portfolioMenuRef.current.contains(target)) {
        setIsPortfolioOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [isServicesOpen, isPortfolioOpen])

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
    'whitespace-nowrap text-xs xl:text-sm font-medium text-emerald-800 hover:text-emerald-950 transition-colors duration-200'
  const dropdownItemClass =
    'block rounded-xl border border-white bg-slate-100 px-4 py-2.5 text-sm text-slate-800 shadow-[inset_0_1px_3px_rgba(15,23,42,0.06)] hover:bg-sky-50'
  const portfolioSections = [
    { href: '/portfolio#technical-skills', id: 'technical-skills', key: 'nav.portfolio.skills' },
    { href: '/portfolio#featured-work', id: 'featured-work', key: 'nav.portfolio.featured' },
    { href: '/portfolio#experience-approach', id: 'experience-approach', key: 'nav.portfolio.experience' },
    { href: '/portfolio#partner-with-quantis', id: 'partner-with-quantis', key: 'nav.portfolio.partner' },
  ] as const

  const goToPortfolioSection = (id: string) => {
    setIsPortfolioOpen(false)
    setIsMenuOpen(false)
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-granite-200 sticky top-0 z-50 overflow-visible">
      <div className="w-full px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="flex items-center h-16 gap-3 overflow-visible">
          {/* Far left: cropped wordmark at bar height, not a taller bar */}
          <Link href="/" className="flex items-center shrink-0 h-16 py-1.5 max-w-[9.75rem] lg:max-w-[11.5rem] xl:max-w-[13.5rem]">
            <img
              src={QUANTIS_LOGO_URL}
              alt="Quantis Technologies logo"
              className="h-full w-auto max-w-full object-contain object-left"
            />
          </Link>

          {/* Center: desktop links from lg (1024+) so iPad portrait uses the menu */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-3 xl:gap-7 min-w-0">
            <Link href="/" className={linkClass}>
              {t(lang, 'nav.home')}
            </Link>
            <div className="relative" ref={servicesMenuRef}>
              <button
                onClick={() => {
                  setIsServicesOpen((v) => !v)
                  setIsPortfolioOpen(false)
                }}
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
                <div className="absolute left-1/2 z-50 mt-2 w-64 -translate-x-1/2 space-y-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                  <Link
                    href="/services"
                    className={dropdownItemClass}
                    onClick={() => setIsServicesOpen(false)}
                  >
                    {t(lang, 'nav.services')}
                  </Link>
                  <Link
                    href="/services/custom-software"
                    className={dropdownItemClass}
                    onClick={() => setIsServicesOpen(false)}
                  >
                    Custom software
                  </Link>
                  <Link
                    href="/services/fuel-management-system-africa"
                    className={dropdownItemClass}
                    onClick={() => setIsServicesOpen(false)}
                  >
                    Fuel management systems
                  </Link>
                  <Link
                    href="/services/mobile-apps"
                    className={dropdownItemClass}
                    onClick={() => setIsServicesOpen(false)}
                  >
                    Mobile apps
                  </Link>
                  <Link
                    href="/services/business-automation"
                    className={dropdownItemClass}
                    onClick={() => setIsServicesOpen(false)}
                  >
                    Business automation
                  </Link>
                  <Link
                    href="/services/ecommerce"
                    className={dropdownItemClass}
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
            <Link href="/news" className={linkClass}>
              {t(lang, 'nav.news')}
            </Link>
            <div className="relative" ref={portfolioMenuRef}>
              <button
                onClick={() => {
                  setIsPortfolioOpen((v) => !v)
                  setIsServicesOpen(false)
                }}
                className={`inline-flex items-center ${linkClass}`}
                aria-haspopup="menu"
                aria-expanded={isPortfolioOpen}
              >
                <span>{t(lang, 'nav.portfolio')}</span>
                <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="none">
                  <path d="M5.5 7.5L10 12L14.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {isPortfolioOpen && (
                <div className="absolute left-1/2 z-50 mt-2 w-64 -translate-x-1/2 space-y-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                  {portfolioSections.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={dropdownItemClass}
                      onClick={() => goToPortfolioSection(item.id)}
                    >
                      {t(lang, item.key)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
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
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto notranslate" translate="no">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-md text-emerald-800 hover:bg-emerald-50"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <ThemeToggle />
            <LanguageMenu />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-emerald-800 hover:text-emerald-950 p-1"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-3">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-800">
                  Menu
                </p>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2.5">
                <Link
                  href="/"
                  className={grooveItemClass(pathname === '/')}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(lang, 'nav.home')}
                </Link>

                <div>
                  <button
                    type="button"
                    className={grooveItemClass(pathname.startsWith('/services'))}
                    aria-expanded={mobileAccordion === 'services'}
                    onClick={() =>
                      setMobileAccordion((current) => (current === 'services' ? null : 'services'))
                    }
                  >
                    {t(lang, 'nav.services')}
                    <GrooveChevron open={mobileAccordion === 'services'} />
                  </button>
                  {mobileAccordion === 'services' && (
                    <div className="mt-1.5 space-y-1.5 pl-2">
                      {[
                        { href: '/services', label: t(lang, 'nav.services') },
                        { href: '/services/custom-software', label: 'Custom software' },
                        { href: '/services/fuel-management-system-africa', label: 'Fuel management systems' },
                        { href: '/services/mobile-apps', label: 'Mobile apps' },
                        { href: '/services/business-automation', label: 'Business automation' },
                        { href: '/services/ecommerce', label: 'E‑commerce & digital products' },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block w-full rounded-xl border border-white bg-slate-50 px-4 py-2.5 text-sm text-slate-700 shadow-[inset_0_1px_3px_rgba(15,23,42,0.05)]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/products"
                  className={grooveItemClass(pathname.startsWith('/products'))}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(lang, 'nav.products')}
                </Link>

                <Link
                  href="/news"
                  className={grooveItemClass(pathname.startsWith('/news'))}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(lang, 'nav.news')}
                </Link>

                <div>
                  <button
                    type="button"
                    className={grooveItemClass(pathname.startsWith('/portfolio'))}
                    aria-expanded={mobileAccordion === 'portfolio'}
                    onClick={() =>
                      setMobileAccordion((current) => (current === 'portfolio' ? null : 'portfolio'))
                    }
                  >
                    {t(lang, 'nav.portfolio')}
                    <GrooveChevron open={mobileAccordion === 'portfolio'} />
                  </button>
                  {mobileAccordion === 'portfolio' && (
                    <div className="mt-1.5 space-y-1.5 pl-2">
                      {portfolioSections.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="block w-full rounded-xl border border-white bg-slate-50 px-4 py-2.5 text-sm text-slate-700 shadow-[inset_0_1px_3px_rgba(15,23,42,0.05)]"
                          onClick={() => goToPortfolioSection(item.id)}
                        >
                          {t(lang, item.key)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/about"
                  className={grooveItemClass(pathname.startsWith('/about'))}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(lang, 'nav.about')}
                </Link>

                <Link
                  href="/contact"
                  className={grooveItemClass(pathname.startsWith('/contact'))}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(lang, 'nav.contact')}
                </Link>

                {isLoggedIn && (
                  <>
                    <Link
                      href="/dashboard"
                      className={grooveItemClass(pathname.startsWith('/dashboard'))}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className={`${grooveItemClass(false)} !bg-crimson-900 !text-white !border-crimson-800`}
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
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