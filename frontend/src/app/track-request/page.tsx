'use client'

import PublicPage from '@/components/PublicPage'
import TrackRequestPanel from '@/components/TrackRequestPanel'

export default function TrackRequestPage() {
  return (
    <PublicPage>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <TrackRequestPanel variant="page" />
        </div>
      </div>
    </PublicPage>
  )
}
