import { getApiBaseUrl } from './apiBase'

export const PUBLIC_SITE_PAGES: { path: string; label: string }[] = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/services', label: 'Services' },
  { path: '/services/custom-software', label: 'Custom software' },
  { path: '/services/mobile-apps', label: 'Mobile apps' },
  { path: '/services/business-automation', label: 'Business automation' },
  { path: '/services/ecommerce', label: 'E-commerce' },
  { path: '/services/fuel-management-system-africa', label: 'Fuel management systems' },
  { path: '/case-studies', label: 'Case studies' },
  { path: '/case-studies/fuel-coupon-management-system', label: 'Fuel coupon case study' },
  { path: '/products', label: 'Products' },
  { path: '/news', label: 'News' },
  { path: '/track-request', label: 'Track request' },
  { path: '/cart', label: 'Cart' },
  { path: '/checkout', label: 'Checkout' },
  { path: '/login', label: 'Login' },
  { path: '/signup', label: 'Sign up' },
  { path: '/forgot-password', label: 'Forgot password' },
]

const SKIP_PREFIXES = ['/dashboard', '/admin', '/debug', '/test', '/login-animated']

const PAGE_LABELS = Object.fromEntries(PUBLIC_SITE_PAGES.map((p) => [p.path, p.label]))

export function normalizeAnalyticsPath(path: string) {
  const raw = (path || '/').split('?')[0].split('#')[0].trim()
  if (!raw) return '/'
  if (raw.length > 1 && raw.endsWith('/')) return raw.slice(0, -1)
  return raw
}

export function shouldSkipAnalyticsPath(path: string) {
  const normalized = normalizeAnalyticsPath(path)
  return SKIP_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))
}

export function labelForAnalyticsPath(path: string) {
  const normalized = normalizeAnalyticsPath(path)
  if (PAGE_LABELS[normalized]) return PAGE_LABELS[normalized]
  if (normalized.startsWith('/news/')) return 'News article'
  if (normalized.startsWith('/products/')) return 'Product'
  if (normalized.startsWith('/services/')) return 'Service'
  if (normalized.startsWith('/case-studies/')) return 'Case study'
  return normalized
}

function getSessionId() {
  if (typeof window === 'undefined') return undefined;
  try {
    let id = localStorage.getItem('qt_session_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('qt_session_id', id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export async function trackPageView(path: string) {
  if (typeof window === 'undefined') return
  const normalized = normalizeAnalyticsPath(path)
  if (shouldSkipAnalyticsPath(normalized)) return
  const API_BASE = getApiBaseUrl()
  if (!API_BASE) return
  try {
    const sessionId = getSessionId();
    await fetch(`${API_BASE}/analytics/page-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: normalized,
        referrer: document.referrer || null,
        sessionId,
        userAgent: navigator.userAgent || null,
      }),
      keepalive: true,
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // swallow analytics errors
  }
}

export async function trackEvent(eventName: string, metadata: Record<string, any> = {}) {
  if (typeof window === 'undefined') return
  const API_BASE = getApiBaseUrl()
  if (!API_BASE) return
  try {
    const sessionId = getSessionId();
    await fetch(`${API_BASE}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        page: window.location.pathname,
        sessionId,
        metadata,
      }),
      keepalive: true,
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // ignore
  }
}

