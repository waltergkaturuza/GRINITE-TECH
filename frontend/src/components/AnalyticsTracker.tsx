'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { normalizeAnalyticsPath, shouldSkipAnalyticsPath, trackPageView } from '@/lib/analytics'

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string | null>(null)

  useEffect(() => {
    const path = normalizeAnalyticsPath(pathname || '/')
    if (shouldSkipAnalyticsPath(path)) return
    if (lastTracked.current === path) return
    lastTracked.current = path
    void trackPageView(path)
  }, [pathname])

  return null
}
