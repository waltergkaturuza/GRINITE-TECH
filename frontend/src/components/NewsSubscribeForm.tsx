'use client'

import { FormEvent, useState } from 'react'
import { insightsAPI } from '@/lib/api'

type Variant = 'card' | 'compact' | 'footer'

export default function NewsSubscribeForm({ variant = 'card' }: { variant?: Variant }) {
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setMessage('')
      await insightsAPI.subscribe(email)
      setEmail('')
      setMessage("You're on the list. We'll email a short brief when the next update goes live.")
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not subscribe right now. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (variant === 'footer') {
    return (
      <form onSubmit={submit} className="max-w-xl mx-auto">
        <p className="text-sm font-semibold text-yellow-900 mb-2">Subscribe to news briefs</p>
        <p className="text-gray-300 text-sm mb-3">
          Get an email automatically when we publish a news item or update.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Work email"
            className="flex-1 rounded-lg bg-granite-900 border border-granite-600 text-white px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-crimson-900 hover:bg-crimson-800 px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
        {message && <p className="text-jungle-300 text-xs mt-2">{message}</p>}
        {error && <p className="text-crimson-300 text-xs mt-2">{error}</p>}
      </form>
    )
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={submit} className="rounded-2xl border border-granite-200 bg-white p-5">
        <h3 className="font-semibold text-granite-900 mb-1">Get news briefs by email</h3>
        <p className="text-sm text-granite-600 mb-4">
          A short note when Quantis publishes a new update. Unsubscribe anytime.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Work email"
            className="flex-1 rounded-xl border border-granite-300 px-3 py-2"
          />
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
        {message && <p className="text-jungle-800 text-sm mt-2">{message}</p>}
        {error && <p className="text-crimson-800 text-sm mt-2">{error}</p>}
      </form>
    )
  }

  return (
    <form onSubmit={submit} className="mt-4 pt-4 border-t border-white/10">
      <p className="text-sm font-semibold text-white mb-1">Subscribe to news briefs</p>
      <p className="text-xs text-granite-200 mb-3">Email me when a new update is published.</p>
      <div className="flex flex-col gap-2">
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Work email"
          className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-granite-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-white text-granite-900 font-semibold px-4 py-2.5 hover:bg-granite-100 disabled:opacity-60"
        >
          {saving ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
      {message && <p className="text-jungle-200 text-xs mt-2">{message}</p>}
      {error && <p className="text-crimson-200 text-xs mt-2">{error}</p>}
    </form>
  )
}
