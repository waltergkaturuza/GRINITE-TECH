'use client'

import { Suspense } from 'react'
import Navigation from '../components/Navigation'
import ContactContent from './ContactContent'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
      <Navigation />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crimson-600"></div>
        </div>
      }>
        <ContactContent />
      </Suspense>
    </div>
  )
}
