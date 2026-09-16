'use client'

import { QueryClient, QueryClientProvider } from 'react-query'
import { useState } from 'react'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { ThemeProvider } from '@/theme/ThemeProvider'
import PageTranslator from '@/components/PageTranslator'
import AnalyticsTracker from '@/components/AnalyticsTracker'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000, // 5 seconds
        cacheTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          {children}
          <AnalyticsTracker />
          <PageTranslator />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}