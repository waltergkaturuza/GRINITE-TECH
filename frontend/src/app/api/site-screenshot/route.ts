import { NextRequest, NextResponse } from 'next/server'

const MIN_SCREENSHOT_BYTES = 25_000

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

async function fetchImageBuffer(imageUrl: string) {
  const response = await fetch(imageUrl, {
    redirect: 'follow',
    headers: { 'User-Agent': 'QuantisPortfolioPreview/1.0' },
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
    `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false`,
    { headers: { 'User-Agent': 'QuantisPortfolioPreview/1.0' } },
  )

  if (!response.ok) return null

  const contentType = response.headers.get('content-type') || ''
  if (contentType.startsWith('image/')) {
    const imageBuffer = await response.arrayBuffer()
    if (imageBuffer.byteLength >= MIN_SCREENSHOT_BYTES) {
      return { imageBuffer, contentType }
    }
    return null
  }

  const payload = (await response.json()) as {
    data?: { screenshot?: { url?: string } }
  }
  const screenshotUrl = payload.data?.screenshot?.url
  if (!screenshotUrl) return null

  return fetchImageBuffer(screenshotUrl)
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')?.trim()
  if (!url || !isValidHttpUrl(url)) {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 })
  }

  const encoded = encodeURIComponent(url)
  const providers = [
    () => fetchMicrolinkScreenshot(url),
    () => fetchImageBuffer(`https://image.thum.io/get/width/1200/crop/630/noanimate/${url}`),
    () => fetchImageBuffer(`https://s0.wp.com/mshots/v1/${encoded}?w=1200&h=630`),
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
