/**
 * API base URL for browser and server.
 * On quantistechnologies.co.zw we use same-origin /api/v1 (Next.js rewrite → backend).
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'quantistechnologies.co.zw' || host === 'www.quantistechnologies.co.zw') {
      return '/api/v1'
    }
  }

  return 'https://grinite-tech-backend.vercel.app/api/v1'
}

export function getBackendOrigin(): string {
  const fromEnv = process.env.BACKEND_PROXY_URL || process.env.NEXT_PUBLIC_BACKEND_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) return apiUrl.replace(/\/api\/v1\/?$/, '')

  return 'https://grinite-tech-backend.vercel.app'
}
