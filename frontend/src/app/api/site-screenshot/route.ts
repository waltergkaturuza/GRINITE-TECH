import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const MIN_SCREENSHOT_BYTES = 25_000
const MIN_SCREENSHOT_WIDTH = 700

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

async function fetchImageBuffer(imageUrl: string, rejectMshots = true) {
  if (rejectMshots && /wp\.com\/mshots/i.test(imageUrl)) {
    return null
  }

  const response = await fetch(imageUrl, {
    redirect: 'follow',
    headers: { 'User-Agent': 'QuantisPortfolioPreview/1.0' },
    signal: AbortSignal.timeout(45_000),
  })

  if (!response.ok) return null

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.startsWith('image/')) return null

  const imageBuffer = await response.arrayBuffer()
  if (imageBuffer.byteLength < MIN_SCREENSHOT_BYTES) return null

  return { imageBuffer, contentType }
}

async function fetchMicrolinkScreenshot(url: string) {
  const response = await fetch(
    `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&viewport.width=1200&viewport.height=630`,
    {
      headers: { 'User-Agent': 'QuantisPortfolioPreview/1.0' },
      signal: AbortSignal.timeout(55_000),
    },
  )

  if (!response.ok) return null

  const payload = (await response.json()) as {
    data?: { screenshot?: { url?: string; width?: number } }
  }
  const screenshotUrl = payload.data?.screenshot?.url
  const screenshotWidth = payload.data?.screenshot?.width ?? 0
  if (!screenshotUrl || screenshotWidth < MIN_SCREENSHOT_WIDTH) return null

  return fetchImageBuffer(screenshotUrl)
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')?.trim()
  if (!url || !isValidHttpUrl(url)) {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 })
  }

  const providers = [
    () => fetchMicrolinkScreenshot(url),
    () => fetchImageBuffer(`https://image.thum.io/get/width/1200/crop/630/noanimate/${url}`),
  ]

  for (const provider of providers) {
    try {
      const result = await provider()
      if (!result) continue

      return new NextResponse(result.imageBuffer, {
        headers: {
          'Content-Type': result.contentType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      })
    } catch {
      continue
    }
  }

  return NextResponse.json({ error: 'Unable to capture site preview' }, { status: 502 })
}
