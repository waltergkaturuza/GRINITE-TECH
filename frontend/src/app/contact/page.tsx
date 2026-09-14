'use client'

import { Suspense } from 'react'
import PublicPage from '@/components/PublicPage'
import ContactContent from './ContactContent'

export default function ContactPage() {
  return (
    <PublicPage>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crimson-600"></div>
        </div>
      }>
        <ContactContent />
      </Suspense>
    </PublicPage>
  )
}
