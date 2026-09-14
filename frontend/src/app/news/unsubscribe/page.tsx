'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PublicPage from '@/components/PublicPage'
import { insightsAPI } from '@/lib/api'

function UnsubscribeStatus() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [message, setMessage] = useState('Updating your subscription...')

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus('error')
        setMessage('This unsubscribe link is missing a token.')
        return
      }
      try {
        await insightsAPI.unsubscribe(token)
        setStatus('ok')
        setMessage('You have been unsubscribed from Quantis news briefs.')
      } catch (err: any) {
        setStatus('error')
        setMessage(err?.response?.data?.message || 'We could not update that subscription.')
      }
    }
    run()
  }, [token])

  return (
    <section className="wide-container px-4 sm:px-6 lg:px-8 py-24 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">News briefs</h1>
      <p className={status === 'error' ? 'text-crimson-800 mb-8' : 'text-granite-700 mb-8'}>{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/news" className="btn-primary">
          Back to News
        </Link>
        {status === 'ok' && (
          <Link href="/news" className="inline-flex items-center justify-center rounded-lg border border-granite-300 px-4 py-2">
            Resubscribe anytime from the news page
          </Link>
        )}
      </div>
    </section>
  )
}

export default function UnsubscribePage() {
  return (
    <PublicPage>
      <Suspense fallback={<div className="py-24 text-center text-granite-600">Loading...</div>}>
        <UnsubscribeStatus />
      </Suspense>
    </PublicPage>
  )
}
