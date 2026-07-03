import { getApiBaseUrl } from '@/lib/apiBase'

/** Ping the serverless API so NestJS can finish cold start before a form submit. */
export async function warmupBackend(timeoutMs = 120_000): Promise<boolean> {
  const apiUrl = getApiBaseUrl()
  if (!apiUrl || typeof window === 'undefined') return false

  try {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    })
    window.clearTimeout(timer)
    return res.ok
  } catch {
    return false
  }
}

export function isNetworkOrTimeoutError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const e = err as { code?: string; message?: string }
  return (
    e.code === 'ERR_NETWORK' ||
    e.code === 'ECONNABORTED' ||
    e.message?.includes('timeout') ||
    e.message?.includes('Network Error') ||
    false
  )
}

export const BACKEND_WARMUP_MESSAGE =
  'Our server is waking up (this can take up to a minute on first use). Please wait, then try again.'
