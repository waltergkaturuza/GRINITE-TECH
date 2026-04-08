/**
 * Canonical site URL for metadata, Open Graph, JSON-LD, sitemap, and robots.
 * Prefer NEXT_PUBLIC_SITE_URL; falls back to NEXT_PUBLIC_APP_URL, then production default.
 */
export function getSiteUrl(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (site) return site.replace(/\/$/, '')
  const app = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (app) return app.replace(/\/$/, '')
  return 'https://www.quantistechnologies.co.zw'
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl()
  if (!path || path === '/') return base
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
