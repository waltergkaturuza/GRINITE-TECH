'use client'

import Navigation from '@/app/components/Navigation'
import SiteFooter from '@/components/SiteFooter'

export default function PublicPage({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`public-page min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100 dark:from-granite-900 dark:via-granite-800 dark:to-granite-900 ${className}`}
    >
      <Navigation />
      {children}
      <SiteFooter />
    </div>
  )
}
