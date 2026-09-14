'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { insightsAPI } from '@/lib/api'
import NewsSubscribeForm from '@/components/NewsSubscribeForm'
import PageBackdrop from '@/components/PageBackdrop'
import { warmupBackend } from '@/lib/warmupBackend'
import { QUANTIS_LOGO_URL } from '@/constants/company'
import {
  INSIGHT_CATEGORIES,
  InsightPost,
  categoryLabel,
  categoryTone,
  formatInsightDate,
  getStoredUser,
} from '@/lib/insights'

export default function NewsHub() {
  const [posts, setPosts] = useState<InsightPost[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [askOpen, setAskOpen] = useState(false)
  const [askSaving, setAskSaving] = useState(false)
  const [askForm, setAskForm] = useState({
    title: '',
    body: '',
    category: 'community',
    authorName: '',
    authorEmail: '',
  })

  useEffect(() => {
    const user = getStoredUser()
    if (user) {
      setAskForm((prev) => ({
        ...prev,
        authorName: [user.firstName, user.lastName].filter(Boolean).join(' '),
        authorEmail: user.email || '',
      }))
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        await warmupBackend(20000)
        const data = await insightsAPI.getPublished({
          category: category === 'all' ? undefined : category,
          search: search.trim() || undefined,
        })
        setPosts(data.items || data || [])
        setCounts(data.counts || {})
      } catch (err) {
        console.error(err)
        setError('Could not load updates right now. Please wait a moment and try again.')
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(load, search ? 250 : 0)
    return () => clearTimeout(timer)
  }, [category, search])

  const featured = useMemo(() => posts.find((p) => p.featured) || posts[0], [posts])
  const rest = useMemo(
    () => posts.filter((p) => p.id !== featured?.id && p.kind !== 'question'),
    [posts, featured],
  )
  const questions = useMemo(() => posts.filter((p) => p.kind === 'question'), [posts])
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0)

  const submitQuestion = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setAskSaving(true)
      await warmupBackend(20000)
      const created = await insightsAPI.askQuestion(askForm)
      setAskOpen(false)
      setAskForm((prev) => ({ ...prev, title: '', body: '' }))
      window.location.href = `/news/${created.slug}`
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not publish your question.')
    } finally {
      setAskSaving(false)
    }
  }

  return (
    <>
      <section className="relative overflow-hidden bg-granite-900 text-white">
        <PageBackdrop src="/wallpaper.jpg" priority />
        <div className="relative wide-container px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <p className="text-yellow-900 font-semibold tracking-[0.2em] uppercase text-xs mb-6">
            Quantis Insights
          </p>
          <div className="grid lg:grid-cols-[1.4fr_0.8fr] gap-10 items-start">
            <div>
              <div className="overflow-visible w-full max-w-[360px] mb-6 sm:mb-8">
                <div className="quantis-logo-hinge">
                  <img
                    src={QUANTIS_LOGO_URL}
                    alt="Quantis Technologies"
                    className="quantis-logo-on-dark h-24 sm:h-28 lg:h-28 w-auto max-w-full object-contain object-left"
                  />
                </div>
              </div>
              <h1 className="text-site-max font-bold leading-tight mb-5">
                News & Updates
              </h1>
              <p className="text-lg text-granite-200 max-w-2xl">
                Product launches, promotions, engineering notes, and a public research desk. Read what we are
                shipping—then add a view, a question, or a field-tested contribution.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-sm text-granite-200 mb-4">
                Community contributions work like a focused Stack Overflow: vote the useful answers up, reply in
                threads, and accept the one that actually solves the problem.
              </p>
              <button
                type="button"
                onClick={() => setAskOpen(true)}
                className="inline-flex items-center justify-center w-full rounded-xl bg-yellow-900 text-on-light font-semibold px-4 py-3 hover:bg-yellow-800"
              >
                <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
                Ask a question
              </button>
              <NewsSubscribeForm />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-granite-200">
        <div className="wide-container px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 max-w-xl">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-granite-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search news, products, research, questions..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-granite-300 focus:ring-2 focus:ring-crimson-500 focus:outline-none"
              />
            </div>
            {loading ? (
              <div className="h-8 w-64 rounded-lg bg-granite-100 animate-pulse" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {INSIGHT_CATEGORIES.map((item) => {
                  const count = item.id === 'all' ? total : counts[item.id] || 0
                  const active = category === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        active
                          ? 'bg-granite-800 text-white'
                          : 'bg-granite-100 text-granite-700 hover:bg-granite-200'
                      }`}
                    >
                      {item.label}
                      <span className="ml-1 opacity-70">{count}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-xl border border-crimson-200 bg-crimson-50 text-crimson-800 px-4 py-3">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-granite-100 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-granite-300">
              <SparklesIcon className="h-10 w-10 mx-auto text-granite-400 mb-3" />
              <h2 className="text-xl font-semibold mb-2">No updates in this filter yet</h2>
              <p className="text-granite-600 mb-6">Be the first to ask a question or check back after the next publish.</p>
              <button type="button" onClick={() => setAskOpen(true)} className="btn-primary">
                Start a discussion
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)] gap-10">
              <div className="space-y-8">
                {featured && (
                  <Link
                    href={`/news/${featured.slug}`}
                    className="group block overflow-hidden rounded-3xl border border-granite-200 bg-white shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <div className={`h-48 sm:h-64 ${featured.kind === 'question' ? 'bg-jungle-900' : 'bg-gradient-to-br from-granite-800 to-crimson-900'}`} />
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryTone(featured.category)}`}>
                          {categoryLabel(featured.category)}
                        </span>
                        {featured.kind === 'question' && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-jungle-700">Open question</span>
                        )}
                        <span className="text-sm text-granite-500">{formatInsightDate(featured.publishedAt)}</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-granite-900 group-hover:text-crimson-900 mb-3">
                        {featured.title}
                      </h2>
                      <p className="text-granite-600 text-lg mb-5">{featured.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-granite-500">
                        <span>{featured.authorName}</span>
                        <span className="inline-flex items-center gap-1">
                          <EyeIcon className="h-4 w-4" /> {featured.viewCount || 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ChatBubbleLeftRightIcon className="h-4 w-4" /> {featured.commentCount || 0}
                        </span>
                        <span className="inline-flex items-center ml-auto text-crimson-800 font-medium">
                          Read <ArrowRightIcon className="h-4 w-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                  {rest.map((post) => (
                    <Link
                      key={post.id}
                      href={`/news/${post.slug}`}
                      className="group rounded-2xl border border-granite-200 bg-white p-5 hover:border-crimson-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${categoryTone(post.category)}`}>
                          {categoryLabel(post.category)}
                        </span>
                        <span className="text-xs text-granite-500">{formatInsightDate(post.publishedAt)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-granite-900 group-hover:text-crimson-900 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-granite-600 line-clamp-3 mb-4">{post.excerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-granite-500">
                        <span className="inline-flex items-center gap-1">
                          <EyeIcon className="h-3.5 w-3.5" /> {post.viewCount || 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" /> {post.commentCount || 0}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <aside className="space-y-6">
                <NewsSubscribeForm variant="compact" />
                <div className="rounded-2xl border border-granite-200 bg-granite-50 p-5">
                  <h3 className="font-semibold text-granite-900 mb-3">Open questions</h3>
                  {questions.length === 0 ? (
                    <p className="text-sm text-granite-600">No open research questions in this filter.</p>
                  ) : (
                    <ul className="space-y-3">
                      {questions.map((q) => (
                        <li key={q.id}>
                          <Link href={`/news/${q.slug}`} className="block hover:text-crimson-800">
                            <p className="font-medium text-sm">{q.title}</p>
                            <p className="text-xs text-granite-500 mt-1">
                              {q.commentCount || 0} contributions
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-2xl bg-granite-800 text-white p-5">
                  <h3 className="font-semibold mb-2">Contribute like a practitioner</h3>
                  <p className="text-sm text-granite-200 mb-4">
                    Share a view, a counter-example, or a short research note. Votes surface the answers operators
                    can actually use.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAskOpen(true)}
                    className="w-full rounded-xl bg-yellow-900 text-on-light font-semibold py-2.5"
                  >
                    Post a question
                  </button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      {askOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-start justify-center p-4 overflow-y-auto py-10">
          <form
            onSubmit={submitQuestion}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-1">Ask the Quantis community</h2>
            <p className="text-sm text-granite-600 mb-5">
              Questions are published immediately. Keep it specific enough that someone can answer with evidence.
            </p>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              required
              minLength={12}
              value={askForm.title}
              onChange={(e) => setAskForm({ ...askForm, title: e.target.value })}
              className="w-full mb-4 rounded-lg border border-granite-300 px-3 py-2"
              placeholder="How should we handle offline sync conflicts?"
            />
            <label className="block text-sm font-medium mb-1">Details</label>
            <textarea
              required
              minLength={20}
              rows={7}
              value={askForm.body}
              onChange={(e) => setAskForm({ ...askForm, body: e.target.value })}
              className="w-full mb-4 rounded-lg border border-granite-300 px-3 py-2"
              placeholder="Context, what you already tried, and what a useful answer would include."
            />
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your name</label>
                <input
                  required
                  value={askForm.authorName}
                  onChange={(e) => setAskForm({ ...askForm, authorName: e.target.value })}
                  className="w-full rounded-lg border border-granite-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={askForm.authorEmail}
                  onChange={(e) => setAskForm({ ...askForm, authorEmail: e.target.value })}
                  className="w-full rounded-lg border border-granite-300 px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setAskOpen(false)} className="px-4 py-2 rounded-lg border">
                Cancel
              </button>
              <button type="submit" disabled={askSaving} className="btn-primary disabled:opacity-60">
                {askSaving ? 'Publishing...' : 'Publish question'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
