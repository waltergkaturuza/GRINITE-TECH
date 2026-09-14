'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowUturnLeftIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import { insightsAPI } from '@/lib/api'
import {
  InsightComment,
  InsightPost,
  categoryLabel,
  categoryTone,
  formatInsightDate,
  getStoredUser,
  getVoterKey,
} from '@/lib/insights'

function Body({ text }: { text: string }) {
  return (
    <div className="space-y-4 text-[17px] leading-8 text-granite-700">
      {text.split(/\n\n+/).map((paragraph, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {paragraph}
        </p>
      ))}
    </div>
  )
}

function CommentCard({
  comment,
  depth = 0,
  isQuestion,
  canAccept,
  onReply,
  onVote,
  onAccept,
}: {
  comment: InsightComment
  depth?: number
  isQuestion: boolean
  canAccept: boolean
  onReply: (parentId: string) => void
  onVote: (id: string, value: 1 | -1) => void
  onAccept: (id: string) => void
}) {
  return (
    <article
      className={`rounded-2xl border p-4 sm:p-5 ${
        comment.accepted ? 'border-jungle-400 bg-jungle-50/60' : 'border-granite-200 bg-white'
      }`}
      style={{ marginLeft: depth ? Math.min(depth * 16, 48) : 0 }}
    >
      <div className="flex gap-4">
        <div className="flex flex-col items-center shrink-0 text-granite-500">
          <button type="button" aria-label="Upvote" onClick={() => onVote(comment.id, 1)} className="p-1 hover:text-crimson-800">
            <ChevronUpIcon className="h-6 w-6" />
          </button>
          <span className="font-semibold text-granite-800">{comment.voteScore || 0}</span>
          <button type="button" aria-label="Downvote" onClick={() => onVote(comment.id, -1)} className="p-1 hover:text-crimson-800">
            <ChevronDownIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
            <span className="font-semibold text-granite-900">{comment.authorName}</span>
            <span className="text-granite-500">{formatInsightDate(comment.createdAt)}</span>
            {comment.accepted && (
              <span className="inline-flex items-center gap-1 text-jungle-800 text-xs font-semibold">
                <CheckBadgeIcon className="h-4 w-4" /> Accepted answer
              </span>
            )}
          </div>
          <p className="whitespace-pre-wrap text-granite-700">{comment.body}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <button type="button" onClick={() => onReply(comment.id)} className="text-crimson-800 font-medium">
              Reply
            </button>
            {isQuestion && canAccept && !comment.parentId && (
              <button type="button" onClick={() => onAccept(comment.id)} className="text-jungle-800 font-medium">
                Accept
              </button>
            )}
          </div>
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <div key={reply.id} className="mt-4">
          <CommentCard
            comment={reply}
            depth={depth + 1}
            isQuestion={isQuestion}
            canAccept={false}
            onReply={onReply}
            onVote={onVote}
            onAccept={onAccept}
          />
        </div>
      ))}
    </article>
  )
}

