export type InsightKind = 'article' | 'question'
export type InsightCategory =
  | 'news'
  | 'promotions'
  | 'products'
  | 'technology'
  | 'research'
  | 'community'

export interface InsightPost {
  id: string
  slug: string
  title: string
  excerpt?: string
  body: string
  kind: InsightKind
  category: InsightCategory | string
  coverImage?: string
  tags?: string
  status: string
  featured: boolean
  authorName: string
  authorEmail?: string
  authorUserId?: string
  viewCount: number
  commentCount: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface InsightComment {
  id: string
  postId: string
  parentId?: string | null
  body: string
  authorName: string
  authorEmail?: string
  authorUserId?: string
  voteScore: number
  accepted: boolean
  status: string
  createdAt: string
  replies?: InsightComment[]
}

export const INSIGHT_CATEGORIES: { id: InsightCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'news', label: 'News' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'products', label: 'Products' },
  { id: 'technology', label: 'Technology' },
  { id: 'research', label: 'Research' },
  { id: 'community', label: 'Community' },
]

export function categoryLabel(id?: string) {
  return INSIGHT_CATEGORIES.find((c) => c.id === id)?.label || id || 'Update'
}

export function categoryTone(id?: string) {
  switch (id) {
    case 'news':
      return 'bg-crimson-900 text-white'
    case 'promotions':
      return 'bg-yellow-900 text-on-light'
    case 'products':
      return 'bg-jungle-900 text-white'
    case 'technology':
      return 'bg-olive-900 text-on-light'
    case 'research':
      return 'bg-peach-900 text-on-light'
    case 'community':
      return 'bg-granite-700 text-white'
    default:
      return 'bg-granite-800 text-white'
  }
}

export function formatInsightDate(value?: string) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getVoterKey() {
  if (typeof window === 'undefined') return 'ssr'
  const key = 'qt_voter_key'
  let value = localStorage.getItem(key)
  if (!value) {
    value = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
    localStorage.setItem(key, value)
  }
  return value
}

export function getStoredUser(): { firstName?: string; lastName?: string; email?: string; id?: string; role?: string } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
