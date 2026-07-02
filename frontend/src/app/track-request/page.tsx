'use client'

import Navigation from '../components/Navigation'
import TrackRequestPanel from '@/components/TrackRequestPanel'

export default function TrackRequestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <TrackRequestPanel variant="page" />
        </div>
      </div>
    </div>
  )
}
