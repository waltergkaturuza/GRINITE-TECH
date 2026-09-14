'use client'

import { useEffect, useMemo, useState } from 'react'
import { CommandLineIcon, MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { getApiBaseUrl } from '@/lib/apiBase'

interface SearchResult {
  query: string
  products: Array<{ id: string; name: string; description?: string }>
  services: Array<{ id: string; title: string; description: string; category: string }>
  insights?: Array<{ id: string; name: string; description?: string; path: string; category?: string }>
  actions: Array<{ label: string; path: string }>
}

interface SearchCommandProps {
  isOpen: boolean
  onClose: () => void
}

const LOCAL_PAGES: Array<{ label: string; path: string; keywords: string[] }> = [
  { label: 'Home', path: '/', keywords: ['home', 'quantis'] },
  { label: 'About', path: '/about', keywords: ['about', 'company'] },
  { label: 'Contact', path: '/contact', keywords: ['contact', 'help', 'support', 'sales'] },
  { label: 'Services', path: '/services', keywords: ['services', 'offerings'] },
  { label: 'Custom software', path: '/services/custom-software', keywords: ['custom', 'software'] },
  { label: 'Fuel management systems', path: '/services/fuel-management-system-africa', keywords: ['fuel', 'coupon'] },
  { label: 'Mobile apps', path: '/services/mobile-apps', keywords: ['mobile', 'app'] },
  { label: 'Business automation', path: '/services/business-automation', keywords: ['automation'] },
  { label: 'E-commerce', path: '/services/ecommerce', keywords: ['ecommerce', 'shop'] },
  { label: 'Products', path: '/products', keywords: ['products', 'store'] },
  { label: 'News & Updates', path: '/news', keywords: ['news', 'updates', 'blog', 'insights', 'research'] },
  { label: 'Subscribe to news briefs', path: '/news', keywords: ['subscribe', 'newsletter', 'email', 'brief'] },
  { label: 'Portfolio', path: '/portfolio', keywords: ['portfolio', 'work', 'projects'] },
  { label: 'Technical Skills', path: '/portfolio#technical-skills', keywords: ['skills', 'technical'] },
  { label: 'Featured Work', path: '/portfolio#featured-work', keywords: ['featured', 'projects'] },
  { label: 'Experience & Approach', path: '/portfolio#experience-approach', keywords: ['experience', 'approach'] },
  { label: 'Partner With Quantis', path: '/portfolio#partner-with-quantis', keywords: ['partner', 'hire'] },
  { label: 'Track request', path: '/track-request', keywords: ['track', 'status', 'request'] },
  { label: 'Login', path: '/login', keywords: ['login', 'signin', 'admin'] },
]

function localSearch(query: string): SearchResult {
  const q = query.trim().toLowerCase()
  const actions = q
    ? LOCAL_PAGES.filter(
        (p) =>
          p.label.toLowerCase().includes(q) || p.keywords.some((k) => k.includes(q) || q.includes(k)),
      )
    : LOCAL_PAGES
  return {
    query,
    products: [],
    services: [],
    actions: actions.map(({ label, path }) => ({ label, path })),
  }
}

function mergeResults(api: SearchResult | null, local: SearchResult): SearchResult {
  if (!api) return local
  const seen = new Set(api.actions.map((a) => a.path))
  const extra = local.actions.filter((a) => !seen.has(a.path))
  return {
    query: api.query || local.query,
    products: api.products || [],
    services: api.services || [],
    insights: api.insights || [],
    actions: [...(api.actions || []), ...extra],
  }
}

export default function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiResults, setApiResults] = useState<SearchResult | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setApiResults(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const handler = setTimeout(async () => {
      if (!query.trim()) {
        setApiResults(null)
        return
      }
      try {
        setLoading(true)
        const res = await fetch(`${getApiBaseUrl()}/search?q=${encodeURIComponent(query)}`)
        if (!res.ok) {
          setApiResults(null)
          return
        }
        const json = await res.json()
        setApiResults(json.data || json)
      } catch {
        setApiResults(null)
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(handler)
  }, [query, isOpen])

  const results = useMemo(() => {
    const local = localSearch(query)
    if (!query.trim()) {
      return { ...local, actions: LOCAL_PAGES.slice(0, 8).map(({ label, path }) => ({ label, path })) }
    }
    return mergeResults(apiResults, local)
  }, [query, apiResults])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/40 backdrop-blur-sm px-4 pt-24 sm:pt-32"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-granite-800 shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services, products, or pages…"
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button onClick={onClose} className="ml-2 text-xs text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
            Esc
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!query && (
            <div className="px-4 pt-3 pb-1 text-xs text-gray-500 dark:text-gray-300 flex items-center space-x-2">
              <CommandLineIcon className="h-4 w-4" />
              <span>Search pages, services, and products. Ctrl+K to open anytime.</span>
            </div>
          )}

          {loading && <div className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">Searching…</div>}

          {results && (
            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {results.actions?.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Pages
                  </p>
                  <ul className="space-y-1">
                    {results.actions.map((a) => (
                      <li key={a.path}>
                        <Link
                          href={a.path}
                          onClick={onClose}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10"
                        >
                          <span>{a.label}</span>
                          <ArrowRightIcon className="h-4 w-4 text-gray-400 dark:text-gray-300" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.services?.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Services
                  </p>
                  <ul className="space-y-1">
                    {results.services.map((s) => (
                      <li key={`service-${s.id}`}>
                        <Link
                          href={`/services?highlight=${encodeURIComponent(s.title)}`}
                          onClick={onClose}
                          className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.title}</span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-300">{s.category}</span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-300 line-clamp-2">{s.description}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.insights && results.insights.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    News & Updates
                  </p>
                  <ul className="space-y-1">
                    {results.insights.map((item) => (
                      <li key={`insight-${item.id}`}>
                        <Link
                          href={item.path}
                          onClick={onClose}
                          className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                          {item.description && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-300 line-clamp-2">{item.description}</p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {results.products?.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Products
                  </p>
                  <ul className="space-y-1">
                    {results.products.map((p) => (
                      <li key={`product-${p.id}`}>
                        <Link
                          href={`/products?highlight=${encodeURIComponent(p.name)}`}
                          onClick={onClose}
                          className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</p>
                          {p.description && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-300 line-clamp-2">{p.description}</p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(results.products?.length || 0) === 0 &&
                (results.services?.length || 0) === 0 &&
                (results.actions?.length || 0) === 0 && (
                  <div className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">No results for “{results.query}”.</div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