export default function NewsArticle() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const [post, setPost] = useState<InsightPost | null>(null)
  const [comments, setComments] = useState<InsightComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [parentId, setParentId] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ body: '', authorName: '', authorEmail: '' })
  const user = getStoredUser()

  const load = async () => {
    try {
      setLoading(true)
      const item = await insightsAPI.getBySlug(slug)
      setPost(item)
      try {
        const thread = await insightsAPI.getComments(slug)
        setComments(Array.isArray(thread) ? thread : [])
      } catch {
        setComments([])
      }
    } catch {
      setError('This update could not be found.')
      setPost(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        authorName: [user.firstName, user.lastName].filter(Boolean).join(' '),
        authorEmail: user.email || '',
      }))
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await insightsAPI.addComment(slug, { ...form, parentId })
      setForm((prev) => ({ ...prev, body: '' }))
      setParentId(undefined)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not publish your contribution.')
    } finally {
      setSaving(false)
    }
  }

  const vote = async (id: string, value: 1 | -1) => {
    try {
      await insightsAPI.voteComment(id, value, getVoterKey())
      await load()
    } catch {
      setError('Voting failed. Try again in a moment.')
    }
  }

  const accept = async (id: string) => {
    try {
      await insightsAPI.acceptComment(id)
      await load()
    } catch {
      setError('You need to be signed in as the author or staff to accept an answer.')
    }
  }

  if (loading) {
    return <div className="wide-container px-4 py-24 text-center text-granite-500">Loading update...</div>
  }

  if (!post) {
    return (
      <div className="wide-container px-4 py-24 text-center">
        <p className="mb-4">{error || 'Update not found.'}</p>
        <Link href="/news" className="text-crimson-800 font-medium">
          Back to News & Updates
        </Link>
      </div>
    )
  }

  const canAccept = Boolean(user && (user.role === 'admin' || user.role === 'developer' || user.role === 'staff' || user.id === post.authorUserId))
  const isQuestion = post.kind === 'question'

  return (
    <article className="pb-16">
      <header className="bg-gradient-to-br from-granite-800 via-granite-900 to-crimson-950 text-white pt-24 pb-12">
        <div className="wide-container px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Link href="/news" className="text-sm text-yellow-300 hover:text-yellow-200">
            ← News & Updates
          </Link>
          <div className="flex flex-wrap items-center gap-3 mt-5 mb-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryTone(post.category)}`}>
              {categoryLabel(post.category)}
            </span>
            {isQuestion && (
              <span className="text-xs font-semibold uppercase tracking-wide text-yellow-300">Community question</span>
            )}
            <span className="text-sm text-granite-200">{formatInsightDate(post.publishedAt)}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">{post.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-granite-200">
            <span>{post.authorName}</span>
            <span className="inline-flex items-center gap-1">
              <EyeIcon className="h-4 w-4" /> {post.viewCount || 0} views
            </span>
            <span className="inline-flex items-center gap-1">
              <ChatBubbleLeftRightIcon className="h-4 w-4" /> {post.commentCount || 0} contributions
            </span>
          </div>
        </div>
      </header>

      <div className="wide-container px-4 sm:px-6 lg:px-8 max-w-4xl py-10">
        {error && (
          <div className="mb-6 rounded-xl border border-crimson-200 bg-crimson-50 text-crimson-800 px-4 py-3">{error}</div>
        )}
        {post.excerpt && <p className="text-xl text-granite-600 mb-8">{post.excerpt}</p>}
        <Body text={post.body} />

        <section className="mt-14 pt-8 border-t border-granite-200">
          <h2 className="text-2xl font-bold mb-2">{isQuestion ? 'Answers & discussion' : 'Views, questions & contributions'}</h2>
          <p className="text-granite-600 mb-6">
            Vote useful replies, add a counter-view, or drop a research note. Threads stay attached to this update.
          </p>

          <div className="space-y-4 mb-8">
            {comments.length === 0 && (
              <p className="text-granite-500">No contributions yet. Start the thread below.</p>
            )}
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                isQuestion={isQuestion}
                canAccept={canAccept}
                onReply={setParentId}
                onVote={vote}
                onAccept={accept}
              />
            ))}
          </div>

          <form onSubmit={submit} className="rounded-2xl border border-granite-200 bg-granite-50 p-5">
            <h3 className="font-semibold mb-3">
              {parentId ? 'Reply to a contribution' : isQuestion ? 'Write an answer' : 'Add your view'}
            </h3>
            {parentId && (
              <button type="button" onClick={() => setParentId(undefined)} className="text-sm text-crimson-800 mb-3 inline-flex items-center">
                <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
                Cancel reply
              </button>
            )}
            <textarea
              required
              minLength={8}
              rows={5}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full rounded-xl border border-granite-300 px-3 py-2 mb-4"
              placeholder="Be specific. Cite what you have seen in production if you can."
            />
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <input
                required
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                placeholder="Your name"
                className="rounded-xl border border-granite-300 px-3 py-2"
              />
              <input
                required
                type="email"
                value={form.authorEmail}
                onChange={(e) => setForm({ ...form, authorEmail: e.target.value })}
                placeholder="Email"
                className="rounded-xl border border-granite-300 px-3 py-2"
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Publishing...' : 'Publish contribution'}
            </button>
          </form>
        </section>
      </div>
    </article>
  )
}
