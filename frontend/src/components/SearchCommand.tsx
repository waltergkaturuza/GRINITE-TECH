'use client'

import { useEffect, useState } from 'react'
import { CommandLineIcon, MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface SearchResult {
  query: string
  products: Array<{ id: string; name: string; description?: string }>
  services: Array<{ id: string; title: string; description: string; category: string }>
  actions: Array<{ label: string; path: string }>
}

interface SearchCommandProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = setTimeout(async () => {
      if (!query.trim()) {
        setResults(null)
        return
      }
      try {
        setLoading(true)
        const base = process.env.NEXT_PUBLIC_API_URL
        if (!base) return
        const res = await fetch(`${base}/search?q=${encodeURIComponent(query)}`)
        if (!res.ok) return
        const json = await res.json()
        setResults(json.data)
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(handler)
  }, [query, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 backdrop-blur-sm px-4 pt-24 sm:pt-32">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services, products, or actions…"
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
          />
          <button
            onClick={onClose}
            className="ml-2 text-xs text-gray-500 hover:text-gray-800"
          >
            Esc
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!query && (
            <div className="px-4 py-6 text-sm text-gray-500 flex items-center space-x-2">
              <CommandLineIcon className="h-4 w-4" />
              <span>Type to search services, products, or jump to key pages.</span>
            </div>
          )}

          {loading && (
            <div className="px-4 py-4 text-sm text-gray-500">Searching…</div>
          )}

          {results && !loading && (
            <div className="divide-y divide-gray-100">
              {results.actions?.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Quick actions
                  </p>
                  <ul className="space-y-1">
                    {results.actions.map((a) => (
                      <li key={a.path}>
                        <Link
                          href={a.path}
                          onClick={onClose}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-800"
                        >
                          <span>{a.label}</span>
                          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.services?.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Services
                  </p>
                  <ul className="space-y-1">
                    {results.services.map((s) => (
                      <li key={`service-${s.id}`}>
                        <Link
                          href={`/services?highlight=${encodeURIComponent(s.title)}`}
                          onClick={onClose}
                          className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {s.title}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              {s.category}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                            {s.description}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.products?.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Products
                  </p>
                  <ul className="space-y-1">
                    {results.products.map((p) => (
                      <li key={`product-${p.id}`}>
                        <Link
                          href={`/products?highlight=${encodeURIComponent(p.name)}`}
                          onClick={onClose}
                          className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {p.name}
                          </p>
                          {p.description && (
                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                              {p.description}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.products.length === 0 &&
                results.services.length === 0 &&
                results.actions.length === 0 && (
                  <div className="px-4 py-4 text-sm text-gray-500">
                    No results for “{results.query}”.
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

