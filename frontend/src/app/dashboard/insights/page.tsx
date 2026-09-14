'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  NewspaperIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { insightsAPI } from '@/lib/api'
import { INSIGHT_CATEGORIES, InsightPost, categoryLabel, formatInsightDate } from '@/lib/insights'
import { isStaffRole } from '@/lib/dashboardRoles'

type Tab = 'posts' | 'comments' | 'subscribers'

const emptyForm = {
  title: '',
  excerpt: '',
  body: '',
  kind: 'article',
  category: 'news',
  tags: '',
  coverImage: '',
  status: 'published',
  featured: false,
  authorName: 'Quantis Technologies',
}

export default function InsightsAdminPage() {
  const [tab, setTab] = useState<Tab>('posts')
  const [posts, setPosts] = useState<InsightPost[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<InsightPost | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [staffUser, setStaffUser] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [items, thread, subs] = await Promise.all([
        insightsAPI.adminList(),
        insightsAPI.adminComments(),
        insightsAPI.adminSubscribers(),
      ])
      setPosts(Array.isArray(items) ? items : [])
      setComments(Array.isArray(thread) ? thread : [])
      setSubscribers(Array.isArray(subs) ? subs : [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not load insights.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) setStaffUser(isStaffRole(JSON.parse(raw).role))
    } catch {}
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (post: InsightPost) => {
    setEditing(post)
    setForm({
      title: post.title,
      excerpt: post.excerpt || '',
      body: post.body,
      kind: post.kind,
      category: post.category,
      tags: post.tags || '',
      coverImage: post.coverImage || '',
      status: post.status,
      featured: post.featured,
      authorName: post.authorName,
    })
    setModalOpen(true)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (editing) await insightsAPI.update(editing.id, form)
      else await insightsAPI.create(form)
      setModalOpen(false)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (post: InsightPost) => {
    if (!confirm(`Delete “${post.title}”?`)) return
    await insightsAPI.remove(post.id)
    await load()
  }

  const hideComment = async (id: string, status: string) => {
    await insightsAPI.updateComment(id, { status: status === 'hidden' ? 'published' : 'hidden' })
    await load()
  }

  const deleteComment = async (id: string) => {
    if (!confirm('Delete this contribution?')) return
    await insightsAPI.removeComment(id)
    await load()
  }

  return (
    <div className="text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <NewspaperIcon className="h-7 w-7 text-yellow-900" />
            News & Updates
          </h1>
          <p className="text-granite-300 mt-1">
            Publish articles, promotions, and moderate community contributions. Publishing an article emails active
            news-brief subscribers.
          </p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          New post
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['posts', 'comments', 'subscribers'] as Tab[]).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`px-4 py-2 rounded-lg capitalize ${tab === item ? 'bg-crimson-900' : 'bg-granite-800 text-granite-200'}`}
          >
            {item}
            {item === 'subscribers' ? ` (${subscribers.length})` : ''}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-lg bg-crimson-900/40 border border-crimson-700 px-4 py-3">{error}</div>}

      {loading ? (
        <p className="text-granite-400">Loading...</p>
      ) : tab === 'posts' ? (
        <div className="overflow-x-auto rounded-xl border border-granite-700">
          <table className="min-w-full text-sm">
            <thead className="bg-granite-800 text-granite-300">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t border-granite-700">
                  <td className="px-4 py-3">
                    <Link href={`/news/${post.slug}`} className="font-medium hover:text-yellow-300">
                      {post.title}
                    </Link>
                    <p className="text-granite-400 text-xs mt-1">{categoryLabel(post.category)}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{post.kind}</td>
                  <td className="px-4 py-3 capitalize">{post.status}{post.featured ? ' · featured' : ''}</td>
                  <td className="px-4 py-3 text-granite-300">{formatInsightDate(post.publishedAt)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(post)} className="p-2 hover:text-yellow-300" aria-label="Edit">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    {!staffUser && (
                      <button onClick={() => remove(post)} className="p-2 hover:text-crimson-300" aria-label="Delete">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'subscribers' ? (
        <div className="overflow-x-auto rounded-xl border border-granite-700">
          <table className="min-w-full text-sm">
            <thead className="bg-granite-800 text-granite-300">
              <tr>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-t border-granite-700">
                  <td className="px-4 py-3">{sub.email}</td>
                  <td className="px-4 py-3 text-granite-300">{sub.name || '—'}</td>
                  <td className="px-4 py-3 capitalize">{sub.status}</td>
                  <td className="px-4 py-3 text-granite-300">{formatInsightDate(sub.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {subscribers.length === 0 && <p className="text-granite-400 px-4 py-6">No subscribers yet.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-xl border border-granite-700 bg-granite-800 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{comment.authorName}</p>
                  <p className="text-xs text-granite-400 mb-2">
                    on {comment.post?.title || 'a post'} · {comment.status} · {comment.voteScore || 0} votes
                  </p>
                  <p className="text-granite-200 text-sm whitespace-pre-wrap">{comment.body}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => hideComment(comment.id, comment.status)}
                    className="text-xs px-3 py-1 rounded bg-granite-700"
                  >
                    {comment.status === 'hidden' ? 'Publish' : 'Hide'}
                  </button>
                  <button onClick={() => deleteComment(comment.id)} className="text-xs px-3 py-1 rounded bg-crimson-900">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-granite-400">No contributions yet.</p>}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto py-10 px-4">
          <form onSubmit={submit} className="max-w-3xl mx-auto rounded-2xl bg-granite-800 p-6 border border-granite-600">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit post' : 'New post'}</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value })}
                className="rounded-lg bg-granite-900 border border-granite-600 px-3 py-2"
              >
                <option value="article">Article</option>
                <option value="question">Question</option>
              </select>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="rounded-lg bg-granite-900 border border-granite-600 px-3 py-2"
              >
                {INSIGHT_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              required
              minLength={8}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
              className="w-full mb-3 rounded-lg bg-granite-900 border border-granite-600 px-3 py-2"
            />
            <input
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Short excerpt"
              className="w-full mb-3 rounded-lg bg-granite-900 border border-granite-600 px-3 py-2"
            />
            <textarea
              required
              minLength={20}
              rows={10}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Body"
              className="w-full mb-3 rounded-lg bg-granite-900 border border-granite-600 px-3 py-2"
            />
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="tags, comma, separated"
                className="rounded-lg bg-granite-900 border border-granite-600 px-3 py-2"
              />
              <input
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="Cover image URL (optional)"
                className="rounded-lg bg-granite-900 border border-granite-600 px-3 py-2"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="rounded-lg bg-granite-900 border border-granite-600 px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Featured
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-granite-600">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
